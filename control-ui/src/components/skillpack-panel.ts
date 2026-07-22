import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import '../components/oc-dialog.js';
import '../components/oc-toast.js';

/**
 * 岗位技能包面板（技能页「岗位技能包」tab）。
 *
 * 数据来源：public/data/skill-packs.json（由 scripts/gen-skillpack-catalog.mjs
 * 从仓库 skill-packs/ 生成）。正式版将改为从授权服务器拉取目录。
 *
 * 购买/安装状态目前持久化在 localStorage（演示用），正式版接入
 * sidecar /api/license/* 与技能包下载通道。
 *
 * 按钮状态机：
 *   未购买   → [详情] [购买]
 *   已购买   → [详情] [已购买(禁用)] [下载]
 *   已下载安装 → [详情] [已购买(禁用)] [下载] [卸载]
 * 已安装的岗位包进入「已安装」数组并单独展示。
 */

type PackSkill = { name: string; triggers: string[] };
type Pack = {
  id: string;
  name: string;
  icon: string;
  category: string;
  priority: string;
  version: string;
  description: string;
  skills: PackSkill[];
  knowledge: string[];
};
type PersistedState = { purchased: string[]; installed: Record<string, number> };

const STORE_KEY = 'lxup.skillpacks.v1';

export class SkillpackPanel extends LitElement {
  static styles = css`
    :host { display: block; }

    .summary { font-size: 12px; color: var(--text-soft); margin-bottom: 14px; }

    /* === toolbar === */
    .toolbar { display: flex; gap: 8px; margin-bottom: 12px; }
    .toolbar input {
      flex: 1; max-width: 320px; padding: 6px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
    }
    .toolbar input::placeholder { color: var(--muted); }
    .toolbar input:focus { border-color: var(--accent); }

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
    .section__body { max-height: 480px; overflow-y: auto; padding: 6px 8px; }

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
    .pack-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
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
    .btn-download { background: transparent; color: var(--accent); border-color: var(--accent); }
    .btn-download:hover { background: var(--accent-subtle); }
    .btn-download:disabled { color: var(--muted); border-color: var(--border); cursor: wait; }
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
    }
    .detail-skill__name { font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
    .detail-skill__triggers { display: flex; gap: 4px; flex-wrap: wrap; }
    .trigger-chip {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-full);
      background: var(--accent-subtle); color: var(--accent); border: 1px solid var(--border);
    }
    .detail-kb { font-size: 12px; color: var(--text-soft); }

    /* === dialog footer（slotted 按钮不受 oc-dialog 内部样式影响）=== */
    [slot='footer'] button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
      border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft);
      transition: all var(--duration-fast) ease;
    }
    [slot='footer'] button:hover { background: var(--bg-hover); color: var(--text); }
  `;

