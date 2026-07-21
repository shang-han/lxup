import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesEnvPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .env-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none; 
    }
    .env-back:hover { text-decoration: underline; }

    .env-page-title {
      font-size: 28px; font-weight: 700; color: var(--text-strong);
      letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .env-page-subtitle {
      font-size: 12px; color: var(--muted); font-family: var(--font-mono);
      margin-bottom: 24px;
    }

    .env-notice {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      font-size: 13px; color: var(--text-soft); line-height: 1.7;
      margin-bottom: 16px;
    }
    .env-notice code {
      font-family: var(--font-mono); font-size: 11px;
      background: var(--bg-muted); padding: 2px 6px;
      border-radius: var(--radius-sm); color: var(--text);
    }

    .env-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      overflow: hidden; margin-bottom: 16px;
    }
    .env-section__header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .env-section__header svg { color: var(--accent); }
    .env-section__body { padding: 20px; }

    .env-empty {
      text-align: center; padding: 32px 16px; color: var(--muted);
    }
    .env-empty__title { font-size: 13px; margin-bottom: 4px; }
    .env-empty__desc { font-size: 12px; }

    .env-actions {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-top: 1px solid var(--border);
    }
    .env-add-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      display: inline-flex; align-items: center; gap: 6px;
    }
    .env-add-btn:hover { background: var(--accent-hover); }
    .env-hint {
      font-size: 11px; color: var(--muted);
    }

    /* === variable row === */
    .env-var-row {
      display: flex; gap: 8px; align-items: center;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .env-var-row:last-child { border-bottom: none; }
    .env-var-name {
      width: 200px; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono);
      outline: none;
    }
    .env-var-name:focus { border-color: var(--accent); }
    .env-var-value {
      flex: 1; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono);
      outline: none;
    }
    .env-var-value:focus { border-color: var(--accent); }
    .env-var-remove {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer;
    }
    .env-var-remove:hover { background: var(--danger-subtle); color: var(--danger); }
  `;

  @property({ type: String }) title = '';
  @property({ type: Function }) onNavigate = () => {};

  @state() _variables: Array<{ name: string; value: string }> = [];
  _unsubI18n: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubI18n?.();
  }

  _addVar() {
    this._variables = [...this._variables, { name: '', value: '' }];
  }

  _removeVar(index: number) {
    this._variables = this._variables.filter((_, i) => i !== index);
  }

  render() {
    return html`
      <div class="page-content" style="padding:24px;">
        <a class="env-back" @click=${() => this.onNavigate('dashboard')}>
          ← ${L('hermesEnv.backToDashboard', '返回仪表盘')}
        </a>

        <div class="env-page-title">${L('hermesEnv.title', 'ENV 编辑')}</div>
        <div class="env-page-subtitle">${L('hermesEnv.subtitle', '自定义环境变量 · ~/.hermes/.env')}</div>

        <!-- Notice -->
        <div class="env-notice">
          ${L('hermesEnv.notice', '以下变量由 OpenClaw U盘版 在仪表盘「模型配置」中托管：')}
          <code>OPENAI_API_KEY</code> <code>ANTHROPIC_API_KEY</code> <code>DEEPSEEK_API_KEY</code>
          ${L('hermesEnv.noticeProvider', '等 provider 密钥及 base URL，以及')}
          <code>GATEWAY_ALLOW_ALL_USERS</code> <code>API_SERVER_KEY</code>。
          ${L('hermesEnv.noticeDash', '请通过仪表盘修改这些项——本页仅管理你的自定义变量（如')}
          <code>TAVILY_API_KEY</code>、<code>HTTP_PROXY</code>、skills ${L('hermesEnv.noticeCustom', '自定义变量等）。')}
        </div>

        <!-- custom.env section -->
        <div class="env-section">
          <div class="env-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            ${L('hermesEnv.customEnvFile', 'custom.env')}
          </div>
          <div class="env-section__body">
            ${this._variables.length === 0 ? html`
              <div class="env-empty">
                <div class="env-empty__title">${L('hermesEnv.noVars', 'no custom variables yet')}</div>
                <div class="env-empty__desc">${L('hermesEnv.clickAdd', 'click "add variable" below to create one')}</div>
              </div>
            ` : this._variables.map((v, i) => html`
              <div class="env-var-row">
                <input class="env-var-name" .value=${v.name} placeholder=${L('hermesEnv.keyPlaceholder', '键名')}
                  @input=${(e:Event) => { this._variables[i].name = (e.target as HTMLInputElement).value; }} />
                <input class="env-var-value" .value=${v.value} placeholder=${L('hermesEnv.valuePlaceholder', '值')}
                  @input=${(e:Event) => { this._variables[i].value = (e.target as HTMLInputElement).value; }} />
                <button class="env-var-remove" @click=${() => this._removeVar(i)} title=${L('hermesEnv.remove', '删除')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `)}
          </div>
          <div class="env-actions">
            <button class="env-add-btn" @click=${this._addVar}>
              + ${L('hermesEnv.addVar', '添加变量')}
            </button>
            <span class="env-hint">${L('hermesEnv.changesHint', 'changes take effect on next gateway restart')}</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-env-page', HermesEnvPage);
