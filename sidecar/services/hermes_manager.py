"""
Hermes 网关进程管理

Sidecar 负责 Hermes 网关（api_server，默认 :8642）的启停/重启：
  - status  : 健康检查 + 是否已安装便携运行时 + PID
  - stop    : 找到监听端口的进程并结束
  - start   : 用项目内便携 Python 以分离进程启动 `hermes_cli.main gateway run`
  - restart : stop 后 start

与 OpenClaw 网关可同时运行（端口不同）。便携运行时由
engines/hermes/bootstrap-portable.bat 生成（runtime/python + runtime/hermes-libs）。
"""

import asyncio
import logging
import os
import subprocess
from urllib.parse import urlparse

import httpx

from ..config import GatewayConfig
from ..platform import find_pid_on_port, kill_pid, portable_python, spawn_kwargs

logger = logging.getLogger(__name__)

# 项目根目录 = sidecar 包的上一级
_SERVICES_DIR = os.path.dirname(os.path.abspath(__file__))
_SIDECAR_DIR = os.path.dirname(_SERVICES_DIR)
PROJECT_ROOT = os.path.dirname(_SIDECAR_DIR)

# 与前端 hermes-client 默认 Key、start-hermes.bat 保持一致
DEFAULT_API_SERVER_KEY = "lxup-hermes-dev-2026"


class HermesManager:
    """管理 Hermes 网关进程（便携 Python + vendored 源码）"""

    def __init__(self, config: GatewayConfig):
        self.config = config
        parsed = urlparse(config.hermes_gateway_url or "http://127.0.0.1:8642")
        self.host = parsed.hostname or "127.0.0.1"
        self.port = parsed.port or 8642
        self.hermes_home = config.hermes_home
        self._log_path = os.path.join(PROJECT_ROOT, "runtime", "logs", "hermes-gateway.log")

    # ── 运行时定位 ────────────────────────────────────

    def _python_exe(self) -> str | None:
        """便携 Python：runtime/python/cpython-*（平台差异见 sidecar/platform.py）"""
        return portable_python(PROJECT_ROOT)

    def _installed(self) -> bool:
        return self._python_exe() is not None and os.path.isdir(
            os.path.join(PROJECT_ROOT, "runtime", "hermes-libs")
        )

    # ── 状态 ──────────────────────────────────────────

    async def status(self) -> dict:
        reachable = await self._is_reachable()
        pid = self._find_pid_on_port(self.port)
        return {
            "running": reachable,
            "pid": pid,
            "port": self.port,
            "installed": self._installed(),
            "hermes_home": self.hermes_home,
        }

    async def _is_reachable(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                r = await client.get(f"http://{self.host}:{self.port}/health")
                return r.status_code == 200
        except Exception:
            return False

    # ── 停止 ──────────────────────────────────────────

    async def stop(self) -> dict:
        pid = self._find_pid_on_port(self.port)
        if pid is None:
            return {"stopped": False, "reason": "no_process", "message": "Hermes 网关未在运行"}
        self._kill_pid(pid)
        for _ in range(20):
            await asyncio.sleep(0.5)
            if self._find_pid_on_port(self.port) is None:
                logger.info("Hermes 网关已停止 (pid=%d)", pid)
                return {"stopped": True, "pid": pid, "message": f"已停止 Hermes 网关 (PID {pid})"}
        return {"stopped": False, "reason": "timeout", "message": "停止超时，进程可能仍在退出"}

    # ── 启动 ──────────────────────────────────────────

    async def start(self) -> dict:
        if not self._installed():
            return {
                "started": False,
                "message": "未安装便携运行时，请先运行 engines\\hermes\\bootstrap-portable.bat",
            }
        python_exe = self._python_exe()
        os.makedirs(os.path.dirname(self._log_path), exist_ok=True)
        os.makedirs(self.hermes_home, exist_ok=True)

        env = os.environ.copy()
        env["HERMES_HOME"] = self.hermes_home
        # hermes 代码 + 依赖都在 hermes-libs（pip 安装），不再依赖 engines/hermes 源码
        env["PYTHONPATH"] = os.path.join(PROJECT_ROOT, "runtime", "hermes-libs")
        env["API_SERVER_ENABLED"] = "true"
        env["API_SERVER_HOST"] = self.host
        env["API_SERVER_PORT"] = str(self.port)
        env["API_SERVER_KEY"] = DEFAULT_API_SERVER_KEY
        env["API_SERVER_CORS_ORIGINS"] = "*"

        command = f'"{python_exe}" -m hermes_cli.main gateway run'
        log_file = open(self._log_path, "a", encoding="utf-8")
        try:
            subprocess.Popen(
                command,
                shell=True,
                cwd=PROJECT_ROOT,
                env=env,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                **spawn_kwargs(),
            )
        except Exception as e:
            logger.exception("启动 Hermes 网关失败")
            return {"started": False, "message": f"启动失败: {e}"}

        for _ in range(40):
            await asyncio.sleep(1)
            if await self._is_reachable():
                pid = self._find_pid_on_port(self.port)
                logger.info("Hermes 网关已启动 (pid=%s)", pid)
                return {"started": True, "pid": pid, "message": "Hermes 网关已启动"}
        return {
            "started": False,
            "message": "启动超时（40 秒内未就绪，查看 runtime/logs/hermes-gateway.log）",
        }

    # ── 重启 ──────────────────────────────────────────

    async def restart(self) -> dict:
        await self.stop()
        result = await self.start()
        result["restarted"] = result.get("started", False)
        return result

    # ── 进程工具（Windows）────────────────────────────

    def _find_pid_on_port(self, port: int) -> int | None:
        return find_pid_on_port(port)

    def _kill_pid(self, pid: int) -> None:
        kill_pid(pid)
