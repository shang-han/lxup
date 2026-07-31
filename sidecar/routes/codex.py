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


class ChatRequest(BaseModel):
    content: str = Field(default="", description="用户消息")
    workspace: str = Field(default="", description="本轮工作目录覆盖（可选）")


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
