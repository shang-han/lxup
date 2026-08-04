#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
龙虾优盘(LXUP)后台静默启动器

双击运行(或命令行): 以**隐藏的分离进程**拉起全部服务 → 等前端就绪 →
自动打开浏览器 → 启动器随即退出。

服务独立常驻: 启动器退出、浏览器关闭都**不会**停止服务。
停止全部服务请使用项目根目录的 stop-all.bat(按端口杀进程树)。

各服务输出写到 runtime/logs/<服务>.log, 启动器自身写 runtime/logs/launcher.log。

命令行参数:
  (无)         正常启动
  --dry-run    只打印将要执行的命令, 不真正启动
环境变量:
  LXUP_NO_BROWSER=1   启动后不自动打开浏览器(测试用)
"""
import os
import socket
import subprocess
import sys
import time

# ── 路径解析: 兼容 PyInstaller 打包(exe)与脚本直跑 ──────────────
def root_dir() -> str:
    if getattr(sys, "frozen", False):          # 打包成 exe 后
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))  # 源码直跑

ROOT = root_dir()
LOG_DIR = os.path.join(ROOT, "runtime", "logs")

NODE = os.path.join(ROOT, "runtime", "data", "node.exe")
OPENCLAW_ENTRY = os.path.join(
    ROOT, "runtime", "openclaw", "node_modules", "openclaw", "openclaw.mjs")

FRONTEND_PORT = 5173
SIDECAR_PORT = 7889
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

# Windows 进程标志: 无控制台窗口 + 新进程组。分离运行, 父进程(启动器)
# 退出后子进程继续存活; 且不弹黑框。
CREATE_NO_WINDOW = 0x08000000
CREATE_NEW_PROCESS_GROUP = 0x00000200
DETACHED = CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP


def log(msg: str) -> None:
    """写到 launcher.log; 有控制台时也打印。"""
    line = time.strftime("%Y-%m-%d %H:%M:%S ") + msg
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        with open(os.path.join(LOG_DIR, "launcher.log"), "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass
    try:
        print(line)
    except Exception:
        pass


def portable_python() -> str:
    """取便携 Python(runtime/python/cpython-*/python.exe, 同 start-hermes.bat 取最后一个)。"""
    base = os.path.join(ROOT, "runtime", "python")
    if os.path.isdir(base):
        cands = sorted(d for d in os.listdir(base) if d.startswith("cpython-"))
        if cands:
            exe = os.path.join(base, cands[-1], "python.exe")
            if os.path.isfile(exe):
                return exe
    return sys.executable  # 兜底: 用当前解释器


def port_open(port: int, host: str = "127.0.0.1", timeout: float = 0.5) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        return s.connect_ex((host, port)) == 0


def spawn(name: str, argv: list, cwd: str, env: dict = None,
          logfile: str = None, dry_run: bool = False) -> None:
    if dry_run:
        log(f"[dry-run] {name}: cwd={cwd}  {' '.join(argv)}")
        return
    out = subprocess.DEVNULL
    if logfile:
        try:
            out = open(os.path.join(LOG_DIR, logfile), "ab")
        except Exception:
            out = subprocess.DEVNULL
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    try:
        subprocess.Popen(
            argv, cwd=cwd, env=full_env,
            stdout=out, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
            creationflags=DETACHED, close_fds=True,
        )
        log(f"已拉起 {name}")
    except Exception as e:  # noqa: BLE001
        log(f"[ERROR] 拉起 {name} 失败: {e}")
    finally:
        if out is not subprocess.DEVNULL:
            try:
                out.close()
            except Exception:
                pass


def base_env() -> dict:
    return {
        # 与 start-all.bat 对齐: OpenClaw 状态与授权服务器地址
        "OPENCLAW_STATE_DIR": os.path.join(ROOT, "runtime", "openclaw-home"),
        "LICENSE_SERVER_URL": "http://49.233.171.82:9000",
    }


def start_services(dry_run: bool = False) -> None:
    os.makedirs(LOG_DIR, exist_ok=True)
    py = portable_python()
    env = base_env()

    # 1. Sidecar(:7889)授权 + 微信登录桥接
    spawn("sidecar",
          [py, "-m", "sidecar.main",
           "--db-path", os.path.join(ROOT, "runtime", "data", "gateway.db"),
           "--port", str(SIDECAR_PORT)],
          cwd=ROOT, env=env, logfile="sidecar.log", dry_run=dry_run)

    # 2. OpenClaw 网关(:18789)—— 便携 Python 置顶 PATH,
    #    agent 命令里的裸 `python`(通用工具技能脚本)即解析到便携解释器,
    #    而不是客户机的系统 python(可能不存在、也没装依赖)
    gw_env = dict(env)
    gw_env["PATH"] = os.path.dirname(py) + os.pathsep + gw_env.get("PATH", os.environ.get("PATH", ""))
    spawn("openclaw",
          [NODE, OPENCLAW_ENTRY, "gateway", "--port", "18789", "--force"],
          cwd=ROOT, env=gw_env, logfile="openclaw-gateway.log", dry_run=dry_run)

    # 3. Hermes 网关(:8642)— 对齐 start-hermes.bat 的环境变量
    #    便携 Python 同样置顶 PATH：Hermes agent 执行技能脚本（通用工具）
    #    时的裸 `python` 必须解析到带依赖的便携解释器
    hermes_home = os.path.join(ROOT, "runtime", "hermes-home")
    if not dry_run:
        os.makedirs(hermes_home, exist_ok=True)
    hermes_env = dict(env)
    hermes_env["PATH"] = os.path.dirname(py) + os.pathsep + hermes_env.get("PATH", os.environ.get("PATH", ""))
    hermes_env.update({
        "HERMES_HOME": hermes_home,
        "PYTHONPATH": os.path.join(ROOT, "runtime", "hermes-libs"),
        "API_SERVER_ENABLED": "true",
        "API_SERVER_HOST": "127.0.0.1",
        "API_SERVER_PORT": "8642",
        "API_SERVER_KEY": "lxup-hermes-dev-2026",
        "API_SERVER_CORS_ORIGINS": "*",
    })
    spawn("hermes",
          [py, "-m", "hermes_cli.main", "gateway", "run"],
          cwd=ROOT, env=hermes_env, logfile="hermes-gateway.log", dry_run=dry_run)

    # 4. AI 助手(:8080)
    spawn("ai-assistant",
          [NODE, "server.js"],
          cwd=os.path.join(ROOT, "ai-assistant"), env=env,
          logfile="ai-assistant.log", dry_run=dry_run)

    # 5. 控制台前端(:5173)
    spawn("frontend",
          [NODE, os.path.join("node_modules", "vite", "bin", "vite.js")],
          cwd=os.path.join(ROOT, "control-ui"), env=env,
          logfile="frontend.log", dry_run=dry_run)


def wait_for_frontend(timeout: int = 90) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if port_open(FRONTEND_PORT):
            return True
        time.sleep(1)
    return False


def open_browser() -> None:
    if os.environ.get("LXUP_NO_BROWSER") == "1":
        log("LXUP_NO_BROWSER=1, 跳过打开浏览器")
        return
    try:
        os.startfile(FRONTEND_URL)  # Windows: 默认浏览器打开
        log(f"已打开浏览器 {FRONTEND_URL}")
    except Exception:
        try:
            import webbrowser
            webbrowser.open(FRONTEND_URL)
            log(f"已打开浏览器(webbrowser) {FRONTEND_URL}")
        except Exception as e:  # noqa: BLE001
            log(f"[WARN] 打开浏览器失败: {e}")


def main() -> int:
    dry_run = "--dry-run" in sys.argv[1:]
    log(f"=== LXUP 启动器 (root={ROOT}) dry_run={dry_run} ===")

    if not dry_run and port_open(SIDECAR_PORT) and port_open(FRONTEND_PORT):
        log("检测到服务已在运行, 直接打开浏览器")
        open_browser()
        return 0

    start_services(dry_run=dry_run)
    if dry_run:
        return 0

    if wait_for_frontend():
        log("前端已就绪")
    else:
        log("[WARN] 等待前端超时, 仍尝试打开浏览器(服务可能还在启动)")
    open_browser()
    log("=== 启动器退出(服务继续在后台运行) ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
