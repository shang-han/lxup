"""
License Server 数据模型：激活码、设备绑定、审计日志
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def _new_id() -> str:
    return uuid.uuid4().hex[:16]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ActivationCode(Base):
    """激活码表

    存储 SHA-256 哈希值，明文仅在生成时返回一次。
    """
    __tablename__ = "activation_codes"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    code_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, unique=True,
        comment="SHA-256(激活码)，用于校验"
    )
    code_prefix: Mapped[str] = mapped_column(
        String(8), nullable=False, comment="激活码前几位明文，便于客服查询"
    )
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="active",
        comment="状态: active(未使用) / used(已绑定) / revoked(已吊销)"
    )
    # 生成元数据
    batch_id: Mapped[str | None] = mapped_column(
        String(32), comment="批次号，用于批量管理"
    )
    note: Mapped[str | None] = mapped_column(Text, comment="管理员备注")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )


class DeviceBinding(Base):
    """设备绑定表

    记录激活码与设备的绑定关系，一码一机。
    """
    __tablename__ = "device_bindings"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    code_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("activation_codes.id"), nullable=False,
        comment="关联的激活码"
    )
    device_fp_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="SHA-256(设备指纹)"
    )
    device_name: Mapped[str | None] = mapped_column(
        String(128), comment="用户设置的设备名"
    )
    bound_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    last_validated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow,
        comment="最后一次在线校验时间"
    )


class LicenseAuditLog(Base):
    """授权审计日志表"""
    __tablename__ = "license_audit_logs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_new_id)
    action: Mapped[str] = mapped_column(
        String(32), nullable=False,
        comment="操作类型: activate / validate / revoke / reject"
    )
    code_id: Mapped[str | None] = mapped_column(String(32))
    device_fp_hash: Mapped[str | None] = mapped_column(String(64))
    detail: Mapped[str | None] = mapped_column(
        Text, comment="详细信息（失败原因等）"
    )
    client_ip: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
