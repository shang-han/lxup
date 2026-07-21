import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import type { GatewayStore } from '../store/gateway-store.js';
import { getActiveModel, hasAnyModel, type ResolvedModel } from '../utils/model-config.js';
import '../components/oc-toast.js';
import pageStyles from './styles.css?raw';

/** 从 chat.history 的消息里提取可展示文本（user 是字符串；assistant 是 parts 数组取 type:'text'） */
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

export class AiPage extends LitElement {
  static styles = css`
    :host { display: flex; flex-direction: column; height: 100%; }
    ${unsafeCSS(pageStyles)}
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _view: 'home' | 'chat' = 'home';
  @state() _mode: 'chat' | 'plan' | 'execute' | 'infinite' = 'infinite';
  @query('oc-toast') _toast!: HTMLElement & { show: (msg: string) => void };
  @state() _showConvList = false;
  @state() _settingsOpen = false;
  @state() _settingsTab = 'api';
  @state() _configured = false;
  @state() _input = '';
  @state() _messages: Array<{role:string; text:string; ts:string}> = [];
  @state() _conversations = [
    { id:'c1', title:'检查配置问题', preview:'帮我检查一下配置...', ts:'今天 10:30', pinned:true },
    { id:'c2', title:'诊断 Gateway 报错', preview:'Gateway 连接失败...', ts:'今天 09:15', pinned:false },
    { id:'c3', title:'分析最近日志', preview:'日志中有大量超时...', ts:'昨天 16:42', pinned:false },
    { id:'c4', title:'PR 流程咨询', preview:'帮我 review 代码...', ts:'昨天 14:08', pinned:false },
    { id:'c5', title:'Skills 安装', preview:'如何安装新技能...', ts:'7月13日', pinned:false },
  ];
  @state() _activeConv = 'c1';
  @state() _convSearch = '';
  @state() _apiBase = 'https://api.openai.com/v1';
  @state() _apiType = 'openai';
  @state() _apiKey = '';
  @state() _model = 'gpt-4o / deepseek-chat';
  @state() _temperature = '0.7';
  @state() _backupEnabled = false;
  @state() _saved = false;

  // Tools
  @state() _toolTerminal = false;
  @state() _toolFile = false;
  @state() _toolWeb = false;
  @state() _autoExecRounds = '8';

  // Persona
  @state() _personaSource = 'default';
  @state() _personaName = L('ai.assistantName');
  @state() _personaDesc = L('ai.assistantPersonaDesc');

  // Knowledge base
  @state() _uploadedImage: string | null = null;
  @query('#ai-file-input') _fileInput!: HTMLInputElement;

  // Real streaming chat
  @state() _streaming = false;
  @state() _runId: string | null = null;
  _store!: GatewayStore;
  _eventUnsubs: Array<() => void> = [];
  _historyLoaded = false;

  connectedCallback() {
    super.connectedCallback();
    this._store = getSharedStore();
    // 订阅真实 OpenClaw 网关的 chat 流式事件（单一 "chat" 事件，按 state 分发）；
    // 并在网关连上后加载历史记录（连接是异步的，不能在 connectedCallback 直接加载）
    this._eventUnsubs = [
      this._store.onEvent('chat', (p) => this._onChatEvent(p)),
      this._store.subscribe((snap) => {
        if (snap.connected && !this._historyLoaded) {
          this._historyLoaded = true;
          this._loadHistory();
        }
      }),
    ];
  }

  /** 加载当前会话的历史记录（chat.history） */
  async _loadHistory() {
    if (!this._store || !this._store.connected) return;
    try {
      const res = await this._store.request<{ messages?: Array<Record<string, unknown>> }>(
        'chat.history', { sessionKey: this._sessionKey, limit: 100 },
      );
      const msgs = (res?.messages || [])
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: String(m.role),
          text: extractMessageText(m),
          ts: typeof m.timestamp === 'number' ? new Date(m.timestamp).toLocaleTimeString() : '',
        }))
        .filter(m => m.text);
      this._messages = msgs;
      this._scrollChat();
    } catch { /* 网关未就绪时忽略 */ }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._eventUnsubs.forEach(u => u());
    this._eventUnsubs = [];
  }

  get _sessionKey(): string {
    // 真实网关会话键格式 agent:<agentId>:<mainKey>，AI 助手用独立会话
    return 'agent:main:ai';
  }

  _onChatEvent(p: Record<string, unknown> | undefined) {
    if (!p || p.sessionKey !== this._sessionKey) return;
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
        else msgs.push({ role: 'assistant', text: deltaText, ts: new Date().toLocaleTimeString() });
      } else if (deltaText) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: last.text + deltaText };
        else msgs.push({ role: 'assistant', text: deltaText, ts: new Date().toLocaleTimeString() });
      }
      this._messages = msgs;
      this._scrollChat();
    } else if (state === 'final') {
      this._streaming = false;
      this._runId = null;
    } else if (state === 'aborted' || state === 'error') {
      this._streaming = false;
      this._runId = null;
      const errMsg = String(p.errorMessage ?? '请求失败');
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${errMsg}`, ts: new Date().toLocaleTimeString() }];
      this._scrollChat();
    }
  }

  _triggerFileInput() {
    if (this._fileInput) this._fileInput.click();
  }

  _handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        this._uploadedImage = ev.target?.result as string;
        this.requestUpdate();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  _quickProviders = [
    ['GPT+Claude推荐中转', '硅基流动', '火山引擎', '火山引擎 Coding'],
    ['阿里云百炼', '智谱 AI', 'MiniMax', 'Moonshot / Kimi', 'OpenAI 官方'],
    ['Anthropic 官方', 'DeepSeek', 'Google Gemini', 'xAI (Grok)', 'Groq'],
    ['OpenRouter', 'NVIDIA NIM', 'Ollama (本地)'],
  ];

  _functionCards = [
    { icon:'wrench', titleKey:'ai.checkConfig', descKey:'ai.checkConfigDesc' },
    { icon:'shield', titleKey:'ai.diagGateway', descKey:'ai.diagGatewayDesc' },
    { icon:'folder-open', titleKey:'ai.browseDir', descKey:'ai.browseDirDesc' },
    { icon:'monitor', titleKey:'ai.checkEnv', descKey:'ai.checkEnvDesc' },
    { icon:'scroll-text', titleKey:'ai.analyzeLogs', descKey:'ai.analyzeLogsDesc' },
    { icon:'refresh-cw', titleKey:'ai.oneClickFix', descKey:'ai.oneClickFixDesc' },
    { icon:'bug', titleKey:'ai.feedbackBug', descKey:'ai.feedbackBugDesc' },
    { icon:'zap', titleKey:'ai.prAssistant', descKey:'ai.prAssistantDesc' },
    { icon:'puzzle', titleKey:'ai.skillsMgmt', descKey:'ai.skillsMgmtDesc' },
  ];

  async _send() {
    const text = this._input.trim();
    if (!text || this._streaming) return;

    const ts = new Date().toLocaleTimeString();
    this._messages = [...this._messages, { role: 'user', text, ts }];
    this._input = '';
    requestAnimationFrame(() => {
      const ta = this.querySelector('.ai-input__textarea') as HTMLTextAreaElement;
      if (ta) {
        ta.style.height = 'auto';
        ta.style.paddingTop = '8px';
        ta.style.paddingBottom = '8px';
      }
    });
    if (this._view !== 'chat') this._view = 'chat';
    this._streaming = true;
    this._scrollChat();

    // 真实 OpenClaw 协议：chat.send 必须带 idempotencyKey（即 runId）。
    // 模型由网关的 agent 配置决定；人设（persona）属于 agent 配置，不随消息发送。
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
      if (ack && ack.runId) this._runId = ack.runId;
    } catch (e: unknown) {
      this._streaming = false;
      this._runId = null;
      const msg = e instanceof Error ? e.message : String(e);
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${msg}`, ts: new Date().toLocaleTimeString() }];
      this._scrollChat();
    }
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

  _saveSettings() {
    this._configured = true;
    this._saved = true;
    this._settingsOpen = false;
    setTimeout(() => { this._saved = false; this.requestUpdate(); }, 2000);
  }

  _closeSettings() {
    this._settingsOpen = false;
  }

  _toggleConvList() { this._showConvList = !this._showConvList; }

  _setMode(mode: 'chat' | 'plan' | 'execute' | 'infinite') {
    this._mode = mode;
    this._toast?.show(`${L(`ai.mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`)}${L('ai.modeSwitched')}`);
  }

  _newConversation() {
    const id = 'c' + Date.now();
    this._conversations = [{ id, title: L('ai.newChat'), preview:'', ts: L('ai.justNow'), pinned:false }, ...this._conversations];
    this._activeConv = id;
    this._messages = [];
    this._view = 'chat';
    this._showConvList = false;
    this.requestUpdate();
  }

  _switchConv(id: string) {
    this._activeConv = id;
    this._messages = [];
    this._showConvList = false;
    this.requestUpdate();
  }

  _deleteConv(id: string, e: Event) {
    e.stopPropagation();
    this._conversations = this._conversations.filter(c => c.id !== id);
    if (this._activeConv === id) {
      this._activeConv = this._conversations[0]?.id || '';
      this._messages = [];
    }
    this.requestUpdate();
  }

  get _filteredConvs() {
    if (!this._convSearch.trim()) return this._conversations;
    const q = this._convSearch.toLowerCase();
    return this._conversations.filter(c => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
  }

  _apiTypeLabel(type: string): string {
    const map: Record<string, string> = {
      openai: 'OpenAI Chat Completions',
      anthropic: 'Anthropic Messages',
      google: 'Google Gemini',
      ollama: 'Ollama',
    };
    return map[type] || type;
  }

  render() {
    const margin = this._showConvList ? '280px' : '0';
    return html`
      <!-- Toolbar -->
      <div class="ai-toolbar" style="margin-left:${margin}; transition: margin-left var(--duration-normal) var(--ease-out);">
        <div class="ai-toolbar__title">
          <button class="ai-toolbar__menu" @click=${this._toggleConvList} title="对话列表">
            ${this._showConvList ? icons['panel-left-close'] : icons['menu']}
          </button>
          <span>${L('tabs.ai')}</span>
          ${!this._configured ? html`<span class="ai-toolbar__badge">${L('ai.notConfigured')}</span>` : ''}
        </div>
        <div class="ai-toolbar__actions">
          <button class="btn-mode ${this._mode==='chat'?'active':''}" title=${L('ai.modeChatHint')} @click=${() => this._setMode('chat')}>${icons['message-square']} ${L('ai.modeChat')}</button>
          <button class="btn-mode ${this._mode==='plan'?'active':''}" title=${L('ai.modePlanHint')} @click=${() => this._setMode('plan')}>${icons['list']} ${L('ai.modePlan')}</button>
          <button class="btn-mode ${this._mode==='execute'?'active':''}" title=${L('ai.modeExecuteHint')} @click=${() => this._setMode('execute')}>${icons['zap']} ${L('ai.modeExecute')}</button>
          <button class="btn-mode ${this._mode==='infinite'?'active':''}" title=${L('ai.modeInfiniteHint')} @click=${() => this._setMode('infinite')}>${icons['sparkles']} ${L('ai.modeInfinite')}</button>
          <button class="btn-settings ${this._settingsOpen?'active':''}"
                  @click=${() => this._settingsOpen = !this._settingsOpen}>${icons['settings']} ${L('ai.settings')}</button>
        </div>
      </div>

      <div class="ai-layout ${this._showConvList ? 'with-list' : ''}">
        <!-- Slide-in conversation list -->
        <div class="ai-sidebar">
          <div class="ai-sidebar__header">
            <span class="ai-sidebar__title">${L('ai.convList')}</span>
            <div class="ai-sidebar__actions">
              <button title=${L('ai.newConv')} @click=${this._newConversation}>
                ${icons['plus']}
              </button>
              <button @click=${this._toggleConvList}>
                ${icons['x']}
              </button>
            </div>
          </div>
          <div class="ai-sidebar__search">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder=${L('ai.searchConv')} .value=${this._convSearch}
              @input=${(e:Event) => { this._convSearch = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
          </div>
          <div class="ai-sidebar__list">
            ${this._filteredConvs.map((c:any) => html`
              <div class="ai-sidebar__item ${this._activeConv===c.id?'active':''}"
                   @click=${() => this._switchConv(c.id)}>
                <div class="ai-sidebar__item-header">
                  <span class="ai-sidebar__item-title">${c.pinned ? '📌 ' : ''}${c.title}</span>
                  <button class="ai-sidebar__item-delete"
                    @click=${(e:Event) => this._deleteConv(c.id, e)}>×</button>
                </div>
                <div class="ai-sidebar__item-preview">${c.preview || L('ai.newConv')}</div>
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

      <!-- Settings Modal -->
      ${this._settingsOpen ? this._renderSettingsModal() : ''}

      <!-- Toast -->
      <oc-toast></oc-toast>
    `;
  }

  _renderSettingsModal() {
    return html`
      <div class="modal-overlay" @click=${(e:MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) this._closeSettings();
      }}>
        <div class="modal-dialog">
          <div class="modal-header">${L('ai.settingsTitle')}</div>

          <!-- Tabs -->
          <div class="modal-tabs">
            <div class="modal-tab ${this._settingsTab==='api'?'active':''}" @click=${() => this._settingsTab='api'}>${L('ai.apiConfig')}</div>
            <div class="modal-tab ${this._settingsTab==='tools'?'active':''}" @click=${() => this._settingsTab='tools'}>${L('ai.tools')}</div>
            <div class="modal-tab ${this._settingsTab==='persona'?'active':''}" @click=${() => this._settingsTab='persona'}>${L('ai.persona')}</div>
            <div class="modal-tab ${this._settingsTab==='knowledge'?'active':''}" @click=${() => this._settingsTab='knowledge'}>${L('ai.knowledgeBase')}</div>
          </div>

          <!-- Body -->
          <div class="modal-body">
            ${this._settingsTab === 'api' ? this._renderSettingsApi() :
              this._settingsTab === 'tools' ? this._renderSettingsTools() :
              this._settingsTab === 'persona' ? this._renderSettingsPersona() :
              this._renderSettingsKnowledge()}
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button @click=${this._closeSettings}>${L('ai.cancel')}</button>
            <button class="btn-primary" @click=${this._saveSettings}>${this._saved ? '✓ ' + L('ai.saved') : L('ai.save')}</button>
          </div>
        </div>
      </div>
    `;
  }

  _renderSettingsApi() {
    return html`
      <!-- Quick Providers -->
      <div style="margin-bottom:16px;">
        <div class="settings-section-title">${L('ai.quickSelect')}</div>
        <div class="settings-providers">
          ${this._quickProviders.map((row:any) => html`
            <div class="settings-provider-row">
              ${row.map((p:string) => html`
                <button class="settings-provider-btn"
                  @click=${() => { this._apiBase = 'https://api.example.com/v1'; this.requestUpdate(); }}>${p}</button>
              `)}
            </div>
          `)}
        </div>
      </div>

      <!-- API Base + API Type -->
      <div style="display:flex; gap:12px;">
        <div class="settings-form-group" style="flex:1;">
          <label class="settings-label">API Base URL</label>
          <input class="settings-input" .value=${this._apiBase}
            @input=${(e:Event) => { this._apiBase = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
        </div>
        <div class="settings-form-group" style="width:180px; flex-shrink:0;">
          <label class="settings-label">${L('ai.apiType')}</label>
          <select class="settings-input" .value=${this._apiType}
            @change=${(e:Event) => { this._apiType = (e.target as HTMLSelectElement).value; this.requestUpdate(); }}>
            <option value="openai">OpenAI Chat Completions</option>
            <option value="anthropic">Anthropic Messages</option>
            <option value="google">Google Gemini</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
      </div>

      <!-- API Key -->
      <div class="settings-form-group">
        <label class="settings-label">API Key</label>
        <div class="settings-row">
          <input class="settings-input" type="password" .value=${this._apiKey} placeholder=${L('ai.apiKeyPlaceholder')}
            @input=${(e:Event) => { this._apiKey = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
          <button>${L('ai.testConn')}</button>
          <button>${L('ai.getList')}</button>
          <button style="font-size:11px;"> ${L('ai.importConfig')}</button>
        </div>
      </div>

      <!-- Model + Temperature -->
      <div style="display:flex; gap:12px;">
        <div class="settings-form-group" style="flex:1;">
          <label class="settings-label">${L('ai.model')}</label>
          <input class="settings-input" .value=${this._model}
            @input=${(e:Event) => { this._model = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
        </div>
        <div class="settings-form-group" style="width:100px; flex-shrink:0;">
          <label class="settings-label">${L('ai.temperature')}</label>
          <input class="settings-input" type="number" step="0.1" min="0" max="2" .value=${this._temperature}
            @input=${(e:Event) => { this._temperature = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
        </div>
      </div>

      <div class="settings-hint" style="margin-bottom:12px;">${L('ai.compatHint')}</div>

      <!-- Backup -->
      <div class="settings-toggle-row" @click=${() => { this._backupEnabled = !this._backupEnabled; this.requestUpdate(); }}>
        <input type="checkbox" ?checked=${this._backupEnabled} @click=${(e:Event) => e.stopPropagation()} />
        <span>🛡️ 备用模型组</span>
        <span class="count">${this._backupEnabled ? '1 启用' : '0 启用'}</span>
      </div>
    `;
  }

  _renderSettingsTools() {
    return html`
      <div class="settings-hint" style="margin-bottom:12px;">${L('ai.enableTools')}</div>

      <div class="tool-toggle-row">
        <div>
          <div class="tool-toggle-label">${L('ai.terminalCmd')}</div>
          <div class="tool-toggle-desc">${L('ai.terminalCmdDesc')}</div>
        </div>
        <label class="switch ${this._toolTerminal?'on':''}" @click=${() => { this._toolTerminal = !this._toolTerminal; this.requestUpdate(); }}></label>
      </div>
      <div class="tool-toggle-row">
        <div>
          <div class="tool-toggle-label">${L('ai.fileOps')}</div>
          <div class="tool-toggle-desc">${L('ai.fileOpsDesc')}</div>
        </div>
        <label class="switch ${this._toolFile?'on':''}" @click=${() => { this._toolFile = !this._toolFile; this.requestUpdate(); }}></label>
      </div>
      <div class="tool-toggle-row">
        <div>
          <div class="tool-toggle-label">${L('ai.webSearch')}</div>
          <div class="tool-toggle-desc">${L('ai.webSearchDesc')}</div>
        </div>
        <label class="switch ${this._toolWeb?'on':''}" @click=${() => { this._toolWeb = !this._toolWeb; this.requestUpdate(); }}></label>
      </div>

      <div class="settings-form-group" style="margin-top:16px;">
        <label class="settings-label">${L('ai.autoExecRounds')} <span style="color:var(--muted);">— ${L('ai.autoExecRoundsHint')}</span></label>
        <select class="settings-input" .value=${this._autoExecRounds}
          @change=${(e:Event) => { this._autoExecRounds = (e.target as HTMLSelectElement).value; this.requestUpdate(); }}>
          <option value="4">4</option>
          <option value="8">8 ${L('common.default')}</option>
          <option value="16">16</option>
          <option value="32">32</option>
          <option value="0">0（${L('ai.everyTimeAsk')}）</option>
        </select>
        <div class="settings-hint">${L('ai.alwaysAvail')}</div>
      </div>
    `;
  }

  _renderSettingsPersona() {
    return html`
      <div class="settings-section-title" style="margin-bottom:6px;">${L('ai.personaSource')}</div>
      <div class="persona-radio-group">
        <div class="persona-radio">
          <input type="radio" name="persona-source" value="default"
            ?checked=${this._personaSource==='default'}
            @change=${() => { this._personaSource = 'default'; this.requestUpdate(); }} />
          <label>${L('ai.aiDefault')}</label>
        </div>
        <div class="persona-radio">
          <input type="radio" name="persona-source" value="agent"
            ?checked=${this._personaSource==='agent'}
            @change=${() => { this._personaSource = 'agent'; this.requestUpdate(); }} />
          <label>${L('ai.openclawAgent')} <span class="hint">${L('ai.openclawAgentHint')}</span></label>
        </div>
      </div>

      <div class="persona-compact">
        <label class="settings-label">${L('ai.assistantName')}</label>
        <input class="settings-input" .value=${this._personaName}
          @input=${(e:Event) => { this._personaName = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
      </div>

      <div class="persona-compact">
        <label class="settings-label">${L('ai.assistantPersona')}</label>
        <textarea class="persona-textarea" .value=${this._personaDesc}
          @input=${(e:Event) => { this._personaDesc = (e.target as HTMLTextAreaElement).value; this.requestUpdate(); }}></textarea>
        <div class="settings-hint">${L('ai.personaHint')}</div>
      </div>
    `;
  }

  _renderSettingsKnowledge() {
    return html`
      <div class="kb-header">
        <div class="desc">${L('ai.kbCustom')}</div>
        <button class="kb-add-btn">+ ${L('ai.kbAdd')}</button>
      </div>
      ${this._kbEntries.length === 0 ? html`
        <div class="kb-empty">
          <div class="kb-empty-icon">📄</div>
          <div>${L('ai.kbEmpty')}</div>
        </div>
      ` : html`
        ${this._kbEntries.map((entry:any) => html`
          <div style="padding:10px 0; border-bottom:1px solid var(--border);">
            <div style="font-size:14px; font-weight:600; color:var(--text);">${entry.title}</div>
            <div style="font-size:12px; color:var(--text-soft);">${entry.desc}</div>
          </div>
        `)}
      `}
    `;
  }

  _renderHome() {
    return html`
      <div class="ai-home">
        <!-- Welcome -->
        <div class="ai-home__welcome">
          <div class="ai-home__icon">✨</div>
          <div class="ai-home__title">${L('tabs.ai')}</div>
          <div class="ai-home__subtitle">${L('ai.greeting')}</div>
        </div>

        <!-- Tip -->
        <div class="ai-home__tip">
          <span class="ai-home__tip-badge">${L('ai.builtInBadge')}</span>
          <div class="ai-home__tip-text">
            ${L('ai.builtInDesc')}
          </div>
          <button class="ai-home__tip-close">×</button>
        </div>

        <!-- Function Cards -->
        <div class="ai-home__grid">
          ${this._functionCards.map((c:any) => html`
            <div class="ai-home__card"
              @click=${() => { this._input = L(c.descKey); this._view = 'chat'; }}>
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

        <!-- Input -->
        ${this._renderInput()}
      </div>
    `;
  }

  _renderChat() {
    return html`
      <div class="ai-chat">
        <div class="ai-chat__messages">
          ${this._messages.length === 0 ? html`
            <div class="ai-chat__empty">
              <div class="ai-chat__empty-icon">💬</div>
              <div>${L('ai.startChat')}</div>
            </div>
          ` : this._messages.map((m:any) => html`
            <div class="ai-chat__msg ${m.role}">
              <div class="ai-chat__msg-avatar">${m.role==='user'?'U':'AI'}</div>
              <div class="ai-chat__msg-body">
                <div class="ai-chat__msg-meta">${m.role==='user'?'You':'Assistant'} · ${m.ts}</div>
                <div class="ai-chat__msg-text">${m.text}</div>
              </div>
            </div>
          `)}
        </div>
        ${this._renderInput()}
      </div>
    `;
  }

  _renderInput() {
    return html`
      <div class="ai-input">
        ${this._uploadedImage ? html`
          <div class="ai-input__image-preview">
            <img src=${this._uploadedImage} alt="preview" />
            <button class="ai-input__image-remove" @click=${() => this._uploadedImage = null}>
              ${icons['x']}
            </button>
          </div>
        ` : ''}
        <div class="ai-input__row ${this._uploadedImage ? 'has-image' : ''}">
          <input type="file" id="ai-file-input" accept="image/*" style="display:none"
            @change=${this._handleFileSelect} />
          <button class="ai-input__attach" title=${L('ai.attachTitle')}
            @click=${this._triggerFileInput}>
            ${icons['image']}
          </button>
          <textarea class="ai-input__textarea"
            placeholder=${L('ai.placeholder')}
            .value=${this._input}
            @input=${(e:Event) => {
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
          <button class="ai-input__send" @click=${this._send}>
            ${icons['send']}
          </button>
        </div>
        <div class="ai-input__hint">
          ${L('ai.hint')}
        </div>
      </div>
    `;
  }
}

customElements.define('ai-page', AiPage);
