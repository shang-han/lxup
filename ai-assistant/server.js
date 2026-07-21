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
  c.baseUrl = String(c.baseUrl).replace(/\/+$/, '');
  c.maxToolRounds = parseInt(c.maxToolRounds, 10) || DEFAULTS.maxToolRounds;
  return c;
}

function maskKey(k) {
  if (!k) return '';
  if (k.length <= 8) return '****';
  return k.slice(0, 3) + '****' + k.slice(-4);
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
    conv.title = String(firstUser.content).replace(/\s+/g, ' ').trim().slice(0, 24) || '新对话';
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

const SYSTEM_PROMPT = [
  '你是 LXUP 平台内置的 AI 助手，运行在用户的本地电脑上。',
  '你可以调用 run_command 工具在本地系统执行命令行，帮助用户查看信息、整理文件、运行任务。',
  '规则：',
  '1. 执行命令前，用一句话简要说明这条命令要做什么。',
  '2. 涉及删除、格式化、结束进程等有风险的操作，先向用户确认再执行。',
  '3. 命令尽量简洁；执行完成后对结果做简要总结。',
  '4. 能用一条命令完成的任务不要拆成多步。',
].join('\n');

// ─────────────────────── 对话处理 ───────────────────────────

async function handleChat(body, res) {
  const cfg = getConfig();
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
    send({ error: '尚未配置 API Key，请先打开左下角「设置」填写后再试。' });
    return finish();
  }

  const content = String(body.content || '').trim();
  if (!content) {
    send({ error: '消息内容为空' });
    return finish();
  }

  // 载入或新建会话
  let conv = body.conversationId ? loadConv(body.conversationId) : null;
  const created = !conv;
  if (!conv) conv = newConv();

  conv.messages.push({ role: 'user', content });
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

      // 无工具调用 —— 最终答复，流式输出
      await streamLLM(cfg, messages, (delta) => {
        answer += delta;
        send({ content: delta });
      });
      break;
    }
  } catch (e) {
    send({ error: e.message });
  }

  // 持久化助手消息（附带本轮工具记录，供前端回放）
  conv.messages.push({ role: 'assistant', content: answer, toolCalls });
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
    if (!cfg.apiKey) return sendJson(res, 400, { ok: false, error: '尚未配置 API Key' });
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
  console.log(`   APIKey : ${cfg.apiKey ? '已配置' : '⚠ 未配置（打开网页左下角「设置」填写）'}`);
  console.log(`   页面   : http://localhost:${PORT}/`);
  console.log(line);
});
