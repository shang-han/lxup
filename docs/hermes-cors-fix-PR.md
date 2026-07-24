# PR 提交说明（hermes-agent 上游）

- **上游仓库**: https://github.com/NousResearch/hermes-agent
- **基于版本**: hermes-agent 0.18.2（PyPI）
- **补丁文件**: `docs/hermes-0.18.2-cors-streaming.patch`

> 注：该修复已纳入本项目流程——`scripts/apply_hermes_patches.py` 会在
> `bootstrap-hermes.bat` 每次重装 hermes-libs 后自动重打（幂等）。
> 上游 PR 被合并并发布新版本后，可删除脚本中对应补丁条目。

## 提交步骤

```bash
# 1. 在 GitHub 上 fork NousResearch/hermes-agent，然后：
git clone https://github.com/<你的用户名>/hermes-agent.git
cd hermes-agent
git checkout -b fix/cors-headers-on-streaming-responses

# 2. 应用补丁
git apply /path/to/hermes-0.18.2-cors-streaming.patch

# 3. 提交并推送
git commit -am "fix(api_server): add CORS headers to streaming responses before prepare()"
git push origin fix/cors-headers-on-streaming-responses

# 4. 在 GitHub 上发起 PR，标题和正文见下
```

## PR 标题

```
fix(api_server): add CORS headers to streaming responses before prepare()
```

## PR 正文

```markdown
### Problem

`POST /api/sessions/{session_id}/chat/stream` (and the run-stream
subscription endpoint) return `StreamResponse` objects whose headers are
flushed to the client inside the handler via `response.prepare(request)`.
The CORS middleware adds `Access-Control-Allow-*` headers *after* the
handler returns — which is too late for already-prepared stream responses.

Browser clients therefore receive a streaming response without
`Access-Control-Allow-Origin` and reject it with `TypeError: Failed to
fetch`, even though:

- the OPTIONS preflight succeeds (it returns a plain `web.Response`), and
- the server-side agent run (started as a background task before
  `prepare()`) completes and persists the reply.

Observable symptom: the browser chat client shows "Failed to fetch"
immediately, but reloading session history shows the assistant reply was
generated and stored. Non-streaming endpoints are unaffected.

### Fix

Resolve CORS headers up front and include them in the `StreamResponse`
headers *before* `prepare()` — the same pattern already used by the
`/v1/chat/completions` streaming handler in this file ("CORS middleware
can't inject headers into StreamResponse after prepare() flushes them,
so resolve CORS headers up front").

- `POST /api/sessions/{session_id}/chat/stream`: add up-front CORS headers
- run-stream subscription endpoint: same fix
- `cors_middleware`: skip the post-handler header update when the response
  is already prepared (no-op for streams, avoids mutating flushed headers)

### Verification

Before (response headers of the streaming endpoint, request with
`Origin: http://localhost:5173`):

    HTTP/1.1 200 OK
    Content-Type: text/event-stream
    (no Access-Control-Allow-* headers)

After:

    HTTP/1.1 200 OK
    Content-Type: text/event-stream
    Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
    Access-Control-Allow-Headers: Authorization, Content-Type, Idempotency-Key
    Access-Control-Allow-Origin: *
    Access-Control-Max-Age: 600

SSE event flow (run.started / assistant.delta / assistant.completed /
run.completed / done) verified intact end-to-end after the change.
```
