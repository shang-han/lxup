import{f as Ps,u as Is,b as r,i as C,r as ve,a as A,A as Zt,E as zs}from"./lit-CSAoqvVc.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&a(n)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Os={attribute:!0,type:String,converter:Is,reflect:!1,hasChanged:Ps},Es=(l=Os,e,t)=>{const{kind:a,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),a==="setter"&&((l=Object.create(l)).wrapped=!0),o.set(t.name,l),a==="accessor"){const{name:n}=t;return{set(c){const h=e.get.call(this);e.set.call(this,c),this.requestUpdate(n,h,l,!0,c)},init(c){return c!==void 0&&this.C(n,void 0,l,c),c}}}if(a==="setter"){const{name:n}=t;return function(c){const h=this[n];e.call(this,c),this.requestUpdate(n,h,l,!0,c)}}throw Error("Unsupported decorator location: "+a)};function m(l){return(e,t)=>typeof t=="object"?Es(l,e,t):((a,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,a),n?Object.getOwnPropertyDescriptor(i,o):void 0})(l,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function d(l){return m({...l,state:!0,attribute:!1})}const nt={brand:{eyebrow:"Control",title:"OpenClaw U-Disk"},common:{health:"Health",ok:"OK",online:"Online",offline:"Offline",connect:"Connect",refresh:"Refresh",enabled:"Enabled",disabled:"Disabled",show:"Show",hide:"Hide",na:"n/a",version:"Version",docs:"Docs",search:"Search",darkMode:"Dark Mode",lightMode:"Light Mode",systemMode:"System Mode",uptime:"Uptime",connectedClients:"connected clients",activeSessions:"active sessions",scheduled:"scheduled",gatewaySnapshot:"Gateway Snapshot",recentSessions:"Recent Sessions",quickActions:"Quick Actions",newSession:"New Session",automation:"Automation",status:"Status",instances:"Instances",send:"Send",config:"Config",appearance:"Appearance",debug:"Debug",connectHint:"Connect to start chatting.",stable:"Stable",stop:"Stop",restart:"Restart",start:"Start",save:"Save",applyRestart:"Apply & Restart",msgCountShort:"msgs",loading:"Loading…",enable:"Enable",disable:"Disable",configSaved:"Config saved",configSaveFailed:"Save failed: ",configInvalidJson:"Invalid JSON — fix it before saving",configReloaded:"Reloaded latest config from gateway",downloadStarted:"Config snapshot download started",edit:"Edit",delete:"Delete",runNow:"Run Now",setup:"Setup",clear:"Clear",lines:"lines",newAgent:"New Agent",searchAgents:"Search agents...",sessionKey:"Session Key",agent:"Agent",created:"Created",messages:"Messages",name:"Name",id:"ID",model:"Model",theme:"Theme",modeLabel:"Mode",system:"System",dark:"Dark",light:"Light",eventLog:"Event Log",noEvents:"No events recorded.",totalTokens:"Total Tokens",totalCost:"Total Cost",dailyUsage:"Daily Usage",selectRange:"Select a date range to view usage.",descExtensions:"Browse and manage installed extensions and themes.",descMemory:"Browse and manage persistent memory files.",descGateway:"Gateway routing and connection management.",descServices:"Monitor and manage backend services.",descModels:"Configure AI model providers and defaults.",descSecurity:"Manage API keys, ACLs, and sandbox policies.",descDiagnostics:"Run system health checks and diagnostics.",install:"Install",uninstall:"Uninstall",installed:"Installed",pid:"PID",port:"Port",bind:"Bind",routeRules:"Route Rules",addRoute:"Add Route",wsEndpoint:"WebSocket Endpoint",connectedClientsTable:"Connected Clients",services:"Services",cpuUsage:"CPU Usage",memUsage:"Memory Usage",provider:"Provider",apiKey:"API Key",defaultModel:"Default Model",modelList:"Model List",addModel:"Add Model",aclRules:"ACL Rules",sandboxPolicy:"Sandbox Policy",auditLog:"Audit Log",keyName:"Key Name",addKey:"Add Key",healthCheck:"Health Check",runCheck:"Run Check",resourceUsage:"Resource Usage",connectivityTest:"Connectivity Test",repairTools:"Repair Tools",repair:"Repair",browserSession:"Browser Session",playwrightConfig:"Playwright Config",cdpPort:"CDP Port",takeScreenshot:"Take Screenshot",browserLogs:"Browser Logs",memoryFiles:"Memory Files",createMemory:"Create Memory",searchMemory:"Search memory...",memDeleteConfirm:'Delete memory file "{name}"? This cannot be undone.',memLoadFailed:"Failed to load memories: ",memSaveFailed:"Failed to save: ",filterType:"Filter by Type",wordCount:"Word Count",typeUser:"user",typeNote:"note",typeSoul:"soul",configuration:"Configuration",workspaceDir:"Workspace Directory",baseUrl:"API Base URL",baseUrlHint:"Leave blank for the official OpenAI API. For third-party services, enter the full base URL. Note: Codex 0.145+ removed the Chat Completions wire — custom providers only speak the Responses API, so providers offering only Chat Completions need a protocol-converting relay.",sandboxMode:"Sandbox Mode",sandboxLandlock:"Landlock (Linux)",sandboxSeatbelt:"Seatbelt (macOS)",sandboxDocker:"Docker",sandboxNone:"Disabled (unsafe)",approvalPolicy:"Approval Policy",approvalUntrusted:"Untrusted — ask before most operations",approvalOnFailure:"On Failure — ask only when a command fails",approvalOnRequest:"On Request — ask only when the model escalates",approvalNever:"Never — auto-approve everything",codexConfigHint:"Codex is a CLI, not a resident service — it runs on demand and exits when the task completes. Config is written to runtime/codex-home/config.toml (config) and auth.json (API Key) via the Sidecar. Real-time chat runs each turn through a codex exec --json subprocess.",codexNotInstalled:"Codex CLI not installed",codexNotInstalledDesc:"Run the one-time bootstrap in the project root to install the portable Codex binary and reference sources:",codexNoKey:"OPENAI_API_KEY not set",codexHasKey:"API Key configured",cliArgs:"CLI Arguments",resetDefaults:"Reset to Defaults",copy:"Copy",copied:"Copied!",hash:"Hash",workspace:"Workspace",modelLoading:"Loading model...",noModelOption:"Please configure a model first",noModelConfigured:'No model is configured yet. Please go to the "Models" page to add a provider and model first.',useRealtimeChat:'You are using "Real-time Chat"',realtimeChatDesc:"This page connects to OpenClaw's AI Agent via the Gateway. Conversations are handled by your deployed OpenClaw service.",aiAssistantTip:`To use OpenClaw U-Disk's built-in AI Assistant (independent of OpenClaw), go to "AI Assistant" in the left sidebar.`,gatewayNotReady:"Gateway not ready",connecting:"Connecting to Gateway...",repairReconnect:"Repair & Reconnect",gatewaySettings:"Gateway Settings",firstUseHint:'First time? Make sure Gateway is started, or click "Repair & Reconnect" to auto-repair configuration.',serviceMgmt:"Service Management",sessionList:"Session List",newChat:"New Chat",chat:"Chat",placeholder:"Type message, Enter to send, / to open commands",managed:"Managed",thinking:"Thinking",thinkingEnabled:"Thinking enabled",thinkingDisabled:"Thinking disabled",attachment:"Attachment",image:"Image",noSession:"No session selected",createFirst:"Create a new chat to get started.",mainSession:"Main Session",dismiss:"Dismiss",cancel:"Cancel",confirm:"Confirm",requestFailed:"Request failed",aiServiceError:"AI assistant service error ({status})",hermesError:"Hermes error ({status})",codexError:"Codex error ({status})",hermesErrorPlain:"Hermes error",codexErrorPlain:"Codex error",currentVersion:"Current Version",sinicizedOptimized:"Sinicized Optimized",noRecommendedStable:"No recommended stable version available",latestUpstream:"Latest upstream",versionNote:'Only the recommended stable version verified by the current panel is advised by default. If you want to try other versions or latest features, please manually switch version on the "About" page and verify compatibility; if you want the panel to prioritize the latest version, feel free to submit an issue.',gatewayService:"OpenClaw Gateway",pidLabel:"PID",dockerMgmt:"Docker Management",dockerDesc:"Manage Docker nodes and OpenClaw containers accessible by the current Web backend. Suitable for local socket, also supports filling in remote Docker API nodes.",dockerUnavailable:"No usable Web backend available in the current environment, Docker management is temporarily unavailable. The current desktop packaged version has not yet integrated Rust docker_* commands; if you need to use it now, please run in Web/serve mode.",configEdit:"Configuration File Editor",configEditDesc:"Directly edit the openclaw.json main configuration file. A backup will be automatically created before saving, and Gateway may need to be restarted for changes to take effect.",saveRestart:"Save & Restart",saveOnly:"Save Only",reload:"Reload",loaded:"Loaded",configFile:"config file",configValidation:"Configuration Validation",configValidationDesc:"Used to repair damaged, interrupted or insecure openclaw.json. A repair backup will be created first, then core configuration will be calibrated according to the selected mode.",inheritCalibration:"Inherit Calibration",fullInitRepair:"Full Initialization Repair",inheritDesc:"Keep existing models, channels, Agents, bindings, credentials and other business configurations, only repair Gateway, tool configuration and necessary defaults.",fullInitDesc:"Rebuild a safe baseline configuration, then selectively inherit models, channels, Agents, bindings, credentials and other key business configurations. Suitable for seriously damaged configurations.",configBackup:"Configuration Backup",configBackupDesc:"Backup scope: openclaw.json main configuration file (includes models, Provider, Gateway settings). Agent data and memory files are not included in this backup scope.",createBackup:"Create Backup",noBackups:"No backups yet"},chat:{noModelOption:"Please configure a model first",tools:"Tools",wsTitle:"Workspace Files",wsMainSession:"Main session",wsCoreFiles:"Core files",wsBrowse:"Workspace browser",wsSelectFile:"Select a workspace file…",wsReady:"Current Agent workspace is ready — pick a file on the left",wsReload:"Reload",wsPreview:"Preview",wsAdd:"Add",wsUnsaved:"Discard unsaved changes?",wsDraftRestored:"Restored unsaved draft",scTitle:"Shortcuts",scSession:"Session",scModel:"Model",scThink:"Thinking mode",scNew:"Start a new session",scReset:"Reset the current session",scStop:"Stop generation",scModelSwitch:"Switch model (enter a model name)",scModelList:"List available models",scModelStatus:"Current model status",scThinkOff:"Thinking off",scThinkLow:"Low thinking",scThinkMed:"Medium thinking",scThinkHigh:"High thinking",imgGenMode:"Image generation mode",imgGenPlaceholder:"Describe the image to generate",imgUnsupported:"The current engine does not support image attachments — the image was not sent (switch to the OpenClaw engine to send images).",imgTooLarge:'Image "{name}" exceeds 10MB and was not attached.',useRealtimeChat:'You are using "Real-time Chat"',realtimeChatDesc:"This page connects to OpenClaw's AI Agent via the Gateway. Conversations are handled by your deployed OpenClaw service.",aiAssistantTip:`To use OpenClaw U-Disk's built-in AI Assistant (independent of OpenClaw), go to "AI Assistant" in the left sidebar.`,gatewayNotReady:"Gateway not ready",connecting:"Connecting to Gateway...",repairReconnect:"Repair & Reconnect",gatewaySettings:"Gateway Settings",firstUseHint:'First time? Make sure Gateway is started, or click "Repair & Reconnect" to auto-repair configuration.',sessionList:"Session List",newChat:"New Chat",chat:"Chat",mainSession:"Main Session",modelLoading:"Loading model...",workspace:"Workspace",placeholder:"Type message, Enter to send, / to open commands",managed:"Managed",thinking:"Thinking",thinkingEnabled:"Thinking enabled",thinkingDisabled:"Thinking disabled",attachment:"Attachment",image:"Image",noSession:"No session selected",createFirst:"Create a new chat to get started.",noSessions:"No sessions yet",deleteSession:"Delete session",deleteConfirmYes:"Delete",deleteConfirmNo:"Cancel",deleteFailed:"Failed to delete session",justNow:"just now",minutesAgo:"{n}m ago",hoursAgo:"{n}h ago",yesterday:"yesterday",daysAgo:"{n}d ago",loadHistory:"Load history",toolRunning:"Running…",toolNoOutput:"(no output)",hermesModel:"Hermes own model",codexModel:"Codex model (set on Codex page)",engineOffline:"Engine gateway not ready"},logs:{gateway:"Gateway Logs",gatewayError:"Gateway Errors",supervisor:"Supervisor",backup:"Backup Logs",audit:"Audit Logs",searchLogs:"Search logs...",autoScroll:"Auto scroll",startingGateway:"Starting OpenClaw gateway..."},models:{addProvider:"Add Provider",presetRelay:"GPT+Claude Recommended Relay",presetVolcengine:"Volcano Engine",presetVolcengineCoding:"Volcano Engine Coding",presetBailian:"Alibaba Cloud Model Studio",presetZhipu:"Zhipu AI",presetOpenAIOfficial:"OpenAI Official",presetAnthropicOfficial:"Anthropic Official",presetOllamaLocal:"Ollama (Local)",providerNamePlaceholder:"e.g. deepseek",revoke:"Revoke",hint:"Providers are the source of models (e.g. OpenAI, DeepSeek). Multiple models can be added under each provider. The ★ primary model is used first, with the rest as fallbacks for auto-switching. Changes are written to the gateway config (openclaw.json) in real time; if the gateway is offline they are saved locally and synced automatically once it connects.",saving:"Saving…",sourceGateway:"Gateway config",sourceLocal:"Local cache (gateway disconnected)",gwDisconnected:"Gateway is not connected — config is read-only",pendingSyncHint:"Saved locally while the gateway is offline — changes sync to the gateway automatically once it connects.",offlineRefreshed:"Gateway offline — refreshed from the local cache.",providerIdLocked:"The provider name is the gateway config key and cannot be changed",retrySave:"Retry save",systemMainBackup:"System Main/Backup Model",configured:"Configured",modelsCount:"models",unconfigured:"Not configured",candidates:"candidates",searchModels:"Search models (filter by ID or name)",noProviders:'No providers yet, click "+ Add Provider" to start configuring.',noModels:"No models added yet, please add in the provider settings.",dialogTitle:"Add Provider",quickSelect:"Quick Select",quickSelectHint:"Select a common provider to auto-fill, or fill in the fields below manually.",providerName:"Provider Name",providerNameHint:"Custom identifier name, used to distinguish different sources.",apiUrl:"API Address",apiUrlHint:"The API address of the model service, usually ending with /v1; Ollama can directly use http://127.0.0.1:11434.",apiKey:"Secret Key (API Key)",apiKeyHint:"The key required to access the service, leave blank if no authentication is needed.",apiType:"API Type",apiTypeHint:'Most relay stations and Ollama can select "OpenAI Compatible".',apiTypeOpenAI:"OpenAI Chat Completions (most common)",apiTypeAnthropic:"Anthropic Messages",apiTypeGoogle:"Google Gemini",apiTypeOllama:"Ollama",modelList:"Models",modelListHint:"The first model is the primary; the rest serve as fallbacks. Separate multiple entries with commas.",modelPlaceholder:"e.g. deepseek-chat",addModel:"Add",commonModels:"Common models",editDialogTitle:"Edit Provider",edit:"Edit",delete:"Delete",deleteProviderTitle:"Delete Provider",deleteProviderConfirm:'Delete provider "{name}" and its {count} model(s)? This cannot be undone.',primary:"Primary",setPrimary:"Set as primary",addModelInline:"Add model, press Enter…",revokeAllTitle:"Revoke All Providers",revokeAllConfirm:"Remove all providers and their API keys? This cannot be undone.",saved:"Saved",noMatch:"No models match your search",systemPrimary:"Primary",systemBackup:"Backup",notSet:"Not set",modelsTotal:"{count} model(s) across {providers} provider(s)",cancel:"Cancel",confirm:"Confirm"},gateway:{servicePort:"Service Port",portNumber:"Port Number",portHint:"The port is set by the gateway start command (--port). Shown here is the actual value reported by the Sidecar.",whoCanAccess:"Who Can Access",localOnly:"Local Only",localOnlyDesc:"Only applications on this computer can access, most secure.",lanShare:"LAN Share",lanShareDesc:"Devices on the same network (phones, tablets) can also access.",securityAuth:"Security Authentication",authMethod:"Authentication Method",tokenAuth:"Token Key",tokenAuthDesc:"Standard authentication, suitable for local and LAN use.",passwordAuth:"Password Auth",passwordAuthDesc:"Required for external exposure scenarios like Tailscale Funnel.",accessToken:"Access Token",show:"Show",hide:"Hide",tokenHint:'After setting, applications must include this token to connect. Highly recommended if "LAN Share" is selected. Leave blank to keep the current token (shown masked).',controlUiTitle:"Control UI Access",allowedOrigins:"Allowed Origins",allowedOriginsHint:"One origin per line (e.g. http://localhost:5173). The Control UI can only connect from these origins.",deviceAuth:"Device Authentication",deviceAuthOn:"Enabled",deviceAuthOff:"Disabled (dangerous)",deviceAuthOffHint:"Device auth is turned off in gateway config (dangerouslyDisableDeviceAuth); allowed origins can connect directly. Not editable here — change openclaw.json directly if needed.",tokenChangeWarning:"Saving will replace the gateway access token. Existing connections will drop and you may need to restart the gateway to reconnect.",tokenChangedNote:"Token updated and saved to local connection credentials. Restart the gateway if the connection drops.",agentToolPermission:"Agent Tool Permissions",toolAccessLevel:"Tool Access Level",fullPermission:"Full Access",fullPermissionDesc:"Agent can use all tools (recommended)",restrictedMode:"Restricted Mode",restrictedModeDesc:"Only safe tools allowed, file/command operations disabled.",disableTools:"Disable Tools",disableToolsDesc:"Agent can only chat, cannot call any tools.",sessionVisibility:"Session Visibility",allSessions:"All Sessions Visible",ownSession:"Current Session Only",sessionVisibilityHint:"Controls whether Agent can see other sessions' context.",advancedOptions:"Advanced Options",tailscaleNetwork:"Tailscale Networking",tailscaleAddr:"Tailscale Address",tailscaleHint:"If you use Tailscale virtual LAN, fill in the address so remote devices can access the Gateway through it. Leave blank if not used.",tailscalePlaceholder:"e.g. 100.x.x.x:18789",saveAndApply:"Save & Apply",saveHint:"After modifying, click save and the Gateway will restart automatically."},tabs:{dashboard:"Dashboard",chat:"Chat",logs:"Logs",skills:"Skills",skills2:"Skills",memory:"Memory",cron:"Cron Jobs",extensions:"Extensions",ai:"AI Assistant",settings:"Panel Settings",models:"Models",agents:"Agent Management",gateway:"Gateway",channels:"Channels",diagnostics:"Diagnostics",browser:"Browser Automation",codex:"Codex CLI",sandbox:"Sandbox"},browser:{subtitle:"Choose which USB built-in Chrome environment to use when AI operates web pages. Will not invoke local Edge or Chrome.",plugin:"Browser Plugin",enabled:"Enabled",currentMode:"Current Mode",fixedBrowser:"Fixed Reuse Browser",cleanBrowser:"Clean Isolated Browser",builtInChrome:"Built-in Chrome",chromeFound:"Found, not started",autoPort:"Automation Port",normal:"Normal",fixedDesc:"Uses the USB built-in Chrome when AI operates web pages, reusing the same browser data directory. Suitable for websites that require login state, cookies, or continuous operation.",fixedTag:"Keep Login",cleanDesc:"Uses a separate isolated browser data directory when AI operates web pages. Suitable for tasks where you do not want to reuse login state and want isolation from the fixed browser.",cleanTag:"Isolated Environment",browserPath:"Browser Path",dataDir:"Data Directory",browserPathLabel:"Browser Path:",autoPortLabel:"Automation Port:",dataDirLabel:"Data Directory:",noLocalLogin:"Will not read login state from local Edge or Chrome.",noSharedCookie:"Does not share cookies, login state, or history with the fixed reuse browser.",detect:"Detect",launchTest:"Launch Test",reapplyRestart:"Reapply & Restart Gateway",switchToThis:"Switch to This Mode",currentConfig:"Current Config",configHint:"The config.browser section of openclaw.json — changes are written back to the gateway config via Save.",running:"Running",stopped:"Stopped",controlTitle:"Browser Control",start:"Start Browser",stop:"Stop Browser",detecting:"Detecting…",starting:"Starting…",stopping:"Stopping…",detected:"Detected",notDetected:"Not found",cdpEndpoint:"CDP Endpoint",currentProfile:"Current Profile",profilesTitle:"Browser Profiles",noProfiles:"No profiles configured yet (browser section is empty).",defaultProfile:"Default",saveConfig:"Save Config",configSaved:"Config saved",configInvalid:"Invalid JSON",statusOffline:"Cannot reach Sidecar or gateway",profilesHint:"From config.browser.profiles in openclaw.json"},channels:{subtitle:"Channel list management for integrations; bind multiple channel routes per Agent on the Agent binding page, with independent configurations and connectivity testing.",channelList:"Channel List",agentBinding:"Agent Binding",availablePlatforms:"Available Platforms",qqBot:"QQ Bot",qqDesc:"Connect via QQ Open Platform, supports private chat and group chat.",dingtalk:"DingTalk",dingtalkDesc:"Connect via DingTalk enterprise internal app, supports single chat and group chat.",feishu:"Feishu",feishuDesc:"Connect via Feishu enterprise self-built app, supports single chat and group chat.",telegram:"Telegram",telegramDesc:"Connect Telegram Bot, supports private chat and groups.",discord:"Discord",discordDesc:"Connect Discord Bot, supports server channels and DMs.",slack:"Slack",slackDesc:"Connect Slack App, supports channels and DMs.",teams:"Microsoft Teams",teamsDesc:"Connect Microsoft Teams Bot.",signal:"Signal",signalDesc:"Connect Signal Messenger.",matrix:"Matrix",matrixDesc:"Connect Matrix protocol (Element and other clients).",supported:"Supported",connectedChannels:"Connected Channels",liveRunning:"Running",liveStopped:"Stopped",accountsLabel:"account(s)",lastError:"Last error",channelConfigNote:"Credentials and accounts are managed in the channels section of openclaw.json, or via the `openclaw channels add` command. Placeholders (REPLACE_WITH_*) need to be replaced with real credentials.",cancel:"Cancel",close:"Close",copy:"Copy",connecting:"Connect",steps:"Steps (click to expand)",appId:"AppID",clientSecret:"ClientSecret",show:"Show",accountId:"Account ID",accountIdPlaceholder:"Leave empty for default; modifying will create a new account",accountIdHint:"Each account corresponds to an independent bot. Different accounts can bind different Agents.",bindAgent:"Bind Agent",bindAgentHint:'Which Agent incoming messages from this account are routed to (add more bindings on the "Agent Binding" page).',manualCmd:"Manual Command",manualCmdDesc:"If the panel auto-install fails, you can copy the command below to the terminal to execute manually.",installHint:"Used to manually install the QQ Bot corresponding plugin.",diagnostics:"Full Connectivity Diagnostics",diagHint:'Check credentials saved to config file, local Gateway port, /__api/health, QQ plugin and chatCompletions. When QQ shows "soul offline", check here first, and refer to <span style="color:var(--danger)">OpenClaw x QQ FAQ</span>.',verify:"Verify Credentials",connectAndSave:"Connect & Save",wechatIntegration:"WeChat Integration",wechatDesc:"Connect personal WeChat via openclaw-weixin plugin",wecom:"WeCom",wecomDesc:"Connect via a WeCom (Enterprise WeChat) self-built app bot",wechatSteps:"Steps",wechatStep1:"This feature is based on the <strong>openclaw-weixin</strong> plugin",wechatStep2:'Click "One-Click Install Plugin" below to auto-install',wechatStep3:'After installation, click "Scan to Login" and scan the QR code with WeChat',wechatStep4:"After successful login, Gateway will automatically take over messages",wechatStep5:"If disconnected, you need to re-scan to login",wechatNote:"Note: Personal WeChat access has risk control risks, it is recommended to use a secondary account",wechatInstalled:"Installed",wechatVersion:"Version",wechatLatest:"USB version has built-in WeChat plugin, you can proceed with subsequent operations. (Up to date)",wechatLoginCmd:"Manual Login Command",wechatLoginCmdDesc:"After plugin installation, you can execute this command in the terminal to continue the login flow.",wechatScanLogin:"Scan to Login",wechatScanDesc:"Scan to login: Start the WeChat login flow, automatically take over messages after scanning",wechatCopied:"Copied",wechatCopiedDesc:"The login command has been copied to the clipboard. Run it in a terminal, then scan the QR code with WeChat to finish login.",operation:"Operation",genericComingSoon:"{name} integration config is under development...",copyCmd:"Copy",removeChannel:"Remove",removeConfirm:"Confirm remove?",removing:"Removing…",removeFailed:"Remove failed: {msg}",qqStep1:"Install the QQ bot plugin (command below)",qqStep2:'Fill in AppID / ClientSecret, click "Generate connect command" and run it',qqStep3:"Restart the gateway, then bind the agent here",diagRunning:"QQ bot plugin is running",diagConfigured:"Configured but not running — restart the gateway to apply",diagNotConfigured:"Not configured yet",noAgents:"No agents (gateway offline)",wxStarting:"Starting WeChat login…",wxQrReady:"Scan the QR code with WeChat on your phone",wxWaitingScan:"QR code ready — waiting for scan…",wxSuccessFull:"Login successful! Credentials saved. Restart the OpenClaw gateway to bring the WeChat channel online.",wxCancelled:"Cancelled",wxErrorPrefix:"WeChat login error:",wxConnFailed:"Cannot reach the login service",wxConnFailedHint:"Cannot reach the login service (make sure the Python gateway is running on :7889)",bindFailed:"Bind failed: ",unbindFailed:"Unbind failed: ",agentBindDesc:'Each Agent can bind multiple routes (e.g. different accounts or match conditions); bindings do not affect each other. Please complete channel access in "Channel List" first.',addChannelBind:"Add Channel Bind",noChannelBound:"No channels bound yet",bindChannelCol:"Channel",bindAccountCol:"Account",bindAgentCol:"Agent",bindAllAccounts:"All accounts (whole channel)",bindAccountLabel:"Account",bindLevelAccount:"Account-level",bindLevelChannel:"Channel-level",showName:"Show"},channelsForm:{appId:"AppID",clientSecret:"ClientSecret",accountIdOpt:"Account ID (optional)",botToken:"Bot Token",slackBotToken:"Bot Token (xoxb-)",slackAppToken:"App Token (xapp-, Socket Mode)",signalNumber:"Registered number",homeserver:"Homeserver URL",accessTokenOpt:"Access Token (optional)",feishuAppId:"App ID",feishuAppSecret:"App Secret",wecomBotId:"Bot ID",wecomSecret:"Secret",corpId:"CorpID",agentId:"AgentId",corpSecret:"CorpSecret",wecomToken:"Callback Token",encodingAESKey:"EncodingAESKey",tenantId:"Tenant ID",msAppId:"App Client ID",msAppPassword:"Client Secret",qqNote:"Obtain from the QQ Open Platform. The command composes the token as appId:clientSecret.",telegramNote:"Create a bot via @BotFather on Telegram to get the Bot Token.",discordNote:"Create an Application + Bot in the Discord Developer Portal to get the Bot Token.",slackNote:"Create a Slack App: a Bot Token (xoxb-) plus an App-Level Token (xapp-, requires Socket Mode enabled).",signalNote:"Register and link the number with signal-cli first (see the signal plugin README); enter the registered number here.",matrixNote:"e.g. https://matrix.org. The Access Token can be obtained from your Matrix client session settings.",feishuNote:"Create a self-built app in the Feishu Open Platform (enable the bot capability) to get App ID / App Secret. Fill them into channels.feishu of openclaw.json after adding the account.",wecomNote:"Bot mode (default WebSocket): create a bot in WeCom to get the Bot ID and Secret — that is all you need. Self-built app (Agent) mode instead needs corpId + corpSecret + agentId (see the wecom plugin README).",msteamsNote:"Register an Azure Bot (Microsoft Teams channel) to get the Tenant ID, Client ID and Client Secret.",fieldsMissing:"Missing required fields: {fields}",fieldsOk:"All fields complete ✓",generateCmd:"Generate connect command",cliHint:"Copy and run it in a terminal yourself — nothing is written to any config here.",configHint:"Copy and merge it into the corresponding place of openclaw.json yourself.",copied:"Copied"},agents:{defaultModel:"Not set",noChannelBound:"No channels bound",noDescription:"No description",editFile:"Edit {file}",agentName:"Agent Name",model:"Model",workspacePath:"Workspace Path",create:"Create",backToList:"← Back to Agent List",defaultAgent:"Default Agent",overview:"Overview",files:"Files",channels:"Channels",tools:"Tools",skills:"Skills",basicInfo:"Basic Info",agentId:"Agent ID",name:"Name",emoji:"Emoji",workspace:"Workspace",modelConfig:"Model Config",mainModel:"Main Model",fallbackModel:"Fallback Model",noFallback:"No fallback model configured (cannot switch when main model is unavailable)",addFallback:"+ Add Fallback",reasoningLevel:"Reasoning Level",low:"Low",medium:"Medium",high:"High",saveConfig:"Save Config",bootstrapFiles:"Bootstrap Files",bootstrapDesc:"Core config files in the Agent workspace, defining Agent behavior, identity and memory",created:"Created",size:"Size",updateTime:"Update Time",edit:"Edit",saveFile:"Save File",channelBinding:"Channel Binding",channelBindingDesc:"Manage message channels bound to this Agent",noChannel:"This Agent has not bound any channels yet",goToChannels:"Go to Channel Config",toolPermissions:"Tool Permissions",toolPermDesc:"Configure base tool profile and additional allow/deny rules for the Agent.",toolTemplate:"Tool Config Template",fullAllow:"Full Allow",safeOnly:"Safe Tools Only",disableAll:"Disable All",explicitAllow:"Explicit Allow",explicitAllowHint:"Comma or newline separated. Set as base allowlist.",appendAllow:"Append Allow",appendAllowHint:"Additional tools allowed on top of the profile.",explicitDeny:"Explicit Deny",explicitDenyHint:"Takes priority over allow/profile.",saveToolConfig:"Save Tool Config",skillsWhitelist:"Skills Whitelist",skillsWhitelistDesc:"Check skills this Agent is allowed to use; leave empty to disable skills whitelist.",saveSkillConfig:"Save Skill Config",pageSubtitle:"Create and manage OpenClaw Agents, configure identity, models and workspace",clickHint:'Click on empty area or "Detail" button to enter the Agent detail page.',fieldLabelName:"Name:",fieldLabelModel:"Model:",fieldLabelWorkspace:"Workspace:",fieldLabelChannels:"Channels:",backup:"Backup",detail:"Detail",default:"Default",namePlaceholder:"e.g.: main, assistant, coder",modelPlaceholder:"e.g.: gpt-4o, claude-sonnet-5",workspacePlaceholder:"Workspace directory path",fileContentPending:"File content to be edited...",fileDescAgents:"Agent rules",fileDescSoul:"Soul/Persona",fileDescTools:"Tool whitelist",fileDescIdentity:"Identity info",fileDescUser:"User context",fileDescHeartbeat:"Heartbeat directive",fileDescBootstrap:"Initialization guide",notSet:"Not set"},sections:{Config:"Config",Extensions:"Extensions",Monitor:"Monitor",Agents:"Agents"},subtitles:{dashboard:"Status and health overview.",chat:"Gateway chat for quick interventions.",logs:"Live gateway log output.",skills:"Skills and capabilities.",skills2:"Capability-first skills page: usable skills, job packs shop, one-click dependency repair.",memory:"Memory files and storage.",cron:"Wakeups and recurring runs.",extensions:"Extensions and themes.",ai:"AI assistant management.",settings:"Panel configuration.",models:"AI model configuration.",agents:"Agent management.",gateway:"Gateway routing.",channels:"Message channels.",diagnostics:"System diagnostics.",browser:"Selenium / Puppeteer / Playwright workflows.",codex:"Codex CLI configuration — workspace, authentication, and approval policy.",sandbox:"Codex sandbox policy and security configuration."},skills:{subtitle:"Manage installed Skills, or search and install new skills from the community.",installed:"Installed",searchInstall:"Search & Install",filterPlaceholder:"Filter Skills...",summary:"Total {total} Skills: {available} available / {missing} missing deps / {disabled} disabled",available:"Available",missingDeps:"Missing deps",disabled:"Disabled",detail:"Detail",uninstall:"Uninstall",noMatch:"No matching Skills",bundled:"bundled",requires:"Requires",notInstalled:"Skill pack not found — run bootstrap-openclaw.bat first to install the OpenClaw runtime.",searchComingSoon:"Search & Install is coming soon...",searchPlaceholder:"Search ClawHub skills, e.g. weather / github / tavily",search:"Search",searchHubTitle:"Search & Install New Skills from ClawHub",comingSoon:"Feature under development, stay tuned",hubDownloads:"downloads",hubInstall:"Install",hubInstalling:"Installing…",hubInstalled:"Installed",hubNoResults:"No matching skills found",hubWarn:"Community skills are user-published and unreviewed — check the skill name and download count before installing.",hubIntro:"ClawHub is OpenClaw's official community skill marketplace. A skill is a set of instructions and scripts for your Agent, ready to use in chat right after install.",hubInstallNoteT:"One-click install",hubInstallNoteD:"Lands in the skills directory — no gateway restart needed, usable immediately",hubSearchTipT:"Search tip",hubSearchTipD:"Most community skills are named in English — English keywords work best",hubNetworkNoteT:"Requires internet",hubNetworkNoteD:"Search and install make online requests; unavailable offline or on restricted networks",hubGatewayRequired:"Gateway not connected — search is unavailable",fromClawhub:"Installed from ClawHub",enableBtn:"Enable",disableBtn:"Disable",toggleFailed:"Operation failed: ",missingHint:"Click to expand · usable once dependencies are installed",preinstalled:"Pre-installed · Free",preinstalledTitle:"Pre-installed general tools (free)",preDownloaded:"Downloaded",preNotDownloaded:"Not downloaded",preDownloadFailed:"Download failed: ",preUninstallFailed:"Uninstall failed: ",jobPacks:"Job Skill Packs",buy:"Buy",purchased:"Purchased",download:"Download",downloading:"Downloading...",installedPacks:"Installed Job Packs",noInstalledPacks:"No job skill packs installed yet. Buy one and download it to get started.",packCount:"{total} job posts, {skills} skills each, shared by all engines",skillList:"Skill list",triggerWords:"Triggers",knowledgeBase:"Knowledge base",categoryLabel:"Category",installedAt:"Installed",buySuccess:'Purchased "{name}"',buyAndDeploySuccess:'Purchased "{name}" and installed to workspace',downloadSuccess:'"{name}" downloaded & installed',uninstallSuccess:'"{name}" uninstalled',mySkills:"My Skills",summary2:"{usable} usable · {repair} need repair · {off} disabled",fromPack:"Job pack",myJobSkills:"My job skills",otherAvailable:"Other available skills",tryIt:"Try it",tryItFallback:"Please help me: ",fixDeps:"Fix deps",fixDepsWorking:"Fixing…",fixDepsFailed:"Failed to fix deps: ",downloadWithDeps:"Download & fix deps",downloadWithDepsWorking:"Working…",hermesNote:"Hermes engine: enabling/disabling takes effect via config hot-reload; newly deployed skills load in a new conversation.",hermesHub:"Skill Market",hermesHubTitle:"Search & install from Hermes Skills Hub",hermesHubIntro:"Hermes Skills Hub aggregates multiple registries (official, GitHub taps, ClawHub, lobehub). Install a skill and it lands in the Hermes skills directory, ready to use.",hermesHubWarn:"Community skills are unaudited third-party content. Hermes runs a built-in security scan before installing — review the skill description before installing.",hermesHubSearchPlaceholder:"Search Hermes Skills Hub, e.g. weather / pdf / excel",hermesHubSrcT:"Multi-source",hermesHubSrcD:"Official registry, GitHub skill repos (NVIDIA/OpenAI…), ClawHub and more; most skills are English-named",hermesHubGuardT:"Security scan",hermesHubGuardD:"Every install is scanned by the built-in guard; blocked skills will not install unless forced",offHint:"Files kept · one click to restore",installToWs:"Install to workspace",installFailed:"Install failed: ",uninstallFailed:"Uninstall failed: ",viewSkill:"View",packLoadFailed:"Failed to load pack: ",buyDemoNote:"Demo mode: purchases are stored locally only. Production will use the license server.",skillsUnit:"skills"},settings:{subtitle:"Manage network, proxy, and download source configurations for OpenClaw U-Disk.",networkProxy:"Network Proxy",proxyHint:"After setting, npm install/upgrade, version detection, GitHub/Gitee update checks, ClawHub Skills and other download operations will go through this proxy. Automatically bypasses localhost and intranet addresses. New requests take effect immediately after saving; if Gateway is running, it is recommended to restart the service.",testConnection:"Test Connection",closeProxy:"Close Proxy",proxyEmpty:"Please enter a proxy address first.",proxyReachable:"Proxy port is reachable ✓",proxyUnreachable:"Cannot reach the proxy address. Check that the proxy software is running.",modelRequestProxy:"Model Request Proxy",modelProxyLabel:"Model testing and model list requests also go through proxy",modelProxyHint:"Please set the network proxy address above before enabling this option.",interfaceLang:"Interface Language",langHint:"Switch interface display language. Some content may still be in Chinese.",autoStart:"Auto Start",autoStartLabel:"Automatically run OpenClaw U-Disk on system startup",autoStartHint:"When enabled, OpenClaw U-Disk will automatically start and check Gateway status on system reboot. This preference is stored locally; system-level auto-start takes effect after the desktop shell is integrated."},diagnostics:{subtitle:"System health check and diagnostics.",startCheck:"Start Check",clickToStart:"Click the shield to start diagnostics.",clickToRetry:"Click to re-check.",allOk:"All OK",checkSummary:"Checked {count} items, all passed.",checkedTotal:"Checked {count} items.",advancedTools:"Advanced Tools",diagConfig:"Diag Config",autoRepair:"Auto Repair",connDiag:"Connection Diag",wsTest:"Test WebSocket",repairPair:"Repair Pair",netLog:"Network Log",checkInstall:"OpenClaw Installation",checkConfig:"Config File",checkToken:"Auth Token",checkDeviceKey:"Device Key",checkVersion:"Version Status",checkConnection:"Connection Check",checkDetailConnection:"All connection checks passed",checking:"Checking…",checkSidecar:"Sidecar Service",checkGatewayProc:"Gateway Process",checkWs:"WebSocket Connection",checkAgents:"Agent RPC",checkHermes:"Hermes Engine",checkAssistant:"AI Assistant",checkLicense:"License Status",checkFingerprint:"Device Fingerprint",checkConfigRead:"Config Read",hasFails:"{count} item(s) failed",hasWarns:"{count} non-critical item(s) degraded",repairing:"Restarting gateway to repair…"},cron:{subtitle:"Scheduled task management",breadcrumb:"AGENT Scheduled Tasks",taskCount:"{total} tasks",errInvalidExpr:'Invalid cron expression: 5–7 space-separated fields required, e.g. "0 7 * * *" (daily at 07:00)',errNameRequired:"Task name is required",runningCount:"{count} running",createTask:"Create Task",gatewayNotRunning:"Gateway is not running, please start it first.",noTasks:'No scheduled tasks yet. Click "Create Task" to wake an AGENT on a schedule.',nextRun:"Next run",taskName:"Task name",cronExpr:"Cron expression",cronExprHint:'5 fields: minute hour day month weekday, e.g. "0 7 * * *" = every day at 07:00, "*/30 * * * *" = every 30 minutes.',taskMessage:"Message for the AGENT",taskMessageHint:"The instruction sent to the AGENT when the task fires (system event).",editTitle:"Edit Task",deleteTitle:"Delete Task",deleteConfirm:'Delete scheduled task "{name}"? This cannot be undone.',schedulerDisabled:"The gateway cron scheduler is disabled — tasks will not fire."},sandbox:{modeTitle:"Sandbox Mode",readOnly:"Read-only",readOnlyDesc:"Codex can only read files; no writes allowed.",workspaceWrite:"Workspace Write",workspaceWriteDesc:"Read/write inside the workspace directory. Recommended for daily use.",dangerFull:"Full Access (dangerous)",dangerFullDesc:"⚠ Unrestricted — can read/write the entire filesystem. Use with care.",approvalTitle:"Approval Policy",untrusted:"Always ask",untrustedDesc:"Every command/file operation requires manual approval.",onRequest:"On request",onRequestDesc:"Approval is requested only when Codex explicitly asks.",never:"Never ask",neverDesc:"Fully automatic — relies on the sandbox for protection.",currentTitle:"Current Config",model:"Model",workspace:"Workspace",apiKey:"API Key",officialApi:"Official OpenAI API",sidecarOffline:"Sidecar is offline — cannot read/write Codex config (check :7889).",loading:"Loading…",saved:"Saved"},extensions:{subtitle:"View Hermes documentation and recent usage statistics.",docs:"Documentation",quickStart:"Quick Start",cronAutomation:"Cron Automation",skills:"Skills",analyticsSnapshot:"Analytics Snapshot",sessions:"Sessions",tokens:"Tokens",cost:"Cost"},dashboard:{subtitle:"OpenClaw runtime status overview.",running:"Running",stopped:"Stopped",opTimeout:"Operation timed out ({action})",opFailed:"Operation failed: {msg}",versionSinicized:"Version · Sinicized",latestUpstream:"Latest upstream",standaloneInstall:"Standalone install",agentFleet:"Agent Fleet",defaultAgent:"Default: main",modelPool:"Model Pool",basedOn:"Based on",channelProviders:"channel providers",basicServices:"Basic Services",survivalRate:"Survival rate",controlUI:"Control UI",openclawNative:"OpenClaw Native Panel",clickToOpen:"Click to open browser",gateway:"GATEWAY",port:"Port",mainModel:"Main Model",notSet:"Not set",concurrencyLimit:"Concurrency limit",mcpTools:"MCP Tools",mountedExtensions:"Mounted extensions",recentBackup:"Recent Backup",noBackup:"No backups yet",backupFiles:"backup files",runtimeVersion:"Runtime Version",localInstall:"local install",wsConnected:"WebSocket Connected",wsDisconnected:"WebSocket Disconnected",restartGw:"Restart Gateway",checkUpdates:"Check Updates",createBackup:"Create Backup",recentLogs:"Recent Logs",licenseCard:"License Status",licenseOk:"Activated",licenseNotActivated:"Not Activated",licenseIssue:"Needs Attention",activeSessions:"Active Sessions",sessionSource:"OpenClaw engine sessions",builtinSkills:"Currently callable skills",defaultAgentLabel:"Default",fromGatewayConfig:"gateway config"},hermesDashboard:{subtitle:"Not configured",stopGateway:"Stop Gateway",startGateway:"Start Gateway",gatewayStatus:"Gateway Status",running:"Running",stopped:"Stopped",listeningPort:"Listening port :8642",currentModel:"Current Model",notConfigured:"Not configured",provider:"Provider —",version:"Version",apiAddress:"API Address",openPanel:"Open Panel",hermesChatPanel:"Hermes Chat Panel",openChat:"Open Chat",modelConfig:"Model Config",pickConfiguredModel:'Pick from models configured on the "Models" page',noConfiguredModel:'No configured models — add a provider and model on the "Models" page first',savedHotReload:"Saved — Hermes hot-reloaded",saveFailed:"Save failed",sidecarOffline:"Cannot connect to Sidecar (:7889)",providerPresets:"Provider presets",fetchModels:"Fetch models",testConn:"Test connection",envAdvanced:".env advanced editor",needBaseUrl:"Enter or pick an API Base URL first",noModels:"Provider returned no models",fetchModelsOk:"Fetched {n} models — click one to pick",fetchModelsFailed:"Failed to fetch models: ",connOk:"Connection OK",connFailed:"Connection failed: ",customUrlLabel:"Custom gateway address",connInvalid:"Invalid address — must start with http(s)://",connSaved:"Saved — Hermes chat will use this address",connLocalRestored:"Switched back to local default (127.0.0.1:8642)",saving:"Saving…",connectionTarget:"Connection Target",detectEnv:"Detect Environment",local:"Local · 127.0.0.1",custom:"Custom",apply:"Apply",quickActions:"Quick Actions",interactiveSession:"Interactive session →",hermesService:"Hermes Service",maintenanceOps:"Maintenance Operations",maintenanceDesc:"Centralized gateway status, connection target, health check and maintenance operations.",openLogs:"Open Logs",traceSearch:"Trace / Search →",advancedEdit:"Advanced Edit",customVars:"Custom variables →",terminalCommands:"Terminal Commands",terminalCmdHint:"Use the following commands to manage Hermes Agent in terminal, click to copy",cmdHeader:"Command",descHeader:"Description",copy:"Copy",cmdChatDesc:"Terminal Chat",cmdChatSub:"Chat with Agent directly in terminal",cmdDoctorDesc:"Diagnostics",cmdDoctorSub:"Check configuration and environment issues",cmdVersionDesc:"View Version",cmdVersionSub:"Show current installed version",cmdGatewayRunDesc:"Start Service",cmdGatewayRunSub:"Start Gateway in terminal foreground",cmdGatewayStopDesc:"Stop Service",cmdGatewayStopSub:"Stop background Gateway process",cmdExplorerDesc:"Open Config Directory",cmdExplorerSub:"View config files in file manager",model:"Model",fetchModelList:"Fetch Model List",testConnectivity:"Test Connectivity",saveConfig:"Save Config",envAdvancedEdit:".env Advanced Edit"},hermesService:{subtitle:"集中查看 Gateway 运行状态、连接目标、健康检查与维护操作。",backToDashboard:"返回仪表盘",startGateway:"Start Gateway",installStatus:"Install Status",installed:"Installed",installMethod:"Install Method",gatewayStatus:"Gateway Status",stopped:"Stopped",currentModel:"Current Model",notConfigured:"Not Configured",unknown:"Unknown",connectionTarget:"Connection Target",local:"Local",version:"Version",cliPath:"CLI Path",homeDir:"Home Directory",keyConfigFiles:"Key Config Files",llmProvider:"LLM Provider",model:"Model",customApiAddr:"Custom API Address (optional)",notSet:"Not Set",openConfig:"Open Config",openEnv:"Open Environment Variables",localTarget:"Local",customTarget:"Custom",apply:"Apply",detectEnv:"Detect Environment",healthCheck:"Health Check",healthCheckMsg:"Gateway is not running or temporarily unable to return health data.",customGatewayUrl:"Custom Gateway URL",customDesc:"Connect to an existing Hermes Agent Gateway instance, suitable for scenarios where it is already installed on another machine or manually installed.",maintenanceOps:"Maintenance Operations",upgradeHermes:"Upgrade Hermes",uninstallHermes:"Uninstall Hermes",uninstallClean:"Uninstall & Clean Config",openLogs:"Open Logs",running:"Running",stopGateway:"Stop Gateway",restartGateway:"Restart Gateway",notInstalled:"Not Installed",needBootstrap:"Run bootstrap-portable.bat first",recheck:"Re-check",healthy:"Healthy",pid:"PID",portablePython:"Portable Python",keyOk:"Key ✓",keyNone:"Key —",operating:"Working…",platform:"Platform"},hermesConfig:{title:"Hermes Config",path:"~/.hermes/config.yaml",rawEditorHint:"raw yaml editor · saved changes hot-reload",backToService:"Back to Service",reload:"Reload",saveConfig:"Save Config"},hermesEnv:{title:"ENV 编辑",backToDashboard:"返回仪表盘",subtitle:"自定义环境变量 · ~/.hermes/.env",customEnvFile:"custom.env",keyPlaceholder:"KEY",valuePlaceholder:"值",remove:"删除",notice:'Model / provider keys are managed in the dashboard "Model Config" (written to config.yaml). This page manages the',noticeCustom:"custom environment variables Hermes reads (e.g. TAVILY_API_KEY, HTTP_PROXY). Takes effect on next gateway restart.",noVars:"no custom variables yet",clickAdd:'click "add variable" below to create one',addVar:"Add Variable",changesHint:"changes take effect on next gateway restart"},engine:"Engine",main_model:"Main Model",mcp_tools:"MCP Tools",recent_backup:"Recent Backup",agent_fleet:"Agent Fleet",runtime:"Runtime",re_gw:"Restart Gateway",check_up:"Check Updates",create_bp:"Create Backup",hermesMemory:{title:"Agent Memory",path:"~/.hermes/memories/",files:"files",savedNote:"Saved — takes effect in new Hermes sessions",heroTitle:"Three Markdown files compose the Agent's long-term context",heroDesc:"Notes record facts, user profile captures preferences, soul file shapes personality. Hermes continuously reads these long-term memories during conversations.",memoryFiles:"Memory Files",filled:"Filled",totalWords:"Total Words",lastUpdated:"Last Updated",memory:"Memory",memoryLabel:"MEMORY",memoryDesc:"Agent's notes and fact memoranda — knowledge accumulated across conversations.",memoryPlaceholder:"No content yet",memoryPlaceholderDesc:"Agent's notes and fact memoranda — knowledge accumulated across conversations.",user:"User Profile",userLabel:"USER",userDesc:"User preferences, identity, background info — referenced in every conversation.",userPlaceholder:"No content yet",userPlaceholderDesc:"User preferences, identity, background info — referenced in every conversation.",soul:"Soul File",soulLabel:"SOUL",soulDesc:"Agent's personality, values, speaking style — shaped over the long term.",soulPlaceholder:"No content yet",soulPlaceholderDesc:"Agent's personality, values, speaking style — shaped over the long term.",words:"words",chars:"chars",edit:"Edit",refresh:"Refresh"},hermesLogs:{title:"Agent Logs",path:"~/.hermes/logs/ · agent.log",noLogFiles:"(no log files)",noContent:"(no content)",backToDashboard:"Back to Dashboard",tail:"Tail",download:"Download",refresh:"Refresh",logFiles:"Log Files",level:"Level",lines:"Lines",search:"Search",searchPlaceholder:"Search logs...",clear:"Clear",records:"records"},ai:{notConfigured:"Not configured",convList:"Conversation List",newConv:"New Conversation",searchConv:"Search conversations...",newChat:"New Chat",greeting:"Hello! I'm your AI assistant. How can I help you?",builtInBadge:"Built-in AI",builtInDesc:'This is the built-in AI Assistant, independent of the OpenClaw gateway. It uses the model you pick in "Settings" (configured on the "Models" page) and can run local commands. To chat with an OpenClaw Agent, go to the "Real-time Chat" page.',checkConfig:"Check Config",checkConfigDesc:"Check if OpenClaw config file is correct",diagGateway:"Diagnose Gateway",diagGatewayDesc:"Diagnose Gateway running status",browseDir:"Browse Directory",browseDirDesc:"Browse OpenClaw config directory structure",checkEnv:"Check Environment",checkEnvDesc:"Check if system environment meets requirements",analyzeLogs:"Analyze Logs",analyzeLogsDesc:"Analyze recent logs to find issues",oneClickFix:"One-Click Fix",oneClickFixDesc:"Auto-detect and fix common issues",feedbackBug:"Report Bug",feedbackBugDesc:"Organize into standard GitHub Issue",prAssistant:"PR Assistant",prAssistantDesc:"Walk you through the PR process",skillsMgmt:"Skills Management",skillsMgmtDesc:"Manage OpenClaw Skills",startChat:"Start a conversation",placeholder:"Describe your question, paste logs, screenshots or error messages...",hint:"Enter to send · Shift+Enter for newline · Supports paste/drag images · AI Assistant is independent of OpenClaw",settingsTitle:"AI Assistant — Settings",settings:"Settings",apiConfig:"API Config",tools:"Tools",persona:"Persona",knowledgeBase:"Knowledge Base",quickSelect:"Quick Select",quickSelectHint:"Select a common provider to auto-fill, or fill in the fields below manually.",apiBaseUrl:"API Base URL",apiType:"API Type",apiKey:"API Key",apiKeyPlaceholder:"sk-... or relay station key",testConn:"Test Connection",getList:"Get List",importConfig:"Import OpenClaw Config",model:"Model",temperature:"Temperature",compatHint:"Compatible with OpenAI API (most relay stations, Ollama, etc.)",backupGroup:"Backup Model Group",enabled:"enabled",disabledCount:"disabled",enableTools:"Select tool categories to enable",terminalCmd:"Terminal Command",terminalCmdDesc:"Execute system commands",fileOps:"File Operations",fileOpsDesc:"Read and write files and directories",webSearch:"Web Search",webSearchDesc:"Search web pages for information",autoExecRounds:"Auto-execution Rounds",autoExecRoundsHint:"Auto-execution rounds before asking",alwaysAvail:"Always available",personaSource:"Persona Source",default:"Default",openclawAgent:"OpenClaw Agent",openclawAgentHint:"Inherit identity and workspace settings from OpenClaw Agent",assistantName:"Assistant Name",assistantPersona:"Assistant Persona",personaHint:"Describe the assistant's personality traits",kbCustom:"Custom knowledge base. AI will reference this content when answering.",kbAdd:"+ Add",kbEmpty:"No knowledge base entries yet",cancel:"Cancel",save:"Save",saved:"Saved",justNow:"Just now",aiDefault:"Default",everyTimeAsk:"ask every time",attachTitle:"Paste logs or screenshots",assistantPersonaDesc:"Professional, friendly, helpful",selectModel:"Select Model",selectModelHint:'Pick a model already configured on the "Models" page. The assistant will use its API.',noModels:"No model available",noModelsHint:'Add a provider and model on the "Models" page first, then come back to select one.',goToModels:"Go to Models",primaryTag:"Primary",assistantStatus:"Assistant service",statusReady:"Ready",statusOffline:"Offline",statusKeyMissing:"No model selected",thinking:"Thinking…",cmdRunning:"Running…",cmdNoOutput:"(no output)",assistantOfflineHint:"Assistant service is offline. Make sure the ai-assistant service is running on :8080.",msgCount:"msgs"},init:{title:"OpenClaw Portable",frontendReady:"Frontend modules ready",licenseValidOffline:"License valid (offline day {days}, {remain} days of grace left)",licenseValid:"License valid",licenseStatusPrefix:"License status: ",submitCodeLog:"Submitting code {code}*** → /api/license/activate",sidecar:"Sidecar · service bridge",engineOpenclaw:"Engine · openclaw",engineHermes:"Engine · hermes",license:"License · activation check",preparingWorkspace:"Preparing workspace...",ready:"READY",portableReady:"Portable environment is ready",files:"files",launchMultiEngine:"Launch · Multi-engine",usbPortable:"USB Portable",checkStart:"Running environment checks…",checkFailed:"not running",sidecarUnreachable:"Cannot reach the license service (Sidecar :7889) — run start-all.bat first, then retry.",entering:"All checks passed. Entering…",retry:"Retry",enterAnyway:"Enter anyway",licenseNotActivated:"Not activated yet. Enter your activation code to continue.",licenseBlockedOffline:"Offline for more than 3 days. Validate online to continue.",licenseDeviceChanged:"Hardware change detected. Reactivate or validate online.",licenseRevoked:"License has been revoked. Please contact support.",licenseError:"License check failed.",codePlaceholder:"Activation code, e.g. B-XXXXXX",activate:"Activate",revalidate:"Validate online",activating:"Activating…",rechecking:"Checking…",device:"Device",offlineUsed:"Days offline: ",offlineLeft:"Grace days left: "}},Ls={brand:{eyebrow:"控制台",title:"OpenClaw U盘版"},common:{health:"健康状况",ok:"正常",online:"在线",offline:"离线",connect:"连接",refresh:"刷新",enabled:"已启用",disabled:"已禁用",show:"显示",hide:"隐藏",na:"不适用",version:"版本",docs:"文档",search:"搜索",darkMode:"深色模式",lightMode:"浅色模式",systemMode:"跟随系统",uptime:"运行时间",connectedClients:"已连接客户端",activeSessions:"活动会话",scheduled:"已调度",gatewaySnapshot:"网关快照",recentSessions:"最近会话",quickActions:"快捷操作",newSession:"新建会话",automation:"自动化",status:"状态",instances:"实例",send:"发送",config:"配置",appearance:"外观",debug:"调试",connectHint:"连接以开始聊天。",stable:"稳定版",stop:"停止",restart:"重启",start:"启动",save:"保存",applyRestart:"应用并重启",msgCountShort:"条",loading:"加载中…",enable:"启用",disable:"停用",configSaved:"配置已保存",configSaveFailed:"保存失败：",configInvalidJson:"JSON 格式无效，请检查后再保存",configReloaded:"已从网关重新加载最新配置",downloadStarted:"已开始下载配置快照",edit:"编辑",delete:"删除",runNow:"立即运行",setup:"设置",clear:"清除",lines:"行",newAgent:"新建 Agent",searchAgents:"搜索 Agent...",sessionKey:"会话 Key",agent:"Agent",created:"创建时间",messages:"消息数",name:"名称",id:"ID",model:"模型",theme:"主题",modeLabel:"模式",system:"系统",dark:"深色",light:"浅色",eventLog:"事件日志",noEvents:"暂无事件记录。",totalTokens:"总 Token 数",totalCost:"总费用",dailyUsage:"每日用量",selectRange:"选择日期范围查看用量。",descExtensions:"浏览和管理已安装的扩展与主题。",descMemory:"浏览和管理持久化记忆文件。",descGateway:"网关路由与连接管理。",descServices:"监控和管理后端服务。",descModels:"配置 AI 模型提供商与默认模型。",descSecurity:"管理 API Key、ACL 与沙箱策略。",descDiagnostics:"运行系统健康检查与诊断。",install:"安装",uninstall:"卸载",installed:"已安装",pid:"PID",port:"端口",bind:"绑定地址",routeRules:"路由规则",addRoute:"添加路由",wsEndpoint:"WebSocket 端点",connectedClientsTable:"已连接客户端",services:"服务",cpuUsage:"CPU 使用率",memUsage:"内存使用",provider:"提供商",apiKey:"API Key",defaultModel:"默认模型",modelList:"模型列表",addModel:"添加模型",aclRules:"ACL 规则",sandboxPolicy:"沙箱策略",auditLog:"审计日志",keyName:"Key 名称",addKey:"添加 Key",healthCheck:"健康检查",runCheck:"运行检查",resourceUsage:"资源使用",connectivityTest:"连通性测试",repairTools:"修复工具",repair:"修复",browserSession:"浏览器会话",playwrightConfig:"Playwright 配置",cdpPort:"CDP 端口",takeScreenshot:"截图",browserLogs:"浏览器日志",memoryFiles:"记忆文件",createMemory:"创建记忆",searchMemory:"搜索记忆...",memDeleteConfirm:"删除记忆文件「{name}」？此操作不可恢复。",memLoadFailed:"记忆加载失败：",memSaveFailed:"保存失败：",filterType:"按类型筛选",wordCount:"字数",typeUser:"用户",typeNote:"笔记",typeSoul:"灵魂",configuration:"配置",workspaceDir:"工作区目录",baseUrl:"API 地址 (Base URL)",baseUrlHint:"留空使用 OpenAI 官方接口；接入三方时填写完整 Base URL。注意：Codex 0.145+ 已移除 Chat Completions 协议，自定义 provider 只走 Responses API——三方若只支持 Chat Completions，需指向可转换协议的中转地址。",sandboxMode:"沙箱模式",sandboxLandlock:"Landlock (Linux)",sandboxSeatbelt:"Seatbelt (macOS)",sandboxDocker:"Docker",sandboxNone:"禁用 (不安全)",approvalPolicy:"审批策略",approvalUntrusted:"Untrusted — 大多数操作前都要确认",approvalOnFailure:"On Failure — 仅在命令执行失败时确认",approvalOnRequest:"On Request — 仅在模型主动请求时确认",approvalNever:"Never — 全部自动批准",codexConfigHint:"Codex 是命令行工具而非常驻服务——按需运行、任务完成即退出。配置经 Sidecar 写入 runtime/codex-home/config.toml（配置）与 auth.json（API Key）；实时聊天每轮拉起 codex exec --json 子进程。",codexNotInstalled:"Codex CLI 未安装",codexNotInstalledDesc:"请在项目根目录运行一次性引导，安装便携 Codex 二进制与参考源码：",codexNoKey:"未配置 OPENAI_API_KEY",codexHasKey:"API Key 已配置",cliArgs:"CLI 参数",resetDefaults:"恢复默认",copy:"复制",copied:"已复制！",hash:"哈希",workspace:"工作区",modelLoading:"加载模型中...",noModelOption:"请先配置模型",noModelConfigured:"尚未配置模型，请先到「模型配置」页添加服务商和模型。",useRealtimeChat:"你正在使用「实时聊天」",realtimeChatDesc:"此页面通过 Gateway 连接 OpenClaw 的 AI Agent，对话由你部署的 OpenClaw 服务处理。",aiAssistantTip:"如需使用 OpenClaw U盘版 内置 AI 助手（独立于 OpenClaw），请前往左侧菜单「AI 助手」页面。",gatewayNotReady:"Gateway 连接未就绪",connecting:"正在连接 Gateway...",repairReconnect:"修复并重连",gatewaySettings:"Gateway 设置",firstUseHint:"首次使用？请确保 Gateway 已启动，或点击「修复并重连」自动修复配置。",serviceMgmt:"服务管理",sessionList:"会话列表",newChat:"新建聊天",placeholder:"输入消息，Enter 发送，/ 打开指令",managed:"托管",thinking:"思考",thinkingEnabled:"思考已启用",thinkingDisabled:"思考已禁用",attachment:"附件",image:"图片",noSession:"未选择会话",createFirst:"新建聊天以开始。",mainSession:"主会话",dismiss:"关闭",cancel:"取消",confirm:"确认",requestFailed:"请求失败",aiServiceError:"AI 助手服务错误（{status}）",hermesError:"Hermes 错误（{status}）",codexError:"Codex 错误（{status}）",hermesErrorPlain:"Hermes 错误",codexErrorPlain:"Codex 错误",currentVersion:"当前版本",sinicizedOptimized:"汉化优化版",noRecommendedStable:"未获取到推荐稳定版",latestUpstream:"最新上游",versionNote:"默认只建议当前面板已验证的推荐稳定版。如需尝试其它版本或最新特性，请到「关于」页手动切换版本并自行验证兼容性；若希望面板优先适配最新版，欢迎提交 issue。",gatewayService:"OpenClaw Gateway",pidLabel:"PID",dockerMgmt:"Docker 管理",dockerDesc:"管理当前 Web 后端可访问的 Docker 节点与 OpenClaw 容器。适合本机 socket，也支持填写远程 Docker API 节点。",dockerUnavailable:"当前环境没有可用的 Web 后端，Docker 管理暂不可用。现阶段桌面版打包形态还未接入 Rust docker_* 命令；如需现在使用，请运行 Web/serve 模式。",configEdit:"配置文件编辑",configEditDesc:"直接编辑 openclaw.json 主配置文件。保存前会自动创建备份，修改后可能需要重启 Gateway 生效。",saveRestart:"保存并重启",saveOnly:"仅保存",reload:"重新加载",loaded:"已加载",configFile:"",configValidation:"配置校准",configValidationDesc:"用于修复损坏、截断或不安全的 openclaw.json。会先创建修复前备份，再按所选模式校准核心配置。",inheritCalibration:"继承校准",fullInitRepair:"完全初始化修复",inheritDesc:"保留现有模型、渠道、Agent、绑定、认证档案等业务配置，只修复 Gateway、工具配置和必要默认项。",fullInitDesc:"重建一份安全的基线配置，再择优继承模型、渠道、Agent、绑定、认证档案等关键业务配置。适合配置严重损坏时使用。",configBackup:"配置备份",configBackupDesc:"备份范围：openclaw.json 主配置文件（含模型、Provider、Gateway 设置）。Agent 数据和记忆文件不在此备份范围内。",createBackup:"创建备份",noBackups:"暂无备份"},chat:{noModelOption:"请先配置模型",tools:"工具",wsTitle:"工作区文件",wsMainSession:"主会话",wsCoreFiles:"核心文件",wsBrowse:"工作区浏览",wsSelectFile:"选择一个工作区文件…",wsReady:"当前 Agent 工作区已就绪，可从左侧选择文件",wsReload:"重新加载",wsPreview:"预览",wsAdd:"添加",wsUnsaved:"有未保存的修改，确定放弃吗？",wsDraftRestored:"已恢复未保存的草稿",scTitle:"快捷键",scSession:"会话",scModel:"模型",scThink:"思考模式",scNew:"新建会话",scReset:"重置当前会话",scStop:"停止生成",scModelSwitch:"切换模型（输入模型名）",scModelList:"查看可用模型",scModelStatus:"当前模型状态",scThinkOff:"关闭思考",scThinkLow:"低强度思考",scThinkMed:"中等强度思考",scThinkHigh:"高强度思考",imgGenMode:"图片生成模式",imgGenPlaceholder:"输入图片描述，生成图片",imgUnsupported:"当前引擎不支持图片附件，图片未发送（切到 OpenClaw 引擎可发图）。",imgTooLarge:"图片「{name}」超过 10MB，未附加。",useRealtimeChat:"你正在使用「实时聊天」",realtimeChatDesc:"此页面通过 Gateway 连接 OpenClaw 的 AI Agent，对话由你部署的 OpenClaw 服务处理。",aiAssistantTip:"如需使用 OpenClaw U盘版 内置 AI 助手（独立于 OpenClaw），请前往左侧菜单「AI 助手」页面。",gatewayNotReady:"Gateway 连接未就绪",connecting:"正在连接 Gateway...",repairReconnect:"修复并重连",gatewaySettings:"Gateway 设置",firstUseHint:"首次使用？请确保 Gateway 已启动，或点击「修复并重连」自动修复配置。",sessionList:"会话列表",newChat:"新建聊天",chat:"聊天",mainSession:"主会话",modelLoading:"加载模型中...",workspace:"工作区",placeholder:"输入消息，Enter 发送，/ 打开指令",managed:"托管",thinking:"思考",thinkingEnabled:"思考已启用",thinkingDisabled:"思考已禁用",attachment:"附件",image:"图片",noSession:"未选择会话",createFirst:"新建聊天以开始。",noSessions:"暂无会话",deleteSession:"删除会话",deleteConfirmYes:"删除",deleteConfirmNo:"取消",deleteFailed:"删除会话失败",justNow:"刚刚",minutesAgo:"{n} 分钟前",hoursAgo:"{n} 小时前",yesterday:"昨天",daysAgo:"{n} 天前",loadHistory:"加载历史",toolRunning:"执行中…",toolNoOutput:"（无输出）",hermesModel:"Hermes 自有模型",codexModel:"Codex 模型（在 Codex 页配置）",engineOffline:"引擎网关未就绪"},logs:{gateway:"Gateway 日志",gatewayError:"Gateway 错误",supervisor:"守护进程",backup:"备份日志",audit:"审计日志",searchLogs:"搜索日志...",autoScroll:"自动滚动",startingGateway:"启动 OpenClaw gateway..."},models:{addProvider:"添加服务商",presetRelay:"GPT+Claude推荐中转",presetVolcengine:"火山引擎",presetVolcengineCoding:"火山引擎 Coding",presetBailian:"阿里云百炼",presetZhipu:"智谱 AI",presetOpenAIOfficial:"OpenAI 官方",presetAnthropicOfficial:"Anthropic 官方",presetOllamaLocal:"Ollama（本地）",providerNamePlaceholder:"如 deepseek",revoke:"撤销",hint:"服务商是模型的来源（如 OpenAI、DeepSeek 等）。每个服务商下可添加多个模型，标记 ★ 的「主模型」优先使用，其余作为备选自动切换。配置实时写入网关配置（openclaw.json）；网关未启动时先保存到本地，网关连上后自动同步，无需等网关先启动。",saving:"保存中…",sourceGateway:"网关配置",sourceLocal:"本地缓存（网关未连接）",gwDisconnected:"网关未连接，配置只读",pendingSyncHint:"网关未连接，改动已保存到本地，网关连上后将自动同步。",offlineRefreshed:"网关未连接，已从本地缓存刷新。",providerIdLocked:"服务商名称即网关侧配置键，不可修改",retrySave:"重试保存",systemMainBackup:"系统主/备模型",configured:"已配置",modelsCount:"个模型",unconfigured:"未配置",candidates:"个备选",searchModels:"搜索模型（按 ID 或名称过滤）",noProviders:"暂无服务商，点击「+ 添加服务商」开始配置",noModels:"暂未添加模型，请在服务商设置中添加。",dialogTitle:"添加服务商",quickSelect:"快捷选择",quickSelectHint:"选择常用服务商自动填充，或手动填写下方信息",providerName:"服务商名称",providerNameHint:"自定义标识名，用于区分不同来源",apiUrl:"接口地址",apiUrlHint:"模型服务的 API 地址，通常以 /v1 结尾；Ollama 可直接填 http://127.0.0.1:11434",apiKey:"密钥 (API Key)",apiKeyHint:"访问服务所需的密钥，留空表示无需认证",apiType:"接口类型",apiTypeHint:"大多数中转站和 Ollama 选「OpenAI 兼容」即可",apiTypeOpenAI:"OpenAI Chat Completions (最常用)",apiTypeAnthropic:"Anthropic Messages",apiTypeGoogle:"Google Gemini",apiTypeOllama:"Ollama",modelList:"模型列表",modelListHint:"第一个模型为主模型，其余作为备选自动切换；多个模型可用逗号分隔一次添加",modelPlaceholder:"如 deepseek-chat",addModel:"添加",commonModels:"常用模型",editDialogTitle:"编辑服务商",edit:"编辑",delete:"删除",deleteProviderTitle:"删除服务商",deleteProviderConfirm:"确定删除服务商「{name}」及其 {count} 个模型？此操作不可撤销。",primary:"主模型",setPrimary:"设为主模型",addModelInline:"添加模型，回车确认…",revokeAllTitle:"撤销全部服务商",revokeAllConfirm:"确定移除所有服务商及其 API Key？此操作不可撤销。",saved:"已保存",noMatch:"没有匹配的模型",systemPrimary:"主模型",systemBackup:"备选",notSet:"未设置",modelsTotal:"{providers} 个服务商共 {count} 个模型",cancel:"取消",confirm:"确认"},gateway:{servicePort:"服务端口",portNumber:"端口号",portHint:"端口由网关启动命令（--port）决定，这里显示 Sidecar 报告的实际监听值",whoCanAccess:"谁能访问",localOnly:"仅本机使用",localOnlyDesc:"只有这台电脑上的应用能访问，最安全",lanShare:"局域网共享",lanShareDesc:"同一网络下的手机、平板等设备也能用",securityAuth:"安全认证",authMethod:"认证方式",tokenAuth:"Token 密钥",tokenAuthDesc:"标准认证方式，适合本地和局域网使用",passwordAuth:"密码认证",passwordAuthDesc:"Tailscale Funnel 等外网暴露场景必须使用此模式",accessToken:"访问密钥 (Token)",show:"显示",hide:"隐藏",tokenHint:"设置后，应用调用时需要带上这个密钥才能通过。如果选了「局域网共享」，强烈建议设置。留空表示不修改当前令牌（显示为掩码）。",controlUiTitle:"Control UI 访问",allowedOrigins:"允许的来源",allowedOriginsHint:"每行一个来源（如 http://localhost:5173）。Control UI 只能从这些来源连接网关。",deviceAuth:"设备认证",deviceAuthOn:"已开启",deviceAuthOff:"已关闭（危险）",deviceAuthOffHint:"网关配置中已禁用设备认证（dangerouslyDisableDeviceAuth），允许列表内的来源可直接连接。此项不可在本页修改，如需调整请改 openclaw.json。",tokenChangeWarning:"保存将更换网关访问令牌，现有连接会断开，可能需要重启网关后才能用新令牌重连。",tokenChangedNote:"令牌已更新并写入本地连接凭证，若连接断开请重启网关。",agentToolPermission:"Agent 工具权限",toolAccessLevel:"工具调用权限",fullPermission:"完整权限",fullPermissionDesc:"Agent 可使用所有工具（推荐）",restrictedMode:"受限模式",restrictedModeDesc:"仅允许安全工具，禁用文件/命令操作",disableTools:"禁用工具",disableToolsDesc:"Agent 只能对话，不能调用任何工具",sessionVisibility:"会话可见性",allSessions:"所有会话可见",ownSession:"仅当前会话可见",sessionVisibilityHint:"控制 Agent 是否能查看其他会话的上下文",advancedOptions:"高级选项",tailscaleNetwork:"Tailscale 组网",tailscaleAddr:"Tailscale 地址",tailscaleHint:"如果你用 Tailscale 虚拟局域网，填上地址后远程设备就能通过它访问 Gateway。不用可以留空",tailscalePlaceholder:"例如 100.x.x.x:18789",saveAndApply:"保存并生效",saveHint:"修改后点击保存，Gateway 会自动重启"},tabs:{dashboard:"仪表盘",chat:"实时聊天",logs:"日志查看",skills:"技能",skills2:"技能",memory:"记忆文件",cron:"定时任务",extensions:"扩展与主题",ai:"AI助手",settings:"面板设置",models:"模型配置",agents:"Agent管理",gateway:"Gateway",channels:"消息渠道",diagnostics:"检测与修复",browser:"浏览器自动化",codex:"Codex CLI",sandbox:"沙箱配置"},sections:{Config:"配置",Monitor:"监控",Extensions:"扩展",Agents:"Agent"},subtitles:{dashboard:"Openclaw运行状态概览",chat:"网关实时聊天。",logs:"查看 OpenClaw 各服务日志",skills:"管理已安装的 Skills，或从社区搜索安装新技能",skills2:"以「能干的活」为主线：可用技能、岗位包商店、缺依赖一键修复",memory:"记忆文件与存储。",cron:"唤醒与重复运行任务。",extensions:"扩展与主题市场。",settings:"管理 OpenClaw U盘版 的网络、代理和下载源配置",models:"添加 AI 模型服务商，配置可用模型",agents:"Agent 管理。",gateway:"网关路由配置。",channels:"渠道列表管理接入；在 Agent 对接页为每个 Agent 绑定多条渠道路由，配置相互独立，并支持渠道连通性测试",diagnostics:"系统健康检查与问题诊断",browser:"选择 AI 操作网页时使用哪一种 U 盘内置 Chrome 环境。不会调用本机 Edge 或本机 Chrome。",codex:"Codex CLI 配置——工作区、认证与审批策略。",sandbox:"Codex 沙箱安全策略配置。"},browser:{subtitle:"选择 AI 操作网页时使用哪一种 U 盘内置 Chrome 环境。不会调用本机 Edge 或本机 Chrome。",plugin:"浏览器插件",enabled:"已启用",currentMode:"当前模式",fixedBrowser:"固定复用浏览器",cleanBrowser:"干净独立浏览器",builtInChrome:"内置 Chrome",chromeFound:"已找到，未启动",autoPort:"自动化端口",normal:"正常",fixedDesc:"AI 操作网页时使用 U 盘内置 Chrome，并复用同一个浏览器数据目录。适合需要登录状态、Cookie 或连续操作的网站。",fixedTag:"保留登录",cleanDesc:"AI 操作网页时使用另一份独立浏览器数据目录。适合不想复用登录状态、希望和固定浏览器隔离开的任务。",cleanTag:"独立环境",browserPath:"浏览器路径",dataDir:"数据目录",browserPathLabel:"浏览器路径：",autoPortLabel:"自动化端口：",dataDirLabel:"数据目录：",noLocalLogin:"不会读取本机 Edge 或 Chrome 的登录状态。",noSharedCookie:"和固定复用浏览器互不共享 Cookie、登录状态和历史纪录。",detect:"检测",launchTest:"启动测试",reapplyRestart:"重新应用并重启 Gateway",switchToThis:"切换到这个模式",currentConfig:"当前配置",configHint:"openclaw.json 的 browser 配置段——修改后点保存写回网关配置。",running:"运行中",stopped:"已停止",controlTitle:"浏览器控制",start:"启动浏览器",stop:"停止浏览器",detecting:"检测中…",starting:"启动中…",stopping:"停止中…",detected:"已检测到",notDetected:"未找到",cdpEndpoint:"CDP 端点",currentProfile:"当前配置",profilesTitle:"浏览器配置（Profiles）",noProfiles:"尚未配置 profiles（browser 段为空）",defaultProfile:"默认",saveConfig:"保存配置",configSaved:"配置已保存",configInvalid:"JSON 格式无效",statusOffline:"Sidecar 离线或网关不可达",profilesHint:"来自 openclaw.json 的 config.browser.profiles"},channels:{subtitle:"渠道列表管理接入；在 Agent 对接页为每个 Agent 绑定多条渠道路由，配置相互独立，并支持渠道连通性测试",channelList:"渠道列表",agentBinding:"Agent 对接",availablePlatforms:"可接入平台",qqBot:"QQ 机器人",qqDesc:"通过 QQ 开放平台接入，支持私聊和群聊",qqAppId:"AppID",qqClientSecret:"ClientSecret",qqAccountId:"账号标识",qqAccountIdHint:"留空为默认账号；修改会创建新账号",qqAccountIdDesc:"每个账号对应一个独立机器人。不同账号可绑定不同 Agent。",qqBindAgent:"绑定 Agent",qqBindAgentHint:"该账号收到的消息路由到哪个 Agent（可在「Agent 对接」页添加更多绑定）。",qqManualCmd:"手动命令",qqManualCmdDesc:"如果面板自动安装失败，可以复制下面的命令到终端手动执行。",qqInstallHint:"用于手动安装 QQ 机器人 对应插件。",qqDiagnostics:"完整联通诊断",qqDiagHint:'检查已保存到配置文件的凭证、本机 Gateway 端口、/__api/health、QQ 插件与 chatCompletions。QQ 提示「灵魂不在线」时优先看此处，并参考 <span style="color:var(--danger)">OpenClaw × QQ 常见问题</span>。',qqVerify:"校验凭证",qqConnect:"接入并保存",wechatIntegration:"微信 接入",wechatDesc:"通过 openclaw-weixin 插件接入个人微信",wecom:"企业微信",wecomDesc:"通过企业微信自建应用机器人与 AGENT 对话",wechatSteps:"接入步骤",wechatStep1:"本功能基于 <strong>openclaw-weixin</strong> 插件",wechatStep2:"点击下方「一键安装插件」自动安装",wechatStep3:"安装完成后点击「扫码登录」，用手机微信扫描二维码",wechatStep4:"登录成功后 Gateway 会自动接管消息",wechatStep5:"若掉线需重新扫码登录",wechatNote:"注意：个人微信接入存在风控风险，建议使用小号",wechatInstalled:"已安装",wechatVersion:"版本",wechatLatest:"U盘版已内置 微信 插件，可直接执行后续操作。（已是最新）",wechatLoginCmd:"手动登录命令",wechatLoginCmdDesc:"插件安装完成后，可在终端执行此命令继续登录流程。",wechatScanLogin:"扫码登录",wechatScanDesc:"扫码登录：启动微信登录流程，扫码后自动接管消息",wechatCopied:"已复制",wechatCopiedDesc:"登录命令已复制到剪贴板，请在终端中运行该命令，出现二维码后用微信扫码完成登录。",dingtalk:"钉钉",dingtalkDesc:"通过钉钉企业内部应用接入，支持单聊和群聊",feishu:"飞书",feishuDesc:"通过飞书企业自建应用接入，支持单聊和群聊",telegram:"Telegram",telegramDesc:"接入 Telegram Bot，支持私聊和群组",discord:"Discord",discordDesc:"接入 Discord Bot，支持服务器频道和私信",slack:"Slack",slackDesc:"接入 Slack App，支持频道和私信",teams:"Microsoft Teams",teamsDesc:"接入 Microsoft Teams Bot",signal:"Signal",signalDesc:"接入 Signal Messenger",matrix:"Matrix",matrixDesc:"接入 Matrix 协议（Element 等客户端）",supported:"支持操作",connectedChannels:"已接入渠道",liveRunning:"运行中",liveStopped:"已停止",accountsLabel:"个账号",lastError:"最近错误",channelConfigNote:"凭据与账号在 openclaw.json 的 channels 段管理，或用 openclaw channels add 命令配置。占位符（REPLACE_WITH_*）需替换为真实凭据。",cancel:"取消",close:"关闭",copy:"复制",connecting:"接入",steps:"接入步骤（点击展开）",appId:"AppID",clientSecret:"ClientSecret",show:"显示",accountId:"账号标识",accountIdPlaceholder:"留空为默认账号；修改会创建新账号",accountIdHint:"每个账号对应一个独立机器人。不同账号可绑定不同 Agent。",bindAgent:"绑定 Agent",bindAgentHint:"该账号收到的消息路由到哪个 Agent（可在「Agent 对接」页添加更多绑定）。",manualCmd:"手动命令",manualCmdDesc:"如果面板自动安装失败，可以复制下面的命令到终端手动执行。",installHint:"用于手动安装 QQ 机器人 对应插件。",diagnostics:"完整联通诊断",diagHint:'检查已保存到配置文件的凭证、本机 Gateway 端口、/__api/health、QQ 插件与 chatCompletions。QQ 提示「灵魂不在线」时优先看此处，并参考 <span style="color:var(--danger)">OpenClaw × QQ 常见问题</span>。',verify:"校验凭证",connectAndSave:"接入并保存",operation:"操作",genericComingSoon:"{name} 接入配置正在开发中...",copyCmd:"复制",removeChannel:"删除接入",removeConfirm:"确认删除？",removing:"删除中…",removeFailed:"删除失败：{msg}",qqStep1:"安装 QQ bot 插件（见下方命令）",qqStep2:"填写 AppID / ClientSecret，点「生成接入命令」并执行",qqStep3:"重启网关后在此绑定 Agent",diagRunning:"QQ bot 插件运行中",diagConfigured:"已配置但未运行——重启网关生效",diagNotConfigured:"尚未配置",noAgents:"无可用 Agent（网关未连接）",wxStarting:"正在启动微信登录…",wxQrReady:"请用手机微信扫描二维码",wxWaitingScan:"二维码已就绪，等待扫码…",wxSuccessFull:"登录成功！凭证已保存，重启 OpenClaw 网关后微信渠道即上线。",wxCancelled:"已取消",wxErrorPrefix:"微信登录出错：",wxConnFailed:"无法连接登录服务",wxConnFailedHint:"无法连接登录服务（请确认 Python gateway 已在 :7889 启动）",bindFailed:"绑定失败: ",unbindFailed:"解绑失败: ",agentBindDesc:"每个 Agent 可绑定多条路由（例如不同账号或匹配条件）；绑定之间互不影响。请先在「渠道列表」中完成渠道接入。",addChannelBind:"添加渠道绑定",noChannelBound:"尚未绑定任何渠道",bindChannelCol:"渠道",bindAccountCol:"账号",bindAgentCol:"实例",bindAllAccounts:"全部账号（整个渠道）",bindAccountLabel:"账号",bindLevelAccount:"账号级",bindLevelChannel:"渠道级",showName:"显示"},channelsForm:{appId:"AppID",clientSecret:"ClientSecret",accountIdOpt:"账号 ID（可选）",botToken:"Bot Token",slackBotToken:"Bot Token（xoxb-）",slackAppToken:"App Token（xapp-，需 Socket Mode）",signalNumber:"注册手机号",homeserver:"Homeserver 地址",accessTokenOpt:"Access Token（可选）",feishuAppId:"App ID",feishuAppSecret:"App Secret",wecomBotId:"Bot ID",wecomSecret:"Secret",corpId:"CorpID（企业 ID）",agentId:"AgentId（应用 ID）",corpSecret:"CorpSecret（应用密钥）",wecomToken:"回调 Token",encodingAESKey:"EncodingAESKey",tenantId:"Tenant ID（目录 ID）",msAppId:"App Client ID",msAppPassword:"Client Secret（应用密码）",qqNote:"在 QQ 开放平台获取；命令会把 token 拼成 appId:clientSecret 格式。",telegramNote:"在 Telegram 上通过 @BotFather 创建机器人，获取 Bot Token。",discordNote:"在 Discord Developer Portal 创建 Application 和 Bot，获取 Bot Token。",slackNote:"创建 Slack App：Bot Token（xoxb-）+ App-Level Token（xapp-，需开启 Socket Mode）。",signalNote:"需先用 signal-cli 注册并绑定号码（见 signal 插件 README），这里填注册好的手机号。",matrixNote:"如 https://matrix.org；Access Token 可在 Matrix 客户端的会话设置中获取。",feishuNote:"在飞书开放平台创建企业自建应用（启用机器人能力），获取 App ID / App Secret。添加账号后填入 openclaw.json 的 channels.feishu。",wecomNote:"Bot 模式（默认 WebSocket 连接）：在企业微信创建机器人，拿到 Bot ID 和 Secret 即可，就这两个字段。自建应用（Agent）模式才需要 corpId + corpSecret + agentId（见 wecom 插件 README）。",msteamsNote:"在 Azure 注册 Bot（Microsoft Teams 渠道），获取 Tenant ID / Client ID / Client Secret。",fieldsMissing:"缺少必填字段：{fields}",fieldsOk:"字段完整 ✓",generateCmd:"生成接入命令",cliHint:"复制后自行在终端执行——这里不会写入任何配置。",configHint:"复制后自行合并进 openclaw.json 对应位置。",copied:"已复制"},agents:{defaultModel:"未设置",noChannelBound:"未绑定渠道",noDescription:"无描述",editFile:"编辑 {file}",agentName:"Agent 名称",model:"模型",workspacePath:"工作区路径",create:"创建",backToList:"← 返回 Agent 列表",defaultAgent:"默认 Agent",overview:"概览",files:"文件",channels:"渠道",tools:"工具",skills:"技能",basicInfo:"基本信息",agentId:"Agent ID",name:"名称",emoji:"表情",workspace:"工作区",modelConfig:"模型配置",mainModel:"主模型",fallbackModel:"备选模型",noFallback:"未配置备选模型（主模型不可用时无法切换）",addFallback:"+ 添加备选",reasoningLevel:"推理级别",low:"低",medium:"中",high:"高",saveConfig:"保存配置",bootstrapFiles:"Bootstrap 文件",bootstrapDesc:"Agent 工作区中的核心配置文件，定义 Agent 的行为、身份和记忆",created:"已创建",size:"大小",updateTime:"更新时间",edit:"编辑",saveFile:"保存文件",channelBinding:"渠道绑定",channelBindingDesc:"管理此 Agent 绑定的消息渠道",noChannel:"此 Agent 尚未绑定任何渠道",goToChannels:"去消息渠道配置",toolPermissions:"工具权限",toolPermDesc:"配置 Agent 可用工具的基础 profile 与额外 allow / deny 规则。",toolTemplate:"工具配置模板",fullAllow:"完全允许",safeOnly:"仅安全工具",disableAll:"禁用所有",explicitAllow:"显式允许",explicitAllowHint:"逗号或换行分隔。设置后会作为基础 allowlist。",appendAllow:"追加允许",appendAllowHint:"在 profile 基础上额外开放的工具。",explicitDeny:"显式禁止",explicitDenyHint:"优先级高于 allow/profile。",saveToolConfig:"保存工具配置",skillsWhitelist:"技能白名单",skillsWhitelistDesc:"勾选当前 Agent 允许使用的 Skills；留空表示不启用技能白名单。",saveSkillConfig:"保存技能配置",pageSubtitle:"创建和管理 OpenClaw Agent，配置身份、模型和工作区",clickHint:'点击卡片空白区域或"详情"按钮，进入新的 Agent 详情页。',fieldLabelName:"名称:",fieldLabelModel:"模型:",fieldLabelWorkspace:"工作区:",fieldLabelChannels:"绑定渠道:",backup:"备份",detail:"详情",default:"默认",namePlaceholder:"例如: main, assistant, coder",modelPlaceholder:"例如: gpt-4o, claude-sonnet-5",workspacePlaceholder:"工作区目录路径",fileContentPending:"文件内容待编辑...",fileDescAgents:"Agent 规则",fileDescSoul:"灵魂/人格",fileDescTools:"工具白名单",fileDescIdentity:"身份信息",fileDescUser:"用户上下文",fileDescHeartbeat:"心跳指令",fileDescBootstrap:"初始化引导",notSet:"未设置"},skills:{subtitle:"管理已安装的 Skills，或从社区搜索安装新技能",installed:"已安装",searchInstall:"搜索安装",filterPlaceholder:"过滤 Skills...",summary:"共 {total} 个 Skills: {available} 可用 / {missing} 缺依赖 / {disabled} 已禁用",available:"可用",missingDeps:"缺依赖",disabled:"已禁用",detail:"详情",uninstall:"卸载",noMatch:"没有匹配的 Skills",bundled:"内置",requires:"需依赖",notInstalled:"未找到技能包——请先运行 bootstrap-openclaw.bat 安装 OpenClaw 运行时。",searchComingSoon:"搜索安装功能正在开发中...",searchPlaceholder:"搜索 ClawHub 社区技能，如 weather / github / tavily",search:"搜索",searchHubTitle:"从 ClawHub 搜索安装新技能",comingSoon:"功能正在开发中，敬请期待",hubDownloads:"次下载",hubInstall:"安装",hubInstalling:"安装中…",hubInstalled:"已安装",hubNoResults:"没有找到匹配的技能",hubWarn:"社区技能由用户自行发布，官方不做审核——安装前请留意技能名称与下载量。",hubIntro:"ClawHub 是 OpenClaw 的官方社区技能市场。技能是交给 Agent 使用的「说明书 + 脚本」，安装后即可在对话中直接调用。",hubInstallNoteT:"即装即用",hubInstallNoteD:"装进技能目录，无需重启网关，安装后立即生效",hubSearchTipT:"搜索技巧",hubSearchTipD:"社区技能多为英文命名，用英文关键词搜索命中率更高",hubNetworkNoteT:"需要联网",hubNetworkNoteD:"搜索与安装会发起在线请求，离线或受限网络下不可用",hubGatewayRequired:"Gateway 未连接，无法搜索",fromClawhub:"ClawHub 已安装",enableBtn:"启用",disableBtn:"禁用",toggleFailed:"操作失败：",missingHint:"点击展开 · 补齐依赖后可用",preinstalled:"已预装·免费",preinstalledTitle:"预装通用工具（免费）",preDownloaded:"已下载",preNotDownloaded:"未下载",preDownloadFailed:"下载失败：",preUninstallFailed:"卸载失败：",jobPacks:"岗位技能包",buy:"购买",purchased:"已购买",download:"下载",downloading:"下载中…",installedPacks:"已安装岗位包",noInstalledPacks:"还没有已安装的岗位技能包，购买后下载即可使用",packCount:"共 {total} 个岗位包，每岗 {skills} 个技能，三引擎共享",skillList:"技能清单",triggerWords:"触发词",knowledgeBase:"知识库",categoryLabel:"分类",installedAt:"安装时间",buySuccess:"已购买「{name}」",buyAndDeploySuccess:"已购买「{name}」并部署到工作台",downloadSuccess:"「{name}」已部署到工作台",uninstallSuccess:"已卸载「{name}」",mySkills:"我的技能",summary2:"{usable} 项可用 · {repair} 项待修复 · {off} 项已停用",fromPack:"岗位包",myJobSkills:"我的岗位技能",otherAvailable:"其他可用技能",tryIt:"试一下",tryItFallback:"请帮我：",fixDeps:"补齐依赖",fixDepsWorking:"补齐中…",fixDepsFailed:"依赖补齐失败：",downloadWithDeps:"下载并补齐依赖",downloadWithDepsWorking:"处理中…",hermesNote:"Hermes 引擎：启用/停用经配置热加载生效；新部署的技能将在新会话中加载。",hermesHub:"技能市场",hermesHubTitle:"从 Hermes 技能市场搜索安装技能",hermesHubIntro:"Hermes 技能市场聚合多个来源（官方库、GitHub 技能仓库、ClawHub、lobehub）。安装的技能落入 Hermes 技能目录，即可在聊天中使用。",hermesHubWarn:"市场技能为第三方内容。Hermes 安装前会自动安全扫描，但请先看清技能说明再安装。",hermesHubSearchPlaceholder:"搜索 Hermes 技能市场,如 weather / pdf / excel",hermesHubSrcT:"多源聚合",hermesHubSrcD:"官方库、GitHub 技能仓库（NVIDIA/OpenAI 等）、ClawHub 等；技能多为英文命名",hermesHubGuardT:"安全扫描",hermesHubGuardD:"每次安装自动过内置安全检查；被拦截的技能不会装入",offHint:"文件保留 · 点击恢复启用",installToWs:"装到工作台",installFailed:"部署失败：",uninstallFailed:"卸载失败：",viewSkill:"查看",packLoadFailed:"岗位包加载失败：",buyDemoNote:"演示模式：购买仅保存在本地。正式版将接入授权服务器（license server）。",skillsUnit:"个技能"},settings:{subtitle:"管理 OpenClaw U盘版 的网络、代理和下载源配置",networkProxy:"网络代理",proxyHint:"设置后，npm 安装/升级、版本检测、GitHub/Gitee 更新检查、ClawHub Skills 等下载类操作会走此代理。自动绕过 localhost 和内网地址。保存后新请求立即生效；如 Gateway 正在运行，建议重启一次服务。",testConnection:"测试连通",closeProxy:"关闭代理",proxyEmpty:"请先填写代理地址",proxyReachable:"代理端口可达 ✓",proxyUnreachable:"代理地址不可达，请检查代理软件是否运行",modelRequestProxy:"模型请求代理",modelProxyLabel:"模型测试和模型列表请求也走代理",modelProxyHint:"请先在上方设置网络代理地址后，才能启用此选项。",interfaceLang:"界面语言",langHint:"切换界面显示语言，部分内容可能仍为中文",autoStart:"开机自启",autoStartLabel:"系统启动时自动运行 OpenClaw U盘版",autoStartHint:"开启后，电脑重启时 OpenClaw U盘版 会自动启动并检测 Gateway 状态。该偏好保存在本地，系统级自启动在桌面壳（Tauri）接入后生效。"},cron:{subtitle:"定时任务管理",breadcrumb:"AGENT 定时任务",taskCount:"{total} 个任务",errInvalidExpr:"Cron 表达式格式不对：需要 5–7 段、空格分隔，如「0 7 * * *」（每天 07:00）",errNameRequired:"请填写任务名称",runningCount:"{count} 运行中",createTask:"创建任务",gatewayNotRunning:"Gateway 未运行，请先启动",noTasks:"暂无定时任务。点击「创建任务」让 AGENT 按时自动干活。",nextRun:"下次运行",taskName:"任务名称",cronExpr:"Cron 表达式",cronExprHint:"5 段式：分 时 日 月 周，如「0 7 * * *」每天 07:00，「*/30 * * * *」每 30 分钟。",taskMessage:"发给 AGENT 的消息",taskMessageHint:"任务触发时发送给 AGENT 的指令（系统事件）。",editTitle:"编辑任务",deleteTitle:"删除任务",deleteConfirm:"确定删除定时任务「{name}」？此操作不可撤销。",schedulerDisabled:"网关 cron 调度器已禁用，任务不会被触发。"},diagnostics:{subtitle:"系统健康检查与问题诊断",startCheck:"开始检测",clickToStart:"点击盾牌开始检测",clickToRetry:"点击重新检测",allOk:"一切正常",checkSummary:"已检测 {count} 项，全部通过",checkedTotal:"已检测 {count} 项",advancedTools:"高级工具",diagConfig:"诊断配置",autoRepair:"自动修复",connDiag:"连接诊断",wsTest:"测试 WebSocket",repairPair:"一键修复配对",netLog:"网络日志",checkInstall:"OpenClaw 安装",checkConfig:"配置文件",checkToken:"认证令牌",checkDeviceKey:"设备密钥",checkVersion:"版本状态",checkConnection:"连接诊断",checkDetailConnection:"所有连接检查通过",checking:"检测中…",checkSidecar:"Sidecar 服务",checkGatewayProc:"网关进程",checkWs:"WebSocket 连接",checkAgents:"Agent RPC",checkHermes:"Hermes 引擎",checkAssistant:"AI 助手",checkLicense:"授权状态",checkFingerprint:"设备指纹",checkConfigRead:"配置读取",hasFails:"{count} 项未通过",hasWarns:"{count} 项异常（非核心服务）",repairing:"正在重启网关以修复…"},sandbox:{modeTitle:"沙箱模式",readOnly:"只读",readOnlyDesc:"Codex 进程只能读取文件，禁止任何写入。",workspaceWrite:"工作区可写",workspaceWriteDesc:"允许在工作目录内读写，日常使用推荐。",dangerFull:"完全访问（危险）",dangerFullDesc:"⚠ 无限制，可读写整个文件系统，谨慎使用。",approvalTitle:"审批策略",untrusted:"每次都问",untrustedDesc:"每条命令/文件操作都需要人工批准。",onRequest:"按需询问",onRequestDesc:"Codex 显式请求时才发起审批。",never:"从不询问",neverDesc:"完全自动执行，依赖沙箱保护。",currentTitle:"当前配置",model:"模型",workspace:"工作目录",apiKey:"API Key",officialApi:"OpenAI 官方接口",sidecarOffline:"Sidecar 离线，无法读写 Codex 配置（请检查 :7889）。",loading:"加载中…",saved:"已保存"},extensions:{subtitle:"查看 Hermes 文档和最近用量统计",docs:"文档",quickStart:"快速开始",cronAutomation:"Cron 自动化",skills:"Skills",analyticsSnapshot:"分析快照",sessions:"会话",tokens:"Tokens",cost:"费用"},dashboard:{subtitle:"OpenClaw 运行状态概览",running:"运行中",stopped:"已停止",opTimeout:"操作超时（{action}）",opFailed:"操作失败：{msg}",versionSinicized:"版本 · 汉化",latestUpstream:"最新上游",standaloneInstall:"独立安装版",agentFleet:"Agent 舰队",defaultAgent:"默认: main",modelPool:"模型池",basedOn:"基于",channelProviders:"个渠道商",basicServices:"基础服务",survivalRate:"存活率",controlUI:"Control UI",openclawNative:"OpenClaw 原生面板",clickToOpen:"点击打开浏览器",gateway:"GATEWAY",port:"端口",mainModel:"主模型",notSet:"未设置",concurrencyLimit:"并发上限",mcpTools:"MCP 工具",mountedExtensions:"已挂载扩展",recentBackup:"最近备份",noBackup:"从无备份",backupFiles:"个备份文件",runtimeVersion:"运行时版本",localInstall:"本地安装",wsConnected:"WebSocket 已连接",wsDisconnected:"WebSocket 未连接",restartGw:"重启 Gateway",checkUpdates:"检查更新",createBackup:"创建备份",recentLogs:"最近日志",licenseCard:"授权状态",licenseOk:"已激活",licenseNotActivated:"未激活",licenseIssue:"需处理",activeSessions:"活动会话",sessionSource:"OpenClaw 引擎会话",builtinSkills:"当前可调用技能",defaultAgentLabel:"默认",fromGatewayConfig:"网关配置"},hermesDashboard:{subtitle:"未配置",stopGateway:"停止 Gateway",startGateway:"启动 Gateway",gatewayStatus:"Gateway 状态",running:"运行中",stopped:"已停止",listeningPort:"监听端口 :8642",currentModel:"当前模型",notConfigured:"未配置",provider:"服务商 —",version:"版本",apiAddress:"API 地址",openPanel:"打开面板",hermesChatPanel:"Hermes 对话面板",openChat:"打开对话",modelConfig:"模型配置",pickConfiguredModel:"从「模型配置」已配好的模型中选择",noConfiguredModel:"暂无已配置模型 — 请先前往「模型配置」页添加服务商和模型",savedHotReload:"已保存，Hermes 热加载生效",saveFailed:"保存失败",sidecarOffline:"无法连接 Sidecar（:7889）",providerPresets:"服务商预设",fetchModels:"获取模型列表",testConn:"测试连通性",envAdvanced:".env 高级编辑",needBaseUrl:"请先填写或选择 API Base URL",noModels:"服务商未返回模型",fetchModelsOk:"获取到 {n} 个模型，点击选择",fetchModelsFailed:"获取模型列表失败：",connOk:"连接成功",connFailed:"连接失败：",customUrlLabel:"自定义网关地址",connInvalid:"地址无效，需以 http(s):// 开头",connSaved:"已保存，Hermes 聊天通道将使用此地址",connLocalRestored:"已切回本地默认地址（127.0.0.1:8642）",saving:"保存中…",connectionTarget:"连接目标",detectEnv:"探测环境",local:"本地 · 127.0.0.1",custom:"自定义",apply:"应用",quickActions:"快捷操作",interactiveSession:"交互式会话 →",hermesService:"Hermes 服务",maintenanceOps:"维护操作",maintenanceDesc:"集中查看 gateway 运行状态、连接目标、健康检查与维护操作。",openLogs:"打开日志",traceSearch:"追踪 / 搜索 →",advancedEdit:"高级编辑",customVars:"自定义变量 →",terminalCommands:"终端命令",terminalCmdHint:"在终端中使用以下命令管理 Hermes Agent，点击复制",cmdHeader:"命令",descHeader:"说明",copy:"复制",cmdChatDesc:"终端对话",cmdChatSub:"在终端中直接与 Agent 对话",cmdDoctorDesc:"诊断检查",cmdDoctorSub:"检测配置和环境问题",cmdVersionDesc:"查看版本",cmdVersionSub:"显示当前安装版本",cmdGatewayRunDesc:"启动服务",cmdGatewayRunSub:"在终端前台启动 Gateway",cmdGatewayStopDesc:"停止服务",cmdGatewayStopSub:"停止后台 Gateway 进程",cmdExplorerDesc:"打开配置目录",cmdExplorerSub:"在文件管理器中查看配置文件",model:"模型",fetchModelList:"获取模型列表",testConnectivity:"测试连通性",saveConfig:"保存配置",envAdvancedEdit:".env 高级编辑"},hermesService:{subtitle:"集中查看 Gateway 运行状态、连接目标、健康检查与维护操作。",backToDashboard:"返回仪表盘",startGateway:"启动 Gateway",installStatus:"安装状态",installed:"已安装",installMethod:"安装方式",gatewayStatus:"Gateway 状态",stopped:"已停止",currentModel:"当前模型",notConfigured:"未配置",unknown:"未知",connectionTarget:"连接目标",local:"本地",version:"版本",cliPath:"CLI 路径",homeDir:"主目录",keyConfigFiles:"关键配置文件",hermesConfig:"Hermes 配置",llmProvider:"LLM 提供商",model:"模型",customApiAddr:"自定义 API 地址（可选）",notSet:"未设置",openConfig:"打开配置",openEnv:"打开环境变量",localTarget:"本地",customTarget:"自定义",apply:"应用",detectEnv:"探测环境",healthCheck:"健康检查",healthCheckMsg:"Gateway 未运行或暂时无法返回健康数据。",customGatewayUrl:"自定义 Gateway URL",customDesc:"连接到已有的 Hermes Agent Gateway 实例，适用于已在其他机器或手动安装的场景。",maintenanceOps:"维护操作",upgradeHermes:"升级 Hermes",uninstallHermes:"卸载 Hermes",uninstallClean:"卸载并清理配置",openLogs:"打开日志",running:"运行中",stopGateway:"停止 Gateway",restartGateway:"重启 Gateway",notInstalled:"未安装",needBootstrap:"需先运行 bootstrap-portable.bat",recheck:"重新检查",healthy:"健康",pid:"PID",portablePython:"便携 Python",keyOk:"Key ✓",keyNone:"Key —",operating:"操作中…",platform:"平台"},hermesConfig:{title:"Hermes 配置",path:"~/.hermes/config.yaml",rawEditorHint:"raw yaml 编辑器 · 保存即热加载",backToService:"返回服务",reload:"重新加载",saveConfig:"保存配置"},hermesEnv:{title:"ENV 编辑",backToDashboard:"返回仪表盘",subtitle:"自定义环境变量 · ~/.hermes/.env",customEnvFile:"custom.env",keyPlaceholder:"键名",valuePlaceholder:"值",remove:"删除",notice:"模型 / Provider 密钥请在仪表盘「模型配置」中管理（写入 config.yaml）。本页管理 Hermes 读取的",noticeCustom:"自定义环境变量（如 TAVILY_API_KEY、HTTP_PROXY 等），保存后下次网关重启生效。",noVars:"暂无自定义变量",clickAdd:'点击下方"添加变量"创建一个',addVar:"添加变量",changesHint:"更改将在下次 Gateway 重启后生效"},engine:"引擎",main_model:"主模型",mcp_tools:"MCP 工具",recent_backup:"最近备份",agent_fleet:"Agent 舰队",runtime:"运行时版本",re_gw:"重启 Gateway",check_up:"检查更新",create_bp:"创建备份",hermesMemory:{title:"Agent 记忆",path:"~/.hermes/memories/",files:"个文件",savedNote:"已保存，Hermes 新会话生效",heroTitle:"三份 Markdown，组成 Agent 的长期上下文",heroDesc:"笔记记录事实，用户画像沉淀偏好，灵魂档案塑造人格。Hermes 会在会话中持续读取这些长期记忆。",memoryFiles:"记忆文件",filled:"已填写",totalWords:"总词数",lastUpdated:"最近更新",memory:"笔记",memoryLabel:"MEMORY",memoryDesc:"Agent 的笔记与事实备忘——会话间持续累积的知识。",memoryPlaceholder:"暂无内容",memoryPlaceholderDesc:"Agent 的笔记与事实备忘——会话间持续累积的知识。",user:"用户画像",userLabel:"USER",userDesc:"用户偏好、身份、背景信息——每次对话都会参考。",userPlaceholder:"暂无内容",userPlaceholderDesc:"用户偏好、身份、背景信息——每次对话都会参考。",soul:"灵魂档案",soulLabel:"SOUL",soulDesc:"Agent 的人格、价值观、说话风格——长期塑造。",soulPlaceholder:"暂无内容",soulPlaceholderDesc:"Agent 的人格、价值观、说话风格——长期塑造。",words:"词",chars:"字符",edit:"编辑",refresh:"刷新"},hermesLogs:{title:"Agent 日志",path:"~/.hermes/logs/ · agent.log",noLogFiles:"（无日志文件）",noContent:"（无内容）",backToDashboard:"返回仪表盘",tail:"追踪",download:"下载",refresh:"刷新",logFiles:"日志文件",level:"级别",lines:"行数",search:"搜索",searchPlaceholder:"搜索日志...",clear:"清除",records:"条记录"},ai:{notConfigured:"未配置",convList:"对话列表",newConv:"新对话",searchConv:"搜索对话...",newChat:"新建聊天",greeting:"你好！我是你的 AI 助手，有什么可以帮你的？",builtInBadge:"内置 AI",builtInDesc:"这是内置的 AI 助手，独立于 OpenClaw 网关，使用你在「设置」里选择的模型（在「模型配置」页配置），并可执行本地命令行。如需与 OpenClaw Agent 对话，请前往「实时聊天」页面。",checkConfig:"检查配置",checkConfigDesc:"检查 OpenClaw 配置文件是否正确",diagGateway:"诊断 Gateway",diagGatewayDesc:"诊断 Gateway 运行状态",browseDir:"浏览目录",browseDirDesc:"浏览 OpenClaw 配置目录结构",checkEnv:"检查环境",checkEnvDesc:"检查系统环境是否满足要求",analyzeLogs:"分析日志",analyzeLogsDesc:"分析最近的日志，找出问题",oneClickFix:"一键修复",oneClickFixDesc:"自动检测并修复常见问题",feedbackBug:"反馈 Bug",feedbackBugDesc:"整理成标准 GitHub Issue",prAssistant:"PR 助手",prAssistantDesc:"帮你走一遍 PR 流程",skillsMgmt:"Skills 管理",skillsMgmtDesc:"管理 OpenClaw 的 Skills",startChat:"开始对话吧",placeholder:"描述你的问题，粘贴日志、截图或错误信息...",hint:"Enter 发送 · Shift+Enter 换行 · 支持粘贴/拖拽图片 · AI 助手独立于 OpenClaw",settingsTitle:"AI 助手 — 设置",settings:"设置",apiConfig:"API 配置",tools:"工具",persona:"人设",knowledgeBase:"知识库",quickSelect:"快捷选择",quickSelectHint:"选择常用服务商自动填充，或手动填写下方信息",apiBaseUrl:"API Base URL",apiType:"接口类型",apiKey:"API Key",apiKeyPlaceholder:"sk-... 或中转站密钥",testConn:"测试连接",getList:"获取列表",importConfig:"导入 OpenClaw 配置",model:"模型",temperature:"温度",compatHint:"兼容 OpenAI 接口（大多数中转站、Ollama 等）",backupGroup:"备用模型组",enabled:"启用",disabledCount:"启用",enableTools:"勾选要启用的工具类别",terminalCmd:"终端命令",terminalCmdDesc:"执行系统命令",fileOps:"文件操作",fileOpsDesc:"读写文件和目录",webSearch:"网页搜索",webSearchDesc:"搜索网页获取信息",autoExecRounds:"自动执行轮数",autoExecRoundsHint:"工具调用在询问前的自动执行轮数",alwaysAvail:"始终可用",personaSource:"人设来源",default:"默认",openclawAgent:"OpenClaw Agent",openclawAgentHint:"从 OpenClaw Agent 继承身份和工作区设置",assistantName:"助手名称",assistantPersona:"助手性格",personaHint:"描述助手的性格特征",kbCustom:"自定义知识库，AI 回答时会参考这些内容",kbAdd:"+ 添加",kbEmpty:"暂无知识库条目",cancel:"取消",save:"保存",saved:"已保存",justNow:"刚刚",aiDefault:"默认",everyTimeAsk:"每次都询问",attachTitle:"粘贴日志、截图",assistantPersonaDesc:"专业、友好、乐于助人",selectModel:"选择模型",selectModelHint:"直接选取在「模型配置」页已配置好的模型，助手将使用它的 API 对话。",noModels:"暂无可用模型",noModelsHint:"请先前往「模型配置」页添加服务商和模型，再回来选择。",goToModels:"去配置模型",primaryTag:"主模型",assistantStatus:"助手服务",statusReady:"就绪",statusOffline:"未连接",statusKeyMissing:"未选择模型",thinking:"思考中…",cmdRunning:"执行中…",cmdNoOutput:"（无输出）",assistantOfflineHint:"助手服务未连接，请确认已启动 ai-assistant 服务（:8080）。",msgCount:"条"},init:{title:"OpenClaw U盘版",frontendReady:"前端模块已就绪",licenseValidOffline:"授权有效（离线第 {days} 天，剩余宽限 {remain} 天）",licenseValid:"授权有效",licenseStatusPrefix:"授权状态：",submitCodeLog:"提交激活码 {code}*** → /api/license/activate",sidecar:"Sidecar · 服务桥",engineOpenclaw:"引擎 · openclaw",engineHermes:"引擎 · hermes",license:"授权 · 激活校验",preparingWorkspace:"正在准备工作空间...",ready:"READY",portableReady:"便携环境已就绪",files:"文件",launchMultiEngine:"启动 · 多引擎",usbPortable:"USB Portable",checkStart:"开始环境自检…",checkFailed:"未运行",sidecarUnreachable:"无法连接授权服务（Sidecar :7889）——请先运行 start-all.bat，再点重试。",entering:"全部检查通过，正在进入…",retry:"重试",enterAnyway:"仍然进入",licenseNotActivated:"尚未激活，请输入激活码后继续使用。",licenseBlockedOffline:"离线超过 3 天，请联网重新验证后继续使用。",licenseDeviceChanged:"检测到硬件变更，请重新激活或联网验证。",licenseRevoked:"授权已被吊销，请联系客服。",licenseError:"授权校验失败。",codePlaceholder:"激活码，如 B-XXXXXX",activate:"激活",revalidate:"联网重新验证",activating:"激活中…",rechecking:"校验中…",device:"设备",offlineUsed:"已离线天数：",offlineLeft:"剩余宽限天数："}},Ue={en:nt,"zh-CN":Ls};class Bs{constructor(){this.locale="zh-CN",this.subscribers=new Set,this._readStored()}_readStored(){try{const e=localStorage.getItem("openclaw.i18n.locale");e&&Ue[e]&&(this.locale=e)}catch{}}t(e,t){const a=e.split(".");let i=Ue[this.locale]||nt;for(const o of a)i=i==null?void 0:i[o];if(typeof i!="string")return e;if(t){let o=i;for(const[n,c]of Object.entries(t))o=o.replace(`{${n}}`,String(c));return o}return i}get(e){const t=e.split(".");let a=Ue[this.locale]||nt;for(const i of t)a=a==null?void 0:a[i];return a}setLocale(e){if(Ue[e]){this.locale=e;try{localStorage.setItem("openclaw.i18n.locale",e)}catch{}for(const t of this.subscribers)t()}}subscribe(e){return this.subscribers.add(e),()=>{this.subscribers.delete(e)}}}const V=new Bs;function x(l){return{"X-UI-Lang":V.locale,...l||{}}}const s=(l,e)=>V.t(l,e);let Ns=0;function Rs(){return"r"+ ++Ns+"-"+Math.random().toString(36).slice(2,8)}class Hs{constructor(e){this.url=e.url,this.token=e.token,this.password=e.password,this.onEvent=e.onEvent||(()=>{}),this.onClose=e.onClose||(()=>{}),this.onHello=e.onHello||(()=>{}),this.ws=null,this.pending=new Map,this.closed=!1,this.backoffMs=800,this.connectNonce=null,this.connectSent=!1}get connected(){var e;return((e=this.ws)==null?void 0:e.readyState)===WebSocket.OPEN}start(){this.closed=!1,this._connect()}stop(){var e;this.closed=!0,(e=this.ws)==null||e.close(),this.ws=null,this._flushPending(new Error("client stopped"))}_connect(){if(this.closed)return;this.connectSent=!1,this.connectNonce=null;const e=new WebSocket(this.url);this.ws=e,e.addEventListener("open",()=>{}),e.addEventListener("message",t=>this._handle(String(t.data??""))),e.addEventListener("close",t=>{this.ws=null,this._flushPending(new Error(`closed (${t.code}): ${t.reason}`)),this.onClose({code:t.code,reason:t.reason}),this.closed||this._scheduleReconnect()}),e.addEventListener("error",()=>{})}_scheduleReconnect(){this.backoffMs=Math.min(this.backoffMs*1.7,15e3),setTimeout(()=>this._connect(),this.backoffMs)}_flushPending(e){for(const[,t]of this.pending)t.reject(e);this.pending.clear()}async _sendConnect(){var e;if(!this.connectSent){this.connectSent=!0;try{const t=await this.request("connect",{minProtocol:4,maxProtocol:4,client:{id:"openclaw-control-ui",version:"1.0.0",platform:navigator.platform??"web",mode:"webchat"},role:"operator",scopes:["operator.admin","operator.read","operator.write","operator.approvals","operator.pairing"],caps:["tool-events"],userAgent:navigator.userAgent,locale:navigator.language,...this.token?{auth:{token:this.token}}:this.password?{auth:{password:this.password}}:{}});this.backoffMs=800,this.onHello(t)}catch(t){const a=t instanceof Error?t.message:String(t);this.onClose({code:4008,reason:a}),(e=this.ws)==null||e.close(4008,"connect failed")}}}_handle(e){var a,i,o,n;let t;try{t=JSON.parse(e)}catch{return}if(t.type==="event"){if(t.event==="connect.challenge"){this.connectNonce=((a=t.payload)==null?void 0:a.nonce)??null,this._sendConnect();return}try{this.onEvent(t)}catch(c){console.error("[gw] event error:",c)}return}if(t.type==="res"){const c=this.pending.get(t.id);if(!c)return;this.pending.delete(t.id),t.ok?c.resolve(t.payload):c.reject(new vs({code:((i=t.error)==null?void 0:i.code)??"UNAVAILABLE",message:((o=t.error)==null?void 0:o.message)??"request failed",details:(n=t.error)==null?void 0:n.details}))}}request(e,t){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return Promise.reject(new Error("not connected"));const a=Rs();return this.ws.send(JSON.stringify({type:"req",id:a,method:e,params:t})),new Promise((i,o)=>{this.pending.set(a,{resolve:i,reject:o})})}}class vs extends Error{constructor({code:e,message:t,details:a}){super(t),this.name="GatewayError",this.code=e,this.details=a}}class qs{constructor(e){this._client=null,this._connected=!1,this._reconnecting=!1,this._hello=null,this._lastError=null,this._lastErrorCode=null,this._listeners=new Set,this._started=!1,this._eventHandlers=new Map,this._url=e.url,this._token=e.token,this._password=e.password,e.autoStart!==!1&&this.start()}get snapshot(){return{connected:this._connected,reconnecting:this._reconnecting,hello:this._hello,lastError:this._lastError,lastErrorCode:this._lastErrorCode,client:this._client}}get client(){return this._client}get connected(){return this._connected}get hello(){return this._hello}start(){this._started||(this._started=!0,this._createClient())}stop(){var e;this._started=!1,(e=this._client)==null||e.stop(),this._client=null,this._connected=!1,this._hello=null,this._notify()}connect(e){var t;(e==null?void 0:e.url)!==void 0&&(this._url=e.url),(e==null?void 0:e.token)!==void 0&&(this._token=e.token),(e==null?void 0:e.password)!==void 0&&(this._password=e.password),(t=this._client)==null||t.stop(),this._connected=!1,this._hello=null,this._lastError=null,this._lastErrorCode=null,this._notify(),this._started&&this._createClient()}subscribe(e){return this._listeners.add(e),e(this.snapshot),()=>{this._listeners.delete(e)}}async request(e,t){if(!this._client||!this._connected)throw new vs({code:"NOT_CONNECTED",message:"Gateway not connected"});return this._client.request(e,t)}onEvent(e,t){return this._eventHandlers.has(e)||this._eventHandlers.set(e,new Set),this._eventHandlers.get(e).add(t),()=>{const a=this._eventHandlers.get(e);a&&(a.delete(t),a.size===0&&this._eventHandlers.delete(e))}}_createClient(){this._reconnecting=!1,this._client=new Hs({url:this._url,token:this._token,password:this._password,onHello:e=>{this._connected=!0,this._reconnecting=!1,this._hello=e,this._lastError=null,this._lastErrorCode=null,this._notify()},onClose:e=>{this._connected=!1,this._hello=null,e.code!==4008&&(this._reconnecting=this._started),this._lastError=e.reason||`Connection closed (${e.code})`,this._lastErrorCode=String(e.code),this._notify()},onEvent:e=>{this._dispatchEvent(e)}}),this._client.start(),this._notify()}_dispatchEvent(e){const t=this._eventHandlers.get(e.event);if(t)for(const i of t)try{i(e.payload)}catch(o){console.error("[store] event handler error:",o)}const a=this._eventHandlers.get("*");if(a)for(const i of a)try{i({event:e.event,...e.payload})}catch(o){console.error("[store] wildcard handler error:",o)}}_notify(){const e=this.snapshot;for(const t of this._listeners)try{t(e)}catch(a){console.error("[store] listener error:",a)}}}function Us(l){return new qs(l)}function js(){try{const e=localStorage.getItem("openclaw.gateway.url");if(e)return e}catch{}return`ws://${window.location.hostname||"127.0.0.1"}:18789`}function bs(){try{const l=localStorage.getItem("openclaw.gateway.token");if(l)return l}catch{}return"dev-local-token"}let at=null;function f(){return at||(at=Us({url:js(),token:bs(),autoStart:!0})),at}const Ks=`    :host { display: flex; flex-direction: column; background: var(--bg-elevated); border-right: 1px solid var(--border); height: 100%; overflow: hidden; }\r
    :host(:not([collapsed])) { width: var(--shell-nav-width); }\r
    .sidebar-shell { min-height: 0; box-shadow: none; background: none; border: none; border-radius: 0; flex-direction: column; flex: 1; padding: 14px 10px 12px; display: flex; }\r
    .sidebar-shell__header { flex-shrink: 0; justify-content: space-between; align-items: center; gap: 12px; min-height: 0; padding: 0 8px 14px; display: flex; }\r
    .sidebar-shell__body { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }\r
    .sidebar-shell__footer { flex-shrink: 0; border-top: 1px solid color-mix(in srgb, var(--border) 80%, transparent); padding: 10px 0 0; }\r
    .sidebar-brand { align-items: center; gap: 10px; min-width: 0; display: flex; }\r
    .sidebar-brand__logo { border-radius: var(--radius-md); flex-shrink: 0; width: 32px; height: 32px; box-shadow: 0 8px 18px rgba(0,0,0,0.12); }\r
    .sidebar-brand__copy { flex-direction: column; gap: 2px; min-width: 0; display: flex; }\r
    .sidebar-brand__eyebrow { letter-spacing: 0.08em; color: var(--muted); font-size: 10px; ; line-height: 1.1; }\r
    .sidebar-brand__title { letter-spacing: -0.03em; color: var(--text-strong); white-space: nowrap; text-overflow: ellipsis; font-size: 15px; font-weight: 700; line-height: 1.1; overflow: hidden; }\r
    .engine-select { padding: 0 8px 12px; flex-shrink: 0; }\r
    .engine-label { letter-spacing: 0.08em; color: var(--muted); font-size: 10px; ; margin-bottom: 6px; }\r
    .engine-options { display: flex; flex-direction: column; }\r
    .engine-option { border-radius: var(--radius-md); min-height: 32px; color: var(--text-soft); cursor: pointer; transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease, color var(--duration-fast) ease; background: none; border: 1px solid transparent; align-items: center; gap: 9px; padding: 0 9px; display: flex; margin: 1px 0; user-select: none; position: relative; }\r
    .engine-option:hover { color: var(--text); background: color-mix(in srgb, var(--bg-hover) 84%, transparent); border-color: color-mix(in srgb, var(--border) 72%, transparent); }\r
    .engine-option.checked { color: var(--text-strong); background: var(--accent-subtle); border-color: var(--accent-subtle); }\r
    .engine-option input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }\r
    .engine-option__radio { width: 14px; height: 14px; border: 1.5px solid var(--border-strong); border-radius: 50%; flex-shrink: 0; align-items: center; justify-content: center; display: flex; transition: border-color var(--duration-fast) ease; }\r
    .engine-option__radio::after { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); transform: scale(0); transition: transform var(--duration-fast) var(--ease-out); }\r
    .engine-option.checked .engine-option__radio { border-color: var(--accent); }\r
    .engine-option.checked .engine-option__radio::after { transform: scale(1); }\r
    .engine-option input:focus-visible ~ .engine-option__radio { outline: 2px solid var(--accent); outline-offset: 2px; }\r
    .engine-option__text { white-space: nowrap; font-size: 13px; }\r
    .nav-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0; }\r
    .nav-scroll { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }\r
    .nav-scroll::-webkit-scrollbar { width: 4px; }\r
    .nav-scroll::-webkit-scrollbar-track { background: transparent; }\r
    .nav-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }\r
    .nav-scroll::-webkit-scrollbar-thumb:hover { background: var(--border-strong); }\r
    .nav-section__heading { letter-spacing: 0.06em; color: var(--muted); padding: 10px 9px 6px 17px; font-size: 10px; ; }\r
    .nav-item { border-radius: var(--radius-md); min-height: 40px; color: var(--text-soft); cursor: pointer; transition: border-color var(--duration-fast) ease, background var(--duration-fast) ease, color var(--duration-fast) ease; background: none; border: 1px solid transparent; justify-content: flex-start; align-items: center; gap: 8px; padding: 0 9px; text-decoration: none; display: flex; position: relative; margin: 1px 8px; user-select: none; }\r
    .nav-item:hover { color: var(--text); background: color-mix(in srgb, var(--bg-hover) 84%, transparent); border-color: color-mix(in srgb, var(--border) 72%, transparent); }\r
    .nav-item.active { color: var(--text-strong); background: var(--accent-subtle); border-color: var(--accent-subtle); }\r
    .nav-item__icon { opacity: 0.8; width: 16px; height: 16px; transition: opacity var(--duration-fast) ease, color var(--duration-fast) ease; flex-shrink: 0; justify-content: center; align-items: center; display: flex; }\r
    .nav-item__icon svg { stroke: currentColor; fill: none; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; width: 16px; height: 16px; }\r
    .nav-item.active .nav-item__icon { opacity: 1; color: var(--accent); }\r
    .nav-item__text { white-space: nowrap; font-size: 14px; }\r
    .footer-item { display: flex; align-items: center; gap: 10px; padding: 0px 9px; margin: 1px 8px; border-radius: var(--radius-md); color: var(--text-soft); cursor: pointer; user-select: none; transition: all var(--duration-fast) ease; min-height: 40px; background: none; border: 1px solid transparent; }\r
    .footer-item:hover { color: var(--text); background: color-mix(in srgb, var(--bg-hover) 84%, transparent); border-color: color-mix(in srgb, var(--border) 72%, transparent); }\r
    .footer-item svg { width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 1.5px; stroke-linecap: round; stroke-linejoin: round; }\r
    .footer-item-text { font-size: 14px; ; white-space: nowrap; }\r
`,Fs={"layout-dashboard":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,bot:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 2v2"/><path d="M12 12v.01"/><path d="M8 14v.01"/><path d="M16 14v.01"/><path d="M12 19v2"/></svg>`,"message-square":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,antenna:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 7 2"/><path d="m7 12 5-10"/><path d="m12 12 5-10"/><path d="m17 12 5-10"/><path d="M4.5 7h15"/><path d="M12 16v6"/></svg>`,monitor:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,"monitor-cog":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><circle cx="18" cy="5" r="1"/></svg>`,"sun-moon":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,wrench:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,"hard-drive":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>`,archive:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>`,database:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,palette:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z"/></svg>`,cpu:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,users:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,"share-2":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,shield:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,stethoscope:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,globe:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,history:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,clock:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,puzzle:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.611a2.404 2.404 0 0 1-1.705.706 2.404 2.404 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.404 2.404 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.685a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.611-1.611a2.404 2.404 0 0 1 1.704-.706c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.968 1.02Z"/></svg>`,server:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,"scroll-text":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>`,bug:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,send:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg>`,sparkles:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>`,paperclip:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,image:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,menu:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,"folder-open":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>`,list:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,"panel-left":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>`,command:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/></svg>`,"layout-panel-left":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><rect x="12" y="7" width="6" height="4" rx="1"/><rect x="12" y="14" width="6" height="3" rx="1"/></svg>`,"bar-chart-3":r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="20" x2="21" y2="20"/><path d="M3 20v-6h6v6"/><path d="M9 20V4h6v16"/><path d="M15 20v-9h6v9"/></svg>`,settings:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,"panel-left-close":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`,circle:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,search:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,plus:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,"refresh-cw":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`,trash:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,edit:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`,copy:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,check:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,x:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,"chevron-down":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,"chevron-right":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,info:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,"alert-triangle":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,wifi:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,zap:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,play:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,pause:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,sun:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,moon:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,terminal:r`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,key:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20.761 3.973-1.013 1.013a3 3 0 0 1-3.713.454l-.322-.195a3.001 3.001 0 0 0-3.713.454L9.493 8.206a3 3 0 0 1-.454 3.713l-.195.322a3 3 0 0 1-.454 3.713L7.377 16.967"/><path d="M2 22l6-6"/><circle cx="18.5" cy="5.5" r="2.5"/></svg>`,"check-circle":r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,ban:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>`,lock:r`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`},v=Fs;var Gs=Object.defineProperty,Se=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Gs(e,t,i),i};const _t=class _t extends C{constructor(){super(...arguments),this.page="dashboard",this.routes={},this.sections=[],this.connected=!1,this.engine="openclaw",this.themeMode="dark",this.lang="zh-CN",this._engines=[{value:"openclaw",label:"Openclaw"},{value:"hermes",label:"Hermes Agent"},{value:"codex",label:"Codex CLI"}]}_cycleMode(){const e=["dark","light"],t=e.indexOf(this.themeMode),a=e[(t+1)%e.length];this.dispatchEvent(new CustomEvent("set-mode",{detail:{mode:a},bubbles:!0,composed:!0}))}_modeIcon(){return this.themeMode==="dark"?v.moon:v.sun}_modeTitle(){return this.themeMode==="dark"?s("common.darkMode"):s("common.lightMode")}_cycleLang(){const e=this.lang==="zh-CN"?"en":"zh-CN";this.dispatchEvent(new CustomEvent("set-lang",{detail:{lang:e},bubbles:!0,composed:!0}))}_langLabel(){return this.lang==="zh-CN"?"中文":"English"}_emitEngine(e){this.dispatchEvent(new CustomEvent("set-engine",{detail:{engine:e},bubbles:!0,composed:!0}))}render(){return r`
      <div class="sidebar-shell">
        <div class="sidebar-shell__header">
          <div class="sidebar-brand">
            <img class="sidebar-brand__logo" src="/favicon.svg" alt=${s("brand.title")} />
            <div class="sidebar-brand__copy">
              <span class="sidebar-brand__eyebrow">${s("brand.eyebrow")}</span>
              <span class="sidebar-brand__title">${s("brand.title")}</span>
            </div>
          </div>
        </div>
        <div class="engine-select">
          <div class="engine-label">${s("engine")}</div>
          <div class="engine-options" role="radiogroup" aria-label=${s("engine")}>
            ${this._engines.map(e=>r`
              <label class="engine-option ${this.engine===e.value?"checked":""}">
                <input type="radio" name="engine" value=${e.value} .checked=${this.engine===e.value}
                  @change=${()=>this._emitEngine(e.value)} />
                <span class="engine-option__radio" aria-hidden="true"></span>
                <span class="engine-option__text">${e.label}</span>
              </label>
            `)}
          </div>
        </div>
        <div class="sidebar-shell__body">
          <nav class="nav-scroll">
            ${this.sections.map(e=>r`
              <div class="nav-section">
                ${e.heading?r`<div class="nav-section__heading">${e.heading}</div>`:""}
                ${e.tabs.map(t=>{const a=this.routes[t];return a?r`
                    <div class="nav-item ${this.page===t?"active":""}" @click=${()=>this._emitNav(t)} title=${a.label}>
                      <span class="nav-item__icon">${v[a.icon]||v.circle}</span>
                      <span class="nav-item__text">${a.label}</span>
                    </div>
                  `:""})}
              </div>
            `)}
          </nav>
        </div>
        <div class="sidebar-shell__footer">
          <div class="footer-item" @click=${()=>this._cycleMode()}>
            ${this._modeIcon()}
            <span class="footer-item-text">${this._modeTitle()}</span>
          </div>
          <div class="footer-item" @click=${()=>this._cycleLang()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span class="footer-item-text">${this._langLabel()}</span>
          </div>
        </div>
      </div>
    `}_emitNav(e){this.dispatchEvent(new CustomEvent("navigate",{detail:{page:e},bubbles:!0,composed:!0}))}};_t.styles=ve(Ks);let de=_t;Se([m({type:String})],de.prototype,"page");Se([m({type:Object})],de.prototype,"routes");Se([m({type:Array})],de.prototype,"sections");Se([m({type:Boolean})],de.prototype,"connected");Se([m({type:String})],de.prototype,"engine");Se([m({type:String})],de.prototype,"themeMode");Se([m({type:String})],de.prototype,"lang");customElements.define("oc-sidebar",de);var Ws=Object.defineProperty,fs=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ws(e,t,i),i};const xt=class xt extends C{constructor(){super(...arguments),this.title="",this.subtitle=""}render(){return r`
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">${this.title}</div>
          ${this.subtitle?r`<div class="page-subtitle">${this.subtitle}</div>`:""}
        </div>
        <div class="page-header-right"><slot></slot></div>
      </div>
    `}};xt.styles=A`
    :host { display: block; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
    }
    .page-header-left { min-width: 0; }
    .page-title {
      color: var(--text-strong); font-size: 22px; font-weight: 700;
      letter-spacing: -0.02em; line-height: 1.2;
    }
    .page-subtitle {
      color: var(--text-soft); font-size: 13px; margin-top: 4px; line-height: 1.4;
    }
    .page-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  `;let Be=xt;fs([m({type:String})],Be.prototype,"title");fs([m({type:String})],Be.prototype,"subtitle");customElements.define("page-header",Be);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vs=(l,e,t)=>(t.configurable=!0,t.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(l,e,t),t);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function _s(l,e){return(t,a,i)=>{const o=n=>{var c;return((c=n.renderRoot)==null?void 0:c.querySelector(l))??null};return Vs(t,a,{get(){return o(this)}})}}async function G(l,e={},t=5e3){const a=new AbortController,i=setTimeout(()=>a.abort(),t);try{return await fetch(l,{...e,signal:a.signal})}finally{clearTimeout(i)}}const Js=l=>new Promise(e=>setTimeout(e,l)),es="lxup.device.fingerprint";async function Ge(){var l;try{const e=window.__TAURI__;if((l=e==null?void 0:e.core)!=null&&l.invoke){const t=await e.core.invoke("get_device_fingerprint");if(typeof t=="string"&&t)return t}}catch{}try{let e=localStorage.getItem(es);return e||(e="web-"+(crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)),localStorage.setItem(es,e)),e}catch{return"web-anonymous"}}function Qs(){var e;return`Web · ${((e=navigator.userAgentData)==null?void 0:e.platform)||navigator.platform||"Unknown"}`}function Ys(){return`http://${typeof window<"u"&&window.location.hostname||"127.0.0.1"}:7889`}const Xs=25e3;async function pt(l,e){const t=x(e.headers||void 0),a=await G(`${Ys()}${l}`,{...e,headers:t},Xs),i=await a.json().catch(()=>null);return i&&typeof i.status=="string"?i:{success:!1,status:"error",message:typeof(i==null?void 0:i.detail)=="string"?i.detail:`HTTP ${a.status}`}}function gt(l){return pt(`/api/license/status?device_fingerprint=${encodeURIComponent(l)}`,{method:"GET"})}function Zs(l,e){return pt("/api/license/activate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:e.trim().toUpperCase(),device_fingerprint:l,device_name:Qs()})})}function ei(l){return pt("/api/license/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({device_fingerprint:l})})}var ti=Object.defineProperty,xe=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ti(e,t,i),i};const wt=class wt extends C{constructor(){super(...arguments),this._lang=V.locale,this._steps=[{key:"frontend",textKey:"init.frontendReady",state:"pending"},{key:"license",textKey:"init.license",state:"pending"}],this._logs=[],this._license=null,this._busyAction=null,this._code="",this._fingerprint="",this._allDone=!1,this._unsubI18n=null,this._running=!1,this._runId=0,this._enterTimer=null}connectedCallback(){super.connectedCallback(),this._unsubI18n=V.subscribe(()=>{this._lang=V.locale,this.requestUpdate()}),this._runChecks()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this),this._enterTimer&&clearTimeout(this._enterTimer)}updated(){var t;const e=(t=this.shadowRoot)==null?void 0:t.querySelector(".init-logs");e&&(e.scrollTop=e.scrollHeight)}_toggleLang(){V.setLocale(this._lang==="zh-CN"?"en":"zh-CN")}async _runChecks(){if(this._running)return;this._running=!0;const e=++this._runId,t=()=>this._runId===e;this._allDone=!1,this._license=null,this._logs=[],this._steps=this._steps.map(a=>({...a,state:"pending",detail:void 0})),this._log(s("init.checkStart")),this._setStep("frontend","running"),await Js(300),t()&&(this._setStep("frontend","ok"),this._fingerprint=await Ge(),t()&&(await this._checkLicense(),t()&&(this._running=!1)))}async _checkLicense(){this._setStep("license","running"),this._log("GET /api/license/status");let e;try{e=await gt(this._fingerprint)}catch{e={success:!1,status:"error",message:s("init.sidecarUnreachable")}}this._applyLicense(e)}_applyLicense(e){e.status==="ok"?(this._license=null,this._setStep("license","ok",e.device_name||void 0),this._log(e.days_offline?s("init.licenseValidOffline",{days:e.days_offline,remain:e.offline_remaining}):s("init.licenseValid")),this._finish()):(this._license=e,this._setStep("license","fail",e.status),this._log(`${s("init.licenseStatusPrefix")}${e.status}${e.message?" — "+e.message:""}`))}async _activate(){const e=this._code.trim();if(!e||this._busyAction)return;this._busyAction="activate",this._log(s("init.submitCodeLog",{code:e.slice(0,2)}));let t;try{t=await Zs(this._fingerprint,e)}catch(a){t={success:!1,status:"error",message:String(a)}}this._busyAction=null,this._applyLicense(t)}async _revalidate(){if(this._busyAction)return;this._busyAction="validate",this._log("联网重新校验 → /api/license/validate");let e;try{e=await ei(this._fingerprint)}catch(t){e={success:!1,status:"error",message:String(t)}}this._busyAction=null,this._applyLicense(e)}async _recheck(){this._busyAction||(this._busyAction="recheck",await this._checkLicense(),this._busyAction=null)}_finish(){this._allDone=!0,this._log(s("init.entering")),this._enterTimer=setTimeout(()=>{this.dispatchEvent(new CustomEvent("init-done"))},1200)}_licenseText(e){return{not_activated:s("init.licenseNotActivated"),blocked_offline:s("init.licenseBlockedOffline"),device_changed:s("init.licenseDeviceChanged"),revoked:s("init.licenseRevoked"),error:s("init.licenseError")}[e]||s("init.licenseError")}_log(e){const t=new Date().toTimeString().slice(0,8);this._logs=[...this._logs.slice(-49),`[${t}] ${e}`]}_setStep(e,t,a){this._steps=this._steps.map(i=>i.key===e?{...i,state:t,detail:a}:i)}get _progress(){if(this._allDone)return 100;const e=this._steps.filter(t=>t.state==="ok").length;return Math.round(e/this._steps.length*100)}render(){const e=this._license,t=!!e&&["not_activated","device_changed","revoked"].includes(e.status),a=!!e&&["blocked_offline","device_changed"].includes(e.status);return r`
      <div class="init-bg"></div>
      <div class="init-card">
        <div class="init-header">
          <div class="init-brand">
            <img src="/favicon.svg" alt="OpenClaw" />
            <span>${s("init.title")}</span>
          </div>
          <div class="init-lang">
            <button class="${this._lang==="zh-CN"?"active":""}" @click=${this._toggleLang}>中文</button>
            <button class="${this._lang==="en"?"active":""}" @click=${this._toggleLang}>EN</button>
          </div>
        </div>

        <div class="init-items">
          ${this._steps.map(i=>r`
            <div class="init-item ${i.state}">
              ${i.state==="ok"?r`
                <svg class="check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              `:i.state==="running"?r`
                <svg class="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              `:i.state==="fail"?r`
                <svg class="fail" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              `:r`
                <span class="dot"></span>
              `}
              <span class="item-label">${s(i.textKey)}</span>
              ${i.detail?r`<span class="item-detail">${i.detail}</span>`:""}
            </div>
          `)}
        </div>

        ${e?r`
          <div class="license-panel ${e.status==="revoked"||e.status==="error"?"bad":""}">
            <div class="license-msg">${this._licenseText(e.status)}</div>
            ${e.message?r`<div class="license-detail">${e.message}</div>`:""}
            ${t?r`
              <div class="license-row">
                <input class="license-input" type="text" maxlength="64"
                  placeholder=${s("init.codePlaceholder")}
                  .value=${this._code}
                  @input=${i=>{this._code=i.target.value}}
                  @keydown=${i=>{i.key==="Enter"&&this._activate()}} />
                <button class="license-btn"
                  ?disabled=${this._busyAction!==null||!this._code.trim()}
                  @click=${this._activate}>
                  ${this._busyAction==="activate"?s("init.activating"):s("init.activate")}
                </button>
              </div>`:""}
            ${a?r`
              <button class="license-btn wide"
                ?disabled=${this._busyAction!==null}
                @click=${this._revalidate}>
                ${this._busyAction==="validate"?s("init.rechecking"):s("init.revalidate")}
              </button>`:""}
            ${e.status==="error"?r`
              <button class="license-btn wide"
                ?disabled=${this._busyAction!==null}
                @click=${this._recheck}>
                ${this._busyAction==="recheck"?s("init.rechecking"):s("init.retry")}
              </button>`:""}
            ${e.status==="blocked_offline"?r`
              <div class="license-offline">
                ${s("init.offlineUsed")}${e.days_offline??"-"} · ${s("init.offlineLeft")}${e.offline_remaining??0}
              </div>`:""}
          </div>
        `:""}

        <div class="init-progress">
          <div class="init-progress-label">
            <span>${this._allDone?s("init.portableReady"):s("init.ready")}</span>
            <span class="pct">${this._progress}%</span>
          </div>
          <div class="init-progress-bar">
            <div class="init-progress-fill" style="width:${this._progress}%"></div>
          </div>
          ${this._fingerprint?r`
            <div class="init-device">
              ${s("init.device")}: ${this._fingerprint.length>28?this._fingerprint.slice(0,28)+"…":this._fingerprint}
            </div>
          `:""}
        </div>

        <div class="init-logs">
          ${this._logs.map(i=>r`<div>${i}</div>`)}
        </div>

        <div class="init-footer">
          <span>${s("init.launchMultiEngine")}</span>
          <span>${s("init.usbPortable")}</span>
        </div>
      </div>
    `}};wt.styles=A`
    :host {
      position: fixed; inset: 0;
      display: grid; place-items: center;
      width: 100vw; min-height: 100dvh;
      background: var(--bg); box-sizing: border-box;
    }
    .init-bg {
      position: fixed; inset: 0;
      background-image:
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.3;
    }
    .init-card {
      position: relative; z-index: 1;
      width: min(480px, calc(100vw - 48px));
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 28px 32px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    .init-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .init-brand { display: flex; align-items: center; gap: 10px; }
    .init-brand img { width: 28px; height: 28px; }
    .init-brand span { font-size: 16px; font-weight: 700; color: var(--text-strong); }
    .init-lang {
      display: flex; gap: 2px; padding: 2px;
      background: var(--bg-muted); border-radius: var(--radius-full);
    }
    .init-lang button {
      padding: 4px 12px; border-radius: var(--radius-full);
      font-size: 12px; font-weight: 500; border: none;
      cursor: pointer; color: var(--text-soft); background: transparent;
    }
    .init-lang button.active { background: var(--text-strong); color: var(--bg); }

    .init-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .init-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-soft);
    }
    .init-item.ok { color: var(--text); }
    .init-item.ok .check { color: var(--success); }
    .init-item.running .spinner { color: var(--warn); }
    .init-item.fail { color: var(--text); }
    .init-item.fail .fail { color: var(--danger); }
    .init-item .check, .init-item .spinner, .init-item .fail { width: 16px; height: 16px; flex-shrink: 0; }
    .init-item .dot {
      width: 16px; height: 16px; flex-shrink: 0; box-sizing: border-box;
      border: 1.5px solid var(--border-strong, var(--border)); border-radius: 50%; opacity: 0.5;
    }
    .item-detail {
      margin-left: auto; font-size: 11px; color: var(--muted);
      font-family: var(--font-mono); text-align: right;
    }
    .init-item.fail .item-detail { color: var(--danger); }

    .init-progress { margin-bottom: 16px; }
    .init-progress-label {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-bottom: 6px;
    }
    .init-progress-label .pct { color: var(--accent); font-weight: 600; }
    .init-progress-bar { height: 4px; background: var(--bg-muted); border-radius: 2px; overflow: hidden; }
    .init-progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--warn));
      border-radius: 2px; transition: width 0.3s ease;
    }
    .init-device {
      font-size: 11px; color: var(--muted); margin-top: 4px;
      font-family: var(--font-mono); word-break: break-all;
    }

    .init-logs {
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-sm); padding: 10px 12px;
      max-height: 120px; overflow-y: auto;
      font-family: var(--font-mono); font-size: 11px;
      color: var(--text-soft); line-height: 1.6;
    }
    .init-footer {
      display: flex; justify-content: space-between;
      font-size: 11px; color: var(--muted); margin-top: 16px;
      padding-top: 12px; border-top: 1px dashed var(--border);
    }

    /* ── 授权校验面板 ── */
    .license-panel {
      margin-bottom: 16px; padding: 14px;
      background: var(--bg-muted); border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .license-msg { font-size: 13px; color: var(--warn); line-height: 1.5; margin-bottom: 10px; }
    .license-panel.bad .license-msg { color: var(--danger); }
    .license-detail {
      font-size: 11px; color: var(--muted); margin-bottom: 10px;
      word-break: break-all; line-height: 1.5;
    }
    .license-row { display: flex; gap: 8px; }
    .license-input {
      flex: 1; min-width: 0; padding: 8px 12px;
      background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text);
      font-size: 13px; font-family: var(--font-mono); text-transform: uppercase;
    }
    .license-input:focus { outline: none; border-color: var(--accent); }
    .license-btn {
      padding: 8px 16px; border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground); white-space: nowrap;
      transition: background var(--duration-fast) ease;
    }
    .license-btn:hover { background: var(--accent-hover); }
    .license-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .license-btn.wide { width: 100%; margin-top: 10px; }
    .license-btn.ghost {
      background: transparent; color: var(--text-soft);
      border: 1px solid var(--border); font-weight: 500;
    }
    .license-btn.ghost:hover { background: var(--bg-hover); color: var(--text); }
    .license-offline { font-size: 11px; color: var(--muted); margin-top: 8px; }

    .init-actions { display: flex; gap: 8px; margin-bottom: 16px; }

    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { animation: spin 1s linear infinite; }
  `;let se=wt;xe([d()],se.prototype,"_lang");xe([d()],se.prototype,"_steps");xe([d()],se.prototype,"_logs");xe([d()],se.prototype,"_license");xe([d()],se.prototype,"_busyAction");xe([d()],se.prototype,"_code");xe([d()],se.prototype,"_fingerprint");xe([d()],se.prototype,"_allDone");customElements.define("init-page",se);const si="openclaw.models.config",xs="openclaw.models.selected";function ws(){try{const l=localStorage.getItem(si);if(!l)return[];const e=JSON.parse(l);return Array.isArray(e==null?void 0:e.providers)?e.providers.map(t=>({id:String(t.id??""),name:String(t.name??""),baseUrl:String(t.baseUrl??""),apiKey:String(t.apiKey??""),apiType:String(t.apiType??"openai"),models:Array.isArray(t.models)?t.models.map(a=>({id:String(a.id??""),isPrimary:!!a.isPrimary})):[]})):[]}catch{return[]}}function Ne(){const l=[];for(const e of ws())for(const t of e.models)l.push({providerId:e.id,providerName:e.name,baseUrl:e.baseUrl,apiKey:e.apiKey,apiType:e.apiType,model:t.id,isPrimary:t.isPrimary});return l}function ys(l){return`${l.providerId}::${l.model}`}function ii(l){var a;const e=(a=l==null?void 0:l.models)==null?void 0:a.providers;if(!e||typeof e!="object")return[];const t=[];for(const[i,o]of Object.entries(e)){const n=String((o==null?void 0:o.baseUrl)||""),c=String((o==null?void 0:o.apiKey)||"");for(const h of Array.isArray(o==null?void 0:o.models)?o.models:[]){const p=String((h==null?void 0:h.id)||(h==null?void 0:h.name)||"");p&&t.push({providerId:i,providerName:String((o==null?void 0:o.name)||i),baseUrl:n,apiKey:c,apiType:"openai",model:p,isPrimary:!1})}}return t}function We(){const l=Ne();if(!l.length)return null;try{const t=localStorage.getItem(xs);if(t){const a=l.find(i=>ys(i)===t);if(a)return a}}catch{}const e=l.find(t=>t.isPrimary);return e||l[0]}function ai(l){try{localStorage.setItem(xs,ys(l))}catch{}}const Ve="lxup.hermes.url",oi="lxup.hermes.key",ri="lxup-hermes-dev-2026";function we(){try{const e=localStorage.getItem(Ve);if(e)return e.replace(/\/+$/,"")}catch{}return`http://${typeof window<"u"&&window.location.hostname||"127.0.0.1"}:8642`}function ni(){try{return localStorage.getItem(Ve)||""}catch{return""}}function ts(l){try{l?localStorage.setItem(Ve,l):localStorage.removeItem(Ve)}catch{}}function li(){try{const l=localStorage.getItem(oi);if(l)return l}catch{}return ri}function ze(){return{"Content-Type":"application/json",Authorization:`Bearer ${li()}`}}async function ut(l){var t;let e=s("common.hermesError",{status:String(l.status)});try{const a=await l.json();(t=a==null?void 0:a.error)!=null&&t.message&&(e=a.error.message)}catch{}return e}async function ks(l){const e=await fetch(`${we()}${l}`,{headers:ze()});if(!e.ok)throw new Error(await ut(e));return await e.json()}async function di(l,e){const t=await fetch(`${we()}${l}`,{method:"POST",headers:ze(),body:e===void 0?void 0:JSON.stringify(e)});if(!t.ok)throw new Error(await ut(t));return await t.json()}async function ci(){return(await fetch(`${we()}/health`,{headers:ze()})).ok}async function _e(l,e){const t=await fetch(`${we()}${l}`,{headers:ze(),...e});if(!t.ok){const a=await t.json().catch(()=>null),i=typeof(a==null?void 0:a.detail)=="string"?a.detail:typeof(a==null?void 0:a.error)=="string"?a.error:a==null?void 0:a.message;throw new Error(i||`Hermes HTTP ${t.status}`)}return t.json()}async function hi(l=100){return(await ks(`/api/sessions?limit=${l}`)).data||[]}async function ss(l){return(await di("/api/sessions",{})).session}async function pi(l){await fetch(`${we()}/api/sessions/${encodeURIComponent(l)}`,{method:"DELETE",headers:ze()})}async function gi(l){return(await ks(`/api/sessions/${encodeURIComponent(l)}/messages`)).data||[]}function ui(l,e,t){const a=new AbortController;return(async()=>{try{const i=await fetch(`${we()}/api/sessions/${encodeURIComponent(l)}/chat/stream`,{method:"POST",headers:ze(),body:JSON.stringify({message:e}),signal:a.signal});if(!i.ok||!i.body){t({event:"error",data:{message:await ut(i)}}),t({event:"done",data:{}});return}const o=i.body.getReader(),n=new TextDecoder;let c="";for(;;){const{done:p,value:g}=await o.read();if(p)break;c+=n.decode(g,{stream:!0});let u;for(;(u=c.indexOf(`

`))>=0;){const b=c.slice(0,u);c=c.slice(u+2);let S="message";const _=[];for(const Y of b.split(`
`))Y.startsWith("event:")?S=Y.slice(6).trim():Y.startsWith("data:")&&_.push(Y.slice(5).trim());if(!_.length)continue;let T={};try{T=JSON.parse(_.join(`
`))}catch{continue}t({event:S,data:T})}}const h=c.trim();if(h){let p="message";const g=[];for(const u of h.split(`
`))u.startsWith("event:")?p=u.slice(6).trim():u.startsWith("data:")&&g.push(u.slice(5).trim());if(g.length)try{t({event:p,data:JSON.parse(g.join(`
`))})}catch{}}t({event:"done",data:{}})}catch(i){(i==null?void 0:i.name)!=="AbortError"&&t({event:"error",data:{message:i instanceof Error?i.message:String(i)}}),t({event:"done",data:{}})}})(),a}var mi=Object.defineProperty,L=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&mi(e,t,i),i};const is=4,yt=class yt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.connected=!1,this.onNavigate=()=>{},this._activeModel=null,this._modelCount=0,this._providerCount=0,this._recentLogs=[],this._gwModel="",this._gwModelProvider="",this._gwRunning=!1,this._gwPid=null,this._gwPort=null,this._maxConcurrent=null,this._gwBusy=!1,this._gwMessage="",this._gwVersion="",this._agentCount=null,this._defaultAgent="",this._agentIds=[],this._sessionCount=null,this._skillCount=null,this._servicesUp=0,this._license=null,this._storeUnsub=null,this._gwMsgTimer=null}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._refreshModelInfo(),this._refreshGatewayStatus().then(()=>this._refreshServiceHealth()),this._refreshLicense(),this._refreshWsInfo();const e=f();this._storeUnsub=e.subscribe(t=>{var a,i;(i=(a=t.hello)==null?void 0:a.server)!=null&&i.version&&(this._gwVersion=t.hello.server.version),t.connected&&(this._fetchRecentLogs(),this._refreshWsInfo())})}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this)}_refreshModelInfo(){this._activeModel=We(),this._modelCount=Ne().length,this._providerCount=ws().length}async _refreshGatewayStatus(){try{const t=await(await G(`${this._sidecarBase}/api/gateway/status`,{},8e3)).json();this._gwRunning=!!t.running,this._gwPid=t.pid??null,this._gwPort=t.port??null}catch{this._gwRunning=!1,this._gwPid=null,this._gwPort=null}}_setGwMessage(e,t=!1){this._gwMessage=e,this._gwMsgTimer&&clearTimeout(this._gwMsgTimer),t||(this._gwMsgTimer=setTimeout(()=>{this._gwMessage=""},6e3))}async _refreshServiceHealth(){const e=window.location.hostname||"127.0.0.1",[t,a,i]=await Promise.all([G(`${this._sidecarBase}/health`,{},3e3).then(o=>o.ok).catch(()=>!1),G(`${we()}/health`,{mode:"no-cors"},3e3).then(()=>!0).catch(()=>!1),G(`http://${e}:8080/api/status`,{},3e3).then(o=>o.ok).catch(()=>!1)]);this._servicesUp=[t,this._gwRunning,a,i].filter(Boolean).length}async _refreshWsInfo(){var t,a,i,o,n,c;const e=f();if((a=(t=e.snapshot.hello)==null?void 0:t.server)!=null&&a.version&&(this._gwVersion=e.snapshot.hello.server.version),!!e.connected){try{const h=await e.request("agents.list",{}),p=(h==null?void 0:h.agents)||[];this._agentCount=p.length,this._defaultAgent=(h==null?void 0:h.defaultId)||"",this._agentIds=p.map(g=>String(g.id??g.name??"")).filter(Boolean)}catch{}try{const h=await e.request("sessions.list",{});this._sessionCount=((h==null?void 0:h.sessions)||[]).length}catch{}try{const h=await e.request("skills.status",{});this._skillCount=((h==null?void 0:h.skills)||[]).length}catch{}if(!this._activeModel)try{const h=await e.request("config.get",{}),p=(h==null?void 0:h.config)||(h==null?void 0:h.parsed)||{},g=(o=(i=p==null?void 0:p.agents)==null?void 0:i.defaults)==null?void 0:o.model,u=typeof g=="string"?g:(g==null?void 0:g.model)||"";if(u){const S=u.indexOf("/");this._gwModelProvider=S>0?u.slice(0,S):"",this._gwModel=S>0?u.slice(S+1):u}const b=(c=(n=p==null?void 0:p.agents)==null?void 0:n.defaults)==null?void 0:c.maxConcurrent;this._maxConcurrent=typeof b=="number"?b:null}catch{}}}async _refreshLicense(){try{const e=await Ge();this._license=await gt(e)}catch{this._license=null}}async _callGateway(e){if(this._gwBusy)return;this._gwBusy=!0,this._setGwMessage(e==="stop"?"正在停止网关…":e==="start"?"正在启动网关…":"正在重启网关…",!0);const t=e==="stop"?2e4:e==="start"?45e3:6e4;try{const i=await(await G(`${this._sidecarBase}/api/gateway/${e}`,{method:"POST"},t)).json();this._setGwMessage(i.message||(i.started||i.restarted?"操作成功":"操作完成")),await this._refreshGatewayStatus(),await this._refreshServiceHealth()}catch(a){const i=a instanceof Error?a.message:String(a);this._setGwMessage(i.includes("aborted")?s("dashboard.opTimeout",{action:e}):s("dashboard.opFailed",{msg:i}))}finally{this._gwBusy=!1,setTimeout(()=>this._refreshGatewayStatus(),2e3)}}async _fetchRecentLogs(){const e=f();if(e.connected)try{const t=await e.request("logs.tail",{cursor:0,limit:8}),a=((t==null?void 0:t.lines)||[]).map(i=>{var o;if(typeof i!="string")return"";try{const n=JSON.parse(i);let c="gateway";const h=n[0]||((o=n==null?void 0:n._meta)==null?void 0:o.name);if(typeof h=="string")try{c=JSON.parse(h).subsystem||c}catch{c=h}return`[${(n.time||"").replace("T"," ").replace(/\.\d+.*$/,"")}] [${c}] ${n.message||n[1]||""}`}catch{return String(i)}}).filter(i=>i.trim());a.length&&(this._recentLogs=a)}catch{}}_licenseValue(){const e=this._license;return e?e.status==="ok"?{text:s("dashboard.licenseOk"),cls:"ok"}:e.status==="not_activated"?{text:s("dashboard.licenseNotActivated"),cls:"warn"}:{text:s("dashboard.licenseIssue"),cls:"warn"}:{text:"—",cls:""}}render(){var a,i;const e=Math.round(this._servicesUp/is*100),t=this._licenseValue();return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="dashboard-page">

        <!-- Top stat cards -->
        <div class="dashboard-stats">
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">
              Gateway
              <span class="dashboard-stat__status ${this._gwRunning?"online":"offline"}"></span>
            </div>
            <div class="dashboard-stat__value">${this._gwRunning?s("dashboard.running"):s("dashboard.stopped")}</div>
            <div class="dashboard-stat__hint">${this._gwPid?"PID: "+this._gwPid:"—"}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${s("dashboard.versionSinicized")}</div>
            <div class="dashboard-stat__value">${this._gwVersion||"—"}</div>
            <div class="dashboard-stat__hint">${s("dashboard.port")} ${this._gwPort??"—"}${this._gwPid?" · PID "+this._gwPid:""}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${s("dashboard.agentFleet")}</div>
            <div class="dashboard-stat__value">${this._agentCount===null?"—":this._agentCount+" 个"}</div>
            <div class="dashboard-stat__hint">${s("dashboard.defaultAgentLabel")}: ${this._defaultAgent||"—"}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${s("dashboard.modelPool")}</div>
            <div class="dashboard-stat__value">${this._modelCount} 个</div>
            <div class="dashboard-stat__hint">${s("dashboard.basedOn")} ${this._providerCount} ${s("dashboard.channelProviders")}</div>
          </div>
          <div class="dashboard-stat">
            <div class="dashboard-stat__label">${s("dashboard.basicServices")}</div>
            <div class="dashboard-stat__value">${this._servicesUp}/${is}</div>
            <div class="dashboard-stat__hint">${s("dashboard.survivalRate")} ${e}%</div>
          </div>
          <div class="dashboard-stat" style="cursor:pointer;" title=${s("dashboard.clickToOpen")}
            @click=${()=>{const o=bs(),n=o?`#token=${encodeURIComponent(o)}`:"";window.open(`http://${window.location.hostname||"127.0.0.1"}:${this._gwPort??18789}/${n}`,"_blank","noopener")}}>
            <div class="dashboard-stat__label">
              ${s("dashboard.controlUI")}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
            <div class="dashboard-stat__value" style="font-size:13px;">${s("dashboard.openclawNative")}</div>
            <div class="dashboard-stat__hint">${s("dashboard.clickToOpen")}</div>
          </div>
        </div>

        <!-- Info cards row 1 -->
        <div class="dashboard-info-grid">
          <div class="dashboard-info-card" @click=${()=>this.onNavigate("gateway")}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                GATEWAY
              </div>
              <div class="dashboard-info-card__actions">
                ${this._gwRunning?r`
                    <button class="btn-stop" ?disabled=${this._gwBusy} @click=${o=>{o.stopPropagation(),this._callGateway("stop")}}>${s("common.stop")}</button>
                    <button class="btn-restart" ?disabled=${this._gwBusy} @click=${o=>{o.stopPropagation(),this._callGateway("restart")}}>${s("common.restart")}</button>
                  `:r`
                    <button class="btn-restart" ?disabled=${this._gwBusy} @click=${o=>{o.stopPropagation(),this._callGateway("start")}}>${s("common.start")}</button>
                  `}
              </div>
            </div>
            <div class="dashboard-info-card__status ${this._gwRunning?"online":"offline"}">${this._gwRunning?s("dashboard.running"):s("dashboard.stopped")}</div>
            <div class="dashboard-info-card__sub">${this._gwMessage||s("dashboard.port")+` ${this._gwPort??"—"} · `+(this._gwPid?"PID "+this._gwPid:"—")}</div>
          </div>
          <div class="dashboard-info-card" @click=${()=>this.onNavigate("models")}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                ${s("dashboard.mainModel")}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._activeModel?this._activeModel.model:this._gwModel||s("dashboard.notSet")}</div>
            <div class="dashboard-info-card__sub">${this._activeModel?`${this._activeModel.providerName} · ${this._activeModel.apiType}`:this._gwModel?`${this._gwModelProvider?this._gwModelProvider+" · ":""}${s("dashboard.fromGatewayConfig")}`:`${s("dashboard.concurrencyLimit")} ${this._maxConcurrent??"—"}`}</div>
          </div>
          <div class="dashboard-info-card" @click=${()=>this.onNavigate("skills2")}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                ${s("dashboard.mcpTools")}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._skillCount===null?"—":this._skillCount}</div>
            <div class="dashboard-info-card__sub">${s("dashboard.builtinSkills")}</div>
          </div>
        </div>

        <!-- Info cards row 2 -->
        <div class="dashboard-info-grid">
          <div class="dashboard-info-card static">
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                ${s("dashboard.licenseCard")}
              </div>
            </div>
            <div class="dashboard-info-card__value ${t.cls}">${t.text}</div>
            <div class="dashboard-info-card__sub">${((a=this._license)==null?void 0:a.device_name)||((i=this._license)==null?void 0:i.message)||""}</div>
          </div>
          <div class="dashboard-info-card" @click=${()=>this.onNavigate("agents")}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                AGENT ${s("dashboard.agentFleet")}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._agentCount===null?"—":this._agentCount}</div>
            <div class="dashboard-info-card__sub">${this._agentIds.length?this._agentIds.join(" · "):"—"}</div>
          </div>
          <div class="dashboard-info-card" @click=${()=>this.onNavigate("chat")}>
            <div class="dashboard-info-card__header">
              <div class="dashboard-info-card__title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${s("dashboard.activeSessions")}
              </div>
            </div>
            <div class="dashboard-info-card__value">${this._sessionCount===null?"—":this._sessionCount}</div>
            <div class="dashboard-info-card__sub">${s("dashboard.sessionSource")}</div>
          </div>
        </div>

        <!-- WebSocket status -->
        <div class="dashboard-ws">
          <span class="dashboard-ws__dot ${this.connected?"connected":"disconnected"}"></span>
          WebSocket ${this.connected?s("dashboard.wsConnected"):s("dashboard.wsDisconnected")}
          ${this._gwVersion?r`<span style="margin-left:auto;font-size:12px;color:var(--muted);">v${this._gwVersion}</span>`:""}
        </div>

        <!-- Action buttons -->
        <div class="dashboard-actions">
          <button ?disabled=${this._gwBusy} @click=${()=>this._callGateway("restart")}>${this._gwBusy&&this._gwMessage?this._gwMessage:s("dashboard.restartGw")}</button>
          <button @click=${()=>this.dispatchEvent(new CustomEvent("check-updates"))}>${s("dashboard.checkUpdates")}</button>
        </div>

        <!-- Recent logs -->
        <div class="dashboard-logs">
          <div class="dashboard-logs__title">${s("dashboard.recentLogs")}</div>
          <div class="dashboard-logs__body">
            ${this._recentLogs.length?this._recentLogs.map(o=>r`${o}\n`):r`…`}
          </div>
        </div>

      </div>
    `}};yt.styles=A`
    :host { display: block; }

    .dashboard-page { width: 100%; }

    /* === stat cards row === */
    .dashboard-stats {
      display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px;
    }
    @media (max-width: 1400px) { .dashboard-stats { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 700px) { .dashboard-stats { grid-template-columns: repeat(2, 1fr); } }
    .dashboard-stat {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card); position: relative;
    }
    .dashboard-stat__label {
      font-size: 12px; color: var(--muted); margin-bottom: 8px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .dashboard-stat__value {
      font-size: 18px; font-weight: 700; color: var(--text-strong); margin-bottom: 2px;
    }
    .dashboard-stat__hint {
      font-size: 12px; color: var(--text-soft); line-height: 1.4;
    }
    .dashboard-stat__status {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .dashboard-stat__status.online { background: var(--success); }
    .dashboard-stat__status.offline { background: var(--muted); }

    /* === info cards === */
    .dashboard-info-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;
    }
    @media (max-width: 900px) { .dashboard-info-grid { grid-template-columns: 1fr; } }
    .dashboard-info-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card); cursor: pointer;
      transition: border-color var(--duration-fast);
    }
    .dashboard-info-card:hover { border-color: var(--accent); }
    .dashboard-info-card.static { cursor: default; }
    .dashboard-info-card.static:hover { border-color: var(--border); }
    .dashboard-info-card__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .dashboard-info-card__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 600; color: var(--text-soft);
    }
    .dashboard-info-card__title svg { color: var(--text-soft); }
    .dashboard-info-card__actions { display: flex; gap: 6px; }
    .dashboard-info-card__actions button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .dashboard-info-card__actions .btn-stop {
      background: var(--danger-subtle); color: var(--danger); border-color: rgba(239,68,68,0.2);
    }
    .dashboard-info-card__actions .btn-stop:hover { background: rgba(239,68,68,0.2); }
    .dashboard-info-card__actions .btn-restart {
      background: transparent; color: var(--text-soft);
    }
    .dashboard-info-card__actions .btn-restart:hover { background: var(--bg-hover); color: var(--text); }
    .dashboard-info-card__value {
      font-size: 15px; font-weight: 600; color: var(--text-strong); margin-bottom: 2px;
    }
    .dashboard-info-card__value.ok { color: var(--success); }
    .dashboard-info-card__value.warn { color: var(--warn); }
    .dashboard-info-card__sub {
      font-size: 12px; color: var(--muted); word-break: break-all;
    }
    .dashboard-info-card__status {
      font-size: 14px; font-weight: 600; margin-bottom: 2px;
    }
    .dashboard-info-card__status.online { color: var(--success); }
    .dashboard-info-card__status.offline { color: var(--muted); }

    /* === websocket status === */
    .dashboard-ws {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 14px 18px; margin-bottom: 16px; box-shadow: var(--shadow-card);
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 500;
    }
    .dashboard-ws__dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .dashboard-ws__dot.connected { background: var(--success); }
    .dashboard-ws__dot.disconnected { background: var(--muted); }

    /* === action buttons === */
    .dashboard-actions {
      display: flex; gap: 8px; margin-bottom: 16px;
    }
    .dashboard-actions button {
      padding: 8px 18px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--bg-muted); color: var(--text-soft); transition: all var(--duration-fast);
    }
    .dashboard-actions button:hover { background: var(--bg-hover); color: var(--text); }

    /* === logs === */
    .dashboard-logs {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 18px; box-shadow: var(--shadow-card);
    }
    .dashboard-logs__title {
      font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 12px;
    }
    .dashboard-logs__body {
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 12px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6;
      color: var(--text); max-height: 240px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
    }
  `;let P=yt;L([m({type:String})],P.prototype,"title");L([m({type:String})],P.prototype,"subtitle");L([m({type:Boolean})],P.prototype,"connected");L([m({type:Function})],P.prototype,"onNavigate");L([d()],P.prototype,"_activeModel");L([d()],P.prototype,"_modelCount");L([d()],P.prototype,"_providerCount");L([d()],P.prototype,"_recentLogs");L([d()],P.prototype,"_gwModel");L([d()],P.prototype,"_gwModelProvider");L([d()],P.prototype,"_gwRunning");L([d()],P.prototype,"_gwPid");L([d()],P.prototype,"_gwPort");L([d()],P.prototype,"_maxConcurrent");L([d()],P.prototype,"_gwBusy");L([d()],P.prototype,"_gwMessage");L([d()],P.prototype,"_gwVersion");L([d()],P.prototype,"_agentCount");L([d()],P.prototype,"_defaultAgent");L([d()],P.prototype,"_agentIds");L([d()],P.prototype,"_sessionCount");L([d()],P.prototype,"_skillCount");L([d()],P.prototype,"_servicesUp");L([d()],P.prototype,"_license");customElements.define("dashboard-page",P);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const vi={CHILD:2},bi=l=>(...e)=>({_$litDirective$:l,values:e});class fi{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,a){this._$Ct=e,this._$AM=t,this._$Ci=a}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class lt extends fi{constructor(e){if(super(e),this.it=Zt,e.type!==vi.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===Zt||e==null)return this._t=void 0,this.it=e;if(e===zs)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}lt.directiveName="unsafeHTML",lt.resultType=1;const dt=bi(lt);var _i=Object.defineProperty,$s=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&_i(e,t,i),i};function as(l){return l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function os(l){const e=l.trim();return/^(https?:|mailto:|#|\/|\.\/|\.\.\/)/i.test(e)?e:"#"}function De(l){const e=[],t=a=>(e.push(a),"\0"+(e.length-1)+"\0");return l=l.replace(/`([^`\n]+)`/g,(a,i)=>t('<code class="md-icode">'+i+"</code>")),l=l.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(a,i,o)=>t(`<img class="md-img" src="${os(o)}" alt="${i}" loading="lazy" />`)),l=l.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(a,i,o)=>t(`<a class="md-a" href="${os(o)}" target="_blank" rel="noopener noreferrer">${i}</a>`)),l=l.replace(/\*\*([^\n]+?)\*\*/g,"<strong>$1</strong>"),l=l.replace(/__([^\n]+?)__/g,"<strong>$1</strong>"),l=l.replace(/(^|[\s(（])\*([^*\n]+)\*(?=[\s).,!?:;）]|$)/g,"$1<em>$2</em>"),l=l.replace(/(^|[\s(（])_([^_\n]+)_(?=[\s).,!?:;）]|$)/g,"$1<em>$2</em>"),l=l.replace(/~~([^\n]+?)~~/g,"<del>$1</del>"),l=l.replace(/\x00(\d+)\x00/g,(a,i)=>e[Number(i)]??""),l}const xi=/^```(\w*)\s*$/,rs=/^\s*(-{3,}|\*{3,}|_{3,})\s*$/,je=/^\s*&gt;\s?/,Ke=/^\s*([-*+]|\d+\.)\s+/,wi=/^\s*\d+\.\s+/;function yi(l){const t=as(l.replace(/\r\n/g,`
`).replace(/\r/g,`
`)).split(`
`),a=[],i=t.length;let o=0;const n=s("common.copy");for(;o<i;){const c=t[o],h=c.match(xi);if(h){const u=h[1]||"",b=[];for(o++;o<i&&!/^```\s*$/.test(t[o]);)b.push(t[o]),o++;o++,a.push(`<div class="md-code"><div class="md-code__bar"><span class="md-code__lang">${as(u)||"code"}</span><button class="md-copy" type="button" title="${n}">${n}</button></div><pre class="md-code__pre"><code>`+b.join(`
`)+"</code></pre></div>");continue}if(/^\s*$/.test(c)){o++;continue}const p=c.match(/^(#{1,6})\s+(.*)$/);if(p){const u=p[1].length;a.push(`<h${u} class="md-h md-h${u}">${De(p[2])}</h${u}>`),o++;continue}if(rs.test(c)){a.push('<hr class="md-hr" />'),o++;continue}if(je.test(c)){const u=[];for(;o<i&&je.test(t[o]);)u.push(t[o].replace(je,"")),o++;a.push('<blockquote class="md-quote">'+u.map(b=>De(b)).join("<br />")+"</blockquote>");continue}if(c.includes("|")&&o+1<i&&t[o+1].includes("-")&&/^\s*\|?[\s:|-]+\|?\s*$/.test(t[o+1])){const u=T=>T.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(Y=>Y.trim()),b=u(c);o+=2;const S=[];for(;o<i&&t[o].includes("|")&&!/^\s*$/.test(t[o]);)S.push(u(t[o])),o++;let _='<div class="md-tablewrap"><table class="md-table"><thead><tr>';for(const T of b)_+=`<th>${De(T)}</th>`;_+="</tr></thead><tbody>";for(const T of S){_+="<tr>";for(let Y=0;Y<b.length;Y++)_+=`<td>${De(T[Y]??"")}</td>`;_+="</tr>"}_+="</tbody></table></div>",a.push(_);continue}if(Ke.test(c)){const u=wi.test(c),b=[];for(;o<i&&Ke.test(t[o]);)b.push(t[o].replace(Ke,"")),o++;const S=u?"ol":"ul";a.push(`<${S} class="md-list md-${S}">`+b.map(_=>`<li>${De(_)}</li>`).join("")+`</${S}>`);continue}const g=[c];for(o++;o<i&&!/^\s*$/.test(t[o])&&!/^```/.test(t[o])&&!/^(#{1,6})\s+/.test(t[o])&&!Ke.test(t[o])&&!je.test(t[o])&&!rs.test(t[o]);)g.push(t[o]),o++;a.push('<p class="md-p">'+g.map(u=>De(u.trim())).join("<br />")+"</p>")}return a.join(`
`)}const kt=class kt extends C{constructor(){super(...arguments),this.text="",this._copiedEl=null}_onClick(e){var n,c;const t=e.target.closest(".md-copy");if(!t)return;const a=(n=t.closest(".md-code"))==null?void 0:n.querySelector("code"),i=(a==null?void 0:a.textContent)??"",o=()=>{t.classList.add("ok"),t.textContent=s("common.copied"),this._copiedEl=t,setTimeout(()=>{t.classList.remove("ok"),t.textContent=s("common.copy"),this._copiedEl===t&&(this._copiedEl=null)},1500)};(c=navigator.clipboard)!=null&&c.writeText?navigator.clipboard.writeText(i).then(o).catch(()=>this._fallbackCopy(i,o)):this._fallbackCopy(i,o)}_fallbackCopy(e,t){const a=document.createElement("textarea");a.value=e,a.style.position="fixed",a.style.opacity="0",document.body.appendChild(a),a.select();try{document.execCommand("copy"),t()}catch{}document.body.removeChild(a)}render(){return r`<div class="md" @click=${this._onClick}>${dt(yi(this.text||""))}</div>`}};kt.styles=A`
    :host { display: block; min-width: 0; }
    .md {
      color: var(--text); font-size: 14px; line-height: 1.7;
      word-break: break-word; overflow-wrap: break-word;
    }
    .md > :first-child { margin-top: 0; }
    .md > :last-child { margin-bottom: 0; }

    /* 段落 / 标题 */
    .md-p { margin: 0 0 10px; }
    .md-h { color: var(--text-strong); font-weight: 700; line-height: 1.35; margin: 16px 0 8px; letter-spacing: -0.01em; }
    .md-h1 { font-size: 19px; padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .md-h2 { font-size: 16.5px; }
    .md-h3 { font-size: 15px; }
    .md-h4, .md-h5, .md-h6 { font-size: 14px; }

    /* 行内代码 */
    .md-icode {
      font-family: var(--font-mono); font-size: 12.5px;
      background: color-mix(in srgb, var(--accent) 12%, transparent);
      color: var(--accent); border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
      border-radius: 5px; padding: 1px 6px; white-space: nowrap;
    }

    /* 代码块 */
    .md-code {
      margin: 12px 0; border: 1px solid var(--border);
      border-radius: var(--radius-md); overflow: hidden;
      background: var(--input);
      transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
    }
    .md-code:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); box-shadow: 0 2px 14px rgba(0,0,0,0.16); }
    .md-code__bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 12px; background: var(--bg-hover);
      border-bottom: 1px solid var(--border);
    }
    .md-code__lang {
      font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--muted);
    }
    .md-copy {
      font-size: 11px; font-weight: 500; font-family: inherit;
      color: var(--text-soft); background: transparent;
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 2px 10px; cursor: pointer;
      transition: all var(--duration-fast) ease;
    }
    .md-copy:hover { color: var(--accent); border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
    .md-copy.ok { color: var(--success); border-color: var(--success); }
    .md-code__pre {
      margin: 0; padding: 12px 14px; overflow-x: auto;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .md-code__pre::-webkit-scrollbar { height: 6px; }
    .md-code__pre::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    .md-code__pre code {
      font-family: var(--font-mono); font-size: 12.5px; line-height: 1.65;
      color: var(--text); white-space: pre;
    }

    /* 列表 */
    .md-list { margin: 4px 0 10px; padding-left: 22px; }
    .md-list li { margin: 3px 0; line-height: 1.65; }
    .md-list li::marker { color: var(--accent); font-weight: 600; }

    /* 引用 */
    .md-quote {
      margin: 10px 0; padding: 8px 14px;
      border-left: 3px solid var(--accent);
      background: color-mix(in srgb, var(--accent) 7%, transparent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      color: var(--text-soft); font-style: italic;
    }

    /* 表格 */
    .md-tablewrap { margin: 12px 0; overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); }
    .md-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .md-table th {
      text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600;
      letter-spacing: 0.04em; color: var(--muted);
      background: var(--bg-hover); border-bottom: 1px solid var(--border); white-space: nowrap;
    }
    .md-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); color: var(--text); }
    .md-table tr:last-child td { border-bottom: none; }
    .md-table tbody tr { transition: background var(--duration-fast) ease; }
    .md-table tbody tr:hover { background: var(--bg-hover); }

    /* 链接 / 图片 / 分割线 */
    .md-a { color: var(--accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); transition: border-color var(--duration-fast) ease; }
    .md-a:hover { border-bottom-color: var(--accent); }
    .md-img { max-width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border); margin: 6px 0; }
    .md-hr { border: none; height: 1px; margin: 16px 0; background: linear-gradient(90deg, transparent, var(--border-strong), transparent); }
  `;let Re=kt;$s([m({type:String})],Re.prototype,"text");$s([d()],Re.prototype,"_copiedEl");customElements.define("oc-markdown",Re);const ki="lxup.codex.url",$i="lxup.codex.key";function et(){try{const e=localStorage.getItem(ki);if(e)return e.replace(/\/+$/,"")}catch{}return`http://${typeof window<"u"&&window.location.hostname||"127.0.0.1"}:7889`}function tt(){const l={"Content-Type":"application/json"};try{const e=localStorage.getItem($i);e&&(l.Authorization=`Bearer ${e}`)}catch{}return l}async function mt(l){let e=s("common.codexError",{status:String(l.status)});try{const t=await l.json();t!=null&&t.detail?e=t.detail:t!=null&&t.message&&(e=t.message)}catch{}return e}async function st(l){const e=await fetch(`${et()}${l}`,{headers:tt()});if(!e.ok)throw new Error(await mt(e));return await e.json()}async function Cs(l,e){const t=await fetch(`${et()}${l}`,{method:"POST",headers:tt(),body:e===void 0?void 0:JSON.stringify(e)});if(!t.ok)throw new Error(await mt(t));return await t.json()}async function Ss(){return st("/api/codex/status")}async function Ci(){try{return!!(await Ss()).installed}catch{return!1}}async function ct(){return st("/api/codex/config")}async function Si(l){return Cs("/api/codex/config",l)}async function Ai(l=100){return(await st(`/api/codex/sessions?limit=${l}`)).data||[]}async function ns(){return(await Cs("/api/codex/sessions",{})).session}async function Mi(l){await fetch(`${et()}/api/codex/sessions/${encodeURIComponent(l)}`,{method:"DELETE",headers:tt()})}async function Ti(l){return(await st(`/api/codex/sessions/${encodeURIComponent(l)}/messages`)).data||[]}function Di(l,e,t){const a=new AbortController;return(async()=>{try{const i=await fetch(`${et()}/api/codex/sessions/${encodeURIComponent(l)}/chat/stream`,{method:"POST",headers:tt(),body:JSON.stringify({content:e}),signal:a.signal});if(!i.ok||!i.body){t({event:"error",data:{message:await mt(i)}}),t({event:"done",data:{}});return}const o=i.body.getReader(),n=new TextDecoder;let c="";for(;;){const{done:h,value:p}=await o.read();if(h)break;c+=n.decode(p,{stream:!0});let g;for(;(g=c.indexOf(`

`))>=0;){const u=c.slice(0,g);c=c.slice(g+2);let b="message";const S=[];for(const T of u.split(`
`))T.startsWith("event:")?b=T.slice(6).trim():T.startsWith("data:")&&S.push(T.slice(5).trim());if(!S.length)continue;let _={};try{_=JSON.parse(S.join(`
`))}catch{continue}t({event:b,data:_})}}t({event:"done",data:{}})}catch(i){(i==null?void 0:i.name)!=="AbortError"&&t({event:"error",data:{message:i instanceof Error?i.message:String(i)}}),t({event:"done",data:{}})}})(),a}function vt(l){return typeof l=="string"?l:Array.isArray(l)?l.filter(e=>typeof e=="object"&&e!==null&&e.type==="text").map(e=>String(e.text??"")).join(""):""}function Je(l){if(typeof l=="number")return l<1e12?Math.round(l*1e3):Math.round(l);if(typeof l=="string"){const e=Date.parse(l);return Number.isNaN(e)?null:e}return null}function Pi(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():`run-${Date.now()}-${Math.random().toString(36).slice(2)}`}class Ii{constructor(e){this.store=e,this.id="openclaw"}ready(){return this.store.connected}async refresh(){}onReadyChange(e){return this.store.subscribe(t=>e(t.connected))}onSessionsChange(e){return this.store.onEvent("sessions.changed",()=>e())}defaultSessionId(){return"agent:main:main"}async listSessions(){const e=await this.store.request("sessions.list",{});return((e==null?void 0:e.sessions)||[]).map(t=>({id:String(t.key??""),name:String(t.displayName??t.key??""),updatedAt:typeof t.updatedAt=="number"?t.updatedAt:null})).filter(t=>t.id)}async getHistory(e){const t=await this.store.request("chat.history",{sessionKey:e,limit:100});return((t==null?void 0:t.messages)||[]).filter(a=>a.role==="user"||a.role==="assistant").map(a=>({role:a.role,text:vt(a.content)})).filter(a=>a.text)}async createSession(){return null}async deleteSession(e){try{const t=await this.store.request("sessions.delete",{key:e});return!!(t!=null&&t.ok||t!=null&&t.deleted)}catch{return!1}}send(e,t,a,i){const o=Pi();let n=o;const c=this.store.onEvent("chat",h=>{if(!h||h.sessionKey!==e||h.runId&&n&&h.runId!==n)return;const p=h.state;p==="delta"?a({type:"delta",text:String(h.deltaText??""),replace:h.replace===!0}):p==="final"?(a({type:"final"}),c()):(p==="aborted"||p==="error")&&(a({type:"error",message:String(h.errorMessage??s("common.requestFailed"))}),c())});return this.store.request("chat.send",{sessionKey:e,message:t,idempotencyKey:o,deliver:!1,...i&&i.length?{attachments:i}:{}}).then(h=>{h!=null&&h.runId&&(n=h.runId)}).catch(h=>{a({type:"error",message:h instanceof Error?h.message:String(h)}),c()}),{abort:()=>c()}}}class zi{constructor(){this.id="hermes",this._ready=!1,this._cbs=new Set}ready(){return this._ready}async refresh(){try{await ci(),this._setReady(!0)}catch{this._setReady(!1)}}_setReady(e){if(e!==this._ready){this._ready=e;for(const t of this._cbs)t(e)}}onReadyChange(e){return this._cbs.add(e),()=>{this._cbs.delete(e)}}defaultSessionId(){return""}async listSessions(){return(await hi(100)).map(t=>({id:t.id,name:t.title||t.id,updatedAt:Je(t.last_active)}))}async getHistory(e){return e?(await gi(e)).filter(a=>a.role==="user"||a.role==="assistant").map(a=>({role:a.role,text:vt(a.content)})).filter(a=>a.text):[]}async createSession(){const e=await ss();return{id:e.id,name:e.title||e.id,updatedAt:Je(e.last_active)}}async deleteSession(e){try{return await pi(e),!0}catch{return!1}}send(e,t,a,i){let o=!1,n=null;return(async()=>{let c=e;try{c||(c=(await ss()).id)}catch(g){a({type:"error",message:g instanceof Error?g.message:String(g)}),a({type:"final"});return}if(o)return;let h="",p=!1;n=ui(c,t,g=>{const u=g.data;switch(g.event){case"assistant.delta":{const b=String(u.delta??"");h+=b,a({type:"delta",text:b});break}case"tool.progress":p||(p=!0,a({type:"tool",tool:{name:"thinking",running:!0}}));break;case"tool.started":a({type:"tool",tool:{name:String(u.tool_name??"tool"),args:u.args||void 0,running:!0}});break;case"tool.completed":a({type:"tool",tool:{name:String(u.tool_name??"tool"),result:u.preview!=null?String(u.preview):"",ok:!0,running:!1}});break;case"tool.failed":a({type:"tool",tool:{name:String(u.tool_name??"tool"),result:u.preview!=null?String(u.preview):"失败",ok:!1,running:!1}});break;case"assistant.completed":{const b=u.content!=null?String(u.content):"";b&&b!==h&&a({type:"delta",replace:!0,text:b}),p&&a({type:"tool",tool:{name:"thinking",result:"",ok:!0,running:!1}});break}case"error":a({type:"error",message:String(u.message??s("common.hermesErrorPlain"))});break;case"done":a({type:"final"});break;default:break}})})(),{abort:()=>{o=!0,n==null||n.abort()}}}}class Oi{constructor(){this.id="codex",this._ready=!1,this._cbs=new Set}ready(){return this._ready}async refresh(){this._setReady(await Ci())}_setReady(e){if(e!==this._ready){this._ready=e;for(const t of this._cbs)t(e)}}onReadyChange(e){return this._cbs.add(e),()=>{this._cbs.delete(e)}}defaultSessionId(){return""}async listSessions(){return(await Ai(100)).map(t=>({id:t.id,name:t.title||t.id,updatedAt:Je(t.updatedAt)}))}async getHistory(e){return e?(await Ti(e)).filter(a=>a.role==="user"||a.role==="assistant").map(a=>({role:a.role,text:vt(a.content)})).filter(a=>a.text):[]}async createSession(){const e=await ns();return{id:e.id,name:e.title||e.id,updatedAt:Je(e.updatedAt)}}async deleteSession(e){try{return await Mi(e),!0}catch{return!1}}send(e,t,a,i){let o=!1,n=null;return(async()=>{let c=e;try{c||(c=(await ns()).id)}catch(g){a({type:"error",message:g instanceof Error?g.message:String(g)}),a({type:"final"});return}if(o)return;let h="",p=!1;n=Di(c,t,g=>{const u=g.data;switch(g.event){case"assistant.delta":{const b=String(u.delta??"");h+=b,a({type:"delta",text:b});break}case"tool.progress":p||(p=!0,a({type:"tool",tool:{name:"thinking",running:!0}}));break;case"tool.started":a({type:"tool",tool:{name:String(u.tool_name??"tool"),args:u.args||void 0,running:!0}});break;case"tool.completed":a({type:"tool",tool:{name:String(u.tool_name??"tool"),result:u.preview!=null?String(u.preview):"",ok:!0,running:!1}});break;case"tool.failed":a({type:"tool",tool:{name:String(u.tool_name??"tool"),result:u.preview!=null?String(u.preview):"失败",ok:!1,running:!1}});break;case"assistant.completed":{const b=u.content!=null?String(u.content):"";b&&b!==h&&a({type:"delta",replace:!0,text:b}),p&&a({type:"tool",tool:{name:"thinking",result:"",ok:!0,running:!1}});break}case"error":a({type:"error",message:String(u.message??s("common.codexErrorPlain"))});break;case"done":a({type:"final"});break;default:break}})})(),{abort:()=>{o=!0,n==null||n.abort()}}}}function Ei(l,e){return l==="hermes"?new zi:l==="codex"?new Oi:new Ii(e.store)}var Li=Object.defineProperty,k=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Li(e,t,i),i};function Bi(l){const e=Date.now()-l,t=Math.floor(e/6e4);if(t<1)return s("chat.justNow");if(t<60)return s("chat.minutesAgo",{n:t});const a=Math.floor(t/60);if(a<24)return s("chat.hoursAgo",{n:a});const i=Math.floor(a/24);return i===1?s("chat.yesterday"):i<7?s("chat.daysAgo",{n:i}):new Date(l).toLocaleDateString()}var le;const y=(le=class extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.connected=!1,this.engine="openclaw",this.onNavigate=e=>{},this._input="",this._messages=[],this._pendingImages=[],this._imgGenMode=!1,this._showSessionList=!1,this._showBanner=!0,this._sessionKey="",this._sessions=[],this._loadingHistory=!1,this._engineReady=!1,this._refreshing=!1,this._wsName="",this._wsPath="",this._wsPanelOpen=!1,this._wsCore=[],this._wsTree={},this._wsOpenDirs={"":!0},this._wsSel="",this._wsContent="",this._wsEditing=!1,this._wsBusy=!1,this._wsMsg="",this._wsDirty=!1,this._wsMsgTimer=null,this._scOpen=!1,this._pollTimer=null,this._streaming=!1,this._models=[],this._activeModel=null,this._modelWarning="",this._readyUnsub=null,this._sessUnsub=null,this._chatCancel=null,this._historyLoaded=!1,this._inited=!1,this._confirmDeleteId=null,this._deleting=!1,this._wsOnKey=e=>{e.key==="Escape"&&this._closeWsPanel()},this._scOnKey=e=>{e.key==="Escape"&&this._toggleSc()}}connectedCallback(){super.connectedCallback(),this._refreshModels(),this._setupEngine(),this._inited=!0,this._pollTimer=window.setInterval(()=>{var t;this.engine!=="openclaw"&&((t=this._engineAdapter)==null||t.refresh()),this._refreshModels()},5e3);const e=sessionStorage.getItem("lxup.chat.prefill");e&&(this._input=e,sessionStorage.removeItem("lxup.chat.prefill"))}updated(e){this._inited&&e.has("engine")&&(this._setupEngine(),this._refreshModels(),this._wsPanelOpen=!1,this._wsSel="",this._wsContent="",this._wsTree={},this._wsCore=[],this._wsName="",this._wsPath="",this._loadWorkspace())}disconnectedCallback(){super.disconnectedCallback(),this._pollTimer!==null&&(clearInterval(this._pollTimer),this._pollTimer=null),document.removeEventListener("keydown",this._wsOnKey),document.removeEventListener("keydown",this._scOnKey),this._wsMsgTimer&&(window.clearTimeout(this._wsMsgTimer),this._wsMsgTimer=null),this._teardownEngine()}_setupEngine(){const e=this.engine==="hermes"||this.engine==="codex"?this.engine:"openclaw";this._engineAdapter&&this._engineAdapter.id===e||(this._teardownEngine(),this._engineAdapter=Ei(e,{store:f()}),this._messages=[],this._sessions=[],this._sessionKey="",this._historyLoaded=!1,this._streaming=!1,this._engineReady=!1,this._readyUnsub=this._engineAdapter.onReadyChange(t=>{this._engineReady=t,t&&(this._refreshModels(),this._loadWorkspace(),this._historyLoaded||(this._historyLoaded=!0,this._bootstrapSessions()))}),this._engineAdapter.onSessionsChange&&(this._sessUnsub=this._engineAdapter.onSessionsChange(()=>void this._loadSessions())),this._engineAdapter.refresh())}_teardownEngine(){var e,t,a;(e=this._readyUnsub)==null||e.call(this),this._readyUnsub=null,(t=this._sessUnsub)==null||t.call(this),this._sessUnsub=null,(a=this._chatCancel)==null||a.abort(),this._chatCancel=null}async _bootstrapSessions(){if(await this._loadSessions(),!this._sessionKey){const e=this._engineAdapter.defaultSessionId();if(e)this._sessionKey=e;else if(this._sessions.length)this._sessionKey=this._sessions[0].id;else try{const t=await this._engineAdapter.createSession();t&&(this._sessionKey=t.id,this._sessions=[t,...this._sessions])}catch{}}await this._loadHistory()}async _loadSessions(){try{this._sessions=await this._engineAdapter.listSessions()}catch{}}async _loadHistory(){if(this._sessionKey){this._loadingHistory=!0;try{const e=await this._engineAdapter.getHistory(this._sessionKey);this._messages=e.map(t=>({role:t.role,text:t.text})),this._scrollToBottom()}catch{}finally{this._loadingHistory=!1}}}async _ensureSession(){if(this._sessionKey)return this._sessionKey;const e=this._engineAdapter.defaultSessionId();if(e)return this._sessionKey=e,e;try{const t=await this._engineAdapter.createSession();t&&(this._sessionKey=t.id,this._sessions=[t,...this._sessions])}catch{}return this._sessionKey}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}_refreshModels(){if(this.engine==="hermes"){fetch(`${this._sidecarBase}/api/hermes/model`,{headers:x()}).then(t=>t.ok?t.json():null).then(t=>{const a=t!=null&&t.name?String(t.name):"";this._models=a?[{providerId:"hermes",providerName:"Hermes",baseUrl:"",apiKey:"",apiType:"openai",model:a,isPrimary:!0}]:[],this._activeModel=this._models[0]||null}).catch(()=>{this._models=[],this._activeModel=null});return}if(this.engine==="codex"){ct().then(t=>{const a=t!=null&&t.model?String(t.model):"";this._models=a?[{providerId:"codex",providerName:"Codex",baseUrl:"",apiKey:"",apiType:"openai",model:a,isPrimary:!0}]:[],this._activeModel=this._models[0]||null}).catch(()=>{this._models=[],this._activeModel=null});return}this._models=Ne(),this._activeModel=We();const e=f();this.engine==="openclaw"&&e.connected&&e.request("config.get",{}).then(t=>{const a=ii((t==null?void 0:t.config)||(t==null?void 0:t.parsed)||t);if(!a.length)return;const i=new Set(this._models.map(o=>`${o.providerId}::${o.model}`));this._models=[...this._models,...a.filter(o=>!i.has(`${o.providerId}::${o.model}`))],this._activeModel||(this._activeModel=this._models[0])}).catch(()=>{})}_onSelectModel(e){const t=e.target.value,a=this._models.find(i=>`${i.providerId}::${i.model}`===t);a&&(ai(a),this._activeModel=a)}async _send(){const e=this._input.trim(),t=this._pendingImages;if(!e&&t.length===0||this._streaming)return;if(e.startsWith("/")&&this._scCommands().flatMap(h=>h.items).find(h=>h.cmd===e||h.needsArg&&e.startsWith(`${h.cmd} `))){this._messages=[...this._messages,{role:"user",text:e}],this._input="",this._scrollToBottom(),this._execSlash(e);return}if(!this._engineAdapter.ready()){this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${s("chat.engineOffline")}`}],this._scrollToBottom();return}const a=t.map(n=>({type:"image",mimeType:n.mime,fileName:n.name,content:n.dataUrl.split(",")[1]||""})),i=this.engine==="openclaw";this._messages=[...this._messages,{role:"user",text:e,images:t.length?t.map(n=>n.dataUrl):void 0}],this._input="",this._pendingImages=[],this._streaming=!0,this._scrollToBottom();const o=await this._ensureSession();if(!o){this._streaming=!1,this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${s("chat.engineOffline")}`}],this._scrollToBottom();return}this._chatCancel=this._engineAdapter.send(o,e,n=>this._onEngineEvent(n),i&&a.length?a:void 0),!i&&a.length&&(this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${s("chat.imgUnsupported")}`}],this._scrollToBottom())}_onPickImages(e){const t=e.target;for(const a of Array.from(t.files||[])){if(!a.type.startsWith("image/"))continue;if(a.size>10*1024*1024){this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${s("chat.imgTooLarge",{name:a.name})}`}],this._scrollToBottom();continue}const i=new FileReader;i.onload=()=>{this._pendingImages=[...this._pendingImages,{name:a.name,mime:a.type,dataUrl:String(i.result)}]},i.readAsDataURL(a)}t.value=""}_onEngineEvent(e){if(e.type==="delta"){const t=[...this._messages],a=t[t.length-1];e.replace?a&&a.role==="assistant"?t[t.length-1]={...a,text:e.text}:t.push({role:"assistant",text:e.text}):e.text&&(a&&a.role==="assistant"?t[t.length-1]={...a,text:a.text+e.text}:t.push({role:"assistant",text:e.text})),this._messages=t,this._scrollToBottom()}else if(e.type==="tool"){const t=[...this._messages];let a=t[t.length-1];(!a||a.role!=="assistant")&&(a={role:"assistant",text:"",tools:[]},t.push(a));const i=[...a.tools||[]],o=e.tool;if(o.running)i.push({name:o.name,args:o.args,running:!0});else{let n=!1;for(let c=i.length-1;c>=0;c--)if(i[c].running&&i[c].name===o.name){i[c]={...i[c],ok:o.ok,result:o.result,running:!1},n=!0;break}n||i.push({name:o.name,ok:o.ok,result:o.result,running:!1})}t[t.length-1]={...a,tools:i},this._messages=t,this._scrollToBottom()}else e.type==="final"?(this._streaming=!1,this._chatCancel=null,this._loadSessions()):e.type==="error"&&(this._streaming=!1,this._chatCancel=null,this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${e.message}`}],this._scrollToBottom())}_scrollToBottom(){requestAnimationFrame(()=>{const e=this.renderRoot.querySelector(".chat-messages");e&&(e.scrollTop=e.scrollHeight)})}_onKeydown(e){e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),this._send())}_toggleSessionList(){this._showSessionList=!this._showSessionList}async _deleteSession(e){var i;if(this._deleting)return;this._deleting=!0;const t=await this._engineAdapter.deleteSession(e);if(this._deleting=!1,this._confirmDeleteId=null,!t){this._messages=[...this._messages,{role:"assistant",text:`⚠️ ${s("chat.deleteFailed")}`}],this._scrollToBottom();return}const a=this._sessionKey===e;if(a&&((i=this._chatCancel)==null||i.abort(),this._chatCancel=null,this._streaming=!1),await this._loadSessions(),a){const o=this._sessions.find(c=>c.id!==e),n=(o==null?void 0:o.id)||this._engineAdapter.defaultSessionId();this._sessionKey=n||"",this._messages=[],this._sessionKey&&await this._loadHistory()}}_selectSession(e){var t;if(e===this._sessionKey){this._showSessionList=!1;return}this._sessionKey=e,this._showSessionList=!1,this._streaming=!1,(t=this._chatCancel)==null||t.abort(),this._chatCancel=null,this._loadHistory()}async _newChat(){try{const e=await this._engineAdapter.createSession();e?(this._sessions=[e,...this._sessions],this._sessionKey=e.id):this._sessionKey=this._engineAdapter.defaultSessionId()}catch{}this._messages=[],this._showSessionList=!1}async _loadWorkspace(){if(this.engine==="hermes"){try{const e=await fetch(this._wsApi,{headers:x()});if(e.ok){const t=await e.json();this._wsName=t.agentId||"hermes",this._wsPath=t.path||""}}catch{}return}try{const e=await f().request("agents.list",{}),t=(e==null?void 0:e.defaultId)||"",a=((e==null?void 0:e.agents)||[]).find(i=>(i==null?void 0:i.id)===t)||((e==null?void 0:e.agents)||[])[0];this._wsName=(a==null?void 0:a.id)||t||"",this._wsPath=(a==null?void 0:a.workspace)||""}catch{}}get _wsApi(){return this.engine==="hermes"?`${this._sidecarBase}/api/hermes/workspace`:`${this._sidecarBase}/api/gateway/workspace`}_wsSaveDraft(){try{sessionStorage.setItem(le.WS_DRAFT_KEY,JSON.stringify({path:this._wsSel,content:this._wsContent}))}catch{}}_wsClearDraft(){try{sessionStorage.removeItem(le.WS_DRAFT_KEY)}catch{}}_wsRestoreDraft(){try{const e=sessionStorage.getItem(le.WS_DRAFT_KEY);if(!e)return!1;const t=JSON.parse(e);return t!=null&&t.path?(this._wsSel=String(t.path),this._wsContent=String(t.content??""),this._wsEditing=!0,this._wsDirty=!0,this._wsFlash(s("chat.wsDraftRestored"),4e3),!0):!1}catch{return!1}}async _toggleWsPanel(){if(this._wsPanelOpen){this._closeWsPanel();return}this._wsPanelOpen=!0,document.addEventListener("keydown",this._wsOnKey),await this._loadWsInfo(),this._loadWsDir(""),this._wsRestoreDraft()}_closeWsPanel(){if(this._wsEditing&&this._wsDirty){if(!window.confirm(s("chat.wsUnsaved")))return;this._wsClearDraft()}this._wsPanelOpen=!1,document.removeEventListener("keydown",this._wsOnKey)}_wsFlash(e,t=2500){this._wsMsg=e,this._wsMsgTimer&&window.clearTimeout(this._wsMsgTimer),this._wsMsgTimer=window.setTimeout(()=>{this._wsMsg="",this._wsMsgTimer=null},t)}async _loadWsInfo(){try{const e=await fetch(this._wsApi,{headers:x()});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();this._wsName=t.agentId||"main",this._wsPath=t.path||"",this._wsCore=t.coreFiles||[]}catch(e){this._wsMsg=e instanceof Error?e.message:String(e)}}async _loadWsDir(e){try{const t=await fetch(`${this._wsApi}/list?dir=${encodeURIComponent(e)}`,{headers:x()});if(!t.ok)throw new Error(`HTTP ${t.status}`);const a=await t.json();this._wsTree={...this._wsTree,[e]:a.entries||[]}}catch(t){this._wsMsg=t instanceof Error?t.message:String(t)}}_wsToggleDir(e){const t=!this._wsOpenDirs[e];this._wsOpenDirs={...this._wsOpenDirs,[e]:t},t&&!this._wsTree[e]&&this._loadWsDir(e)}async _wsOpenFile(e){var t;if(e!==this._wsSel){if(this._wsEditing&&this._wsDirty){if(!window.confirm(s("chat.wsUnsaved")))return;this._wsClearDraft()}this._wsBusy=!0,this._wsMsg="";try{const a=await fetch(`${this._wsApi}/file?path=${encodeURIComponent(e)}`,{headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);const i=await a.json();this._wsSel=e,this._wsContent=i.content||"",this._wsEditing=!1,this._wsDirty=!1}catch(a){this._wsMsg=a instanceof Error?a.message:String(a)}this._wsBusy=!1}}async _wsAddCore(e){var t;if(!this._wsBusy){this._wsBusy=!0;try{const a=await fetch(`${this._wsApi}/file`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({path:e,content:""})});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);await this._loadWsInfo(),this._wsSel=e,this._wsContent="",this._wsEditing=!0,this._wsDirty=!1}catch(a){this._wsMsg=a instanceof Error?a.message:String(a)}this._wsBusy=!1}}async _wsSave(){var e;if(!(!this._wsSel||this._wsBusy)){this._wsBusy=!0,this._wsMsg="";try{const t=await fetch(`${this._wsApi}/file`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({path:this._wsSel,content:this._wsContent})});if(!t.ok)throw new Error(((e=await t.json().catch(()=>({})))==null?void 0:e.detail)||`HTTP ${t.status}`);this._wsEditing=!1,this._wsDirty=!1,this._wsClearDraft(),this._wsFlash(s("common.configSaved"))}catch(t){this._wsMsg=t instanceof Error?t.message:String(t)}this._wsBusy=!1}}_wsRenderTree(e,t){return(this._wsTree[e]||[]).map(i=>{const o=e?`${e}/${i.name}`:i.name;if(i.type==="dir"){const n=!!this._wsOpenDirs[o];return r`
          <div class="ws-tree__row" style="padding-left:${8+t*14}px;" @click=${()=>this._wsToggleDir(o)}>
            <span class="ws-tree__caret">${n?"▾":"▸"}</span>
            <span class="ws-tree__icon">📁</span> ${i.name}
          </div>
          ${n?this._wsRenderTree(o,t+1):""}
        `}return r`
        <div class="ws-tree__row ${this._wsSel===o?"active":""}" style="padding-left:${8+t*14}px;"
          @click=${()=>this._wsOpenFile(o)}>
          <span class="ws-tree__caret"></span>
          <span class="ws-tree__icon">📄</span> ${i.name}
        </div>
      `})}_scCommands(){return this.engine==="hermes"?[{group:s("chat.scSession"),items:[{cmd:"/new",desc:s("chat.scNew")},{cmd:"/stop",desc:s("chat.scStop")}]},{group:s("chat.scModel"),items:[{cmd:"/model",desc:s("chat.scModelSwitch"),needsArg:!0},{cmd:"/model status",desc:s("chat.scModelStatus")}]}]:this.engine==="codex"?[{group:s("chat.scSession"),items:[{cmd:"/stop",desc:s("chat.scStop")}]},{group:s("chat.scModel"),items:[{cmd:"/model status",desc:s("chat.scModelStatus")}]}]:[{group:s("chat.scSession"),items:[{cmd:"/new",desc:s("chat.scNew")},{cmd:"/reset",desc:s("chat.scReset")},{cmd:"/stop",desc:s("chat.scStop")}]},{group:s("chat.scModel"),items:[{cmd:"/model",desc:s("chat.scModelSwitch"),needsArg:!0},{cmd:"/model list",desc:s("chat.scModelList")},{cmd:"/model status",desc:s("chat.scModelStatus")}]},{group:s("chat.scThink"),items:[{cmd:"/think off",desc:s("chat.scThinkOff")},{cmd:"/think low",desc:s("chat.scThinkLow")},{cmd:"/think medium",desc:s("chat.scThinkMed")},{cmd:"/think high",desc:s("chat.scThinkHigh")}]}]}_toggleSc(){this._scOpen=!this._scOpen,this._scOpen?document.addEventListener("keydown",this._scOnKey):document.removeEventListener("keydown",this._scOnKey)}_runSlash(e){var t;if(this._toggleSc(),e.needsArg){this._input=`${e.cmd} `;const a=(t=this.shadowRoot)==null?void 0:t.querySelector(".chat-input-bar__input textarea");a==null||a.focus();return}this._messages=[...this._messages,{role:"user",text:e.cmd}],this._scrollToBottom(),this._execSlash(e.cmd)}async _execSlash(e){const t=a=>{this._messages=[...this._messages,{role:"assistant",text:a}],this._scrollToBottom()};try{if(this.engine==="hermes")return await this._execSlashHermes(e,t);if(this.engine==="codex")return await this._execSlashCodex(e,t);await this._execSlashOpenClaw(e,t)}catch(a){t(`⚠️ ${e}: ${a instanceof Error?a.message:String(a)}`)}}async _execSlashHermes(e,t){var a,i;if(e==="/new"){(a=this._chatCancel)==null||a.abort();const o=await this._engineAdapter.createSession();if(!o)throw new Error(s("chat.engineOffline"));this._sessionKey=o.id,this._messages=[],this._loadSessions(),t(`✅ /new — ${o.name}`);return}if(e==="/stop"){(i=this._chatCancel)==null||i.abort(),t(`🛑 ${s("chat.scStop")}`);return}if(e==="/model status"){const o=await fetch(`${this._sidecarBase}/api/hermes/model`,{headers:x()});if(!o.ok)throw new Error(`HTTP ${o.status}`);const n=await o.json();t(`**${s("chat.scModelStatus")}**

- model: ${n.name||"—"}
- provider: ${n.provider||"auto"}
- baseUrl: ${n.baseUrl||"—"}
- apiKey: ${n.hasKey?n.apiKey:"—"}`);return}if(e.startsWith("/model ")){const o=e.slice(7).trim();if(!o)return;const n=await fetch(`${this._sidecarBase}/api/hermes/model`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({name:o,baseUrl:"",apiKey:""})}),c=await n.json().catch(()=>({}));if(!n.ok||c.success===!1)throw new Error(c.detail||c.message||`HTTP ${n.status}`);t(`✅ /model → ${o}`),this._refreshModels()}}async _execSlashCodex(e,t){var a;if(e==="/stop"){(a=this._chatCancel)==null||a.abort(),t(`🛑 ${s("chat.scStop")}`);return}if(e==="/model status"){const i=await ct();t(`**${s("chat.scModelStatus")}**

- model: ${(i==null?void 0:i.model)||"—"}`)}}async _execSlashOpenClaw(e,t){var o,n,c;const a=this._sessionKey||"agent:main:main",i=f();{if(e==="/new"||e==="/reset"){(o=this._chatCancel)==null||o.abort(),await i.request("sessions.reset",{key:a}),this._messages=[],this._loadSessions(),t(`✅ ${e} — ${s("chat.scReset")}`);return}if(e==="/stop"){(n=this._chatCancel)==null||n.abort();const h=await i.request("chat.abort",{sessionKey:a});t(`🛑 ${s("chat.scStop")}${((h==null?void 0:h.runIds)||[]).length?` (${h.runIds.length})`:""}`);return}if(e==="/model list"){const h=await i.request("models.list",{}),p=((h==null?void 0:h.models)||[]).map(g=>`- ${g.name||g.id}（${g.provider}）${g.reasoning?" · reasoning":""}${g.available===!1?" · ✗":""}`);t(`**${s("chat.scModelList")}**

${p.join(`
`)||"—"}`);return}if(e==="/model status"){const h=await i.request("sessions.describe",{key:a}),p=(h==null?void 0:h.session)||{};t(`**${s("chat.scModelStatus")}**

- model: ${p.model||((c=this._activeModel)==null?void 0:c.model)||"—"}
- thinking: ${p.thinkingLevel||"off"}`);return}if(e.startsWith("/model ")){const h=e.slice(7).trim();if(!h)return;await i.request("sessions.patch",{key:a,model:h}),t(`✅ /model → ${h}`),this._refreshModels();return}if(e.startsWith("/think ")){const h=e.slice(7).trim();if(!h)return;await i.request("sessions.patch",{key:a,thinkingLevel:h}),t(`✅ /think → ${h}`)}}}async _waitReady(e=6e3){const t=Date.now();for(;Date.now()-t<e;){if(this._engineAdapter.ready())return!0;await new Promise(a=>setTimeout(a,250))}return this._engineAdapter.ready()}async _refresh(){if(!this._refreshing){this._refreshing=!0;try{this.engine==="openclaw"?f().connect():this._engineAdapter.refresh(),await this._waitReady()&&(await this._loadSessions(),this._sessionKey&&await this._loadHistory()),this._refreshModels()}finally{this._refreshing=!1,this.requestUpdate()}}}_renderToolCard(e){const t=e.running?"run":e.ok?"ok":"err",a=e.args&&typeof e.args.command=="string"?e.args.command:e.args?JSON.stringify(e.args):"";return r`
      <div class="tool-card ${t}">
        <div class="tool-card__head">
          <span class="tool-card__name">⚙ ${e.name}</span>
          ${a?r`<code class="tool-card__cmd">$ ${a}</code>`:""}
        </div>
        <pre class="tool-card__out">${e.running?s("chat.toolRunning"):(e.ok?"":"✗ ")+(e.result||s("chat.toolNoOutput"))}</pre>
      </div>
    `}_renderMessages(){return this._messages.length?r`
      ${this._messages.map(e=>r`
        <div class="message ${e.role}">
          <div class="message__avatar">${e.role==="user"?"U":"A"}</div>
          <div class="message__body">
            ${e.role==="assistant"&&e.tools&&e.tools.length?r`<div class="msg-tools">${e.tools.map(t=>this._renderToolCard(t))}</div>`:""}
            ${e.text?e.role==="assistant"?r`<div class="msg-md"><oc-markdown .text=${e.text}></oc-markdown></div>`:r`<div class="msg-text">${e.text}</div>`:""}
            ${e.images&&e.images.length?r`
              <div class="msg-images">${e.images.map(t=>r`<img src=${t} />`)}</div>
            `:""}
          </div>
        </div>
      `)}
    `:""}_renderGatewayIdle(){return r`
      <div class="gw-idle">
        <div class="gw-icon">${v.zap}</div>
        <div class="gw-title">${s("chat.gatewayNotReady")}</div>
        <div class="gw-sub">${s("chat.connecting")}</div>
        <div class="gw-actions">
          <button class="gw-btn primary" @click=${this._refresh}>${s("chat.repairReconnect")}</button>
          <button class="gw-btn secondary" @click=${()=>this.onNavigate("gateway")}>${s("chat.gatewaySettings")}</button>
        </div>
        <div class="gw-hint">${s("chat.firstUseHint")}</div>
      </div>
    `}_renderSessionList(){return r`
      <div class="session-list">
        <div class="session-list__header">
          <span class="session-list__title">${s("chat.sessionList")}</span>
          <div class="session-list__actions">
            <button title="${s("chat.newChat")}" @click=${()=>this._newChat()}>
              ${v.plus}
            </button>
            <button @click=${()=>this._toggleSessionList()}>
              ${v.x}
            </button>
          </div>
        </div>
        <div class="session-list__body">
          ${this._sessions.length===0?r`<div style="padding:16px 12px;font-size:12px;color:var(--muted);">${this._loadingHistory?"…":s("chat.noSessions")}</div>`:this._sessions.map(e=>r`
            <div class="session-item ${this._sessionKey===e.id?"active":""}"
                 @click=${()=>this._selectSession(e.id)}>
              <span class="session-item__dot ${this._sessionKey===e.id?"active":"idle"}"></span>
              <span class="session-item__name">${e.name}</span>
              ${e.updatedAt?r`<span class="session-item__time">${Bi(e.updatedAt)}</span>`:""}
              ${this._confirmDeleteId===e.id?r`
                <span class="session-item__confirm" @click=${t=>t.stopPropagation()}>
                  <button class="yes" ?disabled=${this._deleting} @click=${()=>this._deleteSession(e.id)}>${s("chat.deleteConfirmYes")}</button>
                  <button class="no" ?disabled=${this._deleting} @click=${()=>{this._confirmDeleteId=null}}>${s("chat.deleteConfirmNo")}</button>
                </span>
              `:r`
                <button class="session-item__del" title=${s("chat.deleteSession")}
                  @click=${t=>{t.stopPropagation(),this._confirmDeleteId=e.id}}>
                  ${v.trash}
                </button>
              `}
            </div>
          `)}
        </div>
      </div>
    `}render(){var o,n;const e=this._showSessionList?"chat-layout with-list":"chat-layout",t=this._showBanner&&!this._engineReady,a=((o=this._engineAdapter)==null?void 0:o.id)==="hermes",i=((n=this._engineAdapter)==null?void 0:n.id)==="codex";return r`
      <div class="${e}">
        ${this._renderSessionList()}
        <div class="chat-main">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header__left">
              <button class="icon-btn" @click=${()=>this._toggleSessionList()}>
                ${this._showSessionList?v["panel-left-close"]:v.menu}
              </button>
              <div class="chat-header__title">
                <span class="status-dot ${this._engineReady?"":"offline"}"></span>
                ${this._engineReady?s("chat.chat"):s("chat.mainSession")}
              </div>
            </div>
            <div class="chat-header__right">
              <select title="model" ?disabled=${a||i} @change=${this._onSelectModel}>
                ${this._models.length===0?r`<option value="">${s("chat.noModelOption")}</option>`:this._models.map(c=>r`
                      <option value="${c.providerId}::${c.model}"
                        ?selected=${this._activeModel&&this._activeModel.providerId===c.providerId&&this._activeModel.model===c.model}>
                        ${c.model}${a||i?"":" · "+c.providerName}
                      </option>`)}
              </select>
              <button class="ws-btn ${this._refreshing?"spinning":""}" title="${s("common.refresh")}"
                ?disabled=${this._refreshing} @click=${this._refresh}>
                ${v["refresh-cw"]}
              </button>
              ${i?"":r`
                <div class="workspace-pill" title=${this._wsPath||""} @click=${this._toggleWsPanel}>
                  ${v["folder-open"]}
                  <span class="ws-label">${s("chat.workspace")}</span>
                  <span class="ws-name">${this._wsName||"—"}</span>
                </div>`}
              <!-- 快捷键入口：弹出斜杠命令列表 -->
              <button class="ws-btn" title=${s("chat.scTitle")} @click=${()=>this._toggleSc()}>
                ${v.command}
              </button>
            </div>
          </div>

          <!-- Banner -->
          ${t?r`
            <div class="chat-banner info">
              <div class="chat-banner__icon">${v["alert-triangle"]}</div>
              <div class="chat-banner__content">
                <div class="chat-banner__title">${s("chat.useRealtimeChat")}</div>
                <div class="chat-banner__desc">
                  ${s("chat.realtimeChatDesc")}<br/>
                  ${s("chat.aiAssistantTip")}
                </div>
              </div>
              <button class="chat-banner__close" @click=${()=>this._showBanner=!1}>
                ${v.x}
              </button>
            </div>
          `:""}

          <!-- Messages / Idle -->
          <div class="chat-messages">
            ${this._modelWarning?r`
              <div class="chat-banner">
                <div class="chat-banner__icon">${v["alert-triangle"]}</div>
                <div class="chat-banner__content">
                  <div class="chat-banner__desc">${this._modelWarning}</div>
                </div>
              </div>`:""}
            ${!this._engineReady&&!this._messages.length?this._renderGatewayIdle():this._renderMessages()}
          </div>

          <!-- 待发送图片缩略图 -->
          ${this._pendingImages.length?r`
            <div class="chat-pending-imgs">
              ${this._pendingImages.map((c,h)=>r`
                <div class="pi">
                  <img src=${c.dataUrl} title=${c.name} />
                  <button title=${s("common.delete")}
                    @click=${()=>{this._pendingImages=this._pendingImages.filter((p,g)=>g!==h)}}>×</button>
                </div>
              `)}
            </div>
          `:""}

          <!-- Input bar -->
          <div class="chat-input-bar">
            <div class="chat-input-bar__tools">
              <button class="${this._imgGenMode?"active":""}" title="${s("chat.imgGenMode")}"
                @click=${()=>{this._imgGenMode=!this._imgGenMode}}>
                ${v.image}
              </button>
              <button title="${s("chat.attachment")}"
                @click=${()=>{var c;return(c=this.renderRoot.querySelector("#chat-file-input"))==null?void 0:c.click()}}>
                ${v.paperclip}
              </button>
              <input id="chat-file-input" type="file" accept="image/*" multiple style="display:none"
                @change=${this._onPickImages} />
            </div>
            <div class="chat-input-bar__input">
              <textarea rows="1"
                .value=${this._input}
                @input=${c=>{const h=c.target;this._input=h.value,h.style.height="auto",h.style.height=Math.min(h.scrollHeight,120)+"px"}}
                @keydown=${this._onKeydown}
                placeholder="${this._imgGenMode?s("chat.imgGenPlaceholder"):s("chat.placeholder")}"
              ></textarea>
            </div>
            <button class="chat-input-bar__send"
                    ?disabled=${!this._input.trim()||this._streaming}
                    @click=${this._send}>
              ${this._streaming?v["refresh-cw"]:v.send}
            </button>
          </div>
        </div>
      </div>

      <!-- 快捷键面板 -->
      ${this._scOpen?r`
        <div class="sc-backdrop" @click=${()=>this._toggleSc()}></div>
        <div class="sc-panel">
          ${this._scCommands().map(c=>r`
            <div class="sc-group">${c.group}</div>
            ${c.items.map(h=>r`
              <div class="sc-row" @click=${()=>this._runSlash(h)}>
                <span class="sc-row__cmd">${h.cmd}</span>
                <span class="sc-row__desc">${h.desc}</span>
              </div>
            `)}
          `)}
        </div>
      `:""}

      <!-- 工作区文件面板 -->
      ${this._wsPanelOpen?r`
        <div class="ws-panel">
          <div class="ws-panel__header">
            <span class="ws-panel__title">${s("chat.wsTitle")}</span>
            <span class="ws-panel__badge">${this._wsName||"main"}</span>
            <div class="ws-panel__actions">
              <button title=${s("common.refresh")} @click=${()=>{this._loadWsInfo(),this._loadWsDir(""),this._wsSel&&this._wsOpenFile(this._wsSel)}}>
                ${v["refresh-cw"]}
              </button>
              <button title=${s("channels.close")} @click=${()=>this._closeWsPanel()}>
                ${v.x}
              </button>
            </div>
          </div>
          <div class="ws-panel__sub">
            <div style="font-weight:600;color:var(--text-soft);margin-bottom:2px;">${s("chat.wsMainSession")}</div>
            ${this._wsPath||"—"}
          </div>
          <div class="ws-panel__body">
            <div class="ws-panel__left">
              <div class="ws-panel__section-label">${s("chat.wsCoreFiles")}</div>
              <div class="ws-panel__core">
                ${this._wsCore.map(c=>r`
                  <div class="ws-core-item ${this._wsSel===c.name?"active":""}">
                    <span class="ws-tree__icon">📄</span>
                    <span class="ws-core-item__name">${c.name}</span>
                    ${c.exists?r`<button @click=${()=>this._wsOpenFile(c.name)}>${s("common.edit")}</button>`:r`<button @click=${()=>this._wsAddCore(c.name)}>${s("chat.wsAdd")}</button>`}
                  </div>
                `)}
              </div>
              <div class="ws-panel__browse">
                <div class="ws-panel__section-label">${s("chat.wsBrowse")}</div>
                ${this._wsRenderTree("",0)}
              </div>
            </div>
            <div class="ws-panel__right">
              <div class="ws-panel__toolbar">
                <strong style="font-size:13px;color:var(--text-strong);">${this._wsSel||s("chat.wsSelectFile")}</strong>
                <span class="spacer"></span>
                <button @click=${()=>{this._wsSel&&this._wsOpenFile(this._wsSel)}}>${s("chat.wsReload")}</button>
                <button class="${this._wsEditing?"mode-active":""}" ?disabled=${!this._wsSel||this._wsBusy} @click=${()=>{this._wsEditing=!0}}>${s("common.edit")}</button>
                <button class="${!this._wsEditing&&this._wsSel?"mode-active":""}" ?disabled=${!this._wsSel||this._wsBusy} @click=${()=>{this._wsEditing=!1}}>${s("chat.wsPreview")}</button>
                <button class="primary" ?disabled=${!this._wsSel||this._wsBusy||!this._wsEditing} @click=${this._wsSave}>${s("common.save")}</button>
              </div>
              ${this._wsMsg?r`<div class="ws-panel__msg">${this._wsMsg}</div>`:""}
              ${this._wsSel?r`
                <div class="ws-panel__content">
                  ${this._wsEditing?r`
                    <textarea .value=${this._wsContent}
                      @input=${c=>{this._wsContent=c.target.value,this._wsDirty=!0,this._wsSaveDraft()}}></textarea>
                  `:r`<pre>${this._wsContent}</pre>`}
                </div>
              `:r`<div class="ws-panel__empty">${s("chat.wsReady")}</div>`}
            </div>
          </div>
        </div>
      `:""}
    `}},le.styles=A`
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
      flex-shrink: 0; width: 20px; height: 20px;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer; opacity: 0;
      transition: opacity var(--duration-fast), color var(--duration-fast);
    }
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
  `,le.WS_DRAFT_KEY="lxup.ws.draft",le);k([m({type:String})],y.prototype,"title");k([m({type:String})],y.prototype,"subtitle");k([m({type:Boolean})],y.prototype,"connected");k([m({type:String})],y.prototype,"engine");k([m({type:Function})],y.prototype,"onNavigate");k([d()],y.prototype,"_input");k([d()],y.prototype,"_messages");k([d()],y.prototype,"_pendingImages");k([d()],y.prototype,"_imgGenMode");k([d()],y.prototype,"_showSessionList");k([d()],y.prototype,"_showBanner");k([d()],y.prototype,"_sessionKey");k([d()],y.prototype,"_sessions");k([d()],y.prototype,"_loadingHistory");k([d()],y.prototype,"_engineReady");k([d()],y.prototype,"_refreshing");k([d()],y.prototype,"_wsName");k([d()],y.prototype,"_wsPath");k([d()],y.prototype,"_wsPanelOpen");k([d()],y.prototype,"_wsCore");k([d()],y.prototype,"_wsTree");k([d()],y.prototype,"_wsOpenDirs");k([d()],y.prototype,"_wsSel");k([d()],y.prototype,"_wsContent");k([d()],y.prototype,"_wsEditing");k([d()],y.prototype,"_wsBusy");k([d()],y.prototype,"_wsMsg");k([d()],y.prototype,"_wsDirty");k([d()],y.prototype,"_scOpen");k([d()],y.prototype,"_streaming");k([d()],y.prototype,"_models");k([d()],y.prototype,"_activeModel");k([d()],y.prototype,"_modelWarning");k([d()],y.prototype,"_confirmDeleteId");k([d()],y.prototype,"_deleting");let Ni=y;customElements.define("chat-page",Ni);var Ri=Object.defineProperty,Ae=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ri(e,t,i),i};function Hi(l){var e,t,a;if(typeof l!="string")return null;try{const i=JSON.parse(l);let o="gateway";const n=i[0]||((e=i==null?void 0:i._meta)==null?void 0:e.name);if(typeof n=="string")try{o=JSON.parse(n).subsystem||o}catch{o=n}return{ts:i.time||((t=i==null?void 0:i._meta)==null?void 0:t.date)||"",level:String(((a=i==null?void 0:i._meta)==null?void 0:a.logLevelName)||"info").toLowerCase(),bracket:o,msg:i.message||i[1]||""}}catch{return{ts:"",level:"info",bracket:"raw",msg:String(l)}}}const qi=3e3,Ui=1500,$t=class $t extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._activeTab="gateway",this._autoScroll=!0,this._search="",this._logs=[],this._connected=!1,this._cursor=0,this._initialized=!1,this._timer=null,this._storeUnsub=null,this._tabs=[{key:"gateway",label:s("logs.gateway")},{key:"gateway-error",label:s("logs.gatewayError")},{key:"supervisor",label:s("logs.supervisor")},{key:"backup",label:s("logs.backup")},{key:"audit",label:s("logs.audit")}]}connectedCallback(){super.connectedCallback();const e=f();this._storeUnsub=e.subscribe(t=>{const a=this._connected;this._connected=t.connected,t.connected&&!a&&(this._initialized=!1,this._fetchLogs(!0))}),this._timer=setInterval(()=>this._fetchLogs(!1),qi)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this),this._timer&&clearInterval(this._timer)}async _fetchLogs(e){const t=f();if(!t.connected)return;const a=e?0:this._cursor;try{const i=await t.request("logs.tail",{cursor:a,limit:400});if(!i)return;(e||i.reset)&&(this._logs=[]);const o=(i.lines||[]).map(Hi).filter(n=>n!==null);o.length&&(this._logs=[...this._logs,...o].slice(-Ui)),typeof i.cursor=="number"&&(this._cursor=i.cursor),this._initialized=!0}catch{}}_matchesTab(e){const t=this._activeTab,a=`${e.bracket} ${e.msg}`.toLowerCase();return t==="gateway"?!0:t==="gateway-error"?e.level==="error"||e.level==="warn"||e.level==="fatal":t==="supervisor"?a.includes("supervisor")||a.includes("launcher")||a.includes("process"):t==="backup"?a.includes("backup"):t==="audit"?a.includes("audit"):!0}get _filteredLogs(){const e=this._search.trim().toLowerCase();return this._logs.filter(t=>this._matchesTab(t)?e?`${t.ts} ${t.bracket} ${t.msg}`.toLowerCase().includes(e):!0:!1)}_levelClass(e){return e==="error"||e==="fatal"?"log-error":e==="warn"||e==="warning"?"log-warn":"log-info"}_formatLogLine(e){const t=e.ts?e.ts.replace("T"," ").replace(/\.\d+.*$/,""):"";return r`<span class="log-ts">[${t}]</span> <span class="log-bracket">[${e.bracket}]</span> <span class="${this._levelClass(e.level)}">${e.msg}</span>`}updated(){if(this._autoScroll){const e=this.renderRoot.querySelector(".log-viewer");e&&(e.scrollTop=e.scrollHeight)}}render(){const e=this._filteredLogs;return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="logs-page">
        <!-- Tabs -->
        <div class="logs-tabs">
          ${this._tabs.map(t=>r`
            <div class="logs-tab ${this._activeTab===t.key?"active":""}"
                 @click=${()=>{this._activeTab=t.key}}>
              ${t.label}
            </div>
          `)}
        </div>

        <!-- Toolbar -->
        <div class="logs-toolbar">
          <input class="search-input" type="text"
            .value=${this._search}
            @input=${t=>{this._search=t.target.value}}
            placeholder="${s("logs.searchLogs")}"
          />
          <button @click=${()=>this._fetchLogs(!0)}>${s("common.refresh")}</button>
          <label class="checkbox-label">
            <input type="checkbox" .checked=${this._autoScroll}
              @change=${t=>{this._autoScroll=t.target.checked}}
            />
            ${s("logs.autoScroll")}
          </label>
          <span class="conn-dot ${this._connected?"on":"off"}" title=${this._connected?"Gateway connected":"Gateway disconnected"}></span>
        </div>

        <!-- Log viewer -->
        <div class="log-viewer">
          ${this._connected?e.length?e.map(t=>r`<div class="log-line">${this._formatLogLine(t)}</div>`):r`<div class="log-empty">${this._initialized?"— "+s("logs.gateway")+" —":"…"}</div>`:r`<div class="log-empty">Gateway ${s("dashboard.stopped")}</div>`}
        </div>
      </div>
    `}};$t.styles=A`
    :host { display: block; }

    .logs-page { max-width: 100%; }

    /* === tabs === */
    .logs-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .logs-tab {
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .logs-tab:hover { color: var(--text); }
    .logs-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

    /* === toolbar === */
    .logs-toolbar {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
    }
    .logs-toolbar .search-input {
      flex: 0 0 260px; padding: 6px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
    }
    .logs-toolbar .search-input::placeholder { color: var(--muted); }
    .logs-toolbar .search-input:focus { border-color: var(--accent); }
    .logs-toolbar button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .logs-toolbar button:hover { background: var(--bg-hover); color: var(--text); }
    .logs-toolbar .checkbox-label {
      display: flex; align-items: center; gap: 6px; font-size: 12px;
      color: var(--text-soft); cursor: pointer; user-select: none;
    }
    .logs-toolbar .checkbox-label input { cursor: pointer; }
    .logs-toolbar .conn-dot {
      width: 8px; height: 8px; border-radius: 50%; margin-left: auto;
    }
    .logs-toolbar .conn-dot.on { background: var(--success); }
    .logs-toolbar .conn-dot.off { background: var(--muted); }

    /* === log viewer === */
    .log-viewer {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 14px 16px;
      font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
      max-height: 520px; overflow-y: auto; word-break: break-all;
      box-shadow: var(--shadow-card);
    }
    .log-line { margin-bottom: 2px; }
    .log-ts { color: var(--muted); }
    .log-bracket { color: var(--text-soft); }
    .log-warn { color: var(--warn); }
    .log-error { color: var(--danger); }
    .log-info { color: var(--text); }
    .log-empty { color: var(--muted); font-style: italic; }
  `;let ce=$t;Ae([m({type:String})],ce.prototype,"title");Ae([m({type:String})],ce.prototype,"subtitle");Ae([d()],ce.prototype,"_activeTab");Ae([d()],ce.prototype,"_autoScroll");Ae([d()],ce.prototype,"_search");Ae([d()],ce.prototype,"_logs");Ae([d()],ce.prototype,"_connected");customElements.define("logs-page",ce);var ji=Object.defineProperty,Ki=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ji(e,t,i),i};const Ct=class Ct extends C{constructor(){super(...arguments),this.open=!1,this._onKeydown=e=>{e.key==="Escape"&&this.open&&this._close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onKeydown)}_close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}_stopPropagation(e){e.stopPropagation()}render(){return r`
      <div class="dialog-backdrop ${this.open?"open":""}" @click=${this._close}>
        <div class="dialog" @click=${this._stopPropagation}>
          <div class="dialog__header">
            <div class="dialog__title"><slot name="title"></slot></div>
            <button class="dialog__close" @click=${this._close} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="dialog__body"><slot></slot></div>
          <div class="dialog__footer"><slot name="footer"></slot></div>
        </div>
      </div>
    `}};Ct.styles=A`
    :host { display: contents; }

    .dialog-backdrop {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0, 0, 0, 0.5);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }
    .dialog-backdrop.open { opacity: 1; visibility: visible; }

    .dialog {
      background: var(--card); border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 480px; max-width: 90vw; max-height: 85vh;
      display: flex; flex-direction: column;
      transform: scale(0.95);
      transition: transform 0.2s ease;
    }
    .dialog-backdrop.open .dialog { transform: scale(1); }

    .dialog__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 0; flex-shrink: 0;
    }
    .dialog__title {
      font-size: 16px; font-weight: 700; color: var(--text-strong);
    }
    .dialog__close {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .dialog__close:hover { background: var(--bg-hover); color: var(--text); }

    .dialog__body {
      padding: 16px 22px; overflow-y: auto; flex: 1;
    }

    .dialog__footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 22px 18px; flex-shrink: 0;
      border-top: 1px solid var(--border);
    }
    .dialog__footer button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast);
    }
    .dialog__footer .btn-cancel {
      background: transparent; color: var(--text-soft);
    }
    .dialog__footer .btn-cancel:hover { background: var(--bg-hover); color: var(--text); }
    .dialog__footer .btn-confirm {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .dialog__footer .btn-confirm:hover { background: var(--accent-hover); }
  `;let Qe=Ct;Ki([m({type:Boolean})],Qe.prototype,"open");customElements.define("oc-dialog",Qe);var Fi=Object.defineProperty,Gi=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Fi(e,t,i),i};const St=class St extends C{constructor(){super(...arguments),this._message="",this._timer=null}show(e){this._timer&&clearTimeout(this._timer),this._message=e,this.classList.add("visible"),this.requestUpdate(),this._timer=setTimeout(()=>{this.classList.remove("visible"),this.requestUpdate(),this._timer=null},2e3)}render(){return r`<div class="toast">${this._message}</div>`}};St.styles=A`
    :host {
      position: fixed; top: 72px; left: 50%; z-index: 9999;
      transform: translateX(-50%) translateY(-20px);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    :host(.visible) {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .toast {
      padding: 8px 20px; border-radius: var(--radius-md);
      font-size: 13px; font-weight: 500;
      background: var(--accent-subtle); border: 1px solid var(--accent);
      color: var(--text); white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
  `;let Ye=St;Gi([d()],Ye.prototype,"_message");customElements.define("oc-toast",Ye);var Wi=Object.defineProperty,ee=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Wi(e,t,i),i};const ls="lxup.skillpacks.v1",At=class At extends C{constructor(){super(...arguments),this._packs=[],this._loaded=!1,this._loadError="",this._category=null,this._purchased=new Set,this._busyPack=null,this._detail=null,this._detailLoading=!1,this._mdOpen=!1,this._mdTitle="",this._mdBody="",this._mdLoading=!1}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._loadPurchased(),this._loadPacks()}async _loadPacks(){try{const e=await fetch(`${this._sidecarBase}/api/gateway/skills/packs`,{headers:x()});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();this._packs=Array.isArray(t==null?void 0:t.data)?t.data:[],this._loaded=!0}catch(e){this._loadError=String((e==null?void 0:e.message)??e),this._loaded=!0}}_loadPurchased(){try{const e=localStorage.getItem(ls);if(!e)return;const t=JSON.parse(e);Array.isArray(t==null?void 0:t.purchased)&&(this._purchased=new Set(t.purchased))}catch{}}_persistPurchased(){try{localStorage.setItem(ls,JSON.stringify({purchased:[...this._purchased]}))}catch{}}_toast(e){var t;(t=this.renderRoot.querySelector("oc-toast"))==null||t.show(e)}_isPurchased(e){return this._purchased.has(e)}async _buy(e){if(this._isPurchased(e.id)||this._busyPack)return;this._purchased.add(e.id),this._purchased=new Set(this._purchased),this._persistPurchased(),await this._deploy(e,s("skills.buyAndDeploySuccess",{name:e.name}))||this._toast(s("skills.buySuccess",{name:e.name}))}async _deploy(e,t){var a,i;if(!this._isPurchased(e.id)||this._busyPack)return!1;this._busyPack=e.id;try{const o=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e.id)}/install`,{method:"POST",headers:x()});if(!o.ok)throw new Error(((a=await o.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${o.status}`);return await this._loadPacks(),this._toast(t),((i=this._detail)==null?void 0:i.id)===e.id&&(this._detail={...this._detail,installed:!0}),!0}catch(o){return this._toast(`${s("skills.installFailed")}${o instanceof Error?o.message:String(o)}`),!1}finally{this._busyPack=null}}async _uninstall(e){var t,a;if(!(!e.installed||this._busyPack)){this._busyPack=e.id;try{const i=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e.id)}`,{method:"DELETE",headers:x()});if(!i.ok)throw new Error(((t=await i.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${i.status}`);await this._loadPacks(),this._toast(s("skills.uninstallSuccess",{name:e.name})),((a=this._detail)==null?void 0:a.id)===e.id&&(this._detail={...this._detail,installed:!1})}catch(i){this._toast(`${s("skills.uninstallFailed")}${i instanceof Error?i.message:String(i)}`)}finally{this._busyPack=null}}}async _openDetail(e){var t;this._detailLoading=!0,this._detail={id:e.id,installed:e.installed,installed_at:e.installed_at,post:{name:e.name,icon:e.icon}};try{const a=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e.id)}`,{headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);this._detail=await a.json()}catch(a){this._detail=null,this._toast(`${s("skills.packLoadFailed")}${a instanceof Error?a.message:String(a)}`)}finally{this._detailLoading=!1}}async _viewSkillMd(e,t,a){var i;if(t){this._mdOpen=!0,this._mdTitle=a,this._mdBody="",this._mdLoading=!0;try{const o=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e)}/skills/${encodeURIComponent(t)}`,{headers:x()});if(!o.ok)throw new Error(((i=await o.json().catch(()=>({})))==null?void 0:i.detail)||`HTTP ${o.status}`);const n=await o.json();this._mdBody=String(n.content||"—").replace(/^---[\s\S]*?---\s*/,"")}catch(o){this._mdBody=o instanceof Error?o.message:String(o)}finally{this._mdLoading=!1}}}_filtered(){return this._category?this._packs.filter(e=>e.category===this._category):this._packs}_grouped(e){const t=new Map;for(const a of e)t.has(a.category)||t.set(a.category,[]),t.get(a.category).push(a);return[...t.entries()]}_getCategories(){const e=new Map;for(const t of this._packs)e.set(t.category,(e.get(t.category)??0)+1);return[...e.entries()].map(([t,a])=>({name:t,count:a}))}_renderActions(e){const t=this._isPurchased(e.id),a=this._busyPack===e.id;return r`
      <button class="btn-detail" @click=${()=>this._openDetail(e)}>${s("skills.detail")}</button>
      ${t?r`<button class="btn-bought" disabled>${s("skills.purchased")}</button>`:r`<button class="btn-buy" ?disabled=${a||!!this._busyPack} @click=${()=>this._buy(e)}>
            ${s(a?"skills.downloading":"skills.buy")}
          </button>`}
      ${t&&!e.installed?r`<button class="btn-install-ws" ?disabled=${a||!!this._busyPack}
            @click=${()=>this._deploy(e,s("skills.downloadSuccess",{name:e.name}))}>
            ${s(a?"skills.downloading":"skills.installToWs")}
          </button>`:""}
      ${e.installed?r`<button class="btn-uninstall" ?disabled=${a} @click=${()=>this._uninstall(e)}>${s("skills.uninstall")}</button>`:""}
    `}_renderPackItem(e){return r`
      <div class="pack-item">
        <div class="pack-item__icon">${e.icon||"💼"}</div>
        <div class="pack-item__content">
          <div class="pack-item__title">
            <span class="pack-item__name">${e.name}</span>
            <span class="badge ${e.priority==="P0"?"p0":"p1"}">${e.priority}</span>
            ${e.installed?r`<span class="badge installed">${s("common.installed")}</span>`:""}
          </div>
          <div class="pack-item__meta">${e.category} · ${e.skills} ${s("skills.skillsUnit")}</div>
        </div>
        <div class="pack-item__actions">${this._renderActions(e)}</div>
      </div>
    `}_renderInstalledSection(){const e=this._packs.filter(t=>t.installed).sort((t,a)=>(a.installed_at||"").localeCompare(t.installed_at||""));return e.length===0?"":r`
      <div class="section">
        <div class="section__header">
          <span class="installed-mark">✓</span> ${s("skills.installedPacks")}
          <span class="count">(${e.length})</span>
        </div>
        <div style="padding:4px 8px;">
          ${e.map(t=>r`
            <div class="installed-row">
              <div class="installed-row__icon">${t.icon||"💼"}</div>
              <div class="installed-row__name">
                ${t.name}
                <span class="installed-row__sub">${t.category} · ${t.skills} ${s("skills.skillsUnit")}</span>
              </div>
              <div class="installed-row__time">
                ${t.installed_at?s("skills.installedAt")+" "+new Date(t.installed_at).toLocaleString(void 0,{dateStyle:"medium",timeStyle:"short"}):""}
              </div>
            </div>
          `)}
        </div>
      </div>
    `}_renderDetailDialog(){const e=this._detail,t=e==null?void 0:e.post,a=this._packs.find(n=>n.id===(e==null?void 0:e.id)),i=e?this._isPurchased(e.id):!1,o=e?this._busyPack===e.id:!1;return r`
      <oc-dialog .open=${e!=null} @close=${()=>{this._detail=null}}>
        <span slot="title">${e?`${(t==null?void 0:t.icon)||(a==null?void 0:a.icon)||"💼"} ${(t==null?void 0:t.name)||(a==null?void 0:a.name)||""}`:""}</span>
        ${e&&t?r`
          <div class="detail-badges">
            ${t.priority?r`<span class="badge ${t.priority==="P0"?"p0":"p1"}">${t.priority}</span>`:""}
            ${t.category?r`<span class="badge p1">${s("skills.categoryLabel")}: ${t.category}</span>`:""}
            ${t.version?r`<span class="badge p1">v${t.version}</span>`:""}
            ${e.installed?r`<span class="badge installed">${s("common.installed")}</span>`:""}
          </div>
          <div class="detail-desc">${t.description||(this._detailLoading?s("common.loading"):"—")}</div>
          ${Array.isArray(t.skills)&&t.skills.length?r`
            <div class="detail-h">${s("skills.skillList")}（${t.skills.length}）</div>
            ${t.skills.map(n=>r`
              <div class="detail-skill">
                <div class="detail-skill__main">
                  <div class="detail-skill__name">${n.name}</div>
                  <div class="detail-skill__triggers">
                    ${(n.triggers||[]).map(c=>r`<span class="trigger-chip">${c}</span>`)}
                  </div>
                </div>
                ${n.file?r`<button class="detail-skill__view"
                  @click=${()=>this._viewSkillMd(e.id,n.file,n.name)}>${s("skills.viewSkill")}</button>`:""}
              </div>
            `)}
          `:""}
          ${Array.isArray(t.knowledge)&&t.knowledge.length?r`
            <div class="detail-h">${s("skills.knowledgeBase")}</div>
            <div class="detail-kb">${t.knowledge.join(" · ")}</div>
          `:""}
        `:""}
        <div slot="footer">
          ${e&&i&&!e.installed?r`
            <button class="primary" ?disabled=${o||!!this._busyPack}
              @click=${()=>this._deploy(e,s("skills.downloadSuccess",{name:(t==null?void 0:t.name)||e.id}))}>
              ${s(o?"skills.downloading":"skills.installToWs")}
            </button>`:""}
          <button class="btn-cancel" @click=${()=>{this._detail=null}}>${s("common.dismiss")}</button>
        </div>
      </oc-dialog>
    `}_renderMdDialog(){return this._mdOpen?r`
      <oc-dialog .open=${!0} @close=${()=>{this._mdOpen=!1}}>
        <span slot="title">${this._mdTitle}</span>
        <div class="skillmd">${this._mdLoading?s("common.loading"):this._mdBody}</div>
        <div slot="footer">
          <button class="btn-cancel" @click=${()=>{this._mdOpen=!1}}>${s("common.dismiss")}</button>
        </div>
      </oc-dialog>
    `:""}render(){if(!this._loaded)return r`<div class="empty">${s("common.loading")}</div>`;if(this._loadError)return r`<div class="empty">${s("skills.packLoadFailed")}${this._loadError}</div>`;const e=this._filtered(),t=this._packs.filter(a=>a.installed).length;return r`
      <div class="summary">${s("skills.packCount",{total:this._packs.length,skills:5})} · ${s("skills.installedPacks")} ${t}</div>
      <div class="demo-note">⚠️ ${s("skills.buyDemoNote")}</div>

      ${this._renderInstalledSection()}

      <div class="cat-row">
        ${this._getCategories().map(a=>r`
          <button class="cat-chip ${this._category===a.name?"active":""}"
                  @click=${()=>{this._category=this._category===a.name?null:a.name}}>
            ${a.name}
            <span class="chip-count">${a.count}</span>
          </button>
        `)}
      </div>

      ${this._grouped(e).map(([a,i])=>r`
        <div class="section">
          <div class="section__header">${a} <span class="count">(${i.length})</span></div>
          <div class="section__body">
            ${i.map(o=>this._renderPackItem(o))}
          </div>
        </div>
      `)}

      ${this._renderDetailDialog()}
      ${this._renderMdDialog()}
      <oc-toast></oc-toast>
    `}};At.styles=A`
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
  `;let J=At;ee([d()],J.prototype,"_packs");ee([d()],J.prototype,"_loaded");ee([d()],J.prototype,"_loadError");ee([d()],J.prototype,"_category");ee([d()],J.prototype,"_purchased");ee([d()],J.prototype,"_busyPack");ee([d()],J.prototype,"_detail");ee([d()],J.prototype,"_detailLoading");ee([d()],J.prototype,"_mdOpen");ee([d()],J.prototype,"_mdTitle");ee([d()],J.prototype,"_mdBody");ee([d()],J.prototype,"_mdLoading");customElements.define("skillshop-panel",J);var Vi=Object.defineProperty,E=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Vi(e,t,i),i};const Ji="lxup.chat.prefill",Mt=class Mt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.engine="openclaw",this.onNavigate=()=>{},this._activeTab="mine",this._search="",this._skills=[],this._loading=!0,this._hubQuery="",this._hubResults=[],this._hubSearching=!1,this._hubSearched=!1,this._installingSlug="",this._hubMsg="",this._hubMsgCls="",this._busyPre="",this._fixingId="",this._togglingKey="",this._laneMsg="",this._expandedSec={jobpack:!0,pre:!0,other:!0,repair:!1,off:!1},this._gwConnected=!1,this._entries=new Map,this._unsubStore=null,this._detailOpen=!1,this._detailTitle="",this._detailBody="",this._detailLoading=!1}get _isHermes(){return this.engine==="hermes"}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback();const e=f();this._gwConnected=e.connected,this._unsubStore=e.subscribe(()=>{const t=f().connected;t!==this._gwConnected&&(this._gwConnected=t,t&&this._loadSkills(),this.requestUpdate())}),this._loadSkills()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubStore)==null||e.call(this)}async _loadSkills(){this._loading=!0;try{const e=this._isHermes?"/api/hermes/skills/all":"/api/gateway/skills",a=await(await fetch(`${this._sidecarBase}${e}`,{headers:x()})).json();try{if(this._isHermes){const i=await fetch(`${this._sidecarBase}/api/hermes/skills/entries`,{headers:x()});this._entries=i.ok?this._normalizeEntries(await i.json()):new Map}else{const i=f();this._entries=i.connected?this._normalizeEntries(await i.request("skills.entries")):new Map}}catch{this._entries=new Map}this._skills=(a.data||[]).map(i=>{const o=i.status_note||(i.requires&&i.requires.length?`${s("skills.requires")}: ${i.requires.join(", ")}`:""),n=i.preinstalled?`LXUP ${s("skills.preinstalled")}`:i.source_kind==="jobpack"?`${s("skills.fromPack")}: ${i.pack_name||i.pack_id||""}`:i.source_kind==="clawhub"?s("skills.fromClawhub"):`OpenClaw ${s("skills.bundled")}${i.version?" · v"+i.version:""}`;return{id:i.id,name:i.name,source:n,desc:(i.description||"")+(o?`
${o}`:""),status:i.status||"available",preinstalled:!!i.preinstalled,installed:!!i.installed,enabled:this._entries.has(i.name)?this._entries.get(i.name):!0,source_kind:i.source_kind||"",pack_id:i.pack_id,pack_name:i.pack_name,pack_skill_file:i.pack_skill_file,status_note:i.status_note||""}})}catch{this._skills=[]}this._loading=!1,this.requestUpdate()}_filteredSkills(){const e=this._skills.filter(a=>a.status!=="disabled");if(!this._search)return e;const t=this._search.toLowerCase();return e.filter(a=>a.name.toLowerCase().includes(t)||a.desc.toLowerCase().includes(t)||a.source.toLowerCase().includes(t))}async _downloadPre(e){var t;if(!this._busyPre){this._busyPre=e.id,this._laneMsg="";try{const a=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}/install`,{method:"POST",headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);await this._loadSkills()}catch(a){this._laneMsg=`${s("skills.preDownloadFailed")}${a instanceof Error?a.message:String(a)}`}finally{this._busyPre=""}}}async _downloadWithDeps(e){var t,a,i;if(!this._busyPre){this._busyPre=e.id,this._laneMsg="";try{const o=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}/fix-deps`,{method:"POST",headers:x()});if(!o.ok)throw new Error(((t=await o.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${o.status}`);const n=await o.json();if((a=n==null?void 0:n.still_missing)!=null&&a.length)throw new Error(`${s("skills.fixDepsFailed")}${n.still_missing.join(", ")}`);const c=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}/install`,{method:"POST",headers:x()});if(!c.ok)throw new Error(((i=await c.json().catch(()=>({})))==null?void 0:i.detail)||`HTTP ${c.status}`);await this._loadSkills()}catch(o){this._laneMsg=o instanceof Error?o.message:String(o)}finally{this._busyPre=""}}}async _uninstallPre(e){var t;if(!this._busyPre){this._busyPre=e.id,this._laneMsg="";try{const a=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}`,{method:"DELETE",headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);await this._loadSkills()}catch(a){this._laneMsg=`${s("skills.preUninstallFailed")}${a instanceof Error?a.message:String(a)}`}finally{this._busyPre=""}}}async _fixDeps(e){var t,a;if(!this._fixingId){this._fixingId=e.id,this._laneMsg="";try{const i=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}/fix-deps`,{method:"POST",headers:x()});if(!i.ok)throw new Error(((t=await i.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${i.status}`);const o=await i.json();(a=o==null?void 0:o.still_missing)!=null&&a.length&&(this._laneMsg=`${s("skills.fixDepsFailed")}${o.still_missing.join(", ")}`),await this._loadSkills()}catch(i){this._laneMsg=`${s("skills.fixDepsFailed")}${i instanceof Error?i.message:String(i)}`}finally{this._fixingId=""}}}_normalizeEntries(e){const t=new Map,a=Array.isArray(e)?e:Array.isArray(e==null?void 0:e.entries)?e.entries:null;if(a)for(const i of a){const o=(i==null?void 0:i.skillKey)||(i==null?void 0:i.key)||(i==null?void 0:i.name);o&&t.set(String(o),i.enabled!==!1)}else if(e&&typeof e=="object")for(const[i,o]of Object.entries(e))t.set(i,(o==null?void 0:o.enabled)!==!1);return t}async _toggleSkill(e){var a;if(this._togglingKey)return;const t=e.enabled===!1;this._togglingKey=e.name,this._laneMsg="";try{if(this._isHermes){const i=await fetch(`${this._sidecarBase}/api/hermes/skills/toggle`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({name:e.name,enabled:t})});if(!i.ok)throw new Error(((a=await i.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${i.status}`)}else{const i=f();if(!i.connected)throw new Error(s("dashboard.wsDisconnected"));await i.request("skills.update",{skillKey:e.name,enabled:t})}await this._loadSkills()}catch(i){this._laneMsg=`${s("skills.toggleFailed")}${i instanceof Error?i.message:String(i)}`}finally{this._togglingKey=""}}async _openDetail(e){var t,a;this._detailOpen=!0,this._detailTitle=e.name,this._detailBody="",this._detailLoading=!0;try{if(e.preinstalled){const i=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}`,{headers:x()});if(!i.ok)throw new Error(((t=await i.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${i.status}`);const o=await i.json();this._detailBody=String(o.content||"—").replace(/^---[\s\S]*?---\s*/,"")}else if(e.source_kind==="jobpack"&&e.pack_id&&e.pack_skill_file){const i=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e.pack_id)}/skills/${encodeURIComponent(e.pack_skill_file)}`,{headers:x()});if(!i.ok)throw new Error(((a=await i.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${i.status}`);const o=await i.json();this._detailBody=String(o.content||"—").replace(/^---[\s\S]*?---\s*/,"")}else if(this._isHermes)this._detailBody=e.desc||"—";else{const i=f();if(i.connected){const o=await i.request("skills.detail",{slug:e.id}),n=(o==null?void 0:o.skill)||{},c=String(n.description||n.summary||"").replace(/^---[\s\S]*?---\s*/,"");this._detailBody=c||n.summary||"—"}else this._detailBody=e.desc||s("dashboard.wsDisconnected")}}catch(i){this._detailBody=i instanceof Error?i.message:String(i)}finally{this._detailLoading=!1}}_closeDetail(){this._detailOpen=!1}async _tryIt(e){var a,i;let t="";try{if(e.preinstalled){const o=await fetch(`${this._sidecarBase}/api/gateway/skills/preinstalled/${encodeURIComponent(e.id)}`,{headers:x()});o.ok&&(t=((a=await o.json())==null?void 0:a.example)||"")}else if(e.source_kind==="jobpack"&&e.pack_id&&e.pack_skill_file){const o=await fetch(`${this._sidecarBase}/api/gateway/skills/packs/${encodeURIComponent(e.pack_id)}/skills/${encodeURIComponent(e.pack_skill_file)}`,{headers:x()});o.ok&&(t=((i=await o.json())==null?void 0:i.example)||"")}}catch{}t||(t=`${s("skills.tryItFallback")}${e.name}`),sessionStorage.setItem(Ji,t),this.onNavigate("chat")}async _searchHub(){var t;const e=this._hubQuery.trim();if(e){if(!this._isHermes&&!f().connected){this._hubMsg=s("skills.hubGatewayRequired"),this._hubMsgCls="warn";return}this._hubSearching=!0,this._hubMsg="",this._hubMsgCls="";try{if(this._isHermes){const a=await fetch(`${this._sidecarBase}/api/hermes/hub/search?query=${encodeURIComponent(e)}`,{headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);const i=await a.json();this._hubResults=(i==null?void 0:i.results)||[]}else{const a=await f().request("skills.search",{query:e});this._hubResults=(a==null?void 0:a.results)||[]}this._hubSearched=!0}catch(a){this._hubMsg=a instanceof Error?a.message:String(a),this._hubMsgCls="err"}finally{this._hubSearching=!1}}}async _installSkill(e){var a;const t=this._isHermes?e.identifier:e.slug;if(!this._installingSlug&&!(!this._isHermes&&!f().connected)){this._installingSlug=t,this._hubMsg="",this._hubMsgCls="";try{if(this._isHermes){const i=await fetch(`${this._sidecarBase}/api/hermes/hub/install`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({identifier:e.identifier,source:e.source||""})});if(!i.ok)throw new Error(((a=await i.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${i.status}`);this._hubMsg=`${s("skills.hubInstalled")}: ${e.name||e.identifier}`}else await f().request("skills.install",{source:"clawhub",slug:e.slug,acknowledgeClawHubRisk:!0}),this._hubMsg=`${s("skills.hubInstalled")}: ${e.displayName||e.slug}`;this._hubMsgCls="ok",await this._loadSkills()}catch(i){const o=i instanceof Error?i.message:String(i);try{const n=JSON.parse(o);this._hubMsg=(n==null?void 0:n.message)||o}catch{this._hubMsg=o}this._hubMsgCls="err"}finally{this._installingSlug=""}}}_renderHubResult(e){const t=this._isHermes?e.identifier:e.slug,a=this._installingSlug===t;return r`
      <div class="skill-item">
        <div class="skill-item__icon">${this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${this._isHermes?e.name||e.identifier:e.displayName||e.slug}</div>
          <div class="skill-item__source">
            ${this._isHermes?`${e.source||""}${e.trust_level?" · "+e.trust_level:""}`:`${e.ownerHandle?"@"+e.ownerHandle:""}${typeof e.downloads=="number"?" · "+e.downloads+" "+s("skills.hubDownloads"):""}`}
          </div>
          <div class="skill-item__desc">${this._isHermes?e.description||"":e.summary||""}</div>
        </div>
        <div class="skill-item__actions">
          ${this._isHermes?"":r`<button class="btn-detail" @click=${()=>this._openHubDetail(e.slug)}>${s("skills.detail")}</button>`}
          <button class="btn-primary" ?disabled=${a} @click=${()=>this._installSkill(e)}>
            ${s(a?"skills.hubInstalling":"skills.hubInstall")}
          </button>
        </div>
      </div>
    `}async _openHubDetail(e){const t=f();this._detailOpen=!0,this._detailTitle=e,this._detailBody="",this._detailLoading=!0;try{if(t.connected){const a=await t.request("skills.detail",{slug:e}),i=(a==null?void 0:a.skill)||{};this._detailBody=String(i.description||i.summary||"—").replace(/^---[\s\S]*?---\s*/,"")}else this._detailBody=s("dashboard.wsDisconnected")}catch(a){this._detailBody=a instanceof Error?a.message:String(a)}finally{this._detailLoading=!1}}_skillIcon(){return r`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`}_toggleSec(e){this._expandedSec={...this._expandedSec,[e]:!this._expandedSec[e]}}_secCaret(e){return r`<span class="sec-caret">${v[this._expandedSec[e]?"chevron-down":"chevron-right"]}</span>`}_renderPreRow(e){const t=this._busyPre===e.id,a=this._fixingId===e.id,i=e.status==="missing",o=i?{cls:"missing",text:s("skills.missingDeps")}:e.installed?{cls:"",text:s("skills.preDownloaded")}:{cls:"missing",text:s("skills.preNotDownloaded")};return r`
      <div class="skill-item ${e.installed&&e.enabled===!1?"off":""}">
        <div class="skill-item__icon preinstalled">🧰</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${e.name}</div>
          <div class="skill-item__source">${e.source}</div>
          <div class="skill-item__desc">${e.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${()=>this._openDetail(e)}>${s("skills.detail")}</button>
          ${i&&!e.installed?r`
            <button class="btn-primary" ?disabled=${t||!!this._busyPre} @click=${()=>this._downloadWithDeps(e)}>
              ${s(t?"skills.downloadWithDepsWorking":"skills.downloadWithDeps")}
            </button>`:""}
          ${i&&e.installed?r`
            <button class="btn-primary" ?disabled=${a||!!this._fixingId} @click=${()=>this._fixDeps(e)}>
              ${s(a?"skills.fixDepsWorking":"skills.fixDeps")}
            </button>`:""}
          ${!e.installed&&!i?r`<button class="btn-primary" ?disabled=${t||!!this._busyPre} @click=${()=>this._downloadPre(e)}>
                ${s(t?"skills.downloading":"skills.download")}</button>`:""}
          ${e.installed?r`
            <button class="btn-try" @click=${()=>this._tryIt(e)}>${s("skills.tryIt")}</button>
            <button class="btn-toggle" ?disabled=${!this._isHermes&&!this._gwConnected||!!this._togglingKey} @click=${()=>this._toggleSkill(e)}>
              ${e.enabled===!1?s("skills.enableBtn"):s("skills.disableBtn")}</button>
            <button class="btn-danger" ?disabled=${t} @click=${()=>this._uninstallPre(e)}>${s("skills.uninstall")}</button>`:""}
          <span class="skill-item__badge ${o.cls}">${o.text}</span>
        </div>
      </div>
    `}_renderActiveRow(e){const t=e.enabled===!1,a=this._togglingKey===e.name,i=e.source_kind==="jobpack";return r`
      <div class="skill-item ${t?"off":""}">
        <div class="skill-item__icon">${e.source_kind==="jobpack"?r`💼`:this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${e.name}</div>
          <div class="skill-item__source">${e.source}</div>
          <div class="skill-item__desc">${e.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${()=>this._openDetail(e)}>${s("skills.detail")}</button>
          ${i&&!t?r`<button class="btn-try" @click=${()=>this._tryIt(e)}>${s("skills.tryIt")}</button>`:""}
          <button class="btn-toggle" ?disabled=${!this._isHermes&&!this._gwConnected||!!this._togglingKey} @click=${()=>this._toggleSkill(e)}>
            ${s(a?"common.loading":t?"skills.enableBtn":"skills.disableBtn")}</button>
        </div>
      </div>
    `}_renderRepairRow(e){const t=this._fixingId===e.id,a=this._busyPre===e.id;return r`
      <div class="skill-item">
        <div class="skill-item__icon ${e.preinstalled?"preinstalled":""}">${e.preinstalled?"🧰":this._skillIcon()}</div>
        <div class="skill-item__content">
          <div class="skill-item__name">${e.name}</div>
          <div class="skill-item__source">${e.source}</div>
          <div class="skill-item__desc">${e.desc}</div>
        </div>
        <div class="skill-item__actions">
          <button class="btn-detail" @click=${()=>this._openDetail(e)}>${s("skills.detail")}</button>
          ${e.preinstalled&&!e.installed?r`
            <button class="btn-primary" ?disabled=${a||!!this._busyPre} @click=${()=>this._downloadWithDeps(e)}>
              ${s(a?"skills.downloadWithDepsWorking":"skills.downloadWithDeps")}
            </button>`:""}
          ${e.preinstalled&&e.installed?r`
            <button class="btn-primary" ?disabled=${t||!!this._fixingId} @click=${()=>this._fixDeps(e)}>
              ${s(t?"skills.fixDepsWorking":"skills.fixDeps")}
            </button>`:""}
          <span class="skill-item__badge missing">${e.status_note||s("skills.missingDeps")}</span>
        </div>
      </div>
    `}render(){const e=this._filteredSkills(),t=e.filter(p=>p.preinstalled),a=e.filter(p=>p.source_kind==="jobpack"&&p.status==="available"),i=e.filter(p=>!p.preinstalled&&p.source_kind!=="jobpack"&&p.status==="available"),o=e.filter(p=>p.status==="missing"),n=e.filter(p=>p.status==="available"&&p.enabled===!1),c=e.filter(p=>p.status==="available"&&p.enabled!==!1&&(p.preinstalled?p.installed:!0)).length,h=new Map;for(const p of a){const g=p.pack_name||p.pack_id||"";h.has(g)||h.set(g,[]),h.get(g).push(p)}return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="skills-page">

        <div class="skills-tabs">
          <div class="skills-tab ${this._activeTab==="mine"?"active":""}"
               @click=${()=>{this._activeTab="mine"}}>
            ${s("skills.mySkills")}
          </div>
          <div class="skills-tab ${this._activeTab==="packs"?"active":""}"
               @click=${()=>{this._activeTab="packs"}}>
            ${s("skills.jobPacks")}
          </div>
          <div class="skills-tab ${this._activeTab==="hub"?"active":""}"
               @click=${()=>{this._activeTab="hub"}}>
            ${this._isHermes?s("skills.hermesHub"):"ClawHub"}
          </div>
        </div>

        ${this._activeTab==="mine"?r`
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._search}
              @input=${p=>{this._search=p.target.value}}
              placeholder=${s("skills.filterPlaceholder")}
            />
            <button @click=${()=>this._loadSkills()}>${s("common.refresh")}</button>
          </div>

          <div class="skills-summary">
            ${s("skills.summary2",{usable:c,repair:o.length,off:n.length})}
          </div>
          ${this._isHermes?r`<div class="hub-msg warn">${s("skills.hermesNote")}</div>`:""}
          ${this._laneMsg?r`<div class="hub-msg err">${this._laneMsg}</div>`:""}

          <!-- 💼 我的岗位技能（已购买部署的岗位包，按包分组） -->
          ${a.length>0?r`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--success);"
                   @click=${()=>this._toggleSec("jobpack")}>
                💼 ${s("skills.myJobSkills")} <span class="count">(${a.length})</span>
                <span class="header-right">${this._secCaret("jobpack")}</span>
              </div>
              ${this._expandedSec.jobpack?r`
                <div class="skills-section__body">
                  ${[...h.entries()].map(([p,g])=>r`
                    <div class="group-label">${p}</div>
                    ${g.map(u=>this._renderActiveRow(u))}
                  `)}
                </div>
              `:""}
            </div>
          `:""}

          <!-- 🧰 预装通用工具（免费） -->
          ${t.length>0?r`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--accent);"
                   @click=${()=>this._toggleSec("pre")}>
                🧰 ${s("skills.preinstalledTitle")} <span class="count">(${t.length})</span>
                <span class="header-right">${this._secCaret("pre")}</span>
              </div>
              ${this._expandedSec.pre?r`
                <div class="skills-section__body">
                  ${t.map(p=>this._renderPreRow(p))}
                </div>
              `:""}
            </div>
          `:""}

          <!-- ✓ 其他可用技能（内置 / ClawHub） -->
          ${i.length>0?r`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--success);"
                   @click=${()=>this._toggleSec("other")}>
                ✓ ${s("skills.otherAvailable")} <span class="count">(${i.length})</span>
                <span class="header-right">${this._secCaret("other")}</span>
              </div>
              ${this._expandedSec.other?r`
                <div class="skills-section__body">
                  ${i.map(p=>this._renderActiveRow(p))}
                </div>
              `:""}
            </div>
          `:""}

          <!-- ⚠ 待修复（缺依赖；默认折叠，不污染主列表） -->
          ${o.length>0?r`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--warn);"
                   @click=${()=>this._toggleSec("repair")}>
                ${s("skills.missingDeps")} <span class="count">(${o.length})</span>
                <span class="header-right">
                  <span class="lane-hint">${s("skills.missingHint")}</span>
                  ${this._secCaret("repair")}
                </span>
              </div>
              ${this._expandedSec.repair?r`
                <div class="skills-section__body">
                  ${o.map(p=>this._renderRepairRow(p))}
                </div>
              `:""}
            </div>
          `:""}

          <!-- ⏸ 已停用（文件还在，恢复即用；默认折叠） -->
          ${n.length>0?r`
            <div class="skills-section">
              <div class="skills-section__header clickable" style="color:var(--muted);"
                   @click=${()=>this._toggleSec("off")}>
                ${s("skills.disabled")} <span class="count">(${n.length})</span>
                <span class="header-right">
                  <span class="lane-hint">${s("skills.offHint")}</span>
                  ${this._secCaret("off")}
                </span>
              </div>
              ${this._expandedSec.off?r`
                <div class="skills-section__body">
                  ${n.map(p=>this._renderActiveRow(p))}
                </div>
              `:""}
            </div>
          `:""}

          ${e.length===0?r`
            <div class="skills-empty">${this._skills.length===0&&!this._loading?s("skills.notInstalled"):s("skills.noMatch")}</div>
          `:""}
        `:this._activeTab==="packs"?r`
          <skillshop-panel></skillshop-panel>
        `:r`
          <!-- ClawHub 搜索安装（高级） -->
          <div class="skills-toolbar">
            <input class="search-input" type="text"
              .value=${this._hubQuery}
              placeholder=${this._isHermes?s("skills.hermesHubSearchPlaceholder"):s("skills.searchPlaceholder")}
              @input=${p=>{this._hubQuery=p.target.value}}
              @keydown=${p=>{p.key==="Enter"&&this._searchHub()}}
            />
            <button ?disabled=${this._hubSearching||!this._hubQuery.trim()} @click=${()=>this._searchHub()}>
              ${this._hubSearching?s("common.loading"):s("skills.search")}
            </button>
          </div>
          <div class="skills-section">
            <div class="skills-section__header">${this._isHermes?s("skills.hermesHubTitle"):s("skills.searchHubTitle")}</div>
            <div class="hub-warn">${v["alert-triangle"]}<span>${this._isHermes?s("skills.hermesHubWarn"):s("skills.hubWarn")}</span></div>
            ${this._hubMsg?r`<div class="hub-msg ${this._hubMsgCls}">${this._hubMsg}</div>`:""}
            ${this._hubSearched?this._hubResults.length?r`
              <div class="skills-section__body">
                ${this._hubResults.map(p=>this._renderHubResult(p))}
              </div>
            `:r`
              <div class="skills-empty">${s("skills.hubNoResults")}</div>
            `:r`
              <div class="hub-empty">
                <div class="hub-intro">
                  <div class="hub-intro__icon">${v.search}</div>
                  <div class="hub-intro__desc">${this._isHermes?s("skills.hermesHubIntro"):s("skills.hubIntro")}</div>
                </div>
                <div class="hub-hints">
                  ${this._isHermes?r`
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.globe}</div>
                      <div class="hub-hint__label">${s("skills.hermesHubSrcT")}</div>
                      <div class="hub-hint__desc">${s("skills.hermesHubSrcD")}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.shield}</div>
                      <div class="hub-hint__label">${s("skills.hermesHubGuardT")}</div>
                      <div class="hub-hint__desc">${s("skills.hermesHubGuardD")}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.wifi}</div>
                      <div class="hub-hint__label">${s("skills.hubNetworkNoteT")}</div>
                      <div class="hub-hint__desc">${s("skills.hubNetworkNoteD")}</div>
                    </div>
                  `:r`
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.zap}</div>
                      <div class="hub-hint__label">${s("skills.hubInstallNoteT")}</div>
                      <div class="hub-hint__desc">${s("skills.hubInstallNoteD")}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.globe}</div>
                      <div class="hub-hint__label">${s("skills.hubSearchTipT")}</div>
                      <div class="hub-hint__desc">${s("skills.hubSearchTipD")}</div>
                    </div>
                    <div class="hub-hint">
                      <div class="hub-hint__icon">${v.wifi}</div>
                      <div class="hub-hint__label">${s("skills.hubNetworkNoteT")}</div>
                      <div class="hub-hint__desc">${s("skills.hubNetworkNoteD")}</div>
                    </div>
                  `}
                </div>
              </div>
            `}
          </div>
        `}
      </div>

      <!-- 技能详情 -->
      ${this._detailOpen?r`
        <div class="detail-backdrop" @click=${this._closeDetail}>
          <div class="detail-box" @click=${p=>p.stopPropagation()}>
            <div class="detail-box__title">${this._detailTitle}</div>
            <div class="detail-box__body">
              ${this._detailLoading?s("common.loading"):this._detailBody}
            </div>
            <div style="text-align:right;margin-top:12px;">
              <button class="btn-detail" @click=${this._closeDetail}>${s("channels.close")}</button>
            </div>
          </div>
        </div>
      `:""}
    `}};Mt.styles=A`
    :host { display: block; }
    /* Shadow DOM 不继承文档级 box-sizing:border-box */
    :host *, :host *::before, :host *::after { box-sizing: border-box; }

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
  `;let D=Mt;E([m({type:String})],D.prototype,"title");E([m({type:String})],D.prototype,"subtitle");E([m({type:String})],D.prototype,"engine");E([m({attribute:!1})],D.prototype,"onNavigate");E([d()],D.prototype,"_activeTab");E([d()],D.prototype,"_search");E([d()],D.prototype,"_skills");E([d()],D.prototype,"_loading");E([d()],D.prototype,"_hubQuery");E([d()],D.prototype,"_hubResults");E([d()],D.prototype,"_hubSearching");E([d()],D.prototype,"_hubSearched");E([d()],D.prototype,"_installingSlug");E([d()],D.prototype,"_hubMsg");E([d()],D.prototype,"_hubMsgCls");E([d()],D.prototype,"_busyPre");E([d()],D.prototype,"_fixingId");E([d()],D.prototype,"_togglingKey");E([d()],D.prototype,"_laneMsg");E([d()],D.prototype,"_expandedSec");E([d()],D.prototype,"_gwConnected");E([d()],D.prototype,"_detailOpen");E([d()],D.prototype,"_detailTitle");E([d()],D.prototype,"_detailBody");E([d()],D.prototype,"_detailLoading");customElements.define("skills-v2-page",D);const As=`/* oc-badge */\r
.oc-badge{\r
  :host { display: inline-block; padding: 2px 10px; border-radius: var(--radius-full); font-size: 11px; ; }\r
  :host([variant="success"]) { background: var(--success-subtle); color: var(--success); }\r
  :host([variant="warning"]) { background: rgba(245,158,11,0.12); color: var(--warn); }\r
  :host([variant="danger"]) { background: var(--danger-subtle); color: var(--danger); }\r
  :host([variant="default"]) { background: var(--bg-muted); color: var(--text-soft); }\r
}\r
/* oc-empty */\r
.oc-empty{\r
  :host {\r
    display: block;\r
    text-align: center;\r
    padding: 64px 24px;\r
    color: var(--muted);\r
  }\r
\r
  h3 {\r
    font-size: 16px;\r
    ;\r
    color: var(--text-soft);\r
    margin-bottom: 6px;\r
  }\r
\r
  p {\r
    font-size: 14px;\r
  }\r
}\r
/* oc-card */\r
 .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-card); display: flex; gap: 16px; align-items: flex-start; }\r
  .card-icon { width: 10px; height: 10px; border-radius: var(--radius-md); background: var(--bg-muted); align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }\r
  .card-body { flex: 1; min-width: 0; }\r
  .card-header { font-size: 13px; font-weight: 600; color: var(--text); padding-bottom: 8px; }\r
  .card-row { padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }\r
  .card-row:last-child { border-bottom: none; }\r
  .card-right { flex-shrink: 0; align-self: stretch; display: flex; align-items: center; }\r
/* oc-stat-card */\r
.stat-card{\r
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; box-shadow: var(--shadow-card); display: flex; flex-direction: column; justify-content: center;\r
  :host { display: block; }\r
  .stat-label { font-size: 14px; ; color: var(--muted); margin-bottom: 4px; font-weight: 400}\r
  .stat-value { font-size: 26px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }\r
  .stat-hint { font-size: 12px; color: var(--text-soft); margin-top: 2px; line-height: 1.4; }\r
  .stat-hint a { color: var(--accent); }\r
  .stat-hint a:hover { color: var(--accent-hover); }\r
}\r
\r
/* oc-btn */\r
.oc-btn{\r
  :host { display: inline-flex; }\r
  .btn { border: none; cursor: pointer; font-family: inherit; font-weight: 600; border-radius: var(--radius-sm); transition: all var(--duration-fast) ease; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }\r
  .btn.sm { padding: 3px 10px; font-size: 11px; min-width: 40px; white-space: nowrap; }\r
  .btn.lg { padding: 8px 18px; font-size: 14px; white-space: nowrap; }\r
  .btn.primary { background: var(--accent); color: var(--accent-foreground); }\r
  .btn.primary:hover { background: var(--accent-hover); }\r
  .btn.ghost { background: transparent; color: var(--text-soft); border: 1px solid var(--border); }\r
  .btn.ghost:hover { background: var(--bg-hover); color: var(--text); }\r
  .btn.danger { background: var(--danger); color: #fff; }\r
  .btn.danger:hover { background: #dc2626; }\r
}\r
/* oc-section */\r
.section{\r
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); margin: 10px 0;\r
  :host { display: block; }\r
  .section-header { padding: 16px 20px; font-size: 13px; font-weight: 600; color: var(--text-strong); border-bottom: 1px solid var(--border); }\r
  .section-body { padding: 16px 20px; }\r
}\r
`;var Qi=Object.defineProperty,Ms=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Qi(e,t,i),i};const Tt=class Tt extends C{constructor(){super(...arguments),this.heading="",this.icon=""}render(){return r`<div class="card">
      ${this.icon?r`<div class="card-icon">${this.icon}</div>`:""}
      <div class="card-body">
        ${this.heading?r`<div class="card-header">${this.heading}</div>`:""}
        <slot></slot>
      </div>
      <div class="card-right"><slot name="right"></slot></div>
    </div>`}};Tt.styles=ve(As);let He=Tt;Ms([m({type:String})],He.prototype,"heading");Ms([m({type:String})],He.prototype,"icon");customElements.define("oc-card",He);var Yi=Object.defineProperty,bt=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Yi(e,t,i),i};const Dt=class Dt extends C{constructor(){super(...arguments),this.size="sm",this.variant="default",this.disabled=!1}render(){return r`<button class="btn ${this.size} ${this.variant}" ?disabled=${this.disabled}><slot></slot></button>`}};Dt.styles=A`:host{display:inline-flex;}.btn{border:1px solid var(--border);background:var(--card);color:var(--text);cursor:pointer;font-family:inherit;font-weight:600;border-radius:var(--radius-md);padding:6px 14px;font-size:13px;transition:all var(--duration-fast) ease;display:inline-flex;align-items:center;justify-content:center;gap:4px;white-space:nowrap;}.btn:hover{background:var(--bg-hover);border-color:var(--text-muted);}.btn.sm{padding:3px 10px;font-size:11px;min-width:40px;}.btn.lg{padding:7px 18px;font-size:13px;}.btn.accent{background:var(--accent);color:#fff;border-color:var(--accent);}.btn.accent:hover{background:var(--accent-hover);}.btn.danger{background:var(--danger);color:#fff;border-color:var(--danger);}.btn.danger:hover{background:#dc2626;border-color:#dc2626;}.btn:disabled{opacity:.5;cursor:not-allowed;}.btn:disabled:hover{background:var(--card);border-color:var(--border);}.btn.accent:disabled:hover{background:var(--accent);border-color:var(--accent);}`;let Ie=Dt;bt([m({type:String})],Ie.prototype,"size");bt([m({type:String})],Ie.prototype,"variant");bt([m({type:Boolean})],Ie.prototype,"disabled");customElements.define("oc-btn",Ie);var Xi=Object.defineProperty,Zi=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Xi(e,t,i),i};const Pt=class Pt extends C{constructor(){super(...arguments),this.variant="default"}render(){return r`<div class="oc-badge"><slot></slot></div>`}};Pt.styles=ve(As);let Xe=Pt;Zi([m({type:String,reflect:!0})],Xe.prototype,"variant");customElements.define("oc-badge",Xe);var ea=Object.defineProperty,be=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ea(e,t,i),i};const It=class It extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._search="",this._filterType="",this._memories=[],this._loadMsg="",this._busy=!1,this._editing=null,this._editContent=""}createRenderRoot(){return this}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._load()}_typeOfFile(e){return e==="USER.md"?"user":e==="SOUL.md"?"soul":"note"}async _load(){this._loadMsg="";try{const e=await fetch(`${this._sidecarBase}/api/gateway/memories`,{headers:x()});if(!e.ok)throw new Error(`HTTP ${e.status}`);const t=await e.json();this._memories=(t.entries||[]).map(a=>{const i=a.content||"";return{id:a.file,file:a.file,name:a.file.replace(/^memory\//,"").replace(/\.md$/,""),type:this._typeOfFile(a.file),content:i,words:i.trim()?i.trim().split(/\s+/).length:0,updated:a.mtime?new Date(a.mtime).toLocaleString(void 0,{dateStyle:"medium",timeStyle:"short"}):"—"}})}catch(e){this._loadMsg=`${s("common.memLoadFailed")}${e instanceof Error?e.message:String(e)}`}}async _create(){var a;const e=`memory/${new Date().toISOString().slice(0,10)}.md`,t=this._memories.find(i=>i.file===e);if(t){this._startEdit(t);return}if(!this._busy){this._busy=!0;try{const i=await fetch(`${this._sidecarBase}/api/gateway/memories`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({file:e,content:""})});if(!i.ok)throw new Error(((a=await i.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${i.status}`);await this._load();const o=this._memories.find(n=>n.file===e);o&&this._startEdit(o)}catch(i){this._loadMsg=`${s("common.memSaveFailed")}${i instanceof Error?i.message:String(i)}`}finally{this._busy=!1}}}get _filtered(){let e=this._memories;if(this._search.trim()){const t=this._search.toLowerCase();e=e.filter(a=>a.name.toLowerCase().includes(t)||a.content.toLowerCase().includes(t))}return this._filterType&&(e=e.filter(t=>t.type===this._filterType)),e}_typeBadge(e){const t={user:s("common.typeUser"),note:s("common.typeNote"),soul:s("common.typeSoul")};return r`<oc-badge variant="${{user:"success",note:"warning",soul:"danger"}[e]||"default"}">${t[e]||e}</oc-badge>`}_startEdit(e){this._editing=e,this._editContent=e.content}async _saveEdit(){var a;if(!this._editing||this._busy)return;const e=this._editing.file,t=this._editContent;this._busy=!0;try{const i=await fetch(`${this._sidecarBase}/api/gateway/memories`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({file:e,content:t})});if(!i.ok)throw new Error(((a=await i.json().catch(()=>({})))==null?void 0:a.detail)||`HTTP ${i.status}`);this._editing=null,this._editContent="",await this._load()}catch(i){this._loadMsg=`${s("common.memSaveFailed")}${i instanceof Error?i.message:String(i)}`}finally{this._busy=!1}}async _delete(e){var t;if(!this._busy&&window.confirm(s("common.memDeleteConfirm",{name:e.name}))){this._busy=!0;try{const a=await fetch(`${this._sidecarBase}/api/gateway/memories?file=${encodeURIComponent(e.file)}`,{method:"DELETE",headers:x()});if(!a.ok)throw new Error(((t=await a.json().catch(()=>({})))==null?void 0:t.detail)||`HTTP ${a.status}`);await this._load()}catch(a){this._loadMsg=`${s("common.memSaveFailed")}${a instanceof Error?a.message:String(a)}`}finally{this._busy=!1}}}render(){return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="page-toolbar-lg">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder=${s("common.searchMemory")} .value=${this._search} @input=${e=>{this._search=e.target.value,this.requestUpdate()}} />
          </div>
          <select class="form-input" style="width:auto;padding:6px 10px;" .value=${this._filterType} @change=${e=>{this._filterType=e.target.value,this.requestUpdate()}}>
            <option value="">${s("common.filterType")}</option>
            <option value="user">${s("common.typeUser")}</option>
            <option value="note">${s("common.typeNote")}</option>
            <option value="soul">${s("common.typeSoul")}</option>
          </select>
        </div>
        <button class="btn-sm" ?disabled=${this._busy} @click=${this._create}>+ ${s("common.createMemory")}</button>
      </div>

      ${this._loadMsg?r`
        <div style="margin:0 0 12px;padding:8px 12px;border:1px solid var(--danger);color:var(--danger);border-radius:var(--radius-md);font-size:12px;">${this._loadMsg}</div>
      `:""}

      ${this._editing?r`
        <oc-card heading="${s("common.edit")}: ${this._editing.name}" style="margin-bottom:16px;">
          <div class="form-group">
            <textarea class="form-input" rows="4" .value=${this._editContent} @input=${e=>this._editContent=e.target.value}></textarea>
          </div>
          <div class="page-actions">
            <button class="btn-sm" @click=${this._saveEdit}>${s("common.save")}</button>
            <button class="btn-sm ghost" @click=${()=>{this._editing=null,this._editContent=""}}>${s("common.cancel")}</button>
          </div>
        </oc-card>
      `:""}

      <div class="grid2">
        ${this._filtered.map(e=>r`
          <div class="channel-card">
            <div style="display:flex;justify-content:space-between;align-items:start;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span class="channel-name" style="font-family:var(--font-mono);font-size:13px;">${e.name}</span>
                  ${this._typeBadge(e.type)}
                </div>
                <div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:8px;">${e.content}</div>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--muted);">
              <span>${e.words} ${s("common.wordCount")} · ${e.updated}</span>
              <div class="page-actions">
                <button class="btn-sm ghost" @click=${()=>this._startEdit(e)}>${s("common.edit")}</button>
                <button class="btn-sm ghost" style="color:var(--danger);" ?disabled=${this._busy} @click=${()=>this._delete(e)}>${s("common.delete")}</button>
              </div>
            </div>
          </div>
        `)}
      </div>
      ${this._filtered.length===0?r`<div class="empty-state"><p>${s("common.descMemory")}</p></div>`:""}
    `}};It.styles=A`:host{display:block;}`;let Z=It;be([m({type:String})],Z.prototype,"title");be([m({type:String})],Z.prototype,"subtitle");be([d()],Z.prototype,"_search");be([d()],Z.prototype,"_filterType");be([d()],Z.prototype,"_memories");be([d()],Z.prototype,"_loadMsg");be([d()],Z.prototype,"_busy");be([d()],Z.prototype,"_editing");be([d()],Z.prototype,"_editContent");customElements.define("memory-page",Z);var ta=Object.defineProperty,Q=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ta(e,t,i),i};function sa(l){if(!l)return"—";const e=new Date(l),t=a=>String(a).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())} ${t(e.getHours())}:${t(e.getMinutes())}`}const zt=class zt extends C{constructor(){super(...arguments),this.title="",this.engine="openclaw",this._jobs=[],this._loading=!1,this._offline=!1,this._error="",this._schedulerEnabled=null,this._busyId=null,this._dialogOpen=!1,this._editingId=null,this._formName="",this._formExpr="",this._formText="",this._formEnabled=!0,this._confirm=null,this._storeUnsub=null}connectedCallback(){if(super.connectedCallback(),this.engine==="hermes"){this._load();return}this._bindStore()}_bindStore(){var t;(t=this._storeUnsub)==null||t.call(this),this._storeUnsub=null;const e=f();this._storeUnsub=e.subscribe(a=>{const i=this._offline;this._offline=!a.connected,a.connected?this._load():i||(this._jobs=[])}),e.connected&&this._load()}updated(e){var t;e.has("engine")&&(this._jobs=[],this.engine==="hermes"?((t=this._storeUnsub)==null||t.call(this),this._storeUnsub=null,this._load()):this._bindStore())}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this)}async _load(){if(this.engine==="hermes"){await this._loadHermes();return}const e=f();if(!e.connected){this._offline=!0;return}this._loading=!0;try{const[t,a]=await Promise.all([e.request("cron.list",{includeDisabled:!0}),e.request("cron.status",{}).catch(()=>null)]);this._jobs=(t==null?void 0:t.jobs)||[],this._schedulerEnabled=a?!!a.enabled:null,this._offline=!1,this._error=""}catch(t){this._error=t instanceof Error?t.message:String(t)}finally{this._loading=!1}}async _loadHermes(){this._loading=!0;try{const e=await _e("/api/jobs?include_disabled=true"),t=Array.isArray(e)?e:(e==null?void 0:e.jobs)||[];this._jobs=t.map(a=>{var i;return{id:String(a.id??""),name:String(a.name??""),enabled:a.enabled!==!1&&a.state!=="paused",schedule:{kind:"cron",expr:((i=a.schedule)==null?void 0:i.expr)||(typeof a.schedule=="string"?a.schedule:"")},payload:{kind:"systemEvent",text:String(a.prompt??"")},nextRunAtMs:a.next_run_at?Date.parse(a.next_run_at):null}}),this._schedulerEnabled=null,this._offline=!1,this._error=""}catch(e){this._offline=!0,this._error=e instanceof Error?e.message:String(e)}finally{this._loading=!1}}_openCreate(){this._editingId=null,this._formName="",this._formExpr="",this._formText="",this._formEnabled=!0,this._dialogOpen=!0}_openEdit(e){var t,a;this._editingId=e.id,this._formName=e.name,this._formExpr=((t=e.schedule)==null?void 0:t.expr)||"",this._formText=((a=e.payload)==null?void 0:a.text)||"",this._formEnabled=e.enabled,this._dialogOpen=!0}_closeDialog(){this._dialogOpen=!1}async _submitDialog(){const e=this._formName.trim(),t=this._formExpr.trim();if(!e||!t)return;if(this.engine==="hermes"){await this._submitDialogHermes(e,t);return}const a=f(),i={name:e,enabled:this._formEnabled,schedule:{kind:"cron",expr:t},payload:{kind:"systemEvent",text:this._formText.trim()||e}};try{this._editingId?await a.request("cron.update",{jobId:this._editingId,patch:i}):await a.request("cron.add",i),this._dialogOpen=!1,this._error="",await this._load()}catch(o){this._error=this._errMsg(o)}}async _submitDialogHermes(e,t){var i;const a=this._formText.trim()||e;try{if(this._editingId){await _e(`/api/jobs/${this._editingId}`,{method:"PATCH",body:JSON.stringify({name:e,schedule:t,prompt:a})});const o=this._jobs.find(n=>n.id===this._editingId);o&&o.enabled!==this._formEnabled&&await _e(`/api/jobs/${this._editingId}/${this._formEnabled?"resume":"pause"}`,{method:"POST"})}else{const o=await _e("/api/jobs",{method:"POST",body:JSON.stringify({name:e,schedule:t,prompt:a,deliver:"local"})});if(!this._formEnabled){const n=(o==null?void 0:o.id)??((i=o==null?void 0:o.job)==null?void 0:i.id);n&&await _e(`/api/jobs/${n}/pause`,{method:"POST"})}}this._dialogOpen=!1,this._error="",await this._load()}catch(o){this._error=this._errMsg(o)}}async _toggleEnabled(e){if(this.engine==="hermes"){await this._runJobAction(e.id,()=>_e(`/api/jobs/${e.id}/${e.enabled?"pause":"resume"}`,{method:"POST"}));return}await this._runJobAction(e.id,()=>f().request("cron.update",{jobId:e.id,patch:{enabled:!e.enabled}}))}async _runNow(e){if(this.engine==="hermes"){await this._runJobAction(e.id,()=>_e(`/api/jobs/${e.id}/run`,{method:"POST"}));return}await this._runJobAction(e.id,()=>f().request("cron.run",{id:e.id}))}_askDelete(e){this._confirm={title:s("cron.deleteTitle"),message:s("cron.deleteConfirm",{name:e.name}),onConfirm:async()=>{if(this.engine==="hermes"){await this._runJobAction(e.id,()=>_e(`/api/jobs/${e.id}`,{method:"DELETE"}));return}await this._runJobAction(e.id,()=>f().request("cron.remove",{id:e.id}))}}}async _runJobAction(e,t){this._busyId=e;try{await t(),this._error="",await this._load()}catch(a){this._error=this._errMsg(a)}finally{this._busyId=null}}_closeConfirm(){this._confirm=null}async _runConfirm(){var t;const e=(t=this._confirm)==null?void 0:t.onConfirm;this._confirm=null,e&&await e()}_errMsg(e){const t=e instanceof Error?e.message:String(e);let a=t;try{const i=JSON.parse(t);i!=null&&i.message&&(a=String(i.message))}catch{}return/CronPattern|invalid configuration format|space separated parts/i.test(a)?s("cron.errInvalidExpr"):/name.{0,20}(required|missing)|required.{0,20}name/i.test(a)?s("cron.errNameRequired"):a}render(){const e=this._jobs.filter(a=>a.enabled).length,t=this._offline?s("cron.gatewayNotRunning"):s("cron.taskCount",{total:this._jobs.length})+" · "+s("cron.runningCount",{count:e});return r`
      <page-header title=${this.title} subtitle=${t}>
        <div class="cron-toolbar__actions" style="margin:0;">
          <button ?disabled=${this._loading||this._offline} @click=${()=>this._load()}>${s("common.refresh")}</button>
          <button class="btn-primary" ?disabled=${this._offline} @click=${()=>this._openCreate()}>+ ${s("cron.createTask")}</button>
        </div>
      </page-header>
      <div class="cron-page">

        ${this._schedulerEnabled===!1?r`
          <div class="cron-status-line">⚠ ${s("cron.schedulerDisabled")}</div>
        `:""}
        ${this._error?r`<div class="cron-error">✗ ${this._error}</div>`:""}

        ${this._offline?r`
          <div class="cron-empty">
            <div class="cron-empty__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="cron-empty__text">${s("cron.gatewayNotRunning")}</div>
          </div>
        `:this._jobs.length>0?r`
          <div class="cron-list">
            ${this._jobs.map(a=>{var i,o;return r`
              <div class="cron-card">
                <div class="cron-card__header">
                  <div class="cron-card__name">
                    ${a.name}
                    <span class="cron-card__badge ${a.enabled?"enabled":"disabled"}">
                      ${a.enabled?s("common.enabled"):s("common.disabled")}
                    </span>
                  </div>
                  <span class="cron-card__schedule">${((i=a.schedule)==null?void 0:i.expr)||"—"}</span>
                </div>
                ${(o=a.payload)!=null&&o.text?r`<div class="cron-card__desc">${a.payload.text}</div>`:""}
                <div class="cron-card__next">${s("cron.nextRun")}: ${a.enabled?sa(a.nextRunAtMs):"—"}</div>
                <div class="cron-card__actions">
                  <button ?disabled=${this._busyId===a.id} @click=${()=>this._openEdit(a)}>${s("common.edit")}</button>
                  <button ?disabled=${this._busyId===a.id||!a.enabled} @click=${()=>this._runNow(a)}>${s("common.runNow")}</button>
                  <button ?disabled=${this._busyId===a.id} @click=${()=>this._toggleEnabled(a)}>
                    ${a.enabled?s("common.disable"):s("common.enable")}
                  </button>
                  <button class="btn-danger" ?disabled=${this._busyId===a.id} @click=${()=>this._askDelete(a)}>${s("common.delete")}</button>
                </div>
              </div>
            `})}
          </div>
        `:r`
          <div class="cron-empty">
            <div class="cron-empty__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="cron-empty__text">${this._loading?s("common.loading"):s("cron.noTasks")}</div>
          </div>
        `}

      </div>

      <!-- 新建/编辑对话框 -->
      ${this._dialogOpen?r`
        <div class="confirm-backdrop" @click=${this._closeDialog}>
          <div class="confirm-box" style="width:min(500px,calc(100vw - 40px));" @click=${a=>a.stopPropagation()}>
            <div class="confirm-box__title">${this._editingId?s("cron.editTitle"):s("cron.createTask")}</div>
            <div class="cron-form">
              <div class="form-group">
                <label class="form-label">${s("cron.taskName")}</label>
                <input class="form-input" type="text" .value=${this._formName}
                  @input=${a=>{this._formName=a.target.value}} />
              </div>
              <div class="form-group">
                <label class="form-label">${s("cron.cronExpr")}</label>
                <input class="form-input mono" type="text" placeholder="0 7 * * *" .value=${this._formExpr}
                  @input=${a=>{this._formExpr=a.target.value}} />
                <div class="form-hint">${s("cron.cronExprHint")}</div>
              </div>
              <div class="form-group">
                <label class="form-label">${s("cron.taskMessage")}</label>
                <textarea class="form-input" .value=${this._formText}
                  @input=${a=>{this._formText=a.target.value}}></textarea>
                <div class="form-hint">${s("cron.taskMessageHint")}</div>
              </div>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text);cursor:pointer;">
                  <input type="checkbox" .checked=${this._formEnabled}
                    @change=${a=>{this._formEnabled=a.target.checked}} />
                  ${s("common.enabled")}
                </label>
              </div>
            </div>
            ${this._error?r`<div class="cron-error">✗ ${this._error}</div>`:""}
            <div class="confirm-box__actions">
              <oc-btn size="lg" @click=${this._closeDialog}>${s("common.cancel")}</oc-btn>
              <oc-btn size="lg" variant="accent" .disabled=${!this._formName.trim()||!this._formExpr.trim()} @click=${()=>this._submitDialog()}>${s("common.confirm")}</oc-btn>
            </div>
          </div>
        </div>
      `:""}

      <!-- 删除确认 -->
      ${this._confirm?r`
        <div class="confirm-backdrop" @click=${this._closeConfirm}>
          <div class="confirm-box" @click=${a=>a.stopPropagation()}>
            <div class="confirm-box__title">${this._confirm.title}</div>
            <div class="confirm-box__msg">${this._confirm.message}</div>
            <div class="confirm-box__actions">
              <oc-btn size="lg" @click=${this._closeConfirm}>${s("common.cancel")}</oc-btn>
              <oc-btn size="lg" variant="accent" @click=${()=>this._runConfirm()}>${s("common.confirm")}</oc-btn>
            </div>
          </div>
        </div>
      `:""}
    `}};zt.styles=A`
    :host { display: block; }

    .cron-page { width: 100%; }

    /* === actions === */
    .cron-toolbar__actions { display: flex; gap: 8px; }
    .cron-toolbar__actions button {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .cron-toolbar__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .cron-toolbar__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cron-toolbar__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .cron-toolbar__actions .btn-primary:hover { background: var(--accent-hover); }

    .cron-status-line {
      font-size: 12px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-error {
      font-size: 12px; color: var(--danger); margin-bottom: 12px; word-break: break-all;
    }

    /* === empty state === */
    .cron-empty {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 200px; padding: 48px 24px;
    }
    .cron-empty__icon {
      width: 40px; height: 40px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-empty__text {
      font-size: 13px; color: var(--text-soft); text-align: center; line-height: 1.6;
    }

    /* === cron cards === */
    .cron-list { display: flex; flex-direction: column; gap: 10px; }
    .cron-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 16px 20px; box-shadow: var(--shadow-card);
    }
    .cron-card__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px; gap: 10px;
    }
    .cron-card__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      display: flex; align-items: center; gap: 8px; min-width: 0;
    }
    .cron-card__schedule {
      font-size: 11px; font-family: var(--font-mono); color: var(--muted);
      background: var(--bg-muted); padding: 2px 8px; border-radius: var(--radius-sm); flex-shrink: 0;
    }
    .cron-card__desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 6px;
      white-space: pre-wrap; word-break: break-word;
    }
    .cron-card__next {
      font-size: 11px; color: var(--muted); margin-bottom: 12px;
    }
    .cron-card__actions { display: flex; gap: 6px; }
    .cron-card__actions button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .cron-card__actions button:hover { background: var(--bg-hover); color: var(--text); }
    .cron-card__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .cron-card__actions .btn-danger { color: var(--danger); border-color: var(--danger); }
    .cron-card__actions .btn-danger:hover { background: var(--danger-subtle); }

    .cron-card__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);
      font-weight: 600; flex-shrink: 0;
    }
    .cron-card__badge.enabled { background: var(--success-subtle); color: var(--success); }
    .cron-card__badge.disabled { background: var(--bg-muted); color: var(--muted); }

    /* === dialog === */
    .cron-form .form-group { margin-bottom: 14px; }
    .cron-form .form-label { display: block; font-size: 12px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
    .cron-form .form-input {
      width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;
      box-sizing: border-box; transition: border-color var(--duration-fast);
    }
    .cron-form .form-input:focus { border-color: var(--accent); }
    .cron-form .form-input.mono { font-family: var(--font-mono); }
    .cron-form .form-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
    .cron-form textarea.form-input { resize: vertical; min-height: 70px; }

    .confirm-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .confirm-box {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 22px 24px; width: min(440px, calc(100vw - 40px)); box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    }
    .confirm-box__title { font-size: 15px; font-weight: 700; color: var(--text-strong); margin-bottom: 10px; }
    .confirm-box__msg { font-size: 13px; color: var(--text-soft); line-height: 1.6; margin-bottom: 18px; }
    .confirm-box__actions { display: flex; justify-content: flex-end; gap: 8px; }
    .confirm-box__actions button {
      padding: 7px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: 1px solid var(--border); cursor: pointer; transition: all var(--duration-fast);
    }
    .confirm-box__actions .btn-cancel { background: transparent; color: var(--text-soft); }
    .confirm-box__actions .btn-cancel:hover { background: var(--bg-hover); color: var(--text); }
    .confirm-box__actions .btn-confirm { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }
    .confirm-box__actions .btn-danger { background: var(--danger); color: #fff; border-color: var(--danger); }
  `;let j=zt;Q([m({type:String})],j.prototype,"title");Q([m({type:String})],j.prototype,"engine");Q([d()],j.prototype,"_jobs");Q([d()],j.prototype,"_loading");Q([d()],j.prototype,"_offline");Q([d()],j.prototype,"_error");Q([d()],j.prototype,"_schedulerEnabled");Q([d()],j.prototype,"_busyId");Q([d()],j.prototype,"_dialogOpen");Q([d()],j.prototype,"_editingId");Q([d()],j.prototype,"_formName");Q([d()],j.prototype,"_formExpr");Q([d()],j.prototype,"_formText");Q([d()],j.prototype,"_formEnabled");Q([d()],j.prototype,"_confirm");customElements.define("cron-page",j);var ia=Object.defineProperty,aa=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ia(e,t,i),i};const oa=[{name:"extensions.quickStart",url:"#"},{name:"extensions.cronAutomation",url:"#"},{name:"extensions.skills",url:"#"}],Ot=class Ot extends C{constructor(){super(...arguments),this.title=""}render(){return r`
      <page-header title=${this.title} subtitle=${s("extensions.subtitle")}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
          ${s("common.refresh")}
        </button>
      </page-header>
      <div class="extensions-page">
        <div class="extensions-grid">

          <!-- Docs card -->
          <div class="ext-card">
            <div class="ext-card__header">${s("extensions.docs")}</div>
            <div class="ext-card__body">
              ${oa.map(e=>r`
                <a class="ext-doc-link" href=${e.url} target="_blank" rel="noopener">
                  ${s(e.name)}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              `)}
            </div>
          </div>

          <!-- Analytics snapshot card -->
          <div class="ext-card">
            <div class="ext-card__header">${s("extensions.analyticsSnapshot")}</div>
            <div class="ext-card__body">
              <div class="ext-snapshot">
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${s("extensions.sessions")}</div>
                  <div class="ext-snapshot__value">0</div>
                </div>
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${s("extensions.tokens")}</div>
                  <div class="ext-snapshot__value">0</div>
                </div>
                <div class="ext-snapshot__item">
                  <div class="ext-snapshot__label">${s("extensions.cost")}</div>
                  <div class="ext-snapshot__value">$0.00</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `}};Ot.styles=A`
    :host { display: block; }

    .extensions-page { width: 100%; }

    /* === main grid === */
    .extensions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    @media (max-width: 700px) { .extensions-grid { grid-template-columns: 1fr; } }

    /* === card === */
    .ext-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .ext-card__header {
      padding: 16px 20px; font-size: 14px; font-weight: 600; color: var(--text-strong);
      border-bottom: 1px solid var(--border);
    }
    .ext-card__body { padding: 16px 20px; }

    /* === doc links === */
    .ext-doc-link {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 0; font-size: 13px; color: var(--accent);
      text-decoration: none; cursor: pointer;
    }
    .ext-doc-link:hover { text-decoration: underline; }
    .ext-doc-link svg { width: 12px; height: 12px; flex-shrink: 0; }

    /* === snapshot stats === */
    .ext-snapshot {
      display: grid; grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden;
    }
    .ext-snapshot__item {
      padding: 16px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .ext-snapshot__item:last-child { border-right: none; }
    .ext-snapshot__label {
      font-size: 11px; color: var(--muted); margin-bottom: 6px;
    }
    .ext-snapshot__value {
      font-size: 20px; font-weight: 600; color: var(--text-strong);
    }
  `;let Ze=Ot;aa([m({type:String})],Ze.prototype,"title");customElements.define("extensions-page",Ze);var ra=Object.defineProperty,I=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ra(e,t,i),i};function na(l){return l==null?"—":l<1024?`${l} B`:`${(l/1024).toFixed(1)} KB`}function la(l){if(!l)return"—";try{return new Date(l).toLocaleString()}catch{return"—"}}const Et=class Et extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.onNavigate=()=>{},this._agents=[],this._defaultId="",this._connected=!1,this._channels={},this._skills=[],this._dialogOpen=!1,this._formName="",this._formModel="",this._formWorkspace="",this._detailView=!1,this._detailAgent=null,this._detailTab="overview",this._toolAllow="",this._toolAlsoAllow="",this._toolDeny="",this._toolsBusy=!1,this._toolsMsg="",this._toolsMsgOk=!1,this._files=[],this._filesWorkspace="",this._fileEditOpen=!1,this._editingFile="",this._fileContent="",this._saving=!1,this._storeUnsub=null}connectedCallback(){super.connectedCallback();const e=f();this._storeUnsub=e.subscribe(t=>{const a=this._connected;this._connected=t.connected,t.connected&&!a&&this._loadAll()})}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this)}async _loadAll(){await Promise.all([this._loadAgents(),this._loadChannels(),this._loadSkills()])}async _loadAgents(){const e=f();if(e.connected)try{const t=await e.request("agents.list",{});this._agents=(t==null?void 0:t.agents)||[],this._defaultId=(t==null?void 0:t.defaultId)||""}catch{}}async _loadChannels(){const e=f();if(e.connected)try{const t=await e.request("channels.status",{});this._channels=(t==null?void 0:t.channels)||{}}catch{}}async _loadSkills(){const e=f();if(e.connected)try{const t=await e.request("skills.status",{});this._skills=(t==null?void 0:t.skills)||[]}catch{}}_connectedChannelIds(){return Object.entries(this._channels).filter(([,e])=>e&&(e.configured||e.running)).map(([e])=>e)}_agentModel(e){const t=e==null?void 0:e.model;return t?typeof t=="string"?t:t.primary||t.id||s("agents.defaultModel"):s("agents.defaultModel")}_openNewAgent(){this._formName="",this._formModel="",this._formWorkspace="",this._dialogOpen=!0}_closeDialog(){this._dialogOpen=!1}async _createAgent(){if(!this._formName.trim())return;const e=f(),a={id:this._formName.trim().toLowerCase().replace(/[^a-z0-9]/g,"_")};this._formModel.trim()&&(a.model=this._formModel.trim()),this._formWorkspace.trim()&&(a.workspace=this._formWorkspace.trim());try{await e.request("agents.create",a),this._dialogOpen=!1,await this._loadAgents()}catch(i){alert("创建失败: "+((i==null?void 0:i.message)||i))}}async _openDetail(e){this._detailAgent={...e},this._detailView=!0,this._detailTab="overview",await this._loadFiles(e.id)}_closeDetail(){this._detailView=!1,this._detailAgent=null}async _loadFiles(e){const t=f();if(t.connected)try{const a=await t.request("agents.files.list",{agentId:e});this._files=(a==null?void 0:a.files)||[],this._filesWorkspace=(a==null?void 0:a.workspace)||""}catch{this._files=[]}}async _openFileEdit(e){var i,o;this._editingFile=e,this._fileContent="",this._fileEditOpen=!0;const t=f(),a=(i=this._detailAgent)==null?void 0:i.id;try{const n=await t.request("agents.files.get",{agentId:a,name:e});this._fileContent=((o=n==null?void 0:n.file)==null?void 0:o.content)||""}catch(n){this._fileContent="// 读取失败: "+((n==null?void 0:n.message)||n)}}_closeFileEdit(){this._fileEditOpen=!1,this._editingFile="",this._fileContent=""}async _saveFileContent(){var a;const e=f(),t=(a=this._detailAgent)==null?void 0:a.id;this._saving=!0;try{await e.request("agents.files.set",{agentId:t,name:this._editingFile,content:this._fileContent}),this._fileEditOpen=!1,await this._loadFiles(t)}catch(i){alert("保存失败: "+((i==null?void 0:i.message)||i))}finally{this._saving=!1}}_renderFileEditDialog(){return r`
      <oc-dialog .open=${this._fileEditOpen} @close=${this._closeFileEdit}>
        <span slot="title">${s("agents.editFile",{file:this._editingFile})}</span>
        <div style="margin:0 10px;">
          <textarea class="detail-textarea" style="min-height:400px;width:100%;"
            .value=${this._fileContent}
            @input=${e=>{this._fileContent=e.target.value}}
          ></textarea>
        </div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeFileEdit}>${s("common.cancel")}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._saveFileContent}>${s("common.confirm")}</oc-btn>
        </div>
      </oc-dialog>
    `}_renderNewAgentDialog(){return r`
      <oc-dialog .open=${this._dialogOpen} @close=${this._closeDialog}>
        <span slot="title">${s("common.newAgent")}</span>
        <div class="channel-dialog">
          <div class="form-group">
            <label class="form-label">${s("agents.agentName")} <span class="required">*</span></label>
            <input class="form-input" type="text" .value=${this._formName}
              placeholder=${s("agents.namePlaceholder")}
              @input=${e=>{this._formName=e.target.value}}
            />
          </div>
          <div class="form-group">
            <label class="form-label">${s("agents.model")}</label>
            <input class="form-input" type="text" .value=${this._formModel}
              placeholder=${s("agents.modelPlaceholder")}
              @input=${e=>{this._formModel=e.target.value}}
            />
          </div>
          <div class="form-group">
            <label class="form-label">${s("agents.workspacePath")}</label>
            <input class="form-input" type="text" .value=${this._formWorkspace}
              placeholder=${s("agents.workspacePlaceholder")}
              @input=${e=>{this._formWorkspace=e.target.value}}
            />
          </div>
        </div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeDialog}>${s("common.cancel")}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._createAgent}>${s("common.confirm")}</oc-btn>
        </div>
      </oc-dialog>
    `}_renderDetailView(){const e=this._detailAgent;return e?r`
      <div class="agent-detail">
        <!-- Back button -->
        <div class="agent-detail__back" @click=${this._closeDetail}>
          ${s("agents.backToList")}
        </div>

        <!-- Title -->
        <div class="agent-detail__title">
          <span class="agent-detail__name">${e.id}</span>
          ${e.id===this._defaultId?r`<span class="agent-card__badge">${s("agents.defaultAgent")}</span>`:""}
        </div>

        <!-- Tabs -->
        <div class="detail-tabs">
          ${["overview","files","channels","tools","skills"].map(t=>r`
            <div class="detail-tab ${this._detailTab===t?"active":""}"
                 @click=${()=>{this._detailTab=t,t==="tools"&&this._loadTools()}}>
              ${{overview:s("agents.overview"),files:s("agents.files"),channels:s("agents.channels"),tools:s("agents.tools"),skills:s("agents.skills")}[t]}
            </div>
          `)}
        </div>

        <!-- Tab content -->
        ${this._detailTab==="overview"?this._renderOverviewTab(e):""}
        ${this._detailTab==="files"?this._renderFilesTab():""}
        ${this._detailTab==="channels"?this._renderChannelsTab():""}
        ${this._detailTab==="tools"?this._renderToolsTab():""}
        ${this._detailTab==="skills"?this._renderSkillsTab():""}

        <!-- File Edit Dialog -->
        ${this._renderFileEditDialog()}
      </div>
    `:""}_renderOverviewTab(e){return r`
      <div style="max-width:640px;">
        <!-- Basic info -->
        <div class="detail-section">
          <div class="detail-section__title">${s("agents.basicInfo")}</div>
          <div class="detail-form-grid">
            <div class="detail-field">
              <label class="detail-field__label">${s("agents.agentId")}</label>
              <input class="detail-field__input" type="text" .value=${e.id} disabled />
            </div>
            <div class="detail-field">
              <label class="detail-field__label">${s("agents.workspace")}</label>
              <input class="detail-field__input mono" type="text" .value=${e.workspace||""} disabled />
            </div>
          </div>
        </div>

        <!-- Model config -->
        <div class="detail-section">
          <div class="detail-section__title">${s("agents.modelConfig")}</div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${s("agents.mainModel")}</label>
            <input class="detail-field__input mono" type="text" .value=${this._agentModel(e)} disabled />
          </div>
          <div class="detail-field">
            <label class="detail-field__label">${s("agents.reasoningLevel")}</label>
            <input class="detail-field__input" type="text" .value=${e.thinkingDefault||s("agents.notSet")} disabled />
          </div>
        </div>
      </div>
    `}_renderFilesTab(){return r`
      <div style="max-width:600px;">
        <div style="font-size:14px;font-weight:600;color:var(--text-strong);margin-bottom:4px;">${s("agents.bootstrapFiles")}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:16px;">${this._filesWorkspace||s("agents.bootstrapDesc")}</div>
        <div class="file-list">
          ${this._files.length?this._files.map(e=>r`
              <div class="file-item">
                <div class="file-item__left">
                  <div class="file-item__name">
                    ${e.name}
                    ${e.missing?"":r`<span class="file-item__badge">${s("agents.created")}</span>`}
                  </div>
                  <div class="file-item__meta">${s("agents.size")}: ${na(e.size)} · ${s("agents.updateTime")}: ${la(e.updatedAtMs)}</div>
                </div>
                ${e.missing?r`<span style="font-size:11px;color:var(--muted);">${s("agents.notSet")}</span>`:r`<button class="file-item__edit" @click=${t=>{t.stopPropagation(),this._openFileEdit(e.name)}}>${s("agents.edit")}</button>`}
              </div>
            `):r`<div style="font-size:12px;color:var(--muted);padding:8px 0;">…</div>`}
        </div>
      </div>
    `}_renderChannelsTab(){const e=this._connectedChannelIds();return r`
      <div style="max-width:600px;">
        <div style="font-size:14px;font-weight:600;color:var(--text-strong);margin-bottom:4px;">${s("agents.channelBinding")}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:16px;">${s("agents.channelBindingDesc")}</div>
        ${e.length?r`
            <div class="file-list">
              ${e.map(t=>{const a=this._channels[t]||{},i=!!a.running;return r`
                  <div class="file-item">
                    <div class="file-item__left">
                      <div class="file-item__name">
                        <span style="width:8px;height:8px;border-radius:50%;display:inline-block;background:${i?"var(--success)":"var(--muted)"};"></span>
                        ${t}
                      </div>
                      <div class="file-item__meta">${s(i?"dashboard.running":"dashboard.stopped")}${a.configured?" · "+s("models.configured"):""}</div>
                    </div>
                  </div>
                `})}
            </div>
          `:r`
            <div class="channel-empty">${s("agents.noChannel")}</div>
            <div style="text-align:center;">
              <button class="channel-empty__btn" @click=${()=>this.onNavigate("channels")}>${s("agents.goToChannels")}</button>
            </div>
          `}
      </div>
    `}_parseToolList(e){return e.split(/[,，\s]+/).map(t=>t.trim()).filter(Boolean)}async _loadTools(){var t,a;const e=(t=this._detailAgent)==null?void 0:t.id;if(e){this._toolsBusy=!0,this._toolsMsg="";try{const i=await f().request("config.get",{}),o=(i==null?void 0:i.config)||(i==null?void 0:i.parsed)||{},c=((((a=o==null?void 0:o.agents)==null?void 0:a.list)||[]).find(p=>(p==null?void 0:p.id)===e)||{}).tools||{},h=p=>Array.isArray(p)?p.join(", "):"";this._toolAllow=h(c.allow),this._toolAlsoAllow=h(c.alsoAllow),this._toolDeny=h(c.deny)}catch(i){this._toolsMsg=i instanceof Error?i.message:String(i),this._toolsMsgOk=!1}this._toolsBusy=!1}}_applyToolTemplate(e){e==="full"?(this._toolAllow="",this._toolAlsoAllow="",this._toolDeny=""):e==="safe"?(this._toolAllow="read, write, apply_patch",this._toolAlsoAllow="",this._toolDeny="exec, browser, gateway, discord"):e==="none"?(this._toolAllow="read",this._toolAlsoAllow="",this._toolDeny="exec, write, edit, apply_patch, process, browser"):(this._toolAllow="",this._toolAlsoAllow="",this._toolDeny="")}async _saveTools(){var t;const e=(t=this._detailAgent)==null?void 0:t.id;if(!(!e||this._toolsBusy)){this._toolsBusy=!0,this._toolsMsg="";try{const a=f(),i=await a.request("config.get",{}),o=(i==null?void 0:i.hash)||"",c={...((i==null?void 0:i.config)||{}).agents||{}},h=Array.isArray(c.list)?c.list.map(_=>({..._})):[];let p=h.find(_=>(_==null?void 0:_.id)===e);p||(p={id:e},h.push(p));const g=this._parseToolList(this._toolAllow),u=this._parseToolList(this._toolAlsoAllow),b=this._parseToolList(this._toolDeny),S={};g.length&&(S.allow=g),u.length&&(S.alsoAllow=u),b.length&&(S.deny=b),Object.keys(S).length?p.tools=S:delete p.tools,c.list=h,await a.request("config.patch",{raw:JSON.stringify({agents:c}),baseHash:o,replacePaths:["agents"]}),this._toolsMsg=s("common.configSaved"),this._toolsMsgOk=!0}catch(a){this._toolsMsg=a instanceof Error?a.message:String(a),this._toolsMsgOk=!1}this._toolsBusy=!1}}async _toggleAgentSkill(e,t){try{await f().request("skills.update",{skillKey:e.name,enabled:t}),e.disabled=!t,this.requestUpdate()}catch(a){this._toolsMsg=a instanceof Error?a.message:String(a),this._toolsMsgOk=!1}}_renderToolsTab(){return r`
      <div style="max-width:640px;">
        <div class="detail-section">
          <div class="detail-section__title">${s("agents.toolPermissions")}</div>
          <div class="detail-section__desc">${s("agents.toolPermDesc")}</div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${s("agents.toolTemplate")}</label>
            <select class="detail-field__input" @change=${e=>this._applyToolTemplate(e.target.value)}>
              <option value="">${s("agents.notSet")}</option>
              <option value="full">${s("agents.fullAllow")}</option>
              <option value="safe">${s("agents.safeOnly")}</option>
              <option value="none">${s("agents.disableAll")}</option>
            </select>
          </div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${s("agents.explicitAllow")}</label>
            <textarea class="detail-textarea" placeholder="read, write, exec" .value=${this._toolAllow}
              @input=${e=>{this._toolAllow=e.target.value}}></textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${s("agents.explicitAllowHint")}</div>
          </div>
          <div class="detail-field" style="margin-bottom:14px;">
            <label class="detail-field__label">${s("agents.appendAllow")}</label>
            <textarea class="detail-textarea" placeholder="grep_search, apply_patch" .value=${this._toolAlsoAllow}
              @input=${e=>{this._toolAlsoAllow=e.target.value}}></textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${s("agents.appendAllowHint")}</div>
          </div>
          <div class="detail-field">
            <label class="detail-field__label">${s("agents.explicitDeny")}</label>
            <textarea class="detail-textarea" placeholder="delete_file" .value=${this._toolDeny}
              @input=${e=>{this._toolDeny=e.target.value}}></textarea>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${s("agents.explicitDenyHint")}</div>
          </div>
        </div>
        ${this._toolsMsg?r`
          <div style="margin:0 0 10px;font-size:12px;color:${this._toolsMsgOk?"var(--success)":"var(--danger)"};">${this._toolsMsg}</div>
        `:""}
        <div class="detail-save">
          <button ?disabled=${this._toolsBusy} @click=${this._saveTools}>${s("agents.saveToolConfig")}</button>
        </div>
      </div>
    `}_renderSkillsTab(){return r`
      <div style="max-width:720px;">
        <div class="detail-section">
          <div class="detail-section__title">${s("agents.skillsWhitelist")}</div>
          <div class="detail-section__desc">${s("agents.skillsWhitelistDesc")} · ${this._skills.length} ${s("agents.skills")}</div>
          <div class="skills-grid">
            ${this._skills.map(e=>r`
              <div class="skill-checkbox-item">
                <input type="checkbox" ?checked=${!e.disabled}
                  @change=${t=>this._toggleAgentSkill(e,t.target.checked)} />
                <div class="skill-checkbox-item__content">
                  <div class="skill-checkbox-item__name">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
                    ${e.name}
                  </div>
                  <div class="skill-checkbox-item__desc">${e.description||""}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `}render(){return this._detailView?r`
        <div class="agents-page">
          ${this._renderDetailView()}
        </div>
      `:r`
      <page-header title=${this.title} subtitle=${s("agents.pageSubtitle")}>
        <button class="btn-new" @click=${this._openNewAgent}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          ${s("common.newAgent")}
        </button>
      </page-header>
      <div class="agents-hint">${s("agents.clickHint")}</div>
      <div class="agents-page">

        <!-- Agent cards -->
        ${this._agents.length===0?r`<div class="channel-empty">${this._connected?"—":"Gateway "+s("dashboard.stopped")}</div>`:this._agents.map(e=>{const t=this._connectedChannelIds();return r`
          <div class="agent-card" @click=${()=>this._openDetail(e)}>
            <div class="agent-card__header">
              <div class="agent-card__left">
                <span class="agent-card__name">${e.id}</span>
                ${e.id===this._defaultId?r`<span class="agent-card__badge">${s("agents.default")}</span>`:""}
              </div>
              <div class="agent-card__actions">
                <button class="btn-detail" @click=${a=>{a.stopPropagation(),this._openDetail(e)}}>${s("agents.detail")}</button>
              </div>
            </div>
            <div class="agent-card__fields">
              <div class="agent-card__field">
                <span class="agent-card__field-label">${s("agents.fieldLabelModel")}</span>
                <span class="agent-card__field-value">${this._agentModel(e)}</span>
              </div>
              <div class="agent-card__field">
                <span class="agent-card__field-label">${s("agents.fieldLabelWorkspace")}</span>
                <span class="agent-card__field-value mono">${e.workspace||s("agents.notSet")}</span>
              </div>
              <div class="agent-card__field">
                <span class="agent-card__field-label">${s("agents.fieldLabelChannels")}</span>
                <span class="agent-card__field-value">${t.length?t.join("、"):s("agents.noChannelBound")}</span>
              </div>
            </div>
          </div>
        `})}

        <!-- New Agent Dialog -->
        ${this._renderNewAgentDialog()}

      </div>
    `}};Et.styles=A`
    :host { display: block; }
    /* Shadow DOM 不继承文档级 box-sizing:border-box；弹窗输入框 width:100%+padding 会溢出横向滚动 */
    :host *, :host *::before, :host *::after { box-sizing: border-box; }

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
  `;let M=Et;I([m({type:String})],M.prototype,"title");I([m({type:String})],M.prototype,"subtitle");I([m({type:Function})],M.prototype,"onNavigate");I([d()],M.prototype,"_agents");I([d()],M.prototype,"_defaultId");I([d()],M.prototype,"_connected");I([d()],M.prototype,"_channels");I([d()],M.prototype,"_skills");I([d()],M.prototype,"_dialogOpen");I([d()],M.prototype,"_formName");I([d()],M.prototype,"_formModel");I([d()],M.prototype,"_formWorkspace");I([d()],M.prototype,"_detailView");I([d()],M.prototype,"_detailAgent");I([d()],M.prototype,"_detailTab");I([d()],M.prototype,"_toolAllow");I([d()],M.prototype,"_toolAlsoAllow");I([d()],M.prototype,"_toolDeny");I([d()],M.prototype,"_toolsBusy");I([d()],M.prototype,"_toolsMsg");I([d()],M.prototype,"_toolsMsgOk");I([d()],M.prototype,"_files");I([d()],M.prototype,"_filesWorkspace");I([d()],M.prototype,"_fileEditOpen");I([d()],M.prototype,"_editingFile");I([d()],M.prototype,"_fileContent");I([d()],M.prototype,"_saving");customElements.define("agents-page",M);var da=Object.defineProperty,ne=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&da(e,t,i),i},ge;const te=(ge=class extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.theme="claw",this.themeMode="dark",this.snapshot={},this._proxyUrl="http://127.0.0.1:7897",this._modelProxy=!1,this._lang="zh-CN",this._autoStart=!1,this._msg="",this._msgCls="",this._msgTimer=null}connectedCallback(){super.connectedCallback(),this._lang=V.locale,this._loadPrefs()}disconnectedCallback(){super.disconnectedCallback(),this._msgTimer&&clearTimeout(this._msgTimer)}_loadPrefs(){try{const e=localStorage.getItem(ge.PREFS_KEY);if(e){const t=JSON.parse(e);typeof t.proxyUrl=="string"&&(this._proxyUrl=t.proxyUrl),typeof t.modelProxy=="boolean"&&(this._modelProxy=t.modelProxy),typeof t.autoStart=="boolean"&&(this._autoStart=t.autoStart)}}catch{}}_persistPrefs(){try{localStorage.setItem(ge.PREFS_KEY,JSON.stringify({proxyUrl:this._proxyUrl,modelProxy:this._modelProxy,autoStart:this._autoStart}))}catch{}}_flash(e,t){this._msg=e,this._msgCls=t,this._msgTimer&&clearTimeout(this._msgTimer),this._msgTimer=setTimeout(()=>{this._msg=""},2500)}_saveProxy(){this._persistPrefs(),this._flash(s("common.configSaved"),"ok")}async _testProxy(){const e=this._proxyUrl.trim();if(!e){this._flash(s("settings.proxyEmpty"),"err");return}try{const t=new AbortController,a=setTimeout(()=>t.abort(),4e3);await fetch(e,{mode:"no-cors",signal:t.signal}),clearTimeout(a),this._flash(s("settings.proxyReachable"),"ok")}catch{this._flash(s("settings.proxyUnreachable"),"err")}}_closeProxy(){this._proxyUrl="",this._modelProxy=!1,this._persistPrefs(),this._flash(s("common.configSaved"),"ok")}_emit(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}render(){return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="settings-page">

        <!-- Network proxy -->
        <div class="settings-section">
          <div class="settings-section__title">${s("settings.networkProxy")}</div>
          <div class="settings-row">
            <input class="settings-input" type="text" .value=${this._proxyUrl}
              placeholder="http://127.0.0.1:7897"
              @input=${e=>{this._proxyUrl=e.target.value}}
            />
            <button class="settings-btn primary" @click=${()=>this._saveProxy()}>${s("common.save")}</button>
            <button class="settings-btn ghost" @click=${()=>this._testProxy()}>${s("settings.testConnection")}</button>
            <button class="settings-btn ghost" @click=${()=>this._closeProxy()}>${s("settings.closeProxy")}</button>
          </div>
          <div class="settings-hint">
            ${s("settings.proxyHint")}
          </div>
          ${this._msg?r`<div class="settings-hint" style="color:${this._msgCls==="ok"?"var(--success)":"var(--danger)"};">${this._msg}</div>`:""}
        </div>

        <!-- Model request proxy -->
        <div class="settings-section">
          <div class="settings-section__title">${s("settings.modelRequestProxy")}</div>
          <div class="settings-checkbox-row">
            <input type="checkbox" id="modelProxy" .checked=${this._modelProxy}
              @change=${e=>{this._modelProxy=e.target.checked,this._persistPrefs()}}
            />
            <label for="modelProxy">${s("settings.modelProxyLabel")}</label>
            <button class="settings-btn primary" style="margin-left:8px;" @click=${()=>this._saveProxy()}>${s("common.save")}</button>
          </div>
          <div class="settings-hint">
            ${s("settings.modelProxyHint")}
          </div>
        </div>

        <!-- Interface language -->
        <div class="settings-section">
          <div class="settings-section__title">${s("settings.interfaceLang")}</div>
          <select class="settings-select" .value=${this._lang}
            @change=${e=>{this._lang=e.target.value,this._emit("set-lang",this._lang)}}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
          <div class="settings-hint">
            ${s("settings.langHint")}
          </div>
        </div>

        <!-- Auto start -->
        <div class="settings-section">
          <div class="settings-section__title">${s("settings.autoStart")}</div>
          <div class="settings-checkbox-row">
            <input type="checkbox" id="autoStart" .checked=${this._autoStart}
              @change=${e=>{this._autoStart=e.target.checked,this._persistPrefs()}}
            />
            <label for="autoStart">${s("settings.autoStartLabel")}</label>
          </div>
          <div class="settings-hint">
            ${s("settings.autoStartHint")}
          </div>
        </div>

      </div>
    `}},ge.styles=A`
    :host { display: block; }

    .settings-page { width: 100%; }

    /* === section card === */
    .settings-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .settings-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }

    /* === form === */
    .settings-row {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    }
    .settings-input {
      flex: 1; min-width: 280px; max-width: 400px; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .settings-input:focus { border-color: var(--accent); }
    .settings-input::placeholder { color: var(--muted); }

    .settings-btn {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .settings-btn.primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .settings-btn.primary:hover { background: var(--accent-hover); }
    .settings-btn.ghost {
      background: transparent; color: var(--text-soft);
    }
    .settings-btn.ghost:hover { background: var(--bg-hover); color: var(--text); }

    .settings-hint {
      font-size: 11px; color: var(--muted); margin-top: 10px; line-height: 1.6;
    }

    /* === checkbox row === */
    .settings-checkbox-row {
      display: flex; align-items: flex-start; gap: 8px;
    }
    .settings-checkbox-row input[type="checkbox"] {
      margin-top: 2px; cursor: pointer;
    }
    .settings-checkbox-row label {
      font-size: 13px; color: var(--text); cursor: pointer; user-select: none;
    }

    /* === select === */
    .settings-select {
      padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      outline: none; cursor: pointer; min-width: 160px;
      transition: border-color var(--duration-fast);
    }
    .settings-select:focus { border-color: var(--accent); }
  `,ge.PREFS_KEY="openclaw.settings.prefs",ge);ne([m({type:String})],te.prototype,"title");ne([m({type:String})],te.prototype,"subtitle");ne([m({type:String})],te.prototype,"theme");ne([m({type:String})],te.prototype,"themeMode");ne([m({type:Object})],te.prototype,"snapshot");ne([d()],te.prototype,"_proxyUrl");ne([d()],te.prototype,"_modelProxy");ne([d()],te.prototype,"_lang");ne([d()],te.prototype,"_autoStart");ne([d()],te.prototype,"_msg");ne([d()],te.prototype,"_msgCls");let ca=te;customElements.define("settings-page",ca);var ha=Object.defineProperty,$=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ha(e,t,i),i};const ds=()=>V.locale.startsWith("zh")?"、":", ",cs={qq:"qqbot",teams:"msteams"},hs={qqbot:{kind:"cli",noteKey:"channelsForm.qqNote",fields:[{key:"appId",labelKey:"channelsForm.appId",type:"text",placeholder:"102xxxxxx",required:!0},{key:"clientSecret",labelKey:"channelsForm.clientSecret",type:"password",required:!0},{key:"account",labelKey:"channelsForm.accountIdOpt",type:"text",placeholder:"default"}],cliFlags:{account:"--account"}},telegram:{kind:"cli",noteKey:"channelsForm.telegramNote",fields:[{key:"token",labelKey:"channelsForm.botToken",type:"password",placeholder:"123456789:AAE...",required:!0}],cliFlags:{token:"--token"}},discord:{kind:"cli",noteKey:"channelsForm.discordNote",fields:[{key:"token",labelKey:"channelsForm.botToken",type:"password",placeholder:"MTIz...xxx",required:!0}],cliFlags:{token:"--token"}},slack:{kind:"cli",noteKey:"channelsForm.slackNote",fields:[{key:"botToken",labelKey:"channelsForm.slackBotToken",type:"password",placeholder:"xoxb-...",required:!0},{key:"appToken",labelKey:"channelsForm.slackAppToken",type:"password",placeholder:"xapp-1-...",required:!0}],cliFlags:{botToken:"--bot-token",appToken:"--app-token"}},signal:{kind:"cli",noteKey:"channelsForm.signalNote",fields:[{key:"number",labelKey:"channelsForm.signalNumber",type:"text",placeholder:"+8613800138000",required:!0}],cliFlags:{number:"--signal-number"}},matrix:{kind:"cli",noteKey:"channelsForm.matrixNote",fields:[{key:"homeserver",labelKey:"channelsForm.homeserver",type:"text",placeholder:"https://matrix.org",required:!0},{key:"token",labelKey:"channelsForm.accessTokenOpt",type:"password",placeholder:"syt_..."}],cliFlags:{homeserver:"--homeserver",token:"--token"}},feishu:{kind:"config",noteKey:"channelsForm.feishuNote",fields:[{key:"appId",labelKey:"channelsForm.feishuAppId",type:"text",placeholder:"cli_a5xxxxx",required:!0},{key:"appSecret",labelKey:"channelsForm.feishuAppSecret",type:"password",required:!0}],configKeys:{appId:"appId",appSecret:"appSecret"}},wecom:{kind:"cli",noteKey:"channelsForm.wecomNote",fields:[{key:"botId",labelKey:"channelsForm.wecomBotId",type:"text",placeholder:"aibot_xxxxxxxx",required:!0},{key:"secret",labelKey:"channelsForm.wecomSecret",type:"password",required:!0}],cliFlags:{botId:"",secret:""}},msteams:{kind:"config",noteKey:"channelsForm.msteamsNote",fields:[{key:"tenantId",labelKey:"channelsForm.tenantId",type:"text",placeholder:"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",required:!0},{key:"appId",labelKey:"channelsForm.msAppId",type:"text",required:!0},{key:"appPassword",labelKey:"channelsForm.msAppPassword",type:"password",required:!0}],configKeys:{tenantId:"tenantId",appId:"appId",appPassword:"appPassword"}}},ps=[{id:"qq",name:s("channels.qqBot"),desc:s("channels.qqDesc"),icon:"chat-bubble"},{id:"dingtalk",name:s("channels.dingtalk"),desc:s("channels.dingtalkDesc"),icon:"hash"},{id:"feishu",name:s("channels.feishu"),desc:s("channels.feishuDesc"),icon:"hash"},{id:"telegram",name:s("channels.telegram"),desc:s("channels.telegramDesc"),icon:"send"},{id:"discord",name:s("channels.discord"),desc:s("channels.discordDesc"),icon:"hash"},{id:"slack",name:s("channels.slack"),desc:s("channels.slackDesc"),icon:"hash"},{id:"wechat",name:s("channels.wechatIntegration"),desc:s("channels.wechatDesc"),icon:"message-circle",supported:!0},{id:"wecom",name:s("channels.wecom"),desc:s("channels.wecomDesc"),icon:"briefcase"},{id:"teams",name:s("channels.teams"),desc:s("channels.teamsDesc"),icon:"users"},{id:"signal",name:s("channels.signal"),desc:s("channels.signalDesc"),icon:"shield"},{id:"matrix",name:s("channels.matrix"),desc:s("channels.matrixDesc"),icon:"globe"}],Lt=class Lt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._activeTab="channels",this._dialogChannel="",this._qqShowSecret=!1,this._qqAgent="",this._wechatStepsOpen=!0,this._wechatCopied=!1,this._wechatCopyTimer=null,this._wechatLoginCmd="openclaw channels login --channel openclaw-weixin",this._wxStatus="idle",this._wxQr="",this._wxMsg="",this._wxUrl="",this._wxWs=null,this._bindAgents=[],this._bindDefaultId="",this._bindings=[],this._bindChannels=[],this._bindAccounts={},this._bindConnected=!1,this._liveChannels={},this._liveChannelOrder=[],this._liveLabels={},this._newBindChannel="",this._newBindAccount="",this._newBindAgent="",this._bindSaving=!1,this._storeUnsub=null,this._formValues={},this._formResult={},this._formVisible={},this._formCopied={},this._copyTimer=null,this._qqStepsOpen=!1,this._qqCopied=!1,this._qqDiagMsg="",this._confirmRemove=null,this._removing=!1,this._removeMsg="",this._removeTimer=null}connectedCallback(){super.connectedCallback();const e=f();this._storeUnsub=e.subscribe(t=>{const a=this._bindConnected;this._bindConnected=t.connected,t.connected&&!a&&this._loadBindingData()})}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this),this._stopWeixinLogin(),this._wechatCopyTimer&&clearTimeout(this._wechatCopyTimer)}async _loadBindingData(){const e=f();if(e.connected)try{const[t,a,i]=await Promise.all([e.request("agents.list",{}),e.request("config.get",{}),e.request("channels.status",{})]);this._bindAgents=(t==null?void 0:t.agents)||[],this._bindDefaultId=(t==null?void 0:t.defaultId)||"";const o=(a==null?void 0:a.config)||(a==null?void 0:a.parsed)||{};this._bindings=Array.isArray(o.bindings)?o.bindings:[];const n=(i==null?void 0:i.channels)||{},c=(i==null?void 0:i.channelAccounts)||{};this._liveChannels=n,this._liveLabels=(i==null?void 0:i.channelDetailLabels)||(i==null?void 0:i.channelLabels)||{},this._liveChannelOrder=(Array.isArray(i==null?void 0:i.channelOrder)?i.channelOrder:Object.keys(n)).filter(p=>{const g=n[p];return!!(g&&(g.configured||g.running))}),this._bindChannels=Object.keys(n).filter(p=>n[p]&&(n[p].configured||n[p].running));const h={};for(const[p,g]of Object.entries(c))Array.isArray(g)&&(h[p]=g.map(u=>({accountId:u.accountId,running:!!u.running})));this._bindAccounts=h,this._newBindAgent||(this._newBindAgent=this._bindDefaultId)}catch{}}_resolveBoundAgent(e,t){if(t){const i=this._bindings.find(o=>o&&o.type!=="acp"&&o.match&&o.match.channel===e&&o.match.accountId===t);if(i)return{agentId:i.agentId||this._bindDefaultId,level:"account"}}const a=this._bindings.find(i=>i&&i.type!=="acp"&&i.match&&i.match.channel===e&&!i.match.accountId);return a?{agentId:a.agentId||this._bindDefaultId,level:"channel"}:{agentId:this._bindDefaultId,level:"default"}}_bindingRows(){const e=[];for(const t of this._bindChannels){const a=this._bindAccounts[t]||[];if(a.length===0)e.push({channel:t,accountId:"",running:!1});else for(const i of a)e.push({channel:t,accountId:i.accountId,running:i.running})}return e}async _mutateBindings(e){const t=f(),a=await t.request("config.get",{}),i=(a==null?void 0:a.hash)||"",o=(a==null?void 0:a.config)||{},n=Array.isArray(o.bindings)?o.bindings:[],c=e(n);await t.request("config.patch",{raw:JSON.stringify({bindings:c}),baseHash:i,replacePaths:["bindings"]}),this._bindings=c}async _addBinding(){const e=this._newBindChannel,t=this._newBindAgent,a=this._newBindAccount;if(!(!e||!t)){this._bindSaving=!0;try{await this._mutateBindings(i=>{const o=i.filter(c=>!c||c.type==="acp"||!c.match||c.match.channel!==e?!0:(c.match.accountId||"")!==a),n={channel:e};return a&&(n.accountId=a),o.push({type:"route",agentId:t,match:n}),o}),this._newBindChannel="",this._newBindAccount=""}catch(i){alert(s("channels.bindFailed")+((i==null?void 0:i.message)||i))}finally{this._bindSaving=!1}}}async _removeBinding(e,t){this._bindSaving=!0;try{await this._mutateBindings(a=>a.filter(i=>!i||i.type==="acp"||!i.match||i.match.channel!==e?!0:(i.match.accountId||"")!==t))}catch(a){alert(s("channels.unbindFailed")+((a==null?void 0:a.message)||a))}finally{this._bindSaving=!1}}_startWeixinLogin(){this._stopWeixinLogin(),this._wxStatus="starting",this._wxMsg=s("channels.wxStarting"),this._wxQr="",this._wxUrl="";const e=window.location.hostname||"127.0.0.1";let t;try{t=new WebSocket(`ws://${e}:7889/ws/weixin-login`)}catch{this._wxStatus="error",this._wxMsg=s("channels.wxConnFailed");return}this._wxWs=t,t.addEventListener("open",()=>t.send(JSON.stringify({action:"start"}))),t.addEventListener("message",a=>{try{const i=JSON.parse(String(a.data));i.status&&(this._wxStatus=i.status,this._wxMsg=this._wxText(i.status,i.message)),i.qrDataUrl&&(this._wxQr=i.qrDataUrl),i.url&&(this._wxUrl=i.url)}catch{}}),t.addEventListener("error",()=>{this._wxStatus="error",this._wxMsg=s("channels.wxConnFailedHint")}),t.addEventListener("close",()=>{this._wxWs=null})}_wxText(e,t){switch(e){case"starting":return s("channels.wxStarting");case"qr_ready":return s("channels.wxQrReady");case"waiting_scan":return s("channels.wxWaitingScan");case"success":return s("channels.wxSuccessFull");case"idle":return s("channels.wxCancelled");case"error":return`${s("channels.wxErrorPrefix")}${t?" "+t:""}`;default:return t||""}}_stopWeixinLogin(){if(this._wxWs){try{this._wxWs.send(JSON.stringify({action:"stop"}))}catch{}try{this._wxWs.close()}catch{}this._wxWs=null}this._wxStatus!=="success"&&(this._wxStatus="idle",this._wxMsg="",this._wxQr="",this._wxUrl="")}async _copyWechatCmd(){try{await navigator.clipboard.writeText(this._wechatLoginCmd)}catch{}this._wechatCopied=!0,this._wechatCopyTimer&&clearTimeout(this._wechatCopyTimer),this._wechatCopyTimer=setTimeout(()=>{this._wechatCopied=!1},2500)}_openDialog(e){this._dialogChannel=e}_closeDialog(){this._dialogChannel==="wechat"&&this._stopWeixinLogin(),this._dialogChannel=""}_onFormField(e,t,a){this._formValues={...this._formValues,[e]:{...this._formValues[e]||{},[t]:a}}}_toggleFieldVisible(e,t){const a=`${e}:${t}`;this._formVisible={...this._formVisible,[a]:!this._formVisible[a]}}_verifyForm(e,t){const a=this._formValues[e]||{},i=t.fields.filter(o=>o.required&&!(a[o.key]||"").trim());this._formResult={...this._formResult,[e]:i.length?{text:s("channelsForm.fieldsMissing",{fields:i.map(o=>s(o.labelKey)).join(ds())}),cls:"err"}:{text:s("channelsForm.fieldsOk"),cls:"ok"}}}_generateConnect(e,t){var n,c;const a=this._formValues[e]||{},i=t.fields.filter(h=>h.required&&!(a[h.key]||"").trim());if(i.length){this._formResult={...this._formResult,[e]:{text:s("channelsForm.fieldsMissing",{fields:i.map(h=>s(h.labelKey)).join(ds())}),cls:"err"}};return}let o;if(e==="wecom")o=[`openclaw config set channels.wecom.botId "${a.botId.trim()}"`,`openclaw config set channels.wecom.secret "${a.secret.trim()}"`,"openclaw config set channels.wecom.enabled true","openclaw gateway restart"].join(`
`);else if(t.kind==="cli"){const h=[];if(e==="qqbot")h.push(`--token "${a.appId.trim()}:${a.clientSecret.trim()}"`),(a.account||"").trim()&&h.push(`--account ${a.account.trim()}`);else for(const p of t.fields){const g=(a[p.key]||"").trim();g&&((n=t.cliFlags)!=null&&n[p.key])&&h.push(`${t.cliFlags[p.key]} "${g}"`)}o=`openclaw channels add --channel ${e} ${h.join(" ")}`}else{const h={};for(const p of t.fields){const g=(a[p.key]||"").trim();g&&((c=t.configKeys)!=null&&c[p.key])&&(h[t.configKeys[p.key]]=g)}o=`// openclaw.json → channels.${e}
${JSON.stringify(h,null,2)}`}this._formCopied={...this._formCopied,[e]:!1},this._formResult={...this._formResult,[e]:{text:o,cls:"ok"}}}async _copyFormResult(e){var a;const t=((a=this._formResult[e])==null?void 0:a.text)||"";try{await navigator.clipboard.writeText(t)}catch{}this._formCopied={...this._formCopied,[e]:!0},this._copyTimer&&clearTimeout(this._copyTimer),this._copyTimer=setTimeout(()=>{this._formCopied={...this._formCopied,[e]:!1}},2e3)}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}async _removeChannel(e){if(!this._removing){if(this._confirmRemove!==e){this._confirmRemove=e,this._removeTimer&&clearTimeout(this._removeTimer),this._removeTimer=setTimeout(()=>{this._confirmRemove=null},4e3);return}this._removing=!0,this._removeMsg="";try{const t=await G(`${this._sidecarBase}/api/gateway/channels/${encodeURIComponent(e)}`,{method:"DELETE"},12e4),a=await t.json().catch(()=>({ok:!1,output:`HTTP ${t.status}`}));if(a.ok){this._confirmRemove=null,this._removeMsg="";for(let i=0;i<15&&(await this._loadBindingData(),!(!this._liveChannels[e]&&!(this._bindChannels||[]).includes(e)));i++)await new Promise(n=>setTimeout(n,1e3));this._closeDialog()}else this._removeMsg=s("channels.removeFailed",{msg:String(a.output||"").slice(0,120)})}catch(t){this._removeMsg=s("channels.removeFailed",{msg:t instanceof Error?t.message:String(t)})}finally{this._removing=!1}}}_renderRemoveButton(e){return r`
      <oc-btn size="lg" variant="danger" ?disabled=${this._removing}
        @click=${()=>this._removeChannel(e)}>
        ${this._removing?s("channels.removing"):this._confirmRemove===e?s("channels.removeConfirm"):s("channels.removeChannel")}
      </oc-btn>
      ${this._removeMsg?r`<span class="remove-err">${this._removeMsg}</span>`:""}
    `}_renderChannelCard(e){return r`
      <div class="channel-card" @click=${()=>this._openDialog(e.id)}>
        <div class="channel-card__icon">${this._getChannelIcon(e.icon)}</div>
        <div class="channel-card__name">${e.name}</div>
        <div class="channel-card__desc">${e.desc}</div>
        ${e.supported?r`<span class="channel-card__badge">${s("channels.supported")}</span>`:""}
      </div>
    `}_renderLiveChannelCard(e){const t=this._liveChannels[e]||{},a=this._bindAccounts[e]||[],i=!!t.running,o=e==="openclaw-weixin"?"wechat":e,n=e==="openclaw-weixin"?"message-circle":"hash";return r`
      <div class="channel-card" @click=${()=>this._openDialog(o)}>
        <div class="channel-card__icon">${this._getChannelIcon(n)}</div>
        <div class="channel-card__name">${this._liveLabels[e]||e}</div>
        <div class="channel-card__desc">
          ${a.length?a.map(c=>`${c.accountId}${c.running?" ●":""}`).join(" · "):t.accountId||"—"}
        </div>
        <span class="channel-card__badge ${i?"":"offline"}">
          ${s(i?"channels.liveRunning":"channels.liveStopped")}
        </span>
      </div>
    `}_getChannelIcon(e){const t={"chat-bubble":r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,hash:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,send:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4z"/><path d="m22 2-11 11"/></svg>`,"message-circle":r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,users:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,briefcase:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,shield:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`,globe:r`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`};return t[e]||t["chat-bubble"]}async _copyQQCmd(){try{await navigator.clipboard.writeText("openclaw plugins install @tencent-connect/openclaw-qqbot@latest")}catch{}this._qqCopied=!0,this._copyTimer&&clearTimeout(this._copyTimer),this._copyTimer=setTimeout(()=>{this._qqCopied=!1},2e3)}async _qqDiagnostics(){this._qqDiagMsg="",await this._loadBindings();const e=this._liveChannels.qqbot||this._liveChannels.qq;this._qqDiagMsg=e?e.running?s("channels.diagRunning"):s("channels.diagConfigured"):s("channels.diagNotConfigured")}_renderQQDialog(){const e=hs.qqbot,t=this._formValues.qqbot||{},a=this._formResult.qqbot;return r`
      <oc-dialog .open=${this._dialogChannel==="qq"} @close=${this._closeDialog}>
        <span slot="title">${s("channels.connecting")} ${s("channels.qqBot")}</span>
        <div class="channel-dialog">
          <!-- Steps toggle -->
          <div class="steps-toggle" @click=${()=>{this._qqStepsOpen=!this._qqStepsOpen}}>
            <span class="chevron" style="transform:rotate(${this._qqStepsOpen?90:0}deg);transition:transform var(--duration-fast);">${v["chevron-right"]}</span>
            ${s("channels.steps")}
          </div>
          ${this._qqStepsOpen?r`
            <ol style="margin:0 0 12px 18px;padding:0;font-size:12px;color:var(--text-soft);line-height:1.8;">
              <li>${s("channels.qqStep1")}</li>
              <li>${s("channels.qqStep2")}</li>
              <li>${s("channels.qqStep3")}</li>
            </ol>
          `:""}

          <!-- AppID -->
          <div class="form-group">
            <label class="form-label">${s("channels.appId")} <span class="required">*</span></label>
            <input class="form-input" type="text" .value=${t.appId||""}
              placeholder=${s("channels.appId")}
              @input=${i=>this._onFormField("qqbot","appId",i.target.value)}
            />
          </div>

          <!-- ClientSecret -->
          <div class="form-group">
            <label class="form-label">${s("channels.clientSecret")} <span class="required">*</span></label>
            <div class="form-row">
              <input class="form-input" .type=${this._qqShowSecret?"text":"password"} .value=${t.clientSecret||""}
                placeholder=${s("channels.clientSecret")}
                @input=${i=>this._onFormField("qqbot","clientSecret",i.target.value)}
              />
              <button @click=${()=>{this._qqShowSecret=!this._qqShowSecret}}>${s("channels.show")}</button>
            </div>
          </div>

          <!-- Account ID -->
          <div class="form-group">
            <label class="form-label">${s("channels.accountId")}</label>
            <input class="form-input" type="text" .value=${t.account||""}
              placeholder=${s("channels.accountIdPlaceholder")}
              @input=${i=>this._onFormField("qqbot","account",i.target.value)}
            />
            <div class="form-hint">${s("channels.accountIdHint")}</div>
          </div>

          <!-- Bind Agent -->
          <div class="form-group">
            <label class="form-label">${s("channels.bindAgent")}</label>
            <select class="form-input" .value=${this._qqAgent||this._bindDefaultId}
              @change=${i=>{this._qqAgent=i.target.value}}
            >
              ${this._bindAgents.length?this._bindAgents.map(i=>r`<option value=${i.id}>${i.id}${i.id===this._bindDefaultId?" ("+s("agents.default")+")":""}</option>`):r`<option value="" disabled>${s("channels.noAgents")}</option>`}
            </select>
            <div class="form-hint">${s("channels.bindAgentHint")}</div>
          </div>

          <!-- Manual command -->
          <div class="command-box">
            <div class="command-box__title">${s("channels.manualCmd")}</div>
            <div class="command-box__desc">${s("channels.manualCmdDesc")}</div>
            <div class="command-box__code">
              <code>openclaw plugins install @tencent-connect/openclaw-qqbot@latest</code>
              <button @click=${this._copyQQCmd}>${this._qqCopied?s("channels.copied"):s("channels.copy")}</button>
            </div>
            <div class="form-hint" style="margin-top:6px;">${s("channels.installHint")}</div>
          </div>

          <!-- Diagnostics：展示网关 channels.status 的真实状态 -->
          <button class="btn-diag" @click=${this._qqDiagnostics}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            ${s("channels.diagnostics")}
          </button>
          ${this._qqDiagMsg?r`<div class="form-hint" style="color:var(--accent);">${this._qqDiagMsg}</div>`:""}
          <div class="form-hint">
            ${dt(s("channels.diagHint"))}
          </div>
          ${a?r`
            <div class="form-result ${a.cls}" style="margin-top:10px;">
              <pre style="white-space:pre-wrap;margin:0;font-family:var(--font-mono);font-size:12px;">${a.text}</pre>
              ${a.cls==="ok"?r`
                <button style="margin-top:6px;" @click=${()=>this._copyFormResult("qqbot")}>
                  ${this._formCopied.qqbot?s("channels.copied"):s("channels.copy")}
                </button>
              `:""}
            </div>
          `:""}
        </div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeDialog}>${s("common.cancel")}</oc-btn>
          <oc-btn size="lg" @click=${()=>this._verifyForm("qqbot",e)}>${s("channels.verify")}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${()=>this._generateConnect("qqbot",e)}>${s("channelsForm.generateCmd")}</oc-btn>
        </div>
      </oc-dialog>
    `}_renderWeChatDialog(){return r`
      <oc-dialog .open=${this._dialogChannel==="wechat"} @close=${this._closeDialog}>
        <span slot="title">${s("channels.wechatIntegration")}</span>
        <div class="channel-dialog">
          <!-- Steps -->
          <div class="steps-toggle ${this._wechatStepsOpen?"open":""}"
               @click=${()=>{this._wechatStepsOpen=!this._wechatStepsOpen}}>
            <span class="chevron">${v["chevron-right"]}</span>
            ${s("channels.wechatSteps")}
          </div>
          ${this._wechatStepsOpen?r`
            <div class="steps-body">
              <ol>
                <li>${dt(s("channels.wechatStep1"))}</li>
                <li>${s("channels.wechatStep2")}</li>
                <li>${s("channels.wechatStep3")}</li>
                <li>${s("channels.wechatStep4")}</li>
                <li>${s("channels.wechatStep5")}</li>
              </ol>
              <div class="note">
                ${s("channels.wechatNote")}
              </div>
            </div>
          `:""}

          <!-- 接入状态（来自 channels.status 实时数据） -->
          ${this._liveChannels["openclaw-weixin"]?r`
            <div class="info-box">
              <div class="info-box__title">
                ${s("channels.wechatInstalled")} ·
                ${this._liveChannels["openclaw-weixin"].running?s("channels.liveRunning"):s("channels.liveStopped")}
              </div>
              <div class="info-box__desc">
                ${(this._bindAccounts["openclaw-weixin"]||[]).map(e=>e.accountId).join(" · ")||"—"}
              </div>
            </div>
          `:""}

          <!-- Manual command -->
          <div class="command-box">
            <div class="command-box__title">${s("channels.wechatLoginCmd")}</div>
            <div class="command-box__desc">${s("channels.wechatLoginCmdDesc")}</div>
            <div class="command-box__code">
              <code>${this._wechatLoginCmd}</code>
              <button @click=${this._copyWechatCmd}>${this._wechatCopied?s("channels.wechatCopied"):s("channels.copy")}</button>
            </div>
            <div class="form-hint" style="margin-top:6px;">${s("channels.wechatLoginCmdDesc")}</div>
          </div>

          <!-- Operation: 扫码登录 -->
          <div class="operation-box">
            <div class="operation-box__title">${s("channels.operation")}</div>
            ${this._wxStatus==="idle"?r`
              <button class="btn-scan" @click=${this._startWeixinLogin}>${s("channels.wechatScanLogin")}</button>
              <div class="operation-box__desc">${s("channels.wechatScanDesc")}</div>
            `:r`
              <div class="wx-qr-area">
                ${this._wxQr?r`<img class="wx-qr-img" src=${this._wxQr} alt="WeChat login QR" />`:r`<div class="wx-qr-placeholder">${this._wxStatus==="starting"?"…":""}</div>`}
                <div class="wx-qr-status ${this._wxStatus}">${this._wxMsg}</div>
                ${this._wxUrl&&this._wxStatus!=="success"?r`
                  <a class="wx-qr-link" href=${this._wxUrl} target="_blank" rel="noopener">二维码无法显示？在手机打开此链接</a>
                `:""}
                ${this._wxStatus!=="success"?r`
                  <oc-btn @click=${this._stopWeixinLogin}>${s("channels.cancel")}</oc-btn>
                `:""}
              </div>
            `}
          </div>
        </div>
        <div slot="footer">
          ${this._renderRemoveButton("openclaw-weixin")}
          <oc-btn size="lg" @click=${this._closeDialog}>${s("channels.close")}</oc-btn>
        </div>
      </oc-dialog>
    `}_renderGenericDialog(e){const t=ps.find(g=>g.id===e)||{name:e},a=cs[e]||e,i=hs[a],o=this._liveChannels[a],n=o&&(o.configured||o.running)?o:null,c=this._bindAccounts[a]||[],h=this._formValues[a]||{},p=this._formResult[a];return r`
      <oc-dialog .open=${this._dialogChannel===e} @close=${this._closeDialog}>
        <span slot="title">${s("channels.connecting")} ${t.name}</span>
        <div class="channel-dialog">
          ${n?r`
            <!-- 已接入渠道：展示实时状态 -->
            <div class="info-box">
              <div class="info-box__title">
                ${n.running?s("channels.liveRunning"):s("channels.liveStopped")}
                · ${c.length||(n.accountId?1:0)} ${s("channels.accountsLabel")}
              </div>
              <div class="info-box__desc">
                ${c.length?c.map(g=>`${g.accountId}${g.running?" ●":""}`).join(" · "):n.accountId||"—"}
              </div>
              ${n.lastError?r`
                <div class="info-box__desc" style="color:var(--danger);margin-top:6px;">
                  ${s("channels.lastError")}: ${n.lastError}
                </div>`:""}
            </div>
            <div class="form-hint" style="margin-top:10px;">${s("channels.channelConfigNote")}</div>
          `:""}

          ${i&&!n?r`
            <!-- 接入表单（凭据说明 + 生成接入命令，不写任何配置） -->
            ${i.fields.map(g=>r`
              <div class="form-group">
                <label class="form-label">${s(g.labelKey)} ${g.required?r`<span class="required">*</span>`:""}</label>
                <div class="form-row">
                  <input class="form-input"
                    .type=${g.type==="password"&&!this._formVisible[`${a}:${g.key}`]?"password":"text"}
                    .value=${h[g.key]||""}
                    placeholder=${g.placeholder||""}
                    @input=${u=>this._onFormField(a,g.key,u.target.value)} />
                  ${g.type==="password"?r`
                    <button @click=${()=>this._toggleFieldVisible(a,g.key)}>
                      ${this._formVisible[`${a}:${g.key}`]?s("channels.hide"):s("channels.show")}
                    </button>`:""}
                </div>
              </div>
            `)}
            <div class="form-hint">${s(i.noteKey)}</div>
            ${p?r`
              <div class="form-result ${p.cls}">
                ${p.cls==="ok"?r`
                  <div class="form-result__cmd">${p.text}</div>
                  <div class="form-result__actions">
                    <button @click=${()=>this._copyFormResult(a)}>
                      ${this._formCopied[a]?s("channelsForm.copied"):s("channels.copyCmd")}
                    </button>
                    <span class="form-hint">${i.kind==="cli"?s("channelsForm.cliHint"):s("channelsForm.configHint")}</span>
                  </div>
                `:p.text}
              </div>
            `:""}
          `:""}

          ${!i&&!n?r`
            <div style="font-size:13px;color:var(--text-soft);padding:20px 0;text-align:center;">
              ${s("channels.genericComingSoon",{name:t.name})}
            </div>
          `:""}
        </div>
        <div slot="footer">
          ${i&&!n?r`
            <oc-btn size="lg" @click=${this._closeDialog}>${s("common.cancel")}</oc-btn>
            <oc-btn size="lg" @click=${()=>this._verifyForm(a,i)}>${s("channels.verify")}</oc-btn>
            <oc-btn size="lg" variant="accent" @click=${()=>this._generateConnect(a,i)}>${s("channelsForm.generateCmd")}</oc-btn>
          `:r`
            ${n?this._renderRemoveButton(a):""}
            <oc-btn size="lg" @click=${this._closeDialog}>${s("channels.close")}</oc-btn>
          `}
        </div>
      </oc-dialog>
    `}render(){return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="channels-page">

        <!-- Tabs -->
        <div class="channels-tabs">
          <div class="channels-tab ${this._activeTab==="channels"?"active":""}"
               @click=${()=>{this._activeTab="channels"}}>
            ${s("channels.channelList")}
          </div>
          <div class="channels-tab ${this._activeTab==="agents"?"active":""}"
               @click=${()=>{this._activeTab="agents"}}>
            ${s("channels.agentBinding")}
          </div>
        </div>

        <!-- Channels grid -->
        ${this._activeTab==="channels"?r`
          ${this._liveChannelOrder.length?r`
            <div class="channels-section" style="margin-bottom:12px;">
              <div class="channels-section__title">${s("channels.connectedChannels")}</div>
              <div class="channel-grid">
                ${this._liveChannelOrder.map(e=>this._renderLiveChannelCard(e))}
              </div>
            </div>
          `:""}
          ${(()=>{const e=new Set(this._liveChannelOrder),t=ps.filter(a=>!e.has(cs[a.id]||a.id));return t.length?r`
              <div class="channels-section">
                <div class="channels-section__title">${s("channels.availablePlatforms")}</div>
                <div class="channel-grid">
                  ${t.map(a=>this._renderChannelCard(a))}
                </div>
              </div>`:""})()}
        `:r`
          <!-- Agent binding（真实 config.bindings）-->
          <div style="margin-bottom:12px;">
            <div style="font-size:12px;color:var(--muted);line-height:1.6;">
              ${s("channels.agentBindDesc")}
            </div>
          </div>

          <!-- 新增绑定（渠道 + 账号 + 实例）-->
          <div class="channels-section" style="margin-bottom:12px;">
            <div class="channels-section__title">${s("channels.addChannelBind")}</div>
            <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${s("channels.bindChannelCol")}</label>
                <select class="bind-select" .value=${this._newBindChannel}
                  @change=${e=>{this._newBindChannel=e.target.value,this._newBindAccount=""}}>
                  <option value="">—</option>
                  ${this._bindChannels.map(e=>r`<option value=${e}>${e}</option>`)}
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${s("channels.bindAccountLabel")}</label>
                <select class="bind-select" .value=${this._newBindAccount} ?disabled=${!this._newBindChannel}
                  @change=${e=>{this._newBindAccount=e.target.value}}>
                  <option value="">${s("channels.bindAllAccounts")}</option>
                  ${(this._bindAccounts[this._newBindChannel]||[]).map(e=>r`<option value=${e.accountId}>${e.accountId}${e.running?" ●":""}</option>`)}
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:11px;color:var(--text-soft);">${s("channels.bindAgentCol")}</label>
                <select class="bind-select" .value=${this._newBindAgent}
                  @change=${e=>{this._newBindAgent=e.target.value}}>
                  ${this._bindAgents.map(e=>r`<option value=${e.id}>${e.id}${e.id===this._bindDefaultId?" ("+s("agents.default")+")":""}</option>`)}
                </select>
              </div>
              <button class="bind-add-btn" ?disabled=${this._bindSaving||!this._newBindChannel}
                @click=${this._addBinding}>${s("channels.addChannelBind")}</button>
            </div>
          </div>

          <!-- 当前绑定关系（按 渠道/账号 → 实例）-->
          <div class="channels-section">
            <div class="channels-section__title">${s("channels.agentBinding")}</div>
            ${this._bindChannels.length===0?r`<div style="font-size:12px;color:var(--muted);padding:8px 0;">${s("channels.noChannelBound")}</div>`:r`
                <div class="bind-list">
                  ${this._bindingRows().map(e=>{const t=this._resolveBoundAgent(e.channel,e.accountId||void 0),a=t.level!=="default",i=t.level==="account"?e.accountId:"",o=t.level==="account"?s("channels.bindLevelAccount"):t.level==="channel"?s("channels.bindLevelChannel"):s("agents.default");return r`
                      <div class="bind-row">
                        <div class="bind-row__channel">${e.channel}</div>
                        <div class="bind-row__account">
                          ${e.accountId?e.accountId:s("channels.bindAllAccounts")}
                          ${e.running?r`<span class="bind-running" title="running">●</span>`:""}
                        </div>
                        <div class="bind-row__arrow">→</div>
                        <div class="bind-row__agent">
                          ${t.agentId}
                          <span class="bind-tag ${t.level==="default"?"default":"explicit"}">${o}</span>
                        </div>
                        ${a?r`<button class="bind-remove" ?disabled=${this._bindSaving} @click=${()=>this._removeBinding(e.channel,i)}>✕</button>`:r`<button class="bind-remove" ?disabled=${this._removing}
                              title=${s("channels.removeChannel")}
                              @click=${()=>this._removeChannel(e.channel)}>✕</button>`}
                      </div>
                    `})}
                </div>
              `}
          </div>
        `}

        <!-- Dialogs -->
        ${this._renderQQDialog()}
        ${this._renderWeChatDialog()}
        ${this._dialogChannel&&this._dialogChannel!=="qq"&&this._dialogChannel!=="wechat"?this._renderGenericDialog(this._dialogChannel):""}

      </div>
    `}};Lt.styles=A`
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
    .channel-card__badge.offline { background: var(--bg-muted); color: var(--muted); }

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

    /* === 接入表单结果 === */
    .channel-dialog .form-result { margin-top: 12px; font-size: 12px; }
    .channel-dialog .form-result.err { color: var(--danger); }
    .channel-dialog .form-result.ok { color: var(--text); }
    .channel-dialog .form-result__cmd {
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 10px 12px; font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
      white-space: pre-wrap; word-break: break-all; color: var(--text); margin-bottom: 8px;
    }
    .channel-dialog .form-result__actions {
      display: flex; align-items: center; gap: 10px;
    }
    .channel-dialog .form-result__actions button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 500;
      border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .channel-dialog .form-result__actions button:hover { background: var(--bg-hover); color: var(--text); }

    /* === 删除接入按钮 === */
    .btn-remove-danger {
      padding: 8px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
      border: 1px solid var(--danger); cursor: pointer; margin-right: auto;
      background: var(--danger-subtle); color: var(--danger); transition: all var(--duration-fast);
    }
    .btn-remove-danger:hover { background: var(--danger); color: #fff; }
    .btn-remove-danger:disabled { opacity: 0.5; cursor: not-allowed; }
    .remove-err { font-size: 12px; color: var(--danger); align-self: center; margin-right: 8px; word-break: break-all; }

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
  `;let w=Lt;$([m({type:String})],w.prototype,"title");$([m({type:String})],w.prototype,"subtitle");$([d()],w.prototype,"_activeTab");$([d()],w.prototype,"_dialogChannel");$([d()],w.prototype,"_qqShowSecret");$([d()],w.prototype,"_qqAgent");$([d()],w.prototype,"_wechatStepsOpen");$([d()],w.prototype,"_wechatCopied");$([d()],w.prototype,"_wxStatus");$([d()],w.prototype,"_wxQr");$([d()],w.prototype,"_wxMsg");$([d()],w.prototype,"_wxUrl");$([d()],w.prototype,"_bindAgents");$([d()],w.prototype,"_bindDefaultId");$([d()],w.prototype,"_bindings");$([d()],w.prototype,"_bindChannels");$([d()],w.prototype,"_bindAccounts");$([d()],w.prototype,"_bindConnected");$([d()],w.prototype,"_liveChannels");$([d()],w.prototype,"_liveChannelOrder");$([d()],w.prototype,"_liveLabels");$([d()],w.prototype,"_newBindChannel");$([d()],w.prototype,"_newBindAccount");$([d()],w.prototype,"_newBindAgent");$([d()],w.prototype,"_bindSaving");$([d()],w.prototype,"_formValues");$([d()],w.prototype,"_formResult");$([d()],w.prototype,"_formVisible");$([d()],w.prototype,"_formCopied");$([d()],w.prototype,"_qqStepsOpen");$([d()],w.prototype,"_qqCopied");$([d()],w.prototype,"_qqDiagMsg");$([d()],w.prototype,"_confirmRemove");$([d()],w.prototype,"_removing");$([d()],w.prototype,"_removeMsg");customElements.define("channels-page",w);var pa=Object.defineProperty,N=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&pa(e,t,i),i};const gs="openclaw.models.config",ga="__OPENCLAW_REDACTED__";function Pe(l){const e=String(l??"");return e.includes(ga)||e.includes("****")}const ot="openclaw.models.pending-sync",us=[{key:"relay",labelKey:"presetRelay",baseUrl:"",models:["gpt-4o","claude-sonnet-4-5"]},{key:"volcengine",labelKey:"presetVolcengine",baseUrl:"https://ark.cn-beijing.volces.com/api/v3",models:["doubao-1-5-pro-32k","deepseek-v3-250324"]},{key:"volcengine-coding",labelKey:"presetVolcengineCoding",baseUrl:"https://ark.cn-beijing.volces.com/api/v3",models:["doubao-seed-code-preview-251028"]},{key:"bailian",labelKey:"presetBailian",baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1",models:["qwen-max","qwen-plus","qwen-turbo"]},{key:"zhipu",labelKey:"presetZhipu",baseUrl:"https://open.bigmodel.cn/api/paas/v4",models:["glm-4-plus","glm-4-flash"]},{key:"MiniMax",baseUrl:"https://api.minimax.chat/v1",models:["MiniMax-Text-01"]},{key:"Moonshot / Kimi",baseUrl:"https://api.moonshot.cn/v1",models:["moonshot-v1-8k","moonshot-v1-32k"]},{key:"openai-official",labelKey:"presetOpenAIOfficial",baseUrl:"https://api.openai.com/v1",models:["gpt-4o","gpt-4o-mini","o3-mini"]},{key:"anthropic-official",labelKey:"presetAnthropicOfficial",baseUrl:"https://api.anthropic.com",models:["claude-sonnet-4-5","claude-opus-4-1"]},{key:"DeepSeek",baseUrl:"https://api.deepseek.com/v1",models:["deepseek-chat","deepseek-reasoner"]},{key:"Google Gemini",baseUrl:"https://generativelanguage.googleapis.com/v1beta/openai",models:["gemini-2.0-flash","gemini-1.5-pro"]},{key:"xAI (Grok)",baseUrl:"https://api.x.ai/v1",models:["grok-3","grok-3-mini"]},{key:"Groq",baseUrl:"https://api.groq.com/openai/v1",models:["llama-3.3-70b-versatile"]},{key:"OpenRouter",baseUrl:"https://openrouter.ai/api/v1",models:["anthropic/claude-sonnet-4","openai/gpt-4o"]},{key:"NVIDIA NIM",baseUrl:"https://integrate.api.nvidia.com/v1",models:["meta/llama-3.1-70b-instruct"]},{key:"ollama-local",labelKey:"presetOllamaLocal",baseUrl:"http://127.0.0.1:11434/v1",models:["llama3.1","qwen2.5"]}],ua={openai:"openai-completions",anthropic:"anthropic-messages",google:"google-generative-ai",ollama:"openai-completions"};function ma(l){const e=String((l==null?void 0:l.api)??"");return e==="anthropic-messages"?"anthropic":e.startsWith("google-")?"google":"openai"}const va=l=>r`
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="${l?"currentColor":"none"}" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`,Bt=class Bt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._providers=[],this._expanded={},this._search="",this._saveFlash=!1,this._connected=!1,this._source="local",this._saving=!1,this._saveError="",this._pendingLocal=!1,this._notice="",this._dialogOpen=!1,this._editingId=null,this._formProviderName="",this._formApiType="openai",this._formBaseUrl="",this._formApiKey="",this._formSelectedPreset="",this._formModels=[],this._formModelInput="",this._confirm=null,this._inlineInputs={},this._saveTimer=null,this._noticeTimer=null,this._storeUnsub=null,this._rawModels={},this._rawProviders={},this._pendingDeletes=new Set,this._defaultModelRef=""}connectedCallback(){super.connectedCallback();const e=f(),t=this._readPending();t&&(this._pendingLocal=!0,this._pendingDeletes=new Set(t.deletes)),this._storeUnsub=e.subscribe(a=>{const i=this._connected;this._connected=a.connected,a.connected&&!i&&(this._pendingLocal?(this._loadFromLocal(),this._saveToGateway()):this._loadFromGateway())}),e.connected||this._loadFromGateway()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this),this._saveTimer&&clearTimeout(this._saveTimer),this._noticeTimer&&clearTimeout(this._noticeTimer)}async _loadFromGateway(){var t,a,i;const e=f();if(!e.connected){this._loadFromLocal(),this._pendingLocal||this._showNotice(s("models.offlineRefreshed"));return}try{const o=await e.request("config.get",{}),n=(o==null?void 0:o.config)||(o==null?void 0:o.parsed)||{},c=((t=n==null?void 0:n.models)==null?void 0:t.providers)||{},h=(i=(a=n==null?void 0:n.agents)==null?void 0:a.defaults)==null?void 0:i.model;this._defaultModelRef=typeof h=="string"?h:(h==null?void 0:h.model)||"";const p={},g={},u=[];for(const[b,S]of Object.entries(c)){const _=S||{},T=this._providers.find(fe=>fe.id===b),Y=String(_.apiKey??"");p[b]=_;const Yt={},Xt=[];for(const fe of Array.isArray(_.models)?_.models:[]){const qe=typeof fe=="string"?fe:String((fe==null?void 0:fe.id)??"");qe&&(Yt[qe]=fe,Xt.push({id:qe,isPrimary:this._defaultModelRef===`${b}/${qe}`}))}g[b]=Yt,u.push({id:b,name:b,baseUrl:String(_.baseUrl??""),apiKey:Pe(Y)?T&&!Pe(T.apiKey)?T.apiKey:"":Y,apiType:ma(_),models:Xt})}this._providers=u,this._rawProviders=p,this._rawModels=g,this._source="gateway",this._saveError="",this._mirrorToLS()}catch(o){this._loadFromLocal(),this._saveError=o instanceof Error?o.message:String(o)}}_loadFromLocal(){this._source="local",this._rawProviders={},this._rawModels={},this._defaultModelRef="";try{const e=localStorage.getItem(gs);if(e){const t=JSON.parse(e);if(Array.isArray(t==null?void 0:t.providers)){this._providers=t.providers.map(a=>({id:String(a.id??""),name:String(a.name??""),baseUrl:String(a.baseUrl??""),apiKey:String(a.apiKey??""),models:Array.isArray(a.models)?a.models.map(i=>({id:String(i.id??""),isPrimary:!!i.isPrimary})):[]}));return}}}catch{}this._providers=[]}_mirrorToLS(){try{localStorage.setItem(gs,JSON.stringify({providers:this._providers.map(e=>({...e,apiKey:Pe(e.apiKey)?"":e.apiKey,apiType:e.apiType||"openai"}))}))}catch{}}_save(){f().connected?this._saveToGateway():this._saveToLocal()}_syncAuthKeys(){const e=typeof window<"u"&&window.location.hostname||"127.0.0.1";for(const t of this._providers){const a=(t.apiKey||"").trim();!a||Pe(a)||fetch(`http://${e}:7889/api/models/auth/set-key`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:t.id,apiKey:a})}).catch(()=>{})}}_saveToLocal(){this._mirrorToLS(),this._writePending(),this._saveError="",this._saveFlash=!0,this._saveTimer&&clearTimeout(this._saveTimer),this._saveTimer=setTimeout(()=>{this._saveFlash=!1},1800),this._syncAuthKeys()}_showNotice(e){this._notice=e,this._noticeTimer&&clearTimeout(this._noticeTimer),this._noticeTimer=setTimeout(()=>{this._notice=""},3e3)}_readPending(){try{const e=localStorage.getItem(ot);if(!e)return null;const t=JSON.parse(e);return{deletes:Array.isArray(t==null?void 0:t.deletes)?t.deletes.map(a=>String(a)):[]}}catch{return null}}_writePending(){try{localStorage.setItem(ot,JSON.stringify({deletes:[...this._pendingDeletes]}))}catch{}this._pendingLocal=!0}_clearPending(){try{localStorage.removeItem(ot)}catch{}this._pendingLocal=!1}async _saveToGateway(){var t;const e=f();if(!e.connected){this._saveError=s("models.gwDisconnected");return}this._saving=!0,this._saveError="";try{const a=await e.request("config.get",{}),i=(a==null?void 0:a.config)||(a==null?void 0:a.parsed)||{},o=((t=i==null?void 0:i.models)==null?void 0:t.providers)||{},n=["agents.defaults.model"],c={};for(const p of this._pendingDeletes)o[p]!==void 0&&(c[p]=null,n.push(`models.providers.${p}`,`models.providers.${p}.models`));for(const p of this._providers){const g={...this._rawProviders[p.id]||{}};Pe(g.apiKey)&&delete g.apiKey;const u=this._rawModels[p.id]||{};c[p.id]={...g,...p.baseUrl?{baseUrl:p.baseUrl}:{},...p.apiKey&&!Pe(p.apiKey)?{apiKey:p.apiKey}:{},api:ua[p.apiType]||"openai-completions",models:p.models.map(b=>u[b.id]||{id:b.id,name:b.id})},n.push(`models.providers.${p.id}.models`)}let h="";for(const p of this._providers){const g=p.models.find(u=>u.isPrimary);if(g){h=`${p.id}/${g.id}`;break}}await e.request("config.patch",{raw:JSON.stringify({models:{providers:c},agents:{defaults:{model:h||null}}}),baseHash:(a==null?void 0:a.hash)||"",replacePaths:n}),this._defaultModelRef=h,this._pendingDeletes.clear(),this._clearPending(),this._mirrorToLS(),this._saveFlash=!0,this._saveTimer&&clearTimeout(this._saveTimer),this._saveTimer=setTimeout(()=>{this._saveFlash=!1},1800),await this._loadFromGateway(),this._syncAuthKeys()}catch(a){this._saveError=this._errMsg(a)}finally{this._saving=!1}}_errMsg(e){const t=e instanceof Error?e.message:String(e);try{const a=JSON.parse(t);if(a!=null&&a.message)return String(a.message)}catch{}return t}_openAddDialog(){this._editingId=null,this._formProviderName="",this._formApiType="openai",this._formBaseUrl="",this._formApiKey="",this._formSelectedPreset="",this._formModels=[],this._formModelInput="",this._dialogOpen=!0}_openEditDialog(e){const t=this._providers.find(a=>a.id===e);t&&(this._editingId=e,this._formProviderName=t.name,this._formApiType=t.apiType||"openai",this._formBaseUrl=t.baseUrl,this._formApiKey=t.apiKey,this._formSelectedPreset="",this._formModels=t.models.map(a=>a.id),this._formModelInput="",this._dialogOpen=!0)}_closeDialog(){this._dialogOpen=!1}_presetLabel(e){return e.labelKey?s(`models.${e.labelKey}`):e.key}_selectPreset(e){this._formSelectedPreset=e.key,this._formProviderName=this._presetLabel(e),e.baseUrl&&(this._formBaseUrl=e.baseUrl),this._formModels=[...e.models]}_addFormModel(){const e=this._formModelInput;if(!e)return;const t=e.split(/[,，\s]+/).map(i=>i.trim()).filter(Boolean);if(!t.length)return;const a=[...this._formModels];for(const i of t)a.includes(i)||a.push(i);this._formModels=a,this._formModelInput="",this.requestUpdate()}_onFormModelKeydown(e){e.key==="Enter"&&(e.preventDefault(),this._addFormModel())}_removeFormModel(e){this._formModels=this._formModels.filter(t=>t!==e)}_addCommonModel(e){this._formModels.includes(e)||(this._formModels=[...this._formModels,e])}_confirmProvider(){const e=this._formProviderName.trim();if(e){if(this._editingId)this._providers=this._providers.map(t=>{var o;if(t.id!==this._editingId)return t;const a=(o=t.models.find(n=>n.isPrimary))==null?void 0:o.id;let i=this._formModels.map(n=>({id:n,isPrimary:n===a}));return i.length&&!i.some(n=>n.isPrimary)&&(i[0].isPrimary=!0),{...t,baseUrl:this._formBaseUrl.trim(),apiKey:this._formApiKey.trim(),apiType:this._formApiType,models:i}});else{const t=e.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"provider";let a=t,i=2;for(;this._providers.some(n=>n.id===a);)a=`${t}_${i++}`;const o=this._formModels.map((n,c)=>({id:n,isPrimary:c===0}));this._providers=[...this._providers,{id:a,name:a,baseUrl:this._formBaseUrl.trim(),apiKey:this._formApiKey.trim(),apiType:this._formApiType,models:o}],this._expanded={...this._expanded,[a]:!0}}this._dialogOpen=!1,this.requestUpdate(),this._save()}}_askDeleteProvider(e){const t=this._providers.find(a=>a.id===e);t&&(this._confirm={title:s("models.deleteProviderTitle"),message:s("models.deleteProviderConfirm",{name:t.name,count:t.models.length}),onConfirm:()=>{this._providers=this._providers.filter(a=>a.id!==e),this._pendingDeletes.add(e),this._save()}})}_askRevokeAll(){this._providers.length&&(this._confirm={title:s("models.revokeAllTitle"),message:s("models.revokeAllConfirm"),onConfirm:()=>{for(const e of this._providers)this._pendingDeletes.add(e.id);this._providers=[],this._expanded={},this._save()}})}_closeConfirm(){this._confirm=null}_runConfirm(){var e;(e=this._confirm)==null||e.onConfirm(),this._confirm=null}_togglePrimary(e,t){this._providers=this._providers.map(i=>i.id!==e?i:{...i,models:i.models.map(o=>({...o,isPrimary:o.id===t?!o.isPrimary:!1}))});const a=this._providers.find(i=>i.id===e);a&&a.models.length&&!a.models.some(i=>i.isPrimary)&&(this._providers=this._providers.map(i=>i.id!==e?i:{...i,models:i.models.map((o,n)=>({...o,isPrimary:n===0}))})),this.requestUpdate(),this._save()}_deleteModel(e,t){this._providers=this._providers.map(a=>{if(a.id!==e)return a;const i=a.models.filter(o=>o.id!==t);return{...a,models:i}}),this.requestUpdate(),this._save()}_addInlineModel(e){var i;const t=(i=this._inlineInputs[e])==null?void 0:i.trim();if(!t)return;const a=t.split(/[,，\s]+/).map(o=>o.trim()).filter(Boolean);this._providers=this._providers.map(o=>{if(o.id!==e)return o;const n=new Set(o.models.map(h=>h.id)),c=[...o.models];for(const h of a)n.has(h)||c.push({id:h,isPrimary:c.length===0});return{...o,models:c}}),this._inlineInputs[e]="",this.requestUpdate(),this._save()}_onInlineKeydown(e,t){e.key==="Enter"&&(e.preventDefault(),this._addInlineModel(t))}_toggleExpand(e){this._expanded={...this._expanded,[e]:!this._expanded[e]}}_matches(e,t){if(!t)return{providerHit:!0,modelIds:null};const a=e.name.toLowerCase().includes(t),i=new Set(e.models.filter(o=>o.id.toLowerCase().includes(t)).map(o=>o.id));return{providerHit:a,modelIds:i}}_renderSystemGroup(){const e=this._providers.flatMap(o=>o.models.map(n=>({...n,provider:o.name}))),t=e.find(o=>o.isPrimary),a=e.filter(o=>!o.isPrimary),i=e.length;return r`
      <div class="provider-group open" style="margin-bottom:12px;">
        <div class="provider-group__header" style="cursor:default;">
          <div class="provider-group__left">
            <span class="provider-group__chevron open">${v["chevron-right"]}</span>
            <span class="provider-group__name">${s("models.systemMainBackup")}</span>
          </div>
          <span class="provider-group__status">
            ${i>0?r`<span style="color:var(--success)">${s("models.modelsTotal",{providers:this._providers.length,count:i})}</span>`:r`<span class="unconfigured">${s("models.unconfigured")}</span>`}
          </span>
        </div>
        <div class="provider-group__body" style="display:block;">
          <div class="sys-row">
            <span class="sys-row__label">${s("models.systemPrimary")}</span>
            ${t?r`<span class="sys-row__value">${t.provider}/${t.id}</span>
                     <span class="sys-row__sub">${t.provider}</span>`:this._defaultModelRef?r`<span class="sys-row__value">${this._defaultModelRef}</span>
                       <span class="sys-row__sub">${s("dashboard.fromGatewayConfig")}</span>`:r`<span class="sys-row__value empty">${s("models.notSet")}</span>`}
          </div>
          <div class="sys-row">
            <span class="sys-row__label">${s("models.systemBackup")}</span>
            ${a.length?r`<span class="sys-row__value">${a.slice(0,3).map(o=>o.id).join("、")}${a.length>3?" …":""}</span>
                     <span class="sys-row__sub">${a.length} ${s("models.candidates")}</span>`:r`<span class="sys-row__value empty">${s("models.notSet")}</span>`}
          </div>
        </div>
      </div>
    `}_renderProviderGroup(e,t){const{providerHit:a,modelIds:i}=this._matches(e,t);if(t&&!a&&i.size===0)return"";const o=a||!t?e.models:e.models.filter(p=>i.has(p.id)),n=!!this._expanded[e.id]||t.length>0&&o.length>0,c=e.models.length,h=c>0;return r`
      <div class="provider-group ${n?"open":""}">
        <div class="provider-group__header" @click=${()=>this._toggleExpand(e.id)}>
          <div class="provider-group__left">
            <span class="provider-group__chevron ${n?"open":""}">${v["chevron-right"]}</span>
            <span class="provider-group__name">${e.name}</span>
            ${e.baseUrl?r`<span class="provider-group__url">${e.baseUrl}</span>`:""}
          </div>
          <div class="provider-group__right">
            <span class="provider-group__status">
              ${h?r`<span style="color:var(--success)">${c} ${s("models.modelsCount")}</span>`:r`<span class="unconfigured">${s("models.unconfigured")}</span> <span style="color:var(--muted)">0 ${s("models.candidates")}</span>`}
            </span>
            <span class="provider-group__actions" @click=${p=>p.stopPropagation()}>
              <button class="icon-btn" title=${s("models.edit")} @click=${()=>this._openEditDialog(e.id)}>${v.edit}</button>
              <button class="icon-btn danger" title=${s("models.delete")} @click=${()=>this._askDeleteProvider(e.id)}>${v.trash}</button>
            </span>
          </div>
        </div>
        <div class="provider-group__body">
          ${o.length?r`
            <div class="model-list">
              ${o.map(p=>r`
                <div class="model-row ${p.isPrimary?"primary":""}">
                  <button class="model-row__star ${p.isPrimary?"on":""}"
                    title=${p.isPrimary?s("models.primary"):s("models.setPrimary")}
                    @click=${()=>this._togglePrimary(e.id,p.id)}>
                    ${va(p.isPrimary)}
                  </button>
                  <span class="model-row__id">${p.id}</span>
                  ${p.isPrimary?r`<span class="model-row__badge">${s("models.primary")}</span>`:""}
                  <button class="icon-btn danger" title=${s("models.delete")}
                    @click=${()=>this._deleteModel(e.id,p.id)}>${v.x}</button>
                </div>
              `)}
            </div>
          `:r`<div class="no-models">${s("models.noModels")}</div>`}
          <div class="inline-add">
            <input type="text" placeholder=${s("models.addModelInline")}
              .value=${this._inlineInputs[e.id]??""}
              @input=${p=>{this._inlineInputs[e.id]=p.target.value,this.requestUpdate()}}
              @keydown=${p=>this._onInlineKeydown(p,e.id)}
            />
            <button @click=${()=>this._addInlineModel(e.id)}>${v.plus} ${s("models.addModel")}</button>
          </div>
        </div>
      </div>
    `}_renderDialog(){var a;const e=!!this._editingId,t=us.find(i=>i.name===this._formSelectedPreset);return r`
      <oc-dialog .open=${this._dialogOpen} @close=${this._closeDialog}>
        <span slot="title">${s(e?"models.editDialogTitle":"models.dialogTitle")}</span>
        <div class="provider-form">
          ${e?"":r`
            <!-- 快捷选择（仅新增时显示） -->
            <div style="font-size:13px;font-weight:600;color:var(--text-strong);margin-bottom:8px;">${s("models.quickSelect")}</div>
            <div class="quick-picks">
              ${us.map(i=>r`
                <button
                  style="${this._formSelectedPreset===i.key?"background:var(--accent-subtle);color:var(--accent);border-color:var(--accent);":""}"
                  @click=${()=>this._selectPreset(i)}
                >${this._presetLabel(i)}</button>
              `)}
            </div>
            <div class="form-hint" style="margin-bottom:12px;">${s("models.quickSelectHint")}</div>
          `}

          <!-- 服务商名称（即网关配置键，编辑时不可改） -->
          <div class="form-group">
            <label class="form-label">${s("models.providerName")}</label>
            <input class="form-input" type="text" .value=${this._formProviderName}
              placeholder=${s("models.providerNamePlaceholder")} ?disabled=${e}
              @input=${i=>{this._formProviderName=i.target.value,this._formSelectedPreset=""}}
            />
            <div class="form-hint">${s(e?"models.providerIdLocked":"models.providerNameHint")}</div>
          </div>

          <!-- 接口地址 -->
          <div class="form-group">
            <label class="form-label">${s("models.apiUrl")}</label>
            <input class="form-input" type="text" .value=${this._formBaseUrl}
              placeholder="https://api.deepseek.com/v1"
              @input=${i=>{this._formBaseUrl=i.target.value}}
            />
            <div class="form-hint">${s("models.apiUrlHint")}</div>
          </div>

          <!-- 接口类型（写入网关 provider.api；OpenAI 兼容为默认） -->
          <div class="form-group">
            <label class="form-label">${s("models.apiType")}</label>
            <select class="form-input" .value=${this._formApiType}
              @change=${i=>{this._formApiType=i.target.value}}>
              <option value="openai">${s("models.apiTypeOpenAI")}</option>
              <option value="anthropic">${s("models.apiTypeAnthropic")}</option>
              <option value="google">${s("models.apiTypeGoogle")}</option>
              <option value="ollama">${s("models.apiTypeOllama")}</option>
            </select>
            <div class="form-hint">${s("models.apiTypeHint")}</div>
          </div>

          <!-- API Key -->
          <div class="form-group">
            <label class="form-label">${s("models.apiKey")}</label>
            <input class="form-input" type="password" .value=${this._formApiKey}
              placeholder="sk-..."
              @input=${i=>{this._formApiKey=i.target.value}}
            />
            <div class="form-hint">${s("models.apiKeyHint")}</div>
          </div>

          <!-- 模型列表 -->
          <div class="form-group">
            <label class="form-label">${s("models.modelList")}</label>
            <div class="model-input-row">
              <input class="form-input" type="text" .value=${this._formModelInput}
                placeholder=${s("models.modelPlaceholder")}
                @input=${i=>{this._formModelInput=i.target.value}}
                @keydown=${this._onFormModelKeydown}
              />
              <button @click=${this._addFormModel}>+ ${s("models.addModel")}</button>
            </div>
            ${this._formModels.length?r`
              <div class="model-chips">
                ${this._formModels.map((i,o)=>r`
                  <span class="model-chip">
                    ${i}
                    ${o===0?r`<span class="model-chip__primary">${s("models.primary")}</span>`:""}
                    <button title=${s("models.delete")} @click=${()=>this._removeFormModel(i)}>${v.x}</button>
                  </span>
                `)}
              </div>
            `:""}
            ${(a=t==null?void 0:t.models)!=null&&a.length?r`
              <div class="common-models">
                <span class="common-models__label">${s("models.commonModels")}:</span>
                ${t.models.filter(i=>!this._formModels.includes(i)).map(i=>r`
                  <button @click=${()=>this._addCommonModel(i)}>+ ${i}</button>
                `)}
              </div>
            `:""}
            <div class="form-hint">${s("models.modelListHint")}</div>
          </div>
        </div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeDialog}>${s("common.cancel")}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._confirmProvider}>${s("common.confirm")}</oc-btn>
        </div>
      </oc-dialog>
    `}_renderConfirm(){var e,t;return r`
      <oc-dialog .open=${!!this._confirm} @close=${this._closeConfirm}>
        <span slot="title">${((e=this._confirm)==null?void 0:e.title)??""}</span>
        <div class="confirm-msg">${((t=this._confirm)==null?void 0:t.message)??""}</div>
        <div slot="footer">
          <oc-btn size="lg" @click=${this._closeConfirm}>${s("common.cancel")}</oc-btn>
          <oc-btn size="lg" variant="accent" @click=${this._runConfirm}>${s("common.confirm")}</oc-btn>
        </div>
      </oc-dialog>
    `}render(){const e=this._providers.length>0,t=this._search.trim().toLowerCase(),a=this._providers.filter(i=>{const{providerHit:o,modelIds:n}=this._matches(i,t);return o||((n==null?void 0:n.size)??0)>0});return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="models-page">
        <!-- 工具栏 -->
        <div class="models-toolbar">
          <button class="btn-add" @click=${this._openAddDialog}>
            ${v.plus} ${s("models.addProvider")}
          </button>
          <button class="btn-revoke" @click=${this._askRevokeAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            ${s("models.revoke")}
          </button>
          ${this._saving?r`<span class="saving-hint">${s("models.saving")}</span>`:this._saveFlash?r`<span class="save-flash">${v.check} ${s("models.saved")}</span>`:""}
        </div>
        ${this._saveError?r`
          <div class="models-error">
            ✗ ${this._saveError}
            <button class="btn-revoke" style="margin-left:8px;padding:2px 10px;" @click=${()=>this._save()}>${s("models.retrySave")}</button>
          </div>
        `:""}
        ${this._pendingLocal?r`
          <div class="models-pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${s("models.pendingSyncHint")}
          </div>
        `:this._notice?r`
          <div class="models-notice">${this._notice}</div>
        `:""}

        <!-- 提示 -->
        <div class="models-hint">${s("models.hint")}</div>

        <!-- 系统主/备模型 -->
        ${this._renderSystemGroup()}

        <!-- 搜索 + 服务商列表 -->
        ${e?r`
          <div style="margin-bottom:12px;">
            <input class="models-search" type="text"
              .value=${this._search}
              @input=${i=>{this._search=i.target.value}}
              placeholder=${s("models.searchModels")}
            />
          </div>

          ${a.length?a.map(i=>this._renderProviderGroup(i,t)):r`<div class="models-empty">${s("models.noMatch")}</div>`}
        `:r`
          <div class="models-empty">${s("models.noProviders")}</div>
        `}

        ${this._renderDialog()}
        ${this._renderConfirm()}
      </div>
    `}};Bt.styles=A`
    :host { display: block; }

    .models-page { width: 100%; }

    /* === toolbar === */
    .models-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .models-toolbar .btn-add {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 4px;
    }
    .models-toolbar .btn-add:hover { background: var(--accent-hover); }
    .models-toolbar .btn-revoke {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .models-toolbar .btn-revoke:hover { background: var(--bg-hover); color: var(--text); }
    .source-badge {
      font-size: 11px; color: var(--muted); border: 1px solid var(--border);
      padding: 2px 10px; border-radius: var(--radius-full);
    }
    .save-flash {
      margin-left: auto; font-size: 12px; color: var(--success);
      display: inline-flex; align-items: center; gap: 4px;
      animation: save-in 0.25s ease;
    }
    .saving-hint {
      margin-left: auto; font-size: 12px; color: var(--muted);
      display: inline-flex; align-items: center; gap: 4px;
    }
    @keyframes save-in { from { opacity: 0; transform: translateX(6px); } to { opacity: 1; transform: none; } }
    .models-error {
      font-size: 12px; color: var(--danger); margin: -4px 0 12px;
      word-break: break-all;
    }
    .models-notice {
      font-size: 12px; color: var(--muted); margin: -4px 0 12px;
    }
    .models-pending {
      font-size: 12px; color: var(--warn); margin: -4px 0 12px;
      display: flex; align-items: center; gap: 6px;
    }

    /* === hint === */
    .models-hint {
      font-size: 12px; color: var(--muted); line-height: 1.6; margin-bottom: 12px;
    }

    /* === provider group === */
    .provider-group {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      margin-bottom: 12px; box-shadow: var(--shadow-card); overflow: hidden;
    }
    .provider-group__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; cursor: pointer; user-select: none;
      transition: background var(--duration-fast);
    }
    .provider-group__header:hover { background: var(--bg-hover); }
    .provider-group__left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .provider-group__chevron {
      width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
      color: var(--muted); transition: transform var(--duration-fast); flex-shrink: 0;
    }
    .provider-group__chevron.open { transform: rotate(90deg); }
    .provider-group__name { font-size: 14px; font-weight: 600; color: var(--text-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .provider-group__url { font-size: 11px; color: var(--muted); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .provider-group__right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .provider-group__status { font-size: 12px; color: var(--text-soft); }
    .provider-group__status .unconfigured { color: var(--danger); }
    .provider-group__actions { display: flex; gap: 2px; opacity: 0; transition: opacity var(--duration-fast); }
    .provider-group__header:hover .provider-group__actions { opacity: 1; }
    .icon-btn {
      width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .icon-btn:hover { background: var(--bg-active); color: var(--text); }
    .icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); }
    .provider-group__body { padding: 0 18px 14px; display: none; }
    .provider-group.open .provider-group__body { display: block; }

    /* === model rows === */
    .model-list { border-top: 1px solid var(--border); }
    .model-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 4px; border-bottom: 1px solid var(--border);
      transition: background var(--duration-fast);
    }
    .model-row:last-child { border-bottom: none; }
    .model-row:hover { background: var(--bg-hover); }
    .model-row.primary { border-left: 2px solid var(--accent); padding-left: 8px; }
    .model-row__star {
      width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--muted); cursor: pointer; transition: all var(--duration-fast); flex-shrink: 0;
    }
    .model-row__star:hover { color: var(--warn); background: var(--bg-active); }
    .model-row__star.on { color: var(--warn); }
    .model-row__id { font-family: var(--font-mono); font-size: 13px; color: var(--text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .model-row__badge {
      font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
      padding: 2px 8px; border-radius: var(--radius-full);
      background: var(--accent-subtle); color: var(--accent); flex-shrink: 0;
    }
    .inline-add { display: flex; gap: 8px; padding-top: 12px; }
    .inline-add input {
      flex: 1; padding: 7px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px;
      font-family: var(--font-mono); outline: none; transition: border-color var(--duration-fast);
    }
    .inline-add input:focus { border-color: var(--accent); }
    .inline-add input::placeholder { color: var(--muted); font-family: var(--font-sans, inherit); }
    .inline-add button {
      padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 4px;
    }
    .inline-add button:hover { background: var(--accent-hover); }
    .no-models { color: var(--muted); font-size: 13px; padding: 10px 0 2px; }

    /* === system group === */
    .sys-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
    .sys-row__label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: var(--muted);
      width: 52px; flex-shrink: 0;
    }
    .sys-row__value { font-family: var(--font-mono); font-size: 13px; color: var(--text-strong); }
    .sys-row__value.empty { color: var(--muted); font-style: italic; font-family: var(--font-sans, inherit); font-size: 12px; }
    .sys-row__sub { font-size: 11px; color: var(--muted); }

    /* === search === */
    .models-search {
      width: 280px; max-width: 100%; padding: 7px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .models-search::placeholder { color: var(--muted); }
    .models-search:focus { border-color: var(--accent); }

    /* === empty state === */
    .models-empty { text-align: center; padding: 60px 24px; color: var(--muted); font-size: 13px; }

    /* === dialog: provider form === */
    .provider-form .quick-picks { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .provider-form .quick-picks button {
      padding: 3px 10px; border-radius: var(--radius-sm); font-size: 11px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .provider-form .quick-picks button:hover { background: var(--bg-hover); color: var(--text); border-color: var(--text-muted); }
    .provider-form .form-link {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); text-decoration: none;
      margin-bottom: 16px; cursor: pointer;
    }
    .provider-form .form-link:hover { text-decoration: underline; }
    .provider-form .form-group { margin-bottom: 14px; }
    .provider-form .form-label {
      display: block; font-size: 12px; font-weight: 500; color: var(--text);
      margin-bottom: 4px;
    }
    .provider-form .form-input {
      width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);
      border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast); box-sizing: border-box;
    }
    .provider-form .form-input:focus { border-color: var(--accent); }
    .provider-form .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
    .provider-form .form-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
    .provider-form select.form-input { cursor: pointer; }

    /* === dialog: model chips === */
    .model-input-row { display: flex; gap: 8px; }
    .model-input-row input { flex: 1; font-family: var(--font-mono); }
    .model-input-row button {
      padding: 8px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); white-space: nowrap;
    }
    .model-input-row button:hover { background: var(--accent-hover); }
    .model-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .model-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 6px 4px 10px; border-radius: var(--radius-full);
      background: var(--bg-hover); border: 1px solid var(--border);
      font-family: var(--font-mono); font-size: 12px; color: var(--text);
      animation: chip-in 0.18s ease;
    }
    @keyframes chip-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: none; } }
    .model-chip:first-child { border-color: var(--accent); background: var(--accent-subtle); }
    .model-chip__primary { font-size: 9px; font-weight: 700; letter-spacing: 0.05em; color: var(--accent); }
    .model-chip button {
      width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: 50%;
      color: var(--muted); cursor: pointer; transition: all var(--duration-fast); padding: 0;
    }
    .model-chip button:hover { background: var(--danger-subtle); color: var(--danger); }
    .common-models { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
    .common-models__label { font-size: 11px; color: var(--muted); }
    .common-models button {
      padding: 2px 9px; border-radius: var(--radius-full); font-size: 11px;
      font-family: var(--font-mono); border: 1px dashed var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .common-models button:hover { border-color: var(--accent); color: var(--accent); border-style: solid; }

    /* === confirm dialog === */
    .confirm-msg { font-size: 13px; color: var(--text); line-height: 1.7; padding: 4px 0; }
    .btn-danger {
      background: var(--danger) !important; color: #fff !important; border-color: var(--danger) !important;
    }
  `;let z=Bt;N([m({type:String})],z.prototype,"title");N([m({type:String})],z.prototype,"subtitle");N([d()],z.prototype,"_providers");N([d()],z.prototype,"_expanded");N([d()],z.prototype,"_search");N([d()],z.prototype,"_saveFlash");N([d()],z.prototype,"_connected");N([d()],z.prototype,"_source");N([d()],z.prototype,"_saving");N([d()],z.prototype,"_saveError");N([d()],z.prototype,"_pendingLocal");N([d()],z.prototype,"_notice");N([d()],z.prototype,"_dialogOpen");N([d()],z.prototype,"_editingId");N([d()],z.prototype,"_formProviderName");N([d()],z.prototype,"_formApiType");N([d()],z.prototype,"_formBaseUrl");N([d()],z.prototype,"_formApiKey");N([d()],z.prototype,"_formSelectedPreset");N([d()],z.prototype,"_formModels");N([d()],z.prototype,"_formModelInput");N([d()],z.prototype,"_confirm");customElements.define("models-page",z);var ba=Object.defineProperty,F=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ba(e,t,i),i};const Nt=class Nt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._bind="lan",this._authMode="token",this._tokenRedacted="",this._tokenInput="",this._showToken=!1,this._originsText="",this._deviceAuthDisabled=null,this._loaded=!1,this._port=null,this._pid=null,this._gwRunning=!1,this._offline=!1,this._saving=!1,this._msg="",this._msgCls="",this._storeUnsub=null}get _accessOptions(){return[{key:"loopback",icon:v.monitor,name:s("gateway.localOnly"),desc:s("gateway.localOnlyDesc")},{key:"lan",icon:v["share-2"],name:s("gateway.lanShare"),desc:s("gateway.lanShareDesc")}]}get _authOptions(){return[{key:"token",icon:v.key,name:s("gateway.tokenAuth"),desc:s("gateway.tokenAuthDesc")},{key:"password",icon:v.lock,name:s("gateway.passwordAuth"),desc:s("gateway.passwordAuthDesc")}]}connectedCallback(){super.connectedCallback();const e=f();this._storeUnsub=e.subscribe(t=>{this._offline=!t.connected,t.connected&&!this._loaded&&this._load()}),e.connected&&this._load(),this._refreshPortStatus()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._storeUnsub)==null||e.call(this)}async _load(){var t,a,i,o,n;const e=f();if(!e.connected){this._offline=!0;return}try{const c=await e.request("config.get",{}),h=((t=(c==null?void 0:c.config)||(c==null?void 0:c.parsed)||{})==null?void 0:t.gateway)||{};this._bind=typeof h.bind=="string"?h.bind:"lan",this._authMode=((a=h.auth)==null?void 0:a.mode)||"token",this._tokenRedacted=String(((i=h.auth)==null?void 0:i.token)||""),this._originsText=Array.isArray((o=h.controlUi)==null?void 0:o.allowedOrigins)?h.controlUi.allowedOrigins.join(`
`):"",this._deviceAuthDisabled=!!((n=h.controlUi)!=null&&n.dangerouslyDisableDeviceAuth),this._loaded=!0,this._offline=!1}catch(c){this._msg=this._errMsg(c),this._msgCls="err"}}async _refreshPortStatus(){const e=window.location.hostname||"127.0.0.1";try{const a=await(await G(`http://${e}:7889/api/gateway/status`,{},4e3)).json();this._gwRunning=!!a.running,this._port=a.port??null,this._pid=a.pid??null}catch{this._gwRunning=!1}}async _save(){var t,a;const e=f();if(!(!e.connected||this._saving)){this._saving=!0,this._msg="",this._msgCls="";try{const i=await e.request("config.get",{}),o=(i==null?void 0:i.config)||(i==null?void 0:i.parsed)||{},n=this._originsText.split(`
`).map(p=>p.trim()).filter(Boolean),c={mode:this._authMode},h=this._tokenInput.trim();if(h&&(c.token=h),await e.request("config.patch",{raw:JSON.stringify({gateway:{...o.gateway||{},bind:this._bind,auth:{...((t=o.gateway)==null?void 0:t.auth)||{},...c},controlUi:{...((a=o.gateway)==null?void 0:a.controlUi)||{},allowedOrigins:n}}}),baseHash:(i==null?void 0:i.hash)||"",replacePaths:["gateway"]}),h){try{localStorage.setItem("openclaw.gateway.token",h)}catch{}this._tokenRedacted="__OPENCLAW_REDACTED__",this._tokenInput="",this._msg=s("gateway.tokenChangedNote")}else this._msg=s("common.configSaved");this._msgCls="ok",await this._load()}catch(i){this._msg=s("common.configSaveFailed")+this._errMsg(i),this._msgCls="err"}finally{this._saving=!1}}}_errMsg(e){const t=e instanceof Error?e.message:String(e);try{const a=JSON.parse(t);if(a!=null&&a.message)return String(a.message)}catch{}return t}render(){return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="gateway-page">

        ${this._offline?r`
          <div class="gw-section">
            <div class="gw-hint warn">${s("dashboard.wsDisconnected")} — ${s("models.gwDisconnected")}</div>
          </div>
        `:""}

        <!-- 服务端口（只读：由启动命令决定，Sidecar 报告实际值） -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m6.343 6.343 2.829 2.829"/><path d="M2 12h4"/><path d="m6.343 17.657 2.829-2.829"/><path d="M12 18v4"/><path d="m17.657 17.657-2.829-2.829"/><path d="M18 12h4"/><path d="m17.657 6.343-2.829 2.829"/><circle cx="12" cy="12" r="3"/></svg>
            ${s("gateway.servicePort")}
          </div>
          <div class="gw-field">
            <label class="gw-label">${s("gateway.portNumber")}</label>
            <div class="gw-readonly">
              <span class="dot ${this._gwRunning?"on":"off"}"></span>
              <span>${this._port??"—"}</span>
              <span style="color:var(--muted);font-size:12px;">
                ${this._gwRunning?s("dashboard.running")+(this._pid?" · PID "+this._pid:""):s("dashboard.stopped")}
              </span>
            </div>
            <div class="gw-hint">${s("gateway.portHint")}</div>
          </div>
        </div>

        <!-- 谁能访问 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${s("gateway.whoCanAccess")}
          </div>
          <div class="gw-cards">
            ${this._accessOptions.map(e=>r`
              <div class="gw-card ${this._bind===e.key?"selected":""}"
                   @click=${()=>{this._bind=e.key}}>
                <div class="gw-card__icon">${e.icon}</div>
                <div class="gw-card__text">
                  <div class="gw-card__name">${e.name}</div>
                  <div class="gw-card__desc">${e.desc}</div>
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- 安全认证 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            ${s("gateway.securityAuth")}
          </div>
          <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px;">${s("gateway.authMethod")}</div>
          <div class="gw-cards">
            ${this._authOptions.map(e=>r`
              <div class="gw-card ${this._authMode===e.key?"selected":""}"
                   @click=${()=>{this._authMode=e.key}}>
                <div class="gw-card__icon">${e.icon}</div>
                <div class="gw-card__text">
                  <div class="gw-card__name">${e.name}</div>
                  <div class="gw-card__desc">${e.desc}</div>
                </div>
              </div>
            `)}
          </div>
          ${this._authMode==="token"?r`
            <div class="gw-token-row">
              <div style="flex:1;">
                <label class="gw-label">${s("gateway.accessToken")}</label>
                <input class="gw-input"
                  .type=${this._showToken?"text":"password"}
                  placeholder=${this._tokenRedacted||"sk-..."}
                  .value=${this._tokenInput}
                  @input=${e=>{this._tokenInput=e.target.value}}
                />
              </div>
              <button @click=${()=>{this._showToken=!this._showToken}}>
                ${this._showToken?s("gateway.hide"):s("gateway.show")}
              </button>
            </div>
            <div class="gw-hint">${s("gateway.tokenHint")}</div>
            ${this._tokenInput.trim()?r`
              <div class="gw-hint warn">⚠ ${s("gateway.tokenChangeWarning")}</div>
            `:""}
          `:""}
        </div>

        <!-- Control UI 访问来源 -->
        <div class="gw-section">
          <div class="gw-section__title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            ${s("gateway.controlUiTitle")}
          </div>
          <div class="gw-field">
            <label class="gw-label">${s("gateway.allowedOrigins")}</label>
            <textarea class="gw-input"
              .value=${this._originsText}
              @input=${e=>{this._originsText=e.target.value}}
            ></textarea>
            <div class="gw-hint">${s("gateway.allowedOriginsHint")}</div>
          </div>
          <div class="gw-field">
            <label class="gw-label">${s("gateway.deviceAuth")}</label>
            ${this._deviceAuthDisabled===null?"":this._deviceAuthDisabled?r`<span class="gw-badge danger">${s("gateway.deviceAuthOff")}</span>
                     <div class="gw-hint warn">⚠ ${s("gateway.deviceAuthOffHint")}</div>`:r`<span class="gw-badge ok">${s("gateway.deviceAuthOn")}</span>`}
          </div>
        </div>

        <!-- Save bar -->
        <div class="gw-save-bar">
          <button class="gw-save-btn" ?disabled=${this._saving||this._offline} @click=${()=>this._save()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            ${this._saving?s("models.saving"):s("gateway.saveAndApply")}
          </button>
          <span class="gw-save-hint">${s("gateway.saveHint")}</span>
          ${this._msg?r`<span class="gw-msg ${this._msgCls}">${this._msg}</span>`:""}
        </div>

      </div>
    `}};Nt.styles=A`
    :host { display: block; }

    .gateway-page { width: 100%; }

    /* === section card === */
    .gw-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .gw-section__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
    }
    .gw-section__title svg { color: var(--text-soft); }

    /* === form field === */
    .gw-field { margin-bottom: 14px; }
    .gw-field:last-child { margin-bottom: 0; }
    .gw-label {
      display: block; font-size: 12px; font-weight: 500;
      color: var(--text); margin-bottom: 6px;
    }
    .gw-input {
      width: 200px; padding: 8px 12px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      transition: border-color var(--duration-fast);
    }
    .gw-input:focus { border-color: var(--accent); }
    .gw-input:disabled { opacity: 0.6; cursor: not-allowed; }
    textarea.gw-input { width: 100%; box-sizing: border-box; resize: vertical; min-height: 72px; font-family: var(--font-mono); }
    .gw-hint {
      font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4;
    }
    .gw-hint.warn { color: var(--warn); }

    /* === read-only value === */
    .gw-readonly {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--font-mono); font-size: 13px; color: var(--text-strong);
    }
    .gw-readonly .dot { width: 8px; height: 8px; border-radius: 50%; }
    .gw-readonly .dot.on { background: var(--success); }
    .gw-readonly .dot.off { background: var(--muted); }

    /* === select cards (radio-style) === */
    .gw-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
    .gw-card {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 14px 16px; border: 1px solid var(--border);
      border-radius: var(--radius-md); cursor: pointer;
      transition: all var(--duration-fast); background: transparent;
      user-select: none;
    }
    .gw-card:hover { border-color: var(--text-muted); background: var(--bg-hover); }
    .gw-card.selected {
      border-color: var(--accent); background: var(--accent-subtle);
    }
    .gw-card__icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 16px;
    }
    .gw-card.selected .gw-card__icon {
      background: var(--accent); color: var(--accent-foreground);
    }
    .gw-card:not(.selected) .gw-card__icon {
      background: var(--bg-muted); color: var(--text-soft);
    }
    .gw-card__text { flex: 1; min-width: 0; }
    .gw-card__name {
      font-size: 13px; font-weight: 600; color: var(--text-strong);
      margin-bottom: 2px;
    }
    .gw-card__desc {
      font-size: 11px; color: var(--text-soft); line-height: 1.4;
    }

    /* === token input row === */
    .gw-token-row {
      display: flex; align-items: center; gap: 8px; margin-top: 12px;
    }
    .gw-token-row .gw-input { flex: 1; width: auto; font-family: var(--font-mono); }
    .gw-token-row button {
      padding: 6px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap; flex-shrink: 0;
    }
    .gw-token-row button:hover { background: var(--bg-hover); color: var(--text); }

    /* === badge === */
    .gw-badge {
      display: inline-block; padding: 3px 10px; border-radius: var(--radius-full);
      font-size: 11px; font-weight: 600;
    }
    .gw-badge.danger { background: var(--danger-subtle); color: var(--danger); }
    .gw-badge.ok { background: var(--success-subtle); color: var(--success); }

    /* === save bar === */
    .gw-save-bar {
      display: flex; align-items: center; gap: 10px;
      padding-top: 8px; flex-wrap: wrap;
    }
    .gw-save-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      transition: background var(--duration-fast); display: inline-flex; align-items: center; gap: 6px;
    }
    .gw-save-btn:hover { background: var(--accent-hover); }
    .gw-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .gw-save-hint { font-size: 12px; color: var(--muted); }
    .gw-msg { font-size: 12px; }
    .gw-msg.ok { color: var(--success); }
    .gw-msg.err { color: var(--danger); word-break: break-all; }
  `;let q=Nt;F([m({type:String})],q.prototype,"title");F([m({type:String})],q.prototype,"subtitle");F([d()],q.prototype,"_bind");F([d()],q.prototype,"_authMode");F([d()],q.prototype,"_tokenRedacted");F([d()],q.prototype,"_tokenInput");F([d()],q.prototype,"_showToken");F([d()],q.prototype,"_originsText");F([d()],q.prototype,"_deviceAuthDisabled");F([d()],q.prototype,"_loaded");F([d()],q.prototype,"_port");F([d()],q.prototype,"_pid");F([d()],q.prototype,"_gwRunning");F([d()],q.prototype,"_offline");F([d()],q.prototype,"_saving");F([d()],q.prototype,"_msg");F([d()],q.prototype,"_msgCls");customElements.define("gateway-page",q);var fa=Object.defineProperty,Me=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&fa(e,t,i),i};const _a=[{key:"autoRepair",labelKey:"diagnostics.autoRepair"},{key:"wsTest",labelKey:"diagnostics.wsTest"},{key:"connDiag",labelKey:"diagnostics.connDiag"}],Rt=class Rt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._checking=!1,this._ranOnce=!1,this._items=[],this._showAdvanced=!1,this._repairing=!1}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}_baseItems(){return[{id:"sidecar",name:s("diagnostics.checkSidecar"),detail:"",status:"pending"},{id:"gateway",name:s("diagnostics.checkGatewayProc"),detail:"",status:"pending"},{id:"ws",name:s("diagnostics.checkWs"),detail:"",status:"pending"},{id:"agents",name:s("diagnostics.checkAgents"),detail:"",status:"pending"},{id:"config",name:s("diagnostics.checkConfigRead"),detail:"",status:"pending"},{id:"hermes",name:s("diagnostics.checkHermes"),detail:"",status:"pending"},{id:"assistant",name:s("diagnostics.checkAssistant"),detail:"",status:"pending"},{id:"license",name:s("diagnostics.checkLicense"),detail:"",status:"pending"},{id:"fingerprint",name:s("diagnostics.checkFingerprint"),detail:"",status:"pending"}]}_updateItem(e,t,a){this._items=this._items.map(i=>i.id===e?{...i,status:t,detail:a}:i)}_errText(e){const t=e instanceof Error?e.message:String(e);return t.length>80?t.slice(0,80)+"…":t}async _runCheck(){if(this._checking)return;this._checking=!0,this._ranOnce=!0,this._items=this._baseItems();const e=window.location.hostname||"127.0.0.1",t=f(),a=[(async()=>{try{const i=await G(`${this._sidecarBase}/health`,{},4e3),o=await i.json();this._updateItem("sidecar",i.ok?"ok":"fail",i.ok?`${o.service} v${o.version}`:`HTTP ${i.status}`)}catch(i){this._updateItem("sidecar","fail",this._errText(i)||"unreachable")}})(),(async()=>{try{const o=await(await G(`${this._sidecarBase}/api/gateway/status`,{},4e3)).json();this._updateItem("gateway",o.running?"ok":"fail",o.running?`PID ${o.pid??"—"} · :${o.port}`:`stopped · :${o.port}`)}catch(i){this._updateItem("gateway","fail",this._errText(i))}})(),(async()=>{var o,n;const i=t.snapshot;if(i.connected&&i.hello){const c=(n=(o=i.hello)==null?void 0:o.server)==null?void 0:n.version;this._updateItem("ws","ok",c?`v${c}`:"connected")}else this._updateItem("ws","fail",i.lastError||s("dashboard.wsDisconnected"))})(),(async()=>{if(!t.connected)return this._updateItem("agents","fail",s("dashboard.wsDisconnected"));try{const i=await t.request("agents.list",{}),o=((i==null?void 0:i.agents)||[]).length;this._updateItem("agents","ok",`${o} agents · ${(i==null?void 0:i.defaultId)||"—"}`)}catch(i){this._updateItem("agents","fail",this._errText(i))}})(),(async()=>{if(!t.connected)return this._updateItem("config","fail",s("dashboard.wsDisconnected"));try{const i=await t.request("config.get",{}),o=Object.keys((i==null?void 0:i.config)||(i==null?void 0:i.parsed)||{}).length;this._updateItem("config","ok",`${o} keys · hash ${((i==null?void 0:i.hash)||"").slice(0,8)||"—"}`)}catch(i){this._updateItem("config","fail",this._errText(i))}})(),(async()=>{try{await G(`${we()}/health`,{mode:"no-cors"},4e3),this._updateItem("hermes","ok",":8642")}catch{this._updateItem("hermes","warn",s("init.checkFailed"))}})(),(async()=>{try{const i=await G(`http://${e}:8080/api/status`,{},4e3),o=await i.json().catch(()=>({}));i.ok?this._updateItem("assistant","ok",`${o.model||"—"} · key ${o.hasKey?"✓":"✗"}`):this._updateItem("assistant","warn",`HTTP ${i.status}`)}catch{this._updateItem("assistant","warn",s("init.checkFailed"))}})(),(async()=>{try{const i=await Ge(),o=await gt(i);o.status==="ok"?this._updateItem("license","ok",o.device_name||o.message||"ok"):o.status==="not_activated"?this._updateItem("license","warn",o.message||o.status):this._updateItem("license","fail",o.message||o.status)}catch(i){this._updateItem("license","fail",this._errText(i))}})(),(async()=>{try{const i=await Ge();this._updateItem("fingerprint","ok",i.length>24?i.slice(0,24)+"…":i)}catch(i){this._updateItem("fingerprint","fail",this._errText(i))}})()];await Promise.all(a),this._checking=!1}async _autoRepair(){if(!(this._repairing||this._checking)){this._repairing=!0;try{await fetch(`${this._sidecarBase}/api/gateway/restart`,{method:"POST"})}catch{}await new Promise(e=>setTimeout(e,3e3)),this._repairing=!1,await this._runCheck()}}_renderToolbar(){return r`
      <div class="diag-toolbar">
        ${_a.map(e=>r`
          <button ?disabled=${this._checking||this._repairing} @click=${()=>{e.key==="autoRepair"?this._autoRepair():this._runCheck()}}>${this._repairing&&e.key==="autoRepair"?s("diagnostics.repairing"):s(e.labelKey)}</button>
        `)}
      </div>
    `}render(){const e=this._items.filter(c=>c.status!=="pending"),t=this._items.filter(c=>c.status==="fail").length,a=this._items.filter(c=>c.status==="warn").length,i=this._ranOnce&&!this._checking&&e.length===this._items.length,o=i?t>0?"has-fail":"all-ok":"",n=i?t>0?"fail":"ok":"";return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>
      <div class="diagnostics-page">

        <!-- Shield button -->
        <div class="diag-shield" @click=${()=>this._runCheck()}>
          <div class="diag-shield__circle ${o}">
            <div class="diag-shield__icon ${n}">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div class="diag-shield__label">${this._checking?s("diagnostics.checking"):s("diagnostics.startCheck")}</div>
          </div>
          <div class="diag-shield__hint">${this._ranOnce?s("diagnostics.clickToRetry"):s("diagnostics.clickToStart")}</div>
        </div>

        <!-- Results -->
        ${this._ranOnce?r`
          ${i?r`
            ${t>0?r`
              <div class="diag-result fail">
                <div class="diag-result__icon">✗</div>
                <div>
                  <div class="diag-result__title">${s("diagnostics.hasFails",{count:t})}</div>
                  <div class="diag-result__desc">${s("diagnostics.checkedTotal",{count:this._items.length})}</div>
                </div>
              </div>
            `:a>0?r`
              <div class="diag-result warn">
                <div class="diag-result__icon">!</div>
                <div>
                  <div class="diag-result__title">${s("diagnostics.hasWarns",{count:a})}</div>
                  <div class="diag-result__desc">${s("diagnostics.checkedTotal",{count:this._items.length})}</div>
                </div>
              </div>
            `:r`
              <div class="diag-result ok">
                <div class="diag-result__icon">✓</div>
                <div>
                  <div class="diag-result__title">${s("diagnostics.allOk")}</div>
                  <div class="diag-result__desc">${s("diagnostics.checkSummary",{count:this._items.length})}</div>
                </div>
              </div>
            `}
          `:""}

          <!-- Check list -->
          <div class="diag-list">
            ${this._items.map(c=>r`
              <div class="diag-item">
                <div class="diag-item__status ${c.status}">
                  ${c.status==="ok"?"✓":c.status==="fail"?"✗":c.status==="warn"?"!":"…"}
                </div>
                <div class="diag-item__content">
                  <div class="diag-item__name">${c.name}</div>
                  ${c.detail?r`<div class="diag-item__detail">${c.detail}</div>`:""}
                </div>
              </div>
            `)}
          </div>
        `:""}

        <!-- Advanced tools -->
        <div class="diag-advanced-wrap">
          <div class="diag-advanced" @click=${()=>{this._showAdvanced=!this._showAdvanced}}>
            ${this._showAdvanced?"▾":"▸"} ${s("diagnostics.advancedTools")}
          </div>
          ${this._showAdvanced?this._renderToolbar():""}
        </div>

      </div>
    `}};Rt.styles=A`
    :host { display: block; }

    .diagnostics-page {
      width: 100%;
      display: flex; flex-direction: column; align-items: center;
      min-height: calc(100vh - 120px);
    }

    /* === shield button === */
    .diag-shield {
      display: flex; flex-direction: column; align-items: center;
      margin: 20px 0 16px; cursor: pointer; user-select: none;
    }
    .diag-shield__circle {
      width: 120px; height: 120px; border-radius: 50%;
      background: var(--card); border: 2px solid var(--border);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      transition: all var(--duration-fast);
    }
    .diag-shield:hover .diag-shield__circle {
      border-color: var(--accent); box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .diag-shield__icon {
      width: 32px; height: 32px; color: var(--accent); margin-bottom: 6px;
      transition: transform var(--duration-fast);
    }
    .diag-shield__icon.ok { color: var(--success); }
    .diag-shield__icon.fail { color: var(--danger); }
    .diag-shield:hover .diag-shield__icon { transform: scale(1.08); }
    .diag-shield__label {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .diag-shield__hint {
      font-size: 12px; color: var(--muted); margin-top: 8px;
    }
    @keyframes diag-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.25); }
      50% { box-shadow: 0 0 0 14px rgba(34,197,94,0); }
    }
    .diag-shield__circle.all-ok { border-color: var(--success); animation: diag-pulse 2s ease infinite; }
    .diag-shield__circle.has-fail { border-color: var(--danger); }

    /* === status result === */
    .diag-result {
      width: 100%; max-width: 680px;
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; border-radius: var(--radius-md);
      margin-bottom: 16px;
    }
    .diag-result.ok {
      background: var(--success-subtle); border: 1px solid rgba(34,197,94,0.2);
    }
    .diag-result.warn {
      background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.25);
    }
    .diag-result.fail {
      background: var(--danger-subtle); border: 1px solid rgba(239,68,68,0.2);
    }
    .diag-result__icon {
      font-size: 28px; font-weight: 300; color: var(--text-strong);
    }
    .diag-result__title {
      font-size: 15px; font-weight: 600; color: var(--text-strong);
    }
    .diag-result__desc {
      font-size: 12px; color: var(--text-soft);
    }

    /* === check list === */
    .diag-list {
      width: 100%; max-width: 680px;
      display: flex; flex-direction: column; gap: 6px;
      margin-bottom: 16px;
    }
    .diag-item {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-md);
      animation: diag-item-in 0.25s ease both;
    }
    @keyframes diag-item-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: none; }
    }
    .diag-item__status {
      width: 22px; height: 22px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; flex-shrink: 0;
    }
    .diag-item__status.ok { background: var(--success-subtle); color: var(--success); }
    .diag-item__status.fail { background: var(--danger-subtle); color: var(--danger); }
    .diag-item__status.warn { background: rgba(245,158,11,0.12); color: var(--warn); }
    .diag-item__status.pending { background: var(--bg-muted); color: var(--muted); }
    .diag-item__content { flex: 1; min-width: 0; }
    .diag-item__name {
      font-size: 13px; font-weight: 500; color: var(--text-strong);
    }
    .diag-item__detail {
      font-size: 11px; color: var(--muted);
      font-family: var(--font-mono); word-break: break-all;
    }

    /* === advanced tools === */
    .diag-advanced-wrap {
      width: 100%; max-width: 680px;
      margin-bottom: 16px;
    }
    .diag-advanced {
      font-size: 12px; color: var(--accent); cursor: pointer;
      display: flex; align-items: center; gap: 4px; justify-content: center;
    }
    .diag-advanced:hover { text-decoration: underline; }

    /* === tool bar === */
    .diag-toolbar {
      width: 100%; max-width: 680px;
      display: flex; flex-wrap: nowrap; gap: 8px; justify-content: center;
      padding: 14px 20px; background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
      margin-top: 12px;
    }
    .diag-toolbar button {
      padding: 7px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: var(--bg-muted); color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .diag-toolbar button:hover { background: var(--bg-hover); color: var(--text); }
    .diag-toolbar button:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 600px) { .diag-toolbar { flex-wrap: wrap; } }
  `;let he=Rt;Me([m({type:String})],he.prototype,"title");Me([m({type:String})],he.prototype,"subtitle");Me([d()],he.prototype,"_checking");Me([d()],he.prototype,"_ranOnce");Me([d()],he.prototype,"_items");Me([d()],he.prototype,"_showAdvanced");Me([d()],he.prototype,"_repairing");customElements.define("diagnostics-page",he);var xa=Object.defineProperty,X=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&xa(e,t,i),i};const Ht=class Ht extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._doctor=null,this._loadingStatus=!1,this._acting="",this._actionMsg="",this._actionCls="",this._configText="",this._configHash="",this._configLoaded=!1,this._savingConfig=!1,this._configMsg="",this._configMsgCls=""}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._loadStatus(),this._loadConfig()}async _loadStatus(){this._loadingStatus=!0;try{const e=await G(`${this._sidecarBase}/api/browser/status`,{},5e4);this._doctor=await e.json()}catch(e){this._doctor={ok:!1,error:e instanceof Error?e.message:String(e)}}finally{this._loadingStatus=!1}}_check(e){var t;return(((t=this._doctor)==null?void 0:t.checks)||[]).find(a=>a.name===e)}get _st(){var e;return((e=this._doctor)==null?void 0:e.status)||{}}async _browserAction(e){if(!this._acting){this._acting=e,this._actionMsg="",this._actionCls="";try{const a=await(await G(`${this._sidecarBase}/api/browser/${e}`,{method:"POST"},7e4)).json();a.ok?(this._actionCls="ok",await this._loadStatus()):(this._actionMsg=String(a.error||a.stderr||a.raw||"failed").slice(0,200),this._actionCls="err")}catch(t){this._actionMsg=t instanceof Error?t.message:String(t),this._actionCls="err"}finally{this._acting=""}}}async _loadConfig(){const e=f();if(!e.connected){this._configMsg=s("dashboard.wsDisconnected"),this._configMsgCls="err";return}try{const t=await e.request("config.get",{}),a=(t==null?void 0:t.config)||(t==null?void 0:t.parsed)||{};this._configHash=(t==null?void 0:t.hash)||"",this._configText=JSON.stringify(a.browser??{},null,2),this._configLoaded=!0,this._configMsg="",this._configMsgCls=""}catch(t){this._configMsg=t instanceof Error?t.message:String(t),this._configMsgCls="err"}}async _saveConfig(){if(this._savingConfig)return;let e;try{e=JSON.parse(this._configText)}catch{this._configMsg=s("browser.configInvalid"),this._configMsgCls="err";return}const t=f();if(!t.connected){this._configMsg=s("dashboard.wsDisconnected"),this._configMsgCls="err";return}this._savingConfig=!0;try{await t.request("config.patch",{raw:JSON.stringify({browser:e}),baseHash:this._configHash,replacePaths:["browser"]}),this._configMsg=s("browser.configSaved"),this._configMsgCls="ok",await this._loadConfig(),await this._loadStatus()}catch(a){this._configMsg=(a instanceof Error?a.message:String(a)).slice(0,200),this._configMsgCls="err"}finally{this._savingConfig=!1}}render(){var u;const e=this._st,t=this._check("plugin"),a=this._check("gateway"),i=this._check("browser"),o=e.profiles&&typeof e.profiles=="object"?e.profiles:JSON.parse(this._configText||"{}").profiles||{},n=Object.keys(o||{}),c=e.profile||JSON.parse(this._configText||"{}").defaultProfile||"",h=!!e.running,p=e.detectedExecutablePath||"",g=this._acting!=="";return r`
      <div class="browser-page">
        <!-- Header -->
        <div class="browser-header">
          <div class="browser-header__left">
            <div class="browser-header__title">${this.title}</div>
            <div class="browser-header__subtitle">${this.subtitle}</div>
          </div>
          <div class="browser-header__right">
            <button class="btn-refresh" ?disabled=${this._loadingStatus} @click=${()=>{this._loadStatus(),this._loadConfig()}}>
              ${this._loadingStatus?s("browser.detecting"):s("common.refresh")}
            </button>
          </div>
        </div>

        ${(u=this._doctor)!=null&&u.error?r`
          <div class="action-msg err" style="margin:0 0 12px;">${s("browser.statusOffline")}: ${this._doctor.error}</div>
        `:""}

        <!-- Stats（全部来自 browser doctor） -->
        <div class="browser-stats">
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${s("browser.plugin")}</span>
              <span class="browser-stat__badge ${t!=null&&t.ok?"":"bad"}">${t!=null&&t.ok?s("browser.normal"):"✗"}</span>
            </div>
            <div class="browser-stat__value">${t!=null&&t.ok?s("browser.enabled"):(t==null?void 0:t.detail)||"—"}</div>
            <div class="browser-stat__hint">${a?"gateway: "+(a.detail||(a.ok?"ok":"unreachable")):""}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${s("browser.controlTitle")}</span>
              <span class="browser-stat__badge ${h?"":"warn"}">${s(h?"browser.running":"browser.stopped")}</span>
            </div>
            <div class="browser-stat__value">${e.profile||"—"}${e.transport?" · "+e.transport:""}</div>
            <div class="browser-stat__hint">${(i==null?void 0:i.detail)||""}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${s("browser.builtInChrome")}</span>
              <span class="browser-stat__badge ${e.detectedBrowser?"":"bad"}">${e.detectedBrowser?s("browser.detected"):s("browser.notDetected")}</span>
            </div>
            <div class="browser-stat__value">${e.detectedBrowser||"—"}</div>
            <div class="browser-stat__hint">${p||e.detectError||""}</div>
          </div>
          <div class="browser-stat">
            <div class="browser-stat__label">
              <span>${s("browser.autoPort")}</span>
              <span class="browser-stat__badge ${e.cdpReady?"":"warn"}">${e.cdpReady?"CDP ✓":"CDP ✗"}</span>
            </div>
            <div class="browser-stat__value">${e.cdpPort??"—"}</div>
            <div class="browser-stat__hint">${e.cdpUrl||""}</div>
          </div>
        </div>

        <!-- Control + Profiles -->
        <div class="browser-modes">
          <div class="browser-mode">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${s("browser.controlTitle")}</div>
              <span class="browser-mode__tag ${h?"on":""}">${s(h?"browser.running":"browser.stopped")}</span>
            </div>
            <ul class="browser-mode__list">
              <li><strong>${s("browser.currentProfile")}:</strong> ${e.profile||"—"}（driver: ${e.driver||"—"}）</li>
              <li><strong>${s("browser.cdpEndpoint")}:</strong> ${e.cdpUrl||"—"}</li>
              <li><strong>${s("browser.browserPathLabel")}</strong>${e.chosenBrowser||p||"—"}</li>
              <li><strong>${s("browser.dataDirLabel")}</strong>${e.userDataDir||"—"}</li>
            </ul>
            <div class="browser-mode__actions">
              ${h?r`
                <button class="btn-danger" ?disabled=${g} @click=${()=>this._browserAction("stop")}>
                  ${this._acting==="stop"?s("browser.stopping"):s("browser.stop")}
                </button>
              `:r`
                <button class="btn-primary" ?disabled=${g} @click=${()=>this._browserAction("start")}>
                  ${this._acting==="start"?s("browser.starting"):s("browser.start")}
                </button>
              `}
              <button class="btn-ghost" ?disabled=${this._loadingStatus} @click=${()=>this._loadStatus()}>${s("browser.detect")}</button>
            </div>
            ${this._actionMsg?r`<div class="action-msg ${this._actionCls}">${this._actionMsg}</div>`:""}
          </div>

          <div class="browser-mode">
            <div class="browser-mode__header">
              <div class="browser-mode__title">${s("browser.profilesTitle")}</div>
              <span class="browser-mode__tag">${n.length}</span>
            </div>
            ${n.length?r`
              ${n.map(b=>{var S,_,T;return r`
                <div class="profile-row">
                  <span class="profile-dot" style="background:${((S=o[b])==null?void 0:S.color)||"var(--muted)"};"></span>
                  <span class="profile-name">${b}</span>
                  ${String(c)===b?r`<span class="profile-default">${s("browser.defaultProfile")}</span>`:""}
                  <span class="profile-meta">${(_=o[b])!=null&&_.cdpPort?":"+o[b].cdpPort:""}${(T=o[b])!=null&&T.attachOnly?" attach-only":""}</span>
                </div>
              `})}
            `:r`<div class="action-msg">${s("browser.noProfiles")}</div>`}
            <div class="action-msg" style="margin-top:8px;">${s("browser.profilesHint")}</div>
          </div>
        </div>

        <!-- Config editor（真实 config.browser，config.patch 写回） -->
        <div class="browser-config">
          <div class="browser-config__header">
            <div>
              <div class="browser-config__title">${s("browser.currentConfig")}</div>
              <div class="browser-config__hint">${s("browser.configHint")}</div>
            </div>
          </div>
          <textarea .value=${this._configText}
            @input=${b=>{this._configText=b.target.value}}></textarea>
          <div class="browser-config__footer">
            <button ?disabled=${this._savingConfig||!this._configLoaded} @click=${()=>this._saveConfig()}>
              ${this._savingConfig?s("models.saving"):s("browser.saveConfig")}
            </button>
            <button style="background:transparent;color:var(--text-soft);border:1px solid var(--border);"
              ?disabled=${this._savingConfig} @click=${()=>this._loadConfig()}>${s("common.refresh")}</button>
            ${this._configMsg?r`<span class="action-msg ${this._configMsgCls}" style="margin:0;">${this._configMsg}</span>`:""}
          </div>
        </div>
      </div>
    `}};Ht.styles=A`
    :host { display: block; }

    .browser-page { width: 100%; }

    /* === page header with refresh === */
    .browser-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px; border-bottom: 1px solid var(--border); margin-bottom: 24px;
    }
    .browser-header__left { min-width: 0; }
    .browser-header__title {
      color: var(--text-strong); font-size: 22px; font-weight: 700;
      letter-spacing: -0.02em; line-height: 1.2;
    }
    .browser-header__subtitle {
      color: var(--text-soft); font-size: 13px; margin-top: 4px; line-height: 1.4;
    }
    .browser-header__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn-refresh {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .btn-refresh:hover { background: var(--bg-hover); color: var(--text); }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

    /* === stat cards === */
    .browser-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    @media (max-width: 900px) { .browser-stats { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px) { .browser-stats { grid-template-columns: 1fr; } }
    .browser-stat {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 14px 16px; box-shadow: var(--shadow-card);
    }
    .browser-stat__label {
      font-size: 12px; color: var(--text-soft); margin-bottom: 6px;
      display: flex; justify-content: space-between; align-items: center; gap: 6px;
    }
    .browser-stat__badge {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--success-subtle); color: var(--success);
    }
    .browser-stat__badge.bad { background: var(--danger-subtle); color: var(--danger); }
    .browser-stat__badge.warn { background: rgba(245,158,11,0.12); color: var(--warn); }
    .browser-stat__value {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
      word-break: break-all;
    }
    .browser-stat__hint {
      font-size: 11px; color: var(--muted); margin-top: 2px; word-break: break-all;
    }

    /* === cards grid === */
    .browser-modes { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .browser-mode {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card); position: relative;
    }
    .browser-mode__header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 10px;
    }
    .browser-mode__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-mode__tag {
      font-size: 10px; padding: 2px 8px; border-radius: var(--radius-sm);
      font-weight: 600; background: var(--bg-muted); color: var(--text-soft);
    }
    .browser-mode__tag.on { background: var(--success-subtle); color: var(--success); }
    .browser-mode__list {
      list-style: none; padding: 0; margin: 0 0 14px;
    }
    .browser-mode__list li {
      font-size: 12px; color: var(--text-soft); line-height: 1.6;
      padding-left: 14px; position: relative; word-break: break-all;
    }
    .browser-mode__list li::before {
      content: '•'; position: absolute; left: 0; color: var(--muted);
    }
    .browser-mode__list li strong { color: var(--text); font-weight: 500; }
    .browser-mode__actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .browser-mode__actions button {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      transition: all var(--duration-fast); white-space: nowrap;
    }
    .browser-mode__actions button:disabled { opacity: 0.5; cursor: not-allowed; }
    .browser-mode__actions .btn-ghost {
      background: transparent; color: var(--text-soft);
    }
    .browser-mode__actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .browser-mode__actions .btn-primary {
      background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);
    }
    .browser-mode__actions .btn-primary:hover { background: var(--accent-hover); }
    .browser-mode__actions .btn-danger {
      background: var(--danger-subtle); color: var(--danger); border-color: rgba(239,68,68,0.3);
    }
    .action-msg { font-size: 12px; margin-top: 10px; color: var(--text-soft); word-break: break-all; }
    .action-msg.err { color: var(--danger); }
    .action-msg.ok { color: var(--success); }

    /* profile rows */
    .profile-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px;
    }
    .profile-row:last-child { border-bottom: none; }
    .profile-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 1px solid var(--border); }
    .profile-name { font-weight: 600; color: var(--text-strong); }
    .profile-meta { color: var(--muted); margin-left: auto; font-family: var(--font-mono); }
    .profile-default {
      font-size: 10px; padding: 1px 8px; border-radius: var(--radius-sm);
      background: var(--accent-subtle); color: var(--accent); font-weight: 600;
    }

    /* === config editor === */
    .browser-config {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; box-shadow: var(--shadow-card);
    }
    .browser-config__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px; gap: 10px; flex-wrap: wrap;
    }
    .browser-config__title {
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .browser-config__hint {
      font-size: 11px; color: var(--muted);
    }
    .browser-config textarea {
      width: 100%; min-height: 240px; box-sizing: border-box;
      background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 14px; font-family: var(--font-mono); font-size: 12px; line-height: 1.6;
      color: var(--text); resize: vertical; outline: none;
    }
    .browser-config textarea:focus { border-color: var(--accent); }
    .browser-config__footer { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    .browser-config__footer button {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600;
      border: none; cursor: pointer; background: var(--accent); color: var(--accent-foreground);
    }
    .browser-config__footer button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;let W=Ht;X([m({type:String})],W.prototype,"title");X([m({type:String})],W.prototype,"subtitle");X([d()],W.prototype,"_doctor");X([d()],W.prototype,"_loadingStatus");X([d()],W.prototype,"_acting");X([d()],W.prototype,"_actionMsg");X([d()],W.prototype,"_actionCls");X([d()],W.prototype,"_configText");X([d()],W.prototype,"_configHash");X([d()],W.prototype,"_configLoaded");X([d()],W.prototype,"_savingConfig");X([d()],W.prototype,"_configMsg");X([d()],W.prototype,"_configMsgCls");customElements.define("browser-page",W);var wa=Object.defineProperty,Oe=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&wa(e,t,i),i};const qt=class qt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._config={workspace:"",apiKey:"",baseUrl:"",model:"",approval:"on-failure",sandbox:"workspace-write"},this._status={installed:!1,version:"",hasKey:!1,loaded:!1},this._saving=!1,this._saveMsg=""}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),this._loadAll()}async _loadAll(){try{const e=await Ss();this._status={installed:!!e.installed,version:e.version||"",hasKey:!!e.hasKey,loaded:!0}}catch{this._status={installed:!1,version:"",hasKey:!1,loaded:!0}}try{const e=await ct();this._config={workspace:e.workspace||"",apiKey:e.apiKey||"",baseUrl:e.baseUrl||"",model:e.model||"",approval:e.approvalPolicy||"on-failure",sandbox:e.sandboxMode||"workspace-write"}}catch{}this.requestUpdate()}_approvalModes(){return[{value:"untrusted",label:s("common.approvalUntrusted")},{value:"on-failure",label:s("common.approvalOnFailure")},{value:"on-request",label:s("common.approvalOnRequest")},{value:"never",label:s("common.approvalNever")}]}async _save(){this._saving=!0,this._saveMsg="";try{const e=await Si({workspace:this._config.workspace,apiKey:this._config.apiKey,baseUrl:this._config.baseUrl,model:this._config.model,approvalPolicy:this._config.approval,sandboxMode:this._config.sandbox});e.success?(this._saveMsg="✓ "+s("common.save"),this._loadAll()):this._saveMsg="✗ "+(e.message||"error")}catch(e){this._saveMsg="✗ "+(e instanceof Error?e.message:String(e))}this._saving=!1,this.requestUpdate(),setTimeout(()=>{this._saveMsg="",this.requestUpdate()},3e3)}_resetDefaults(){this._config={workspace:"",apiKey:this._config.apiKey,baseUrl:"",model:"",approval:"on-failure",sandbox:"workspace-write"},this.requestUpdate()}render(){const e=this._status;return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      ${e.loaded&&!e.installed?r`
        <oc-card heading="${s("common.codexNotInstalled")}">
          <p style="font-size:13px;color:var(--warn);margin:0 0 8px;">${s("common.codexNotInstalledDesc")}</p>
          <code style="font-size:12px;">bootstrap-codex.bat</code>
        </oc-card>
        <div style="height:16px;"></div>
      `:""}

      <div class="page-toolbar-lg">
        <span class="text-soft text-base">
          ${e.installed?r`<oc-badge variant="success">${e.version||"Codex CLI"}</oc-badge>`:""}
          ${e.installed&&!e.hasKey?r` <oc-badge variant="warning">${s("common.codexNoKey")}</oc-badge>`:""}
          ${e.installed&&e.hasKey?r` <oc-badge variant="success">${s("common.codexHasKey")}</oc-badge>`:""}
        </span>
        <div class="page-actions">
          <button class="btn-sm" ?disabled=${this._saving} @click=${this._save}>${this._saveMsg||s("common.save")}</button>
          <button class="btn-sm ghost" @click=${this._resetDefaults}>${s("common.resetDefaults")}</button>
        </div>
      </div>

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:320px;">
          <oc-card heading="Codex CLI ${s("common.config")}">
            <p style="font-size:12px;color:var(--text-soft);margin:0 0 16px;line-height:1.6;">${s("common.codexConfigHint")}</p>
            <div class="form-group">
              <label class="form-label">${s("common.workspaceDir")}</label>
              <input class="form-input" .value=${this._config.workspace} placeholder=".\workspace" @input=${t=>{this._config={...this._config,workspace:t.target.value},this.requestUpdate()}} />
            </div>
            <div class="form-group">
              <label class="form-label">${s("common.apiKey")}</label>
              <input class="form-input" type="password" .value=${this._config.apiKey} placeholder="sk-... (OPENAI_API_KEY)" @input=${t=>{this._config={...this._config,apiKey:t.target.value},this.requestUpdate()}} />
            </div>
            <div class="form-group">
              <label class="form-label">${s("common.baseUrl")}</label>
              <input class="form-input" .value=${this._config.baseUrl} placeholder="https://api.openai.com/v1" @input=${t=>{this._config={...this._config,baseUrl:t.target.value},this.requestUpdate()}} />
              <p style="font-size:12px;color:var(--text-soft);margin:6px 0 0;line-height:1.5;">${s("common.baseUrlHint")}</p>
            </div>
            <div class="form-group">
              <label class="form-label">${s("common.defaultModel")}</label>
              <input class="form-input" .value=${this._config.model} placeholder="gpt-5-codex" @input=${t=>{this._config={...this._config,model:t.target.value},this.requestUpdate()}} />
            </div>
            <div class="form-group">
              <label class="form-label">${s("common.sandboxMode")}</label>
              <select class="form-input" .value=${this._config.sandbox} @change=${t=>{this._config={...this._config,sandbox:t.target.value},this.requestUpdate()}}>
                <option value="read-only">read-only</option>
                <option value="workspace-write">workspace-write</option>
                <option value="danger-full-access">danger-full-access</option>
              </select>
            </div>
          </oc-card>
        </div>

        <div style="flex:1;min-width:320px;">
          <oc-card heading="${s("common.approvalPolicy")}">
            ${this._approvalModes().map(t=>r`
              <div class="toggle-row" @click=${()=>{this._config={...this._config,approval:t.value},this.requestUpdate()}}
                style="cursor:pointer;user-select:none;margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.approval===t.value?"var(--accent-subtle)":"transparent"};border:1px solid ${this._config.approval===t.value?"var(--accent)":"transparent"};">
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:500;color:var(--text);font-family:var(--font-mono);">${t.value}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${t.label}</div>
                </div>
                <input type="radio" name="approval_policy" ?checked=${this._config.approval===t.value}
                  @click=${a=>a.stopPropagation()}
                  @change=${()=>{this._config={...this._config,approval:t.value},this.requestUpdate()}} />
              </div>
            `)}
          </oc-card>
        </div>
      </div>
    `}};qt.styles=A`:host{display:block;}`;let ue=qt;Oe([m({type:String})],ue.prototype,"title");Oe([m({type:String})],ue.prototype,"subtitle");Oe([d()],ue.prototype,"_config");Oe([d()],ue.prototype,"_status");Oe([d()],ue.prototype,"_saving");Oe([d()],ue.prototype,"_saveMsg");customElements.define("codex-page",ue);var ya=Object.defineProperty,ye=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ya(e,t,i),i};const Ut=class Ut extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._config={model:"",approvalPolicy:"",sandboxMode:"",apiKey:"",workspace:"",baseUrl:""},this._loaded=!1,this._offline=!1,this._saving=!1,this._msg="",this._msgCls=""}createRenderRoot(){return this}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}get _sandboxModes(){return[{value:"read-only",label:s("sandbox.readOnly"),desc:s("sandbox.readOnlyDesc")},{value:"workspace-write",label:s("sandbox.workspaceWrite"),desc:s("sandbox.workspaceWriteDesc")},{value:"danger-full-access",label:s("sandbox.dangerFull"),desc:s("sandbox.dangerFullDesc")}]}get _approvalPolicies(){return[{value:"untrusted",label:s("sandbox.untrusted"),desc:s("sandbox.untrustedDesc")},{value:"on-request",label:s("sandbox.onRequest"),desc:s("sandbox.onRequestDesc")},{value:"never",label:s("sandbox.never"),desc:s("sandbox.neverDesc")}]}connectedCallback(){super.connectedCallback(),this._load()}async _load(){this._msg="",this._msgCls="";try{const t=await(await G(`${this._sidecarBase}/api/codex/config`,{},5e3)).json();this._config={model:String(t.model??""),approvalPolicy:String(t.approvalPolicy??""),sandboxMode:String(t.sandboxMode??""),apiKey:String(t.apiKey??""),workspace:String(t.workspace??""),baseUrl:String(t.baseUrl??"")},this._loaded=!0,this._offline=!1}catch{this._offline=!0}}async _save(){if(!this._saving){this._saving=!0,this._msg="",this._msgCls="";try{const t=await(await G(`${this._sidecarBase}/api/codex/config`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...this._config})},8e3)).json();(t==null?void 0:t.success)===!1?(this._msg=t.message||"Save failed",this._msgCls="err"):(this._msg=s("sandbox.saved"),this._msgCls="ok",await this._load())}catch(e){this._msg=e instanceof Error?e.message:String(e),this._msgCls="err"}finally{this._saving=!1}}}_setMode(e){this._config={...this._config,sandboxMode:e}}_setPolicy(e){this._config={...this._config,approvalPolicy:e}}render(){const e=this._config.sandboxMode==="danger-full-access",t=this._config.approvalPolicy==="never";return r`
      <page-header title=${this.title} subtitle=${this.subtitle}></page-header>

      ${this._offline?r`
        <div style="margin-bottom:16px;padding:14px 16px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--card);color:var(--warn);font-size:13px;">
          ⚠ ${s("sandbox.sidecarOffline")}
        </div>
      `:""}

      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:340px;">
          <oc-card heading="${s("sandbox.modeTitle")}">
            ${this._sandboxModes.map(a=>r`
              <div class="toggle-row" @click=${()=>this._setMode(a.value)}
                style="cursor:pointer;user-select:none;margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.sandboxMode===a.value?"var(--accent-subtle)":"transparent"};border:1px solid ${this._config.sandboxMode===a.value?"var(--accent)":"transparent"};">
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${a.label}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${a.desc}</div>
                </div>
                <input type="radio" name="sandbox_mode" ?checked=${this._config.sandboxMode===a.value}
                  @click=${i=>i.stopPropagation()}
                  @change=${()=>this._setMode(a.value)} />
              </div>
            `)}
          </oc-card>

          <oc-card heading="${s("sandbox.approvalTitle")}" style="margin-top:16px;">
            ${this._approvalPolicies.map(a=>r`
              <div class="toggle-row" @click=${()=>this._setPolicy(a.value)}
                style="cursor:pointer;user-select:none;margin-bottom:12px;padding:10px;border-radius:var(--radius-md);background:${this._config.approvalPolicy===a.value?"var(--accent-subtle)":"transparent"};border:1px solid ${this._config.approvalPolicy===a.value?"var(--accent)":"transparent"};">
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:600;color:var(--text);">${a.label}</div>
                  <div style="font-size:12px;color:var(--text-soft);margin-top:2px;">${a.desc}</div>
                </div>
                <input type="radio" name="approval_policy" ?checked=${this._config.approvalPolicy===a.value}
                  @click=${i=>i.stopPropagation()}
                  @change=${()=>this._setPolicy(a.value)} />
              </div>
            `)}
          </oc-card>
        </div>

        <div style="flex:1;min-width:340px;">
          <oc-card heading="${s("sandbox.currentTitle")}">
            ${this._loaded?r`
              <div class="stat-row">
                <span class="stat-row-label">${s("sandbox.modeTitle")}</span>
                <span style="font-family:var(--font-mono);">${this._config.sandboxMode||"—"}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("sandbox.approvalTitle")}</span>
                <span style="font-family:var(--font-mono);">${this._config.approvalPolicy||"—"}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("sandbox.model")}</span>
                <span style="font-family:var(--font-mono);">${this._config.model||"—"}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("sandbox.workspace")}</span>
                <span style="font-family:var(--font-mono);word-break:break-all;">${this._config.workspace||"—"}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("sandbox.apiKey")}</span>
                <span style="font-family:var(--font-mono);">${this._config.apiKey||"—"}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("common.baseUrl")}</span>
                <span style="font-family:var(--font-mono);word-break:break-all;">${this._config.baseUrl||s("sandbox.officialApi")}</span>
              </div>
              <div class="stat-row">
                <span class="stat-row-label">${s("common.status")}</span>
                ${e||t?r`<oc-badge variant="danger">${s(e?"sandbox.dangerFull":"sandbox.never")}</oc-badge>`:r`<oc-badge variant="success">${s("common.ok")}</oc-badge>`}
              </div>
            `:r`<div style="font-size:13px;color:var(--muted);">${this._offline?"":s("sandbox.loading")}</div>`}
          </oc-card>

          <div class="page-actions" style="margin-top:16px;display:flex;align-items:center;gap:10px;">
            <button class="btn-sm" ?disabled=${this._saving||this._offline} @click=${()=>this._save()}>
              ${this._saving?s("models.saving"):s("common.save")}
            </button>
            <button class="btn-sm ghost" ?disabled=${this._offline} @click=${()=>this._load()}>${s("common.refresh")}</button>
            ${this._msg?r`<span style="font-size:12px;color:${this._msgCls==="ok"?"var(--success)":"var(--danger)"};">${this._msg}</span>`:""}
          </div>
        </div>
      </div>
    `}};Ut.styles=A`:host{display:block;}`;let ie=Ut;ye([m({type:String})],ie.prototype,"title");ye([m({type:String})],ie.prototype,"subtitle");ye([d()],ie.prototype,"_config");ye([d()],ie.prototype,"_loaded");ye([d()],ie.prototype,"_offline");ye([d()],ie.prototype,"_saving");ye([d()],ie.prototype,"_msg");ye([d()],ie.prototype,"_msgCls");customElements.define("sandbox-page",ie);var ka=Object.defineProperty,R=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&ka(e,t,i),i};const $a=[{name:"DeepSeek",baseUrl:"https://api.deepseek.com/v1",model:"deepseek-chat"},{name:"火山引擎",baseUrl:"https://ark.cn-beijing.volces.com/api/v3"},{name:"火山引擎 Coding",baseUrl:"https://ark.cn-beijing.volces.com/api/coding/v3"},{name:"阿里云百炼",baseUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1"},{name:"智谱 AI",baseUrl:"https://open.bigmodel.cn/api/paas/v4"},{name:"MiniMax",baseUrl:"https://api.minimax.chat/v1"},{name:"Moonshot / Kimi",baseUrl:"https://api.moonshot.cn/v1"},{name:"OpenAI 官方",baseUrl:"https://api.openai.com/v1"},{name:"Google Gemini",baseUrl:"https://generativelanguage.googleapis.com/v1beta/openai"},{name:"xAI (Grok)",baseUrl:"https://api.x.ai/v1"},{name:"Groq",baseUrl:"https://api.groq.com/openai/v1"},{name:"OpenRouter",baseUrl:"https://openrouter.ai/api/v1"},{name:"NVIDIA NIM",baseUrl:"https://integrate.api.nvidia.com/v1"},{name:"Ollama (本地)",baseUrl:"http://localhost:11434/v1"}],ms=[{cmd:"hermes chat",desc:s("hermesDashboard.cmdChatDesc"),subdesc:s("hermesDashboard.cmdChatSub")},{cmd:"hermes doctor",desc:s("hermesDashboard.cmdDoctorDesc"),subdesc:s("hermesDashboard.cmdDoctorSub")},{cmd:"hermes version",desc:s("hermesDashboard.cmdVersionDesc"),subdesc:s("hermesDashboard.cmdVersionSub")},{cmd:"hermes gateway run",desc:s("hermesDashboard.cmdGatewayRunDesc"),subdesc:s("hermesDashboard.cmdGatewayRunSub")},{cmd:"hermes gateway stop",desc:s("hermesDashboard.cmdGatewayStopDesc"),subdesc:s("hermesDashboard.cmdGatewayStopSub")},{cmd:"explorer %USERPROFILE%\\.hermes",desc:s("hermesDashboard.cmdExplorerDesc"),subdesc:s("hermesDashboard.cmdExplorerSub")}],jt=class jt extends C{constructor(){super(...arguments),this.title="",this.onNavigate=()=>{},this._connTarget="local",this._customUrl="",this._connMsg="",this._connMsgOk=!1,this._modelConfigOpen=!1,this._apiBase="https://api.deepseek.com/v1",this._apiKey="",this._model="deepseek-chat",this._selectedPreset="",this._modelList=[],this._busyBtn="",this._currentName="",this._currentBaseUrl="",this._hasKey=!1,this._hermesOnline=!1,this._hermesVersion="",this._saving=!1,this._saveMsg="",this._saveMsgOk=!1,this._showKey=!1}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}get _connHostPort(){try{const e=new URL(hermesUrl());return{host:e.hostname||"—",port:e.port||(e.protocol==="https:"?"443":"80")}}catch{return{host:"—",port:"—"}}}connectedCallback(){super.connectedCallback();const e=ni();e&&(this._connTarget="custom",this._customUrl=e),this._loadCurrentConfig(),this._loadStatus()}_applyConnTarget(){if(this._connTarget==="custom"){const e=this._customUrl.trim().replace(/\/+$/,"");if(!/^https?:\/\/.+/i.test(e)){this._connMsg=`✗ ${s("hermesDashboard.connInvalid")}`,this._connMsgOk=!1;return}ts(e),this._connMsg=`✓ ${s("hermesDashboard.connSaved")}`,this._connMsgOk=!0}else ts(null),this._customUrl="",this._connMsg=`✓ ${s("hermesDashboard.connLocalRestored")}`,this._connMsgOk=!0}async _loadCurrentConfig(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/model`,{headers:x()});if(!e.ok)return;const t=await e.json();this._currentName=t.name||"",this._currentBaseUrl=t.baseUrl||"",this._hasKey=!!t.hasKey,t.name&&(this._model=t.name),t.baseUrl&&(this._apiBase=t.baseUrl),t.apiKey&&(this._apiKey=t.apiKey)}catch{}}async _loadStatus(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/status`,{headers:x()});if(e.ok){const t=await e.json();this._hermesOnline=!!t.online,this._hermesVersion=t.version||""}else this._hermesOnline=!1}catch{this._hermesOnline=!1}}_applyPreset(e){this._selectedPreset=e.name,e.baseUrl&&(this._apiBase=e.baseUrl),e.model&&(this._model=e.model),this._modelList=[],this._saveMsg=""}async _probeModels(){var i;const e=this._apiBase.trim().replace(/\/+$/,"");if(!e)throw new Error(s("hermesDashboard.needBaseUrl"));const t=await fetch(`${this._sidecarBase}/api/hermes/model/probe`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({baseUrl:e,apiKey:this._apiKey.trim()})});if(!t.ok)throw new Error(((i=await t.json().catch(()=>({})))==null?void 0:i.detail)||`HTTP ${t.status}`);const a=await t.json();if(!a.ok)throw new Error(a.error||"unknown");return a.models||[]}async _fetchModels(){if(!this._busyBtn){this._busyBtn="models",this._saveMsg="";try{const e=await this._probeModels();if(!e.length)throw new Error(s("hermesDashboard.noModels"));this._modelList=e,this._saveMsg=`✓ ${s("hermesDashboard.fetchModelsOk",{n:e.length})}`,this._saveMsgOk=!0}catch(e){this._saveMsg=`✗ ${s("hermesDashboard.fetchModelsFailed")}${e instanceof Error?e.message:String(e)}`,this._saveMsgOk=!1}finally{this._busyBtn=""}}}async _testConn(){if(!this._busyBtn){this._busyBtn="conn",this._saveMsg="";try{await this._probeModels(),this._saveMsg=`✓ ${s("hermesDashboard.connOk")}`,this._saveMsgOk=!0}catch(e){this._saveMsg=`✗ ${s("hermesDashboard.connFailed")}${e instanceof Error?e.message:String(e)}`,this._saveMsgOk=!1}finally{this._busyBtn=""}}}async _saveModelConfig(){this._saving=!0,this._saveMsg="";try{(await(await fetch(`${this._sidecarBase}/api/hermes/model`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({name:this._model.trim(),baseUrl:this._apiBase.trim(),apiKey:this._apiKey.trim()})})).json()).success?(this._saveMsg=`✓ ${s("hermesDashboard.savedHotReload")}`,this._saveMsgOk=!0,await this._loadCurrentConfig()):(this._saveMsg=`✗ ${s("hermesDashboard.saveFailed")}`,this._saveMsgOk=!1)}catch{this._saveMsg=`✗ ${s("hermesDashboard.sidecarOffline")}`,this._saveMsgOk=!1}this._saving=!1}_refreshAll(){this._loadCurrentConfig(),this._loadStatus()}render(){return r`
      <page-header title=${this.title} subtitle=${`${this._connHostPort.host}:${this._connHostPort.port} · ${s("hermesDashboard.subtitle")}${this._hermesVersion?" · v"+this._hermesVersion:""}`}>
        <div style="display:flex;gap:8px;align-items:center;">
          <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);display:inline-flex;align-items:center;gap:6px;"
                  @click=${()=>this._refreshAll()}>
            ${s("common.refresh")}
          </button>
        </div>
      </page-header>
      <div class="hermes-dashboard">

        <!-- Status cards -->
        <div class="hermes-status-row">
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${s("hermesDashboard.gatewayStatus")}</div>
            <div class="hermes-status-card__value">
              <div class="hermes-status-card__status">
                <span class="hermes-status-card__dot ${this._hermesOnline?"running":"stopped"}"></span>
                ${this._hermesOnline?s("hermesDashboard.running"):s("hermesDashboard.stopped")}
              </div>
            </div>
            <div class="hermes-status-card__sub">${s("hermesDashboard.listeningPort")}</div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${s("hermesDashboard.currentModel")}</div>
            <div class="hermes-status-card__value" style="font-size:${this._currentName?"15px":"13px"};">${this._currentName||s("hermesDashboard.notConfigured")}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">${this._hasKey?"Key ✓":"Key —"}</span>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${s("hermesDashboard.version")}</div>
            <div class="hermes-status-card__value" style="font-size:20px;">${this._hermesVersion?`v${this._hermesVersion}`:"—"}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">hermes-agent</span>
            </div>
          </div>
          <div class="hermes-status-card">
            <div class="hermes-status-card__label">${s("hermesDashboard.apiAddress")}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">${this._connHostPort.host}</div>
            <div class="hermes-status-card__sub">
              <span style="font-size:12px;padding:2px 6px;background:var(--bg-muted);border-radius:var(--radius-sm);color:var(--muted);">:${this._connHostPort.port}/v1</span>
            </div>
          </div>
          <div class="hermes-status-card" style="cursor:pointer;" @click=${()=>this.onNavigate("chat")}>
            <div class="hermes-status-card__label">${s("hermesDashboard.openPanel")}</div>
            <div class="hermes-status-card__value" style="font-size:13px;">${s("hermesDashboard.hermesChatPanel")}</div>
            <div class="hermes-status-card__sub">${s("hermesDashboard.openChat")}</div>
          </div>
        </div>

        <!-- Model config -->
        <div class="hermes-section">
          <div class="hermes-section__header" style="cursor:pointer;user-select:none;" @click=${()=>{this._modelConfigOpen=!this._modelConfigOpen,this.requestUpdate()}}>
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${s("hermesDashboard.modelConfig")}
              ${this._currentName?r`<span class="hermes-section__badge ok">${this._currentName}</span>`:r`<span class="hermes-section__badge">${s("hermesDashboard.notConfigured")}</span>`}
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              style="transform:${this._modelConfigOpen?"rotate(180deg)":"rotate(0)"};transition:transform var(--duration-fast);color:var(--muted);">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          ${this._modelConfigOpen?r`
            <!-- 服务商预设 -->
            <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px;">${s("hermesDashboard.providerPresets")}</div>
            <div class="hermes-model-presets">
              ${$a.map(e=>r`
                <button class="${this._selectedPreset===e.name?"active":""}"
                  @click=${()=>this._applyPreset(e)}>${e.name}</button>
              `)}
            </div>

            <!-- API Base URL & API Key -->
            <div class="hermes-form-row">
              <div class="hermes-form-group">
                <div class="hermes-form-label">API Base URL</div>
                <input class="hermes-form-input" type="text" .value=${this._apiBase}
                  placeholder="https://api.deepseek.com/v1"
                  @input=${e=>{this._apiBase=e.target.value,this._selectedPreset=""}} />
              </div>
              <div class="hermes-form-group">
                <div class="hermes-form-label">API Key</div>
                <div class="hermes-key-wrap">
                  <input class="hermes-form-input" type=${this._showKey?"text":"password"} .value=${this._apiKey}
                    placeholder="sk-...（留空=保留原 Key）"
                    @input=${e=>{this._apiKey=e.target.value}} />
                  <button class="hermes-key-eye" type="button"
                    title=${this._showKey?s("common.hide"):s("common.show")}
                    @click=${()=>{this._showKey=!this._showKey}}>
                    ${this._showKey?r`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    `:r`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    `}
                  </button>
                </div>
              </div>
            </div>

            <!-- Model + 探测按钮 -->
            <div class="hermes-form-group">
              <div class="hermes-form-label">${s("hermesDashboard.model","模型")}</div>
              <div style="display:flex;gap:8px;">
                <input class="hermes-form-input" style="flex:1;" type="text" .value=${this._model}
                  placeholder="deepseek-chat"
                  @input=${e=>{this._model=e.target.value}} />
                <button class="hermes-btn-ghost" ?disabled=${!!this._busyBtn} @click=${this._fetchModels}>
                  ${this._busyBtn==="models"?s("common.loading"):s("hermesDashboard.fetchModels")}
                </button>
                <button class="hermes-btn-ghost" ?disabled=${!!this._busyBtn} @click=${this._testConn}>
                  ${this._busyBtn==="conn"?s("common.loading"):s("hermesDashboard.testConn")}
                </button>
              </div>
            </div>

            <!-- 获取到的模型列表 → 点选填入 -->
            ${this._modelList.length>0?r`
              <div class="hermes-model-presets" style="margin-top:4px;">
                ${this._modelList.map(e=>r`
                  <button class="${this._model===e?"active":""}"
                    @click=${()=>{this._model=e}}>${e}</button>
                `)}
              </div>
            `:""}

            <!-- Actions -->
            <div class="hermes-form-actions" style="justify-content:space-between;">
              <div style="display:flex;gap:10px;align-items:center;">
                <button class="hermes-btn-save" ?disabled=${this._saving} @click=${this._saveModelConfig}>
                  ${this._saving?s("hermesDashboard.saving"):s("hermesDashboard.saveConfig","保存配置")}
                </button>
                <span class="hermes-save-msg ${this._saveMsgOk?"ok":"err"}">${this._saveMsg}</span>
              </div>
              <span class="hermes-section__link" @click=${()=>this.onNavigate("hermes-env")}>
                ${s("hermesDashboard.envAdvanced")} →
              </span>
            </div>
          `:""}
        </div>

        <!-- Connection target -->
        <div class="hermes-section">
          <div class="hermes-section__header">
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              ${s("hermesDashboard.connectionTarget")}
            </div>
            <div class="hermes-section__link">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
              ${s("hermesDashboard.detectEnv")}
            </div>
          </div>
          <div class="hermes-conn-targets">
            <button class="hermes-conn-target ${this._connTarget==="local"?"active":""}"
                    @click=${()=>{this._connTarget="local",this._connMsg=""}}>
              ${s("hermesDashboard.local")}
            </button>
            <button class="hermes-conn-target ${this._connTarget==="custom"?"active":""}"
                    @click=${()=>{this._connTarget="custom",this._connMsg=""}}>
              ${s("hermesDashboard.custom")}
            </button>
          </div>
          ${this._connTarget==="custom"?r`
            <div class="hermes-form-group" style="margin-bottom:10px;">
              <div class="hermes-form-label">${s("hermesDashboard.customUrlLabel")}</div>
              <input class="hermes-form-input" type="text" .value=${this._customUrl}
                placeholder="http://192.168.1.20:8642"
                @input=${e=>{this._customUrl=e.target.value}} />
            </div>
          `:""}
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="hermes-apply-btn" @click=${this._applyConnTarget}>${s("hermesDashboard.apply")}</button>
            <span class="hermes-save-msg ${this._connMsgOk?"ok":"err"}">${this._connMsg}</span>
          </div>
        </div>

        <!-- Quick actions -->
        <div style="font-size:12px;color:var(--muted);margin-bottom:10px;">${s("hermesDashboard.quickActions")}</div>
        <div class="hermes-quick-grid">
          <div class="hermes-quick-item" @click=${()=>this.onNavigate("chat")}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">${s("hermesDashboard.openChat")}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${s("hermesDashboard.openChat")}</div>
            <div class="hermes-quick-item__desc">${s("hermesDashboard.interactiveSession")}</div>
          </div>
          <div class="hermes-quick-item" @click=${()=>this.onNavigate("hermes-service")}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">${s("hermesDashboard.hermesService")}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${s("hermesDashboard.maintenanceOps")}</div>
            <div class="hermes-quick-item__desc">${s("hermesDashboard.maintenanceDesc")}</div>
          </div>
          <div class="hermes-quick-item" @click=${()=>this.onNavigate("logs")}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label" style="color:var(--accent);">${s("hermesDashboard.openLogs")}</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">gateway.log</div>
            <div class="hermes-quick-item__desc">${s("hermesDashboard.traceSearch")}</div>
          </div>
          <div class="hermes-quick-item" @click=${()=>this.onNavigate("hermes-env")}>
            <div class="hermes-quick-item__title">
              <span class="hermes-quick-item__label">&lt;&gt; ENV</span>
              <span class="hermes-quick-item__arrow">→</span>
            </div>
            <div class="hermes-quick-item__name">${s("hermesDashboard.advancedEdit")}</div>
            <div class="hermes-quick-item__desc">${s("hermesDashboard.customVars")}</div>
          </div>
        </div>

        <!-- Terminal commands -->
        <div class="hermes-section">
          <div class="hermes-section__header">
            <div class="hermes-section__title">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              ${s("hermesDashboard.terminalCommands")}
              <span class="hermes-section__badge">${ms.length}</span>
            </div>
            <div style="font-size:12px;color:var(--muted);">${s("hermesDashboard.terminalCmdHint")}</div>
          </div>
          <table class="hermes-cmd-table">
            <thead>
              <tr><th>${s("hermesDashboard.cmdHeader")}</th><th>${s("hermesDashboard.descHeader")}</th><th style="width:60px;"></th></tr>
            </thead>
            <tbody>
              ${ms.map(e=>r`
                <tr>
                  <td><code class="cmd-code">${e.cmd}</code></td>
                  <td>
                    <div class="cmd-desc">${e.desc}</div>
                    <div class="cmd-subdesc">${e.subdesc}</div>
                  </td>
                  <td>
                    <button class="cmd-copy" title="${s("hermesDashboard.copy")}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>

      </div>
    `}};jt.styles=A`
    :host { display: block; }
    /* Shadow DOM 不继承文档级 *{box-sizing:border-box}；
       不加这条，width:100% 的输入框会因 padding+border 溢出列宽（重叠/出卡片） */
    :host *, :host *::before, :host *::after { box-sizing: border-box; }

    .hermes-dashboard { width: 100%; }

    /* === status cards === */
    .hermes-status-row {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 900px) { .hermes-status-row { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 600px) { .hermes-status-row { grid-template-columns: 1fr; } }
    .hermes-status-card {
      padding: 20px; border-right: 1px solid var(--border);
    }
    .hermes-status-card:last-child { border-right: none; }
    .hermes-status-card__label {
      font-size: 12px; color: var(--muted); margin-bottom: 8px;
    }
    .hermes-status-card__value {
      font-size: 14px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .hermes-status-card__sub {
      font-size: 12px; color: var(--text-soft);
    }
    .hermes-status-card__status {
      display: flex; align-items: center; gap: 6px;
    }
    .hermes-status-card__dot {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .hermes-status-card__dot.stopped { background: var(--danger); }
    .hermes-status-card__dot.running { background: var(--success); }

    /* === section card === */
    .hermes-section {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      padding: 18px 20px; margin-bottom: 16px; box-shadow: var(--shadow-card);
    }
    .hermes-section__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border);
    }
    .hermes-section__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hermes-section__title svg { color: var(--accent); }
    .hermes-section__badge {
      font-size: 12px; padding: 2px 8px; border-radius: var(--radius-full);
      background: var(--bg-muted); color: var(--muted); font-weight: 500;
    }
    .hermes-section__badge.ok { background: var(--success-subtle); color: var(--success); }
    .hermes-save-msg { font-size: 12px; font-weight: 500; }
    .hermes-save-msg.ok { color: var(--success); }
    .hermes-save-msg.err { color: var(--danger); }

    /* === API Key 可视开关 === */
    .hermes-key-wrap { position: relative; flex: 1; }
    .hermes-key-wrap .hermes-form-input { width: 100%; padding-right: 34px; }
    .hermes-key-eye {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      width: 22px; height: 22px; display: grid; place-items: center;
      background: transparent; border: none; cursor: pointer;
      color: var(--muted); border-radius: var(--radius-sm);
      transition: color var(--duration-fast), background var(--duration-fast);
    }
    .hermes-key-eye:hover { color: var(--text); background: var(--bg-hover); }
    .hermes-key-eye svg { width: 14px; height: 14px; }
    .hermes-section__link {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      display: flex; align-items: center; gap: 4px;
    }
    .hermes-section__link:hover { color: var(--text); }

    /* === connection target === */
    .hermes-conn-targets { display: flex; gap: 8px; margin-bottom: 10px; }
    .hermes-conn-target {
      padding: 6px 14px; border-radius: var(--radius-full); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hermes-conn-target.active {
      /* text-strong 底 + bg 字：深/亮两种模式都高对比（原 accent-foreground 在深色下白底白字） */
      background: var(--text-strong); color: var(--bg); border-color: var(--text-strong);
    }
    .hermes-conn-target:hover:not(.active) { background: var(--bg-hover); color: var(--text); }
    .hermes-apply-btn {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--bg);
      transition: opacity var(--duration-fast);
    }
    .hermes-apply-btn:hover { opacity: 0.85; }

    /* === quick actions === */
    .hermes-quick-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 768px) { .hermes-quick-grid { grid-template-columns: repeat(2, 1fr); } }
    .hermes-quick-item {
      padding: 20px; border-right: 1px solid var(--border); cursor: pointer;
      transition: background var(--duration-fast);
    }
    .hermes-quick-item:last-child { border-right: none; }
    .hermes-quick-item:hover { background: var(--bg-hover); }
    .hermes-quick-item__title {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .hermes-quick-item__label {
      font-size: 12px; font-weight: 600; color: var(--accent);
    }
    .hermes-quick-item__arrow { color: var(--muted); }
    .hermes-quick-item__name {
      font-size: 14px; font-weight: 600; color: var(--text-strong); margin-bottom: 4px;
    }
    .hermes-quick-item__desc {
      font-size: 12px; color: var(--text-soft); line-height: 1.4;
    }

    /* === terminal commands === */
    .hermes-cmd-table { width: 100%; border-collapse: collapse; }
    .hermes-cmd-table th {
      text-align: left; font-size: 12px; color: var(--muted); padding: 10px 14px;
      border-bottom: 1px solid var(--border); font-weight: 500;
    }
    .hermes-cmd-table td {
      padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px;
    }
    .hermes-cmd-table tr:last-child td { border-bottom: none; }
    .hermes-cmd-table .cmd-code {
      font-family: var(--font-mono); font-size: 12px; background: var(--bg-muted);
      padding: 3px 8px; border-radius: var(--radius-sm); color: var(--text);
    }
    .hermes-cmd-table .cmd-desc { font-weight: 500; color: var(--text-strong); }
    .hermes-cmd-table .cmd-subdesc { font-size: 12px; color: var(--muted); }
    .hermes-cmd-table .cmd-copy {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm);
      color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);
    }
    .hermes-cmd-table .cmd-copy:hover { background: var(--bg-hover); color: var(--text); }

    /* === model config form === */
    .hermes-model-presets {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;
    }
    .hermes-model-presets button {
      padding: 4px 10px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      white-space: nowrap;
    }
    .hermes-model-presets button:hover { background: var(--bg-hover); color: var(--text); }
    .hermes-model-presets button.active {
      background: var(--accent-subtle); color: var(--accent); border-color: var(--accent);
    }
    .hermes-form-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
    }
    @media (max-width: 700px) { .hermes-form-row { grid-template-columns: 1fr; } }
    .hermes-form-group { margin-bottom: 12px; }
    .hermes-form-label {
      font-size: 12px; font-weight: 600; color: var(--text-soft); margin-bottom: 6px;
      font-style: italic;
    }
    .hermes-form-input {
      width: 100%; padding: 8px 12px; background: var(--bg-muted);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 13px; outline: none;
      font-family: var(--font-mono);
    }
    .hermes-form-input:focus { border-color: var(--accent); }
    .hermes-form-actions {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 16px;
    }
    .hermes-btn-save {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--text-strong); color: var(--bg);
    }
    .hermes-btn-save:hover { opacity: 0.9; }
    .hermes-btn-ghost {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hermes-btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .hermes-link {
      font-size: 12px; color: var(--text-soft); cursor: pointer;
      text-decoration: none;
    }
    .hermes-link:hover { color: var(--text); text-decoration: underline; }
  `;let O=jt;R([m({type:String})],O.prototype,"title");R([m({type:Function})],O.prototype,"onNavigate");R([d()],O.prototype,"_connTarget");R([d()],O.prototype,"_customUrl");R([d()],O.prototype,"_connMsg");R([d()],O.prototype,"_connMsgOk");R([d()],O.prototype,"_modelConfigOpen");R([d()],O.prototype,"_apiBase");R([d()],O.prototype,"_apiKey");R([d()],O.prototype,"_model");R([d()],O.prototype,"_selectedPreset");R([d()],O.prototype,"_modelList");R([d()],O.prototype,"_busyBtn");R([d()],O.prototype,"_currentName");R([d()],O.prototype,"_currentBaseUrl");R([d()],O.prototype,"_hasKey");R([d()],O.prototype,"_hermesOnline");R([d()],O.prototype,"_hermesVersion");R([d()],O.prototype,"_saving");R([d()],O.prototype,"_saveMsg");R([d()],O.prototype,"_saveMsgOk");R([d()],O.prototype,"_showKey");customElements.define("hermes-dashboard-page",O);const Ee=`/* === service page === */\r
.services-page { width: 100%; }\r
\r
/* === section card === */\r
.svc-card {\r
  background: var(--card); border: 1px solid var(--border);\r
  border-radius: var(--radius-lg); padding: 18px 20px;\r
  margin-bottom: 16px; box-shadow: var(--shadow-card);\r
}\r
.svc-card__title {\r
  font-size: 14px; font-weight: 600; color: var(--text-strong);\r
  margin-bottom: 8px; display: flex; align-items: center; gap: 8px;\r
}\r
.svc-card__title .svc-dot {\r
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;\r
}\r
.svc-card__title .svc-dot.running { background: var(--success); }\r
.svc-card__title .svc-dot.stopped { background: var(--muted); }\r
.svc-card__subtitle {\r
  font-size: 12px; color: var(--text-soft); margin-bottom: 12px; line-height: 1.5;\r
}\r
\r
/* === version card === */\r
.version-card .version-label {\r
  font-size: 12px; color: var(--text-soft); margin-bottom: 4px;\r
}\r
.version-card .version-label span {\r
  color: var(--danger); font-weight: 500;\r
}\r
.version-card .version-number {\r
  font-size: 20px; font-weight: 700; color: var(--text-strong);\r
  margin-bottom: 4px;\r
}\r
.version-card .version-upstream {\r
  font-size: 12px; color: var(--muted); margin-bottom: 8px;\r
}\r
.version-card .version-note {\r
  font-size: 12px; color: var(--muted); line-height: 1.6;\r
}\r
\r
/* === gateway service row === */\r
.svc-row {\r
  display: flex; align-items: center; justify-content: space-between;\r
  padding: 4px 0;\r
}\r
.svc-row__info { display: flex; align-items: center; gap: 10px; }\r
.svc-row__name { font-size: 14px; font-weight: 600; color: var(--text-strong); }\r
.svc-row__desc { font-size: 12px; color: var(--text-soft); }\r
.svc-row__actions { display: flex; gap: 6px; }\r
.svc-row__actions button {\r
  padding: 4px 14px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  transition: all var(--duration-fast); white-space: nowrap;\r
}\r
.svc-row__actions .btn-restart {\r
  background: var(--bg-hover); color: var(--text-soft);\r
}\r
.svc-row__actions .btn-restart:hover { background: var(--bg-active); color: var(--text); }\r
.svc-row__actions .btn-stop {\r
  background: var(--danger-subtle); color: var(--danger); border-color: rgba(239,68,68,0.2);\r
}\r
.svc-row__actions .btn-stop:hover { background: rgba(239,68,68,0.2); }\r
\r
/* === docker unavailable === */\r
.docker-unavailable {\r
  padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm);\r
  background: var(--bg-muted); font-size: 12px; color: var(--muted); line-height: 1.6;\r
}\r
\r
/* === config editor === */\r
.config-actions { display: flex; gap: 6px; margin-bottom: 8px; }\r
.config-actions button {\r
  padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  transition: all var(--duration-fast); white-space: nowrap;\r
}\r
.config-actions .btn-save-restart {\r
  background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);\r
}\r
.config-actions .btn-save-restart:hover { background: var(--accent-hover); }\r
.config-actions .btn-ghost {\r
  background: transparent; color: var(--text-soft);\r
}\r
.config-actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }\r
.config-loaded {\r
  font-size: 11px; color: var(--muted); margin-bottom: 10px;\r
}\r
.config-editor {\r
  width: 100%; min-height: 240px; max-height: 400px;\r
  background: var(--bg-muted); border: 1px solid var(--border);\r
  border-radius: var(--radius-sm); padding: 14px;\r
  font-family: var(--font-mono); font-size: 12px; line-height: 1.6;\r
  color: var(--text); resize: vertical; outline: none;\r
}\r
.config-editor:focus { border-color: var(--accent); }\r
\r
/* === validation buttons === */\r
.validation-actions { display: flex; gap: 6px; margin-bottom: 12px; }\r
.validation-actions button {\r
  padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  transition: all var(--duration-fast); white-space: nowrap;\r
}\r
.validation-actions .btn-calibrate {\r
  background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);\r
}\r
.validation-actions .btn-calibrate:hover { background: var(--accent-hover); }\r
.validation-actions .btn-ghost {\r
  background: transparent; color: var(--text-soft);\r
}\r
.validation-actions .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }\r
.validation-option {\r
  padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm);\r
  font-size: 12px; color: var(--text-soft); line-height: 1.6;\r
  margin-bottom: 8px; background: var(--bg-muted);\r
}\r
.validation-option:last-child { margin-bottom: 0; }\r
\r
/* === backup === */\r
.backup-actions { display: flex; gap: 6px; margin-bottom: 8px; }\r
.backup-actions button {\r
  padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  transition: all var(--duration-fast); white-space: nowrap;\r
}\r
.backup-actions .btn-backup {\r
  background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);\r
}\r
.backup-actions .btn-backup:hover { background: var(--accent-hover); }\r
.backup-empty {\r
  font-size: 13px; color: var(--muted); padding: 8px 0;\r
}\r
\r
/* === ai page === */\r
.ai-toolbar {\r
  display: flex; justify-content: space-between; align-items: center;\r
  padding: 12px 24px; border-bottom: 1px solid var(--border);\r
}\r
.ai-toolbar__title {\r
  display: flex; align-items: center; gap: 12px;\r
}\r
.ai-toolbar__title span {\r
  font-size: 20px; font-weight: 700; color: var(--text-strong);\r
}\r
.ai-toolbar__badge {\r
  font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);\r
  font-weight: 600; background: var(--warn-subtle, rgba(245,158,11,0.12)); color: var(--warn);\r
}\r
.ai-toolbar__actions { display: flex; gap: 6px; }\r
.ai-toolbar__actions button {\r
  display: inline-flex; align-items: center; gap: 4px;\r
  padding: 5px 12px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  transition: all var(--duration-fast); line-height: 1;\r
}\r
.ai-toolbar__actions button svg { width: 14px; height: 14px; flex-shrink: 0; }\r
.ai-toolbar__actions .btn-settings { background: var(--bg-hover); color: var(--text-soft); }\r
.ai-toolbar__actions .btn-settings:hover { background: var(--bg-active); color: var(--text); }\r
.ai-toolbar__actions .btn-settings.active { background: var(--accent); color: var(--accent-foreground); border-color: var(--accent); }\r
.ai-toolbar__menu {\r
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;\r
  background: transparent; border: none; border-radius: var(--radius-sm);\r
  color: var(--text-soft); cursor: pointer; transition: all var(--duration-fast);\r
  margin-right: 8px; flex-shrink: 0;\r
}\r
.ai-toolbar__menu:hover { background: var(--bg-hover); color: var(--text); }\r
\r
.ai-layout { display: flex; flex: 1; overflow: hidden; position: relative; }\r
\r
.ai-sidebar {\r
  width: 280px; flex-shrink: 0; border-right: 1px solid var(--border);\r
  display: flex; flex-direction: column; background: var(--bg-elevated);\r
  position: fixed; left: var(--shell-nav-width, 240px); top: var(--shell-topbar-height, 58px); bottom: 0; z-index: 5;\r
  transform: translateX(-100%); transition: transform var(--duration-normal) var(--ease-out);\r
}\r
.ai-layout.with-list .ai-sidebar { transform: translateX(0); margin-top: -56px; }\r
.ai-sidebar__header {\r
  display: flex; justify-content: space-between; align-items: center;\r
  padding: 12px 16px; border-bottom: 1px solid var(--border);\r
}\r
.ai-sidebar__title { font-size: 14px; font-weight: 600; color: var(--text-strong); }\r
.ai-sidebar__actions { display: flex; gap: 4px; }\r
.ai-sidebar__actions button {\r
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\r
  background: transparent; border: none; border-radius: var(--radius-sm);\r
  color: var(--text-soft); cursor: pointer; transition: background var(--duration-fast);\r
}\r
.ai-sidebar__actions button:hover { background: var(--bg-hover); color: var(--text); }\r
.ai-sidebar__search {\r
  margin: 8px 12px; display: flex; align-items: center; gap: 8px;\r
  padding: 6px 10px; background: var(--input); border: 1px solid var(--border);\r
  border-radius: var(--radius-md);\r
}\r
.ai-sidebar__search svg { color: var(--muted); flex-shrink: 0; }\r
.ai-sidebar__search input {\r
  flex: 1; background: transparent; border: none; color: var(--text);\r
  font-size: 13px; outline: none;\r
}\r
.ai-sidebar__search input::placeholder { color: var(--muted); }\r
.ai-sidebar__list { flex: 1; overflow-y: auto; padding: 0 8px 8px; }\r
.ai-sidebar__item {\r
  padding: 10px 12px; margin-bottom: 2px; border-radius: var(--radius-md);\r
  cursor: pointer; transition: all var(--duration-fast);\r
  border: 1px solid transparent;\r
}\r
.ai-sidebar__item:hover { background: var(--bg-hover); }\r
.ai-sidebar__item.active {\r
  background: var(--accent-subtle); border-color: var(--accent);\r
}\r
.ai-sidebar__item-header {\r
  display: flex; justify-content: space-between; align-items: center;\r
  margin-bottom: 2px;\r
}\r
.ai-sidebar__item-title {\r
  font-size: 13px; font-weight: 600; color: var(--text);\r
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\r
}\r
.ai-sidebar__item-delete {\r
  background: none; border: none; color: var(--muted); cursor: pointer;\r
  font-size: 12px; padding: 0; opacity: 0.5;\r
}\r
.ai-sidebar__item-delete:hover { opacity: 1; color: var(--danger); }\r
.ai-sidebar__item-preview {\r
  font-size: 11px; color: var(--text-soft);\r
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\r
}\r
.ai-sidebar__item-time {\r
  font-size: 10px; color: var(--muted); margin-top: 2px;\r
}\r
\r
.ai-main { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }\r
\r
.ai-home { flex: 1; overflow-y: auto; padding: 0 24px; }\r
.ai-home__welcome {\r
  text-align: center; padding: 30px 0 20px;\r
}\r
.ai-home__icon { font-size: 48px; margin-bottom: 12px; }\r
.ai-home__title {\r
  font-size: 24px; font-weight: 700; color: var(--text-strong); margin-bottom: 8px;\r
}\r
.ai-home__subtitle {\r
  font-size: 15px; color: var(--text-soft);\r
}\r
.ai-home__tip {\r
  display: flex; align-items: flex-start; gap: 12px;\r
  background: var(--accent-subtle); border: 1px solid var(--accent);\r
  border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 24px;\r
}\r
.ai-home__tip-badge {\r
  font-size: 10px; padding: 2px 8px; border-radius: var(--radius-full);\r
  font-weight: 600; background: var(--danger-subtle); color: var(--danger);\r
  white-space: nowrap;\r
}\r
.ai-home__tip-text {\r
  flex: 1; font-size: 13px; color: var(--text); line-height: 1.6;\r
}\r
.ai-home__tip-close {\r
  background: none; border: none; color: var(--muted); cursor: pointer;\r
  font-size: 16px; padding: 0; line-height: 1;\r
}\r
.ai-home__grid {\r
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;\r
}\r
.ai-home__card {\r
  background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);\r
  padding: 16px 18px; cursor: pointer;\r
  transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast);\r
  box-shadow: var(--shadow-card);\r
}\r
.ai-home__card:hover { border-color: var(--accent); background: var(--accent-subtle); }\r
.ai-home__card-inner {\r
  display: flex; align-items: center; gap: 12px;\r
}\r
.ai-home__card-icon {\r
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;\r
  border-radius: var(--radius-sm); background: var(--bg-muted);\r
  color: var(--text-soft); flex-shrink: 0;\r
  transition: background var(--duration-fast), color var(--duration-fast);\r
}\r
.ai-home__card-icon svg { width: 18px; height: 18px; }\r
.ai-home__card:hover .ai-home__card-icon { background: var(--accent); color: var(--accent-foreground); }\r
.ai-home__card-title {\r
  font-size: 14px; font-weight: 600; color: var(--text);\r
  transition: color var(--duration-fast);\r
}\r
.ai-home__card:hover .ai-home__card-title { color: var(--accent); }\r
.ai-home__card-desc {\r
  font-size: 12px; color: var(--text-soft); margin-top: 2px;\r
}\r
\r
.ai-chat { flex: 1; display: flex; flex-direction: column; min-width: 0; }\r
.ai-chat__messages {\r
  flex: 1; overflow-y: auto; padding: 16px 24px;\r
}\r
.ai-chat__empty {\r
  text-align: center; padding: 40px; color: var(--muted);\r
}\r
.ai-chat__empty-icon { font-size: 36px; margin-bottom: 8px; }\r
.ai-chat__msg {\r
  margin-bottom: 16px; display: flex; gap: 10px;\r
}\r
.ai-chat__msg.user { flex-direction: row-reverse; }\r
.ai-chat__msg-avatar {\r
  width: 32px; height: 32px; border-radius: 50%;\r
  display: flex; align-items: center; justify-content: center;\r
  font-size: 14px; flex-shrink: 0;\r
}\r
.ai-chat__msg.user .ai-chat__msg-avatar {\r
  background: var(--accent); color: var(--accent-foreground);\r
}\r
.ai-chat__msg.assistant .ai-chat__msg-avatar {\r
  background: var(--bg-muted); color: var(--text-soft);\r
}\r
.ai-chat__msg-body { max-width: 75%; }\r
.ai-chat__msg-meta {\r
  font-size: 11px; color: var(--muted); margin-bottom: 4px;\r
}\r
.ai-chat__msg.user .ai-chat__msg-meta { text-align: right; }\r
.ai-chat__msg-text {\r
  padding: 10px 14px; border-radius: var(--radius-md);\r
  font-size: 14px; line-height: 1.5; white-space: pre-wrap;\r
}\r
.ai-chat__msg.user .ai-chat__msg-text {\r
  background: var(--accent); color: var(--accent-foreground);\r
}\r
.ai-chat__msg.assistant .ai-chat__msg-text {\r
  background: var(--bg-muted); color: var(--text);\r
}\r
\r
.ai-input {\r
  border-top: 1px solid var(--border); padding: 12px 24px 16px;\r
}\r
.ai-input__image-preview {\r
  position: relative; display: inline-block; margin-bottom: 8px;\r
}\r
.ai-input__image-preview img {\r
  height: 64px; border-radius: var(--radius-sm);\r
  border: 1px solid var(--border); object-fit: cover;\r
}\r
.ai-input__image-remove {\r
  position: absolute; top: -6px; right: -6px;\r
  width: 20px; height: 20px; border-radius: 50%;\r
  background: var(--danger); color: #fff; border: none;\r
  cursor: pointer; display: flex; align-items: center; justify-content: center;\r
  font-size: 10px;\r
}\r
.ai-input__image-remove:hover { background: var(--danger-hover, #dc2626); }\r
.ai-input__row.has-image { border-color: var(--accent); }\r
.ai-input__row {\r
  display: grid; grid-template-columns: 32px 1fr 32px; align-items: center;\r
  background: var(--input); border: 1px solid var(--border); border-radius: var(--radius-md);\r
  padding: 6px; transition: border-color var(--duration-fast);\r
}\r
.ai-input__row:focus-within { border-color: var(--accent); }\r
.ai-input__attach {\r
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;\r
  background: transparent; border: none; border-radius: var(--radius-sm);\r
  cursor: pointer; color: var(--muted);\r
}\r
.ai-input__attach:hover { background: var(--bg-hover); color: var(--text); }\r
.ai-input__textarea {\r
  padding: 8px 4px; background: transparent; border: none;\r
  color: var(--text); font-size: 14px; outline: none; resize: none;\r
  min-height: 32px; line-height: 1.5; overflow: hidden;\r
}\r
.ai-input__textarea::placeholder { color: var(--muted); }\r
.ai-input__send {\r
  width: 32px; height: 32px; border-radius: var(--radius-sm);\r
  background: var(--accent); color: var(--accent-foreground); border: none;\r
  cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;\r
}\r
.ai-input__send:hover { background: var(--accent-hover); }\r
.ai-input__hint {\r
  font-size: 11px; color: var(--muted); margin-top: 8px; text-align: center;\r
}\r
\r
.modal-overlay {\r
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);\r
  display: flex; align-items: center; justify-content: center;\r
  z-index: 1000;\r
}\r
.modal-dialog {\r
  background: var(--card, #fff); border-radius: var(--radius-lg);\r
  box-shadow: 0 8px 32px rgba(0,0,0,0.24);\r
  width: 480px; max-width: 90vw; max-height: 85vh;\r
  display: flex; flex-direction: column; overflow: hidden;\r
}\r
.modal-header {\r
  padding: 20px 24px 0; font-size: 16px; font-weight: 700;\r
  color: var(--text-strong);\r
}\r
\r
.modal-tabs {\r
  display: flex; gap: 0; margin-top: 8px;\r
  border-bottom: 1px solid var(--border);\r
}\r
.modal-tab {\r
  padding: 8px 16px; font-size: 13px; font-weight: 500;\r
  color: var(--text-soft); cursor: pointer; border-bottom: 2px solid transparent;\r
  transition: all var(--duration-fast);\r
}\r
.modal-tab:hover { color: var(--text); }\r
.modal-tab.active { color: var(--accent); border-bottom-color: var(--accent); }\r
\r
.modal-body {\r
  flex: 1; overflow-y: auto; padding: 16px 24px;\r
}\r
.modal-footer {\r
  display: flex; gap: 8px; justify-content: flex-end;\r
  padding: 12px 24px 16px; border-top: 1px solid var(--border);\r
}\r
.modal-footer button {\r
  padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  background: transparent; color: var(--text-soft);\r
}\r
.modal-footer button:hover { background: var(--bg-hover); color: var(--text); }\r
.modal-footer .btn-primary {\r
  background: var(--accent); color: var(--accent-foreground); border-color: var(--accent);\r
}\r
.modal-footer .btn-primary:hover { background: var(--accent-hover); }\r
\r
.settings-section-title {\r
  font-size: 12px; font-weight: 600; color: var(--text-soft); margin-bottom: 8px;\r
}\r
.settings-providers {\r
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;\r
}\r
.settings-provider-row {\r
  display: flex; gap: 6px; flex-wrap: wrap;\r
}\r
.settings-provider-btn {\r
  padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px;\r
  background: var(--bg-muted); color: var(--text); border: 1px solid var(--border);\r
  cursor: pointer; white-space: nowrap;\r
}\r
.settings-provider-btn:hover { background: var(--bg-hover); }\r
.settings-form-group { margin-bottom: 14px; }\r
.settings-label {\r
  display: block; font-size: 12px; font-weight: 500; color: var(--text-soft);\r
  margin-bottom: 6px;\r
}\r
.settings-input {\r
  width: 100%; padding: 8px 12px; background: var(--input); border: 1px solid var(--border);\r
  border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;\r
}\r
.settings-input:focus { border-color: var(--accent); }\r
.settings-row {\r
  display: flex; gap: 8px; align-items: center; margin-bottom: 14px;\r
}\r
.settings-row .settings-input { flex: 1; }\r
.settings-row button {\r
  padding: 6px 12px; border-radius: var(--radius-sm); font-size: 11px;\r
  font-weight: 500; border: 1px solid var(--border); cursor: pointer;\r
  background: transparent; color: var(--text-soft); white-space: nowrap;\r
}\r
.settings-row button:hover { background: var(--bg-hover); color: var(--text); }\r
.settings-hint {\r
  font-size: 11px; color: var(--muted); margin-top: 4px;\r
}\r
.settings-toggle-row {\r
  display: flex; align-items: center; gap: 8px;\r
  padding: 10px 14px; background: var(--bg-muted); border-radius: var(--radius-md);\r
  cursor: pointer;\r
}\r
.settings-toggle-row input { accent-color: var(--accent); }\r
.settings-toggle-row span { font-size: 14px; font-weight: 500; }\r
.settings-toggle-row .count { font-size: 12px; color: var(--muted); }\r
\r
.tool-toggle-row {\r
  display: flex; align-items: center; justify-content: space-between;\r
  padding: 10px 0; border-bottom: 1px solid var(--border);\r
}\r
.tool-toggle-row:last-of-type { border-bottom: none; }\r
.tool-toggle-label {\r
  font-size: 13px; font-weight: 500; color: var(--text);\r
}\r
.tool-toggle-desc {\r
  font-size: 11px; color: var(--text-soft);\r
}\r
.tool-toggle-hint {\r
  font-size: 11px; color: var(--muted); margin-top: 4px;\r
}\r
\r
.persona-radio-group { margin-bottom: 10px; }\r
.persona-radio {\r
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;\r
  cursor: pointer;\r
}\r
.persona-radio input { accent-color: var(--accent); }\r
.persona-radio label { font-size: 13px; color: var(--text); }\r
.persona-radio .hint { font-size: 11px; color: var(--text-soft); }\r
.persona-textarea {\r
  width: 100%; padding: 6px 10px; background: var(--input); border: 1px solid var(--border);\r
  border-radius: var(--radius-sm); color: var(--text); font-size: 13px; outline: none;\r
  resize: none; height: 48px;\r
}\r
.persona-textarea:focus { border-color: var(--accent); }\r
.persona-compact { margin-bottom: 10px; }\r
\r
.kb-header {\r
  display: flex; justify-content: space-between; align-items: center;\r
  margin-bottom: 12px;\r
}\r
.kb-header .desc { font-size: 12px; color: var(--text-soft); }\r
.kb-add-btn {\r
  padding: 4px 14px; border-radius: var(--radius-sm); font-size: 12px;\r
  font-weight: 600; background: var(--accent); color: var(--accent-foreground);\r
  border: none; cursor: pointer;\r
}\r
.kb-add-btn:hover { background: var(--accent-hover); }\r
.kb-empty {\r
  padding: 24px; text-align: center; color: var(--muted);\r
  background: var(--bg-muted); border-radius: var(--radius-md);\r
}\r
.kb-empty-icon { font-size: 24px; margin-bottom: 4px; }\r
`;var Ca=Object.defineProperty,ke=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ca(e,t,i),i};const Kt=class Kt extends C{constructor(){super(...arguments),this.title="",this.subtitle=`${s("hermesMemory.path","~/.hermes/memories/")} · 3 ${s("hermesMemory.files","个文件")}`,this._memories={memory:{content:"",words:0,mtime:null},user:{content:"",words:0,mtime:null},soul:{content:"",words:0,mtime:null}},this._editing=null,this._editContent="",this._msg="",this._msgOk=!1,this._saving=!1,this._sections=[{key:"memory",labelKey:"hermesMemory.memoryLabel",titleKey:"hermesMemory.memory",descKey:"hermesMemory.memoryDesc",placeholderKey:"hermesMemory.memoryPlaceholder",placeholderDescKey:"hermesMemory.memoryPlaceholderDesc"},{key:"user",labelKey:"hermesMemory.userLabel",titleKey:"hermesMemory.user",descKey:"hermesMemory.userDesc",placeholderKey:"hermesMemory.userPlaceholder",placeholderDescKey:"hermesMemory.userPlaceholderDesc"},{key:"soul",labelKey:"hermesMemory.soulLabel",titleKey:"hermesMemory.soul",descKey:"hermesMemory.soulDesc",placeholderKey:"hermesMemory.soulPlaceholder",placeholderDescKey:"hermesMemory.soulPlaceholderDesc"}]}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._load()}async _load(){var e,t;this._msg="";try{const a=await fetch(`${this._sidecarBase}/api/hermes/memories`,{headers:x()});if(!a.ok)throw new Error(`HTTP ${a.status}`);const i=await a.json(),o={};for(const n of["memory","user","soul"]){const c=String(((e=i[n])==null?void 0:e.content)??"");o[n]={content:c,words:c.trim()?c.trim().split(/\s+/).length:0,mtime:((t=i[n])==null?void 0:t.mtime)??null}}this._memories=o}catch(a){this._msg=`✗ ${a instanceof Error?a.message:String(a)}`,this._msgOk=!1}}get _totalFiles(){return 3}get _filledCount(){return Object.values(this._memories).filter(e=>e.content.trim()).length}get _totalWords(){return Object.values(this._memories).reduce((e,t)=>e+t.words,0)}_startEdit(e){this._editing=e,this._editContent=this._memories[e].content}_saveEdit(){if(!this._editing||this._saving)return;const e=this._editing,t=this._editContent,a=t.trim()?t.trim().split(/\s+/).length:0;this._memories={...this._memories,[e]:{content:t,words:a,mtime:new Date().toISOString()}},this._editing=null,this._editContent="",this._saving=!0,this._msg="",fetch(`${this._sidecarBase}/api/hermes/memories`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({key:e,content:t})}).then(i=>{if(!i.ok)throw new Error(`HTTP ${i.status}`);this._msg=`✓ ${s("hermesMemory.savedNote")}`,this._msgOk=!0}).catch(i=>{this._msg=`✗ ${i instanceof Error?i.message:String(i)}`,this._msgOk=!1}).finally(()=>{this._saving=!1})}render(){const e=`${this._filledCount}/${this._totalFiles}`;return r`
      <page-header title=${this.title} subtitle=${this.subtitle}>
        <button style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);" @click=${()=>this._load()}>
          ${s("common.refresh","刷新")}
        </button>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <!-- Hero + Stats -->
        <div class="hm-hero">
          <div>
            <div class="hm-hero__label">${s("hermesMemory.memoryLabel","MEMORY")}</div>
            <div class="hm-hero__title">${s("hermesMemory.heroTitle","三份 Markdown，组成 Agent 的长期上下文")}</div>
            <div class="hm-hero__desc">${s("hermesMemory.heroDesc","笔记记录事实，用户画像沉淀偏好，灵魂档案塑造人格。Hermes 会在会话中持续读取这些长期记忆。")}</div>
          </div>
          <div class="hm-stats">
            <div class="hm-stat">
              <div class="hm-stat__label">${s("hermesMemory.memoryFiles","记忆文件")}</div>
              <div class="hm-stat__value">${this._totalFiles}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${s("hermesMemory.filled","已填写")}</div>
              <div class="hm-stat__value">${e}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${s("hermesMemory.totalWords","总词数")}</div>
              <div class="hm-stat__value">${this._totalWords}</div>
            </div>
            <div class="hm-stat">
              <div class="hm-stat__label">${s("hermesMemory.lastUpdated","最近更新")}</div>
              <div class="hm-stat__value">${(()=>{const t=Object.values(this._memories).map(a=>a.mtime).filter(Boolean);return t.length?new Date(t.sort().reverse()[0]).toLocaleString(void 0,{dateStyle:"medium",timeStyle:"short"}):"—"})()}</div>
            </div>
          </div>
        </div>

        ${this._msg?r`
          <div style="margin:0 0 12px;padding:8px 12px;border-radius:var(--radius-md);font-size:12px;border:1px solid ${this._msgOk?"var(--success)":"var(--danger)"};color:${this._msgOk?"var(--success)":"var(--danger)"};">
            ${this._msg}
          </div>
        `:""}

        <!-- Memory sections -->
        ${this._sections.map(t=>{const a=this._memories[t.key],i=this._editing===t.key;return r`
            <div class="hm-card">
              <div class="hm-card__header">
                <div class="hm-card__title">
                  ${t.key==="memory"?v["scroll-text"]:t.key==="user"?v.users:v.sparkles}
                  ${s(t.titleKey)}
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                  <span class="hm-card__meta">${a.words} ${s("hermesMemory.words","词")} · ${a.content.length} ${s("hermesMemory.chars","字符")}</span>
                  <button class="hm-card__edit" @click=${()=>i?this._saveEdit():this._startEdit(t.key)}>
                    ${v.edit} ${i?s("common.save","保存"):s("hermesMemory.edit","编辑")}
                  </button>
                </div>
              </div>

              <div class="hm-card__section-label">${s(t.labelKey)}</div>
              <div class="hm-card__desc">${s(t.descKey)}</div>

              ${i?r`
                <textarea class="config-editor" style="min-height:100px;"
                  .value=${this._editContent}
                  @input=${o=>{this._editContent=o.target.value}}
                  placeholder=${s(t.placeholderDescKey)}
                ></textarea>
              `:r`
                <div class="hm-card__content">
                  ${a.content.trim()?a.content:r`
                    <div class="placeholder-title">${s(t.placeholderKey,"暂无内容")}</div>
                    <div>${s(t.placeholderDescKey)}</div>
                  `}
                </div>
              `}
            </div>
          `})}
      </div>
    `}};Kt.styles=A`
    :host { display: block; }
    ${ve(Ee)}

    .hm-hero {
      background: var(--accent-subtle); border: 1px solid var(--accent);
      border-radius: var(--radius-lg); padding: 24px 28px; margin-bottom: 20px;
      display: flex; justify-content: space-between; align-items: center; gap: 20px;
    }
    .hm-hero__label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 8px;
    }
    .hm-hero__title {
      font-size: 22px; font-weight: 700; color: var(--text-strong); margin-bottom: 8px;
    }
    .hm-hero__desc {
      font-size: 13px; color: var(--text-soft); line-height: 1.6;
    }
    .hm-stats {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0;
      border: 1px solid var(--border); border-radius: var(--radius-md);
      background: var(--card); min-width: 220px; flex-shrink: 0;
    }
    .hm-stat {
      padding: 10px 16px; border-bottom: 1px solid var(--border);
    }
    .hm-stat:nth-child(odd) { border-right: 1px solid var(--border); }
    .hm-stat:nth-child(n+3) { border-bottom: none; }
    .hm-stat__label { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
    .hm-stat__value { font-size: 18px; font-weight: 700; color: var(--text-strong); }

    .hm-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 16px;
      box-shadow: var(--shadow-card);
    }
    .hm-card__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .hm-card__title {
      display: flex; align-items: center; gap: 8px;
      font-size: 15px; font-weight: 600; color: var(--text-strong);
    }
    .hm-card__meta { font-size: 12px; color: var(--muted); }
    .hm-card__edit {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .hm-card__edit:hover { background: var(--bg-hover); color: var(--text); }
    .hm-card__section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: var(--accent); text-transform: uppercase; margin-bottom: 6px;
    }
    .hm-card__desc {
      font-size: 12px; color: var(--text-soft); margin-bottom: 14px;
    }
    .hm-card__content {
      background: var(--bg-muted); border: 1px dashed var(--border);
      border-radius: var(--radius-sm); padding: 16px 18px;
      font-size: 13px; color: var(--muted); line-height: 1.6;
    }
    .hm-card__content .placeholder-title {
      font-weight: 600; color: var(--text-soft); margin-bottom: 4px;
    }
  `;let ae=Kt;ke([m({type:String})],ae.prototype,"title");ke([m({type:String})],ae.prototype,"subtitle");ke([d()],ae.prototype,"_memories");ke([d()],ae.prototype,"_editing");ke([d()],ae.prototype,"_editContent");ke([d()],ae.prototype,"_msg");ke([d()],ae.prototype,"_msgOk");ke([d()],ae.prototype,"_saving");customElements.define("hermes-memory-page",ae);var Sa=Object.defineProperty,K=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Sa(e,t,i),i};const Ft=class Ft extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this.onNavigate=()=>{},this._online=!1,this._pid=null,this._installed=!1,this._port=8642,this._homeDir="",this._version="",this._platform="",this._modelName="",this._provider="",this._baseUrl="",this._maskedKey="",this._hasKey=!1,this._busy=!1,this._notice="",this._noticeKind="",this._unsubI18n=null}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._unsubI18n=V.subscribe(()=>this.requestUpdate()),this._loadAll()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this)}async _loadAll(){await Promise.all([this._loadStatus(),this._loadModel()])}async _loadStatus(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/status`);if(!e.ok)return;const t=await e.json();this._online=!!t.online,this._pid=t.pid??null,this._port=t.port||8642,this._installed=!!t.installed,this._homeDir=t.homeDir||"",this._version=t.version||"",this._platform=t.platform||""}catch{}}async _loadModel(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/model`);if(!e.ok)return;const t=await e.json();this._modelName=t.name||"",this._provider=t.provider||"",this._baseUrl=t.baseUrl||"",this._maskedKey=t.apiKey||"",this._hasKey=!!t.hasKey}catch{}}async _action(e){this._busy=!0,this._notice=s("hermesService.operating"),this._noticeKind="";try{const a=await(await fetch(`${this._sidecarBase}/api/hermes/${e}`,{method:"POST"})).json(),i=a.started||a.stopped||a.restarted;this._notice=a.message||(i?"✓":"✗"),this._noticeKind=i?"ok":"err"}catch{this._notice=`✗ ${s("hermesDashboard.sidecarOffline")}`,this._noticeKind="err"}this._busy=!1,await this._loadStatus()}render(){const t=`http://${window.location.hostname||"127.0.0.1"}:${this._port}`;return r`
      <div class="page-content" style="padding:24px 24px 0;">
        <a class="hs-back" @click=${()=>this.onNavigate("dashboard")}>
          ← ${s("hermesService.backToDashboard")}
        </a>
      </div>

      <page-header title=${this.title} subtitle=${this.subtitle}>
        <div style="display:flex;gap:8px;align-items:center;">
          ${this._online?r`
            <button ?disabled=${this._busy} @click=${()=>this._action("stop")}
              style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:1px solid rgba(239,68,68,0.3);cursor:pointer;background:transparent;color:var(--danger);">
              ${s("hermesService.stopGateway")}
            </button>
          `:r`
            <button ?disabled=${this._busy} @click=${()=>this._action("start")}
              style="padding:6px 16px;border-radius:var(--radius-sm);font-size:12px;font-weight:600;border:none;cursor:pointer;background:var(--accent);color:var(--accent-foreground);display:inline-flex;align-items:center;gap:6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              ${s("hermesService.startGateway")}
            </button>
          `}
          <button @click=${()=>this._loadAll()}
            style="padding:5px 14px;border-radius:var(--radius-sm);font-size:12px;font-weight:500;border:1px solid var(--border);cursor:pointer;background:transparent;color:var(--text-soft);">
            ${s("common.refresh")}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        ${this._notice?r`<div class="hs-notice ${this._noticeKind}">${this._notice}</div>`:""}

        <!-- Status row -->
        <div class="hs-status-row">
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:${this._installed?"var(--success)":"var(--danger)"};">${s("hermesService.installStatus")}</div>
            <div class="hs-status-card__value">${this._installed?s("hermesService.installed"):s("hermesService.notInstalled")}</div>
            <div class="hs-status-card__sub">${this._installed?s("hermesService.portablePython"):s("hermesService.needBootstrap")}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:${this._online?"var(--success)":"var(--danger)"};">${s("hermesService.gatewayStatus")}</div>
            <div class="hs-status-card__value">${this._online?s("hermesService.running"):s("hermesService.stopped")}</div>
            <div class="hs-status-card__sub">:${this._port}${this._pid?` · ${s("hermesService.pid")} ${this._pid}`:""}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--warn);">${s("hermesService.currentModel")}</div>
            <div class="hs-status-card__value" style="font-size:${this._modelName?"15px":"20px"};">${this._modelName||s("hermesService.notConfigured")}</div>
            <div class="hs-status-card__sub">${this._hasKey?s("hermesService.keyOk"):s("hermesService.keyNone")}</div>
          </div>
          <div class="hs-status-card">
            <div class="hs-status-card__label" style="color:var(--accent);">${s("hermesService.connectionTarget")}</div>
            <div class="hs-status-card__value">${s("hermesService.local")}</div>
            <div class="hs-status-card__sub">${t}</div>
          </div>
        </div>

        <!-- Install status + Hermes config -->
        <div class="hs-grid">
          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              ${s("hermesService.installStatus")}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.version")}</span>
                <span class="hs-info-row__value">${this._version?`v${this._version}`:"—"}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.installMethod")}</span>
                <span class="hs-info-row__value">${s("hermesService.portablePython")}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.cliPath")}</span>
                <span class="hs-info-row__value mono">engines\\hermes\\hermes_cli</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.homeDir")}</span>
                <span class="hs-info-row__value mono">${this._homeDir||"runtime\\hermes-home"}</span>
              </div>
              <div class="hs-info-row" style="border-bottom:none;">
                <span class="hs-info-row__label">${s("hermesService.keyConfigFiles")}</span>
                <span></span>
              </div>
              <div class="hs-file-tags">
                <span class="hs-file-tag">config.yaml</span>
                <span class="hs-file-tag">.env</span>
              </div>
            </div>
          </div>

          <div class="hs-card">
            <div class="hs-card__header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              ${s("hermesService.hermesConfig")}
            </div>
            <div class="hs-card__body">
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.llmProvider")}</span>
                <span class="hs-info-row__value">${this._provider||s("hermesService.unknown")}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.model")}</span>
                <span class="hs-info-row__value">${this._modelName||s("hermesService.notConfigured")}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">${s("hermesService.customApiAddr")}</span>
                <span class="hs-info-row__value mono">${this._baseUrl||s("hermesService.notSet")}</span>
              </div>
              <div class="hs-info-row">
                <span class="hs-info-row__label">API Key</span>
                <span class="hs-info-row__value mono">${this._maskedKey||s("hermesService.notSet")}</span>
              </div>
              <div class="hs-config-links">
                <button @click=${()=>this.onNavigate("dashboard")}>${s("hermesService.openConfig")}</button>
                <button @click=${()=>this.onNavigate("hermes-env")}>${s("hermesService.openEnv")}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Check -->
        <div class="hs-card" style="margin-bottom:16px;">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            ${s("hermesService.healthCheck")}
            <span style="margin-left:auto;font-size:12px;padding:3px 12px;border-radius:var(--radius-full);border:1px solid var(--border);color:${this._online?"var(--success)":"var(--text-soft)"};">
              ${this._online?s("hermesService.healthy"):s("hermesService.stopped")}
            </span>
          </div>
          <div class="hs-card__body">
            ${this._online?r`
              <div style="font-size:13px;color:var(--text);display:flex;flex-direction:column;gap:6px;">
                <div>${s("hermesService.platform")}: <span style="font-family:var(--font-mono);">${this._platform||"hermes-agent"}</span></div>
                <div>${s("hermesService.version")}: <span style="font-family:var(--font-mono);">${this._version?`v${this._version}`:"—"}</span></div>
                <div>${s("hermesService.pid")}: <span style="font-family:var(--font-mono);">${this._pid??"—"}</span></div>
                <div>API: <span style="font-family:var(--font-mono);">${t}</span></div>
              </div>
            `:r`
              <div style="font-size:13px;color:var(--text-soft);font-style:italic;">
                ${s("hermesService.healthCheckMsg")}
              </div>
            `}
          </div>
        </div>

        <!-- Maintenance Operations -->
        <div class="hs-card">
          <div class="hs-card__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${s("hermesService.maintenanceOps")}
          </div>
          <div class="hs-card__body">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
              <button class="hs-maint-btn hs-maint-btn--primary" ?disabled=${this._busy||this._online} @click=${()=>this._action("start")}>
                ${s("hermesService.startGateway")}
              </button>
              <button class="hs-maint-btn" ?disabled=${this._busy||!this._online} @click=${()=>this._action("restart")}>
                ${s("hermesService.restartGateway")}
              </button>
              <button class="hs-maint-btn hs-maint-btn--danger" ?disabled=${this._busy||!this._online} @click=${()=>this._action("stop")}>
                ${s("hermesService.stopGateway")}
              </button>
            </div>
            <div style="display:flex;gap:16px;">
              <a class="hs-link" @click=${()=>this.onNavigate("logs")}>${s("hermesService.openLogs")}</a>
              <a class="hs-link" @click=${()=>this.onNavigate("dashboard")}>${s("hermesService.openConfig")}</a>
            </div>
          </div>
        </div>
      </div>
    `}};Ft.styles=A`
    :host { display: block; }
    ${ve(Ee)}

    .hs-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hs-back:hover { text-decoration: underline; }

    .hs-status-row {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    @media (max-width: 768px) { .hs-status-row { grid-template-columns: repeat(2, 1fr); } }
    .hs-status-card { padding: 20px; border-right: 1px solid var(--border); }
    .hs-status-card:last-child { border-right: none; }
    .hs-status-card__label { font-size: 11px; font-weight: 600; margin-bottom: 8px; }
    .hs-status-card__value { font-size: 20px; font-weight: 700; color: var(--text-strong); margin-bottom: 4px; }
    .hs-status-card__sub { font-size: 11px; color: var(--muted); }

    .hs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    @media (max-width: 900px) { .hs-grid { grid-template-columns: 1fr; } }

    .hs-card {
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hs-card__header {
      display: flex; align-items: center; gap: 8px;
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .hs-card__header svg { color: var(--accent); }
    .hs-card__body { padding: 16px 20px; }

    .hs-info-row {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 8px 0; border-bottom: 1px solid var(--border);
    }
    .hs-info-row:last-child { border-bottom: none; }
    .hs-info-row__label { font-size: 12px; color: var(--text-soft); flex-shrink: 0; }
    .hs-info-row__value {
      font-size: 12px; color: var(--text); text-align: right;
      word-break: break-all; max-width: 60%;
    }
    .hs-info-row__value.mono { font-family: var(--font-mono); font-size: 11px; }

    .hs-config-links { display: flex; gap: 8px; margin-top: 8px; }
    .hs-config-links button {
      padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hs-config-links button:hover { background: var(--bg-hover); color: var(--text); }

    .hs-file-tags { display: flex; gap: 6px; margin-top: 8px; }
    .hs-file-tag {
      padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px;
      background: var(--bg-muted); color: var(--text-soft); border: 1px solid var(--border);
    }

    .hs-notice {
      padding: 10px 14px; border-radius: var(--radius-md); font-size: 12px;
      margin-bottom: 16px; border: 1px solid var(--border); background: var(--bg-muted); color: var(--text-soft);
    }
    .hs-notice.ok { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.3); color: var(--success); }
    .hs-notice.err { background: var(--danger-subtle); border-color: rgba(239,68,68,0.3); color: var(--danger); }

    .hs-maint-btn {
      padding: 10px 16px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text); transition: all var(--duration-fast);
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .hs-maint-btn:hover:not(:disabled) { background: var(--bg-hover); }
    .hs-maint-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .hs-maint-btn--primary { background: var(--text-strong); color: var(--bg); border-color: var(--text-strong); }
    .hs-maint-btn--primary:hover:not(:disabled) { opacity: 0.9; }
    .hs-maint-btn--danger { color: var(--danger); border-color: rgba(239,68,68,0.3); }
    .hs-maint-btn--danger:hover:not(:disabled) { background: var(--danger-subtle); }
    .hs-link { font-size: 12px; color: var(--text-soft); cursor: pointer; text-decoration: none; }
    .hs-link:hover { color: var(--text); text-decoration: underline; }
  `;let H=Ft;K([m({type:String})],H.prototype,"title");K([m({type:String})],H.prototype,"subtitle");K([m({type:Function})],H.prototype,"onNavigate");K([d()],H.prototype,"_online");K([d()],H.prototype,"_pid");K([d()],H.prototype,"_installed");K([d()],H.prototype,"_port");K([d()],H.prototype,"_homeDir");K([d()],H.prototype,"_version");K([d()],H.prototype,"_platform");K([d()],H.prototype,"_modelName");K([d()],H.prototype,"_provider");K([d()],H.prototype,"_baseUrl");K([d()],H.prototype,"_maskedKey");K([d()],H.prototype,"_hasKey");K([d()],H.prototype,"_busy");K([d()],H.prototype,"_notice");K([d()],H.prototype,"_noticeKind");customElements.define("hermes-service-page",H);var Aa=Object.defineProperty,Te=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Aa(e,t,i),i};const Gt=class Gt extends C{constructor(){super(...arguments),this.title="",this.onNavigate=()=>{},this._variables=[],this._path="",this._busy=!1,this._saveMsg="",this._saveKind="",this._unsubI18n=null}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._unsubI18n=V.subscribe(()=>this.requestUpdate()),this._loadEnv()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this)}async _loadEnv(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/env`);if(!e.ok)return;const t=await e.json();this._variables=t.vars||[],this._path=t.path||"",this._saveMsg=""}catch{}}_setVar(e,t,a){const i=this._variables.map((o,n)=>n===e?{...o,[t]:a}:o);this._variables=i}_addVar(){this._variables=[...this._variables,{name:"",value:""}]}_removeVar(e){this._variables=this._variables.filter((t,a)=>a!==e)}async _save(){this._busy=!0,this._saveMsg="";try{const t=await(await fetch(`${this._sidecarBase}/api/hermes/env`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vars:this._variables})})).json();this._saveMsg=t.message||(t.success?"✓":"✗"),this._saveKind=t.success?"ok":"err"}catch{this._saveMsg=`✗ ${s("hermesDashboard.sidecarOffline")}`,this._saveKind="err"}this._busy=!1}render(){return r`
      <div class="page-content" style="padding:24px;">
        <a class="env-back" @click=${()=>this.onNavigate("dashboard")}>
          ← ${s("hermesEnv.backToDashboard")}
        </a>

        <div class="env-page-title">${s("hermesEnv.title")}</div>
        <div class="env-page-subtitle">${this._path||"runtime/hermes-home/.env"}</div>

        <!-- Notice -->
        <div class="env-notice">
          ${s("hermesEnv.notice")}
          <code>.env</code>
          ${s("hermesEnv.noticeCustom")}
        </div>

        <!-- .env section -->
        <div class="env-section">
          <div class="env-section__header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            .env
          </div>
          <div class="env-section__body">
            ${this._variables.length===0?r`
              <div class="env-empty">
                <div class="env-empty__title">${s("hermesEnv.noVars")}</div>
                <div class="env-empty__desc">${s("hermesEnv.clickAdd")}</div>
              </div>
            `:this._variables.map((e,t)=>r`
              <div class="env-var-row">
                <input class="env-var-name" .value=${e.name} placeholder=${s("hermesEnv.keyPlaceholder")}
                  @input=${a=>this._setVar(t,"name",a.target.value)} />
                <input class="env-var-value" .value=${e.value} placeholder=${s("hermesEnv.valuePlaceholder")}
                  @input=${a=>this._setVar(t,"value",a.target.value)} />
                <button class="env-var-remove" @click=${()=>this._removeVar(t)} title=${s("hermesEnv.remove")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `)}
          </div>
          <div class="env-actions">
            <div class="env-actions__left">
              <button class="env-add-btn" @click=${this._addVar}>+ ${s("hermesEnv.addVar")}</button>
              <span class="env-hint">${s("hermesEnv.changesHint")}</span>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              ${this._saveMsg?r`<span class="env-msg ${this._saveKind}">${this._saveMsg}</span>`:""}
              <button class="env-save-btn" ?disabled=${this._busy} @click=${this._save}>${s("common.save")}</button>
            </div>
          </div>
        </div>
      </div>
    `}};Gt.styles=A`
    :host { display: block; }
    ${ve(Ee)}

    .env-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .env-back:hover { text-decoration: underline; }

    .env-page-title { font-size: 28px; font-weight: 700; color: var(--text-strong); letter-spacing: -0.02em; margin-bottom: 4px; }
    .env-page-subtitle { font-size: 12px; color: var(--muted); font-family: var(--font-mono); margin-bottom: 24px; }

    .env-notice {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px 20px;
      font-size: 13px; color: var(--text-soft); line-height: 1.7; margin-bottom: 16px;
    }
    .env-notice code {
      font-family: var(--font-mono); font-size: 11px;
      background: var(--bg-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--text);
    }

    .env-section {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden; margin-bottom: 16px;
    }
    .env-section__header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
      font-size: 14px; font-weight: 600; color: var(--text-strong);
    }
    .env-section__header svg { color: var(--accent); }
    .env-section__body { padding: 20px; }

    .env-empty { text-align: center; padding: 32px 16px; color: var(--muted); }
    .env-empty__title { font-size: 13px; margin-bottom: 4px; }
    .env-empty__desc { font-size: 12px; }

    .env-actions {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-top: 1px solid var(--border); gap: 12px;
    }
    .env-actions__left { display: flex; align-items: center; gap: 12px; }
    .env-add-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
      display: inline-flex; align-items: center; gap: 6px;
    }
    .env-add-btn:hover { background: var(--accent-hover); }
    .env-save-btn {
      padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
      font-weight: 600; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text);
    }
    .env-save-btn:hover { background: var(--bg-hover); }
    .env-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .env-hint { font-size: 11px; color: var(--muted); }
    .env-msg { font-size: 12px; }
    .env-msg.ok { color: var(--success); }
    .env-msg.err { color: var(--danger); }

    .env-var-row { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .env-var-row:last-child { border-bottom: none; }
    .env-var-name {
      width: 240px; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono); outline: none;
    }
    .env-var-name:focus { border-color: var(--accent); }
    .env-var-value {
      flex: 1; padding: 6px 10px; background: var(--input);
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      color: var(--text); font-size: 12px; font-family: var(--font-mono); outline: none;
    }
    .env-var-value:focus { border-color: var(--accent); }
    .env-var-remove {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm); color: var(--muted); cursor: pointer;
    }
    .env-var-remove:hover { background: var(--danger-subtle); color: var(--danger); }
  `;let pe=Gt;Te([m({type:String})],pe.prototype,"title");Te([m({type:Function})],pe.prototype,"onNavigate");Te([d()],pe.prototype,"_variables");Te([d()],pe.prototype,"_path");Te([d()],pe.prototype,"_busy");Te([d()],pe.prototype,"_saveMsg");Te([d()],pe.prototype,"_saveKind");customElements.define("hermes-env-page",pe);var Ma=Object.defineProperty,Le=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ma(e,t,i),i};const Wt=class Wt extends C{constructor(){super(...arguments),this.onNavigate=()=>{},this._configContent="",this._path="",this._busy=!1,this._saveMsg="",this._saveKind="",this._unsubI18n=null}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._unsubI18n=V.subscribe(()=>this.requestUpdate()),this._loadConfig()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this)}async _loadConfig(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/config`,{headers:x()});if(!e.ok)return;const t=await e.json();this._configContent=t.content||"",this._path=t.path||"",this._saveMsg=""}catch{}}async _save(){this._busy=!0,this._saveMsg="";try{const t=await(await fetch(`${this._sidecarBase}/api/hermes/config`,{method:"POST",headers:x({"Content-Type":"application/json"}),body:JSON.stringify({content:this._configContent})})).json();this._saveMsg=t.message||(t.success?"✓":"✗"),this._saveKind=t.success?"ok":"err"}catch{this._saveMsg=`✗ ${s("hermesDashboard.sidecarOffline")}`,this._saveKind="err"}this._busy=!1}render(){return r`
      <div class="page-content" style="padding:24px 24px 0;">
        <a class="hc-back" @click=${()=>this.onNavigate("hermes-service")}>
          ← ${s("hermesConfig.backToService")}
        </a>
      </div>

      <page-header
        title=${s("hermesConfig.title")}
        subtitle=${this._path||"config.yaml"}
      >
        <div class="hc-header-actions">
          <button class="hc-btn-ghost" @click=${()=>this._loadConfig()}>${s("hermesConfig.reload")}</button>
          <button class="hc-btn-primary" ?disabled=${this._busy} @click=${this._save}>${s("hermesConfig.saveConfig")}</button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        ${this._saveMsg?r`<div class="hc-msg ${this._saveKind}">${this._saveMsg}</div>`:""}
        <div class="hc-editor-card">
          <div class="hc-editor-header">
            <span class="hc-editor-filename">config.yaml</span>
            <span class="hc-editor-link">${s("hermesConfig.rawEditorHint")}</span>
          </div>
          <textarea class="hc-editor-textarea"
            .value=${this._configContent}
            @input=${e=>{this._configContent=e.target.value}}
          ></textarea>
        </div>
      </div>
    `}};Wt.styles=A`
    :host { display: block; }
    ${ve(Ee)}

    .hc-back {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--accent); cursor: pointer;
      margin-bottom: 8px; text-decoration: none;
    }
    .hc-back:hover { text-decoration: underline; }

    .hc-header-actions { display: flex; gap: 8px; align-items: center; }
    .hc-btn-ghost {
      padding: 6px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
    }
    .hc-btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
    .hc-btn-primary {
      padding: 6px 16px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 600; border: none; cursor: pointer;
      background: var(--accent); color: var(--accent-foreground);
    }
    .hc-btn-primary:hover { background: var(--accent-hover); }
    .hc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .hc-msg { font-size: 12px; margin-bottom: 12px; }
    .hc-msg.ok { color: var(--success); }
    .hc-msg.err { color: var(--danger); }

    .hc-editor-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hc-editor-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
    }
    .hc-editor-filename { font-size: 14px; font-weight: 600; color: var(--text-strong); }
    .hc-editor-link { font-size: 11px; color: var(--muted); font-family: var(--font-mono); }
    .hc-editor-textarea {
      width: 100%; min-height: 500px; padding: 16px 20px;
      background: var(--bg); border: none; resize: vertical;
      font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
      color: var(--text); outline: none;
    }
    .hc-editor-textarea:focus { background: var(--bg-elevated); }
  `;let me=Wt;Le([m({type:Function})],me.prototype,"onNavigate");Le([d()],me.prototype,"_configContent");Le([d()],me.prototype,"_path");Le([d()],me.prototype,"_busy");Le([d()],me.prototype,"_saveMsg");Le([d()],me.prototype,"_saveKind");customElements.define("hermes-config-page",me);var Ta=Object.defineProperty,$e=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ta(e,t,i),i};const Vt=class Vt extends C{constructor(){super(...arguments),this.onNavigate=()=>{},this._logFiles=[],this._activeFile="",this._logLines=[],this._level="ALL",this._lines="200",this._search="",this._loading=!1,this._unsubI18n=null}get _sidecarBase(){return`http://${window.location.hostname||"127.0.0.1"}:7889`}connectedCallback(){super.connectedCallback(),this._unsubI18n=V.subscribe(()=>this.requestUpdate()),this._loadFiles()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this)}async _loadFiles(){try{const e=await fetch(`${this._sidecarBase}/api/hermes/logs`);if(!e.ok)return;const t=await e.json();this._logFiles=t.files||[],!this._activeFile&&this._logFiles.length&&(this._activeFile=this._logFiles[0].name),this._activeFile&&await this._loadContent()}catch{}}async _loadContent(){if(this._activeFile){this._loading=!0;try{const e=await fetch(`${this._sidecarBase}/api/hermes/logs/content?file=${encodeURIComponent(this._activeFile)}&lines=${this._lines}`);if(e.ok){const t=await e.json();this._logLines=t.lines||[]}}catch{}this._loading=!1}}_selectFile(e){this._activeFile=e,this._loadContent()}_fmtSize(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KB`:`${(e/1024/1024).toFixed(1)} MB`}_lineClass(e){return/\bERROR\b|Traceback|Exception/i.test(e)?"err":/\bWARN(?:ING)?\b/i.test(e)?"warn":""}get _filteredLines(){let e=this._logLines;if(this._level!=="ALL"&&(e=e.filter(t=>t.includes(this._level))),this._search){const t=this._search.toLowerCase();e=e.filter(a=>a.toLowerCase().includes(t))}return e}render(){const e=this._filteredLines;return r`
      <page-header
        title=${s("hermesLogs.title")}
        subtitle=${"runtime/logs · runtime/hermes-home/logs"}
      >
        <div class="hl-header-actions">
          <button class="hl-action-btn" @click=${()=>this._loadFiles()}>
            ${v["refresh-cw"]}
            ${s("hermesLogs.refresh")}
          </button>
        </div>
      </page-header>

      <div class="page-content" style="padding:0 24px 24px;">
        <div class="hl-layout">
          <!-- File list -->
          <div class="hl-file-list">
            <div class="hl-file-list__title">${s("hermesLogs.logFiles")}</div>
            ${this._logFiles.length===0?r`<div style="font-size:12px;color:var(--muted);">${s("hermesLogs.noLogFiles")}</div>`:this._logFiles.map(t=>r`
                <div class="hl-file-item ${this._activeFile===t.name?"active":""}"
                     @click=${()=>this._selectFile(t.name)}>
                  <div class="hl-file-item__name">${t.name}</div>
                  <div class="hl-file-item__size">${this._fmtSize(t.size)}</div>
                </div>
              `)}
          </div>

          <!-- Log viewer -->
          <div class="hl-viewer">
            <div class="hl-toolbar">
              <div>
                <div class="hl-toolbar-label">${s("hermesLogs.level")}</div>
                <select .value=${this._level} @change=${t=>{this._level=t.target.value}}>
                  <option value="ALL">ALL</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${s("hermesLogs.lines")}</div>
                <select .value=${this._lines} @change=${t=>{this._lines=t.target.value,this._loadContent()}}>
                  <option value="100">100 行</option>
                  <option value="200">200 行</option>
                  <option value="500">500 行</option>
                  <option value="1000">1000 行</option>
                </select>
              </div>
              <div>
                <div class="hl-toolbar-label">${s("hermesLogs.search")}</div>
                <input type="text" .value=${this._search}
                  placeholder=${s("hermesLogs.searchPlaceholder")}
                  @input=${t=>{this._search=t.target.value}} />
              </div>
              <button class="hl-clear-btn" @click=${()=>{this._search=""}} title=${s("hermesLogs.clear")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="hl-count">
              ${this._loading?"…":`${e.length} / ${this._logLines.length} ${s("hermesLogs.records")}`}
              ${this._activeFile?` · ${this._activeFile}`:""}
            </div>

            <div class="hl-log-body">
              ${e.length===0?r`<div class="hl-empty">${this._loading?s("common.loading"):s("hermesLogs.noContent")}</div>`:e.map(t=>r`<div class="hl-line ${this._lineClass(t)}">${t}</div>`)}
            </div>
          </div>
        </div>
      </div>
    `}};Vt.styles=A`
    :host { display: block; }
    ${ve(Ee)}

    .hl-header-actions { display: flex; gap: 8px; align-items: center; }
    .hl-action-btn {
      padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px;
      font-weight: 500; border: 1px solid var(--border); cursor: pointer;
      background: transparent; color: var(--text-soft); transition: all var(--duration-fast);
      display: inline-flex; align-items: center; gap: 4px;
    }
    .hl-action-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }

    .hl-file-list {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-card);
      align-self: start;
    }
    .hl-file-list__title { font-size: 13px; font-weight: 600; color: var(--text-strong); margin-bottom: 12px; }
    .hl-file-item {
      padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer;
      transition: background var(--duration-fast); margin-bottom: 2px;
    }
    .hl-file-item:hover { background: var(--bg-hover); }
    .hl-file-item.active { background: var(--accent-subtle); }
    .hl-file-item__name { font-size: 12px; font-weight: 600; color: var(--text); font-family: var(--font-mono); word-break: break-all; }
    .hl-file-item.active .hl-file-item__name { color: var(--accent); }
    .hl-file-item__size { font-size: 10px; color: var(--muted); }

    .hl-viewer {
      background: var(--card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden;
    }
    .hl-toolbar {
      display: grid; grid-template-columns: 100px 100px 1fr 32px;
      gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center;
    }
    .hl-toolbar-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .hl-toolbar select {
      padding: 5px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none;
    }
    .hl-toolbar select:focus { border-color: var(--accent); }
    .hl-toolbar input {
      width: 100%; padding: 5px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--input); color: var(--text); font-size: 12px; outline: none; font-family: var(--font-mono);
    }
    .hl-toolbar input:focus { border-color: var(--accent); }
    .hl-toolbar input::placeholder { color: var(--muted); }
    .hl-clear-btn {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; border-radius: var(--radius-sm); color: var(--muted); cursor: pointer;
    }
    .hl-clear-btn:hover { background: var(--bg-hover); color: var(--text); }

    .hl-count {
      padding: 6px 16px; font-size: 11px; color: var(--muted);
      border-bottom: 1px solid var(--border); background: var(--bg-muted);
    }

    .hl-log-body {
      max-height: 560px; overflow-y: auto; padding: 8px 0;
      font-family: var(--font-mono); font-size: 11.5px; line-height: 1.5;
    }
    .hl-line { padding: 1px 16px; white-space: pre-wrap; word-break: break-all; color: var(--text-soft); }
    .hl-line:hover { background: var(--bg-hover); }
    .hl-line.warn { color: var(--warn); }
    .hl-line.err { color: var(--danger); }
    .hl-empty { padding: 40px 16px; text-align: center; color: var(--muted); font-size: 13px; }
  `;let oe=Vt;$e([m({type:Function})],oe.prototype,"onNavigate");$e([d()],oe.prototype,"_logFiles");$e([d()],oe.prototype,"_activeFile");$e([d()],oe.prototype,"_logLines");$e([d()],oe.prototype,"_level");$e([d()],oe.prototype,"_lines");$e([d()],oe.prototype,"_search");$e([d()],oe.prototype,"_loading");customElements.define("hermes-logs-page",oe);const Da="openclaw.assistant.url";function it(){try{const e=localStorage.getItem(Da);if(e)return e.replace(/\/+$/,"")}catch{}return`http://${typeof window<"u"&&window.location.hostname||"127.0.0.1"}:8080`}async function ft(l){const e=await fetch(`${it()}${l}`);if(!e.ok)throw new Error(`${e.status}`);return await e.json()}async function Ts(l,e){const t=await fetch(`${it()}${l}`,{method:"POST",headers:{"Content-Type":"application/json"},body:e===void 0?void 0:JSON.stringify(e)});if(!t.ok){let a=`${t.status}`;try{const i=await t.json();i!=null&&i.error&&(a=String(i.error))}catch{}throw new Error(a)}return await t.json()}function Pa(){return ft("/api/status")}function Ia(l){return Ts("/api/config",l)}function za(l){if(!l)return"";const e=new Date(l),t=new Date,a=i=>String(i).padStart(2,"0");return e.toDateString()===t.toDateString()?`${a(e.getHours())}:${a(e.getMinutes())}`:`${e.getMonth()+1}/${e.getDate()}`}function Ds(l){return{id:l.id,title:l.title,preview:"",ts:za(l.updatedAt),pinned:!1,count:l.messageCount}}async function Oa(){return((await ft("/api/conversations")).conversations||[]).map(Ds)}async function Ea(){const l=await Ts("/api/conversations",{});return Ds(l)}async function La(l){return ft(`/api/conversations/${encodeURIComponent(l)}`)}async function Ba(l){await fetch(`${it()}/api/conversations/${encodeURIComponent(l)}`,{method:"DELETE"})}function Na(l,e,t){const a=new AbortController;return(async()=>{try{const i=await fetch(`${it()}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:l,content:e}),signal:a.signal});if(!i.ok||!i.body){t({type:"error",error:s("common.aiServiceError",{status:String(i.status)})}),t({type:"done"});return}const o=i.body.getReader(),n=new TextDecoder;let c="";for(;;){const{done:h,value:p}=await o.read();if(h)break;c+=n.decode(p,{stream:!0});const g=c.split(`
`);c=g.pop()||"";for(const u of g){const b=u.trim();if(!b.startsWith("data:"))continue;const S=b.slice(5).trim();if(S==="[DONE]")continue;let _;try{_=JSON.parse(S)}catch{continue}if(_.error)t({type:"error",error:String(_.error)});else if(_.meta){const T=_.meta;t({type:"meta",conversationId:String(T.conversationId??""),title:T.title!=null?String(T.title):void 0,created:T.created===!0,updatedAt:typeof T.updatedAt=="number"?T.updatedAt:void 0,messageCount:typeof T.messageCount=="number"?T.messageCount:void 0})}else _.tool&&_.ok===void 0?t({type:"tool-start",tool:String(_.tool),args:_.args||{}}):_.tool&&_.ok!==void 0?t({type:"tool-end",tool:String(_.tool),args:_.args||{},ok:_.ok===!0,result:String(_.result??"")}):_.content&&t({type:"content",content:String(_.content)})}}t({type:"done"})}catch(i){(i==null?void 0:i.name)!=="AbortError"&&t({type:"error",error:i instanceof Error?i.message:String(i)}),t({type:"done"})}})(),a}var Ra=Object.defineProperty,U=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ra(e,t,i),i};const Fe=l=>`${l.providerId}::${l.model}`,rt=l=>typeof l.command=="string"&&l.command?l.command:JSON.stringify(l),Jt=class Jt extends C{constructor(){super(...arguments),this.title="",this.subtitle="",this._view="home",this._showConvList=!1,this._settingsOpen=!1,this._input="",this._saved=!1,this._assistantOnline=!1,this._configured=!1,this._assistantModel="",this._models=[],this._selectedModelKey="",this._conversations=[],this._activeConv="",this._convSearch="",this._messages=[],this._streaming=!1,this._chatAbort=null,this._uploadedImage=null,this._functionCards=[{icon:"wrench",titleKey:"ai.checkConfig",descKey:"ai.checkConfigDesc"},{icon:"shield",titleKey:"ai.diagGateway",descKey:"ai.diagGatewayDesc"},{icon:"folder-open",titleKey:"ai.browseDir",descKey:"ai.browseDirDesc"},{icon:"monitor",titleKey:"ai.checkEnv",descKey:"ai.checkEnvDesc"},{icon:"scroll-text",titleKey:"ai.analyzeLogs",descKey:"ai.analyzeLogsDesc"},{icon:"refresh-cw",titleKey:"ai.oneClickFix",descKey:"ai.oneClickFixDesc"},{icon:"bug",titleKey:"ai.feedbackBug",descKey:"ai.feedbackBugDesc"},{icon:"zap",titleKey:"ai.prAssistant",descKey:"ai.prAssistantDesc"},{icon:"puzzle",titleKey:"ai.skillsMgmt",descKey:"ai.skillsMgmtDesc"}]}connectedCallback(){super.connectedCallback(),this._boot()}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._chatAbort)==null||e.abort()}async _boot(){this._models=Ne();const e=We();e&&(this._selectedModelKey=Fe(e));try{const t=await Pa();this._assistantOnline=!0,this._configured=t.hasKey,this._assistantModel=t.model}catch{this._assistantOnline=!1}await this._refreshConvs(),this._conversations.length&&await this._switchConv(this._conversations[0].id)}async _refreshConvs(){try{this._conversations=await Oa()}catch{}}_toggleConvList(){this._showConvList=!this._showConvList}async _newConversation(){var e;try{const t=await Ea();this._conversations=[t,...this._conversations],this._activeConv=t.id,this._messages=[],this._view="chat",this._showConvList=!1}catch(t){(e=this._toast)==null||e.show(t instanceof Error?t.message:String(t))}}async _switchConv(e){this._activeConv=e,this._showConvList=!1;try{const t=await La(e);this._messages=(t.messages||[]).map(a=>a.role==="user"?{role:"user",text:a.content,ts:""}:{role:"assistant",text:a.content,ts:"",tools:(a.toolCalls||[]).map(i=>({name:i.name,command:rt(i.args),ok:i.ok,result:i.result,running:!1}))})}catch{this._messages=[]}this._scrollChat()}async _deleteConv(e,t){var a;t.stopPropagation();try{await Ba(e)}catch{}this._conversations=this._conversations.filter(i=>i.id!==e),this._activeConv===e&&(this._activeConv=((a=this._conversations[0])==null?void 0:a.id)||"",this._messages=[])}get _filteredConvs(){if(!this._convSearch.trim())return this._conversations;const e=this._convSearch.toLowerCase();return this._conversations.filter(t=>t.title.toLowerCase().includes(e))}_send(){var i;const e=this._input.trim();if(!e||this._streaming)return;if(!this._assistantOnline){(i=this._toast)==null||i.show(s("ai.assistantOfflineHint"));return}const t=new Date().toLocaleTimeString();this._messages=[...this._messages,{role:"user",text:e,ts:t},{role:"assistant",text:"",ts:t,tools:[]}],this._input="",requestAnimationFrame(()=>{const o=this.querySelector(".ai-input__textarea");o&&(o.style.height="auto",o.style.paddingTop="8px",o.style.paddingBottom="8px")}),this._view!=="chat"&&(this._view="chat"),this._streaming=!0,this._scrollChat();const a=this._activeConv||null;this._chatAbort=Na(a,e,o=>this._onChatEvent(o))}_mutateLastAssistant(e){const t=[...this._messages];for(let a=t.length-1;a>=0;a--)if(t[a].role==="assistant"){t[a]=e(t[a]);break}this._messages=t}_onChatEvent(e){switch(e.type){case"meta":e.conversationId&&(this._activeConv=e.conversationId);break;case"tool-start":this._mutateLastAssistant(t=>({...t,tools:[...t.tools||[],{name:e.tool,command:rt(e.args),running:!0}]}));break;case"tool-end":this._mutateLastAssistant(t=>{const a=[...t.tools||[]],i=rt(e.args);for(let o=a.length-1;o>=0;o--)if(a[o].running&&a[o].command===i){a[o]={...a[o],ok:e.ok,result:e.result,running:!1};break}return{...t,tools:a}});break;case"content":this._mutateLastAssistant(t=>({...t,text:(t.text||"")+e.content}));break;case"error":this._mutateLastAssistant(t=>({...t,text:(t.text||"")+`
⚠️ ${e.error}`,error:!0}));break;case"done":this._streaming=!1,this._chatAbort=null,this._refreshConvs();break}this._scrollChat()}_onKeydown(e){e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),this._send())}_scrollChat(){requestAnimationFrame(()=>{const e=this.querySelector(".ai-chat__messages");e&&(e.scrollTop=e.scrollHeight)})}_openSettings(){if(this._models=Ne(),!this._selectedModelKey){const e=We();e&&(this._selectedModelKey=Fe(e))}this._settingsOpen=!0}_closeSettings(){this._settingsOpen=!1}async _saveSettings(){var t,a;const e=this._models.find(i=>Fe(i)===this._selectedModelKey);if(e)try{await Ia({baseUrl:e.baseUrl,apiKey:e.apiKey,model:e.model}),this._configured=!0,this._assistantModel=e.model,this._saved=!0,this._settingsOpen=!1,(t=this._toast)==null||t.show(s("ai.saved")),setTimeout(()=>{this._saved=!1,this.requestUpdate()},2e3)}catch(i){(a=this._toast)==null||a.show(i instanceof Error?i.message:String(i))}}_triggerFileInput(){this._fileInput&&this._fileInput.click()}_handleFileSelect(e){const t=e.target;if(t.files&&t.files[0]){const a=new FileReader;a.onload=i=>{var o;this._uploadedImage=(o=i.target)==null?void 0:o.result,this.requestUpdate()},a.readAsDataURL(t.files[0])}}render(){const e=this._showConvList?"280px":"0";return r`
      <!-- Toolbar -->
      <div class="ai-toolbar" style="margin-left:${e}; transition: margin-left var(--duration-normal) var(--ease-out);">
        <div class="ai-toolbar__title">
          <button class="ai-toolbar__menu" @click=${this._toggleConvList} title=${s("ai.convList")}>
            ${this._showConvList?v["panel-left-close"]:v.menu}
          </button>
          <span>${s("tabs.ai")}</span>
          ${this._assistantOnline?this._configured?"":r`<span class="ai-toolbar__badge">${s("ai.notConfigured")}</span>`:r`<span class="ai-toolbar__badge">${s("ai.statusOffline")}</span>`}
        </div>
        <div class="ai-toolbar__actions">
          <button class="btn-settings ${this._settingsOpen?"active":""}" @click=${this._openSettings}>${v.settings} ${s("ai.settings")}</button>
        </div>
      </div>

      <div class="ai-layout ${this._showConvList?"with-list":""}">
        <!-- 会话列表 -->
        <div class="ai-sidebar">
          <div class="ai-sidebar__header">
            <span class="ai-sidebar__title">${s("ai.convList")}</span>
            <div class="ai-sidebar__actions">
              <button title=${s("ai.newConv")} @click=${this._newConversation}>${v.plus}</button>
              <button @click=${this._toggleConvList}>${v.x}</button>
            </div>
          </div>
          <div class="ai-sidebar__search">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder=${s("ai.searchConv")} .value=${this._convSearch}
              @input=${t=>{this._convSearch=t.target.value,this.requestUpdate()}} />
          </div>
          <div class="ai-sidebar__list">
            ${this._filteredConvs.length===0?r`<div style="padding:20px 12px;color:var(--muted);font-size:13px;text-align:center;">${s("ai.newConv")}</div>`:this._filteredConvs.map(t=>r`
                <div class="ai-sidebar__item ${this._activeConv===t.id?"active":""}" @click=${()=>this._switchConv(t.id)}>
                  <div class="ai-sidebar__item-header">
                    <span class="ai-sidebar__item-title">${t.title}</span>
                    <button class="ai-sidebar__item-delete" @click=${a=>this._deleteConv(t.id,a)}>×</button>
                  </div>
                  <div class="ai-sidebar__item-preview">${t.count?`${t.count} ${s("ai.msgCount")}`:s("ai.newConv")}</div>
                  <div class="ai-sidebar__item-time">${t.ts}</div>
                </div>
              `)}
          </div>
        </div>

        <!-- Main -->
        <div class="ai-main" style="margin-left:${e}; transition: margin-left var(--duration-normal) var(--ease-out);">
          ${this._view==="chat"?this._renderChat():this._renderHome()}
        </div>
      </div>

      ${this._settingsOpen?this._renderSettingsModal():""}
      <oc-toast></oc-toast>
    `}_renderHome(){return r`
      <div class="ai-home">
        <div class="ai-home__welcome">
          <div class="ai-home__icon">✨</div>
          <div class="ai-home__title">${s("tabs.ai")}</div>
          <div class="ai-home__subtitle">${s("ai.greeting")}</div>
        </div>
        <div class="ai-home__tip">
          <span class="ai-home__tip-badge">${s("ai.builtInBadge")}</span>
          <div class="ai-home__tip-text">${s("ai.builtInDesc")}</div>
        </div>
        <div class="ai-home__grid">
          ${this._functionCards.map(e=>r`
            <div class="ai-home__card" @click=${()=>{this._input=s(e.descKey),this._view="chat"}}>
              <div class="ai-home__card-inner">
                <div class="ai-home__card-icon">${v[e.icon]||v.circle}</div>
                <div>
                  <div class="ai-home__card-title">${s(e.titleKey)}</div>
                  <div class="ai-home__card-desc">${s(e.descKey)}</div>
                </div>
              </div>
            </div>
          `)}
        </div>
        ${this._renderInput()}
      </div>
    `}_renderChat(){let e=-1;for(let t=this._messages.length-1;t>=0;t--)if(this._messages[t].role==="assistant"){e=t;break}return r`
      <div class="ai-chat">
        <div class="ai-chat__messages">
          ${this._messages.length===0?r`
            <div class="ai-chat__empty"><div class="ai-chat__empty-icon">💬</div><div>${s("ai.startChat")}</div></div>
          `:this._messages.map((t,a)=>{const i=a===e&&this._streaming;return r`
              <div class="ai-chat__msg ${t.role}">
                <div class="ai-chat__msg-avatar">${t.role==="user"?"U":"AI"}</div>
                <div class="ai-chat__msg-body">
                  <div class="ai-chat__msg-meta">${t.role==="user"?"You":"Assistant"}${t.ts?` · ${t.ts}`:""}</div>
                  ${t.tools&&t.tools.length?r`<div class="ai-chat__tools">${t.tools.map(o=>this._renderToolCard(o))}</div>`:""}
                  ${t.text?t.role==="assistant"&&!t.error?r`<div class="ai-chat__msg-md"><oc-markdown .text=${t.text}></oc-markdown>${i?r`<span class="ai-cursor">▋</span>`:""}</div>`:r`<div class="ai-chat__msg-text ${t.error?"is-error":""}">${t.text}${i?r`<span class="ai-cursor">▋</span>`:""}</div>`:i?r`<div class="ai-chat__msg-text ai-thinking">${s("ai.thinking")}<span class="ai-cursor">▋</span></div>`:""}
                </div>
              </div>`})}
        </div>
        ${this._renderInput()}
      </div>
    `}_renderToolCard(e){const t=e.running?"run":e.ok?"ok":"err";return r`
      <div class="ai-tool ${t}">
        <div class="ai-tool__head">
          <span class="ai-tool__name">⚙ ${e.name}</span>
          <code class="ai-tool__cmd">$ ${e.command}</code>
        </div>
        <pre class="ai-tool__out">${e.running?s("ai.cmdRunning"):(e.ok?"":"✗ ")+(e.result||s("ai.cmdNoOutput"))}</pre>
      </div>
    `}_renderSettingsModal(){return r`
      <div class="modal-overlay" @click=${e=>{e.target.classList.contains("modal-overlay")&&this._closeSettings()}}>
        <div class="modal-dialog">
          <div class="modal-header">${s("ai.settingsTitle")}</div>
          <div class="modal-body">
            <div class="settings-section-title">${s("ai.selectModel")}</div>
            <div class="settings-hint" style="margin-bottom:12px;">${s("ai.selectModelHint")}</div>
            ${this._models.length===0?r`
              <div class="ai-empty-models">
                <div style="font-weight:600;margin-bottom:6px;color:var(--text);">${s("ai.noModels")}</div>
                <div class="settings-hint">${s("ai.noModelsHint")}</div>
              </div>
            `:r`
              <div class="model-list">
                ${this._models.map(e=>{const t=Fe(e);return r`
                    <label class="model-row ${this._selectedModelKey===t?"selected":""}">
                      <input type="radio" name="ai-model" .checked=${this._selectedModelKey===t}
                        @change=${()=>{this._selectedModelKey=t,this.requestUpdate()}} />
                      <span class="model-provider">${e.providerName||e.providerId}</span>
                      <span class="model-id">${e.model}</span>
                      ${e.isPrimary?r`<span class="model-primary">★ ${s("ai.primaryTag")}</span>`:""}
                    </label>`})}
              </div>
            `}
            <div class="assistant-status-line">
              ${s("ai.assistantStatus")}：
              ${this._assistantOnline?this._configured?r`<span class="status-on">${s("ai.statusReady")} · ${this._assistantModel}</span>`:r`<span class="status-off">${s("ai.statusKeyMissing")}</span>`:r`<span class="status-off">${s("ai.statusOffline")}</span>`}
            </div>
          </div>
          <div class="modal-footer">
            <button @click=${this._closeSettings}>${s("ai.cancel")}</button>
            <button class="btn-primary" ?disabled=${this._models.length===0} @click=${this._saveSettings}>
              ${this._saved?"✓ "+s("ai.saved"):s("ai.save")}
            </button>
          </div>
        </div>
      </div>
    `}_renderInput(){return r`
      <div class="ai-input">
        ${this._uploadedImage?r`
          <div class="ai-input__image-preview">
            <img src=${this._uploadedImage} alt="preview" />
            <button class="ai-input__image-remove" @click=${()=>{this._uploadedImage=null}}>${v.x}</button>
          </div>
        `:""}
        <div class="ai-input__row ${this._uploadedImage?"has-image":""}">
          <input type="file" id="ai-file-input" accept="image/*" style="display:none" @change=${this._handleFileSelect} />
          <button class="ai-input__attach" title=${s("ai.attachTitle")} @click=${this._triggerFileInput}>${v.image}</button>
          <textarea class="ai-input__textarea" placeholder=${s("ai.placeholder")} .value=${this._input}
            @input=${e=>{const t=e.target;this._input=t.value,t.style.height="auto",t.style.height=t.scrollHeight+"px";const a=t.closest(".ai-input__row");if(a){const i=t.scrollHeight>36;a.style.alignItems=i?"end":"center",t.style.paddingTop=i?"4px":"8px",t.style.paddingBottom=i?"4px":"8px"}}}
            @keydown=${this._onKeydown}
          ></textarea>
          <button class="ai-input__send" @click=${this._send}>${v.send}</button>
        </div>
        <div class="ai-input__hint">${s("ai.hint")}</div>
      </div>
    `}};Jt.styles=A`
    :host { display: flex; flex-direction: column; height: 100%; }
    ${ve(Ee)}

    /* ── 模型选择（简化设置）── */
    .model-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; max-height: 320px; overflow-y: auto; }
    .model-row {
      display: flex; align-items: center; gap: 10px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer;
      transition: border-color .15s, background .15s;
    }
    .model-row:hover { background: var(--bg-hover); }
    .model-row.selected { border-color: var(--accent); background: var(--accent-subtle); }
    .model-row input { accent-color: var(--accent); margin: 0; }
    .model-provider { font-weight: 600; font-size: 13px; color: var(--text-strong); }
    .model-id { font-family: var(--font-mono); font-size: 12px; color: var(--text-soft); }
    .model-primary { margin-left: auto; font-size: 11px; color: var(--warn); white-space: nowrap; }
    .assistant-status-line { font-size: 12px; color: var(--text-soft); padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--border); }
    .status-on { color: var(--success); }
    .status-off { color: var(--danger); }
    .ai-empty-models { padding: 22px 16px; text-align: center; border: 1px dashed var(--border-strong); border-radius: var(--radius-sm); color: var(--text-soft); }

    /* ── 命令卡片 ── */
    .ai-chat__tools { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
    .ai-tool { background: var(--bg-muted); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius-sm); padding: 8px 10px; font-family: var(--font-mono); font-size: 12px; }
    .ai-tool.run { border-left-color: var(--warn); }
    .ai-tool.ok { border-left-color: var(--success); }
    .ai-tool.err { border-left-color: var(--danger); }
    .ai-tool__head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
    .ai-tool__name { color: var(--accent); font-weight: 600; }
    .ai-tool__cmd { background: var(--bg); color: var(--text); padding: 2px 7px; border-radius: 4px; word-break: break-all; font-size: 11.5px; }
    .ai-tool__out { margin: 7px 0 0; white-space: pre-wrap; word-break: break-word; color: var(--text-soft); font-size: 11px; line-height: 1.5; max-height: 190px; overflow-y: auto; }
    .ai-tool.run .ai-tool__out { color: var(--warn); }
    .ai-tool.err .ai-tool__out { color: var(--danger); }

    .ai-cursor { color: var(--accent); animation: ai-blink 1s steps(1) infinite; margin-left: 1px; }
    @keyframes ai-blink { 50% { opacity: 0; } }
    .ai-thinking { color: var(--text-soft); opacity: .75; }
    .ai-chat__msg-text.is-error { color: var(--danger); }
    .ai-chat__msg-md { min-width: 0; }
  `;let B=Jt;U([m({type:String})],B.prototype,"title");U([m({type:String})],B.prototype,"subtitle");U([d()],B.prototype,"_view");U([_s("oc-toast")],B.prototype,"_toast");U([d()],B.prototype,"_showConvList");U([d()],B.prototype,"_settingsOpen");U([d()],B.prototype,"_input");U([d()],B.prototype,"_saved");U([d()],B.prototype,"_assistantOnline");U([d()],B.prototype,"_configured");U([d()],B.prototype,"_assistantModel");U([d()],B.prototype,"_models");U([d()],B.prototype,"_selectedModelKey");U([d()],B.prototype,"_conversations");U([d()],B.prototype,"_activeConv");U([d()],B.prototype,"_convSearch");U([d()],B.prototype,"_messages");U([d()],B.prototype,"_streaming");U([d()],B.prototype,"_uploadedImage");U([_s("#ai-file-input")],B.prototype,"_fileInput");customElements.define("ai-page",B);var Ha=Object.defineProperty,Ce=(l,e,t,a)=>{for(var i=void 0,o=l.length-1,n;o>=0;o--)(n=l[o])&&(i=n(e,t,i)||i);return i&&Ha(e,t,i),i};const ht={dashboard:"layout-dashboard",chat:"message-square",logs:"scroll-text",skills2:"sparkles",memory:"database",cron:"clock",extensions:"palette",ai:"bot",settings:"settings",models:"cpu",agents:"users",gateway:"antenna",channels:"share-2",diagnostics:"stethoscope",browser:"globe",codex:"terminal",sandbox:"shield","hermes-service":"server","hermes-env":"key","hermes-config":"settings","hermes-logs":"scroll-text"};function qa(){const l={};for(const[e,t]of Object.entries(ht))l[e]={label:s(`tabs.${e}`),icon:t,subtitle:s(`subtitles.${e}`)};return l}const Ua=new Set(["logs","services","gateway","settings","extensions"]);function ja(l){let e;return l==="hermes"?e=[{heading:s("sections.Monitor"),tabs:["dashboard","ai","chat","logs"]},{heading:s("sections.Extensions"),tabs:["skills2","memory","cron","extensions","settings"]}]:l==="codex"?e=[{heading:s("sections.Monitor"),tabs:["ai","chat"]},{heading:s("sections.Config"),tabs:["codex","sandbox"]},{heading:s("sections.Extensions"),tabs:["settings"]}]:e=[{heading:s("sections.Monitor"),tabs:["dashboard","ai","chat","logs"]},{heading:s("sections.Config"),tabs:["models","agents","gateway","browser","channels"]},{heading:s("sections.Extensions"),tabs:["skills2","settings","diagnostics"]}],e.map(t=>({...t,tabs:t.tabs.filter(a=>!Ua.has(a))})).filter(t=>t.tabs.length>0)}const Qt=class Qt extends C{constructor(){super(...arguments),this._initDone=sessionStorage.getItem("openclaw.init-shown")==="1",this._page="dashboard",this._connected=!1,this._snapshot={status:"Offline",uptime:"--",version:"1.0.0"},this._theme="claw",this._themeMode="dark",this._engine="openclaw",this._lang=V.locale,this._unsubI18n=null,this._unsubStore=null}connectedCallback(){super.connectedCallback(),this._loadState(),this._unsubI18n=V.subscribe(()=>this.requestUpdate()),this._unsubStore=f().subscribe(e=>{var t,a;this._connected=e.connected,(a=(t=e.hello)==null?void 0:t.server)!=null&&a.version?this._snapshot={status:"Online",uptime:"--",version:e.hello.server.version}:e.connected||(this._snapshot={...this._snapshot,status:"Offline"})})}disconnectedCallback(){var e,t;super.disconnectedCallback(),(e=this._unsubI18n)==null||e.call(this),(t=this._unsubStore)==null||t.call(this)}_loadState(){try{const e=localStorage.getItem("openclaw-control-state");if(e){const a=JSON.parse(e);a.page&&ht[a.page]&&(this._page=a.page),a.engine&&(a.engine==="openclaw"||a.engine==="hermes"||a.engine==="codex")&&(this._engine=a.engine),this._engine==="codex"&&!["ai","chat","codex","sandbox","settings"].includes(this._page)&&(this._page="codex")}const t=localStorage.getItem("openclaw-control-theme");if(t){const a=JSON.parse(t);this._theme=a.theme||"claw",this._themeMode=a.mode||"dark"}}catch{}}_saveState(){try{localStorage.setItem("openclaw-control-state",JSON.stringify({page:this._page,engine:this._engine}))}catch{}}_navigate(e){ht[e]&&(this._page=e,this._saveState())}_setTheme(e){this._theme=e,document.documentElement.setAttribute("data-theme",e),localStorage.setItem("openclaw-control-theme",JSON.stringify({theme:e,mode:this._themeMode}))}_setThemeMode(e){this._themeMode=e;const t=e==="system"?window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark":e;document.documentElement.setAttribute("data-theme-mode",t),localStorage.setItem("openclaw-control-theme",JSON.stringify({theme:this._theme,mode:e}))}_setLang(e){V.setLocale(e),this._lang=e}_setEngine(e){const t=e==="openclaw"||e==="hermes"||e==="codex"?e:"openclaw";t!==this._engine&&(this._engine=t,this._page=t==="codex"?"codex":"dashboard",this._saveState())}_renderPage(){const e=a=>s(`tabs.${a}`),t=a=>s(`subtitles.${a}`);switch(this._page){case"dashboard":return this._engine==="hermes"?r`<hermes-dashboard-page title=${e("dashboard")} .onNavigate=${a=>this._navigate(a)}></hermes-dashboard-page>`:r`<dashboard-page title=${e("dashboard")} subtitle=${s("dashboard.subtitle")} .connected=${this._connected} .onNavigate=${a=>this._navigate(a)} @check-updates=${()=>{this._initDone=!1,sessionStorage.removeItem("openclaw.init-shown")}}></dashboard-page>`;case"chat":return r`<chat-page title=${e("chat")} subtitle=${t("chat")} .connected=${this._connected} .engine=${this._engine} .onNavigate=${a=>this._navigate(a)}></chat-page>`;case"logs":return this._engine==="hermes"?r`<hermes-logs-page .onNavigate=${a=>this._navigate(a)}></hermes-logs-page>`:r`<logs-page title=${e("logs")} subtitle=${t("logs")}></logs-page>`;case"skills2":return r`<skills-v2-page title=${e("skills2")} subtitle=${t("skills2")} .engine=${this._engine} .onNavigate=${a=>this._navigate(a)}></skills-v2-page>`;case"memory":return this._engine==="hermes"?r`<hermes-memory-page title=${e("memory")} subtitle=${t("memory")}></hermes-memory-page>`:r`<memory-page title=${e("memory")} subtitle=${t("memory")}></memory-page>`;case"cron":return r`<cron-page title=${e("cron")} .engine=${this._engine}></cron-page>`;case"extensions":return r`<extensions-page title=${e("extensions")}></extensions-page>`;case"ai":return r`<ai-page title=${e("ai")} subtitle=${t("ai")}></ai-page>`;case"agents":return r`<agents-page title=${e("agents")} .onNavigate=${a=>this._navigate(a)}></agents-page>`;case"settings":return r`<settings-page title=${e("settings")} subtitle=${t("settings")} .theme=${this._theme} .themeMode=${this._themeMode} .snapshot=${this._snapshot} @set-theme=${a=>this._setTheme(a.detail.value)} @set-mode=${a=>this._setThemeMode(a.detail.value)}></settings-page>`;case"channels":return r`<channels-page title=${e("channels")} subtitle=${t("channels")}></channels-page>`;case"models":return r`<models-page title=${e("models")} subtitle=${t("models")}></models-page>`;case"gateway":return r`<gateway-page title=${e("gateway")} subtitle=${t("gateway")}></gateway-page>`;case"diagnostics":return r`<diagnostics-page title=${e("diagnostics")} subtitle=${t("diagnostics")}></diagnostics-page>`;case"browser":return r`<browser-page title=${e("browser")} subtitle=${t("browser")}></browser-page>`;case"codex":return r`<codex-page title=${e("codex")} subtitle=${t("codex")}></codex-page>`;case"sandbox":return r`<sandbox-page title=${e("sandbox")} subtitle=${t("sandbox")}></sandbox-page>`;case"hermes-service":return r`<hermes-service-page title=${s("hermesDashboard.hermesService")} subtitle=${s("hermesService.subtitle")} .onNavigate=${a=>this._navigate(a)}></hermes-service-page>`;case"hermes-env":return r`<hermes-env-page .onNavigate=${a=>this._navigate(a)}></hermes-env-page>`;case"hermes-config":return r`<hermes-config-page .onNavigate=${a=>this._navigate(a)}></hermes-config-page>`;case"hermes-logs":return r`<hermes-logs-page .onNavigate=${a=>this._navigate(a)}></hermes-logs-page>`;default:return r`<dashboard-page title=${e("dashboard")} subtitle=${t("dashboard")} .connected=${this._connected} .onNavigate=${a=>this._navigate(a)} @check-updates=${()=>{this._initDone=!1,sessionStorage.removeItem("openclaw.init-shown")}}></dashboard-page>`}}render(){return this._initDone?r`
      <div class="shell">
        <oc-sidebar class="shell-nav" .page=${this._page} .routes=${qa()} .sections=${ja(this._engine)} .connected=${this._connected} .engine=${this._engine} .themeMode=${this._themeMode} .lang=${this._lang}
          @navigate=${e=>this._navigate(e.detail.page)}
          @set-mode=${e=>this._setThemeMode(e.detail.mode)}
          @set-lang=${e=>this._setLang(e.detail.lang)}
          @set-engine=${e=>this._setEngine(e.detail.engine)}
        ></oc-sidebar>
        <div class="shell-main">
          <div class="page-content">${this._renderPage()}</div>
        </div>
      </div>
    `:r`
        <init-page @init-done=${()=>{this._initDone=!0,sessionStorage.setItem("openclaw.init-shown","1")}}></init-page>
      `}};Qt.styles=A`
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
  `;let re=Qt;Ce([d()],re.prototype,"_initDone");Ce([d()],re.prototype,"_page");Ce([d()],re.prototype,"_connected");Ce([d()],re.prototype,"_snapshot");Ce([d()],re.prototype,"_theme");Ce([d()],re.prototype,"_themeMode");Ce([d()],re.prototype,"_engine");Ce([d()],re.prototype,"_lang");customElements.define("openclaw-app",re);
