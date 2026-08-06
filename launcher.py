#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
龙虾优盘(LXUP)安全启动器 v2

双击/命令行运行: 拉起全部服务(隐藏窗口、分离进程) → 等前端就绪 →
打开浏览器 → 启动器退出, 服务继续常驻后台。
停止全部服务请用 stop-all.bat。

v1 事故复盘与 v2 的安全设计:
  v1 在便携 Python 缺失时用 sys.executable 兜底; 打包成 exe 后
  sys.executable 就是启动器自己 → "拉起 sidecar/hermes" 变成不断
  自我复制, 指数级增殖吃光 commit 内存导致整机卡死。
  v2 的对策:
    1. exe(frozen)模式下找不到便携 Python 一律硬失败, 绝不兜底;
    2. 启动前先做前置检查(preflight), 关键依赖缺失时一个进程都
       不拉起, 并打印具体要运行哪个 bootstrap;
    3. 单实例锁: 占用 127.0.0.1:47889, 防止多开叠加;
    4. 每个服务的入口文件逐个检查, 缺谁跳过谁, 不再盲目 spawn。

各服务输出写到 runtime/logs/<服务>.log, 启动器自身写 launcher.log。

命令行参数:
  (无)         正常启动
  --dry-run    只打印将要执行的命令, 不真正启动
环境变量:
  LXUP_NO_BROWSER=1   启动后不自动打开浏览器
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
RUNTIME = os.path.join(ROOT, "runtime")
LOG_DIR = os.path.join(RUNTIME, "logs")

NODE = os.path.join(RUNTIME, "data", "node.exe")
OPENCLAW_ENTRY = os.path.join(
    RUNTIME, "openclaw", "node_modules", "openclaw", "openclaw.mjs")
VITE_JS = os.path.join(ROOT, "control-ui", "node_modules", "vite", "bin", "vite.js")
AI_SERVER_JS = os.path.join(ROOT, "ai-assistant", "server.js")

FRONTEND_PORT = 5173
SIDECAR_PORT = 7889
LOCK_PORT = 47889           # 单实例锁端口(仅 bind, 不通信)
FRONTEND_URL = f"http://localhost:{FRONTEND_PORT}"

# Windows 进程标志: 无控制台窗口 + 新进程组。分离运行, 父进程(启动器)
# 退出后子进程继续存活; 且不弹黑框。
CREATE_NO_WINDOW = 0x08000000
CREATE_NEW_PROCESS_GROUP = 0x00000200
DETACHED = CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP

_lock_sock = None  # 持有到进程退出, 即单实例锁的生命周期


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


def acquire_lock() -> bool:
    """单实例锁: 成功绑定 LOCK_PORT 返回 True; 已有实例在跑返回 False。"""
    global _lock_sock
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind(("127.0.0.1", LOCK_PORT))
    except OSError:
        s.close()
        return False
    _lock_sock = s  # 保持引用直到进程退出
    return True


def port_open(port: int, host: str = "127.0.0.1", timeout: float = 0.5) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)
        return s.connect_ex((host, port)) == 0


def portable_python():
    """取便携 Python(runtime/python/cpython-*/python.exe); 没有返回 None。

    注意: 这里**不做 sys.executable 兜底**——v1 的死机根因。
    兜底逻辑只允许在 main() 里非 frozen(脚本直跑)时发生。
    """
    base = os.path.join(RUNTIME, "python")
    if os.path.isdir(base):
        cands = sorted(d for d in os.listdir(base) if d.startswith("cpython-"))
        if cands:
            exe = os.path.join(base, cands[-1], "python.exe")
            if os.path.isfile(exe):
                return exe
    return None


def preflight():
    """前置检查。返回 (python_exe, fatal_errors, warnings)。

    fatal_errors 非空时一个服务都不允许拉起。
    """
    fatals, warns = [], []

    py = portable_python()
    if py is None:
        if getattr(sys, "frozen", False):
            fatals.append(
                "便携 Python 缺失(runtime/python/cpython-*/python.exe)。"
                "exe 模式禁止兜底(v1 死机根因), 请先运行 bootstrap-hermes.bat")
        else:
            py = sys.executable
            warns.append(
                f"便携 Python 缺失, 暂用当前解释器 {py} "
                "(sidecar/hermes 依赖可能不全, 建议先运行 bootstrap-hermes.bat)")

    if not os.path.isfile(NODE):
        fatals.append(
            "便携 node.exe 缺失(runtime/data/node.exe), "
            "请先运行 bootstrap-openclaw.bat")

    # 跨实例端口冲突: 五个服务端口若已被另一份 LXUP/OpenClaw 占用,
    # 照拉会静默串到对方实例(Hermes 端口被占时尤其隐蔽), 直接判致命
    for port in (SIDECAR_PORT, 18789, 8642, 8080, 5173):
        if port_open(port):
            fatals.append(
                f"端口 {port} 已被占用: 另一个 LXUP/OpenClaw 实例正在运行, "
                "请先 stop-all.bat 或关掉其窗口再启动")

    for name, path in (("OpenClaw 入口", OPENCLAW_ENTRY),
                       ("前端 vite", VITE_JS),
                       ("AI 助手 server.js", AI_SERVER_JS)):
        if not os.path.isfile(path):
            warns.append(f"{name} 不存在({path}), 将跳过该服务")

    return py, fatals, warns


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
        "OPENCLAW_STATE_DIR": os.path.join(RUNTIME, "openclaw-home"),
        "LICENSE_SERVER_URL": "http://49.233.171.82:9000",
    }


