"""
License 服务 — 激活码校验、token 管理、离线宽限期控制

核心逻辑:
  - 激活码永久有效，一码绑一机
  - 本地 token 用设备指纹派生的密钥 AES 加密存储
  - 每次启动比对指纹，换机 → 强制在线重验
  - 离线容忍 3 天，超期 → 锁定直到联网
"""

import base64
import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum

import httpx
from sqlalchemy import select

from ..config import GatewayConfig
from ..database import get_session_context
from ..models import LicenseLocal

logger = logging.getLogger(__name__)

# 离线宽限期（天）
OFFLINE_GRACE_DAYS = 3


class LicenseStatus(Enum):
    """授权状态"""
    OK = "ok"                       # 已激活，正常使用
    NOT_ACTIVATED = "not_activated"  # 未激活，需输入激活码
    DEVICE_CHANGED = "device_changed"  # 检测到硬件变更，需联网重验
    BLOCKED_OFFLINE = "blocked_offline"  # 离线超期（>3天），需联网
    REVOKED = "revoked"             # 授权已被服务器吊销
    ERROR = "error"                 # 内部错误


@dataclass
class LicenseInfo:
    """授权状态信息（返回给前端）"""
    status: str                     # LicenseStatus value
    device_name: str | None = None
    days_offline: int = 0           # 已离线天数
    offline_remaining: int = 0      # 剩余离线天数（宽限期 - 已离线）
    message: str = ""               # 人类可读的状态描述


