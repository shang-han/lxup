"""
License Server — 软件激活码校验服务

启动方式:
    python -m license_server.main --port 9000 --jwt-secret <secret>

环境变量:
    LICENSE_JWT_SECRET    JWT 签名密钥（必填）
    LICENSE_ADMIN_TOKEN   管理 API 认证 token（可选，不设则免认证）
"""

import argparse
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import LicenseServerConfig
from .database import close_database, init_database
from .routes import activate, admin, admin_ui, validate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("license-server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    config: LicenseServerConfig = app.state.config
    logger.info("License Server 启动中... (端口: %d)", config.port)
    await init_database(config)
    logger.info("License Server 就绪 (admin_auth=%s)", bool(config.admin_token))
    yield
    await close_database()
    logger.info("License Server 已关闭")


def create_app(config: LicenseServerConfig) -> FastAPI:
    app = FastAPI(
        title="License Validation Server",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.state.config = config

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # License Server 面向公网，Gateway 通过 HTTPS 调用
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(activate.router)
    app.include_router(validate.router)
    app.include_router(admin_ui.router)   # /admin 放在 /admin/codes 之前
    app.include_router(admin.router)

    return app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="License Validation Server")
    parser.add_argument("--host", default=None, help="监听地址")
    parser.add_argument("--port", type=int, default=None, help="监听端口")
    parser.add_argument("--db-path", default=None, help="SQLite 数据库路径")
    parser.add_argument("--jwt-secret", default=None, help="JWT 签名密钥")
    parser.add_argument("--admin-token", default=None, help="管理 API 认证 token")
    parser.add_argument("--log-level", default=None,
                       choices=["DEBUG", "INFO", "WARNING", "ERROR"])
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    config = LicenseServerConfig.from_env_and_args(
        host=args.host,
        port=args.port,
        db_path=args.db_path,
        jwt_secret=args.jwt_secret,
        admin_token=args.admin_token,
        log_level=args.log_level,
    )

    logging.getLogger().setLevel(getattr(logging, config.log_level))

    app = create_app(config)

    import uvicorn
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
    )


if __name__ == "__main__":
    main()
