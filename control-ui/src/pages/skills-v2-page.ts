import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import '../components/page-header.js';
import '../components/skillshop-panel.js';

/**
 * 技能页（新版方案，与旧版 skills-page 并存供选择）。
 *
 * 信息架构原则：
 *   1. 主列表只放「此刻真能用」的技能；缺依赖/已停用各有独立车道；
 *      平台不符的技能直接隐藏。
 *   2. 按「能干的活」展示：预装通用工具 / 我的岗位技能（按包分组）/ 其他可用技能。
 *   3. 缺依赖 → 待修复车道：预装技能可一键补齐（sidecar 便携 Python pip 安装）。
 *   4. 停用 ≠ 卸载：经网关 skills.update 关闭，文件保留、可随时恢复。
 *   5. 「试一下」：抽取 SKILL.md 示例段的输入文本，预填到聊天页。
 */

/** 与聊天页约定的预填键（chat-page connectedCallback 读取后清除） */
export const CHAT_PREFILL_KEY = 'lxup.chat.prefill';

type SkillItem = {
  id: string;
  name: string;
  desc: string;
  source: string;
  status: string; // available | missing | disabled
  preinstalled: boolean;
  installed: boolean;
  enabled: boolean;
  source_kind: string; // '' | 'clawhub' | 'jobpack'
  pack_id?: string;
  pack_name?: string;
  pack_skill_file?: string;
  status_note: string;
};

export class SkillsV2Page extends LitElement {
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

    /* === toolbar / summary === */
    .skills-toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
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
    .skills-summary { font-size: 12px; color: var(--text-soft); margin-bottom: 14px; }

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
    .skills-section__header .count { font-size: 12px; font-weight: 400; color: var(--text-soft); }
    .skills-section__header.clickable { cursor: pointer; user-select: none; }
    .skills-section__header.clickable:hover { color: var(--text); }
    .header-right { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; }
    .lane-hint { font-size: 11px; font-weight: 400; color: var(--muted); }
    .sec-caret { display: inline-flex; color: var(--muted); }
    .sec-caret svg { width: 14px; height: 14px; }
    .skills-section__body { max-height: 480px; overflow-y: auto; padding: 8px; }
    .group-label {
      padding: 8px 14px 2px; font-size: 11px; font-weight: 600;
      color: var(--muted); letter-spacing: 0.03em;
    }

