"""
LXUP Codex 技能同步 —— 已装技能 → $CODEX_HOME/skills/ 原生技能目录 + AGENTS.md 指引

Codex 0.145 的用户级技能目录是 `$CODEX_HOME/skills/<名称>/SKILL.md`（按需渐进加载，
单技能正文 8KB 上限），而全局 AGENTS.md 常驻上下文且有 32KiB 上限——所以技能本体放
目录，AGENTS.md 只留紧凑清单做路由指引。sidecar 拉起 `codex exec` 时注入
CODEX_HOME=runtime/codex-home。

安全清理：只有本服务部署过的技能目录才会被移除（lxup-codex-skills.json 记录托管
名单），用户手工放进 skills/ 的其他技能一概不动。

触发时机：预装技能 install/uninstall、岗位包 install_pack/uninstall_pack
（调用方在部署完成后本地 import 调用 rebuild_agents），以及 sidecar 启动时对齐一次。
"""

import json
import logging
import os
import re
import shutil
from pathlib import Path

from . import preinstalled_skills
from .skills_scan import parse_skill_md

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]

_START = "<!-- LXUP-SKILLS-START -->"
_END = "<!-- LXUP-SKILLS-END -->"
_MAX_LIST = 80  # AGENTS.md 清单条数上限（32KiB 约束下留足余量）


def codex_home() -> Path:
    """CODEX_HOME（与 sidecar config 一致：LXUP_CODEX_HOME 或 runtime/codex-home）"""
    env = os.getenv("LXUP_CODEX_HOME")
    return Path(env) if env else _PROJECT_ROOT / "runtime" / "codex-home"


def agents_path() -> Path:
    return codex_home() / "AGENTS.md"


def skills_dir() -> Path:
    """Codex 用户级技能目录（$CODEX_HOME/skills/，Codex 0.145 原生读取）"""
    return codex_home() / "skills"


def _managed_file() -> Path:
    return codex_home() / "lxup-codex-skills.json"


def _managed_load() -> tuple[set, str]:
    """本服务部署过的技能目录名 + 部署来源 workspace（清理时只删自己部署的）"""
    try:
        data = json.loads(_managed_file().read_text(encoding="utf-8"))
        names = data.get("managed")
        ws = data.get("source_ws")
        return (set(names) if isinstance(names, list) else set()), str(ws or "")
    except Exception:  # noqa: BLE001
        return set(), ""


def _managed_save(names: set, source_ws: str) -> None:
    _managed_file().parent.mkdir(parents=True, exist_ok=True)
    _managed_file().write_text(
        json.dumps(
            {"managed": sorted(names), "source_ws": source_ws}, ensure_ascii=False, indent=2
        ),
        encoding="utf-8",
    )


def collect_installed() -> list[dict]:
    """已安装技能清单（技能目录同步与 /api/codex/skills 共用）。

    数据源：OpenClaw workspace 部署目录（预装直接检查目录；岗位包读部署注册表）。
    返回 [{id,name,desc,path,group,source_kind,pack_id,pack_name,pack_skill_file}]
    """
    items: list[dict] = []
    # resolve 成绝对路径：AGENTS.md 里的路径 Codex 可能从任意 --cd 目录读取
    ws = preinstalled_skills._skills_dir().resolve()

    # 预装通用工具：部署目录存在即为已装
    for s in preinstalled_skills._post_skills():
        filename = str(s.get("file") or "")
        if not filename:
            continue
        sid = preinstalled_skills._skill_id(filename)
        p = ws / sid / "SKILL.md"
        if not p.is_file():
            continue
        meta = parse_skill_md(p)
        items.append(
            {
                "id": sid,
                "name": str(meta.get("name") or s.get("name") or sid),
                "desc": str(meta.get("description") or "").splitlines()[0].strip(),
                "path": p,
                "group": "LXUP通用工具",
                "source_kind": "preinstalled",
                "pack_id": "",
                "pack_name": "",
                "pack_skill_file": "",
            }
        )

    # 岗位包技能：部署注册表为准
    from . import skill_packs  # 本地导入，避免模块级循环

    names = {str(x.get("id")): str(x.get("name") or "") for x in skill_packs._index()}
    reg = skill_packs._load_registry()
    for pid in sorted(reg):
        entry = reg.get(pid) or {}
        # 兼容旧注册表格式（早期安装用 "files" 键，后改为 openclaw/hermes 双引擎键）
        mapping = entry.get("openclaw") or entry.get("files") or {}
        for dirname, filename in mapping.items():
            p = ws / dirname / "SKILL.md"
            if not p.is_file():
                continue
            meta = parse_skill_md(p)
            items.append(
                {
                    "id": dirname,
                    "name": str(meta.get("name") or re.sub(r"^\d+-", "", filename).removesuffix(".SKILL.md")),
                    "desc": str(meta.get("description") or "").splitlines()[0].strip(),
                    "path": p,
                    "group": f"岗位包·{names.get(pid, pid)}",
                    "source_kind": "jobpack",
                    "pack_id": pid,
                    "pack_name": names.get(pid, ""),
                    "pack_skill_file": filename,
                }
            )
    return items


