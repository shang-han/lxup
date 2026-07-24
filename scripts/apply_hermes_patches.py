"""
Re-apply local patches to the vendored hermes-agent library.

bootstrap-hermes.bat reinstalls runtime\\hermes-libs from PyPI, which
overwrites any local fixes. This script is called right after the pip
install to re-apply them. It is idempotent: already-applied patches are
skipped; a patch whose code no longer matches (upstream version drift)
is reported and the script exits non-zero.

Usage:
    python scripts/apply_hermes_patches.py [hermes-libs-root]
    (defaults to <project root>/runtime/hermes-libs)

Current patches
---------------
1. api_server.py — CORS headers on streaming responses
   StreamResponse flushes headers at prepare() time, so the CORS
   middleware's after-the-fact header update never reaches streaming
   responses (chat/stream, run-stream): browser clients got "Failed to
   fetch" while the reply was generated and stored server-side.
   Fix: resolve CORS headers up front, before prepare() — the same
   pattern the /v1/chat/completions handler in this file already uses.
   Upstream: https://github.com/NousResearch/hermes-agent
   (PR material: docs/hermes-0.18.2-cors-streaming.patch)
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# (patch id, original snippet, patched snippet)
API_SERVER_PATCHES = [
    (
        "cors-middleware-prepared-guard",
        """        response = await handler(request)
        if cors_headers is not None:
            response.headers.update(cors_headers)
        return response""",
        """        response = await handler(request)
        # StreamResponse headers are flushed to the client at prepare() time and
        # can't be amended afterwards; streaming endpoints add CORS headers up
        # front themselves, so only update regular responses here.
        if cors_headers is not None and not response.prepared:
            response.headers.update(cors_headers)
        return response""",
    ),
    (
        "cors-chat-stream-up-front",
        """            "X-Hermes-Session-Id": session_id,
        }
        if gateway_session_key:
            headers["X-Hermes-Session-Key"] = gateway_session_key
        response = web.StreamResponse(status=200, headers=headers)""",
        """            "X-Hermes-Session-Id": session_id,
        }
        # CORS middleware can't inject headers into StreamResponse after
        # prepare() flushes them, so resolve CORS headers up front.
        origin = request.headers.get("Origin", "")
        cors = self._cors_headers_for_origin(origin) if origin else None
        if cors:
            headers.update(cors)
        if gateway_session_key:
            headers["X-Hermes-Session-Key"] = gateway_session_key
        response = web.StreamResponse(status=200, headers=headers)""",
    ),
    (
        "cors-run-stream-up-front",
        """        q = self._run_streams[run_id]

        response = web.StreamResponse(
            status=200,
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )
        await response.prepare(request)""",
        """        q = self._run_streams[run_id]

        sse_headers = {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
        # CORS middleware can't inject headers into StreamResponse after
        # prepare() flushes them, so resolve CORS headers up front.
        origin = request.headers.get("Origin", "")
        cors = self._cors_headers_for_origin(origin) if origin else None
        if cors:
            sse_headers.update(cors)
        response = web.StreamResponse(status=200, headers=sse_headers)
        await response.prepare(request)""",
    ),
]


def patch_api_server(target: Path) -> int:
    if not target.exists():
        print(f"[hermes-patches] ERROR: {target} not found")
        return 1
    # 统一按 LF 匹配，写回时保留文件原有换行风格（CRLF/LF）
    raw = target.read_bytes()
    crlf = b"\r\n" in raw
    src = raw.decode("utf-8")
    if crlf:
        src = src.replace("\r\n", "\n")
    applied, skipped, failed = [], [], []
    for name, old, new in API_SERVER_PATCHES:
        if new in src:
            skipped.append(name)
        elif old not in src:
            failed.append(name)
        else:
            src = src.replace(old, new, 1)
            applied.append(name)
    if failed:
        print("[hermes-patches] ERROR: patch(es) did not match "
              "(hermes-agent code changed upstream?):")
        for name in failed:
            print(f"  - {name}")
        print("  Update scripts/apply_hermes_patches.py for the new version.")
        return 1
    if applied:
        if crlf:
            src = src.replace("\n", "\r\n")
        target.write_bytes(src.encode("utf-8"))
        print("[hermes-patches] applied: " + ", ".join(applied))
    if skipped:
        print("[hermes-patches] already applied: " + ", ".join(skipped))
    return 0


def main() -> int:
    libs_root = (Path(sys.argv[1]) if len(sys.argv) > 1
                 else PROJECT_ROOT / "runtime" / "hermes-libs")
    return patch_api_server(
        libs_root / "gateway" / "platforms" / "api_server.py")


if __name__ == "__main__":
    sys.exit(main())
