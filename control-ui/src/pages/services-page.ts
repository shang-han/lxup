import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class ServicesPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _version = {
    current: '2026.3.24',
    label: L('common.sinicizedOptimized'),
    recommended: '',
    upstream: '2026.7.1-zh.2',
  };

  @state() _gateway = {
    name: 'ai.openclaw.gateway',
    desc: 'OpenClaw Gateway',
    pid: 1664,
    status: 'running' as 'running' | 'stopped',
  };

  @state() _configContent = `{
  "$schema": "https://openclaw.ai/schema/config.json",
  "agents": {
    "defaults": {
      "workspace": "D:\\\\openclaw-data\\\\openclaw\\\\workspace"
    },
    "list": []
  },
  "bindings": [],
  "browser": {
    "defaultProfile": "user",
    "enabled": true,
    "executablePath": "D:\\\\Chrome-Portable\\\\Chrome\\\\chrome.exe",
    "extraArgs": [
      "--disable-breakpad"
    ],
    "profiles": {
      "fresh": {
        "attachOnly": false,
        "cdpPort": 9224,
        "color": "#2563EB"
      }
    }
  },
  "gateway": {
    "port": 18789,
    "host": "127.0.0.1"
  }
}`;

  @state() _backups: Array<{ id: string; date: string; size: string }> = [];

  _toggleGateway() {
    this._gateway = {
      ...this._gateway,
      status: this._gateway.status === 'running' ? 'stopped' : 'running',
      pid: this._gateway.status === 'running' ? null : Math.floor(Math.random() * 9000 + 1000),
    };
  }

  _renderVersionCard() {
    return html`
      <div class="svc-card version-card">
        <div class="version-label">${L('common.currentVersion')} · <span>${this._version.label}</span></div>
        <div class="version-number">${this._version.current}</div>
        <div class="version-upstream">
          ${this._version.recommended
            ? L('common.noRecommendedStable') + ' · ' + L('common.latestUpstream') + ': ' + this._version.upstream
            : L('common.noRecommendedStable') + ' · ' + L('common.latestUpstream') + ': ' + this._version.upstream
          }
        </div>
        <div class="version-note">${L('common.versionNote')}</div>
      </div>
    `;
  }

  _renderGatewayCard() {
    const isRunning = this._gateway.status === 'running';
    return html`
      <div class="svc-card">
        <div class="svc-row">
          <div class="svc-row__info">
            <span class="svc-dot ${isRunning ? 'running' : 'stopped'}"></span>
            <div>
              <div class="svc-row__name">${this._gateway.name}</div>
              <div class="svc-row__desc">${this._gateway.desc}${isRunning ? ` (PID: ${this._gateway.pid})` : ''}</div>
            </div>
          </div>
          <div class="svc-row__actions">
            <button class="btn-restart" @click=${() => this._toggleGateway()}>${L('common.restart')}</button>
            <button class="btn-stop" @click=${() => this._toggleGateway()}>${isRunning ? L('common.stop') : L('common.start')}</button>
          </div>
        </div>
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
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configEdit')}</div>
        <div class="svc-card__subtitle">${L('common.configEditDesc')}</div>
        <div class="config-actions">
          <button class="btn-save-restart">${L('common.saveRestart')}</button>
          <button class="btn-ghost">${L('common.saveOnly')}</button>
          <button class="btn-ghost">${L('common.reload')}</button>
        </div>
        <div class="config-loaded">${L('common.loaded')} · 2.8 KB</div>
        <textarea class="config-editor"
          .value=${this._configContent}
          @input=${(e: Event) => { this._configContent = (e.target as HTMLTextAreaElement).value; }}
        ></textarea>
      </div>
    `;
  }

  _renderConfigValidation() {
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configValidation')}</div>
        <div class="svc-card__subtitle">${L('common.configValidationDesc')}</div>
        <div class="validation-actions">
          <button class="btn-calibrate">${L('common.inheritCalibration')}</button>
          <button class="btn-ghost">${L('common.fullInitRepair')}</button>
        </div>
        <div class="validation-option">${L('common.inheritDesc')}</div>
        <div class="validation-option">${L('common.fullInitDesc')}</div>
      </div>
    `;
  }

  _renderConfigBackup() {
    return html`
      <div class="svc-card">
        <div class="svc-card__title">${L('common.configBackup')}</div>
        <div class="svc-card__subtitle">${L('common.configBackupDesc')}</div>
        <div class="backup-actions">
          <button class="btn-backup">${L('common.createBackup')}</button>
        </div>
        ${this._backups.length === 0
          ? html`<div class="backup-empty">${L('common.noBackups')}</div>`
          : this._backups.map(b => html`
              <div class="svc-row">
                <div class="svc-row__info">
                  <div>
                    <div class="svc-row__name">${b.id}</div>
                    <div class="svc-row__desc">${b.date} · ${b.size}</div>
                  </div>
                </div>
              </div>
            `)
        }
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
