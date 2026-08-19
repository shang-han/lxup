import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import {
  getStatus, listConversations, createConversation, getConversation,
  deleteConversation, chat, type AssistantEvent,
} from '../services/ai.js';
import '../components/oc-toast.js';
import '../components/oc-markdown.js';
import pageStyles from './styles.css?raw';

/** 聊天里展示的一次命令（工具）调用 */
type ToolCardView = { name: string; command: string; ok?: boolean; result?: string; running: boolean };
/** 本地聊天消息（assistant 可携带命令卡片；user 可携带图片） */
type AiMessage = { role: 'user' | 'assistant'; text: string; ts: string; tools?: ToolCardView[]; error?: boolean; image?: string };

const cmdOf = (args: Record<string, unknown>) =>
  typeof args.command === 'string' && args.command ? args.command : JSON.stringify(args);

export class AiPage extends LitElement {
  static styles = css`
    :host { display: flex; flex-direction: column; height: 100%; }
    ${unsafeCSS(pageStyles)}

    .assistant-status-line { font-size: 12px; color: var(--text-soft); padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--border); }
    .status-on { color: var(--success); }
    .status-off { color: var(--danger); }

    /* ── 命令卡片 ── */
    .ai-chat__tools { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .ai-tool { background: var(--bg-muted); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius-sm); padding: 8px 10px; font-family: var(--font-mono); font-size: 12px; }
    .ai-tool.run { border-left-color: var(--warn); }
    .ai-tool.ok { border-left-color: var(--success); }
    .ai-tool.err { border-left-color: var(--danger); }
    .ai-tool__head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
    .ai-tool__name { color: var(--accent); font-weight: 600; }
    .ai-tool__cmd { background: var(--bg); color: var(--text); padding: 2px 7px; border-radius: 4px; word-break: break-all; font-size: 11.5px; }
    .ai-tool__out { margin: 7px 0 0; white-space: pre-wrap; word-break: break-word; color: var(--text-soft); font-size: 11px; line-height: 1.5; max-height: 190px; overflow-y: auto; }
    .ai-tool.run .ai-tool__out { color: var(--warn); }
    .ai-tool.err .ai-tool__out { color: var(--danger); }

    .ai-cursor { color: var(--accent); animation: ai-blink 1s steps(1) infinite; margin-left: 1px; }
    @keyframes ai-blink { 50% { opacity: 0; } }
    .ai-thinking { color: var(--text-soft); opacity: .75; }
    .ai-chat__msg-text.is-error { color: var(--danger); }
    .ai-chat__msg-md { min-width: 0; overflow-x: auto; }
    .ai-chat__msg-image {
      display: block; max-width: 240px; max-height: 240px; object-fit: contain;
      border-radius: var(--radius-sm); border: 1px solid var(--border);
      background: var(--bg); margin-bottom: 6px;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  /** 当前引擎（app.ts 传入）：首页功能卡片与内置说明按引擎切换 */
  @property({ type: String }) engine = 'openclaw';

  get _isHermes(): boolean { return this.engine === 'hermes'; }
  get _isCodex(): boolean { return this.engine === 'codex'; }

  @state() _view: 'home' | 'chat' = 'home';
  @query('oc-toast') _toast!: HTMLElement & { show: (msg: string) => void };
  @state() _showConvList = false;
  @state() _settingsOpen = false;
  @state() _input = '';
  @state() _confirmDeleteConv: string | null = null;
  @state() _deletingConv = false;

  // 助手服务状态
  @state() _assistantOnline = false;
  @state() _configured = false;
  @state() _assistantModel = '';

  // 会话（真实，来自助手服务）
  @state() _conversations: import('../services/types.js').Conversation[] = [];
  @state() _activeConv = '';
  @state() _convSearch = '';
  @state() _messages: AiMessage[] = [];
  @state() _streaming = false;
  _chatAbort: AbortController | null = null;

  // 图片附件（沿用既有 UI，仅本地预览）
  @state() _uploadedImage: string | null = null;
  @query('#ai-file-input') _fileInput!: HTMLInputElement;

  /** 首页功能卡片：前三张与最后一张按引擎切换（配置/诊断/目录/技能），中间通用 */
  get _functionCards() {
    const head = this._isHermes
      ? [
          { icon: 'wrench', titleKey: 'ai.hxCheckConfig', descKey: 'ai.hxCheckConfigDesc' },
          { icon: 'shield', titleKey: 'ai.hxDiag', descKey: 'ai.hxDiagDesc' },
          { icon: 'folder-open', titleKey: 'ai.hxBrowse', descKey: 'ai.hxBrowseDesc' },
        ]
      : this._isCodex
        ? [
            { icon: 'wrench', titleKey: 'ai.cxCheckConfig', descKey: 'ai.cxCheckConfigDesc' },
            { icon: 'shield', titleKey: 'ai.cxDiag', descKey: 'ai.cxDiagDesc' },
            { icon: 'folder-open', titleKey: 'ai.cxBrowse', descKey: 'ai.cxBrowseDesc' },
          ]
        : [
            { icon: 'wrench', titleKey: 'ai.checkConfig', descKey: 'ai.checkConfigDesc' },
            { icon: 'shield', titleKey: 'ai.diagGateway', descKey: 'ai.diagGatewayDesc' },
            { icon: 'folder-open', titleKey: 'ai.browseDir', descKey: 'ai.browseDirDesc' },
          ];
    const shared = [
      { icon: 'monitor', titleKey: 'ai.checkEnv', descKey: 'ai.checkEnvDesc' },
      { icon: 'scroll-text', titleKey: 'ai.analyzeLogs', descKey: 'ai.analyzeLogsDesc' },
      { icon: 'refresh-cw', titleKey: 'ai.oneClickFix', descKey: 'ai.oneClickFixDesc' },
      { icon: 'bug', titleKey: 'ai.feedbackBug', descKey: 'ai.feedbackBugDesc' },
      { icon: 'zap', titleKey: 'ai.prAssistant', descKey: 'ai.prAssistantDesc' },
    ];
    const tail = this._isHermes
      ? { icon: 'puzzle', titleKey: 'ai.hxSkillsMgmt', descKey: 'ai.hxSkillsMgmtDesc' }
      : this._isCodex
        ? { icon: 'puzzle', titleKey: 'ai.cxSkillsMgmt', descKey: 'ai.cxSkillsMgmtDesc' }
        : { icon: 'puzzle', titleKey: 'ai.skillsMgmt', descKey: 'ai.skillsMgmtDesc' };
    return [...head, ...shared, tail];
  }

  connectedCallback() {
    super.connectedCallback();
    void this._boot();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._chatAbort?.abort();
  }

  async _boot() {
    try {
      const s = await getStatus();
      this._assistantOnline = true;
      this._configured = s.hasKey;
      this._assistantModel = s.model;
    } catch {
      this._assistantOnline = false;
    }
    await this._refreshConvs();
    // 刷新后恢复上次打开的会话(该会话仍在列表中才恢复,否则打开第一个)
    const saved = this._readSavedConv();
    if (saved && this._conversations.some(c => c.id === saved)) {
      await this._switchConv(saved);
    } else if (this._conversations.length) {
      await this._switchConv(this._conversations[0].id);
    }
  }

  async _refreshConvs() {
    try {
      this._conversations = await listConversations();
    } catch { /* 助手离线时忽略 */ }
  }

  // ── 会话操作 ──

  _toggleConvList() { this._showConvList = !this._showConvList; }

  /** 当前会话记忆:刷新后恢复上次打开的会话 */
  get _convStorageKey(): string { return 'lxup.ai.conversation'; }
  _readSavedConv(): string {
    try { return localStorage.getItem(this._convStorageKey) || ''; } catch { return ''; }
  }
  _setActiveConv(id: string) {
    this._activeConv = id;
    try { if (id) localStorage.setItem(this._convStorageKey, id); } catch { /* ignore */ }
  }

  async _newConversation() {
    try {
      const c = await createConversation();
      this._conversations = [c, ...this._conversations];
      this._setActiveConv(c.id);
      this._messages = [];
      this._view = 'home';
      this._showConvList = false;
    } catch (e) {
      this._toast?.show(e instanceof Error ? e.message : String(e));
    }
  }

  /** 消息时间格式化：当天 HH:MM，跨天 MM-DD HH:MM */
  _fmtMsgTime(ts?: number): string {
    if (!ts) return '';
    const d = new Date(ts);
    const sameDay = d.toDateString() === new Date().toDateString();
    const pad = (n: number) => String(n).padStart(2, '0');
    return sameDay
      ? `${pad(d.getHours())}:${pad(d.getMinutes())}`
      : `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** 历史消息内容解析：支持纯文本字符串与视觉多段格式（text + image_url） */
  _parseContent(c: unknown): { text: string; image?: string } {
    if (typeof c === 'string') return { text: c };
    if (Array.isArray(c)) {
      let text = '';
      let image = '';
      for (const p of c) {
        if (!p || typeof p !== 'object') continue;
        if (p.type === 'text') text += String(p.text ?? '');
        else if (p.type === 'image_url') image = String(p.image_url?.url ?? '');
      }
      return { text, ...(image ? { image } : {}) };
    }
    return { text: String(c ?? '') };
  }

