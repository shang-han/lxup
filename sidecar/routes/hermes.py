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

from ..services.hermes_manager import PROJECT_ROOT
from ..services.skills_scan import scan_skills

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/hermes", tags=["hermes"])


# ── 工具 ──


def _hermes_home_dir(request: Request) -> Path:
    home = getattr(request.app.state.config, "hermes_home", "") or "runtime/hermes-home"
    return Path(home)


def _config_path(request: Request) -> Path:
    return _hermes_home_dir(request) / "config.yaml"


def _gateway_url(request: Request) -> str:
    return (
        getattr(request.app.state.config, "hermes_gateway_url", "")
        or "http://127.0.0.1:8642"
    ).rstrip("/")


def _manager(request: Request):
    return request.app.state.hermes_manager


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


@router.get("/skills")
async def list_skills(request: Request):
    """Hermes 技能包清单（扫描 hermes-home/skills/**/SKILL.md 的 frontmatter）"""
    root = _hermes_home_dir(request) / "skills"
    data = scan_skills(root)
    return {"data": data, "count": len(data), "root": str(root)}


@router.get("/status")
async def status(request: Request):
    """Hermes 网关状态：在线/已安装/PID/家目录 + 版本（探测 /health）"""
    st = await _manager(request).status()
    out = {
        "online": st["running"],
        "running": st["running"],
        "pid": st["pid"],
        "port": st["port"],
        "installed": st["installed"],
        "homeDir": st["hermes_home"],
        "version": "",
        "platform": "",
    }
    if st["running"]:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                r = await client.get(f"{_gateway_url(request)}/health")
                if r.status_code == 200:
                    data = r.json()
                    out["version"] = str(data.get("version") or "")
                    out["platform"] = str(data.get("platform") or "")
        except Exception:
            pass
    return out


@router.post("/start")
async def start(request: Request):
    """启动 Hermes 网关（便携 Python + vendored 源码）"""
    return await _manager(request).start()


@router.post("/stop")
async def stop(request: Request):
    """停止 Hermes 网关"""
    return await _manager(request).stop()


@router.post("/restart")
async def restart(request: Request):
    """重启 Hermes 网关"""
    return await _manager(request).restart()


# ── config.yaml 原始读写 ──


class ConfigWriteRequest(BaseModel):
    content: str = Field(default="", description="config.yaml 原始 YAML 文本")


@router.get("/config")
async def get_config(request: Request):
    """读取 config.yaml 原始内容"""
    p = _config_path(request)
    content = p.read_text(encoding="utf-8") if p.exists() else ""
    return {"content": content, "path": str(p)}


@router.post("/config")
async def set_config(request: Request, body: ConfigWriteRequest):
    """保存 config.yaml（先校验 YAML；Hermes 热加载生效）"""
    try:
        yaml.safe_load(body.content)
    except Exception as e:
        return {"success": False, "message": f"YAML 格式错误：{e}"}
    p = _config_path(request)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(body.content, encoding="utf-8")
    return {"success": True, "message": "已保存，Hermes 热加载生效"}


# ── .env 键值读写 ──


class EnvVar(BaseModel):
    name: str = ""
    value: str = ""


class EnvWriteRequest(BaseModel):
    vars: list[EnvVar] = Field(default_factory=list)


@router.get("/env")
async def get_env(request: Request):
    """读取 .env 的自定义变量"""
    p = _hermes_home_dir(request) / ".env"
    vars_list: list[dict] = []
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            k, _, v = s.partition("=")
            vars_list.append({"name": k.strip(), "value": v.strip()})
    return {"vars": vars_list, "path": str(p)}


@router.post("/env")
async def set_env(request: Request, body: EnvWriteRequest):
    """保存 .env（下次网关重启生效）"""
    p = _hermes_home_dir(request) / ".env"
    lines = []
    for v in body.vars or []:
        name = (v.name or "").strip()
        if not name:
            continue
        lines.append(f"{name}={v.value}")
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
    return {"success": True, "message": "已保存（下次网关重启生效）"}


# ── 日志列表 / 内容 ──


def _log_dirs(request: Request) -> list[Path]:
    return [
        _hermes_home_dir(request) / "logs",
        Path(PROJECT_ROOT) / "runtime" / "logs",
    ]


def _resolve_log_path(request: Request, name: str) -> Path | None:
    """只允许 basename，杜绝路径穿越；在日志目录中查找"""
    base = (name or "").strip()
    if not base or base in (".", "..") or "/" in base or "\\" in base:
        return None
    for d in _log_dirs(request):
        candidate = d / base
        if candidate.is_file():
            return candidate
    return None


@router.get("/logs")
async def list_logs(request: Request):
    """列出日志文件（hermes-home/logs + runtime/logs）"""
    files: dict[str, dict] = {}
    for d in _log_dirs(request):
        if not d.is_dir():
            continue
        for f in d.glob("*.log"):
            if f.name in files:
                continue
            try:
                st = f.stat()
                files[f.name] = {"name": f.name, "size": st.st_size, "modified": int(st.st_mtime)}
            except OSError:
                continue
    out = sorted(files.values(), key=lambda x: x["modified"], reverse=True)
    return {"files": out}


@router.get("/logs/content")
async def log_content(request: Request, file: str, lines: int = 200):
    """读取日志文件尾部若干行"""
    p = _resolve_log_path(request, file)
    if p is None:
        return {"name": file, "lines": []}
    try:
        all_lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        all_lines = []
    n = max(1, min(int(lines or 200), 5000))
    return {"name": p.name, "lines": all_lines[-n:]}
