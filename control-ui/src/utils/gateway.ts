/**
 * OpenClaw 网关 WebSocket 客户端（protocol 4）。
 *
 * 握手流程：连接建立 → 网关推 connect.challenge → 客户端发 connect 请求
 * （带 token/password 鉴权）→ 网关回 res 完成握手。
 */

export type GatewayHelloResult = {
  protocol?: number;
  server?: { version?: string; [key: string]: unknown };
  [key: string]: unknown;
};

export type GatewayEvent = {
  type?: string;
  event: string;
  payload?: Record<string, unknown>;
};

export type GatewayCloseInfo = { code: number; reason?: string };

type GatewayClientOptions = {
  url: string;
  token?: string;
  password?: string;
  onEvent?: (msg: GatewayEvent) => void;
  onClose?: (info: GatewayCloseInfo) => void;
  onHello?: (result: GatewayHelloResult) => void;
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
};

let _idCounter = 0;
function uid() { return 'r' + (++_idCounter) + '-' + Math.random().toString(36).slice(2, 8); }

export class GatewayClient {
  url: string;
  token?: string;
  password?: string;
  onEvent: (msg: GatewayEvent) => void;
  onClose: (info: GatewayCloseInfo) => void;
  onHello: (result: GatewayHelloResult) => void;
  ws: WebSocket | null;
  pending: Map<string, PendingRequest>;
  closed: boolean;
  backoffMs: number;
  connectNonce: string | null;
  connectSent: boolean;

  constructor(opts: GatewayClientOptions) {
    this.url = opts.url;
    this.token = opts.token;
    this.password = opts.password;
    this.onEvent = opts.onEvent || (() => {});
    this.onClose = opts.onClose || (() => {});
    this.onHello = opts.onHello || (() => {});
    this.ws = null;
    this.pending = new Map();
    this.closed = false;
    this.backoffMs = 800;
    this.connectNonce = null;
    this.connectSent = false;
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  start() {
    this.closed = false;
    this._connect();
  }

  stop() {
    this.closed = true;
    this.ws?.close();
    this.ws = null;
    this._flushPending(new Error('client stopped'));
  }

  _connect() {
    if (this.closed) return;
    // 每次(重)连都是一次全新握手，必须重置 connect 状态。
    // 否则首次 connect 发出后 connectSent 永久为 true，之后重连收到
    // challenge 也不会再发 connect，网关握手超时掐线 → 无限重连死循环
    this.connectSent = false;
    this.connectNonce = null;
    const ws = new WebSocket(this.url);
    this.ws = ws;
    // 等待网关发来 connect.challenge 后再发 connect（见 _handle）
    ws.addEventListener('open', () => {});
    ws.addEventListener('message', e => this._handle(String(e.data ?? '')));
    ws.addEventListener('close', e => {
      this.ws = null;
      this._flushPending(new Error(`closed (${e.code}): ${e.reason}`));
      this.onClose({ code: e.code, reason: e.reason });
      if (!this.closed) this._scheduleReconnect();
    });
    ws.addEventListener('error', () => {});
  }

  _scheduleReconnect() {
    this.backoffMs = Math.min(this.backoffMs * 1.7, 15000);
    setTimeout(() => this._connect(), this.backoffMs);
  }

  _flushPending(err: Error) {
    for (const [, p] of this.pending) p.reject(err);
    this.pending.clear();
  }

  async _sendConnect() {
    if (this.connectSent) return;
    this.connectSent = true;
    try {
      const result = await this.request<GatewayHelloResult>('connect', {
        minProtocol: 4,
        maxProtocol: 4,
        client: { id: 'openclaw-control-ui', version: '1.0.0', platform: navigator.platform ?? 'web', mode: 'webchat' },
        role: 'operator',
        scopes: ['operator.admin', 'operator.read', 'operator.write', 'operator.approvals', 'operator.pairing'],
        caps: ['tool-events'],
        userAgent: navigator.userAgent,
        locale: navigator.language,
        ...(this.token ? { auth: { token: this.token } } : this.password ? { auth: { password: this.password } } : {}),
      });
      // 连接成功才重置退避；鉴权持续失败时应继续拉长重试间隔
      this.backoffMs = 800;
      this.onHello(result);
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      this.onClose({ code: 4008, reason });
      this.ws?.close(4008, 'connect failed');
    }
  }

  _handle(raw: string) {
    let msg: any;
    try { msg = JSON.parse(raw); } catch { return; }
    if (msg.type === 'event') {
      if (msg.event === 'connect.challenge') {
        this.connectNonce = msg.payload?.nonce ?? null;
        this._sendConnect();
        return;
      }
      try { this.onEvent(msg); } catch (e) { console.error('[gw] event error:', e); }
      return;
    }
    if (msg.type === 'res') {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.payload);
      else p.reject(new GatewayError({ code: msg.error?.code ?? 'UNAVAILABLE', message: msg.error?.message ?? 'request failed', details: msg.error?.details }));
    }
  }

  request<T = unknown>(method: string, params?: unknown): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('not connected'));
    }
    const id = uid();
    this.ws.send(JSON.stringify({ type: 'req', id, method, params }));
    return new Promise<T>((resolve, reject) => {
      // payload 由网关决定，到调用方手上才断言为 T，这里按 unknown 存
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
    });
  }
}

export class GatewayError extends Error {
  code: string;
  details?: unknown;

  constructor({ code, message, details }: { code: string; message: string; details?: unknown }) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
    this.details = details;
  }
}