def sync_skills(installed: list[dict], wipe: bool = True, save_managed: bool = True) -> None:
    """把已装技能（SKILL.md + scripts）同步进 $CODEX_HOME/skills/。

    wipe=False 时只部署不清理（状态目录疑似错位时使用，防止误删）；
    save_managed=False 时不更新托管记录。"""
    sdir = skills_dir()
    managed, src_ws = _managed_load()
    want: set[str] = set()

    for it in installed:
        name = str(it["id"])
        want.add(name)
        src = Path(it["path"])
        dst = sdir / name
        dst.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst / "SKILL.md")
        src_scripts = src.parent / "scripts"
        if src_scripts.is_dir() and any(src_scripts.iterdir()):
            dst_scripts = dst / "scripts"
            if dst_scripts.is_dir():
                shutil.rmtree(dst_scripts)
            shutil.copytree(src_scripts, dst_scripts)

    removed = 0
    if wipe:
        for old in managed - want:
            d = sdir / old
            if d.is_dir():
                shutil.rmtree(d)
                removed += 1
    if save_managed and (want != managed or src_ws != str(preinstalled_skills._skills_dir().resolve())):
        _managed_save(want, str(preinstalled_skills._skills_dir().resolve()))
    if removed:
        logger.info("Codex 技能目录清理 %d 个已卸载技能", removed)


def _section(installed: list[dict]) -> str:
    """AGENTS.md 托管区块：紧凑清单做路由指引，技能本体在 skills/ 目录"""
    lines = [
        _START,
        "## 已安装技能（LXUP 自动维护，请勿手动编辑本区块）",
        "",
        f"技能以 SKILL.md 形式安装在 `{skills_dir()}` 目录下，按需渐进加载。",
        "需要用到某项技能时，读取对应 SKILL.md 全文，严格按其流程、模板与边界执行。",
        "",
    ]
    for it in installed[:_MAX_LIST]:
        desc = (it["desc"] or "").splitlines()[0][:60]
        lines.append(f"- **{it['name']}** — {desc}")
    if len(installed) > _MAX_LIST:
        lines.append(f"- …其余 {len(installed) - _MAX_LIST} 个技能见 `{skills_dir()}` 目录")
    lines += ["", _END]
    return "\n".join(lines)


def rebuild_agents() -> dict:
    """同步技能目录 + 重建 AGENTS.md 托管区块，与当前已装技能对齐。

    无技能时移除区块（文件因此变空则删除），托管目录同步清空。
    返回 {path, skills_dir, skills, changed}。"""
    installed = collect_installed()
    managed, src_ws = _managed_load()
    cur_ws = str(preinstalled_skills._skills_dir().resolve())
    # 防误清：有托管记录但来源 workspace 与当前不一致（OPENCLAW_STATE_DIR 错位或
    # workspace 切换）时，只部署不清理、不更新托管记录；已装解析为空则整次跳过
    mismatch = bool(managed) and bool(src_ws) and src_ws != cur_ws
    if mismatch:
        logger.warning(
            "Codex 技能同步：来源 workspace 不一致（记录 %s ≠ 当前 %s），按保守模式处理",
            src_ws,
            cur_ws,
        )
        if not installed:
            return {
                "path": str(agents_path()),
                "skills_dir": str(skills_dir()),
                "skills": len(managed),
                "changed": False,
                "skipped": True,
            }
    sync_skills(installed, wipe=not mismatch, save_managed=not mismatch)

    p = agents_path()
    old = ""
    if p.is_file():
        try:
            old = p.read_text(encoding="utf-8")
        except OSError:
            old = ""

    if _START in old and _END in old:
        body = old[: old.index(_START)] + old[old.index(_END) + len(_END):]
    else:
        body = old

    if installed:
        new = _section(installed)
        content = (body.rstrip() + "\n\n" if body.strip() else "") + new + "\n"
        if not body.strip():
            content = "# LXUP Codex 全局指令（AGENTS.md）\n\n" + content
    else:
        content = body
        if not content.strip():
            try:
                p.unlink(missing_ok=True)
            except OSError:
                pass
            return {"path": str(p), "skills_dir": str(skills_dir()), "skills": 0, "changed": old != content}
        content = content.rstrip() + "\n"

    changed = content != old
    if changed:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        logger.info("Codex AGENTS.md 已同步（%d 个技能）→ %s", len(installed), p)
    return {"path": str(p), "skills_dir": str(skills_dir()), "skills": len(installed), "changed": changed}
