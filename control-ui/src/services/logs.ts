/**
 * Logs service.
 */
import { api } from './api.js';
import type { LogFile, LogEntry } from './types.js';

export async function getLogFiles(): Promise<LogFile[]> {
  return api.get<LogFile[]>('/api/logs/files');
}

export async function getLogEntries(file: string): Promise<LogEntry[]> {
  return api.get<LogEntry[]>(`/api/logs/${file}`);
}
