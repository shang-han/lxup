import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import '../components/oc-dialog.js';
import '../components/oc-toast.js';

/**
 * 岗位技能包商店（新版技能页「岗位技能包」tab）。
 *
 * 与旧版 skillpack-panel 的区别：
 *   - 清单来自 Sidecar `GET /api/gateway/skills/packs`（76-posts.json + 部署注册表），
 *     「已安装」状态真实反映 agent workspace 里的部署情况；
 *   - 「装到工作台」= 真实部署：`POST /api/gateway/skills/packs/{id}/install`
 *     把包内全部技能的 SKILL.md 拷进 OpenClaw agent workspace skills 目录
 *     （技能 watcher 自动加载，无需重启网关）；卸载同理走 `DELETE`。
 *
 * 购买状态仍持久化在 localStorage（与旧面板共用 key，演示用）。
 *
 * 购买即部署：点「购买」成功后立即部署到工作台，技能马上出现在
 * 「我的技能 · 我的岗位技能」。TODO(正式版)：购买接入 license_server
 * （49.233.171.82:9000）授权/支付接口，成功后串联「服务器下载加密包 →
 * sha256 校验 → 解密 → 部署」，用户视角仍是一步；当前包内容在本地
 * skill-packs/ 目录，部署即文件拷贝。
 *
 * 按钮状态机：
 *   未购买            → [详情] [购买]（购买自动部署）
 *   已购买未部署(异常) → [详情] [已购买(禁用)] [装到工作台]（重试入口）
 *   已部署            → [详情] [已安装] [卸载]
 */

type PackSummary = {
  id: string;
  name: string;
  icon: string;
  industry: string;
  category: string;
  priority: string;
  locked: boolean;
  skills: number;
  installed: boolean;
  installed_at: string;
};
type PackSkill = { file?: string; name: string; triggers?: string[]; scripts?: string[] };
type PackDetail = {
  id: string;
  installed: boolean;
  installed_at: string;
  post: {
    name?: string;
    icon?: string;
    category?: string;
    priority?: string;
    version?: string;
    description?: string;
    skills?: PackSkill[];
    knowledge?: string[];
  };
};

const STORE_KEY = 'lxup.skillpacks.v1'; // 与旧面板共用：购买状态在两版页面间延续

