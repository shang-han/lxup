import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getStatus, getConfig, saveConfig } from '../services/codex-client.js';
import '../components/page-header.js';
import '../components/oc-card.js';
import '../components/oc-btn.js';
import '../components/oc-badge.js';

/**
 * Codex 引擎页。
 *
 * Codex 与 OpenClaw / Hermes 不同——它只是一个 CLI（按需运行、跑完即退），
 * 不是常驻网关服务。配置经 Sidecar 写入便携家目录 runtime/codex-home：
 * config.toml（模型/审批策略/沙箱档位）+ auth.json（OPENAI_API_KEY）。
 * 实时聊天在「聊天」页（经 Sidecar 每轮拉起 codex exec --json 子进程）。
 */
export class CodexPage extends LitElement {
  createRenderRoot() { return this; }
  static styles = css`:host{display:block;}`;
  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _config = {
    workspace: '',
    apiKey: '',
    model: '',
    approval: 'on-failure',
    sandbox: 'workspace-write',
  };
  @state() _status = { installed: false, version: '', hasKey: false, loaded: false };
  @state() _saving = false;
  @state() _saveMsg = '';

  connectedCallback() {
    super.connectedCallback();
    void this._loadAll();
  }

  async _loadAll() {
    try {
      const st = await getStatus();
      this._status = { installed: !!st.installed, version: st.version || '', hasKey: !!st.hasKey, loaded: true };
    } catch {
      this._status = { installed: false, version: '', hasKey: false, loaded: true };
    }
    try {
      const cfg = await getConfig();
      this._config = {
        workspace: cfg.workspace || '',
        apiKey: cfg.apiKey || '',
        model: cfg.model || '',
        approval: cfg.approvalPolicy || 'on-failure',
        sandbox: cfg.sandboxMode || 'workspace-write',
      };
    } catch { /* Sidecar 不可达时保留默认值 */ }
    this.requestUpdate();
  }

  _approvalModes() {
    return [
      { value:'untrusted', label:L('common.approvalUntrusted') },
      { value:'on-failure', label:L('common.approvalOnFailure') },
      { value:'on-request', label:L('common.approvalOnRequest') },
      { value:'never', label:L('common.approvalNever') },
    ];
  }

  async _save() {
    this._saving = true;
    this._saveMsg = '';
    try {
      const r = await saveConfig({
        workspace: this._config.workspace,
        apiKey: this._config.apiKey,
        model: this._config.model,
        approvalPolicy: this._config.approval,
        sandboxMode: this._config.sandbox,
      });
      if (r.success) {
        this._saveMsg = '✓ ' + L('common.save');
        void this._loadAll();
      } else {
        this._saveMsg = '✗ ' + (r.message || 'error');
      }
    } catch (e) {
      this._saveMsg = '✗ ' + (e instanceof Error ? e.message : String(e));
    }
    this._saving = false;
    this.requestUpdate();
    setTimeout(() => { this._saveMsg = ''; this.requestUpdate(); }, 3000);
  }

  _resetDefaults() {
    this._config = { workspace: 'D:\\lxup', apiKey: this._config.apiKey, model: '', approval: 'on-failure', sandbox: 'workspace-write' };
    this.requestUpdate();
  }

  render() {
    const st = this._status;
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      ${st.loaded && !st.installed ? html`
        <oc-card heading="${L('common.codexNotInstalled')}">
          <p style="font-size:13px;color:var(--warn);margin:0 0 8px;">${L('common.codexNotInstalledDesc')}</p>
          <code style="font-size:12px;">bootstrap-codex.bat</code>
        </oc-card>
        <div style="height:16px;"></div>
      ` : ''}

      <div class="page-toolbar-lg">
        <span class="text-soft text-base">
          ${st.installed ? html`<oc-badge variant="success">${st.version || 'Codex CLI'}</oc-badge>` : ''}
          ${st.installed && !st.hasKey ? html` <oc-badge variant="warning">${L('common.codexNoKey')}</oc-badge>` : ''}
          ${st.installed && st.hasKey ? html` <oc-badge variant="success">${L('common.codexHasKey')}</oc-badge>` : ''}
        </span>
        <div class="page-actions">
          <button class="btn-sm" ?disabled=${this._saving} @click=${this._save}>${this._saveMsg || L('common.save')}</button>
          <button class="btn-sm ghost" @click=${this._resetDefaults}>${L('common.resetDefaults')}</button>
        </div>
      </div>

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:320px;">
          <oc-card heading="Codex CLI ${L('common.config')}">
            <p style="font-size:12px;color:var(--text-soft);margin:0 0 16px;line-height:1.6;">${L('common.codexConfigHint')}</p>
            <div class="form-group">
              <label class="form-label">${L('common.workspaceDir')}</label>
              <input class="form-input" .value=${this._config.workspace} placeholder="D:\\lxup" @input=${(e:Event) => { this._config = {...this._config, workspace:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.apiKey')}</label>
              <input class="form-input" type="password" .value=${this._config.apiKey} placeholder="sk-... (OPENAI_API_KEY)" @input=${(e:Event) => { this._config = {...this._config, apiKey:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.defaultModel')}</label>
              <input class="form-input" .value=${this._config.model} placeholder="gpt-5-codex" @input=${(e:Event) => { this._config = {...this._config, model:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.sandboxMode')}</label>
              <select class="form-input" .value=${this._config.sandbox} @change=${(e:Event) => { this._config = {...this._config, sandbox:(e.target as HTMLSelectElement).value}; this.requestUpdate(); }}>
                <option value="read-only">read-only</option>
                <option value="workspace-write">workspace-write</option>
                <option value="danger-full-access">danger-full-access</option>
              </select>
            </div>
          </oc-card>
        </div>

        <div style="flex:1;min-width:320px;">
          <oc-card heading="${L('common.approvalPolicy')}">
            ${this._approvalModes().map((m:any) => html`
              <div class="toggle-row" style="margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.approval===m.value?'var(--accent-subtle)':'transparent'};border:1px solid ${this._config.approval===m.value?'var(--accent)':'transparent'};">
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:500;color:var(--text);font-family:var(--font-mono);">${m.value}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${m.label}</div>
                </div>
                <input type="radio" name="approval_policy" ?checked=${this._config.approval===m.value} @change=${() => { this._config = {...this._config, approval:m.value}; this.requestUpdate(); }} />
              </div>
            `)}
          </oc-card>
        </div>
      </div>
    `;
  }
}
customElements.define('codex-page', CodexPage);