def start_services(py: str, dry_run: bool = False) -> None:
    os.makedirs(LOG_DIR, exist_ok=True)
    env = base_env()

    # 1. Sidecar(:7889)授权 + 微信登录桥接
    spawn("sidecar",
          [py, "-m", "sidecar.main",
           "--db-path", os.path.join(RUNTIME, "data", "gateway.db"),
           "--port", str(SIDECAR_PORT)],
          cwd=ROOT, env=env, logfile="sidecar.log", dry_run=dry_run)

    # 2. OpenClaw 网关(:18789)—— 便携 Python 置顶 PATH,
    #    agent 命令里的裸 `python`(通用工具技能脚本)即解析到便携解释器
    if os.path.isfile(OPENCLAW_ENTRY) and os.path.isfile(NODE):
        gw_env = dict(env)
        gw_env["PATH"] = os.path.dirname(py) + os.pathsep + gw_env.get("PATH", os.environ.get("PATH", ""))
        spawn("openclaw",
              [NODE, OPENCLAW_ENTRY, "gateway", "--port", "18789", "--force"],
              cwd=ROOT, env=gw_env, logfile="openclaw-gateway.log", dry_run=dry_run)
    else:
        log("[SKIP] openclaw: 入口或 node.exe 缺失")

    # 3. Hermes 网关(:8642)— 对齐 start-hermes.bat 的环境变量
    hermes_home = os.path.join(RUNTIME, "hermes-home")
    if not dry_run:
        os.makedirs(hermes_home, exist_ok=True)
    hermes_env = dict(env)
    hermes_env["PATH"] = os.path.dirname(py) + os.pathsep + hermes_env.get("PATH", os.environ.get("PATH", ""))
    hermes_env.update({
        "HERMES_HOME": hermes_home,
        "PYTHONPATH": os.path.join(RUNTIME, "hermes-libs"),
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
    if os.path.isfile(AI_SERVER_JS) and os.path.isfile(NODE):
        spawn("ai-assistant",
              [NODE, "server.js"],
              cwd=os.path.join(ROOT, "ai-assistant"), env=env,
              logfile="ai-assistant.log", dry_run=dry_run)
    else:
        log("[SKIP] ai-assistant: server.js 或 node.exe 缺失")

    # 5. 控制台前端(:5173)
    if os.path.isfile(VITE_JS) and os.path.isfile(NODE):
        spawn("frontend",
              [NODE, os.path.join("node_modules", "vite", "bin", "vite.js")],
              cwd=os.path.join(ROOT, "control-ui"), env=env,
              logfile="frontend.log", dry_run=dry_run)
    else:
        log("[SKIP] frontend: vite 或 node.exe 缺失")


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
    # 不用 os.startfile: v1 打包环境下报 "startfile not available"。
    # cmd /c start 走 shell 关联, 行为与普通双击 URL 一致。
    try:
        subprocess.Popen(["cmd", "/c", "start", "", FRONTEND_URL],
                         creationflags=CREATE_NO_WINDOW)
        log(f"已打开浏览器 {FRONTEND_URL}")
    except Exception as e:  # noqa: BLE001
        log(f"[WARN] 打开浏览器失败: {e}")


def main() -> int:
    dry_run = "--dry-run" in sys.argv[1:]
    log(f"=== LXUP 启动器 v2 (root={ROOT}) dry_run={dry_run} ===")

    if not dry_run:
        if not acquire_lock():
            log(f"另一个启动器实例正在运行(端口 {LOCK_PORT} 已被占用), 本次直接退出")
            return 0
        if port_open(SIDECAR_PORT) and port_open(FRONTEND_PORT):
            log("检测到服务已在运行, 直接打开浏览器")
            open_browser()
            return 0

    py, fatals, warns = preflight()
    for w in warns:
        log(f"[WARN] {w}")
    if fatals:
        for e in fatals:
            log(f"[FATAL] {e}")
        log("[FATAL] 前置条件不满足, 未启动任何服务。修复后重试。")
        return 1

    start_services(py, dry_run=dry_run)
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
