import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
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
      font-size: 11px; color: var(--text-soft);
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
      font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full);
      background: var(--bg-muted); color: var(--muted); font-weight: 500;
    }
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
      background: var(--text-strong); color: var(--accent-foreground); border-color: var(--text-strong);
    }
    .hermes-conn-target:hover:not(.active) { background: var(--bg-hover); color: var(--text); }
    .hermes-apply-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--accent-foreground);
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
      font-size: 11px; color: var(--text-soft); line-height: 1.4;
    }

    /* === terminal commands === */
    .hermes-cmd-table { width: 100%; border-collapse: collapse; }
    .hermes-cmd-table th {
      text-align: left; font-size: 11px; color: var(--muted); padding: 10px 14px;
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
    .hermes-cmd-table .cmd-subdesc { font-size: 11px; color: var(--muted); }
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
      padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .hermes-model-presets button:hover { background: var(--bg-hover); color: var(--text); }
    .hermes-model-presets button.active {
      background: var(--accent-subtle); color: var(--accent); border-color: var(--accent);
    }
    .hermes-form-row {
      display: grid; grid-template-columns: 1fr 280px; gap: 12px; margin-bottom: 12px;
    }
    @media (max-width: 700px) { .hermes-form-row { grid-template-columns: 1fr; } }
    .hermes-form-group { margin-bottom: 12px; }
    .hermes-form-label {
      font-size: 11px; font-weight: 600; color: var(--text-soft); margin-bottom: 6px;
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
      background: var(--text-strong); color: var(--accent-foreground);
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

  @state() _gatewayRunning = false;
  @state() _connTarget = 'local';
  @state() _modelConfigOpen = false;
  @state() _apiBase = 'https://api.deepseek.com/v1';
  @state() _apiKey = '';
  @state() _model = 'deepseek-chat';
  @state() _selectedPreset = '';

  _providerPresets = [
    'GPT+Claude推荐中转', '硅基流动', '火山引擎', '火山引擎 Coding',
    '阿里云百炼', '智谱 AI', 'MiniMax', 'Moonshot / Kimi',
    'OpenAI 官方', 'Anthropic 官方', 'DeepSeek',
    'Google Gemini', 'xAI (Grok)', 'Groq',
    'OpenRouter', 'NVIDIA NIM', 'Ollama (本地)',
  ];

  render() {
    return html`
      <page-header title=${this.title} subtitle=${`127.0.0.1:8642 · ${L('hermesDashboard.subtitle')} · v0.11.0`}>
        <div style="display:flex;gap:8px;align-items:center;">
          <button style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--accent-foreground);display:inline-flex;align-items:center;gap:6px;"
                  @click=${() => { this._gatewayRunning = !this._gatewayRunning; }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            ${this._gatewayRunning ? L('hermesDashboard.stopGateway') : L('hermesDashboard.startGateway')}
          </button>
          <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
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
                <span class="hermes-status-card__dot ${this._gatewayRunning ? 'running' : 'stopped'}"></span>
                ${this._gatewayRunning ? L('hermesDashboard.running') : L('hermesDashboard.stopped')}
              </div>
            </div>
            <div class="hermes-status-card__sub">${L('hermesDashboard.listeningPort')}</div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.currentModel')}</div>
            <div class="hermes-status-card__value">${L('hermesDashboard.notConfigured')}</div>
            <div class="hermes-status-card__sub">
              <select style="font-size:11px;padding:2px 6px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--input);color:var(--text-soft);">
                <option>${L('hermesDashboard.provider')}</option>
              </select>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.version')}</div>
            <div class="hermes-status-card__value" style="font-size:20px;">v0.11.0</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:10px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">uv-tool</span>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${L('hermesDashboard.apiAddress')}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">127.0.0.1</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:10px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">:8642/v1</span>
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
              <span class="hermes-section__badge">17</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="transform:${this._modelConfigOpen ? 'rotate(180deg)' : 'rotate(0)'};transition:transform var(--duration-fast);color:var(--muted);">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          ${this._modelConfigOpen ? html`
            <!-- Provider presets -->
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px;">${L('hermesDashboard.providerPresets', '服务商预设')}</div>
            <div class="hermes-model-presets">
              ${this._providerPresets.map((p: string) => html`
                <button class="${this._selectedPreset === p ? 'active' : ''}"
                  @click=${() => { this._selectedPreset = p; this.requestUpdate(); }}>${p}</button>
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
                <input class="hermes-form-input" type="password" .value=${this._apiKey}
                  placeholder="sk-..."
                  @input=${(e: Event) => { this._apiKey = (e.target as HTMLInputElement).value; }} />
              </div>
            </div>

            <!-- Model -->
            <div class="hermes-form-group">
              <div class="hermes-form-label">${L('hermesDashboard.model', '模型')}</div>
              <div style="display:flex;gap:8px;">
                <input class="hermes-form-input" style="flex:1;" type="text" .value=${this._model}
                  placeholder="deepseek-chat"
                  @input=${(e: Event) => { this._model = (e.target as HTMLInputElement).value; }} />
                <button class="hermes-btn-ghost">${L('hermesDashboard.fetchModelList', '获取模型列表')}</button>
                <button class="hermes-btn-ghost">${L('hermesDashboard.testConnectivity', '测试连通性')}</button>
              </div>
            </div>

            <!-- Actions -->
            <div class="hermes-form-actions">
              <button class="hermes-btn-save">${L('hermesDashboard.saveConfig', '保存配置')}</button>
              <a class="hermes-link">${L('hermesDashboard.envAdvancedEdit', '.env 高级编辑')} →</a>
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
                    @click=${() => { this._connTarget = 'local'; }}>
              ${L('hermesDashboard.local')}
            </button>
            <button class="hermes-conn-target ${this._connTarget === 'custom' ? 'active' : ''}"
                    @click=${() => { this._connTarget = 'custom'; }}>
              ${L('hermesDashboard.custom')}
            </button>
          </div>
          <button class="hermes-apply-btn">${L('hermesDashboard.apply')}</button>
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
            <div style="font-size:11px;color:var(--muted);">${L('hermesDashboard.terminalCmdHint')}</div>
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
