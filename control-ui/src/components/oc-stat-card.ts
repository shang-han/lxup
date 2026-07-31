import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import ocEmptyCss from './oc-styles.css?raw';
export class OcStatCard extends LitElement {
  static styles = unsafeCSS(ocEmptyCss);
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) color = 'var(--text-strong)';
  render() {
    return html`<div class="stat-card">
      <div class="stat-label">${this.label}</div>
      <div class="stat-value" style="color:${this.color}">${this.value}</div>
      <div class="stat-hint"><slot></slot></div>
    </div>`;
  }
}
customElements.define('oc-stat-card', OcStatCard);
