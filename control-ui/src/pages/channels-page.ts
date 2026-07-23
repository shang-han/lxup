import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { property, state } from 'lit/decorators.js';
import { L } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import { getSharedStore } from '../store/shared.js';
import type { GatewayStore } from '../store/gateway-store.js';
import '../components/page-header.js';
import '../components/oc-dialog.js';

const CHANNELS = [
  { id: 'qq', name: L('channels.qqBot'), desc: L('channels.qqDesc'), icon: 'chat-bubble' },
  { id: 'dingtalk', name: L('channels.dingtalk'), desc: L('channels.dingtalkDesc'), icon: 'hash' },
  { id: 'feishu', name: L('channels.feishu'), desc: L('channels.feishuDesc'), icon: 'hash' },
  { id: 'telegram', name: L('channels.telegram'), desc: L('channels.telegramDesc'), icon: 'send' },
  { id: 'discord', name: L('channels.discord'), desc: L('channels.discordDesc'), icon: 'hash' },
  { id: 'slack', name: L('channels.slack'), desc: L('channels.slackDesc'), icon: 'hash' },
  { id: 'wechat', name: L('channels.wechatIntegration'), desc: L('channels.wechatDesc'), icon: 'message-circle', supported: true },
  { id: 'teams', name: L('channels.teams'), desc: L('channels.teamsDesc'), icon: 'users' },
  { id: 'signal', name: L('channels.signal'), desc: L('channels.signalDesc'), icon: 'shield' },
  { id: 'matrix', name: L('channels.matrix'), desc: L('channels.matrixDesc'), icon: 'globe' },
];

