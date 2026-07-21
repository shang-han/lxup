import { LitElement, html, unsafeCSS } from 'lit';
import sidebarCss from './sidebar.css?raw';
import { property } from 'lit/decorators/property.js';
import { icons } from './icons.js';
import { L } from '../i18n/index.js';

export class OcSidebar extends LitElement {
  static styles = unsafeCSS(sidebarCss);

  @property({ type: String }) page = 'dashboard';
  @property({ type: Object }) routes = {};
  @property({ type: Array }) sections = [];
  @property({ type: Boolean }) connected = false;
  @property({ type: String }) engine = 'openclaw';
  @property({ type: String }) themeMode = 'dark';
  @property({ type: String }) lang = 'zh-CN';

  _cycleMode() {
    const modes = ['dark', 'light'];
    const idx = modes.indexOf(this.themeMode);
    const next = modes[(idx + 1) % modes.length];
    this.dispatchEvent(new CustomEvent('set-mode', { detail: { mode: next }, bubbles: true, composed: true }));
  }

  _modeIcon() {
    if (this.themeMode === 'dark') return icons['moon'];
    return icons['sun'];
  }

  _modeTitle() {
    if (this.themeMode === 'dark') return L('common.darkMode');
    return L('common.lightMode');
  }

  _cycleLang() {
    const next = this.lang === 'zh-CN' ? 'en' : 'zh-CN';
    this.dispatchEvent(new CustomEvent('set-lang', { detail: { lang: next }, bubbles: true, composed: true }));
  }

  _langLabel() {
    return this.lang === 'zh-CN' ? '中文' : 'English';
  }

  render() {
    return html`
      <div class="sidebar-shell">
        <div class="sidebar-shell__header">
          <div class="sidebar-brand">
            <img class="sidebar-brand__logo" src="/favicon.svg" alt="OpenClaw" />
            <div class="sidebar-brand__copy">
              <span class="sidebar-brand__eyebrow">Control</span>
              <span class="sidebar-brand__title">OpenClaw</span>
            </div>
          </div>
        </div>
        <div class="engine-select">
          <div class="engine-label">${L('engine')}</div>
          <select .value=${this.engine} @change=${(e: Event) => {
            const v = (e.target as HTMLSelectElement).value;
            this.dispatchEvent(new CustomEvent('set-engine', { detail: { engine: v }, bubbles: true, composed: true }));
          }}>
            <option value="openclaw">Openclaw</option>
            <option value="hermes">Hermes Agent</option>
            <option value="codex">Codex CLI</option>
          </select>
        </div>
        <div class="sidebar-shell__body">
          <nav class="nav-scroll">
            ${this.sections.map((section: any) => html`
              <div class="nav-section">
                ${section.heading ? html`<div class="nav-section__heading">${section.heading}</div>` : ''}
                ${section.tabs.map((tab: string) => {
                  const route = this.routes[tab];
                  if (!route) return '';
                  return html`
                    <div class="nav-item ${this.page === tab ? 'active' : ''}" @click=${() => this._emitNav(tab)} title=${route.label}>
                      <span class="nav-item__icon">${icons[route.icon] || icons.circle}</span>
                      <span class="nav-item__text">${route.label}</span>
                    </div>
                  `;
                })}
              </div>
            `)}
          </nav>
        </div>
        <div class="sidebar-shell__footer">
          <div class="footer-item" @click=${() => this._cycleMode()}>
            ${this._modeIcon()}
            <span class="footer-item-text">${this._modeTitle()}</span>
          </div>
          <div class="footer-item" @click=${() => this._cycleLang()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span class="footer-item-text">${this._langLabel()}</span>
          </div>
        </div>
      </div>
    `;
  }

  _emitNav(page: string) { this.dispatchEvent(new CustomEvent('navigate', { detail: { page }, bubbles: true, composed: true })); }
}

customElements.define('oc-sidebar', OcSidebar);
