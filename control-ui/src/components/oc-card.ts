import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import ocEmptyCss from './oc-styles.css?raw';
export class OcCard extends LitElement {
  static styles = unsafeCSS(ocEmptyCss);
  @property({ type: String }) heading = '';
  @property({ type: String }) icon = '';
  render() {
    return html`<div class="card">
      ${this.icon ? html`<div class="card-icon">${this.icon}</div>` : ''}
      <div class="card-body">
        ${this.heading ? html`<div class="card-header">${this.heading}</div>` : ''}
        <slot></slot>
      </div>
      <div class="card-right"><slot name="right"></slot></div>
    </div>`;
  }
}
customElements.define('oc-card', OcCard);
