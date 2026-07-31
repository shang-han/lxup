/**
 * 设备指纹
 *
 * 最终产品形态（Tauri v2 壳）下由 Rust 侧采集硬件特征（CPU/磁盘/主板）
 * 经 IPC 传入，见 docs/方案.md §4.5。Tauri 未接入前的浏览器端兜底：
 * 持久化在 localStorage 的 UUID，同一浏览器配置内保持稳定。
 *
 * 注意：不要混入 UA/分辨率等易变信号——指纹漂移会在浏览器升级后触发
 * 「设备变更」流程，而激活码已绑旧指纹，服务器会拒绝，导致误锁。
 * 稳定性 > 熵。换 Tauri 硬件指纹后此兜底自动让位。
 */

const FP_KEY = 'lxup.device.fingerprint';

export async function getDeviceFingerprint(): Promise<string> {
  // 优先 Tauri IPC（Rust 侧注册 get_device_fingerprint 命令后自动生效）
  try {
    const tauri = (window as any).__TAURI__;
    if (tauri?.core?.invoke) {
      const fp = await tauri.core.invoke('get_device_fingerprint');
      if (typeof fp === 'string' && fp) return fp;
    }
  } catch {
    /* 命令未注册 → 回退浏览器指纹 */
  }

  // 浏览器兜底：持久化 UUID
  try {
    let fp = localStorage.getItem(FP_KEY);
    if (!fp) {
      fp = 'web-' + ((crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem(FP_KEY, fp);
    }
    return fp;
  } catch {
    return 'web-anonymous';
  }
}

/** 设备展示名（激活时上报，便于客服辨认机器） */
export function getDeviceName(): string {
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown';
  return `Web · ${platform}`;
}
