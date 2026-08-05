import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import '../components/page-header.js';
import '../components/oc-card.js';
import '../components/oc-btn.js';
import '../components/oc-badge.js';

export class MemoryPage extends LitElement {
  createRenderRoot() { return this; }
  static styles = css`:host{display:block;}`;
  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _search = '';
  @state() _filterType = '';
  /** 真实数据：workspace 的 MEMORY/USER/SOUL.md + memory/*.md（经 Sidecar） */
  @state() _memories: any[] = [];
  @state() _loadMsg = '';
  @state() _busy = false;

  @state() _editing: any = null;
  @state() _editContent = '';

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  connectedCallback() {
    super.connectedCallback();
    void this._load();
  }

  _typeOfFile(file: string): string {
    if (file === 'USER.md') return 'user';
    if (file === 'SOUL.md') return 'soul';
    return 'note';
  }

  async _load() {
    this._loadMsg = '';
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/memories`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = (await r.json()) as { entries?: Array<{ file: string; content: string; mtime?: string | null }> };
      this._memories = (d.entries || []).map(e => {
        const content = e.content || '';
        return {
          id: e.file,
          file: e.file,
          name: e.file.replace(/^memory\//, '').replace(/\.md$/, ''),
          type: this._typeOfFile(e.file),
          content,
          words: content.trim() ? content.trim().split(/\s+/).length : 0,
          updated: e.mtime ? new Date(e.mtime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—',
        };
      });
    } catch (e) {
      this._loadMsg = `${L('common.memLoadFailed')}${e instanceof Error ? e.message : String(e)}`;
    }
  }

  /** 创建记忆：今日日志 memory/YYYY-MM-DD.md，已存在则直接打开编辑 */
  async _create() {
    const file = `memory/${new Date().toISOString().slice(0, 10)}.md`;
    const existing = this._memories.find(m => m.file === file);
    if (existing) { this._startEdit(existing); return; }
    if (this._busy) return;
    this._busy = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/memories`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ file, content: '' }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._load();
      const created = this._memories.find(m => m.file === file);
      if (created) this._startEdit(created);
    } catch (e) {
      this._loadMsg = `${L('common.memSaveFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busy = false;
    }
  }

  get _filtered() {
    let list = this._memories;
    if (this._search.trim()) {
      const q = this._search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.content.toLowerCase().includes(q));
    }
    if (this._filterType) {
      list = list.filter(m => m.type === this._filterType);
    }
    return list;
  }

  _typeBadge(t: string) {
    const labels: Record<string,string> = { user: L('common.typeUser'), note: L('common.typeNote'), soul: L('common.typeSoul') };
    const variants: Record<string,string> = { user:'success', note:'warning', soul:'danger' };
    return html`<oc-badge variant="${variants[t]||'default'}">${labels[t]||t}</oc-badge>`;
  }

  _startEdit(m: any) {
    this._editing = m;
    this._editContent = m.content;
  }

  async _saveEdit() {
    if (!this._editing || this._busy) return;
    const file = this._editing.file as string;
    const content = this._editContent;
    this._busy = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/memories`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ file, content }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      this._editing = null;
      this._editContent = '';
      await this._load();
    } catch (e) {
      this._loadMsg = `${L('common.memSaveFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busy = false;
    }
  }

  async _delete(m: any) {
    if (this._busy) return;
    if (!window.confirm(L('common.memDeleteConfirm', { name: m.name }))) return;
    this._busy = true;
    try {
      const r = await fetch(`${this._sidecarBase}/api/gateway/memories?file=${encodeURIComponent(m.file)}`, {
        method: 'DELETE',
        headers: sidecarHeaders(),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._load();
    } catch (e) {
      this._loadMsg = `${L('common.memSaveFailed')}${e instanceof Error ? e.message : String(e)}`;
    } finally {
      this._busy = false;
    }
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="page-toolbar-lg">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder=${L('common.searchMemory')} .value=${this._search} @input=${(e:Event) => { this._search = (e.target as HTMLInputElement).value; this.requestUpdate(); }} />
          </div>
          <select class="form-input" style="width:auto;padding:6px 10px;" .value=${this._filterType} @change=${(e:Event) => { this._filterType = (e.target as HTMLSelectElement).value; this.requestUpdate(); }}>
            <option value="">${L('common.filterType')}</option>
            <option value="user">${L('common.typeUser')}</option>
            <option value="note">${L('common.typeNote')}</option>
            <option value="soul">${L('common.typeSoul')}</option>
          </select>
        </div>
        <button class="btn-sm" ?disabled=${this._busy} @click=${this._create}>+ ${L('common.createMemory')}</button>
      </div>

      ${this._loadMsg ? html`
        <div style="margin:0 0 12px;padding:8px 12px;border:1px solid var(--danger);color:var(--danger);border-radius:var(--radius-md);font-size:12px;">${this._loadMsg}</div>
      ` : ''}

      ${this._editing ? html`
        <oc-card heading="${L('common.edit')}: ${this._editing.name}" style="margin-bottom:16px;">
          <div class="form-group">
            <textarea class="form-input" rows="4" .value=${this._editContent} @input=${(e:Event) => this._editContent = (e.target as HTMLTextAreaElement).value}></textarea>
          </div>
          <div class="page-actions">
            <button class="btn-sm" @click=${this._saveEdit}>${L('common.save')}</button>
            <button class="btn-sm ghost" @click=${() => { this._editing = null; this._editContent = ''; }}>${L('common.cancel')}</button>
          </div>
        </oc-card>
      ` : ''}

      <div class="grid2">
        ${this._filtered.map((m:any) => html`
          <div class="channel-card">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span class="channel-name" style="font-family:var(--font-mono);font-size:13px;">${m.name}</span>
                  ${this._typeBadge(m.type)}
                </div>
                <div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:8px;">${m.content}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted);">
              <span>${m.words} ${L('common.wordCount')} · ${m.updated}</span>
              <div class="page-actions">
                <button class="btn-sm ghost" @click=${() => this._startEdit(m)}>${L('common.edit')}</button>
                <button class="btn-sm ghost" style="color:var(--danger);" ?disabled=${this._busy} @click=${() => this._delete(m)}>${L('common.delete')}</button>
              </div>
            </div>
          </div>
        `)}
      </div>
      ${this._filtered.length === 0 ? html`<div class="empty-state"><p>${L('common.descMemory')}</p></div>` : ''}
    `;
  }
}
customElements.define('memory-page', MemoryPage);
