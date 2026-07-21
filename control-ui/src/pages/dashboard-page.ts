import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getActiveModel, listModels, loadProviders, type ResolvedModel } from '../utils/model-config.js';
import { getSharedStore } from '../store/shared.js';
import '../components/page-header.js';

export class DashboardPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .dashboard-page { width: 100%; }

    /* === stat cards row === */
    .dashboard-stats {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px;
    }
    @media (max-width: 1400px) { .dashboard-stats { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 700px) { .dashboard-stats { grid-template-columns: repeat(2, 1fr); } }
    .dashboard-stat {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card); position: relative;
    }
    .dashboard-stat__label {
      font-size: 12px; color: var(--muted); margin-bottom: 8px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .dashboard-stat__value {
      font-size: 18px; font-weight: 700; color: var(--text-strong); margin-bottom: 2px;
    }
    .dashboard-stat__hint {
      font-size: 11px; color: var(--text-soft); line-height: 1.4;
    }
    .dashboard-stat__status {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .dashboard-stat__status.online { background: var(--success); }
    .dashboard-stat__status.offline { background: var(--muted); }

    /* === info cards === */
    .dashboard-info-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;
    }
    @media (max-width: 900px) { .dashboard-info-grid { grid-template-columns: 1fr; } }
    .dashboard-info-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card); cursor: pointer;
      transition: border-color var(--duration-fast);
    }
    .dashboard-info-card:hover { border-color: var(--accent); }
    .dashboard-info-card__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .dashboard-info-card__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; color: var(--text-soft);
    }
    .dashboard-info-card__title svg { color: var(--text-soft); }
    .dashboard-info-card__actions { display: flex; gap: 6px; }
    .dashboard-info-card__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .dashboard-info-card__actions .btn-stop {
      background: var(--danger-subtle); color: var(--danger); border-color: rgba(239,68,68,0.2);
    }
    .dashboard-info-card__actions .btn-stop:hover { background: rgba(239,68,68,0.2); }
    .dashboard-info-card__actions .btn-restart {
      background: transparent; color: var(--text-soft);
    }
    .dashboard-info-card__actions .btn-restart:hover { background: var(--bg-hover); color: var(--text); }
    .dashboard-info-card__value {
      font-size: 15px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px;
    }
    .dashboard-info-card__sub {
      font-size: 11px; color: var(--muted);
    }
    .dashboard-info-card__status {
      font-size: 14px; font-weight: 600; margin-bottom: 2px;
    }
    .dashboard-info-card__status.online { color: var(--success); }
    .dashboard-info-card__status.offline { color: var(--muted); }

    /* === websocket status === */
    .dashboard-ws {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 14px 18px; margin-bottom: 16px; box-shadow: var(--shadow-card);
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 500;
    }
    .dashboard-ws__dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .dashboard-ws__dot.connected { background: var(--success); }
    .dashboard-ws__dot.disconnected { background: var(--muted); }

    /* === action buttons === */
    .dashboard-actions {
      display: flex; gap: 8px; margin-bottom: 16px;
    }
    .dashboard-actions button {
      padding: 8px 18px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--bg-muted); color: var(--text-soft); transition: all var(--duration-fast);
    }
    .dashboard-actions button:hover { background: var(--bg-hover); color: var(--text); }

    /* === logs === */
    .dashboard-logs {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card);
    }
    .dashboard-logs__title {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 12px;
    }
    .dashboard-logs__body {
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 12px; font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
      color: var(--text); max-height: 240px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Boolean }) connected = false;
  @property({ type: Array }) instances = [];
  @property({ type: Array }) sessions = [];
  @property({ type: Array }) cronJobs = [];
  @property({ type: Object }) snapshot = {};
  @property({ type: Array }) skills = [];
  @property({ type: Array }) models = [];
  @property({ type: Function }) onNavigate = () => {};

  @state() _activeModel: ResolvedModel | null = null;
  @state() _modelCount = 0;
  @state() _providerCount = 0;
  @state() _recentLogs: string[] = [];

  // 网关进程管理（经 Sidecar :7889）
  @state() _gwRunning = false;
  @state() _gwPid: number | null = null;
  @state() _gwBusy = false;
  @state() _gwMessage = '';

  _storeUnsub: (() => void) | null = null;

  /** Sidecar HTTP 基址（网关进程管理走 Sidecar :7889） */
  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._refreshModelInfo();
    this._refreshGatewayStatus();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe((snap) => {
      if (snap.connected) this._fetchRecentLogs();
    });
  }

  /** 刷新网关进程状态 */
  async _refreshGatewayStatus() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/status`);
      const s = await r.json();
      this._gwRunning = !!s.running;
      this._gwPid = s.pid ?? null;
    } catch {
      this._gwRunning = false;
      this._gwPid = null;
    }
  }

  /** 调用 Sidecar 的网关管理端点（stop/start/restart） */
  async _callGateway(action: 'stop' | 'start' | 'restart') {
    if (this._gwBusy) return;
    this._gwBusy = true;
    this._gwMessage = action === 'stop' ? '正在停止网关…' : action === 'start' ? '正在启动网关…' : '正在重启网关…';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/${action}`, { method: 'POST' });
      const res = await r.json();
      this._gwMessage = res.message || (res.started || res.restarted ? '操作成功' : '操作完成');
      await this._refreshGatewayStatus();
    } catch (e) {
      this._gwMessage = `操作失败：${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._gwBusy = false;
      // 网关状态变化后，共享连接的 store 会自动重连/断开
      setTimeout(() => this._refreshGatewayStatus(), 2000);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
  }

  _refreshModelInfo() {
    this._activeModel = getActiveModel();
    this._modelCount = listModels().length;
    this._providerCount = loadProviders().length;
  }

  async _fetchRecentLogs() {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const res = await store.request<any>('logs.tail', { cursor: 0, limit: 8 });
      const lines: string[] = (res?.lines || []).map((raw: unknown) => {
        if (typeof raw !== 'string') return '';
        try {
          const obj = JSON.parse(raw);
          let bracket = 'gateway';
          const srcRaw = obj['0'] || obj?._meta?.name;
          if (typeof srcRaw === 'string') {
            try { bracket = JSON.parse(srcRaw).subsystem || bracket; } catch { bracket = srcRaw; }
          }
          const ts = (obj.time || '').replace('T', ' ').replace(/\.\d+.*$/, '');
          return `[${ts}] [${bracket}] ${obj.message || obj['1'] || ''}`;
        } catch {
          return String(raw);
        }
      }).filter((s: string) => s.trim());
      if (lines.length) this._recentLogs = lines;
    } catch { /* 网关暂不可用时保留旧内容 */ }
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="dashboard-page">

        <!-- Top stat cards -->
        <div class="dashboard-stats">
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">
              Gateway
              <span class="dashboard-stat__status ${this._gwRunning ? 'online' : 'offline'}"></span>
            </div>
            <div class="dashboard-stat__value">${this._gwRunning ? L('dashboard.running') : L('dashboard.stopped')}</div>
            <div class="dashboard-stat__hint">${this._gwPid ? 'PID: ' + this._gwPid : '—'}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.versionSinicized')}</div>
            <div class="dashboard-stat__value">2026.3.24</div>
            <div class="dashboard-stat__hint">${L('dashboard.latestUpstream')} 2026.7.1-zh.2<br/>${L('dashboard.standaloneInstall')}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.agentFleet')}</div>
            <div class="dashboard-stat__value">1 个</div>
            <div class="dashboard-stat__hint">${L('dashboard.defaultAgent')}: main</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.modelPool')}</div>
            <div class="dashboard-stat__value">${this._modelCount} 个</div>
            <div class="dashboard-stat__hint">${L('dashboard.basedOn')} ${this._providerCount} ${L('dashboard.channelProviders')}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.basicServices')}</div>
            <div class="dashboard-stat__value">1/1</div>
            <div class="dashboard-stat__hint">${L('dashboard.survivalRate')} 100%</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">
              ${L('dashboard.controlUI')}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
            <div class="dashboard-stat__value" style="font-size:13px;">${L('dashboard.openclawNative')}</div>
            <div class="dashboard-stat__hint">${L('dashboard.clickToOpen')}</div>
          </div>
        </div>

        <!-- Info cards row 1 -->
        <div class="dashboard-info-grid">
          <div class="dashboard-info-card" @click=${() => this.onNavigate('gateway')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                GATEWAY
              </div>
              <div class="dashboard-info-card__actions">
                ${this._gwRunning
                  ? html`
                    <button class="btn-stop" ?disabled=${this._gwBusy} @click=${(e: Event) => { e.stopPropagation(); this._callGateway('stop'); }}>${L('common.stop')}</button>
                    <button class="btn-restart" ?disabled=${this._gwBusy} @click=${(e: Event) => { e.stopPropagation(); this._callGateway('restart'); }}>${L('common.restart')}</button>
                  `
                  : html`
                    <button class="btn-restart" ?disabled=${this._gwBusy} @click=${(e: Event) => { e.stopPropagation(); this._callGateway('start'); }}>${L('common.start')}</button>
                  `}
              </div>
            </div>
            <div class="dashboard-info-card__status ${this._gwRunning ? 'online' : 'offline'}">${this._gwRunning ? L('dashboard.running') : L('dashboard.stopped')}</div>
            <div class="dashboard-info-card__sub">${this._gwMessage || (L('dashboard.port') + ' 18789 · ' + (this._gwPid ? 'PID ' + this._gwPid : '—'))}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('models')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                ${L('dashboard.mainModel')}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._activeModel ? this._activeModel.model : L('dashboard.notSet')}</div>
            <div class="dashboard-info-card__sub">${this._activeModel
              ? `${this._activeModel.providerName} · ${this._activeModel.apiType}`
              : L('dashboard.concurrencyLimit') + ' 4'}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('skills')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                ${L('dashboard.mcpTools')}
              </div>
            </div>
            <div class="dashboard-info-card__value">0</div>
            <div class="dashboard-info-card__sub">${L('dashboard.mountedExtensions')}</div>
          </div>
        </div>

        <!-- Info cards row 2 -->
        <div class="dashboard-info-grid">
          <div class="dashboard-info-card" @click=${() => this.onNavigate('services')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                ${L('dashboard.recentBackup')}
              </div>
            </div>
            <div class="dashboard-info-card__value">${L('dashboard.noBackup')}</div>
            <div class="dashboard-info-card__sub">0 ${L('dashboard.backupFiles')}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('agents')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                AGENT ${L('dashboard.agentFleet')}
              </div>
            </div>
            <div class="dashboard-info-card__value">1</div>
            <div class="dashboard-info-card__sub">1 个独立工作区</div>
          </div>
          <div class="dashboard-info-card">
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                ${L('dashboard.runtimeVersion')}
              </div>
            </div>
            <div class="dashboard-info-card__value">2026.1.1</div>
            <div class="dashboard-info-card__sub">openclaw.json / ${L('dashboard.localInstall')}</div>
          </div>
        </div>

        <!-- WebSocket status -->
        <div class="dashboard-ws">
          <span class="dashboard-ws__dot ${this.connected ? 'connected' : 'disconnected'}"></span>
          WebSocket ${this.connected ? L('dashboard.wsConnected') : L('dashboard.wsDisconnected')}
        </div>

        <!-- Action buttons -->
        <div class="dashboard-actions">
          <button ?disabled=${this._gwBusy} @click=${() => this._callGateway('restart')}>${this._gwBusy && this._gwMessage ? this._gwMessage : L('dashboard.restartGw')}</button>
          <button @click=${() => this.dispatchEvent(new CustomEvent('check-updates'))}>${L('dashboard.checkUpdates')}</button>
          <button>${L('dashboard.createBackup')}</button>
        </div>

        <!-- Recent logs -->
        <div class="dashboard-logs">
          <div class="dashboard-logs__title">${L('dashboard.recentLogs')}</div>
          <div class="dashboard-logs__body">
            ${this._recentLogs.length
              ? this._recentLogs.map(log => html`${log}\n`)
              : html`…`}
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('dashboard-page', DashboardPage);
