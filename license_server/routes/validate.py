"""
校验端点 — POST /validate

Gateway 定时/启动时调用，验证 JWT token 和 device_fp 是否仍然有效。
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import LicenseServerConfig
from ..database import get_db_session
from ..models import ActivationCode, DeviceBinding, LicenseAuditLog

logger = logging.getLogger(__name__)

router = APIRouter(tags=["validate"])


class ValidateRequest(BaseModel):
    activation_token: str = Field(..., description="JWT activation_token")
    device_fp_hash: str = Field(..., description="SHA-256(当前设备指纹)")


class ValidateResponse(BaseModel):
    valid: bool
    reason: str | None = None


def _verify_jwt(config: LicenseServerConfig, token: str) -> dict | None:
    """验证 JWT 签名，返回 payload 或 None"""
    from jose import jwt, JWTError
    try:
        return jwt.decode(token, config.jwt_secret, algorithms=["HS256"])
    except JWTError as e:
        logger.warning("JWT 验证失败: %s", e)
        return None


@router.post("/validate", response_model=ValidateResponse)
async def validate(
    request: Request,
    body: ValidateRequest,
    db: AsyncSession = Depends(get_db_session),
) -> ValidateResponse:
    config: LicenseServerConfig = request.app.state.config
    client_ip = request.client.host if request.client else None

    # 1. 验证 JWT 签名
    payload = _verify_jwt(config, body.activation_token)
    if payload is None:
        await _audit(db, "reject", detail="JWT 签名无效", client_ip=client_ip)
        return ValidateResponse(valid=False, reason="授权令牌无效")

    # 2. 提取 claims
    code_id = payload.get("sub", "").removeprefix("code_")
    token_fp_hash = payload.get("fp_hash", "")

    if not code_id or not token_fp_hash:
        await _audit(db, "reject", detail="JWT claims 缺失", client_ip=client_ip)
        return ValidateResponse(valid=False, reason="授权令牌格式无效")

    # 3. 校验 device_fp_hash
    if token_fp_hash != body.device_fp_hash:
        await _audit(db, "reject", code_id=code_id,
                    device_fp_hash=body.device_fp_hash,
                    detail=f"设备指纹不匹配: token={token_fp_hash[:16]} incoming={body.device_fp_hash[:16]}",
                    client_ip=client_ip)
        await db.commit()
        return ValidateResponse(valid=False, reason="设备指纹不匹配")

    # 4. 检查激活码状态
    result = await db.execute(
        select(ActivationCode).where(ActivationCode.id == code_id)
    )
    code_record = result.scalar_one_or_none()

    if code_record is None:
        await _audit(db, "reject", code_id=code_id, detail="激活码不存在", client_ip=client_ip)
        await db.commit()
        return ValidateResponse(valid=False, reason="激活码无效")

    if code_record.status == "revoked":
        await _audit(db, "reject", code_id=code_id, detail="激活码已被吊销", client_ip=client_ip)
        await db.commit()
        return ValidateResponse(valid=False, reason="此激活码已被吊销")

    # 5. 更新 last_validated_at
    bind_result = await db.execute(
        select(DeviceBinding).where(DeviceBinding.code_id == code_id)
    )
    binding = bind_result.scalar_one_or_none()
    if binding:
        binding.last_validated_at = datetime.now(timezone.utc)

    await _audit(db, "validate", code_id=code_id,
                device_fp_hash=body.device_fp_hash, client_ip=client_ip)
    await db.commit()

    return ValidateResponse(valid=True)


async def _audit(
    db: AsyncSession,
    action: str,
    code_id: str | None = None,
    device_fp_hash: str | None = None,
    detail: str | None = None,
    client_ip: str | None = None,
) -> None:
    db.add(LicenseAuditLog(
        action=action,
        code_id=code_id,
        device_fp_hash=device_fp_hash,
        detail=detail,
        client_ip=client_ip,
    ))
