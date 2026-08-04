"""
Hermes 路由 — 模型配置读写与网关状态探测

- 模型配置写入 Hermes 家目录的 config.yaml（model 段，provider=auto + base_url + api_key），
  Hermes 网关每次请求都会重读 config.yaml（热加载），保存后无需重启。
- 状态探测直接请求 Hermes 网关的 /health。
"""

import asyncio
import json
import logging
import os
import re
import subprocess
from pathlib import Path

import httpx
import yaml
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field

from ..i18n import tr, ui_lang
from ..services import preinstalled_skills, skill_packs
from ..services.hermes_manager import PROJECT_ROOT
from ..services.preinstalled_skills import _portable_python
from ..services.skills_scan import classify_skill, scan_skills

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


@router.get("/skills/all")
async def hermes_skills_all(request: Request):
    """Hermes 技能页清单（与 /api/gateway/skills 同形状）：
    Hermes 内置（标真实可用性）+ LXUP 岗位包部署 + LXUP 预装通用工具"""
    root = _hermes_home_dir(request) / "skills"
    builtin: list[dict] = []
    jobpack_items: list[dict] = []
    pack_dirs = skill_packs.deployed_by_dir("hermes")
    for s in scan_skills(root):
        cat = s.get("category") or ""
        if cat == preinstalled_skills.HERMES_CATEGORY:
            continue  # 预装技能以 list_skills() 条目为准（带依赖状态）
        s["status"], s["status_note"] = classify_skill(s)
        s["installed"] = True
        if cat == skill_packs.HERMES_CATEGORY:
            info = pack_dirs.get(s["id"].split("/", 1)[-1])
            if info:
                s["source_kind"] = "jobpack"
                s["pack_id"] = info["pack_id"]
                s["pack_name"] = info["pack_name"]
                s["pack_skill_file"] = info["file"]
            jobpack_items.append(s)
        else:
            builtin.append(s)
    # 预装条目：installed 换成 Hermes 侧部署状态
    preinstalled = preinstalled_skills.list_skills()
    for p in preinstalled:
        p["installed"] = p.pop("installed_hermes", False)
    data = builtin + jobpack_items + preinstalled
    return {"data": data, "count": len(data), "root": str(root)}


@router.get("/skills/entries")
async def hermes_skills_entries(request: Request):
    """Hermes 技能启用状态：config.yaml skills.disabled → {技能名: {enabled}}"""
    cfg = _load_config(_config_path(request))
    disabled = {str(n) for n in ((cfg.get("skills") or {}).get("disabled") or [])}
    root = _hermes_home_dir(request) / "skills"
    return {s["name"]: {"enabled": s["name"] not in disabled} for s in scan_skills(root)}


class HermesSkillToggle(BaseModel):
    """启用/停用单个 Hermes 技能"""

    name: str = Field(description="技能名（SKILL.md frontmatter name）")
    enabled: bool = True


@router.post("/skills/toggle")
async def hermes_skills_toggle(request: Request, body: HermesSkillToggle):
    """启用/停用 Hermes 技能：写 config.yaml skills.disabled（Hermes 热加载生效）"""
    path = _config_path(request)
    cfg = _load_config(path)
    skills_cfg = cfg.setdefault("skills", {})
    disabled = [str(n) for n in (skills_cfg.get("disabled") or [])]
    if body.enabled:
        disabled = [n for n in disabled if n != body.name]
    elif body.name not in disabled:
        disabled.append(body.name)
    if disabled:
        skills_cfg["disabled"] = disabled
    else:
        skills_cfg.pop("disabled", None)
        if not skills_cfg:
            cfg.pop("skills", None)  # 不在 config.yaml 里留空段
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(cfg, allow_unicode=True, sort_keys=False), encoding="utf-8")
    logger.info("Hermes 技能%s: %s", "启用" if body.enabled else "停用", body.name)
    return {"ok": True, "name": body.name, "enabled": body.enabled}


class HermesModelProbeRequest(BaseModel):
    """连通性探测：表单值优先，打码/留空的 Key 回落到 config.yaml 真实 Key"""

    baseUrl: str = ""
    apiKey: str = ""


