import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesMemoryPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hm-hero {
      background: var(--accent-subtle); border: 1px solid var(--accent);
      border-radius: var(--radius-lg); padding: 24px 28px; margin-bottom: 20px;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
    }
    .hm-hero__label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 8px;
    }
    .hm-hero__title {
      font-size: 22px; font-weight: 700; color: var(--text-strong); margin-bottom: 8px;
    }
    .hm-hero__desc {
      font-size: 13px; color: var(--text-soft); line-height: 1.6;
    }
    .hm-stats {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--card); min-width: 220px; flex-shrink: 0;
    }
    .hm-stat {
      padding: 10px 16px; border-bottom: 1px solid var(--border);
    }
    .hm-stat:nth-child(odd) { border-right: 1px solid var(--border); }
    .hm-stat:nth-child(n+3) { border-bottom: none; }
    .hm-stat__label { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
    .hm-stat__value { font-size: 18px; font-weight: 700; color: var(--text-strong); }

    .hm-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 16px;
      box-shadow: var(--shadow-card);
    }
    .hm-card__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .hm-card__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: var(--text-strong);
    }
    .hm-card__meta { font-size: 12px; color: var(--muted); }
    .hm-card__edit {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .hm-card__edit:hover { background: var(--bg-hover); color: var(--text); }
    .hm-card__section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 6px;
    }
    .hm-card__desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 14px;
    }
    .hm-card__content {
      background: var(--bg-muted); border: 1px dashed var(--border);
      border-radius: var(--radius-sm); padding: 16px 18px;
      font-size: 13px; color: var(--muted); line-height: 1.6;
    }
    .hm-card__content .placeholder-title {
      font-weight: 600; color: var(--text-soft); margin-bottom: 4px;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = `${L('hermesMemory.path', '~/.hermes/memories/')} · 3 ${L('hermesMemory.files', '个文件')}`;

  @state() _memories: Record<string, { content: string; words: number }> = {
    memory: { content: '', words: 0 },
    user: { content: '', words: 0 },
    soul: { content: '', words: 0 },
  };
  @state() _editing: string | null = null;
  @state() _editContent = '';

  get _totalFiles() { return 3; }
  get _filledCount() {
    return Object.values(this._memories).filter(m => m.content.trim()).length;
  }
  get _totalWords() {
    return Object.values(this._memories).reduce((sum, m) => sum + m.words, 0);
  }

  _sections = [
    { key: 'memory', labelKey: 'hermesMemory.memoryLabel', titleKey: 'hermesMemory.memory', descKey: 'hermesMemory.memoryDesc', placeholderKey: 'hermesMemory.memoryPlaceholder', placeholderDescKey: 'hermesMemory.memoryPlaceholderDesc' },
    { key: 'user', labelKey: 'hermesMemory.userLabel', titleKey: 'hermesMemory.user', descKey: 'hermesMemory.userDesc', placeholderKey: 'hermesMemory.userPlaceholder', placeholderDescKey: 'hermesMemory.userPlaceholderDesc' },
    { key: 'soul', labelKey: 'hermesMemory.soulLabel', titleKey: 'hermesMemory.soul', descKey: 'hermesMemory.soulDesc', placeholderKey: 'hermesMemory.soulPlaceholder', placeholderDescKey: 'hermesMemory.soulPlaceholderDesc' },
  ];

  _startEdit(key: string) {
    this._editing = key;
    this._editContent = this._memories[key].content;
  }

  _saveEdit() {
    if (!this._editing) return;
    const words = this._editContent.trim() ? this._editContent.trim().split(/\s+/).length : 0;
    this._memories = {
      ...this._memories,
      [this._editing]: { content: this._editContent, words },
    };
    this._editing = null;
    this._editContent = '';
  }

  render() {
    const filled = `${this._filledCount}/${this._totalFiles}`;

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);" @click=${() => this.requestUpdate()}>
          ${L('common.refresh', '刷新')}
        </button>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <!-- Hero + Stats -->
        <div class="hm-hero">
          <div>
            <div class="hm-hero__label">${L('hermesMemory.memoryLabel', 'MEMORY')}</div>
            <div class="hm-hero__title">${L('hermesMemory.heroTitle', '三份 Markdown，组成 Agent 的长期上下文')}</div>
            <div class="hm-hero__desc">${L('hermesMemory.heroDesc', '笔记记录事实，用户画像沉淀偏好，灵魂档案塑造人格。Hermes 会在会话中持续读取这些长期记忆。')}</div>
          </div>
          <div class="hm-stats">
            <div class="hm-stat">
              <div class="hm-stat__label">${L('hermesMemory.memoryFiles', '记忆文件')}</div>
              <div class="hm-stat__value">${this._totalFiles}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${L('hermesMemory.filled', '已填写')}</div>
              <div class="hm-stat__value">${filled}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${L('hermesMemory.totalWords', '总词数')}</div>
              <div class="hm-stat__value">${this._totalWords}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${L('hermesMemory.lastUpdated', '最近更新')}</div>
              <div class="hm-stat__value">—</div>
            </div>
          </div>
        </div>

        <!-- Memory sections -->
        ${this._sections.map(sec => {
          const mem = this._memories[sec.key];
          const isEditing = this._editing === sec.key;

          return html`
            <div class="hm-card">
              <div class="hm-card__header">
                <div class="hm-card__title">
                  ${sec.key === 'memory' ? icons['scroll-text'] : sec.key === 'user' ? icons['users'] : icons['sparkles']}
                  ${L(sec.titleKey)}
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                  <span class="hm-card__meta">${mem.words} ${L('hermesMemory.words', '词')} · 0 ${L('hermesMemory.chars', '字符')}</span>
                  <button class="hm-card__edit" @click=${() => isEditing ? this._saveEdit() : this._startEdit(sec.key)}>
                    ${icons['edit']} ${isEditing ? L('common.save', '保存') : L('hermesMemory.edit', '编辑')}
                  </button>
                </div>
              </div>

              <div class="hm-card__section-label">${L(sec.labelKey)}</div>
              <div class="hm-card__desc">${L(sec.descKey)}</div>

              ${isEditing ? html`
                <textarea class="config-editor" style="min-height:100px;"
                  .value=${this._editContent}
                  @input=${(e: Event) => { this._editContent = (e.target as HTMLTextAreaElement).value; }}
                  placeholder=${L(sec.placeholderDescKey)}
                ></textarea>
              ` : html`
                <div class="hm-card__content">
                  ${mem.content.trim() ? mem.content : html`
                    <div class="placeholder-title">${L(sec.placeholderKey, '暂无内容')}</div>
                    <div>${L(sec.placeholderDescKey)}</div>
                  `}
                </div>
              `}
            </div>
          `;
        })}
      </div>
    `;
  }
}

customElements.define('hermes-memory-page', HermesMemoryPage);
