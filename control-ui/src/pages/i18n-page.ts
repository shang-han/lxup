import { LitElement } from 'lit';
import { i18n } from '../i18n/index.js';

/**
 * Base page class that auto-subscribes to i18n locale changes.
 * All pages should extend this instead of LitElement directly
 * to ensure language switching triggers re-render.
 */
export class I18nPage extends LitElement {
  protected _unsubI18n: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }
}