class LicenseService:
    """License 校验服务"""

    def __init__(self, config: GatewayConfig):
        self.config = config
        self.server_url = config.license_server_url.rstrip("/")

    # ── 公开 API ──────────────────────────────────────

    async def activate(
        self,
        code: str,
        device_fp: str,
        device_name: str = "",
    ) -> tuple[LicenseStatus, LicenseInfo]:
        """激活新设备

        向 License Server 发送激活请求，成功后将加密 token 存入本地 DB。
        """
        try:
            resp = await self._call_server(
                "/activate",
                {
                    "code": code.strip().upper(),
                    "device_fp_hash": _hash_fp(device_fp),
                    "device_name": device_name or "Unnamed Device",
                },
            )
        except httpx.HTTPStatusError as e:
            detail = self._extract_detail(e)
            logger.warning("激活请求被拒绝: %s", detail)
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message=detail or f"激活失败 (HTTP {e.response.status_code})",
            )
        except Exception as e:
            logger.error("激活请求失败: %s", e)
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message=f"无法连接授权服务器: {e}",
            )

        token = resp.get("activation_token", "")
        if not token:
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message="服务器未返回有效令牌",
            )

        # 解密 token 提取信息用于本地存储
        try:
            token_data = _decode_jwt_payload(token)
            fp_hash_in_token = token_data.get("fp_hash", "")
            dev_name = token_data.get("device_name", device_name)
        except Exception:
            logger.exception("解析 activation_token 失败")
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message="令牌格式无效",
            )

        # 验证服务器返回的 fp_hash 与本地一致
        if fp_hash_in_token != _hash_fp(device_fp):
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message="设备指纹不匹配，请重试",
            )

        # 加密存储 token
        key = _derive_key(device_fp)
        encrypted = _encrypt_token(token, key)

        async with get_session_context() as db:
            # 删除旧记录（一台机只保留一条）
            result = await db.execute(select(LicenseLocal))
            for old in result.scalars():
                await db.delete(old)

            record = LicenseLocal(
                token_encrypted=encrypted,
                device_fp_hash=_hash_fp(device_fp),
                device_name=dev_name,
                last_online_at=_utcnow(),
            )
            db.add(record)
            await db.commit()

        logger.info("激活成功: device=%s", dev_name)
        return LicenseStatus.OK, LicenseInfo(
            status=LicenseStatus.OK.value,
            device_name=dev_name,
            message="激活成功",
        )

    async def validate_on_startup(self, device_fp: str) -> tuple[LicenseStatus, LicenseInfo]:
        """启动时校验授权状态

        这是每次 Gateway 启动时的入口，执行完整的离线/在线判断逻辑。
        """
        # 1. 加载本地记录
        record = await self._load_local_record()
        if record is None:
            return LicenseStatus.NOT_ACTIVATED, LicenseInfo(
                status=LicenseStatus.NOT_ACTIVATED.value,
                message="未激活，请输入激活码",
            )

        # 2. 校验设备指纹是否变化
        current_fp_hash = _hash_fp(device_fp)
        if record.device_fp_hash != current_fp_hash:
            logger.warning("设备指纹不匹配: stored=%s current=%s",
                          record.device_fp_hash[:8], current_fp_hash[:8])
            # 尝试在线重验
            status, info = await self._verify_device_change(record, device_fp)
            if status == LicenseStatus.OK:
                # 更新本地指纹记录
                async with get_session_context() as db:
                    result = await db.execute(
                        select(LicenseLocal).where(LicenseLocal.id == record.id)
                    )
                    r = result.scalar_one_or_none()
                    if r:
                        r.device_fp_hash = current_fp_hash
                        r.last_online_at = _utcnow()
                        r.updated_at = _utcnow()
                        await db.commit()
            return status, info

        # 3. 指纹匹配 — 检查离线时长
        days_offline = _days_since(record.last_online_at)
        offline_remaining = max(0, OFFLINE_GRACE_DAYS - days_offline)

        if days_offline < OFFLINE_GRACE_DAYS:
            # 宽限期内，离线可用
            return LicenseStatus.OK, LicenseInfo(
                status=LicenseStatus.OK.value,
                device_name=record.device_name,
                days_offline=days_offline,
                offline_remaining=offline_remaining,
                message=f"离线第 {days_offline} 天，剩余 {offline_remaining} 天",
            )

        # 4. 离线超期 — 必须联网校验
        logger.info("离线 %d 天，尝试在线校验...", days_offline)
        status, info = await self.verify_online(device_fp)
        return status, info

    async def verify_online(self, device_fp: str) -> tuple[LicenseStatus, LicenseInfo]:
        """在线校验授权

        向 License Server 发送当前 token 和设备指纹，验证授权是否仍然有效。
        """
        record = await self._load_local_record()
        if record is None:
            return LicenseStatus.NOT_ACTIVATED, LicenseInfo(
                status=LicenseStatus.NOT_ACTIVATED.value,
                message="未激活",
            )

        # 解密 token
        try:
            key = _derive_key(device_fp)
            token = _decrypt_token(record.token_encrypted, key)
        except Exception:
            logger.exception("解密 token 失败，可能设备指纹已变化")
            return LicenseStatus.DEVICE_CHANGED, LicenseInfo(
                status=LicenseStatus.DEVICE_CHANGED.value,
                message="无法解密授权数据，请重新激活",
            )

        # 调用服务器
        try:
            resp = await self._call_server(
                "/validate",
                {
                    "activation_token": token,
                    "device_fp_hash": _hash_fp(device_fp),
                },
            )
        except httpx.HTTPStatusError as e:
            detail = self._extract_detail(e)
            code = e.response.status_code
            if code == 410:  # Gone — code revoked
                await self._clear_local_record()
                return LicenseStatus.REVOKED, LicenseInfo(
                    status=LicenseStatus.REVOKED.value,
                    message="授权已被吊销，请联系客服",
                )
            elif code == 403:  # Forbidden — device mismatch
                return LicenseStatus.DEVICE_CHANGED, LicenseInfo(
                    status=LicenseStatus.DEVICE_CHANGED.value,
                    message=detail or "此码已绑定其他设备",
                )
            else:
                logger.warning("在线校验被拒绝: %s", detail)
                return LicenseStatus.ERROR, LicenseInfo(
                    status=LicenseStatus.ERROR.value,
                    message=detail or "校验失败",
                )
        except Exception as e:
            logger.error("在线校验不可达: %s", e)
            days_offline = _days_since(record.last_online_at)
            offline_remaining = max(0, OFFLINE_GRACE_DAYS - days_offline)
            if days_offline >= OFFLINE_GRACE_DAYS:
                return LicenseStatus.BLOCKED_OFFLINE, LicenseInfo(
                    status=LicenseStatus.BLOCKED_OFFLINE.value,
                    days_offline=days_offline,
                    message=f"离线超过 {OFFLINE_GRACE_DAYS} 天，请连接网络验证授权",
                )
            return LicenseStatus.OK, LicenseInfo(
                status=LicenseStatus.OK.value,
                device_name=record.device_name,
                days_offline=days_offline,
                offline_remaining=offline_remaining,
                message=f"无法连接授权服务器，离线第 {days_offline} 天",
            )

        # 校验成功
        valid = resp.get("valid", False)
        if valid:
            # 更新 last_online_at
            async with get_session_context() as db:
                result = await db.execute(
                    select(LicenseLocal).where(LicenseLocal.id == record.id)
                )
                r = result.scalar_one_or_none()
                if r:
                    r.last_online_at = _utcnow()
                    r.updated_at = _utcnow()
                    await db.commit()

            return LicenseStatus.OK, LicenseInfo(
                status=LicenseStatus.OK.value,
                device_name=record.device_name,
                message="授权有效",
            )
        else:
            reason = resp.get("reason", "未知原因")
            return LicenseStatus.ERROR, LicenseInfo(
                status=LicenseStatus.ERROR.value,
                message=f"校验失败: {reason}",
            )

    async def get_status(self, device_fp: str) -> LicenseInfo:
        """查询当前授权状态（不触发在线校验）"""
        record = await self._load_local_record()
        if record is None:
            return LicenseInfo(
                status=LicenseStatus.NOT_ACTIVATED.value,
                message="未激活",
            )

        current_fp_hash = _hash_fp(device_fp)
        if record.device_fp_hash != current_fp_hash:
            return LicenseInfo(
                status=LicenseStatus.DEVICE_CHANGED.value,
                device_name=record.device_name,
                message="检测到硬件变更",
            )

        days_offline = _days_since(record.last_online_at)
        offline_remaining = max(0, OFFLINE_GRACE_DAYS - days_offline)

        if days_offline >= OFFLINE_GRACE_DAYS:
            return LicenseInfo(
                status=LicenseStatus.BLOCKED_OFFLINE.value,
                device_name=record.device_name,
                days_offline=days_offline,
                offline_remaining=0,
                message=f"离线超过 {OFFLINE_GRACE_DAYS} 天，需要联网验证",
            )

        return LicenseInfo(
            status=LicenseStatus.OK.value,
            device_name=record.device_name,
            days_offline=days_offline,
            offline_remaining=offline_remaining,
            message=f"授权正常",
        )

    # ── 内部方法 ──────────────────────────────────────

    async def _load_local_record(self) -> LicenseLocal | None:
        """从数据库加载本地授权记录"""
        try:
            async with get_session_context() as db:
                result = await db.execute(select(LicenseLocal).limit(1))
                return result.scalar_one_or_none()
        except Exception:
            logger.exception("加载本地授权记录失败")
            return None

    async def _clear_local_record(self) -> None:
        """清除本地授权记录（吊销场景）"""
        try:
            async with get_session_context() as db:
                result = await db.execute(select(LicenseLocal))
                for r in result.scalars():
                    await db.delete(r)
                await db.commit()
        except Exception:
            logger.exception("清除本地授权记录失败")

    async def _verify_device_change(
        self, record: LicenseLocal, device_fp: str
    ) -> tuple[LicenseStatus, LicenseInfo]:
        """处理设备指纹变化的情况 — 尝试在线重验"""
        # 尝试解密 token（旧指纹派生的 key 可能已失效）
        token = None
        try:
            old_key = _derive_key(device_fp)  # 当前指纹的 key
            token = _decrypt_token(record.token_encrypted, old_key)
        except Exception:
            # 无法用当前指纹解密 — token 是用旧指纹加密的
            # 这意味着确实换机了，需要重新激活
            return LicenseStatus.DEVICE_CHANGED, LicenseInfo(
                status=LicenseStatus.DEVICE_CHANGED.value,
                message="检测到硬件变更，请使用激活码重新激活",
            )

        # 用当前 fp 去服务器重验
        try:
            resp = await self._call_server(
                "/validate",
                {
                    "activation_token": token,
                    "device_fp_hash": _hash_fp(device_fp),
                },
            )
            valid = resp.get("valid", False)
            if valid:
                # 服务器确认本机 fp 与绑定 fp 一致 — 可能是小硬件变动
                logger.info("设备变更已通过在线验证")
                return LicenseStatus.OK, LicenseInfo(
                    status=LicenseStatus.OK.value,
                    device_name=record.device_name,
                    message="设备验证通过",
                )
            else:
                return LicenseStatus.DEVICE_CHANGED, LicenseInfo(
                    status=LicenseStatus.DEVICE_CHANGED.value,
                    message=resp.get("reason", "此码已绑定其他设备"),
                )
        except Exception:
            return LicenseStatus.DEVICE_CHANGED, LicenseInfo(
                status=LicenseStatus.DEVICE_CHANGED.value,
                message="检测到硬件变更，请连接网络完成验证",
            )

    async def _call_server(self, path: str, data: dict) -> dict:
        """调用 License Server API"""
        url = f"{self.server_url}{path}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=data)
            resp.raise_for_status()
            return resp.json()

    @staticmethod
    def _extract_detail(e: httpx.HTTPStatusError) -> str:
        """从 HTTP 错误响应中提取 detail 消息"""
        try:
            body = e.response.json()
            return body.get("detail", "")
        except Exception:
            return ""


