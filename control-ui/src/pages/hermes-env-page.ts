import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesEnvPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .env-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .env-back:hover { text-decoration: underline; }

    .env-page-title { font-size: 28px; font-weight: 700; color: var(--text-strong); letter-spacing: -0.02em; margin-bottom: 4px; }
    .env-page-subtitle { font-size: 12px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 24px; }

    .env-notice {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      font-size: 13px; color: var(--text-soft); line-height: 1.7; margin-bottom: 16px;
    }
    .env-notice code {
      font-family: var(--font-mono); font-size: 11px;
      background: var(--bg-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text);
    }

    .env-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    .env-section__header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .env-section__header svg { color: var(--accent); }
    .env-section__body { padding: 20px; }

    .env-empty { text-align: center; padding: 32px 16px; color: var(--muted); }
    .env-empty__title { font-size: 13px; margin-bottom: 4px; }
    .env-empty__desc { font-size: 12px; }

    .env-actions {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-top: 1px solid var(--border); gap: 12px;
    }
    .env-actions__left { display: flex; align-items: center; gap: 12px; }
    .env-add-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      display: inline-flex; align-items: center; gap: 6px;
    }
    .env-add-btn:hover { background: var(--accent-hover); }
    .env-save-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text);
    }
    .env-save-btn:hover { background: var(--bg-hover); }
    .env-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .env-hint { font-size: 11px; color: var(--muted); }
    .env-msg { font-size: 12px; }
    .env-msg.ok { color: var(--success); }
    .env-msg.err { color: var(--danger); }

    .env-var-row { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .env-var-row:last-child { border-bottom: none; }
    .env-var-name {
      width: 240px; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono); outline: none;
    }
    .env-var-name:focus { border-color: var(--accent); }
    .env-var-value {
      flex: 1; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono); outline: none;
    }
    .env-var-value:focus { border-color: var(--accent); }
    .env-var-remove {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm); color: var(--muted); cursor: pointer;
    }
    .env-var-remove:hover { background: var(--danger-subtle); color: var(--danger); }
  `;

  @property({ type: String }) title = '';
  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  @state() _variables: Array<{ name: string; value: string }> = [];
  @state() _path = '';
  @state() _busy = false;
  @state() _saveMsg = '';
  @state() _saveKind: '' | 'ok' | 'err' = '';

  _unsubI18n: (() => void) | null = null;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
    void this._loadEnv();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  async _loadEnv() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/env`);
      if (!r.ok) return;
      const d = (await r.json()) as { vars?: Array<{ name: string; value: string }>; path?: string };
      this._variables = d.vars || [];
      this._path = d.path || '';
      this._saveMsg = '';
    } catch { /* Sidecar 离线 */ }
  }

  _setVar(index: number, field: 'name' | 'value', value: string) {
    const next = this._variables.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    this._variables = next;
  }

  _addVar() {
    this._variables = [...this._variables, { name: '', value: '' }];
  }

  _removeVar(index: number) {
    this._variables = this._variables.filter((_, i) => i !== index);
  }

  async _save() {
    this._busy = true;
    this._saveMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vars: this._variables }),
      });
      const d = (await r.json()) as { success?: boolean; message?: string };
      this._saveMsg = d.message || (d.success ? '✓' : '✗');
      this._saveKind = d.success ? 'ok' : 'err';
    } catch {
      this._saveMsg = `✗ ${L('hermesDashboard.sidecarOffline')}`;
      this._saveKind = 'err';
    }
    this._busy = false;
  }

  render() {
    return html`
      <div class="page-content" style="padding:24px;">
        <a class="env-back" @click=${() => this.onNavigate('dashboard')}>
          ← ${L('hermesEnv.backToDashboard')}
        </a>

        <div class="env-page-title">${L('hermesEnv.title')}</div>
        <div class="env-page-subtitle">${this._path || 'runtime/hermes-home/.env'}</div>

        <!-- Notice -->
        <div class="env-notice">
          ${L('hermesEnv.notice')}
          <code>.env</code>
          ${L('hermesEnv.noticeCustom')}
        </div>

        <!-- .env section -->
        <div class="env-section">
          <div class="env-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            .env
          </div>
          <div class="env-section__body">
            ${this._variables.length === 0 ? html`
              <div class="env-empty">
                <div class="env-empty__title">${L('hermesEnv.noVars')}</div>
                <div class="env-empty__desc">${L('hermesEnv.clickAdd')}</div>
              </div>
            ` : this._variables.map((v, i) => html`
              <div class="env-var-row">
                <input class="env-var-name" .value=${v.name} placeholder=${L('hermesEnv.keyPlaceholder')}
                  @input=${(e: Event) => this._setVar(i, 'name', (e.target as HTMLInputElement).value)} />
                <input class="env-var-value" .value=${v.value} placeholder=${L('hermesEnv.valuePlaceholder')}
                  @input=${(e: Event) => this._setVar(i, 'value', (e.target as HTMLInputElement).value)} />
                <button class="env-var-remove" @click=${() => this._removeVar(i)} title=${L('hermesEnv.remove')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `)}
          </div>
          <div class="env-actions">
            <div class="env-actions__left">
              <button class="env-add-btn" @click=${this._addVar}>+ ${L('hermesEnv.addVar')}</button>
              <span class="env-hint">${L('hermesEnv.changesHint')}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              ${this._saveMsg ? html`<span class="env-msg ${this._saveKind}">${this._saveMsg}</span>` : ''}
              <button class="env-save-btn" ?disabled=${this._busy} @click=${this._save}>${L('common.save')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-env-page', HermesEnvPage);
