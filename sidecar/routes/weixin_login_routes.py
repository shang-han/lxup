"""
微信扫码登录 WebSocket 端点 — /ws/weixin-login

前端「消息渠道 → 微信 → 扫码登录」连接此端点：
  客户端 → {"action":"start"}   启动登录子进程
  客户端 → {"action":"stop"}    取消
  服务端 → {"status","message","url","qrDataUrl"}  每次状态变化推送

状态机: idle → starting → qr_ready(带二维码) → waiting_scan → success/error
"""

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..services.weixin_login import get_session

logger = logging.getLogger(__name__)

router = APIRouter(tags=["weixin-login"])


@router.websocket("/ws/weixin-login")
async def weixin_login_ws(ws: WebSocket) -> None:
    await ws.accept()
    session = get_session()

    async def push(snapshot: dict) -> None:
        try:
            await ws.send_json(snapshot)
        except Exception:
            pass

    session.add_listener(push)
    # 连接即推送当前状态
    await push(session.snapshot())

    try:
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            action = msg.get("action")
            if action == "start":
                await session.start()
            elif action == "stop":
                await session.stop()
    except WebSocketDisconnect:
        logger.info("weixin-login WebSocket 断开")
    except Exception:
        logger.exception("weixin-login WebSocket 异常")
    finally:
        session.remove_listener(push)
