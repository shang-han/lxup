"""
Hermes 路由 — 模型配置读写与网关状态探测

- 模型配置写入 Hermes 家目录的 config.yaml（model 段，provider=auto + base_url + api_key），
  Hermes 网关每次请求都会重读 config.yaml（热加载），保存后无需重启。
- 状态探测直接请求 Hermes 网关的 /health。
"""

import logging
from pathlib import Path

import httpx
import yaml
from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/hermes", tags=["hermes"])


# ── 工具 ──


def _config_path(request: Request) -> Path:
    home = getattr(request.app.state.config, "hermes_home", "") or "runtime/hermes-home"
    return Path(home) / "config.yaml"


def _gateway_url(request: Request) -> str:
    return (
        getattr(request.app.state.config, "hermes_gateway_url", "")
        or "http://127.0.0.1:8642"
    ).rstrip("/")


def _load_config(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        cfg = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except Exception as e:  # 配置损坏时不阻断，按空配置重建
        logger.warning("读取 hermes config.yaml 失败: %s", e)
        return {}
    return cfg if isinstance(cfg, dict) else {}


def _mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "****"
    return key[:3] + "****" + key[-4:]


# ── 请求模型 ──


class HermesModelRequest(BaseModel):
    """设置 Hermes 模型配置"""

    name: str = Field(default="", description="模型名，如 deepseek-chat")
    baseUrl: str = Field(default="", description="OpenAI 兼容接口基址，如 https://api.deepseek.com/v1")
    apiKey: str = Field(default="", description="API Key；留空或为打码值时保留原有 Key")


# ── 端点 ──


@router.get("/model")
async def get_model(request: Request):
    """读取当前 Hermes 模型配置（Key 打码返回）"""
    cfg = _load_config(_config_path(request))
    model = cfg.get("model") or {}
    if not isinstance(model, dict):
        model = {}
    api_key = str(model.get("api_key") or "")
    return {
        "name": str(model.get("name") or ""),
        "baseUrl": str(model.get("base_url") or ""),
        "provider": str(model.get("provider") or "auto"),
        "apiKey": _mask_key(api_key),
        "hasKey": bool(api_key),
    }


@router.post("/model")
async def set_model(request: Request, body: HermesModelRequest):
    """保存 Hermes 模型配置（写入 config.yaml，Hermes 热加载，无需重启）"""
    path = _config_path(request)
    path.parent.mkdir(parents=True, exist_ok=True)

    cfg = _load_config(path)
    model = cfg.get("model")
    if not isinstance(model, dict):
        model = {}

    # apiKey 留空或为打码值 → 保留原 Key
    old_key = str(model.get("api_key") or "")
    new_key = (body.apiKey or "").strip()
    if new_key and "****" not in new_key:
        model["api_key"] = new_key
    elif old_key:
        model["api_key"] = old_key

    if body.name.strip():
        model["name"] = body.name.strip()
    if body.baseUrl.strip():
        model["base_url"] = body.baseUrl.strip()
    # provider=auto + base_url + api_key → Hermes 走 OpenAI 兼容直连
    model.setdefault("provider", "auto")

    cfg["model"] = model
    path.write_text(
        yaml.safe_dump(cfg, allow_unicode=True, sort_keys=False),
        encoding="utf-8",
    )
    logger.info("Hermes 模型配置已更新: model=%s baseUrl=%s", model.get("name"), model.get("base_url"))
    return {
        "success": True,
        "name": str(model.get("name") or ""),
        "baseUrl": str(model.get("base_url") or ""),
        "hasKey": bool(model.get("api_key")),
    }


@router.get("/status")
async def status(request: Request):
    """探测 Hermes 网关是否在线（GET /health）"""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{_gateway_url(request)}/health")
            if r.status_code == 200:
                data = r.json()
                return {
                    "online": True,
                    "version": str(data.get("version") or ""),
                    "platform": str(data.get("platform") or ""),
                }
    except Exception:
        pass
    return {"online": False, "version": "", "platform": ""}
