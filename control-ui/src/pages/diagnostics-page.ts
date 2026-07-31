import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout } from '../utils/net.js';
import { hermesUrl } from '../services/hermes-client.js';
import { getLicenseStatus } from '../services/license.js';
import { getDeviceFingerprint } from '../utils/device.js';
import '../components/page-header.js';

/**
 * 诊断页 —— 一键体检全部为真实探测：
 *   Sidecar 健康 / 网关进程 / WebSocket 握手 / Agent RPC / 配置读取 /
 *   Hermes 引擎 / AI 助手 / 授权状态 / 设备指纹
 * 非核心服务（Hermes、AI 助手）异常计为警告，不判为失败。
 */

type CheckStatus = 'pending' | 'ok' | 'warn' | 'fail';

interface DiagItem {
  id: string;
  name: string;
  detail: string;
  status: CheckStatus;
}

const TOOL_BUTTONS = [
  { key: 'autoRepair', labelKey: 'diagnostics.autoRepair' },
  { key: 'wsTest', labelKey: 'diagnostics.wsTest' },
  { key: 'connDiag', labelKey: 'diagnostics.connDiag' },
];

export class DiagnosticsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .diagnostics-page {
      width: 100%;
      display: flex; flex-direction: column; align-items: center;
      min-height: calc(100vh - 120px);
    }

    /* === shield button === */
    .diag-shield {
      display: flex; flex-direction: column; align-items: center;
      margin: 20px 0 16px; cursor: pointer; user-select: none;
    }
    .diag-shield__circle {
      width: 120px; height: 120px; border-radius: 50%;
      background: var(--card); border: 2px solid var(--border);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: all var(--duration-fast);
    }
    .diag-shield:hover .diag-shield__circle {
      border-color: var(--accent); box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .diag-shield__icon {
      width: 32px; height: 32px; color: var(--accent); margin-bottom: 6px;
      transition: transform var(--duration-fast);
    }
    .diag-shield__icon.ok { color: var(--success); }
    .diag-shield__icon.fail { color: var(--danger); }
    .diag-shield:hover .diag-shield__icon { transform: scale(1.08); }
    .diag-shield__label {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .diag-shield__hint {
      font-size: 12px; color: var(--muted); margin-top: 8px;
    }
    @keyframes diag-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.25); }
      50% { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
    }
    .diag-shield__circle.all-ok { border-color: var(--success); animation: diag-pulse 2s ease infinite; }
    .diag-shield__circle.has-fail { border-color: var(--danger); }

    /* === status result === */
    .diag-result {
      width: 100%; max-width: 680px;
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: var(--radius-md);
      margin-bottom: 16px;
    }
    .diag-result.ok {
      background: var(--success-subtle); border: 1px solid rgba(34,197,94,0.2);
    }
    .diag-result.warn {
      background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.25);
    }
    .diag-result.fail {
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,0.2);
    }
    .diag-result__icon {
      font-size: 28px; font-weight: 300; color: var(--text-strong);
    }
    .diag-result__title {
      font-size: 15px; font-weight: 600; color: var(--text-strong);
    }
    .diag-result__desc {
      font-size: 12px; color: var(--text-soft);
    }

    /* === check list === */
    .diag-list {
      width: 100%; max-width: 680px;
      display: flex; flex-direction: column; gap: 6px;
      margin-bottom: 16px;
    }
    .diag-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
      animation: diag-item-in 0.25s ease both;
    }
    @keyframes diag-item-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    .diag-item__status {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; flex-shrink: 0;
    }
    .diag-item__status.ok { background: var(--success-subtle); color: var(--success); }
    .diag-item__status.fail { background: var(--danger-subtle); color: var(--danger); }
    .diag-item__status.warn { background: rgba(245,158,11,0.12); color: var(--warn); }
    .diag-item__status.pending { background: var(--bg-muted); color: var(--muted); }
    .diag-item__content { flex: 1; min-width: 0; }
    .diag-item__name {
      font-size: 13px; font-weight: 500; color: var(--text-strong);
    }
    .diag-item__detail {
      font-size: 11px; color: var(--muted);
      font-family: var(--font-mono); word-break: break-all;
    }

    /* === advanced tools === */
    .diag-advanced-wrap {
      width: 100%; max-width: 680px;
      margin-bottom: 16px;
    }
    .diag-advanced {
      font-size: 12px; color: var(--accent); cursor: pointer;
      display: flex; align-items: center; gap: 4px; justify-content: center;
    }
    .diag-advanced:hover { text-decoration: underline; }

    /* === tool bar === */
    .diag-toolbar {
      width: 100%; max-width: 680px;
      display: flex; flex-wrap: nowrap; gap: 8px; justify-content: center;
      padding: 14px 20px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-top: 12px;
    }
    .diag-toolbar button {
      padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--bg-muted); color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .diag-toolbar button:hover { background: var(--bg-hover); color: var(--text); }
    .diag-toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 600px) { .diag-toolbar { flex-wrap: wrap; } }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _checking = false;
  @state() _ranOnce = false;
  @state() _items: DiagItem[] = [];
  @state() _showAdvanced = false;
  @state() _repairing = false;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  // ── 检查执行 ──────────────────────────────────────

  _baseItems(): DiagItem[] {
    return [
      { id: 'sidecar', name: L('diagnostics.checkSidecar'), detail: '', status: 'pending' },
      { id: 'gateway', name: L('diagnostics.checkGatewayProc'), detail: '', status: 'pending' },
      { id: 'ws', name: L('diagnostics.checkWs'), detail: '', status: 'pending' },
      { id: 'agents', name: L('diagnostics.checkAgents'), detail: '', status: 'pending' },
      { id: 'config', name: L('diagnostics.checkConfigRead'), detail: '', status: 'pending' },
      { id: 'hermes', name: L('diagnostics.checkHermes'), detail: '', status: 'pending' },
      { id: 'assistant', name: L('diagnostics.checkAssistant'), detail: '', status: 'pending' },
      { id: 'license', name: L('diagnostics.checkLicense'), detail: '', status: 'pending' },
      { id: 'fingerprint', name: L('diagnostics.checkFingerprint'), detail: '', status: 'pending' },
    ];
  }

  _updateItem(id: string, status: CheckStatus, detail: string) {
    this._items = this._items.map(it => (it.id === id ? { ...it, status, detail } : it));
  }

  _errText(e: unknown): string {
    const msg = e instanceof Error ? e.message : String(e);
    return msg.length > 80 ? msg.slice(0, 80) + '…' : msg;
  }

  async _runCheck() {
    if (this._checking) return;
    this._checking = true;
    this._ranOnce = true;
    this._items = this._baseItems();

    const host = window.location.hostname || '127.0.0.1';
    const store = getSharedStore();

    const checks: Array<Promise<void>> = [
      // 1. Sidecar 服务
      (async () => {
        try {
          const r = await fetchTimeout(`${this._sidecarBase}/health`, {}, 4000);
          const j = await r.json();
          this._updateItem('sidecar', r.ok ? 'ok' : 'fail', r.ok ? `${j.service} v${j.version}` : `HTTP ${r.status}`);
        } catch (e) {
          this._updateItem('sidecar', 'fail', this._errText(e) || 'unreachable');
        }
      })(),

      // 2. 网关进程（Sidecar 报告 PID + 可达性）
      (async () => {
        try {
          const r = await fetchTimeout(`${this._sidecarBase}/api/gateway/status`, {}, 4000);
          const s = await r.json();
          this._updateItem('gateway', s.running ? 'ok' : 'fail',
            s.running ? `PID ${s.pid ?? '—'} · :${s.port}` : `stopped · :${s.port}`);
        } catch (e) {
          this._updateItem('gateway', 'fail', this._errText(e));
        }
      })(),

      // 3. WebSocket 握手
      (async () => {
        const snap = store.snapshot;
        if (snap.connected && snap.hello) {
          const ver = (snap.hello as any)?.server?.version;
          this._updateItem('ws', 'ok', ver ? `v${ver}` : 'connected');
        } else {
          this._updateItem('ws', 'fail', snap.lastError || L('dashboard.wsDisconnected'));
        }
      })(),

      // 4. Agent RPC
      (async () => {
        if (!store.connected) return this._updateItem('agents', 'fail', L('dashboard.wsDisconnected'));
        try {
          const res = await store.request<any>('agents.list', {});
          const n = (res?.agents || []).length;
          this._updateItem('agents', 'ok', `${n} agents · ${res?.defaultId || '—'}`);
        } catch (e) {
          this._updateItem('agents', 'fail', this._errText(e));
        }
      })(),

      // 5. 配置读取
      (async () => {
        if (!store.connected) return this._updateItem('config', 'fail', L('dashboard.wsDisconnected'));
        try {
          const g = await store.request<any>('config.get', {});
          const keys = Object.keys(g?.config || g?.parsed || {}).length;
          this._updateItem('config', 'ok', `${keys} keys · hash ${(g?.hash || '').slice(0, 8) || '—'}`);
        } catch (e) {
          this._updateItem('config', 'fail', this._errText(e));
        }
      })(),

      // 6. Hermes 引擎（非核心 → 异常记 warn）
      (async () => {
        try {
          await fetchTimeout(`${hermesUrl()}/health`, { mode: 'no-cors' }, 4000);
          this._updateItem('hermes', 'ok', ':8642');
        } catch {
          this._updateItem('hermes', 'warn', L('init.checkFailed'));
        }
      })(),

      // 7. AI 助手（非核心 → 异常记 warn）
      (async () => {
        try {
          const r = await fetchTimeout(`http://${host}:8080/api/status`, {}, 4000);
          const j = await r.json().catch(() => ({} as any));
          if (r.ok) this._updateItem('assistant', 'ok', `${j.model || '—'} · key ${j.hasKey ? '✓' : '✗'}`);
          else this._updateItem('assistant', 'warn', `HTTP ${r.status}`);
        } catch {
          this._updateItem('assistant', 'warn', L('init.checkFailed'));
        }
      })(),

      // 8. 授权状态
      (async () => {
        try {
          const fp = await getDeviceFingerprint();
          const lic = await getLicenseStatus(fp);
          if (lic.status === 'ok') this._updateItem('license', 'ok', lic.device_name || lic.message || 'ok');
          else if (lic.status === 'not_activated') this._updateItem('license', 'warn', lic.message || lic.status);
          else this._updateItem('license', 'fail', lic.message || lic.status);
        } catch (e) {
          this._updateItem('license', 'fail', this._errText(e));
        }
      })(),

      // 9. 设备指纹
      (async () => {
        try {
          const fp = await getDeviceFingerprint();
          this._updateItem('fingerprint', 'ok', fp.length > 24 ? fp.slice(0, 24) + '…' : fp);
        } catch (e) {
          this._updateItem('fingerprint', 'fail', this._errText(e));
        }
      })(),
    ];

    await Promise.all(checks);
    this._checking = false;
  }

  /** 自动修复：经 Sidecar 重启网关，然后重新体检 */
  async _autoRepair() {
    if (this._repairing || this._checking) return;
    this._repairing = true;
    try {
      await fetch(`${this._sidecarBase}/api/gateway/restart`, { method: 'POST' });
    } catch { /* 结果由随后的体检呈现 */ }
    // 等待网关重新就绪后再体检
    await new Promise(r => setTimeout(r, 3000));
    this._repairing = false;
    await this._runCheck();
  }

  _renderToolbar() {
    return html`
      <div class="diag-toolbar">
        ${TOOL_BUTTONS.map(t => html`
          <button ?disabled=${this._checking || this._repairing} @click=${() => {
            if (t.key === 'autoRepair') this._autoRepair();
            else this._runCheck();
          }}>${this._repairing && t.key === 'autoRepair' ? L('diagnostics.repairing') : L(t.labelKey)}</button>
        `)}
      </div>
    `;
  }

  render() {
    const done = this._items.filter(i => i.status !== 'pending');
    const failCount = this._items.filter(i => i.status === 'fail').length;
    const warnCount = this._items.filter(i => i.status === 'warn').length;
    const allChecked = this._ranOnce && !this._checking && done.length === this._items.length;

    const shieldCls = !allChecked ? '' : (failCount > 0 ? 'has-fail' : 'all-ok');
    const shieldIconCls = !allChecked ? '' : (failCount > 0 ? 'fail' : 'ok');

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="diagnostics-page">

        <!-- Shield button -->
        <div class="diag-shield" @click=${() => this._runCheck()}>
          <div class="diag-shield__circle ${shieldCls}">
            <div class="diag-shield__icon ${shieldIconCls}">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div class="diag-shield__label">${this._checking ? L('diagnostics.checking') : L('diagnostics.startCheck')}</div>
          </div>
          <div class="diag-shield__hint">${this._ranOnce ? L('diagnostics.clickToRetry') : L('diagnostics.clickToStart')}</div>
        </div>

        <!-- Results -->
        ${this._ranOnce ? html`
          ${allChecked ? html`
            ${failCount > 0 ? html`
              <div class="diag-result fail">
                <div class="diag-result__icon">✗</div>
                <div>
                  <div class="diag-result__title">${L('diagnostics.hasFails', { count: failCount })}</div>
                  <div class="diag-result__desc">${L('diagnostics.checkedTotal', { count: this._items.length })}</div>
                </div>
              </div>
            ` : warnCount > 0 ? html`
              <div class="diag-result warn">
                <div class="diag-result__icon">!</div>
                <div>
                  <div class="diag-result__title">${L('diagnostics.hasWarns', { count: warnCount })}</div>
                  <div class="diag-result__desc">${L('diagnostics.checkedTotal', { count: this._items.length })}</div>
                </div>
              </div>
            ` : html`
              <div class="diag-result ok">
                <div class="diag-result__icon">✓</div>
                <div>
                  <div class="diag-result__title">${L('diagnostics.allOk')}</div>
                  <div class="diag-result__desc">${L('diagnostics.checkSummary', { count: this._items.length })}</div>
                </div>
              </div>
            `}
          ` : ''}

          <!-- Check list -->
          <div class="diag-list">
            ${this._items.map(item => html`
              <div class="diag-item">
                <div class="diag-item__status ${item.status}">
                  ${item.status === 'ok' ? '✓' : item.status === 'fail' ? '✗' : item.status === 'warn' ? '!' : '…'}
                </div>
                <div class="diag-item__content">
                  <div class="diag-item__name">${item.name}</div>
                  ${item.detail ? html`<div class="diag-item__detail">${item.detail}</div>` : ''}
                </div>
              </div>
            `)}
          </div>
        ` : ''}

        <!-- Advanced tools -->
        <div class="diag-advanced-wrap">
          <div class="diag-advanced" @click=${() => { this._showAdvanced = !this._showAdvanced; }}>
            ${this._showAdvanced ? '▾' : '▸'} ${L('diagnostics.advancedTools')}
          </div>
          ${this._showAdvanced ? this._renderToolbar() : ''}
        </div>

      </div>
    `;
  }
}

customElements.define('diagnostics-page', DiagnosticsPage);
