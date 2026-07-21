import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import type { GatewayStore } from '../store/gateway-store.js';
import '../components/page-header.js';
import '../components/oc-dialog.js';

/** 字节数格式化为 B / KB */
function fmtSize(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** 毫秒时间戳 → 本地时间字符串 */
function fmtTime(ms: number | null | undefined): string {
  if (!ms) return '—';
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return '—';
  }
}

export class AgentsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .agents-page { width: 100%; }

    /* === subtitle hint === */
    .agents-hint {
      font-size: 12px; color: var(--danger); margin: -12px 0 16px 24px;
    }

    /* === agent card === */
    .agent-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 20px; margin-bottom: 12px; box-shadow: var(--shadow-card);
      cursor: pointer; transition: border-color var(--duration-fast);
    }
    .agent-card:hover { border-color: var(--accent); }
    .agent-card__header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 12px;
    }
    .agent-card__left { display: flex; align-items: center; gap: 10px; }
    .agent-card__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      font-family: var(--font-mono);
    }
    .agent-card__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .agent-card__actions { display: flex; gap: 6px; }
    .agent-card__actions button {
      padding: 4px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .agent-card__actions .btn-detail {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .agent-card__actions .btn-detail:hover { background: var(--accent-hover); }
    .agent-card__actions .btn-ghost {
      background: transparent; color: var(--text-soft);
    }
    .agent-card__actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }

    .agent-card__fields { display: flex; flex-direction: column; gap: 6px; }
    .agent-card__field {
      display: flex; align-items: baseline; gap: 12px;
      font-size: 13px;
    }
    .agent-card__field-label {
      color: var(--text-soft); min-width: 52px; flex-shrink: 0;
    }
    .agent-card__field-value {
      color: var(--text); word-break: break-all;
    }
    .agent-card__field-value.mono {
      font-family: var(--font-mono); font-size: 12px; color: var(--muted);
    }

    /* === new agent button === */
    .btn-new {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .btn-new:hover { background: var(--accent-hover); }

    /* === dialog form styles === */
    .channel-dialog .form-group { margin-bottom: 14px; }
    .channel-dialog .form-group:last-child { margin-bottom: 0; }
    .channel-dialog .form-label {
      display: block; font-size: 12px; font-weight: 500; color: var(--text);
      margin-bottom: 4px;
    }
    .channel-dialog .form-label .required { color: var(--danger); }
    .channel-dialog .form-input {
      width: 100%; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .channel-dialog .form-input:focus { border-color: var(--accent); }

    /* === detail view === */
    .agent-detail { width: 100%; padding-top: 20px; }
    .agent-detail__back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 13px; color: var(--danger); cursor: pointer;
      margin-bottom: 12px; user-select: none;
    }
    .agent-detail__back:hover { text-decoration: underline; }
    .agent-detail__title {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border);
    }
    .agent-detail__name {
      font-size: 22px; font-weight: 700; color: var(--text-strong);
      font-family: var(--font-mono);
    }

    /* === detail tabs === */
    .detail-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }
    .detail-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .detail-tab:hover { color: var(--text); }
    .detail-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* === detail sections === */
    .detail-section {
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px;
    }
    .detail-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 12px;
    }
    .detail-section__desc {
      font-size: 12px; color: var(--muted); margin-bottom: 12px;
    }
    .detail-form-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    @media (max-width: 600px) { .detail-form-grid { grid-template-columns: 1fr; } }
    .detail-field { display: flex; flex-direction: column; gap: 4px; }
    .detail-field__label {
      font-size: 12px; font-weight: 500; color: var(--text-soft);
    }
    .detail-field__input {
      padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      outline: none; transition: border-color var(--duration-fast);
    }
    .detail-field__input:focus { border-color: var(--accent); }
    .detail-field__input:disabled {
      opacity: 0.6; cursor: not-allowed;
    }
    .detail-field__input.mono {
      font-family: var(--font-mono); font-size: 12px; color: var(--muted);
    }

    /* === file list === */
    .file-list { display: flex; flex-direction: column; gap: 8px; }
    .file-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .file-item__left { flex: 1; min-width: 0; }
    .file-item__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      font-family: var(--font-mono); display: flex; align-items: center; gap: 8px;
    }
    .file-item__badge {
      font-size: 10px; padding: 1px 6px; border-radius: var(--radius-full);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .file-item__desc {
      font-size: 12px; color: var(--text-soft); margin-top: 2px;
    }
    .file-item__meta {
      font-size: 11px; color: var(--muted); margin-top: 2px;
    }
    .file-item__edit {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); flex-shrink: 0;
    }
    .file-item__edit:hover { background: var(--bg-hover); color: var(--text); }

    /* === skills grid === */
    .skills-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;
    }
    .skill-checkbox-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 14px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .skill-checkbox-item input[type="checkbox"] {
      margin-top: 2px; cursor: pointer; flex-shrink: 0;
    }
    .skill-checkbox-item__content { flex: 1; min-width: 0; }
    .skill-checkbox-item__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
    }
    .skill-checkbox-item__name svg { color: var(--success); width: 14px; height: 14px; }
    .skill-checkbox-item__desc {
      font-size: 11px; color: var(--text-soft); line-height: 1.5;
    }

    /* === textarea === */
    .detail-textarea {
      width: 100%; min-height: 80px; padding: 10px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; font-family: var(--font-mono);
      outline: none; resize: vertical; transition: border-color var(--duration-fast);
    }
    .detail-textarea:focus { border-color: var(--accent); }

    /* === save button === */
    .detail-save {
      display: flex; justify-content: center; margin-top: 16px;
    }
    .detail-save button {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast);
    }
    .detail-save button:hover { background: var(--accent-hover); }

    /* === channel empty === */
    .channel-empty {
      text-align: center; padding: 40px 24px; color: var(--muted); font-size: 13px;
    }
    .channel-empty__btn {
      margin-top: 12px; padding: 6px 16px; border-radius: var(--radius-sm);
      font-size: 12px; font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
    }
    .channel-empty__btn:hover { background: var(--accent-hover); }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Function }) onNavigate: (page: string) => void = () => {};

  @state() _agents: any[] = [];
  @state() _defaultId = '';
  @state() _connected = false;

  // 渠道状态（channels.status）与技能列表（skills.status）
  @state() _channels: Record<string, any> = {};
  @state() _skills: any[] = [];

  @state() _dialogOpen = false;
  @state() _formName = '';
  @state() _formModel = '';
  @state() _formWorkspace = '';

  // Detail view state
  @state() _detailView = false;
  @state() _detailAgent: any = null;
  @state() _detailTab = 'overview'; // 'overview' | 'files' | 'channels' | 'tools' | 'skills'

  // 详情实例的 bootstrap 文件（agents.files.list）
  @state() _files: any[] = [];
  @state() _filesWorkspace = '';

  // File edit dialog state
  @state() _fileEditOpen = false;
  @state() _editingFile = '';
  @state() _fileContent = '';
  @state() _saving = false;

  _storeUnsub: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe((snap) => {
      const was = this._connected;
      this._connected = snap.connected;
      if (snap.connected && !was) this._loadAll();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
  }

  async _loadAll() {
    await Promise.all([this._loadAgents(), this._loadChannels(), this._loadSkills()]);
  }

  async _loadAgents() {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const res = await store.request<any>('agents.list', {});
      this._agents = res?.agents || [];
      this._defaultId = res?.defaultId || '';
    } catch { /* 忽略瞬时错误 */ }
  }

  async _loadChannels() {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const res = await store.request<any>('channels.status', {});
      this._channels = res?.channels || {};
    } catch { /* ignore */ }
  }

  async _loadSkills() {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const res = await store.request<any>('skills.status', {});
      this._skills = res?.skills || [];
    } catch { /* ignore */ }
  }

  /** 已配置/运行的渠道 id 列表 */
  _connectedChannelIds(): string[] {
    return Object.entries(this._channels)
      .filter(([, st]: any) => st && (st.configured || st.running))
      .map(([id]) => id);
  }

  _agentModel(agent: any): string {
    const m = agent?.model;
    if (!m) return L('agents.defaultModel');
    if (typeof m === 'string') return m;
    return m.primary || m.id || L('agents.defaultModel');
  }

  _openNewAgent() {
    this._formName = '';
    this._formModel = '';
    this._formWorkspace = '';
    this._dialogOpen = true;
  }

  _closeDialog() {
    this._dialogOpen = false;
  }

  async _createAgent() {
    if (!this._formName.trim()) return;
    const store = getSharedStore();
    const id = this._formName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const payload: any = { id };
    if (this._formModel.trim()) payload.model = this._formModel.trim();
    if (this._formWorkspace.trim()) payload.workspace = this._formWorkspace.trim();
    try {
      await store.request('agents.create', payload);
      this._dialogOpen = false;
      await this._loadAgents();
    } catch (e: any) {
      alert('创建失败: ' + (e?.message || e));
    }
  }

  async _openDetail(agent: any) {
    this._detailAgent = { ...agent };
    this._detailView = true;
    this._detailTab = 'overview';
    await this._loadFiles(agent.id);
  }

  _closeDetail() {
    this._detailView = false;
    this._detailAgent = null;
  }

  async _loadFiles(agentId: string) {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const res = await store.request<any>('agents.files.list', { agentId });
      this._files = res?.files || [];
      this._filesWorkspace = res?.workspace || '';
    } catch {
      this._files = [];
    }
  }

  async _openFileEdit(fileName: string) {
    this._editingFile = fileName;
    this._fileContent = '';
    this._fileEditOpen = true;
    const store = getSharedStore();
    const agentId = this._detailAgent?.id;
    try {
      const res = await store.request<any>('agents.files.get', { agentId, name: fileName });
      this._fileContent = res?.file?.content || '';
    } catch (e: any) {
      this._fileContent = '// 读取失败: ' + (e?.message || e);
    }
  }

  _closeFileEdit() {
    this._fileEditOpen = false;
    this._editingFile = '';
    this._fileContent = '';
  }

  async _saveFileContent() {
    const store = getSharedStore();
    const agentId = this._detailAgent?.id;
    this._saving = true;
    try {
      await store.request('agents.files.set', { agentId, name: this._editingFile, content: this._fileContent });
      this._fileEditOpen = false;
      await this._loadFiles(agentId);
    } catch (e: any) {
      alert('保存失败: ' + (e?.message || e));
    } finally {
      this._saving = false;
    }
  }

  _renderFileEditDialog() {
    return html`
      <oc-dialog .open=${this._fileEditOpen} @close=${this._closeFileEdit}>
        <span slot="title">${L('agents.editFile', { file: this._editingFile })}</span>
        <div style="margin:0 10px;">
          <textarea class="detail-textarea" style="min-height:400px;width:100%;"
            .value=${this._fileContent}
            @input=${(e: Event) => { this._fileContent = (e.target as HTMLTextAreaElement).value; }}
          ></textarea>
        </div>
        <div slot="footer">
          <button style="padding:6px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);transition:all var(--duration-fast);"
                  @click=${this._closeFileEdit}>${L('common.cancel')}</button>
          <button style="padding:6px 16px;border-radius:var(--radius-sm);font-size:13px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--accent-foreground);transition:background var(--duration-fast);"
                  @click=${this._saveFileContent}>${L('agents.saveConfig')}</button>
        </div>
      </oc-dialog>
    `;
  }

  _renderNewAgentDialog() {
    return html`
      <oc-dialog .open=${this._dialogOpen} @close=${this._closeDialog}>
        <span slot="title">${L('common.newAgent')}</span>
        <div class="channel-dialog">
          <div class="form-group">
            <label class="form-label">${L('agents.agentName')} <span class="required">*</span></label>
            <input class="form-input" type="text" .value=${this._formName}
              placeholder=${L('agents.namePlaceholder')}
              @input=${(e: Event) => { this._formName = (e.target as HTMLInputElement).value; }}
            />
          </div>
          <div class="form-group">
            <label class="form-label">${L('agents.model')}</label>
            <input class="form-input" type="text" .value=${this._formModel}
              placeholder=${L('agents.modelPlaceholder')}
              @input=${(e: Event) => { this._formModel = (e.target as HTMLInputElement).value; }}
            />
          </div>
          <div class="form-group">
            <label class="form-label">${L('agents.workspacePath')}</label>
            <input class="form-input" type="text" .value=${this._formWorkspace}
              placeholder=${L('agents.workspacePlaceholder')}
              @input=${(e: Event) => { this._formWorkspace = (e.target as HTMLInputElement).value; }}
            />
          </div>
        </div>
        <div slot="footer">
          <button class="btn-cancel" @click=${this._closeDialog}>${L('common.cancel')}</button>
          <button class="btn-confirm" @click=${this._createAgent}>${L('agents.create')}</button>
        </div>
      </oc-dialog>
    `;
  }

  _renderDetailView() {
    const agent = this._detailAgent;
    if (!agent) return '';

    return html`
      <div class="agent-detail">
        <!-- Back button -->
        <div class="agent-detail__back" @click=${this._closeDetail}>
          ${L('agents.backToList')}
        </div>

        <!-- Title -->
        <div class="agent-detail__title">
          <span class="agent-detail__name">${agent.id}</span>
          ${agent.id === this._defaultId ? html`<span class="agent-card__badge">${L('agents.defaultAgent')}</span>` : ''}
        </div>

        <!-- Tabs -->
        <div class="detail-tabs">
          ${['overview', 'files', 'channels', 'tools', 'skills'].map(tab => html`
            <div class="detail-tab ${this._detailTab === tab ? 'active' : ''}"
                 @click=${() => { this._detailTab = tab; }}>
              ${{ overview: L('agents.overview'), files: L('agents.files'), channels: L('agents.channels'), tools: L('agents.tools'), skills: L('agents.skills') }[tab]}
            </div>
          `)}
        </div>

        <!-- Tab content -->
        ${this._detailTab === 'overview' ? this._renderOverviewTab(agent) : ''}
        ${this._detailTab === 'files' ? this._renderFilesTab() : ''}
        ${this._detailTab === 'channels' ? this._renderChannelsTab() : ''}
        ${this._detailTab === 'tools' ? this._renderToolsTab() : ''}
        ${this._detailTab === 'skills' ? this._renderSkillsTab() : ''}

        <!-- File Edit Dialog -->
        ${this._renderFileEditDialog()}
      </div>
    `;
  }

  _renderOverviewTab(agent: any) {
    return html`
      <div style="max-width:640px;">
        <!-- Basic info -->
        <div class="detail-section">
          <div class="detail-section__title">${L('agents.basicInfo')}</div>
          <div class="detail-form-grid">
            <div class="detail-field">
              <label class="detail-field__label">${L('agents.agentId')}</label>
              <input class="detail-field__input" type="text" .value=${agent.id} disabled />
            </div>
            <div class="detail-field">
              <label class="detail-field__label">${L('agents.workspace')}</label>
              <input class="detail-field__input mono" type="text" .value=${agent.workspace || ''} disabled />
            </div>
          </div>
        </div>

        <!-- Model config -->
        <div class="detail-section">
          <div class="detail-section__title">${L('agents.modelConfig')}</div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${L('agents.mainModel')}</label>
            <input class="detail-field__input mono" type="text" .value=${this._agentModel(agent)} disabled />
          </div>
          <div class="detail-field">
            <label class="detail-field__label">${L('agents.reasoningLevel')}</label>
            <input class="detail-field__input" type="text" .value=${agent.thinkingDefault || L('agents.notSet')} disabled />
          </div>
        </div>
      </div>
    `;
  }

  _renderFilesTab() {
    return html`
      <div style="max-width:600px;">
        <div style="font-size:14px;font-weight:600;color:var(--text-strong);margin-bottom:4px;">${L('agents.bootstrapFiles')}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:16px;">${this._filesWorkspace || L('agents.bootstrapDesc')}</div>
        <div class="file-list">
          ${this._files.length
            ? this._files.map((f: any) => html`
              <div class="file-item">
                <div class="file-item__left">
                  <div class="file-item__name">
                    ${f.name}
                    ${!f.missing ? html`<span class="file-item__badge">${L('agents.created')}</span>` : ''}
                  </div>
                  <div class="file-item__meta">${L('agents.size')}: ${fmtSize(f.size)} · ${L('agents.updateTime')}: ${fmtTime(f.updatedAtMs)}</div>
                </div>
                ${!f.missing
                  ? html`<button class="file-item__edit" @click=${(e: Event) => { e.stopPropagation(); this._openFileEdit(f.name); }}>${L('agents.edit')}</button>`
                  : html`<span style="font-size:11px;color:var(--muted);">${L('agents.notSet')}</span>`}
              </div>
            `)
            : html`<div style="font-size:12px;color:var(--muted);padding:8px 0;">…</div>`}
        </div>
      </div>
    `;
  }

  _renderChannelsTab() {
    const bound = this._connectedChannelIds();
    return html`
      <div style="max-width:600px;">
        <div style="font-size:14px;font-weight:600;color:var(--text-strong);margin-bottom:4px;">${L('agents.channelBinding')}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:16px;">${L('agents.channelBindingDesc')}</div>
        ${bound.length
          ? html`
            <div class="file-list">
              ${bound.map((cid: string) => {
                const st = this._channels[cid] || {};
                const running = !!st.running;
                return html`
                  <div class="file-item">
                    <div class="file-item__left">
                      <div class="file-item__name">
                        <span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:${running ? 'var(--success)' : 'var(--muted)'};"></span>
                        ${cid}
                      </div>
                      <div class="file-item__meta">${running ? L('dashboard.running') : L('dashboard.stopped')}${st.configured ? ' · ' + L('models.configured') : ''}</div>
                    </div>
                  </div>
                `;
              })}
            </div>
          `
          : html`
            <div class="channel-empty">${L('agents.noChannel')}</div>
            <div style="text-align:center;">
              <button class="channel-empty__btn" @click=${() => this.onNavigate('channels')}>${L('agents.goToChannels')}</button>
            </div>
          `}
      </div>
    `;
  }

  _renderToolsTab() {
    return html`
      <div style="max-width:640px;">
        <div class="detail-section">
          <div class="detail-section__title">${L('agents.toolPermissions')}</div>
          <div class="detail-section__desc">${L('agents.toolPermDesc')}</div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${L('agents.toolTemplate')}</label>
            <select class="detail-field__input">
              <option>${L('agents.notSet')}</option>
              <option>${L('agents.fullAllow')}</option>
              <option>${L('agents.safeOnly')}</option>
              <option>${L('agents.disableAll')}</option>
            </select>
          </div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${L('agents.explicitAllow')}</label>
            <textarea class="detail-textarea" placeholder="read_file, write_file, exec">read_file, write_file, exec</textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${L('agents.explicitAllowHint')}</div>
          </div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${L('agents.appendAllow')}</label>
            <textarea class="detail-textarea" placeholder="grep_search, apply_patch">grep_search, apply_patch</textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${L('agents.appendAllowHint')}</div>
          </div>
          <div class="detail-field">
            <label class="detail-field__label">${L('agents.explicitDeny')}</label>
            <textarea class="detail-textarea" placeholder="delete_file">delete_file</textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${L('agents.explicitDenyHint')}</div>
          </div>
        </div>
        <div class="detail-save">
          <button>${L('agents.saveToolConfig')}</button>
        </div>
      </div>
    `;
  }

  _renderSkillsTab() {
    return html`
      <div style="max-width:720px;">
        <div class="detail-section">
          <div class="detail-section__title">${L('agents.skillsWhitelist')}</div>
          <div class="detail-section__desc">${L('agents.skillsWhitelistDesc')} · ${this._skills.length} ${L('agents.skills')}</div>
          <div class="skills-grid">
            ${this._skills.map((s: any) => html`
              <div class="skill-checkbox-item">
                <input type="checkbox" ?checked=${!s.disabled} />
                <div class="skill-checkbox-item__content">
                  <div class="skill-checkbox-item__name">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                    ${s.name}
                  </div>
                  <div class="skill-checkbox-item__desc">${s.description || ''}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    // Show detail view if active
    if (this._detailView) {
      return html`
        <div class="agents-page">
          ${this._renderDetailView()}
        </div>
      `;
    }

    return html`
      <page-header title=${this.title} subtitle=${L('agents.pageSubtitle')}>
        <button class="btn-new" @click=${this._openNewAgent}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          ${L('common.newAgent')}
        </button>
      </page-header>
      <div class="agents-hint">${L('agents.clickHint')}</div>
      <div class="agents-page">

        <!-- Agent cards -->
        ${this._agents.length === 0
          ? html`<div class="channel-empty">${this._connected ? '—' : 'Gateway ' + L('dashboard.stopped')}</div>`
          : this._agents.map(agent => {
            const bound = this._connectedChannelIds();
            return html`
          <div class="agent-card" @click=${() => this._openDetail(agent)}>
            <div class="agent-card__header">
              <div class="agent-card__left">
                <span class="agent-card__name">${agent.id}</span>
                ${agent.id === this._defaultId ? html`<span class="agent-card__badge">${L('agents.default')}</span>` : ''}
              </div>
              <div class="agent-card__actions">
                <button class="btn-detail" @click=${(e: Event) => { e.stopPropagation(); this._openDetail(agent); }}>${L('agents.detail')}</button>
              </div>
            </div>
            <div class="agent-card__fields">
              <div class="agent-card__field">
                <span class="agent-card__field-label">${L('agents.fieldLabelModel')}</span>
                <span class="agent-card__field-value">${this._agentModel(agent)}</span>
              </div>
              <div class="agent-card__field">
                <span class="agent-card__field-label">${L('agents.fieldLabelWorkspace')}</span>
                <span class="agent-card__field-value mono">${agent.workspace || L('agents.notSet')}</span>
              </div>
              <div class="agent-card__field">
                <span class="agent-card__field-label">${L('agents.fieldLabelChannels')}</span>
                <span class="agent-card__field-value">${bound.length ? bound.join('、') : L('agents.noChannelBound')}</span>
              </div>
            </div>
          </div>
        `;
          })}

        <!-- New Agent Dialog -->
        ${this._renderNewAgentDialog()}

      </div>
    `;
  }
}

customElements.define('agents-page', AgentsPage);
