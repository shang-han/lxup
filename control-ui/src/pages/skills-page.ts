import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/page-header.js';

export class SkillsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .skills-page { width: 100%; }

    /* === tabs === */
    .skills-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }
    .skills-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .skills-tab:hover { color: var(--text); }
    .skills-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* === toolbar === */
    .skills-toolbar {
      display: flex; gap: 8px; margin-bottom: 12px;
    }
    .skills-toolbar .search-input {
      flex: 1; padding: 6px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
    }
    .skills-toolbar .search-input::placeholder { color: var(--muted); }
    .skills-toolbar .search-input:focus { border-color: var(--accent); }
    .skills-toolbar button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .skills-toolbar button:hover { background: var(--bg-hover); color: var(--text); }

    /* === summary === */
    .skills-summary {
      font-size: 12px; color: var(--text-soft); margin-bottom: 14px;
    }

    /* === section === */
    .skills-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-bottom: 16px;
    }
    .skills-section__header {
      padding: 14px 18px; font-size: 13px; font-weight: 600;
      border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 6px;
    }
    .skills-section__header .count {
      font-size: 12px; font-weight: 400; color: var(--text-soft);
    }
    .skills-section__body {
      max-height: 480px; overflow-y: auto; padding: 8px;
    }

    /* === skill item === */
    .skill-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-bottom: 1px solid var(--border);
    }
    .skill-item:last-child { border-bottom: none; }
    .skill-item__icon {
      width: 20px; height: 20px; flex-shrink: 0; color: var(--success);
    }
    .skill-item__content { flex: 1; min-width: 0; }
    .skill-item__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px;
    }
    .skill-item__source {
      font-size: 11px; color: var(--muted); margin-bottom: 4px;
    }
    .skill-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .skill-item__actions {
      display: flex; gap: 6px; flex-shrink: 0; align-items: center;
    }
    .skill-item__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .skill-item__actions .btn-detail {
      background: transparent; color: var(--text-soft);
    }
    .skill-item__actions .btn-detail:hover { background: var(--bg-hover); color: var(--text); }
    .skill-item__actions .btn-uninstall {
      background: transparent; color: var(--danger); border-color: var(--danger);
    }
    .skill-item__actions .btn-uninstall:hover { background: var(--danger-subtle); }
    .skill-item__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .skill-item__badge.disabled {
      background: var(--bg-muted); color: var(--muted);
    }
    .skill-item__badge.missing {
      background: rgba(245,158,11,0.12); color: var(--warn);
    }

    /* === empty state === */
    .skills-empty {
      text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _activeTab = 'installed'; // 'installed' | 'search'
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

  /** 从 Sidecar 读取 OpenClaw 内置技能包（扫描打包 npm 包内 skills 目录下各 SKILL.md） */
  async _loadSkills() {
    this._loading = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills`);
      const d = await r.json() as { data?: any[] };
      this._skills = (d.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        source: `OpenClaw ${L('skills.bundled')}${s.version ? ' · v' + s.version : ''}`,
        desc: (s.description || '') + ((s.requires && s.requires.length) ? `\n${L('skills.requires')}: ${s.requires.join(', ')}` : ''),
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
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="skills-page">

        <!-- Tabs -->
        <div class="skills-tabs">
          <div class="skills-tab ${this._activeTab === 'installed' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'installed'; }}>
            ${L('skills.installed')}
          </div>
          <div class="skills-tab ${this._activeTab === 'search' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'search'; }}>
            ${L('skills.searchInstall')}
          </div>
        </div>

        ${this._activeTab === 'installed' ? html`
          <!-- Toolbar -->
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._search}
              @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
              placeholder=${L('skills.filterPlaceholder')}
            />
            <button @click=${() => this._loadSkills()}>${L('common.refresh')}</button>
          </div>

          <!-- Summary -->
          <div class="skills-summary">
            ${L('skills.summary', { total: filtered.length, available, missing, disabled })}
          </div>

          <!-- Available skills -->
          ${available > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--success);">
                ✓ ${L('skills.available')} <span class="count">(${available})</span>
              </div>
              <div class="skills-section__body">
                ${filtered.filter(s => s.status === 'available').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          <!-- Missing dependencies -->
          ${missing > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--warn);">
                 ${L('skills.missingDeps')} <span class="count">(${missing})</span>
              </div>
              <div class="skills-section__body">
                ${filtered.filter(s => s.status === 'missing').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          <!-- Disabled -->
          ${disabled > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--muted);">
                ✗ ${L('skills.disabled')} <span class="count">(${disabled})</span>
              </div>
              <div class="skills-section__body">
                ${filtered.filter(s => s.status === 'disabled').map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          ${filtered.length === 0 ? html`
            <div class="skills-empty">${this._skills.length === 0 && !this._loading ? L('skills.notInstalled') : L('skills.noMatch')}</div>
          ` : ''}
        ` : html`
          <!-- Search & Install -->
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              placeholder=${L('skills.searchPlaceholder')}
            />
            <button>${L('skills.search')}</button>
          </div>
          <div class="skills-section">
            <div class="skills-section__header">
              ${L('skills.searchHubTitle')}
            </div>
            <div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">
              <div style="margin-bottom:12px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--border-strong);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div>${L('skills.searchHubDesc')}</div>
              <div style="font-size:12px;margin-top:4px;">${L('skills.comingSoon')}</div>
            </div>
          </div>
        `}

      </div>
    `;
  }

  _renderSkillItem(s: any) {
    const badgeClass = s.status === 'available' ? '' : s.status === 'disabled' ? 'disabled' : 'missing';
    const badgeText = s.status === 'available' ? L('skills.available') : s.status === 'disabled' ? L('skills.disabled') : L('skills.missingDeps');

    return html`
      <div class="skill-item">
        <div class="skill-item__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
        </div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail">${L('skills.detail')}</button>
          <button class="btn-uninstall">${L('skills.uninstall')}</button>
          <span class="skill-item__badge ${badgeClass}">${badgeText}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('skills-page', SkillsPage);
