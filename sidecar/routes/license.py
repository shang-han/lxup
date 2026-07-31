"""
License 路由 — 激活码校验与授权状态查询

设备指纹由 Tauri Rust 侧采集后，前端通过 invoke 获取并传入各端点。
"""

import logging

from fastapi import APIRouter, Query, Request
from pydantic import BaseModel, Field

from ..services.license import LicenseService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/license", tags=["license"])

# ── 请求/响应模型 ──


class ActivateRequest(BaseModel):
    """激活请求"""
    code: str = Field(..., description="激活码", min_length=4, max_length=64)
    device_fingerprint: str = Field(..., description="设备指纹（Tauri Rust 采集）")
    device_name: str = Field(default="", description="设备名称")


class ValidateRequest(BaseModel):
    """在线校验请求"""
    device_fingerprint: str = Field(..., description="设备指纹")


class LicenseResponse(BaseModel):
    """通用授权响应"""
    success: bool
    status: str                       # LicenseStatus value
    device_name: str | None = None
    days_offline: int = 0
    offline_remaining: int = 0        # 剩余离线天数
    message: str = ""


# ── 端点 ──


@router.post("/activate", response_model=LicenseResponse)
async def activate(request: Request, body: ActivateRequest) -> LicenseResponse:
    """激活设备

    向 License Server 发送激活码 + 设备指纹，绑定设备后返回加密 token。
    """
    service: LicenseService = request.app.state.license_service
    status, info = await service.activate(
        code=body.code,
        device_fp=body.device_fingerprint,
        device_name=body.device_name,
    )
    return LicenseResponse(
        success=(status.value == "ok"),
        status=info.status,
        device_name=info.device_name,
        days_offline=info.days_offline,
        offline_remaining=info.offline_remaining,
        message=info.message,
    )


@router.get("/status", response_model=LicenseResponse)
async def get_status(
    request: Request,
    device_fingerprint: str = Query(..., description="设备指纹"),
) -> LicenseResponse:
    """查询当前授权状态（不触发在线校验）

    前端定时轮询此端点以更新 UI 状态指示器。
    """
    service: LicenseService = request.app.state.license_service
    info = await service.get_status(device_fp=device_fingerprint)

    return LicenseResponse(
        success=(info.status == "ok"),
        status=info.status,
        device_name=info.device_name,
        days_offline=info.days_offline,
        offline_remaining=info.offline_remaining,
        message=info.message,
    )


@router.post("/validate", response_model=LicenseResponse)
async def validate(request: Request, body: ValidateRequest) -> LicenseResponse:
    """手动触发在线校验

    用户点击"重新验证"按钮 / 离线超期后联网 / 启动时调用。
    """
    service: LicenseService = request.app.state.license_service
    status, info = await service.verify_online(device_fp=body.device_fingerprint)

    return LicenseResponse(
        success=(status.value == "ok"),
        status=info.status,
        device_name=info.device_name,
        days_offline=info.days_offline,
        offline_remaining=info.offline_remaining,
        message=info.message,
    )
