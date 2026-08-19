#!/usr/bin/env node
/**
 * LXUP AI 助手 —— 独立 JS 服务（不经过 OpenClaw / Hermes 网关）
 *
 * 功能：
 *   - 与 LLM 对话（OpenAI 兼容接口，支持多轮）
 *   - Function calling 工具环：模型可调用 run_command 在本地执行命令行
 *   - SSE 流式输出（打字机效果 + 工具调用实时回传）
 *   - 配置管理：API Key / Base URL / 模型 可在设置页面配置（写入 data/config.json）
 *   - 会话管理：多会话持久化（data/conversations/ 每会话一个 JSON）
 *
 * 零依赖，仅用 Node 内置模块。要求 Node >= 18（使用全局 fetch）。
 *
 * 配置优先级：设置页面 config.json > 系统环境变量 > .env > 默认值
 *   设置页面可配：API_KEY / BASE_URL / MODEL / MAX_TOOL_ROUNDS
 *   PORT 仅来自环境变量 / .env（默认 8080，改端口需重启）
 *
 * API：
 *   GET    /                       内置前端页面
 *   GET    /api/status             服务状态
 *   GET    /api/config             读取配置（Key 打码返回）
 *   POST   /api/config             保存配置（Key 留空/打码时保留原值）
 *   POST   /api/config/test        用当前配置做一次最小调用，验证连通性
 *   GET    /api/conversations      会话列表
 *   POST   /api/conversations      新建会话
 *   GET    /api/conversations/:id  会话详情（含消息与工具记录）
 *   PATCH  /api/conversations/:id  重命名会话
 *   DELETE /api/conversations/:id  删除会话
 *   POST   /api/chat               对话（SSE 流式）body: {conversationId?, content}
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CONV_DIR = path.join(DATA_DIR, 'conversations');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const OPENCLAW_CONFIG_PATH = path.join(ROOT, '..', 'runtime', 'openclaw-home', 'openclaw.json');
const CODEX_HOME = path.join(ROOT, '..', 'runtime', 'codex-home');
const HERMES_CONFIG_PATH = path.join(ROOT, '..', 'runtime', 'hermes-home', 'config.yaml');
const isWindows = process.platform === 'win32';

function ensureDirs() {
  for (const d of [DATA_DIR, CONV_DIR]) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  }
}

// ─────────────────────────── 配置 ───────────────────────────

function loadEnvFile() {
  const vars = {};
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return vars;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) vars[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return vars;
}
const fileEnv = loadEnvFile();
const env = (k, dflt) => process.env[k] || fileEnv[k] || dflt;

const PORT = parseInt(env('PORT', '8080'), 10);

const DEFAULTS = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  maxToolRounds: 10,
};

function readConfigJson() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function readOpenClawConfig() {
  try {
    return JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function isSecretPlaceholder(value) {
  const text = String(value || '');
  return !text || text.includes('__OPENCLAW_REDACTED__') || text.includes('****');
}

/** AI 助手与 OpenClaw 独立运行，但可复用项目模型配置中的真实凭据。 */
function getOpenClawModelConfig(model) {
  const oc = readOpenClawConfig();
  const providers = oc?.models?.providers;
  if (!providers || typeof providers !== 'object') return null;
  const primary = String(oc?.agents?.defaults?.model || '');
  const modelId = String(model || '').trim();
  const candidates = [];
  for (const [id, provider] of Object.entries(providers)) {
    const models = Array.isArray(provider?.models) ? provider.models : [];
    const ids = models.map((entry) => String(entry?.id || entry?.name || entry || ''));
    const ref = `${id}/${modelId}`;
    const matchesModel = modelId && ids.includes(modelId);
    const matchesPrimary = primary === ref;
    if (matchesModel || matchesPrimary) candidates.unshift({ id, provider, ids });
    else candidates.push({ id, provider, ids });
  }
  const selected = candidates.find(({ provider }) => !isSecretPlaceholder(provider?.apiKey));
  if (!selected) return null;
  const selectedModel = modelId && selected.ids.includes(modelId)
    ? modelId
    : (selected.ids[0] || modelId);
  return {
    apiKey: String(selected.provider.apiKey),
    baseUrl: String(selected.provider.baseUrl || ''),
    model: selectedModel,
  };
}

