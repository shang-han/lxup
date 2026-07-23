import { LitElement, html, css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/page-header.js';
import pageStyles from './styles.css?raw';

export class HermesSkillsPage extends LitElement {
  static styles = css`
    :host { display: block; }
    ${unsafeCSS(pageStyles)}

    .hs-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }
    .hs-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .hs-tab:hover { color: var(--text); }
    .hs-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    .hs-toolbar {
      display: flex; gap: 8px; margin-bottom: 12px;
    }
    .hs-toolbar .search-input {
      flex: 1; padding: 6px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
    }
    .hs-toolbar .search-input::placeholder { color: var(--muted); }
    .hs-toolbar .search-input:focus { border-color: var(--accent); }
    .hs-toolbar button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .hs-toolbar button:hover { background: var(--bg-hover); color: var(--text); }

    .hs-summary {
      font-size: 12px; color: var(--text-soft); margin-bottom: 14px;
    }

    .hs-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-bottom: 16px;
    }
    .hs-section__header {
      padding: 14px 18px; font-size: 13px; font-weight: 600;
      border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 6px;
    }
    .hs-section__header .count {
      font-size: 12px; font-weight: 400; color: var(--text-soft);
    }
    .hs-section__body {
      max-height: 480px; overflow-y: auto; padding: 8px;
    }

    .hs-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-bottom: 1px solid var(--border);
    }
    .hs-item:last-child { border-bottom: none; }
    .hs-item__icon {
      width: 20px; height: 20px; flex-shrink: 0; color: var(--success);
    }
    .hs-item__content { flex: 1; min-width: 0; }
    .hs-item__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px;
    }
    .hs-item__source {
      font-size: 11px; color: var(--muted); margin-bottom: 4px;
    }
    .hs-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .hs-item__actions {
      display: flex; gap: 6px; flex-shrink: 0; align-items: center;
    }
    .hs-item__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .hs-item__actions .btn-detail {
      background: transparent; color: var(--text-soft);
    }
    .hs-item__actions .btn-detail:hover { background: var(--bg-hover); color: var(--text); }
    .hs-item__actions .btn-uninstall {
      background: transparent; color: var(--danger); border-color: var(--danger);
    }
    .hs-item__actions .btn-uninstall:hover { background: var(--danger-subtle); }
    .hs-item__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }

    .hs-empty {
      text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _activeTab = 'installed';
  @state() _search = '';
  @state() _skills: any[] = [];
  @state() _loading = true;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    void this._loadSkills();
  }

  /** 从 Sidecar 读取 Hermes 技能包（扫描 hermes-home/skills 目录下各 SKILL.md） */
  async _loadSkills() {
    this._loading = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/hermes/skills`);
      const d = await r.json() as { data?: any[] };
      this._skills = (d.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        source: `${s.category || 'Hermes ' + L('hermesSkills.bundled', '内置')}${s.version ? ' · v' + s.version : ''}`,
        desc: (s.description || '') + ((s.tags && s.tags.length) ? `\n${s.tags.join(' · ')}` : ''),
        status: 'available',
      }));
    } catch {
      this._skills = [];
    }
    this._loading = false;
    this.requestUpdate();
  }

  _filteredSkills() {
    if (!this._search) return this._skills;
    const q = this._search.toLowerCase();
    return this._skills.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.source.toLowerCase().includes(q)
    );
  }

  render() {
    const filtered = this._filteredSkills();
    const available = filtered.filter(s => s.status === 'available').length;
    const missing = filtered.filter(s => s.status === 'missing').length;
    const disabled = filtered.filter(s => s.status === 'disabled').length;

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);" @click=${() => this._loadSkills()}>
          ${L('common.refresh', '刷新')}
        </button>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <!-- Tabs -->
        <div class="hs-tabs">
          <div class="hs-tab ${this._activeTab === 'installed' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'installed'; }}>
            ${L('hermesSkills.installed', '已安装')}
          </div>
          <div class="hs-tab ${this._activeTab === 'search' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'search'; }}>
            ${L('hermesSkills.searchInstall', '搜索安装')}
          </div>
        </div>

        ${this._activeTab === 'installed' ? html`
          <div class="hs-toolbar">
            <input class="search-input" type="text"
              .value=${this._search}
              @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
              placeholder=${L('hermesSkills.filterPlaceholder', '过滤 Skills...')}
            />
            <button @click=${() => this._loadSkills()}>${L('hermesSkills.refresh', '刷新')}</button>
          </div>

          <div class="hs-summary">
            ${L('hermesSkills.summary', { total: filtered.length, available, missing, disabled })}
          </div>

          ${available > 0 ? html`
            <div class="hs-section">
              <div class="hs-section__header" style="color:var(--success);">
                ✓ ${L('hermesSkills.available', '可用')} <span class="count">(${available})</span>
              </div>
              <div class="hs-section__body">
                ${filtered.filter(s => s.status === 'available').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          ${missing > 0 ? html`
            <div class="hs-section">
              <div class="hs-section__header" style="color:var(--warn);">
                ⚠ ${L('hermesSkills.missingDeps', '缺依赖')} <span class="count">(${missing})</span>
              </div>
              <div class="hs-section__body">
                ${filtered.filter(s => s.status === 'missing').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          ${disabled > 0 ? html`
            <div class="hs-section">
              <div class="hs-section__header" style="color:var(--muted);">
                ✗ ${L('hermesSkills.disabled', '已禁用')} <span class="count">(${disabled})</span>
              </div>
              <div class="hs-section__body">
                ${filtered.filter(s => s.status === 'disabled').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          ${filtered.length === 0 ? html`
            <div class="hs-empty">${this._skills.length === 0 && !this._loading ? L('hermesSkills.notFound', '未在 hermes-home/skills 找到技能包') : L('hermesSkills.noMatch', '没有匹配的 Skills')}</div>
          ` : ''}
        ` : html`
          <div class="hs-toolbar">
            <input class="search-input" type="text"
              placeholder=${L('hermesSkills.searchPlaceholder', '搜索 SkillHub...')}
            />
            <button>${L('hermesSkills.search', '搜索')}</button>
          </div>
          <div class="hs-section">
            <div class="hs-section__header">
              ${L('hermesSkills.searchHubTitle', '从 SkillHub 搜索安装')}
            </div>
            <div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">
              <div style="margin-bottom:12px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--border-strong);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div>${L('hermesSkills.searchHubDesc', '从社区 SkillHub 搜索并安装新技能。')}</div>
              <div style="font-size:12px;margin-top:4px;">${L('hermesSkills.comingSoon', '即将推出...')}</div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  _renderSkillItem(s: any) {
    return html`
      <div class="hs-item">
        <div class="hs-item__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
        </div>
        <div class="hs-item__content">
          <div class="hs-item__name">${s.name}</div>
          <div class="hs-item__source">${s.source}</div>
          <div class="hs-item__desc">${s.desc}</div>
        </div>
        <div class="hs-item__actions">
          <button class="btn-detail">${L('hermesSkills.detail', '详情')}</button>
          <button class="btn-uninstall">${L('hermesSkills.uninstall', '卸载')}</button>
          <span class="hs-item__badge">${L('hermesSkills.available', '可用')}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('hermes-skills-page', HermesSkillsPage);
