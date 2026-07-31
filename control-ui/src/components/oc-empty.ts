import { LitElement, html, unsafeCSS } from 'lit';
import ocEmptyCss from './oc-styles.css?raw';
import { property } from 'lit/decorators/property.js';
export class OcEmpty extends LitElement {
  static styles = unsafeCSS(ocEmptyCss);
  @property({ type: String }) title = '';
  @property({ type: String }) desc = '';
  render() { return html`<div class="oc-"><h3>${this.title}</h3><p>${this.desc}</p></div>`; }
}
customElements.define('oc-empty', OcEmpty);
