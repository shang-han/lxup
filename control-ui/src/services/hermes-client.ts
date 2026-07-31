/**
 * Hermes 网关客户端 —— HTTP + SSE（api_server 平台，默认 :8642）。
 *
 * Hermes 引擎「自己的」聊天通道，独立于 OpenClaw 网关（后者是 WebSocket JSON-RPC）。
 * 端点来自 engines/hermes/gateway/platforms/api_server.py：
 *   - GET  /health
 *   - GET  /api/sessions            列表
 *   - POST /api/sessions            新建
 *   - DELETE /api/sessions/{id}     删除
 *   - GET  /api/sessions/{id}/messages  历史
 *   - POST /api/sessions/{id}/chat/stream  流式对话（带 event: 命名的 SSE）
 * 鉴权：Authorization: Bearer <API_SERVER_KEY>
 */

const URL_KEY = 'lxup.hermes.url';
const KEY_KEY = 'lxup.hermes.key';
const DEFAULT_KEY = 'lxup-hermes-dev-2026';

export function hermesUrl(): string {
  try {
    const s = localStorage.getItem(URL_KEY);
    if (s) return s.replace(/\/+$/, '');
  } catch { /* ignore */ }
  const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
  return `http://${host}:8642`;
}

export function hermesKey(): string {
  try {
    const s = localStorage.getItem(KEY_KEY);
    if (s) return s;
  } catch { /* ignore */ }
  return DEFAULT_KEY;
}

// ── 类型 ──

export type HermesSession = {
  id: string;
  title?: string;
  message_count?: number;
  last_active?: number | string;
  preview?: string;
  model?: string;
};

export type HermesMessage = { role: string; content: unknown; tool_calls?: unknown };

export type HermesSseEvent = { event: string; data: Record<string, unknown> };

// ── HTTP 辅助 ──

function authHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${hermesKey()}` };
}

async function errMsg(res: Response): Promise<string> {
  let m = `Hermes 错误 (${res.status})`;
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    if (j?.error?.message) m = j.error.message;
  } catch { /* ignore */ }
  return m;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${hermesUrl()}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await errMsg(res));
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${hermesUrl()}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errMsg(res));
  return (await res.json()) as T;
}

// ── API ──

export async function health(): Promise<boolean> {
  const res = await fetch(`${hermesUrl()}/health`, { headers: authHeaders() });
  return res.ok;
}

export async function listSessions(limit = 100): Promise<HermesSession[]> {
  const d = await getJson<{ data?: HermesSession[] }>(`/api/sessions?limit=${limit}`);
  return d.data || [];
}

export async function createSession(title?: string): Promise<HermesSession> {
  const d = await postJson<{ session: HermesSession }>('/api/sessions', title ? { title } : {});
  return d.session;
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`${hermesUrl()}/api/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function getMessages(id: string): Promise<HermesMessage[]> {
  const d = await getJson<{ data?: HermesMessage[] }>(`/api/sessions/${encodeURIComponent(id)}/messages`);
  return d.data || [];
}

/**
 * POST /api/sessions/{id}/chat/stream —— 解析带 `event:` 命名的 SSE。
 * 事件名（见 api_server.py）：run.started / message.started / assistant.delta /
 *   tool.started|completed|failed / tool.progress / assistant.completed /
 *   run.completed / error / done
 * 返回 AbortController 供取消。
 */
export function chatStream(
  sessionId: string,
  message: string,
  onEvent: (ev: HermesSseEvent) => void,
): AbortController {
  const ctrl = new AbortController();
  void (async () => {
    try {
      const res = await fetch(`${hermesUrl()}/api/sessions/${encodeURIComponent(sessionId)}/chat/stream`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        onEvent({ event: 'error', data: { message: await errMsg(res) } });
        onEvent({ event: 'done', data: {} });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE 事件以空行（\n\n）分隔
        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          let name = 'message';
          const dataLines: string[] = [];
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) name = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
          }
          if (!dataLines.length) continue; // 心跳注释（: keepalive）等
          let data: Record<string, unknown> = {};
          try {
            data = JSON.parse(dataLines.join('\n')) as Record<string, unknown>;
          } catch {
            continue;
          }
          onEvent({ event: name, data });
        }
      }
      // 冲刷残留块：流结束时最后一个事件块可能没有尾随空行
      const tail = buffer.trim();
      if (tail) {
        let name = 'message';
        const dataLines: string[] = [];
        for (const line of tail.split('\n')) {
          if (line.startsWith('event:')) name = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        if (dataLines.length) {
          try {
            onEvent({ event: name, data: JSON.parse(dataLines.join('\n')) as Record<string, unknown> });
          } catch { /* 不完整则忽略 */ }
        }
      }
      onEvent({ event: 'done', data: {} });
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        onEvent({ event: 'error', data: { message: e instanceof Error ? e.message : String(e) } });
      }
      onEvent({ event: 'done', data: {} });
    }
  })();
  return ctrl;
}
