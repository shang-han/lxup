import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/page-header.js';
import '../components/oc-card.js';
import '../components/oc-btn.js';
import '../components/oc-badge.js';
import '../components/oc-toggle.js';
import '../components/oc-stat-card.js';

export class CodexPage extends LitElement {
  createRenderRoot() { return this; }
  static styles = css`:host{display:block;}`;
  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _processStatus: 'running' | 'stopped' = 'stopped';
  @state() _pid: number | null = null;
  @state() _uptime = '--';
  @state() _config = {
    nodePath: 'C:\\Program Files\\nodejs\\node.exe',
    workspace: 'D:\\lxup',
    sandbox: 'landlock',
    apiKey: 'sk-••••••••••••••••••••••••',
    model: 'gpt-4.2',
    extraArgs: '--stdio-rpc --max-tokens 8192',
  };
  @state() _toolWhitelist = [
    { name:'file_read', desc:'Read files from workspace', enabled:true },
    { name:'file_write', desc:'Write files to workspace', enabled:true },
    { name:'shell_exec', desc:'Execute shell commands', enabled:true },
    { name:'web_fetch', desc:'Fetch web pages', enabled:true },
    { name:'web_search', desc:'Search the internet', enabled:false },
    { name:'browser', desc:'Control headless browser', enabled:false },
    { name:'memory_read', desc:'Read from memory store', enabled:true },
    { name:'memory_write', desc:'Write to memory store', enabled:true },
    { name:'git', desc:'Git operations', enabled:true },
    { name:'package_install', desc:'Install npm/pip packages', enabled:false },
  ];
  @state() _outputLog: Array<{ts:string;level:string;msg:string}> = [
    { ts:'--', level:'info', msg:L('common.noOutput') },
  ];

  _startProcess() {
    this._processStatus = 'running';
    this._pid = Math.floor(Math.random() * 9000) + 40000;
    this._uptime = '0s';
    this._outputLog = [
      { ts:new Date().toLocaleTimeString(), level:'info', msg:'Codex CLI starting...' },
      { ts:new Date().toLocaleTimeString(), level:'info', msg:`Using sandbox: ${this._config.sandbox}` },
      { ts:new Date().toLocaleTimeString(), level:'info', msg:`Model: ${this._config.model}` },
      { ts:new Date().toLocaleTimeString(), level:'info', msg:'Stdio JSON-RPC transport ready' },
      { ts:new Date().toLocaleTimeString(), level:'info', msg:'Codex CLI running (PID: ' + this._pid + ')' },
    ];
    this.requestUpdate();
  }

  _stopProcess() {
    this._processStatus = 'stopped';
    this._pid = null;
    this._uptime = '--';
    this._outputLog = [
      { ts:new Date().toLocaleTimeString(), level:'warn', msg:'SIGTERM sent to Codex CLI' },
      { ts:new Date().toLocaleTimeString(), level:'info', msg:'Codex CLI stopped gracefully' },
    ];
    this.requestUpdate();
  }

  _restartProcess() {
    this._stopProcess();
    setTimeout(() => this._startProcess(), 300);
  }

  _toggleTool(name: string) {
    this._toolWhitelist = this._toolWhitelist.map(t =>
      t.name === name ? { ...t, enabled: !t.enabled } : t
    );
    this.requestUpdate();
  }

