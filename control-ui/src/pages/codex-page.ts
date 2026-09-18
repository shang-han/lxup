import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { PROVIDER_PRESETS } from './provider-presets.js';
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
    baseUrl: '',
    model: '',
  };
  @state() _status = { installed: false, version: '', hasKey: false, loaded: false };
  @state() _saving = false;
  @state() _saveMsg = '';
  @state() _saveError = false;

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
        baseUrl: cfg.baseUrl || '',
        model: cfg.model || '',
      };
    } catch { /* Sidecar 不可达时保留默认值 */ }
    this.requestUpdate();
  }

  async _save() {
    this._saving = true;
    this._saveMsg = '';
    this._saveError = false;
    try {
      // 只保存连接配置；沙箱模式/审批策略由「沙箱配置」页负责（同为 /api/codex/config，
      // 字段缺席时 Sidecar 不改动对应项）
      const r = await saveConfig({
        workspace: this._config.workspace,
        apiKey: this._config.apiKey,
        baseUrl: this._config.baseUrl,
        model: this._config.model,
      });
      if (r.success) {
        this._saveMsg = L('common.saved');
        void this._loadAll();
      } else {
        this._saveMsg = r.message || 'error';
        this._saveError = true;
      }
    } catch (e) {
      this._saveMsg = e instanceof Error ? e.message : String(e);
      this._saveError = true;
    }
    this._saving = false;
    this.requestUpdate();
    setTimeout(() => { this._saveMsg = ''; this._saveError = false; this.requestUpdate(); }, 3000);
  }

  _resetDefaults() {
    // 不硬编码机器路径；workspace 留空由 Sidecar 侧默认值兜底
    this._config = { workspace: '', apiKey: this._config.apiKey, baseUrl: '', model: '' };
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
        <div class="cdx-toolbar">
          <button class="btn-save ${this._saveError ? 'error' : ''}" ?disabled=${this._saving} @click=${this._save}>
            ${this._saveError ? icons['alert-triangle'] : icons['check']} ${this._saveMsg || L('common.save')}
          </button>
          <button class="btn-reset" @click=${this._resetDefaults}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            ${L('common.resetDefaults')}
          </button>
        </div>
        <span class="text-soft text-base">
          ${st.installed ? html`<oc-badge variant="success">${st.version || 'Codex CLI'}</oc-badge>` : ''}
          ${st.installed && !st.hasKey ? html` <oc-badge variant="warning">${L('common.codexNoKey')}</oc-badge>` : ''}
          ${st.installed && st.hasKey ? html` <oc-badge variant="success">${L('common.codexHasKey')}</oc-badge>` : ''}
        </span>
      </div>

      <oc-card heading="Codex CLI ${L('common.config')}">
        <p style="font-size:12px;color:var(--text-soft);margin:0 0 16px;line-height:1.6;">${L('common.codexConfigHint')}</p>
        <div class="form-group">
          <label class="form-label">${L('common.baseUrl')}</label>
          <input class="form-input" .value=${this._config.baseUrl} list="lxup-codex-baseurls" placeholder="https://api.openai.com/v1" @input=${(e:Event) => { this._config = {...this._config, baseUrl:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
          <datalist id="lxup-codex-baseurls">
            ${PROVIDER_PRESETS.filter(p => p.baseUrl && p.key !== 'anthropic-official').map(p => html`<option value=${p.baseUrl}></option>`)}
          </datalist>
          <p style="font-size:12px;color:var(--text-soft);margin:6px 0 0;line-height:1.5;">${L('common.baseUrlHint')}</p>
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
          <label class="form-label">${L('common.workspaceDir')}</label>
          <input class="form-input" .value=${this._config.workspace} placeholder=".\workspace" @input=${(e:Event) => { this._config = {...this._config, workspace:(e.target as HTMLInputElement).value}; this.requestUpdate(); }} />
        </div>
      </oc-card>
    `;
  }
}
customElements.define('codex-page', CodexPage);
