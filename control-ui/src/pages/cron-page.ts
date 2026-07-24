import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import '../components/page-header.js';

/**
 * CronPage — AGENT 定时任务页
 *
 * 全部接网关真实 cron RPC（WS）：
 *   - cron.list    列表
 *   - cron.add     新建（name + schedule{kind:'cron',expr} + payload{kind:'systemEvent',text}）
 *   - cron.update  编辑 / 启停
 *   - cron.remove  删除
 *   - cron.run     立即触发一次
 *   - cron.status  调度器状态
 */

type CronJob = {
  id: string;
  name: string;
  enabled: boolean;
  schedule?: { kind?: string; expr?: string };
  payload?: { kind?: string; text?: string };
  sessionTarget?: string;
  nextRunAtMs?: number | null;
  createdAtMs?: number;
};

type ConfirmState = { title: string; message: string; onConfirm: () => void };

function fmtTime(ms: number | null | undefined): string {
  if (!ms) return '—';
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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
    .cron-toolbar__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cron-toolbar__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .cron-toolbar__actions .btn-primary:hover { background: var(--accent-hover); }

    .cron-status-line {
      font-size: 12px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-error {
      font-size: 12px; color: var(--danger); margin-bottom: 12px; word-break: break-all;
    }

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
      font-size: 13px; color: var(--text-soft); text-align: center; line-height: 1.6;
    }

    /* === cron cards === */
    .cron-list { display: flex; flex-direction: column; gap: 10px; }
    .cron-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 20px; box-shadow: var(--shadow-card);
    }
    .cron-card__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px; gap: 10px;
    }
    .cron-card__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 8px; min-width: 0;
    }
    .cron-card__schedule {
      font-size: 11px; font-family: var(--font-mono); color: var(--muted);
      background: var(--bg-muted); padding: 2px 8px; border-radius: var(--radius-sm); flex-shrink: 0;
    }
    .cron-card__desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 6px;
      white-space: pre-wrap; word-break: break-word;
    }
    .cron-card__next {
      font-size: 11px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-card__actions { display: flex; gap: 6px; }
    .cron-card__actions button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .cron-card__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .cron-card__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cron-card__actions .btn-danger { color: var(--danger); border-color: var(--danger); }
    .cron-card__actions .btn-danger:hover { background: var(--danger-subtle); }

    .cron-card__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; flex-shrink: 0;
    }
    .cron-card__badge.enabled { background: var(--success-subtle); color: var(--success); }
    .cron-card__badge.disabled { background: var(--bg-muted); color: var(--muted); }

    /* === dialog === */
    .cron-form .form-group { margin-bottom: 14px; }
    .cron-form .form-label { display: block; font-size: 12px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
    .cron-form .form-input {
      width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;
      box-sizing: border-box; transition: border-color var(--duration-fast);
    }
    .cron-form .form-input:focus { border-color: var(--accent); }
    .cron-form .form-input.mono { font-family: var(--font-mono); }
    .cron-form .form-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
    .cron-form textarea.form-input { resize: vertical; min-height: 70px; }

    .confirm-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .confirm-box {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 22px 24px; width: min(440px, calc(100vw - 40px)); box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }
    .confirm-box__title { font-size: 15px; font-weight: 700; color: var(--text-strong); margin-bottom: 10px; }
    .confirm-box__msg { font-size: 13px; color: var(--text-soft); line-height: 1.6; margin-bottom: 18px; }
    .confirm-box__actions { display: flex; justify-content: flex-end; gap: 8px; }
    .confirm-box__actions button {
      padding: 7px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: 1px solid var(--border); cursor: pointer; transition: all var(--duration-fast);
    }
    .confirm-box__actions .btn-cancel { background: transparent; color: var(--text-soft); }
    .confirm-box__actions .btn-cancel:hover { background: var(--bg-hover); color: var(--text); }
    .confirm-box__actions .btn-confirm { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }
    .confirm-box__actions .btn-danger { background: var(--danger); color: #fff; border-color: var(--danger); }
  `;

  @property({ type: String }) title = '';

  @state() _jobs: CronJob[] = [];
  @state() _loading = false;
  @state() _offline = false;
  @state() _error = '';
  @state() _schedulerEnabled: boolean | null = null;
  @state() _busyId: string | null = null;

  // 新建/编辑对话框
  @state() _dialogOpen = false;
  @state() _editingId: string | null = null;
  @state() _formName = '';
  @state() _formExpr = '';
  @state() _formText = '';
  @state() _formEnabled = true;
  @state() _confirm: ConfirmState | null = null;

  _storeUnsub: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe(snap => {
      const was = this._offline;
      this._offline = !snap.connected;
      if (snap.connected) this._load();
      else if (!was) { this._jobs = []; }
    });
    if (store.connected) this._load();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
  }

  // ── 数据 ──────────────────────────────────────────

  async _load() {
    const store = getSharedStore();
    if (!store.connected) { this._offline = true; return; }
    this._loading = true;
    try {
      const [listRes, statusRes] = await Promise.all([
        store.request<any>('cron.list', {}),
        store.request<any>('cron.status', {}).catch(() => null),
      ]);
      this._jobs = (listRes?.jobs || []) as CronJob[];
      this._schedulerEnabled = statusRes ? !!statusRes.enabled : null;
      this._offline = false;
      this._error = '';
    } catch (e) {
      this._error = e instanceof Error ? e.message : String(e);
    } finally {
      this._loading = false;
    }
  }

  // ── 对话框 ────────────────────────────────────────

  _openCreate() {
    this._editingId = null;
    this._formName = '';
    this._formExpr = '';
    this._formText = '';
    this._formEnabled = true;
    this._dialogOpen = true;
  }

  _openEdit(job: CronJob) {
    this._editingId = job.id;
    this._formName = job.name;
    this._formExpr = job.schedule?.expr || '';
    this._formText = job.payload?.text || '';
    this._formEnabled = job.enabled;
    this._dialogOpen = true;
  }

  _closeDialog() { this._dialogOpen = false; }

  async _submitDialog() {
    const name = this._formName.trim();
    const expr = this._formExpr.trim();
    if (!name || !expr) return;
    const store = getSharedStore();
    const payload = {
      name,
      enabled: this._formEnabled,
      schedule: { kind: 'cron', expr },
      payload: { kind: 'systemEvent', text: this._formText.trim() || name },
    };
    try {
      if (this._editingId) {
        await store.request('cron.update', { id: this._editingId, ...payload });
      } else {
        await store.request('cron.add', payload);
      }
      this._dialogOpen = false;
      this._error = '';
      await this._load();
    } catch (e) {
      this._error = this._errMsg(e);
    }
  }

  // ── 任务操作 ──────────────────────────────────────

  async _toggleEnabled(job: CronJob) {
    await this._runJobAction(job.id, () =>
      getSharedStore().request('cron.update', { id: job.id, enabled: !job.enabled }));
  }

  async _runNow(job: CronJob) {
    await this._runJobAction(job.id, () =>
      getSharedStore().request('cron.run', { id: job.id }));
  }

  _askDelete(job: CronJob) {
    this._confirm = {
      title: L('cron.deleteTitle'),
      message: L('cron.deleteConfirm', { name: job.name }),
      onConfirm: async () => {
        await this._runJobAction(job.id, () =>
          getSharedStore().request('cron.remove', { id: job.id }));
      },
    };
  }

  async _runJobAction(id: string, fn: () => Promise<unknown>) {
    this._busyId = id;
    try {
      await fn();
      this._error = '';
      await this._load();
    } catch (e) {
      this._error = this._errMsg(e);
    } finally {
      this._busyId = null;
    }
  }

  _closeConfirm() { this._confirm = null; }
  async _runConfirm() {
    const fn = this._confirm?.onConfirm;
    this._confirm = null;
    if (fn) await fn();
  }

  _errMsg(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    try {
      const j = JSON.parse(raw);
      if (j?.message) return String(j.message);
    } catch { /* 非 JSON */ }
    return raw;
  }

  // ── 渲染 ──────────────────────────────────────────

  render() {
    const enabledCount = this._jobs.filter(j => j.enabled).length;
    const subtitleStr = this._offline
      ? L('cron.gatewayNotRunning')
      : L('cron.taskCount', { total: this._jobs.length }) + ' · ' + L('cron.runningCount', { count: enabledCount });

    return html`
      <page-header title=${this.title} subtitle=${subtitleStr}>
        <div class="cron-toolbar__actions" style="margin:0;">
          <button ?disabled=${this._loading || this._offline} @click=${() => this._load()}>${L('common.refresh')}</button>
          <button class="btn-primary" ?disabled=${this._offline} @click=${() => this._openCreate()}>+ ${L('cron.createTask')}</button>
        </div>
      </page-header>
      <div class="cron-page">

        ${this._schedulerEnabled === false ? html`
          <div class="cron-status-line">⚠ ${L('cron.schedulerDisabled')}</div>
        ` : ''}
        ${this._error ? html`<div class="cron-error">✗ ${this._error}</div>` : ''}

        ${this._offline ? html`
          <div class="cron-empty">
            <div class="cron-empty__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="cron-empty__text">${L('cron.gatewayNotRunning')}</div>
          </div>
        ` : this._jobs.length > 0 ? html`
          <div class="cron-list">
            ${this._jobs.map(job => html`
              <div class="cron-card">
                <div class="cron-card__header">
                  <div class="cron-card__name">
                    ${job.name}
                    <span class="cron-card__badge ${job.enabled ? 'enabled' : 'disabled'}">
                      ${job.enabled ? L('common.enabled') : L('common.disabled')}
                    </span>
                  </div>
                  <span class="cron-card__schedule">${job.schedule?.expr || '—'}</span>
                </div>
                ${job.payload?.text ? html`<div class="cron-card__desc">${job.payload.text}</div>` : ''}
                <div class="cron-card__next">${L('cron.nextRun')}: ${job.enabled ? fmtTime(job.nextRunAtMs) : '—'}</div>
                <div class="cron-card__actions">
                  <button ?disabled=${this._busyId === job.id} @click=${() => this._openEdit(job)}>${L('common.edit')}</button>
                  <button ?disabled=${this._busyId === job.id || !job.enabled} @click=${() => this._runNow(job)}>${L('common.runNow')}</button>
                  <button ?disabled=${this._busyId === job.id} @click=${() => this._toggleEnabled(job)}>
                    ${job.enabled ? L('common.disable') : L('common.enable')}
                  </button>
                  <button class="btn-danger" ?disabled=${this._busyId === job.id} @click=${() => this._askDelete(job)}>${L('common.delete')}</button>
                </div>
              </div>
            `)}
          </div>
        ` : html`
          <div class="cron-empty">
            <div class="cron-empty__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="cron-empty__text">${this._loading ? L('common.loading') : L('cron.noTasks')}</div>
          </div>
        `}

      </div>

      <!-- 新建/编辑对话框 -->
      ${this._dialogOpen ? html`
        <div class="confirm-backdrop" @click=${this._closeDialog}>
          <div class="confirm-box" style="width:min(500px,calc(100vw - 40px));" @click=${(e: Event) => e.stopPropagation()}>
            <div class="confirm-box__title">${this._editingId ? L('cron.editTitle') : L('cron.createTask')}</div>
            <div class="cron-form">
              <div class="form-group">
                <label class="form-label">${L('cron.taskName')}</label>
                <input class="form-input" type="text" .value=${this._formName}
                  @input=${(e: Event) => { this._formName = (e.target as HTMLInputElement).value; }} />
              </div>
              <div class="form-group">
                <label class="form-label">${L('cron.cronExpr')}</label>
                <input class="form-input mono" type="text" placeholder="0 7 * * *" .value=${this._formExpr}
                  @input=${(e: Event) => { this._formExpr = (e.target as HTMLInputElement).value; }} />
                <div class="form-hint">${L('cron.cronExprHint')}</div>
              </div>
              <div class="form-group">
                <label class="form-label">${L('cron.taskMessage')}</label>
                <textarea class="form-input" .value=${this._formText}
                  @input=${(e: Event) => { this._formText = (e.target as HTMLTextAreaElement).value; }}></textarea>
                <div class="form-hint">${L('cron.taskMessageHint')}</div>
              </div>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);cursor:pointer;">
                  <input type="checkbox" .checked=${this._formEnabled}
                    @change=${(e: Event) => { this._formEnabled = (e.target as HTMLInputElement).checked; }} />
                  ${L('common.enabled')}
                </label>
              </div>
            </div>
            ${this._error ? html`<div class="cron-error">✗ ${this._error}</div>` : ''}
            <div class="confirm-box__actions">
              <button class="btn-cancel" @click=${this._closeDialog}>${L('models.cancel')}</button>
              <button class="btn-confirm" ?disabled=${!this._formName.trim() || !this._formExpr.trim()} @click=${() => this._submitDialog()}>${L('models.confirm')}</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- 删除确认 -->
      ${this._confirm ? html`
        <div class="confirm-backdrop" @click=${this._closeConfirm}>
          <div class="confirm-box" @click=${(e: Event) => e.stopPropagation()}>
            <div class="confirm-box__title">${this._confirm.title}</div>
            <div class="confirm-box__msg">${this._confirm.message}</div>
            <div class="confirm-box__actions">
              <button class="btn-cancel" @click=${this._closeConfirm}>${L('models.cancel')}</button>
              <button class="btn-danger" @click=${() => this._runConfirm()}>${L('common.delete')}</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('cron-page', CronPage);
