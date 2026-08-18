"""
Codex 路由 —— 状态 / 配置 / 会话 / 流式对话（SSE）

Codex 无网关，全部经 Sidecar 桥接：对话时由 CodexManager 拉起
`codex exec --json` 子进程，NDJSON 事件流以 SSE（命名事件）推给前端，
事件词表与 Hermes api_server 对齐（assistant.delta / tool.started /
tool.completed / tool.failed / error / done），前端 CodexChatEngine
与 HermesChatEngine 共用同一套映射。

端点:
  GET  /api/codex/status                    安装状态/版本/Key/会话数
  GET  /api/codex/config                    读取配置（Key 打码）
  POST /api/codex/config                    保存配置（写入 codex-home）
  GET  /api/codex/skills                   技能视图（预装+岗位包，经 AGENTS.md 生效）
  GET  /api/codex/sessions                  会话列表
  POST /api/codex/sessions                  新建会话
  DELETE /api/codex/sessions/{sid}          删除会话
  GET  /api/codex/sessions/{sid}/messages   历史消息
  POST /api/codex/sessions/{sid}/chat/stream  流式对话（SSE）
"""

import asyncio
import json
import logging

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/codex", tags=["codex"])


def _manager(request: Request):
    return request.app.state.codex_manager


# ── 请求模型 ──


class CodexConfigRequest(BaseModel):
    model: str = Field(default="", description="模型名，如 gpt-5-codex")
    approvalPolicy: str = Field(default="", description="untrusted / on-request / never")
    sandboxMode: str = Field(
        default="", description="read-only / workspace-write / danger-full-access"
    )
    apiKey: str = Field(default="", description="OPENAI_API_KEY；留空或为打码值时保留原 Key")
    workspace: str = Field(default="", description="默认工作目录（exec --cd）")
    baseUrl: str | None = Field(
        default=None,
        description="三方 OpenAI 兼容 Base URL。三态：None=不改动（字段缺席）；"
        "空字符串=恢复官方接口；非空=写入自定义 provider",
    )


class ChatRequest(BaseModel):
    content: str = Field(default="", description="用户消息")
    workspace: str = Field(default="", description="本轮工作目录覆盖（可选）")


class MarketplaceBody(BaseModel):
    source: str = Field(default="", description="Git 仓库地址或本地目录路径")


class PluginInstallBody(BaseModel):
    plugin: str = Field(default="", description="插件名")
    marketplace: str = Field(default="", description="所属市场名（可选）")


# ── 状态 / 配置 ──


@router.get("/status")
async def status(request: Request):
    """Codex 安装状态：二进制/版本/Key/会话数"""
    return await _manager(request).status()


@router.get("/config")
async def get_config(request: Request):
    """读取 Codex 配置（API Key 打码返回）"""
    return _manager(request).get_config_view()


@router.post("/config")
async def set_config(request: Request, body: CodexConfigRequest):
    """保存 Codex 配置（config.toml + auth.json，Key 打码保护）"""
    try:
        return _manager(request).save_config_view(body.model_dump())
    except Exception as e:  # noqa: BLE001
        logger.exception("保存 Codex 配置失败")
        return {"success": False, "message": str(e)}


# ── 技能（经 AGENTS.md 生效，无原生技能目录）──


@router.get("/skills")
async def codex_skills(request: Request) -> dict:
    """Codex 技能视图：预装通用工具（含安装状态，可装/卸）+ 已装岗位包技能 + AGENTS.md 状态。
    安装/卸载复用 /api/gateway/skills/* 端点，装完自动同步 codex-home/AGENTS.md。"""
    from ..i18n import ui_lang
    from ..services import codex_skills, preinstalled_skills

    lang = ui_lang(request)
    data = []
    for s in preinstalled_skills.list_skills(lang):
        s["source_kind"] = ""
        data.append(s)
    installed = codex_skills.collect_installed()
    for it in installed:
        if it["source_kind"] != "jobpack":
            continue
        data.append(
            {
                "id": it["id"],
                "name": it["name"],
                "description": it["desc"],
                "version": "",
                "platforms": [],
                "tags": [],
                "requires": [],
                "status": "available",
                "status_note": "",
                "preinstalled": False,
                "installed": True,
                "source_kind": "jobpack",
                "pack_id": it["pack_id"],
                "pack_name": it["pack_name"],
                "pack_skill_file": it["pack_skill_file"],
            }
        )
    agents = codex_skills.agents_path()
    return {
        "data": data,
        "agents": {
            "path": str(agents),
            "exists": agents.is_file(),
            "skills": len(installed),
            "skills_dir": str(codex_skills.skills_dir()),
        },
    }


# ── 插件市场（桥接 codex plugin 命令，需联网/本地路径）──


def _parse_marketplaces(out: str) -> list[dict]:
    """解析 `codex plugin marketplace list` 表格输出 → [{name, root}]"""
    rows = []
    for ln in (out or "").splitlines():
        ln = ln.strip()
        if not ln or ln.upper().startswith("MARKETPLACE"):
            continue
        parts = ln.split(None, 1)
        if not parts:
            continue
        rows.append({"name": parts[0], "root": parts[1] if len(parts) > 1 else ""})
    return rows


