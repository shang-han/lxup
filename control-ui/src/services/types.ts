/**
 * Shared type definitions for API responses and app state.
 */

export interface Snapshot {
  status: string;
  uptime: string;
  version: string;
  pid: number;
}

export interface Instance {
  id: string;
  mode: string;
  connected: string;
}

export interface Session {
  key: string;
  agent: string;
  created: number;
  messages: number;
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  status: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  desc: string;
}

export interface Skill {
  name: string;
  desc: string;
  enabled: boolean;
}

export interface Provider {
  id: string;
  name: string;
  models: Model[];
}

export interface Model {
  name: string;
  context: number;
  default: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  ts: string;
  pinned: boolean;
  count?: number;
}

export interface Message {
  role: string;
  text: string;
  ts: string;
}

export interface Memory {
  id: string;
  name: string;
  type: 'user' | 'note' | 'soul';
  content: string;
  words: number;
  updated: string;
}

export interface LogEntry {
  time: string;
  level: string;
  method?: string;
  path?: string;
  status?: number;
  message?: string;
}

export interface LogFile {
  name: string;
  size: string;
}

export interface EnvVariable {
  name: string;
  value: string;
}

export interface DashboardData {
  connected: boolean;
  instances: Instance[];
  sessions: Session[];
  cronJobs: CronJob[];
  skills: Skill[];
  agents: Agent[];
  snapshot: Snapshot;
}
