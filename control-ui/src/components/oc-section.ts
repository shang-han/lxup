import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import ocEmptyCss from './oc-styles.css?raw';
export class OcSection extends LitElement {
  static styles = unsafeCSS(ocEmptyCss);
  @property({ type: String }) heading = '';
  render() {
    return html`<div class="section">
      <div class="section-header"><slot name="title">${this.heading}</slot></div>
      <div class="section-body"><slot></slot></div>
    </div>`;
  }
}
customElements.define('oc-section', OcSection);
