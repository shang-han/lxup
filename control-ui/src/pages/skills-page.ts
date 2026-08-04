import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import '../components/page-header.js';
import '../components/skillpack-panel.js';

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
    /* === hub message / detail dialog === */
    .hub-msg { font-size: 12px; margin: 0 0 10px; }
    .hub-msg.ok { color: var(--success); }
    .hub-msg.err { color: var(--danger); word-break: break-all; }
    .hub-msg.warn { color: var(--warn); }

    /* === clawhub 风险提示 / 空状态引导 === */
    .hub-warn {
      display: flex; align-items: flex-start; gap: 8px;
      margin: 10px 14px 0; padding: 8px 12px;
      background: rgba(245,158,11,0.09);
      border: 1px solid rgba(245,158,11,0.28);
      border-radius: var(--radius-md);
      font-size: 12px; line-height: 1.5; color: var(--text-soft);
      transition: border-color var(--duration-fast) ease;
    }
    .hub-warn:hover { border-color: rgba(245,158,11,0.5); }
    .hub-warn svg { flex-shrink: 0; width: 14px; height: 14px; color: var(--warn); margin-top: 1px; }

    .hub-empty { padding: 22px 18px 24px; }
    .hub-intro { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; padding: 0 2px; }
    .hub-intro__icon {
      flex-shrink: 0; width: 38px; height: 38px; display: grid; place-items: center;
      border-radius: var(--radius-md); color: var(--accent);
      background: var(--accent-subtle); border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
    }
    .hub-intro__icon svg { width: 18px; height: 18px; }
    .hub-intro__desc { font-size: 13px; line-height: 1.7; color: var(--text-soft); padding-top: 2px; }

    .hub-hints { display: flex; flex-direction: column; gap: 4px; border-top: 1px dashed var(--border); padding-top: 12px; }
    .hub-hint {
      display: flex; align-items: center; gap: 10px; padding: 7px 10px;
      border-radius: var(--radius-md); border: 1px solid transparent;
      transition: background var(--duration-fast) ease, border-color var(--duration-fast) ease, transform var(--duration-fast) ease;
      animation: hub-hint-in 0.3s ease both;
    }
    .hub-hint:nth-child(2) { animation-delay: 60ms; }
    .hub-hint:nth-child(3) { animation-delay: 120ms; }
    .hub-hint:hover { background: var(--bg-hover); border-color: var(--border); transform: translateX(3px); }
    .hub-hint__icon {
      flex-shrink: 0; width: 26px; height: 26px; display: grid; place-items: center;
      border-radius: var(--radius-sm); background: var(--bg-muted); color: var(--text-soft);
      transition: color var(--duration-fast) ease, background var(--duration-fast) ease;
    }
    .hub-hint:hover .hub-hint__icon { color: var(--accent); background: var(--accent-subtle); }
    .hub-hint__icon svg { width: 14px; height: 14px; }
    .hub-hint__label { font-size: 12.5px; font-weight: 600; color: var(--text); white-space: nowrap; min-width: 84px; }
    .hub-hint__desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
    @keyframes hub-hint-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    .detail-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .detail-box {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 22px 24px; width: min(640px, calc(100vw - 40px));
      max-height: 80vh; display: flex; flex-direction: column;
      box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }
    .detail-box__title { font-size: 15px; font-weight: 700; color: var(--text-strong); margin-bottom: 10px; }
    .detail-box__body {
      font-size: 12px; color: var(--text-soft); line-height: 1.7;
      white-space: pre-wrap; word-break: break-word;
      overflow-y: auto; font-family: var(--font-mono);
    }

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
    .skill-item__icon.preinstalled { font-size: 17px; line-height: 20px; text-align: center; }
    .skill-item__actions .btn-install-pre {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .skill-item__actions .btn-install-pre:hover { background: var(--accent-hover); }
    .skill-item__actions .btn-install-pre:disabled { opacity: 0.5; cursor: wait; }
    .skill-item.off { opacity: 0.55; }
    .skill-item__actions .btn-toggle {
      background: transparent; color: var(--text-soft); border-color: var(--border);
    }
    .skill-item__actions .btn-toggle:hover { background: var(--bg-hover); color: var(--text); }
    .skill-item__actions .btn-toggle.on {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .skill-item__actions .btn-toggle.on:hover { background: var(--accent-hover); }
    .skill-item__actions .btn-toggle:disabled { opacity: 0.4; cursor: not-allowed; }
    .skills-section__header.clickable { cursor: pointer; user-select: none; }
    .skills-section__header.clickable:hover { color: var(--text); }
    .skills-section__header .caret { font-size: 11px; color: var(--muted); }
    .missing-hint { margin-left: auto; font-size: 11px; font-weight: 400; color: var(--muted); }

    /* === empty state === */
    .skills-empty {
      text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _activeTab = 'installed'; // 'installed' | 'search' | 'packs'
  @state() _search = '';
  @state() _skills: any[] = [];
  @state() _loading = true;

  // 搜索安装（ClawHub，经网关 WS RPC）
  @state() _hubQuery = '';
  @state() _hubResults: any[] = [];
  @state() _hubSearching = false;
  @state() _hubSearched = false;
  @state() _installingSlug = '';
  @state() _hubMsg = '';
  @state() _hubMsgCls = '';
  // 预装通用工具（下载=部署到 agent workspace）
  @state() _busyPre = '';
  @state() _preMsg = '';
  // 已安装技能的启用/禁用（网关 skills.entries + skills.update）
  @state() _togglingKey = '';
  @state() _listMsg = '';
  @state() _expandedMissing = false;
  @state() _gwConnected = false;
  _entries = new Map<string, boolean>();
  _unsubStore: (() => void) | null = null;
  // 技能详情（skills.detail）
  @state() _detailOpen = false;
  @state() _detailTitle = '';
  @state() _detailBody = '';
  @state() _detailLoading = false;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._gwConnected = store.connected;
    this._unsubStore = store.subscribe(() => {
      const c = getSharedStore().connected;
      if (c !== this._gwConnected) {
        this._gwConnected = c;
        if (c) void this._loadSkills(); // 连上/重连时刷新清单与启用状态
        this.requestUpdate();
      }
    });
    void this._loadSkills();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubStore?.();
  }

  /** 从 Sidecar 读取 OpenClaw 内置技能包（扫描打包 npm 包内 skills 目录下各 SKILL.md） */
  async _loadSkills() {
    this._loading = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills`);
      const d = await r.json() as { data?: any[] };
      // 网关侧启用/禁用状态（skills.entries，按技能名合并）
      try {
        const store = getSharedStore();
        this._entries = store.connected
          ? this._normalizeEntries(await store.request('skills.entries'))
          : new Map();
      } catch { this._entries = new Map(); }
      this._skills = (d.data || []).map((s: any) => {
        const note = s.status_note
          || ((s.requires && s.requires.length) ? `${L('skills.requires')}: ${s.requires.join(', ')}` : '');
        return {
          id: s.id,
          name: s.name,
          source: s.preinstalled
            ? `LXUP ${L('skills.preinstalled')}`
            : s.source_kind === 'clawhub'
              ? L('skills.fromClawhub')
              : `OpenClaw ${L('skills.bundled')}${s.version ? ' · v' + s.version : ''}`,
          desc: (s.description || '') + (note ? `\n${note}` : ''),
          status: s.status || 'available',
          preinstalled: !!s.preinstalled,
          installed: !!s.installed,
          enabled: this._entries.has(s.name) ? this._entries.get(s.name) : true,
        };
      });
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

  // ── ClawHub 搜索 / 安装（WS RPC）────────────────────

  async _searchHub() {
    const store = getSharedStore();
    const q = this._hubQuery.trim();
    if (!q) return;
    if (!store.connected) {
      this._hubMsg = L('skills.hubGatewayRequired');
      this._hubMsgCls = 'warn';
      return;
    }
    this._hubSearching = true;
    this._hubMsg = '';
    this._hubMsgCls = '';
    try {
      const res = await store.request<any>('skills.search', { query: q });
      this._hubResults = res?.results || [];
      this._hubSearched = true;
    } catch (e) {
      this._hubMsg = e instanceof Error ? e.message : String(e);
      this._hubMsgCls = 'err';
    } finally {
      this._hubSearching = false;
    }
  }

  async _installSkill(r: any) {
    const store = getSharedStore();
    if (!store.connected || this._installingSlug) return;
    this._installingSlug = r.slug;
    this._hubMsg = '';
    this._hubMsgCls = '';
    try {
      // ClawHub 安装变体：{source:'clawhub', slug, acknowledgeClawHubRisk}
      await store.request('skills.install', {
        source: 'clawhub',
        slug: r.slug,
        acknowledgeClawHubRisk: true,
      });
      this._hubMsg = `${L('skills.hubInstalled')}: ${r.displayName || r.slug}`;
      this._hubMsgCls = 'ok';
      await this._loadSkills();
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      try { const j = JSON.parse(raw); this._hubMsg = j?.message || raw; }
      catch { this._hubMsg = raw; }
      this._hubMsgCls = 'err';
    } finally {
      this._installingSlug = '';
    }
  }

  // ── LXUP 预装通用工具（经 Sidecar 部署/卸载）────────────

  async _openPreDetail(id: string, name: string) {
    this._detailOpen = true;
    this._detailTitle = name;
    this._detailBody = '';
    this._detailLoading = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      const d = await r.json() as { content?: string };
      // 去掉 frontmatter（--- ... ---），与网关技能详情一致
      this._detailBody = String(d.content || '—').replace(/^---[\s\S]*?---\s*/, '');
    } catch (e) {
      this._detailBody = e instanceof Error ? e.message : String(e);
    } finally {
      this._detailLoading = false;
    }
  }

  async _downloadPre(s: any) {
    if (this._busyPre) return;
    this._busyPre = s.id;
    this._preMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}/install`, { method: 'POST' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadSkills();
    } catch (e) {
      this._preMsg = `${L('skills.preDownloadFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busyPre = '';
    }
  }

  async _uninstallPre(s: any) {
    if (this._busyPre) return;
    this._busyPre = s.id;
    this._preMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadSkills();
    } catch (e) {
      this._preMsg = `${L('skills.preUninstallFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busyPre = '';
    }
  }

  /** 详情：skills.detail 返回 SKILL.md 全文（含 frontmatter），截取正文展示 */
  async _openDetail(slug: string, displayName?: string) {
    const store = getSharedStore();
    this._detailOpen = true;
    this._detailTitle = displayName || slug;
    this._detailBody = '';
    this._detailLoading = true;
    try {
      if (store.connected) {
        const res = await store.request<any>('skills.detail', { slug });
        const skill = res?.skill || {};
        let body = String(skill.description || skill.summary || '');
        // 去掉 frontmatter（--- ... ---）
        body = body.replace(/^---[\s\S]*?---\s*/, '');
        this._detailBody = body || skill.summary || '—';
      } else {
        const local = this._skills.find(s => s.id === slug || s.name === slug);
        this._detailBody = local?.desc || L('dashboard.wsDisconnected');
      }
    } catch (e) {
      this._detailBody = e instanceof Error ? e.message : String(e);
    } finally {
      this._detailLoading = false;
    }
  }

  _closeDetail() {
    this._detailOpen = false;
  }

  render() {
    const filtered = this._filteredSkills();
    const preinstalled = filtered.filter(s => s.preinstalled);
    const available = filtered.filter(s => s.status === 'available' && !s.preinstalled).length;
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
          <div class="skills-tab ${this._activeTab === 'packs' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'packs'; }}>
            ${L('skills.jobPacks')}
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
          ${this._listMsg ? html`<div class="hub-msg err">${this._listMsg}</div>` : ''}

          <!-- LXUP 预装通用工具（免费，下载部署后 agent 可用） -->
          ${preinstalled.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--accent);">
                🧰 ${L('skills.preinstalledTitle')} <span class="count">(${preinstalled.length})</span>
              </div>
              ${this._preMsg ? html`<div class="hub-msg err" style="margin:10px 18px 0;">${this._preMsg}</div>` : ''}
              <div class="skills-section__body">
                ${preinstalled.map(s => this._renderPreinstalledItem(s))}
              </div>
            </div>
          ` : ''}

          <!-- Available skills -->
          ${available > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--success);">
                ✓ ${L('skills.available')} <span class="count">(${available})</span>
              </div>
              <div class="skills-section__body">
                ${filtered.filter(s => s.status === 'available' && !s.preinstalled).map(s => this._renderSkillItem(s))}
              </div>
            </div>
          ` : ''}

          <!-- Missing dependencies（默认折叠，补齐依赖前不可用） -->
          ${missing > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--warn);"
                   @click=${() => { this._expandedMissing = !this._expandedMissing; }}>
                <span class="caret">${this._expandedMissing ? '▾' : '▸'}</span>
                ${L('skills.missingDeps')} <span class="count">(${missing})</span>
                <span class="missing-hint">${L('skills.missingHint')}</span>
              </div>
              ${this._expandedMissing ? html`
                <div class="skills-section__body">
                  ${filtered.filter(s => s.status === 'missing').map(s => this._renderPassiveItem(s))}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Disabled（平台不支持） -->
          ${disabled > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header" style="color:var(--muted);">
                ✗ ${L('skills.disabled')} <span class="count">(${disabled})</span>
              </div>
              <div class="skills-section__body">
                ${filtered.filter(s => s.status === 'disabled').map(s => this._renderPassiveItem(s))}
              </div>
            </div>
          ` : ''}

          ${filtered.length === 0 ? html`
            <div class="skills-empty">${this._skills.length === 0 && !this._loading ? L('skills.notInstalled') : L('skills.noMatch')}</div>
          ` : ''}
        ` : this._activeTab === 'packs' ? html`
          <!-- 岗位技能包 -->
          <skillpack-panel></skillpack-panel>
        ` : html`
          <!-- Search & Install（ClawHub 真实搜索/安装） -->
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._hubQuery}
              placeholder=${L('skills.searchPlaceholder')}
              @input=${(e: Event) => { this._hubQuery = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._searchHub(); }}
            />
            <button ?disabled=${this._hubSearching || !this._hubQuery.trim()} @click=${() => this._searchHub()}>
              ${this._hubSearching ? L('common.loading') : L('skills.search')}
            </button>
          </div>
          <div class="skills-section">
            <div class="skills-section__header">
              ${L('skills.searchHubTitle')}
            </div>
            <div class="hub-warn">${icons['alert-triangle']}<span>${L('skills.hubWarn')}</span></div>
            ${this._hubMsg ? html`
              <div class="hub-msg ${this._hubMsgCls}">${this._hubMsg}</div>
            ` : ''}
            ${!this._hubSearched ? html`
              <div class="hub-empty">
                <div class="hub-intro">
                  <div class="hub-intro__icon">${icons['search']}</div>
                  <div class="hub-intro__desc">${L('skills.hubIntro')}</div>
                </div>
                <div class="hub-hints">
                  <div class="hub-hint">
                    <div class="hub-hint__icon">${icons['zap']}</div>
                    <div class="hub-hint__label">${L('skills.hubInstallNoteT')}</div>
                    <div class="hub-hint__desc">${L('skills.hubInstallNoteD')}</div>
                  </div>
                  <div class="hub-hint">
                    <div class="hub-hint__icon">${icons['globe']}</div>
                    <div class="hub-hint__label">${L('skills.hubSearchTipT')}</div>
                    <div class="hub-hint__desc">${L('skills.hubSearchTipD')}</div>
                  </div>
                  <div class="hub-hint">
                    <div class="hub-hint__icon">${icons['wifi']}</div>
                    <div class="hub-hint__label">${L('skills.hubNetworkNoteT')}</div>
                    <div class="hub-hint__desc">${L('skills.hubNetworkNoteD')}</div>
                  </div>
                </div>
              </div>
            ` : !this._hubResults.length ? html`
              <div class="skills-empty">${L('skills.hubNoResults')}</div>
            ` : html`
              <div class="skills-section__body">
                ${this._hubResults.map((r: any) => html`
                  <div class="skill-item">
                    <div class="skill-item__icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                    </div>
                    <div class="skill-item__content">
                      <div class="skill-item__name">${r.displayName || r.slug}</div>
                      <div class="skill-item__source">${r.ownerHandle ? '@' + r.ownerHandle : ''}${typeof r.downloads === 'number' ? ' · ' + r.downloads + ' ' + L('skills.hubDownloads') : ''}</div>
                      <div class="skill-item__desc">${r.summary || ''}</div>
                    </div>
                    <div class="skill-item__actions">
                      <button class="btn-detail" @click=${() => this._openDetail(r.slug)}>${L('skills.detail')}</button>
                      <button class="btn-uninstall" style="color:var(--accent);border-color:var(--accent);"
                        ?disabled=${this._installingSlug === r.slug}
                        @click=${() => this._installSkill(r)}>
                        ${this._installingSlug === r.slug ? L('skills.hubInstalling') : L('skills.hubInstall')}
                      </button>
                    </div>
                  </div>
                `)}
              </div>
            `}
          </div>
        `}

      </div>

      <!-- 技能详情 -->
      ${this._detailOpen ? html`
        <div class="detail-backdrop" @click=${this._closeDetail}>
          <div class="detail-box" @click=${(e: Event) => e.stopPropagation()}>
            <div class="detail-box__title">${this._detailTitle}</div>
            <div class="detail-box__body">
              ${this._detailLoading ? L('common.loading') : this._detailBody}
            </div>
            <div style="text-align:right;margin-top:12px;">
              <button class="btn-detail" @click=${this._closeDetail}>${L('channels.close')}</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  // ── 已安装技能启用 / 禁用（网关 skills.update）────────────

  /** skills.entries 响应形态不定（数组 / {entries} / 键值表），统一成 名称→enabled */
  _normalizeEntries(res: any): Map<string, boolean> {
    const m = new Map<string, boolean>();
    const items = Array.isArray(res) ? res : Array.isArray(res?.entries) ? res.entries : null;
    if (items) {
      for (const e of items) {
        const k = e?.skillKey || e?.key || e?.name;
        if (k) m.set(String(k), e.enabled !== false);
      }
    } else if (res && typeof res === 'object') {
      for (const [k, v] of Object.entries(res)) m.set(k, (v as any)?.enabled !== false);
    }
    return m;
  }

  async _toggleSkill(s: any) {
    const store = getSharedStore();
    if (this._togglingKey || !store.connected) return;
    const next = s.enabled === false; // 当前禁用 → 启用
    this._togglingKey = s.name;
    this._listMsg = '';
    try {
      await store.request('skills.update', { skillKey: s.name, enabled: next });
      await this._loadSkills();
    } catch (e) {
      this._listMsg = `${L('skills.toggleFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._togglingKey = '';
    }
  }

  _renderPreinstalledItem(s: any) {
    const busy = this._busyPre === s.id;
    const badgeText = s.status === 'missing' ? L('skills.missingDeps')
      : s.installed ? L('skills.preDownloaded') : L('skills.preNotDownloaded');
    return html`
      <div class="skill-item">
        <div class="skill-item__icon preinstalled">🧰</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openPreDetail(s.id, s.name)}>${L('skills.detail')}</button>
          ${s.installed
            ? html`<button class="btn-uninstall" ?disabled=${busy} @click=${() => this._uninstallPre(s)}>${L('skills.uninstall')}</button>`
            : html`<button class="btn-install-pre" ?disabled=${busy || !!this._busyPre} @click=${() => this._downloadPre(s)}>
                ${busy ? L('skills.downloading') : L('skills.download')}</button>`}
          <span class="skill-item__badge ${s.status === 'missing' || !s.installed ? 'missing' : ''}">${badgeText}</span>
        </div>
      </div>
    `;
  }

  _skillIcon() {
    return html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`;
  }

  /** 已安装且可用：详情 + 启用/禁用开关（同一按钮两态） */
  _renderSkillItem(s: any) {
    const off = s.enabled === false;
    const busy = this._togglingKey === s.name;
    return html`
      <div class="skill-item ${off ? 'off' : ''}">
        <div class="skill-item__icon">${this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openDetail(s.id, s.name)}>${L('skills.detail')}</button>
          <button class="btn-toggle ${off ? 'on' : ''}" ?disabled=${!this._gwConnected || !!this._togglingKey}
            @click=${() => this._toggleSkill(s)}>
            ${busy ? L('common.loading') : off ? L('skills.enableBtn') : L('skills.disableBtn')}</button>
          ${off ? html`<span class="skill-item__badge disabled">${L('skills.disabled')}</span>` : ''}
        </div>
      </div>
    `;
  }

  /** 缺依赖 / 平台不支持：只给详情，不能操作 */
  _renderPassiveItem(s: any) {
    const isDisabled = s.status === 'disabled';
    return html`
      <div class="skill-item">
        <div class="skill-item__icon">${this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openDetail(s.id, s.name)}>${L('skills.detail')}</button>
          <span class="skill-item__badge ${isDisabled ? 'disabled' : 'missing'}">
            ${isDisabled ? L('skills.disabled') : L('skills.missingDeps')}</span>
        </div>
      </div>
    `;
  }
}

customElements.define('skills-page', SkillsPage);
