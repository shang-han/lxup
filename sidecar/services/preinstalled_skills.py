"""
LXUP 预装通用工具技能 —— 出厂免费的文件处理技能（00-通用工具包）

数据源：skill-packs/skills/00-通用工具/（post.json + skills/*.SKILL.md + scripts/）

部署语义：「下载」= 把技能的 SKILL.md 与脚本拷进 OpenClaw agent 的 workspace
skills 目录（与 ClawHub 安装的技能同目录层级：<skills>/<id>/SKILL.md），
agent 随即真正可用；「卸载」= 删除该目录。
"""

import json
import logging
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

from .skills_scan import parse_skill_md, scan_skills

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
PACK_DIR = _PROJECT_ROOT / "skill-packs" / "skills" / "00-通用工具"

# Hermes 侧部署分类目录（hermes 布局：<skills>/<category>/<name>/SKILL.md）
HERMES_CATEGORY = "LXUP通用工具"


def hermes_skills_root() -> Path:
    """Hermes 技能目录（解析规则同 sidecar config：LXUP_HERMES_HOME 或 runtime/hermes-home）"""
    home = os.getenv("LXUP_HERMES_HOME") or str(_PROJECT_ROOT / "runtime" / "hermes-home")
    return Path(home) / "skills"


def _state_dir() -> Path:
    """OpenClaw 状态目录：优先 OPENCLAW_STATE_DIR 环境变量（启动器注入），否则 ~/.openclaw（网关默认）"""
    env = os.getenv("OPENCLAW_STATE_DIR")
    return Path(env) if env else Path.home() / ".openclaw"


def _skills_dir() -> Path:
    """部署目标：OpenClaw agent 的 workspace skills 目录。
    依次读 openclaw.json 的 agents.defaults.workspace、agents.list[].workspace
    （实际配置常把 workspace 挂在具体 agent 上，如 main），都没有才回退状态目录。"""
    state = _state_dir()
    try:
        cfg = json.loads((state / "openclaw.json").read_text(encoding="utf-8"))
        agents = cfg.get("agents") or {}
        ws = (agents.get("defaults") or {}).get("workspace")
        if not ws:
            for a in agents.get("list") or []:
                ws = (a or {}).get("workspace")
                if ws:
                    break
        if ws:
            return Path(ws) / "skills"
    except Exception:  # noqa: BLE001
        pass
    return state / "workspace" / "skills"


def _portable_python() -> str:
    """便携解释器（同启动脚本规则：runtime/python 下最后一个 cpython-*）；找不到时回退当前解释器"""
    base = _PROJECT_ROOT / "runtime" / "python"
    if base.is_dir():
        cands = sorted(d for d in base.iterdir() if d.name.startswith("cpython-"))
        if cands:
            exe = cands[-1] / "python.exe"
            if exe.is_file():
                return str(exe)
    return sys.executable


# requires 里的 PyPI 包名 → 实际 import 名
_IMPORT_NAMES = {"python-docx": "docx", "pillow": "PIL"}
_lib_cache: dict[str, bool] = {}


def _missing_libs(requires: list) -> list[str]:
    """用便携解释器真实 import 校验，返回缺失的库（进程级缓存：库不会凭空变化）"""
    missing: list[str] = []
    for lib in requires or []:
        key = str(lib).lower()
        if key not in _lib_cache:
            mod = _IMPORT_NAMES.get(key, str(lib))
            try:
                subprocess.run(
                    [_portable_python(), "-c", f"import {mod}"],
                    check=True, capture_output=True, timeout=30,
                )
                _lib_cache[key] = True
            except Exception:  # noqa: BLE001
                _lib_cache[key] = False
        if not _lib_cache[key]:
            missing.append(str(lib))
    return missing


def _post_skills() -> list[dict]:
    """post.json 的 skills 数组（file / name / scripts / triggers）"""
    try:
        post = json.loads((PACK_DIR / "post.json").read_text(encoding="utf-8"))
        skills = post.get("skills")
        return skills if isinstance(skills, list) else []
    except Exception:  # noqa: BLE001
        logger.warning("读取通用工具包 post.json 失败: %s", PACK_DIR)
        return []


def _skill_id(filename: str) -> str:
    """'01-PDF处理.SKILL.md' → 'PDF处理'（去序号前缀与扩展名，作部署目录名与接口 id）"""
    return re.sub(r"^\d+-", "", filename).removesuffix(".SKILL.md")


def _find(skill_id: str) -> dict:
    for s in _post_skills():
        if _skill_id(str(s.get("file", ""))) == skill_id:
            return s
    raise LookupError(skill_id)


def workspace_skills_dir() -> Path:
    """agent workspace skills 目录（ClawHub / 预装 / 下载的技能都部署在这里）"""
    return _skills_dir()


