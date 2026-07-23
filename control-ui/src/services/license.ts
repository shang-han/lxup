/**
 * License 客户端 —— 经 Sidecar（:7889）访问 /api/license/*
 *
 * Sidecar 负责本地 token 加密存储、离线宽限（3 天）、设备变更检测，
 * 再转发到云端 License Server（见 sidecar/services/license.py）。
 * 本模块只做端点封装，响应结构对应 sidecar/routes/license.py 的 LicenseResponse。
 */

import { fetchTimeout } from '../utils/net.js';
import { getDeviceName } from '../utils/device.js';

/** 授权状态（与 sidecar LicenseStatus 枚举一致） */
export type LicenseStatus =
  | 'ok'                 // 已激活，正常使用
  | 'not_activated'      // 未激活，需输入激活码
  | 'device_changed'     // 硬件变更，需联网重验 / 重新激活
  | 'blocked_offline'    // 离线超期（>3天），需联网
  | 'revoked'            // 已被服务器吊销
  | 'error';             // 内部错误 / 不可达

export interface LicenseResponse {
  success: boolean;
  status: LicenseStatus;
  device_name?: string | null;
  days_offline?: number;
  offline_remaining?: number;
  message?: string;
}

export function sidecarBaseUrl(): string {
  const host = (typeof window !== 'undefined' && window.location.hostname) || '127.0.0.1';
  return `http://${host}:7889`;
}

/** Sidecar 存活探测（/health 免认证） */
export async function checkSidecarHealth(): Promise<boolean> {
  try {
    const res = await fetchTimeout(`${sidecarBaseUrl()}/health`, {}, 4000);
    return res.ok;
  } catch {
    return false;
  }
}

// activate/validate 会触发 Sidecar → 云端 License Server 的转发，
// Sidecar 内部 httpx 超时 15s，这里放宽到 25s。
const LICENSE_TIMEOUT = 25000;

async function licenseRequest(path: string, init: RequestInit): Promise<LicenseResponse> {
  const res = await fetchTimeout(`${sidecarBaseUrl()}${path}`, init, LICENSE_TIMEOUT);
  // 业务失败（激活码无效、已绑其他设备、被吊销…）也是带 LicenseResponse 正文的；
  // 但 FastAPI 参数校验错误（422）返回 {detail: [...]}，需归一化
  const body = await res.json().catch(() => null);
  if (body && typeof body.status === 'string') return body as LicenseResponse;
  const detail = typeof body?.detail === 'string' ? body.detail : `HTTP ${res.status}`;
  return { success: false, status: 'error', message: detail };
}

/** 查询本地授权状态（不触发联网校验，启动检查用） */
export function getLicenseStatus(fingerprint: string): Promise<LicenseResponse> {
  return licenseRequest(
    `/api/license/status?device_fingerprint=${encodeURIComponent(fingerprint)}`,
    { method: 'GET' },
  );
}

/** 激活：激活码 + 设备指纹 → 绑定设备、本地加密存储 token */
export function activateLicense(fingerprint: string, code: string): Promise<LicenseResponse> {
  return licenseRequest('/api/license/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      device_fingerprint: fingerprint,
      device_name: getDeviceName(),
    }),
  });
}

/** 手动联网重验：离线超期 / 设备变更后恢复授权 */
export function validateLicense(fingerprint: string): Promise<LicenseResponse> {
  return licenseRequest('/api/license/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_fingerprint: fingerprint }),
  });
}
