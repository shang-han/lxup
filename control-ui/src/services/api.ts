/**
 * Base HTTP client for API calls.
 * Set USE_MOCK to true to use mock data, false to use real API.
 */

const USE_MOCK = true; // ← 切换开关：true=mock, false=真实接口
const BASE_URL = 'http://127.0.0.1:18789';

// --- Mock data ---
import {
  mockSnapshot, mockInstances, mockSessions, mockAgents,
  mockCronJobs, mockSkills, mockMemories,
  mockLogFiles, mockLogEntries, mockHermesLogFiles, mockHermesLogEntries,
  mockEnvVariables,
  mockVersion, mockGateway, mockConfigContent, mockBackups,
  mockConversations,
} from './mock.js';

// --- Mock router ---
const MOCK_ROUTES: Record<string, any> = {
  'GET /api/snapshot': mockSnapshot,
  'GET /api/instances': mockInstances,
  'GET /api/sessions': mockSessions,
  'GET /api/agents': mockAgents,
  'GET /api/cron': mockCronJobs,
  'GET /api/skills': mockSkills,
  'GET /api/memories': mockMemories,
  'GET /api/logs/files': mockLogFiles,
  'GET /api/logs/agent.log': mockHermesLogEntries,
  'GET /api/logs/gateway.log': mockLogEntries,
  'GET /api/logs/errors.log': [],
  'GET /api/env': mockEnvVariables,
  'GET /api/services/version': mockVersion,
  'GET /api/services/gateway': mockGateway,
  'GET /api/services/config': mockConfigContent,
  'GET /api/services/backups': mockBackups,
  'GET /api/ai/conversations': mockConversations,
};

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 100)); // 模拟网络延迟
    const key = `${method} ${path}`;
    const mock = MOCK_ROUTES[key];
    if (mock === undefined) {
      console.warn(`[Mock] No route for ${key}, returning empty`);
      return [] as T;
    }
    // POST/DELETE 处理
    if (method === 'POST' && path === '/api/ai/chat') {
      return { role: 'assistant', text: `收到你的消息："${body?.text}"。`, ts: new Date().toLocaleTimeString() } as T;
    }
    if (method === 'POST' && path === '/api/ai/conversations') {
      return { id: 'c' + Date.now(), title: '新对话', preview: '', ts: '刚刚', pinned: false } as T;
    }
    if (method === 'POST' && path === '/api/services/gateway/toggle') {
      return { ...mockGateway, status: mockGateway.status === 'running' ? 'stopped' : 'running' } as T;
    }
    return mock as T;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T>(path: string, body?: any) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
