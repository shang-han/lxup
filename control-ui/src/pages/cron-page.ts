import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

export class CronPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .cron-page { width: 100%; }

    /* === actions === */
    .cron-toolbar__actions { display: flex; gap: 8px; }
    .cron-toolbar__actions button {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .cron-toolbar__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .cron-toolbar__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .cron-toolbar__actions .btn-primary:hover { background: var(--accent-hover); }

    /* === empty state === */
    .cron-empty {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 200px; padding: 48px 24px;
    }
    .cron-empty__icon {
      width: 40px; height: 40px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-empty__text {
      font-size: 13px; color: var(--text-soft);
    }

    /* === cron cards (when tasks exist) === */
    .cron-list { display: flex; flex-direction: column; gap: 10px; }
    .cron-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 20px; box-shadow: var(--shadow-card);
    }
    .cron-card__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px;
    }
    .cron-card__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 8px;
    }
    .cron-card__schedule {
      font-size: 11px; font-family: var(--font-mono); color: var(--muted);
      background: var(--bg-muted); padding: 2px 8px; border-radius: var(--radius-sm);
    }
    .cron-card__desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 12px;
    }
    .cron-card__actions { display: flex; gap: 6px; }
    .cron-card__actions button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .cron-card__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .cron-card__actions .btn-danger { color: var(--danger); border-color: var(--danger); }
    .cron-card__actions .btn-danger:hover { background: var(--danger-subtle); }

    .cron-card__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600;
    }
    .cron-card__badge.enabled { background: var(--success-subtle); color: var(--success); }
    .cron-card__badge.disabled { background: var(--bg-muted); color: var(--muted); }
  `;

  @property({ type: String }) title = '';
  @property({ type: Array }) cronJobs = [];

  @state() _tasks = [
    { id: '1', name: 'Morning Brief', schedule: '0 7 * * *', enabled: true, desc: 'Daily morning summary' },
    { id: '2', name: 'Health Check', schedule: '*/30 * * * *', enabled: true, desc: 'Gateway status check' },
  ];

  render() {
    const activeCount = this._tasks.filter(t => t.enabled).length;
    const subtitleStr = `${this._tasks.length} 个任务 · ${activeCount} 运行中`;

    return html`
      <page-header title=${this.title} subtitle=${subtitleStr}>
        <div class="cron-toolbar__actions" style="margin:0;">
          <button>${L('common.refresh')}</button>
          <button class="btn-primary">+ ${L('cron.createTask')}</button>
        </div>
      </page-header>
      <div class="cron-page">

        <!-- Task list or empty state -->
        ${this._tasks.length > 0 ? html`
          <div class="cron-list">
            ${this._tasks.map(t => html`
              <div class="cron-card">
                <div class="cron-card__header">
                  <div class="cron-card__name">
                    ${t.name}
                    <span class="cron-card__badge ${t.enabled ? 'enabled' : 'disabled'}">
                      ${t.enabled ? L('common.enabled') : L('common.disabled')}
                    </span>
                  </div>
                  <span class="cron-card__schedule">${t.schedule}</span>
                </div>
                <div class="cron-card__desc">${t.desc}</div>
                <div class="cron-card__actions">
                  <button>${L('common.edit')}</button>
                  <button>${L('common.runNow')}</button>
                  <button class="btn-danger">${L('common.delete')}</button>
                </div>
              </div>
            `)}
          </div>
        ` : html`
          <div class="cron-empty">
            <div class="cron-empty__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="cron-empty__text">Gateway 未运行，请先启动</div>
          </div>
        `}

      </div>
    `;
  }
}

customElements.define('cron-page', CronPage);
