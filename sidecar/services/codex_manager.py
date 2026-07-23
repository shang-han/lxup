"""
Codex CLI 桥接 —— 每轮子进程 `codex exec --json`

Codex 与 OpenClaw / Hermes 不同：它没有常驻网关，只是一个 CLI。
本管理器为每轮对话拉起一次 `codex exec --json [resume <thread_id>] <prompt>`，
把 stdout 的 NDJSON 事件流（格式见 engines/codex 源码
codex-rs/exec/src/exec_events.rs，v0.145.0 钉死）归一化为与 Hermes
一致的 SSE 事件词表（assistant.delta / tool.started / tool.completed /
tool.failed / error / done），由 routes/codex.py 以 SSE 推给前端。

- 便携家目录: CODEX_HOME=runtime/codex-home（config.toml / auth.json / 会话注册表）
- 二进制: runtime/codex/node_modules/@openai/codex-win32-x64/vendor/.../codex.exe
  （bootstrap-codex.bat 安装；可用 LXUP_CODEX_BIN 覆盖）
- 会话: sidecar 注册表 lxup-codex.json（uuid ↔ codex thread_id + 消息历史），
  多轮对话经 `exec resume <thread_id>` 续接。
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
import uuid
from collections import deque
from pathlib import Path
from typing import AsyncIterator

try:  # Python 3.11+ 自带 tomllib
    import tomllib
except ImportError:  # pragma: no cover
    tomllib = None  # type: ignore

try:
    import tomli_w
except ImportError:  # pragma: no cover
    tomli_w = None

from ..config import GatewayConfig

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# Windows 下新建进程组，便于 taskkill /T 杀整棵进程树
_CREATE_NEW_PROCESS_GROUP = 0x00000200

# 预览/错误尾部截断长度
_PREVIEW_LIMIT = 2000
_STDERR_RING = 8 * 1024

DEFAULT_TITLE = "新对话"


def _mask_key(key: str) -> str:
    if not key:
        return ""
    if len(key) <= 8:
        return "****"
    return key[:3] + "****" + key[-4:]


class CodexManager:
    """Codex CLI 子进程管理 + 配置/会话持久化"""

    def __init__(self, config: GatewayConfig):
        self.config = config
        self.home = Path(config.codex_home)
        self.registry_path = self.home / "lxup-codex.json"
        self.log_path = PROJECT_ROOT / "runtime" / "logs" / "codex.log"
        self._lock = asyncio.Lock()
        # sid -> 活跃子进程（一个会话同时只允许一轮）
        self._active: dict[str, asyncio.subprocess.Process] = {}

    # ── 二进制发现 ──

    def binary_path(self) -> str | None:
        """依次找: LXUP_CODEX_BIN → vendored 原生二进制 → 全局 codex"""
        if self.config.codex_bin:
            return self.config.codex_bin
        vendor = (
            PROJECT_ROOT
            / "runtime"
            / "codex"
            / "node_modules"
            / "@openai"
            / "codex-win32-x64"
            / "vendor"
            / "x86_64-pc-windows-msvc"
            / "bin"
            / "codex.exe"
        )
        if vendor.exists():
            return str(vendor)
        # 其他平台 vendored 目录（darwin/linux）——按 node_modules/@openai/codex-*/vendor 兜底
        base = PROJECT_ROOT / "runtime" / "codex" / "node_modules" / "@openai"
        if base.is_dir():
            for exe in base.glob("codex-*/vendor/*/bin/codex*"):
                if exe.is_file() and exe.suffix in ("", ".exe"):
                    return str(exe)
        # 全局回退
        from shutil import which

        return which("codex")

    async def version(self) -> str:
        binary = self.binary_path()
        if not binary:
            return ""
        try:
            proc = await asyncio.create_subprocess_exec(
                binary,
                "--version",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.DEVNULL,
            )
            out, _ = await asyncio.wait_for(proc.communicate(), timeout=15)
            return out.decode("utf-8", errors="replace").strip()
        except Exception as e:  # noqa: BLE001
            logger.warning("codex --version 失败: %s", e)
            return ""

    async def status(self) -> dict:
        binary = self.binary_path()
        ver = await self.version() if binary else ""
        auth_key, _ = self._read_auth()
        reg = await self._load_registry()
        return {
            "installed": bool(binary),
            "binaryPath": binary or "",
            "version": ver,
            "hasKey": bool(auth_key),
            "homeDir": str(self.home),
            "sessions": len(reg.get("sessions") or {}),
        }

    # ── 配置 / 认证 ──

    def _config_toml_path(self) -> Path:
        return self.home / "config.toml"

    def _auth_path(self) -> Path:
        return self.home / "auth.json"

    def _read_config_toml(self) -> dict:
        p = self._config_toml_path()
        if not p.exists() or tomllib is None:
            return {}
        try:
            with open(p, "rb") as f:
                data = tomllib.load(f)
            return data if isinstance(data, dict) else {}
        except Exception as e:  # noqa: BLE001
            logger.warning("读取 codex config.toml 失败: %s", e)
            return {}

    def _write_config_toml(self, cfg: dict) -> None:
        if tomli_w is None:
            raise RuntimeError("缺少依赖 tomli-w，无法写入 config.toml")
        p = self._config_toml_path()
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(tomli_w.dumps(cfg).encode("utf-8"))

    def _read_auth(self) -> tuple[str, bool]:
        """返回 (原始 key, 是否存在)"""
        p = self._auth_path()
        if not p.exists():
            return "", False
        try:
            data = json.loads(p.read_text(encoding="utf-8"))
            key = str(data.get("OPENAI_API_KEY") or "")
            return key, bool(key)
        except Exception as e:  # noqa: BLE001
            logger.warning("读取 codex auth.json 失败: %s", e)
            return "", False

    def get_config_view(self) -> dict:
        cfg = self._read_config_toml()
        key, has_key = self._read_auth()
        return {
            "model": str(cfg.get("model") or ""),
            "approvalPolicy": str(cfg.get("approval_policy") or ""),
            "sandboxMode": str(cfg.get("sandbox_mode") or ""),
            "apiKey": _mask_key(key),
            "hasKey": has_key,
            "workspace": self._get_default_workspace(),
        }

    def save_config_view(self, body: dict) -> dict:
        """掩码写回：apiKey 留空或含 **** 时保留原 Key（仿 hermes set_model）"""
        self.home.mkdir(parents=True, exist_ok=True)
        cfg = self._read_config_toml()

        for src, dst in (
            ("model", "model"),
            ("approvalPolicy", "approval_policy"),
            ("sandboxMode", "sandbox_mode"),
        ):
            val = str(body.get(src) or "").strip()
            if val:
                cfg[dst] = val

        new_key = str(body.get("apiKey") or "").strip()
        if new_key and "****" not in new_key:
            auth = {}
            old, _ = self._read_auth()
            if old:
                auth = {"OPENAI_API_KEY": old}
            auth["OPENAI_API_KEY"] = new_key
            self._auth_path().write_text(
                json.dumps(auth, ensure_ascii=False, indent=2), encoding="utf-8"
            )

        ws = str(body.get("workspace") or "").strip()
        if ws:
            self._set_default_workspace(ws)

        self._write_config_toml(cfg)
        logger.info(
            "Codex 配置已更新: model=%s approval=%s sandbox=%s",
            cfg.get("model"),
            cfg.get("approval_policy"),
            cfg.get("sandbox_mode"),
        )
        _, has_key = self._read_auth()
        return {"success": True, "hasKey": has_key}

    # ── 会话注册表（uuid ↔ codex thread_id + 消息历史）──

    async def _load_registry(self) -> dict:
        if not self.registry_path.exists():
            return {"defaultWorkspace": "", "sessions": {}}
        try:
            data = json.loads(self.registry_path.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            logger.warning("读取 codex 会话注册表失败: %s", e)
            return {"defaultWorkspace": "", "sessions": {}}
        if not isinstance(data, dict):
            return {"defaultWorkspace": "", "sessions": {}}
        data.setdefault("defaultWorkspace", "")
        data.setdefault("sessions", {})
        return data

    async def _save_registry(self, reg: dict) -> None:
        self.home.mkdir(parents=True, exist_ok=True)
        tmp = self.registry_path.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.registry_path)

    def _get_default_workspace(self) -> str:
        try:
            if self.registry_path.exists():
                data = json.loads(self.registry_path.read_text(encoding="utf-8"))
                return str(data.get("defaultWorkspace") or "")
        except Exception:  # noqa: BLE001
            pass
        return ""

    def _set_default_workspace(self, ws: str) -> None:
        try:
            reg = json.loads(self.registry_path.read_text(encoding="utf-8")) if self.registry_path.exists() else {}
        except Exception:  # noqa: BLE001
            reg = {}
        if not isinstance(reg, dict):
            reg = {}
        reg["defaultWorkspace"] = ws
        reg.setdefault("sessions", {})
        self.home.mkdir(parents=True, exist_ok=True)
        self.registry_path.write_text(
            json.dumps(reg, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    async def list_sessions(self, limit: int = 100) -> list[dict]:
        reg = await self._load_registry()
        out = []
        for sid, s in (reg.get("sessions") or {}).items():
            out.append(
                {
                    "id": sid,
                    "title": s.get("title") or DEFAULT_TITLE,
                    "createdAt": s.get("createdAt"),
                    "updatedAt": s.get("updatedAt"),
                }
            )
        out.sort(key=lambda x: x.get("updatedAt") or 0, reverse=True)
        return out[:limit]

    async def create_session(self) -> dict:
        async with self._lock:
            reg = await self._load_registry()
            sid = uuid.uuid4().hex
            now = int(time.time() * 1000)
            sess = {
                "title": DEFAULT_TITLE,
                "createdAt": now,
                "updatedAt": now,
                "conversationId": None,
                "messages": [],
            }
            reg["sessions"][sid] = sess
            await self._save_registry(reg)
        return {"id": sid, "title": DEFAULT_TITLE, "createdAt": now, "updatedAt": now}

    async def delete_session(self, sid: str) -> bool:
        async with self._lock:
            reg = await self._load_registry()
            if sid not in reg["sessions"]:
                return False
            del reg["sessions"][sid]
            await self._save_registry(reg)
        return True

    async def get_history(self, sid: str) -> list[dict]:
        reg = await self._load_registry()
        sess = reg["sessions"].get(sid)
        if not sess:
            return []
        return list(sess.get("messages") or [])

    async def _mutate_session(self, sid: str, fn) -> None:
        async with self._lock:
            reg = await self._load_registry()
            sess = reg["sessions"].get(sid)
            if sess is None:
                return
            fn(sess)
            sess["updatedAt"] = int(time.time() * 1000)
            await self._save_registry(reg)

    async def _append_message(self, sid: str, role: str, text: str) -> None:
        def _do(sess: dict) -> None:
            msgs = sess.setdefault("messages", [])
            msgs.append({"role": role, "content": text})
            if role == "user" and (not sess.get("title") or sess["title"] == DEFAULT_TITLE):
                sess["title"] = text.strip().replace("\n", " ")[:30] or DEFAULT_TITLE

        await self._mutate_session(sid, _do)

    async def _bind_conversation(self, sid: str, conv_id: str) -> None:
        def _do(sess: dict) -> None:
            sess["conversationId"] = conv_id

        await self._mutate_session(sid, _do)

    # ── 每轮对话：codex exec --json ──

    def _codex_env(self) -> dict:
        env = os.environ.copy()
        env["CODEX_HOME"] = str(self.home)
        key, _ = self._read_auth()
        if key:
            env["OPENAI_API_KEY"] = key
        return env

    def _build_argv(self, prompt: str, workspace: str, conv_id: str | None) -> list[str]:
        binary = self.binary_path()
        assert binary, "codex 未安装"
        # 顶层 flag 必须在 resume 子命令之前（resume 子命令不继承 --cd 等共享参数）
        argv = [binary, "exec", "--json", "--skip-git-repo-check", "--cd", workspace]
        if conv_id:
            argv += ["resume", conv_id]
        argv.append(prompt)
        return argv

    async def kill_turn(self, sid: str) -> None:
        proc = self._active.pop(sid, None)
        if proc is None or proc.returncode is not None:
            return
        try:
            proc.kill()
        except ProcessLookupError:
            return
        # Windows: 杀整棵进程树（codex 可能拉起子命令进程）
        if os.name == "nt" and proc.pid:
            try:
                subprocess.run(
                    ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                    capture_output=True,
                    timeout=10,
                )
            except Exception:  # noqa: BLE001
                pass

    async def run_turn(
        self, sid: str, prompt: str, workspace: str | None = None
    ) -> AsyncIterator[tuple[str, dict]]:
        """跑一轮对话，产出 (sse事件名, data) 序列；保证恰好以一个 done 收尾。"""
        binary = self.binary_path()
        if not binary:
            yield "error", {
                "message": "Codex CLI 未安装，请先运行 bootstrap-codex.bat"
            }
            yield "done", {}
            return

        reg = await self._load_registry()
        sess = reg["sessions"].get(sid)
        if sess is None:
            yield "error", {"message": "会话不存在"}
            yield "done", {}
            return
        if sid in self._active:
            yield "error", {"message": "该会话已有进行中的对话，请先等待或打断"}
            yield "done", {}
            return

        ws = (workspace or "").strip() or sess.get("workspace") or self._get_default_workspace() or str(PROJECT_ROOT)
        if not Path(ws).is_dir():
            ws = str(PROJECT_ROOT)

        await self._append_message(sid, "user", prompt)

        argv = self._build_argv(prompt, ws, sess.get("conversationId"))
        self.home.mkdir(parents=True, exist_ok=True)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

        stderr_ring: deque[str] = deque(maxlen=64)
        done_sent = False
        error_sent = False
        proc: asyncio.subprocess.Process | None = None
        log_file = None

        async def _drain_stderr(stream: asyncio.StreamReader) -> None:
            async for raw in stream:
                line = raw.decode("utf-8", errors="replace").rstrip()
                if not line:
                    continue
                stderr_ring.append(line)
                if log_file:
                    try:
                        log_file.write(line + "\n")
                        log_file.flush()
                    except Exception:  # noqa: BLE001
                        pass

        try:
            log_file = open(self.log_path, "a", encoding="utf-8")
            log_file.write(
                f"\n=== {time.strftime('%Y-%m-%d %H:%M:%S')} exec: {argv[1:3]}... (cwd={ws}) ===\n"
            )
            kwargs: dict = dict(
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                stdin=asyncio.subprocess.DEVNULL,  # 防止 codex 把管道 stdin 当作追加输入
                env=self._codex_env(),
                cwd=ws,
            )
            if os.name == "nt":
                kwargs["creationflags"] = _CREATE_NEW_PROCESS_GROUP
            proc = await asyncio.create_subprocess_exec(*argv, **kwargs)
            self._active[sid] = proc
            stderr_task = asyncio.create_task(_drain_stderr(proc.stderr))

            completed_normally = False
            assistant_texts: list[str] = []

            async for raw in proc.stdout:
                line = raw.decode("utf-8", errors="replace").strip()
                if not line:
                    continue
                try:
                    ev = json.loads(line)
                except json.JSONDecodeError:
                    stderr_ring.append(f"[stdout 非 JSON] {line[:300]}")
                    continue
                for name, data in self._translate(ev, sid):
                    if name == "__bind__":
                        await self._bind_conversation(sid, str(data.get("conversationId") or ""))
                        continue
                    if name == "__assistant__":
                        assistant_texts.append(str(data.get("text") or ""))
                        yield "assistant.delta", {"delta": str(data.get("text") or "")}
                        continue
                    if name == "error":
                        if not error_sent:
                            error_sent = True
                            yield name, data
                        continue
                    if name == "done":
                        completed_normally = True
                        continue
                    yield name, data

            await proc.wait()
            try:
                await asyncio.wait_for(stderr_task, timeout=2)
            except asyncio.TimeoutError:
                stderr_task.cancel()

            for t in assistant_texts:
                if t.strip():
                    await self._append_message(sid, "assistant", t)

            if not completed_normally and not error_sent:
                tail = "\n".join(list(stderr_ring)[-8:])
                yield "error", {
                    "message": f"Codex 异常退出（code={proc.returncode}）：{tail or '无输出'}"
                }
        except asyncio.CancelledError:
            await self.kill_turn(sid)
            raise
        except Exception as e:  # noqa: BLE001
            logger.exception("codex run_turn 失败")
            if not error_sent:
                yield "error", {"message": f"Codex 调用失败：{e}"}
        finally:
            self._active.pop(sid, None)
            if proc is not None and proc.returncode is None:
                await self.kill_turn(sid)
            if log_file:
                try:
                    log_file.close()
                except Exception:  # noqa: BLE001
                    pass
            done_sent = True

        if done_sent:
            yield "done", {}

    # ── NDJSON → SSE 归一化映射（codex exec --json，v0.145.0）──
    # 事件结构参考 engines/codex: codex-rs/exec/src/exec_events.rs
    #   thread.started {thread_id}            → 记录 conversationId（用于 resume）
    #   turn.started {}                       → run.started
    #   item.started {item:{id,type,...}}     → tool.started
    #   item.completed {item:{...}}           → assistant.delta / tool.completed|failed
    #   turn.completed {usage}                → done
    #   turn.failed {error:{message}}         → error
    #   error {message}                       → error
    # 注：exec --json 下助手消息以完整块（item.completed/agent_message）到达，
    #     无逐 token 增量；工具调用（命令/补丁/MCP/搜索）实时推送。

    def _translate(self, ev: dict, sid: str) -> list[tuple[str, dict]]:
        etype = ev.get("type")
        out: list[tuple[str, dict]] = []

        if etype == "thread.started":
            tid = ev.get("thread_id")
            if tid:
                out.append(("__bind__", {"conversationId": tid}))
            return out

        if etype == "turn.started":
            out.append(("run.started", {}))
            return out

        if etype in ("item.started", "item.completed"):
            item = ev.get("item") or {}
            out.extend(self._translate_item(item, started=(etype == "item.started")))
            return out

        if etype == "turn.completed":
            out.append(("done", {}))
            return out

        if etype == "turn.failed":
            err = (ev.get("error") or {}).get("message") or "回合失败"
            out.append(("error", {"message": str(err)}))
            return out

        if etype == "error":
            out.append(("error", {"message": str(ev.get("message") or "Codex 错误")}))
            return out

        # item.updated（todo_list 等）/ 其余事件：忽略
        return out

    def _translate_item(self, item: dict, started: bool) -> list[tuple[str, dict]]:
        itype = str(item.get("type") or "")
        iid = str(item.get("id") or "")

        if itype == "agent_message":
            if not started:
                return [("__assistant__", {"text": str(item.get("text") or "")})]
            return []

        if itype == "command_execution":
            if started:
                return [
                    (
                        "tool.started",
                        {
                            "tool_name": "shell",
                            "call_id": iid,
                            "args": {"command": str(item.get("command") or "")},
                        },
                    )
                ]
            status = str(item.get("status") or "")
            exit_code = item.get("exit_code")
            ok = status == "completed" and (exit_code in (None, 0))
            preview = self._tail(str(item.get("aggregated_output") or ""))
            name = "tool.completed" if ok else "tool.failed"
            return [
                (
                    name,
                    {
                        "tool_name": "shell",
                        "call_id": iid,
                        "preview": preview or f"exit_code={exit_code}",
                    },
                )
            ]

        if itype == "file_change":
            if started:
                return [("tool.started", {"tool_name": "apply_patch", "call_id": iid, "args": {}})]
            changes = item.get("changes") or []
            paths = ", ".join(
                f"{c.get('kind', '?')} {c.get('path', '?')}" for c in changes[:20] if isinstance(c, dict)
            )
            ok = str(item.get("status") or "") == "completed"
            return [
                (
                    "tool.completed" if ok else "tool.failed",
                    {"tool_name": "apply_patch", "call_id": iid, "preview": paths},
                )
            ]

        if itype == "mcp_tool_call":
            tool_name = str(item.get("name") or item.get("tool_name") or "mcp_tool_call")
            if started:
                args = item.get("raw_arguments") or item.get("arguments") or {}
                if isinstance(args, str):
                    args = {"arguments": args}
                return [
                    ("tool.started", {"tool_name": tool_name, "call_id": iid, "args": args})
                ]
            ok = str(item.get("status") or "") == "completed"
            preview = self._tail(str(item.get("result") or ""))
            return [
                (
                    "tool.completed" if ok else "tool.failed",
                    {"tool_name": tool_name, "call_id": iid, "preview": preview},
                )
            ]

        if itype == "web_search":
            if started:
                return [("tool.started", {"tool_name": "web_search", "call_id": iid, "args": {}})]
            return [
                (
                    "tool.completed",
                    {"tool_name": "web_search", "call_id": iid, "preview": "search completed"},
                )
            ]

        if itype == "error" and not started:
            # 非致命错误项（弃用提醒/模型改路由等）：仅记日志，不打断对话
            logger.info("codex 错误项（忽略）: %s", item.get("message"))
            return []

        # reasoning / todo_list / collab_tool_call 等：暂不展示
        return []

    @staticmethod
    def _tail(text: str, limit: int = _PREVIEW_LIMIT) -> str:
        if len(text) <= limit:
            return text
        return "…" + text[-limit:]
