"""
License Server 数据库连接（SQLite + SQLAlchemy 异步）
"""

from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import LicenseServerConfig

_engine = None
_session_factory: async_sessionmaker | None = None


class Base(DeclarativeBase):
    pass


async def init_database(config: LicenseServerConfig) -> None:
    global _engine, _session_factory

    db_url = f"sqlite+aiosqlite:///{config.db_path}"
    _engine = create_async_engine(
        db_url,
        echo=config.log_level == "DEBUG",
        connect_args={"check_same_thread": False},
    )
    _session_factory = async_sessionmaker(
        _engine, class_=AsyncSession, expire_on_commit=False,
    )

    async with _engine.begin() as conn:
        from .models import ActivationCode, DeviceBinding, LicenseAuditLog  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def get_db_session():
    """FastAPI 依赖注入用"""
    if _session_factory is None:
        raise RuntimeError("数据库未初始化")
    async with _session_factory() as session:
        yield session


@asynccontextmanager
async def get_session_context():
    """async context manager 用"""
    if _session_factory is None:
        raise RuntimeError("数据库未初始化")
    async with _session_factory() as session:
        yield session


async def close_database() -> None:
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None
