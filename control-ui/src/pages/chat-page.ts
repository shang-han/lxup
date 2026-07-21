import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import type { GatewayStore } from '../store/gateway-store.js';
import { listModels, getActiveModel, setSelectedModel, type ResolvedModel } from '../utils/model-config.js';

/** 从 chat.history 的消息里提取可展示文本。
 *  user 消息 content 是字符串；assistant 消息 content 是 parts 数组（取 type:'text'）。 */
function extractMessageText(msg: Record<string, unknown>): string {
  const content = msg.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((p: unknown): p is Record<string, unknown> =>
        typeof p === 'object' && p !== null && (p as Record<string, unknown>).type === 'text')
      .map(p => String((p as Record<string, unknown>).text ?? ''))
      .join('');
  }
  return '';
}

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
      font-size: 14px; line-height: 1.6;
    }
    .message.assistant .message__body {
      background: var(--card); border: 1px solid var(--border);
    }
    .message.user .message__body {
      background: var(--accent); color: var(--accent-foreground);
    }

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

  @state() _input = '';
  @state() _messages: Array<{role: string; text: string}> = [];
  @state() _showSessionList = false;
  @state() _showBanner = true;
  @state() _sessionKey = 'agent:main:main';
  @state() _sessions: Array<{key: string; name: string; kind: string; updatedAt: number | null}> = [];
  @state() _loadingHistory = false;
  _historyLoaded = false;
  @state() _thinkingEnabled = false;
  @state() _managed = false;
  @state() _streaming = false;
  @state() _runId: string | null = null;
  @state() _models: ResolvedModel[] = [];
  @state() _activeModel: ResolvedModel | null = null;
  @state() _modelWarning = '';

  _store!: GatewayStore;
  _eventUnsubs: Array<() => void> = [];

  connectedCallback() {
    super.connectedCallback();
    this._store = getSharedStore();
    this._refreshModels();
    // 订阅真实 OpenClaw 网关的 chat 流式事件（单一 "chat" 事件，按 state 分发）；
    // 并在网关连上后加载会话列表与历史记录（连接是异步的，不能在 connectedCallback 直接加载）
    this._eventUnsubs = [
      this._store.onEvent('chat', (p) => this._onChatEvent(p)),
      this._store.onEvent('sessions.changed', () => this._loadSessions()),
      this._store.subscribe((snap) => {
        if (snap.connected && !this._historyLoaded) {
          this._historyLoaded = true;
          this._loadSessions();
          this._loadHistory();
        }
      }),
    ];
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventUnsubs.forEach(u => u());
    this._eventUnsubs = [];
  }

  /** 拉取真实会话列表（sessions.list） */
  async _loadSessions() {
    if (!this._store || !this._store.connected) return;
    try {
      const res = await this._store.request<{ sessions?: Array<Record<string, unknown>> }>('sessions.list', {});
      const list = (res?.sessions || []).map(s => ({
        key: String(s.key ?? ''),
        name: String(s.displayName ?? s.key ?? ''),
        kind: String(s.kind ?? 'direct'),
        updatedAt: (typeof s.updatedAt === 'number' ? s.updatedAt : null),
      })).filter(s => s.key);
      this._sessions = list;
    } catch { /* 网关未就绪时忽略 */ }
  }

  /** 加载当前会话的历史记录（chat.history） */
  async _loadHistory() {
    if (!this._store || !this._store.connected) return;
    this._loadingHistory = true;
    try {
      const res = await this._store.request<{ messages?: Array<Record<string, unknown>> }>(
        'chat.history', { sessionKey: this._sessionKey, limit: 100 },
      );
      const msgs = (res?.messages || [])
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: String(m.role), text: extractMessageText(m) }))
        .filter(m => m.text);
      this._messages = msgs;
      this._scrollToBottom();
    } catch { /* 忽略 */ } finally {
      this._loadingHistory = false;
    }
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

  _onChatEvent(p: Record<string, unknown> | undefined) {
    if (!p || p.sessionKey !== this._sessionKey) return;
    // 只处理本次发送对应的 run（runId 与 idempotencyKey 一致）
    if (this._runId && p.runId && p.runId !== this._runId) return;

    const state = p.state;
    if (state === 'delta') {
      const deltaText = String(p.deltaText ?? '');
      const replace = p.replace === true;
      if (!deltaText && !replace) return;
      const msgs = [...this._messages];
      const last = msgs[msgs.length - 1];
      if (replace) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: deltaText };
        else msgs.push({ role: 'assistant', text: deltaText });
      } else if (deltaText) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: last.text + deltaText };
        else msgs.push({ role: 'assistant', text: deltaText });
      }
      this._messages = msgs;
      this._scrollToBottom();
    } else if (state === 'final') {
      this._streaming = false;
      this._runId = null;
    } else if (state === 'aborted' || state === 'error') {
      this._streaming = false;
      this._runId = null;
      const errMsg = String(p.errorMessage ?? '请求失败');
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${errMsg}` }];
      this._scrollToBottom();
    }
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      const el = this.renderRoot.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async _send() {
    const text = this._input.trim();
    if (!text || this._streaming) return;

    this._messages = [...this._messages, { role: 'user', text }];
    this._input = '';
    this._streaming = true;
    this._scrollToBottom();

    // 真实 OpenClaw 协议：chat.send 必须带 idempotencyKey（即 runId），
    // 不接受 history / temperature / provider —— 模型由网关的 agent 配置决定，
    // 会话历史由网关按 session 自行管理。
    const runId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this._runId = runId;

    try {
      const ack = await this._store.request<{ runId?: string }>('chat.send', {
        sessionKey: this._sessionKey,
        message: text,
        idempotencyKey: runId,
        deliver: false,
      });
      // 服务端回传 runId，用它关联后续流式事件
      if (ack && ack.runId) this._runId = ack.runId;
    } catch (e: unknown) {
      this._streaming = false;
      this._runId = null;
      const msg = e instanceof Error ? e.message : String(e);
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${msg}` }];
      this._scrollToBottom();
    }
  }

  _onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._send();
    }
  }

  _toggleSessionList() { this._showSessionList = !this._showSessionList; }

  _selectSession(key: string) {
    if (key === this._sessionKey) {
      this._showSessionList = false;
      return;
    }
    this._sessionKey = key;
    this._showSessionList = false;
    this._streaming = false;
    this._runId = null;
    this._loadHistory();
  }

  _renderMessages() {
    if (!this._messages.length) return '';
    return html`
      ${this._messages.map(m => html`
        <div class="message ${m.role}">
          <div class="message__avatar">${m.role === 'user' ? 'U' : 'A'}</div>
          <div class="message__body">${m.text}</div>
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
          <button class="gw-btn primary">${L('chat.repairReconnect')}</button>
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
            <button title="${L('chat.newChat')}" @click=${() => {}}>
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
            <div class="session-item ${this._sessionKey === s.key ? 'active' : ''}"
                 @click=${() => this._selectSession(s.key)}>
              <span class="session-item__dot ${this._sessionKey === s.key ? 'active' : 'idle'}"></span>
              <span class="session-item__name">${s.name}</span>
              ${s.updatedAt ? html`<span class="session-item__time">${formatRelTime(s.updatedAt)}</span>` : ''}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    const layoutClass = this._showSessionList ? 'chat-layout with-list' : 'chat-layout';
    const bannerVisible = this._showBanner && !this.connected;

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
                <span class="status-dot ${this.connected ? '' : 'offline'}"></span>
                ${this.connected ? L('chat.chat') : L('chat.mainSession')}
              </div>
            </div>
            <div class="chat-header__right">
              <select title="model" @change=${this._onSelectModel}>
                ${this._models.length === 0
                  ? html`<option value="">${L('chat.noModelOption')}</option>`
                  : this._models.map(m => html`
                      <option value="${m.providerId}::${m.model}"
                        ?selected=${this._activeModel && this._activeModel.providerId === m.providerId && this._activeModel.model === m.model}>
                        ${m.model} · ${m.providerName}
                      </option>`)}
              </select>
              <button class="ws-btn" title="${L('common.refresh')}">
                ${icons['refresh-cw']}
              </button>
              <div class="workspace-pill">
                ${icons['folder-open']}
                <span class="ws-label">${L('chat.workspace')}</span>
                <span class="ws-name">main</span>
              </div>
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
            ${!this.connected && !this._messages.length
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
