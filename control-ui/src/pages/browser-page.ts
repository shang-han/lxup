import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

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
      display: flex; justify-content: space-between; align-items: center;
    }
    .browser-stat__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .browser-stat__value {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-stat__hint {
      font-size: 11px; color: var(--muted); margin-top: 2px;
    }

    /* === mode cards === */
    .browser-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .browser-mode {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card); position: relative;
    }
    .browser-mode.selected { border-color: var(--accent); }
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
    .browser-mode__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.6; margin-bottom: 12px;
    }
    .browser-mode__list {
      list-style: none; padding: 0; margin: 0 0 14px;
    }
    .browser-mode__list li {
      font-size: 12px; color: var(--text-soft); line-height: 1.6;
      padding-left: 14px; position: relative;
    }
    .browser-mode__list li::before {
      content: '•'; position: absolute; left: 0; color: var(--muted);
    }
    .browser-mode__list li strong { color: var(--text); font-weight: 500; }
    .browser-mode__actions { display: flex; gap: 6px; }
    .browser-mode__actions button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .browser-mode__actions .btn-ghost {
      background: transparent; color: var(--text-soft);
    }
    .browser-mode__actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .browser-mode__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .browser-mode__actions .btn-primary:hover { background: var(--accent-hover); }

    /* === config viewer === */
    .browser-config {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card);
    }
    .browser-config__header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 12px;
    }
    .browser-config__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-config__hint {
      font-size: 11px; color: var(--muted);
    }
    .browser-config__body {
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 14px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6;
      color: var(--text); max-height: 360px; overflow-y: auto; white-space: pre;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _pluginStatus = L('browser.normal');
  @state() _pluginLabel = L('browser.enabled');
  @state() _currentMode = 'fixed'; // 'fixed' | 'clean'
  @state() _chromeStatus = L('browser.normal');
  @state() _chromeLabel = L('browser.chromeFound');
  @state() _autoPort = 9223;

  _configJson = `{
  "browser": {
    "defaultProfile": "user",
    "enabled": true,
    "executablePath": "D:\\\\OpenClaw-3.0-U盘版\\\\Chrome-Portable\\\\Chrome\\\\chrome.exe",
    "extraArgs": [
      "--disable-breakpad"
    ],
    "profiles": {
      "fresh": {
        "attachOnly": false,
        "cdpPort": 9224,
        "color": "#2563EB"
      },
      "openclaw": {
        "cdpPort": 9222,
        "color": "#FF4500"
      }
    }
  }
}`;

  render() {
    return html`
      <div class="browser-page">
        <!-- Header -->
        <div class="browser-header">
          <div class="browser-header__left">
            <div class="browser-header__title">${this.title}</div>
            <div class="browser-header__subtitle">${this.subtitle}</div>
          </div>
          <div class="browser-header__right">
            <button class="btn-refresh">${L('common.refresh')}</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="browser-stats">
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.plugin')}</span>
              <span class="browser-stat__badge">${this._pluginStatus}</span>
            </div>
            <div class="browser-stat__value">${this._pluginLabel}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.currentMode')}</span>
              <span class="browser-stat__badge">${this._pluginStatus}</span>
            </div>
            <div class="browser-stat__value">${this._currentMode === 'fixed' ? L('browser.fixedBrowser') : L('browser.cleanBrowser')}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.builtInChrome')}</span>
              <span class="browser-stat__badge">${this._chromeStatus}</span>
            </div>
            <div class="browser-stat__value">${this._chromeLabel}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${L('browser.autoPort')}</span>
              <span class="browser-stat__badge">${this._pluginStatus}</span>
            </div>
            <div class="browser-stat__value">${this._autoPort}</div>
          </div>
        </div>

        <!-- Mode cards -->
        <div class="browser-modes">
          <!-- Fixed reuse browser -->
          <div class="browser-mode ${this._currentMode === 'fixed' ? 'selected' : ''}">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${L('browser.fixedBrowser')}</div>
              <span class="browser-mode__tag">${L('browser.fixedTag')}</span>
            </div>
            <div class="browser-mode__desc">
              ${L('browser.fixedDesc')}
            </div>
            <ul class="browser-mode__list">
              <li><strong>${L('browser.browserPathLabel')}</strong>Chrome-Portable\\Chrome\\chrome.exe</li>
              <li><strong>${L('browser.autoPortLabel')}</strong>9223</li>
              <li><strong>${L('browser.dataDirLabel')}</strong>openclaw-data\\openclaw\\browser\\user\\user-data</li>
              <li>${L('browser.noLocalLogin')}</li>
            </ul>
            <div class="browser-mode__actions">
              <button class="btn-ghost">${L('browser.detect')}</button>
              <button class="btn-ghost">${L('browser.launchTest')}</button>
              <button class="btn-primary" @click=${() => { this._currentMode = 'fixed'; }}>${L('browser.reapplyRestart')}</button>
            </div>
          </div>

          <!-- Clean isolated browser -->
          <div class="browser-mode ${this._currentMode === 'clean' ? 'selected' : ''}">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${L('browser.cleanBrowser')}</div>
              <span class="browser-mode__tag">${L('browser.cleanTag')}</span>
            </div>
            <div class="browser-mode__desc">
              ${L('browser.cleanDesc')}
            </div>
            <ul class="browser-mode__list">
              <li><strong>${L('browser.browserPathLabel')}</strong>Chrome-Portable\\Chrome\\chrome.exe</li>
              <li><strong>${L('browser.autoPortLabel')}</strong>9224</li>
              <li><strong>${L('browser.dataDirLabel')}</strong>openclaw-data\\openclaw\\browser\\fresh\\user-data</li>
              <li>${L('browser.noSharedCookie')}</li>
            </ul>
            <div class="browser-mode__actions">
              <button class="btn-ghost">${L('browser.detect')}</button>
              <button class="btn-ghost">${L('browser.launchTest')}</button>
              <button class="btn-primary" @click=${() => { this._currentMode = 'clean'; }}>${L('browser.switchToThis')}</button>
            </div>
          </div>
        </div>

        <!-- Config viewer -->
        <div class="browser-config">
          <div class="browser-config__header">
            <div class="browser-config__title">${L('browser.currentConfig')}</div>
            <div class="browser-config__hint">${L('browser.configHint')}</div>
          </div>
          <div class="browser-config__body">${this._configJson}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('browser-page', BrowserPage);
