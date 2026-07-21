/**
 * Skills service.
 */
import { api } from './api.js';
import type { Skill } from './types.js';

export async function getSkills(): Promise<Skill[]> {
  return api.get<Skill[]>('/api/skills');
}
