import { LitElement, html, css } from 'lit';
import { state } from 'lit/decorators/state.js';
import { i18n, L } from './i18n/index.js';
import { getSharedStore } from './store/shared.js';
import type { GatewaySnapshot } from './store/gateway-store.js';
import './components/sidebar.js';
import './components/page-header.js';
import './pages/init-page.js';
import './pages/dashboard-page.js';
import './pages/chat-page.js';
import './pages/sessions-page.js';
import './pages/logs-page.js';
import './pages/usage-page.js';
import './pages/skills-page.js';
import './pages/memory-page.js';
import './pages/cron-page.js';
import './pages/extensions-page.js';
import './pages/agents-page.js';
import './pages/settings-page.js';
import './pages/channels-page.js';
import './pages/services-page.js';
import './pages/models-page.js';
import './pages/gateway-page.js';
import './pages/security-page.js';
import './pages/diagnostics-page.js';
import './pages/browser-page.js';
import './pages/codex-page.js';
import './pages/sandbox-page.js';
import './pages/hermes-dashboard-page.js';
import './pages/hermes-memory-page.js';
import './pages/hermes-skills-page.js';
import './pages/hermes-service-page.js';
import './pages/hermes-env-page.js';
import './pages/hermes-config-page.js';
import './pages/hermes-logs-page.js';
import './pages/hermes-installer-page.js';
import './pages/ai-page.js';

const TAB_ICONS: Record<string, string> = {
  dashboard:'layout-dashboard', chat:'message-square', sessions:'history', logs:'scroll-text',
  usage:'bar-chart-3', skills:'puzzle', memory:'database', cron:'clock',
  extensions:'palette', ai:'bot', settings:'settings',
  services:'server', models:'cpu', agents:'users', gateway:'antenna',
  channels:'share-2', security:'shield', diagnostics:'stethoscope', browser:'globe',
  codex:'terminal', sandbox:'shield',
  'hermes-service':'server',
  'hermes-env':'key',
  'hermes-config':'settings',
  'hermes-logs':'scroll-text',
  'hermes-installer':'terminal',
};

function buildRoutes(): Record<string, { label: string; icon: string; subtitle: string }> {
  const r: Record<string, { label: string; icon: string; subtitle: string }> = {};
  for (const [k, icon] of Object.entries(TAB_ICONS))
    r[k] = { label: L(`tabs.${k}`), icon, subtitle: L(`subtitles.${k}`) };
  return r;
}

function buildSections(engine: string): Array<{ heading: string | null; tabs: string[] }> {
  if (engine === 'hermes') {
    return [
      { heading: L('sections.Monitor'), tabs: ['dashboard','ai','chat','sessions','logs','usage'] },
      { heading: L('sections.Extensions'), tabs: ['skills','memory','cron','extensions','settings'] },
    ];
  }
  if (engine === 'codex') {
    return [
      { heading: L('sections.Monitor'), tabs: ['ai','chat'] },
      { heading: L('sections.Config'), tabs: ['codex','models','sandbox'] },
      { heading: L('sections.Extensions'), tabs: ['settings'] },
    ];
  }
  return [
    { heading: L('sections.Monitor'), tabs: ['dashboard','ai','chat','services','logs'] },
    { heading: L('sections.Config'), tabs: ['models','agents','gateway','browser','channels','security'] },
    { heading: L('sections.Extensions'), tabs: ['skills','settings','diagnostics'] },
  ];
}

