import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout } from '../utils/net.js';
import '../components/page-header.js';

/**
 * GatewayPage — 网关路由配置页
 *
 * 接网关真实配置（WS config.get / config.patch，合并语义 + baseHash 乐观并发）：
 *   - gateway.bind                      访问范围（loopback 仅本机 / lan 局域网）
 *   - gateway.auth.mode                 认证方式（token / password）
 *   - gateway.auth.token                访问令牌（网关回显为 __OPENCLAW_REDACTED__；
 *                                       输入新值保存即更换，并同步本地连接凭证）
 *   - gateway.controlUi.allowedOrigins  允许的 Control UI 来源
 *   - gateway.controlUi.dangerouslyDisableDeviceAuth  只读展示（远程改动风险高）
 * 端口不在配置内（由启动命令 --port 决定），只读展示 Sidecar 报告的实际监听值。
 */

export class GatewayPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .gateway-page { width: 100%; }

    /* === section card === */
    .gw-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .gw-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }
    .gw-section__title svg { color: var(--text-soft); }

    /* === form field === */
    .gw-field { margin-bottom: 14px; }
    .gw-field:last-child { margin-bottom: 0; }
    .gw-label {
      display: block; font-size: 12px; font-weight: 500;
      color: var(--text); margin-bottom: 6px;
    }
    .gw-input {
      width: 200px; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .gw-input:focus { border-color: var(--accent); }
    .gw-input:disabled { opacity: 0.6; cursor: not-allowed; }
    textarea.gw-input { width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; font-family: var(--font-mono); }
    .gw-hint {
      font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4;
    }
    .gw-hint.warn { color: var(--warn); }

    /* === read-only value === */
    .gw-readonly {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-mono); font-size: 13px; color: var(--text-strong);
    }
    .gw-readonly .dot { width: 8px; height: 8px; border-radius: 50%; }
    .gw-readonly .dot.on { background: var(--success); }
    .gw-readonly .dot.off { background: var(--muted); }

    /* === select cards (radio-style) === */
    .gw-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
    .gw-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 16px; border: 1px solid var(--border);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--duration-fast); background: transparent;
      user-select: none;
    }
    .gw-card:hover { border-color: var(--text-muted); background: var(--bg-hover); }
    .gw-card.selected {
      border-color: var(--accent); background: var(--accent-subtle);
    }
    .gw-card__icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 16px;
    }
    .gw-card.selected .gw-card__icon {
      background: var(--accent); color: var(--accent-foreground);
    }
    .gw-card:not(.selected) .gw-card__icon {
      background: var(--bg-muted); color: var(--text-soft);
    }
    .gw-card__text { flex: 1; min-width: 0; }
    .gw-card__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 2px;
    }
    .gw-card__desc {
      font-size: 11px; color: var(--text-soft); line-height: 1.4;
    }

    /* === token input row === */
    .gw-token-row {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
    }
    .gw-token-row .gw-input { flex: 1; width: auto; font-family: var(--font-mono); }
    .gw-token-row button {
      padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap; flex-shrink: 0;
    }
    .gw-token-row button:hover { background: var(--bg-hover); color: var(--text); }

    /* === badge === */
    .gw-badge {
      display: inline-block; padding: 3px 10px; border-radius: var(--radius-full);
      font-size: 11px; font-weight: 600;
    }
    .gw-badge.danger { background: var(--danger-subtle); color: var(--danger); }
    .gw-badge.ok { background: var(--success-subtle); color: var(--success); }

    /* === save bar === */
    .gw-save-bar {
      display: flex; align-items: center; gap: 10px;
      padding-top: 8px; flex-wrap: wrap;
    }
    .gw-save-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 6px;
    }
    .gw-save-btn:hover { background: var(--accent-hover); }
    .gw-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .gw-save-hint { font-size: 12px; color: var(--muted); }
    .gw-msg { font-size: 12px; }
    .gw-msg.ok { color: var(--success); }
    .gw-msg.err { color: var(--danger); word-break: break-all; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  // 网关配置（真实来自 config.gateway）
  @state() _bind = 'lan';             // loopback | lan
  @state() _authMode = 'token';       // token | password
  @state() _tokenRedacted = '';       // 网关回显的掩码值
  @state() _tokenInput = '';          // 用户输入的新 token（空 = 不修改）
  @state() _showToken = false;
  @state() _originsText = '';
  @state() _deviceAuthDisabled: boolean | null = null;
  @state() _loaded = false;

  // Sidecar 报告的实际监听状态
  @state() _port: number | null = null;
  @state() _pid: number | null = null;
  @state() _gwRunning = false;

  @state() _offline = false;
  @state() _saving = false;
  @state() _msg = '';
  @state() _msgCls = '';

  _storeUnsub: (() => void) | null = null;

  get _accessOptions() {
    return [
      { key: 'loopback', icon: icons['monitor'], name: L('gateway.localOnly'), desc: L('gateway.localOnlyDesc') },
      { key: 'lan', icon: icons['share-2'], name: L('gateway.lanShare'), desc: L('gateway.lanShareDesc') },
    ];
  }

  get _authOptions() {
    return [
      { key: 'token', icon: icons['key'], name: L('gateway.tokenAuth'), desc: L('gateway.tokenAuthDesc') },
      { key: 'password', icon: icons['lock'], name: L('gateway.passwordAuth'), desc: L('gateway.passwordAuthDesc') },
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe(snap => {
      this._offline = !snap.connected;
      if (snap.connected && !this._loaded) this._load();
    });
    if (store.connected) this._load();
    this._refreshPortStatus();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
  }

  // ── 数据加载 ──────────────────────────────────────

  async _load() {
    const store = getSharedStore();
    if (!store.connected) { this._offline = true; return; }
    try {
      const g = await store.request<any>('config.get', {});
      const gw = (g?.config || g?.parsed || {})?.gateway || {};
      this._bind = typeof gw.bind === 'string' ? gw.bind : 'lan';
      this._authMode = gw.auth?.mode || 'token';
      this._tokenRedacted = String(gw.auth?.token || '');
      this._originsText = Array.isArray(gw.controlUi?.allowedOrigins)
        ? gw.controlUi.allowedOrigins.join('\n')
        : '';
      this._deviceAuthDisabled = !!gw.controlUi?.dangerouslyDisableDeviceAuth;
      this._loaded = true;
      this._offline = false;
    } catch (e) {
      this._msg = this._errMsg(e);
      this._msgCls = 'err';
    }
  }

  /** 端口/PID 来自 Sidecar 的网关进程管理端点 */
  async _refreshPortStatus() {
    const host = window.location.hostname || '127.0.0.1';
    try {
      const r = await fetchTimeout(`http://${host}:7889/api/gateway/status`, {}, 4000);
      const s = await r.json();
      this._gwRunning = !!s.running;
      this._port = s.port ?? null;
      this._pid = s.pid ?? null;
    } catch {
      this._gwRunning = false;
    }
  }

  // ── 保存 ──────────────────────────────────────────

  async _save() {
    const store = getSharedStore();
    if (!store.connected || this._saving) return;
    this._saving = true;
    this._msg = '';
    this._msgCls = '';
    try {
      const g = await store.request<any>('config.get', {});
      const cfg = g?.config || g?.parsed || {};

      const origins = this._originsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      // 合并语义：只写变更的键；token 为空表示不修改
      const authPatch: Record<string, unknown> = { mode: this._authMode };
      const newToken = this._tokenInput.trim();
      if (newToken) authPatch.token = newToken;

      await store.request('config.patch', {
        raw: JSON.stringify({
          gateway: {
            ...(cfg.gateway || {}),
            bind: this._bind,
            auth: { ...(cfg.gateway?.auth || {}), ...authPatch },
            controlUi: {
              ...(cfg.gateway?.controlUi || {}),
              allowedOrigins: origins,
            },
          },
        }),
        baseHash: g?.hash || '',
        replacePaths: ['gateway'],
      });

      // 更换 token 时同步本地连接凭证（下次重连/刷新生效）
      if (newToken) {
        try { localStorage.setItem('openclaw.gateway.token', newToken); } catch { /* ignore */ }
        this._tokenRedacted = '__OPENCLAW_REDACTED__';
        this._tokenInput = '';
        this._msg = L('gateway.tokenChangedNote');
      } else {
        this._msg = L('common.configSaved');
      }
      this._msgCls = 'ok';
      await this._load();
    } catch (e) {
      this._msg = L('common.configSaveFailed') + this._errMsg(e);
      this._msgCls = 'err';
    } finally {
      this._saving = false;
    }
  }

  _errMsg(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    try {
      const j = JSON.parse(raw);
      if (j?.message) return String(j.message);
    } catch { /* 非 JSON */ }
    return raw;
  }

  // ── 渲染 ──────────────────────────────────────────

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="gateway-page">

        ${this._offline ? html`
          <div class="gw-section">
            <div class="gw-hint warn">${L('dashboard.wsDisconnected')} — ${L('models.gwDisconnected')}</div>
          </div>
        ` : ''}

        <!-- 服务端口（只读：由启动命令决定，Sidecar 报告实际值） -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.829 2.829"/><path d="M2 12h4"/><path d="m6.343 17.657 2.829-2.829"/><path d="M12 18v4"/><path d="m17.657 17.657-2.829-2.829"/><path d="M18 12h4"/><path d="m17.657 6.343-2.829 2.829"/><circle cx="12" cy="12" r="3"/></svg>
            ${L('gateway.servicePort')}
          </div>
          <div class="gw-field">
            <label class="gw-label">${L('gateway.portNumber')}</label>
            <div class="gw-readonly">
              <span class="dot ${this._gwRunning ? 'on' : 'off'}"></span>
              <span>${this._port ?? '—'}</span>
              <span style="color:var(--muted);font-size:12px;">
                ${this._gwRunning ? (L('dashboard.running') + (this._pid ? ' · PID ' + this._pid : '')) : L('dashboard.stopped')}
              </span>
            </div>
            <div class="gw-hint">${L('gateway.portHint')}</div>
          </div>
        </div>

        <!-- 谁能访问 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${L('gateway.whoCanAccess')}
          </div>
          <div class="gw-cards">
            ${this._accessOptions.map(o => html`
              <div class="gw-card ${this._bind === o.key ? 'selected' : ''}"
                   @click=${() => { this._bind = o.key; }}>
                <div class="gw-card__icon">${o.icon}</div>
                <div class="gw-card__text">
                  <div class="gw-card__name">${o.name}</div>
                  <div class="gw-card__desc">${o.desc}</div>
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- 安全认证 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            ${L('gateway.securityAuth')}
          </div>
          <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;">${L('gateway.authMethod')}</div>
          <div class="gw-cards">
            ${this._authOptions.map(o => html`
              <div class="gw-card ${this._authMode === o.key ? 'selected' : ''}"
                   @click=${() => { this._authMode = o.key; }}>
                <div class="gw-card__icon">${o.icon}</div>
                <div class="gw-card__text">
                  <div class="gw-card__name">${o.name}</div>
                  <div class="gw-card__desc">${o.desc}</div>
                </div>
              </div>
            `)}
          </div>
          ${this._authMode === 'token' ? html`
            <div class="gw-token-row">
              <div style="flex:1;">
                <label class="gw-label">${L('gateway.accessToken')}</label>
                <input class="gw-input"
                  .type=${this._showToken ? 'text' : 'password'}
                  placeholder=${this._tokenRedacted || 'sk-...'}
                  .value=${this._tokenInput}
                  @input=${(e: Event) => { this._tokenInput = (e.target as HTMLInputElement).value; }}
                />
              </div>
              <button @click=${() => { this._showToken = !this._showToken; }}>
                ${this._showToken ? L('gateway.hide') : L('gateway.show')}
              </button>
            </div>
            <div class="gw-hint">${L('gateway.tokenHint')}</div>
            ${this._tokenInput.trim() ? html`
              <div class="gw-hint warn">⚠ ${L('gateway.tokenChangeWarning')}</div>
            ` : ''}
          ` : ''}
        </div>

        <!-- Control UI 访问来源 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${L('gateway.controlUiTitle')}
          </div>
          <div class="gw-field">
            <label class="gw-label">${L('gateway.allowedOrigins')}</label>
            <textarea class="gw-input"
              .value=${this._originsText}
              @input=${(e: Event) => { this._originsText = (e.target as HTMLTextAreaElement).value; }}
            ></textarea>
            <div class="gw-hint">${L('gateway.allowedOriginsHint')}</div>
          </div>
          <div class="gw-field">
            <label class="gw-label">${L('gateway.deviceAuth')}</label>
            ${this._deviceAuthDisabled === null ? '' : this._deviceAuthDisabled
              ? html`<span class="gw-badge danger">${L('gateway.deviceAuthOff')}</span>
                     <div class="gw-hint warn">⚠ ${L('gateway.deviceAuthOffHint')}</div>`
              : html`<span class="gw-badge ok">${L('gateway.deviceAuthOn')}</span>`}
          </div>
        </div>

        <!-- Save bar -->
        <div class="gw-save-bar">
          <button class="gw-save-btn" ?disabled=${this._saving || this._offline} @click=${() => this._save()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            ${this._saving ? L('models.saving') : L('gateway.saveAndApply')}
          </button>
          <span class="gw-save-hint">${L('gateway.saveHint')}</span>
          ${this._msg ? html`<span class="gw-msg ${this._msgCls}">${this._msg}</span>` : ''}
        </div>

      </div>
    `;
  }
}

customElements.define('gateway-page', GatewayPage);