/** 合并配置：默认 < .env < 系统环境变量 < config.json（设置页面） */
function getConfig() {
  const c = { ...DEFAULTS };
  if (fileEnv.API_KEY) c.apiKey = fileEnv.API_KEY;
  if (fileEnv.BASE_URL) c.baseUrl = fileEnv.BASE_URL;
  if (fileEnv.MODEL) c.model = fileEnv.MODEL;
  if (fileEnv.MAX_TOOL_ROUNDS) c.maxToolRounds = parseInt(fileEnv.MAX_TOOL_ROUNDS, 10);
  if (process.env.API_KEY) c.apiKey = process.env.API_KEY;
  if (process.env.BASE_URL) c.baseUrl = process.env.BASE_URL;
  if (process.env.MODEL) c.model = process.env.MODEL;
  if (process.env.MAX_TOOL_ROUNDS) c.maxToolRounds = parseInt(process.env.MAX_TOOL_ROUNDS, 10);
  const cj = readConfigJson();
  for (const k of ['apiKey', 'baseUrl', 'model', 'maxToolRounds']) {
    if (cj[k] !== undefined && cj[k] !== null && cj[k] !== '') c[k] = cj[k];
  }
  if (isSecretPlaceholder(c.apiKey)) {
    const fallback = getOpenClawModelConfig(c.model);
    if (fallback) {
      c.apiKey = fallback.apiKey;
      if (c.baseUrl === DEFAULTS.baseUrl && fallback.baseUrl) c.baseUrl = fallback.baseUrl;
      if (c.model === DEFAULTS.model && fallback.model) c.model = fallback.model;
    }
  }
  c.baseUrl = String(c.baseUrl).replace(/\/+$/, '');
  c.maxToolRounds = parseInt(c.maxToolRounds, 10) || DEFAULTS.maxToolRounds;
  return c;
}

function maskKey(k) {
  if (!k) return '';
  if (k.length <= 8) return '****';
  return k.slice(0, 3) + '****' + k.slice(-4);
}

/** 复用 Codex 配置：auth.json 的 OPENAI_API_KEY + config.toml 的 base_url/model（宽松匹配） */
function getCodexModelConfig() {
  try {
    const auth = JSON.parse(fs.readFileSync(path.join(CODEX_HOME, 'auth.json'), 'utf-8'));
    const key = String(auth?.OPENAI_API_KEY || auth?.apiKey || '').trim();
    if (!key || isSecretPlaceholder(key)) return null;
    const toml = fs.readFileSync(path.join(CODEX_HOME, 'config.toml'), 'utf-8');
    const baseUrl = (toml.match(/base_url\s*=\s*["']([^"']+)["']/) || [])[1] || '';
    const model = (toml.match(/^model\s*=\s*["']([^"']+)["']/m) || [])[1] || '';
    return { apiKey: key, baseUrl, model };
  } catch (e) {
    return null;
  }
}

