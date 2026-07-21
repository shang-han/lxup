import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
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
  @state() _memories = [
    { id:'m1', name:'user-profile', type:'user', content:'User prefers concise answers. Works as a senior backend engineer.', words:14, updated:'2026-07-14 15:30' },
    { id:'m2', name:'project-context', type:'note', content:'This project uses Tauri v2 for desktop shell, FastAPI for gateway, and Lit for frontend Web Components.', words:18, updated:'2026-07-13 10:15' },
    { id:'m3', name:'codex-config', type:'note', content:'Codex CLI is configured with --sandbox landlock and uses gpt-4.2 as default model. Workspace is at ~/projects/lxup.', words:20, updated:'2026-07-15 08:00' },
    { id:'m4', name:'agent-personality', type:'soul', content:'You are a helpful, concise coding assistant. You prefer direct answers over long explanations.', words:15, updated:'2026-07-12 22:45' },
    { id:'m5', name:'api-endpoints', type:'note', content:'Gateway REST API: GET /health, GET /api/sessions, POST /api/config, WS /ws/chat. Auth via Bearer token.', words:22, updated:'2026-07-11 14:20' },
    { id:'m6', name:'deployment-notes', type:'note', content:'Build pipeline: pyinstaller → nexe → tauri build. Sign with codesign (macOS) / signtool (Windows).', words:16, updated:'2026-07-10 09:00' },
  ];

  @state() _editing: any = null;
  @state() _editContent = '';

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

  _saveEdit() {
    if (!this._editing) return;
    const words = this._editContent.trim().split(/\s+/).filter(Boolean).length;
    this._memories = this._memories.map(m =>
      m.id === this._editing.id ? { ...m, content: this._editContent, words, updated: new Date().toISOString().replace('T',' ').slice(0,16) } : m
    );
    this._editing = null;
    this._editContent = '';
  }

  _delete(id: string) {
    this._memories = this._memories.filter(m => m.id !== id);
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
        <button class="btn-sm">+ ${L('common.createMemory')}</button>
      </div>

      ${this._editing ? html`
        <oc-card heading="${L('common.edit')}: ${this._editing.name}" style="margin-bottom:16px;">
          <div class="form-group">
            <textarea class="form-input" rows="4" .value=${this._editContent} @input=${(e:Event) => this._editContent = (e.target as HTMLTextAreaElement).value}></textarea>
          </div>
          <div class="page-actions">
            <button class="btn-sm" @click=${this._saveEdit}>${L('common.save')}</button>
            <button class="btn-sm ghost" @click=${() => { this._editing = null; this._editContent = ''; }}>Cancel</button>
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
                <button class="btn-sm ghost" style="color:var(--danger);" @click=${() => this._delete(m.id)}>${L('common.delete')}</button>
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