    /* === skill item === */
    .skill-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-bottom: 1px solid var(--border);
    }
    .skill-item:last-child { border-bottom: none; }
    .skill-item.off { opacity: 0.55; }
    .skill-item__icon { width: 20px; height: 20px; flex-shrink: 0; color: var(--success); }
    .skill-item__icon.preinstalled { font-size: 17px; line-height: 20px; text-align: center; }
    .skill-item__content { flex: 1; min-width: 0; }
    .skill-item__name { font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px; }
    .skill-item__source { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .skill-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; white-space: pre-line;
    }
    .skill-item__actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }
    .skill-item__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .btn-detail { background: transparent; color: var(--text-soft); }
    .btn-detail:hover { background: var(--bg-hover); color: var(--text); }
    .btn-primary { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }
    .btn-primary:hover { background: var(--accent-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: wait; }
    .btn-danger { background: transparent; color: var(--danger); border-color: var(--danger); }
    .btn-danger:hover { background: var(--danger-subtle); }
    .btn-try { background: transparent; color: var(--accent); border-color: var(--accent); }
    .btn-try:hover { background: var(--accent-subtle); }
    .btn-toggle { background: transparent; color: var(--text-soft); border-color: var(--border); }
    .btn-toggle:hover { background: var(--bg-hover); color: var(--text); }
    .btn-toggle:disabled { opacity: 0.4; cursor: not-allowed; }

    .skill-item__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
      white-space: nowrap;
    }
    .skill-item__badge.disabled { background: var(--bg-muted); color: var(--muted); }
    .skill-item__badge.missing { background: rgba(245,158,11,0.12); color: var(--warn); }

    /* === hub / messages === */
    .hub-msg { font-size: 12px; margin: 0 0 10px; }
    .hub-msg.ok { color: var(--success); }
    .hub-msg.err { color: var(--danger); word-break: break-all; }
    .hub-msg.warn { color: var(--warn); }
    .hub-warn {
      display: flex; align-items: flex-start; gap: 8px;
      margin: 10px 14px 0; padding: 8px 12px;
      background: rgba(245,158,11,0.09);
      border: 1px solid rgba(245,158,11,0.28);
      border-radius: var(--radius-md);
      font-size: 12px; line-height: 1.5; color: var(--text-soft);
    }
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

    /* === detail dialog === */
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

    .skills-empty { text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  /** 当前引擎（app.ts 传入）：openclaw / hermes —— 决定数据源与启停通道 */
  @property({ type: String }) engine = 'openclaw';
  /** 由 app.ts 注入的页面跳转（试一下 → 聊天页） */
  @property({ attribute: false }) onNavigate: (page: string) => void = () => {};

  get _isHermes(): boolean { return this.engine === 'hermes'; }

  @state() _activeTab = 'mine'; // 'mine' | 'packs' | 'hub'
  @state() _search = '';
  @state() _skills: SkillItem[] = [];
  @state() _loading = true;

  // ClawHub（与旧页一致的 WS RPC）
  @state() _hubQuery = '';
  @state() _hubResults: any[] = [];
  @state() _hubSearching = false;
  @state() _hubSearched = false;
  @state() _installingSlug = '';
  @state() _hubMsg = '';
  @state() _hubMsgCls = '';

  // 操作状态
  @state() _busyPre = '';      // 预装下载/卸载中
  @state() _fixingId = '';     // 补齐依赖中
  @state() _togglingKey = '';  // 启用/停用中
  @state() _laneMsg = '';
  /** 各区块展开状态：待修复/已停用默认收起，其余默认展开 */
  @state() _expandedSec: Record<string, boolean> = { jobpack: true, pre: true, other: true, repair: false, off: false };
  @state() _gwConnected = false;
  _entries = new Map<string, boolean>();
  _unsubStore: (() => void) | null = null;

  // 详情弹窗
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
        if (c) void this._loadSkills();
        this.requestUpdate();
      }
    });
    void this._loadSkills();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubStore?.();
  }

  /** 技能清单：openclaw → /api/gateway/skills + WS skills.entries；
   * hermes → /api/hermes/skills/all + /api/hermes/skills/entries（config.yaml） */
  async _loadSkills() {
    this._loading = true;
    try {
      const url = this._isHermes ? '/api/hermes/skills/all' : '/api/gateway/skills';
      const r = await fetch(`${this._sidecarBase}${url}`);
      const d = await r.json() as { data?: any[] };
      try {
        if (this._isHermes) {
          const er = await fetch(`${this._sidecarBase}/api/hermes/skills/entries`);
          this._entries = er.ok ? this._normalizeEntries(await er.json()) : new Map();
        } else {
          const store = getSharedStore();
          this._entries = store.connected
            ? this._normalizeEntries(await store.request('skills.entries'))
            : new Map();
        }
      } catch { this._entries = new Map(); }
      this._skills = (d.data || []).map((s: any) => {
        const note = s.status_note
          || ((s.requires && s.requires.length) ? `${L('skills.requires')}: ${s.requires.join(', ')}` : '');
        const source = s.preinstalled
          ? `LXUP ${L('skills.preinstalled')}`
          : s.source_kind === 'jobpack'
            ? `${L('skills.fromPack')}: ${s.pack_name || s.pack_id || ''}`
            : s.source_kind === 'clawhub'
              ? L('skills.fromClawhub')
              : `OpenClaw ${L('skills.bundled')}${s.version ? ' · v' + s.version : ''}`;
        return {
          id: s.id,
          name: s.name,
          source,
          desc: (s.description || '') + (note ? `\n${note}` : ''),
          status: s.status || 'available',
          preinstalled: !!s.preinstalled,
          installed: !!s.installed,
          enabled: this._entries.has(s.name) ? this._entries.get(s.name) : true,
          source_kind: s.source_kind || '',
          pack_id: s.pack_id,
          pack_name: s.pack_name,
          pack_skill_file: s.pack_skill_file,
          status_note: s.status_note || '',
        } as SkillItem;
      });
    } catch {
      this._skills = [];
    }
    this._loading = false;
    this.requestUpdate();
  }

  _filteredSkills(): SkillItem[] {
    // 平台不符（status=disabled）直接隐藏，不出现在任何车道
    const base = this._skills.filter(s => s.status !== 'disabled');
    if (!this._search) return base;
    const q = this._search.toLowerCase();
    return base.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q) ||
      s.source.toLowerCase().includes(q)
    );
  }

  // ── 预装通用工具（Sidecar 部署/卸载/补依赖）────────────

  async _downloadPre(s: SkillItem) {
    if (this._busyPre) return;
    this._busyPre = s.id;
    this._laneMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}/install`, { method: 'POST' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadSkills();
    } catch (e) {
      this._laneMsg = `${L('skills.preDownloadFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busyPre = '';
    }
  }

  /** 一键「下载并补齐依赖」：先 pip 补依赖（需联网），成功后再部署；失败即停并提示 */
  async _downloadWithDeps(s: SkillItem) {
    if (this._busyPre) return;
    this._busyPre = s.id;
    this._laneMsg = '';
    try {
      const f = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}/fix-deps`, { method: 'POST' });
      if (!f.ok) throw new Error((await f.json().catch(() => ({})))?.detail || `HTTP ${f.status}`);
      const fd = await f.json();
      if (fd?.still_missing?.length) {
        throw new Error(`${L('skills.fixDepsFailed')}${fd.still_missing.join(', ')}`);
      }
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}/install`, { method: 'POST' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadSkills();
    } catch (e) {
      this._laneMsg = e instanceof Error ? e.message : String(e);
    } finally {
      this._busyPre = '';
    }
  }

  async _uninstallPre(s: SkillItem) {
    if (this._busyPre) return;
    this._busyPre = s.id;
    this._laneMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadSkills();
    } catch (e) {
      this._laneMsg = `${L('skills.preUninstallFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busyPre = '';
    }
  }

  async _fixDeps(s: SkillItem) {
    if (this._fixingId) return;
    this._fixingId = s.id;
    this._laneMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}/fix-deps`, { method: 'POST' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      const d = await r.json();
      if (d?.still_missing?.length) {
        this._laneMsg = `${L('skills.fixDepsFailed')}${d.still_missing.join(', ')}`;
      }
      await this._loadSkills();
    } catch (e) {
      this._laneMsg = `${L('skills.fixDepsFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._fixingId = '';
    }
  }

  // ── 启用 / 停用（网关 skills.update，停用 ≠ 卸载）────────

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

  async _toggleSkill(s: SkillItem) {
    if (this._togglingKey) return;
    const next = s.enabled === false;
    this._togglingKey = s.name;
    this._laneMsg = '';
    try {
      if (this._isHermes) {
        // Hermes：写 config.yaml skills.disabled（热加载生效）
        const r = await fetch(`${this._sidecarBase}/api/hermes/skills/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: s.name, enabled: next }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      } else {
        const store = getSharedStore();
        if (!store.connected) throw new Error(L('dashboard.wsDisconnected'));
        await store.request('skills.update', { skillKey: s.name, enabled: next });
      }
      await this._loadSkills();
    } catch (e) {
      this._laneMsg = `${L('skills.toggleFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._togglingKey = '';
    }
  }

  // ── 详情 / 试一下 ────────────────────────────────

  async _openDetail(s: SkillItem) {
    this._detailOpen = true;
    this._detailTitle = s.name;
    this._detailBody = '';
    this._detailLoading = true;
    try {
      if (s.preinstalled) {
        const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}`);
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
        const d = await r.json();
        this._detailBody = String(d.content || '—').replace(/^---[\s\S]*?---\s*/, '');
      } else if (s.source_kind === 'jobpack' && s.pack_id && s.pack_skill_file) {
        const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(s.pack_id)}/skills/${encodeURIComponent(s.pack_skill_file)}`);
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
        const d = await r.json();
        this._detailBody = String(d.content || '—').replace(/^---[\s\S]*?---\s*/, '');
      } else if (this._isHermes) {
        // Hermes 内置技能：展示扫描到的描述（不经 OpenClaw WS）
        this._detailBody = s.desc || '—';
      } else {
        const store = getSharedStore();
        if (store.connected) {
          const res = await store.request<any>('skills.detail', { slug: s.id });
          const skill = res?.skill || {};
          const body = String(skill.description || skill.summary || '').replace(/^---[\s\S]*?---\s*/, '');
          this._detailBody = body || skill.summary || '—';
        } else {
          this._detailBody = s.desc || L('dashboard.wsDisconnected');
        }
      }
    } catch (e) {
      this._detailBody = e instanceof Error ? e.message : String(e);
    } finally {
      this._detailLoading = false;
    }
  }

  _closeDetail() { this._detailOpen = false; }

  /** 试一下：抽取 SKILL.md 示例段的输入文本，预填到聊天页 */
  async _tryIt(s: SkillItem) {
    let text = '';
    try {
      if (s.preinstalled) {
        const r = await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(s.id)}`);
        if (r.ok) text = (await r.json())?.example || '';
      } else if (s.source_kind === 'jobpack' && s.pack_id && s.pack_skill_file) {
        const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(s.pack_id)}/skills/${encodeURIComponent(s.pack_skill_file)}`);
        if (r.ok) text = (await r.json())?.example || '';
      }
    } catch { /* 拿不到示例时退回技能名 */ }
    if (!text) text = `${L('skills.tryItFallback')}${s.name}`;
    sessionStorage.setItem(CHAT_PREFILL_KEY, text);
    this.onNavigate('chat');
  }

  // ── ClawHub 搜索 / 安装（WS RPC，与旧页一致）────────────

  async _searchHub() {
    const q = this._hubQuery.trim();
    if (!q) return;
    if (!this._isHermes && !getSharedStore().connected) {
      this._hubMsg = L('skills.hubGatewayRequired');
      this._hubMsgCls = 'warn';
      return;
    }
    this._hubSearching = true;
    this._hubMsg = '';
    this._hubMsgCls = '';
    try {
      if (this._isHermes) {
        // Hermes 技能市场：sidecar 桥接 hermes skills search --json
        const r = await fetch(`${this._sidecarBase}/api/hermes/hub/search?query=${encodeURIComponent(q)}`);
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
        const d = await r.json();
        this._hubResults = d?.results || [];
      } else {
        const res = await getSharedStore().request<any>('skills.search', { query: q });
        this._hubResults = res?.results || [];
      }
      this._hubSearched = true;
    } catch (e) {
      this._hubMsg = e instanceof Error ? e.message : String(e);
      this._hubMsgCls = 'err';
    } finally {
      this._hubSearching = false;
    }
  }

  async _installSkill(r: any) {
    const key = this._isHermes ? r.identifier : r.slug;
    if (this._installingSlug) return;
    if (!this._isHermes && !getSharedStore().connected) return;
    this._installingSlug = key;
    this._hubMsg = '';
    this._hubMsgCls = '';
    try {
      if (this._isHermes) {
        const resp = await fetch(`${this._sidecarBase}/api/hermes/hub/install`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: r.identifier, source: r.source || '' }),
        });
        if (!resp.ok) throw new Error((await resp.json().catch(() => ({})))?.detail || `HTTP ${resp.status}`);
        this._hubMsg = `${L('skills.hubInstalled')}: ${r.name || r.identifier}`;
      } else {
        await getSharedStore().request('skills.install', {
          source: 'clawhub',
          slug: r.slug,
          acknowledgeClawHubRisk: true,
        });
        this._hubMsg = `${L('skills.hubInstalled')}: ${r.displayName || r.slug}`;
      }
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

  /** 市场搜索结果行：openclaw=ClawHub 结果；hermes=Skills Hub 结果（字段不同） */
  _renderHubResult(r: any) {
    const key = this._isHermes ? r.identifier : r.slug;
    const busy = this._installingSlug === key;
    return html`
      <div class="skill-item">
        <div class="skill-item__icon">${this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${this._isHermes ? (r.name || r.identifier) : (r.displayName || r.slug)}</div>
          <div class="skill-item__source">
            ${this._isHermes
              ? `${r.source || ''}${r.trust_level ? ' · ' + r.trust_level : ''}`
              : `${r.ownerHandle ? '@' + r.ownerHandle : ''}${typeof r.downloads === 'number' ? ' · ' + r.downloads + ' ' + L('skills.hubDownloads') : ''}`}
          </div>
          <div class="skill-item__desc">${this._isHermes ? (r.description || '') : (r.summary || '')}</div>
        </div>
        <div class="skill-item__actions">
          ${this._isHermes ? '' : html`<button class="btn-detail" @click=${() => this._openHubDetail(r.slug)}>${L('skills.detail')}</button>`}
          <button class="btn-primary" ?disabled=${busy} @click=${() => this._installSkill(r)}>
            ${busy ? L('skills.hubInstalling') : L('skills.hubInstall')}
          </button>
        </div>
      </div>
    `;
  }

  async _openHubDetail(slug: string) {
    const store = getSharedStore();
    this._detailOpen = true;
    this._detailTitle = slug;
    this._detailBody = '';
    this._detailLoading = true;
    try {
      if (store.connected) {
        const res = await store.request<any>('skills.detail', { slug });
        const skill = res?.skill || {};
        this._detailBody = String(skill.description || skill.summary || '—').replace(/^---[\s\S]*?---\s*/, '');
      } else {
        this._detailBody = L('dashboard.wsDisconnected');
      }
    } catch (e) {
      this._detailBody = e instanceof Error ? e.message : String(e);
    } finally {
      this._detailLoading = false;
    }
  }

  // ── 渲染 ────────────────────────────────────────

  _skillIcon() {
    return html`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`;
  }

  _toggleSec(k: string) {
    this._expandedSec = { ...this._expandedSec, [k]: !this._expandedSec[k] };
  }

  /** 区块头部右侧的伸展/收缩图标（收起时仅保留头部） */
  _secCaret(k: string) {
    return html`<span class="sec-caret">${icons[this._expandedSec[k] ? 'chevron-down' : 'chevron-right']}</span>`;
  }

  _renderPreRow(s: SkillItem) {
    const busy = this._busyPre === s.id;
    const fixing = this._fixingId === s.id;
    const missing = s.status === 'missing';
    const badge = missing
      ? { cls: 'missing', text: L('skills.missingDeps') }
      : s.installed
        ? { cls: '', text: L('skills.preDownloaded') }
        : { cls: 'missing', text: L('skills.preNotDownloaded') };
    return html`
      <div class="skill-item ${s.installed && s.enabled === false ? 'off' : ''}">
        <div class="skill-item__icon preinstalled">🧰</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openDetail(s)}>${L('skills.detail')}</button>
          ${missing && !s.installed ? html`
            <button class="btn-primary" ?disabled=${busy || !!this._busyPre} @click=${() => this._downloadWithDeps(s)}>
              ${busy ? L('skills.downloadWithDepsWorking') : L('skills.downloadWithDeps')}
            </button>` : ''}
          ${missing && s.installed ? html`
            <button class="btn-primary" ?disabled=${fixing || !!this._fixingId} @click=${() => this._fixDeps(s)}>
              ${fixing ? L('skills.fixDepsWorking') : L('skills.fixDeps')}
            </button>` : ''}
          ${!s.installed && !missing
            ? html`<button class="btn-primary" ?disabled=${busy || !!this._busyPre} @click=${() => this._downloadPre(s)}>
                ${busy ? L('skills.downloading') : L('skills.download')}</button>`
            : ''}
          ${s.installed ? html`
            <button class="btn-try" @click=${() => this._tryIt(s)}>${L('skills.tryIt')}</button>
            <button class="btn-toggle" ?disabled=${(!this._isHermes && !this._gwConnected) || !!this._togglingKey} @click=${() => this._toggleSkill(s)}>
              ${s.enabled === false ? L('skills.enableBtn') : L('skills.disableBtn')}</button>
            <button class="btn-danger" ?disabled=${busy} @click=${() => this._uninstallPre(s)}>${L('skills.uninstall')}</button>` : ''}
          <span class="skill-item__badge ${badge.cls}">${badge.text}</span>
        </div>
      </div>
    `;
  }

  /** 可用技能行：详情 +（试一下）+ 停用/启用 */
  _renderActiveRow(s: SkillItem) {
    const off = s.enabled === false;
    const busy = this._togglingKey === s.name;
    const tryable = s.source_kind === 'jobpack';
    return html`
      <div class="skill-item ${off ? 'off' : ''}">
        <div class="skill-item__icon">${s.source_kind === 'jobpack' ? html`💼` : this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openDetail(s)}>${L('skills.detail')}</button>
          ${tryable && !off ? html`<button class="btn-try" @click=${() => this._tryIt(s)}>${L('skills.tryIt')}</button>` : ''}
          <button class="btn-toggle" ?disabled=${(!this._isHermes && !this._gwConnected) || !!this._togglingKey} @click=${() => this._toggleSkill(s)}>
            ${busy ? L('common.loading') : off ? L('skills.enableBtn') : L('skills.disableBtn')}</button>
        </div>
      </div>
    `;
  }

  /** 待修复车道行：详情 +（预装技能可一键修复：未下载 → 下载并补依赖；已下载 → 补依赖） */
  _renderRepairRow(s: SkillItem) {
    const fixing = this._fixingId === s.id;
    const busy = this._busyPre === s.id;
    return html`
      <div class="skill-item">
        <div class="skill-item__icon ${s.preinstalled ? 'preinstalled' : ''}">${s.preinstalled ? '🧰' : this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${s.name}</div>
          <div class="skill-item__source">${s.source}</div>
          <div class="skill-item__desc">${s.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${() => this._openDetail(s)}>${L('skills.detail')}</button>
          ${s.preinstalled && !s.installed ? html`
            <button class="btn-primary" ?disabled=${busy || !!this._busyPre} @click=${() => this._downloadWithDeps(s)}>
              ${busy ? L('skills.downloadWithDepsWorking') : L('skills.downloadWithDeps')}
            </button>` : ''}
          ${s.preinstalled && s.installed ? html`
            <button class="btn-primary" ?disabled=${fixing || !!this._fixingId} @click=${() => this._fixDeps(s)}>
              ${fixing ? L('skills.fixDepsWorking') : L('skills.fixDeps')}
            </button>` : ''}
          <span class="skill-item__badge missing">${s.status_note || L('skills.missingDeps')}</span>
        </div>
      </div>
    `;
  }

  render() {
    const filtered = this._filteredSkills();
    const preinstalled = filtered.filter(s => s.preinstalled);
    const jobpack = filtered.filter(s => s.source_kind === 'jobpack' && s.status === 'available');
    const other = filtered.filter(s => !s.preinstalled && s.source_kind !== 'jobpack' && s.status === 'available');
    const repair = filtered.filter(s => s.status === 'missing');
    const off = filtered.filter(s => s.status === 'available' && s.enabled === false);
    const usable = filtered.filter(s => s.status === 'available' && s.enabled !== false
      && (s.preinstalled ? s.installed : true)).length;

    // 岗位技能按包分组（保持清单顺序）
    const jobGroups = new Map<string, SkillItem[]>();
    for (const s of jobpack) {
      const k = s.pack_name || s.pack_id || '';
      if (!jobGroups.has(k)) jobGroups.set(k, []);
      jobGroups.get(k)!.push(s);
    }

    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="skills-page">

        <div class="skills-tabs">
          <div class="skills-tab ${this._activeTab === 'mine' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'mine'; }}>
            ${L('skills.mySkills')}
          </div>
          <div class="skills-tab ${this._activeTab === 'packs' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'packs'; }}>
            ${L('skills.jobPacks')}
          </div>
          <div class="skills-tab ${this._activeTab === 'hub' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'hub'; }}>
            ${this._isHermes ? L('skills.hermesHub') : 'ClawHub'}
          </div>
        </div>

        ${this._activeTab === 'mine' ? html`
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._search}
              @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }}
              placeholder=${L('skills.filterPlaceholder')}
            />
            <button @click=${() => this._loadSkills()}>${L('common.refresh')}</button>
          </div>

          <div class="skills-summary">
            ${L('skills.summary2', { usable, repair: repair.length, off: off.length })}
          </div>
          ${this._isHermes ? html`<div class="hub-msg warn">${L('skills.hermesNote')}</div>` : ''}
          ${this._laneMsg ? html`<div class="hub-msg err">${this._laneMsg}</div>` : ''}

          <!-- 💼 我的岗位技能（已购买部署的岗位包，按包分组） -->
          ${jobpack.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--success);"
                   @click=${() => this._toggleSec('jobpack')}>
                💼 ${L('skills.myJobSkills')} <span class="count">(${jobpack.length})</span>
                <span class="header-right">${this._secCaret('jobpack')}</span>
              </div>
              ${this._expandedSec['jobpack'] ? html`
                <div class="skills-section__body">
                  ${[...jobGroups.entries()].map(([pack, items]) => html`
                    <div class="group-label">${pack}</div>
                    ${items.map(s => this._renderActiveRow(s))}
                  `)}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- 🧰 预装通用工具（免费） -->
          ${preinstalled.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--accent);"
                   @click=${() => this._toggleSec('pre')}>
                🧰 ${L('skills.preinstalledTitle')} <span class="count">(${preinstalled.length})</span>
                <span class="header-right">${this._secCaret('pre')}</span>
              </div>
              ${this._expandedSec['pre'] ? html`
                <div class="skills-section__body">
                  ${preinstalled.map(s => this._renderPreRow(s))}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- ✓ 其他可用技能（内置 / ClawHub） -->
          ${other.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--success);"
                   @click=${() => this._toggleSec('other')}>
                ✓ ${L('skills.otherAvailable')} <span class="count">(${other.length})</span>
                <span class="header-right">${this._secCaret('other')}</span>
              </div>
              ${this._expandedSec['other'] ? html`
                <div class="skills-section__body">
                  ${other.map(s => this._renderActiveRow(s))}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- ⚠ 待修复（缺依赖；默认折叠，不污染主列表） -->
          ${repair.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--warn);"
                   @click=${() => this._toggleSec('repair')}>
                ${L('skills.missingDeps')} <span class="count">(${repair.length})</span>
                <span class="header-right">
                  <span class="lane-hint">${L('skills.missingHint')}</span>
                  ${this._secCaret('repair')}
                </span>
              </div>
              ${this._expandedSec['repair'] ? html`
                <div class="skills-section__body">
                  ${repair.map(s => this._renderRepairRow(s))}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- ⏸ 已停用（文件还在，恢复即用；默认折叠） -->
          ${off.length > 0 ? html`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--muted);"
                   @click=${() => this._toggleSec('off')}>
                ${L('skills.disabled')} <span class="count">(${off.length})</span>
                <span class="header-right">
                  <span class="lane-hint">${L('skills.offHint')}</span>
                  ${this._secCaret('off')}
                </span>
              </div>
              ${this._expandedSec['off'] ? html`
                <div class="skills-section__body">
                  ${off.map(s => this._renderActiveRow(s))}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${filtered.length === 0 ? html`
            <div class="skills-empty">${this._skills.length === 0 && !this._loading ? L('skills.notInstalled') : L('skills.noMatch')}</div>
          ` : ''}
        ` : this._activeTab === 'packs' ? html`
          <skillshop-panel></skillshop-panel>
        ` : html`
          <!-- ClawHub 搜索安装（高级） -->
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._hubQuery}
              placeholder=${this._isHermes ? L('skills.hermesHubSearchPlaceholder') : L('skills.searchPlaceholder')}
              @input=${(e: Event) => { this._hubQuery = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._searchHub(); }}
            />
            <button ?disabled=${this._hubSearching || !this._hubQuery.trim()} @click=${() => this._searchHub()}>
              ${this._hubSearching ? L('common.loading') : L('skills.search')}
            </button>
          </div>
          <div class="skills-section">
            <div class="skills-section__header">${this._isHermes ? L('skills.hermesHubTitle') : L('skills.searchHubTitle')}</div>
            <div class="hub-warn">${icons['alert-triangle']}<span>${this._isHermes ? L('skills.hermesHubWarn') : L('skills.hubWarn')}</span></div>
            ${this._hubMsg ? html`<div class="hub-msg ${this._hubMsgCls}">${this._hubMsg}</div>` : ''}
            ${!this._hubSearched ? html`
              <div class="hub-empty">
                <div class="hub-intro">
                  <div class="hub-intro__icon">${icons['search']}</div>
                  <div class="hub-intro__desc">${this._isHermes ? L('skills.hermesHubIntro') : L('skills.hubIntro')}</div>
                </div>
                <div class="hub-hints">
                  ${this._isHermes ? html`
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${icons['globe']}</div>
                      <div class="hub-hint__label">${L('skills.hermesHubSrcT')}</div>
                      <div class="hub-hint__desc">${L('skills.hermesHubSrcD')}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${icons['shield']}</div>
                      <div class="hub-hint__label">${L('skills.hermesHubGuardT')}</div>
                      <div class="hub-hint__desc">${L('skills.hermesHubGuardD')}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${icons['wifi']}</div>
                      <div class="hub-hint__label">${L('skills.hubNetworkNoteT')}</div>
                      <div class="hub-hint__desc">${L('skills.hubNetworkNoteD')}</div>
                    </div>
                  ` : html`
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
                  `}
                </div>
              </div>
            ` : !this._hubResults.length ? html`
              <div class="skills-empty">${L('skills.hubNoResults')}</div>
            ` : html`
              <div class="skills-section__body">
                ${this._hubResults.map((r: any) => this._renderHubResult(r))}
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
}

customElements.define('skills-v2-page', SkillsV2Page);
