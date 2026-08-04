import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import { getStoredHermesUrl, setHermesUrl } from '../services/hermes-client.js';
/** 服务商预设（OpenAI 兼容端点；点击自动填充 Base URL 与默认模型） */
const PROVIDER_PRESETS: Array<{ name: string; baseUrl: string; model?: string }> = [
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: '火山引擎', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3' },
  { name: '火山引擎 Coding', baseUrl: 'https://ark.cn-beijing.volces.com/api/coding/v3' },
  { name: '阿里云百炼', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4' },
  { name: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1' },
  { name: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1' },
  { name: 'OpenAI 官方', baseUrl: 'https://api.openai.com/v1' },
  { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  { name: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1' },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
  { name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1' },
  { name: 'Ollama (本地)', baseUrl: 'http://localhost:11434/v1' },
];
import '../components/page-header.js';

const TERMINAL_COMMANDS = [
  { cmd: 'hermes chat', desc: L('hermesDashboard.cmdChatDesc'), subdesc: L('hermesDashboard.cmdChatSub') },
  { cmd: 'hermes doctor', desc: L('hermesDashboard.cmdDoctorDesc'), subdesc: L('hermesDashboard.cmdDoctorSub') },
  { cmd: 'hermes version', desc: L('hermesDashboard.cmdVersionDesc'), subdesc: L('hermesDashboard.cmdVersionSub') },
  { cmd: 'hermes gateway run', desc: L('hermesDashboard.cmdGatewayRunDesc'), subdesc: L('hermesDashboard.cmdGatewayRunSub') },
  { cmd: 'hermes gateway stop', desc: L('hermesDashboard.cmdGatewayStopDesc'), subdesc: L('hermesDashboard.cmdGatewayStopSub') },
  { cmd: 'explorer %USERPROFILE%\\.hermes', desc: L('hermesDashboard.cmdExplorerDesc'), subdesc: L('hermesDashboard.cmdExplorerSub') },
];

export class HermesDashboardPage extends LitElement {
  static styles = css`
    :host { display: block; }
    /* Shadow DOM 不继承文档级 *{box-sizing:border-box}；
       不加这条，width:100% 的输入框会因 padding+border 溢出列宽（重叠/出卡片） */
    :host *, :host *::before, :host *::after { box-sizing: border-box; }

    .hermes-dashboard { width: 100%; }

    /* === status cards === */
    .hermes-status-row {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 900px) { .hermes-status-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 600px) { .hermes-status-row { grid-template-columns: 1fr; } }
    .hermes-status-card {
      padding: 20px; border-right: 1px solid var(--border);
    }
    .hermes-status-card:last-child { border-right: none; }
    .hermes-status-card__label {
      font-size: 12px; color: var(--muted); margin-bottom: 8px;
    }
    .hermes-status-card__value {
      font-size: 14px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .hermes-status-card__sub {
      font-size: 12px; color: var(--text-soft);
    }
    .hermes-status-card__status {
      display: flex; align-items: center; gap: 6px;
    }
    .hermes-status-card__dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .hermes-status-card__dot.stopped { background: var(--danger); }
    .hermes-status-card__dot.running { background: var(--success); }

    /* === section card === */
    .hermes-section {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .hermes-section__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }
    .hermes-section__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hermes-section__title svg { color: var(--accent); }
    .hermes-section__badge {
      font-size: 12px; padding: 2px 8px; border-radius: var(--radius-full);
      background: var(--bg-muted); color: var(--muted); font-weight: 500;
    }
    .hermes-section__badge.ok { background: var(--success-subtle); color: var(--success); }
    .hermes-save-msg { font-size: 12px; font-weight: 500; }
    .hermes-save-msg.ok { color: var(--success); }
    .hermes-save-msg.err { color: var(--danger); }

    /* === API Key 可视开关 === */
    .hermes-key-wrap { position: relative; flex: 1; }
    .hermes-key-wrap .hermes-form-input { width: 100%; padding-right: 34px; }
    .hermes-key-eye {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      width: 22px; height: 22px; display: grid; place-items: center;
      background: transparent; border: none; cursor: pointer;
      color: var(--muted); border-radius: var(--radius-sm);
      transition: color var(--duration-fast), background var(--duration-fast);
    }
    .hermes-key-eye:hover { color: var(--text); background: var(--bg-hover); }
    .hermes-key-eye svg { width: 14px; height: 14px; }
    .hermes-section__link {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      display: flex; align-items: center; gap: 4px;
    }
    .hermes-section__link:hover { color: var(--text); }

    /* === connection target === */
    .hermes-conn-targets { display: flex; gap: 8px; margin-bottom: 10px; }
    .hermes-conn-target {
      padding: 6px 14px; border-radius: var(--radius-full); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hermes-conn-target.active {
      /* text-strong 底 + bg 字：深/亮两种模式都高对比（原 accent-foreground 在深色下白底白字） */
      background: var(--text-strong); color: var(--bg); border-color: var(--text-strong);
    }
    .hermes-conn-target:hover:not(.active) { background: var(--bg-hover); color: var(--text); }
    .hermes-apply-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--bg);
      transition: opacity var(--duration-fast);
    }
    .hermes-apply-btn:hover { opacity: 0.85; }

    /* === quick actions === */
    .hermes-quick-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 768px) { .hermes-quick-grid { grid-template-columns: repeat(2, 1fr); } }
    .hermes-quick-item {
      padding: 20px; border-right: 1px solid var(--border); cursor: pointer;
      transition: background var(--duration-fast);
    }
    .hermes-quick-item:last-child { border-right: none; }
    .hermes-quick-item:hover { background: var(--bg-hover); }
    .hermes-quick-item__title {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .hermes-quick-item__label {
      font-size: 12px; font-weight: 600; color: var(--accent);
    }
    .hermes-quick-item__arrow { color: var(--muted); }
    .hermes-quick-item__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .hermes-quick-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.4;
    }

    /* === terminal commands === */
    .hermes-cmd-table { width: 100%; border-collapse: collapse; }
    .hermes-cmd-table th {
      text-align: left; font-size: 12px; color: var(--muted); padding: 10px 14px;
      border-bottom: 1px solid var(--border); font-weight: 500;
    }
    .hermes-cmd-table td {
      padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px;
    }
    .hermes-cmd-table tr:last-child td { border-bottom: none; }
    .hermes-cmd-table .cmd-code {
      font-family: var(--font-mono); font-size: 12px; background: var(--bg-muted);
      padding: 3px 8px; border-radius: var(--radius-sm); color: var(--text);
    }
    .hermes-cmd-table .cmd-desc { font-weight: 500; color: var(--text-strong); }
    .hermes-cmd-table .cmd-subdesc { font-size: 12px; color: var(--muted); }
    .hermes-cmd-table .cmd-copy {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .hermes-cmd-table .cmd-copy:hover { background: var(--bg-hover); color: var(--text); }

    /* === model config form === */
    .hermes-model-presets {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;
    }
    .hermes-model-presets button {
      padding: 4px 10px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .hermes-model-presets button:hover { background: var(--bg-hover); color: var(--text); }
    .hermes-model-presets button.active {
      background: var(--accent-subtle); color: var(--accent); border-color: var(--accent);
    }
    .hermes-form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
    }
    @media (max-width: 700px) { .hermes-form-row { grid-template-columns: 1fr; } }
    .hermes-form-group { margin-bottom: 12px; }
    .hermes-form-label {
      font-size: 12px; font-weight: 600; color: var(--text-soft); margin-bottom: 6px;
      font-style: italic;
    }
    .hermes-form-input {
      width: 100%; padding: 8px 12px; background: var(--bg-muted);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      font-family: var(--font-mono);
    }
    .hermes-form-input:focus { border-color: var(--accent); }
    .hermes-form-actions {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 16px;
    }
    .hermes-btn-save {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--bg);
    }
    .hermes-btn-save:hover { opacity: 0.9; }
    .hermes-btn-ghost {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hermes-btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .hermes-link {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      text-decoration: none;
    }
    .hermes-link:hover { color: var(--text); text-decoration: underline; }
  `;

  @property({ type: String }) title = '';
  @property({ type: Function }) onNavigate = () => {};

  @state() _connTarget = 'local';
  @state() _customUrl = '';
  @state() _connMsg = '';
  @state() _connMsgOk = false;
  @state() _modelConfigOpen = false;
  @state() _apiBase = 'https://api.deepseek.com/v1';
  @state() _apiKey = '';
  @state() _model = 'deepseek-chat';

  // 真实状态（来自 Sidecar / Hermes 网关）
  @state() _selectedPreset = '';
  @state() _modelList: string[] = [];
  @state() _busyBtn: '' | 'models' | 'conn' = '';
  @state() _currentName = '';
  @state() _currentBaseUrl = '';
  @state() _hasKey = false;
  @state() _hermesOnline = false;
  @state() _hermesVersion = '';
  @state() _saving = false;
  @state() _saveMsg = '';
  @state() _saveMsgOk = false;
  @state() _showKey = false;

  /** Sidecar HTTP 基址（Hermes 模型配置经 Sidecar 写入 config.yaml） */
  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    const stored = getStoredHermesUrl();
    if (stored) {
      this._connTarget = 'custom';
      this._customUrl = stored;
    }
    void this._loadCurrentConfig();
    void this._loadStatus();
  }

  /** 应用连接目标：自定义地址写入 localStorage（聊天客户端每次请求读取，立即生效） */
  _applyConnTarget() {
    if (this._connTarget === 'custom') {
      const u = this._customUrl.trim().replace(/\/+$/, '');
      if (!/^https?:\/\/.+/i.test(u)) {
        this._connMsg = `✗ ${L('hermesDashboard.connInvalid')}`;
        this._connMsgOk = false;
        return;
      }
      setHermesUrl(u);
      this._connMsg = `✓ ${L('hermesDashboard.connSaved')}`;
      this._connMsgOk = true;
    } else {
      setHermesUrl(null);
      this._customUrl = '';
      this._connMsg = `✓ ${L('hermesDashboard.connLocalRestored')}`;
      this._connMsgOk = true;
    }
  }

  /** 读取 Hermes 当前模型配置（Sidecar GET /api/hermes/model） */
  async _loadCurrentConfig() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`, { headers: sidecarHeaders() });
      if (!r.ok) return;
      const c = (await r.json()) as { name?: string; baseUrl?: string; apiKey?: string; hasKey?: boolean };
      this._currentName = c.name || '';
      this._currentBaseUrl = c.baseUrl || '';
      this._hasKey = !!c.hasKey;
      if (c.name) this._model = c.name;
      if (c.baseUrl) this._apiBase = c.baseUrl;
      if (c.apiKey) this._apiKey = c.apiKey; // 打码值，保存时后端会保留原 Key
    } catch { /* Sidecar 离线时忽略 */ }
  }

  /** 探测 Hermes 网关在线状态（Sidecar GET /api/hermes/status） */
  async _loadStatus() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/status`, { headers: sidecarHeaders() });
      if (r.ok) {
        const s = (await r.json()) as { online?: boolean; version?: string };
        this._hermesOnline = !!s.online;
        this._hermesVersion = s.version || '';
      } else {
        this._hermesOnline = false;
      }
    } catch {
      this._hermesOnline = false;
    }
  }

  /** 点击服务商预设 → 填充 Base URL 与默认模型 */
  _applyPreset(p: { name: string; baseUrl: string; model?: string }) {
    this._selectedPreset = p.name;
    this._apiBase = p.baseUrl;
    if (p.model) this._model = p.model;
    this._modelList = [];
    this._saveMsg = '';
  }

  /** 探测 OpenAI 兼容端点（获取模型列表 / 测试连通性共用）。
   * 经 Sidecar 服务端代探：浏览器只有打码 Key 且受 CORS 限制，
   * Sidecar 会回落到 config.yaml 里的真实 Key。 */
  async _probeModels(): Promise<string[]> {
    const base = this._apiBase.trim().replace(/\/+$/, '');
    if (!base) throw new Error(L('hermesDashboard.needBaseUrl'));
    const r = await fetch(`${this._sidecarBase}/api/hermes/model/probe`, {
      method: 'POST',
      headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ baseUrl: base, apiKey: this._apiKey.trim() }),
    });
    if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
    const d = (await r.json()) as { ok?: boolean; error?: string; models?: string[] };
    if (!d.ok) throw new Error(d.error || 'unknown');
    return d.models || [];
  }

  /** 获取模型列表：成功后展示为可点选的 chips */
  async _fetchModels() {
    if (this._busyBtn) return;
    this._busyBtn = 'models';
    this._saveMsg = '';
    try {
      const list = await this._probeModels();
      if (!list.length) throw new Error(L('hermesDashboard.noModels'));
      this._modelList = list;
      this._saveMsg = `✓ ${L('hermesDashboard.fetchModelsOk', { n: list.length })}`;
      this._saveMsgOk = true;
    } catch (e) {
      this._saveMsg = `✗ ${L('hermesDashboard.fetchModelsFailed')}${e instanceof Error ? e.message : String(e)}`;
      this._saveMsgOk = false;
    } finally {
      this._busyBtn = '';
    }
  }

  /** 测试连通性：只报成功/失败 */
  async _testConn() {
    if (this._busyBtn) return;
    this._busyBtn = 'conn';
    this._saveMsg = '';
    try {
      await this._probeModels();
      this._saveMsg = `✓ ${L('hermesDashboard.connOk')}`;
      this._saveMsgOk = true;
    } catch (e) {
      this._saveMsg = `✗ ${L('hermesDashboard.connFailed')}${e instanceof Error ? e.message : String(e)}`;
      this._saveMsgOk = false;
    } finally {
      this._busyBtn = '';
    }
  }

  /** 保存模型配置（Sidecar POST /api/hermes/model → Hermes 热加载） */
  async _saveModelConfig() {
    this._saving = true;
    this._saveMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: this._model.trim(),
          baseUrl: this._apiBase.trim(),
          apiKey: this._apiKey.trim(),
        }),
      });
      const d = (await r.json()) as { success?: boolean };
      if (d.success) {
        this._saveMsg = `✓ ${L('hermesDashboard.savedHotReload')}`;
        this._saveMsgOk = true;
        await this._loadCurrentConfig();
      } else {
        this._saveMsg = `✗ ${L('hermesDashboard.saveFailed')}`;
        this._saveMsgOk = false;
      }
    } catch {
      this._saveMsg = `✗ ${L('hermesDashboard.sidecarOffline')}`;
      this._saveMsgOk = false;
    }
    this._saving = false;
  }

  _refreshAll() {
    void this._loadCurrentConfig();
    void this._loadStatus();
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${`127.0.0.1:8642 · ${L('hermesDashboard.subtitle')} · v0.11.0`}>
        <div style="display:flex;gap:8px;align-items:center;">
          <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);display:inline-flex;align-items:center;gap:6px;"
                  @click=${() => this._refreshAll()}>
            ${L('common.refresh')}
          </button>
        </div>
      </page-header>
      <div class="hermes-dashboard">

        <!-- Status cards -->
        <div class="hermes-status-row">
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.gatewayStatus')}</div>
            <div class="hermes-status-card__value">
              <div class="hermes-status-card__status">
                <span class="hermes-status-card__dot ${this._hermesOnline ? 'running' : 'stopped'}"></span>
                ${this._hermesOnline ? L('hermesDashboard.running') : L('hermesDashboard.stopped')}
              </div>
            </div>
            <div class="hermes-status-card__sub">${L('hermesDashboard.listeningPort')}</div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.currentModel')}</div>
            <div class="hermes-status-card__value" style="font-size:${this._currentName ? '15px' : '13px'};">${this._currentName || L('hermesDashboard.notConfigured')}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">${this._hasKey ? 'Key ✓' : 'Key —'}</span>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.version')}</div>
            <div class="hermes-status-card__value" style="font-size:20px;">${this._hermesVersion ? `v${this._hermesVersion}` : '—'}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">hermes-agent</span>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.apiAddress')}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">127.0.0.1</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">:8642/v1</span>
            </div>
          </div>
          <div class="hermes-status-card" style="cursor:pointer;" @click=${() => this.onNavigate('chat')}>
            <div class="hermes-status-card__label">${L('hermesDashboard.openPanel')}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">${L('hermesDashboard.hermesChatPanel')}</div>
            <div class="hermes-status-card__sub">${L('hermesDashboard.openChat')}</div>
          </div>
        </div>

        <!-- Model config -->
        <div class="hermes-section">
          <div class="hermes-section__header" style="cursor:pointer;user-select:none;" @click=${() => { this._modelConfigOpen = !this._modelConfigOpen; this.requestUpdate(); }}>
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${L('hermesDashboard.modelConfig')}
              ${this._currentName
                ? html`<span class="hermes-section__badge ok">${this._currentName}</span>`
                : html`<span class="hermes-section__badge">${L('hermesDashboard.notConfigured')}</span>`}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="transform:${this._modelConfigOpen ? 'rotate(180deg)' : 'rotate(0)'};transition:transform var(--duration-fast);color:var(--muted);">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          ${this._modelConfigOpen ? html`
            <!-- 服务商预设 -->
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px;">${L('hermesDashboard.providerPresets')}</div>
            <div class="hermes-model-presets">
              ${PROVIDER_PRESETS.map((p) => html`
                <button class="${this._selectedPreset === p.name ? 'active' : ''}"
                  @click=${() => this._applyPreset(p)}>${p.name}</button>
              `)}
            </div>

            <!-- API Base URL & API Key -->
            <div class="hermes-form-row">
              <div class="hermes-form-group">
                <div class="hermes-form-label">API Base URL</div>
                <input class="hermes-form-input" type="text" .value=${this._apiBase}
                  placeholder="https://api.deepseek.com/v1"
                  @input=${(e: Event) => { this._apiBase = (e.target as HTMLInputElement).value; this._selectedPreset = ''; }} />
              </div>
              <div class="hermes-form-group">
                <div class="hermes-form-label">API Key</div>
                <div class="hermes-key-wrap">
                  <input class="hermes-form-input" type=${this._showKey ? 'text' : 'password'} .value=${this._apiKey}
                    placeholder="sk-...（留空=保留原 Key）"
                    @input=${(e: Event) => { this._apiKey = (e.target as HTMLInputElement).value; }} />
                  <button class="hermes-key-eye" type="button"
                    title=${this._showKey ? L('common.hide') : L('common.show')}
                    @click=${() => { this._showKey = !this._showKey; }}>
                    ${this._showKey ? html`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ` : html`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    `}
                  </button>
                </div>
              </div>
            </div>

            <!-- Model + 探测按钮 -->
            <div class="hermes-form-group">
              <div class="hermes-form-label">${L('hermesDashboard.model', '模型')}</div>
              <div style="display:flex;gap:8px;">
                <input class="hermes-form-input" style="flex:1;" type="text" .value=${this._model}
                  placeholder="deepseek-chat"
                  @input=${(e: Event) => { this._model = (e.target as HTMLInputElement).value; }} />
                <button class="hermes-btn-ghost" ?disabled=${!!this._busyBtn} @click=${this._fetchModels}>
                  ${this._busyBtn === 'models' ? L('common.loading') : L('hermesDashboard.fetchModels')}
                </button>
                <button class="hermes-btn-ghost" ?disabled=${!!this._busyBtn} @click=${this._testConn}>
                  ${this._busyBtn === 'conn' ? L('common.loading') : L('hermesDashboard.testConn')}
                </button>
              </div>
            </div>

            <!-- 获取到的模型列表 → 点选填入 -->
            ${this._modelList.length > 0 ? html`
              <div class="hermes-model-presets" style="margin-top:4px;">
                ${this._modelList.map((id) => html`
                  <button class="${this._model === id ? 'active' : ''}"
                    @click=${() => { this._model = id; }}>${id}</button>
                `)}
              </div>
            ` : ''}

            <!-- Actions -->
            <div class="hermes-form-actions" style="justify-content:space-between;">
              <div style="display:flex;gap:10px;align-items:center;">
                <button class="hermes-btn-save" ?disabled=${this._saving} @click=${this._saveModelConfig}>
                  ${this._saving ? L('hermesDashboard.saving') : L('hermesDashboard.saveConfig', '保存配置')}
                </button>
                <span class="hermes-save-msg ${this._saveMsgOk ? 'ok' : 'err'}">${this._saveMsg}</span>
              </div>
              <span class="hermes-section__link" @click=${() => this.onNavigate('hermes-env')}>
                ${L('hermesDashboard.envAdvanced')} →
              </span>
            </div>
          ` : ''}
        </div>

        <!-- Connection target -->
        <div class="hermes-section">
          <div class="hermes-section__header">
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              ${L('hermesDashboard.connectionTarget')}
            </div>
            <div class="hermes-section__link">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              ${L('hermesDashboard.detectEnv')}
            </div>
          </div>
          <div class="hermes-conn-targets">
            <button class="hermes-conn-target ${this._connTarget === 'local' ? 'active' : ''}"
                    @click=${() => { this._connTarget = 'local'; this._connMsg = ''; }}>
              ${L('hermesDashboard.local')}
            </button>
            <button class="hermes-conn-target ${this._connTarget === 'custom' ? 'active' : ''}"
                    @click=${() => { this._connTarget = 'custom'; this._connMsg = ''; }}>
              ${L('hermesDashboard.custom')}
            </button>
          </div>
          ${this._connTarget === 'custom' ? html`
            <div class="hermes-form-group" style="margin-bottom:10px;">
              <div class="hermes-form-label">${L('hermesDashboard.customUrlLabel')}</div>
              <input class="hermes-form-input" type="text" .value=${this._customUrl}
                placeholder="http://192.168.1.20:8642"
                @input=${(e: Event) => { this._customUrl = (e.target as HTMLInputElement).value; }} />
            </div>
          ` : ''}
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="hermes-apply-btn" @click=${this._applyConnTarget}>${L('hermesDashboard.apply')}</button>
            <span class="hermes-save-msg ${this._connMsgOk ? 'ok' : 'err'}">${this._connMsg}</span>
          </div>
        </div>

        <!-- Quick actions -->
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">${L('hermesDashboard.quickActions')}</div>
        <div class="hermes-quick-grid">
          <div class="hermes-quick-item" @click=${() => this.onNavigate('chat')}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">${L('hermesDashboard.openChat')}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${L('hermesDashboard.openChat')}</div>
            <div class="hermes-quick-item__desc">${L('hermesDashboard.interactiveSession')}</div>
          </div>
          <div class="hermes-quick-item" @click=${() => this.onNavigate('hermes-service')}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">${L('hermesDashboard.hermesService')}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${L('hermesDashboard.maintenanceOps')}</div>
            <div class="hermes-quick-item__desc">${L('hermesDashboard.maintenanceDesc')}</div>
          </div>
          <div class="hermes-quick-item" @click=${() => this.onNavigate('logs')}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label" style="color:var(--accent);">${L('hermesDashboard.openLogs')}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">gateway.log</div>
            <div class="hermes-quick-item__desc">${L('hermesDashboard.traceSearch')}</div>
          </div>
          <div class="hermes-quick-item" @click=${() => this.onNavigate('hermes-env')}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">&lt;&gt; ENV</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${L('hermesDashboard.advancedEdit')}</div>
            <div class="hermes-quick-item__desc">${L('hermesDashboard.customVars')}</div>
          </div>
        </div>

        <!-- Terminal commands -->
        <div class="hermes-section">
          <div class="hermes-section__header">
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              ${L('hermesDashboard.terminalCommands')}
              <span class="hermes-section__badge">${TERMINAL_COMMANDS.length}</span>
            </div>
            <div style="font-size:12px;color:var(--muted);">${L('hermesDashboard.terminalCmdHint')}</div>
          </div>
          <table class="hermes-cmd-table">
            <thead>
              <tr><th>${L('hermesDashboard.cmdHeader')}</th><th>${L('hermesDashboard.descHeader')}</th><th style="width:60px;"></th></tr>
            </thead>
            <tbody>
              ${TERMINAL_COMMANDS.map(c => html`
                <tr>
                  <td><code class="cmd-code">${c.cmd}</code></td>
                  <td>
                    <div class="cmd-desc">${c.desc}</div>
                    <div class="cmd-subdesc">${c.subdesc}</div>
                  </td>
                  <td>
                    <button class="cmd-copy" title="${L('hermesDashboard.copy')}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

      </div>
    `;
  }
}

customElements.define('hermes-dashboard-page', HermesDashboardPage);
