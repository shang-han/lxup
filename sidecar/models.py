"""
SQLAlchemy 数据模型：本地授权状态

Sidecar 只保留授权相关的表。Agent 会话/记忆由真正的 OpenClaw / Hermes
网关自行管理，不在 Sidecar 重复存储。
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def _new_id() -> str:
    return uuid.uuid4().hex[:16]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LicenseLocal(Base):
    """本地授权状态表 — 存储加密后的激活令牌和校验状态

    只记录本地状态，不存储授权数据本身。实际 JWT token 由
    services/license.py 负责加密管理，加密密钥派生自设备指纹。
    """
    __tablename__ = "license_local"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    token_encrypted: Mapped[str] = mapped_column(
        Text, nullable=False, comment="AES-256-GCM 加密的 JWT activation_token"
    )
    device_fp_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="SHA-256(设备指纹)，用于换机检测"
    )
    device_name: Mapped[str | None] = mapped_column(
        String(128), comment="用户设置的设备名"
    )
    last_online_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, comment="最后一次在线校验成功的时间"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )
