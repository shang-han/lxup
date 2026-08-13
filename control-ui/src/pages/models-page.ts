import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import '../components/oc-dialog.js';
import '../components/oc-btn.js';
import '../components/page-header.js';

/**
 * ModelsPage — 模型配置页
 *
 * 权威数据源 = OpenClaw 网关配置（WS RPC config.get / config.patch）：
 *   - 服务商/模型    → config.models.providers（字典：{ <id>: { baseUrl, apiKey, models[] } }）
 *   - 主模型（★）   → config.agents.defaults.model（"provider/model" 引用）
 * 保存采用读-改-写 + baseHash 乐观并发，replacePaths 限定 models/agents 两棵子树，
 * 且回写完整子树（保留模型条目的 contextWindow/cost 等元数据与其他 agent 配置）。
 *
 * 离线可编辑（模型配置不依赖网关启动）：
 *  - 网关已连接：改动直接经 config.patch 写入网关，并镜像到 localStorage；
 *  - 网关未连接：改动先写 localStorage 镜像，并在 localStorage 记录「待同步」
 *    （openclaw.models.pending-sync，含待删服务商 id，跨页面跳转不丢）；
 *    网关（重新）连上后自动把本地配置 merge-push 到网关，成功后清除待同步标记。
 * localStorage（openclaw.models.config）同时供聊天页/AI 页等读取方使用。
 *
 * Hermes 模式（engine=hermes）：页面 UI 与 OpenClaw 完全一致（同一套渲染/对话框），
 * 仅数据层换到 Sidecar——读取 GET /api/hermes/model 映射为单个「Hermes」服务商，
 * 保存 POST /api/hermes/model 写 config.yaml（热加载）；不落 OpenClaw 的
 * localStorage 镜像、不碰网关 RPC、不同步 Agent 认证仓库。
 *
 * 功能：
 *  - 添加/编辑/删除服务商（Provider）
 *  - 每个服务商下可添加多个模型（输入模型名回车添加）
 *  - 标记主模型（★），写入 agents.defaults.model
 *  - 搜索模型（按 ID 或服务商名过滤）
 *  - 「撤销」一键清空全部服务商
 */

type ModelEntry = { id: string; isPrimary: boolean };
type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: ModelEntry[];
};

type ConfirmState = {
  title: string;
  message: string;
  onConfirm: () => void;
};

/** localStorage 镜像 key（与 utils/model-config.ts 共用） */
const STORAGE_KEY = 'openclaw.models.config';

/** 网关 config.get 会用此占位符隐藏密钥，不能把它当作真实凭据保存或转发。 */
const REDACTED_SECRET = '__OPENCLAW_REDACTED__';
function isRedactedSecret(value: unknown): boolean {
  const text = String(value ?? '');
  return text.includes(REDACTED_SECRET) || text.includes('****');
}

/**
 * 离线「待同步」标记 key：网关未连接时的改动先落本地，
 * 记录在此（含待删服务商 id），网关连上后自动推送并清除。
 * 组件卸载会丢实例状态，故必须持久化在 localStorage。
 */
const PENDING_KEY = 'openclaw.models.pending-sync';

/** key=稳定标识（选中态比较/无 labelKey 时即显示名）；labelKey=本地化显示名（自动填充也用本地化名）。
 *  专属名称用官方英文品牌：Volcano Engine / Zhipu AI / Alibaba Cloud Model Studio。 */
