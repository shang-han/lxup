/**
 * 多引擎聊天适配层。
 *
 * 「三个引擎的实时聊天各用自己的网关，不共用」：
 *   - OpenClaw  → 自己的 WebSocket JSON-RPC 网关（:18789）
 *   - Hermes    → 自己的 HTTP + SSE 网关（api_server，:8642）
 *   - Codex     → 预留（它自己的网关，后续接入）
 *
 * chat-page 只依赖下面的 ChatEngine 归一化接口，按当前引擎选用对应实现，
 * 不直接接触任何具体网关协议。
 */

import type { GatewayStore } from '../store/gateway-store.js';
import * as hermes from './hermes-client.js';

export type EngineId = 'openclaw' | 'hermes' | 'codex';

export type ChatSession = { id: string; name: string; updatedAt: number | null };
export type ChatHistoryMessage = { role: 'user' | 'assistant'; text: string };
export type ToolEvent = {
  name: string;
  args?: Record<string, unknown>;
  ok?: boolean;
  result?: string;
  running?: boolean;
};

/** 归一化的流式事件（各引擎的原始事件都映射到这里） */
export type ChatStreamEvent =
  | { type: 'delta'; text: string; replace?: boolean }
  | { type: 'tool'; tool: ToolEvent }
  | { type: 'final' }
  | { type: 'error'; message: string };

export type Cancellable = { abort(): void };

export interface ChatEngine {
  readonly id: EngineId;
  /** 当前是否就绪（OpenClaw=WS 已连；Hermes=最近一次 /health 成功） */
  ready(): boolean;
  /** 主动探测/刷新就绪状态 */
  refresh(): Promise<void>;
  /** 订阅就绪状态变化 */
  onReadyChange(cb: (ready: boolean) => void): () => void;
  /** 会话列表变化（OpenClaw 有推送；Hermes 无，可不实现） */
  onSessionsChange?(cb: () => void): () => void;
  /** 默认会话（OpenClaw 有固定会话键；Hermes 为空，需动态创建） */
  defaultSessionId(): string;
  listSessions(): Promise<ChatSession[]>;
  getHistory(sessionId: string): Promise<ChatHistoryMessage[]>;
  createSession(): Promise<ChatSession | null>;
  send(sessionId: string, text: string, onEvent: (ev: ChatStreamEvent) => void): Cancellable;
}

// ── 工具函数 ──

/** user 消息 content 是字符串；assistant 多为 parts 数组（取 type:'text'） */
function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((p): p is Record<string, unknown> =>
        typeof p === 'object' && p !== null && (p as Record<string, unknown>).type === 'text')
      .map((p) => String(p.text ?? ''))
      .join('');
  }
  return '';
}

