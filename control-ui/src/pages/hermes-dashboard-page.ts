import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import { getStoredHermesUrl, setHermesUrl } from '../services/hermes-client.js';
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

  // 真实状态（来自 Sidecar / Hermes 网关）
  @state() _currentName = '';
  @state() _hasKey = false;
  @state() _hermesOnline = false;
  @state() _hermesVersion = '';

  /** Sidecar HTTP 基址（Hermes 模型配置经 Sidecar 写入 config.yaml） */
  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  /** 当前生效的 Hermes 连接地址（自定义目标优先），解析失败回退 — */
  get _connHostPort(): { host: string; port: string } {
    try {
      const u = new URL(hermesUrl());
      return { host: u.hostname || '—', port: u.port || (u.protocol === 'https:' ? '443' : '80') };
    } catch {
      return { host: '—', port: '—' };
    }
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
      this._hasKey = !!c.hasKey;
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

  _refreshAll() {
    void this._loadCurrentConfig();
    void this._loadStatus();
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${L('hermesDashboard.subtitle')}>
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
            <div class="hermes-status-card__value" style="font-size:13px;">${this._connHostPort.host}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">:${this._connHostPort.port}/v1</span>
            </div>
          </div>
          <div class="hermes-status-card" style="cursor:pointer;" @click=${() => this.onNavigate('chat')}>
            <div class="hermes-status-card__label">${L('hermesDashboard.openPanel')}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">${L('hermesDashboard.hermesChatPanel')}</div>
            <div class="hermes-status-card__sub">${L('hermesDashboard.openChat')}</div>
          </div>
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
