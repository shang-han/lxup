import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getActiveModel, listModels, type ResolvedModel } from '../utils/model-config.js';
import {
  getStatus, saveConfig, listConversations, createConversation, getConversation,
  deleteConversation, chat, type AssistantEvent,
} from '../services/ai.js';
import '../components/oc-toast.js';
import pageStyles from './styles.css?raw';

/** 聊天里展示的一次命令（工具）调用 */
type ToolCardView = { name: string; command: string; ok?: boolean; result?: string; running: boolean };
/** 本地聊天消息（assistant 可携带命令卡片） */
type AiMessage = { role: 'user' | 'assistant'; text: string; ts: string; tools?: ToolCardView[]; error?: boolean };

const modelKey = (m: { providerId: string; model: string }) => `${m.providerId}::${m.model}`;
const cmdOf = (args: Record<string, unknown>) =>
  typeof args.command === 'string' && args.command ? args.command : JSON.stringify(args);

export class AiPage extends LitElement {
  static styles = css`
    :host { display: flex; flex-direction: column; height: 100%; }
    ${unsafeCSS(pageStyles)}

    /* ── 模型选择（简化设置）── */
    .model-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; max-height: 320px; overflow-y: auto; }
    .model-row {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .model-row:hover { background: var(--bg-hover); }
    .model-row.selected { border-color: var(--accent); background: var(--accent-subtle); }
    .model-row input { accent-color: var(--accent); margin: 0; }
    .model-provider { font-weight: 600; font-size: 13px; color: var(--text-strong); }
    .model-id { font-family: var(--font-mono); font-size: 12px; color: var(--text-soft); }
    .model-primary { margin-left: auto; font-size: 11px; color: var(--warn); white-space: nowrap; }
    .assistant-status-line { font-size: 12px; color: var(--text-soft); padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--border); }
    .status-on { color: var(--success); }
    .status-off { color: var(--danger); }
    .ai-empty-models { padding: 22px 16px; text-align: center; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); color: var(--text-soft); }

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
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _view: 'home' | 'chat' = 'home';
  @state() _mode: 'chat' | 'plan' | 'execute' | 'infinite' = 'infinite';
  @query('oc-toast') _toast!: HTMLElement & { show: (msg: string) => void };
  @state() _showConvList = false;
  @state() _settingsOpen = false;
  @state() _input = '';
  @state() _saved = false;

  // 助手服务状态
  @state() _assistantOnline = false;
  @state() _configured = false;
  @state() _assistantModel = '';

  // 模型选择（来自「模型配置」页）
  @state() _models: ResolvedModel[] = [];
  @state() _selectedModelKey = '';

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

  _functionCards = [
    { icon: 'wrench', titleKey: 'ai.checkConfig', descKey: 'ai.checkConfigDesc' },
    { icon: 'shield', titleKey: 'ai.diagGateway', descKey: 'ai.diagGatewayDesc' },
    { icon: 'folder-open', titleKey: 'ai.browseDir', descKey: 'ai.browseDirDesc' },
    { icon: 'monitor', titleKey: 'ai.checkEnv', descKey: 'ai.checkEnvDesc' },
    { icon: 'scroll-text', titleKey: 'ai.analyzeLogs', descKey: 'ai.analyzeLogsDesc' },
    { icon: 'refresh-cw', titleKey: 'ai.oneClickFix', descKey: 'ai.oneClickFixDesc' },
    { icon: 'bug', titleKey: 'ai.feedbackBug', descKey: 'ai.feedbackBugDesc' },
    { icon: 'zap', titleKey: 'ai.prAssistant', descKey: 'ai.prAssistantDesc' },
    { icon: 'puzzle', titleKey: 'ai.skillsMgmt', descKey: 'ai.skillsMgmtDesc' },
  ];

  connectedCallback() {
    super.connectedCallback();
    void this._boot();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._chatAbort?.abort();
  }

  async _boot() {
    this._models = listModels();
    const active = getActiveModel();
    if (active) this._selectedModelKey = modelKey(active);
    try {
      const s = await getStatus();
      this._assistantOnline = true;
      this._configured = s.hasKey;
      this._assistantModel = s.model;
    } catch {
      this._assistantOnline = false;
    }
    await this._refreshConvs();
    if (this._conversations.length) await this._switchConv(this._conversations[0].id);
  }

  async _refreshConvs() {
    try {
      this._conversations = await listConversations();
    } catch { /* 助手离线时忽略 */ }
  }

  // ── 会话操作 ──

  _toggleConvList() { this._showConvList = !this._showConvList; }

  async _newConversation() {
    try {
      const c = await createConversation();
      this._conversations = [c, ...this._conversations];
      this._activeConv = c.id;
      this._messages = [];
      this._view = 'chat';
      this._showConvList = false;
    } catch (e) {
      this._toast?.show(e instanceof Error ? e.message : String(e));
    }
  }

  async _switchConv(id: string) {
    this._activeConv = id;
    this._showConvList = false;
    try {
      const detail = await getConversation(id);
      this._messages = (detail.messages || []).map((m): AiMessage =>
        m.role === 'user'
          ? { role: 'user', text: m.content, ts: '' }
          : {
              role: 'assistant',
              text: m.content,
              ts: '',
              tools: (m.toolCalls || []).map((tc) => ({
                name: tc.name, command: cmdOf(tc.args), ok: tc.ok, result: tc.result, running: false,
              })),
            },
      );
    } catch {
      this._messages = [];
    }
    this._scrollChat();
  }

  async _deleteConv(id: string, e: Event) {
    e.stopPropagation();
    try { await deleteConversation(id); } catch { /* ignore */ }
    this._conversations = this._conversations.filter((c) => c.id !== id);
    if (this._activeConv === id) {
      this._activeConv = this._conversations[0]?.id || '';
      this._messages = [];
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

    const ts = new Date().toLocaleTimeString();
    this._messages = [
      ...this._messages,
      { role: 'user', text, ts },
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
    this._chatAbort = chat(convId, text, (ev) => this._onChatEvent(ev));
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

  _scrollChat() {
    requestAnimationFrame(() => {
      const el = this.querySelector('.ai-chat__messages');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  // ── 设置（模型选择）──

  _openSettings() {
    this._models = listModels();
    if (!this._selectedModelKey) {
      const a = getActiveModel();
      if (a) this._selectedModelKey = modelKey(a);
    }
    this._settingsOpen = true;
  }

  _closeSettings() { this._settingsOpen = false; }

  async _saveSettings() {
    const m = this._models.find((x) => modelKey(x) === this._selectedModelKey);
    if (!m) return;
    try {
      await saveConfig({ baseUrl: m.baseUrl, apiKey: m.apiKey, model: m.model });
      this._configured = true;
      this._assistantModel = m.model;
      this._saved = true;
      this._settingsOpen = false;
      this._toast?.show(L('ai.saved'));
      setTimeout(() => { this._saved = false; this.requestUpdate(); }, 2000);
    } catch (e) {
      this._toast?.show(e instanceof Error ? e.message : String(e));
    }
  }

  // ── 其他 ──

  _setMode(mode: 'chat' | 'plan' | 'execute' | 'infinite') {
    this._mode = mode;
    this._toast?.show(`${L(`ai.mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`)}${L('ai.modeSwitched')}`);
  }

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
          <button class="btn-mode ${this._mode === 'chat' ? 'active' : ''}" title=${L('ai.modeChatHint')} @click=${() => this._setMode('chat')}>${icons['message-square']} ${L('ai.modeChat')}</button>
          <button class="btn-mode ${this._mode === 'plan' ? 'active' : ''}" title=${L('ai.modePlanHint')} @click=${() => this._setMode('plan')}>${icons['list']} ${L('ai.modePlan')}</button>
          <button class="btn-mode ${this._mode === 'execute' ? 'active' : ''}" title=${L('ai.modeExecuteHint')} @click=${() => this._setMode('execute')}>${icons['zap']} ${L('ai.modeExecute')}</button>
          <button class="btn-mode ${this._mode === 'infinite' ? 'active' : ''}" title=${L('ai.modeInfiniteHint')} @click=${() => this._setMode('infinite')}>${icons['sparkles']} ${L('ai.modeInfinite')}</button>
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
                    <button class="ai-sidebar__item-delete" @click=${(e: Event) => this._deleteConv(c.id, e)}>×</button>
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
          <div class="ai-home__tip-text">${L('ai.builtInDesc')}</div>
        </div>
        <div class="ai-home__grid">
          ${this._functionCards.map((c) => html`
            <div class="ai-home__card" @click=${() => { this._input = L(c.descKey); this._view = 'chat'; }}>
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
                  <div class="ai-chat__msg-meta">${m.role === 'user' ? 'You' : 'Assistant'}${m.ts ? ` · ${m.ts}` : ''}</div>
                  ${(m.tools && m.tools.length) ? html`<div class="ai-chat__tools">${m.tools.map((t) => this._renderToolCard(t))}</div>` : ''}
                  ${m.text
                    ? html`<div class="ai-chat__msg-text ${m.error ? 'is-error' : ''}">${m.text}${typing ? html`<span class="ai-cursor">▋</span>` : ''}</div>`
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
            <div class="settings-section-title">${L('ai.selectModel')}</div>
            <div class="settings-hint" style="margin-bottom:12px;">${L('ai.selectModelHint')}</div>
            ${this._models.length === 0 ? html`
              <div class="ai-empty-models">
                <div style="font-weight:600;margin-bottom:6px;color:var(--text);">${L('ai.noModels')}</div>
                <div class="settings-hint">${L('ai.noModelsHint')}</div>
              </div>
            ` : html`
              <div class="model-list">
                ${this._models.map((m) => {
                  const key = modelKey(m);
                  return html`
                    <label class="model-row ${this._selectedModelKey === key ? 'selected' : ''}">
                      <input type="radio" name="ai-model" .checked=${this._selectedModelKey === key}
                        @change=${() => { this._selectedModelKey = key; this.requestUpdate(); }} />
                      <span class="model-provider">${m.providerName || m.providerId}</span>
                      <span class="model-id">${m.model}</span>
                      ${m.isPrimary ? html`<span class="model-primary">★ ${L('ai.primaryTag')}</span>` : ''}
                    </label>`;
                })}
              </div>
            `}
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
            <button class="btn-primary" ?disabled=${this._models.length === 0} @click=${this._saveSettings}>
              ${this._saved ? '✓ ' + L('ai.saved') : L('ai.save')}
            </button>
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
