"""
浏览器自动化端点 — /api/browser/*

对 openclaw browser CLI 的轻量封装（供控制台浏览器页使用）：
  GET  /api/browser/status   browser doctor --json（就绪检查 + 运行状态 + Chrome 检测）
  POST /api/browser/start    browser start（已运行则 no-op）
  POST /api/browser/stop     browser stop
"""

import asyncio
import json
import logging
import subprocess

from fastapi import APIRouter, Request

from ..services.gateway_manager import PROJECT_ROOT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/browser", tags=["browser"])


def _oc_cmd(request: Request) -> list[str]:
    mgr = request.app.state.gateway_manager
    return [mgr._node_exe, mgr._oc_entry, "browser"]


async def _run_oc(request: Request, args: list[str], timeout: int = 45) -> dict:
    cmd = _oc_cmd(request) + args

    def _run() -> dict:
        try:
            r = subprocess.run(
                cmd, capture_output=True, text=True, timeout=timeout,
                cwd=PROJECT_ROOT, stdin=subprocess.DEVNULL,
            )
            out = (r.stdout or "").strip()
            data: dict = {}
            try:
                parsed = json.loads(out)
                if isinstance(parsed, dict):
                    data = parsed
            except Exception:  # noqa: BLE001
                data = {"raw": out[-500:]}
            if r.returncode != 0 and (r.stderr or "").strip():
                data.setdefault("stderr", (r.stderr or "")[-300:])
            return {"ok": r.returncode == 0, **data}
        except subprocess.TimeoutExpired:
            return {"ok": False, "error": "timeout"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "error": str(e)}

    return await asyncio.to_thread(_run)


@router.get("/status")
async def browser_status(request: Request) -> dict:
    """browser doctor --json：插件就绪检查 + 运行状态 + Chrome 检测结果"""
    return await _run_oc(request, ["doctor", "--json"], timeout=45)


@router.post("/start")
async def browser_start(request: Request) -> dict:
    """启动浏览器（已运行则 no-op）"""
    return await _run_oc(request, ["start"], timeout=60)


@router.post("/stop")
async def browser_stop(request: Request) -> dict:
    """停止浏览器"""
    return await _run_oc(request, ["stop"], timeout=30)
