import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesConfigPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hc-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hc-back:hover { text-decoration: underline; }

    .hc-header-actions { display: flex; gap: 8px; align-items: center; }
    .hc-btn-ghost {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hc-btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .hc-btn-primary {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
    }
    .hc-btn-primary:hover { background: var(--accent-hover); }
    .hc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .hc-msg { font-size: 12px; margin-bottom: 12px; }
    .hc-msg.ok { color: var(--success); }
    .hc-msg.err { color: var(--danger); }

    .hc-editor-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hc-editor-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
    }
    .hc-editor-filename { font-size: 14px; font-weight: 600; color: var(--text-strong); }
    .hc-editor-link { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
    .hc-editor-textarea {
      width: 100%; min-height: 500px; padding: 16px 20px;
      background: var(--bg); border: none; resize: vertical;
      font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
      color: var(--text); outline: none;
    }
    .hc-editor-textarea:focus { background: var(--bg-elevated); }
  `;

  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  @state() _configContent = '';
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
    void this._loadConfig();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  async _loadConfig() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/config`);
      if (!r.ok) return;
      const d = (await r.json()) as { content?: string; path?: string };
      this._configContent = d.content || '';
      this._path = d.path || '';
      this._saveMsg = '';
    } catch { /* Sidecar 离线 */ }
  }

  async _save() {
    this._busy = true;
    this._saveMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: this._configContent }),
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
      <div class="page-content" style="padding:24px 24px 0;">
        <a class="hc-back" @click=${() => this.onNavigate('hermes-service')}>
          ← ${L('hermesConfig.backToService')}
        </a>
      </div>

      <page-header
        title=${L('hermesConfig.title')}
        subtitle=${this._path || 'config.yaml'}
      >
        <div class="hc-header-actions">
          <button class="hc-btn-ghost" @click=${() => this._loadConfig()}>${L('hermesConfig.reload')}</button>
          <button class="hc-btn-primary" ?disabled=${this._busy} @click=${this._save}>${L('hermesConfig.saveConfig')}</button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        ${this._saveMsg ? html`<div class="hc-msg ${this._saveKind}">${this._saveMsg}</div>` : ''}
        <div class="hc-editor-card">
          <div class="hc-editor-header">
            <span class="hc-editor-filename">config.yaml</span>
            <span class="hc-editor-link">raw yaml editor · 保存即热加载</span>
          </div>
          <textarea class="hc-editor-textarea"
            .value=${this._configContent}
            @input=${(e: Event) => { this._configContent = (e.target as HTMLTextAreaElement).value; }}
          ></textarea>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-config-page', HermesConfigPage);
