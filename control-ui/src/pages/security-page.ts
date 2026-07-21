import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

export class SecurityPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .security-page { width: 100%; }

    /* === section card === */
    .sec-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .sec-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }

    /* === alert box === */
    .sec-alert {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 13px; line-height: 1.5;
    }
    .sec-alert.warning {
      background: var(--bg-muted); border-left: 3px solid var(--warn);
    }
    .sec-alert.info {
      background: var(--bg-muted); border-left: 3px solid var(--accent);
    }
    .sec-alert__icon { flex-shrink: 0; margin-top: 1px; }
    .sec-alert__title { font-weight: 600; color: var(--text-strong); margin-bottom: 2px; }
    .sec-alert__desc { font-size: 12px; color: var(--text-soft); }

    /* === form === */
    .sec-form { margin-top: 14px; }
    .sec-field { margin-bottom: 14px; }
    .sec-label {
      display: block; font-size: 12px; font-weight: 500;
      color: var(--text); margin-bottom: 6px;
    }
    .sec-input {
      width: 320px; max-width: 100%; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .sec-input:focus { border-color: var(--accent); }
    .sec-input::placeholder { color: var(--muted); }

    .sec-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast);
    }
    .sec-btn:hover { background: var(--accent-hover); }

    /* === toggle row === */
    .sec-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: var(--bg-muted); border-radius: var(--radius-sm);
    }
    .sec-toggle-row__text { flex: 1; min-width: 0; }
    .sec-toggle-row__title {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px;
    }
    .sec-toggle-row__desc { font-size: 12px; color: var(--text-soft); }
    .sec-toggle-row__desc strong { color: var(--danger); font-weight: 500; }

    /* === switch toggle === */
    .sec-switch {
      position: relative; width: 44px; height: 24px; flex-shrink: 0;
      background: var(--border-strong); border-radius: 12px; cursor: pointer;
      transition: background var(--duration-fast);
    }
    .sec-switch.on { background: var(--accent); }
    .sec-switch::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 20px; height: 20px; background: #fff; border-radius: 50%;
      transition: transform var(--duration-fast) var(--ease-out);
    }
    .sec-switch.on::after { transform: translateX(20px); }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _hasPassword = false;
  @state() _newPassword = '';
  @state() _confirmPassword = '';
  @state() _noRiskMode = false;

  _setPassword() {
    if (this._newPassword.length < 6) return;
    if (this._newPassword !== this._confirmPassword) return;
    if (/^\d+$/.test(this._newPassword)) return;
    this._hasPassword = true;
    this._newPassword = '';
    this._confirmPassword = '';
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="security-page">

        <!-- Password status -->
        <div class="sec-section">
          <div class="sec-section__title">${L('security.passwordStatus')}</div>
          ${this._hasPassword ? html`
            <div class="sec-alert info">
              <span class="sec-alert__icon" style="color:var(--success);">${icons['check-circle']}</span>
              <div>
                <div class="sec-alert__title">${L('security.passwordSet')}</div>
                <div class="sec-alert__desc">${L('security.passwordSetDesc')}</div>
              </div>
            </div>
          ` : html`
            <div class="sec-alert warning">
              <span class="sec-alert__icon" style="color:var(--warn);">${icons['alert-triangle']}</span>
              <div>
                <div class="sec-alert__title">${L('security.passwordNotSet')}</div>
                <div class="sec-alert__desc">${L('security.passwordNotSetDesc')}</div>
              </div>
            </div>
          `}
        </div>

        <!-- Set password -->
        <div class="sec-section">
          <div class="sec-section__title">${L('security.setPassword')}</div>
          <div class="sec-form">
            <div class="sec-field">
              <label class="sec-label">${L('security.newPassword')}</label>
              <input class="sec-input" type="password" .value=${this._newPassword}
                placeholder=${L('security.newPasswordPlaceholder')}
                @input=${(e: Event) => { this._newPassword = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <div class="sec-field">
              <label class="sec-label">${L('security.confirmPassword')}</label>
              <input class="sec-input" type="password" .value=${this._confirmPassword}
                placeholder=${L('security.confirmPasswordPlaceholder')}
                @input=${(e: Event) => { this._confirmPassword = (e.target as HTMLInputElement).value; }}
              />
            </div>
            <button class="sec-btn" @click=${this._setPassword}>${L('security.setBtn')}</button>
          </div>
        </div>

        <!-- No-risk mode -->
        <div class="sec-section">
          <div class="sec-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-soft);"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            ${L('security.noRiskMode')}
          </div>
          <div class="sec-toggle-row">
            <div class="sec-toggle-row__text">
              <div class="sec-toggle-row__title">${L('security.disablePassword')}</div>
              <div class="sec-toggle-row__desc">
                ${L('security.disablePasswordDesc')}<br/>
                <strong>${L('security.trustedWarning')}</strong>
              </div>
            </div>
            <div class="sec-switch ${this._noRiskMode ? 'on' : ''}"
                 @click=${() => { this._noRiskMode = !this._noRiskMode; }}>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('security-page', SecurityPage);
