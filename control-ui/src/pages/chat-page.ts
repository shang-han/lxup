import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import { listModels, getActiveModel, setSelectedModel, type ResolvedModel } from '../utils/model-config.js';
import {
  createChatEngine,
  type ChatEngine,
  type ChatSession,
  type ChatStreamEvent,
  type Cancellable,
  type EngineId,
  type ToolEvent,
} from '../services/chat-engine.js';

/** 时间戳 → 相对时间（刚刚 / N 分钟前 / N 小时前 / 日期） */
function formatRelTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return L('chat.justNow');
  if (min < 60) return L('chat.minutesAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return L('chat.hoursAgo', { n: hr });
  const day = Math.floor(hr / 24);
  if (day === 1) return L('chat.yesterday');
  if (day < 7) return L('chat.daysAgo', { n: day });
  return new Date(ts).toLocaleDateString();
}

type ViewMessage = { role: 'user' | 'assistant'; text: string; tools?: ToolEvent[] };

export class ChatPage extends LitElement {
  static styles = css`
    :host { display: flex; flex-direction: column; height: 100%; }

    /* === layout === */
    .chat-layout { display: flex; flex: 1; overflow: hidden; }
    .chat-layout.with-list .chat-main { margin-left: 280px; }

    /* === left panel === */
    .session-list {
      width: 280px; flex-shrink: 0; border-right: 1px solid var(--border);
      display: flex; flex-direction: column; background: var(--bg-elevated);
      position: fixed; left: var(--shell-nav-width, 240px); top: 0; bottom: 0; z-index: 25;
      transform: translateX(-100%); transition: transform var(--duration-normal) var(--ease-out);
    }
    .chat-layout.with-list .session-list { transform: translateX(0); }
    .session-list__header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid var(--border);
    }
    .session-list__title { font-size: 14px; font-weight: 600; color: var(--text-strong); }
    .session-list__actions { display: flex; gap: 4px; }
    .session-list__actions button {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: background var(--duration-fast);
    }
    .session-list__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .session-list__body { flex: 1; overflow-y: auto; padding: 8px; }
    .session-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      border-radius: var(--radius-sm); cursor: pointer; transition: background var(--duration-fast);
      font-size: 13px; color: var(--text-soft);
    }
    .session-item:hover { background: var(--bg-hover); color: var(--text); }
    .session-item.active { background: var(--accent-subtle); color: var(--text-strong); }
    .session-item__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .session-item__dot.active { background: var(--success); }
    .session-item__dot.idle { background: var(--muted); }
    .session-item__name {
      flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: var(--font-mono); font-size: 12px;
    }
    .session-item__time { flex-shrink: 0; font-size: 10px; color: var(--muted); }
    .session-item__del {
      flex-shrink: 0; width: 20px; height: 20px;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer; opacity: 0;
      transition: opacity var(--duration-fast), color var(--duration-fast);
    }
    .session-item:hover .session-item__del { opacity: 1; }
    .session-item__del:hover { color: var(--danger); background: var(--danger-subtle); }
    .session-item__confirm { flex-shrink: 0; display: inline-flex; gap: 4px; }
    .session-item__confirm button {
      padding: 1px 8px; font-size: 10px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); cursor: pointer;
    }
    .session-item__confirm .yes { background: var(--danger); color: #fff; border-color: var(--danger); }
    .session-item__confirm .no { background: transparent; color: var(--text-soft); }

    /* === chat main === */
    .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

    /* === chat header === */
    .chat-header {
      display: flex; align-items: center; justify-content: space-between;
      height: 48px; padding: 0 16px; border-bottom: 1px solid var(--border);
      background: var(--bg-elevated); flex-shrink: 0;
    }
    .chat-header__left { display: flex; align-items: center; gap: 10px; }
    .chat-header__left .icon-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .chat-header__left .icon-btn:hover { background: var(--bg-hover); color: var(--text); }
    .chat-header__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 6px;
    }
    .chat-header__title .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--success);
    }
    .chat-header__title .status-dot.offline { background: var(--muted); }
    .chat-header__right { display: flex; align-items: center; gap: 6px; }
    .chat-header__right select,
    .chat-header__right .ws-btn {
      height: 30px; padding: 0 10px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-soft); font-size: 12px;
      outline: none; cursor: pointer;
    }
    .chat-header__right select:hover,
    .chat-header__right .ws-btn:hover { border-color: var(--text-muted); color: var(--text); }
    .chat-header__right .ws-btn {
      display: flex; align-items: center; gap: 4px;
      background: var(--bg-hover);
    }
    .workspace-pill {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: var(--radius-full);
      background: var(--bg-hover); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-soft);
    }
    .workspace-pill .ws-label { font-size: 11px; }
    .workspace-pill .ws-name { font-weight: 600; font-size: 12px; color: var(--accent); }

    /* === banner === */
    .chat-banner {
      display: flex; align-items: flex-start; gap: 10px;
      margin: 16px 16px 0; padding: 12px 16px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,0.2);
      border-radius: var(--radius-md); color: var(--text); font-size: 13px;
    }
    .chat-banner.info {
      background: var(--accent-subtle); border-color: rgba(233,69,96,0.2);
    }
    .chat-banner__icon { flex-shrink: 0; color: var(--danger); margin-top: 1px; }
    .chat-banner.info .chat-banner__icon { color: var(--accent); }
    .chat-banner__content { flex: 1; min-width: 0; }
    .chat-banner__title { font-weight: 600; color: var(--text-strong); margin-bottom: 2px; }
    .chat-banner__desc { color: var(--text-soft); line-height: 1.5; }
    .chat-banner__desc strong { color: var(--text-strong); }
    .chat-banner__close {
      flex-shrink: 0; background: transparent; border: none;
      color: var(--muted); cursor: pointer; padding: 2px; border-radius: var(--radius-sm);
    }
    .chat-banner__close:hover { background: var(--bg-hover); color: var(--text); }

    /* === messages area === */
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
    .message { display: flex; gap: 10px; margin-bottom: 16px; max-width: 80%; }
    .message.user { margin-left: auto; flex-direction: row-reverse; }
    .message__avatar {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 14px; font-weight: 600;
    }
    .message.assistant .message__avatar {
      background: var(--accent-subtle); color: var(--accent);
    }
    .message.user .message__avatar {
      background: var(--bg-hover); color: var(--text-soft);
    }
    .message__body {
      padding: 10px 14px; border-radius: var(--radius-md);
      font-size: 14px; line-height: 1.6; min-width: 0;
    }
    .message.assistant .message__body {
      background: var(--card); border: 1px solid var(--border);
    }
    .message.user .message__body {
      background: var(--accent); color: var(--accent-foreground);
    }
    .msg-text { white-space: pre-wrap; word-break: break-word; }

    /* === tool cards (命令/工具执行，内联) === */
    .msg-tools { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .tool-card {
      background: var(--bg-hover); border: 1px solid var(--border);
      border-left: 3px solid var(--accent); border-radius: var(--radius-sm);
      padding: 8px 10px; font-family: var(--font-mono); font-size: 12px; text-align: left;
    }
    .tool-card.run { border-left-color: var(--warn); }
    .tool-card.ok { border-left-color: var(--success); }
    .tool-card.err { border-left-color: var(--danger); }
    .tool-card__head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
    .tool-card__name { color: var(--accent); font-weight: 600; }
    .tool-card__cmd { background: var(--bg); color: var(--text); padding: 2px 7px; border-radius: 4px; word-break: break-all; font-size: 11.5px; }
    .tool-card__out { margin: 7px 0 0; white-space: pre-wrap; word-break: break-word; color: var(--text-soft); font-size: 11px; line-height: 1.5; max-height: 190px; overflow-y: auto; }
    .tool-card.run .tool-card__out { color: var(--warn); }
    .tool-card.err .tool-card__out { color: var(--danger); }

    /* === gateway idle state === */
    .gw-idle {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; color: var(--muted);
    }
    .gw-idle .gw-icon { color: var(--border-strong); margin-bottom: 8px; }
    .gw-idle .gw-title { font-size: 15px; font-weight: 600; color: var(--text-strong); }
    .gw-idle .gw-sub { font-size: 13px; }
    .gw-idle .gw-actions { display: flex; gap: 8px; margin-top: 4px; }
    .gw-idle .gw-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: none; cursor: pointer; transition: background var(--duration-fast);
    }
    .gw-idle .gw-btn.primary { background: var(--accent); color: var(--accent-foreground); }
    .gw-idle .gw-btn.primary:hover { background: var(--accent-hover); }
    .gw-idle .gw-btn.secondary { background: var(--bg-hover); color: var(--text-soft); border: 1px solid var(--border); }
    .gw-idle .gw-btn.secondary:hover { background: var(--bg-active); color: var(--text); }
    .gw-idle .gw-hint { font-size: 12px; color: var(--muted); max-width: 360px; text-align: center; line-height: 1.5; margin-top: 8px; }

    /* === input bar === */
    .chat-input-bar {
      display: flex; align-items: flex-end; gap: 8px;
      padding: 12px 16px; border-top: 1px solid var(--border);
      background: var(--bg-elevated); flex-shrink: 0;
    }
    .chat-input-bar__tools {
      display: flex; align-items: center; gap: 2px; flex-shrink: 0;
    }
    .chat-input-bar__tools button {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .chat-input-bar__tools button:hover { background: var(--bg-hover); color: var(--text); border-color: var(--border); }
    .chat-input-bar__tools button.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); }
    .chat-input-bar__input {
      flex: 1; display: flex; align-items: center;
      background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 0 12px; min-height: 38px; transition: border-color var(--duration-fast);
    }
    .chat-input-bar__input:focus-within { border-color: var(--accent); }
    .chat-input-bar__input textarea {
      flex: 1; background: transparent; border: none; color: var(--text);
      font-size: 14px; resize: none; outline: none; padding: 8px 0;
      min-height: 22px; max-height: 120px; line-height: 1.4;
    }
    .chat-input-bar__input textarea::placeholder { color: var(--muted); }
    .chat-input-bar__send {
      width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
      background: var(--accent); border: none; border-radius: var(--radius-md);
      color: var(--accent-foreground); cursor: pointer; flex-shrink: 0;
      transition: background var(--duration-fast);
    }
    .chat-input-bar__send:hover { background: var(--accent-hover); }
    .chat-input-bar__send:disabled { opacity: 0.4; cursor: not-allowed; }
    .chat-input-bar__managed {
      display: flex; align-items: center; gap: 6px; flex-shrink: 0;
      padding: 0 8px; height: 38px; border-radius: var(--radius-md);
      background: var(--bg-hover); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .chat-input-bar__managed:hover { border-color: var(--text-muted); color: var(--text); }
    .chat-input-bar__managed .m-dot {
      width: 6px; height: 6px; border-radius: 50%; background: var(--muted);
    }
    .chat-input-bar__managed.active .m-dot { background: var(--success); }
    .chat-input-bar__managed.active { border-color: var(--success); }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Boolean }) connected = false;
  /** 当前引擎（由 app.ts 传入）：决定实时聊天连哪个引擎自己的网关 */
  @property({ type: String }) engine: EngineId = 'openclaw';

  @state() _input = '';
  @state() _messages: ViewMessage[] = [];
  @state() _showSessionList = false;
  @state() _showBanner = true;
  @state() _sessionKey = '';
  @state() _sessions: ChatSession[] = [];
  @state() _loadingHistory = false;
  @state() _engineReady = false;
  @state() _thinkingEnabled = false;
  @state() _managed = false;
  @state() _streaming = false;
  @state() _models: ResolvedModel[] = [];
  @state() _activeModel: ResolvedModel | null = null;
  @state() _modelWarning = '';

  _engineAdapter!: ChatEngine;
  _readyUnsub: (() => void) | null = null;
  _sessUnsub: (() => void) | null = null;
  _chatCancel: Cancellable | null = null;
  _historyLoaded = false;
  _inited = false;

  connectedCallback() {
    super.connectedCallback();
    this._refreshModels();
    this._setupEngine();
    this._inited = true;
  }

  updated(changed: Map<string, unknown>) {
    // 引擎切换 → 换用对应引擎的网关
    if (this._inited && changed.has('engine')) this._setupEngine();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardownEngine();
  }

  // ── 引擎适配 ──

  _setupEngine() {
    const id: EngineId = this.engine === 'hermes' || this.engine === 'codex' ? this.engine : 'openclaw';
    if (this._engineAdapter && this._engineAdapter.id === id) return;
    this._teardownEngine();

    this._engineAdapter = createChatEngine(id, { store: getSharedStore() });
    this._messages = [];
    this._sessions = [];
    this._sessionKey = '';
    this._historyLoaded = false;
    this._streaming = false;
    this._engineReady = false;

    this._readyUnsub = this._engineAdapter.onReadyChange((ready) => {
      this._engineReady = ready;
      if (ready && !this._historyLoaded) {
        this._historyLoaded = true;
        void this._bootstrapSessions();
      }
    });
    if (this._engineAdapter.onSessionsChange) {
      this._sessUnsub = this._engineAdapter.onSessionsChange(() => void this._loadSessions());
    }
    void this._engineAdapter.refresh();
  }

  _teardownEngine() {
    this._readyUnsub?.();
    this._readyUnsub = null;
    this._sessUnsub?.();
    this._sessUnsub = null;
    this._chatCancel?.abort();
    this._chatCancel = null;
  }

  async _bootstrapSessions() {
    await this._loadSessions();
    if (!this._sessionKey) {
      const dflt = this._engineAdapter.defaultSessionId();
      if (dflt) {
        this._sessionKey = dflt;
      } else if (this._sessions.length) {
        this._sessionKey = this._sessions[0].id;
      } else {
        try {
          const s = await this._engineAdapter.createSession();
          if (s) {
            this._sessionKey = s.id;
            this._sessions = [s, ...this._sessions];
          }
        } catch { /* ignore */ }
      }
    }
    await this._loadHistory();
  }

  async _loadSessions() {
    try {
      this._sessions = await this._engineAdapter.listSessions();
    } catch { /* 引擎未就绪时忽略 */ }
  }

  async _loadHistory() {
    if (!this._sessionKey) return;
    this._loadingHistory = true;
    try {
      const msgs = await this._engineAdapter.getHistory(this._sessionKey);
      this._messages = msgs.map((m) => ({ role: m.role, text: m.text }));
      this._scrollToBottom();
    } catch { /* ignore */ } finally {
      this._loadingHistory = false;
    }
  }

  async _ensureSession(): Promise<string> {
    if (this._sessionKey) return this._sessionKey;
    const dflt = this._engineAdapter.defaultSessionId();
    if (dflt) {
      this._sessionKey = dflt;
      return dflt;
    }
    try {
      const s = await this._engineAdapter.createSession();
      if (s) {
        this._sessionKey = s.id;
        this._sessions = [s, ...this._sessions];
      }
    } catch { /* ignore */ }
    return this._sessionKey;
  }

  _refreshModels() {
    this._models = listModels();
    this._activeModel = getActiveModel();
  }

  _onSelectModel(e: Event) {
    const key = (e.target as HTMLSelectElement).value;
    const found = this._models.find(m => `${m.providerId}::${m.model}` === key);
    if (found) {
      setSelectedModel(found);
      this._activeModel = found;
    }
  }

  // ── 发送 / 流式事件 ──

  async _send() {
    const text = this._input.trim();
    if (!text || this._streaming) return;
    if (!this._engineAdapter.ready()) {
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.engineOffline')}` }];
      this._scrollToBottom();
      return;
    }

    this._messages = [...this._messages, { role: 'user', text }];
    this._input = '';
    this._streaming = true;
    this._scrollToBottom();

    const sid = await this._ensureSession();
    if (!sid) {
      this._streaming = false;
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.engineOffline')}` }];
      this._scrollToBottom();
      return;
    }
    this._chatCancel = this._engineAdapter.send(sid, text, (ev) => this._onEngineEvent(ev));
  }

  _onEngineEvent(ev: ChatStreamEvent) {
    if (ev.type === 'delta') {
      const msgs = [...this._messages];
      const last = msgs[msgs.length - 1];
      if (ev.replace) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: ev.text };
        else msgs.push({ role: 'assistant', text: ev.text });
      } else if (ev.text) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: last.text + ev.text };
        else msgs.push({ role: 'assistant', text: ev.text });
      }
      this._messages = msgs;
      this._scrollToBottom();
    } else if (ev.type === 'tool') {
      const msgs = [...this._messages];
      let last = msgs[msgs.length - 1];
      if (!last || last.role !== 'assistant') {
        last = { role: 'assistant', text: '', tools: [] };
        msgs.push(last);
      }
      const tools = [...(last.tools || [])];
      const t = ev.tool;
      if (t.running) {
        tools.push({ name: t.name, args: t.args, running: true });
      } else {
        let matched = false;
        for (let i = tools.length - 1; i >= 0; i--) {
          if (tools[i].running && tools[i].name === t.name) {
            tools[i] = { ...tools[i], ok: t.ok, result: t.result, running: false };
            matched = true;
            break;
          }
        }
        if (!matched) tools.push({ name: t.name, ok: t.ok, result: t.result, running: false });
      }
      msgs[msgs.length - 1] = { ...last, tools };
      this._messages = msgs;
      this._scrollToBottom();
    } else if (ev.type === 'final') {
      this._streaming = false;
      this._chatCancel = null;
      void this._loadSessions();
    } else if (ev.type === 'error') {
      this._streaming = false;
      this._chatCancel = null;
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${ev.message}` }];
      this._scrollToBottom();
    }
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      const el = this.renderRoot.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  _onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void this._send();
    }
  }

  _toggleSessionList() { this._showSessionList = !this._showSessionList; }

  @state() _confirmDeleteId: string | null = null;
  @state() _deleting = false;

  async _deleteSession(id: string) {
    if (this._deleting) return;
    this._deleting = true;
    const ok = await this._engineAdapter.deleteSession(id);
    this._deleting = false;
    this._confirmDeleteId = null;
    if (!ok) {
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.deleteFailed')}` }];
      this._scrollToBottom();
      return;
    }
    const wasActive = this._sessionKey === id;
    if (wasActive) {
      this._chatCancel?.abort();
      this._chatCancel = null;
      this._streaming = false;
    }
    await this._loadSessions();
    if (wasActive) {
      const next = this._sessions.find(s => s.id !== id);
      const fallback = next?.id || this._engineAdapter.defaultSessionId();
      this._sessionKey = fallback || '';
      this._messages = [];
      if (this._sessionKey) await this._loadHistory();
    }
  }

  _selectSession(id: string) {
    if (id === this._sessionKey) {
      this._showSessionList = false;
      return;
    }
    this._sessionKey = id;
    this._showSessionList = false;
    this._streaming = false;
    this._chatCancel?.abort();
    this._chatCancel = null;
    void this._loadHistory();
  }

  async _newChat() {
    try {
      const s = await this._engineAdapter.createSession();
      if (s) {
        this._sessions = [s, ...this._sessions];
        this._sessionKey = s.id;
      } else {
        this._sessionKey = this._engineAdapter.defaultSessionId();
      }
    } catch { /* ignore */ }
    this._messages = [];
    this._showSessionList = false;
  }

  _refresh() {
    void this._engineAdapter.refresh();
    void this._loadSessions();
    if (this._sessionKey) void this._loadHistory();
  }

  // ── 渲染 ──

  _renderToolCard(t: ToolEvent) {
    const state = t.running ? 'run' : (t.ok ? 'ok' : 'err');
    const cmd = t.args && typeof t.args.command === 'string'
      ? t.args.command
      : (t.args ? JSON.stringify(t.args) : '');
    return html`
      <div class="tool-card ${state}">
        <div class="tool-card__head">
          <span class="tool-card__name">⚙ ${t.name}</span>
          ${cmd ? html`<code class="tool-card__cmd">$ ${cmd}</code>` : ''}
        </div>
        <pre class="tool-card__out">${t.running
          ? L('chat.toolRunning')
          : ((t.ok ? '' : '✗ ') + (t.result || L('chat.toolNoOutput')))}</pre>
      </div>
    `;
  }

  _renderMessages() {
    if (!this._messages.length) return '';
    return html`
      ${this._messages.map(m => html`
        <div class="message ${m.role}">
          <div class="message__avatar">${m.role === 'user' ? 'U' : 'A'}</div>
          <div class="message__body">
            ${m.role === 'assistant' && m.tools && m.tools.length
              ? html`<div class="msg-tools">${m.tools.map(t => this._renderToolCard(t))}</div>` : ''}
            ${m.text ? html`<div class="msg-text">${m.text}</div>` : ''}
          </div>
        </div>
      `)}
    `;
  }

  _renderGatewayIdle() {
    return html`
      <div class="gw-idle">
        <div class="gw-icon">${icons['zap']}</div>
        <div class="gw-title">${L('chat.gatewayNotReady')}</div>
        <div class="gw-sub">${L('chat.connecting')}</div>
        <div class="gw-actions">
          <button class="gw-btn primary" @click=${this._refresh}>${L('chat.repairReconnect')}</button>
          <button class="gw-btn secondary">${L('chat.gatewaySettings')}</button>
        </div>
        <div class="gw-hint">${L('chat.firstUseHint')}</div>
      </div>
    `;
  }

  _renderSessionList() {
    return html`
      <div class="session-list">
        <div class="session-list__header">
          <span class="session-list__title">${L('chat.sessionList')}</span>
          <div class="session-list__actions">
            <button title="${L('chat.newChat')}" @click=${() => this._newChat()}>
              ${icons['plus']}
            </button>
            <button @click=${() => this._toggleSessionList()}>
              ${icons['x']}
            </button>
          </div>
        </div>
        <div class="session-list__body">
          ${this._sessions.length === 0
            ? html`<div style="padding:16px 12px;font-size:12px;color:var(--muted);">${this._loadingHistory ? '…' : L('chat.noSessions')}</div>`
            : this._sessions.map(s => html`
            <div class="session-item ${this._sessionKey === s.id ? 'active' : ''}"
                 @click=${() => this._selectSession(s.id)}>
              <span class="session-item__dot ${this._sessionKey === s.id ? 'active' : 'idle'}"></span>
              <span class="session-item__name">${s.name}</span>
              ${s.updatedAt ? html`<span class="session-item__time">${formatRelTime(s.updatedAt)}</span>` : ''}
              ${this._confirmDeleteId === s.id ? html`
                <span class="session-item__confirm" @click=${(e: Event) => e.stopPropagation()}>
                  <button class="yes" ?disabled=${this._deleting} @click=${() => this._deleteSession(s.id)}>${L('chat.deleteConfirmYes')}</button>
                  <button class="no" ?disabled=${this._deleting} @click=${() => { this._confirmDeleteId = null; }}>${L('chat.deleteConfirmNo')}</button>
                </span>
              ` : html`
                <button class="session-item__del" title=${L('chat.deleteSession')}
                  @click=${(e: Event) => { e.stopPropagation(); this._confirmDeleteId = s.id; }}>
                  ${icons['trash']}
                </button>
              `}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    const layoutClass = this._showSessionList ? 'chat-layout with-list' : 'chat-layout';
    const bannerVisible = this._showBanner && !this._engineReady;
    const isHermes = this._engineAdapter?.id === 'hermes';
    const isCodex = this._engineAdapter?.id === 'codex';

    return html`
      <div class="${layoutClass}">
        ${this._renderSessionList()}
        <div class="chat-main">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header__left">
              <button class="icon-btn" @click=${() => this._toggleSessionList()}>
                ${this._showSessionList ? icons['panel-left-close'] : icons['menu']}
              </button>
              <div class="chat-header__title">
                <span class="status-dot ${this._engineReady ? '' : 'offline'}"></span>
                ${this._engineReady ? L('chat.chat') : L('chat.mainSession')}
              </div>
            </div>
            <div class="chat-header__right">
              ${isHermes
                ? html`<div class="workspace-pill"><span class="ws-name">${L('chat.hermesModel')}</span></div>`
                : isCodex
                ? html`<div class="workspace-pill"><span class="ws-name">${L('chat.codexModel')}</span></div>`
                : html`
                  <select title="model" @change=${this._onSelectModel}>
                    ${this._models.length === 0
                      ? html`<option value="">${L('chat.noModelOption')}</option>`
                      : this._models.map(m => html`
                          <option value="${m.providerId}::${m.model}"
                            ?selected=${this._activeModel && this._activeModel.providerId === m.providerId && this._activeModel.model === m.model}>
                            ${m.model} · ${m.providerName}
                          </option>`)}
                  </select>`}
              <button class="ws-btn" title="${L('common.refresh')}" @click=${this._refresh}>
                ${icons['refresh-cw']}
              </button>
              ${isHermes || isCodex ? '' : html`
                <div class="workspace-pill">
                  ${icons['folder-open']}
                  <span class="ws-label">${L('chat.workspace')}</span>
                  <span class="ws-name">main</span>
                </div>`}
              <button class="ws-btn" title="tools">
                ${icons['layout-panel-left']}
              </button>
            </div>
          </div>

          <!-- Banner -->
          ${bannerVisible ? html`
            <div class="chat-banner info">
              <div class="chat-banner__icon">${icons['alert-triangle']}</div>
              <div class="chat-banner__content">
                <div class="chat-banner__title">${L('chat.useRealtimeChat')}</div>
                <div class="chat-banner__desc">
                  ${L('chat.realtimeChatDesc')}<br/>
                  ${L('chat.aiAssistantTip')}
                </div>
              </div>
              <button class="chat-banner__close" @click=${() => this._showBanner = false}>
                ${icons['x']}
              </button>
            </div>
          ` : ''}

          <!-- Messages / Idle -->
          <div class="chat-messages">
            ${this._modelWarning ? html`
              <div class="chat-banner">
                <div class="chat-banner__icon">${icons['alert-triangle']}</div>
                <div class="chat-banner__content">
                  <div class="chat-banner__desc">${this._modelWarning}</div>
                </div>
              </div>` : ''}
            ${!this._engineReady && !this._messages.length
              ? this._renderGatewayIdle()
              : this._renderMessages()
            }
          </div>

          <!-- Input bar -->
          <div class="chat-input-bar">
            <div class="chat-input-bar__tools">
              <button class="${this._thinkingEnabled ? 'active' : ''}"
                      title="${L('chat.thinking')}"
                      @click=${() => { this._thinkingEnabled = !this._thinkingEnabled; }}>
                ${icons['sparkles']}
              </button>
              <button title="${L('chat.image')}">
                ${icons['image']}
              </button>
              <button title="${L('chat.attachment')}">
                ${icons['paperclip']}
              </button>
            </div>
            <div class="chat-input-bar__input">
              <textarea rows="1"
                .value=${this._input}
                @input=${(e: Event) => {
                  const t = e.target as HTMLTextAreaElement;
                  this._input = t.value;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
                @keydown=${this._onKeydown}
                placeholder="${L('chat.placeholder')}"
              ></textarea>
            </div>
            <button class="chat-input-bar__send"
                    ?disabled=${!this._input.trim() || this._streaming}
                    @click=${this._send}>
              ${this._streaming ? icons['refresh-cw'] : icons['send']}
            </button>
            <div class="chat-input-bar__managed ${this._managed ? 'active' : ''}"
                 @click=${() => { this._managed = !this._managed; }}>
              <span class="m-dot"></span>
              <span>${L('chat.managed')}</span>
              <span style="font-size:11px;color:var(--muted)">${this._managed ? L('common.enabled') : L('common.disabled')}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('chat-page', ChatPage);