/** 复用 Hermes 配置：config.yaml 的 model 段（api_key/base_url/name） */
function getHermesModelConfig() {
  try {
    const yaml = fs.readFileSync(HERMES_CONFIG_PATH, 'utf-8');
    const key = (yaml.match(/api_key:\s*["']?([^"'\r\n]+)/) || [])[1] || '';
    if (!key || isSecretPlaceholder(key)) return null;
    const baseUrl = (yaml.match(/base_url:\s*["']?([^"'\r\n]+)/) || [])[1] || '';
    const model = (yaml.match(/name:\s*["']?([^"'\r\n]+)/) || [])[1] || '';
    return { apiKey: key, baseUrl, model };
  } catch (e) {
    return null;
  }
}

/** 保存设置页面配置。apiKey 为空或为打码串时保留原值。 */
function saveConfig(newCfg) {
  ensureDirs();
  const out = { ...readConfigJson() };
  if (newCfg.apiKey !== undefined) {
    const k = String(newCfg.apiKey).trim();
    if (k && !k.includes('****')) out.apiKey = k; // 留空或打码 → 不动原 Key
  }
  if (newCfg.baseUrl !== undefined && String(newCfg.baseUrl).trim())
    out.baseUrl = String(newCfg.baseUrl).trim();
  if (newCfg.model !== undefined && String(newCfg.model).trim())
    out.model = String(newCfg.model).trim();
  if (newCfg.maxToolRounds !== undefined) {
    const n = parseInt(newCfg.maxToolRounds, 10);
    if (n > 0 && n <= 50) out.maxToolRounds = n;
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(out, null, 2), 'utf-8');
  return out;
}

// ─────────────────────────── 会话存储 ───────────────────────────

function convPath(id) {
  return path.join(CONV_DIR, String(id).replace(/[^a-zA-Z0-9_-]/g, '') + '.json');
}
function loadConv(id) {
  try {
    return JSON.parse(fs.readFileSync(convPath(id), 'utf-8'));
  } catch (e) {
    return null;
  }
}
function saveConv(conv) {
  ensureDirs();
  fs.writeFileSync(convPath(conv.id), JSON.stringify(conv, null, 2), 'utf-8');
}
function listConvs() {
  ensureDirs();
  const out = [];
  for (const f of fs.readdirSync(CONV_DIR)) {
    if (!f.endsWith('.json')) continue;
    const c = loadConv(f.slice(0, -5));
    if (!c) continue;
    out.push({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: (c.messages || []).length,
    });
  }
  out.sort((a, b) => b.updatedAt - a.updatedAt);
  return out;
}
function newConv(title) {
  const now = Date.now();
  return {
    id: 'c_' + now.toString(36) + crypto.randomBytes(3).toString('hex'),
    title: title || '新对话',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}
function deriveTitle(conv) {
  const firstUser = (conv.messages || []).find((m) => m.role === 'user');
  if (firstUser) {
    // 视觉多段格式时取文本段做标题
    const raw = Array.isArray(firstUser.content)
      ? firstUser.content
          .filter((p) => p && p.type === 'text')
          .map((p) => String(p.text || ''))
          .join(' ')
      : firstUser.content;
    conv.title = String(raw).replace(/\s+/g, ' ').trim().slice(0, 24) || '新对话';
  }
}

// ─────────────────────────── 工具 ───────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'run_command',
      description:
        '在用户本地电脑上执行一条命令行命令。Windows 使用 cmd，macOS/Linux 使用 bash。' +
        '适用于查看系统信息、列目录、读写文件、运行脚本、管理进程等。',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: '要执行的命令' },
          workdir: { type: 'string', description: '工作目录（可选，默认为服务所在目录）' },
        },
        required: ['command'],
      },
    },
  },
];

/** 提取 Anthropic 风格 XML 工具调用（模型偶发不走 function calling 时的兜底解析） */
function extractXmlInvokes(text) {
  const out = [];
  const re = /<invoke\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/invoke>/g;
  let m;
  while ((m = re.exec(String(text || ''))) !== null) {
    const body = m[2];
    const args = {};
    const pre = /<parameter\s+name=["']([^"']+)["']>([\s\S]*?)<\/parameter>/g;
    let pm;
    let found = false;
    while ((pm = pre.exec(body)) !== null) {
      found = true;
      const raw = String(pm[2]).trim();
      try { args[pm[1]] = JSON.parse(raw); } catch (e) { args[pm[1]] = raw; }
    }
    if (!found) args.__raw = body.trim();
    out.push({ name: m[1], args });
  }
  return out;
}

function stripXmlInvokes(text) {
  return String(text || '').replace(/<invoke\s+name=["'][^"']+["'][^>]*>[\s\S]*?<\/invoke>/g, '').trim();
}

function executeTool(name, args) {
  if (name !== 'run_command') return { success: false, error: `未知工具: ${name}` };
  const cmd = ((args && args.command) || '').trim();
  if (!cmd) return { success: false, error: '未提供 command 参数' };
  try {
    const output = execSync(cmd, {
      cwd: args.workdir && fs.existsSync(args.workdir) ? args.workdir : ROOT,
      shell: true, // Windows→cmd.exe /c，POSIX→/bin/sh -c
      timeout: 60000,
      encoding: 'utf-8',
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, HOME: os.homedir(), USERPROFILE: os.homedir() },
    });
    return { success: true, output: (output || '').trim().slice(-8000) };
  } catch (e) {
    return {
      success: false,
      error: ((e.stderr && e.stderr.toString()) || e.message || '').slice(-2000),
      output: ((e.stdout && e.stdout.toString()) || '').slice(-2000),
    };
  }
}

// ─────────────────────── LLM 调用 ───────────────────────

function chatEndpoint(cfg) {
  return cfg.baseUrl + '/chat/completions';
}
function authHeaders(cfg) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` };
}

async function callLLM(cfg, messages, tools) {
  const body = { model: cfg.model, messages, stream: false };
  if (tools && tools.length) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }
  const res = await fetch(chatEndpoint(cfg), {
    method: 'POST',
    headers: authHeaders(cfg),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM API 错误 (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function streamLLM(cfg, messages, onDelta) {
  const res = await fetch(chatEndpoint(cfg), {
    method: 'POST',
    headers: authHeaders(cfg),
    body: JSON.stringify({ model: cfg.model, messages, stream: true }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`LLM API 错误 (${res.status}): ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('data:')) continue;
      const data = t.slice(5).trim();
      if (data === '[DONE]') return;
      try {
        const j = JSON.parse(data);
        const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
        if (delta) onDelta(delta);
      } catch (e) {
        /* 忽略不完整的 JSON 分片 */
      }
    }
  }
}

