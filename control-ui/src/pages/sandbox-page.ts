import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/page-header.js';
import '../components/oc-card.js';
import '../components/oc-btn.js';
import '../components/oc-toggle.js';
import '../components/oc-badge.js';

export class SandboxPage extends LitElement {
  createRenderRoot() { return this; }
  static styles = css`:host{display:block;}`;
  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _sandbox = {
    mode: 'landlock',
    networkRestrict: true,
    fileSystemReadonly: false,
    allowWritePaths: 'D:\\lxup\\workspace,D:\\lxup\\output',
    maxMemory: 2048,
    maxCpu: 80,
    timeout: 300,
    allowedDomains: 'api.openai.com,api.anthropic.com,github.com',
    enableAudit: true,
  };
  @state() _saved = false;

  _sandboxModes = [
    { value:'landlock', label:L('common.sandboxLandlock'), desc:'Linux kernel Landlock LSM — least-privilege filesystem access' },
    { value:'seatbelt', label:L('common.sandboxSeatbelt'), desc:'macOS Seatbelt sandbox — mandatory access control framework' },
    { value:'docker', label:L('common.sandboxDocker'), desc:'Full container isolation via Docker runtime' },
    { value:'none', label:L('common.sandboxNone'), desc:'⚠ No sandbox — process runs with full user permissions' },
  ];

  _save() {
    this._saved = true;
    setTimeout(() => { this._saved = false; this.requestUpdate(); }, 2000);
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:340px;">
          <oc-card heading="${L('common.sandboxMode')}">
            ${this._sandboxModes.map((m:any) => html`
              <div class="toggle-row" style="margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._sandbox.mode===m.value?'var(--accent-subtle)':'transparent'};border:1px solid ${this._sandbox.mode===m.value?'var(--accent)':'transparent'};">
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${m.label}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${m.desc}</div>
                </div>
                <input type="radio" name="sandbox_mode" ?checked=${this._sandbox.mode===m.value} @change=${() => { this._sandbox = {...this._sandbox, mode:m.value}; this.requestUpdate(); }} />
              </div>
            `)}
          </oc-card>

          <oc-card heading="Network & Filesystem" style="margin-top:16px;">
            <div class="toggle-row" style="margin-bottom:12px;">
              <div><div class="toggle-label">Network Restrict</div><div style="font-size:12px;color:var(--text-soft);">Block all outbound connections except allowlist</div></div>
              <oc-toggle ?checked=${this._sandbox.networkRestrict} @change=${() => { this._sandbox = {...this._sandbox, networkRestrict:!this._sandbox.networkRestrict}; this.requestUpdate(); }}></oc-toggle>
            </div>
            ${this._sandbox.networkRestrict ? html`
              <div class="form-group">
                <label class="form-label">Allowed Domains</label>
                <input class="form-input" .value=${this._sandbox.allowedDomains} @input=${(e:Event) => { this._sandbox = {...this._sandbox, allowedDomains:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
              </div>
            ` : ''}

            <div class="toggle-row" style="margin-bottom:12px;">
              <div><div class="toggle-label">Filesystem Read-only</div><div style="font-size:12px;color:var(--text-soft);">Prevent all file writes outside allowed paths</div></div>
              <oc-toggle ?checked=${this._sandbox.fileSystemReadonly} @change=${() => { this._sandbox = {...this._sandbox, fileSystemReadonly:!this._sandbox.fileSystemReadonly}; this.requestUpdate(); }}></oc-toggle>
            </div>
            <div class="form-group">
              <label class="form-label">Allow Write Paths</label>
              <input class="form-input" .value=${this._sandbox.allowWritePaths} @input=${(e:Event) => { this._sandbox = {...this._sandbox, allowWritePaths:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
          </oc-card>
        </div>

        <div style="flex:1;min-width:340px;">
          <oc-card heading="Resource Limits">
            <div class="form-group">
              <label class="form-label">Max Memory (MB)</label>
              <input class="form-input" type="number" .value=${String(this._sandbox.maxMemory)} @input=${(e:Event) => { this._sandbox = {...this._sandbox, maxMemory:Number((e.target as HTMLInputElement).value)}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">Max CPU (%)</label>
              <input class="form-input" type="number" .value=${String(this._sandbox.maxCpu)} @input=${(e:Event) => { this._sandbox = {...this._sandbox, maxCpu:Number((e.target as HTMLInputElement).value)}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">Timeout (seconds)</label>
              <input class="form-input" type="number" .value=${String(this._sandbox.timeout)} @input=${(e:Event) => { this._sandbox = {...this._sandbox, timeout:Number((e.target as HTMLInputElement).value)}; this.requestUpdate(); }} />
            </div>

            <div class="toggle-row" style="margin-top:16px;">
              <div><div class="toggle-label">Audit Logging</div><div style="font-size:12px;color:var(--text-soft);">Record all sandbox events to audit log</div></div>
              <oc-toggle ?checked=${this._sandbox.enableAudit} @change=${() => { this._sandbox = {...this._sandbox, enableAudit:!this._sandbox.enableAudit}; this.requestUpdate(); }}></oc-toggle>
            </div>
          </oc-card>

          <oc-card heading="Current Policy Summary" style="margin-top:16px;">
            <div class="stat-row">
              <span class="stat-row-label">Sandbox Engine</span>
              <span style="font-family:var(--font-mono);">${this._sandbox.mode}</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Network</span>
              <oc-badge variant=${this._sandbox.networkRestrict?'warning':'success'}>${this._sandbox.networkRestrict?'Restricted':'Open'}</oc-badge>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Filesystem</span>
              <oc-badge variant=${this._sandbox.fileSystemReadonly?'warning':'success'}>${this._sandbox.fileSystemReadonly?'Read-only':'Read/Write'}</oc-badge>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Memory Limit</span>
              <span>${this._sandbox.maxMemory} MB</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">CPU Limit</span>
              <span>${this._sandbox.maxCpu}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Timeout</span>
              <span>${this._sandbox.timeout}s</span>
            </div>
            <div class="stat-row">
              <span class="stat-row-label">Audit</span>
              <oc-badge variant=${this._sandbox.enableAudit?'success':'default'}>${this._sandbox.enableAudit?'Enabled':'Disabled'}</oc-badge>
            </div>
          </oc-card>
        </div>
      </div>

      <div class="page-actions" style="margin-top:20px;">
        <button class="btn-sm" @click=${this._save}>${this._saved ? '✓ ' + L('common.save') : L('common.save')}</button>
        <button class="btn-sm ghost">${L('common.resetDefaults')}</button>
      </div>
    `;
  }
}
customElements.define('sandbox-page', SandboxPage);
