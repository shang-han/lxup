/**
 * 模型配置读取工具 — 与 models-page.ts 共用同一份 localStorage 数据
 *
 * models-page 把配置写入 key `openclaw.models.config`，结构：
 *   { providers: [{ id, name, baseUrl, apiKey, apiType, models: [{ id, isPrimary }] }] }
 *
 * 本模块负责把这份配置解析成「当前可用模型」，供 AI 助手 / 实时聊天页调用。
 */

export type ProviderConfig = {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  apiType: string;
  models: Array<{ id: string; isPrimary: boolean }>;
};

/** 归一化后的「可用模型」——发给 Gateway 的就是这个结构 */
export type ResolvedModel = {
  providerId: string;
  providerName: string;
  baseUrl: string;
  apiKey: string;
  apiType: string;
  model: string;
  isPrimary: boolean;
};

export const MODELS_STORAGE_KEY = 'openclaw.models.config';

/** 用户在聊天页头部手动选中的模型（key = `${providerId}::${model}`） */
const SELECTED_STORAGE_KEY = 'openclaw.models.selected';

export function loadProviders(): ProviderConfig[] {
  try {
    const raw = localStorage.getItem(MODELS_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.providers)) return [];
    return data.providers.map((p: any) => ({
      id: String(p.id ?? ''),
      name: String(p.name ?? ''),
      baseUrl: String(p.baseUrl ?? ''),
      apiKey: String(p.apiKey ?? ''),
      apiType: String(p.apiType ?? 'openai'),
      models: Array.isArray(p.models)
        ? p.models.map((m: any) => ({ id: String(m.id ?? ''), isPrimary: !!m.isPrimary }))
        : [],
    }));
  } catch {
    return [];
  }
}

/** 展开成所有「可用模型」列表（一个服务商 N 个模型 → N 条） */
export function listModels(): ResolvedModel[] {
  const out: ResolvedModel[] = [];
  for (const p of loadProviders()) {
    for (const m of p.models) {
      out.push({
        providerId: p.id,
        providerName: p.name,
        baseUrl: p.baseUrl,
        apiKey: p.apiKey,
        apiType: p.apiType,
        model: m.id,
        isPrimary: m.isPrimary,
      });
    }
  }
  return out;
}

function modelKey(m: { providerId: string; model: string }): string {
  return `${m.providerId}::${m.model}`;
}

/** 当前聊天要用哪个模型：优先用户手动选择，其次主模型，最后第一个 */
export function getActiveModel(): ResolvedModel | null {
  const all = listModels();
  if (!all.length) return null;

  // 1. 用户手动选择
  try {
    const sel = localStorage.getItem(SELECTED_STORAGE_KEY);
    if (sel) {
      const found = all.find(m => modelKey(m) === sel);
      if (found) return found;
    }
  } catch { /* ignore */ }

  // 2. 主模型
  const primary = all.find(m => m.isPrimary);
  if (primary) return primary;

  // 3. 第一个
  return all[0];
}

/** 记录用户在聊天页头部选择的模型 */
export function setSelectedModel(m: ResolvedModel): void {
  try {
    localStorage.setItem(SELECTED_STORAGE_KEY, modelKey(m));
  } catch { /* ignore */ }
}

export function hasAnyModel(): boolean {
  return listModels().length > 0;
}
