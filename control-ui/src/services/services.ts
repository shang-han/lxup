/**
 * Services (gateway) service.
 */
import { api } from './api.js';

export interface VersionInfo {
  current: string;
  label: string;
  recommended: string;
  upstream: string;
}

export interface GatewayInfo {
  name: string;
  desc: string;
  pid: number | null;
  status: 'running' | 'stopped';
}

export async function getVersion(): Promise<VersionInfo> {
  return api.get<VersionInfo>('/api/services/version');
}

export async function getGateway(): Promise<GatewayInfo> {
  return api.get<GatewayInfo>('/api/services/gateway');
}

export async function toggleGateway(): Promise<GatewayInfo> {
  return api.post<GatewayInfo>('/api/services/gateway/toggle');
}

export async function getConfigContent(): Promise<string> {
  return api.get<string>('/api/services/config');
}

export async function saveConfig(content: string): Promise<void> {
  return api.post<void>('/api/services/config', { content });
}

export async function getBackups(): Promise<Array<{ id: string; date: string; size: string }>> {
  return api.get('/api/services/backups');
}

export async function createBackup(): Promise<void> {
  return api.post<void>('/api/services/backups');
}
