import { LitElement, html, css, unsafeCSS } from 'lit';
import { I18nPage } from './i18n-page.js';
import { property, state } from 'lit/decorators.js';
import { L, Lget, i18n } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

const STEP_LABELS_KEYS = ['hermesInstaller.stepDetect', 'hermesInstaller.stepInstall', 'hermesInstaller.stepConfig', 'hermesInstaller.stepStart', 'hermesInstaller.stepDone'];

const STEP_CONTENT_KEYS: Record<number, string> = {
  0: 'hermesInstaller.detectItems',
  1: 'hermesInstaller.installItems',
  3: 'hermesInstaller.startItems',
  4: 'hermesInstaller.doneItems',
};

const PROVIDER_GROUPS = [
  { groupKey: 'hermesInstaller.providerIntl', items: ['OpenAI 官方', 'Anthropic 官方', 'Google Gemini', 'xAI (Grok)', 'Groq', 'Ollama (本地)'] },
  { groupKey: 'hermesInstaller.providerDomestic', items: ['火山引擎', '火山引擎 Coding', '阿里云百炼', '智谱 AI', 'MiniMax', 'Moonshot / Kimi', 'DeepSeek'] },
  { groupKey: 'hermesInstaller.providerAgg', items: ['GPT+Claude推荐中转', '硅基流动', 'OpenRouter', 'NVIDIA NIM'] },
];

export class HermesInstallerPage extends I18nPage {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hi-page-title {
      font-size: 28px; font-weight: 700; color: var(--text-strong);
      letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .hi-page-subtitle {
      font-size: 13px; color: var(--text-soft); margin-bottom: 24px;
    }

    /* === stepper === */
    .hi-stepper {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px 32px;
      margin-bottom: 20px; box-shadow: var(--shadow-card);
    }
    .hi-step {
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      position: relative; flex: 1;
    }
    .hi-step__circle {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 600;
      border: 2px solid var(--border); color: var(--muted);
      background: var(--card); transition: all var(--duration-normal);
    }
    .hi-step.active .hi-step__circle {
      border-color: var(--accent); color: var(--accent-foreground);
      background: var(--accent);
    }
    .hi-step.done .hi-step__circle {
      border-color: var(--success); color: #fff;
      background: var(--success);
    }
    .hi-step__label {
      font-size: 12px; color: var(--muted); transition: color var(--duration-fast);
    }
    .hi-step.active .hi-step__label { color: var(--accent); font-weight: 600; }
    .hi-step.done .hi-step__label { color: var(--success); }

    .hi-step-line {
      flex: 1; height: 2px; background: var(--border);
      margin: 0 -8px; margin-bottom: 20px;
    }
    .hi-step-line.done { background: var(--success); }

    /* === content card === */
    .hi-content {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 24px 28px;
      box-shadow: var(--shadow-card); margin-bottom: 16px;
    }
    .hi-content__desc {
      font-size: 13px; color: var(--text-soft); line-height: 1.6;
      margin-bottom: 16px;
    }
    .hi-content__loading {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-soft);
      padding: 12px 16px; background: var(--bg-muted);
      border-radius: var(--radius-sm); border: 1px solid var(--border);
    }
    .hi-spinner {
      width: 16px; height: 16px; border: 2px solid var(--border);
      border-top-color: var(--accent); border-radius: 50%;
      animation: hi-spin 0.8s linear infinite;
    }
    @keyframes hi-spin { to { transform: rotate(360deg); } }

