import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout } from '../utils/net.js';
import '../components/page-header.js';

/**
 * BrowserPage — 浏览器自动化
 *
 * 全部真实数据：
 *  - 状态/检测：Sidecar /api/browser/status（openclaw browser doctor --json）
 *    含插件就绪检查、运行状态、CDP 端点、Chrome 检测结果
 *  - 启动/停止：Sidecar /api/browser/start|stop（openclaw browser start/stop）
 *  - Profiles 与配置编辑：WS config.get / config.patch 的 browser 段
 */

type DoctorCheck = { name: string; ok: boolean; detail?: string };
type Doctor = {
  ok?: boolean;
  checks?: DoctorCheck[];
  status?: Record<string, any>;
  error?: string;
  raw?: string;
};

export class BrowserPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .browser-page { width: 100%; }

    /* === page header with refresh === */
    .browser-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
    }
    .browser-header__left { min-width: 0; }
    .browser-header__title {
      color: var(--text-strong); font-size: 22px; font-weight: 700;
      letter-spacing: -0.02em; line-height: 1.2;
    }
    .browser-header__subtitle {
      color: var(--text-soft); font-size: 13px; margin-top: 4px; line-height: 1.4;
    }
    .browser-header__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn-refresh {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .btn-refresh:hover { background: var(--bg-hover); color: var(--text); }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

    /* === stat cards === */
    .browser-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    @media (max-width: 900px) { .browser-stats { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .browser-stats { grid-template-columns: 1fr; } }
    .browser-stat {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 14px 16px; box-shadow: var(--shadow-card);
    }
    .browser-stat__label {
      font-size: 12px; color: var(--text-soft); margin-bottom: 6px;
      display: flex; justify-content: space-between; align-items: center; gap: 6px;
    }
    .browser-stat__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .browser-stat__badge.bad { background: var(--danger-subtle); color: var(--danger); }
    .browser-stat__badge.warn { background: rgba(245,158,11,0.12); color: var(--warn); }
    .browser-stat__value {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      word-break: break-all;
    }
    .browser-stat__hint {
      font-size: 11px; color: var(--muted); margin-top: 2px; word-break: break-all;
    }

    /* === cards grid === */
    .browser-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .browser-mode {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card); position: relative;
    }
    .browser-mode__header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 10px;
    }
    .browser-mode__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-mode__tag {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--bg-muted); color: var(--text-soft);
    }
    .browser-mode__tag.on { background: var(--success-subtle); color: var(--success); }
    .browser-mode__list {
      list-style: none; padding: 0; margin: 0 0 14px;
    }
    .browser-mode__list li {
      font-size: 12px; color: var(--text-soft); line-height: 1.6;
      padding-left: 14px; position: relative; word-break: break-all;
    }
    .browser-mode__list li::before {
      content: '•'; position: absolute; left: 0; color: var(--muted);
    }
    .browser-mode__list li strong { color: var(--text); font-weight: 500; }
    .browser-mode__actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .browser-mode__actions button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .browser-mode__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .browser-mode__actions .btn-ghost {
      background: transparent; color: var(--text-soft);
    }
    .browser-mode__actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .browser-mode__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .browser-mode__actions .btn-primary:hover { background: var(--accent-hover); }
    .browser-mode__actions .btn-danger {
      background: var(--danger-subtle); color: var(--danger); border-color: rgba(239,68,68,0.3);
    }
    .action-msg { font-size: 12px; margin-top: 10px; color: var(--text-soft); word-break: break-all; }
    .action-msg.err { color: var(--danger); }
    .action-msg.ok { color: var(--success); }

    /* profile rows */
    .profile-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px;
    }
    .profile-row:last-child { border-bottom: none; }
    .profile-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid var(--border); }
    .profile-name { font-weight: 600; color: var(--text-strong); }
    .profile-meta { color: var(--muted); margin-left: auto; font-family: var(--font-mono); }
    .profile-default {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-sm);
      background: var(--accent-subtle); color: var(--accent); font-weight: 600;
    }

    /* === config editor === */
    .browser-config {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card);
    }
    .browser-config__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; gap: 10px; flex-wrap: wrap;
    }
    .browser-config__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-config__hint {
      font-size: 11px; color: var(--muted);
    }
    .browser-config textarea {
      width: 100%; min-height: 240px; box-sizing: border-box;
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 14px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6;
      color: var(--text); resize: vertical; outline: none;
    }
    .browser-config textarea:focus { border-color: var(--accent); }
    .browser-config__footer { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    .browser-config__footer button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
    }
    .browser-config__footer button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _doctor: Doctor | null = null;
  @state() _loadingStatus = false;
  @state() _acting: 'start' | 'stop' | '' = '';
  @state() _actionMsg = '';
  @state() _actionCls = '';

  @state() _configText = '';
  @state() _configHash = '';
  @state() _configLoaded = false;
  @state() _savingConfig = false;
  @state() _configMsg = '';
  @state() _configMsgCls = '';

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadStatus();
    this._loadConfig();
  }

  // ── 状态（browser doctor）──

  async _loadStatus() {
    this._loadingStatus = true;
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/browser/status`, {}, 50000);
      this._doctor = await r.json();
    } catch (e) {
      this._doctor = { ok: false, error: e instanceof Error ? e.message : String(e) };
    } finally {
      this._loadingStatus = false;
    }
  }

  _check(name: string): DoctorCheck | undefined {
    return (this._doctor?.checks || []).find(c => c.name === name);
  }

  get _st(): Record<string, any> {
    return this._doctor?.status || {};
  }

  async _browserAction(action: 'start' | 'stop') {
    if (this._acting) return;
    this._acting = action;
    this._actionMsg = '';
    this._actionCls = '';
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/browser/${action}`, { method: 'POST' }, 70000);
      const j = await r.json();
      if (j.ok) {
        this._actionCls = 'ok';
        await this._loadStatus();
      } else {
        this._actionMsg = String(j.error || j.stderr || j.raw || 'failed').slice(0, 200);
        this._actionCls = 'err';
      }
    } catch (e) {
      this._actionMsg = e instanceof Error ? e.message : String(e);
      this._actionCls = 'err';
    } finally {
      this._acting = '';
    }
  }

  // ── 配置（config.get / config.patch 的 browser 段）──

  async _loadConfig() {
    const store = getSharedStore();
    if (!store.connected) {
      this._configMsg = L('dashboard.wsDisconnected');
      this._configMsgCls = 'err';
      return;
    }
    try {
      const g = await store.request<any>('config.get', {});
      const cfg = g?.config || g?.parsed || {};
      this._configHash = g?.hash || '';
      this._configText = JSON.stringify(cfg.browser ?? {}, null, 2);
      this._configLoaded = true;
      this._configMsg = '';
      this._configMsgCls = '';
    } catch (e) {
      this._configMsg = e instanceof Error ? e.message : String(e);
      this._configMsgCls = 'err';
    }
  }

  async _saveConfig() {
    if (this._savingConfig) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(this._configText);
    } catch {
      this._configMsg = L('browser.configInvalid');
      this._configMsgCls = 'err';
      return;
    }
    const store = getSharedStore();
    if (!store.connected) {
      this._configMsg = L('dashboard.wsDisconnected');
      this._configMsgCls = 'err';
      return;
    }
    this._savingConfig = true;
    try {
      await store.request('config.patch', {
        raw: JSON.stringify({ browser: parsed }),
        baseHash: this._configHash,
        replacePaths: ['browser'],
      });
      this._configMsg = L('browser.configSaved');
      this._configMsgCls = 'ok';
      await this._loadConfig();
      await this._loadStatus();
    } catch (e) {
      this._configMsg = (e instanceof Error ? e.message : String(e)).slice(0, 200);
      this._configMsgCls = 'err';
    } finally {
      this._savingConfig = false;
    }
  }

  // ── 渲染 ──

  render() {
    const st = this._st;
    const plugin = this._check('plugin');
    const gateway = this._check('gateway');
    const browserChk = this._check('browser');
    const profiles = (st.profiles && typeof st.profiles === 'object') ? st.profiles
      : (JSON.parse(this._configText || '{}').profiles || {});
    const profileNames = Object.keys(profiles || {});
    const defaultProfile = st.profile || JSON.parse(this._configText || '{}').defaultProfile || '';
    const running = !!st.running;
    const chromePath = st.detectedExecutablePath || '';
    const busy = this._acting !== '';

    return html`
      <div class="browser-page">
        <!-- Header -->
        <div class="browser-header">
          <div class="browser-header__left">
            <div class="browser-header__title">${this.title}</div>
            <div class="browser-header__subtitle">${this.subtitle}</div>
          </div>
          <div class="browser-header__right">
            <button class="btn-refresh" ?disabled=${this._loadingStatus} @click=${() => { this._loadStatus(); this._loadConfig(); }}>
              ${this._loadingStatus ? L('browser.detecting') : L('common.refresh')}
            </button>
          </div>
        </div>

        ${this._doctor?.error ? html`
          <div class="action-msg err" style="margin:0 0 12px;">${L('browser.statusOffline')}: ${this._doctor.error}</div>
        ` : ''}

        <!-- Stats（全部来自 browser doctor） -->
        <div class="browser-stats">
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.plugin')}</span>
              <span class="browser-stat__badge ${plugin?.ok ? '' : 'bad'}">${plugin?.ok ? L('browser.normal') : '✗'}</span>
            </div>
            <div class="browser-stat__value">${plugin?.ok ? L('browser.enabled') : (plugin?.detail || '—')}</div>
            <div class="browser-stat__hint">${gateway ? 'gateway: ' + (gateway.detail || (gateway.ok ? 'ok' : 'unreachable')) : ''}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.controlTitle')}</span>
              <span class="browser-stat__badge ${running ? '' : 'warn'}">${running ? L('browser.running') : L('browser.stopped')}</span>
            </div>
            <div class="browser-stat__value">${st.profile || '—'}${st.transport ? ' · ' + st.transport : ''}</div>
            <div class="browser-stat__hint">${browserChk?.detail || ''}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.builtInChrome')}</span>
              <span class="browser-stat__badge ${st.detectedBrowser ? '' : 'bad'}">${st.detectedBrowser ? L('browser.detected') : L('browser.notDetected')}</span>
            </div>
            <div class="browser-stat__value">${st.detectedBrowser || '—'}</div>
            <div class="browser-stat__hint">${chromePath || st.detectError || ''}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.autoPort')}</span>
              <span class="browser-stat__badge ${st.cdpReady ? '' : 'warn'}">${st.cdpReady ? 'CDP ✓' : 'CDP ✗'}</span>
            </div>
            <div class="browser-stat__value">${st.cdpPort ?? '—'}</div>
            <div class="browser-stat__hint">${st.cdpUrl || ''}</div>
          </div>
        </div>

        <!-- Control + Profiles -->
        <div class="browser-modes">
          <div class="browser-mode">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${L('browser.controlTitle')}</div>
              <span class="browser-mode__tag ${running ? 'on' : ''}">${running ? L('browser.running') : L('browser.stopped')}</span>
            </div>
            <ul class="browser-mode__list">
              <li><strong>${L('browser.currentProfile')}:</strong> ${st.profile || '—'}（driver: ${st.driver || '—'}）</li>
              <li><strong>${L('browser.cdpEndpoint')}:</strong> ${st.cdpUrl || '—'}</li>
              <li><strong>${L('browser.browserPathLabel')}</strong>${st.chosenBrowser || chromePath || '—'}</li>
              <li><strong>${L('browser.dataDirLabel')}</strong>${st.userDataDir || '—'}</li>
            </ul>
            <div class="browser-mode__actions">
              ${running ? html`
                <button class="btn-danger" ?disabled=${busy} @click=${() => this._browserAction('stop')}>
                  ${this._acting === 'stop' ? L('browser.stopping') : L('browser.stop')}
                </button>
              ` : html`
                <button class="btn-primary" ?disabled=${busy} @click=${() => this._browserAction('start')}>
                  ${this._acting === 'start' ? L('browser.starting') : L('browser.start')}
                </button>
              `}
              <button class="btn-ghost" ?disabled=${this._loadingStatus} @click=${() => this._loadStatus()}>${L('browser.detect')}</button>
            </div>
            ${this._actionMsg ? html`<div class="action-msg ${this._actionCls}">${this._actionMsg}</div>` : ''}
          </div>

          <div class="browser-mode">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${L('browser.profilesTitle')}</div>
              <span class="browser-mode__tag">${profileNames.length}</span>
            </div>
            ${profileNames.length ? html`
              ${profileNames.map((name: string) => html`
                <div class="profile-row">
                  <span class="profile-dot" style="background:${profiles[name]?.color || 'var(--muted)'};"></span>
                  <span class="profile-name">${name}</span>
                  ${String(defaultProfile) === name ? html`<span class="profile-default">${L('browser.defaultProfile')}</span>` : ''}
                  <span class="profile-meta">${profiles[name]?.cdpPort ? ':' + profiles[name].cdpPort : ''}${profiles[name]?.attachOnly ? ' attach-only' : ''}</span>
                </div>
              `)}
            ` : html`<div class="action-msg">${L('browser.noProfiles')}</div>`}
            <div class="action-msg" style="margin-top:8px;">${L('browser.profilesHint')}</div>
          </div>
        </div>

        <!-- Config editor（真实 config.browser，config.patch 写回） -->
        <div class="browser-config">
          <div class="browser-config__header">
            <div>
              <div class="browser-config__title">${L('browser.currentConfig')}</div>
              <div class="browser-config__hint">${L('browser.configHint')}</div>
            </div>
          </div>
          <textarea .value=${this._configText}
            @input=${(e: Event) => { this._configText = (e.target as HTMLTextAreaElement).value; }}></textarea>
          <div class="browser-config__footer">
            <button ?disabled=${this._savingConfig || !this._configLoaded} @click=${() => this._saveConfig()}>
              ${this._savingConfig ? L('models.saving') : L('browser.saveConfig')}
            </button>
            <button style="background:transparent;color:var(--text-soft);border:1px solid var(--border);"
              ?disabled=${this._savingConfig} @click=${() => this._loadConfig()}>${L('common.refresh')}</button>
            ${this._configMsg ? html`<span class="action-msg ${this._configMsgCls}" style="margin:0;">${this._configMsg}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('browser-page', BrowserPage);
