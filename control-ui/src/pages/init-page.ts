import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { i18n, L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout, sleep } from '../utils/net.js';
import { hermesUrl, hermesKey } from '../services/hermes-client.js';
import {
  checkSidecarHealth, getLicenseStatus, activateLicense, validateLicense,
  sidecarBaseUrl,
} from '../services/license.js';
import type { LicenseResponse } from '../services/license.js';
import { getDeviceFingerprint } from '../utils/device.js';

/**
 * 启动自检页 —— 全部为真实检查：
 *   1. 前端模块   本页能渲染即就绪
 *   2. Sidecar    GET :7889/health（授权客户端 + 微信登录桥）
 *   3. OpenClaw   复用共享 GatewayStore 的 WebSocket 握手（challenge → hello）
 *   4. Hermes     GET :8642/health（Bearer 鉴权）
 *   5. 授权校验   GET :7889/api/license/status；非 ok 时展示激活/重验面板
 *
 * 门控策略：Sidecar 不通则中止（授权无从校验）；引擎失败不锁死
 * （Hermes 首次需进应用内安装器引导），允许「重试 / 仍然进入」；
 * 授权未通过必须激活/重验后才能进入。
 */

type StepState = 'pending' | 'running' | 'ok' | 'fail';
interface Step { key: string; textKey: string; state: StepState; detail?: string; }

export class InitPage extends LitElement {
  static styles = css`
    :host {
      position: fixed; inset: 0;
      display: grid; place-items: center;
      width: 100vw; min-height: 100dvh;
      background: var(--bg); box-sizing: border-box;
    }
    .init-bg {
      position: fixed; inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.3;
    }
    .init-card {
      position: relative; z-index: 1;
      width: min(480px, calc(100vw - 48px));
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 28px 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .init-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .init-brand { display: flex; align-items: center; gap: 10px; }
    .init-brand img { width: 28px; height: 28px; }
    .init-brand span { font-size: 16px; font-weight: 700; color: var(--text-strong); }
    .init-lang {
      display: flex; gap: 2px; padding: 2px;
      background: var(--bg-muted); border-radius: var(--radius-full);
    }
    .init-lang button {
      padding: 4px 12px; border-radius: var(--radius-full);
      font-size: 12px; font-weight: 500; border: none;
      cursor: pointer; color: var(--text-soft); background: transparent;
    }
    .init-lang button.active { background: var(--text-strong); color: var(--accent-foreground); }

    .init-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .init-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-soft);
    }
    .init-item.ok { color: var(--text); }
    .init-item.ok .check { color: var(--success); }
    .init-item.running .spinner { color: var(--warn); }
    .init-item.fail { color: var(--text); }
    .init-item.fail .fail { color: var(--danger); }
    .init-item .check, .init-item .spinner, .init-item .fail { width: 16px; height: 16px; flex-shrink: 0; }
    .init-item .dot {
      width: 16px; height: 16px; flex-shrink: 0; box-sizing: border-box;
      border: 1.5px solid var(--border-strong, var(--border)); border-radius: 50%; opacity: 0.5;
    }
    .item-detail {
      margin-left: auto; font-size: 11px; color: var(--muted);
      font-family: var(--font-mono); text-align: right;
    }
    .init-item.fail .item-detail { color: var(--danger); }

    .init-progress { margin-bottom: 16px; }
    .init-progress-label {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-bottom: 6px;
    }
    .init-progress-label .pct { color: var(--accent); font-weight: 600; }
    .init-progress-bar { height: 4px; background: var(--bg-muted); border-radius: 2px; overflow: hidden; }
    .init-progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--warn));
      border-radius: 2px; transition: width 0.3s ease;
    }
    .init-device {
      font-size: 11px; color: var(--muted); margin-top: 4px;
      font-family: var(--font-mono); word-break: break-all;
    }

    .init-logs {
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 12px;
      max-height: 120px; overflow-y: auto;
      font-family: var(--font-mono); font-size: 11px;
      color: var(--text-soft); line-height: 1.6;
    }
    .init-footer {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-top: 16px;
      padding-top: 12px; border-top: 1px dashed var(--border);
    }

    /* ── 授权校验面板 ── */
    .license-panel {
      margin-bottom: 16px; padding: 14px;
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .license-msg { font-size: 13px; color: var(--warn); line-height: 1.5; margin-bottom: 10px; }
    .license-panel.bad .license-msg { color: var(--danger); }
    .license-detail {
      font-size: 11px; color: var(--muted); margin-bottom: 10px;
      word-break: break-all; line-height: 1.5;
    }
    .license-row { display: flex; gap: 8px; }
    .license-input {
      flex: 1; min-width: 0; padding: 8px 12px;
      background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text);
      font-size: 13px; font-family: var(--font-mono); text-transform: uppercase;
    }
    .license-input:focus { outline: none; border-color: var(--accent); }
    .license-btn {
      padding: 8px 16px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground); white-space: nowrap;
      transition: background var(--duration-fast) ease;
    }
    .license-btn:hover { background: var(--accent-hover); }
    .license-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .license-btn.wide { width: 100%; margin-top: 10px; }
    .license-btn.ghost {
      background: transparent; color: var(--text-soft);
      border: 1px solid var(--border); font-weight: 500;
    }
    .license-btn.ghost:hover { background: var(--bg-hover); color: var(--text); }
    .license-offline { font-size: 11px; color: var(--muted); margin-top: 8px; }

    .init-actions { display: flex; gap: 8px; margin-bottom: 16px; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { animation: spin 1s linear infinite; }
  `;