    .hi-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; margin-bottom: 6px;
      background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15);
      border-radius: var(--radius-sm); font-size: 13px; color: var(--text);
      animation: hi-fadeIn 0.3s ease;
    }
    .hi-item__icon { color: var(--success); flex-shrink: 0; }
    .hi-item__text { font-family: var(--font-mono); font-size: 12px; }

    @keyframes hi-fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hi-doc-link {
      text-align: right; font-size: 12px; color: var(--accent);
      cursor: pointer; text-decoration: none;
    }
    .hi-doc-link:hover { text-decoration: underline; }

    .hi-complete {
      text-align: center; padding: 24px;
    }
    .hi-complete__icon {
      width: 48px; height: 48px; margin: 0 auto 12px;
      background: var(--success-subtle); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .hi-complete__title {
      font-size: 16px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .hi-complete__desc {
      font-size: 13px; color: var(--text-soft);
    }

    /* === config form (step 3) === */
    .hi-config-title {
      font-size: 16px; font-weight: 700; color: var(--text-strong); margin-bottom: 4px;
    }
    .hi-config-subtitle {
      font-size: 12px; color: var(--text-soft); margin-bottom: 20px;
    }
    .hi-config-section {
      font-size: 12px; font-weight: 600; color: var(--text-soft);
      margin-bottom: 8px; margin-top: 16px;
    }
    .hi-config-presets {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;
    }
    .hi-config-presets button {
      padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hi-config-presets button:hover { background: var(--bg-hover); color: var(--text); }
    .hi-config-presets button.active {
      background: var(--accent-subtle); color: var(--accent); border-color: var(--accent);
    }
    .hi-config-label {
      font-size: 12px; font-weight: 600; color: var(--text-soft);
      margin-bottom: 6px; margin-top: 14px; font-style: italic;
    }
    .hi-config-input {
      width: 100%; padding: 8px 12px; background: var(--bg-muted);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; font-family: var(--font-mono);
      outline: none;
    }
    .hi-config-input:focus { border-color: var(--accent); }
    .hi-config-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .hi-config-row .hi-config-input { flex: 1; }
    .hi-config-btn {
      padding: 8px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); white-space: nowrap;
    }
    .hi-config-btn:hover { background: var(--bg-hover); color: var(--text); }
    .hi-config-actions {
      display: flex; gap: 10px; margin-top: 20px; align-items: center;
    }
    .hi-btn-save {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
    }
    .hi-btn-save:hover { background: var(--accent-hover); }
    .hi-btn-test {
      padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft);
    }
    .hi-btn-test:hover { background: var(--bg-hover); color: var(--text); }
    .hi-btn-skip {
      padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: none; cursor: pointer;
      background: transparent; color: var(--text-soft);
    }
    .hi-btn-skip:hover { color: var(--text); }
  `;

  @property({ type: Function }) onNavigate = () => {};

  @state() _currentStep = 0;
  @state() _visibleItems: Array<Array<string>> = [[], [], [], [], []];
  @state() _selectedPreset = '';
  @state() _apiBase = 'https://openrouter.ai/api/v1';
  @state() _apiKey = '';
  @state() _model = 'anthropic/claude-sonnet-4-20250514';

  _timers: ReturnType<typeof setTimeout>[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._startStep(0);
  }

  _selectPreset(name: string) {
    this._selectedPreset = name;
    const urls: Record<string, string> = {
      'OpenAI 官方': 'https://api.openai.com/v1',
      'Anthropic 官方': 'https://api.anthropic.com',
      'Google Gemini': 'https://generativelanguage.googleapis.com/v1beta/openai',
      'DeepSeek': 'https://api.deepseek.com/v1',
      'OpenRouter': 'https://openrouter.ai/api/v1',
      '硅基流动': 'https://api.siliconflow.cn/v1',
      'Ollama (本地)': 'http://127.0.0.1:11434/v1',
    };
    if (urls[name]) this._apiBase = urls[name];
  }

  _startStep(step: number) {
    this._currentStep = step;
    const contentKey = STEP_CONTENT_KEYS[step];
    const items: string[] = contentKey ? (Lget(contentKey) || []) : [];

    // Step 2 (配置) doesn't auto-advance - wait for user to click save
    if (step === 2) return;

    if (step < 4) {
      items.forEach((item, i) => {
        const t = setTimeout(() => {
          this._visibleItems = this._visibleItems.map((arr, si) =>
            si === step ? [...arr, item] : arr
          );
        }, (i + 1) * 1000);
        this._timers.push(t);
      });

      const advanceTimer = setTimeout(() => {
        this._startStep(step + 1);
      }, 10000);
      this._timers.push(advanceTimer);
    } else {
      items.forEach(item => {
        this._visibleItems = this._visibleItems.map((arr, si) =>
          si === step ? [...arr, item] : arr
        );
      });
    }
  }

  _saveConfig() {
    this._startStep(3);
  }

  _skipConfig() {
    this._startStep(3);
  }

  render() {
    const currentItems = this._visibleItems[this._currentStep] || [];
    const contentKey = STEP_CONTENT_KEYS[this._currentStep];
    const allItems: string[] = contentKey ? (Lget(contentKey) || []) : [];
    const isLastStep = this._currentStep === 4;
    const isConfigStep = this._currentStep === 2;
    const allVisible = currentItems.length === allItems.length;

    return html`
      <div class="page-content" style="padding:24px 24px 0;">
        <div class="hi-page-title">${L('hermesInstaller.title', 'Hermes Agent')}</div>
        <div class="hi-page-subtitle">${L('hermesInstaller.subtitle', '使用 U盘内置 Hermes Agent')}</div>
      </div>

      <div class="page-content" style="padding:0 24px 24px;">
        <!-- Stepper -->
        <div class="hi-stepper">
          ${STEP_LABELS_KEYS.map((key, i) => html`
            ${i > 0 ? html`<div class="hi-step-line ${i < this._currentStep ? 'done' : ''}"></div>` : ''}
            <div class="hi-step ${i === this._currentStep ? 'active' : ''} ${i < this._currentStep ? 'done' : ''}">
              <div class="hi-step__circle">
                ${i < this._currentStep ? html`
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ` : i + 1}
              </div>
              <div class="hi-step__label">${L(key)}</div>
            </div>
          `)}
        </div>

        <!-- Content -->
        <div class="hi-content">
          ${isConfigStep ? this._renderConfigForm() : html`
            <div class="hi-content__desc">
              ${L('hermesInstaller.desc', 'Hermes Agent 的运行时、配置和日志都保存在 U盘中。首次缺少组件时可一键补齐，无需终端操作。')}
            </div>

            ${!isLastStep && !allVisible ? html`
              <div class="hi-content__loading">
                <div class="hi-spinner"></div>
                ${this._currentStep === 0 ? L('hermesInstaller.checking', '正在检测环境...') : ''}
              </div>
            ` : ''}

            ${currentItems.map(text => html`
              <div class="hi-item">
                <span class="hi-item__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span class="hi-item__text">${text}</span>
              </div>
            `)}

            ${isLastStep && allVisible ? html`
              <div class="hi-complete" style="margin-top:16px;">
                <div class="hi-complete__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="hi-complete__title">${L('hermesInstaller.completeTitle', '安装完成')}</div>
                <div class="hi-complete__desc">${L('hermesInstaller.completeDesc', '所有组件已安装并配置完成，可以开始使用 Hermes Agent')}</div>
              </div>
            ` : ''}
          `}
        </div>

        <div class="hi-doc-link">${L('hermesInstaller.viewDocs', '查看完整文档')} →</div>
      </div>
    `;
  }

  _renderConfigForm() {
    return html`
      <div class="hi-config-title">${L('hermesInstaller.configTitle', '配置 Hermes Agent')}</div>
      <div class="hi-config-subtitle">${L('hermesInstaller.configSubtitle', '设置 LLM Provider 以启用 AI 功能')}</div>

      ${PROVIDER_GROUPS.map(group => html`
        <div class="hi-config-section">${L(group.groupKey)}</div>
        <div class="hi-config-presets">
          ${group.items.map(p => html`
            <button class="${this._selectedPreset === p ? 'active' : ''}"
              @click=${() => this._selectPreset(p)}>${p}</button>
          `)}
        </div>
      `)}

      <div class="hi-config-label">API Base URL</div>
      <input class="hi-config-input" type="text" .value=${this._apiBase}
        placeholder="https://openrouter.ai/api/v1"
        @input=${(e: Event) => { this._apiBase = (e.target as HTMLInputElement).value; this._selectedPreset = ''; }} />

      <div class="hi-config-label">API Key</div>
      <div class="hi-config-row">
        <input class="hi-config-input" type="password" .value=${this._apiKey}
          placeholder="sk-..."
          @input=${(e: Event) => { this._apiKey = (e.target as HTMLInputElement).value; }} />
        <button class="hi-config-btn">${L('hermesInstaller.fetchModels', '获取模型列表')}</button>
      </div>

      <div class="hi-config-label">${L('hermesInstaller.model', '模型')}</div>
      <input class="hi-config-input" type="text" .value=${this._model}
        placeholder="anthropic/claude-sonnet-4-20250514"
        @input=${(e: Event) => { this._model = (e.target as HTMLInputElement).value; }} />

      <div class="hi-config-actions">
        <button class="hi-btn-save" @click=${this._saveConfig}>${L('hermesInstaller.saveConfig', '保存配置')}</button>
        <button class="hi-btn-test">${L('hermesInstaller.testConn', '测试连通性')}</button>
        <button class="hi-btn-skip" @click=${this._skipConfig}>${L('hermesInstaller.skipLater', '跳过，稍后配置')}</button>
      </div>
    `;
  }
}

customElements.define('hermes-installer-page', HermesInstallerPage);
