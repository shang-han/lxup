import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

type LogFileInfo = { name: string; size: number; modified: number };

export class HermesLogsPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hl-header-actions { display: flex; gap: 8px; align-items: center; }
    .hl-action-btn {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .hl-action-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }

    .hl-file-list {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-card);
      align-self: start;
    }
    .hl-file-list__title { font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 12px; }
    .hl-file-item {
      padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer;
      transition: background var(--duration-fast); margin-bottom: 2px;
    }
    .hl-file-item:hover { background: var(--bg-hover); }
    .hl-file-item.active { background: var(--accent-subtle); }
    .hl-file-item__name { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-mono); word-break: break-all; }
    .hl-file-item.active .hl-file-item__name { color: var(--accent); }
    .hl-file-item__size { font-size: 10px; color: var(--muted); }

    .hl-viewer {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hl-toolbar {
      display: grid; grid-template-columns: 100px 100px 1fr 32px;
      gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center;
    }
    .hl-toolbar-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .hl-toolbar select {
      padding: 5px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none;
    }
    .hl-toolbar select:focus { border-color: var(--accent); }
    .hl-toolbar input {
      width: 100%; padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none; font-family: var(--font-mono);
    }
    .hl-toolbar input:focus { border-color: var(--accent); }
    .hl-toolbar input::placeholder { color: var(--muted); }
    .hl-clear-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm); color: var(--muted); cursor: pointer;
    }
    .hl-clear-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-count {
      padding: 6px 16px; font-size: 11px; color: var(--muted);
      border-bottom: 1px solid var(--border); background: var(--bg-muted);
    }

    .hl-log-body {
      max-height: 560px; overflow-y: auto; padding: 8px 0;
      font-family: var(--font-mono); font-size: 11.5px; line-height: 1.5;
    }
    .hl-line { padding: 1px 16px; white-space: pre-wrap; word-break: break-all; color: var(--text-soft); }
    .hl-line:hover { background: var(--bg-hover); }
    .hl-line.warn { color: var(--warn); }
    .hl-line.err { color: var(--danger); }
    .hl-empty { padding: 40px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  `;

  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  @state() _logFiles: LogFileInfo[] = [];
  @state() _activeFile = '';
  @state() _logLines: string[] = [];
  @state() _level = 'ALL';
  @state() _lines = '200';
  @state() _search = '';
  @state() _loading = false;

  _unsubI18n: (() => void) | null = null;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
    void this._loadFiles();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  async _loadFiles() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/logs`);
      if (!r.ok) return;
      const d = (await r.json()) as { files?: LogFileInfo[] };
      this._logFiles = d.files || [];
      if (!this._activeFile && this._logFiles.length) {
        this._activeFile = this._logFiles[0].name;
      }
      if (this._activeFile) await this._loadContent();
    } catch { /* Sidecar 离线 */ }
  }

  async _loadContent() {
    if (!this._activeFile) return;
    this._loading = true;
    try {
      const r = await fetch(
        `${this._sidecarBase}/api/hermes/logs/content?file=${encodeURIComponent(this._activeFile)}&lines=${this._lines}`,
      );
      if (r.ok) {
        const d = (await r.json()) as { lines?: string[] };
        this._logLines = d.lines || [];
      }
    } catch { /* ignore */ }
    this._loading = false;
  }

  _selectFile(name: string) {
    this._activeFile = name;
    void this._loadContent();
  }

  _fmtSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  _lineClass(l: string): string {
    if (/\bERROR\b|Traceback|Exception/i.test(l)) return 'err';
    if (/\bWARN(?:ING)?\b/i.test(l)) return 'warn';
    return '';
  }

  get _filteredLines(): string[] {
    let lines = this._logLines;
    if (this._level !== 'ALL') lines = lines.filter((l) => l.includes(this._level));
    if (this._search) {
      const q = this._search.toLowerCase();
      lines = lines.filter((l) => l.toLowerCase().includes(q));
    }
    return lines;
  }

  render() {
    const filtered = this._filteredLines;
    return html`
      <page-header
        title=${L('hermesLogs.title')}
        subtitle=${'runtime/logs · runtime/hermes-home/logs'}
      >
        <div class="hl-header-actions">
          <button class="hl-action-btn" @click=${() => this._loadFiles()}>
            ${icons['refresh-cw']}
            ${L('hermesLogs.refresh')}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <div class="hl-layout">
          <!-- File list -->
          <div class="hl-file-list">
            <div class="hl-file-list__title">${L('hermesLogs.logFiles')}</div>
            ${this._logFiles.length === 0
              ? html`<div style="font-size:12px;color:var(--muted);">（无日志文件）</div>`
              : this._logFiles.map((f) => html`
                <div class="hl-file-item ${this._activeFile === f.name ? 'active' : ''}"
                     @click=${() => this._selectFile(f.name)}>
                  <div class="hl-file-item__name">${f.name}</div>
                  <div class="hl-file-item__size">${this._fmtSize(f.size)}</div>
                </div>
              `)}
          </div>

          <!-- Log viewer -->
          <div class="hl-viewer">
            <div class="hl-toolbar">
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.level')}</div>
                <select .value=${this._level} @change=${(e: Event) => { this._level = (e.target as HTMLSelectElement).value; }}>
                  <option value="ALL">ALL</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.lines')}</div>
                <select .value=${this._lines} @change=${(e: Event) => { this._lines = (e.target as HTMLSelectElement).value; void this._loadContent(); }}>
                  <option value="100">100 行</option>
                  <option value="200">200 行</option>
                  <option value="500">500 行</option>
                  <option value="1000">1000 行</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${L('hermesLogs.search')}</div>
                <input type="text" .value=${this._search}
                  placeholder=${L('hermesLogs.searchPlaceholder')}
                  @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }} />
              </div>
              <button class="hl-clear-btn" @click=${() => { this._search = ''; }} title=${L('hermesLogs.clear')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="hl-count">
              ${this._loading ? '…' : `${filtered.length} / ${this._logLines.length} ${L('hermesLogs.records')}`}
              ${this._activeFile ? ` · ${this._activeFile}` : ''}
            </div>

            <div class="hl-log-body">
              ${filtered.length === 0
                ? html`<div class="hl-empty">${this._loading ? '加载中…' : '（无内容）'}</div>`
                : filtered.map((l) => html`<div class="hl-line ${this._lineClass(l)}">${l}</div>`)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-logs-page', HermesLogsPage);
