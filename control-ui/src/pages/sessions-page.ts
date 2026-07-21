import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';

export class SessionsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .sessions-page { width: 100%; }

    /* === header card === */
    .sessions-header-card {
      background: var(--card);
      border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 20px 24px; margin-bottom: 16px;
    }
    .sessions-header-card__top {
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .sessions-header-card__title {
      font-size: 24px; font-weight: 700; color: var(--text-strong);
      letter-spacing: -0.02em; margin-bottom: 6px;
    }
    .sessions-header-card__subtitle {
      font-size: 13px; color: var(--text-soft);
    }
    .sessions-header-card__actions {
      display: flex; gap: 8px; align-items: center;
    }
    .sessions-header-card__actions select,
    .sessions-header-card__actions button {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--card); color: var(--text-soft); transition: all var(--duration-fast);
    }
    .sessions-header-card__actions select:hover,
    .sessions-header-card__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .sessions-header-card__actions select {
      padding-right: 28px; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 10px center;
    }

    /* === stats === */
    .sessions-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;
    }
    .sessions-stat {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card);
    }
    .sessions-stat__label {
      font-size: 11px; color: var(--muted); margin-bottom: 6px; letter-spacing: 0.02em;
    }
    .sessions-stat__value {
      font-size: 24px; font-weight: 700; color: var(--text-strong);
    }

    /* === main layout === */
    .sessions-main {
      display: grid; grid-template-columns: 380px 1fr; gap: 16px;
    }
    @media (max-width: 900px) { .sessions-main { grid-template-columns: 1fr; } }

    /* === list panel === */
    .sessions-list-panel {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .sessions-list-toolbar {
      padding: 14px 16px; border-bottom: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 10px;
    }
    .sessions-list-toolbar__row {
      display: flex; gap: 8px; align-items: center;
    }
    .sessions-list-toolbar__search {
      flex: 1; display: flex; align-items: center; gap: 8px;
      padding: 6px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .sessions-list-toolbar__search svg { color: var(--muted); flex-shrink: 0; }
    .sessions-list-toolbar__search input {
      flex: 1; background: transparent; border: none; color: var(--text);
      font-size: 13px; outline: none;
    }
    .sessions-list-toolbar__search input::placeholder { color: var(--muted); }
    .sessions-list-toolbar select {
      padding: 6px 28px 6px 10px; border-radius: var(--radius-sm); font-size: 12px;
      border: 1px solid var(--border); cursor: pointer; background: var(--input);
      color: var(--text-soft); appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 8px center;
    }
    .sessions-list-toolbar__actions {
      display: flex; justify-content: space-between; align-items: center;
    }
    .sessions-list-toolbar__actions button {
      padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .sessions-list-toolbar__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .sessions-list-toolbar__actions .btn-danger {
      color: var(--danger); border-color: var(--danger);
    }
    .sessions-list-toolbar__actions .btn-danger:hover { background: var(--danger-subtle); }

    .sessions-list-body {
      min-height: 320px; max-height: 480px; overflow-y: auto;
      display: flex; align-items: center; justify-content: center;
    }
    .sessions-empty {
      text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px;
    }

    /* === detail panel === */
    .sessions-detail-panel {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: flex; align-items: center; justify-content: center;
      min-height: 400px;
    }
    .sessions-detail-empty {
      text-align: center; padding: 40px 24px;
    }
    .sessions-detail-empty__icon {
      width: 48px; height: 48px; margin: 0 auto 12px; color: var(--muted);
    }
    .sessions-detail-empty__title {
      font-size: 15px; font-weight: 600; color: var(--text-strong); margin-bottom: 6px;
    }
    .sessions-detail-empty__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.5;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _filter = 'default · active';
  @state() _sourceFilter = 'all';
  @state() _search = '';

  render() {
    return html`
      <div class="sessions-page">

        <!-- Header card -->
        <div class="sessions-header-card">
          <div class="sessions-header-card__top">
            <div>
              <div class="sessions-header-card__title">${L('tabs.sessions')}</div>
              <div class="sessions-header-card__subtitle">${L('sessions.subtitle')}</div>
            </div>
            <div class="sessions-header-card__actions">
              <select .value=${this._filter} @change=${(e: Event) => { this._filter = (e.target as HTMLSelectElement).value; }}>
                <option value="default · active">default · active</option>
                <option value="default · all">default · all</option>
              </select>
              <button>${L('common.refresh')}</button>
              <button>${L('sessions.addSession')}</button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="sessions-stats">
          <div class="sessions-stat">
            <div class="sessions-stat__label">${L('sessions.allSessions')}</div>
            <div class="sessions-stat__value">0</div>
          </div>
          <div class="sessions-stat">
            <div class="sessions-stat__label">${L('sessions.currentlyShown')}</div>
            <div class="sessions-stat__value">0</div>
          </div>
          <div class="sessions-stat">
            <div class="sessions-stat__label">PROFILES</div>
            <div class="sessions-stat__value">1</div>
          </div>
          <div class="sessions-stat">
            <div class="sessions-stat__label">${L('sessions.selected')}</div>
            <div class="sessions-stat__value">0</div>
          </div>
        </div>

        <!-- Main layout -->
        <div class="sessions-main">
          <!-- List panel -->
          <div class="sessions-list-panel">
            <div class="sessions-list-toolbar">
              <div class="sessions-list-toolbar__row">
                <div class="sessions-list-toolbar__search">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" .value=${this._search}
                    @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
                    placeholder="${L('sessions.searchPlaceholder')}"
                  />
                </div>
                <select .value=${this._sourceFilter} @change=${(e: Event) => { this._sourceFilter = (e.target as HTMLSelectElement).value; }}>
                  <option value="all">${L('sessions.allSources')}</option>
                </select>
              </div>
              <div class="sessions-list-toolbar__actions">
                <button>${L('sessions.selectAll')}</button>
                <button class="btn-danger">${L('sessions.batchDelete')}</button>
              </div>
            </div>
            <div class="sessions-list-body">
              <div class="sessions-empty">${L('sessions.noMatch')}</div>
            </div>
          </div>

          <!-- Detail panel -->
          <div class="sessions-detail-panel">
            <div class="sessions-detail-empty">
              <div class="sessions-detail-empty__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="sessions-detail-empty__title">${L('sessions.selectSession')}</div>
              <div class="sessions-detail-empty__desc">${L('sessions.selectSessionDesc')}</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}

customElements.define('sessions-page', SessionsPage);
