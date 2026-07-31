/**
 * AI 助手服务客户端 —— 连接独立助手服务（ai-assistant/，默认 :8080）。
 *
 * 助手服务独立于 OpenClaw 网关，使用 HTTP + SSE：
 *   - 状态/配置： GET /api/status、GET/POST /api/config、POST /api/config/test
 *   - 会话：      GET/POST /api/conversations、GET/PATCH/DELETE /api/conversations/:id
 *   - 对话：      POST /api/chat（SSE 流式）
 *
 * 服务地址沿用网关惯例（见 gateway-store）：优先 localStorage 'openclaw.assistant.url'，
 * 否则 http://<hostname>:8080。
 */
import type { Conversation } from './types.js';

const STORAGE_KEY = 'openclaw.assistant.url';

export function assistantUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored.replace(/\/+$/, '');
  } catch { /* ignore */ }
  const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
  return `http://${host}:8080`;
}

// ── 类型 ──

export type AssistantStatus = {
  ok: boolean;
  service?: string;
  model: string;
  baseUrl: string;
  hasKey: boolean;
  tools?: string[];
};

export type AssistantConfig = {
  apiKey: string; // 打码返回值
  hasKey: boolean;
  baseUrl: string;
  model: string;
  maxToolRounds: number;
};

/** 一次工具（命令）调用记录，用于聊天内联展示 */
export type ToolCallCard = {
  id?: string;
  name: string;
  args: Record<string, unknown>;
  ok?: boolean;
  result?: string;
};

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallCard[];
};

export type ConversationDetail = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AssistantMessage[];
};

/** /api/chat 的 SSE 事件（已在客户端归一化） */
export type AssistantEvent =
  | { type: 'meta'; conversationId: string; title?: string; created?: boolean; updatedAt?: number; messageCount?: number }
  | { type: 'tool-start'; tool: string; args: Record<string, unknown> }
  | { type: 'tool-end'; tool: string; args: Record<string, unknown>; ok: boolean; result: string }
  | { type: 'content'; content: string }
  | { type: 'error'; error: string }
  | { type: 'done' };

// ── HTTP 辅助 ──

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${assistantUrl()}${path}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${assistantUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) msg = String(j.error);
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

// ── 状态 / 配置 ──

export function getStatus(): Promise<AssistantStatus> {
  return getJson<AssistantStatus>('/api/status');
}

export function getConfig(): Promise<AssistantConfig> {
  return getJson<AssistantConfig>('/api/config');
}

export function saveConfig(cfg: { apiKey?: string; baseUrl?: string; model?: string; maxToolRounds?: number }) {
  return postJson<{ ok: boolean; hasKey: boolean; model: string; baseUrl: string }>('/api/config', cfg);
}

export function testConfig(): Promise<{ ok: boolean; error?: string }> {
  return postJson<{ ok: boolean; error?: string }>('/api/config/test');
}

// ── 会话 ──

type RawConversation = { id: string; title: string; createdAt: number; updatedAt: number; messageCount: number };

function formatTs(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toConversation(c: RawConversation): Conversation {
  return { id: c.id, title: c.title, preview: '', ts: formatTs(c.updatedAt), pinned: false, count: c.messageCount };
}

export async function listConversations(): Promise<Conversation[]> {
  const d = await getJson<{ conversations: RawConversation[] }>('/api/conversations');
  return (d.conversations || []).map(toConversation);
}

export async function createConversation(): Promise<Conversation> {
  const c = await postJson<RawConversation>('/api/conversations', {});
  return toConversation(c);
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  return getJson<ConversationDetail>(`/api/conversations/${encodeURIComponent(id)}`);
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await fetch(`${assistantUrl()}/api/conversations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await fetch(`${assistantUrl()}/api/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// ── 对话（SSE）──

/**
 * 发起一轮对话，服务端以 SSE 推送事件。返回 AbortController 供调用方取消。
 * onEvent 收到归一化后的 AssistantEvent（最后一个是 {type:'done'}）。
 */
export function chat(
  conversationId: string | null,
  content: string,
  onEvent: (ev: AssistantEvent) => void,
): AbortController {
  const ctrl = new AbortController();
  void (async () => {
    try {
      const res = await fetch(`${assistantUrl()}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        onEvent({ type: 'error', error: `助手服务错误 (${res.status})` });
        onEvent({ type: 'done' });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith('data:')) continue;
          const data = t.slice(5).trim();
          if (data === '[DONE]') continue;
          let ev: Record<string, unknown>;
          try {
            ev = JSON.parse(data) as Record<string, unknown>;
          } catch {
            continue;
          }
          if (ev.error) {
            onEvent({ type: 'error', error: String(ev.error) });
          } else if (ev.meta) {
            const m = ev.meta as Record<string, unknown>;
            onEvent({
              type: 'meta',
              conversationId: String(m.conversationId ?? ''),
              title: m.title != null ? String(m.title) : undefined,
              created: m.created === true,
              updatedAt: typeof m.updatedAt === 'number' ? m.updatedAt : undefined,
              messageCount: typeof m.messageCount === 'number' ? m.messageCount : undefined,
            });
          } else if (ev.tool && ev.ok === undefined) {
            onEvent({ type: 'tool-start', tool: String(ev.tool), args: (ev.args as Record<string, unknown>) || {} });
          } else if (ev.tool && ev.ok !== undefined) {
            onEvent({
              type: 'tool-end',
              tool: String(ev.tool),
              args: (ev.args as Record<string, unknown>) || {},
              ok: ev.ok === true,
              result: String(ev.result ?? ''),
            });
          } else if (ev.content) {
            onEvent({ type: 'content', content: String(ev.content) });
          }
        }
      }
      onEvent({ type: 'done' });
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        onEvent({ type: 'error', error: e instanceof Error ? e.message : String(e) });
      }
      onEvent({ type: 'done' });
    }
  })();
  return ctrl;
}
