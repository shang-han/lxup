import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

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
    .gw-hint {
      font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4;
    }

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
    .gw-token-row .gw-input { flex: 1; font-family: var(--font-mono); }
    .gw-token-row button {
      padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap; flex-shrink: 0;
    }
    .gw-token-row button:hover { background: var(--bg-hover); color: var(--text); }

    /* === dropdown === */
    .gw-select {
      padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      outline: none; cursor: pointer; transition: border-color var(--duration-fast);
    }
    .gw-select:focus { border-color: var(--accent); }

    /* === advanced section toggle === */
    .gw-advanced-toggle {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 500; color: var(--text-soft);
      cursor: pointer; padding: 8px 0; margin-bottom: 12px; user-select: none;
    }
    .gw-advanced-toggle:hover { color: var(--text); }
    .gw-advanced-toggle .chevron { transition: transform var(--duration-fast); }
    .gw-advanced-toggle.open .chevron { transform: rotate(90deg); }

    /* === save bar === */
    .gw-save-bar {
      display: flex; align-items: center; gap: 10px;
      padding-top: 8px;
    }
    .gw-save-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 6px;
    }
    .gw-save-btn:hover { background: var(--accent-hover); }
    .gw-save-hint {
      font-size: 12px; color: var(--muted);
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _port = 18789;
  @state() _accessMode = 'local'; // 'local' | 'lan'
  @state() _authMode = 'token'; // 'token' | 'password'
  @state() _token = 'sk-gw-xxxxxxxxxxxxxxxxxxxx';
  @state() _showToken = false;
  @state() _toolPermission = 'full'; // 'full' | 'restricted' | 'disabled'
  @state() _sessionVisibility = 'all'; // 'all' | 'own'
  @state() _tailscaleAddr = '';
  @state() _advancedOpen = false;

  get _accessOptions() {
    return [
      { key: 'local', icon: icons['monitor'], name: L('gateway.localOnly'), desc: L('gateway.localOnlyDesc') },
      { key: 'lan', icon: icons['share-2'], name: L('gateway.lanShare'), desc: L('gateway.lanShareDesc') },
    ];
  }

  get _authOptions() {
    return [
      { key: 'token', icon: icons['key'], name: L('gateway.tokenAuth'), desc: L('gateway.tokenAuthDesc') },
      { key: 'password', icon: icons['lock'], name: L('gateway.passwordAuth'), desc: L('gateway.passwordAuthDesc') },
    ];
  }

  get _toolOptions() {
    return [
      { key: 'full', icon: icons['check-circle'], name: L('gateway.fullPermission'), desc: L('gateway.fullPermissionDesc') },
      { key: 'restricted', icon: icons['shield'], name: L('gateway.restrictedMode'), desc: L('gateway.restrictedModeDesc') },
      { key: 'disabled', icon: icons['ban'], name: L('gateway.disableTools'), desc: L('gateway.disableToolsDesc') },
    ];
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="gateway-page">

        <!-- 服务端口 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.829 2.829"/><path d="M2 12h4"/><path d="m6.343 17.657 2.829-2.829"/><path d="M12 18v4"/><path d="m17.657 17.657-2.829-2.829"/><path d="M18 12h4"/><path d="m17.657 6.343-2.829 2.829"/><circle cx="12" cy="12" r="3"/></svg>
            ${L('gateway.servicePort')}
          </div>
          <div class="gw-field">
            <label class="gw-label">${L('gateway.portNumber')}</label>
            <input class="gw-input" type="number" .value=${String(this._port)}
              @input=${(e: Event) => { this._port = Number((e.target as HTMLInputElement).value); }}
            />
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
              <div class="gw-card ${this._accessMode === o.key ? 'selected' : ''}"
                   @click=${() => { this._accessMode = o.key; }}>
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
                <input class="gw-input" style="width:100%;"
                  .type=${this._showToken ? 'text' : 'password'}
                  .value=${this._token}
                  @input=${(e: Event) => { this._token = (e.target as HTMLInputElement).value; }}
                />
              </div>
              <button @click=${() => { this._showToken = !this._showToken; }}>
                ${this._showToken ? L('gateway.hide') : L('gateway.show')}
              </button>
            </div>
            <div class="gw-hint" style="margin-top:6px;">
              ${L('gateway.tokenHint')}
            </div>
          ` : ''}
        </div>

        <!-- Agent 工具权限 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            ${L('gateway.agentToolPermission')}
          </div>
          <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;">${L('gateway.toolAccessLevel')}</div>
          <div class="gw-cards">
            ${this._toolOptions.map(o => html`
              <div class="gw-card ${this._toolPermission === o.key ? 'selected' : ''}"
                   @click=${() => { this._toolPermission = o.key; }}>
                <div class="gw-card__icon">${o.icon}</div>
                <div class="gw-card__text">
                  <div class="gw-card__name">${o.name}</div>
                  <div class="gw-card__desc">${o.desc}</div>
                </div>
              </div>
            `)}
          </div>

          <div class="gw-field" style="margin-top:16px;">
            <label class="gw-label">${L('gateway.sessionVisibility')}</label>
            <select class="gw-select" .value=${this._sessionVisibility}
              @change=${(e: Event) => { this._sessionVisibility = (e.target as HTMLSelectElement).value; }}
            >
              <option value="all">${L('gateway.allSessions')}</option>
              <option value="own">${L('gateway.ownSession')}</option>
            </select>
            <div class="gw-hint">${L('gateway.sessionVisibilityHint')}</div>
          </div>
        </div>

        <!-- Advanced options -->
        <div class="gw-advanced-toggle ${this._advancedOpen ? 'open' : ''}"
             @click=${() => { this._advancedOpen = !this._advancedOpen; }}>
          <span class="chevron">${icons['chevron-right']}</span>
          ${L('gateway.advancedOptions')}
        </div>
        ${this._advancedOpen ? html`
          <div class="gw-section">
            <div class="gw-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.829 2.829"/><path d="M2 12h4"/><path d="m6.343 17.657 2.829-2.829"/><path d="M12 18v4"/><path d="m17.657 17.657-2.829-2.829"/><path d="M18 12h4"/><path d="m17.657 6.343-2.829 2.829"/><circle cx="12" cy="12" r="3"/></svg>
              ${L('gateway.tailscaleNetwork')}
            </div>
            <div class="gw-field">
              <label class="gw-label">${L('gateway.tailscaleAddr')}</label>
              <input class="gw-input" style="width:100%;" type="text"
                .value=${this._tailscaleAddr}
                placeholder=${L('gateway.tailscalePlaceholder')}
                @input=${(e: Event) => { this._tailscaleAddr = (e.target as HTMLInputElement).value; }}
              />
              <div class="gw-hint">${L('gateway.tailscaleHint')}</div>
            </div>
          </div>
        ` : ''}

        <!-- Save bar -->
        <div class="gw-save-bar">
          <button class="gw-save-btn" @click=${() => { /* save logic */ }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            ${L('gateway.saveAndApply')}
          </button>
          <span class="gw-save-hint">${L('gateway.saveHint')}</span>
        </div>

      </div>
    `;
  }
}

customElements.define('gateway-page', GatewayPage);
