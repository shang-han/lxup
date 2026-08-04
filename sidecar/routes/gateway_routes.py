"""
网关进程管理端点 — /api/gateway/*

供控制台仪表盘的「停止 / 启动 / 重启」按钮调用，由 Sidecar 管理受管的
OpenClaw 网关进程。

  GET    /api/gateway/status             网关是否可达 + PID
  POST   /api/gateway/start              启动网关
  POST   /api/gateway/stop               停止网关
  POST   /api/gateway/restart            重启网关
  GET    /api/gateway/skills             技能清单（内置 + workspace 已装 + 预装）
  GET    /api/gateway/skills/preinstalled/{id}          预装技能 SKILL.md 全文
  POST   /api/gateway/skills/preinstalled/{id}/install  部署预装技能到 agent workspace
  POST   /api/gateway/skills/preinstalled/{id}/fix-deps 一键补齐预装技能缺失的 PyPI 依赖
  DELETE /api/gateway/skills/preinstalled/{id}          卸载预装技能
  GET    /api/gateway/skills/packs       岗位技能包清单（76 个，含部署状态）
  GET    /api/gateway/skills/packs/{id}                 岗位包详情（post.json + 状态）
  GET    /api/gateway/skills/packs/{id}/skills/{file}   岗位包内 SKILL.md 全文
  POST   /api/gateway/skills/packs/{id}/install         整包部署到 agent workspace
  DELETE /api/gateway/skills/packs/{id}                 整包卸载
  DELETE /api/gateway/channels/{channel} 删除渠道账号配置（可带 ?account=）
"""

import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query, Request

from ..i18n import tr, ui_lang
from ..services import preinstalled_skills, skill_packs
from ..services.gateway_manager import GatewayManager
from ..services.skills_scan import classify_skill, parse_example, scan_skills

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gateway", tags=["gateway"])


def _manager(request: Request) -> GatewayManager:
    return request.app.state.gateway_manager


@router.get("/status")
async def gateway_status(request: Request) -> dict:
    """网关状态：是否可达 + 监听 PID"""
    return await _manager(request).status()


@router.post("/start")
async def gateway_start(request: Request) -> dict:
    """启动网关"""
    return await _manager(request).start()


@router.post("/stop")
async def gateway_stop(request: Request) -> dict:
    """停止网关"""
    return await _manager(request).stop()


@router.post("/restart")
async def gateway_restart(request: Request) -> dict:
    """重启网关"""
    return await _manager(request).restart()


@router.get("/skills")
async def gateway_skills(request: Request) -> dict:
    """技能清单：OpenClaw 内置（标真实可用性）+ workspace 已装（ClawHub）+ LXUP 预装通用工具"""
    lang = ui_lang(request)
    entry = Path(_manager(request)._oc_entry)
    root = entry.parent / "skills"
    bundled = scan_skills(root)
    ws_dir = preinstalled_skills.workspace_skills_dir()
    for s in bundled:
        s["status"], s["status_note"] = classify_skill(s, lang)
        s["installed"] = (ws_dir / s["id"]).is_dir()
    pack_dirs = skill_packs.deployed_by_dir("openclaw")
    preinstalled = preinstalled_skills.list_skills(lang)
    pre_ids = {p["id"] for p in preinstalled}
    workspace = preinstalled_skills.scan_workspace_skills()
    # 预装技能部署后也会出现在 workspace 扫描里，去重（以预装条目为准，带依赖状态）
    workspace = [s for s in workspace if s["id"] not in pre_ids]
    for s in workspace:
        # 部署目录名在注册表里 → 岗位包技能；否则视为 ClawHub 安装
        info = pack_dirs.get(s["id"]) or pack_dirs.get(s["id"].split("/", 1)[-1])
        if info:
            s["source_kind"] = "jobpack"
            s["pack_id"] = info["pack_id"]
            s["pack_name"] = info["pack_name"]
            s["pack_skill_file"] = info["file"]
        else:
            s["source_kind"] = "clawhub"
        s["installed"] = True
    data = bundled + workspace + preinstalled
    return {"data": data, "count": len(data), "root": str(root)}


