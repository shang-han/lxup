# 龙虾优盘（LXUP）

多 Agent 统一管理与编排平台。以 **OpenClaw / Hermes** 为 AI 引擎网关，配套自研的
**控制台前端**、**Sidecar 伴侣服务**（授权 + 微信扫码登录桥接）和**授权服务器**。

## 项目结构

```
D:\lxup\
├── control-ui/        控制台前端（Lit + Vite，:5173）
├── ai-assistant/      独立 AI 助手 JS 服务（对话 + 命令行工具，不经过网关，:8080）
├── sidecar/           Python 伴侣服务（授权客户端 + 微信扫码登录桥接，:7889）
├── license_server/    授权服务器（云端，激活码校验，:9000）
├── engines/           上游引擎参考源码（bootstrap-codex.bat 克隆 openai/codex 至此，供协议参考；openclaw / hermes 均已打包进 runtime，不需源码）
├── bootstrap-openclaw.bat / bootstrap-hermes.bat / bootstrap-codex.bat   三引擎便携运行时引导（一次性，需联网）
├── runtime/           运行时数据（不入库）
│   ├── data/          SQLite 数据库 + 便携 node.exe（v24，OpenClaw/前端/AI助手共用）
│   ├── openclaw/      打包的 openclaw npm 包（便携 node 运行，即搬即用）
│   ├── codex/         @openai/codex npm 包（内含预编译 codex.exe，经 Sidecar 按需拉起）
│   ├── codex-home/    Codex 便携家目录（config.toml / auth.json / 会话注册表）
│   ├── workspace/     main agent 人格文件（AGENTS.md / SOUL.md …）
│   ├── python/        Hermes 便携 Python 运行时（bootstrap 生成）
│   ├── hermes-libs/   Hermes 依赖（bootstrap 生成）
│   ├── hermes-home/   Hermes 家目录（config.yaml / 会话 / 日志）
│   └── logs/          各服务日志
├── start-hermes.bat   单独启动 Hermes 网关
├── docs/              方案文档（方案.md 等）
└── README.md
```

## 架构

```
control-ui (:5173) ──┬─WebSocket──► OpenClaw 网关 (:18789)   ← 引擎①（agent/渠道/会话）
   实时聊天按所选引擎    │                       ├─ 微信渠道（扫码登录）
   各连各的网关          │                       └─ workspace: runtime/workspace
   （引擎可切换）        ├─HTTP+SSE──► Hermes 网关 (:8642)    ← 引擎②（OpenAI 兼容 api_server）
                        │                       └─ home: runtime/hermes-home
                        │
                        └─HTTP──► Sidecar (:7889)   ← LXUP 产品层 + Codex 引擎桥接
                                    ├─ /api/license/*      一机一码授权客户端
                                    ├─ /ws/weixin-login    微信扫码登录桥接
                                    ├─ /api/hermes/*       Hermes 模型配置读写/状态（写 config.yaml）
                                    └─ /api/codex/*        Codex 桥接：每轮拉起 codex exec --json
                                               │           子进程，NDJSON→SSE 推流；配置写 codex-home
                                               └─► codex.exe (runtime/codex，无常驻进程)

license_server (:9000)   ← 授权服务器（激活码生成/校验/吊销）
```

**三个 AI 引擎**：OpenClaw（:18789，WebSocket）/ Hermes（:8642，HTTP+SSE）/ Codex（CLI，经 Sidecar :7889 桥接）。
`control-ui` 顶部可切换引擎，**实时聊天各自连自己引擎的通道、互不共用**（适配层
`control-ui/src/services/chat-engine.ts`：OpenClaw 走 WebSocket、Hermes 走 HTTP+SSE、
Codex 走 Sidecar SSE——Codex 是 CLI 不是网关，Sidecar 每轮对话拉起一次 `codex exec --json`
子进程并把事件流转成 SSE）。
Agent 由各引擎网关自行管理，Sidecar 负责产品层能力（授权、微信桥接、Hermes 模型配置落盘）
与 Codex CLI 桥接（`/api/codex/*`）。

**即搬即用（引擎运行时都在项目内，不依赖全局安装）**：
- **OpenClaw**：打包的 npm 包 `runtime/openclaw` + 便携 `runtime/data/node.exe`（v24）运行；
  Sidecar 的 `GatewayManager` 用它启停（`openclaw_node`/`openclaw_entry` 可覆盖，未打包时回退全局 `openclaw` 命令）。
  状态仍在 `~/.openclaw`（OpenClaw 自身设计）。
- **Hermes**：PyPI 包 `hermes-agent`（装进 `runtime/hermes-libs`）+ 便携 Python（见下，不需源码）。
- **Codex**：npm 包 `@openai/codex`（装进 `runtime/codex`，内含预编译原生二进制，无需 Rust），
  家目录固定 `runtime/codex-home`（`CODEX_HOME` 由 Sidecar 注入，不受全局环境影响）。
- 前端 / AI 助手也用同一个便携 `node.exe` 运行。

## Hermes 引擎