# ── 加密工具 ──────────────────────────────────────────

def _hash_fp(fp: str) -> str:
    """设备指纹散列"""
    return hashlib.sha256(fp.encode()).hexdigest()


def _derive_key(device_fp: str) -> bytes:
    """从设备指纹派生 Fernet 加密密钥（32 字节 urlsafe base64）"""
    return base64.urlsafe_b64encode(
        hashlib.sha256(f"license-key-v1:{device_fp}".encode()).digest()
    )


def _encrypt_token(token: str, key: bytes) -> str:
    """Fernet 加密 token"""
    from cryptography.fernet import Fernet
    return Fernet(key).encrypt(token.encode()).decode()


def _decrypt_token(data: str, key: bytes) -> str:
    """Fernet 解密 token"""
    from cryptography.fernet import Fernet
    return Fernet(key).decrypt(data.encode()).decode()


def _decode_jwt_payload(token: str) -> dict:
    """解码 JWT payload（不验证签名，仅用于本地读取信息）"""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("无效的 JWT 格式")
    payload = parts[1]
    # 补齐 base64 padding
    payload += "=" * (4 - len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload))


def _days_since(dt: datetime) -> int:
    """计算从指定时间到现在的天数（整数）"""
    delta = _utcnow() - dt
    return max(0, delta.days)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)
