/**
 * Sessions service.
 */
import { api } from './api.js';
import type { Session } from './types.js';

export async function getSessions(): Promise<Session[]> {
  return api.get<Session[]>('/api/sessions');
}