export class SkillshopPanel extends LitElement {
  static styles = css`
    :host { display: block; }
    /* Shadow DOM 不继承文档级 box-sizing:border-box */
    :host *, :host *::before, :host *::after { box-sizing: border-box; }

    .summary { font-size: 12px; color: var(--text-soft); margin-bottom: 10px; }
    .demo-note {
      display: flex; align-items: flex-start; gap: 8px;
      margin-bottom: 16px; padding: 8px 12px;
      background: rgba(245,158,11,0.09);
      border: 1px solid rgba(245,158,11,0.28);
      border-radius: var(--radius-md);
      font-size: 12px; line-height: 1.5; color: var(--text-soft);
    }

    /* === category chips === */
    .cat-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
    .cat-chip {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 8px 5px 14px; border-radius: var(--radius-full);
      font-size: 12px; font-weight: 500;
      border: 1px solid var(--border); background: var(--card); color: var(--text-soft);
      cursor: pointer; white-space: nowrap;
      transition: color var(--duration-fast) ease, border-color var(--duration-fast) ease,
                  background var(--duration-fast) ease, transform var(--duration-fast) ease;
    }
    .cat-chip:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
    .cat-chip.active { background: var(--accent); border-color: var(--accent); color: var(--accent-foreground); }
    .cat-chip.active:hover { transform: none; }
    .cat-chip .chip-count {
      font-size: 10px; font-weight: 600; padding: 0 7px; border-radius: var(--radius-full);
      background: var(--bg-muted); color: var(--muted); line-height: 16px;
    }
    .cat-chip.active .chip-count { background: rgba(255,255,255,0.22); color: var(--accent-foreground); }

    /* === section === */
    .section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-bottom: 16px;
    }
    .section__header {
      padding: 12px 18px; font-size: 13px; font-weight: 600;
      color: var(--text-strong); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 8px;
    }
    .section__header .count { font-size: 12px; font-weight: 400; color: var(--text-soft); }
    .section__header .installed-mark { color: var(--success); }
    .section__body { padding: 6px 8px; }

    /* === pack item === */
    .pack-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 12px; border-bottom: 1px solid var(--border);
      border-radius: var(--radius-sm);
      transition: background var(--duration-fast) ease;
    }
    .pack-item:hover { background: var(--bg-hover); }
    .pack-item:last-child { border-bottom: none; }
    .pack-item__icon {
      width: 40px; height: 40px; flex-shrink: 0; display: flex;
      align-items: center; justify-content: center; font-size: 20px;
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .pack-item__content { flex: 1; min-width: 0; }
    .pack-item__title { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
    .pack-item__name { font-size: 13px; font-weight: 600; color: var(--text-strong); }
    .pack-item__meta { font-size: 11px; color: var(--muted); margin-top: 3px; }
    .badge {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-full); font-weight: 600;
      white-space: nowrap;
    }
    .badge.p0 { background: rgba(251,191,36,0.14); color: var(--warn); }
    .badge.p1 { background: var(--bg-muted); color: var(--muted); }
    .badge.installed { background: var(--success-subtle); color: var(--success); }

    /* === actions === */
    .pack-item__actions { display: flex; gap: 6px; flex-shrink: 0; align-items: center; }
    .pack-item__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast) ease; white-space: nowrap;
    }
    .btn-detail { background: transparent; color: var(--text-soft); }
    .btn-detail:hover { background: var(--bg-hover); color: var(--text); }
    .btn-buy { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }
    .btn-buy:hover { background: var(--accent-hover); }
    .btn-bought {
      background: var(--bg-muted); color: var(--muted);
      cursor: not-allowed; border-color: var(--border);
    }
    .btn-install-ws { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }
    .btn-install-ws:hover { background: var(--accent-hover); }
    .btn-install-ws:disabled { opacity: 0.5; cursor: wait; }
    .btn-uninstall { background: transparent; color: var(--danger); border-color: var(--danger); }
    .btn-uninstall:hover { background: var(--danger-subtle); }

    /* === empty / loading === */
    .empty { text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px; }

    /* === installed section rows === */
    .installed-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-bottom: 1px solid var(--border);
    }
    .installed-row:last-child { border-bottom: none; }
    .installed-row__icon { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
    .installed-row__name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text-strong); min-width: 0; }
    .installed-row__sub { font-size: 11px; color: var(--muted); font-weight: 400; margin-left: 8px; }
    .installed-row__time { font-size: 11px; color: var(--muted); white-space: nowrap; }

    /* === detail dialog === */
    .detail-badges { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .detail-desc { font-size: 13px; color: var(--text-soft); line-height: 1.7; margin-bottom: 14px; }
    .detail-h { font-size: 12px; font-weight: 600; color: var(--text-strong); margin: 12px 0 8px; }
    .detail-skill {
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 8px 12px; margin-bottom: 6px;
      display: flex; align-items: center; gap: 10px;
    }
    .detail-skill__main { flex: 1; min-width: 0; }
    .detail-skill__name { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
    .detail-skill__triggers { display: flex; gap: 4px; flex-wrap: wrap; }
    .trigger-chip {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-full);
      background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--border);
    }
    .detail-skill__view {
      padding: 2px 10px; border-radius: var(--radius-sm); font-size: 11px;
      border: 1px solid var(--border); background: transparent; color: var(--text-soft);
      cursor: pointer; white-space: nowrap; flex-shrink: 0;
    }
    .detail-skill__view:hover { background: var(--bg-hover); color: var(--text); }
    .detail-kb { font-size: 12px; color: var(--text-soft); }

    /* === SKILL.md 查看弹窗 === */
    .skillmd {
      font-size: 12px; color: var(--text-soft); line-height: 1.7;
      white-space: pre-wrap; word-break: break-word;
      font-family: var(--font-mono); max-height: 52vh; overflow-y: auto;
    }

    /* === dialog footer（slotted 按钮不受 oc-dialog 内部样式影响）=== */
    [slot='footer'] button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
      border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft);
      transition: all var(--duration-fast) ease;
    }
    [slot='footer'] button:hover { background: var(--bg-hover); color: var(--text); }
    [slot='footer'] button.primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    [slot='footer'] button.primary:hover { background: var(--accent-hover); }
    [slot='footer'] button.primary:disabled { opacity: 0.5; cursor: wait; }
  `;

