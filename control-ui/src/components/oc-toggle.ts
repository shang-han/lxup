import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
export class OcToggle extends LitElement {
  createRenderRoot() { return this; }
  @property({ type: Boolean }) checked = false;
  @property({ type: String }) label = '';
  render() {
    return html`
      <span class="toggle-label">${this.label}</span>
      <span class="switch ${this.checked ? 'on' : ''}" @click=${this._toggle}></span>
    `;
  }
  _toggle() {
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('change', { detail: { checked: this.checked }, bubbles: true, composed: true }));
  }
}
customElements.define('oc-toggle', OcToggle);
