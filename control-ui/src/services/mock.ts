/**
 * Mock data service.
 * All hardcoded mock data lives here. When connecting to real API,
 * replace these with api.get/post calls.
 */

import type {
  Snapshot, Instance, Session, Agent, CronJob, Skill,
  Conversation, Message, Memory, LogFile, LogEntry, EnvVariable,
} from './types.js';

// --- Dashboard ---
export const mockSnapshot: Snapshot = { status: 'Offline', uptime: '--', version: '1.0.0', pid: 1234,};

export const mockInstances: Instance[] = [];

export const mockSessions: Session[] = [
  { key: 'main', agent: 'Main Assistant', created: Date.now(), messages: 0 },
  { key: 'debug', agent: 'Debug Session', created: Date.now() - 3600000, messages: 12 },
];

// --- Agents ---
export const mockAgents: Agent[] = [
  { id: 'main', name: 'Main Assistant', model: 'Default', status: 'active' },
  { id: 'ops', name: 'Ops Assistant', model: 'Default', status: 'active' },
];

// --- Cron ---
export const mockCronJobs: CronJob[] = [
  { id: '1', name: 'Morning Brief', schedule: '0 7 * * *', enabled: true, desc: 'Daily morning summary' },
  { id: '2', name: 'Health Check', schedule: '*/30 * * * *', enabled: true, desc: 'Gateway status check' },
];

// --- Skills ---
export const mockSkills: Skill[] = [
  { name: 'Browser', desc: 'Web browsing', enabled: true },
  { name: 'File System', desc: 'Read/write files', enabled: true },
  { name: 'Shell', desc: 'Execute commands', enabled: true },
  { name: 'Memory', desc: 'Persistent store', enabled: true },
];

// --- AI Assistant ---
export const mockConversations: Conversation[] = [
  { id: 'c1', title: '检查配置问题', preview: '帮我检查一下配置...', ts: '今天 10:30', pinned: true },
  { id: 'c2', title: '诊断 Gateway 报错', preview: 'Gateway 连接失败...', ts: '今天 09:15', pinned: false },
  { id: 'c3', title: '分析最近日志', preview: '日志中有大量超时...', ts: '昨天 16:42', pinned: false },
  { id: 'c4', title: 'PR 流程咨询', preview: '帮我 review 代码...', ts: '昨天 14:08', pinned: false },
  { id: 'c5', title: 'Skills 安装', preview: '如何安装新技能...', ts: '7月13日', pinned: false },
];

// --- Memory ---
export const mockMemories: Memory[] = [
  { id: 'm1', name: 'user-profile', type: 'user', content: 'User prefers concise answers. Works as a senior backend engineer.', words: 14, updated: '2026-07-14 15:30' },
  { id: 'm2', name: 'project-context', type: 'note', content: 'This project uses Tauri v2 for desktop shell, FastAPI for gateway, and Lit for frontend Web Components.', words: 18, updated: '2026-07-13 10:15' },
  { id: 'm3', name: 'codex-config', type: 'note', content: 'Codex CLI is configured with --sandbox landlock and uses gpt-4.2 as default model. Workspace is at ~/projects/lxup.', words: 20, updated: '2026-07-15 08:00' },
  { id: 'm4', name: 'agent-personality', type: 'soul', content: 'You are a helpful, concise coding assistant. You prefer direct answers over long explanations.', words: 15, updated: '2026-07-12 22:45' },
  { id: 'm5', name: 'api-endpoints', type: 'note', content: 'Gateway REST API: GET /health, GET /api/sessions, POST /api/config, WS /ws/chat. Auth via Bearer token.', words: 22, updated: '2026-07-11 14:20' },
  { id: 'm6', name: 'deployment-notes', type: 'note', content: 'Build pipeline: pyinstaller → nexe → tauri build. Sign with codesign (macOS) / signtool (Windows).', words: 16, updated: '2026-07-10 09:00' },
];

// --- Logs ---
export const mockLogFiles: LogFile[] = [
  { name: 'gateway.log', size: '12.4 KB' },
  { name: 'error.log', size: '1.2 KB' },
  { name: 'audit.log', size: '8.7 KB' },
];

export const mockLogEntries: LogEntry[] = Array.from({ length: 20 }, (_, i) => ({
  time: `2026-07-16 ${String(10 + Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}:00`,
  level: i % 7 === 0 ? 'WARN' : i % 13 === 0 ? 'ERROR' : 'INFO',
  message: `Sample log entry #${i + 1} - Gateway health check passed`,
}));

// --- Hermes Logs ---
export const mockHermesLogFiles: LogFile[] = [
  { name: 'agent.log', size: '23.5 KB' },
  { name: 'gateway.log', size: '918 B' },
  { name: 'errors.log', size: '0 B' },
];

export const mockHermesLogEntries: LogEntry[] = Array.from({ length: 30 }, (_, i) => ({
  time: `15:${27 + Math.floor(i / 6)}:${String((i % 6) * 15).padStart(2, '0')}`,
  level: 'INFO',
  method: 'GET',
  path: '/health',
  status: 200,
}));

// --- Hermes Env ---
export const mockEnvVariables: EnvVariable[] = [];

// --- Services ---
export const mockVersion = {
  current: '2026.3.24',
  label: '汉化优化版',
  recommended: '',
  upstream: '2026.7.1-zh.2',
};

export const mockGateway = {
  name: 'ai.openclaw.gateway',
  desc: 'OpenClaw Gateway',
  pid: 1664,
  status: 'running' as 'running' | 'stopped',
};

export const mockConfigContent = `{
  "$schema": "https://openclaw.ai/schema/config.json",
  "agents": { "defaults": { "workspace": "D:\\\\openclaw-data\\\\openclaw\\\\workspace" }, "list": [] },
  "bindings": [],
  "gateway": { "port": 18789, "host": "127.0.0.1" }
}`;

export const mockBackups: Array<{ id: string; date: string; size: string }> = [];
