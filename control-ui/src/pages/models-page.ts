import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/oc-dialog.js';
import '../components/page-header.js';

/**
 * ModelsPage — 模型配置页
 *
 * 功能：
 *  - 添加/编辑/删除服务商（Provider）
 *  - 每个服务商下可添加多个模型（输入模型名回车添加）
 *  - 标记主模型（★），其余作为备选自动切换
 *  - 搜索模型（按 ID 或服务商名过滤）
 *  - 配置自动保存到 localStorage，刷新不丢失
 *  - 「撤销」一键清空全部服务商
 */

type ModelEntry = { id: string; isPrimary: boolean };
type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  apiType: string;
  models: ModelEntry[];
};

type ConfirmState = {
  title: string;
  message: string;
  onConfirm: () => void;
};

const STORAGE_KEY = 'openclaw.models.config';

const PROVIDER_PRESETS = [
  { name: 'GPT+Claude推荐中转', baseUrl: '', models: ['gpt-4o', 'claude-sonnet-4-5'] },
  { name: '硅基流动', baseUrl: 'https://api.siliconflow.cn/v1', models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'] },
  { name: '火山引擎', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-1-5-pro-32k', 'deepseek-v3-250324'] },
  { name: '火山引擎 Coding', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', models: ['doubao-seed-code-preview-251028'] },
  { name: '阿里云百炼', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  { name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', models: ['glm-4-plus', 'glm-4-flash'] },
  { name: 'MiniMax', baseUrl: 'https://api.minimax.chat/v1', models: ['MiniMax-Text-01'] },
  { name: 'Moonshot / Kimi', baseUrl: 'https://api.moonshot.cn/v1', models: ['moonshot-v1-8k', 'moonshot-v1-32k'] },
  { name: 'OpenAI 官方', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'] },
  { name: 'Anthropic 官方', baseUrl: 'https://api.anthropic.com', models: ['claude-sonnet-4-5', 'claude-opus-4-1'] },
  { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
  { name: 'xAI (Grok)', baseUrl: 'https://api.x.ai/v1', models: ['grok-3', 'grok-3-mini'] },
  { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile'] },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-sonnet-4', 'openai/gpt-4o'] },
  { name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1', models: ['meta/llama-3.1-70b-instruct'] },
  { name: 'Ollama (本地)', baseUrl: 'http://127.0.0.1:11434/v1', models: ['llama3.1', 'qwen2.5'] },
];

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
    .save-flash {
      margin-left: auto; font-size: 12px; color: var(--success);
      display: inline-flex; align-items: center; gap: 4px;
      animation: save-in 0.25s ease;
    }
    @keyframes save-in { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }

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

    /* === confirm dialog === */
    .confirm-msg { font-size: 13px; color: var(--text); line-height: 1.7; padding: 4px 0; }
    .btn-danger {
      background: var(--danger) !important; color: #fff !important; border-color: var(--danger) !important;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _providers: ProviderConfig[] = [];
  @state() _expanded: Record<string, boolean> = {};
  @state() _search = '';
  @state() _saveFlash = false;

  // 添加/编辑对话框状态
  @state() _dialogOpen = false;
  @state() _editingId: string | null = null;
  @state() _formProviderName = '';
  @state() _formBaseUrl = '';
  @state() _formApiKey = '';
  @state() _formApiType = 'openai';
  @state() _formSelectedPreset = '';
  @state() _formModels: string[] = [];
  @state() _formModelInput = '';

  // 确认对话框状态
  @state() _confirm: ConfirmState | null = null;

  // 行内添加模型的输入（按 provider id 索引）
  _inlineInputs: Record<string, string> = {};
  _saveTimer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  // ── 持久化 ──────────────────────────────────────────

  _load() {
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
            apiType: String(p.apiType ?? 'openai'),
            models: Array.isArray(p.models)
              ? p.models.map((m: any) => ({ id: String(m.id ?? ''), isPrimary: !!m.isPrimary }))
              : [],
          }));
        }
      }
    } catch { /* 损坏的配置忽略，从空开始 */ }
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ providers: this._providers }));
    } catch { /* localStorage 不可用时静默 */ }
    this._saveFlash = true;
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => { this._saveFlash = false; }, 1800);
  }

  // ── 对话框：打开 / 关闭 ─────────────────────────────

  _openAddDialog() {
    this._editingId = null;
    this._formProviderName = '';
    this._formBaseUrl = '';
    this._formApiKey = '';
    this._formApiType = 'openai';
    this._formSelectedPreset = '';
    this._formModels = [];
    this._formModelInput = '';
    this._dialogOpen = true;
  }

  _openEditDialog(id: string) {
    const p = this._providers.find(x => x.id === id);
    if (!p) return;
    this._editingId = id;
    this._formProviderName = p.name;
    this._formBaseUrl = p.baseUrl;
    this._formApiKey = p.apiKey;
    this._formApiType = p.apiType;
    this._formSelectedPreset = '';
    this._formModels = p.models.map(m => m.id);
    this._formModelInput = '';
    this._dialogOpen = true;
  }

  _closeDialog() {
    this._dialogOpen = false;
  }

  _selectPreset(preset: any) {
    this._formSelectedPreset = preset.name;
    this._formProviderName = preset.name;
    this._formBaseUrl = preset.baseUrl;
    this._formModels = [...preset.models];
    if (preset.name.includes('Ollama')) this._formApiType = 'ollama';
    else if (preset.name.includes('Anthropic')) this._formApiType = 'anthropic';
    else if (preset.name.includes('Gemini')) this._formApiType = 'google';
    else this._formApiType = 'openai';
  }

  // ── 对话框：模型 chips ──────────────────────────────

  _addFormModel() {
    const parts = this._formModelInput.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const merged = [...this._formModels];
    for (const p of parts) if (!merged.includes(p)) merged.push(p);
    this._formModels = merged;
    this._formModelInput = '';
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
      // 编辑模式：更新字段，保留已有模型的主模型标记
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
          name,
          baseUrl: this._formBaseUrl.trim(),
          apiKey: this._formApiKey.trim(),
          apiType: this._formApiType,
          models,
        };
      });
    } else {
      // 新增模式：生成唯一 id
      const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'provider';
      let id = baseId, n = 2;
      while (this._providers.some(p => p.id === id)) id = `${baseId}_${n++}`;
      const models: ModelEntry[] = this._formModels.map((mid, i) => ({ id: mid, isPrimary: i === 0 }));
      this._providers = [...this._providers, {
        id, name,
        baseUrl: this._formBaseUrl.trim(),
        apiKey: this._formApiKey.trim(),
        apiType: this._formApiType,
        models,
      }];
      this._expanded = { ...this._expanded, [id]: true };
    }

    this._persist();
    this._dialogOpen = false;
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
        this._persist();
      },
    };
  }

  _askRevokeAll() {
    if (!this._providers.length) return;
    this._confirm = {
      title: L('models.revokeAllTitle'),
      message: L('models.revokeAllConfirm'),
      onConfirm: () => {
        this._providers = [];
        this._expanded = {};
        this._persist();
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
    this._persist();
  }

  _deleteModel(providerId: string, modelId: string) {
    this._providers = this._providers.map(p => {
      if (p.id !== providerId) return p;
      let models = p.models.filter(m => m.id !== modelId);
      if (models.length && !models.some(m => m.isPrimary)) {
        models = models.map((m, i) => ({ ...m, isPrimary: i === 0 }));
      }
      return { ...p, models };
    });
    this._persist();
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
    this.persist_inline(providerId);
    this._persist();
  }

  persist_inline(providerId: string) {
    // 触发重渲染（_inlineInputs 不是响应式状态，手动 requestUpdate）
    this.requestUpdate();
    void providerId;
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
    const all = this._providers.flatMap(p => p.models.map(m => ({ ...m, provider: p.name })));
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
              ? html`<span class="sys-row__value">${primary.id}</span>
                     <span class="sys-row__sub">${primary.provider}</span>`
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
            ${provider.baseUrl ? html`<span class="provider-group__url">${provider.baseUrl}</span>` : ''}
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
                  style="${this._formSelectedPreset === p.name ? 'background:var(--accent-subtle);color:var(--accent);border-color:var(--accent);' : ''}"
                  @click=${() => this._selectPreset(p)}
                >${p.name}</button>
              `)}
            </div>
            <div class="form-hint" style="margin-bottom:12px;">${L('models.quickSelectHint')}</div>
          ` : ''}

          <!-- 服务商名称 -->
          <div class="form-group">
            <label class="form-label">${L('models.providerName')}</label>
            <input class="form-input" type="text" .value=${this._formProviderName}
              placeholder="如 deepseek"
              @input=${(e: Event) => { this._formProviderName = (e.target as HTMLInputElement).value; this._formSelectedPreset = ''; }}
            />
            <div class="form-hint">${L('models.providerNameHint')}</div>
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

          <!-- API Key -->
          <div class="form-group">
            <label class="form-label">${L('models.apiKey')}</label>
            <input class="form-input" type="password" .value=${this._formApiKey}
              placeholder="sk-..."
              @input=${(e: Event) => { this._formApiKey = (e.target as HTMLInputElement).value; }}
            />
            <div class="form-hint">${L('models.apiKeyHint')}</div>
          </div>

          <!-- 接口类型 -->
          <div class="form-group">
            <label class="form-label">${L('models.apiType')}</label>
            <select class="form-input" .value=${this._formApiType}
              @change=${(e: Event) => { this._formApiType = (e.target as HTMLSelectElement).value; }}
            >
              <option value="openai">${L('models.apiTypeOpenAI')}</option>
              <option value="anthropic">${L('models.apiTypeAnthropic')}</option>
              <option value="google">${L('models.apiTypeGoogle')}</option>
              <option value="ollama">${L('models.apiTypeOllama')}</option>
            </select>
            <div class="form-hint">${L('models.apiTypeHint')}</div>
          </div>

          <!-- 模型列表 -->
          <div class="form-group">
            <label class="form-label">${L('models.modelList')}</label>
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
          <button class="btn-cancel" @click=${this._closeDialog}>${L('models.cancel')}</button>
          <button class="btn-confirm" @click=${this._confirmProvider}>${L('models.confirm')}</button>
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
          <button class="btn-cancel" @click=${this._closeConfirm}>${L('models.cancel')}</button>
          <button class="btn-confirm btn-danger" @click=${this._runConfirm}>${L('models.delete')}</button>
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
        <!-- 工具栏 -->
        <div class="models-toolbar">
          <button class="btn-add" @click=${this._openAddDialog}>
            ${icons['plus']} ${L('models.addProvider')}
          </button>
          <button class="btn-revoke" @click=${this._askRevokeAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            ${L('models.revoke')}
          </button>
          ${this._saveFlash ? html`<span class="save-flash">${icons['check']} ${L('models.saved')}</span>` : ''}
        </div>

        <!-- 提示 -->
        <div class="models-hint">${L('models.hint')}</div>

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
