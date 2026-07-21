import { LitElement, html, css, unsafeCSS } from 'lit';
import { I18nPage } from './i18n-page.js';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import * as logsService from '../services/logs.js';
import type { LogFile, LogEntry } from '../services/types.js';
import pageStyles from './styles.css?raw';

const LEVEL_COLORS: Record<string, string> = {
  INFO: 'var(--info)',
  WARN: 'var(--warn)',
  ERROR: 'var(--danger)',
  DEBUG: 'var(--muted)',
};

export class HermesLogsPage extends I18nPage {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hl-breadcrumb {
      font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 4px;
    }
    .hl-page-title {
      font-size: 28px; font-weight: 700; color: var(--text-strong);
      letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .hl-page-subtitle {
      font-size: 12px; color: var(--muted); font-family: var(--font-mono);
      margin-bottom: 24px;
    }

    .hl-header-actions {
      display: flex; gap: 8px; align-items: center;
    }
    .hl-action-btn {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .hl-action-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-layout {
      display: grid; grid-template-columns: 200px 1fr; gap: 16px;
    }

    .hl-file-list {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-card);
    }
    .hl-file-list__title {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 12px;
    }
    .hl-file-item {
      padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer;
      transition: background var(--duration-fast); margin-bottom: 2px;
    }
    .hl-file-item:hover { background: var(--bg-hover); }
    .hl-file-item.active { background: var(--accent-subtle); }
    .hl-file-item__name {
      font-size: 12px; font-weight: 600; color: var(--text);
      font-family: var(--font-mono);
    }
    .hl-file-item.active .hl-file-item__name { color: var(--accent); }
    .hl-file-item__size {
      font-size: 10px; color: var(--muted);
    }

    .hl-viewer {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      overflow: hidden;
    }
    .hl-toolbar {
      display: grid; grid-template-columns: 100px 100px 1fr 32px;
      gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border);
      align-items: center;
    }
    .hl-toolbar-label {
      font-size: 11px; color: var(--muted); margin-bottom: 4px;
    }
    .hl-toolbar select {
      padding: 5px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none;
    }
    .hl-toolbar select:focus { border-color: var(--accent); }
    .hl-toolbar input {
      width: 100%; padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none;
      font-family: var(--font-mono);
    }
    .hl-toolbar input:focus { border-color: var(--accent); }
    .hl-toolbar input::placeholder { color: var(--muted); }
    .hl-clear-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer;
    }
    .hl-clear-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-count {
      padding: 6px 16px; font-size: 11px; color: var(--muted);
      border-bottom: 1px solid var(--border); background: var(--bg-muted);
    }

    .hl-log-body {
      max-height: 520px; overflow-y: auto; padding: 4px 0;
      font-family: var(--font-mono); font-size: 12px;
    }
    .hl-log-row {
      display: grid; grid-template-columns: 80px 50px 40px 1fr 40px;
      gap: 8px; padding: 3px 16px; align-items: center;
    }
    .hl-log-row:hover { background: var(--bg-hover); }
    .hl-log-time { color: var(--muted); }
    .hl-log-level {
      font-size: 10px; font-weight: 600; padding: 1px 6px;
      border-radius: var(--radius-sm); text-align: center;
    }
    .hl-log-method { color: var(--text-soft); }
    .hl-log-path { color: var(--text); }
    .hl-log-status {
      font-size: 10px; font-weight: 600; text-align: right;
      padding: 1px 6px; border-radius: var(--radius-sm);
    }
    .hl-log-status.ok { color: var(--success); background: var(--success-subtle); }
    .hl-log-status.err { color: var(--danger); background: var(--danger-subtle); }
  `;

  @property({ type: Function }) onNavigate = () => {};

  @state() _activeFile = 'agent.log';
  @state() _level = 'ALL';
  @state() _lines = '200';
  @state() _search = '';
  @state() _logFiles: LogFile[] = [];
  @state() _logs: LogEntry[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._loadData();
  }

  async _loadData() {
    this._logFiles = await logsService.getLogFiles();
    this._logs = await logsService.getLogEntries(this._activeFile);
  }

  get _filteredLogs() {
    let logs = this._logs;
    if (this._search) {
      const q = this._search.toLowerCase();
      logs = logs.filter(l => l.path?.toLowerCase().includes(q) || l.message?.toLowerCase().includes(q));
    }
    return logs;
  }

  render() {
    const filtered = this._filteredLogs;

    return html`
      <page-header
        title=${L('hermesLogs.title', 'Agent 日志')}
        subtitle=${L('hermesLogs.path', '~/.hermes/logs/ · agent.log')}
      >
        <div class="hl-header-actions">
          <button class="hl-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${L('hermesLogs.tail', '追踪')}
          </button>
          <button class="hl-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${L('hermesLogs.download', '下载')}
          </button>
          <button class="hl-action-btn" @click=${() => this.requestUpdate()}>
            ${icons['refresh-cw']}
            ${L('hermesLogs.refresh', '刷新')}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <div class="hl-layout">
          <!-- File list -->
          <div class="hl-file-list">
            <div class="hl-file-list__title">${L('hermesLogs.logFiles', '日志文件')}</div>
            ${this._logFiles.map(f => html`
              <div class="hl-file-item ${this._activeFile === f.name ? 'active' : ''}"
                   @click=${() => { this._activeFile = f.name; this.requestUpdate(); }}>
                <div class="hl-file-item__name">${f.name}</div>
                <div class="hl-file-item__size">${f.size}</div>
              </div>
            `)}
          </div>

          <!-- Log viewer -->
          <div class="hl-viewer">
            <div class="hl-toolbar">
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.level', '级别')}</div>
                <select .value=${this._level} @change=${(e: Event) => { this._level = (e.target as HTMLSelectElement).value; }}>
                  <option value="ALL">ALL</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                  <option value="DEBUG">DEBUG</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.lines', '行数')}</div>
                <select .value=${this._lines} @change=${(e: Event) => { this._lines = (e.target as HTMLSelectElement).value; }}>
                  <option value="100">100 行</option>
                  <option value="200">200 行</option>
                  <option value="500">500 行</option>
                  <option value="1000">1000 行</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.search', '搜索')}</div>
                <input type="text" .value=${this._search}
                  placeholder=${L('hermesLogs.searchPlaceholder', '搜索日志...')}
                  @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }} />
              </div>
              <button class="hl-clear-btn" @click=${() => { this._search = ''; }} title=${L('hermesLogs.clear', '清除')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="hl-count">${filtered.length} / ${this._logs.length} ${L('hermesLogs.records', '条记录')}</div>

            <div class="hl-log-body">
              ${filtered.map(l => html`
                <div class="hl-log-row">
                  <span class="hl-log-time">${l.time}</span>
                  <span class="hl-log-level" style="color:${LEVEL_COLORS[l.level] || 'var(--text-soft)'};background:var(--bg-muted);">${l.level}</span>
                  <span class="hl-log-method">${l.method}</span>
                  <span class="hl-log-path">${l.path}</span>
                  <span class="hl-log-status ${l.status < 400 ? 'ok' : 'err'}">${l.status}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-logs-page', HermesLogsPage);
