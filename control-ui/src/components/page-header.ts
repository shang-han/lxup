import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators/property.js';

/**
 * Standard page header used across all pages.
 * Renders a title + subtitle on the left, with an optional right slot for actions.
 * Includes top padding, bottom border divider, and bottom margin for spacing.
 */
export class PageHeader extends LitElement {
  static styles = css`
    :host { display: block; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
    }
    .page-header-left { min-width: 0; }
    .page-title {
      color: var(--text-strong); font-size: 22px; font-weight: 700;
      letter-spacing: -0.02em; line-height: 1.2;
    }
    .page-subtitle {
      color: var(--text-soft); font-size: 13px; margin-top: 4px; line-height: 1.4;
    }
    .page-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  render() {
    return html`
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">${this.title}</div>
          ${this.subtitle ? html`<div class="page-subtitle">${this.subtitle}</div>` : ''}
        </div>
        <div class="page-header-right"><slot></slot></div>
      </div>
    `;
  }
}

customElements.define('page-header', PageHeader);
