"""
激活端点 — POST /activate

处理设备激活请求：校验激活码 → 绑定设备 → 签发 JWT。

一码一机逻辑：
  - code 未使用(status=active) → 创建绑定，status → used，签发 JWT
  - code 已使用(status=used) → 检查 device_fp_hash 是否匹配
      ├─ 匹配 → 同一台机，补发 JWT
      └─ 不匹配 → 拒绝（此码已绑定其他设备）
  - code 已吊销(status=revoked) → 拒绝
"""

import hashlib
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import LicenseServerConfig
from ..database import get_db_session
from ..models import ActivationCode, DeviceBinding, LicenseAuditLog

logger = logging.getLogger(__name__)

router = APIRouter(tags=["activate"])


class ActivateRequest(BaseModel):
    code: str = Field(..., description="激活码明文")
    device_fp_hash: str = Field(..., description="SHA-256(设备指纹)")
    device_name: str = Field(default="Unnamed Device")


class ActivateResponse(BaseModel):
    success: bool
    activation_token: str | None = None
    device_name: str | None = None
    detail: str | None = None


def _hash_code(code: str) -> str:
    """激活码 SHA-256 哈希"""
    return hashlib.sha256(code.strip().upper().encode()).hexdigest()


def _sign_jwt(config: LicenseServerConfig, payload: dict) -> str:
    """签发 JWT (HS256)"""
    from jose import jwt
    return jwt.encode(payload, config.jwt_secret, algorithm="HS256")


async def _audit_log(
    db: AsyncSession,
    action: str,
    code_id: str | None = None,
    device_fp_hash: str | None = None,
    detail: str | None = None,
    client_ip: str | None = None,
) -> None:
    """写入审计日志"""
    log_entry = LicenseAuditLog(
        action=action,
        code_id=code_id,
        device_fp_hash=device_fp_hash,
        detail=detail,
        client_ip=client_ip,
    )
    db.add(log_entry)


@router.post("/activate", response_model=ActivateResponse)
async def activate(
    request: Request,
    body: ActivateRequest,
    db: AsyncSession = Depends(get_db_session),
) -> ActivateResponse:
    config: LicenseServerConfig = request.app.state.config
    client_ip = request.client.host if request.client else None

    code_hash = _hash_code(body.code)
    fp_hash = body.device_fp_hash

    # 1. 查找激活码
    result = await db.execute(
        select(ActivationCode).where(ActivationCode.code_hash == code_hash)
    )
    code_record = result.scalar_one_or_none()

    if code_record is None:
        await _audit_log(db, "reject", detail="激活码不存在", client_ip=client_ip)
        await db.commit()
        logger.warning("激活失败: 无效激活码 (prefix=%s)", body.code[:4])
        return ActivateResponse(success=False, detail="激活码无效")

    # 2. 检查是否被吊销
    if code_record.status == "revoked":
        await _audit_log(db, "reject", code_id=code_record.id,
                        detail="激活码已被吊销", client_ip=client_ip)
        await db.commit()
        logger.warning("激活失败: 码已被吊销 (id=%s)", code_record.id)
        return ActivateResponse(success=False, detail="此激活码已被吊销")

    # 3. 检查是否已绑定
    if code_record.status == "used":
        # 查询绑定记录
        bind_result = await db.execute(
            select(DeviceBinding).where(DeviceBinding.code_id == code_record.id)
        )
        binding = bind_result.scalar_one_or_none()

        if binding is None:
            # 状态异常（used 但无绑定记录），允许重新绑定
            logger.warning("码状态异常: used 但无绑定记录 (code_id=%s)", code_record.id)
        elif binding.device_fp_hash == fp_hash:
            # 同一台设备，补发 JWT
            binding.last_validated_at = datetime.now(timezone.utc)
            token = _sign_jwt(config, {
                "sub": f"code_{code_record.id}",
                "jti": uuid.uuid4().hex,
                "iat": int(datetime.now(timezone.utc).timestamp()),
                "fp_hash": fp_hash,
                "device_name": binding.device_name or body.device_name,
            })
            await _audit_log(db, "activate", code_id=code_record.id,
                            device_fp_hash=fp_hash, detail="同设备补发token", client_ip=client_ip)
            await db.commit()
            logger.info("同设备补发 JWT: (code_id=%s)", code_record.id)
            return ActivateResponse(
                success=True,
                activation_token=token,
                device_name=binding.device_name,
            )
        else:
            # 不同设备，拒绝
            await _audit_log(db, "reject", code_id=code_record.id,
                            device_fp_hash=fp_hash,
                            detail=f"不同设备尝试激活: bound={binding.device_fp_hash[:16]} incoming={fp_hash[:16]}",
                            client_ip=client_ip)
            await db.commit()
            logger.warning("激活拒绝: 码已绑定其他设备 (code_id=%s)", code_record.id)
            return ActivateResponse(success=False, detail="此激活码已绑定其他设备")

    # 4. 首次绑定（status=active）
    code_record.status = "used"
    binding = DeviceBinding(
        code_id=code_record.id,
        device_fp_hash=fp_hash,
        device_name=body.device_name,
    )
    db.add(binding)
    await db.flush()  # 获取 binding.id

    # 签发 JWT
    token = _sign_jwt(config, {
        "sub": f"code_{code_record.id}",
        "jti": uuid.uuid4().hex,
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "fp_hash": fp_hash,
        "device_name": body.device_name,
    })

    await _audit_log(db, "activate", code_id=code_record.id,
                    device_fp_hash=fp_hash, detail="首次激活", client_ip=client_ip)
    await db.commit()

    logger.info("激活成功: (code_id=%s, device=%s)", code_record.id, body.device_name)
    return ActivateResponse(
        success=True,
        activation_token=token,
        device_name=body.device_name,
    )
