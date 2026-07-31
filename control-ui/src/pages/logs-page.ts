import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import type { GatewayStore } from '../store/gateway-store.js';
import '../components/page-header.js';

type LogEntry = { ts: string; level: string; bracket: string; msg: string };

/** 把网关 logs.tail 返回的单行（JSON 字符串）解析成结构化日志 */
function parseLine(raw: unknown): LogEntry | null {
  if (typeof raw !== 'string') return null;
  try {
    const obj = JSON.parse(raw);
    let bracket = 'gateway';
    const srcRaw = obj['0'] || obj?._meta?.name;
    if (typeof srcRaw === 'string') {
      try {
        bracket = JSON.parse(srcRaw).subsystem || bracket;
      } catch {
        bracket = srcRaw;
      }
    }
    return {
      ts: obj.time || obj?._meta?.date || '',
      level: String(obj?._meta?.logLevelName || 'info').toLowerCase(),
      bracket,
      msg: obj.message || obj['1'] || '',
    };
  } catch {
    return { ts: '', level: 'info', bracket: 'raw', msg: String(raw) };
  }
}

const POLL_MS = 3000;
const MAX_LINES = 1500;

export class LogsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .logs-page { max-width: 100%; }

    /* === tabs === */
    .logs-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .logs-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .logs-tab:hover { color: var(--text); }
    .logs-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* === toolbar === */
    .logs-toolbar {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .logs-toolbar .search-input {
      flex: 0 0 260px; padding: 6px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
    }
    .logs-toolbar .search-input::placeholder { color: var(--muted); }
    .logs-toolbar .search-input:focus { border-color: var(--accent); }
    .logs-toolbar button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .logs-toolbar button:hover { background: var(--bg-hover); color: var(--text); }
    .logs-toolbar .checkbox-label {
      display: flex; align-items: center; gap: 6px; font-size: 12px;
      color: var(--text-soft); cursor: pointer; user-select: none;
    }
    .logs-toolbar .checkbox-label input { cursor: pointer; }
    .logs-toolbar .conn-dot {
      width: 8px; height: 8px; border-radius: 50%; margin-left: auto;
    }
    .logs-toolbar .conn-dot.on { background: var(--success); }
    .logs-toolbar .conn-dot.off { background: var(--muted); }

    /* === log viewer === */
    .log-viewer {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 16px;
      font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
      max-height: 520px; overflow-y: auto; word-break: break-all;
      box-shadow: var(--shadow-card);
    }
    .log-line { margin-bottom: 2px; }
    .log-ts { color: var(--muted); }
    .log-bracket { color: var(--text-soft); }
    .log-warn { color: var(--warn); }
    .log-error { color: var(--danger); }
    .log-info { color: var(--text); }
    .log-empty { color: var(--muted); font-style: italic; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _activeTab = 'gateway';
  @state() _autoScroll = true;
  @state() _search = '';
  @state() _logs: LogEntry[] = [];
  @state() _connected = false;

  _cursor = 0;
  _initialized = false;
  _timer: ReturnType<typeof setInterval> | null = null;
  _storeUnsub: (() => void) | null = null;

  _tabs = [
    { key: 'gateway', label: L('logs.gateway') },
    { key: 'gateway-error', label: L('logs.gatewayError') },
    { key: 'supervisor', label: L('logs.supervisor') },
    { key: 'backup', label: L('logs.backup') },
    { key: 'audit', label: L('logs.audit') },
  ];

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe((snap) => {
      const wasConnected = this._connected;
      this._connected = snap.connected;
      if (snap.connected && !wasConnected) {
        this._initialized = false; // 重连后重新拉取
        this._fetchLogs(true);
      }
    });
    this._timer = setInterval(() => this._fetchLogs(false), POLL_MS);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
    if (this._timer) clearInterval(this._timer);
  }

  async _fetchLogs(reset: boolean) {
    const store = getSharedStore();
    if (!store.connected) return;
    const cursor = reset ? 0 : this._cursor;
    try {
      const res = await store.request<any>('logs.tail', { cursor, limit: 400 });
      if (!res) return;
      if (reset || res.reset) {
        this._logs = [];
      }
      const incoming: LogEntry[] = (res.lines || [])
        .map(parseLine)
        .filter((x: LogEntry | null): x is LogEntry => x !== null);
      if (incoming.length) {
        this._logs = [...this._logs, ...incoming].slice(-MAX_LINES);
      }
      if (typeof res.cursor === 'number') {
        this._cursor = res.cursor;
      }
      this._initialized = true;
    } catch {
      /* 网关暂时不可用时静默，下个周期重试 */
    }
  }

  _matchesTab(log: LogEntry): boolean {
    const t = this._activeTab;
    const text = `${log.bracket} ${log.msg}`.toLowerCase();
    if (t === 'gateway') return true;
    if (t === 'gateway-error') return log.level === 'error' || log.level === 'warn' || log.level === 'fatal';
    if (t === 'supervisor') return text.includes('supervisor') || text.includes('launcher') || text.includes('process');
    if (t === 'backup') return text.includes('backup');
    if (t === 'audit') return text.includes('audit');
    return true;
  }

  get _filteredLogs(): LogEntry[] {
    const q = this._search.trim().toLowerCase();
    return this._logs.filter((log) => {
      if (!this._matchesTab(log)) return false;
      if (!q) return true;
      return `${log.ts} ${log.bracket} ${log.msg}`.toLowerCase().includes(q);
    });
  }

  _levelClass(level: string): string {
    if (level === 'error' || level === 'fatal') return 'log-error';
    if (level === 'warn' || level === 'warning') return 'log-warn';
    return 'log-info';
  }

  _formatLogLine(log: LogEntry) {
    const ts = log.ts ? log.ts.replace('T', ' ').replace(/\.\d+.*$/, '') : '';
    return html`<span class="log-ts">[${ts}]</span> <span class="log-bracket">[${log.bracket}]</span> <span class="${this._levelClass(log.level)}">${log.msg}</span>`;
  }

  updated() {
    if (this._autoScroll) {
      const el = this.renderRoot.querySelector('.log-viewer');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }

  render() {
    const logs = this._filteredLogs;
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="logs-page">
        <!-- Tabs -->
        <div class="logs-tabs">
          ${this._tabs.map(t => html`
            <div class="logs-tab ${this._activeTab === t.key ? 'active' : ''}"
                 @click=${() => { this._activeTab = t.key; }}>
              ${t.label}
            </div>
          `)}
        </div>

        <!-- Toolbar -->
        <div class="logs-toolbar">
          <input class="search-input" type="text"
            .value=${this._search}
            @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
            placeholder="${L('logs.searchLogs')}"
          />
          <button @click=${() => this._fetchLogs(true)}>${L('common.refresh')}</button>
          <label class="checkbox-label">
            <input type="checkbox" .checked=${this._autoScroll}
              @change=${(e: Event) => { this._autoScroll = (e.target as HTMLInputElement).checked; }}
            />
            ${L('logs.autoScroll')}
          </label>
          <span class="conn-dot ${this._connected ? 'on' : 'off'}" title=${this._connected ? 'Gateway connected' : 'Gateway disconnected'}></span>
        </div>

        <!-- Log viewer -->
        <div class="log-viewer">
          ${this._connected
            ? (logs.length
                ? logs.map(log => html`<div class="log-line">${this._formatLogLine(log)}</div>`)
                : html`<div class="log-empty">${this._initialized ? '— ' + L('logs.gateway') + ' —' : '…'}</div>`)
            : html`<div class="log-empty">Gateway ${L('dashboard.stopped')}</div>`}
        </div>
      </div>
    `;
  }
}

customElements.define('logs-page', LogsPage);
