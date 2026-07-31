/**
 * 网络小工具
 */

/** 带超时控制的 fetch（超时抛 AbortError） */
export async function fetchTimeout(
  url: string,
  opts: RequestInit = {},
  ms = 5000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