/** 用当前配置做一次最小调用，验证 Key / 地址 / 模型是否可用 */
async function testLLM(cfg) {
  const res = await fetch(chatEndpoint(cfg), {
    method: 'POST',
    headers: authHeaders(cfg),
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
      stream: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`连接失败 (${res.status}): ${text.slice(0, 200)}`);
  }
  return true;
}

// ─────────────────────── 系统提示词 ───────────────────────

// LXUP 便携环境路径（随产品目录走，U 盘盘符可变，故动态拼接）
const LXUP_RUNTIME = path.join(ROOT, '..', 'runtime');
const LXUP_PYTHON_DIR = path.join(LXUP_RUNTIME, 'python');

const SYSTEM_PROMPT = [
  '你是 LXUP 平台内置的 AI 助手，运行在用户的本地电脑上。',
  '你可以调用 run_command 工具在本地系统执行命令行，帮助用户查看信息、整理文件、运行任务。',
  '',
  '## LXUP 便携环境（检测/修复必须围绕它，不要检查系统全局环境）',
  '龙虾优盘是便携式产品，全部组件都在产品目录下，不依赖系统安装的 Node/Python：',
  `- 产品根目录：${path.join(ROOT, '..')}`,
  `- 便携 Node：${path.join(LXUP_RUNTIME, 'data', 'node.exe')}（跑 OpenClaw 网关、控制台前端）`,
  `- 便携 Python：${LXUP_PYTHON_DIR} 下的 cpython-3.11* 目录`,
  '- 服务与端口：Sidecar :7889（授权/桥接）、OpenClaw 网关 :18789、Hermes :8642、Codex CLI（按需拉起子进程）、本助手 :8080',
  `- 配置与数据：${path.join(LXUP_RUNTIME, 'openclaw-home')}（OpenClaw）、${path.join(LXUP_RUNTIME, 'hermes-home')}（Hermes）、${path.join(LXUP_RUNTIME, 'codex-home')}（Codex）、${path.join(LXUP_RUNTIME, 'logs')}（日志）`,
  '- 技能包：产品根目录 skill-packs\\（预装通用工具 + 岗位包）',
  '',
  '检测/修复红线：',
  '1. 检测或修复产品（龙虾优盘）时，默认只排查上述便携环境：端口是否监听（netstat -ano | findstr 端口号）、进程是否存活（tasklist | findstr）、runtime\\logs 下的日志、上述配置目录。',
  '2. 用户明确要求检查电脑的系统/全局环境时，可以做只读检测（版本、路径、端口、磁盘空间、进程等），照实报告结果，不要自作主张去「修复」。',
  '3. 用户电脑上自装的同名工具（如全局 openclaw/node）与产品无关：默认不碰；用户明确要求时才做只读检查。',
  '4. 修改全局环境（nvm 设置、系统 Node/Python、npm 全局包、PATH、注册表，安装/升级/卸载全局工具）无论用户是否要求，都必须先说明影响并征得同意后再执行。',
  '',
  '规则：',
  '1. 执行命令前，用一句话简要说明这条命令要做什么。',
  '2. 涉及删除、格式化、结束进程等有风险的操作，先向用户确认再执行。',
  '3. 命令尽量简洁；执行完成后对结果做简要总结。',
  '4. 能用一条命令完成的任务不要拆成多步。',
  '5. 调用工具必须使用函数调用（function calling）格式，不要用 XML 标签输出工具调用。',
].join('\n');