const PROVIDER_PRESETS = [
  { key: 'relay', labelKey: 'presetRelay', baseUrl: '', models: ['gpt-4o', 'claude-sonnet-4-5'] },
  { key: 'volcengine', labelKey: 'presetVolcengine', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-1-5-pro-32k', 'deepseek-v3-250324'] },
  { key: 'volcengine-coding', labelKey: 'presetVolcengineCoding', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-seed-code-preview-251028'] },
  { key: 'bailian', labelKey: 'presetBailian', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  { key: 'zhipu', labelKey: 'presetZhipu', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4-flash'] },
  { key: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', models: ['MiniMax-Text-01'] },
  { key: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  { key: 'openai-official', labelKey: 'presetOpenAIOfficial', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'] },
  { key: 'anthropic-official', labelKey: 'presetAnthropicOfficial', baseUrl: 'https://api.anthropic.com', models: ['claude-sonnet-4-5', 'claude-opus-4-1'] },
  { key: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { key: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
  { key: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', models: ['grok-3', 'grok-3-mini'] },
  { key: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile'] },
  { key: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o'] },
  { key: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', models: ['meta/llama-3.1-70b-instruct'] },
  { key: 'ollama-local', labelKey: 'presetOllamaLocal', baseUrl: 'http://127.0.0.1:11434/v1', models: ['llama3.1', 'qwen2.5'] },
];

/** 弹框「接口类型」→ 网关 provider.api 标识（openai/ollama 走 OpenAI 兼容，openclaw 默认） */
const API_TYPE_TO_GATEWAY: Record<string, string> = {
  openai: 'openai-completions',
  anthropic: 'anthropic-messages',
  google: 'google-generative-ai',
  ollama: 'openai-completions',
};
function apiTypeFromRaw(raw: any): string {
  const api = String(raw?.api ?? '');
  if (api === 'anthropic-messages') return 'anthropic';
  if (api.startsWith('google-')) return 'google';
  return 'openai';
}

/** 主模型星标 SVG（icons.ts 中没有 star） */
const starSvg = (filled: boolean) => html`
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`;

export class ModelsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .models-page { width: 100%; }

    /* === toolbar === */
    .models-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .models-toolbar .btn-add {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 4px;
    }
    .models-toolbar .btn-add:hover { background: var(--accent-hover); }
    .models-toolbar .btn-revoke {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .models-toolbar .btn-revoke:hover { background: var(--bg-hover); color: var(--text); }
    .source-badge {
      font-size: 11px; color: var(--muted); border: 1px solid var(--border);
      padding: 2px 10px; border-radius: var(--radius-full);
    }
    .save-flash {
      margin-left: auto; font-size: 12px; color: var(--success);
      display: inline-flex; align-items: center; gap: 4px;
      animation: save-in 0.25s ease;
    }
    .saving-hint {
      margin-left: auto; font-size: 12px; color: var(--muted);
      display: inline-flex; align-items: center; gap: 4px;
    }
    @keyframes save-in { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
    .models-error {
      font-size: 12px; color: var(--danger); margin: -4px 0 12px;
      word-break: break-all;
    }
    .models-notice {
      font-size: 12px; color: var(--muted); margin: -4px 0 12px;
    }
    .models-pending {
      font-size: 12px; color: var(--warn); margin: -4px 0 12px;
      display: flex; align-items: center; gap: 6px;
    }


    /* === back link（从隐藏页进入时显示）=== */
    .models-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 10px; text-decoration: none;
    }
    .models-back:hover { text-decoration: underline; }

    /* === hint === */
    .models-hint {
      font-size: 12px; color: var(--muted); line-height: 1.6; margin-bottom: 12px;
    }

    /* === provider group === */
    .provider-group {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      margin-bottom: 12px; box-shadow: var(--shadow-card); overflow: hidden;
    }
    .provider-group__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; cursor: pointer; user-select: none;
      transition: background var(--duration-fast);
    }
    .provider-group__header:hover { background: var(--bg-hover); }
    .provider-group__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .provider-group__chevron {
      width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: transform var(--duration-fast); flex-shrink: 0;
    }
    .provider-group__chevron.open { transform: rotate(90deg); }
    .provider-group__name { font-size: 14px; font-weight: 600; color: var(--text-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .provider-group__url { font-size: 11px; color: var(--muted); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .provider-group__right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .provider-group__status { font-size: 12px; color: var(--text-soft); }
    .provider-group__status .unconfigured { color: var(--danger); }
    .provider-group__actions { display: flex; gap: 2px; opacity: 0; transition: opacity var(--duration-fast); }
    .provider-group__header:hover .provider-group__actions { opacity: 1; }
    .icon-btn {
      width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .icon-btn:hover { background: var(--bg-active); color: var(--text); }
    .icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); }
    .provider-group__body { padding: 0 18px 14px; display: none; }
    .provider-group.open .provider-group__body { display: block; }

    /* === model rows === */
    .model-list { border-top: 1px solid var(--border); }
    .model-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 4px; border-bottom: 1px solid var(--border);
      transition: background var(--duration-fast);
    }
    .model-row:last-child { border-bottom: none; }
    .model-row:hover { background: var(--bg-hover); }
    .model-row.primary { border-left: 2px solid var(--accent); padding-left: 8px; }
    .model-row__star {
      width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer; transition: all var(--duration-fast); flex-shrink: 0;
    }
    .model-row__star:hover { color: var(--warn); background: var(--bg-active); }
    .model-row__star.on { color: var(--warn); }
    .model-row__id { font-family: var(--font-mono); font-size: 13px; color: var(--text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .model-row__badge {
      font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
      padding: 2px 8px; border-radius: var(--radius-full);
      background: var(--accent-subtle); color: var(--accent); flex-shrink: 0;
    }
    .inline-add { display: flex; gap: 8px; padding-top: 12px; }
    .inline-add input {
      flex: 1; padding: 7px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      font-family: var(--font-mono); outline: none; transition: border-color var(--duration-fast);
    }
    .inline-add input:focus { border-color: var(--accent); }
    .inline-add input::placeholder { color: var(--muted); font-family: var(--font-sans, inherit); }
    .inline-add button {
      padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 4px;
    }
    .inline-add button:hover { background: var(--accent-hover); }
    .no-models { color: var(--muted); font-size: 13px; padding: 10px 0 2px; }

    /* === system group === */
    .sys-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .sys-row__label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--muted);
      width: 52px; flex-shrink: 0;
    }
    .sys-row__value { font-family: var(--font-mono); font-size: 13px; color: var(--text-strong); }
    .sys-row__value.empty { color: var(--muted); font-style: italic; font-family: var(--font-sans, inherit); font-size: 12px; }
    .sys-row__sub { font-size: 11px; color: var(--muted); }

    /* === search === */
    .models-search {
      width: 280px; max-width: 100%; padding: 7px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .models-search::placeholder { color: var(--muted); }
    .models-search:focus { border-color: var(--accent); }

    /* === empty state === */
    .models-empty { text-align: center; padding: 60px 24px; color: var(--muted); font-size: 13px; }

    /* === dialog: provider form === */
    .provider-form .quick-picks { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .provider-form .quick-picks button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .provider-form .quick-picks button:hover { background: var(--bg-hover); color: var(--text); border-color: var(--text-muted); }
    .provider-form .form-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); text-decoration: none;
      margin-bottom: 16px; cursor: pointer;
    }
    .provider-form .form-link:hover { text-decoration: underline; }
    .provider-form .form-group { margin-bottom: 14px; }
    .provider-form .form-label {
      display: block; font-size: 12px; font-weight: 500; color: var(--text);
      margin-bottom: 4px;
    }
    .provider-form .form-input {
      width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast); box-sizing: border-box;
    }
    .provider-form .form-input:focus { border-color: var(--accent); }
    .provider-form .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
    .provider-form .form-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
    .provider-form select.form-input { cursor: pointer; }

    /* === dialog: model chips === */
    .model-input-row { display: flex; gap: 8px; }
    .model-input-row input { flex: 1; font-family: var(--font-mono); }
    .model-input-row button {
      padding: 8px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); white-space: nowrap;
    }
    .model-input-row button:hover { background: var(--accent-hover); }
    .model-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .model-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 6px 4px 10px; border-radius: var(--radius-full);
      background: var(--bg-hover); border: 1px solid var(--border);
      font-family: var(--font-mono); font-size: 12px; color: var(--text);
      animation: chip-in 0.18s ease;
    }
    @keyframes chip-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: none; } }
    .model-chip:first-child { border-color: var(--accent); background: var(--accent-subtle); }
    .model-chip__primary { font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: var(--accent); }
    .model-chip button {
      width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: 50%;
      color: var(--muted); cursor: pointer; transition: all var(--duration-fast); padding: 0;
    }
    .model-chip button:hover { background: var(--danger-subtle); color: var(--danger); }
    .common-models { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
    .common-models__label { font-size: 11px; color: var(--muted); }
    .common-models button {
      padding: 2px 9px; border-radius: var(--radius-full); font-size: 11px;
      font-family: var(--font-mono); border: 1px dashed var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .common-models button:hover { border-color: var(--accent); color: var(--accent); border-style: solid; }

    /* === fetch models button & status === */
    .btn-fetch-models {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--accent);
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .btn-fetch-models:hover:not(:disabled) { background: var(--accent-subtle); border-color: var(--accent); }
    .btn-fetch-models:disabled { opacity: 0.6; cursor: not-allowed; }
    .fetch-spinner {
      display: inline-block; width: 12px; height: 12px;
      border: 2px solid var(--border); border-top-color: var(--accent);
      border-radius: 50%; animation: fetch-spin 0.6s linear infinite;
    }
    @keyframes fetch-spin { to { transform: rotate(360deg); } }
    .fetch-msg { font-size: 11px; margin-top: 4px; line-height: 1.4; }
    .fetch-msg-ok { color: var(--success); }
    .fetch-msg-err { color: var(--danger); }

    /* === confirm dialog === */
    .confirm-msg { font-size: 13px; color: var(--text); line-height: 1.7; padding: 4px 0; }
    .btn-danger {
      background: var(--danger) !important; color: #fff !important; border-color: var(--danger) !important;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  /** 引擎：openclaw 走网关 RPC（openclaw.json）；hermes 走 Sidecar（config.yaml，保存即热加载） */
  @property({ type: String }) engine = 'openclaw';

  /** 来源页：从 Hermes 服务页进入时显示返回链接 */
  @property({ type: String }) backTo = '';
  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  get _isHermes(): boolean { return this.engine === 'hermes'; }

  @state() _providers: ProviderConfig[] = [];
  @state() _expanded: Record<string, boolean> = {};
  @state() _search = '';
  @state() _saveFlash = false;

  // 网关连接 / 数据源状态
  @state() _connected = false;
  @state() _source: 'gateway' | 'local' = 'local';
  @state() _saving = false;
  @state() _saveError = '';
  // 离线改动待同步（网关连上后自动推送）
  @state() _pendingLocal = false;
  // 轻量提示（如离线刷新反馈），数秒后自动消失
  @state() _notice = '';

  // 添加/编辑对话框状态
  @state() _dialogOpen = false;
  @state() _editingId: string | null = null;
  @state() _formProviderName = '';
  @state() _formApiType = 'openai';
  @state() _formBaseUrl = '';
  @state() _formApiKey = '';
  @state() _formSelectedPreset = '';
  @state() _formModels: string[] = [];
  @state() _formModelInput = '';

  // 获取模型列表状态
  @state() _formFetchingModels = false;
  @state() _formFetchError = '';

  // 确认对话框状态
  @state() _confirm: ConfirmState | null = null;

  // 行内添加模型的输入（按 provider id 索引）
  _inlineInputs: Record<string, string> = {};
  _saveTimer: ReturnType<typeof setTimeout> | null = null;
  _noticeTimer: ReturnType<typeof setTimeout> | null = null;
  _storeUnsub: (() => void) | null = null;

  /** 网关侧模型条目原始元数据（contextWindow/cost/compat…），保存时原样带回避免丢字段 */
  _rawModels: Record<string, Record<string, any>> = {};
  /** 网关侧服务商条目原始字段，保存时合并回写 */
  _rawProviders: Record<string, any> = {};
  /** 待删除的服务商 id（merge-patch 不会自动删键，保存时显式置 null + 精确路径） */
  _pendingDeletes = new Set<string>();
  /** 当前 agents.defaults.model 引用（"provider/model"） */
  _defaultModelRef = '';

  connectedCallback() {
    super.connectedCallback();
    if (this._isHermes) {
      // Hermes 模式：不碰 OpenClaw 网关 RPC / localStorage 镜像，直接读 Sidecar 配置
      this._loadHermesConfig();
      return;
    }
    const store = getSharedStore();
    // 恢复上次离线编辑留下的待同步改动（实例状态随页面卸载丢失，只认 localStorage）
    const pend = this._readPending();
    if (pend) {
      this._pendingLocal = true;
      this._pendingDeletes = new Set(pend.deletes);
    }
    this._storeUnsub = store.subscribe(snap => {
      const was = this._connected;
      this._connected = snap.connected;
      // 网关（重新）连上：有待同步的本地改动就推送，否则拉取权威配置
      if (snap.connected && !was) {
        if (this._pendingLocal) {
          this._loadFromLocal(); // 先恢复本地视图，别用网关配置覆盖离线改动
          this._saveToGateway(); // merge-push 到网关，成功后自动清待同步
        } else {
          this._loadFromGateway();
        }
      }
    });
    // subscribe 会同步回灌当前快照：已连接时上面已触发加载/同步；未连接时走本地兜底
    if (!store.connected) this._loadFromGateway();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
    if (this._saveTimer) clearTimeout(this._saveTimer);
    if (this._noticeTimer) clearTimeout(this._noticeTimer);
  }

  // ── 加载 ──────────────────────────────────────────

  /** 从网关 config.get 加载（权威数据源）；不可达时回退本地缓存 */
  async _loadFromGateway() {
    const store = getSharedStore();
    if (!store.connected) {
      this._loadFromLocal();
      // 刷新在离线时只是重载本地缓存，给出提示避免「点了没反应」的观感
      if (!this._pendingLocal) this._showNotice(L('models.offlineRefreshed'));
      return;
    }
    try {
      const g = await store.request<any>('config.get', {});
      const cfg = g?.config || g?.parsed || {};
      const provs = cfg?.models?.providers || {};
      const m = cfg?.agents?.defaults?.model;
      this._defaultModelRef = typeof m === 'string' ? m : (m?.model || '');

      const rawProviders: Record<string, any> = {};
      const rawModels: Record<string, Record<string, any>> = {};
      const list: ProviderConfig[] = [];
      for (const [id, rawAny] of Object.entries(provs)) {
        const raw = (rawAny || {}) as any;
        const previous = this._providers.find(p => p.id === id);
        const returnedKey = String(raw.apiKey ?? '');
        rawProviders[id] = raw;
        const metas: Record<string, any> = {};
        const models: ModelEntry[] = [];
        for (const mm of (Array.isArray(raw.models) ? raw.models : [])) {
          const mid = typeof mm === 'string' ? mm : String(mm?.id ?? '');
          if (!mid) continue;
          metas[mid] = mm;
          models.push({ id: mid, isPrimary: this._defaultModelRef === `${id}/${mid}` });
        }
        rawModels[id] = metas;
        list.push({
          id,
          name: id,
          baseUrl: String(raw.baseUrl ?? ''),
          // config.get redacts secrets; retain an in-memory real key after save,
          // otherwise the following auth sync would overwrite it with the sentinel.
          apiKey: isRedactedSecret(returnedKey)
            ? (previous && !isRedactedSecret(previous.apiKey) ? previous.apiKey : '')
            : returnedKey,
          apiType: apiTypeFromRaw(raw),
          models,
        });
      }
      this._providers = list;
      this._rawProviders = rawProviders;
      this._rawModels = rawModels;
      this._source = 'gateway';
      this._saveError = '';
      this._mirrorToLS();
    } catch (e) {
      this._loadFromLocal();
      this._saveError = e instanceof Error ? e.message : String(e);
    }
  }

  /** 本地缓存兜底（网关不可达时只读展示） */
  _loadFromLocal() {
    this._source = 'local';
    this._rawProviders = {};
    this._rawModels = {};
    this._defaultModelRef = '';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data?.providers)) {
          this._providers = data.providers.map((p: any) => ({
            id: String(p.id ?? ''),
            name: String(p.name ?? ''),
            baseUrl: String(p.baseUrl ?? ''),
            apiKey: String(p.apiKey ?? ''),
            models: Array.isArray(p.models)
              ? p.models.map((m: any) => ({ id: String(m.id ?? ''), isPrimary: !!m.isPrimary }))
              : [],
          }));
          return;
        }
      }
    } catch { /* 损坏的缓存忽略，从空开始 */ }
    this._providers = [];
  }

  /** 镜像到 localStorage，供 utils/model-config.ts 的读取方（聊天/AI 页）使用 */
  _mirrorToLS() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        providers: this._providers.map(p => ({
          ...p,
          apiKey: isRedactedSecret(p.apiKey) ? '' : p.apiKey,
          apiType: p.apiType || 'openai',
        })),
      }));
    } catch { /* localStorage 不可用时静默 */ }
  }

  // ── 保存（在线写网关 / 离线写本地待同步）──────────────

  /** 统一保存入口：在线直写网关（权威）；离线落本地缓存，网关连上后自动同步 */
  _save() {
    if (this._isHermes) {
      // Hermes：写 config.yaml（Sidecar），不落 OpenClaw 的 localStorage 镜像
      this._saveToHermes();
      return;
    }
    const store = getSharedStore();
    if (store.connected) this._saveToGateway();
    else this._saveToLocal();
  }

  /** 将非空 API Key 同步写入 Agent 认证仓库（Sidecar 跑 openclaw paste-api-key） */
  _syncAuthKeys() {
    const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
    for (const p of this._providers) {
      const key = (p.apiKey || '').trim();
      if (!key || isRedactedSecret(key)) continue;
      fetch(`http://${host}:7889/api/models/auth/set-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: p.id, apiKey: key }),
      }).catch(() => { /* 静默，不影响主流程 */ });
    }
  }

  /** 离线保存：写 localStorage 镜像 + 记录待同步标记 */
  _saveToLocal() {
    this._mirrorToLS();
    this._writePending();
    this._saveError = '';
    this._saveFlash = true;
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => { this._saveFlash = false; }, 1800);
    this._syncAuthKeys();
  }

  /** 轻量提示（3 秒自动消失） */
  _showNotice(msg: string) {
    this._notice = msg;
    if (this._noticeTimer) clearTimeout(this._noticeTimer);
    this._noticeTimer = setTimeout(() => { this._notice = ''; }, 3000);
  }

  // ── 待同步标记（持久化在 localStorage，跨页面跳转不丢）──

  _readPending(): { deletes: string[] } | null {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      return { deletes: Array.isArray(p?.deletes) ? p.deletes.map((x: any) => String(x)) : [] };
    } catch { return null; }
  }

  _writePending() {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ deletes: [...this._pendingDeletes] }));
    } catch { /* localStorage 不可用时静默 */ }
    this._pendingLocal = true;
  }

  _clearPending() {
    try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
    this._pendingLocal = false;
  }

  /**
   * 写回网关：config.patch（baseHash 乐观并发，merge-patch 语义）。
   *
   * 实测得到的网关契约：
   *  - 合并语义：raw 中缺失的键保持原值 → 天然保留模型条目元数据与其他配置
   *  - 删键：值置 null，且必须在 replacePaths 列出精确路径
   *    （'models.providers.<id>' 与其数组 'models.providers.<id>.models'），
   *    否则被「数组删除保护」拒绝
   *  - 模型条目 name 为必填 → 新条目补 {id, name: id}
   *  - agents.defaults.model 接受 "provider/model" 字符串；清除用 null + 精确路径
   *  - 限速：config.patch 3 次/分钟 → 失败时展示错误并允许重试
   */
  async _saveToGateway() {
    const store = getSharedStore();
    if (!store.connected) {
      this._saveError = L('models.gwDisconnected');
      return;
    }
    this._saving = true;
    this._saveError = '';
    try {
      const g = await store.request<any>('config.get', {});
      const cfg = g?.config || g?.parsed || {};
      const existing = (cfg?.models?.providers || {}) as Record<string, any>;
      const replacePaths: string[] = ['agents.defaults.model'];
      const providersPatch: Record<string, any> = {};

      // 删除项：null + 精确路径
      for (const id of this._pendingDeletes) {
        if (existing[id] !== undefined) {
          providersPatch[id] = null;
          replacePaths.push(`models.providers.${id}`, `models.providers.${id}.models`);
        }
      }

      // 新增/更新项：合并回原始条目字段；模型数组显式声明替换意图
      for (const p of this._providers) {
        const orig = { ...(this._rawProviders[p.id] || {}) };
        // Never include the gateway's redacted value in a patch. Omitting the
        // field preserves the existing secret under merge-patch semantics.
        if (isRedactedSecret(orig.apiKey)) delete orig.apiKey;
        const metas = this._rawModels[p.id] || {};
        providersPatch[p.id] = {
          ...orig,
          ...(p.baseUrl ? { baseUrl: p.baseUrl } : {}),
          ...(p.apiKey && !isRedactedSecret(p.apiKey) ? { apiKey: p.apiKey } : {}),
          api: API_TYPE_TO_GATEWAY[p.apiType] || 'openai-completions',
          models: p.models.map(m => metas[m.id] || { id: m.id, name: m.id }),
        };
        replacePaths.push(`models.providers.${p.id}.models`);
      }

      // 主模型引用；无主模型则置 null 清除引用
      let primaryRef = '';
      for (const p of this._providers) {
        const pm = p.models.find(x => x.isPrimary);
        if (pm) { primaryRef = `${p.id}/${pm.id}`; break; }
      }

      await store.request('config.patch', {
        raw: JSON.stringify({
          models: { providers: providersPatch },
          agents: { defaults: { model: primaryRef || null } },
        }),
        baseHash: g?.hash || '',
        replacePaths,
      });

      this._defaultModelRef = primaryRef;
      this._pendingDeletes.clear();
      this._clearPending();
      this._mirrorToLS();
      this._saveFlash = true;
      if (this._saveTimer) clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => { this._saveFlash = false; }, 1800);
      // 以网关归一化后的配置为准（刷新 hash 与元数据缓存）
      await this._loadFromGateway();
      // 将 API Key 同步写入 Agent 认证仓库（OpenClaw Agent 读的 openclaw-agent.sqlite）
      this._syncAuthKeys();
    } catch (e) {
      this._saveError = this._errMsg(e);
    } finally {
      this._saving = false;
    }
  }

  /** GatewayError 的 message 是 JSON 串，提取其中的可读信息 */
  _errMsg(e: unknown): string {
    const raw = e instanceof Error ? e.message : String(e);
    try {
      const j = JSON.parse(raw);
      if (j?.message) return String(j.message);
    } catch { /* 非 JSON，原样返回 */ }
    return raw;
  }

  // ── 对话框：打开 / 关闭 ─────────────────────────────

  _openAddDialog() {
    // 离线也允许配置（先落本地，网关连上后自动同步），不强制网关启动
    this._editingId = null;
    this._formProviderName = '';
    this._formApiType = 'openai';
    this._formBaseUrl = '';
    this._formApiKey = '';
    this._formSelectedPreset = '';
    this._formModels = [];
    this._formModelInput = '';
    this._formFetchingModels = false;
    this._formFetchError = '';
    this._dialogOpen = true;
  }

  _openEditDialog(id: string) {
    const p = this._providers.find(x => x.id === id);
    if (!p) return;
    this._editingId = id;
    this._formProviderName = p.name;
    this._formApiType = p.apiType || 'openai';
    this._formBaseUrl = p.baseUrl;
    this._formApiKey = p.apiKey;
    this._formSelectedPreset = '';
    this._formModels = p.models.map(m => m.id);
    this._formModelInput = '';
    this._dialogOpen = true;
  }

  _closeDialog() {
    this._dialogOpen = false;
  }

  /** Sidecar HTTP 基址 */
  get _sidecarBase(): string {
    const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
    return `http://${host}:7889`;
  }

  // ── Hermes 模式：数据层适配（页面 UI 与 OpenClaw 完全一致，只换后端读写）──

  /** 读取 Hermes 当前模型配置 → 映射成本页的「服务商 + 模型」结构 */
  async _loadHermesConfig() {
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`, { headers: sidecarHeaders() });
      if (!r.ok) return;
      const c = (await r.json()) as { name?: string; baseUrl?: string; apiKey?: string; hasKey?: boolean };
      const name = (c.name || '').trim();
      if (!name && !c.baseUrl) {
        this._providers = [];
        this._defaultModelRef = '';
        return;
      }
      this._defaultModelRef = name ? `hermes/${name}` : '';
      this._providers = [{
        id: 'hermes',
        name: name || 'Hermes',          // 卡片标题直接显示模型名（与 OpenClaw 一致）
        baseUrl: String(c.baseUrl || ''),
        apiKey: String(c.apiKey || ''),  // 打码值，保存时后端会保留原 Key
        models: name ? [{ id: name, isPrimary: true }] : [],
      }];
      this._rawProviders = {};
      this._rawModels = {};
      this._saveError = '';
    } catch { /* Sidecar 离线时忽略，保存时会报错 */ }
  }

  /** 保存 Hermes 模型配置：取页面上第一个服务商的主模型（或第一个模型）写 config.yaml；
   *  模型已删空时调用 DELETE /api/hermes/model 清空配置（对应 OpenClaw 的删除语义） */
  async _saveToHermes() {
    this._saving = true;
    this._saveError = '';
    try {
      let name = '', baseUrl = '', apiKey = '';
      for (const p of this._providers) {
        const m = p.models.find(x => x.isPrimary) || p.models[0];
        if (!m) continue;
        name = m.id; baseUrl = p.baseUrl; apiKey = p.apiKey; break;
      }
      let d: { success?: boolean } = {};
      if (name) {
        const r = await fetch(`${this._sidecarBase}/api/hermes/model`, {
          method: 'POST',
          headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ name, baseUrl: baseUrl.trim(), apiKey: apiKey.trim() }),
        });
        d = (await r.json()) as { success?: boolean };
      } else {
        // 模型删空 → 清空 Hermes 模型配置，页面回到「未配置」空态
        const r = await fetch(`${this._sidecarBase}/api/hermes/model`, {
          method: 'DELETE',
          headers: sidecarHeaders(),
        });
        d = (await r.json().catch(() => ({}))) as { success?: boolean };
      }
      if (d.success) {
        this._defaultModelRef = name ? `hermes/${name}` : '';
        this._saveFlash = true;
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => { this._saveFlash = false; }, 1800);
        await this._loadHermesConfig();
      } else {
        this._saveError = L('hermesDashboard.saveFailed');
      }
    } catch {
      this._saveError = L('hermesDashboard.sidecarOffline');
    } finally {
      this._saving = false;
    }
  }

  /** 通过 Sidecar 代理探测 OpenAI 兼容端点，获取模型列表 */
  async _fetchModels() {
    const baseUrl = this._formBaseUrl.trim();
    if (!baseUrl) {
      this._formFetchError = `✗ ${L('models.fetchModelsNeedUrl')}`;
      return;
    }
    this._formFetchingModels = true;
    this._formFetchError = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model/probe`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ baseUrl, apiKey: this._formApiKey.trim() }),
      });
      const text = await r.text().catch(() => '');
      let d: { ok?: boolean; error?: string; models?: string[] } = {};
      try { d = JSON.parse(text); } catch { /* non-JSON response from sidecar auth middleware */ }
      // Sidecar 自身认证失败（JSONResponse 带 detail 字段）
      if (!d.ok && !d.error && (r.status === 401 || r.status === 403)) {
        throw new Error(`Sidecar ${r.status} — ${text}`);
      }
      if (!d.ok) {
        const err = d.error || '';
        if (err.includes('401') || err.includes('403')) {
          throw new Error(L('models.fetchModelsNeedApiKey'));
        }
        throw new Error(err || `HTTP ${r.status}`);
      }
      const models = d.models || [];
      if (!models.length) {
        this._formFetchError = `✗ ${L('models.fetchModelsNoModels')}`;
        return;
      }
      this._formModels = models;
      this._formFetchError = `✓ ${L('models.fetchModelsOk', { n: models.length })}`;
    } catch (e) {
      this._formFetchError = `✗ ${L('models.fetchModelsFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._formFetchingModels = false;
    }
  }

  /** 预设显示名：有 labelKey 走本地化，否则用 key（英文专有名词两种语言一致） */
  _presetLabel(preset: any): string {
    return preset.labelKey ? L(`models.${preset.labelKey}`) : preset.key;
  }

  _selectPreset(preset: any) {
    this._formSelectedPreset = preset.key;
    this._formProviderName = this._presetLabel(preset);
    if (preset.baseUrl) this._formBaseUrl = preset.baseUrl;
    this._formModels = [];
    this._formFetchError = '';
    // 仅当用户已填写 API Key 时才自动获取模型列表
    if (preset.baseUrl && this._formApiKey.trim()) {
      this._formFetchingModels = true;
      this.requestUpdate();
      this._fetchModels().finally(() => { this._formFetchingModels = false; this.requestUpdate(); });
    }
  }

  // ── 对话框：模型 chips ──────────────────────────────

  _addFormModel() {
    const raw = this._formModelInput;
    if (!raw) return;
    const parts = raw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const merged = [...this._formModels];
    for (const p of parts) if (!merged.includes(p)) merged.push(p);
    this._formModels = merged;
    this._formModelInput = '';
    this.requestUpdate();
  }

  _onFormModelKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); this._addFormModel(); }
  }

  _removeFormModel(id: string) {
    this._formModels = this._formModels.filter(m => m !== id);
  }

  _addCommonModel(id: string) {
    if (!this._formModels.includes(id)) this._formModels = [...this._formModels, id];
  }

  // ── 提交对话框（新增 or 保存编辑）────────────────────

  _confirmProvider() {
    const name = this._formProviderName.trim();
    if (!name) return;

    if (this._editingId) {
      // 编辑模式：服务商 id（网关配置键）不变，更新其余字段，保留主模型标记
      this._providers = this._providers.map(p => {
        if (p.id !== this._editingId) return p;
        const oldPrimary = p.models.find(m => m.isPrimary)?.id;
        let models: ModelEntry[] = this._formModels.map(id => ({
          id,
          isPrimary: id === oldPrimary,
        }));
        if (models.length && !models.some(m => m.isPrimary)) models[0].isPrimary = true;
        return {
          ...p,
          baseUrl: this._formBaseUrl.trim(),
          apiKey: this._formApiKey.trim(),
          apiType: this._formApiType,
          models,
        };
      });
    } else {
      // 新增模式：名称转成合法配置键作为 id
      const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'provider';
      let id = baseId, n = 2;
      while (this._providers.some(p => p.id === id)) id = `${baseId}_${n++}`;
      const models: ModelEntry[] = this._formModels.map((mid, i) => ({ id: mid, isPrimary: i === 0 }));
      this._providers = [...this._providers, {
        id, name: id,
        baseUrl: this._formBaseUrl.trim(),
        apiKey: this._formApiKey.trim(),
        apiType: this._formApiType,
        models,
      }];
      this._expanded = { ...this._expanded, [id]: true };
    }

    this._dialogOpen = false;
    this.requestUpdate();
    this._save();
  }

  // ── 服务商：删除 / 清空 ─────────────────────────────

  _askDeleteProvider(id: string) {
    const p = this._providers.find(x => x.id === id);
    if (!p) return;
    this._confirm = {
      title: L('models.deleteProviderTitle'),
      message: L('models.deleteProviderConfirm', { name: p.name, count: p.models.length }),
      onConfirm: () => {
        this._providers = this._providers.filter(x => x.id !== id);
        this._pendingDeletes.add(id);
        this._save();
      },
    };
  }

  _askRevokeAll() {
    if (!this._providers.length) return;
    this._confirm = {
      title: L('models.revokeAllTitle'),
      message: L('models.revokeAllConfirm'),
      onConfirm: () => {
        for (const p of this._providers) this._pendingDeletes.add(p.id);
        this._providers = [];
        this._expanded = {};
        this._save();
      },
    };
  }

  _closeConfirm() {
    this._confirm = null;
  }

  _runConfirm() {
    this._confirm?.onConfirm();
    this._confirm = null;
  }

  // ── 模型：主模型 / 删除 / 行内添加 ──────────────────

  _togglePrimary(providerId: string, modelId: string) {
    this._providers = this._providers.map(p => {
      if (p.id !== providerId) return p;
      return {
        ...p,
        models: p.models.map(m => ({ ...m, isPrimary: m.id === modelId ? !m.isPrimary : false })),
      };
    });
    // 若取消后没有任何主模型，第一个自动顶上
    const p = this._providers.find(x => x.id === providerId);
    if (p && p.models.length && !p.models.some(m => m.isPrimary)) {
      this._providers = this._providers.map(x => x.id !== providerId ? x : {
        ...x, models: x.models.map((m, i) => ({ ...m, isPrimary: i === 0 })),
      });
    }
    this.requestUpdate();
    this._save();
  }

  _deleteModel(providerId: string, modelId: string) {
    // 删除的若是主模型，网关侧引用一并清除（保存时按当前状态重算引用）
    this._providers = this._providers.map(p => {
      if (p.id !== providerId) return p;
      const models = p.models.filter(m => m.id !== modelId);
      return { ...p, models };
    });
    this.requestUpdate();
    this._save();
  }

  _addInlineModel(providerId: string) {
    const input = this._inlineInputs[providerId]?.trim();
    if (!input) return;
    const ids = input.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    this._providers = this._providers.map(p => {
      if (p.id !== providerId) return p;
      const existing = new Set(p.models.map(m => m.id));
      const models = [...p.models];
      for (const id of ids) if (!existing.has(id)) models.push({ id, isPrimary: models.length === 0 });
      return { ...p, models };
    });
    this._inlineInputs[providerId] = '';
    this.requestUpdate();
    this._save();
  }

  _onInlineKeydown(e: KeyboardEvent, providerId: string) {
    if (e.key === 'Enter') { e.preventDefault(); this._addInlineModel(providerId); }
  }

  _toggleExpand(id: string) {
    this._expanded = { ...this._expanded, [id]: !this._expanded[id] };
  }

  // ── 搜索 ────────────────────────────────────────────

  _matches(provider: ProviderConfig, q: string): { providerHit: boolean; modelIds: Set<string> | null } {
    if (!q) return { providerHit: true, modelIds: null };
    const providerHit = provider.name.toLowerCase().includes(q);
    const modelIds = new Set(
      provider.models.filter(m => m.id.toLowerCase().includes(q)).map(m => m.id)
    );
    return { providerHit, modelIds };
  }

  // ── 渲染：系统主/备模型 ─────────────────────────────

  _renderSystemGroup() {
    // Hermes 模式下服务商名固定为 Hermes，系统区与 OpenClaw 同格式显示「服务商/模型」
    const all = this._providers.flatMap(p => p.models.map(m => ({ ...m, provider: this._isHermes ? 'Hermes' : p.name })));
    const primary = all.find(m => m.isPrimary);
    const backups = all.filter(m => !m.isPrimary);
    const total = all.length;

    return html`
      <div class="provider-group open" style="margin-bottom:12px;">
        <div class="provider-group__header" style="cursor:default;">
          <div class="provider-group__left">
            <span class="provider-group__chevron open">${icons['chevron-right']}</span>
            <span class="provider-group__name">${L('models.systemMainBackup')}</span>
          </div>
          <span class="provider-group__status">
            ${total > 0
              ? html`<span style="color:var(--success)">${L('models.modelsTotal', { providers: this._providers.length, count: total })}</span>`
              : html`<span class="unconfigured">${L('models.unconfigured')}</span>`}
          </span>
        </div>
        <div class="provider-group__body" style="display:block;">
          <div class="sys-row">
            <span class="sys-row__label">${L('models.systemPrimary')}</span>
            ${primary
              ? html`<span class="sys-row__value">${primary.provider}/${primary.id}</span>
                     <span class="sys-row__sub">${primary.provider}</span>`
              : this._defaultModelRef
                ? html`<span class="sys-row__value">${this._defaultModelRef}</span>
                       <span class="sys-row__sub">${L('dashboard.fromGatewayConfig')}</span>`
                : html`<span class="sys-row__value empty">${L('models.notSet')}</span>`}
          </div>
          <div class="sys-row">
            <span class="sys-row__label">${L('models.systemBackup')}</span>
            ${backups.length
              ? html`<span class="sys-row__value">${backups.slice(0, 3).map(b => b.id).join('、')}${backups.length > 3 ? ' …' : ''}</span>
                     <span class="sys-row__sub">${backups.length} ${L('models.candidates')}</span>`
              : html`<span class="sys-row__value empty">${L('models.notSet')}</span>`}
          </div>
        </div>
      </div>
    `;
  }

  // ── 渲染：服务商分组 ────────────────────────────────

  _renderProviderGroup(provider: ProviderConfig, q: string) {
    const { providerHit, modelIds } = this._matches(provider, q);
    if (q && !providerHit && modelIds!.size === 0) return '';

    const visibleModels = providerHit || !q
      ? provider.models
      : provider.models.filter(m => modelIds!.has(m.id));
    const isExpanded = !!this._expanded[provider.id] || (q.length > 0 && visibleModels.length > 0);
    const modelCount = provider.models.length;
    const hasConfig = modelCount > 0;

    return html`
      <div class="provider-group ${isExpanded ? 'open' : ''}">
        <div class="provider-group__header" @click=${() => this._toggleExpand(provider.id)}>
          <div class="provider-group__left">
            <span class="provider-group__chevron ${isExpanded ? 'open' : ''}">${icons['chevron-right']}</span>
            <span class="provider-group__name">${provider.name}</span>
            ${!this._isHermes && provider.baseUrl ? html`<span class="provider-group__url">${provider.baseUrl}</span>` : ''}
          </div>
          <div class="provider-group__right">
            <span class="provider-group__status">
              ${hasConfig
                ? html`<span style="color:var(--success)">${modelCount} ${L('models.modelsCount')}</span>`
                : html`<span class="unconfigured">${L('models.unconfigured')}</span> <span style="color:var(--muted)">0 ${L('models.candidates')}</span>`}
            </span>
            <span class="provider-group__actions" @click=${(e: Event) => e.stopPropagation()}>
              <button class="icon-btn" title=${L('models.edit')} @click=${() => this._openEditDialog(provider.id)}>${icons['edit']}</button>
              <button class="icon-btn danger" title=${L('models.delete')} @click=${() => this._askDeleteProvider(provider.id)}>${icons['trash']}</button>
            </span>
          </div>
        </div>
        <div class="provider-group__body">
          ${visibleModels.length ? html`
            <div class="model-list">
              ${visibleModels.map(m => html`
                <div class="model-row ${m.isPrimary ? 'primary' : ''}">
                  <button class="model-row__star ${m.isPrimary ? 'on' : ''}"
                    title=${m.isPrimary ? L('models.primary') : L('models.setPrimary')}
                    @click=${() => this._togglePrimary(provider.id, m.id)}>
                    ${starSvg(m.isPrimary)}
                  </button>
                  <span class="model-row__id">${m.id}</span>
                  ${m.isPrimary ? html`<span class="model-row__badge">${L('models.primary')}</span>` : ''}
                  <button class="icon-btn danger" title=${L('models.delete')}
                    @click=${() => this._deleteModel(provider.id, m.id)}>${icons['x']}</button>
                </div>
              `)}
            </div>
          ` : html`<div class="no-models">${L('models.noModels')}</div>`}
          <div class="inline-add">
            <input type="text" placeholder=${L('models.addModelInline')}
              .value=${this._inlineInputs[provider.id] ?? ''}
              @input=${(e: Event) => { this._inlineInputs[provider.id] = (e.target as HTMLInputElement).value; this.requestUpdate(); }}
              @keydown=${(e: KeyboardEvent) => this._onInlineKeydown(e, provider.id)}
            />
            <button @click=${() => this._addInlineModel(provider.id)}>${icons['plus']} ${L('models.addModel')}</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── 渲染：添加/编辑对话框 ───────────────────────────

  _renderDialog() {
    const isEdit = !!this._editingId;
    const preset = PROVIDER_PRESETS.find(p => p.name === this._formSelectedPreset);

    return html`
      <oc-dialog .open=${this._dialogOpen} @close=${this._closeDialog}>
        <span slot="title">${isEdit ? L('models.editDialogTitle') : L('models.dialogTitle')}</span>
        <div class="provider-form">
          ${!isEdit ? html`
            <!-- 快捷选择（仅新增时显示） -->
            <div style="font-size:13px;font-weight:600;color:var(--text-strong);margin-bottom:8px;">${L('models.quickSelect')}</div>
            <div class="quick-picks">
              ${PROVIDER_PRESETS.map(p => html`
                <button
                  style="${this._formSelectedPreset === p.key ? 'background:var(--accent-subtle);color:var(--accent);border-color:var(--accent);' : ''}"
                  @click=${() => this._selectPreset(p)}
                >${this._presetLabel(p)}</button>
              `)}
            </div>
            <div class="form-hint" style="margin-bottom:12px;">${L('models.quickSelectHint')}</div>
          ` : ''}

          <!-- 服务商名称（即网关配置键，编辑时不可改） -->
          <div class="form-group">
            <label class="form-label">${L('models.providerName')}</label>
            <input class="form-input" type="text" .value=${this._formProviderName}
              placeholder=${L('models.providerNamePlaceholder')} ?disabled=${isEdit}
              @input=${(e: Event) => { this._formProviderName = (e.target as HTMLInputElement).value; this._formSelectedPreset = ''; }}
            />
            <div class="form-hint">${isEdit ? L('models.providerIdLocked') : L('models.providerNameHint')}</div>
          </div>

          <!-- 接口地址 -->
          <div class="form-group">
            <label class="form-label">${L('models.apiUrl')}</label>
            <input class="form-input" type="text" .value=${this._formBaseUrl}
              placeholder="https://api.deepseek.com/v1"
              @input=${(e: Event) => { this._formBaseUrl = (e.target as HTMLInputElement).value; }}
            />
            <div class="form-hint">${L('models.apiUrlHint')}</div>
          </div>

          <!-- 接口类型（写入网关 provider.api；OpenAI 兼容为默认） -->
          <div class="form-group">
            <label class="form-label">${L('models.apiType')}</label>
            <select class="form-input" .value=${this._formApiType}
              @change=${(e: Event) => { this._formApiType = (e.target as HTMLSelectElement).value; }}>
              <option value="openai">${L('models.apiTypeOpenAI')}</option>
              <option value="anthropic">${L('models.apiTypeAnthropic')}</option>
              <option value="google">${L('models.apiTypeGoogle')}</option>
              <option value="ollama">${L('models.apiTypeOllama')}</option>
            </select>
            <div class="form-hint">${L('models.apiTypeHint')}</div>
          </div>

          <!-- API Key -->
          <div class="form-group">
            <label class="form-label">${L('models.apiKey')}</label>
            <input class="form-input" type="password" .value=${this._formApiKey}
              placeholder="sk-..."
              @input=${(e: Event) => { this._formApiKey = (e.target as HTMLInputElement).value; }}
            />
            <div class="form-hint">${L('models.apiKeyHint')}</div>
          </div>

          <!-- 模型列表 -->
          <div class="form-group">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <label class="form-label" style="margin-bottom:0;">${L('models.modelList')}</label>
              <button class="btn-fetch-models"
                ?disabled=${this._formFetchingModels}
                @click=${this._fetchModels}>
                ${this._formFetchingModels
                  ? html`<span class="fetch-spinner"></span> ${L('models.fetchingModels')}`
                  : html`${icons['refresh-cw']} ${L('models.fetchModelsBtn')}`}
              </button>
            </div>
            ${this._formFetchError ? html`
              <div class="fetch-msg ${this._formFetchError.startsWith('✓') ? 'fetch-msg-ok' : 'fetch-msg-err'}">${this._formFetchError}</div>
            ` : ''}
            <div class="model-input-row">
              <input class="form-input" type="text" .value=${this._formModelInput}
                placeholder=${L('models.modelPlaceholder')}
                @input=${(e: Event) => { this._formModelInput = (e.target as HTMLInputElement).value; }}
                @keydown=${this._onFormModelKeydown}
              />
              <button @click=${this._addFormModel}>+ ${L('models.addModel')}</button>
            </div>
            ${this._formModels.length ? html`
              <div class="model-chips">
                ${this._formModels.map((m, i) => html`
                  <span class="model-chip">
                    ${m}
                    ${i === 0 ? html`<span class="model-chip__primary">${L('models.primary')}</span>` : ''}
                    <button title=${L('models.delete')} @click=${() => this._removeFormModel(m)}>${icons['x']}</button>
                  </span>
                `)}
              </div>
            ` : ''}
            ${preset?.models?.length ? html`
              <div class="common-models">
                <span class="common-models__label">${L('models.commonModels')}:</span>
                ${preset.models.filter((m: string) => !this._formModels.includes(m)).map((m: string) => html`
                  <button @click=${() => this._addCommonModel(m)}>+ ${m}</button>
                `)}
              </div>
            ` : ''}
            <div class="form-hint">${L('models.modelListHint')}</div>
          </div>
        </div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeDialog}>${L('common.cancel')}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._confirmProvider}>${L('common.confirm')}</oc-btn>
        </div>
      </oc-dialog>
    `;
  }

  // ── 渲染：确认对话框 ────────────────────────────────

  _renderConfirm() {
    return html`
      <oc-dialog .open=${!!this._confirm} @close=${this._closeConfirm}>
        <span slot="title">${this._confirm?.title ?? ''}</span>
        <div class="confirm-msg">${this._confirm?.message ?? ''}</div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeConfirm}>${L('common.cancel')}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._runConfirm}>${L('common.confirm')}</oc-btn>
        </div>
      </oc-dialog>
    `;
  }

  render() {
    const hasProviders = this._providers.length > 0;
    const q = this._search.trim().toLowerCase();
    const visible = this._providers.filter(p => {
      const { providerHit, modelIds } = this._matches(p, q);
      return providerHit || (modelIds?.size ?? 0) > 0;
    });

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="models-page">
        ${this.backTo === 'hermes-service' ? html`
          <a class="models-back" @click=${() => this.onNavigate('hermes-service')}>
            ← ${L('hermesConfig.backToService')}
          </a>
        ` : ''}
        <!-- 工具栏 -->
        <div class="models-toolbar">
          <button class="btn-add" @click=${this._openAddDialog}>
            ${icons['plus']} ${L('models.addProvider')}
          </button>
          <button class="btn-revoke" @click=${this._askRevokeAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            ${L('models.revoke')}
          </button>
          ${this._saving
            ? html`<span class="saving-hint">${L('models.saving')}</span>`
            : this._saveFlash ? html`<span class="save-flash">${icons['check']} ${L('models.saved')}</span>` : ''}
        </div>
        ${this._saveError ? html`
          <div class="models-error">
            ✗ ${this._saveError}
            <button class="btn-revoke" style="margin-left:8px;padding:2px 10px;" @click=${() => this._save()}>${L('models.retrySave')}</button>
          </div>
        ` : ''}
        ${this._pendingLocal ? html`
          <div class="models-pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${L('models.pendingSyncHint')}
          </div>
        ` : this._notice ? html`
          <div class="models-notice">${this._notice}</div>
        ` : ''}

        <!-- 提示 -->
        <div class="models-hint">${L(this._isHermes ? 'hermesDashboard.modelPageHint' : 'models.hint')}</div>

        <!-- 系统主/备模型 -->
        ${this._renderSystemGroup()}

        <!-- 搜索 + 服务商列表 -->
        ${hasProviders ? html`
          <div style="margin-bottom:12px;">
            <input class="models-search" type="text"
              .value=${this._search}
              @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
              placeholder=${L('models.searchModels')}
            />
          </div>

          ${visible.length
            ? visible.map(p => this._renderProviderGroup(p, q))
            : html`<div class="models-empty">${L('models.noMatch')}</div>`}
        ` : html`
          <div class="models-empty">${L('models.noProviders')}</div>
        `}

        ${this._renderDialog()}
        ${this._renderConfirm()}
      </div>
    `;
  }
}

customElements.define('models-page', ModelsPage);
