"""
技能包扫描 —— 解析 skills/**/SKILL.md 的 YAML frontmatter

两个引擎的技能包布局：
  - OpenClaw: runtime/openclaw/node_modules/openclaw/skills/<name>/SKILL.md（扁平）
  - Hermes:   runtime/hermes-home/skills/<category>/<name>/SKILL.md（按分类）

统一用 rglob("SKILL.md") 扫描：category 取相对路径首段（扁平布局为空串）。
frontmatter 元数据兼容两种风格：
  - openclaw: metadata.openclaw.{emoji, requires.bins, install}
  - hermes:   metadata.hermes.{tags, related_skills} + version/platforms
"""

import logging
import re
import shutil
import sys
from pathlib import Path

import yaml

logger = logging.getLogger(__name__)


def parse_skill_md(path: Path) -> dict:
    """解析 SKILL.md 头部 YAML frontmatter（首个 --- 与下一行 --- 之间）。"""
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return {}
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    try:
        data = yaml.safe_load(text[3:end])
    except Exception as e:  # noqa: BLE001
        logger.debug("解析 SKILL.md frontmatter 失败 %s: %s", path, e)
        return {}
    return data if isinstance(data, dict) else {}


_PLATFORM_ALIASES = {"darwin": "macos", "osx": "macos", "win32": "windows", "cygwin": "windows"}


def classify_skill(skill: dict) -> tuple[str, str]:
    """按平台/命令依赖判定技能可用性：available / missing(缺命令) / disabled(平台不符)"""
    plats = [_PLATFORM_ALIASES.get(str(p).lower(), str(p).lower()) for p in skill.get("platforms") or []]
    if plats and _PLATFORM_ALIASES.get(sys.platform, sys.platform) not in plats:
        return "disabled", "仅支持 " + "/".join(plats)
    missing = [str(b) for b in (skill.get("requires") or []) if not shutil.which(str(b))]
    if missing:
        return "missing", "缺少命令: " + ", ".join(missing)
    return "available", ""


def parse_example(skill_md_text: str) -> str:
    """从 SKILL.md 的 `## 示例` 段抽取第一条「输入：…」作为试一下预填文本；无则空串"""
    m = re.search(r"^##\s*示例\s*$(.*?)(?=^##\s|\Z)", skill_md_text, re.M | re.S)
    if not m:
        return ""
    m2 = re.search(r"输入[：:]\s*[「『\"]?(.+?)[」』\"]?\s*$", m.group(1), re.M)
    return m2.group(1).strip() if m2 else ""


def scan_skills(root: Path) -> list[dict]:
    """扫描目录下所有 SKILL.md，返回归一化的技能清单。"""
    out: list[dict] = []
    if not root.is_dir():
        return out
    for md in sorted(root.rglob("SKILL.md")):
        try:
            rel = md.parent.relative_to(root)
        except ValueError:
            continue
        parts = rel.parts
        category = parts[0] if len(parts) > 1 else ""
        meta = parse_skill_md(md)

        raw_meta = meta.get("metadata")
        engine_meta: dict = raw_meta if isinstance(raw_meta, dict) else {}
        oc = engine_meta.get("openclaw")
        oc = oc if isinstance(oc, dict) else {}
        hm = engine_meta.get("hermes")
        hm = hm if isinstance(hm, dict) else {}

        requires = oc.get("requires")
        bins = requires.get("bins") if isinstance(requires, dict) else None

        out.append(
            {
                "id": f"{category + '/' if category else ''}{md.parent.name}",
                "name": str(meta.get("name") or md.parent.name),
                "category": category,
                "description": str(meta.get("description") or ""),
                "version": str(meta.get("version") or ""),
                "platforms": meta.get("platforms") or [],
                "tags": hm.get("tags") or [],
                "emoji": str(oc.get("emoji") or ""),
                "requires": bins if isinstance(bins, list) else [],
                "homepage": str(meta.get("homepage") or ""),
            }
        )
    return out