  async _switchConv(id: string) {
    this._setActiveConv(id);
    this._showConvList = false;
    try {
      const detail = await getConversation(id);
      this._messages = (detail.messages || []).map((m): AiMessage => {
        const parsed = this._parseContent(m.content);
        const ts = this._fmtMsgTime(m.ts);
        return m.role === 'user'
          ? { role: 'user', text: parsed.text, ts, ...(parsed.image ? { image: parsed.image } : {}) }
          : {
              role: 'assistant',
              text: parsed.text,
              ts,
              tools: (m.toolCalls || []).map((tc) => ({
                name: tc.name, command: cmdOf(tc.args), ok: tc.ok, result: tc.result, running: false,
              })),
            };
      });
    } catch {
      this._messages = [];
    }
    // 有内容 → 对话视图；空会话 → 首页快捷卡片
    this._view = this._messages.length ? 'chat' : 'home';
    this._scrollChat();
  }

  async _deleteConv(id: string) {
    this._deletingConv = true;
    try {
      await deleteConversation(id);
    } catch {
      // 服务端删除失败时不假装成功,列表保持不变并提示
      this._deletingConv = false;
      this._confirmDeleteConv = null;
      this._toast?.show(L('chat.deleteFailed'));
      return;
    }
    this._deletingConv = false;
    this._confirmDeleteConv = null;
    this._conversations = this._conversations.filter((c) => c.id !== id);
    if (this._activeConv === id) {
      this._setActiveConv(this._conversations[0]?.id || '');
      this._messages = [];
      this._view = 'home';
    }
  }

