/**
 * Codex 引擎客户端 —— 经 Sidecar（:7889）桥接的 HTTP + SSE。
 *
 * Codex 是 CLI 而非常驻网关：Sidecar 的 /api/codex/* 负责拉起
 * `codex exec --json` 子进程并把 NDJSON 事件流转成命名 SSE
 * （事件词表与 Hermes api_server 对齐：assistant.delta /
 *  tool.started|completed|failed / error / done）。
 *
 * 端点（sidecar/routes/codex.py）：
 *   - GET  /api/codex/status               安装状态/版本/Key
 *   - GET  /api/codex/config               读配置（Key 打码）
 *   - POST /api/codex/config               写配置（config.toml + auth.json）
 *   - GET  /api/codex/sessions             会话列表
 *   - POST /api/codex/sessions             新建会话
 *   - DELETE /api/codex/sessions/{id}      删除会话
 *   - GET  /api/codex/sessions/{id}/messages   历史
 *   - POST /api/codex/sessions/{id}/chat/stream  流式对话（SSE）
 *
 * 鉴权：开发模式下 Sidecar 未设 --token，免认证（与 Hermes 仪表盘页
 * 调用 /api/hermes/* 一致）；如需带 token 可用 localStorage 'lxup.codex.key'。
 */

const URL_KEY = 'lxup.codex.url';
const KEY_KEY = 'lxup.codex.key';

export function codexUrl(): string {
  try {
    const s = localStorage.getItem(URL_KEY);
    if (s) return s.replace(/\/+$/, '');
  } catch { /* ignore */ }
  const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
  return `http://${host}:7889`;
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const key = localStorage.getItem(KEY_KEY);
    if (key) h.Authorization = `Bearer ${key}`;
  } catch { /* ignore */ }
  return h;
}

// ── 类型 ──

export type CodexStatus = {
  installed: boolean;
  binaryPath?: string;
  version: string;
  hasKey: boolean;
  homeDir?: string;
  sessions?: number;
};

export type CodexConfigView = {
  model: string;
  approvalPolicy: string;
  sandboxMode: string;
  apiKey: string;
  hasKey: boolean;
  workspace: string;
};

export type CodexSession = {
  id: string;
  title?: string;
  createdAt?: number | null;
  updatedAt?: number | null;
};

export type CodexMessage = { role: string; content: unknown };

export type CodexSseEvent = { event: string; data: Record<string, unknown> };

// ── HTTP 辅助 ──

async function errMsg(res: Response): Promise<string> {
  let m = `Codex 错误 (${res.status})`;
  try {
    const j = (await res.json()) as { detail?: string; message?: string };
    if (j?.detail) m = j.detail;
    else if (j?.message) m = j.message;
  } catch { /* ignore */ }
  return m;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${codexUrl()}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await errMsg(res));
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${codexUrl()}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await errMsg(res));
  return (await res.json()) as T;
}

// ── API ──

export async function getStatus(): Promise<CodexStatus> {
  return getJson<CodexStatus>('/api/codex/status');
}

/** 就绪探测：Sidecar 可达且 Codex 已安装 */
export async function health(): Promise<boolean> {
  try {
    const st = await getStatus();
    return !!st.installed;
  } catch {
    return false;
  }
}

export async function getConfig(): Promise<CodexConfigView> {
  return getJson<CodexConfigView>('/api/codex/config');
}

export async function saveConfig(body: Partial<CodexConfigView>): Promise<{ success: boolean; message?: string }> {
  return postJson('/api/codex/config', body);
}

export async function listSessions(limit = 100): Promise<CodexSession[]> {
  const d = await getJson<{ data?: CodexSession[] }>(`/api/codex/sessions?limit=${limit}`);
  return d.data || [];
}

export async function createSession(): Promise<CodexSession> {
  const d = await postJson<{ session: CodexSession }>('/api/codex/sessions', {});
  return d.session;
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`${codexUrl()}/api/codex/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function getMessages(id: string): Promise<CodexMessage[]> {
  const d = await getJson<{ data?: CodexMessage[] }>(`/api/codex/sessions/${encodeURIComponent(id)}/messages`);
  return d.data || [];
}

/**
 * POST /api/codex/sessions/{id}/chat/stream —— 解析带 `event:` 命名的 SSE。
 * 事件名（sidecar 归一化自 codex exec --json）：
 *   run.started / assistant.delta / tool.started|completed|failed / error / done
 * 取消（AbortController.abort）→ Sidecar 杀掉 codex 子进程树。
 */
export function chatStream(
  sessionId: string,
  message: string,
  onEvent: (ev: CodexSseEvent) => void,
): AbortController {
  const ctrl = new AbortController();
  void (async () => {
    try {
      const res = await fetch(`${codexUrl()}/api/codex/sessions/${encodeURIComponent(sessionId)}/chat/stream`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: message }),
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
