"""
管理端点 — /admin/codes

功能: 批量生成激活码 / 吊销激活码 / 查询码列表

认证: Bearer <admin_token>
"""

import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import LicenseServerConfig
from ..database import get_db_session
from ..models import ActivationCode, DeviceBinding, LicenseAuditLog

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# 激活码格式: XXXX-XXXX-XXXX (12位字母数字)
_CODE_SEGMENTS = 3
_CODE_SEGMENT_LEN = 4
_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 去掉易混淆字符 0/O/1/I


def _generate_code() -> str:
    """生成一个激活码"""
    segments = []
    for _ in range(_CODE_SEGMENTS):
        seg = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_SEGMENT_LEN))
        segments.append(seg)
    return "-".join(segments)


# ── 请求/响应模型 ──

class GenerateRequest(BaseModel):
    count: int = Field(default=1, ge=1, le=100, description="生成数量")
    batch_id: str | None = Field(default=None, description="批次标识")
    note: str | None = Field(default=None, description="备注")


class GenerateResponse(BaseModel):
    success: bool
    codes: list[str] = []         # 明文激活码（仅此一次返回！）
    count: int = 0
    batch_id: str | None = None


class CodeInfo(BaseModel):
    id: str
    code_prefix: str              # 前4位明文
    status: str
    batch_id: str | None
    note: str | None
    bound_device: str | None      # 绑定的设备名
    created_at: str


class CodeListResponse(BaseModel):
    codes: list[CodeInfo]
    total: int


class RevokeResponse(BaseModel):
    success: bool
    detail: str | None = None


# ── Admin 认证中间件依赖 ──

async def verify_admin_token(request: Request) -> None:
    """验证管理端 Bearer token"""
    config: LicenseServerConfig = request.app.state.config
    if not config.admin_token:
        return  # 未配置 admin_token，允许免认证

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少管理认证令牌")
    if auth.removeprefix("Bearer ") != config.admin_token:
        raise HTTPException(status_code=403, detail="管理认证令牌无效")


# ── 端点 ──

@router.post("/codes/generate", response_model=GenerateResponse)
async def generate_codes(
    body: GenerateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(verify_admin_token),
) -> GenerateResponse:
    """批量生成激活码

    返回明文激活码列表。此列表仅返回一次，服务器不会存储明文。
    """
    batch_id = body.batch_id or uuid.uuid4().hex[:12]
    now = datetime.now(timezone.utc)
    codes = []

    for _ in range(body.count):
        code = _generate_code()
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        code_prefix = code[:4]

        db.add(ActivationCode(
            code_hash=code_hash,
            code_prefix=code_prefix,
            status="active",
            batch_id=batch_id,
            note=body.note,
        ))
        codes.append(code)

    # 审计日志
    client_ip = request.client.host if request.client else None
    db.add(LicenseAuditLog(
        action="generate_codes",
        detail=f"生成 {body.count} 个码, batch={batch_id}",
        client_ip=client_ip,
    ))

    await db.commit()
    logger.info("生成 %d 个激活码 (batch=%s)", body.count, batch_id)

    return GenerateResponse(
        success=True,
        codes=codes,
        count=len(codes),
        batch_id=batch_id,
    )


@router.get("/codes", response_model=CodeListResponse)
async def list_codes(
    request: Request,
    status: str | None = Query(None, description="按状态筛选: active/used/revoked"),
    batch_id: str | None = Query(None, description="按批次筛选"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(verify_admin_token),
) -> CodeListResponse:
    """查询激活码列表"""
    query = select(ActivationCode).order_by(ActivationCode.created_at.desc())
    count_query = select(func.count()).select_from(ActivationCode)

    if status:
        query = query.where(ActivationCode.status == status)
        count_query = count_query.where(ActivationCode.status == status)
    if batch_id:
        query = query.where(ActivationCode.batch_id == batch_id)
        count_query = count_query.where(ActivationCode.batch_id == batch_id)

    # 总数
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # 分页
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    code_records = result.scalars().all()

    # 批量获取绑定信息
    code_ids = [c.id for c in code_records]
    bindings: dict[str, str] = {}
    if code_ids:
        bind_result = await db.execute(
            select(DeviceBinding).where(DeviceBinding.code_id.in_(code_ids))
        )
        for b in bind_result.scalars():
            bindings[b.code_id] = b.device_name or "Unknown"

    return CodeListResponse(
        codes=[
            CodeInfo(
                id=c.id,
                code_prefix=c.code_prefix,
                status=c.status,
                batch_id=c.batch_id,
                note=c.note,
                bound_device=bindings.get(c.id),
                created_at=c.created_at.isoformat(),
            )
            for c in code_records
        ],
        total=total,
    )


@router.post("/codes/{code_id}/revoke", response_model=RevokeResponse)
async def revoke_code(
    code_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
    _admin=Depends(verify_admin_token),
) -> RevokeResponse:
    """吊销激活码（其绑定的设备也将无法通过在线校验）"""
    result = await db.execute(
        select(ActivationCode).where(ActivationCode.id == code_id)
    )
    code_record = result.scalar_one_or_none()

    if code_record is None:
        raise HTTPException(status_code=404, detail="激活码不存在")

    if code_record.status == "revoked":
        return RevokeResponse(success=False, detail="该码已被吊销")

    code_record.status = "revoked"

    client_ip = request.client.host if request.client else None
    db.add(LicenseAuditLog(
        action="revoke",
        code_id=code_id,
        detail="管理员吊销",
        client_ip=client_ip,
    ))

    await db.commit()
    logger.info("激活码已吊销: id=%s", code_id)

    return RevokeResponse(success=True, detail="已吊销")