// ─────────────────────── 对话处理 ───────────────────────────

async function handleChat(body, res) {
  const cfg = getConfig();
  // 助手自身无 Key 时，按当前浏览的引擎复用其凭据
  // （OpenClaw 复用已内置于 getConfig()；Codex/Hermes 在此补齐）
  if (!cfg.apiKey) {
    const engine = String(body.engine || '');
    const fallback = engine === 'codex'
      ? getCodexModelConfig()
      : engine === 'hermes'
        ? getHermesModelConfig()
        : null;
    if (fallback) {
      cfg.apiKey = fallback.apiKey;
      if (!cfg.baseUrl || cfg.baseUrl === DEFAULTS.baseUrl) cfg.baseUrl = fallback.baseUrl;
      if (cfg.model === DEFAULTS.model && fallback.model) cfg.model = fallback.model;
    }
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const finish = () => {
    res.write('data: [DONE]\n\n');
    res.end();
  };

  if (!cfg.apiKey) {
    const engine = String(body.engine || '');
    send({
      error: engine === 'codex'
        ? '助手暂无可用 API Key：请在「Codex CLI」页配置 API Key（助手自动复用）。'
        : '助手暂无可用 API Key：请在「模型配置」页配置带 Key 的模型（助手自动复用）。',
    });
    return finish();
  }

  const content = String(body.content || '').trim();
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : '';
  if (!content && !image) {
    send({ error: '消息内容为空' });
    return finish();
  }

  // 载入或新建会话
  let conv = body.conversationId ? loadConv(body.conversationId) : null;
  const created = !conv;
  if (!conv) conv = newConv();

  // 用户消息：有图片时用 OpenAI 视觉多段格式（image_url），纯文本保持字符串
  const userContent = image
    ? [...(content ? [{ type: 'text', text: content }] : []), { type: 'image_url', image_url: { url: image } }]
    : content;
  conv.messages.push({ role: 'user', content: userContent, ts: Date.now() });
  deriveTitle(conv);
  conv.updatedAt = Date.now();
  saveConv(conv);
  send({ meta: { conversationId: conv.id, title: conv.title, created } });

  // 组装 LLM 上下文（历史仅取 role/content，工具细节不回灌模型，保证各家接口兼容）
  const history = conv.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...history];

  const toolCalls = [];
  let answer = '';
  try {
    for (let round = 0; round < cfg.maxToolRounds; round++) {
      const isLast = round === cfg.maxToolRounds - 1;
      const resp = await callLLM(cfg, messages, isLast ? null : TOOLS);
      const msg = resp.choices && resp.choices[0] && resp.choices[0].message;
      if (!msg) {
        send({ error: 'LLM 无响应' });
        break;
      }

      if (msg.tool_calls && msg.tool_calls.length) {
        messages.push(msg);
        for (const tc of msg.tool_calls) {
          let args = {};
          try {
            args = JSON.parse(tc.function.arguments || '{}');
          } catch (e) {
            args = {};
          }
          send({ tool: tc.function.name, args });
          const result = executeTool(tc.function.name, args);
          const resultText = (result.output || result.error || '').slice(0, 1000);
          send({ tool: tc.function.name, ok: result.success, result: resultText, args });
          messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
          toolCalls.push({
            id: tc.id,
            name: tc.function.name,
            args,
            ok: result.success,
            result: (result.output || result.error || '').slice(0, 2000),
          });
        }
        continue;
      }

      // 无函数调用：先兜底解析 XML 工具调用（模型偶发用 Anthropic 格式调工具）
      const xmlInvocations = extractXmlInvokes(msg.content || '');
      if (xmlInvocations.length) {
        messages.push({ role: 'assistant', content: stripXmlInvokes(msg.content) });
        xmlInvocations.forEach((inv, i) => {
          send({ tool: inv.name, args: inv.args });
          const result = executeTool(inv.name, inv.args);
          const resultText = (result.output || result.error || '').slice(0, 1000);
          send({ tool: inv.name, ok: result.success, result: resultText, args: inv.args });
          messages.push({ role: 'tool', tool_call_id: `xml-${Date.now()}-${i}`, content: JSON.stringify(result) });
          toolCalls.push({
            id: `xml-${Date.now()}-${i}`,
            name: inv.name,
            args: inv.args,
            ok: result.success,
            result: (result.output || result.error || '').slice(0, 2000),
          });
        });
        continue;
      }

      // 无工具调用 —— 最终答复，流式输出（流中出现 XML 调用时过滤、执行后补一轮）
      let invokeBuffer = '';
      await streamLLM(cfg, messages, (delta) => {
        if (invokeBuffer) { invokeBuffer += delta; return; }
        const idx = delta.indexOf('<invoke');
        if (idx >= 0) {
          const head = delta.slice(0, idx);
          if (head) { answer += head; send({ content: head }); }
          invokeBuffer = delta.slice(idx);
          return;
        }
        answer += delta;
        send({ content: delta });
      });
      if (invokeBuffer) {
        const invs = extractXmlInvokes(invokeBuffer);
        if (!invs.length) {
          // 解析不出完整调用，按普通文本回显
          answer += invokeBuffer;
          send({ content: invokeBuffer });
          break;
        }
        const tail = stripXmlInvokes(invokeBuffer);
        if (tail) { answer += tail; send({ content: tail }); }
        if (answer) messages.push({ role: 'assistant', content: answer });
        invs.forEach((inv, i) => {
          send({ tool: inv.name, args: inv.args });
          const result = executeTool(inv.name, inv.args);
          const resultText = (result.output || result.error || '').slice(0, 1000);
          send({ tool: inv.name, ok: result.success, result: resultText, args: inv.args });
          messages.push({ role: 'tool', tool_call_id: `xmls-${Date.now()}-${i}`, content: JSON.stringify(result) });
          toolCalls.push({
            id: `xmls-${Date.now()}-${i}`,
            name: inv.name,
            args: inv.args,
            ok: result.success,
            result: (result.output || result.error || '').slice(0, 2000),
          });
        });
        send({ content: '\n\n' });
        await streamLLM(cfg, messages, (delta) => {
          answer += delta;
          send({ content: delta });
        });
      }
      break;
    }
  } catch (e) {
    send({ error: e.message });
  }

  // 持久化助手消息（附带本轮工具记录，供前端回放）
  conv.messages.push({ role: 'assistant', content: answer, toolCalls, ts: Date.now() });
  conv.updatedAt = Date.now();
  saveConv(conv);
  send({
    meta: {
      conversationId: conv.id,
      title: conv.title,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
    },
  });
  finish();
}

