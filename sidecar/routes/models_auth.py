"""
OpenClaw 模型认证密钥写入端点

UI models-page 填写的 API Key 仅写入 openclaw.json（网关配置），
Agent 实际读取的是它自己的认证仓库（openclaw-agent.sqlite）。
本端点通过 CLI 子进程把 Key 同步写入 Agent 认证仓库。
"""

import asyncio
import logging
import os

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/models/auth", tags=["models-auth"])

_SERVICES_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = os.path.dirname(_SERVICES_DIR)


def _node_exe() -> str:
    return os.path.join(_PROJECT_ROOT, "runtime", "data", "node.exe")


def _oc_entry() -> str:
    return os.path.join(
        _PROJECT_ROOT, "runtime", "openclaw", "node_modules", "openclaw", "openclaw.mjs"
    )


def _state_dir() -> str:
    return os.path.join(_PROJECT_ROOT, "runtime", "openclaw-home")


class SetKeyRequest(BaseModel):
    provider: str = Field(description="服务商标识，如 deepseek / dashscope / openai")
    apiKey: str = Field(default="", description="API Key，空字符串时不清除已有 Key")


@router.post("/set-key")
async def set_api_key(request: Request, body: SetKeyRequest):
    """将 API Key 写入 Agent 认证仓库（openclaw-agent.sqlite）。

    复用 openclaw models auth paste-api-key 命令，管道传入 Key，
    无需交互 TTY，安全可审计。
    """
    provider = (body.provider or "").strip()
    if not provider:
        return {"ok": False, "error": "provider is required"}

    api_key = (body.apiKey or "").strip()
    if not api_key:
        return {"ok": False, "error": "apiKey is required"}

    node = _node_exe()
    entry = _oc_entry()
    if not os.path.isfile(node) or not os.path.isfile(entry):
        raise HTTPException(status_code=503, detail="OpenClaw runtime not found")

    env = dict(os.environ)
    env["OPENCLAW_STATE_DIR"] = _state_dir()

    try:
        proc = await asyncio.create_subprocess_exec(
            node, entry, "models", "auth", "paste-api-key",
            "--provider", provider,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
            cwd=_PROJECT_ROOT,
        )
        stdout, stderr = await asyncio.wait_for(
            proc.communicate(input=api_key.encode("utf-8")), timeout=30
        )
        output = ((stdout or b"") + (stderr or b"")).decode("utf-8", errors="replace").strip()
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="auth paste-api-key timed out")
    except Exception as e:
        logger.exception("Failed to run auth paste-api-key")
        raise HTTPException(status_code=500, detail=f"auth command failed: {e}")

    ok = proc.returncode == 0
    if ok:
        logger.info("Auth key stored for provider: %s", provider)
    else:
        logger.warning("Auth paste-api-key exited %d: %s", proc.returncode, output[-500:])

    return {"ok": ok, "provider": provider, "output": output[-500:]}
