"""
License Server 配置
"""

import os
from dataclasses import dataclass


@dataclass
class LicenseServerConfig:
    """License Server 运行配置"""

    host: str = "0.0.0.0"
    port: int = 9000
    db_path: str = "license.db"
    jwt_secret: str = ""          # HMAC-SHA256 JWT 签名密钥（必填，通过环境变量注入）
    admin_token: str = ""         # 管理 API 认证 token
    log_level: str = "INFO"

    @classmethod
    def from_env_and_args(cls, **kwargs) -> "LicenseServerConfig":
        config = cls(
            host=os.getenv("LICENSE_HOST", cls.host),
            port=int(os.getenv("LICENSE_PORT", cls.port)),
            db_path=os.getenv("LICENSE_DB_PATH", cls.db_path),
            jwt_secret=os.getenv("LICENSE_JWT_SECRET", cls.jwt_secret),
            admin_token=os.getenv("LICENSE_ADMIN_TOKEN", cls.admin_token),
            log_level=os.getenv("LICENSE_LOG_LEVEL", cls.log_level),
        )
        for key, value in kwargs.items():
            if value is not None and hasattr(config, key):
                setattr(config, key, value)
        # 生产环境必须设置 JWT secret
        if not config.jwt_secret:
            raise ValueError(
                "LICENSE_JWT_SECRET 未设置！请通过环境变量或 --jwt-secret 参数提供。"
            )
        return config
