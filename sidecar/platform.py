"""
平台差异封装（Windows / macOS / Linux）

集中处理进程管理与便携运行时发现的平台差异，供 gateway / hermes / codex
管理器与各路由复用，避免在多处复制粘贴同一套 netstat/taskkill 逻辑：

  - 可执行名解析：Windows 用 node.exe / python.exe；POSIX 用 node / bin/python3
    （uv 安装的独立 Python 构建在 cpython-*/bin/ 下，与 Windows 的 python.exe 布局不同）
  - 端口 → PID：Windows 用 netstat -ano；POSIX 用 lsof
  - 杀进程树：Windows 用 taskkill /F /T；POSIX 用 kill 进程组（依赖 start_new_session）
  - 子进程创建参数：Windows creationflags 新建进程组；POSIX start_new_session 新会话
"""

import glob
import os
import shutil
import signal
import subprocess

IS_WINDOWS = os.name == "nt"

# Windows：新建进程组，使子进程不随 sidecar 退出被连带结束（等价 POSIX 的 start_new_session）
_CREATE_NEW_PROCESS_GROUP = 0x00000200


def node_exe(project_root: str) -> str:
    """便携 Node 可执行：Windows 用 runtime/data/node.exe；POSIX 用 runtime/data/node，
    找不到时回退系统 node。"""
    if IS_WINDOWS:
        return os.path.join(project_root, "runtime", "data", "node.exe")
    portable = os.path.join(project_root, "runtime", "data", "node")
    if os.path.isfile(portable):
        return portable
    # .app 由 LaunchServices 启动时 PATH 精简（不含 /usr/local/bin、/opt/homebrew/bin），
    # 显式探测常见安装位置，再回退 which("node")
    for cand in ("/usr/local/bin/node", "/opt/homebrew/bin/node"):
        if os.path.isfile(cand):
            return cand
    return shutil.which("node") or "node"


def portable_python(project_root: str) -> str | None:
    """便携 Python：runtime/python/cpython-*/ 下取版本号最长者（避开无版本的 junction/软链）。

    Windows 可执行名为 python.exe；POSIX（uv 安装的独立构建）为 bin/python3。
    """
    if IS_WINDOWS:
        pattern = os.path.join(project_root, "runtime", "python", "cpython-*", "python.exe")
    else:
        pattern = os.path.join(project_root, "runtime", "python", "cpython-*", "bin", "python3")
    matches = glob.glob(pattern)
    if not matches:
        return None
    matches.sort(key=len)
    return matches[-1]


def find_pid_on_port(port: int) -> int | None:
    """找到监听指定端口的 PID。同步调用（可能耗时数秒，调用方按需放线程池）。"""
    if IS_WINDOWS:
        return _find_pid_windows(port)
    return _find_pid_posix(port)


def _find_pid_windows(port: int) -> int | None:
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
        pass
    return None


def _find_pid_posix(port: int) -> int | None:
    try:
        result = subprocess.run(
            ["lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN", "-t"],
            capture_output=True, text=True, timeout=10,
        )
        out = result.stdout.strip().splitlines()
        if out:
            return int(out[0])
    except Exception:
        pass
    return None


def kill_pid(pid: int) -> None:
    """结束指定 PID 及其进程树（best-effort，不抛异常）。"""
    if IS_WINDOWS:
        try:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(pid)],
                capture_output=True, timeout=10,
            )
        except Exception:
            pass
        return
    _kill_posix(pid)


def _kill_posix(pid: int) -> None:
    try:
        pgid = os.getpgid(pid)
    except ProcessLookupError:
        return  # 已退出
    sig = signal.SIGKILL
    try:
        if pgid == pid:
            # 进程组组长（start_new_session 启动）→ 整组杀，连带子进程
            os.killpg(pgid, sig)
        else:
            os.kill(pid, sig)
    except (ProcessLookupError, PermissionError):
        pass


def spawn_kwargs() -> dict:
    """subprocess.Popen / create_subprocess 的平台参数：
    Windows 新建进程组；POSIX 新会话（便于按进程组整树 kill）。"""
    if IS_WINDOWS:
        return {"creationflags": _CREATE_NEW_PROCESS_GROUP}
    return {"start_new_session": True}
