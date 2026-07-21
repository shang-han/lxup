import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

export class SettingsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .settings-page { width: 100%; }

    /* === section card === */
    .settings-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .settings-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }

    /* === form === */
    .settings-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .settings-input {
      flex: 1; min-width: 280px; max-width: 400px; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .settings-input:focus { border-color: var(--accent); }
    .settings-input::placeholder { color: var(--muted); }

    .settings-btn {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .settings-btn.primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .settings-btn.primary:hover { background: var(--accent-hover); }
    .settings-btn.ghost {
      background: transparent; color: var(--text-soft);
    }
    .settings-btn.ghost:hover { background: var(--bg-hover); color: var(--text); }

    .settings-hint {
      font-size: 11px; color: var(--muted); margin-top: 10px; line-height: 1.6;
    }

    /* === checkbox row === */
    .settings-checkbox-row {
      display: flex; align-items: flex-start; gap: 8px;
    }
    .settings-checkbox-row input[type="checkbox"] {
      margin-top: 2px; cursor: pointer;
    }
    .settings-checkbox-row label {
      font-size: 13px; color: var(--text); cursor: pointer; user-select: none;
    }

    /* === select === */
    .settings-select {
      padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      outline: none; cursor: pointer; min-width: 160px;
      transition: border-color var(--duration-fast);
    }
    .settings-select:focus { border-color: var(--accent); }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: String }) theme = 'claw';
  @property({ type: String }) themeMode = 'dark';
  @property({ type: Object }) snapshot = {};

  @state() _proxyUrl = 'http://127.0.0.1:7897';
  @state() _modelProxy = false;
  @state() _lang = 'zh-CN';
  @state() _autoStart = false;

  _emit(name: string, detail: any) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="settings-page">

        <!-- Network proxy -->
        <div class="settings-section">
          <div class="settings-section__title">${L('settings.networkProxy')}</div>
          <div class="settings-row">
            <input class="settings-input" type="text" .value=${this._proxyUrl}
              placeholder="http://127.0.0.1:7897"
              @input=${(e: Event) => { this._proxyUrl = (e.target as HTMLInputElement).value; }}
            />
            <button class="settings-btn primary">${L('common.save')}</button>
            <button class="settings-btn ghost">${L('settings.testConnection')}</button>
            <button class="settings-btn ghost">${L('settings.closeProxy')}</button>
          </div>
          <div class="settings-hint">
            ${L('settings.proxyHint')}
          </div>
        </div>

        <!-- Model request proxy -->
        <div class="settings-section">
          <div class="settings-section__title">${L('settings.modelRequestProxy')}</div>
          <div class="settings-checkbox-row">
            <input type="checkbox" id="modelProxy" .checked=${this._modelProxy}
              @change=${(e: Event) => { this._modelProxy = (e.target as HTMLInputElement).checked; }}
            />
            <label for="modelProxy">${L('settings.modelProxyLabel')}</label>
            <button class="settings-btn primary" style="margin-left:8px;">${L('common.save')}</button>
          </div>
          <div class="settings-hint">
            ${L('settings.modelProxyHint')}
          </div>
        </div>

        <!-- Interface language -->
        <div class="settings-section">
          <div class="settings-section__title">${L('settings.interfaceLang')}</div>
          <select class="settings-select" .value=${this._lang}
            @change=${(e: Event) => {
              this._lang = (e.target as HTMLSelectElement).value;
              this._emit('set-lang', this._lang);
            }}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
          <div class="settings-hint">
            ${L('settings.langHint')}
          </div>
        </div>

        <!-- Auto start -->
        <div class="settings-section">
          <div class="settings-section__title">${L('settings.autoStart')}</div>
          <div class="settings-checkbox-row">
            <input type="checkbox" id="autoStart" .checked=${this._autoStart}
              @change=${(e: Event) => { this._autoStart = (e.target as HTMLInputElement).checked; }}
            />
            <label for="autoStart">${L('settings.autoStartLabel')}</label>
          </div>
          <div class="settings-hint">
            ${L('settings.autoStartHint')}
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('settings-page', SettingsPage);