@router.get("/plugins/marketplaces")
async def plugin_marketplaces(request: Request) -> dict:
    """已配置的插件市场（codex plugin marketplace list）"""
    r = await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "marketplace", "list"])
    r["marketplaces"] = _parse_marketplaces(r.get("stdout") or "")
    return r


@router.post("/plugins/marketplaces")
async def plugin_marketplace_add(request: Request, body: MarketplaceBody) -> dict:
    """添加插件市场（Git 仓库地址或本地目录）"""
    src = (body.source or "").strip()
    if not src:
        return {"ok": False, "code": -1, "stdout": "", "stderr": "市场地址为空"}
    return await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "marketplace", "add", src], 300)


@router.post("/plugins/marketplaces/{name}/upgrade")
async def plugin_marketplace_upgrade(request: Request, name: str) -> dict:
    """刷新市场快照（重新拉取 Git 市场）"""
    return await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "marketplace", "upgrade", name], 300)


@router.delete("/plugins/marketplaces/{name}")
async def plugin_marketplace_remove(request: Request, name: str) -> dict:
    """移除市场源"""
    return await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "marketplace", "remove", name])


@router.get("/plugins")
async def plugins_list(request: Request) -> dict:
    """插件清单：available（市场快照中可选）+ installed（已装）"""
    r = await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "list", "--json"])
    try:
        parsed = json.loads(r.get("stdout") or "{}")
        r["plugins"] = parsed if isinstance(parsed, dict) else {"installed": [], "available": []}
    except Exception:  # noqa: BLE001
        r["plugins"] = {"installed": [], "available": []}
    return r


@router.post("/plugins/install")
async def plugin_install(request: Request, body: PluginInstallBody) -> dict:
    """安装插件：plugin add PLUGIN[@MARKETPLACE]"""
    name = (body.plugin or "").strip()
    if not name:
        return {"ok": False, "code": -1, "stdout": "", "stderr": "插件名为空"}
    mkt = (body.marketplace or "").strip()
    sel = f"{name}@{mkt}" if mkt else name
    return await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "add", sel], 300)


@router.delete("/plugins/{name}")
async def plugin_remove(request: Request, name: str) -> dict:
    """卸载插件"""
    return await asyncio.to_thread(_manager(request).run_cli_sync, ["plugin", "remove", name])


# ── 会话 ──


@router.get("/sessions")
async def list_sessions(request: Request, limit: int = 100):
    data = await _manager(request).list_sessions(min(max(limit, 1), 500))
    return {"data": data}


@router.post("/sessions")
async def create_session(request: Request):
    sess = await _manager(request).create_session()
    return {"session": sess}


@router.delete("/sessions/{sid}")
async def delete_session(request: Request, sid: str):
    ok = await _manager(request).delete_session(sid)
    return {"success": ok}


@router.get("/sessions/{sid}/messages")
async def get_messages(request: Request, sid: str):
    msgs = await _manager(request).get_history(sid)
    return {"data": msgs}


# ── 流式对话（SSE）──


async def _wait_disconnect(request: Request) -> None:
    """客户端断开时返回（供 asyncio.wait 竞赛用）"""
    while True:
        if await request.is_disconnected():
            return
        await asyncio.sleep(0.3)


@router.post("/sessions/{sid}/chat/stream")
async def chat_stream(request: Request, sid: str, body: ChatRequest):
    """流式对话：每轮拉起 codex exec --json，NDJSON → 命名 SSE 事件。

    客户端断开（AbortController/切换会话）→ 杀 codex 子进程树。
    """
    manager = _manager(request)
    content = (body.content or "").strip()
    workspace = (body.workspace or "").strip() or None

    async def event_stream():
        if not content:
            yield f"event: error\ndata: {json.dumps({'message': '消息为空'}, ensure_ascii=False)}\n\n"
            yield "event: done\ndata: {}\n\n"
            return

        agen = manager.run_turn(sid, content, workspace)
        anext: asyncio.Task | None = None
        poll: asyncio.Task | None = None
        try:
            while True:
                anext = asyncio.ensure_future(agen.__anext__())
                poll = asyncio.ensure_future(_wait_disconnect(request))
                await asyncio.wait({anext, poll}, return_when=asyncio.FIRST_COMPLETED)

                disconnected = poll.done() and not anext.done()
                poll.cancel()
                if disconnected:
                    # 客户端断开：打断本轮（杀子进程），finally 里统一收尾
                    logger.info("codex 对话客户端断开，杀掉子进程: sid=%s", sid)
                    anext.cancel()
                    return

                try:
                    name, data = anext.result()
                except StopAsyncIteration:
                    return
                yield f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
        except asyncio.CancelledError:
            await manager.kill_turn(sid)
            raise
        finally:
            if poll is not None and not poll.done():
                poll.cancel()
            if anext is not None and not anext.done():
                anext.cancel()
            # 等被取消的 __anext__ 任务完全 unwind，生成器不再 running 才能 aclose
            if anext is not None:
                try:
                    await anext
                except (StopAsyncIteration, asyncio.CancelledError):
                    pass
                except Exception:  # noqa: BLE001
                    pass
            await manager.kill_turn(sid)
            await agen.aclose()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
