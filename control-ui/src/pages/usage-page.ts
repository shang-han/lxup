import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/page-header.js';

export class UsagePage extends LitElement {
  static styles = css`
    :host { display: block; }

    .usage-page { width: 100%; }

    /* === empty state === */
    .usage-empty {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: flex; align-items: center; justify-content: center;
      min-height: 200px; padding: 48px 24px;
    }
    .usage-empty__text {
      font-size: 13px; color: var(--muted);
    }
  `;

  @property({ type: String }) title = '';

  render() {
    const subtitleStr = L('usage.subtitle');

    return html`
      <page-header title=${this.title} subtitle=${subtitleStr}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
          ${L('common.refresh')}
        </button>
      </page-header>
      <div class="usage-page">
        <div class="usage-empty">
          <div class="usage-empty__text">暂无数据</div>
        </div>
      </div>
    `;
  }
}

customElements.define('usage-page', UsagePage);
