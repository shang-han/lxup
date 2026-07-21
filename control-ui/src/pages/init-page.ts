import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { i18n, L } from '../i18n/index.js';

export class InitPage extends LitElement {
  static styles = css`
    :host {
      position: fixed; inset: 0;
      display: grid; place-items: center;
      width: 100vw; min-height: 100dvh;
      background: var(--bg); box-sizing: border-box;
    }
    .init-bg {
      position: fixed; inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.3;
    }
    .init-card {
      position: relative; z-index: 1;
      width: min(480px, calc(100vw - 48px));
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 28px 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .init-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .init-brand {
      display: flex; align-items: center; gap: 10px;
    }
    .init-brand img { width: 28px; height: 28px; }
    .init-brand span {
      font-size: 16px; font-weight: 700; color: var(--text-strong);
    }
    .init-lang {
      display: flex; gap: 2px; padding: 2px;
      background: var(--bg-muted); border-radius: var(--radius-full);
    }
    .init-lang button {
      padding: 4px 12px; border-radius: var(--radius-full);
      font-size: 12px; font-weight: 500; border: none;
      cursor: pointer; color: var(--text-soft); background: transparent;
    }
    .init-lang button.active {
      background: var(--text-strong); color: var(--accent-foreground);
    }
    .init-items {
      display: flex; flex-direction: column; gap: 8px;
      margin-bottom: 24px;
    }
    .init-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-soft);
    }
    .init-item.done { color: var(--text); }
    .init-item.done .check { color: var(--success); }
    .init-item.loading .spinner { color: var(--warn); }
    .init-item .check, .init-item .spinner {
      width: 16px; height: 16px; flex-shrink: 0;
    }
    .init-progress {
      margin-bottom: 16px;
    }
    .init-progress-label {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-bottom: 6px;
    }
    .init-progress-label .pct { color: var(--accent); font-weight: 600; }
    .init-progress-bar {
      height: 4px; background: var(--bg-muted); border-radius: 2px; overflow: hidden;
    }
    .init-progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--warn));
      border-radius: 2px; transition: width 0.3s ease;
    }
    .init-logs {
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 12px;
      max-height: 120px; overflow-y: auto;
      font-family: var(--font-mono); font-size: 11px;
      color: var(--text-soft); line-height: 1.6;
    }
    .init-footer {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-top: 16px;
      padding-top: 12px; border-top: 1px dashed var(--border);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .spinner { animation: spin 1s linear infinite; }
  `;

  @state() _lang = i18n.locale;
  @state() _progress = 0;
  @state() _items = [
    { textKey: 'init.frontendReady', done: true },
    { textKey: 'init.engineOpenclaw', done: true },
    { textKey: 'init.engineHermes', done: true },
    { textKey: 'init.preparingWorkspace', done: false, loading: true },
  ];
  _unsubI18n: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => {
      this._lang = i18n.locale;
      this.requestUpdate();
    });
    this._startProgress();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  _toggleLang() {
    const next = this._lang === 'zh-CN' ? 'en' : 'zh-CN';
    i18n.setLocale(next);
  }

  _startProgress() {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 3 + 1;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        this._items = this._items.map((item, i) =>
          i === this._items.length - 1 ? { ...item, done: true, loading: false } : item
        );
        // 完成后 2 秒跳转
        setTimeout(() => {
          this.dispatchEvent(new CustomEvent('init-done'));
        }, 2000);
      }
      this._progress = Math.round(pct);
      this.requestUpdate();
    }, 200);
  }

  render() {
    return html`
      <div class="init-bg"></div>
      <div class="init-card">
        <div class="init-header">
          <div class="init-brand">
            <img src="/favicon.svg" alt="OpenClaw" />
            <span>${L('init.title')}</span>
          </div>
          <div class="init-lang">
            <button class="${this._lang==='zh-CN'?'active':''}" @click=${this._toggleLang}>中文</button>
            <button class="${this._lang==='en'?'active':''}" @click=${this._toggleLang}>EN</button>
          </div>
        </div>

        <div class="init-items">
          ${this._items.map(item => html`
            <div class="init-item ${item.done ? 'done' : ''} ${item.loading ? 'loading' : ''}">
              ${item.done ? html`
                <svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ` : item.loading ? html`
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ` : html`
                <span class="check" style="opacity:0.3">○</span>
              `}
              ${L(item.textKey)}
            </div>
          `)}
        </div>

        <div class="init-progress">
          <div class="init-progress-label">
            <span>${L('init.ready')}</span>
            <span class="pct">${this._progress}%</span>
          </div>
          <div class="init-progress-bar">
            <div class="init-progress-fill" style="width:${this._progress}%"></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px;">
            1 / 1 ${L('init.files')} · 1 B / 1 B
          </div>
        </div>

        <div class="init-logs">
          2026-07-16T16:08:08.209+08:00 Embedded agent failed before reply: No API key found for provider "anthropic". Auth store: D:\\openclaw-data\\agents\\main\\agent\\auth-profiles.json (agentDir: D:\\openclaw-data\\openclaw\\agents\\main\\agent). Configure auth for this agent (openclaw agents add <id>) or copy auth-profiles.json from the main agentDir.
        </div>

        <div class="init-footer">
          <span>${L('init.launchMultiEngine')}</span>
          <span>${L('init.usbPortable')}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('init-page', InitPage);
