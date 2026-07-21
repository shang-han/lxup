import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class OcToast extends LitElement {
  static styles = css`
    :host {
      position: fixed; top: 72px; left: 50%; z-index: 9999;
      transform: translateX(-50%) translateY(-20px);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    :host(.visible) {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .toast {
      padding: 8px 20px; border-radius: var(--radius-md);
      font-size: 13px; font-weight: 500;
      background: var(--accent-subtle); border: 1px solid var(--accent);
      color: var(--text); white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
  `;

  @state() _message = '';
  _timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string) {
    if (this._timer) clearTimeout(this._timer);
    this._message = message;
    this.classList.add('visible');
    this.requestUpdate();
    this._timer = setTimeout(() => {
      this.classList.remove('visible');
      this.requestUpdate();
      this._timer = null;
    }, 2000);
  }

  render() {
    return html`<div class="toast">${this._message}</div>`;
  }
}

customElements.define('oc-toast', OcToast);