  @state() _packs: PackSummary[] = [];
  @state() _loaded = false;
  @state() _loadError = '';
  @state() _category: string | null = null;
  @state() _purchased = new Set<string>();
  @state() _busyPack: string | null = null; // 正在部署/卸载的包 id
  @state() _detail: PackDetail | null = null;
  @state() _detailLoading = false;
  // SKILL.md 查看子弹窗
  @state() _mdOpen = false;
  @state() _mdTitle = '';
  @state() _mdBody = '';
  @state() _mdLoading = false;

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadPurchased();
    void this._loadPacks();
  }

  async _loadPacks() {
    try {
      const res = await fetch(`${this._sidecarBase}/api/gateway/skills/packs`, { headers: sidecarHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._packs = Array.isArray(data?.data) ? data.data : [];
      this._loaded = true;
    } catch (e: any) {
      this._loadError = String(e?.message ?? e);
      this._loaded = true;
    }
  }

  _loadPurchased() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (Array.isArray(s?.purchased)) this._purchased = new Set(s.purchased);
    } catch { /* 状态损坏时按空状态处理 */ }
  }

  _persistPurchased() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ purchased: [...this._purchased] }));
    } catch { /* 隐私模式等场景下静默失败 */ }
  }

  _toast(msg: string) {
    (this.renderRoot.querySelector('oc-toast') as any)?.show(msg);
  }

  _isPurchased(id: string) { return this._purchased.has(id); }

  /** 购买：记录购买状态后立即部署（购买即得）。
   * TODO(正式版)：先调 license_server 授权/支付接口，成功后从服务器下载
   * 加密包 → sha256 校验 → 解密，再走 _deploy。 */
  async _buy(pack: PackSummary) {
    if (this._isPurchased(pack.id) || this._busyPack) return;
    this._purchased.add(pack.id);
    this._purchased = new Set(this._purchased); // 触发响应式更新
    this._persistPurchased();
    const ok = await this._deploy(pack, L('skills.buyAndDeploySuccess', { name: pack.name }));
    if (!ok) this._toast(L('skills.buySuccess', { name: pack.name })); // 部署失败时至少确认购买成功，可用「装到工作台」重试
  }

  /** 部署到工作台：SKILL.md 拷入 agent workspace skills 目录；返回是否成功 */
  async _deploy(pack: PackSummary, successMsg: string): Promise<boolean> {
    if (!this._isPurchased(pack.id) || this._busyPack) return false;
    this._busyPack = pack.id;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(pack.id)}/install`, { method: 'POST', headers: sidecarHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadPacks();
      this._toast(successMsg);
      if (this._detail?.id === pack.id) this._detail = { ...this._detail, installed: true };
      return true;
    } catch (e) {
      this._toast(`${L('skills.installFailed')}${e instanceof Error ? e.message : String(e)}`);
      return false;
    } finally {
      this._busyPack = null;
    }
  }

  async _uninstall(pack: PackSummary) {
    if (!pack.installed || this._busyPack) return;
    this._busyPack = pack.id;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(pack.id)}`, { method: 'DELETE', headers: sidecarHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadPacks();
      this._toast(L('skills.uninstallSuccess', { name: pack.name }));
      if (this._detail?.id === pack.id) this._detail = { ...this._detail, installed: false };
    } catch (e) {
      this._toast(`${L('skills.uninstallFailed')}${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this._busyPack = null;
    }
  }

  /** 详情：post.json 全量（描述/技能清单/知识条目）经 Sidecar 读取 */
  async _openDetail(pack: PackSummary) {
    this._detailLoading = true;
    this._detail = { id: pack.id, installed: pack.installed, installed_at: pack.installed_at, post: { name: pack.name, icon: pack.icon } };
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(pack.id)}`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      this._detail = await r.json();
    } catch (e) {
      this._detail = null;
      this._toast(`${L('skills.packLoadFailed')}${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this._detailLoading = false;
    }
  }

  /** 查看单个技能的 SKILL.md 全文（含示例段） */
  async _viewSkillMd(packId: string, file: string | undefined, name: string) {
    if (!file) return;
    this._mdOpen = true;
    this._mdTitle = name;
    this._mdBody = '';
    this._mdLoading = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(packId)}/skills/${encodeURIComponent(file)}`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      const d = await r.json();
      this._mdBody = String(d.content || '—').replace(/^---[\s\S]*?---\s*/, '');
    } catch (e) {
      this._mdBody = e instanceof Error ? e.message : String(e);
    } finally {
      this._mdLoading = false;
    }
  }

  _filtered(): PackSummary[] {
    if (!this._category) return this._packs;
    return this._packs.filter(p => p.category === this._category);
  }

  /** 按分类分组，保持清单中的出现顺序 */
  _grouped(packs: PackSummary[]): Array<[string, PackSummary[]]> {
    const m = new Map<string, PackSummary[]>();
    for (const p of packs) {
      if (!m.has(p.category)) m.set(p.category, []);
      m.get(p.category)!.push(p);
    }
    return [...m.entries()];
  }

  _getCategories(): Array<{ name: string; count: number }> {
    const m = new Map<string, number>();
    for (const p of this._packs) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return [...m.entries()].map(([name, count]) => ({ name, count }));
  }

  _renderActions(pack: PackSummary) {
    const purchased = this._isPurchased(pack.id);
    const busy = this._busyPack === pack.id;
    return html`
      <button class="btn-detail" @click=${() => this._openDetail(pack)}>${L('skills.detail')}</button>
      ${purchased
        ? html`<button class="btn-bought" disabled>${L('skills.purchased')}</button>`
        : html`<button class="btn-buy" ?disabled=${busy || !!this._busyPack} @click=${() => this._buy(pack)}>
            ${busy ? L('skills.downloading') : L('skills.buy')}
          </button>`}
      ${purchased && !pack.installed
        ? html`<button class="btn-install-ws" ?disabled=${busy || !!this._busyPack}
            @click=${() => this._deploy(pack, L('skills.downloadSuccess', { name: pack.name }))}>
            ${busy ? L('skills.downloading') : L('skills.installToWs')}
          </button>`
        : ''}
      ${pack.installed
        ? html`<button class="btn-uninstall" ?disabled=${busy} @click=${() => this._uninstall(pack)}>${L('skills.uninstall')}</button>`
        : ''}
    `;
  }

  _renderPackItem(pack: PackSummary) {
    return html`
      <div class="pack-item">
        <div class="pack-item__icon">${pack.icon || '💼'}</div>
        <div class="pack-item__content">
          <div class="pack-item__title">
            <span class="pack-item__name">${pack.name}</span>
            <span class="badge ${pack.priority === 'P0' ? 'p0' : 'p1'}">${pack.priority}</span>
            ${pack.installed ? html`<span class="badge installed">${L('common.installed')}</span>` : ''}
          </div>
          <div class="pack-item__meta">${pack.category} · ${pack.skills} ${L('skills.skillsUnit')}</div>
        </div>
        <div class="pack-item__actions">${this._renderActions(pack)}</div>
      </div>
    `;
  }

  _renderInstalledSection() {
    const rows = this._packs
      .filter(p => p.installed)
      .sort((a, b) => (b.installed_at || '').localeCompare(a.installed_at || ''));
    if (rows.length === 0) return '';
    return html`
      <div class="section">
        <div class="section__header">
          <span class="installed-mark">✓</span> ${L('skills.installedPacks')}
          <span class="count">(${rows.length})</span>
        </div>
        <div style="padding:4px 8px;">
          ${rows.map(p => html`
            <div class="installed-row">
              <div class="installed-row__icon">${p.icon || '💼'}</div>
              <div class="installed-row__name">
                ${p.name}
                <span class="installed-row__sub">${p.category} · ${p.skills} ${L('skills.skillsUnit')}</span>
              </div>
              <div class="installed-row__time">
                ${p.installed_at ? L('skills.installedAt') + ' ' + new Date(p.installed_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderDetailDialog() {
    const d = this._detail;
    const p = d?.post;
    const summary = this._packs.find(x => x.id === d?.id);
    const purchased = d ? this._isPurchased(d.id) : false;
    const busy = d ? this._busyPack === d.id : false;
    return html`
      <oc-dialog .open=${d != null} @close=${() => { this._detail = null; }}>
        <span slot="title">${d ? `${p?.icon || summary?.icon || '💼'} ${p?.name || summary?.name || ''}` : ''}</span>
        ${d && p ? html`
          <div class="detail-badges">
            ${p.priority ? html`<span class="badge ${p.priority === 'P0' ? 'p0' : 'p1'}">${p.priority}</span>` : ''}
            ${p.category ? html`<span class="badge p1">${L('skills.categoryLabel')}: ${p.category}</span>` : ''}
            ${p.version ? html`<span class="badge p1">v${p.version}</span>` : ''}
            ${d.installed ? html`<span class="badge installed">${L('common.installed')}</span>` : ''}
          </div>
          <div class="detail-desc">${p.description || (this._detailLoading ? L('common.loading') : '—')}</div>
          ${Array.isArray(p.skills) && p.skills.length ? html`
            <div class="detail-h">${L('skills.skillList')}（${p.skills.length}）</div>
            ${p.skills.map(s => html`
              <div class="detail-skill">
                <div class="detail-skill__main">
                  <div class="detail-skill__name">${s.name}</div>
                  <div class="detail-skill__triggers">
                    ${(s.triggers || []).map(t => html`<span class="trigger-chip">${t}</span>`)}
                  </div>
                </div>
                ${s.file ? html`<button class="detail-skill__view"
                  @click=${() => this._viewSkillMd(d.id, s.file, s.name)}>${L('skills.viewSkill')}</button>` : ''}
              </div>
            `)}
          ` : ''}
          ${Array.isArray(p.knowledge) && p.knowledge.length ? html`
            <div class="detail-h">${L('skills.knowledgeBase')}</div>
            <div class="detail-kb">${p.knowledge.join(' · ')}</div>
          ` : ''}
        ` : ''}
        <div slot="footer">
          ${d && purchased && !d.installed ? html`
            <button class="primary" ?disabled=${busy || !!this._busyPack}
              @click=${() => this._deploy(d, L('skills.downloadSuccess', { name: p?.name || d.id }))}>
              ${busy ? L('skills.downloading') : L('skills.installToWs')}
            </button>` : ''}
          <button class="btn-cancel" @click=${() => { this._detail = null; }}>${L('common.dismiss')}</button>
        </div>
      </oc-dialog>
    `;
  }

  _renderMdDialog() {
    if (!this._mdOpen) return '';
    return html`
      <oc-dialog .open=${true} @close=${() => { this._mdOpen = false; }}>
        <span slot="title">${this._mdTitle}</span>
        <div class="skillmd">${this._mdLoading ? L('common.loading') : this._mdBody}</div>
        <div slot="footer">
          <button class="btn-cancel" @click=${() => { this._mdOpen = false; }}>${L('common.dismiss')}</button>
        </div>
      </oc-dialog>
    `;
  }

  render() {
    if (!this._loaded) {
      return html`<div class="empty">${L('common.loading')}</div>`;
    }
    if (this._loadError) {
      return html`<div class="empty">${L('skills.packLoadFailed')}${this._loadError}</div>`;
    }

    const filtered = this._filtered();
    const installedCount = this._packs.filter(p => p.installed).length;
    const totalSkills = this._packs.reduce((n, p) => n + (typeof p.skills === 'number' ? p.skills : 0), 0);

    return html`
      <div class="summary">${L('skills.packCount', { total: this._packs.length, skills: totalSkills })} · ${L('skills.installedPacks')} ${installedCount}</div>
      <div class="demo-note">⚠️ ${L('skills.buyDemoNote')}</div>

      ${this._renderInstalledSection()}

      <div class="cat-row">
        ${this._getCategories().map(c => html`
          <button class="cat-chip ${this._category === c.name ? 'active' : ''}"
                  @click=${() => { this._category = this._category === c.name ? null : c.name; }}>
            ${c.name}
            <span class="chip-count">${c.count}</span>
          </button>
        `)}
      </div>

      ${this._grouped(filtered).map(([category, packs]) => html`
        <div class="section">
          <div class="section__header">${category} <span class="count">(${packs.length})</span></div>
          <div class="section__body">
            ${packs.map(p => this._renderPackItem(p))}
          </div>
        </div>
      `)}

      ${this._renderDetailDialog()}
      ${this._renderMdDialog()}
      <oc-toast></oc-toast>
    `;
  }
}

customElements.define('skillshop-panel', SkillshopPanel);
