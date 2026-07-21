"""
网关进程管理端点 — /api/gateway/*

供控制台仪表盘的「停止 / 启动 / 重启」按钮调用，由 Sidecar 管理受管的
OpenClaw 网关进程。

  GET  /api/gateway/status    网关是否可达 + PID
  POST /api/gateway/start     启动网关
  POST /api/gateway/stop      停止网关
  POST /api/gateway/restart   重启网关
"""

import logging

from fastapi import APIRouter, Request

from ..services.gateway_manager import GatewayManager

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
