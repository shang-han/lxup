# LXUP AI 助手（ai-assistant）

独立于 OpenClaw / Hermes 网关的轻量 AI 助手服务。**不经过网关**，直接对接 OpenAI
兼容的 LLM 接口，自带命令行执行能力、设置页面与多会话管理。

参考自 `D:\yangping\龙虾+爱马仕合体智能`（server.js），精简为纯净版：
去掉双智能体、多服务商硬编码、技能库、License/USB 绑定、全权限等。

## 功能

- 与 LLM 多轮对话（OpenAI 兼容接口）
- **Function calling 工具环**：模型可调用 `run_command` 在本地执行命令行
  （Windows 用 cmd，macOS/Linux 用 bash），执行结果回填给模型继续推理
- **设置页面**：API Key / Base URL / 模型 / 工具轮次 直接在网页左下角「⚙ 模型设置」
  里配置，支持一键测试连通性。Key 仅保存在本机 `data/config.json`。
- **多会话管理**：左侧栏真实会话列表，可新建 / 切换 / 重命名 / 删除，消息与工具
  调用记录持久化在 `data/conversations/`（每会话一个 JSON）。
- SSE 流式输出（打字机效果 + 工具调用实时回传）

零依赖，仅用 Node 内置模块，要求 **Node >= 18**。

## 启动

```bash
cd ai-assistant
node server.js            # 或双击 start.bat（Windows）
```

浏览器打开 http://localhost:8080/ → 左下角「⚙ 模型设置」填入 API Key → 保存即可开聊。

## 配置

**配置优先级：设置页面 config.json > 系统环境变量 > .env > 默认值。**

日常使用直接在设置页面配置即可（推荐）。`.env` 仅作兜底（如想在启动前预置，可
`cp .env.example .env` 后填写）。`PORT` 仅来自环境变量 / `.env`（默认 8080，改端口需重启）。

| 项 | 设置页 | .env | 默认 |
|----|:----:|------|------|
| API Key | ✅ | `API_KEY` | — |
| Base URL | ✅ | `BASE_URL` | `https://api.deepseek.com` |
| 模型 | ✅ | `MODEL` | `deepseek-chat` |
| 工具轮次 | ✅ | `MAX_TOOL_ROUNDS` | `10` |
| 端口 | — | `PORT` | `8080` |

`BASE_URL` 常见取值：DeepSeek `https://api.deepseek.com`、OpenAI
`https://api.openai.com/v1`、阿里百炼
`https://dashscope.aliyuncs.com/compatible-mode/v1`、本地 Ollama
`http://localhost:11434/v1`。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 前端页面 |
| GET | `/api/status` | 服务状态 |
| GET / POST | `/api/config` | 读取配置（Key 打码）/ 保存配置（Key 留空或打码时保留原值） |
| POST | `/api/config/test` | 用当前配置做最小调用，验证连通性 |
| GET / POST | `/api/conversations` | 会话列表 / 新建会话 |
| GET / PATCH / DELETE | `/api/conversations/:id` | 会话详情 / 重命名 / 删除 |
| POST | `/api/chat` | 对话（SSE 流式），body: `{conversationId?, content}` |

`POST /api/chat` 不传 `conversationId` 会自动新建会话；对话与工具调用记录自动持久化。

SSE 事件（每行 `data: {...}`，结束为 `data: [DONE]`）：

```jsonc
{ "meta": { "conversationId": "c_…", "title": "…", "created": true } }   // 会话信息
{ "tool": "run_command", "args": { "command": "dir" } }                  // 模型发起工具调用
{ "tool": "run_command", "ok": true, "result": "…", "args": {…} }        // 工具执行结果
{ "content": "这是当前目录的文件…" }                                      // 最终答复文本片段
{ "error": "错误信息" }                                                  // 出错
```

## 数据与隐私

`data/`（已加入 `.gitignore`，不入库）：

```
data/
├── config.json            设置页配置（含 API Key 明文，仅本机）
└── conversations/         会话记录，每会话一个 {id}.json
```

## 与 LXUP 的关系

本服务是**产品层独立助手**，不复用 OpenClaw 网关的 agent/渠道/会话，也不受
Sidecar 授权中间件约束（授权体系仍由 `license_server` + `sidecar` 负责）。
端口 `8080` 与现有服务（control-ui :5173 / sidecar :7889 / license :9000 /
openclaw :18789）互不冲突。
