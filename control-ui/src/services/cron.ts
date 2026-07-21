/**
 * Cron service.
 */
import { api } from './api.js';
import type { CronJob } from './types.js';

export async function getCronJobs(): Promise<CronJob[]> {
  return api.get<CronJob[]>('/api/cron');
}