// ─────────────────────── HTTP 辅助 ───────────────────────

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}
function serveStatic(file, mime, res) {
  try {
    const content = fs.readFileSync(file);
    res.writeHead(200, { 'Content-Type': mime, 'Content-Length': content.length });
    res.end(content);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404');
  }
}
function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// ─────────────────────── 路由 ───────────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const pn = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;

  // 状态
  if (req.method === 'GET' && pn === '/api/status') {
    const cfg = getConfig();
    return sendJson(res, 200, {
      ok: true,
      service: 'lxup-ai-assistant',
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      hasKey: !!cfg.apiKey,
      tools: TOOLS.map((t) => t.function.name),
    });
  }

  // 配置
  if (req.method === 'GET' && pn === '/api/config') {
    const cfg = getConfig();
    return sendJson(res, 200, {
      apiKey: maskKey(cfg.apiKey),
      hasKey: !!cfg.apiKey,
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      maxToolRounds: cfg.maxToolRounds,
    });
  }
  if (req.method === 'POST' && pn === '/api/config') {
    const body = await readBody(req);
    saveConfig(body);
    const cfg = getConfig(); // 返回合并后的生效配置，而非仅 config.json
    return sendJson(res, 200, { ok: true, hasKey: !!cfg.apiKey, model: cfg.model, baseUrl: cfg.baseUrl });
  }
  if (req.method === 'POST' && pn === '/api/config/test') {
    const cfg = getConfig();
    if (!cfg.apiKey) return sendJson(res, 400, { ok: false, error: '助手暂无可用 API Key' });
    try {
      await testLLM(cfg);
      return sendJson(res, 200, { ok: true });
    } catch (e) {
      return sendJson(res, 502, { ok: false, error: e.message });
    }
  }

  // 会话
  if (req.method === 'GET' && pn === '/api/conversations') {
    return sendJson(res, 200, { conversations: listConvs() });
  }
  if (req.method === 'POST' && pn === '/api/conversations') {
    const body = await readBody(req);
    const conv = newConv(body.title);
    saveConv(conv);
    return sendJson(res, 200, {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: 0,
    });
  }
  const convMatch = pn.match(/^\/api\/conversations\/([^/]+)$/);
  if (convMatch) {
    const id = convMatch[1];
    if (req.method === 'GET') {
      const conv = loadConv(id);
      if (!conv) return sendJson(res, 404, { error: '会话不存在' });
      return sendJson(res, 200, conv);
    }
    if (req.method === 'PATCH') {
      const conv = loadConv(id);
      if (!conv) return sendJson(res, 404, { error: '会话不存在' });
      const body = await readBody(req);
      if (body.title && String(body.title).trim()) conv.title = String(body.title).trim().slice(0, 40);
      conv.updatedAt = conv.updatedAt || Date.now();
      saveConv(conv);
      return sendJson(res, 200, { ok: true, title: conv.title });
    }
    if (req.method === 'DELETE') {
      const p = convPath(id);
      if (fs.existsSync(p)) fs.unlinkSync(p);
      return sendJson(res, 200, { ok: true });
    }
  }

  // 对话
  if (req.method === 'POST' && pn === '/api/chat') {
    const body = await readBody(req);
    return handleChat(body, res);
  }

  // 前端页面
  if (req.method === 'GET' && (pn === '/' || pn === '/index.html')) {
    return serveStatic(path.join(ROOT, 'index.html'), 'text/html; charset=utf-8', res);
  }

  sendJson(res, 404, { error: 'Not Found' });
});

server.listen(PORT, () => {
  const line = '═'.repeat(52);
  const cfg = getConfig();
  console.log(line);
  console.log(' LXUP AI 助手已启动（独立服务，不经过网关）');
  console.log(`   端口   : ${PORT}`);
  console.log(`   模型   : ${cfg.model}`);
  console.log(`   后端   : ${cfg.baseUrl}`);
  console.log(`   APIKey : ${cfg.apiKey ? '已配置' : '⚠ 未配置（打开网页右上角「设置」选择模型）'}`);
  console.log(`   页面   : http://localhost:${PORT}/`);
  console.log(line);
});
