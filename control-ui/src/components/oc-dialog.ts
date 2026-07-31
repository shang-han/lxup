import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

/**
 * A centered modal dialog with backdrop overlay.
 *
 * Usage:
 *   <oc-dialog .open=${true} @close=${() => this._dialogOpen = false}>
 *     <span slot="title">Dialog Title</span>
 *     <div>Dialog content goes here</div>
 *     <div slot="footer">
 *       <button @click=${() => this._dialogOpen = false}>Cancel</button>
 *       <button @click=${this._confirm}>Confirm</button>
 *     </div>
 *   </oc-dialog>
 */
export class OcDialog extends LitElement {
  static styles = css`
    :host { display: contents; }

    .dialog-backdrop {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }
    .dialog-backdrop.open { opacity: 1; visibility: visible; }

    .dialog {
      background: var(--card); border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 480px; max-width: 90vw; max-height: 85vh;
      display: flex; flex-direction: column;
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }
    .dialog-backdrop.open .dialog { transform: scale(1); }

    .dialog__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 0; flex-shrink: 0;
    }
    .dialog__title {
      font-size: 16px; font-weight: 700; color: var(--text-strong);
    }
    .dialog__close {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .dialog__close:hover { background: var(--bg-hover); color: var(--text); }

    .dialog__body {
      padding: 16px 22px; overflow-y: auto; flex: 1;
    }

    .dialog__footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 22px 18px; flex-shrink: 0;
      border-top: 1px solid var(--border);
    }
    .dialog__footer button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .dialog__footer .btn-cancel {
      background: transparent; color: var(--text-soft);
    }
    .dialog__footer .btn-cancel:hover { background: var(--bg-hover); color: var(--text); }
    .dialog__footer .btn-confirm {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .dialog__footer .btn-confirm:hover { background: var(--accent-hover); }
  `;

  @property({ type: Boolean }) open = false;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._onKeydown);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeydown);
  }

  _onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) this._close();
  };

  _close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  _stopPropagation(e: Event) {
    e.stopPropagation();
  }

  render() {
    return html`
      <div class="dialog-backdrop ${this.open ? 'open' : ''}" @click=${this._close}>
        <div class="dialog" @click=${this._stopPropagation}>
          <div class="dialog__header">
            <div class="dialog__title"><slot name="title"></slot></div>
            <button class="dialog__close" @click=${this._close} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="dialog__body"><slot></slot></div>
          <div class="dialog__footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `;
  }
}

customElements.define('oc-dialog', OcDialog);
