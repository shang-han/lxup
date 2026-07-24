"""
OpenClaw 网关进程管理

Sidecar 负责受管 OpenClaw 网关的启停/重启：
  - status  : 对网关端口做健康检查（HTTP /health），报告是否可达 + PID
  - stop    : 找到监听该端口的进程并结束它
  - start   : 以分离进程方式启动 `openclaw gateway run --port <port> --force`
  - restart : stop 后 start

说明：网关用 `--force` 启动会先接管端口上已有的监听者，因此 start 本身即幂等。
stop 通过端口定位 PID（无论网关由谁启动都能结束），在 Windows 上用 netstat + taskkill。
"""

import asyncio
import logging
import os
import subprocess

import httpx

from ..config import GatewayConfig

logger = logging.getLogger(__name__)

# 项目根目录 = sidecar 包的上一级（sidecar/services/gateway_manager.py → 上三级）
_SERVICES_DIR = os.path.dirname(os.path.abspath(__file__))
_SIDECAR_DIR = os.path.dirname(_SERVICES_DIR)
PROJECT_ROOT = os.path.dirname(_SIDECAR_DIR)

# Windows 进程创建标志：新建进程组，使其不随 sidecar 退出而被连带结束
CREATE_NEW_PROCESS_GROUP = 0x00000200


class GatewayManager:
    """管理受管的 OpenClaw 网关进程"""

    def __init__(self, config: GatewayConfig):
        self.config = config
        self.port = config.openclaw_port
        self.cmd = config.openclaw_cmd
        # 便携运行：项目内 node.exe + 打包的 openclaw（留空用默认路径）
        self._node_exe = config.openclaw_node or os.path.join(
            PROJECT_ROOT, "runtime", "data", "node.exe"
        )
        self._oc_entry = config.openclaw_entry or os.path.join(
            PROJECT_ROOT, "runtime", "openclaw", "node_modules", "openclaw", "openclaw.mjs"
        )
        self._log_path = os.path.join(PROJECT_ROOT, "runtime", "logs", "openclaw-gateway.log")

    def _build_command(self) -> str:
        """优先便携 node + 项目内打包的 openclaw；未打包则回退全局 openclaw 命令"""
        if os.path.exists(self._node_exe) and os.path.exists(self._oc_entry):
            return f'"{self._node_exe}" "{self._oc_entry}" gateway --port {self.port} --force'
        return f'{self.cmd} gateway --port {self.port} --force'

    # ── 状态 ──────────────────────────────────────────

    async def status(self) -> dict:
        """健康检查：网关是否可达 + 监听 PID"""
        reachable, pid = await asyncio.gather(
            self._is_reachable(), self._find_pid_on_port(self.port)
        )
        return {
            "running": reachable,
            "pid": pid,
            "port": self.port,
        }

    async def _is_reachable(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                r = await client.get(f"http://127.0.0.1:{self.port}/health")
                return r.status_code == 200
        except Exception:
            return False

    # ── 停止 ──────────────────────────────────────────

    async def stop(self) -> dict:
        """结束监听网关端口的进程"""
        pid = await self._find_pid_on_port(self.port)
        if pid is None:
            return {"stopped": False, "reason": "no_process", "message": "网关未在运行"}
        await self._kill_pid(pid)
        # 等待端口释放
        for _ in range(20):
            await asyncio.sleep(0.5)
            if await self._find_pid_on_port(self.port) is None:
                logger.info("网关已停止 (pid=%d)", pid)
                return {"stopped": True, "pid": pid, "message": f"已停止网关 (PID {pid})"}
        return {"stopped": False, "reason": "timeout", "message": "停止超时，进程可能仍在退出"}

    # ── 启动 ──────────────────────────────────────────

    async def start(self) -> dict:
        """以分离进程启动网关（--force 会接管已有端口）"""
        os.makedirs(os.path.dirname(self._log_path), exist_ok=True)
        log_file = open(self._log_path, "a", encoding="utf-8")
        command = self._build_command()
        try:
            subprocess.Popen(
                command,
                shell=True,
                cwd=PROJECT_ROOT,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                creationflags=CREATE_NEW_PROCESS_GROUP,
            )
        except Exception as e:
            logger.exception("启动网关失败")
            return {"started": False, "message": f"启动失败: {e}"}

        # 等待网关就绪
        for _ in range(30):
            await asyncio.sleep(1)
            if await self._is_reachable():
                pid = await self._find_pid_on_port(self.port)
                logger.info("网关已启动 (pid=%s)", pid)
                return {"started": True, "pid": pid, "message": "网关已启动"}
        return {"started": False, "message": "网关启动超时（30 秒内未就绪）"}

    # ── 重启 ──────────────────────────────────────────

    async def restart(self) -> dict:
        """重启 = 停止后启动"""
        await self.stop()
        result = await self.start()
        result["restarted"] = result.get("started", False)
        return result

    # ── 进程工具（Windows）────────────────────────────

    # netstat / taskkill 是同步子进程，可能耗时数秒，必须放线程池执行，
    # 否则会阻塞事件循环，导致期间 Sidecar 所有请求（含授权校验）卡死。

    async def _find_pid_on_port(self, port: int) -> int | None:
        return await asyncio.to_thread(self._find_pid_on_port_sync, port)

    def _find_pid_on_port_sync(self, port: int) -> int | None:
        """通过 netstat 找到监听指定端口的 PID"""
        try:
            result = subprocess.run(
                ["netstat", "-ano", "-p", "TCP"],
                capture_output=True, text=True, timeout=10,
            )
            for line in result.stdout.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    if parts:
                        return int(parts[-1])
        except Exception:
            logger.exception("查找端口 PID 失败")
        return None

    async def _kill_pid(self, pid: int) -> None:
        await asyncio.to_thread(self._kill_pid_sync, pid)

    def _kill_pid_sync(self, pid: int) -> None:
        """结束指定 PID 的进程树（/T 连带子进程，避免插件子进程残留）"""
        try:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(pid)],
                capture_output=True, timeout=10,
            )
        except Exception:
            logger.exception("结束进程失败 (pid=%d)", pid)
