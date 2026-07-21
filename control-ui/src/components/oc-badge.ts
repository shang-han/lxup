import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators/property.js';
import ocEmptyCss from './oc-styles.css?raw';
export class OcBadge extends LitElement {
  static styles = unsafeCSS(ocEmptyCss);
  @property({ type: String, reflect: true }) variant = 'default';
  render() { return html`<div class="oc-badge"><slot></slot></div>`; }
}
customElements.define('oc-badge', OcBadge);
