"""
网关进程管理端点 — /api/gateway/*

供控制台仪表盘的「停止 / 启动 / 重启」按钮调用，由 Sidecar 管理受管的
OpenClaw 网关进程。

  GET    /api/gateway/status             网关是否可达 + PID
  POST   /api/gateway/start              启动网关
  POST   /api/gateway/stop               停止网关
  POST   /api/gateway/restart            重启网关
  GET    /api/gateway/skills             OpenClaw 内置技能包（打包 npm 包内 skills/）
  DELETE /api/gateway/channels/{channel} 删除渠道账号配置（可带 ?account=）
"""

import logging
from pathlib import Path

from fastapi import APIRouter, Query, Request

from ..services.gateway_manager import GatewayManager
from ..services.skills_scan import scan_skills

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gateway", tags=["gateway"])


def _manager(request: Request) -> GatewayManager:
    return request.app.state.gateway_manager


@router.get("/status")
async def gateway_status(request: Request) -> dict:
    """网关状态：是否可达 + 监听 PID"""
    return await _manager(request).status()


@router.post("/start")
async def gateway_start(request: Request) -> dict:
    """启动网关"""
    return await _manager(request).start()


@router.post("/stop")
async def gateway_stop(request: Request) -> dict:
    """停止网关"""
    return await _manager(request).stop()


@router.post("/restart")
async def gateway_restart(request: Request) -> dict:
    """重启网关"""
    return await _manager(request).restart()


@router.get("/skills")
async def gateway_skills(request: Request) -> dict:
    """OpenClaw 内置技能包清单（扫描打包 npm 包内的 skills/**/SKILL.md）"""
    entry = Path(_manager(request)._oc_entry)
    root = entry.parent / "skills"
    data = scan_skills(root)
    return {"data": data, "count": len(data), "root": str(root)}


@router.delete("/channels/{channel}")
async def remove_channel(
    request: Request,
    channel: str,
    account: str | None = Query(default=None),
) -> dict:
    """删除渠道账号配置（openclaw channels remove --delete，经 CLI 执行）"""
    return await _manager(request).remove_channel(channel, account)