function normalizeTs(v: unknown): number | null {
  if (typeof v === 'number') return v < 1e12 ? Math.round(v * 1000) : Math.round(v);
  if (typeof v === 'string') {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  return null;
}

function newRunId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── OpenClaw：自己的 WebSocket 网关 ──

export class OpenClawChatEngine implements ChatEngine {
  readonly id: EngineId = 'openclaw';
  constructor(private store: GatewayStore) {}

  ready(): boolean {
    return this.store.connected;
  }
  async refresh(): Promise<void> {
    /* WebSocket 由 store 自动连接/重连 */
  }
  onReadyChange(cb: (ready: boolean) => void): () => void {
    return this.store.subscribe((snap) => cb(snap.connected));
  }
  onSessionsChange(cb: () => void): () => void {
    return this.store.onEvent('sessions.changed', () => cb());
  }
  defaultSessionId(): string {
    return 'agent:main:main';
  }

  async listSessions(): Promise<ChatSession[]> {
    const res = await this.store.request<{ sessions?: Array<Record<string, unknown>> }>('sessions.list', {});
    return (res?.sessions || [])
      .map((s) => ({
        id: String(s.key ?? ''),
        name: String(s.displayName ?? s.key ?? ''),
        updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : null,
      }))
      .filter((s) => s.id);
  }

  async getHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
    const res = await this.store.request<{ messages?: Array<Record<string, unknown>> }>(
      'chat.history',
      { sessionKey: sessionId, limit: 100 },
    );
    return (res?.messages || [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', text: extractText(m.content) }))
      .filter((m) => m.text);
  }

  async createSession(): Promise<ChatSession | null> {
    // OpenClaw 用固定会话键，不支持从前端新建
    return null;
  }

  send(sessionId: string, text: string, onEvent: (ev: ChatStreamEvent) => void): Cancellable {
    const runId = newRunId();
    let currentRun = runId;
    const unsub = this.store.onEvent('chat', (p) => {
      if (!p || p.sessionKey !== sessionId) return;
      if (p.runId && currentRun && p.runId !== currentRun) return;
      const state = p.state;
      if (state === 'delta') {
        onEvent({ type: 'delta', text: String(p.deltaText ?? ''), replace: p.replace === true });
      } else if (state === 'final') {
        onEvent({ type: 'final' });
        unsub();
      } else if (state === 'aborted' || state === 'error') {
        onEvent({ type: 'error', message: String(p.errorMessage ?? '请求失败') });
        unsub();
      }
    });
    this.store
      .request<{ runId?: string }>('chat.send', {
        sessionKey: sessionId,
        message: text,
        idempotencyKey: runId,
        deliver: false,
      })
      .then((ack) => {
        if (ack?.runId) currentRun = ack.runId;
      })
      .catch((e: unknown) => {
        onEvent({ type: 'error', message: e instanceof Error ? e.message : String(e) });
        unsub();
      });
    return { abort: () => unsub() };
  }
}

// ── Hermes：自己的 HTTP + SSE 网关 ──

export class HermesChatEngine implements ChatEngine {
  readonly id: EngineId = 'hermes';
  private _ready = false;
  private _cbs = new Set<(ready: boolean) => void>();

  ready(): boolean {
    return this._ready;
  }
  async refresh(): Promise<void> {
    try {
      await hermes.health();
      this._setReady(true);
    } catch {
      this._setReady(false);
    }
  }
  private _setReady(v: boolean): void {
    if (v !== this._ready) {
      this._ready = v;
      for (const cb of this._cbs) cb(v);
    }
  }
  onReadyChange(cb: (ready: boolean) => void): () => void {
    this._cbs.add(cb);
    return () => {
      this._cbs.delete(cb);
    };
  }
  defaultSessionId(): string {
    return ''; // Hermes 会话需动态创建
  }

  async listSessions(): Promise<ChatSession[]> {
    const list = await hermes.listSessions(100);
    return list.map((s) => ({ id: s.id, name: s.title || s.id, updatedAt: normalizeTs(s.last_active) }));
  }

  async getHistory(sessionId: string): Promise<ChatHistoryMessage[]> {
    if (!sessionId) return [];
    const msgs = await hermes.getMessages(sessionId);
    return msgs
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', text: extractText(m.content) }))
      .filter((m) => m.text);
  }

  async createSession(): Promise<ChatSession | null> {
    const s = await hermes.createSession();
    return { id: s.id, name: s.title || s.id, updatedAt: normalizeTs(s.last_active) };
  }

  send(sessionId: string, text: string, onEvent: (ev: ChatStreamEvent) => void): Cancellable {
    let cancelled = false;
    let inner: AbortController | null = null;
    void (async () => {
      let sid = sessionId;
      try {
        if (!sid) {
          const s = await hermes.createSession();
          sid = s.id;
        }
      } catch (e: unknown) {
        onEvent({ type: 'error', message: e instanceof Error ? e.message : String(e) });
        onEvent({ type: 'final' });
        return;
      }
      if (cancelled) return;
      inner = hermes.chatStream(sid, text, (ev) => {
        const d = ev.data;
        switch (ev.event) {
          case 'assistant.delta':
            onEvent({ type: 'delta', text: String(d.delta ?? '') });
            break;
          case 'tool.started':
            onEvent({
              type: 'tool',
              tool: { name: String(d.tool_name ?? 'tool'), args: (d.args as Record<string, unknown>) || undefined, running: true },
            });
            break;
          case 'tool.completed':
            onEvent({
              type: 'tool',
              tool: { name: String(d.tool_name ?? 'tool'), result: d.preview != null ? String(d.preview) : '', ok: true, running: false },
            });
            break;
          case 'tool.failed':
            onEvent({
              type: 'tool',
              tool: { name: String(d.tool_name ?? 'tool'), result: d.preview != null ? String(d.preview) : '失败', ok: false, running: false },
            });
            break;
          case 'error':
            onEvent({ type: 'error', message: String(d.message ?? 'Hermes 错误') });
            break;
          case 'done':
            onEvent({ type: 'final' });
            break;
          default:
            break; // run.started / message.started / tool.progress / assistant.completed / run.completed
        }
      });
    })();
    return {
      abort: () => {
        cancelled = true;
        inner?.abort();
      },
    };
  }
}

// ── 工厂 ──

export function createChatEngine(
  id: EngineId,
  deps: { store: GatewayStore },
): ChatEngine {
  if (id === 'hermes') return new HermesChatEngine();
  // codex 暂未接入，先回退到 OpenClaw（后续新增 CodexChatEngine）
  return new OpenClawChatEngine(deps.store);
}