export class ChannelsPage extends LitElement {
  static styles = css`
    :host { display: block; }

    .channels-page { width: 100%; }

    /* === tabs === */
    .channels-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }
    .channels-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .channels-tab:hover { color: var(--text); }
    .channels-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* === section === */
    .channels-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      box-shadow: var(--shadow-card);
    }
    .channels-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }

    /* === channel grid === */
    .channel-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
    }
    @media (max-width: 1200px) { .channel-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .channel-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .channel-grid { grid-template-columns: 1fr; } }
    .channel-card {
      display: flex; flex-direction: column; align-items: center; text-align: center;
      padding: 18px 14px; border: 1px solid var(--border); border-radius: var(--radius-md);
      cursor: pointer; transition: all var(--duration-fast); background: transparent;
    }
    .channel-card:hover { border-color: var(--text-muted); background: var(--bg-hover); }
    .channel-card__icon {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px; color: var(--text-soft);
    }
    .channel-card__icon svg { width: 24px; height: 24px; stroke: currentColor; fill: none; stroke-width: 1.5; }
    .channel-card__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .channel-card__desc {
      font-size: 11px; color: var(--text-soft); line-height: 1.4;
    }
    .channel-card__badge {
      margin-top: 6px;
      font-size: 10px; padding: 2px 6px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }

    /* === dialog styles === */
    .channel-dialog .form-group { margin-bottom: 14px; }
    .channel-dialog .form-label {
      display: block; font-size: 12px; font-weight: 500; color: var(--text);
      margin-bottom: 4px;
    }
    .channel-dialog .form-label .required { color: var(--danger); }
    .channel-dialog .form-input {
      width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .channel-dialog .form-input:focus { border-color: var(--accent); }
    .channel-dialog .form-hint {
      font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4;
    }
    .channel-dialog .form-row {
      display: flex; gap: 8px; align-items: center;
    }
    .channel-dialog .form-row .form-input { flex: 1; }
    .channel-dialog .form-row button {
      padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap; flex-shrink: 0;
    }
    .channel-dialog .form-row button:hover { background: var(--bg-hover); color: var(--text); }

    .channel-dialog select.form-input { cursor: pointer; }

    /* === collapsible steps === */
    .channel-dialog .steps-toggle {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px; background: var(--bg-muted); border-radius: var(--radius-sm);
      font-size: 12px; font-weight: 500; color: var(--text-soft); cursor: pointer;
      margin-bottom: 14px; user-select: none;
    }
    .channel-dialog .steps-toggle .chevron { transition: transform var(--duration-fast); }
    .channel-dialog .steps-toggle.open .chevron { transform: rotate(90deg); }
    .channel-dialog .steps-body {
      padding: 0 0 14px; font-size: 12px; color: var(--text-soft); line-height: 1.6;
    }
    .channel-dialog .steps-body ol {
      padding-left: 20px; margin: 0;
    }
    .channel-dialog .steps-body li { margin-bottom: 2px; }
    .channel-dialog .steps-body .note {
      margin-top: 8px; padding: 6px 10px; background: var(--bg-muted);
      border-radius: var(--radius-sm); font-size: 11px; color: var(--muted);
    }

    /* === info box === */
    .channel-dialog .info-box {
      padding: 10px 14px; background: var(--bg-muted); border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .channel-dialog .info-box__title {
      font-size: 12px; font-weight: 600; color: var(--success); margin-bottom: 2px;
    }
    .channel-dialog .info-box__desc {
      font-size: 11px; color: var(--muted); line-height: 1.4;
    }

    /* === command box === */
    .channel-dialog .command-box {
      padding: 10px 14px; background: var(--bg-muted); border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .channel-dialog .command-box__title {
      font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;
    }
    .channel-dialog .command-box__desc {
      font-size: 11px; color: var(--text-soft); margin-bottom: 8px;
    }
    .channel-dialog .command-box__code {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 8px 12px; font-family: var(--font-mono); font-size: 11px; line-height: 1.5;
      color: var(--text); display: flex; justify-content: space-between; align-items: center;
      gap: 8px;
    }
    .channel-dialog .command-box__code button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); flex-shrink: 0;
    }
    .channel-dialog .command-box__code button:hover { background: var(--bg-hover); color: var(--text); }

    /* === diagnostic button === */
    .channel-dialog .btn-diag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      margin-bottom: 10px;
    }
    .channel-dialog .btn-diag:hover { background: var(--bg-hover); color: var(--text); }

    /* === dialog footer buttons === */
    .channel-dialog .dialog__footer button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .channel-dialog .btn-cancel {
      background: transparent; color: var(--text-soft);
    }
    .channel-dialog .btn-cancel:hover { background: var(--bg-hover); color: var(--text); }
    .channel-dialog .btn-verify {
      background: var(--bg-hover); color: var(--text-soft);
    }
    .channel-dialog .btn-verify:hover { background: var(--bg-active); color: var(--text); }
    .channel-dialog .btn-confirm {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .channel-dialog .btn-confirm:hover { background: var(--accent-hover); }

    /* === scan login button === */
    .channel-dialog .btn-scan {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast);
    }
    .channel-dialog .btn-scan:hover { background: var(--accent-hover); }

    /* === operation box === */
    .channel-dialog .operation-box {
      padding: 10px 14px; background: var(--bg-muted); border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .channel-dialog .operation-box__title {
      font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 8px;
    }
    .channel-dialog .operation-box__desc {
      font-size: 11px; color: var(--muted); line-height: 1.4; margin-top: 6px;
    }

    /* === weixin scan QR === */
    .channel-dialog .wx-qr-area {
      display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 6px 0;
    }
    .channel-dialog .wx-qr-img {
      width: 200px; height: 200px; border-radius: 8px; background: #fff; padding: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    .channel-dialog .wx-qr-placeholder {
      width: 200px; height: 200px; border-radius: 8px; background: var(--bg-hover);
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); font-size: 24px;
    }
    .channel-dialog .wx-qr-status {
      font-size: 12px; color: var(--text-soft); text-align: center; line-height: 1.5;
    }
    .channel-dialog .wx-qr-status.success { color: var(--success); font-weight: 600; }
    .channel-dialog .wx-qr-status.error { color: var(--danger); }
    .channel-dialog .wx-qr-link {
      font-size: 11px; color: var(--accent); word-break: break-all; text-align: center;
    }
    .channel-dialog .btn-cancel-scan {
      padding: 5px 16px; border-radius: var(--radius-sm); font-size: 12px;
      border: 1px solid var(--border); background: transparent; color: var(--text-soft);
      cursor: pointer; transition: all var(--duration-fast);
    }
    .channel-dialog .btn-cancel-scan:hover { background: var(--bg-hover); color: var(--text); }

    /* === channel↔agent binding === */
    .bind-select {
      padding: 7px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      outline: none; cursor: pointer; min-width: 180px;
    }
    .bind-select:focus { border-color: var(--accent); }
    .bind-add-btn {
      padding: 7px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast);
    }
    .bind-add-btn:hover { background: var(--accent-hover); }
    .bind-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .bind-list { display: flex; flex-direction: column; gap: 8px; }
    .bind-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .bind-row__channel {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      font-family: var(--font-mono); min-width: 130px;
    }
    .bind-row__account {
      font-size: 12px; color: var(--text-soft); font-family: var(--font-mono);
      min-width: 150px; display: flex; align-items: center; gap: 6px;
      word-break: break-all;
    }
    .bind-running { color: var(--success); font-size: 9px; }
    .bind-row__arrow { color: var(--muted); font-size: 14px; }
    .bind-row__agent {
      font-size: 13px; color: var(--text); font-family: var(--font-mono);
      display: flex; align-items: center; gap: 8px; flex: 1;
    }
    .bind-tag {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-full); font-weight: 600;
    }
    .bind-tag.explicit { background: var(--accent-subtle); color: var(--accent); }
    .bind-tag.default { background: var(--bg-hover); color: var(--muted); }
    .bind-remove {
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      border: none; border-radius: var(--radius-sm); background: transparent;
      color: var(--muted); cursor: pointer; font-size: 12px;
      transition: all var(--duration-fast); flex-shrink: 0;
    }
    .bind-remove:hover { background: var(--danger-subtle); color: var(--danger); }
    .bind-remove:disabled { opacity: 0.4; cursor: not-allowed; }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';

  @state() _activeTab = 'channels'; // 'channels' | 'agents'
  @state() _dialogChannel = ''; // '' = closed, otherwise channel id

  // QQ form state
  @state() _qqAppId = '';
  @state() _qqClientSecret = '';
  @state() _qqShowSecret = false;
  @state() _qqAccountId = '';
  @state() _qqAgent = 'main';

  // WeChat form state
  @state() _wechatStepsOpen = true;
  @state() _wechatInstalled = true;
  @state() _wechatVersion = '2.1.3';
  @state() _wechatCopied = false;
  _wechatCopyTimer: ReturnType<typeof setTimeout> | null = null;

  _wechatLoginCmd = 'openclaw channels login --channel openclaw-weixin';

  // 微信扫码登录（连 Python sidecar :7889 的登录桥接）
  @state() _wxStatus = 'idle'; // idle|starting|qr_ready|waiting_scan|success|error
  @state() _wxQr = '';
  @state() _wxMsg = '';
  @state() _wxUrl = '';
  _wxWs: WebSocket | null = null;

  // ── 渠道↔实例 绑定（config.bindings，支持账号级）──
  @state() _bindAgents: any[] = [];
  @state() _bindDefaultId = '';
  @state() _bindings: any[] = [];
  @state() _bindChannels: string[] = [];
  @state() _bindAccounts: Record<string, Array<{ accountId: string; running: boolean }>> = {};
  @state() _bindConnected = false;
  // 新增绑定表单
  @state() _newBindChannel = '';
  @state() _newBindAccount = '';   // '' = 整个渠道（全部账号）
  @state() _newBindAgent = '';
  @state() _bindSaving = false;
  _storeUnsub: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    const store = getSharedStore();
    this._storeUnsub = store.subscribe((snap) => {
      const was = this._bindConnected;
      this._bindConnected = snap.connected;
      if (snap.connected && !was) this._loadBindingData();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._storeUnsub?.();
    this._stopWeixinLogin();
    if (this._wechatCopyTimer) clearTimeout(this._wechatCopyTimer);
  }

  async _loadBindingData() {
    const store = getSharedStore();
    if (!store.connected) return;
    try {
      const [agentsRes, cfgRes, chRes] = await Promise.all([
        store.request<any>('agents.list', {}),
        store.request<any>('config.get', {}),
        store.request<any>('channels.status', {}),
      ]);
      this._bindAgents = agentsRes?.agents || [];
      this._bindDefaultId = agentsRes?.defaultId || '';
      const cfg = cfgRes?.config || cfgRes?.parsed || {};
      this._bindings = Array.isArray(cfg.bindings) ? cfg.bindings : [];
      const chMap = chRes?.channels || {};
      const accMap = chRes?.channelAccounts || {};
      // 只列出已配置的渠道
      this._bindChannels = Object.keys(chMap).filter((k) => chMap[k] && (chMap[k].configured || chMap[k].running));
      // 每个渠道下的账号列表
      const accounts: Record<string, Array<{ accountId: string; running: boolean }>> = {};
      for (const [ch, list] of Object.entries(accMap)) {
        if (Array.isArray(list)) {
          accounts[ch] = (list as any[]).map((a) => ({ accountId: a.accountId, running: !!a.running }));
        }
      }
      this._bindAccounts = accounts;
      if (!this._newBindAgent) this._newBindAgent = this._bindDefaultId;
    } catch { /* 忽略瞬时错误 */ }
  }

  /** 解析「渠道+账号」最终绑定的实例：显式账号绑定 > 渠道级绑定 > 默认实例 */
  _resolveBoundAgent(channel: string, accountId?: string): { agentId: string; level: 'account' | 'channel' | 'default' } {
    if (accountId) {
      const accBind = this._bindings.find((x: any) => x && x.type !== 'acp' && x.match && x.match.channel === channel && x.match.accountId === accountId);
      if (accBind) return { agentId: accBind.agentId || this._bindDefaultId, level: 'account' };
    }
    const chBind = this._bindings.find((x: any) => x && x.type !== 'acp' && x.match && x.match.channel === channel && !x.match.accountId);
    if (chBind) return { agentId: chBind.agentId || this._bindDefaultId, level: 'channel' };
    return { agentId: this._bindDefaultId, level: 'default' };
  }

  /** 展开成「渠道/账号」行，供绑定列表渲染 */
  _bindingRows(): Array<{ channel: string; accountId: string; running: boolean }> {
    const rows: Array<{ channel: string; accountId: string; running: boolean }> = [];
    for (const ch of this._bindChannels) {
      const accs = this._bindAccounts[ch] || [];
      if (accs.length === 0) {
        rows.push({ channel: ch, accountId: '', running: false });
      } else {
        for (const a of accs) rows.push({ channel: ch, accountId: a.accountId, running: a.running });
      }
    }
    return rows;
  }

  /** 读取最新 bindings + hash，应用 transform，用 config.patch 写回（带 replacePaths，乐观并发） */
  async _mutateBindings(transform: (current: any[]) => any[]) {
    const store = getSharedStore();
    const g = await store.request<any>('config.get', {});
    const hash = g?.hash || '';
    const cfg = g?.config || {};
    const current = Array.isArray(cfg.bindings) ? cfg.bindings : [];
    const next = transform(current);
    await store.request('config.patch', {
      raw: JSON.stringify({ bindings: next }),
      baseHash: hash,
      replacePaths: ['bindings'],
    });
    this._bindings = next;
  }

  async _addBinding() {
    const channel = this._newBindChannel;
    const agentId = this._newBindAgent;
    const accountId = this._newBindAccount; // '' = 整个渠道
    if (!channel || !agentId) return;
    this._bindSaving = true;
    try {
      await this._mutateBindings((current) => {
        // 去掉同 channel + 同 accountId 的旧 route 绑定（'' 表示渠道级），再追加新的
        const next = current.filter((x: any) => {
          if (!x || x.type === 'acp' || !x.match || x.match.channel !== channel) return true;
          return (x.match.accountId || '') !== accountId;
        });
        const match: any = { channel };
        if (accountId) match.accountId = accountId;
        next.push({ type: 'route', agentId, match });
        return next;
      });
      this._newBindChannel = '';
      this._newBindAccount = '';
    } catch (e: any) {
      alert('绑定失败: ' + (e?.message || e));
    } finally {
      this._bindSaving = false;
    }
  }

  /** 移除实际生效的那条绑定（账号级传 accountId，渠道级传 ''） */
  async _removeBinding(channel: string, accountId: string) {
    this._bindSaving = true;
    try {
      await this._mutateBindings((current) => current.filter((x: any) => {
        if (!x || x.type === 'acp' || !x.match || x.match.channel !== channel) return true;
        return (x.match.accountId || '') !== accountId;
      }));
    } catch (e: any) {
      alert('解绑失败: ' + (e?.message || e));
    } finally {
      this._bindSaving = false;
    }
  }

  _startWeixinLogin() {
    this._stopWeixinLogin();
    this._wxStatus = 'starting';
    this._wxMsg = '正在启动微信登录…';
    this._wxQr = '';
    this._wxUrl = '';
    const host = window.location.hostname || '127.0.0.1';
    let ws: WebSocket;
    try {
      ws = new WebSocket(`ws://${host}:7889/ws/weixin-login`);
    } catch {
      this._wxStatus = 'error';
      this._wxMsg = '无法连接登录服务';
      return;
    }
    this._wxWs = ws;
    ws.addEventListener('open', () => ws.send(JSON.stringify({ action: 'start' })));
    ws.addEventListener('message', (e) => {
      try {
        const snap = JSON.parse(String(e.data));
        if (snap.status) this._wxStatus = snap.status;
        if (snap.message) this._wxMsg = snap.message;
        if (snap.qrDataUrl) this._wxQr = snap.qrDataUrl;
        if (snap.url) this._wxUrl = snap.url;
        if (snap.status === 'success') this._wxMsg = '登录成功！凭证已保存，重启 OpenClaw 网关后微信渠道即上线。';
      } catch { /* ignore */ }
    });
    ws.addEventListener('error', () => {
      this._wxStatus = 'error';
      this._wxMsg = '无法连接登录服务（请确认 Python gateway 已在 :7889 启动）';
    });
    ws.addEventListener('close', () => { this._wxWs = null; });
  }

  _stopWeixinLogin() {
    if (this._wxWs) {
      try { this._wxWs.send(JSON.stringify({ action: 'stop' })); } catch { /* ignore */ }
      try { this._wxWs.close(); } catch { /* ignore */ }
      this._wxWs = null;
    }
    if (this._wxStatus !== 'success') {
      this._wxStatus = 'idle';
      this._wxMsg = '';
      this._wxQr = '';
      this._wxUrl = '';
    }
  }

  async _copyWechatCmd() {
    try {
      await navigator.clipboard.writeText(this._wechatLoginCmd);
    } catch {
      // 剪贴板不可用时降级：选中提示
    }
    this._wechatCopied = true;
    if (this._wechatCopyTimer) clearTimeout(this._wechatCopyTimer);
    this._wechatCopyTimer = setTimeout(() => { this._wechatCopied = false; }, 2500);
  }

  _openDialog(channelId: string) {
    this._dialogChannel = channelId;
  }

  _closeDialog() {
    if (this._dialogChannel === 'wechat') this._stopWeixinLogin();
    this._dialogChannel = '';
  }

  _renderChannelCard(ch: any) {
    return html`
      <div class="channel-card" @click=${() => this._openDialog(ch.id)}>
        <div class="channel-card__icon">${this._getChannelIcon(ch.icon)}</div>
        <div class="channel-card__name">${ch.name}</div>
        <div class="channel-card__desc">${ch.desc}</div>
        ${ch.supported ? html`<span class="channel-card__badge">${L('channels.supported')}</span>` : ''}
      </div>
    `;
  }

  _getChannelIcon(iconName: string) {
    const iconMap: Record<string, any> = {
      'chat-bubble': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'hash': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
      'send': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg>`,
      'message-circle': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
      'users': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'shield': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,
      'globe': html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    };
    return iconMap[iconName] || iconMap['chat-bubble'];
  }

  _renderQQDialog() {
    return html`
      <oc-dialog .open=${this._dialogChannel === 'qq'} @close=${this._closeDialog}>
        <span slot="title">${L('channels.connecting')} ${L('channels.qqBot')}</span>
        <div class="channel-dialog">
          <!-- Steps toggle -->
          <div class="steps-toggle" @click=${() => {}}>
            <span class="chevron">${icons['chevron-right']}</span>
            ${L('channels.steps')}
          </div>

          <!-- AppID -->
          <div class="form-group">
            <label class="form-label">${L('channels.appId')} <span class="required">*</span></label>
            <input class="form-input" type="text" .value=${this._qqAppId}
              placeholder=${L('channels.appId')}
              @input=${(e: Event) => { this._qqAppId = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <!-- ClientSecret -->
          <div class="form-group">
            <label class="form-label">${L('channels.clientSecret')} <span class="required">*</span></label>
            <div class="form-row">
              <input class="form-input" .type=${this._qqShowSecret ? 'text' : 'password'} .value=${this._qqClientSecret}
                placeholder=${L('channels.clientSecret')}
                @input=${(e: Event) => { this._qqClientSecret = (e.target as HTMLInputElement).value; }}
              />
              <button @click=${() => { this._qqShowSecret = !this._qqShowSecret; }}>${L('channels.show')}</button>
            </div>
          </div>

          <!-- Account ID -->
          <div class="form-group">
            <label class="form-label">${L('channels.accountId')}</label>
            <input class="form-input" type="text" .value=${this._qqAccountId}
              placeholder=${L('channels.accountIdPlaceholder')}
              @input=${(e: Event) => { this._qqAccountId = (e.target as HTMLInputElement).value; }}
            />
            <div class="form-hint">${L('channels.accountIdHint')}</div>
          </div>

          <!-- Bind Agent -->
          <div class="form-group">
            <label class="form-label">${L('channels.bindAgent')}</label>
            <select class="form-input" .value=${this._qqAgent}
              @change=${(e: Event) => { this._qqAgent = (e.target as HTMLSelectElement).value; }}
            >
              <option value="main">main</option>
              <option value="ops">ops</option>
            </select>
            <div class="form-hint">${L('channels.bindAgentHint')}</div>
          </div>

          <!-- Manual command -->
          <div class="command-box">
            <div class="command-box__title">${L('channels.manualCmd')}</div>
            <div class="command-box__desc">${L('channels.manualCmdDesc')}</div>
            <div class="command-box__code">
              <code>openclaw plugins install @tencent-connect/openclaw-qqbot@latest</code>
              <button @click=${() => {}}>${L('channels.copy')}</button>
            </div>
            <div class="form-hint" style="margin-top:6px;">${L('channels.installHint')}</div>
          </div>

          <!-- Diagnostics -->
          <button class="btn-diag">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            ${L('channels.diagnostics')}
          </button>
          <div class="form-hint">
            ${unsafeHTML(L('channels.diagHint'))}
          </div>
        </div>
        <div slot="footer">
          <button class="btn-cancel" @click=${this._closeDialog}>${L('channels.cancel')}</button>
          <button class="btn-verify">${L('channels.verify')}</button>
          <button class="btn-confirm">${L('channels.connectAndSave')}</button>
        </div>
      </oc-dialog>
    `;
  }

  _renderWeChatDialog() {
    return html`
      <oc-dialog .open=${this._dialogChannel === 'wechat'} @close=${this._closeDialog}>
        <span slot="title">${L('channels.wechatIntegration')}</span>
        <div class="channel-dialog">
          <!-- Steps -->
          <div class="steps-toggle ${this._wechatStepsOpen ? 'open' : ''}"
               @click=${() => { this._wechatStepsOpen = !this._wechatStepsOpen; }}>
            <span class="chevron">${icons['chevron-right']}</span>
            ${L('channels.wechatSteps')}
          </div>
          ${this._wechatStepsOpen ? html`
            <div class="steps-body">
              <ol>
                <li>${unsafeHTML(L('channels.wechatStep1'))}</li>
                <li>${L('channels.wechatStep2')}</li>
                <li>${L('channels.wechatStep3')}</li>
                <li>${L('channels.wechatStep4')}</li>
                <li>${L('channels.wechatStep5')}</li>
              </ol>
              <div class="note">
                ${L('channels.wechatNote')}
              </div>
            </div>
          ` : ''}

          <!-- Install status -->
          ${this._wechatInstalled ? html`
            <div class="info-box">
              <div class="info-box__title">${L('channels.wechatInstalled')} ${L('channels.wechatVersion')} ${this._wechatVersion}</div>
              <div class="info-box__desc">${L('channels.wechatLatest')}</div>
            </div>
          ` : ''}

          <!-- Manual command -->
          <div class="command-box">
            <div class="command-box__title">${L('channels.wechatLoginCmd')}</div>
            <div class="command-box__desc">${L('channels.wechatLoginCmdDesc')}</div>
            <div class="command-box__code">
              <code>${this._wechatLoginCmd}</code>
              <button @click=${this._copyWechatCmd}>${this._wechatCopied ? L('channels.wechatCopied') : L('channels.copy')}</button>
            </div>
            <div class="form-hint" style="margin-top:6px;">${L('channels.wechatLoginCmdDesc')}</div>
          </div>

          <!-- Operation: 扫码登录 -->
          <div class="operation-box">
            <div class="operation-box__title">${L('channels.operation')}</div>
            ${this._wxStatus === 'idle' ? html`
              <button class="btn-scan" @click=${this._startWeixinLogin}>${L('channels.wechatScanLogin')}</button>
              <div class="operation-box__desc">${L('channels.wechatScanDesc')}</div>
            ` : html`
              <div class="wx-qr-area">
                ${this._wxQr
                  ? html`<img class="wx-qr-img" src=${this._wxQr} alt="WeChat login QR" />`
                  : html`<div class="wx-qr-placeholder">${this._wxStatus === 'starting' ? '…' : ''}</div>`}
                <div class="wx-qr-status ${this._wxStatus}">${this._wxMsg}</div>
                ${this._wxUrl && this._wxStatus !== 'success' ? html`
                  <a class="wx-qr-link" href=${this._wxUrl} target="_blank" rel="noopener">二维码无法显示？在手机打开此链接</a>
                ` : ''}
                ${this._wxStatus !== 'success' ? html`
                  <button class="btn-cancel-scan" @click=${this._stopWeixinLogin}>${L('channels.cancel')}</button>
                ` : ''}
              </div>
            `}
          </div>
        </div>
        <div slot="footer">
          <button class="btn-cancel" @click=${this._closeDialog}>${L('channels.cancel')}</button>
          <button class="btn-cancel" @click=${this._closeDialog}>${L('channels.close')}</button>
        </div>
      </oc-dialog>
    `;
  }

  _renderGenericDialog(channelId: string) {
    const ch = CHANNELS.find(c => c.id === channelId);
    if (!ch) return '';
    return html`
      <oc-dialog .open=${this._dialogChannel === channelId} @close=${this._closeDialog}>
        <span slot="title">${L('channels.connecting')} ${ch.name}</span>
        <div class="channel-dialog">
          <div style="font-size:13px;color:var(--text-soft);padding:20px 0;text-align:center;">
            ${L('channels.genericComingSoon', { name: ch.name })}
          </div>
        </div>
        <div slot="footer">
          <button class="btn-cancel" @click=${this._closeDialog}>${L('channels.close')}</button>
        </div>
      </oc-dialog>
    `;
  }

  render() {
    return html`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="channels-page">

        <!-- Tabs -->
        <div class="channels-tabs">
          <div class="channels-tab ${this._activeTab === 'channels' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'channels'; }}>
            ${L('channels.channelList')}
          </div>
          <div class="channels-tab ${this._activeTab === 'agents' ? 'active' : ''}"
               @click=${() => { this._activeTab = 'agents'; }}>
            ${L('channels.agentBinding')}
          </div>
        </div>

        <!-- Channels grid -->
        ${this._activeTab === 'channels' ? html`
          <div class="channels-section">
            <div class="channels-section__title">${L('channels.availablePlatforms')}</div>
            <div class="channel-grid">
              ${CHANNELS.map(ch => this._renderChannelCard(ch))}
            </div>
          </div>
        ` : html`
          <!-- Agent binding（真实 config.bindings）-->
          <div style="margin-bottom:12px;">
            <div style="font-size:12px;color:var(--muted);line-height:1.6;">
              ${L('channels.agentBindDesc')}
            </div>
          </div>

          <!-- 新增绑定（渠道 + 账号 + 实例）-->
          <div class="channels-section" style="margin-bottom:12px;">
            <div class="channels-section__title">${L('channels.addChannelBind')}</div>
            <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${L('channels.bindChannelCol')}</label>
                <select class="bind-select" .value=${this._newBindChannel}
                  @change=${(e: Event) => { this._newBindChannel = (e.target as HTMLSelectElement).value; this._newBindAccount = ''; }}>
                  <option value="">—</option>
                  ${this._bindChannels.map(c => html`<option value=${c}>${c}</option>`)}
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${L('channels.bindAccountLabel')}</label>
                <select class="bind-select" .value=${this._newBindAccount} ?disabled=${!this._newBindChannel}
                  @change=${(e: Event) => { this._newBindAccount = (e.target as HTMLSelectElement).value; }}>
                  <option value="">${L('channels.bindAllAccounts')}</option>
                  ${(this._bindAccounts[this._newBindChannel] || []).map(a => html`<option value=${a.accountId}>${a.accountId}${a.running ? ' ●' : ''}</option>`)}
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${L('channels.bindAgentCol')}</label>
                <select class="bind-select" .value=${this._newBindAgent}
                  @change=${(e: Event) => { this._newBindAgent = (e.target as HTMLSelectElement).value; }}>
                  ${this._bindAgents.map((a: any) => html`<option value=${a.id}>${a.id}${a.id === this._bindDefaultId ? ' (' + L('agents.default') + ')' : ''}</option>`)}
                </select>
              </div>
              <button class="bind-add-btn" ?disabled=${this._bindSaving || !this._newBindChannel}
                @click=${this._addBinding}>${L('channels.addChannelBind')}</button>
            </div>
          </div>

          <!-- 当前绑定关系（按 渠道/账号 → 实例）-->
          <div class="channels-section">
            <div class="channels-section__title">${L('channels.agentBinding')}</div>
            ${this._bindChannels.length === 0
              ? html`<div style="font-size:12px;color:var(--muted);padding:8px 0;">${L('channels.noChannelBound')}</div>`
              : html`
                <div class="bind-list">
                  ${this._bindingRows().map(row => {
                    const resolved = this._resolveBoundAgent(row.channel, row.accountId || undefined);
                    const removable = resolved.level !== 'default';
                    const removeAcc = resolved.level === 'account' ? row.accountId : '';
                    const levelLabel = resolved.level === 'account'
                      ? L('channels.bindLevelAccount')
                      : resolved.level === 'channel'
                        ? L('channels.bindLevelChannel')
                        : L('agents.default');
                    return html`
                      <div class="bind-row">
                        <div class="bind-row__channel">${row.channel}</div>
                        <div class="bind-row__account">
                          ${row.accountId ? row.accountId : L('channels.bindAllAccounts')}
                          ${row.running ? html`<span class="bind-running" title="running">●</span>` : ''}
                        </div>
                        <div class="bind-row__arrow">→</div>
                        <div class="bind-row__agent">
                          ${resolved.agentId}
                          <span class="bind-tag ${resolved.level === 'default' ? 'default' : 'explicit'}">${levelLabel}</span>
                        </div>
                        ${removable
                          ? html`<button class="bind-remove" ?disabled=${this._bindSaving} @click=${() => this._removeBinding(row.channel, removeAcc)}>✕</button>`
                          : html`<span style="width:24px;"></span>`}
                      </div>
                    `;
                  })}
                </div>
              `}
          </div>
        `}

        <!-- Dialogs -->
        ${this._renderQQDialog()}
        ${this._renderWeChatDialog()}
        ${this._dialogChannel && this._dialogChannel !== 'qq' && this._dialogChannel !== 'wechat'
          ? this._renderGenericDialog(this._dialogChannel)
          : ''}

      </div>
    `;
  }
}

customElements.define('channels-page', ChannelsPage);
