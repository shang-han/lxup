/**
 * Agents service.
 */
import { api } from './api.js';
import type { Agent } from './types.js';

export async function getAgents(): Promise<Agent[]> {
  return api.get<Agent[]>('/api/agents');
}
