import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { L, sidecarHeaders } from '../i18n/index.js';
import { icons } from '../components/icons.js';
import '../components/oc-markdown.js';
import { getSharedStore } from '../store/shared.js';
import * as codex from '../services/codex-client.js';
import { listModels, getActiveModel, setSelectedModel, gatewayModelsFromConfig, type ResolvedModel } from '../utils/model-config.js';
import {
  createChatEngine,
  type ChatEngine,
  type ChatSession,
  type ChatStreamEvent,
  type Cancellable,
  type EngineId,
  type ToolEvent,
} from '../services/chat-engine.js';

/** 时间戳 → 相对时间（刚刚 / N 分钟前 / N 小时前 / 日期） */
function formatRelTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return L('chat.justNow');
  if (min < 60) return L('chat.minutesAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return L('chat.hoursAgo', { n: hr });
  const day = Math.floor(hr / 24);
  if (day === 1) return L('chat.yesterday');
  if (day < 7) return L('chat.daysAgo', { n: day });
  return new Date(ts).toLocaleDateString();
}

type ViewMessage = { role: 'user' | 'assistant'; text: string; tools?: ToolEvent[]; images?: string[]; ts?: number };

export class ChatPage extends LitElement {
  static styles = css`
    :host { display: flex; flex-direction: column; height: 100%; }

    /* === layout === */
    .chat-layout { display: flex; flex: 1; overflow: hidden; }
    .chat-layout.with-list .chat-main { margin-left: 280px; }

    /* === left panel === */
    .session-list {
      width: 280px; flex-shrink: 0; border-right: 1px solid var(--border);
      display: flex; flex-direction: column; background: var(--bg-elevated);
      position: fixed; left: var(--shell-nav-width, 240px); top: 0; bottom: 0; z-index: 25;
      transform: translateX(-100%); transition: transform var(--duration-normal) var(--ease-out);
    }
    .chat-layout.with-list .session-list { transform: translateX(0); }
    .session-list__header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid var(--border);
    }
    .session-list__title { font-size: 14px; font-weight: 600; color: var(--text-strong); }
    .session-list__actions { display: flex; gap: 4px; }
    .session-list__actions button {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: background var(--duration-fast);
    }
    .session-list__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .session-list__body { flex: 1; overflow-y: auto; padding: 8px; }
    .session-item {
      display: flex; align-items: center; gap: 10px; padding: 8px 12px;
      border-radius: var(--radius-sm); cursor: pointer; transition: background var(--duration-fast);
      font-size: 13px; color: var(--text-soft);
    }
    .session-item:hover { background: var(--bg-hover); color: var(--text); }
    .session-item.active { background: var(--accent-subtle); color: var(--text-strong); }
    .session-item__dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .session-item__dot.active { background: var(--success); }
    .session-item__dot.idle { background: var(--muted); }
    .session-item__name {
      flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      font-family: var(--font-mono); font-size: 12px;
    }
    .session-item__time { flex-shrink: 0; font-size: 10px; color: var(--muted); }
    .session-item__del {
      flex-shrink: 0; width: 26px; height: 26px;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer; opacity: 0;
      transition: opacity var(--duration-fast), color var(--duration-fast);
    }
    .session-item__del svg { width: 18px; height: 18px; }
    .session-item:hover .session-item__del { opacity: 1; }
    .session-item__del:hover { color: var(--danger); background: var(--danger-subtle); }
    .session-item__confirm { flex-shrink: 0; display: inline-flex; gap: 4px; }
    .session-item__confirm button {
      padding: 1px 8px; font-size: 10px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); cursor: pointer;
    }
    .session-item__confirm .yes { background: var(--danger); color: #fff; border-color: var(--danger); }
    .session-item__confirm .no { background: transparent; color: var(--text-soft); }

    /* === chat main === */
    .chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

    /* === chat header === */
    .chat-header {
      display: flex; align-items: center; justify-content: space-between;
      height: 48px; padding: 0 16px; border-bottom: 1px solid var(--border);
      background: var(--bg-elevated); flex-shrink: 0;
    }
    .chat-header__left { display: flex; align-items: center; gap: 10px; }
    .chat-header__left .icon-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .chat-header__left .icon-btn:hover { background: var(--bg-hover); color: var(--text); }
    .chat-header__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 6px;
    }
    .chat-header__title .status-dot {
      width: 8px; height: 8px; border-radius: 50%; background: var(--success);
    }
    .chat-header__title .status-dot.offline { background: var(--muted); }
    .chat-header__right { display: flex; align-items: center; gap: 6px; }
    .chat-header__right select,
    .chat-header__right .ws-btn {
      height: 30px; padding: 0 10px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text-soft); font-size: 12px;
      outline: none; cursor: pointer;
    }
    .chat-header__right select:hover,
    .chat-header__right .ws-btn:hover { border-color: var(--text-muted); color: var(--text); }
    .chat-header__right .ws-btn {
      display: flex; align-items: center; gap: 4px;
      background: var(--bg-hover);
    }
    .chat-header__right .ws-btn.spinning svg { animation: chat-spin 0.8s linear infinite; }
    .chat-header__right .ws-btn:disabled { opacity: 0.6; cursor: wait; }
    @keyframes chat-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .workspace-pill {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: var(--radius-full);
      background: var(--bg-hover); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-soft);
    }
    .workspace-pill .ws-label { font-size: 11px; }
    .workspace-pill .ws-name { font-weight: 600; font-size: 12px; color: var(--accent); }
    .workspace-pill { cursor: pointer; }
    .workspace-pill:hover { border-color: var(--text-muted); }

    /* === 工作区面板 === */
    .ws-panel {
      position: fixed; top: 64px; right: 16px; z-index: 80;
      width: min(880px, calc(100vw - 32px)); height: min(660px, calc(100vh - 90px));
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: 0 12px 40px rgba(0,0,0,0.25); display: flex; flex-direction: column;
    }
    .ws-panel__header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; }
    .ws-panel__title { font-size: 14px; font-weight: 700; color: var(--text-strong); }
    .ws-panel__badge { font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full); background: var(--accent-subtle); color: var(--accent); font-weight: 600; }
    .ws-panel__actions { margin-left: auto; display: flex; gap: 6px; }
    .ws-panel__actions button {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer;
    }
    .ws-panel__sub { padding: 0 16px 10px; font-size: 11px; color: var(--muted); border-bottom: 1px solid var(--border); }
    .ws-panel__body { flex: 1; display: flex; min-height: 0; }
    .ws-panel__left { width: 300px; flex-shrink: 0; border-right: 1px solid var(--border); display: flex; flex-direction: column; min-height: 0; }
    .ws-panel__section-label { font-size: 11px; font-weight: 600; color: var(--text-soft); padding: 10px 12px 6px; }
    .ws-panel__core { padding: 0 10px 10px; overflow-y: auto; flex: 1; }
    .ws-core-item {
      border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 8px 10px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;
    }
    .ws-core-item.active { border-color: var(--accent); background: var(--accent-subtle); }
    .ws-core-item__name { flex: 1; font-size: 12px; font-weight: 600; color: var(--text); }
    .ws-core-item button {
      background: none; border: none; color: var(--accent); font-size: 11px; cursor: pointer; padding: 0;
    }
    .ws-panel__browse { border-top: 1px solid var(--border); max-height: 42%; overflow-y: auto; padding-bottom: 8px; }
    .ws-tree__row {
      display: flex; align-items: center; gap: 4px; padding: 4px 8px;
      font-size: 12px; color: var(--text-soft); cursor: pointer; border-radius: var(--radius-sm);
    }
    .ws-tree__row:hover { background: var(--bg-hover); color: var(--text); }
    .ws-tree__row.active { background: var(--accent-subtle); color: var(--accent); }
    .ws-tree__caret { width: 12px; font-size: 10px; color: var(--muted); flex-shrink: 0; }
    .ws-tree__icon { font-size: 12px; }
    .ws-panel__right { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .ws-panel__toolbar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
    .ws-panel__toolbar .spacer { flex: 1; }
    .ws-panel__toolbar button {
      padding: 4px 12px; font-size: 12px; border-radius: var(--radius-sm);
      border: 1px solid var(--border); background: transparent; color: var(--text-soft); cursor: pointer;
    }
    .ws-panel__toolbar button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .ws-panel__toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    .ws-panel__toolbar button.mode-active { border-color: var(--accent); color: var(--accent); }
    .ws-panel__msg { padding: 6px 14px 0; font-size: 11px; color: var(--warn); }
    .ws-panel__content { flex: 1; margin: 12px 14px; min-height: 0; }
    .ws-panel__content textarea {
      width: 100%; height: 100%; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-md); color: var(--text); font-family: var(--font-mono);
      font-size: 12px; line-height: 1.6; padding: 10px; resize: none; outline: none;
    }
    .ws-panel__content pre {
      width: 100%; height: 100%; overflow: auto; margin: 0;
      background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md);
      font-family: var(--font-mono); font-size: 12px; line-height: 1.6; padding: 10px; color: var(--text-soft);
    }
    .ws-panel__empty {
      margin: 12px 14px; padding: 18px; border: 1px dashed var(--border); border-radius: var(--radius-md);
      font-size: 12px; color: var(--muted); text-align: center;
    }

    /* === 快捷键面板 === */
    .sc-backdrop { position: fixed; inset: 0; z-index: 85; }
    .sc-panel {
      position: fixed; top: 64px; right: 16px; z-index: 90;
      width: min(380px, calc(100vw - 32px)); max-height: min(520px, calc(100vh - 90px));
      overflow-y: auto; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: 0 12px 40px rgba(0,0,0,0.25);
      padding: 4px 0 8px;
    }
    .sc-group { padding: 10px 14px 4px; font-size: 11px; font-weight: 600; color: var(--text-soft); }
    .sc-row { display: flex; align-items: baseline; gap: 12px; padding: 6px 14px; cursor: pointer; }
    .sc-row:hover { background: var(--bg-hover); }
    .sc-row__cmd { font-family: var(--font-mono); font-size: 12px; color: var(--accent); min-width: 96px; flex-shrink: 0; }
    .sc-row__desc { font-size: 12px; color: var(--text-soft); }

    /* === banner === */
    .chat-banner {
      display: flex; align-items: flex-start; gap: 10px;
      margin: 16px 16px 0; padding: 12px 16px;
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,0.2);
      border-radius: var(--radius-md); color: var(--text); font-size: 13px;
    }
    .chat-banner.info {
      background: var(--accent-subtle); border-color: rgba(233,69,96,0.2);
    }
    .chat-banner__icon { flex-shrink: 0; color: var(--danger); margin-top: 1px; }
    .chat-banner.info .chat-banner__icon { color: var(--accent); }
    .chat-banner__content { flex: 1; min-width: 0; }
    .chat-banner__title { font-weight: 600; color: var(--text-strong); margin-bottom: 2px; }
    .chat-banner__desc { color: var(--text-soft); line-height: 1.5; }
    .chat-banner__desc strong { color: var(--text-strong); }
    .chat-banner__close {
      flex-shrink: 0; background: transparent; border: none;
      color: var(--muted); cursor: pointer; padding: 2px; border-radius: var(--radius-sm);
    }
    .chat-banner__close:hover { background: var(--bg-hover); color: var(--text); }

    /* === messages area === */
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; }
    .message { display: flex; gap: 10px; margin-bottom: 16px; max-width: 80%; }
    .message.user { margin-left: auto; flex-direction: row-reverse; }
    .message__avatar {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 14px; font-weight: 600;
    }
    .message.assistant .message__avatar {
      background: var(--accent-subtle); color: var(--accent);
    }
    .message.user .message__avatar {
      background: var(--bg-hover); color: var(--text-soft);
    }
    .message__time { font-size: 10px; color: var(--muted); margin-bottom: 3px; }
    .message.user .message__time { color: var(--accent-foreground); opacity: 0.72; }
    .message__body {
      padding: 10px 14px; border-radius: var(--radius-md);
      font-size: 14px; line-height: 1.6; min-width: 0;
    }
    .message.assistant .message__body {
      background: var(--card); border: 1px solid var(--border);
    }
    .message.user .message__body {
      background: var(--accent); color: var(--accent-foreground);
    }
    .msg-text { white-space: pre-wrap; word-break: break-word; }
    .msg-images { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .msg-images img {
      width: 72px; height: 72px; object-fit: cover; display: block;
      border-radius: var(--radius-sm); border: 1px solid var(--border);
    }
    .chat-pending-imgs { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 8px; }
    .chat-pending-imgs .pi { position: relative; }
    .chat-pending-imgs .pi img {
      width: 56px; height: 56px; object-fit: cover; display: block;
      border-radius: var(--radius-sm); border: 1px solid var(--border);
    }
    .chat-pending-imgs .pi button {
      position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
      border-radius: 50%; border: none; background: var(--danger); color: #fff;
      cursor: pointer; font-size: 11px; line-height: 1;
    }
    .msg-md { min-width: 0; }

    /* === tool cards (命令/工具执行，内联) === */
    .msg-tools { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .tool-card {
      background: var(--bg-hover); border: 1px solid var(--border);
      border-left: 3px solid var(--accent); border-radius: var(--radius-sm);
      padding: 8px 10px; font-family: var(--font-mono); font-size: 12px; text-align: left;
    }
    .tool-card.run { border-left-color: var(--warn); }
    .tool-card.ok { border-left-color: var(--success); }
    .tool-card.err { border-left-color: var(--danger); }
    .tool-card__head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
    .tool-card__name { color: var(--accent); font-weight: 600; }
    .tool-card__cmd { background: var(--bg); color: var(--text); padding: 2px 7px; border-radius: 4px; word-break: break-all; font-size: 11.5px; }
    .tool-card__out { margin: 7px 0 0; white-space: pre-wrap; word-break: break-word; color: var(--text-soft); font-size: 11px; line-height: 1.5; max-height: 190px; overflow-y: auto; }
    .tool-card.run .tool-card__out { color: var(--warn); }
    .tool-card.err .tool-card__out { color: var(--danger); }

    /* === gateway idle state === */
    .gw-idle {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 12px; color: var(--muted);
    }
    .gw-idle .gw-icon { color: var(--border-strong); margin-bottom: 8px; }
    .gw-idle .gw-title { font-size: 15px; font-weight: 600; color: var(--text-strong); }
    .gw-idle .gw-sub { font-size: 13px; }
    .gw-idle .gw-actions { display: flex; gap: 8px; margin-top: 4px; }
    .gw-idle .gw-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: none; cursor: pointer; transition: background var(--duration-fast);
    }
    .gw-idle .gw-btn.primary { background: var(--accent); color: var(--accent-foreground); }
    .gw-idle .gw-btn.primary:hover { background: var(--accent-hover); }
    .gw-idle .gw-btn.secondary { background: var(--bg-hover); color: var(--text-soft); border: 1px solid var(--border); }
    .gw-idle .gw-btn.secondary:hover { background: var(--bg-active); color: var(--text); }
    .gw-idle .gw-hint { font-size: 12px; color: var(--muted); max-width: 360px; text-align: center; line-height: 1.5; margin-top: 8px; }

    /* === input bar === */
    .chat-input-bar {
      display: flex; align-items: flex-end; gap: 8px;
      padding: 12px 16px; border-top: 1px solid var(--border);
      background: var(--bg-elevated); flex-shrink: 0;
    }
    .chat-input-bar__tools {
      display: flex; align-items: center; gap: 2px; flex-shrink: 0;
    }
    .chat-input-bar__tools button {
      width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: 1px solid transparent; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .chat-input-bar__tools button:hover { background: var(--bg-hover); color: var(--text); border-color: var(--border); }
    .chat-input-bar__tools button.active { background: var(--accent-subtle); color: var(--accent); border-color: var(--accent); }
    .chat-input-bar__input {
      flex: 1; display: flex; align-items: center;
      background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 0 12px; min-height: 38px; transition: border-color var(--duration-fast);
    }
    .chat-input-bar__input:focus-within { border-color: var(--accent); }
    .chat-input-bar__input textarea {
      flex: 1; background: transparent; border: none; color: var(--text);
      font-size: 14px; resize: none; outline: none; padding: 8px 0;
      min-height: 22px; max-height: 120px; line-height: 1.4;
    }
    .chat-input-bar__input textarea::placeholder { color: var(--muted); }
    .chat-input-bar__send {
      width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
      background: var(--accent); border: none; border-radius: var(--radius-md);
      color: var(--accent-foreground); cursor: pointer; flex-shrink: 0;
      transition: background var(--duration-fast);
    }
    .chat-input-bar__send:hover { background: var(--accent-hover); }
    .chat-input-bar__send:disabled { opacity: 0.4; cursor: not-allowed; }

    /* === 斜杠命令联想 === */
    .sc-autocomplete {
      margin: 0 16px 6px;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
      box-shadow: var(--shadow-card);
      overflow-y: auto;
      max-height: 240px;
    }
    .sc-ac-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 12px;
      cursor: pointer;
      font-size: 13px;
    }
    .sc-ac-item.sel { background: var(--accent-subtle); }
    .sc-ac-cmd {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--accent);
      min-width: 96px;
      flex-shrink: 0;
    }
    .sc-ac-desc { color: var(--text-soft); flex: 1; }
    .sc-ac-group {
      font-size: 10px;
      color: var(--muted);
      background: var(--bg-muted);
      border-radius: var(--radius-full);
      padding: 1px 8px;
      flex-shrink: 0;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) subtitle = '';
  @property({ type: Boolean }) connected = false;
  /** 当前引擎（由 app.ts 传入）：决定实时聊天连哪个引擎自己的网关 */
  @property({ type: String }) engine: EngineId = 'openclaw';
  /** 页面跳转（由 app.ts 传入），供「网关设置」等入口使用 */
  @property({ type: Function }) onNavigate = (_p: string) => {};

  @state() _input = '';
  @state() _messages: ViewMessage[] = [];
  @state() _pendingImages: Array<{ name: string; mime: string; dataUrl: string }> = [];
  @state() _imgGenMode = false;
  @state() _showSessionList = false;
  @state() _showBanner = true;
  @state() _sessionKey = '';
  @state() _sessions: ChatSession[] = [];
  @state() _loadingHistory = false;
  @state() _engineReady = false;
  @state() _refreshing = false;
  @state() _wsName = '';
  @state() _wsPath = '';
  // 工作区面板
  @state() _wsPanelOpen = false;
  @state() _wsCore: Array<{ name: string; exists: boolean }> = [];
  @state() _wsTree: Record<string, Array<{ name: string; type: string }>> = {};
  @state() _wsOpenDirs: Record<string, boolean> = { '': true };
  @state() _wsSel = '';
  @state() _wsContent = '';
  @state() _wsEditing = false;
  @state() _wsBusy = false;
  @state() _wsMsg = '';
  @state() _wsDirty = false;
  _wsMsgTimer: number | null = null;
  @state() _scOpen = false;
  _pollTimer: number | null = null;
  @state() _streaming = false;
  @state() _models: ResolvedModel[] = [];
  @state() _activeModel: ResolvedModel | null = null;
  @state() _modelWarning = '';

  _engineAdapter!: ChatEngine;
  _readyUnsub: (() => void) | null = null;
  _sessUnsub: (() => void) | null = null;
  _chatCancel: Cancellable | null = null;
  _historyLoaded = false;
  _inited = false;

  connectedCallback() {
    super.connectedCallback();
    this._refreshModels();
    this._setupEngine();
    this._inited = true;
    // 驻留期间主动轮询：Hermes/Codex 无长连接需主动探健康；
    // 模型列表定期重拉，配置页改完无需手动刷新即可同步
    this._pollTimer = window.setInterval(() => {
      if (this.engine !== 'openclaw') void this._engineAdapter?.refresh();
      this._refreshModels();
    }, 5000);
    // 技能页「试一下」预填：读取后立即清除（约定键，见 skills-v2-page CHAT_PREFILL_KEY）
    const prefill = sessionStorage.getItem('lxup.chat.prefill');
    if (prefill) {
      this._input = prefill;
      sessionStorage.removeItem('lxup.chat.prefill');
    }
  }

  updated(changed: Map<string, unknown>) {
    // 引擎切换 → 换用对应引擎的网关 + 重拉该引擎的模型列表 + 重置工作区面板（数据源不同）
    if (this._inited && changed.has('engine')) {
      this._setupEngine();
      this._refreshModels();
      this._wsPanelOpen = false;
      this._wsSel = '';
      this._wsContent = '';
      this._wsTree = {};
      this._wsCore = [];
      this._wsName = '';
      this._wsPath = '';
      void this._loadWorkspace();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._pollTimer !== null) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
    document.removeEventListener('keydown', this._wsOnKey);
    document.removeEventListener('keydown', this._scOnKey);
    if (this._wsMsgTimer) { window.clearTimeout(this._wsMsgTimer); this._wsMsgTimer = null; }
    this._teardownEngine();
  }

  // ── 引擎适配 ──

  _setupEngine() {
    const id: EngineId = this.engine === 'hermes' || this.engine === 'codex' ? this.engine : 'openclaw';
    if (this._engineAdapter && this._engineAdapter.id === id) return;
    this._teardownEngine();

    this._engineAdapter = createChatEngine(id, { store: getSharedStore() });
    this._messages = [];
    this._sessions = [];
    this._sessionKey = '';
    this._historyLoaded = false;
    this._streaming = false;
    this._engineReady = false;

    this._readyUnsub = this._engineAdapter.onReadyChange((ready) => {
      this._engineReady = ready;
      if (ready) {
        this._refreshModels(); // 网关就绪后合并网关配置里的模型
        void this._loadWorkspace();
        if (!this._historyLoaded) {
          this._historyLoaded = true;
          void this._bootstrapSessions();
        }
      }
    });
    if (this._engineAdapter.onSessionsChange) {
      this._sessUnsub = this._engineAdapter.onSessionsChange(() => void this._loadSessions());
    }
    void this._engineAdapter.refresh();
  }

  _teardownEngine() {
    this._readyUnsub?.();
    this._readyUnsub = null;
    this._sessUnsub?.();
    this._sessUnsub = null;
    this._chatCancel?.abort();
    this._chatCancel = null;
  }

  async _bootstrapSessions() {
    await this._loadSessions();
    // 刷新后恢复上次打开的会话(该会话仍在列表中才恢复)
    const saved = this._readSavedSessionKey();
    if (saved && this._sessions.some(s => s.id === saved)) {
      this._sessionKey = saved;
    }
    if (!this._sessionKey) {
      const dflt = this._engineAdapter.defaultSessionId();
      if (dflt) {
        this._setSessionKey(dflt);
      } else if (this._sessions.length) {
        this._setSessionKey(this._sessions[0].id);
      } else {
        try {
          const s = await this._engineAdapter.createSession();
          if (s) {
            this._setSessionKey(s.id);
            this._sessions = [s, ...this._sessions];
          }
        } catch { /* ignore */ }
      }
    }
    await this._loadHistory();
  }

  async _loadSessions() {
    try {
      this._sessions = await this._engineAdapter.listSessions();
    } catch { /* 引擎未就绪时忽略 */ }
  }

  async _loadHistory() {
    if (!this._sessionKey) return;
    this._loadingHistory = true;
    try {
      const msgs = await this._engineAdapter.getHistory(this._sessionKey);
      this._messages = msgs.map((m) => ({ role: m.role, text: m.text, ...(m.ts ? { ts: m.ts } : {}) }));
      this._scrollToBottom();
    } catch { /* ignore */ } finally {
      this._loadingHistory = false;
    }
  }

  async _ensureSession(): Promise<string> {
    if (this._sessionKey) return this._sessionKey;
    const dflt = this._engineAdapter.defaultSessionId();
    if (dflt) {
      this._setSessionKey(dflt);
      return dflt;
    }
    try {
      const s = await this._engineAdapter.createSession();
      if (s) {
        this._setSessionKey(s.id);
        this._sessions = [s, ...this._sessions];
      }
    } catch { /* ignore */ }
    return this._sessionKey;
  }

  get _sidecarBase(): string {
    const host = window.location.hostname || '127.0.0.1';
    return `http://${host}:7889`;
  }

  _refreshModels() {
    // Hermes / Codex：下拉展示各自已配置的模型（只读展示，配置在对应配置页修改）
    if (this.engine === 'hermes') {
      fetch(`${this._sidecarBase}/api/hermes/model`, { headers: sidecarHeaders() })
        .then(r => (r.ok ? r.json() : null))
        .then((c: any) => {
          const name = c?.name ? String(c.name) : '';
          this._models = name
            ? [{ providerId: 'hermes', providerName: 'Hermes', baseUrl: '', apiKey: '', apiType: 'openai', model: name, isPrimary: true }]
            : [];
          this._activeModel = this._models[0] || null;
        })
        .catch(() => { this._models = []; this._activeModel = null; });
      return;
    }
    if (this.engine === 'codex') {
      codex.getConfig()
        .then((cfg: any) => {
          const name = cfg?.model ? String(cfg.model) : '';
          this._models = name
            ? [{ providerId: 'codex', providerName: 'Codex', baseUrl: '', apiKey: '', apiType: 'openai', model: name, isPrimary: true }]
            : [];
          this._activeModel = this._models[0] || null;
        })
        .catch(() => { this._models = []; this._activeModel = null; });
      return;
    }
    this._models = listModels();
    this._activeModel = getActiveModel();
    // 合并网关配置里的模型（与模型页同源），避免「配置了模型、下拉却没有」
    const store = getSharedStore();
    if (this.engine === 'openclaw' && store.connected) {
      store.request<any>('config.get', {}).then((g) => {
        const gw = gatewayModelsFromConfig(g?.config || g?.parsed || g);
        if (!gw.length) return;
        const have = new Set(this._models.map(m => `${m.providerId}::${m.model}`));
        this._models = [...this._models, ...gw.filter(m => !have.has(`${m.providerId}::${m.model}`))];
        if (!this._activeModel) this._activeModel = this._models[0];
      }).catch(() => { /* 网关未连或无权限时维持本地列表 */ });
    }
  }

  _onSelectModel(e: Event) {
    const key = (e.target as HTMLSelectElement).value;
    const found = this._models.find(m => `${m.providerId}::${m.model}` === key);
    if (found) {
      setSelectedModel(found);
      this._activeModel = found;
    }
  }

  // ── 发送 / 流式事件 ──

  async _send() {
    const text = this._input.trim();
    const imgs = this._pendingImages;
    if ((!text && imgs.length === 0) || this._streaming) return;
    // 斜杠命令走 RPC 执行（webchat 下网关不解释斜杠文本）；按当前引擎清单匹配
    if (text.startsWith('/')) {
      const flat = this._scCommands().flatMap(g => g.items);
      const hit = flat.find(it => it.cmd === text || (it.needsArg && text.startsWith(`${it.cmd} `)));
      if (hit) {
        this._messages = [...this._messages, { role: 'user', text, ts: Date.now() }];
        this._input = '';
        this._scrollToBottom();
        void this._execSlash(text);
        return;
      }
    }
    if (!this._engineAdapter.ready()) {
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.engineOffline')}`, ts: Date.now() }];
      this._scrollToBottom();
      return;
    }

    // OpenClaw chat.send 支持 attachments（base64）；Hermes/Codex 仅文本
    const attachments = imgs.map(p => ({
      type: 'image' as const, mimeType: p.mime, fileName: p.name,
      content: p.dataUrl.split(',')[1] || '',
    }));
    const supportsImg = this.engine === 'openclaw';

    this._messages = [...this._messages, {
      role: 'user', text,
      images: imgs.length ? imgs.map(p => p.dataUrl) : undefined,
      ts: Date.now(),
    }];
    this._input = '';
    this._pendingImages = [];
    this._streaming = true;
    this._scrollToBottom();

    const sid = await this._ensureSession();
    if (!sid) {
      this._streaming = false;
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.engineOffline')}`, ts: Date.now() }];
      this._scrollToBottom();
      return;
    }
    this._chatCancel = this._engineAdapter.send(
      sid, text, (ev) => this._onEngineEvent(ev),
      supportsImg && attachments.length ? attachments : undefined);
    if (!supportsImg && attachments.length) {
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.imgUnsupported')}`, ts: Date.now() }];
      this._scrollToBottom();
    }
  }

  /** 附件按钮 → 选择本地图片（单张 ≤10MB） */
  _onPickImages(e: Event) {
    const input = e.target as HTMLInputElement;
    for (const f of Array.from(input.files || [])) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > 10 * 1024 * 1024) {
        this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.imgTooLarge', { name: f.name })}`, ts: Date.now() }];
        this._scrollToBottom();
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this._pendingImages = [...this._pendingImages, { name: f.name, mime: f.type, dataUrl: String(reader.result) }];
      };
      reader.readAsDataURL(f);
    }
    input.value = '';
  }

  _onEngineEvent(ev: ChatStreamEvent) {
    if (ev.type === 'delta') {
      const msgs = [...this._messages];
      const last = msgs[msgs.length - 1];
      if (ev.replace) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: ev.text };
        else msgs.push({ role: 'assistant', text: ev.text, ts: Date.now() });
      } else if (ev.text) {
        if (last && last.role === 'assistant') msgs[msgs.length - 1] = { ...last, text: last.text + ev.text };
        else msgs.push({ role: 'assistant', text: ev.text, ts: Date.now() });
      }
      this._messages = msgs;
      this._scrollToBottom();
    } else if (ev.type === 'tool') {
      const msgs = [...this._messages];
      let last = msgs[msgs.length - 1];
      if (!last || last.role !== 'assistant') {
        last = { role: 'assistant', text: '', tools: [] };
        msgs.push(last);
      }
      const tools = [...(last.tools || [])];
      const t = ev.tool;
      if (t.running) {
        tools.push({ name: t.name, args: t.args, running: true });
      } else {
        let matched = false;
        for (let i = tools.length - 1; i >= 0; i--) {
          if (tools[i].running && tools[i].name === t.name) {
            tools[i] = { ...tools[i], ok: t.ok, result: t.result, running: false };
            matched = true;
            break;
          }
        }
        if (!matched) tools.push({ name: t.name, ok: t.ok, result: t.result, running: false });
      }
      msgs[msgs.length - 1] = { ...last, tools };
      this._messages = msgs;
      this._scrollToBottom();
    } else if (ev.type === 'final') {
      this._streaming = false;
      this._chatCancel = null;
      void this._loadSessions();
    } else if (ev.type === 'error') {
      this._streaming = false;
      this._chatCancel = null;
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${ev.message}` }];
      this._scrollToBottom();
    }
  }

  _scrollToBottom() {
    requestAnimationFrame(() => {
      const el = this.renderRoot.querySelector('.chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  _onKeydown(e: KeyboardEvent) {
    if (this._scItems.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._scSel = (this._scSel + 1) % this._scItems.length;
        this._scrollScSel();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._scSel = (this._scSel - 1 + this._scItems.length) % this._scItems.length;
        this._scrollScSel();
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        this._completeSc(this._scItems[this._scSel] ?? this._scItems[0]);
        return;
      }
      if (e.key === 'Escape') {
        this._scItems = [];
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void this._send();
    }
  }

  _toggleSessionList() { this._showSessionList = !this._showSessionList; }

  /** 当前会话记忆(按引擎隔离):刷新后恢复上次打开的会话 */
  get _sessionStorageKey(): string { return `lxup.chat.session.${this.engine}`; }
  _readSavedSessionKey(): string {
    try { return localStorage.getItem(this._sessionStorageKey) || ''; } catch { return ''; }
  }
  _setSessionKey(key: string) {
    this._sessionKey = key;
    try { if (key) localStorage.setItem(this._sessionStorageKey, key); } catch { /* ignore */ }
  }

  @state() _confirmDeleteId: string | null = null;
  @state() _deleting = false;

  async _deleteSession(id: string) {
    if (this._deleting) return;
    this._deleting = true;
    const ok = await this._engineAdapter.deleteSession(id);
    this._deleting = false;
    this._confirmDeleteId = null;
    if (!ok) {
      this._messages = [...this._messages, { role: 'assistant', text: `⚠️ ${L('chat.deleteFailed')}` }];
      this._scrollToBottom();
      return;
    }
    const wasActive = this._sessionKey === id;
    if (wasActive) {
      this._chatCancel?.abort();
      this._chatCancel = null;
      this._streaming = false;
    }
    await this._loadSessions();
    if (wasActive) {
      const next = this._sessions.find(s => s.id !== id);
      const fallback = next?.id || this._engineAdapter.defaultSessionId();
      this._setSessionKey(fallback || '');
      this._messages = [];
      if (this._sessionKey) await this._loadHistory();
    }
  }

  _selectSession(id: string) {
    if (id === this._sessionKey) {
      this._showSessionList = false;
      return;
    }
    this._setSessionKey(id);
    this._showSessionList = false;
    this._streaming = false;
    this._chatCancel?.abort();
    this._chatCancel = null;
    void this._loadHistory();
  }

  async _newChat() {
    try {
      const s = await this._engineAdapter.createSession();
      if (s) {
        this._sessions = [s, ...this._sessions];
        this._setSessionKey(s.id);
      } else {
        this._setSessionKey(this._engineAdapter.defaultSessionId());
      }
    } catch { /* ignore */ }
    this._messages = [];
    this._showSessionList = false;
  }

  /** 工作区胶囊：读默认 Agent 与其 workspace 路径（真实数据） */
  async _loadWorkspace() {
    if (this.engine === 'hermes') {
      try {
        const r = await fetch(this._wsApi, { headers: sidecarHeaders() });
        if (r.ok) {
          const d = await r.json();
          this._wsName = d.agentId || 'hermes';
          this._wsPath = d.path || '';
        }
      } catch { /* sidecar 未连时保持现状 */ }
      return;
    }
    try {
      const res = await getSharedStore().request<any>('agents.list', {});
      const defId = res?.defaultId || '';
      const ag = (res?.agents || []).find((a: any) => a?.id === defId) || (res?.agents || [])[0];
      this._wsName = ag?.id || defId || '';
      this._wsPath = ag?.workspace || '';
    } catch { /* 网关未连时保持现状 */ }
  }

  // ── 工作区面板 ──────────────────────────────────────

  /** 工作区端点前缀：OpenClaw 挂 /api/gateway，Hermes 挂 /api/hermes（sidecar 同实现挂两处） */
  get _wsApi(): string {
    return this.engine === 'hermes'
      ? `${this._sidecarBase}/api/hermes/workspace`
      : `${this._sidecarBase}/api/gateway/workspace`;
  }

  /** 草稿持久化：dev 下 HMR 全量刷新或整页重启后不丢未保存内容 */
  static WS_DRAFT_KEY = 'lxup.ws.draft';

  _wsSaveDraft() {
    try {
      sessionStorage.setItem(ChatPage.WS_DRAFT_KEY, JSON.stringify({ path: this._wsSel, content: this._wsContent }));
    } catch { /* 存储满等场景静默降级 */ }
  }

  _wsClearDraft() {
    try { sessionStorage.removeItem(ChatPage.WS_DRAFT_KEY); } catch {}
  }

  _wsRestoreDraft(): boolean {
    try {
      const raw = sessionStorage.getItem(ChatPage.WS_DRAFT_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d?.path) return false;
      this._wsSel = String(d.path);
      this._wsContent = String(d.content ?? '');
      this._wsEditing = true;
      this._wsDirty = true;
      this._wsFlash(L('chat.wsDraftRestored'), 4000);
      return true;
    } catch { return false; }
  }

  async _toggleWsPanel() {
    if (this._wsPanelOpen) {
      this._closeWsPanel();
      return;
    }
    this._wsPanelOpen = true;
    document.addEventListener('keydown', this._wsOnKey);
    await this._loadWsInfo();
    void this._loadWsDir('');
    this._wsRestoreDraft();
  }

  /** Esc 关闭面板 */
  _wsOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._closeWsPanel();
  };

  _closeWsPanel() {
    if (this._wsEditing && this._wsDirty) {
      if (!window.confirm(L('chat.wsUnsaved'))) return;
      this._wsClearDraft();
    }
    this._wsPanelOpen = false;
    document.removeEventListener('keydown', this._wsOnKey);
  }

  _wsFlash(msg: string, ms = 2500) {
    this._wsMsg = msg;
    if (this._wsMsgTimer) window.clearTimeout(this._wsMsgTimer);
    this._wsMsgTimer = window.setTimeout(() => { this._wsMsg = ''; this._wsMsgTimer = null; }, ms);
  }

  async _loadWsInfo() {
    try {
      const r = await fetch(this._wsApi, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      this._wsName = d.agentId || 'main';
      this._wsPath = d.path || '';
      this._wsCore = d.coreFiles || [];
    } catch (e) {
      this._wsMsg = e instanceof Error ? e.message : String(e);
    }
  }

  async _loadWsDir(dir: string) {
    try {
      const r = await fetch(`${this._wsApi}/list?dir=${encodeURIComponent(dir)}`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      this._wsTree = { ...this._wsTree, [dir]: d.entries || [] };
    } catch (e) {
      this._wsMsg = e instanceof Error ? e.message : String(e);
    }
  }

  _wsToggleDir(dir: string) {
    const open = !this._wsOpenDirs[dir];
    this._wsOpenDirs = { ...this._wsOpenDirs, [dir]: open };
    if (open && !this._wsTree[dir]) void this._loadWsDir(dir);
  }

  async _wsOpenFile(path: string) {
    if (path === this._wsSel) { // 点当前文件：仅切回预览/保持
      return;
    }
    if (this._wsEditing && this._wsDirty) {
      if (!window.confirm(L('chat.wsUnsaved'))) return;
      this._wsClearDraft();
    }
    this._wsBusy = true;
    this._wsMsg = '';
    try {
      const r = await fetch(`${this._wsApi}/file?path=${encodeURIComponent(path)}`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      const d = await r.json();
      this._wsSel = path;
      this._wsContent = d.content || '';
      this._wsEditing = false;
      this._wsDirty = false;
    } catch (e) {
      this._wsMsg = e instanceof Error ? e.message : String(e);
    }
    this._wsBusy = false;
  }

  /** 核心文件不存在时「添加」：建空文件并打开编辑 */
  async _wsAddCore(name: string) {
    if (this._wsBusy) return;
    this._wsBusy = true;
    try {
      const r = await fetch(`${this._wsApi}/file`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ path: name, content: '' }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      await this._loadWsInfo();
      this._wsSel = name;
      this._wsContent = '';
      this._wsEditing = true;
      this._wsDirty = false;
    } catch (e) {
      this._wsMsg = e instanceof Error ? e.message : String(e);
    }
    this._wsBusy = false;
  }

  async _wsSave() {
    if (!this._wsSel || this._wsBusy) return;
    this._wsBusy = true;
    this._wsMsg = '';
    try {
      const r = await fetch(`${this._wsApi}/file`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ path: this._wsSel, content: this._wsContent }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.detail || `HTTP ${r.status}`);
      this._wsEditing = false;
      this._wsDirty = false;
      this._wsClearDraft();
      this._wsFlash(L('common.configSaved'));
    } catch (e) {
      this._wsMsg = e instanceof Error ? e.message : String(e);
    }
    this._wsBusy = false;
  }

  _wsRenderTree(dir: string, depth: number): any {
    const entries = this._wsTree[dir] || [];
    return entries.map(e => {
      const path = dir ? `${dir}/${e.name}` : e.name;
      if (e.type === 'dir') {
        const open = !!this._wsOpenDirs[path];
        return html`
          <div class="ws-tree__row" style="padding-left:${8 + depth * 14}px;" @click=${() => this._wsToggleDir(path)}>
            <span class="ws-tree__caret">${open ? '▾' : '▸'}</span>
            <span class="ws-tree__icon">📁</span> ${e.name}
          </div>
          ${open ? this._wsRenderTree(path, depth + 1) : ''}
        `;
      }
      return html`
        <div class="ws-tree__row ${this._wsSel === path ? 'active' : ''}" style="padding-left:${8 + depth * 14}px;"
          @click=${() => this._wsOpenFile(path)}>
          <span class="ws-tree__caret"></span>
          <span class="ws-tree__icon">📄</span> ${e.name}
        </div>
      `;
    });
  }

  // ── 快捷键（斜杠命令）面板 ──────────────────────────

  /** 命令清单：按引擎能力分组。OpenClaw 全量（对齐原生 UI）；Hermes/Codex 仅各自能真实执行的子集 */
  _scCommands(): Array<{ group: string; items: Array<{ cmd: string; desc: string; needsArg?: boolean }> }> {
    if (this.engine === 'hermes') return [
      { group: L('chat.scSession'), items: [
        { cmd: '/new', desc: L('chat.scNew') },
        { cmd: '/stop', desc: L('chat.scStop') },
      ] },
      { group: L('chat.scModel'), items: [
        { cmd: '/model', desc: L('chat.scModelSwitch'), needsArg: true },
        { cmd: '/model status', desc: L('chat.scModelStatus') },
      ] },
    ];
    if (this.engine === 'codex') return [
      { group: L('chat.scSession'), items: [
        { cmd: '/stop', desc: L('chat.scStop') },
      ] },
      { group: L('chat.scModel'), items: [
        { cmd: '/model status', desc: L('chat.scModelStatus') },
      ] },
    ];
    return [
      { group: L('chat.scSession'), items: [
        { cmd: '/new', desc: L('chat.scNew') },
        { cmd: '/reset', desc: L('chat.scReset') },
        { cmd: '/stop', desc: L('chat.scStop') },
      ] },
      { group: L('chat.scModel'), items: [
        { cmd: '/model', desc: L('chat.scModelSwitch'), needsArg: true },
        { cmd: '/model list', desc: L('chat.scModelList') },
        { cmd: '/model status', desc: L('chat.scModelStatus') },
      ] },
      { group: L('chat.scThink'), items: [
        { cmd: '/think off', desc: L('chat.scThinkOff') },
        { cmd: '/think low', desc: L('chat.scThinkLow') },
        { cmd: '/think medium', desc: L('chat.scThinkMed') },
        { cmd: '/think high', desc: L('chat.scThinkHigh') },
      ] },
    ];
  }

  _toggleSc() {
    this._scOpen = !this._scOpen;
    if (this._scOpen) document.addEventListener('keydown', this._scOnKey);
    else document.removeEventListener('keydown', this._scOnKey);
  }

  _scOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._toggleSc();
  };

  // ── 斜杠命令输入实时联想 ────────────────────────────────

  /** 联想候选(输入 / 开头时实时过滤) */
  @state() _scItems: Array<{ cmd: string; desc: string; group: string; needsArg?: boolean }> = [];
  @state() _scSel = 0;

  get _scFlat() {
    return this._scCommands().flatMap((g) => g.items.map((it) => ({ ...it, group: g.group })));
  }

  /** 输入变化时重算联想;非 / 开头或已含空格时关闭 */
  _updateScMatches() {
    const text = this._input;
    if (!text.startsWith('/') || text.includes(' ')) {
      this._scItems = [];
      return;
    }
    const q = text.toLowerCase();
    this._scItems = this._scFlat.filter((it) => it.cmd.toLowerCase().startsWith(q));
    if (this._scSel >= this._scItems.length) this._scSel = 0;
  }

  /** 键盘上下键选择时,让选中项滚入可视区 */
  _scrollScSel() {
    void this.updateComplete.then(() => {
      const box = this.renderRoot.querySelector('.sc-autocomplete') as HTMLElement | null;
      const sel = this.renderRoot.querySelector('.sc-ac-item.sel') as HTMLElement | null;
      if (!box || !sel) return;
      const top = sel.offsetTop - box.offsetTop;
      const bottom = top + sel.offsetHeight;
      if (top < box.scrollTop) box.scrollTop = top;
      else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight;
    });
  }

  /** 补全选中命令(带参数的命令补全后加空格),保持输入焦点 */
  _completeSc(it: { cmd: string; needsArg?: boolean }) {
    this._input = it.cmd + (it.needsArg ? ' ' : '');
    this._scItems = [];
    this._scSel = 0;
    this.requestUpdate();
    const ta = this.renderRoot.querySelector('.chat-input-bar__input textarea') as HTMLTextAreaElement | null;
    if (ta) {
      ta.focus();
      ta.setSelectionRange(this._input.length, this._input.length);
    }
  }

  /** 点快捷键：需参数的填入输入框等用户补全；其余走网关 RPC 客户端执行（实测：斜杠文本直发 webchat 网关不解释） */
  _runSlash(item: { cmd: string; needsArg?: boolean }) {
    this._toggleSc();
    if (item.needsArg) {
      this._input = `${item.cmd} `;
      const ta = this.shadowRoot?.querySelector('.chat-input-bar__input textarea') as HTMLTextAreaElement | null;
      ta?.focus();
      return;
    }
    this._messages = [...this._messages, { role: 'user', text: item.cmd }];
    this._scrollToBottom();
    void this._execSlash(item.cmd);
  }

  /** 斜杠命令按引擎分发执行 */
  async _execSlash(cmd: string) {
    const note = (text: string) => {
      this._messages = [...this._messages, { role: 'assistant', text }];
      this._scrollToBottom();
    };
    try {
      if (this.engine === 'hermes') return await this._execSlashHermes(cmd, note);
      if (this.engine === 'codex') return await this._execSlashCodex(cmd, note);
      await this._execSlashOpenClaw(cmd, note);
    } catch (e) {
      note(`⚠️ ${cmd}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /** Hermes：会话经其 HTTP API 动态创建；模型写 sidecar config.yaml 热加载；停止=本地 abort SSE */
  async _execSlashHermes(cmd: string, note: (t: string) => void) {
    if (cmd === '/new') {
      this._chatCancel?.abort();
      const s = await this._engineAdapter.createSession();
      if (!s) throw new Error(L('chat.engineOffline'));
      this._setSessionKey(s.id);
      this._messages = [];
      void this._loadSessions();
      note(`✅ /new — ${s.name}`);
      return;
    }
    if (cmd === '/stop') {
      this._chatCancel?.abort();
      note(`🛑 ${L('chat.scStop')}`);
      return;
    }
    if (cmd === '/model status') {
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`, { headers: sidecarHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const m = await r.json();
      note(`**${L('chat.scModelStatus')}**\n\n- model: ${m.name || '—'}\n- provider: ${m.provider || 'auto'}\n- baseUrl: ${m.baseUrl || '—'}\n- apiKey: ${m.hasKey ? m.apiKey : '—'}`);
      return;
    }
    if (cmd.startsWith('/model ')) {
      const name = cmd.slice('/model '.length).trim();
      if (!name) return;
      const r = await fetch(`${this._sidecarBase}/api/hermes/model`, {
        method: 'POST',
        headers: sidecarHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name, baseUrl: '', apiKey: '' }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.success === false) throw new Error(d.detail || d.message || `HTTP ${r.status}`);
      note(`✅ /model → ${name}`);
      void this._refreshModels();
    }
  }

  /** Codex：仅停止（本地 abort CLI 子进程）与模型状态（读 codex 配置） */
  async _execSlashCodex(cmd: string, note: (t: string) => void) {
    if (cmd === '/stop') {
      this._chatCancel?.abort();
      note(`🛑 ${L('chat.scStop')}`);
      return;
    }
    if (cmd === '/model status') {
      const cfg: any = await codex.getConfig();
      note(`**${L('chat.scModelStatus')}**\n\n- model: ${cfg?.model || '—'}`);
    }
  }

  /** OpenClaw：网关 RPC（方法/参数形状均经实测：sessions.* 用 key，chat.abort 用 sessionKey） */
  async _execSlashOpenClaw(cmd: string, note: (t: string) => void) {
    const sid = this._sessionKey || 'agent:main:main';
    const store = getSharedStore();
    {
      if (cmd === '/new' || cmd === '/reset') {
        this._chatCancel?.abort();
        await store.request('sessions.reset', { key: sid });
        this._messages = [];
        void this._loadSessions();
        note(`✅ ${cmd} — ${L('chat.scReset')}`);
        return;
      }
      if (cmd === '/stop') {
        this._chatCancel?.abort();
        const r = await store.request<{ runIds?: string[] }>('chat.abort', { sessionKey: sid });
        note(`🛑 ${L('chat.scStop')}${(r?.runIds || []).length ? ` (${r!.runIds!.length})` : ''}`);
        return;
      }
      if (cmd === '/model list') {
        const r = await store.request<{ models?: Array<Record<string, any>> }>('models.list', {});
        const lines = (r?.models || []).map((m) =>
          `- ${m.name || m.id}（${m.provider}）${m.reasoning ? ' · reasoning' : ''}${m.available === false ? ' · ✗' : ''}`);
        note(`**${L('chat.scModelList')}**\n\n${lines.join('\n') || '—'}`);
        return;
      }
      if (cmd === '/model status') {
        const d = await store.request<{ session?: Record<string, any> }>('sessions.describe', { key: sid });
        const s = d?.session || {};
        note(`**${L('chat.scModelStatus')}**\n\n- model: ${s.model || this._activeModel?.model || '—'}\n- thinking: ${s.thinkingLevel || 'off'}`);
        return;
      }
      if (cmd.startsWith('/model ')) {
        const model = cmd.slice('/model '.length).trim();
        if (!model) return;
        await store.request('sessions.patch', { key: sid, model });
        note(`✅ /model → ${model}`);
        void this._refreshModels();
        return;
      }
      if (cmd.startsWith('/think ')) {
        const level = cmd.slice('/think '.length).trim();
        if (!level) return;
        await store.request('sessions.patch', { key: sid, thinkingLevel: level });
        note(`✅ /think → ${level}`);
      }
    }
  }

  /** 轮询等待引擎就绪（重连后 WS 就绪前拉历史会空转） */
  async _waitReady(timeoutMs = 6000): Promise<boolean> {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (this._engineAdapter.ready()) return true;
      await new Promise(r => setTimeout(r, 250));
    }
    return this._engineAdapter.ready();
  }

  async _refresh() {
    if (this._refreshing) return;
    this._refreshing = true;
    try {
      if (this.engine === 'openclaw') {
        // 强制重连网关拿最新状态（自动重连有退避延迟，手动刷新立即探测）
        getSharedStore().connect();
      } else {
        void this._engineAdapter.refresh();
      }
      // 等就绪后再拉会话/历史——与整页刷新的加载顺序一致
      const ready = await this._waitReady();
      if (ready) {
        await this._loadSessions();
        if (this._sessionKey) await this._loadHistory();
      }
      this._refreshModels();
    } finally {
      this._refreshing = false;
      this.requestUpdate();
    }
  }

  // ── 渲染 ──

  _renderToolCard(t: ToolEvent) {
    const state = t.running ? 'run' : (t.ok ? 'ok' : 'err');
    const cmd = t.args && typeof t.args.command === 'string'
      ? t.args.command
      : (t.args ? JSON.stringify(t.args) : '');
    return html`
      <div class="tool-card ${state}">
        <div class="tool-card__head">
          <span class="tool-card__name">⚙ ${t.name}</span>
          ${cmd ? html`<code class="tool-card__cmd">$ ${cmd}</code>` : ''}
        </div>
        <pre class="tool-card__out">${t.running
          ? L('chat.toolRunning')
          : ((t.ok ? '' : '✗ ') + (t.result || L('chat.toolNoOutput')))}</pre>
      </div>
    `;
  }

  _fmtTime(ts?: number): string {
    if (!ts) return '';
    const d = new Date(ts);
    const sameDay = d.toDateString() === new Date().toDateString();
    return sameDay
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  _renderMessages() {
    if (!this._messages.length) return '';
    return html`
      ${this._messages.map(m => html`
        <div class="message ${m.role}">
          <div class="message__avatar">${m.role === 'user' ? 'U' : 'A'}</div>
          <div class="message__body">
            ${m.ts ? html`<div class="message__time">${this._fmtTime(m.ts)}</div>` : ''}
            ${m.role === 'assistant' && m.tools && m.tools.length
              ? html`<div class="msg-tools">${m.tools.map(t => this._renderToolCard(t))}</div>` : ''}
            ${m.text ? (m.role === 'assistant'
              ? html`<div class="msg-md"><oc-markdown .text=${m.text}></oc-markdown></div>`
              : html`<div class="msg-text">${m.text}</div>`) : ''}
            ${m.images && m.images.length ? html`
              <div class="msg-images">${m.images.map(src => html`<img src=${src} />`)}</div>
            ` : ''}
          </div>
        </div>
      `)}
    `;
  }

  _renderGatewayIdle() {
    return html`
      <div class="gw-idle">
        <div class="gw-icon">${icons['zap']}</div>
        <div class="gw-title">${L('chat.gatewayNotReady')}</div>
        <div class="gw-sub">${L('chat.connecting')}</div>
        <div class="gw-actions">
          <button class="gw-btn primary" @click=${this._refresh}>${L('chat.repairReconnect')}</button>
          <button class="gw-btn secondary" @click=${() => this.onNavigate('gateway')}>${L('chat.gatewaySettings')}</button>
        </div>
        <div class="gw-hint">${L('chat.firstUseHint')}</div>
      </div>
    `;
  }

  _renderSessionList() {
    return html`
      <div class="session-list">
        <div class="session-list__header">
          <span class="session-list__title">${L('chat.sessionList')}</span>
          <div class="session-list__actions">
            <button title="${L('chat.newChat')}" @click=${() => this._newChat()}>
              ${icons['plus']}
            </button>
            <button @click=${() => this._toggleSessionList()}>
              ${icons['x']}
            </button>
          </div>
        </div>
        <div class="session-list__body">
          ${this._sessions.length === 0
            ? html`<div style="padding:16px 12px;font-size:12px;color:var(--muted);">${this._loadingHistory ? '…' : L('chat.noSessions')}</div>`
            : this._sessions.map(s => html`
            <div class="session-item ${this._sessionKey === s.id ? 'active' : ''}"
                 @click=${() => this._selectSession(s.id)}>
              <span class="session-item__dot ${this._sessionKey === s.id ? 'active' : 'idle'}"></span>
              <span class="session-item__name">${s.name}</span>
              ${s.updatedAt ? html`<span class="session-item__time">${formatRelTime(s.updatedAt)}</span>` : ''}
              ${this._confirmDeleteId === s.id ? html`
                <span class="session-item__confirm" @click=${(e: Event) => e.stopPropagation()}>
                  <button class="yes" ?disabled=${this._deleting} @click=${() => this._deleteSession(s.id)}>${L('chat.deleteConfirmYes')}</button>
                  <button class="no" ?disabled=${this._deleting} @click=${() => { this._confirmDeleteId = null; }}>${L('chat.deleteConfirmNo')}</button>
                </span>
              ` : s.id !== this._engineAdapter.defaultSessionId() ? html`
                <button class="session-item__del" title=${L('chat.deleteSession')}
                  @click=${(e: Event) => { e.stopPropagation(); this._confirmDeleteId = s.id; }}>
                  ${icons['trash']}
                </button>
              ` : ''}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    const layoutClass = this._showSessionList ? 'chat-layout with-list' : 'chat-layout';
    const bannerVisible = this._showBanner && !this._engineReady;
    const isHermes = this._engineAdapter?.id === 'hermes';
    const isCodex = this._engineAdapter?.id === 'codex';

    return html`
      <div class="${layoutClass}">
        ${this._renderSessionList()}
        <div class="chat-main">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header__left">
              <button class="icon-btn" @click=${() => this._toggleSessionList()}>
                ${this._showSessionList ? icons['panel-left-close'] : icons['menu']}
              </button>
              <div class="chat-header__title">
                <span class="status-dot ${this._engineReady ? '' : 'offline'}"></span>
                ${this._engineReady ? L('chat.chat') : L('chat.mainSession')}
              </div>
            </div>
            <div class="chat-header__right">
              <select title="model" ?disabled=${isHermes || isCodex} @change=${this._onSelectModel}>
                ${this._models.length === 0
                  ? html`<option value="">${L('chat.noModelOption')}</option>`
                  : this._models.map(m => html`
                      <option value="${m.providerId}::${m.model}"
                        ?selected=${this._activeModel && this._activeModel.providerId === m.providerId && this._activeModel.model === m.model}>
                        ${m.model}${isHermes || isCodex ? '' : ' · ' + m.providerName}
                      </option>`)}
              </select>
              <button class="ws-btn ${this._refreshing ? 'spinning' : ''}" title="${L('common.refresh')}"
                ?disabled=${this._refreshing} @click=${this._refresh}>
                ${icons['refresh-cw']}
              </button>
              ${isCodex ? '' : html`
                <div class="workspace-pill" title=${this._wsPath || ''} @click=${this._toggleWsPanel}>
                  ${icons['folder-open']}
                  <span class="ws-label">${L('chat.workspace')}</span>
                  <span class="ws-name">${this._wsName || '—'}</span>
                </div>`}
              <!-- 快捷键入口：弹出斜杠命令列表 -->
              <button class="ws-btn" title=${L('chat.scTitle')} @click=${() => this._toggleSc()}>
                ${icons['command']}
              </button>
            </div>
          </div>

          <!-- Banner -->
          ${bannerVisible ? html`
            <div class="chat-banner info">
              <div class="chat-banner__icon">${icons['alert-triangle']}</div>
              <div class="chat-banner__content">
                <div class="chat-banner__title">${L('chat.useRealtimeChat')}</div>
                <div class="chat-banner__desc">
                  ${L('chat.realtimeChatDesc')}<br/>
                  ${L('chat.aiAssistantTip')}
                </div>
              </div>
              <button class="chat-banner__close" @click=${() => this._showBanner = false}>
                ${icons['x']}
              </button>
            </div>
          ` : ''}

          <!-- Messages / Idle -->
          <div class="chat-messages">
            ${this._modelWarning ? html`
              <div class="chat-banner">
                <div class="chat-banner__icon">${icons['alert-triangle']}</div>
                <div class="chat-banner__content">
                  <div class="chat-banner__desc">${this._modelWarning}</div>
                </div>
              </div>` : ''}
            ${!this._engineReady && !this._messages.length
              ? this._renderGatewayIdle()
              : this._renderMessages()
            }
          </div>

          <!-- 待发送图片缩略图 -->
          ${this._pendingImages.length ? html`
            <div class="chat-pending-imgs">
              ${this._pendingImages.map((p, i) => html`
                <div class="pi">
                  <img src=${p.dataUrl} title=${p.name} />
                  <button title=${L('common.delete')}
                    @click=${() => { this._pendingImages = this._pendingImages.filter((_, j) => j !== i); }}>×</button>
                </div>
              `)}
            </div>
          ` : ''}

          <!-- 斜杠命令联想 -->
          ${this._scItems.length ? html`
            <div class="sc-autocomplete">
              ${this._scItems.map((it, i) => html`
                <div class="sc-ac-item ${i === this._scSel ? 'sel' : ''}"
                  @mousedown=${(e: Event) => { e.preventDefault(); this._completeSc(it); }}
                  @mouseenter=${() => { this._scSel = i; }}>
                  <span class="sc-ac-cmd">${it.cmd}</span>
                  <span class="sc-ac-desc">${it.desc}</span>
                  <span class="sc-ac-group">${it.group}</span>
                </div>
              `)}
            </div>
          ` : ''}

          <!-- Input bar -->
          <div class="chat-input-bar">
            <div class="chat-input-bar__tools">
              <button class="${this._imgGenMode ? 'active' : ''}" title="${L('chat.imgGenMode')}"
                @click=${() => { this._imgGenMode = !this._imgGenMode; }}>
                ${icons['image']}
              </button>
              <button title="${L('chat.attachment')}"
                @click=${() => (this.renderRoot.querySelector('#chat-file-input') as HTMLInputElement)?.click()}>
                ${icons['paperclip']}
              </button>
              <input id="chat-file-input" type="file" accept="image/*" multiple style="display:none"
                @change=${this._onPickImages} />
            </div>
            <div class="chat-input-bar__input">
              <textarea rows="1"
                .value=${this._input}
                @input=${(e: Event) => {
                  const t = e.target as HTMLTextAreaElement;
                  this._input = t.value;
                  this._updateScMatches();
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
                @keydown=${this._onKeydown}
                placeholder="${this._imgGenMode ? L('chat.imgGenPlaceholder') : L('chat.placeholder')}"
              ></textarea>
            </div>
            <button class="chat-input-bar__send"
                    ?disabled=${!this._input.trim() || this._streaming}
                    @click=${this._send}>
              ${this._streaming ? icons['refresh-cw'] : icons['send']}
            </button>
          </div>
        </div>
      </div>

      <!-- 快捷键面板 -->
      ${this._scOpen ? html`
        <div class="sc-backdrop" @click=${() => this._toggleSc()}></div>
        <div class="sc-panel">
          ${this._scCommands().map(g => html`
            <div class="sc-group">${g.group}</div>
            ${g.items.map(it => html`
              <div class="sc-row" @click=${() => this._runSlash(it)}>
                <span class="sc-row__cmd">${it.cmd}</span>
                <span class="sc-row__desc">${it.desc}</span>
              </div>
            `)}
          `)}
        </div>
      ` : ''}

      <!-- 工作区文件面板 -->
      ${this._wsPanelOpen ? html`
        <div class="ws-panel">
          <div class="ws-panel__header">
            <span class="ws-panel__title">${L('chat.wsTitle')}</span>
            <span class="ws-panel__badge">${this._wsName || 'main'}</span>
            <div class="ws-panel__actions">
              <button title=${L('common.refresh')} @click=${() => { void this._loadWsInfo(); void this._loadWsDir(''); if (this._wsSel) void this._wsOpenFile(this._wsSel); }}>
                ${icons['refresh-cw']}
              </button>
              <button title=${L('channels.close')} @click=${() => this._closeWsPanel()}>
                ${icons['x']}
              </button>
            </div>
          </div>
          <div class="ws-panel__sub">
            <div style="font-weight:600;color:var(--text-soft);margin-bottom:2px;">${L('chat.wsMainSession')}</div>
            ${this._wsPath || '—'}
          </div>
          <div class="ws-panel__body">
            <div class="ws-panel__left">
              <div class="ws-panel__section-label">${L('chat.wsCoreFiles')}</div>
              <div class="ws-panel__core">
                ${this._wsCore.map(f => html`
                  <div class="ws-core-item ${this._wsSel === f.name ? 'active' : ''}">
                    <span class="ws-tree__icon">📄</span>
                    <span class="ws-core-item__name">${f.name}</span>
                    ${f.exists
                      ? html`<button @click=${() => this._wsOpenFile(f.name)}>${L('common.edit')}</button>`
                      : html`<button @click=${() => this._wsAddCore(f.name)}>${L('chat.wsAdd')}</button>`}
                  </div>
                `)}
              </div>
              <div class="ws-panel__browse">
                <div class="ws-panel__section-label">${L('chat.wsBrowse')}</div>
                ${this._wsRenderTree('', 0)}
              </div>
            </div>
            <div class="ws-panel__right">
              <div class="ws-panel__toolbar">
                <strong style="font-size:13px;color:var(--text-strong);">${this._wsSel || L('chat.wsSelectFile')}</strong>
                <span class="spacer"></span>
                <button @click=${() => { if (this._wsSel) void this._wsOpenFile(this._wsSel); }}>${L('chat.wsReload')}</button>
                <button class="${this._wsEditing ? 'mode-active' : ''}" ?disabled=${!this._wsSel || this._wsBusy} @click=${() => { this._wsEditing = true; }}>${L('common.edit')}</button>
                <button class="${!this._wsEditing && this._wsSel ? 'mode-active' : ''}" ?disabled=${!this._wsSel || this._wsBusy} @click=${() => { this._wsEditing = false; }}>${L('chat.wsPreview')}</button>
                <button class="primary" ?disabled=${!this._wsSel || this._wsBusy || !this._wsEditing} @click=${this._wsSave}>${L('common.save')}</button>
              </div>
              ${this._wsMsg ? html`<div class="ws-panel__msg">${this._wsMsg}</div>` : ''}
              ${this._wsSel ? html`
                <div class="ws-panel__content">
                  ${this._wsEditing ? html`
                    <textarea .value=${this._wsContent}
                      @input=${(e: Event) => { this._wsContent = (e.target as HTMLTextAreaElement).value; this._wsDirty = true; this._wsSaveDraft(); }}></textarea>
                  ` : html`<pre>${this._wsContent}</pre>`}
                </div>
              ` : html`<div class="ws-panel__empty">${L('chat.wsReady')}</div>`}
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }
}

customElements.define('chat-page', ChatPage);
