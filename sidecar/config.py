"""
Sidecar 全局配置管理

所有配置项支持环境变量覆盖，优先级：CLI 参数 > 环境变量 > 默认值。
"""

import os
from dataclasses import dataclass
from pathlib import Path

# 项目根目录（sidecar 包位于 <root>/sidecar，上两级即项目根），
# 用于在未显式指定时定位 runtime/hermes-home，避免依赖启动时的 cwd。
_PROJECT_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class GatewayConfig:
    """Sidecar 运行配置"""

    # 服务配置
    host: str = "127.0.0.1"
    port: int = 7889

    # 受管的 OpenClaw 网关（sidecar 负责其启停/重启）
    openclaw_port: int = 18789
    openclaw_cmd: str = "openclaw"  # 全局命令回退
    # OpenClaw 便携运行（留空则用项目内默认：runtime/data/node.exe + runtime/openclaw）
    openclaw_node: str = ""
    openclaw_entry: str = ""

    # 认证（启动时通过 --token 传入）
    auth_token: str = ""

    # 数据库
    db_path: str = "gateway.db"

    # Hermes 引擎家目录（config.yaml/会话/日志所在）；默认项目根下 runtime/hermes-home
    hermes_home: str = str(_PROJECT_ROOT / "runtime" / "hermes-home")

    # Hermes 网关地址（状态探测用）
    hermes_gateway_url: str = "http://127.0.0.1:8642"

    # 日志
    log_level: str = "INFO"

    # License 授权服务器地址
    license_server_url: str = "https://license.example.com"

    @classmethod
    def from_env_and_args(cls, **kwargs) -> "GatewayConfig":
        """合并环境变量和 CLI 参数，CLI 参数优先"""
        config = cls(
            host=os.getenv("GATEWAY_HOST", cls.host),
            port=int(os.getenv("GATEWAY_PORT", cls.port)),
            openclaw_port=int(os.getenv("OPENCLAW_PORT", cls.openclaw_port)),
            openclaw_cmd=os.getenv("OPENCLAW_CMD", cls.openclaw_cmd),
            openclaw_node=os.getenv("OPENCLAW_NODE", cls.openclaw_node),
            openclaw_entry=os.getenv("OPENCLAW_ENTRY", cls.openclaw_entry),
            auth_token=os.getenv("GATEWAY_TOKEN", cls.auth_token),
            db_path=os.getenv("GATEWAY_DB_PATH", cls.db_path),
            # 用专用变量 LXUP_HERMES_HOME，避免被全局 HERMES_HOME（hermes 自带、可能指向项目外）劫持，保证便携
            hermes_home=os.getenv("LXUP_HERMES_HOME", cls.hermes_home),
            hermes_gateway_url=os.getenv("LXUP_HERMES_GATEWAY_URL", cls.hermes_gateway_url),
            log_level=os.getenv("GATEWAY_LOG_LEVEL", cls.log_level),
            license_server_url=os.getenv("LICENSE_SERVER_URL", cls.license_server_url),
        )
        # CLI 参数覆盖
        for key, value in kwargs.items():
            if value is not None and hasattr(config, key):
                setattr(config, key, value)
        return config
