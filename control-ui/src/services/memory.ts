/**
 * Memory service.
 */
import { api } from './api.js';
import type { Memory } from './types.js';

export async function getMemories(): Promise<Memory[]> {
  return api.get<Memory[]>('/api/memories');
}

export async function saveMemory(memory: Memory): Promise<Memory> {
  return api.post<Memory>('/api/memories', memory);
}

export async function deleteMemory(id: string): Promise<void> {
  return api.delete<void>(`/api/memories/${id}`);
}