Hermes 用 **PyPI 包**（`hermes-agent` 装进 `runtime/hermes-libs`）+ **便携 Python** 运行，
即搬即用、不依赖外部安装、**不需要源码**（升级只需重装包）：

```bash
# 1. 一次性引导（联网）：便携 Python + 从 PyPI 装 hermes-agent → runtime/python、runtime/hermes-libs
bootstrap-hermes.bat

# 2. 启动 Hermes 网关（api_server :8642，可与 OpenClaw 同时运行）
start-hermes.bat            # 或 start-all.bat 一键起全部
```

**配置模型**：控制台「Hermes 仪表盘 → 模型配置」里，从「模型配置」页已配好的模型中选一个保存
即可（经 Sidecar 写入 `runtime/hermes-home/config.yaml`，`provider: auto` + `base_url` + `api_key`）。
Hermes 每次请求重读 config.yaml，**保存即热加载生效，无需重启网关**。

> Hermes 家目录固定为项目内 `runtime/hermes-home`（Sidecar 用 `LXUP_HERMES_HOME` 覆盖，
> 不受全局 `HERMES_HOME` 环境变量影响，保证便携）。

## Codex 引擎

Codex 与 OpenClaw / Hermes 不同——**只是 CLI，不是常驻网关**。经 Sidecar（:7889）桥接：

```bash
# 一次性引导（联网）：装 @openai/codex 预编译二进制 → runtime/codex，
# 并浅克隆上游源码到 engines/codex（协议参考，不参与运行）
bootstrap-codex.bat
```

**工作原理**：控制台切到 Codex 引擎后，聊天页每发一条消息，Sidecar 拉起一次
`codex exec --json [resume <会话>] --cd <工作区> <消息>` 子进程，把 stdout 的
NDJSON 事件流（`codex-rs/exec/src/exec_events.rs`：thread.started / item.started /
item.completed / turn.completed …）归一化成与 Hermes 一致的 SSE 词表
（assistant.delta / tool.started|completed|failed / error / done）推给前端。
打断（切换会话/关流）即杀子进程树，无常驻进程、崩溃只影响单轮。

- **配置**：控制台「Codex CLI」页保存，经 Sidecar 写入 `runtime/codex-home/config.toml`
  （model / approval_policy / sandbox_mode）和 `auth.json`（OPENAI_API_KEY，打码保护）。
- **会话**：Sidecar 注册表 `runtime/codex-home/lxup-codex.json`（uuid ↔ codex thread_id +
  消息历史），多轮对话靠 `exec resume <thread_id>` 续接。
- **便携**：`CODEX_HOME` 由 Sidecar 注入为 `runtime/codex-home`（`LXUP_CODEX_HOME` 可覆盖），
  不受全局 `~/.codex` 影响；二进制可用 `LXUP_CODEX_BIN` 覆盖。

> 助手文本在 exec --json 模式下以整块到达（逐 token 增量需要 app-server 协议，后续可升级）；
> 工具调用（shell / apply_patch / MCP / web_search）实时推送卡片。

## 启动

**一键启动**（推荐）：双击运行 `start-all.bat`，会在 6 个独立窗口启动全部服务（含 Hermes 网关），
关闭窗口即停止对应服务。停止全部服务用 `stop-all.bat`。首次使用需先跑 `bootstrap-openclaw.bat`、`bootstrap-hermes.bat`（用 Codex 引擎再加跑 `bootstrap-codex.bat`）。

手动启动（每个服务一个终端）：

```bash
# 1. OpenClaw 网关（状态在 ~/.openclaw，workspace 指向 runtime/workspace）
openclaw gateway --port 18789 --force

# 2. Hermes 网关（便携 Python + vendored 源码，api_server :8642；需先 bootstrap）
start-hermes.bat

# 3. LXUP Sidecar（授权 + 微信桥接 + Hermes 模型配置）
python -m sidecar.main --port 7889 --db-path runtime/data/gateway.db

# 4. 授权服务器
python -m license_server.main --port 9000 --db-path runtime/data/license.db --jwt-secret <secret>

# 5. 控制台前端
cd control-ui && npm run dev
```

浏览器打开 http://localhost:5173 。

> 若前端连不上网关，先在浏览器控制台清掉旧的网关地址缓存：
> `localStorage.removeItem('openclaw.gateway.url'); location.reload()`

> **微信扫码登录**依赖 Sidecar（:7889）。若提示"无法连接登录服务"，确认 Sidecar 窗口在运行（或重新跑 start-all.bat）。

## 微信扫码登录

控制台「消息渠道 → 微信 → 扫码登录」会通过 Sidecar 的 `/ws/weixin-login` 跑
`openclaw channels login --channel openclaw-weixin` 子进程，把登录二维码实时回传到前端。
扫码确认后凭证自动保存，重启网关后微信渠道上线。

## 渠道 ↔ 实例绑定

绑定关系存在 OpenClaw 配置的 `bindings[]`，每条 = `{type:"route", agentId, match:{channel, accountId?}}`。
- 精确到账号：`match.accountId` 指定某个微信账号 → 支持"两个实例绑不同人的微信"
- 无显式绑定的渠道 → 落到默认实例
