/**
 * GatewayStore — reactive wrapper around GatewayClient.
 *
 * Provides a single source of truth for gateway connection state
 * and a clean API for making RPC calls.
 */

import { GatewayClient, GatewayError } from '../utils/gateway.js';
import type { GatewayHelloResult, GatewayEvent } from '../utils/gateway.js';

export type GatewaySnapshot = {
  connected: boolean;
  reconnecting: boolean;
  hello: GatewayHelloResult | null;
  lastError: string | null;
  lastErrorCode: string | null;
  client: GatewayClient | null;
};

type StoreListener = (snapshot: GatewaySnapshot) => void;

export type GatewayStoreOptions = {
  url: string;
  token?: string;
  password?: string;
  autoStart?: boolean;
};

export class GatewayStore {
  private _client: GatewayClient | null = null;
  private _connected = false;
  private _reconnecting = false;
  private _hello: GatewayHelloResult | null = null;
  private _lastError: string | null = null;
  private _lastErrorCode: string | null = null;
  private _listeners = new Set<StoreListener>();
  private _url: string;
  private _token?: string;
  private _password?: string;
  private _started = false;
  private _eventHandlers = new Map<string, Set<(payload: Record<string, unknown> | undefined) => void>>();

  constructor(opts: GatewayStoreOptions) {
    this._url = opts.url;
    this._token = opts.token;
    this._password = opts.password;
    if (opts.autoStart !== false) {
      this.start();
    }
  }

  get snapshot(): GatewaySnapshot {
    return {
      connected: this._connected,
      reconnecting: this._reconnecting,
      hello: this._hello,
      lastError: this._lastError,
      lastErrorCode: this._lastErrorCode,
      client: this._client,
    };
  }

  get client(): GatewayClient | null {
    return this._client;
  }

  get connected(): boolean {
    return this._connected;
  }

  get hello(): GatewayHelloResult | null {
    return this._hello;
  }

  start(): void {
    if (this._started) return;
    this._started = true;
    this._createClient();
  }

  stop(): void {
    this._started = false;
    this._client?.stop();
    this._client = null;
    this._connected = false;
    this._hello = null;
    this._notify();
  }

  connect(overrides?: { url?: string; token?: string; password?: string }): void {
    if (overrides?.url !== undefined) this._url = overrides.url;
    if (overrides?.token !== undefined) this._token = overrides.token;
    if (overrides?.password !== undefined) this._password = overrides.password;

    this._client?.stop();
    this._connected = false;
    this._hello = null;
    this._lastError = null;
    this._lastErrorCode = null;
    this._notify();

    if (this._started) {
      this._createClient();
    }
  }

  subscribe(listener: StoreListener): () => void {
    this._listeners.add(listener);
    // Immediately fire with current snapshot
    listener(this.snapshot);
    return () => { this._listeners.delete(listener); };
  }

  async request<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this._client || !this._connected) {
      throw new GatewayError({ code: 'NOT_CONNECTED', message: 'Gateway not connected' });
    }
    return this._client.request<T>(method, params);
  }

  onEvent(event: string, handler: (payload: Record<string, unknown> | undefined) => void): () => void {
    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, new Set());
    }
    this._eventHandlers.get(event)!.add(handler);
    return () => {
      const handlers = this._eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) this._eventHandlers.delete(event);
      }
    };
  }

  private _createClient(): void {
    this._reconnecting = false;
    this._client = new GatewayClient({
      url: this._url,
      token: this._token,
      password: this._password,
      onHello: (result) => {
        this._connected = true;
        this._reconnecting = false;
        this._hello = result;
        this._lastError = null;
        this._lastErrorCode = null;
        this._notify();
      },
      onClose: (info) => {
        this._connected = false;
        this._hello = null;
        if (info.code !== 4008) {
          // 4008 = connect failed (auth error etc), don't show as reconnecting
          this._reconnecting = this._started;
        }
        this._lastError = info.reason || `Connection closed (${info.code})`;
        this._lastErrorCode = String(info.code);
        this._notify();
      },
      onEvent: (msg) => {
        this._dispatchEvent(msg);
      },
    });
    this._client.start();
    this._notify();
  }

  private _dispatchEvent(msg: GatewayEvent): void {
    const handlers = this._eventHandlers.get(msg.event);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(msg.payload); } catch (e) { console.error('[store] event handler error:', e); }
      }
    }
    // Also dispatch to wildcard listeners
    const wildcardHandlers = this._eventHandlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try { handler({ event: msg.event, ...msg.payload }); } catch (e) { console.error('[store] wildcard handler error:', e); }
      }
    }
  }

  private _notify(): void {
    const snap = this.snapshot;
    for (const listener of this._listeners) {
      try { listener(snap); } catch (e) { console.error('[store] listener error:', e); }
    }
  }
}

// ── Factory ────────────────────────────────────────────────────

export function createGatewayStore(opts: GatewayStoreOptions): GatewayStore {
  return new GatewayStore(opts);
}

export function getDefaultGatewayUrl(): string {
  // Check localStorage first
  try {
    const stored = localStorage.getItem('openclaw.gateway.url');
    if (stored) return stored;
  } catch {}
  // Default to the real OpenClaw gateway (WebSocket at root path)
  const host = window.location.hostname || '127.0.0.1';
  return `ws://${host}:18789`;
}

export function getDefaultGatewayToken(): string | undefined {
  try {
    const stored = localStorage.getItem('openclaw.gateway.token');
    if (stored) return stored;
  } catch {}
  return 'dev-local-token-2026';
}
