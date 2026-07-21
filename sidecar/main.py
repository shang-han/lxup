"""
LXUP Sidecar 主入口

伴随真正的 OpenClaw / Hermes 网关运行，提供它们不通过 RPC 暴露的
LXUP 产品层能力：
  - 授权客户端（一机一码激活、离线宽限）      → /api/license/*
  - 微信扫码登录桥接（跑登录子进程回传二维码） → /ws/weixin-login

启动方式:
    python -m sidecar.main --port 7889 --token <random-token>

所有 HTTP/WebSocket 请求需携带 Authorization: Bearer <token> 头
（未设置 token 时为开发模式，免认证）。
"""

import argparse
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import GatewayConfig
from .database import close_database, init_database
from .routes import gateway_routes, health, hermes, license, weixin_login_routes
from .services.gateway_manager import GatewayManager
from .services.hermes_manager import HermesManager
from .services.license import LicenseService

# ── 日志 ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sidecar")


# ── 认证中间件 ──

class AuthMiddleware:
    """Bearer Token 认证中间件

    校验所有请求的 Authorization 头。Tauri v2 启动 sidecar 时
    通过 --token 传入随机生成的 Token。
    /health 端点免认证（供 Tauri 健康检查轮询使用）。
    """

    EXEMPT_PATHS = {"/health", "/ws/weixin-login"}  # WebSocket 的认证在握手阶段处理

    def __init__(self, app: FastAPI, token: str):
        self.app = app
        self.token = token
        self._register()

    def _register(self) -> None:
        @self.app.middleware("http")
        async def auth_middleware(request: Request, call_next):
            # 健康检查免认证
            if request.url.path in self.EXEMPT_PATHS:
                return await call_next(request)

            # 验证 Bearer Token
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return JSONResponse(
                    status_code=401,
                    content={"detail": "缺少认证令牌"},
                )
            provided_token = auth_header.removeprefix("Bearer ")
            if provided_token != self.token:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "认证令牌无效"},
                )

            return await call_next(request)


# ── 应用生命周期 ──

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 生命周期管理"""
    # 启动时
    config: GatewayConfig = app.state.config
    logger.info("Sidecar 启动中... (端口: %d)", config.port)

    await init_database(config)
    logger.info("Sidecar 就绪，监听 %s:%d", config.host, config.port)

    # 就绪信号写到数据库同目录（runtime/data/），保持项目根目录清爽
    ready_path = os.path.join(
        os.path.dirname(os.path.abspath(config.db_path)) or ".", ".sidecar.ready"
    )
    try:
        with open(ready_path, "w") as f:
            f.write(str(config.port))
    except Exception:
        pass

    yield

    # 关闭时
    logger.info("Sidecar 关闭中...")
    await close_database()

    # 清理就绪信号
    try:
        os.remove(ready_path)
    except Exception:
        pass
    logger.info("Sidecar 已关闭")


# ── 应用工厂 ──

def create_app(config: GatewayConfig) -> FastAPI:
    """创建 FastAPI 应用实例"""
    app = FastAPI(
        title="LXUP Sidecar",
        version="0.1.0",
        lifespan=lifespan,
    )

    # 保存配置到 app state
    app.state.config = config
    app.state.license_service = LicenseService(config)
    app.state.gateway_manager = GatewayManager(config)
    app.state.hermes_manager = HermesManager(config)

    # 认证中间件（无 token 时跳过，用于开发模式）
    if config.auth_token:
        AuthMiddleware(app, config.auth_token)
        logger.info("认证中间件已启用")
    else:
        logger.warning("⚠ 未设置 auth_token，所有请求可免认证访问（仅开发模式）")

    # CORS — 仅允许本地 Tauri WebView 来源
    # CORS — 允许本地任意端口的 localhost/127.0.0.1（开发服务器端口可能变化），
    # 以及 Tauri WebView 来源。CORS 源是精确匹配的，"http://localhost" 不等于
    # "http://localhost:5173"，故用正则匹配任意端口。
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_origins=[
            "tauri://localhost",
            "https://tauri.localhost",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(health.router)
    app.include_router(license.router)
    app.include_router(weixin_login_routes.router)
    app.include_router(gateway_routes.router)
    app.include_router(hermes.router)

    return app


# ── CLI 入口 ──

def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="LXUP Sidecar — 授权客户端 + 微信扫码登录桥接",
    )
    parser.add_argument(
        "--host",
        default=None,
        help="监听地址（默认 127.0.0.1）",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="监听端口（默认 7889）",
    )
    parser.add_argument(
        "--token",
        default=None,
        help="认证令牌（Tauri v2 启动时随机生成）",
    )
    parser.add_argument(
        "--db-path",
        default=None,
        help="SQLite 数据库路径（默认 gateway.db）",
    )
    parser.add_argument(
        "--log-level",
        default=None,
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="日志级别",
    )
    return parser.parse_args()


def main() -> None:
    """程序入口"""
    args = parse_args()

    config = GatewayConfig.from_env_and_args(
        host=args.host,
        port=args.port,
        auth_token=args.token,
        db_path=args.db_path,
        log_level=args.log_level,
    )

    # 设置日志级别
    logging.getLogger().setLevel(getattr(logging, config.log_level))
    logging.getLogger("gateway").setLevel(getattr(logging, config.log_level))

    app = create_app(config)

    import uvicorn
    uvicorn.run(
        app,
        host=config.host,
        port=config.port,
        log_level=config.log_level.lower(),
        access_log=(config.log_level == "DEBUG"),
    )


if __name__ == "__main__":
    main()