def scan_workspace_skills() -> list[dict]:
    """workspace 技能清单（ClawHub 实际安装的，布局与内置技能一致：<skills>/<slug>/SKILL.md）"""
    return scan_skills(_skills_dir())


def list_skills(lang: str = "zh") -> list[dict]:
    """预装技能清单（形状与 skills_scan.scan_skills 一致，另带 preinstalled/installed/scripts）
    lang 决定 status_note 提示语语言"""
    from ..i18n import tr
    skills_dir = _skills_dir()
    hermes_dir = hermes_skills_root() / HERMES_CATEGORY
    out: list[dict] = []
    for s in _post_skills():
        filename = str(s.get("file", ""))
        if not filename:
            continue
        sid = _skill_id(filename)
        meta = parse_skill_md(PACK_DIR / "skills" / filename)
        platform = meta.get("platform")
        requires = meta.get("requires") or []
        missing = _missing_libs(requires)
        out.append(
            {
                "id": sid,
                "name": str(meta.get("name") or s.get("name") or sid),
                "category": "通用工具",
                "description": str(meta.get("description") or ""),
                "version": str(meta.get("version") or "1.0.0"),
                "platforms": [platform] if platform else [],
                "tags": s.get("triggers") or [],
                "emoji": "🧰",
                "requires": requires,
                "homepage": "",
                "status": "missing" if missing else "available",
                "status_note": tr(lang, "missing_libs", libs=", ".join(missing)) if missing else "",
                "preinstalled": True,
                "installed": (skills_dir / sid).is_dir(),
                "installed_hermes": (hermes_dir / sid).is_dir(),
                "scripts": s.get("scripts") or [],
            }
        )
    return out


def read_content(skill_id: str) -> str:
    """SKILL.md 全文（供前端详情弹窗）"""
    s = _find(skill_id)
    return (PACK_DIR / "skills" / s["file"]).read_text(encoding="utf-8")


def _copy_to(s: dict, skill_id: str, dst: Path) -> None:
    """把单个预装技能（SKILL.md + 脚本）拷到指定部署目录"""
    dst_scripts = dst / "scripts"
    dst_scripts.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PACK_DIR / "skills" / s["file"], dst / "SKILL.md")
    for name in s.get("scripts") or []:
        src = PACK_DIR / "scripts" / name
        if src.is_file():
            shutil.copy2(src, dst_scripts / name)
        else:
            logger.warning("预装技能 %s 缺少脚本: %s", skill_id, src)


def install(skill_id: str) -> dict:
    """下载/部署（双引擎）：SKILL.md + 脚本同时拷入
    OpenClaw workspace skills/<id>/ 与 Hermes skills/LXUP通用工具/<id>/"""
    s = _find(skill_id)
    dst_oc = _skills_dir() / skill_id
    _copy_to(s, skill_id, dst_oc)
    dst_hm = hermes_skills_root() / HERMES_CATEGORY / skill_id
    _copy_to(s, skill_id, dst_hm)
    logger.info("预装技能已部署 %s → %s + %s", skill_id, dst_oc, dst_hm)
    return {"ok": True, "id": skill_id, "installed": True, "path": str(dst_oc), "hermes_path": str(dst_hm)}


def uninstall(skill_id: str) -> dict:
    """卸载：移除两个引擎的部署目录"""
    _find(skill_id)  # 校验技能存在
    for dst in (_skills_dir() / skill_id, hermes_skills_root() / HERMES_CATEGORY / skill_id):
        if dst.is_dir():
            shutil.rmtree(dst)
    logger.info("预装技能已卸载 %s（双引擎）", skill_id)
    return {"ok": True, "id": skill_id, "installed": False}


def fix_deps(skill_id: str, lang: str = "zh") -> dict:
    """一键补齐技能缺失的 PyPI 依赖：装进便携解释器（同 bootstrap-hermes.bat 的做法）。
    装完清除 import 缓存并重检，返回仍缺的库。"""
    from ..i18n import tr

    s = _find(skill_id)
    meta = parse_skill_md(PACK_DIR / "skills" / s["file"])
    requires = meta.get("requires") or []
    missing = _missing_libs(requires)
    if not missing:
        return {"ok": True, "id": skill_id, "installed": [], "still_missing": []}
    cmd = [
        _portable_python(), "-m", "pip", "install",
        "--break-system-packages", "--no-warn-script-location", *missing,
    ]
    logger.info("为预装技能 %s 安装依赖: %s", skill_id, " ".join(missing))
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout or "").strip()[-800:]
        raise RuntimeError(tr(lang, "pip_failed", tail=tail))
    for lib in missing:
        _lib_cache.pop(str(lib).lower(), None)
    still = _missing_libs(requires)
    return {"ok": not still, "id": skill_id, "installed": missing, "still_missing": still}
