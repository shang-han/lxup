import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators/property.js';
export class OcBtn extends LitElement {
  static styles = css`:host{display:inline-flex;}.btn{border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-family:inherit;font-weight:600;border-radius:var(--radius-md);padding:6px 14px;font-size:13px;transition:all var(--duration-fast) ease;display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;}.btn:hover{background:var(--bg-hover);border-color:var(--text-muted);}.btn.sm{padding:3px 10px;font-size:11px;min-width:40px;}.btn.lg{padding:7px 18px;font-size:13px;}.btn.accent{background:var(--accent);color:#fff;border-color:var(--accent);}.btn.accent:hover{background:var(--accent-hover);}.btn.danger{background:var(--danger);color:#fff;border-color:var(--danger);}.btn.danger:hover{background:#dc2626;border-color:#dc2626;}.btn:disabled{opacity:.5;cursor:not-allowed;}.btn:disabled:hover{background:var(--card);border-color:var(--border);}.btn.accent:disabled:hover{background:var(--accent);border-color:var(--accent);}`;
  @property({ type: String }) size: 'sm'|'lg' = 'sm';
  @property({ type: String }) variant: 'default'|'accent'|'danger' = 'default';
  @property({ type: Boolean }) disabled = false;
  render() { return html`<button class="btn ${this.size} ${this.variant}" ?disabled=${this.disabled}><slot></slot></button>`; }
}
customElements.define('oc-btn', OcBtn);