export class OpenClawApp extends LitElement {
  static styles = css`
    :host { display: flex; height: 100vh; overflow: hidden; }
    .shell { display: flex; width: 100%; height: 100%; }
    .shell-nav { flex-shrink: 0; height: 100%; z-index: 30; }
    .shell-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .btn-sm { padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px; ; background: var(--accent); color: var(--accent-foreground); white-space: nowrap; transition: background var(--duration-fast) ease; }
    .btn-sm:hover { background: var(--accent-hover); }
    .btn-sm.ghost { background: transparent; color: var(--text-soft); border: 1px solid var(--border); }
    .btn-sm.ghost:hover { background: var(--bg-hover); color: var(--text); }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
    .page-header-left { min-width: 0; }
    .page-title { color: var(--text-strong); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .page-subtitle { color: var(--danger); font-size: 12px; margin-top: 4px; line-height: 1.2; }
    .page-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .topbar-btn { padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 500; background: var(--bg-hover); color: var(--text-soft); border: 1px solid var(--border); cursor: pointer; white-space: nowrap; transition: all var(--duration-fast) ease; }
    .topbar-btn:hover { background: var(--bg-active); color: var(--text); border-color: var(--text-muted); }
    .page-content { flex: 1; overflow: auto; background: var(--bg); padding: 0 24px 24px; }
    .grid6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; grid-auto-rows: 1fr; }
    @media (max-width: 1400px) { .grid6 { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 700px) { .grid6 { grid-template-columns: repeat(2, 1fr); } }    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; grid-auto-rows: 1fr; }
    .grid2 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
    @media (max-width: 1100px) { .grid2 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-card); height: 100%; }
    .stat-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid var(--border); }
    .stat-row:last-child { border-bottom: none; }
    .stat-row-label { color: var(--text-soft); }
    .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; box-shadow: var(--shadow-card); display: flex; flex-direction: column; justify-content: center; }
    .stat-label { font-size: 10px; ; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 4px; }
    .stat-hint { font-size: 10px; color: var(--text-soft); margin-top: 2px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { text-align: left; font-size: 11px; ; letter-spacing: 0.05em; color: var(--muted); padding: 10px 14px; border-bottom: 1px solid var(--border); }
    .table td { padding: 12px 14px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text); }
    .table tr:hover td { background: var(--bg-hover); }
    .mono { font-family: var(--font-mono); font-size: 12px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: var(--radius-full); font-size: 11px; ; }
    .badge.success { background: var(--success-subtle); color: var(--success); }
    .badge.warning { background: rgba(245,158,11,0.12); color: var(--warn); }
    .badge.danger { background: var(--danger-subtle); color: var(--danger); }
    .empty-state { text-align: center; padding: 64px 24px; color: var(--muted); }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; font-size: 12px; ; margin-bottom: 6px; color: var(--text-soft); }
    .form-input { width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 14px; }
    .form-input:focus { border-color: var(--accent); }
    textarea.form-input { resize: vertical; min-height: 120px; font-family: var(--font-mono); font-size: 13px; }
    .settings-tabs { display: flex; gap: 2px; margin-bottom: 20px; border-bottom: 1px solid var(--border); }
    .settings-tab { padding: 8px 16px; font-size: 13px; font-weight: 500; color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent; transition: all var(--duration-fast) ease; }
    .settings-tab:hover { color: var(--text); }
    .settings-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
    .log-view { background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; font-family: var(--font-mono); font-size: 12px; line-height: 1.7; max-height: 420px; overflow-y: auto; }
    .log-line { white-space: pre-wrap; word-break: break-all; }
    .log-ts { color: var(--muted); }
    .log-warn { color: var(--warn); }
    .log-error { color: var(--danger); }
    .channel-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-card); }
    .channel-card-header { display: flex; align-items: center; gap: 12px; }
    .channel-icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--bg-muted); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .channel-name { font-size: 15px; ; color: var(--text-strong); }
    .channel-desc { font-size: 13px; color: var(--text-soft); }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; }
    .toggle-label { font-size: 14px; font-weight: 500; }
    .switch { position: relative; width: 40px; height: 22px; background: var(--border-strong); border-radius: 11px; cursor: pointer; transition: background var(--duration-fast) ease; flex-shrink: 0; }
    .switch.on { background: var(--accent); }
    .switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform var(--duration-fast) var(--ease-out); }
    .switch.on::after { transform: translateX(18px); }
    .cron-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 12px; box-shadow: var(--shadow-card); }
    .cron-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; }
    .cron-name { font-size: 15px; ; color: var(--text-strong); }
    .cron-schedule { font-family: var(--font-mono); font-size: 12px; color: var(--muted); }
    .cron-desc { font-size: 13px; color: var(--text-soft); margin-bottom: 10px; }
    .page-actions { display: flex; gap: 6px; }
    .page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-toolbar-lg { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .log-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .quick-actions { display: flex; flex-direction: column; gap: 8px; }
    .msg-row { padding: 8px 0; border-bottom: 1px solid var(--border); }
    .msg-meta { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
    .msg-text { font-size: 14px; white-space: pre-wrap; }
    .search-box { display: flex; align-items: center; gap: 8px; background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 6px 12px; max-width: 260px; }
    .search-box input { background: transparent; border: none; color: var(--text); font-size: 13px; width: 100%; outline: none; }
    .search-box input::placeholder { color: var(--muted); }
    a { color: var(--text); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .block_border{ border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; }
  `;

