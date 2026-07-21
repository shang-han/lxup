import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, i18n } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesConfigPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hc-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hc-back:hover { text-decoration: underline; }

    .hc-breadcrumb {
      font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 4px;
    }
    .hc-page-title {
      font-size: 28px; font-weight: 700; color: var(--text-strong);
      letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .hc-page-subtitle {
      font-size: 12px; color: var(--muted); font-family: var(--font-mono);
      margin-bottom: 24px;
    }

    .hc-header-actions {
      display: flex; gap: 8px; align-items: center;
    }
    .hc-btn-ghost {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hc-btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .hc-btn-primary {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
    }
    .hc-btn-primary:hover { background: var(--accent-hover); }

    .hc-editor-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      overflow: hidden;
    }
    .hc-editor-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
    }
    .hc-editor-filename {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hc-editor-link {
      font-size: 11px; color: var(--muted); font-family: var(--font-mono);
      cursor: pointer;
    }
    .hc-editor-link:hover { color: var(--text); }
    .hc-editor-textarea {
      width: 100%; min-height: 500px; padding: 16px 20px;
      background: var(--bg); border: none; resize: vertical;
      font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
      color: var(--text); outline: none;
    }
    .hc-editor-textarea:focus { background: var(--bg-elevated); }
  `;

  @property({ type: Function }) onNavigate = () => {};

  @state() _configContent = `# Hermes Agent Configuration
# ~/.hermes/config.yaml

agent:
  name: "hermes"
  model: "anthropic/claude-opus-4-6"
  temperature: 0.7

gateway:
  host: "127.0.0.1"
  port: 8642

memory:
  enabled: true
  path: "~/.hermes/memories"

skills:
  enabled: true
  directory: "~/.hermes/skills"
`;

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
        <a class="hc-back" @click=${() => this.onNavigate('hermes-service')}>
          ← ${L('hermesConfig.backToService', '返回服务')}
        </a>
      </div>

      <page-header
        title=${L('hermesConfig.title', 'Hermes 配置')}
        subtitle=${L('hermesConfig.path', '~/.hermes/config.yaml')}
      >
        <div class="hc-header-actions">
          <button class="hc-btn-ghost">${L('hermesConfig.reload', '重新加载')}</button>
          <button class="hc-btn-primary">${L('hermesConfig.saveConfig', '保存配置')}</button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <div class="hc-editor-card">
          <div class="hc-editor-header">
            <span class="hc-editor-filename">config.yaml</span>
            <span class="hc-editor-link">raw yaml editor</span>
          </div>
          <textarea class="hc-editor-textarea"
            .value=${this._configContent}
            @input=${(e: Event) => { this._configContent = (e.target as HTMLTextAreaElement).value; }}
          ></textarea>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-config-page', HermesConfigPage);
