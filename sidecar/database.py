"""
数据库连接与会话管理（SQLite + SQLAlchemy 异步）
"""

from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import GatewayConfig

# 全局引擎和会话工厂
_engine = None
_session_factory: async_sessionmaker | None = None


class Base(DeclarativeBase):
    """SQLAlchemy 声明式基类"""
    pass


async def init_database(config: GatewayConfig) -> None:
    """初始化数据库引擎和表结构"""
    global _engine, _session_factory

    # SQLite 使用 aiosqlite 驱动
    db_url = f"sqlite+aiosqlite:///{config.db_path}"

    _engine = create_async_engine(
        db_url,
        echo=config.log_level == "DEBUG",
        connect_args={"check_same_thread": False},
    )
    _session_factory = async_sessionmaker(
        _engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # 自动建表（生产环境应使用 Alembic 迁移）
    async with _engine.begin() as conn:
        # 延迟导入避免循环引用
        from .models import LicenseLocal  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)


async def get_db_session():
    """获取数据库会话（FastAPI 依赖注入用，用于 HTTP 路由）

    注意: 函数名不能与路由处理函数同名，否则会干扰 FastAPI 的依赖解析。
    """
    if _session_factory is None:
        raise RuntimeError("数据库未初始化，请先调用 init_database()")
    async with _session_factory() as session:
        yield session


@asynccontextmanager
async def get_session_context():
    """获取数据库会话（async context manager，用于 WebSocket 路由）"""
    if _session_factory is None:
        raise RuntimeError("数据库未初始化，请先调用 init_database()")
    async with _session_factory() as session:
        yield session


async def close_database() -> None:
    """关闭数据库连接"""
    global _engine
    if _engine:
        await _engine.dispose()
        _engine = None
