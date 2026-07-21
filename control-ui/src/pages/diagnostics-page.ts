import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

const CHECK_ITEMS = [
  { id: 'install', nameKey: 'diagnostics.checkInstall', detail: '2026.3.24', status: 'ok' },
  { id: 'nodejs', name: 'Node.js', detail: 'v22.22.1', status: 'ok' },
  { id: 'config', nameKey: 'diagnostics.checkConfig', detail: '', status: 'ok' },
  { id: 'gateway', name: 'Gateway', detail: 'PID 1664', status: 'ok' },
  { id: 'websocket', name: 'WebSocket', detail: 'Gateway 2026.3.24', status: 'ok' },
  { id: 'token', nameKey: 'diagnostics.checkToken', detail: '', status: 'ok' },
  { id: 'deviceKey', nameKey: 'diagnostics.checkDeviceKey', detail: '', status: 'ok' },
  { id: 'version', nameKey: 'diagnostics.checkVersion', detail: '2026.3.24', status: 'ok' },
  { id: 'connection', nameKey: 'diagnostics.checkConnection', detailKey: 'diagnostics.checkDetailConnection', status: 'ok' },
];

const TOOL_BUTTONS = [
  { key: 'diagConfig', labelKey: 'diagnostics.diagConfig' },
  { key: 'autoRepair', labelKey: 'diagnostics.autoRepair' },
  { key: 'connDiag', labelKey: 'diagnostics.connDiag' },
  { key: 'wsTest', labelKey: 'diagnostics.wsTest' },
  { key: 'repairPair', labelKey: 'diagnostics.repairPair' },
  { key: 'netLog', labelKey: 'diagnostics.netLog' },
];

export class DiagnosticsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .diagnostics-page {
      width: 100%;
      display: flex; flex-direction: column; align-items: center;
      min-height: calc(100vh - 120px);
    }

    /* === shield button === */
    .diag-shield {
      display: flex; flex-direction: column; align-items: center;
      margin: 20px 0 16px; cursor: pointer; user-select: none;
    }
    .diag-shield__circle {
      width: 120px; height: 120px; border-radius: 50%;
      background: var(--card); border: 2px solid var(--border);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: all var(--duration-fast);
    }
    .diag-shield:hover .diag-shield__circle {
      border-color: var(--accent); box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .diag-shield__icon {
      width: 32px; height: 32px; color: var(--accent); margin-bottom: 6px;
    }
    .diag-shield__label {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .diag-shield__hint {
      font-size: 12px; color: var(--muted); margin-top: 8px;
    }

    /* === status result === */
    .diag-result {
      width: 100%; max-width: 680px;
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: var(--radius-md);
      margin-bottom: 16px;
    }
    .diag-result.ok {
      background: var(--success-subtle); border: 1px solid rgba(34,197,94,0.2);
    }
    .diag-result.fail {
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,0.2);
    }
    .diag-result__icon {
      font-size: 28px; font-weight: 300; color: var(--text-strong);
    }
    .diag-result__title {
      font-size: 15px; font-weight: 600; color: var(--text-strong);
    }
    .diag-result__desc {
      font-size: 12px; color: var(--text-soft);
    }

    /* === check list === */
    .diag-list {
      width: 100%; max-width: 680px;
      display: flex; flex-direction: column; gap: 6px;
      margin-bottom: 16px;
    }
    .diag-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .diag-item__status {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; flex-shrink: 0;
    }
    .diag-item__status.ok {
      background: var(--success-subtle); color: var(--success);
    }
    .diag-item__status.fail {
      background: var(--danger-subtle); color: var(--danger);
    }
    .diag-item__status.warn {
      background: rgba(245,158,11,0.12); color: var(--warn);
    }
    .diag-item__content { flex: 1; min-width: 0; }
    .diag-item__name {
      font-size: 13px; font-weight: 500; color: var(--text-strong);
    }
    .diag-item__detail {
      font-size: 11px; color: var(--muted);
    }

    /* === advanced tools === */
    .diag-advanced-wrap {
      width: 100%; max-width: 680px;
      margin-bottom: 16px;
    }
    .diag-advanced {
      font-size: 12px; color: var(--accent); cursor: pointer;
      display: flex; align-items: center; gap: 4px; justify-content: center;
    }
    .diag-advanced:hover { text-decoration: underline; }

    /* === tool bar === */
    .diag-toolbar {
      width: 100%; max-width: 680px;
      display: flex; flex-wrap: nowrap; gap: 8px; justify-content: center;
      padding: 14px 20px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-top: 12px;
    }
    .diag-toolbar button {
      padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--bg-muted); color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .diag-toolbar button:hover { background: var(--bg-hover); color: var(--text); }
    @media (max-width: 600px) { .diag-toolbar { flex-wrap: wrap; } }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _checked = false;
  @state() _showAdvanced = false;

  _runCheck() {
    this._checked = !this._checked;
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="diagnostics-page">

        <!-- Shield button -->
        <div class="diag-shield" @click=${this._runCheck}>
          <div class="diag-shield__circle">
            <div class="diag-shield__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div class="diag-shield__label">${this._checked ? L('diagnostics.startCheck') : L('diagnostics.startCheck')}</div>
          </div>
          <div class="diag-shield__hint">${this._checked ? L('diagnostics.clickToRetry') : L('diagnostics.clickToStart')}</div>
        </div>

        <!-- Results (shown after check) -->
        ${this._checked ? html`
          <!-- Status summary -->
          <div class="diag-result ok">
            <div class="diag-result__icon">OK</div>
            <div>
              <div class="diag-result__title">${L('diagnostics.allOk')}</div>
              <div class="diag-result__desc">${L('diagnostics.checkSummary', { count: CHECK_ITEMS.length })}</div>
            </div>
          </div>

          <!-- Check list -->
          <div class="diag-list">
            ${CHECK_ITEMS.map(item => html`
              <div class="diag-item">
                <div class="diag-item__status ${item.status}">OK</div>
                <div class="diag-item__content">
                  <div class="diag-item__name">${item.nameKey ? L(item.nameKey) : item.name}</div>
                  ${(item.detail || item.detailKey) ? html`<div class="diag-item__detail">${item.detailKey ? L(item.detailKey) : item.detail}</div>` : ''}
                </div>
              </div>
            `)}
          </div>

          <!-- Advanced tools -->
          <div class="diag-advanced-wrap">
            <div class="diag-advanced" @click=${() => { this._showAdvanced = !this._showAdvanced; }}>
              ${this._showAdvanced ? '▾' : '▸'} ${L('diagnostics.advancedTools')}
            </div>
            ${this._showAdvanced ? html`
              <div class="diag-toolbar">
                ${TOOL_BUTTONS.map(t => html`
                  <button>${L(t.labelKey)}</button>
                `)}
              </div>
            ` : ''}
          </div>
        ` : html`
          <!-- Advanced tools (initial state) -->
          <div class="diag-advanced-wrap">
            <div class="diag-advanced" @click=${() => { this._showAdvanced = !this._showAdvanced; }}>
              ${this._showAdvanced ? '▾' : '▸'} ${L('diagnostics.advancedTools')}
            </div>
            ${this._showAdvanced ? html`
              <div class="diag-toolbar">
                ${TOOL_BUTTONS.map(t => html`
                  <button>${L(t.labelKey)}</button>
                `)}
              </div>
            ` : ''}
          </div>
        `}

      </div>
    `;
  }
}

customElements.define('diagnostics-page', DiagnosticsPage);