@router.get("/skills/preinstalled/{skill_id}")
async def preinstalled_skill_content(request: Request, skill_id: str) -> dict:
    """预装技能 SKILL.md 全文（详情弹窗用）+ 试一下示例"""
    try:
        content = preinstalled_skills.read_content(skill_id)
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pre_not_found", id=skill_id))
    return {"id": skill_id, "content": content, "example": parse_example(content)}


@router.post("/skills/preinstalled/{skill_id}/install")
async def preinstalled_skill_install(request: Request, skill_id: str) -> dict:
    """下载/部署预装技能：SKILL.md + 脚本拷入 agent workspace skills 目录"""
    try:
        return preinstalled_skills.install(skill_id)
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pre_not_found", id=skill_id))
    except OSError as e:
        raise HTTPException(status_code=500, detail=tr(ui_lang(request), "deploy_failed", e=e))


@router.delete("/skills/preinstalled/{skill_id}")
async def preinstalled_skill_uninstall(request: Request, skill_id: str) -> dict:
    """卸载预装技能：移除 workspace skills 下的部署目录"""
    try:
        return preinstalled_skills.uninstall(skill_id)
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pre_not_found", id=skill_id))
    except OSError as e:
        raise HTTPException(status_code=500, detail=tr(ui_lang(request), "uninstall_failed", e=e))


@router.post("/skills/preinstalled/{skill_id}/fix-deps")
async def preinstalled_skill_fix_deps(request: Request, skill_id: str) -> dict:
    """一键补齐缺失依赖：便携 Python pip install（阻塞操作，转线程执行）"""
    try:
        return await asyncio.to_thread(preinstalled_skills.fix_deps, skill_id, ui_lang(request))
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pre_not_found", id=skill_id))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/skills/packs")
async def gateway_skill_packs() -> dict:
    """岗位技能包清单（76 个岗位包 + 部署状态）"""
    data = skill_packs.list_packs()
    return {"data": data, "count": len(data)}


@router.get("/skills/packs/{pack_id}")
async def gateway_skill_pack_detail(request: Request, pack_id: str) -> dict:
    """岗位包详情：post.json 全量 + 部署状态"""
    try:
        return skill_packs.pack_detail(pack_id)
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pack_not_found", id=pack_id))
    except OSError as e:
        raise HTTPException(status_code=500, detail=tr(ui_lang(request), "read_pack_failed", e=e))


@router.get("/skills/packs/{pack_id}/skills/{filename}")
async def gateway_skill_pack_skill_content(pack_id: str, filename: str) -> dict:
    """岗位包内 SKILL.md 全文（详情查看 / 试一下示例抽取）"""
    try:
        content = skill_packs.read_skill(pack_id, filename)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": pack_id, "file": filename, "content": content, "example": parse_example(content)}


@router.post("/skills/packs/{pack_id}/install")
async def gateway_skill_pack_install(request: Request, pack_id: str) -> dict:
    """整包部署：包内全部技能拷入 agent workspace skills 目录"""
    try:
        return await asyncio.to_thread(skill_packs.install_pack, pack_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except OSError as e:
        raise HTTPException(status_code=500, detail=tr(ui_lang(request), "deploy_failed", e=e))


@router.delete("/skills/packs/{pack_id}")
async def gateway_skill_pack_uninstall(request: Request, pack_id: str) -> dict:
    """整包卸载：移除注册表记录的部署目录"""
    try:
        return await asyncio.to_thread(skill_packs.uninstall_pack, pack_id)
    except LookupError:
        raise HTTPException(status_code=404, detail=tr(ui_lang(request), "pack_not_found", id=pack_id))
    except OSError as e:
        raise HTTPException(status_code=500, detail=tr(ui_lang(request), "uninstall_failed", e=e))


@router.delete("/channels/{channel}")
async def remove_channel(
    request: Request,
    channel: str,
    account: str | None = Query(default=None),
) -> dict:
    """删除渠道账号配置（openclaw channels remove --delete，经 CLI 执行）"""
    return await _manager(request).remove_channel(channel, account)