@router.post("/model/probe")
async def probe_model(request: Request, body: HermesModelProbeRequest) -> dict:
    """服务端探测 OpenAI 兼容端点 GET {baseUrl}/models。
    浏览器直连有两个坑：拿不到真实 Key（打码值）、跨域 CORS；故由 Sidecar 代探。"""
    cfg = _load_config(_config_path(request))
    model = cfg.get("model") or {}
    base = (body.baseUrl or "").strip().rstrip("/") or str(model.get("base_url") or "")
    if not base:
        return {"ok": False, "error": tr(ui_lang(request), "missing_base_url"), "models": []}
    key = (body.apiKey or "").strip()
    if not key or "****" in key:
        key = str(model.get("api_key") or "")
    headers = {"Authorization": f"Bearer {key}"} if key else {}
    try:
        r = httpx.get(f"{base}/models", headers=headers, timeout=10)
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": tr(ui_lang(request), "network_error", e=e), "models": []}
    if r.status_code >= 400:
        return {"ok": False, "error": f"HTTP {r.status_code}", "models": []}
    try:
        data = r.json()
        items = data.get("data") if isinstance(data, dict) else None
        models = [str(m.get("id") or m.get("name") or "") for m in (items or []) if isinstance(m, dict)]
        models = [m for m in models if m]
    except Exception:  # noqa: BLE001
        models = []
    return {"ok": True, "error": "", "models": models}


# ── Hermes 技能市场（Skills Hub）桥接 ──


def _run_hermes_skills_cli(home: Path, args: list[str], timeout: int) -> subprocess.CompletedProcess:
    """子进程跑 `hermes skills <args>`（与启动器同环境：便携 Python + hermes-libs + HERMES_HOME）"""
    root = Path(PROJECT_ROOT)
    env = dict(os.environ)
    env["HERMES_HOME"] = str(home)
    env["PYTHONPATH"] = str(root / "runtime" / "hermes-libs")
    return subprocess.run(
        [_portable_python(), "-m", "hermes_cli.main", "skills", *args],
        cwd=str(root), env=env, capture_output=True, text=True, timeout=timeout,
    )


@router.get("/hub/search")
async def hermes_hub_search(
    request: Request,
    query: str = Query(min_length=1),
    limit: int = Query(default=15, ge=1, le=50),
) -> dict:
    """Hermes 技能市场搜索（多源聚合：official/GitHub taps/ClawHub/lobehub；需联网）"""
    home = _hermes_home_dir(request)

    def _run():
        proc = _run_hermes_skills_cli(home, ["search", query, "--json", "--limit", str(limit)], timeout=90)
        out = (proc.stdout or "").strip()
        start = out.find("[")
        if proc.returncode != 0 or start < 0:
            detail = ((proc.stderr or "") + "\n" + out).strip()[-500:]
            raise RuntimeError(detail or f"exit {proc.returncode}")
        return json.loads(out[start:])

    try:
        results = await asyncio.to_thread(_run)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=tr(ui_lang(request), "hub_search_failed", e=e))
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail=tr(ui_lang(request), "search_timeout"))
    return {"results": results, "count": len(results)}


class HubInstallRequest(BaseModel):
    """从 Hermes 技能市场安装技能"""

    identifier: str = Field(description="技能标识，如 openai/skills/skill-creator 或 SKILL.md 直链")
    source: str = Field(default="", description="搜索结果里的来源（clawhub / skills.sh / official / github）")


# 无斜杠的短标识符会触发 CLI 的交互式消歧（非 TTY 下静默失败），
# 按来源补前缀变成完整标识符即可直达
_SOURCE_PREFIX = {"clawhub": "clawhub", "skills.sh": "skills-sh", "official": "official", "github": "github"}


@router.post("/hub/install")
async def hermes_hub_install(request: Request, body: HubInstallRequest) -> dict:
    """安装市场技能：hermes skills install --yes（安装过程自带安全扫描；装入 hermes-home/skills）"""
    home = _hermes_home_dir(request)
    identifier = body.identifier.strip()
    if "/" not in identifier:
        prefix = _SOURCE_PREFIX.get(body.source.lower())
        if prefix:
            identifier = f"{prefix}/{identifier}"

    def _run():
        return _run_hermes_skills_cli(home, ["install", identifier, "--yes"], timeout=300)

    try:
        proc = await asyncio.to_thread(_run)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail=tr(ui_lang(request), "install_timeout"))
    out = ((proc.stdout or "") + "\n" + (proc.stderr or "")).strip()
    # CLI 失败时也可能返回 0（do_install 打印错误后正常退出），按输出兜底判定
    failed = proc.returncode != 0 or re.search(r"(?im)^\s*Error:|Could not fetch|BLOCKED", out)
    if failed:
        raise HTTPException(status_code=502, detail=tr(ui_lang(request), "install_failed", e=out[-500:]))
    logger.info("Hermes 技能市场已安装: %s", identifier)
    return {"ok": True, "identifier": identifier, "output": out[-800:]}


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
        return {"success": False, "message": tr(ui_lang(request), "yaml_invalid", detail=e)}
    p = _config_path(request)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(body.content, encoding="utf-8")
    return {"success": True, "message": tr(ui_lang(request), "saved_hot_reload")}


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
    return {"success": True, "message": tr(ui_lang(request), "saved_restart")}


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