  get _filteredConvs() {
    if (!this._convSearch.trim()) return this._conversations;
    const q = this._convSearch.toLowerCase();
    return this._conversations.filter((c) => c.title.toLowerCase().includes(q));
  }

  // ── 发送 / 流式接收 ──

  _send() {
    const text = this._input.trim();
    if (!text || this._streaming) return;
    if (!this._assistantOnline) {
      this._toast?.show(L('ai.assistantOfflineHint'));
      return;
    }

    const image = this._uploadedImage;
    this._uploadedImage = null;
    const ts = this._fmtMsgTime(Date.now());
    this._messages = [
      ...this._messages,
      { role: 'user', text, ts, ...(image ? { image } : {}) },
      { role: 'assistant', text: '', ts, tools: [] },
    ];
    this._input = '';
    requestAnimationFrame(() => {
      const ta = this.querySelector('.ai-input__textarea') as HTMLTextAreaElement;
      if (ta) { ta.style.height = 'auto'; ta.style.paddingTop = '8px'; ta.style.paddingBottom = '8px'; }
    });
    if (this._view !== 'chat') this._view = 'chat';
    this._streaming = true;
    this._scrollChat();

    const convId = this._activeConv || null;
    this._chatAbort = chat(convId, text, (ev) => this._onChatEvent(ev), this.engine, image);
  }

  _mutateLastAssistant(fn: (m: AiMessage) => AiMessage) {
    const msgs = [...this._messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') { msgs[i] = fn(msgs[i]); break; }
    }
    this._messages = msgs;
  }

