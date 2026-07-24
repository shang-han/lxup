import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getActiveModel, listModels, loadProviders, type ResolvedModel } from '../utils/model-config.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout } from '../utils/net.js';
import { hermesUrl } from '../services/hermes-client.js';
import { getLicenseStatus, type LicenseResponse } from '../services/license.js';
import { getDeviceFingerprint } from '../utils/device.js';
import '../components/page-header.js';

const SERVICES_TOTAL = 4; // Sidecar · Gateway · Hermes · AI Assistant

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
    .dashboard-info-card.static { cursor: default; }
    .dashboard-info-card.static:hover { border-color: var(--border); }
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
    .dashboard-info-card__value.ok { color: var(--success); }
    .dashboard-info-card__value.warn { color: var(--warn); }
    .dashboard-info-card__sub {
      font-size: 11px; color: var(--muted); word-break: break-all;
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
  @property({ type: Function }) onNavigate = () => {};

  // 本地模型配置（localStorage，真实用户数据）
  @state() _activeModel: ResolvedModel | null = null;
  @state() _modelCount = 0;
  @state() _providerCount = 0;
  @state() _recentLogs: string[] = [];

  // 网关侧实际生效的模型（openclaw.json → agents.defaults.model），本地未配置时兜底展示
  @state() _gwModel = '';
  @state() _gwModelProvider = '';

  // 网关进程管理（经 Sidecar :7889）
  @state() _gwRunning = false;
  @state() _gwPid: number | null = null;
  @state() _gwBusy = false;
  @state() _gwMessage = '';

  // 网关 WS 侧真实数据（hello / agents.list / sessions.list / skills.status）
  @state() _gwVersion = '';
  @state() _agentCount: number | null = null;
  @state() _defaultAgent = '';
  @state() _agentIds: string[] = [];
  @state() _sessionCount: number | null = null;
  @state() _skillCount: number | null = null;

  // 基础服务存活（Sidecar / Gateway / Hermes / AI Assistant）
  @state() _servicesUp = 0;

  // 授权状态（Sidecar /api/license/status）
  @state() _license: LicenseResponse | null = null;

  _storeUnsub: (() => void) | null = null;

  /** Sidecar HTTP 基址（网关进程管理走 Sidecar :7889） */
  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._refreshModelInfo();
    this._refreshGatewayStatus().then(() => this._refreshServiceHealth());
    this._refreshLicense();
    this._refreshWsInfo();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe((snap) => {
      if (snap.hello?.server?.version) this._gwVersion = snap.hello.server.version;
      if (snap.connected) {
        this._fetchRecentLogs();
        this._refreshWsInfo();
      }
    });
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

  /** 刷新网关进程状态（Sidecar /api/gateway/status） */
  async _refreshGatewayStatus() {
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/gateway/status`, {}, 8000);
      const s = await r.json();
      this._gwRunning = !!s.running;
      this._gwPid = s.pid ?? null;
    } catch {
      // Sidecar 不可达时保持现状（不误报停止），仅标记未知
      this._gwRunning = false;
      this._gwPid = null;
    }
  }

  _gwMsgTimer: ReturnType<typeof setTimeout> | null = null;

  /** 设置网关操作消息，6 秒后自动清除（避免陈旧消息顶替端口/PID 显示） */
  _setGwMessage(msg: string, sticky = false) {
    this._gwMessage = msg;
    if (this._gwMsgTimer) clearTimeout(this._gwMsgTimer);
    if (!sticky) {
      this._gwMsgTimer = setTimeout(() => { this._gwMessage = ''; }, 6000);
    }
  }

  /** 基础服务存活统计：Sidecar / Gateway / Hermes / AI Assistant */
  async _refreshServiceHealth() {
    const host = window.location.hostname || '127.0.0.1';
    const [sidecar, hermes, assistant] = await Promise.all([
      fetchTimeout(`${this._sidecarBase}/health`, {}, 3000).then(r => r.ok).catch(() => false),
      // no-cors：任何 HTTP 响应（含 401）都说明引擎在跑，规避 CORS 误判
      fetchTimeout(`${hermesUrl()}/health`, { mode: 'no-cors' }, 3000).then(() => true).catch(() => false),
      fetchTimeout(`http://${host}:8080/api/status`, {}, 3000).then(r => r.ok).catch(() => false),
    ]);
    this._servicesUp = [sidecar, this._gwRunning, hermes, assistant].filter(Boolean).length;
  }

  /** 经共享 WS 连接拉取：网关版本 / Agent 编队 / 会话数 / 技能数 */
  async _refreshWsInfo() {
    const store = getSharedStore();
    if (store.snapshot.hello?.server?.version) {
      this._gwVersion = store.snapshot.hello.server.version;
    }
    if (!store.connected) return;
    try {
      const res = await store.request<any>('agents.list', {});
      const agents: any[] = res?.agents || [];
      this._agentCount = agents.length;
      this._defaultAgent = res?.defaultId || '';
      this._agentIds = agents.map(a => String(a.id ?? a.name ?? '')).filter(Boolean);
    } catch { /* 瞬时错误忽略 */ }
    try {
      const res = await store.request<any>('sessions.list', {});
      this._sessionCount = (res?.sessions || []).length;
    } catch { /* ignore */ }
    try {
      const res = await store.request<any>('skills.status', {});
      this._skillCount = (res?.skills || []).length;
    } catch { /* ignore */ }

    // 本地「模型配置」页（localStorage）未配置时，展示网关配置里实际生效的模型，
    // 避免网关已配 deepseek/xxx 而仪表盘却显示「未设置」的假阴性
    if (!this._activeModel) {
      try {
        const g = await store.request<any>('config.get', {});
        const cfg = g?.config || g?.parsed || {};
        const m = cfg?.agents?.defaults?.model;
        const modelStr = typeof m === 'string' ? m : (m?.model || '');
        if (modelStr) {
          const slash = modelStr.indexOf('/');
          this._gwModelProvider = slash > 0 ? modelStr.slice(0, slash) : '';
          this._gwModel = slash > 0 ? modelStr.slice(slash + 1) : modelStr;
        }
      } catch { /* ignore */ }
    }
  }

  /** 授权状态（本地校验，不触发联网） */
  async _refreshLicense() {
    try {
      const fp = await getDeviceFingerprint();
      this._license = await getLicenseStatus(fp);
    } catch {
      this._license = null;
    }
  }

  /** 调用 Sidecar 的网关管理端点（stop/start/restart） */
  async _callGateway(action: 'stop' | 'start' | 'restart') {
    if (this._gwBusy) return;
    this._gwBusy = true;
    this._setGwMessage(action === 'stop' ? '正在停止网关…' : action === 'start' ? '正在启动网关…' : '正在重启网关…', true);
    // 超时留足余量：Sidecar 侧 stop 最长 ~12s、start ~32s、restart 两者之和
    const timeout = action === 'stop' ? 20000 : action === 'start' ? 45000 : 60000;
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/gateway/${action}`, { method: 'POST' }, timeout);
      const res = await r.json();
      this._setGwMessage(res.message || (res.started || res.restarted ? '操作成功' : '操作完成'));
      await this._refreshGatewayStatus();
      await this._refreshServiceHealth();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setGwMessage(msg.includes('aborted') ? `操作超时（${action}）` : `操作失败：${msg}`);
    } finally {
      this._gwBusy = false;
      // 网关状态变化后，共享连接的 store 会自动重连/断开
      setTimeout(() => this._refreshGatewayStatus(), 2000);
    }
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

  _licenseValue(): { text: string; cls: string } {
    const lic = this._license;
    if (!lic) return { text: '—', cls: '' };
    if (lic.status === 'ok') return { text: L('dashboard.licenseOk'), cls: 'ok' };
    if (lic.status === 'not_activated') return { text: L('dashboard.licenseNotActivated'), cls: 'warn' };
    return { text: L('dashboard.licenseIssue'), cls: 'warn' };
  }

  render() {
    const survivalPct = Math.round((this._servicesUp / SERVICES_TOTAL) * 100);
    const lic = this._licenseValue();
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
            <div class="dashboard-stat__value">${this._gwVersion || '—'}</div>
            <div class="dashboard-stat__hint">${L('dashboard.port')} 18789${this._gwPid ? ' · PID ' + this._gwPid : ''}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.agentFleet')}</div>
            <div class="dashboard-stat__value">${this._agentCount === null ? '—' : this._agentCount + ' 个'}</div>
            <div class="dashboard-stat__hint">${L('dashboard.defaultAgentLabel')}: ${this._defaultAgent || '—'}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.modelPool')}</div>
            <div class="dashboard-stat__value">${this._modelCount} 个</div>
            <div class="dashboard-stat__hint">${L('dashboard.basedOn')} ${this._providerCount} ${L('dashboard.channelProviders')}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${L('dashboard.basicServices')}</div>
            <div class="dashboard-stat__value">${this._servicesUp}/${SERVICES_TOTAL}</div>
            <div class="dashboard-stat__hint">${L('dashboard.survivalRate')} ${survivalPct}%</div>
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
            <div class="dashboard-info-card__value">${this._activeModel
              ? this._activeModel.model
              : (this._gwModel || L('dashboard.notSet'))}</div>
            <div class="dashboard-info-card__sub">${this._activeModel
              ? `${this._activeModel.providerName} · ${this._activeModel.apiType}`
              : this._gwModel
                ? `${this._gwModelProvider ? this._gwModelProvider + ' · ' : ''}${L('dashboard.fromGatewayConfig')}`
                : L('dashboard.concurrencyLimit') + ' 4'}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('skills')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                ${L('dashboard.mcpTools')}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._skillCount === null ? '—' : this._skillCount}</div>
            <div class="dashboard-info-card__sub">${L('dashboard.builtinSkills')}</div>
          </div>
        </div>

        <!-- Info cards row 2 -->
        <div class="dashboard-info-grid">
          <div class="dashboard-info-card static">
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                ${L('dashboard.licenseCard')}
              </div>
            </div>
            <div class="dashboard-info-card__value ${lic.cls}">${lic.text}</div>
            <div class="dashboard-info-card__sub">${this._license?.device_name || this._license?.message || ''}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('agents')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                AGENT ${L('dashboard.agentFleet')}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._agentCount === null ? '—' : this._agentCount}</div>
            <div class="dashboard-info-card__sub">${this._agentIds.length ? this._agentIds.join(' · ') : '—'}</div>
          </div>
          <div class="dashboard-info-card" @click=${() => this.onNavigate('chat')}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${L('dashboard.activeSessions')}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._sessionCount === null ? '—' : this._sessionCount}</div>
            <div class="dashboard-info-card__sub">${L('dashboard.sessionSource')}</div>
          </div>
        </div>

        <!-- WebSocket status -->
        <div class="dashboard-ws">
          <span class="dashboard-ws__dot ${this.connected ? 'connected' : 'disconnected'}"></span>
          WebSocket ${this.connected ? L('dashboard.wsConnected') : L('dashboard.wsDisconnected')}
          ${this._gwVersion ? html`<span style="margin-left:auto;font-size:11px;color:var(--muted);">v${this._gwVersion}</span>` : ''}
        </div>

        <!-- Action buttons -->
        <div class="dashboard-actions">
          <button ?disabled=${this._gwBusy} @click=${() => this._callGateway('restart')}>${this._gwBusy && this._gwMessage ? this._gwMessage : L('dashboard.restartGw')}</button>
          <button @click=${() => this.dispatchEvent(new CustomEvent('check-updates'))}>${L('dashboard.checkUpdates')}</button>
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
