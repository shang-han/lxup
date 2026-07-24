import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { getSharedStore } from '../store/shared.js';
import { fetchTimeout } from '../utils/net.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

/**
 * 服务页 —— 全部接真实后端：
 *   - 版本 / 进程状态：WS hello + Sidecar /api/gateway/status
 *   - 停止 / 启动 / 重启：Sidecar /api/gateway/{stop,start,restart}
 *   - 配置编辑：WS config.get 读取，config.patch 写回（乐观并发，带 baseHash）
 *   - 备份：浏览器端导出当前配置快照（无服务端备份存储，如实呈现）
 */
export class ServicesPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}
    .svc-msg { margin-top: 8px; font-size: 12px; color: var(--text-soft); }
    .svc-msg.err { color: var(--danger); }
    .svc-msg.ok { color: var(--success); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  // 网关进程（Sidecar /api/gateway/*）
  @state() _gwVersion = '';
  @state() _gwRunning = false;
  @state() _gwPid: number | null = null;
  @state() _gwPort = 18789;
  @state() _gwBusy = false;
  @state() _gwMessage = '';

  // 网关配置（WS config.get / config.patch）
  @state() _configContent = '';
  @state() _configHash = '';
  @state() _configLoaded = false;
  @state() _configBusy = false;
  @state() _configMsg = '';
  @state() _configMsgCls = '';
  @state() _validationMsg = '';
  @state() _validationCls = '';
  @state() _backupMsg = '';

  _storeUnsub: (() => void) | null = null;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._refreshStatus();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe(snap => {
      if (snap.hello?.server?.version) this._gwVersion = snap.hello.server.version;
      if (snap.connected && !this._configLoaded && !this._configBusy) this._loadConfig();
    });
    if (store.connected) this._loadConfig();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
  }

  // ── 进程管理 ──────────────────────────────────────

  async _refreshStatus() {
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/gateway/status`, {}, 8000);
      const s = await r.json();
      this._gwRunning = !!s.running;
      this._gwPid = s.pid ?? null;
      this._gwPort = s.port ?? 18789;
    } catch {
      this._gwRunning = false;
      this._gwPid = null;
    }
  }

  _gwMsgTimer: ReturnType<typeof setTimeout> | null = null;

  _setGwMessage(msg: string, sticky = false) {
    this._gwMessage = msg;
    if (this._gwMsgTimer) clearTimeout(this._gwMsgTimer);
    if (!sticky) {
      this._gwMsgTimer = setTimeout(() => { this._gwMessage = ''; }, 6000);
    }
  }

  async _callGateway(action: 'stop' | 'start' | 'restart') {
    if (this._gwBusy) return;
    this._gwBusy = true;
    this._setGwMessage(action === 'stop' ? '正在停止网关…' : action === 'start' ? '正在启动网关…' : '正在重启网关…', true);
    const timeout = action === 'stop' ? 20000 : action === 'start' ? 45000 : 60000;
    try {
      const r = await fetchTimeout(`${this._sidecarBase}/api/gateway/${action}`, { method: 'POST' }, timeout);
      const res = await r.json();
      this._setGwMessage(res.message || '操作完成');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._setGwMessage(msg.includes('aborted') ? `操作超时（${action}）` : `操作失败：${msg}`);
    } finally {
      this._gwBusy = false;
      await this._refreshStatus();
      setTimeout(() => this._refreshStatus(), 2000);
    }
  }

  // ── 配置读写（WS RPC）─────────────────────────────

  async _loadConfig() {
    const store = getSharedStore();
    if (!store.connected) {
      this._configMsg = L('dashboard.wsDisconnected');
      this._configMsgCls = 'err';
      return;
    }
    this._configBusy = true;
    try {
      const g = await store.request<any>('config.get', {});
      const cfg = g?.config || g?.parsed || {};
      this._configHash = g?.hash || '';
      this._configContent = JSON.stringify(cfg, null, 2);
      this._configLoaded = true;
      this._configMsg = '';
      this._configMsgCls = '';
    } catch (e) {
      this._configMsg = L('common.configSaveFailed') + (e instanceof Error ? e.message : String(e));
      this._configMsgCls = 'err';
    } finally {
      this._configBusy = false;
    }
  }

  /** 保存：config.patch 写回（顶层键全量替换 + baseHash 乐观并发） */
  async _saveConfig(restart: boolean) {
    if (this._configBusy) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(this._configContent);
    } catch {
      this._configMsg = L('common.configInvalidJson');
      this._configMsgCls = 'err';
      return;
    }
    const store = getSharedStore();
    if (!store.connected) {
      this._configMsg = L('dashboard.wsDisconnected');
      this._configMsgCls = 'err';
      return;
    }
    this._configBusy = true;
    this._configMsg = '';
    try {
      await store.request('config.patch', {
        raw: JSON.stringify(parsed),
        baseHash: this._configHash,
        replacePaths: Object.keys(parsed),
      });
      // 写回成功后重新读取，刷新 hash 与网关归一化后的内容
      const g = await store.request<any>('config.get', {});
      this._configHash = g?.hash || '';
      this._configContent = JSON.stringify(g?.config || g?.parsed || parsed, null, 2);
      this._configLoaded = true;
      if (restart) {
        await this._callGateway('restart');
      }
      this._configMsg = L('common.configSaved');
      this._configMsgCls = 'ok';
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this._configMsg = L('common.configSaveFailed') + msg;
      this._configMsgCls = 'err';
    } finally {
      this._configBusy = false;
    }
  }

  /** 校验：本地 JSON 语法检查 */
  _validateConfig() {
    try {
      const obj = JSON.parse(this._configContent);
      const keys = Object.keys(obj || {}).length;
      this._validationMsg = `✓ JSON ${keys ? keys + ' top-level keys' : 'OK'}`;
      this._validationCls = 'ok';
    } catch (e) {
      this._validationMsg = `✗ ${e instanceof Error ? e.message : String(e)}`;
      this._validationCls = 'err';
    }
  }

  /** 修复：丢弃本地编辑，从网关重新拉取配置 */
  async _repairConfig() {
    this._validationMsg = '';
    this._validationCls = '';
    await this._loadConfig();
    if (this._configLoaded) {
      this._validationMsg = `✓ ${L('common.configReloaded')}`;
      this._validationCls = 'ok';
    }
  }

  /** 备份：导出当前配置快照到下载目录（应用不保留备份副本） */
  _backupConfig() {
    const content = this._configContent || '{}';
    const blob = new Blob([content], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `openclaw-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    this._backupMsg = `${L('common.downloadStarted')} · ${new Blob([content]).size} B`;
  }

  // ── 渲染 ──────────────────────────────────────────

  _renderVersionCard() {
    return html`
      <div class="svc-card version-card">
        <div class="version-label">${L('common.currentVersion')} · <span>${L('common.sinicizedOptimized')}</span></div>
        <div class="version-number">${this._gwVersion || '—'}</div>
        <div class="version-upstream">
          ${this._gwRunning
            ? `PID ${this._gwPid ?? '—'} · :${this._gwPort}`
            : L('dashboard.stopped')}
        </div>
        <div class="version-note">${L('common.versionNote')}</div>
      </div>
    `;
  }

  _renderGatewayCard() {
    const isRunning = this._gwRunning;
    return html`
      <div class="svc-card">
        <div class="svc-row">
          <div class="svc-row__info">
            <span class="svc-dot ${isRunning ? 'running' : 'stopped'}"></span>
            <div>
              <div class="svc-row__name">ai.openclaw.gateway</div>
              <div class="svc-row__desc">OpenClaw Gateway${isRunning && this._gwPid ? ` (PID: ${this._gwPid})` : ''} · :${this._gwPort}</div>
            </div>
          </div>
          <div class="svc-row__actions">
            <button class="btn-restart" ?disabled=${this._gwBusy} @click=${() => this._callGateway('restart')}>${L('common.restart')}</button>
            <button class="btn-stop" ?disabled=${this._gwBusy} @click=${() => this._callGateway(isRunning ? 'stop' : 'start')}>${isRunning ? L('common.stop') : L('common.start')}</button>
          </div>
        </div>
        ${this._gwMessage ? html`<div class="svc-msg">${this._gwMessage}</div>` : ''}
      </div>
    `;
  }

  _renderDockerCard() {
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.dockerMgmt')}</div>
        <div class="svc-card__subtitle">${L('common.dockerDesc')}</div>
        <div class="docker-unavailable">${L('common.dockerUnavailable')}</div>
      </div>
    `;
  }

  _renderConfigEditor() {
    const sizeKb = (new Blob([this._configContent]).size / 1024).toFixed(1);
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configEdit')}</div>
        <div class="svc-card__subtitle">${L('common.configEditDesc')}</div>
        <div class="config-actions">
          <button class="btn-save-restart" ?disabled=${this._configBusy} @click=${() => this._saveConfig(true)}>${L('common.saveRestart')}</button>
          <button class="btn-ghost" ?disabled=${this._configBusy} @click=${() => this._saveConfig(false)}>${L('common.saveOnly')}</button>
          <button class="btn-ghost" ?disabled=${this._configBusy} @click=${() => this._loadConfig()}>${L('common.reload')}</button>
        </div>
        <div class="config-loaded">
          ${this._configLoaded ? `${L('common.loaded')} · ${sizeKb} KB` : L('dashboard.wsDisconnected')}
        </div>
        <textarea class="config-editor"
          .value=${this._configContent}
          @input=${(e: Event) => { this._configContent = (e.target as HTMLTextAreaElement).value; }}
        ></textarea>
        ${this._configMsg ? html`<div class="svc-msg ${this._configMsgCls}">${this._configMsg}</div>` : ''}
      </div>
    `;
  }

  _renderConfigValidation() {
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configValidation')}</div>
        <div class="svc-card__subtitle">${L('common.configValidationDesc')}</div>
        <div class="validation-actions">
          <button class="btn-calibrate" @click=${() => this._validateConfig()}>${L('common.inheritCalibration')}</button>
          <button class="btn-ghost" ?disabled=${this._configBusy} @click=${() => this._repairConfig()}>${L('common.fullInitRepair')}</button>
        </div>
        <div class="validation-option">${L('common.inheritDesc')}</div>
        <div class="validation-option">${L('common.fullInitDesc')}</div>
        ${this._validationMsg ? html`<div class="svc-msg ${this._validationCls}">${this._validationMsg}</div>` : ''}
      </div>
    `;
  }

  _renderConfigBackup() {
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configBackup')}</div>
        <div class="svc-card__subtitle">${L('common.configBackupDesc')}</div>
        <div class="backup-actions">
          <button class="btn-backup" @click=${() => this._backupConfig()}>${L('common.createBackup')}</button>
        </div>
        <div class="backup-empty">${this._backupMsg || L('common.noBackups')}</div>
      </div>
    `;
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="services-page">
        ${this._renderVersionCard()}
        ${this._renderGatewayCard()}
        ${this._renderDockerCard()}
        ${this._renderConfigEditor()}
        ${this._renderConfigValidation()}
        ${this._renderConfigBackup()}
      </div>
    `;
  }
}

customElements.define('services-page', ServicesPage);