  _onChatEvent(ev: AssistantEvent) {
    switch (ev.type) {
      case 'meta':
        if (ev.conversationId) this._activeConv = ev.conversationId;
        break;
      case 'tool-start':
        this._mutateLastAssistant((m) => ({
          ...m, tools: [...(m.tools || []), { name: ev.tool, command: cmdOf(ev.args), running: true }],
        }));
        break;
      case 'tool-end':
        this._mutateLastAssistant((m) => {
          const tools = [...(m.tools || [])];
          const target = cmdOf(ev.args);
          for (let i = tools.length - 1; i >= 0; i--) {
            if (tools[i].running && tools[i].command === target) {
              tools[i] = { ...tools[i], ok: ev.ok, result: ev.result, running: false };
              break;
            }
          }
          return { ...m, tools };
        });
        break;
      case 'content':
        this._mutateLastAssistant((m) => ({ ...m, text: (m.text || '') + ev.content }));
        break;
      case 'error':
        this._mutateLastAssistant((m) => ({ ...m, text: (m.text || '') + `\n⚠️ ${ev.error}`, error: true }));
        break;
      case 'done':
        this._streaming = false;
        this._chatAbort = null;
        void this._refreshConvs();
        break;
    }
    this._scrollChat();
  }

  _onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._send(); }
  }

  /** 滚动到最新消息：置标记，待本周期渲染完成后由 updated() 兜底滚动
   * （双 rAF 等布局稳定 + 定时兜底等 markdown 异步渲染，避免拿到旧 DOM） */
  _scrollToBottom = false;

  _scrollChat() {
    this._scrollToBottom = true;
    this.requestUpdate();
  }

  _doScroll() {
    // 优先滚动最后一条消息本身：scrollIntoView 会自动找到真正可滚动的祖先
    const msgs = this.shadowRoot ? this.shadowRoot.querySelectorAll('.ai-chat__msg') : [];
    const last = msgs.length ? msgs[msgs.length - 1] : null;
    if (last) {
      last.scrollIntoView({ block: 'end', behavior: 'auto' });
      return;
    }
    const el = this.querySelector('.ai-chat__messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  updated() {
    if (this._scrollToBottom) {
      this._scrollToBottom = false;
      requestAnimationFrame(() => requestAnimationFrame(() => this._doScroll()));
      setTimeout(() => this._doScroll(), 120);
    }
  }

  // ── 设置（仅状态展示，模型由助手服务自身配置）──

  _openSettings() {
    this._settingsOpen = true;
  }

  _closeSettings() { this._settingsOpen = false; }

  // ── 其他 ──

  _triggerFileInput() { if (this._fileInput) this._fileInput.click(); }

  _handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { this._uploadedImage = ev.target?.result as string; this.requestUpdate(); };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // ── 渲染 ──

  render() {
    const margin = this._showConvList ? '280px' : '0';
    return html`
      <!-- Toolbar -->
      <div class="ai-toolbar" style="margin-left:${margin}; transition: margin-left var(--duration-normal) var(--ease-out);">
        <div class="ai-toolbar__title">
          <button class="ai-toolbar__menu" @click=${this._toggleConvList} title=${L('ai.convList')}>
            ${this._showConvList ? icons['panel-left-close'] : icons['menu']}
          </button>
          <span>${L('tabs.ai')}</span>
          ${!this._assistantOnline
            ? html`<span class="ai-toolbar__badge">${L('ai.statusOffline')}</span>`
            : !this._configured ? html`<span class="ai-toolbar__badge">${L('ai.notConfigured')}</span>` : ''}
        </div>
        <div class="ai-toolbar__actions">
          <button class="btn-settings ${this._settingsOpen ? 'active' : ''}" @click=${this._openSettings}>${icons['settings']} ${L('ai.settings')}</button>
        </div>
      </div>

      <div class="ai-layout ${this._showConvList ? 'with-list' : ''}">
        <!-- 会话列表 -->
        <div class="ai-sidebar">
          <div class="ai-sidebar__header">
            <span class="ai-sidebar__title">${L('ai.convList')}</span>
            <div class="ai-sidebar__actions">
              <button title=${L('ai.newConv')} @click=${this._newConversation}>${icons['plus']}</button>
              <button @click=${this._toggleConvList}>${icons['x']}</button>
            </div>
          </div>
          <div class="ai-sidebar__search">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder=${L('ai.searchConv')} .value=${this._convSearch}
              @input=${(e: Event) => { this._convSearch = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
          </div>
          <div class="ai-sidebar__list">
            ${this._filteredConvs.length === 0
              ? html`<div style="padding:20px 12px;color:var(--muted);font-size:13px;text-align:center;">${L('ai.newConv')}</div>`
              : this._filteredConvs.map((c) => html`
                <div class="ai-sidebar__item ${this._activeConv === c.id ? 'active' : ''}" @click=${() => this._switchConv(c.id)}>
                  <div class="ai-sidebar__item-header">
                    <span class="ai-sidebar__item-title">${c.title}</span>
                    ${this._confirmDeleteConv === c.id ? html`
                      <span class="ai-sidebar__item-confirm" @click=${(e: Event) => e.stopPropagation()}>
                        <button class="yes" ?disabled=${this._deletingConv} @click=${() => this._deleteConv(c.id)}>${L('chat.deleteConfirmYes')}</button>
                        <button class="no" ?disabled=${this._deletingConv} @click=${() => { this._confirmDeleteConv = null; }}>${L('chat.deleteConfirmNo')}</button>
                      </span>
                    ` : html`
                      <button class="ai-sidebar__item-delete" title=${L('chat.deleteSession')}
                        @click=${(e: Event) => { e.stopPropagation(); this._confirmDeleteConv = c.id; }}>
                        ${icons['trash']}
                      </button>
                    `}
                  </div>
                  <div class="ai-sidebar__item-preview">${c.count ? `${c.count} ${L('ai.msgCount')}` : L('ai.newConv')}</div>
                  <div class="ai-sidebar__item-time">${c.ts}</div>
                </div>
              `)}
          </div>
        </div>

        <!-- Main -->
        <div class="ai-main" style="margin-left:${margin}; transition: margin-left var(--duration-normal) var(--ease-out);">
          ${this._view === 'chat' ? this._renderChat() : this._renderHome()}
        </div>
      </div>

      ${this._settingsOpen ? this._renderSettingsModal() : ''}
      <oc-toast></oc-toast>
    `;
  }

  _renderHome() {
    return html`
      <div class="ai-home">
        <div class="ai-home__welcome">
          <div class="ai-home__icon">✨</div>
          <div class="ai-home__title">${L('tabs.ai')}</div>
          <div class="ai-home__subtitle">${L('ai.greeting')}</div>
        </div>
        <div class="ai-home__tip">
          <span class="ai-home__tip-badge">${L('ai.builtInBadge')}</span>
          <div class="ai-home__tip-text">${this._isHermes ? L('ai.builtInDescHermes') : this._isCodex ? L('ai.builtInDescCodex') : L('ai.builtInDesc')}</div>
        </div>
        <div class="ai-home__grid">
          ${this._functionCards.map((c) => html`
            <div class="ai-home__card" @click=${() => { this._input = L(c.descKey); }}>
              <div class="ai-home__card-inner">
                <div class="ai-home__card-icon">${icons[c.icon] || icons['circle']}</div>
                <div>
                  <div class="ai-home__card-title">${L(c.titleKey)}</div>
                  <div class="ai-home__card-desc">${L(c.descKey)}</div>
                </div>
              </div>
            </div>
          `)}
        </div>
        ${this._renderInput()}
      </div>
    `;
  }

  _renderChat() {
    let lastAssistantIdx = -1;
    for (let i = this._messages.length - 1; i >= 0; i--) {
      if (this._messages[i].role === 'assistant') { lastAssistantIdx = i; break; }
    }
    return html`
      <div class="ai-chat">
        <div class="ai-chat__messages">
          ${this._messages.length === 0 ? html`
            <div class="ai-chat__empty"><div class="ai-chat__empty-icon">💬</div><div>${L('ai.startChat')}</div></div>
          ` : this._messages.map((m, idx) => {
            const typing = idx === lastAssistantIdx && this._streaming;
            return html`
              <div class="ai-chat__msg ${m.role}">
                <div class="ai-chat__msg-avatar">${m.role === 'user' ? 'U' : 'AI'}</div>
                <div class="ai-chat__msg-body">
                  ${m.image ? html`<img class="ai-chat__msg-image" src=${m.image} alt="attachment" />` : ''}
                  <div class="ai-chat__msg-meta">${m.role === 'user' ? 'You' : 'Assistant'}${m.ts ? ` · ${m.ts}` : ''}</div>
                  ${(m.tools && m.tools.length) ? html`<div class="ai-chat__tools">${m.tools.map((t) => this._renderToolCard(t))}</div>` : ''}
                  ${m.text
                    ? (m.role === 'assistant' && !m.error
                        ? html`<div class="ai-chat__msg-md"><oc-markdown .text=${m.text}></oc-markdown>${typing ? html`<span class="ai-cursor">▋</span>` : ''}</div>`
                        : html`<div class="ai-chat__msg-text ${m.error ? 'is-error' : ''}">${m.text}${typing ? html`<span class="ai-cursor">▋</span>` : ''}</div>`)
                    : (typing ? html`<div class="ai-chat__msg-text ai-thinking">${L('ai.thinking')}<span class="ai-cursor">▋</span></div>` : '')}
                </div>
              </div>`;
          })}
        </div>
        ${this._renderInput()}
      </div>
    `;
  }

  _renderToolCard(t: ToolCardView) {
    const state = t.running ? 'run' : (t.ok ? 'ok' : 'err');
    return html`
      <div class="ai-tool ${state}">
        <div class="ai-tool__head">
          <span class="ai-tool__name">⚙ ${t.name}</span>
          <code class="ai-tool__cmd">$ ${t.command}</code>
        </div>
        <pre class="ai-tool__out">${t.running ? L('ai.cmdRunning') : ((t.ok ? '' : '✗ ') + (t.result || L('ai.cmdNoOutput')))}</pre>
      </div>
    `;
  }

  _renderSettingsModal() {
    return html`
      <div class="modal-overlay" @click=${(e: MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) this._closeSettings();
      }}>
        <div class="modal-dialog">
          <div class="modal-header">${L('ai.settingsTitle')}</div>
          <div class="modal-body">
            <div class="assistant-status-line">
              ${L('ai.assistantStatus')}：
              ${!this._assistantOnline
                ? html`<span class="status-off">${L('ai.statusOffline')}</span>`
                : this._configured
                  ? html`<span class="status-on">${L('ai.statusReady')} · ${this._assistantModel}</span>`
                  : html`<span class="status-off">${L('ai.statusKeyMissing')}</span>`}
            </div>
          </div>
          <div class="modal-footer">
            <button @click=${this._closeSettings}>${L('ai.cancel')}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderInput() {
    return html`
      <div class="ai-input">
        ${this._uploadedImage ? html`
          <div class="ai-input__image-preview">
            <img src=${this._uploadedImage} alt="preview" />
            <button class="ai-input__image-remove" @click=${() => { this._uploadedImage = null; }}>${icons['x']}</button>
          </div>
        ` : ''}
        <div class="ai-input__row ${this._uploadedImage ? 'has-image' : ''}">
          <input type="file" id="ai-file-input" accept="image/*" style="display:none" @change=${this._handleFileSelect} />
          <button class="ai-input__attach" title=${L('ai.attachTitle')} @click=${this._triggerFileInput}>${icons['image']}</button>
          <textarea class="ai-input__textarea" placeholder=${L('ai.placeholder')} .value=${this._input}
            @input=${(e: Event) => {
              const t = e.target as HTMLTextAreaElement;
              this._input = t.value;
              t.style.height = 'auto';
              t.style.height = t.scrollHeight + 'px';
              const row = t.closest('.ai-input__row') as HTMLElement;
              if (row) {
                const isMulti = t.scrollHeight > 36;
                row.style.alignItems = isMulti ? 'end' : 'center';
                t.style.paddingTop = isMulti ? '4px' : '8px';
                t.style.paddingBottom = isMulti ? '4px' : '8px';
              }
            }}
            @keydown=${this._onKeydown}
          ></textarea>
          <button class="ai-input__send" @click=${this._send}>${icons['send']}</button>
        </div>
        <div class="ai-input__hint">${L('ai.hint')}</div>
      </div>
    `;
  }
}

customElements.define('ai-page', AiPage);
