/**
 * 共享 Gateway 连接单例
 *
 * 整个应用只维护一条到 Gateway 的 WebSocket 连接，
 * 各页面（dashboard / chat / ai / models…）通过 getSharedStore() 复用，
 * 避免每个页面各开一条连接。
 */

import { GatewayStore, createGatewayStore, getDefaultGatewayUrl, getDefaultGatewayToken } from './gateway-store.js';

let _shared: GatewayStore | null = null;

export function getSharedStore(): GatewayStore {
  if (!_shared) {
    _shared = createGatewayStore({
      url: getDefaultGatewayUrl(),
      token: getDefaultGatewayToken(),
      autoStart: true,
    });
  }
  return _shared;
}
