"""
LXUP 岗位技能包 —— 76 个付费岗位包的清单 / 部署 / 卸载 / 全文阅读

数据源：skill-packs/76-posts.json（岗位总表）+ skill-packs/skills/<dir>/
（post.json + skills/*.SKILL.md；岗位包均为纯提示词技能，无脚本、无 PyPI 依赖）

部署语义：「装到工作台」= 整包一键部署 —— 把包内每个技能的 SKILL.md 拷进
OpenClaw agent workspace skills 目录，目录名 `<pack_id>-<技能名>`（与 ClawHub
安装的技能同层级，openclaw 的技能 watcher 会在下个 agent turn 自动加载）；
部署记录写入注册表 <OPENCLAW_STATE_DIR>/lxup-skill-deploys.json，
供整包卸载与「已安装」状态展示。
"""

import json
import logging
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

from .preinstalled_skills import _state_dir, hermes_skills_root, workspace_skills_dir
from .skills_scan import parse_example

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_PACKS_ROOT = _PROJECT_ROOT / "skill-packs"
_INDEX_FILE = _PACKS_ROOT / "76-posts.json"

# Hermes 侧部署分类目录（hermes 布局：<skills>/<category>/<name>/SKILL.md）
HERMES_CATEGORY = "LXUP岗位包"


def _registry_path() -> Path:
    """部署注册表：{pack_id: {"openclaw": {部署目录名: 源文件名},
    "hermes": {部署目录名: 源文件名}, "installed_at": iso8601}}"""
    return _state_dir() / "lxup-skill-deploys.json"


