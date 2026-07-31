import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/page-header.js';

const DOC_LINKS = [
  { name: 'extensions.quickStart', url: '#' },
  { name: 'extensions.cronAutomation', url: '#' },
  { name: 'extensions.skills', url: '#' },
];

export class ExtensionsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .extensions-page { width: 100%; }

    /* === main grid === */
    .extensions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    @media (max-width: 700px) { .extensions-grid { grid-template-columns: 1fr; } }

    /* === card === */
    .ext-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .ext-card__header {
      padding: 16px 20px; font-size: 14px; font-weight: 600; color: var(--text-strong);
      border-bottom: 1px solid var(--border);
    }
    .ext-card__body { padding: 16px 20px; }

    /* === doc links === */
    .ext-doc-link {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 0; font-size: 13px; color: var(--accent);
      text-decoration: none; cursor: pointer;
    }
    .ext-doc-link:hover { text-decoration: underline; }
    .ext-doc-link svg { width: 12px; height: 12px; flex-shrink: 0; }

    /* === snapshot stats === */
    .ext-snapshot {
      display: grid; grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;
    }
    .ext-snapshot__item {
      padding: 16px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .ext-snapshot__item:last-child { border-right: none; }
    .ext-snapshot__label {
      font-size: 11px; color: var(--muted); margin-bottom: 6px;
    }
    .ext-snapshot__value {
      font-size: 20px; font-weight: 600; color: var(--text-strong);
    }
  `;

  @property({ type: String }) title = '';

  render() {
    return html`
      <page-header title=${this.title} subtitle=${L('extensions.subtitle')}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
          ${L('common.refresh')}
        </button>
      </page-header>
      <div class="extensions-page">
        <div class="extensions-grid">

          <!-- Docs card -->
          <div class="ext-card">
            <div class="ext-card__header">${L('extensions.docs')}</div>
            <div class="ext-card__body">
              ${DOC_LINKS.map(link => html`
                <a class="ext-doc-link" href=${link.url} target="_blank" rel="noopener">
                  ${L(link.name)}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              `)}
            </div>
          </div>

          <!-- Analytics snapshot card -->
          <div class="ext-card">
            <div class="ext-card__header">${L('extensions.analyticsSnapshot')}</div>
            <div class="ext-card__body">
              <div class="ext-snapshot">
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${L('extensions.sessions')}</div>
                  <div class="ext-snapshot__value">0</div>
                </div>
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${L('extensions.tokens')}</div>
                  <div class="ext-snapshot__value">0</div>
                </div>
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${L('extensions.cost')}</div>
                  <div class="ext-snapshot__value">$0.00</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}

customElements.define('extensions-page', ExtensionsPage);
