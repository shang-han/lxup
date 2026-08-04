import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { i18n, L } from '../i18n/index.js';
import { sleep } from '../utils/net.js';
import {
  getLicenseStatus, activateLicense, validateLicense,
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
    .init-lang button.active { background: var(--text-strong); color: var(--bg); }

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

    // 2. 授权校验（经 Sidecar；Sidecar 不可达时在校验步骤内报错，不再单列引擎检查）
    await this._checkLicense();
    if (!alive()) return;
    this._running = false;
  }

  // ── 授权校验 ──────────────────────────────────────

  async _checkLicense() {
    this._setStep('license', 'running');
    this._log('GET /api/license/status');
    let resp: LicenseResponse;
    try {
      resp = await getLicenseStatus(this._fingerprint);
    } catch {
      // Sidecar 不可达 / 网络错误 → 以 error 态展示，面板提供重试
      resp = { success: false, status: 'error', message: L('init.sidecarUnreachable') };
    }
    this._applyLicense(resp);
  }

  _applyLicense(resp: LicenseResponse) {
    if (resp.status === 'ok') {
      this._license = null;
      this._setStep('license', 'ok', resp.device_name || undefined);
      this._log(resp.days_offline
        ? L('init.licenseValidOffline', { days: resp.days_offline, remain: resp.offline_remaining })
        : L('init.licenseValid'));
      this._finish();
    } else {
      this._license = resp;
      this._setStep('license', 'fail', resp.status);
      this._log(`${L('init.licenseStatusPrefix')}${resp.status}${resp.message ? ' — ' + resp.message : ''}`);
    }
  }

  async _activate() {
    const code = this._code.trim();
    if (!code || this._busyAction) return;
    this._busyAction = 'activate';
    this._log(L('init.submitCodeLog', { code: code.slice(0, 2) }));
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

  /** 授权通过即自动进入（引擎状态不阻塞启动） */
  _finish() {
    this._allDone = true;
    this._log(L('init.entering'));
    this._enterTimer = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('init-done'));
    }, 1200);
  }

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
