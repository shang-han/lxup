import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesServicePage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hs-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hs-back:hover { text-decoration: underline; }

    .hs-status-row {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 768px) { .hs-status-row { grid-template-columns: repeat(2, 1fr); } }
    .hs-status-card { padding: 20px; border-right: 1px solid var(--border); }
    .hs-status-card:last-child { border-right: none; }
    .hs-status-card__label { font-size: 11px; font-weight: 600; margin-bottom: 8px; }
    .hs-status-card__value { font-size: 20px; font-weight: 700; color: var(--text-strong); margin-bottom: 4px; }
    .hs-status-card__sub { font-size: 11px; color: var(--muted); }

    .hs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 900px) { .hs-grid { grid-template-columns: 1fr; } }

    .hs-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hs-card__header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hs-card__header svg { color: var(--accent); }
    .hs-card__body { padding: 16px 20px; }

    .hs-info-row {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .hs-info-row:last-child { border-bottom: none; }
    .hs-info-row__label { font-size: 12px; color: var(--text-soft); flex-shrink: 0; }
    .hs-info-row__value {
      font-size: 12px; color: var(--text); text-align: right;
      word-break: break-all; max-width: 60%;
    }
    .hs-info-row__value.mono { font-family: var(--font-mono); font-size: 11px; }

    .hs-config-links { display: flex; gap: 8px; margin-top: 8px; }
    .hs-config-links button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hs-config-links button:hover { background: var(--bg-hover); color: var(--text); }

    .hs-file-tags { display: flex; gap: 6px; margin-top: 8px; }
    .hs-file-tag {
      padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px;
      background: var(--bg-muted); color: var(--text-soft); border: 1px solid var(--border);
    }

    .hs-notice {
      padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px;
      margin-bottom: 16px; border: 1px solid var(--border); background: var(--bg-muted); color: var(--text-soft);
    }
    .hs-notice.ok { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.3); color: var(--success); }
    .hs-notice.err { background: var(--danger-subtle); border-color: rgba(239,68,68,0.3); color: var(--danger); }

    .hs-maint-btn {
      padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text); transition: all var(--duration-fast);
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .hs-maint-btn:hover:not(:disabled) { background: var(--bg-hover); }
    .hs-maint-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .hs-maint-btn--primary { background: var(--text-strong); color: var(--accent-foreground); border-color: var(--text-strong); }
    .hs-maint-btn--primary:hover:not(:disabled) { opacity: 0.9; }
    .hs-maint-btn--danger { color: var(--danger); border-color: rgba(239,68,68,0.3); }
    .hs-maint-btn--danger:hover:not(:disabled) { background: var(--danger-subtle); }
    .hs-link { font-size: 12px; color: var(--text-soft); cursor: pointer; text-decoration: none; }
    .hs-link:hover { color: var(--text); text-decoration: underline; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  // 真实状态（来自 Sidecar）
  @state() _online = false;
  @state() _pid: number | null = null;
  @state() _installed = false;
  @state() _port = 8642;
  @state() _homeDir = '';
  @state() _version = '';
  @state() _platform = '';
  @state() _modelName = '';
  @state() _provider = '';
  @state() _baseUrl = '';
  @state() _maskedKey = '';
  @state() _hasKey = false;
  @state() _busy = false;
  @state() _notice = '';
  @state() _noticeKind: '' | 'ok' | 'err' = '';

  _unsubI18n: (() => void) | null = null;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
    void this._loadAll();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  async _loadAll() {
    await Promise.all([this._loadStatus(), this._loadModel()]);
  }

  async _loadStatus() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/status`);
      if (!r.ok) return;
      const s = (await r.json()) as {
        online?: boolean; pid?: number | null; port?: number; installed?: boolean;
        homeDir?: string; version?: string; platform?: string;
      };
      this._online = !!s.online;
      this._pid = s.pid ?? null;
      this._port = s.port || 8642;
      this._installed = !!s.installed;
      this._homeDir = s.homeDir || '';
      this._version = s.version || '';
      this._platform = s.platform || '';
    } catch { /* Sidecar 离线 */ }
  }

  async _loadModel() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`);
      if (!r.ok) return;
      const m = (await r.json()) as {
        name?: string; provider?: string; baseUrl?: string; apiKey?: string; hasKey?: boolean;
      };
      this._modelName = m.name || '';
      this._provider = m.provider || '';
      this._baseUrl = m.baseUrl || '';
      this._maskedKey = m.apiKey || '';
      this._hasKey = !!m.hasKey;
    } catch { /* ignore */ }
  }

  async _action(kind: 'start' | 'stop' | 'restart') {
    this._busy = true;
    this._notice = L('hermesService.operating');
    this._noticeKind = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/${kind}`, { method: 'POST' });
      const d = (await r.json()) as { started?: boolean; stopped?: boolean; restarted?: boolean; message?: string };
      const ok = d.started || d.stopped || d.restarted;
      this._notice = d.message || (ok ? '✓' : '✗');
      this._noticeKind = ok ? 'ok' : 'err';
    } catch {
      this._notice = `✗ ${L('hermesDashboard.sidecarOffline')}`;
      this._noticeKind = 'err';
    }
    this._busy = false;
    await this._loadStatus();
  }

  render() {
    const host = window.location.hostname || '127.0.0.1';
    const gatewayAddr = `http://${host}:${this._port}`;
    return html`
      <div class="page-content" style="padding:24px 24px 0;">
        <a class="hs-back" @click=${() => this.onNavigate('dashboard')}>
          ← ${L('hermesService.backToDashboard')}
        </a>
      </div>

      <page-header title=${this.title} subtitle=${this.subtitle}>
        <div style="display:flex;gap:8px;align-items:center;">
          ${this._online ? html`
            <button ?disabled=${this._busy} @click=${() => this._action('stop')}
              style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.3);cursor:pointer;background:transparent;color:var(--danger);">
              ${L('hermesService.stopGateway')}
            </button>
          ` : html`
            <button ?disabled=${this._busy} @click=${() => this._action('start')}
              style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--accent-foreground);display:inline-flex;align-items:center;gap:6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              ${L('hermesService.startGateway')}
            </button>
          `}
          <button @click=${() => this._loadAll()}
            style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
            ${L('common.refresh')}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        ${this._notice ? html`<div class="hs-notice ${this._noticeKind}">${this._notice}</div>` : ''}

        <!-- Status row -->
        <div class="hs-status-row">
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:${this._installed ? 'var(--success)' : 'var(--danger)'};">${L('hermesService.installStatus')}</div>
            <div class="hs-status-card__value">${this._installed ? L('hermesService.installed') : L('hermesService.notInstalled')}</div>
            <div class="hs-status-card__sub">${this._installed ? L('hermesService.portablePython') : L('hermesService.needBootstrap')}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:${this._online ? 'var(--success)' : 'var(--danger)'};">${L('hermesService.gatewayStatus')}</div>
            <div class="hs-status-card__value">${this._online ? L('hermesService.running') : L('hermesService.stopped')}</div>
            <div class="hs-status-card__sub">:${this._port}${this._pid ? ` · ${L('hermesService.pid')} ${this._pid}` : ''}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--warn);">${L('hermesService.currentModel')}</div>
            <div class="hs-status-card__value" style="font-size:${this._modelName ? '15px' : '20px'};">${this._modelName || L('hermesService.notConfigured')}</div>
            <div class="hs-status-card__sub">${this._hasKey ? L('hermesService.keyOk') : L('hermesService.keyNone')}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--accent);">${L('hermesService.connectionTarget')}</div>
            <div class="hs-status-card__value">${L('hermesService.local')}</div>
            <div class="hs-status-card__sub">${gatewayAddr}</div>
          </div>
        </div>

        <!-- Install status + Hermes config -->
        <div class="hs-grid">
          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              ${L('hermesService.installStatus')}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.version')}</span>
                <span class="hs-info-row__value">${this._version ? `v${this._version}` : '—'}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.installMethod')}</span>
                <span class="hs-info-row__value">${L('hermesService.portablePython')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.cliPath')}</span>
                <span class="hs-info-row__value mono">engines\\hermes\\hermes_cli</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.homeDir')}</span>
                <span class="hs-info-row__value mono">${this._homeDir || 'runtime\\hermes-home'}</span>
              </div>
              <div class="hs-info-row" style="border-bottom:none;">
                <span class="hs-info-row__label">${L('hermesService.keyConfigFiles')}</span>
                <span></span>
              </div>
              <div class="hs-file-tags">
                <span class="hs-file-tag">config.yaml</span>
                <span class="hs-file-tag">.env</span>
              </div>
            </div>
          </div>

          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              ${L('hermesService.hermesConfig')}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.llmProvider')}</span>
                <span class="hs-info-row__value">${this._provider || L('hermesService.unknown')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.model')}</span>
                <span class="hs-info-row__value">${this._modelName || L('hermesService.notConfigured')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.customApiAddr')}</span>
                <span class="hs-info-row__value mono">${this._baseUrl || L('hermesService.notSet')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">API Key</span>
                <span class="hs-info-row__value mono">${this._maskedKey || L('hermesService.notSet')}</span>
              </div>
              <div class="hs-config-links">
                <button @click=${() => this.onNavigate('dashboard')}>${L('hermesService.openConfig')}</button>
                <button @click=${() => this.onNavigate('hermes-env')}>${L('hermesService.openEnv')}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Check -->
        <div class="hs-card" style="margin-bottom:16px;">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            ${L('hermesService.healthCheck')}
            <span style="margin-left:auto;font-size:12px;padding:3px 12px;border-radius:var(--radius-full);border:1px solid var(--border);color:${this._online ? 'var(--success)' : 'var(--text-soft)'};">
              ${this._online ? L('hermesService.healthy') : L('hermesService.stopped')}
            </span>
          </div>
          <div class="hs-card__body">
            ${this._online ? html`
              <div style="font-size:13px;color:var(--text);display:flex;flex-direction:column;gap:6px;">
                <div>${L('hermesService.platform')}: <span style="font-family:var(--font-mono);">${this._platform || 'hermes-agent'}</span></div>
                <div>${L('hermesService.version')}: <span style="font-family:var(--font-mono);">${this._version ? `v${this._version}` : '—'}</span></div>
                <div>${L('hermesService.pid')}: <span style="font-family:var(--font-mono);">${this._pid ?? '—'}</span></div>
                <div>API: <span style="font-family:var(--font-mono);">${gatewayAddr}</span></div>
              </div>
            ` : html`
              <div style="font-size:13px;color:var(--text-soft);font-style:italic;">
                ${L('hermesService.healthCheckMsg')}
              </div>
            `}
          </div>
        </div>

        <!-- Maintenance Operations -->
        <div class="hs-card">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${L('hermesService.maintenanceOps')}
          </div>
          <div class="hs-card__body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
              <button class="hs-maint-btn hs-maint-btn--primary" ?disabled=${this._busy || this._online} @click=${() => this._action('start')}>
                ${L('hermesService.startGateway')}
              </button>
              <button class="hs-maint-btn" ?disabled=${this._busy || !this._online} @click=${() => this._action('restart')}>
                ${L('hermesService.restartGateway')}
              </button>
              <button class="hs-maint-btn hs-maint-btn--danger" ?disabled=${this._busy || !this._online} @click=${() => this._action('stop')}>
                ${L('hermesService.stopGateway')}
              </button>
            </div>
            <div style="display:flex;gap:16px;">
              <a class="hs-link" @click=${() => this.onNavigate('logs')}>${L('hermesService.openLogs')}</a>
              <a class="hs-link" @click=${() => this.onNavigate('dashboard')}>${L('hermesService.openConfig')}</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-service-page', HermesServicePage);
