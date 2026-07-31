import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { fetchTimeout } from '../utils/net.js';
import '../components/page-header.js';
import '../components/oc-card.js';
import '../components/oc-badge.js';

/**
 * SandboxPage — Codex 沙箱与审批策略
 *
 * 接 Sidecar :7889 真实配置（读写 codex-home/config.toml）：
 *   GET  /api/codex/config   → { model, approvalPolicy, sandboxMode, apiKey(打码), workspace }
 *   POST /api/codex/config   → 原样回传各字段；apiKey 为打码值时服务端保留原 Key
 *
 * Codex 真实的沙箱模型只有两维：
 *   sandboxMode   : read-only / workspace-write / danger-full-access
 *   approvalPolicy: untrusted / on-request / never
 */

type CodexConfig = {
  model: string;
  approvalPolicy: string;
  sandboxMode: string;
  apiKey: string;
  workspace: string;
};

export class SandboxPage extends LitElement {
  createRenderRoot() { return this; }
  static styles = css`:host{display:block;}`;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _config: CodexConfig = { model: '', approvalPolicy: '', sandboxMode: '', apiKey: '', workspace: '' };
  @state() _loaded = false;
  @state() _offline = false;
  @state() _saving = false;
  @state() _msg = '';
  @state() _msgCls = '';

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  get _sandboxModes() {
    return [
      { value: 'read-only', label: L('sandbox.readOnly'), desc: L('sandbox.readOnlyDesc') },
      { value: 'workspace-write', label: L('sandbox.workspaceWrite'), desc: L('sandbox.workspaceWriteDesc') },
      { value: 'danger-full-access', label: L('sandbox.dangerFull'), desc: L('sandbox.dangerFullDesc') },
    ];
  }

  get _approvalPolicies() {
    return [
      { value: 'untrusted', label: L('sandbox.untrusted'), desc: L('sandbox.untrustedDesc') },
      { value: 'on-request', label: L('sandbox.onRequest'), desc: L('sandbox.onRequestDesc') },
      { value: 'never', label: L('sandbox.never'), desc: L('sandbox.neverDesc') },
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  async _load() {
    this._msg = '';
    this._msgCls = '';
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/codex/config`, {}, 5000);
      const j = await r.json();
      this._config = {
        model: String(j.model ?? ''),
        approvalPolicy: String(j.approvalPolicy ?? ''),
        sandboxMode: String(j.sandboxMode ?? ''),
        apiKey: String(j.apiKey ?? ''),
        workspace: String(j.workspace ?? ''),
      };
      this._loaded = true;
      this._offline = false;
    } catch {
      this._offline = true;
    }
  }

  async _save() {
    if (this._saving) return;
    this._saving = true;
    this._msg = '';
    this._msgCls = '';
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/codex/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this._config }),
      }, 8000);
      const j = await r.json();
      if (j?.success === false) {
        this._msg = j.message || 'Save failed';
        this._msgCls = 'err';
      } else {
        this._msg = L('sandbox.saved');
        this._msgCls = 'ok';
        await this._load();
      }
    } catch (e) {
      this._msg = e instanceof Error ? e.message : String(e);
      this._msgCls = 'err';
    } finally {
      this._saving = false;
    }
  }

  _setMode(mode: string) {
    this._config = { ...this._config, sandboxMode: mode };
  }

  _setPolicy(policy: string) {
    this._config = { ...this._config, approvalPolicy: policy };
  }

  render() {
    const isDanger = this._config.sandboxMode === 'danger-full-access';
    const isNever = this._config.approvalPolicy === 'never';

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      ${this._offline ? html`
        <div style="margin-bottom:16px;padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--card);color:var(--warn);font-size:13px;">
          ⚠ ${L('sandbox.sidecarOffline')}
        </div>
      ` : ''}

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:340px;">
          <oc-card heading="${L('sandbox.modeTitle')}">
            ${this._sandboxModes.map((m: any) => html`
              <div class="toggle-row" style="margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.sandboxMode === m.value ? 'var(--accent-subtle)' : 'transparent'};border:1px solid ${this._config.sandboxMode === m.value ? 'var(--accent)' : 'transparent'};">
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${m.label}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${m.desc}</div>
                </div>
                <input type="radio" name="sandbox_mode" ?checked=${this._config.sandboxMode === m.value}
                  @change=${() => this._setMode(m.value)} />
              </div>
            `)}
          </oc-card>

          <oc-card heading="${L('sandbox.approvalTitle')}" style="margin-top:16px;">
            ${this._approvalPolicies.map((p: any) => html`
              <div class="toggle-row" style="margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.approvalPolicy === p.value ? 'var(--accent-subtle)' : 'transparent'};border:1px solid ${this._config.approvalPolicy === p.value ? 'var(--accent)' : 'transparent'};">
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${p.label}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${p.desc}</div>
                </div>
                <input type="radio" name="approval_policy" ?checked=${this._config.approvalPolicy === p.value}
                  @change=${() => this._setPolicy(p.value)} />
              </div>
            `)}
          </oc-card>
        </div>

        <div style="flex:1;min-width:340px;">
          <oc-card heading="${L('sandbox.currentTitle')}">
            ${!this._loaded ? html`<div style="font-size:13px;color:var(--muted);">${this._offline ? '' : L('sandbox.loading')}</div>` : html`
              <div class="stat-row">
                <span class="stat-row-label">${L('sandbox.modeTitle')}</span>
                <span style="font-family:var(--font-mono);">${this._config.sandboxMode || '—'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${L('sandbox.approvalTitle')}</span>
                <span style="font-family:var(--font-mono);">${this._config.approvalPolicy || '—'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${L('sandbox.model')}</span>
                <span style="font-family:var(--font-mono);">${this._config.model || '—'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${L('sandbox.workspace')}</span>
                <span style="font-family:var(--font-mono);word-break:break-all;">${this._config.workspace || '—'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${L('sandbox.apiKey')}</span>
                <span style="font-family:var(--font-mono);">${this._config.apiKey || '—'}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${L('common.status')}</span>
                ${isDanger || isNever
                  ? html`<oc-badge variant="danger">${isDanger ? L('sandbox.dangerFull') : L('sandbox.never')}</oc-badge>`
                  : html`<oc-badge variant="success">${L('common.ok')}</oc-badge>`}
              </div>
            `}
          </oc-card>

          <div class="page-actions" style="margin-top:16px;display:flex;align-items:center;gap:10px;">
            <button class="btn-sm" ?disabled=${this._saving || this._offline} @click=${() => this._save()}>
              ${this._saving ? L('models.saving') : L('common.save')}
            </button>
            <button class="btn-sm ghost" ?disabled=${this._offline} @click=${() => this._load()}>${L('common.refresh')}</button>
            ${this._msg ? html`<span style="font-size:12px;color:${this._msgCls === 'ok' ? 'var(--success)' : 'var(--danger)'};">${this._msg}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}
customElements.define('sandbox-page', SandboxPage);