  @state() _initDone = sessionStorage.getItem('openclaw.init-shown') === '1';
  @state() _page = 'dashboard';
  @state() _connected = false;
  @state() _snapshot = { status:'Offline', uptime:'--', version:'1.0.0' };
  @state() _instances: Array<{id:string;mode:string;connected:string}> = [];
  @state() _sessions = [{ key:'main', agent:'Main Assistant', created:Date.now(), messages:0 }];
  @state() _agents = [
    { id:'main', name:'Main Assistant', model:'Default', status:'active' },
    { id:'ops', name:'Ops Assistant', model:'Default', status:'active' },
  ];
  @state() _cronJobs = [
    { id:'1', name:'Morning Brief', schedule:'0 7 * * *', enabled:true, desc:'Daily morning summary' },
    { id:'2', name:'Health Check', schedule:'*/30 * * * *', enabled:true, desc:'Gateway status check' },
  ];
  @state() _skills = [
    { name:'Browser', desc:'Web browsing', enabled:true },
    { name:'File System', desc:'Read/write files', enabled:true },
    { name:'Shell', desc:'Execute commands', enabled:true },
    { name:'Memory', desc:'Persistent store', enabled:true },
  ];
  @state() _theme = 'claw';
  @state() _themeMode = 'dark';
  @state() _engine = 'openclaw';
  @state() _lang = i18n.locale;
  _unsubI18n: (() => void) | null = null;
  _unsubStore: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadState();
    this._unsubI18n = i18n.subscribe(() => this.requestUpdate());
    // 订阅共享 Gateway 连接状态
    this._unsubStore = getSharedStore().subscribe((snap: GatewaySnapshot) => {
      this._connected = snap.connected;
      if (snap.hello?.server?.version) {
        this._snapshot = { status: 'Online', uptime: '--', version: snap.hello.server.version };
      } else if (!snap.connected) {
        this._snapshot = { ...this._snapshot, status: 'Offline' };
      }
    });
  }
  disconnectedCallback() { super.disconnectedCallback(); this._unsubI18n?.(); this._unsubStore?.(); }

  _loadState() {
    try {
      const raw = localStorage.getItem('openclaw-control-state');
      if (raw) {
        const s = JSON.parse(raw);
        if (s.page && TAB_ICONS[s.page]) this._page = s.page;
        if (s.engine && (s.engine==='openclaw'||s.engine==='hermes'||s.engine==='codex')) this._engine = s.engine;
        // codex 引擎没有 dashboard/logs/skills/memory 等页，恢复状态时回落到 codex 配置页
        if (this._engine === 'codex' && !['ai','chat','codex','models','sandbox','settings'].includes(this._page)) this._page = 'codex';
      }
      const theme = localStorage.getItem('openclaw-control-theme');
      if (theme) { const t = JSON.parse(theme); this._theme = t.theme||'claw'; this._themeMode = t.mode||'dark'; }
    } catch {}
  }

  _saveState() { try { localStorage.setItem('openclaw-control-state', JSON.stringify({ page:this._page, engine:this._engine })); } catch {} }
  _navigate(page: string) { if (TAB_ICONS[page]) { this._page = page; this._saveState(); } }
  _setTheme(t: string) { this._theme = t; document.documentElement.setAttribute('data-theme', t); localStorage.setItem('openclaw-control-theme', JSON.stringify({ theme:t, mode:this._themeMode })); }
  _setThemeMode(m: string) { this._themeMode = m; const r = m==='system'?(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'):m; document.documentElement.setAttribute('data-theme-mode', r); localStorage.setItem('openclaw-control-theme', JSON.stringify({ theme:this._theme, mode:m })); }
  _setLang(l: string) { i18n.setLocale(l); this._lang = l; }
  _setEngine(e: string) { const v = (e==='openclaw'||e==='hermes'||e==='codex')?e:'openclaw'; if (v !== this._engine) { this._engine = v; this._page = v==='codex' ? 'codex' : 'dashboard'; this._saveState(); } }

  _renderPage() {
    const title = (k: string) => L(`tabs.${k}`);
    const sub = (k: string) => L(`subtitles.${k}`);
    switch (this._page) {
      case 'dashboard':
        if (this._engine === 'hermes') {
          return html`<hermes-dashboard-page title=${title('dashboard')} .onNavigate=${(p:string)=>this._navigate(p)}></hermes-dashboard-page>`;
        }
        return html`<dashboard-page title=${title('dashboard')} subtitle=${L('dashboard.subtitle')} .connected=${this._connected} .instances=${this._instances} .sessions=${this._sessions} .cronJobs=${this._cronJobs} .skills=${this._skills} .models=${this._agents} .snapshot=${this._snapshot} .onNavigate=${(p:string)=>this._navigate(p)} @check-updates=${() => { this._initDone = false; sessionStorage.removeItem('openclaw.init-shown'); }}></dashboard-page>`;
      case 'chat': return html`<chat-page title=${title('chat')} subtitle=${sub('chat')} .connected=${this._connected} .engine=${this._engine}></chat-page>`;
      case 'sessions': return html`<sessions-page title=${title('sessions')} subtitle=${sub('sessions')} .sessions=${this._sessions}></sessions-page>`;
      case 'logs':
        if (this._engine === 'hermes') return html`<hermes-logs-page .onNavigate=${(p:string)=>this._navigate(p)}></hermes-logs-page>`;
        return html`<logs-page title=${title('logs')} subtitle=${sub('logs')}></logs-page>`;
      case 'usage': return html`<usage-page title=${title('usage')}></usage-page>`;
      case 'skills':
        if (this._engine === 'hermes') return html`<hermes-skills-page title=${title('skills')} subtitle=${sub('skills')}></hermes-skills-page>`;
        return html`<skills-page title=${title('skills')} subtitle=${sub('skills')} .skills=${this._skills}></skills-page>`;
      case 'memory':
        if (this._engine === 'hermes') return html`<hermes-memory-page title=${title('memory')} subtitle=${sub('memory')}></hermes-memory-page>`;
        return html`<memory-page title=${title('memory')} subtitle=${sub('memory')}></memory-page>`;
      case 'cron': return html`<cron-page title=${title('cron')} .cronJobs=${this._cronJobs}></cron-page>`;
      case 'extensions': return html`<extensions-page title=${title('extensions')}></extensions-page>`;
      case 'ai': return html`<ai-page title=${title('ai')} subtitle=${sub('ai')}></ai-page>`;
      case 'agents': return html`<agents-page title=${title('agents')} .agents=${this._agents} .onNavigate=${(p:string)=>this._navigate(p)}></agents-page>`;
      case 'settings': return html`<settings-page title=${title('settings')} subtitle=${sub('settings')} .theme=${this._theme} .themeMode=${this._themeMode} .snapshot=${this._snapshot} @set-theme=${(e:CustomEvent)=>this._setTheme(e.detail.value)} @set-mode=${(e:CustomEvent)=>this._setThemeMode(e.detail.value)}></settings-page>`;
      case 'channels': return html`<channels-page title=${title('channels')} subtitle=${sub('channels')}></channels-page>`;
      case 'services': return html`<services-page title=${title('services')} subtitle=${sub('services')}></services-page>`;
      case 'models': return html`<models-page title=${title('models')} subtitle=${sub('models')}></models-page>`;
      case 'gateway': return html`<gateway-page title=${title('gateway')} subtitle=${sub('gateway')}></gateway-page>`;
      case 'security': return html`<security-page title=${title('security')} subtitle=${sub('security')}></security-page>`;
      case 'diagnostics': return html`<diagnostics-page title=${title('diagnostics')} subtitle=${sub('diagnostics')}></diagnostics-page>`;
      case 'browser': return html`<browser-page title=${title('browser')} subtitle=${sub('browser')}></browser-page>`;
      case 'codex': return html`<codex-page title=${title('codex')} subtitle=${sub('codex')}></codex-page>`;
      case 'sandbox': return html`<sandbox-page title=${title('sandbox')} subtitle=${sub('sandbox')}></sandbox-page>`;
      case 'hermes-service': return html`<hermes-service-page title=${L('hermesDashboard.hermesService')} subtitle=${L('hermesService.subtitle')} .onNavigate=${(p:string)=>this._navigate(p)}></hermes-service-page>`;
      case 'hermes-env': return html`<hermes-env-page .onNavigate=${(p:string)=>this._navigate(p)}></hermes-env-page>`;
      case 'hermes-config': return html`<hermes-config-page .onNavigate=${(p:string)=>this._navigate(p)}></hermes-config-page>`;
      case 'hermes-logs': return html`<hermes-logs-page .onNavigate=${(p:string)=>this._navigate(p)}></hermes-logs-page>`;
      case 'hermes-installer': return html`<hermes-installer-page .onNavigate=${(p:string)=>this._navigate(p)}></hermes-installer-page>`;
      default: return html`<dashboard-page title=${title('dashboard')} subtitle=${sub('dashboard')} .connected=${this._connected} .instances=${this._instances} .sessions=${this._sessions} .cronJobs=${this._cronJobs} .skills=${this._skills} .models=${this._agents} .snapshot=${this._snapshot} .onNavigate=${(p:string)=>this._navigate(p)} @check-updates=${() => { this._initDone = false; sessionStorage.removeItem('openclaw.init-shown'); }}></dashboard-page>`;
    }
  }

  render() {
    if (!this._initDone) {
      return html`
        <init-page @init-done=${() => { this._initDone = true; sessionStorage.setItem('openclaw.init-shown', '1'); }}></init-page>
      `;
    }
    return html`
      <div class="shell">
        <oc-sidebar class="shell-nav" .page=${this._page} .routes=${buildRoutes()} .sections=${buildSections(this._engine)} .connected=${this._connected} .engine=${this._engine} .themeMode=${this._themeMode} .lang=${this._lang}
          @navigate=${(e:CustomEvent)=>this._navigate(e.detail.page)}
          @set-mode=${(e:CustomEvent)=>this._setThemeMode(e.detail.mode)}
          @set-lang=${(e:CustomEvent)=>this._setLang(e.detail.lang)}
          @set-engine=${(e:CustomEvent)=>this._setEngine(e.detail.engine)}
        ></oc-sidebar>
        <div class="shell-main">
          <div class="page-content">${this._renderPage()}</div>
        </div>
      </div>
    `;
  }
}
customElements.define('openclaw-app', OpenClawApp);
