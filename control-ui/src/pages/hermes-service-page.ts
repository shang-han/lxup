import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesServicePage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hs-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hs-back:hover { text-decoration: underline; }

    .hs-status-row {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 768px) { .hs-status-row { grid-template-columns: repeat(2, 1fr); } }
    .hs-status-card {
      padding: 20px; border-right: 1px solid var(--border);
    }
    .hs-status-card:last-child { border-right: none; }
    .hs-status-card__label {
      font-size: 11px; font-weight: 600; margin-bottom: 8px;
    }
    .hs-status-card__value {
      font-size: 20px; font-weight: 700; color: var(--text-strong); margin-bottom: 4px;
    }
    .hs-status-card__sub {
      font-size: 11px; color: var(--muted);
    }

    .hs-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
    }
    @media (max-width: 900px) { .hs-grid { grid-template-columns: 1fr; } }

    .hs-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hs-card__header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hs-card__header svg { color: var(--accent); }
    .hs-card__body { padding: 16px 20px; }

    .hs-info-row {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .hs-info-row:last-child { border-bottom: none; }
    .hs-info-row__label {
      font-size: 12px; color: var(--text-soft); flex-shrink: 0;
    }
    .hs-info-row__value {
      font-size: 12px; color: var(--text); text-align: right;
      word-break: break-all; max-width: 60%;
    }
    .hs-info-row__value.mono { font-family: var(--font-mono); font-size: 11px; }

    .hs-config-links {
      display: flex; gap: 8px; margin-top: 8px;
    }
    .hs-config-links button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hs-config-links button:hover { background: var(--bg-hover); color: var(--text); }

    .hs-file-tags {
      display: flex; gap: 6px; margin-top: 8px;
    }
    .hs-file-tag {
      padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px;
      background: var(--bg-muted); color: var(--text-soft); border: 1px solid var(--border);
    }

    .hs-conn-section {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card); margin-bottom: 16px;
    }
    .hs-conn-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
    }
    .hs-conn-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hs-conn-title svg { color: var(--accent); }
    .hs-conn-detect {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      display: flex; align-items: center; gap: 4px;
    }
    .hs-conn-detect:hover { color: var(--text); }
    .hs-conn-targets { display: flex; gap: 8px; margin-bottom: 10px; }
    .hs-conn-target {
      padding: 6px 14px; border-radius: var(--radius-full); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hs-conn-target.active {
      background: var(--text-strong); color: var(--accent-foreground); border-color: var(--text-strong);
    }
    .hs-conn-target:hover:not(.active) { background: var(--bg-hover); color: var(--text); }
    .hs-conn-local-info {
      font-size: 12px; color: var(--text-soft); margin-bottom: 12px;
    }
    .hs-conn-custom-label {
      font-size: 12px; color: var(--text-soft); margin-bottom: 6px;
    }
    .hs-conn-custom-input {
      width: 100%; padding: 8px 12px; background: var(--bg-muted);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; font-family: var(--font-mono);
      outline: none; margin-bottom: 10px;
    }
    .hs-conn-custom-input:focus { border-color: var(--accent); }
    .hs-conn-custom-desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 12px;
    }
    .hs-apply-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--accent-foreground);
    }
    .hs-apply-btn:hover { opacity: 0.85; }

    .hs-maint-btn {
      padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text); transition: all var(--duration-fast);
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .hs-maint-btn:hover { background: var(--bg-hover); }
    .hs-maint-btn--primary {
      background: var(--text-strong); color: var(--accent-foreground); border-color: var(--text-strong);
    }
    .hs-maint-btn--primary:hover { opacity: 0.9; }
    .hs-maint-btn--danger {
      color: var(--danger); border-color: rgba(239,68,68,0.3);
    }
    .hs-maint-btn--danger:hover { background: var(--danger-subtle); }
    .hs-link {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      text-decoration: none;
    }
    .hs-link:hover { color: var(--text); text-decoration: underline; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Function }) onNavigate = () => {};

  @state() _connTarget = 'local';
  @state() _customUrl = '';
  _unsubI18n: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  render() {
    return html`
      <div class="page-content" style="padding:24px 24px 0;">
        <a class="hs-back" @click=${() => this.onNavigate('dashboard')}>
          ← ${L('hermesService.backToDashboard', '返回仪表盘')}
        </a>
      </div>

      <page-header title=${this.title} subtitle=${this.subtitle}>
        <div style="display:flex;gap:8px;align-items:center;">
          <button style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--accent-foreground);display:inline-flex;align-items:center;gap:6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            ${L('hermesService.startGateway', '启动 Gateway')}
          </button>
          <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
            ${L('common.refresh')}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <!-- Status row -->
        <div class="hs-status-row">
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--success);">${L('hermesService.installStatus', '安装状态')}</div>
            <div class="hs-status-card__value">${L('hermesService.installed', '已安装')}</div>
            <div class="hs-status-card__sub">${L('hermesService.installMethod', '安装方式')} · uv-tool</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--danger);">${L('hermesService.gatewayStatus', 'Gateway 状态')}</div>
            <div class="hs-status-card__value">${L('hermesService.stopped', '已停止')}</div>
            <div class="hs-status-card__sub">:8642</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--warn);">${L('hermesService.currentModel', '当前模型')}</div>
            <div class="hs-status-card__value">${L('hermesService.notConfigured', '未配置')}</div>
            <div class="hs-status-card__sub">${L('hermesService.unknown', '未知')}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--accent);">${L('hermesService.connectionTarget', '连接目标')}</div>
            <div class="hs-status-card__value">${L('hermesService.local', '本地')}</div>
            <div class="hs-status-card__sub">http://127.0.0.1:8642</div>
          </div>
        </div>

        <!-- Install status + Hermes config -->
        <div class="hs-grid">
          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              ${L('hermesService.installStatus', '安装状态')}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.version', '版本')}</span>
                <span class="hs-info-row__value">v0.11.0</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.installMethod', '安装方式')}</span>
                <span class="hs-info-row__value">uv-tool</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.cliPath', 'CLI 路径')}</span>
                <span class="hs-info-row__value mono">C:\\Users\\13907\\AppData\\Local\\OpenClawUSB\\hermes-runtime-cache\\f809767f2eeaf51\\hermes-runtime\\bin\\hermes.cmd</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.homeDir', '主目录')}</span>
                <span class="hs-info-row__value mono">D:\\U\\银色玉访谈64G+149\\OpenClaw-3.0-U盘版\\openclaw-data\\.hermes</span>
              </div>
              <div class="hs-info-row" style="border-bottom:none;">
                <span class="hs-info-row__label">${L('hermesService.keyConfigFiles', '关键配置文件')}</span>
                <span></span>
              </div>
              <div class="hs-file-tags">
                <span class="hs-file-tag">config.yaml</span>
                <span class="hs-file-tag">.env</span>
              </div>
            </div>
          </div>

          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              ${L('hermesService.hermesConfig', 'Hermes 配置')}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.llmProvider', 'LLM 提供商')}</span>
                <span class="hs-info-row__value">${L('hermesService.unknown', '未知')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.model', '模型')}</span>
                <span class="hs-info-row__value">${L('hermesService.notConfigured', '未配置')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${L('hermesService.customApiAddr', '自定义 API 地址（可选）')}</span>
                <span class="hs-info-row__value">${L('hermesService.notSet', '未设置')}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">API Key</span>
                <span class="hs-info-row__value">${L('hermesService.notSet', '未设置')}</span>
              </div>
              <div class="hs-config-links">
                <button @click=${() => this.onNavigate('hermes-config')}>${L('hermesService.openConfig', '打开配置')}</button>
                <button @click=${() => this.onNavigate('hermes-env')}>${L('hermesService.openEnv', '打开环境变量')}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Connection target -->
        <div class="hs-conn-section">
          <div class="hs-conn-header">
            <div class="hs-conn-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              ${L('hermesService.connectionTarget', '连接目标')}
            </div>
            <div class="hs-conn-detect">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              ${L('hermesService.detectEnv', '探测环境')}
            </div>
          </div>
          <div class="hs-conn-targets">
            <button class="hs-conn-target ${this._connTarget === 'local' ? 'active' : ''}"
                    @click=${() => { this._connTarget = 'local'; }}>
              ${L('hermesService.localTarget', '本地')}
            </button>
            <button class="hs-conn-target ${this._connTarget === 'custom' ? 'active' : ''}"
                    @click=${() => { this._connTarget = 'custom'; }}>
              ${L('hermesService.customTarget', '自定义')}
            </button>
          </div>
          ${this._connTarget === 'local' ? html`
            <div class="hs-conn-local-info">${L('hermesService.localTarget', '本地')} · http://127.0.0.1:8642</div>
          ` : html`
            <div class="hs-conn-custom-label">${L('hermesService.customGatewayUrl', '自定义 Gateway URL')}</div>
            <input class="hs-conn-custom-input" type="text" .value=${this._customUrl}
              placeholder="http://192.168.1.100:8642"
              @input=${(e: Event) => { this._customUrl = (e.target as HTMLInputElement).value; }} />
            <div class="hs-conn-custom-desc">${L('hermesService.customDesc', '连接到已有的 Hermes Agent Gateway 实例，适用于已在其他机器或手动安装的场景。')}</div>
          `}
          <button class="hs-apply-btn">${L('hermesService.apply', '应用')}</button>
        </div>

        <!-- Health Check -->
        <div class="hs-card" style="margin-bottom:16px;">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            ${L('hermesService.healthCheck', '健康检查')}
            <span style="margin-left:auto;font-size:12px;padding:3px 12px;border-radius:var(--radius-full);border:1px solid var(--border);color:var(--text-soft);">${L('hermesService.stopped', '已停止')}</span>
          </div>
          <div class="hs-card__body">
            <div style="font-size:13px;color:var(--text-soft);font-style:italic;">
              ${L('hermesService.healthCheckMsg', 'Gateway 未运行或暂时无法返回健康数据。')}
            </div>
          </div>
        </div>

        <!-- Maintenance Operations -->
        <div class="hs-card">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${L('hermesService.maintenanceOps', '维护操作')}
          </div>
          <div class="hs-card__body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
              <button class="hs-maint-btn hs-maint-btn--primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                ${L('hermesService.upgradeHermes', '升级 Hermes')}
              </button>
              <button class="hs-maint-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                ${L('hermesService.uninstallHermes', '卸载 Hermes')}
              </button>
              <button class="hs-maint-btn hs-maint-btn--danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                ${L('hermesService.uninstallClean', '卸载并清理配置')}
              </button>
            </div>
            <div style="display:flex;gap:16px;">
              <a class="hs-link" @click=${() => this.onNavigate('logs')}>${L('hermesService.openLogs', '打开日志')}</a>
              <a class="hs-link" @click=${() => this.onNavigate('hermes-config')}>${L('hermesService.openConfig', '打开配置')}</a>
              <a class="hs-link">${L('hermesService.backToInstaller', '返回安装向导')}</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-service-page', HermesServicePage);