def _load_registry() -> dict:
    try:
        data = json.loads(_registry_path().read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def _save_registry(reg: dict) -> None:
    _registry_path().parent.mkdir(parents=True, exist_ok=True)
    _registry_path().write_text(
        json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def _index() -> list[dict]:
    """76-posts.json 的 posts 数组（id/name/industry/category/priority/locked/dir）"""
    try:
        data = json.loads(_INDEX_FILE.read_text(encoding="utf-8"))
        posts = data.get("posts")
        return posts if isinstance(posts, list) else []
    except Exception:  # noqa: BLE001
        logger.warning("读取岗位总表失败: %s", _INDEX_FILE)
        return []


def _find_post(pack_id: str) -> dict:
    for p in _index():
        if str(p.get("id")) == str(pack_id):
            return p
    raise LookupError(pack_id)


def _pack_dir(pack_id: str) -> Path:
    post = _find_post(pack_id)
    d = _PACKS_ROOT / str(post.get("dir") or "")
    if not d.is_dir():
        raise LookupError(f"岗位包目录不存在: {d}")
    return d


def _skill_name(filename: str) -> str:
    """'01-门店日报周报生成.SKILL.md' → '门店日报周报生成'（去序号前缀与扩展名）"""
    return re.sub(r"^\d+-", "", filename).removesuffix(".SKILL.md")


def _deploy_dir_name(pack_id: str, filename: str) -> str:
    """部署目录名 `<pack_id>-<技能名>`：跨包唯一，卸载按注册表精确删除"""
    return f"{pack_id}-{_skill_name(filename)}"


def list_packs() -> list[dict]:
    """岗位包清单（供商店列表）：总表字段 + 部署状态"""
    reg = _load_registry()
    out: list[dict] = []
    for p in _index():
        pid = str(p.get("id"))
        entry = reg.get(pid) or {}
        out.append(
            {
                "id": pid,
                "name": str(p.get("name") or ""),
                "icon": str(p.get("icon") or ""),
                "industry": str(p.get("industry") or ""),
                "category": str(p.get("category") or ""),
                "priority": str(p.get("priority") or ""),
                "locked": bool(p.get("locked", True)),
                "skills": p.get("skills") or 0,
                "dir": str(p.get("dir") or ""),
                "installed": bool(entry.get("openclaw") or entry.get("hermes")),
                "installed_at": entry.get("installed_at") or "",
            }
        )
    return out


def pack_detail(pack_id: str) -> dict:
    """岗位包详情：post.json 全量（描述/技能清单/知识条目）+ 部署状态"""
    d = _pack_dir(pack_id)
    post = json.loads((d / "post.json").read_text(encoding="utf-8"))
    entry = _load_registry().get(str(pack_id)) or {}
    return {
        "id": str(pack_id),
        "installed": bool(entry.get("openclaw") or entry.get("hermes")),
        "installed_at": entry.get("installed_at") or "",
        "post": post,
    }


def read_skill(pack_id: str, filename: str) -> str:
    """包内单个 SKILL.md 全文（详情弹窗 / 试一下示例抽取用）。
    filename 只接受 `*.SKILL.md` 纯文件名，拒绝任何路径成分。"""
    if not re.fullmatch(r"[^\\/]+\.SKILL\.md", filename or ""):
        raise LookupError(f"非法技能文件名: {filename}")
    path = _pack_dir(pack_id) / "skills" / filename
    if not path.is_file():
        raise LookupError(f"技能不存在: {pack_id}/{filename}")
    return path.read_text(encoding="utf-8")


def install_pack(pack_id: str) -> dict:
    """整包部署：包内全部技能的 SKILL.md → <workspace skills>/<pack_id>-<技能名>/"""
    d = _pack_dir(pack_id)
    post = json.loads((d / "post.json").read_text(encoding="utf-8"))
    skills = post.get("skills") or []
    if not skills:
        raise LookupError(f"岗位包无技能: {pack_id}")
    # 双引擎部署：OpenClaw workspace skills/ 与 Hermes skills/LXUP岗位包/（三引擎共享）
    target_oc = workspace_skills_dir()
    target_hm = hermes_skills_root() / HERMES_CATEGORY
    target_oc.mkdir(parents=True, exist_ok=True)
    target_hm.mkdir(parents=True, exist_ok=True)
    files: dict[str, str] = {}
    for s in skills:
        filename = str(s.get("file") or "")
        src = d / "skills" / filename
        if not src.is_file():
            logger.warning("岗位包 %s 缺少技能文件: %s", pack_id, src)
            continue
        name = _deploy_dir_name(str(pack_id), filename)
        for target in (target_oc, target_hm):
            dst = target / name
            dst.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst / "SKILL.md")
            # 岗位包目前均为纯提示词技能；若未来带脚本，post.json skills[] 会声明 scripts
            for script in s.get("scripts") or []:
                sp = d / "scripts" / str(script)
                if sp.is_file():
                    (dst / "scripts").mkdir(exist_ok=True)
                    shutil.copy2(sp, dst / "scripts" / sp.name)
        files[name] = filename
    reg = _load_registry()
    reg[str(pack_id)] = {
        "openclaw": dict(files),
        "hermes": dict(files),
        "installed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    _save_registry(reg)
    logger.info("岗位包已部署 %s（%d 个技能）→ OpenClaw + Hermes", pack_id, len(files))
    return {"ok": True, "id": str(pack_id), "installed": True, "skills": len(files), "dirs": list(files)}


def uninstall_pack(pack_id: str) -> dict:
    """整包卸载：删除两个引擎中注册表记录的部署目录"""
    _find_post(pack_id)  # 校验包存在
    reg = _load_registry()
    entry = reg.pop(str(pack_id), None) or {}
    targets = {"openclaw": workspace_skills_dir(), "hermes": hermes_skills_root() / HERMES_CATEGORY}
    for engine, target in targets.items():
        for name in entry.get(engine) or {}:
            dst = target / name
            if dst.is_dir():
                shutil.rmtree(dst)
    _save_registry(reg)
    logger.info("岗位包已卸载 %s（双引擎）", pack_id)
    return {"ok": True, "id": str(pack_id), "installed": False}


def deployed_by_dir(engine: str = "openclaw") -> dict:
    """部署目录名 → {pack_id, pack_name, file}（按引擎视图标记技能来源用）"""
    out: dict = {}
    names = {str(p.get("id")): str(p.get("name") or "") for p in _index()}
    for pid, entry in _load_registry().items():
        for name, filename in (entry.get(engine) or {}).items():
            out[name] = {"pack_id": pid, "pack_name": names.get(pid, ""), "file": filename}
    return out