  @state() _catalog: Pack[] = [];
  @state() _loaded = false;
  @state() _loadError = '';
  @state() _search = '';
  @state() _purchased = new Set<string>();
  @state() _installed: Record<string, number> = {};
  @state() _downloading: string | null = null;
  @state() _detail: Pack | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadState();
    this._loadCatalog();
  }

  async _loadCatalog() {
    try {
      const res = await fetch('/data/skill-packs.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._catalog = Array.isArray(data?.packs) ? data.packs : [];
      this._loaded = true;
    } catch (e: any) {
      this._loadError = String(e?.message ?? e);
      this._loaded = true;
    }
  }

  _loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s: PersistedState = JSON.parse(raw);
      if (Array.isArray(s.purchased)) this._purchased = new Set(s.purchased);
      if (s.installed && typeof s.installed === 'object') this._installed = { ...s.installed };
    } catch { /* 状态损坏时按空状态处理 */ }
  }

  _persist() {
    try {
      const s: PersistedState = { purchased: [...this._purchased], installed: this._installed };
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch { /* 隐私模式等场景下静默失败 */ }
  }

  _toast(msg: string) {
    (this.renderRoot.querySelector('oc-toast') as any)?.show(msg);
  }

  _isPurchased(id: string) { return this._purchased.has(id) || this._installed[id] != null; }
  _isInstalled(id: string) { return this._installed[id] != null; }

  _buy(pack: Pack) {
    if (this._isPurchased(pack.id)) return;
    this._purchased.add(pack.id);
    this._purchased = new Set(this._purchased); // 触发响应式更新
    this._persist();
    this._toast(L('skills.buySuccess', { name: pack.name }));
  }

  _download(pack: Pack) {
    if (!this._isPurchased(pack.id) || this._downloading) return;
    this._downloading = pack.id;
    // 演示环境模拟下载；正式版改为从授权服务器拉取加密包 → sha256 校验 → 解密安装
    setTimeout(() => {
      this._installed = { ...this._installed, [pack.id]: Date.now() };
      this._downloading = null;
      this._persist();
      this._toast(L('skills.downloadSuccess', { name: pack.name }));
    }, 900);
  }

  _uninstall(pack: Pack) {
    if (!this._isInstalled(pack.id)) return;
    const next = { ...this._installed };
    delete next[pack.id];
    this._installed = next;
    this._persist();
    this._toast(L('skills.uninstallSuccess', { name: pack.name }));
  }

  /** 按分类分组，保持目录中的出现顺序 */
  _grouped(packs: Pack[]): Array<[string, Pack[]]> {
    const m = new Map<string, Pack[]>();
    for (const p of packs) {
      if (!m.has(p.category)) m.set(p.category, []);
      m.get(p.category)!.push(p);
    }
    return [...m.entries()];
  }

  _filtered(): Pack[] {
    const q = this._search.trim().toLowerCase();
    if (!q) return this._catalog;
    return this._catalog.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.skills.some(s => s.name.toLowerCase().includes(q))
    );
  }

  _renderActions(pack: Pack) {
    const purchased = this._isPurchased(pack.id);
    const installed = this._isInstalled(pack.id);
    const downloading = this._downloading === pack.id;
    return html`
      <button class="btn-detail" @click=${() => { this._detail = pack; }}>${L('skills.detail')}</button>
      ${purchased
        ? html`<button class="btn-bought" disabled>${L('skills.purchased')}</button>`
        : html`<button class="btn-buy" @click=${() => this._buy(pack)}>${L('skills.buy')}</button>`}
      ${purchased
        ? html`<button class="btn-download" ?disabled=${downloading} @click=${() => this._download(pack)}>
            ${downloading ? L('skills.downloading') : L('skills.download')}
          </button>`
        : ''}
      ${installed
        ? html`<button class="btn-uninstall" @click=${() => this._uninstall(pack)}>${L('skills.uninstall')}</button>`
        : ''}
    `;
  }

  _renderPackItem(pack: Pack) {
    const installed = this._isInstalled(pack.id);
    return html`
      <div class="pack-item">
        <div class="pack-item__icon">${pack.icon}</div>
        <div class="pack-item__content">
          <div class="pack-item__title">
            <span class="pack-item__name">${pack.name}</span>
            <span class="badge ${pack.priority === 'P0' ? 'p0' : 'p1'}">${pack.priority}</span>
            ${installed ? html`<span class="badge installed">${L('common.installed')}</span>` : ''}
          </div>
          <div class="pack-item__desc">${pack.description}</div>
          <div class="pack-item__meta">${pack.category} · ${pack.skills.length} 个技能 · v${pack.version}</div>
        </div>
        <div class="pack-item__actions">${this._renderActions(pack)}</div>
      </div>
    `;
  }

  _renderInstalledSection() {
    const rows = this._catalog
      .filter(p => this._isInstalled(p.id))
      .map(p => ({ pack: p, ts: this._installed[p.id] }))
      .sort((a, b) => b.ts - a.ts);
    if (rows.length === 0) return '';
    return html`
      <div class="section">
        <div class="section__header">
          <span class="installed-mark">✓</span> ${L('skills.installedPacks')}
          <span class="count">(${rows.length})</span>
        </div>
        <div style="padding:4px 8px;">
          ${rows.map(({ pack, ts }) => html`
            <div class="installed-row">
              <div class="installed-row__icon">${pack.icon}</div>
              <div class="installed-row__name">
                ${pack.name}
                <span class="installed-row__sub">${pack.category} · ${pack.skills.length} 个技能</span>
              </div>
              <div class="installed-row__time">
                ${L('skills.installedAt')} ${new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderDetailDialog() {
    const p = this._detail;
    return html`
      <oc-dialog .open=${p != null} @close=${() => { this._detail = null; }}>
        <span slot="title">${p ? `${p.icon} ${p.name}` : ''}</span>
        ${p ? html`
          <div class="detail-badges">
            <span class="badge ${p.priority === 'P0' ? 'p0' : 'p1'}">${p.priority}</span>
            <span class="badge p1">${L('skills.categoryLabel')}: ${p.category}</span>
            <span class="badge p1">v${p.version}</span>
            ${this._isInstalled(p.id) ? html`<span class="badge installed">${L('common.installed')}</span>` : ''}
          </div>
          <div class="detail-desc">${p.description}</div>
          <div class="detail-h">${L('skills.skillList')}（${p.skills.length}）</div>
          ${p.skills.map(s => html`
            <div class="detail-skill">
              <div class="detail-skill__name">${s.name}</div>
              <div class="detail-skill__triggers">
                ${s.triggers.map(t => html`<span class="trigger-chip">${t}</span>`)}
              </div>
            </div>
          `)}
          <div class="detail-h">${L('skills.knowledgeBase')}</div>
          <div class="detail-kb">${p.knowledge.join(' · ')}</div>
        ` : ''}
        <div slot="footer">
          <button class="btn-cancel" @click=${() => { this._detail = null; }}>${L('common.dismiss')}</button>
        </div>
      </oc-dialog>
    `;
  }

  render() {
    if (!this._loaded) {
      return html`<div class="empty">加载中…</div>`;
    }
    if (this._loadError) {
      return html`<div class="empty">skill-packs.json 加载失败：${this._loadError}</div>`;
    }

    const filtered = this._filtered();
    const totalSkills = this._catalog.reduce((n, p) => n + p.skills.length, 0);

    return html`
      <div class="summary">${L('skills.packCount', { total: this._catalog.length, skills: Math.round(totalSkills / Math.max(this._catalog.length, 1)) })}</div>

      ${this._renderInstalledSection()}

      <div class="toolbar">
        <input type="text" .value=${this._search}
          placeholder=${L('skills.packFilterPlaceholder')}
          @input=${(e: Event) => { this._search = (e.target as HTMLInputElement).value; }} />
      </div>

      ${filtered.length === 0 ? html`<div class="empty">${L('skills.noPackMatch')}</div>` : ''}

      ${this._grouped(filtered).map(([category, packs]) => html`
        <div class="section">
          <div class="section__header">${category} <span class="count">(${packs.length})</span></div>
          <div class="section__body">
            ${packs.map(p => this._renderPackItem(p))}
          </div>
        </div>
      `)}

      ${this._renderDetailDialog()}
      <oc-toast></oc-toast>
    `;
  }
}

customElements.define('skillpack-panel', SkillpackPanel);
