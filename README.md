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
├── engines/           上游引擎参考源码（openclaw / codex / hermes）
├── runtime/           运行时数据（不入库）
│   ├── data/          SQLite 数据库（gateway.db / license.db）
│   ├── workspace/     main agent 人格文件（AGENTS.md / SOUL.md …）
│   └── logs/          各服务日志
├── docs/              方案文档（方案.md 等）
└── README.md
```

## 架构

```
control-ui (:5173) ──WebSocket──► OpenClaw 网关 (:18789)   ← AI 引擎（agent/渠道/会话）
                                      │
                                      ├─ 微信渠道（openclaw-weixin，扫码登录）
                                      └─ workspace: runtime/workspace
        │
        └──WebSocket──► Sidecar (:7889)   ← LXUP 产品层
                            ├─ /api/license/*      一机一码授权客户端
                            └─ /ws/weixin-login    微信扫码登录桥接（跑登录子进程回传二维码）

license_server (:9000)   ← 授权服务器（激活码生成/校验/吊销）
```

**两个 AI 引擎网关**：OpenClaw（已用，:18789）+ Hermes（备用）。Agent 由引擎网关自行管理，
Sidecar 不重复管理 agent，只负责引擎网关不通过 RPC 暴露的产品层能力（授权、微信登录桥接）。

## 启动

**一键启动**（推荐）：双击运行 `start-all.bat`，会在 4 个独立窗口启动全部服务，关闭窗口即停止对应服务。停止全部服务用 `stop-all.bat`。

手动启动（每个服务一个终端）：

```bash
# 1. OpenClaw 网关（状态在 ~/.openclaw，workspace 指向 runtime/workspace）
openclaw gateway --port 18789 --force

# 2. LXUP Sidecar（授权 + 微信桥接）
python -m sidecar.main --port 7889 --db-path runtime/data/gateway.db

# 3. 授权服务器
python -m license_server.main --port 9000 --db-path runtime/data/license.db --jwt-secret <secret>

# 4. 控制台前端
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