  @state() _lang = i18n.locale;
  @state() _steps: Step[] = [
    { key: 'frontend', textKey: 'init.frontendReady', state: 'pending' },
    { key: 'sidecar', textKey: 'init.sidecar', state: 'pending' },
    { key: 'openclaw', textKey: 'init.engineOpenclaw', state: 'pending' },
    { key: 'hermes', textKey: 'init.engineHermes', state: 'pending' },
    { key: 'license', textKey: 'init.license', state: 'pending' },
  ];
  @state() _logs: string[] = [];
  @state() _license: LicenseResponse | null = null;   // 非 ok 时的授权结果（渲染激活面板）
  @state() _busyAction: 'activate' | 'validate' | 'recheck' | null = null;
  @state() _code = '';
  @state() _fingerprint = '';
  @state() _allDone = false;
  _unsubI18n: (() => void) | null = null;
  _running = false;
  _runId = 0;
  _enterTimer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => {
      this._lang = i18n.locale;
      this.requestUpdate();
    });
    this._runChecks();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
    if (this._enterTimer) clearTimeout(this._enterTimer);
  }

  protected updated() {
    const el = this.shadowRoot?.querySelector('.init-logs');
    if (el) el.scrollTop = el.scrollHeight;
  }

  _toggleLang() {
    i18n.setLocale(this._lang === 'zh-CN' ? 'en' : 'zh-CN');
  }

  // ── 自检主流程 ────────────────────────────────────

  async _runChecks() {
    if (this._running) return;
    this._running = true;
    const runId = ++this._runId;
    const alive = () => this._runId === runId;

    this._allDone = false;
    this._license = null;
    this._logs = [];
    this._steps = this._steps.map(s => ({ ...s, state: 'pending', detail: undefined }));
    this._log(L('init.checkStart'));

    // 1. 前端模块（能渲染本页即就绪，短暂停留便于用户感知）
    this._setStep('frontend', 'running');
    await sleep(300);
    if (!alive()) return;
    this._setStep('frontend', 'ok');

    // 设备指纹（授权校验的入参，提前取好顺便展示）
    this._fingerprint = await getDeviceFingerprint();
    if (!alive()) return;

    // 2. Sidecar —— 授权校验的前置，不通则中止
    this._setStep('sidecar', 'running');
    this._log(`GET ${sidecarBaseUrl()}/health`);
    const sidecarOk = await checkSidecarHealth();
    if (!alive()) return;
    if (!sidecarOk) {
      this._setStep('sidecar', 'fail', L('init.checkFailed'));
      this._log('Sidecar 不可达 —— 请先运行 start-all.bat 启动服务');
      this._running = false;
      return;
    }
    this._setStep('sidecar', 'ok');
    this._log('Sidecar OK（:7889）');

    // 3. OpenClaw —— 等待共享 WebSocket 握手完成
    this._setStep('openclaw', 'running');
    this._log('连接 OpenClaw 网关（:18789 WebSocket）…');
    const oc = await this._waitOpenclaw(8000);
    if (!alive()) return;
    if (oc.ok) {
      this._setStep('openclaw', 'ok', oc.ver ? `v${oc.ver}` : undefined);
      this._log(`OpenClaw 握手成功${oc.ver ? `（v${oc.ver}）` : ''}`);
    } else {
      this._setStep('openclaw', 'fail', L('init.checkFailed'));
      this._log('OpenClaw 网关未就绪（:18789 无响应）');
    }

    // 4. Hermes —— HTTP /health
    this._setStep('hermes', 'running');
    this._log(`GET ${hermesUrl()}/health`);
    const hm = await this._probeHermes();
    if (!alive()) return;
    if (hm.ok) {
      this._setStep('hermes', 'ok', hm.detail || undefined);
      this._log(`Hermes OK（:8642）${hm.detail ? ' ' + hm.detail : ''}`);
    } else {
      this._setStep('hermes', 'fail', L('init.checkFailed'));
      this._log('Hermes 网关未就绪（:8642 无响应）');
    }

    // 5. 授权校验
    await this._checkLicense();
    if (!alive()) return;
    this._running = false;
  }

  /** 等待 OpenClaw 网关 WebSocket 握手（connected + hello），超时视为未就绪 */
  _waitOpenclaw(timeoutMs: number): Promise<{ ok: boolean; ver?: string }> {
    const store = getSharedStore();
    return new Promise(resolve => {
      let settled = false;
      let unsub: (() => void) | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const finish = (r: { ok: boolean; ver?: string }) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        if (unsub) unsub();
        resolve(r);
      };
      timer = setTimeout(() => finish({ ok: false }), timeoutMs);
      // subscribe 会同步回灌当前快照：finish 可能在本行内就执行完，
      // 故 unsub 完成赋值后再补一次退订
      unsub = store.subscribe(snap => {
        if (snap.connected && snap.hello) {
          finish({ ok: true, ver: (snap.hello as any)?.server?.version });
        }
      });
      if (settled) unsub();
    });
  }

  /** Hermes 存活探测：任何 HTTP 响应（含 401）都说明引擎进程在跑 */
  async _probeHermes(): Promise<{ ok: boolean; detail?: string }> {
    try {
      const res = await fetchTimeout(`${hermesUrl()}/health`, {
        headers: { Authorization: `Bearer ${hermesKey()}` },
      }, 6000);
      return { ok: true, detail: res.ok ? '' : `HTTP ${res.status}` };
    } catch {
      return { ok: false };
    }
  }

  // ── 授权校验 ──────────────────────────────────────

  async _checkLicense() {
    this._setStep('license', 'running');
    this._log('GET /api/license/status');
    let resp: LicenseResponse;
    try {
      resp = await getLicenseStatus(this._fingerprint);
    } catch (e) {
      resp = { success: false, status: 'error', message: String(e) };
    }
    this._applyLicense(resp);
  }

  _applyLicense(resp: LicenseResponse) {
    if (resp.status === 'ok') {
      this._license = null;
      this._setStep('license', 'ok', resp.device_name || undefined);
      this._log(resp.days_offline
        ? `授权有效（离线第 ${resp.days_offline} 天，剩余宽限 ${resp.offline_remaining} 天）`
        : '授权有效');
      this._finish();
    } else {
      this._license = resp;
      this._setStep('license', 'fail', resp.status);
      this._log(`授权状态：${resp.status}${resp.message ? ' — ' + resp.message : ''}`);
    }
  }

  async _activate() {
    const code = this._code.trim();
    if (!code || this._busyAction) return;
    this._busyAction = 'activate';
    this._log(`提交激活码 ${code.slice(0, 2)}*** → /api/license/activate`);
    let resp: LicenseResponse;
    try {
      resp = await activateLicense(this._fingerprint, code);
    } catch (e) {
      resp = { success: false, status: 'error', message: String(e) };
    }
    this._busyAction = null;
    this._applyLicense(resp);
  }

  async _revalidate() {
    if (this._busyAction) return;
    this._busyAction = 'validate';
    this._log('联网重新校验 → /api/license/validate');
    let resp: LicenseResponse;
    try {
      resp = await validateLicense(this._fingerprint);
    } catch (e) {
      resp = { success: false, status: 'error', message: String(e) };
    }
    this._busyAction = null;
    this._applyLicense(resp);
  }

  async _recheck() {
    if (this._busyAction) return;
    this._busyAction = 'recheck';
    await this._checkLicense();
    this._busyAction = null;
  }

  // ── 收尾 ──────────────────────────────────────────

  /** 授权通过：引擎全绿则自动进入，有引擎失败则等用户决定 */
  _finish() {
    if (this._steps.some(s => s.key !== 'license' && s.state === 'fail')) return;
    this._allDone = true;
    this._log(L('init.entering'));
    this._enterTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('init-done'));
    }, 1200);
  }

  _retry() { this._runChecks(); }
  _enterAnyway() { this.dispatchEvent(new CustomEvent('init-done')); }

  _licenseText(status: string): string {
    const map: Record<string, string> = {
      not_activated: L('init.licenseNotActivated'),
      blocked_offline: L('init.licenseBlockedOffline'),
      device_changed: L('init.licenseDeviceChanged'),
      revoked: L('init.licenseRevoked'),
      error: L('init.licenseError'),
    };
    return map[status] || L('init.licenseError');
  }

  // ── 辅助 ──────────────────────────────────────────

  _log(msg: string) {
    const ts = new Date().toTimeString().slice(0, 8);
    this._logs = [...this._logs.slice(-49), `[${ts}] ${msg}`];
  }

  _setStep(key: string, s: StepState, detail?: string) {
    this._steps = this._steps.map(st => (st.key === key ? { ...st, state: s, detail } : st));
  }

  get _progress(): number {
    if (this._allDone) return 100;
    const ok = this._steps.filter(s => s.state === 'ok').length;
    return Math.round((ok / this._steps.length) * 100);
  }

  // ── 渲染 ──────────────────────────────────────────

  render() {
    const failed = this._steps.filter(s => s.state === 'fail');
    const licenseOk = this._steps.find(s => s.key === 'license')?.state === 'ok';
    // 检查失败且不在授权交互中 → 显示操作按钮（重试；授权已通过则允许跳过坏引擎）
    const showActions = !this._running && !this._allDone && !this._license && failed.length > 0;
    const lic = this._license;
    const needsCode = !!lic && ['not_activated', 'device_changed', 'revoked'].includes(lic.status);
    const needsValidate = !!lic && ['blocked_offline', 'device_changed'].includes(lic.status);

    return html`
      <div class="init-bg"></div>
      <div class="init-card">
        <div class="init-header">
          <div class="init-brand">
            <img src="/favicon.svg" alt="OpenClaw" />
            <span>${L('init.title')}</span>
          </div>
          <div class="init-lang">
            <button class="${this._lang === 'zh-CN' ? 'active' : ''}" @click=${this._toggleLang}>中文</button>
            <button class="${this._lang === 'en' ? 'active' : ''}" @click=${this._toggleLang}>EN</button>
          </div>
        </div>

        <div class="init-items">
          ${this._steps.map(item => html`
            <div class="init-item ${item.state}">
              ${item.state === 'ok' ? html`
                <svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ` : item.state === 'running' ? html`
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ` : item.state === 'fail' ? html`
                <svg class="fail" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              ` : html`
                <span class="dot"></span>
              `}
              <span class="item-label">${L(item.textKey)}</span>
              ${item.detail ? html`<span class="item-detail">${item.detail}</span>` : ''}
            </div>
          `)}
        </div>

        ${lic ? html`
          <div class="license-panel ${lic.status === 'revoked' || lic.status === 'error' ? 'bad' : ''}">
            <div class="license-msg">${this._licenseText(lic.status)}</div>
            ${lic.message ? html`<div class="license-detail">${lic.message}</div>` : ''}
            ${needsCode ? html`
              <div class="license-row">
                <input class="license-input" type="text" maxlength="64"
                  placeholder=${L('init.codePlaceholder')}
                  .value=${this._code}
                  @input=${(e: Event) => { this._code = (e.target as HTMLInputElement).value; }}
                  @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._activate(); }} />
                <button class="license-btn"
                  ?disabled=${this._busyAction !== null || !this._code.trim()}
                  @click=${this._activate}>
                  ${this._busyAction === 'activate' ? L('init.activating') : L('init.activate')}
                </button>
              </div>` : ''}
            ${needsValidate ? html`
              <button class="license-btn wide"
                ?disabled=${this._busyAction !== null}
                @click=${this._revalidate}>
                ${this._busyAction === 'validate' ? L('init.rechecking') : L('init.revalidate')}
              </button>` : ''}
            ${lic.status === 'error' ? html`
              <button class="license-btn wide"
                ?disabled=${this._busyAction !== null}
                @click=${this._recheck}>
                ${this._busyAction === 'recheck' ? L('init.rechecking') : L('init.retry')}
              </button>` : ''}
            ${lic.status === 'blocked_offline' ? html`
              <div class="license-offline">
                ${L('init.offlineUsed')}${lic.days_offline ?? '-'} · ${L('init.offlineLeft')}${lic.offline_remaining ?? 0}
              </div>` : ''}
          </div>
        ` : ''}

        ${showActions ? html`
          <div class="init-actions">
            <button class="license-btn" @click=${this._retry}>${L('init.retry')}</button>
            ${licenseOk ? html`
              <button class="license-btn ghost" @click=${this._enterAnyway}>${L('init.enterAnyway')}</button>
            ` : ''}
          </div>
        ` : ''}

        <div class="init-progress">
          <div class="init-progress-label">
            <span>${this._allDone ? L('init.portableReady') : L('init.ready')}</span>
            <span class="pct">${this._progress}%</span>
          </div>
          <div class="init-progress-bar">
            <div class="init-progress-fill" style="width:${this._progress}%"></div>
          </div>
          ${this._fingerprint ? html`
            <div class="init-device">
              ${L('init.device')}: ${this._fingerprint.length > 28 ? this._fingerprint.slice(0, 28) + '…' : this._fingerprint}
            </div>
          ` : ''}
        </div>

        <div class="init-logs">
          ${this._logs.map(line => html`<div>${line}</div>`)}
        </div>

        <div class="init-footer">
          <span>${L('init.launchMultiEngine')}</span>
          <span>${L('init.usbPortable')}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('init-page', InitPage);