  _resetDefaults() {
    this._config = {
      nodePath: 'C:\\Program Files\\nodejs\\node.exe',
      workspace: 'D:\\lxup',
      sandbox: 'landlock',
      apiKey: '',
      model: 'gpt-4.2',
      extraArgs: '--stdio-rpc --max-tokens 8192',
    };
    this.requestUpdate();
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      <div class="grid6" style="margin-bottom:20px;">
        <oc-stat-card label="${L('common.processStatus')}"
          value="${this._processStatus === 'running' ? L('common.processRunning') : L('common.processStopped')}"
          color="${this._processStatus === 'running' ? 'var(--success)' : 'var(--muted)'}">
          ${this._pid ? 'PID: ' + this._pid : ''}
        </oc-stat-card>
        <oc-stat-card label="${L('common.uptime')}" value="${this._uptime}"></oc-stat-card>
        <oc-stat-card label="${L('common.model')}" value="${this._config.model}"></oc-stat-card>
        <oc-stat-card label="${L('common.sandboxMode')}" value="${this._config.sandbox}"></oc-stat-card>
        <oc-stat-card label="Tools" value="${this._toolWhitelist.filter(t=>t.enabled).length}/${this._toolWhitelist.length}">enabled</oc-stat-card>
        <oc-stat-card label="Transport" value="stdio JSON-RPC">v2.0</oc-stat-card>
      </div>

      <div class="page-toolbar-lg">
        <span class="text-soft text-base">${L('common.configuration')}</span>
        <div class="page-actions">
          ${this._processStatus === 'stopped'
            ? html`<button class="btn-sm" @click=${this._startProcess}>${L('common.start')}</button>`
            : html`<button class="btn-sm ghost" style="color:var(--danger);" @click=${this._stopProcess}>${L('common.stop')}</button>`}
          <button class="btn-sm ghost" @click=${this._restartProcess}>${L('common.restart')}</button>
          <button class="btn-sm ghost" @click=${this._resetDefaults}>${L('common.resetDefaults')}</button>
        </div>
      </div>

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:320px;">
          <oc-card heading="Codex CLI ${L('common.config')}">
            <div class="form-group">
              <label class="form-label">${L('common.nodejsPath')}</label>
              <div style="display:flex;gap:8px;">
                <input class="form-input" .value=${this._config.nodePath} @input=${(e:Event) => { this._config = {...this._config, nodePath:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
                <button class="btn-sm ghost">${L('common.browseFiles')}</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.workspaceDir')}</label>
              <div style="display:flex;gap:8px;">
                <input class="form-input" .value=${this._config.workspace} @input=${(e:Event) => { this._config = {...this._config, workspace:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
                <button class="btn-sm ghost">${L('common.browseFiles')}</button>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.sandboxMode')}</label>
              <select class="form-input" .value=${this._config.sandbox} @change=${(e:Event) => { this._config = {...this._config, sandbox:(e.target as HTMLSelectElement).value}; this.requestUpdate(); }}>
                <option value="landlock">${L('common.sandboxLandlock')}</option>
                <option value="seatbelt">${L('common.sandboxSeatbelt')}</option>
                <option value="docker">${L('common.sandboxDocker')}</option>
                <option value="none">${L('common.sandboxNone')}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.apiKey')}</label>
              <input class="form-input" type="password" .value=${this._config.apiKey} placeholder="sk-..." @input=${(e:Event) => { this._config = {...this._config, apiKey:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.defaultModel')}</label>
              <select class="form-input" .value=${this._config.model} @change=${(e:Event) => { this._config = {...this._config, model:(e.target as HTMLSelectElement).value}; this.requestUpdate(); }}>
                <option value="gpt-4.2">gpt-4.2</option>
                <option value="gpt-4.1">gpt-4.1</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-opus-4-8">claude-opus-4-8</option>
                <option value="claude-sonnet-5">claude-sonnet-5</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">${L('common.cliArgs')}</label>
              <input class="form-input" .value=${this._config.extraArgs} @input=${(e:Event) => { this._config = {...this._config, extraArgs:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
            </div>
          </oc-card>
        </div>

        <div style="flex:1;min-width:320px;">
          <oc-card heading="${L('common.toolWhitelist')}">
            ${this._toolWhitelist.map((t:any) => html`
              <div class="toggle-row" style="margin-bottom:10px;">
                <div>
                  <div style="font-size:13px;font-weight:500;color:var(--text);font-family:var(--font-mono);">${t.name}</div>
                  <div style="font-size:11px;color:var(--text-soft);">${t.desc}</div>
                </div>
                <oc-toggle ?checked=${t.enabled} @change=${() => this._toggleTool(t.name)}></oc-toggle>
              </div>
            `)}
          </oc-card>

          <oc-card heading="${L('common.processOutput')}" style="margin-top:16px;">
            <div class="log-view" style="max-height:280px;">
              ${this._outputLog.map((l:any) => html`
                <div class="log-line">
                  <span class="log-ts">${l.ts}  </span>
                  <span class="${l.level==='warn'?'log-warn':l.level==='error'?'log-error':''}">${l.msg}</span>
                </div>
              `)}
            </div>
          </oc-card>
        </div>
      </div>
    `;
  }
}
customElements.define('codex-page', CodexPage);
