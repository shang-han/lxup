"""
健康检查端点 — /health

供编排层（Tauri / 进程管理器）轮询，判断 Sidecar 是否存活。
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Sidecar 健康检查

    返回 Sidecar 自身状态。Sidecar 提供授权客户端与微信扫码登录桥接，
    Agent 运行时由独立的 OpenClaw / Hermes 网关负责，不在此报告。
    """
    return {
        "status": "ok",
        "service": "lxup-sidecar",
        "version": "0.1.0",
    }
