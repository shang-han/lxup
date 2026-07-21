/**
 * Dashboard service.
 */
import { api } from './api.js';
import type { Snapshot, Instance } from './types.js';

export async function getSnapshot(): Promise<Snapshot> {
  return api.get<Snapshot>('/api/snapshot');
}

export async function getInstances(): Promise<Instance[]> {
  return api.get<Instance[]>('/api/instances');
}
