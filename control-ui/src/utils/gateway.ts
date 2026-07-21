let _idCounter = 0;
function uid() { return 'r' + (++_idCounter) + '-' + Math.random().toString(36).slice(2, 8); }

export class GatewayClient {
  constructor(opts) {
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
    this.ws = new WebSocket(this.url);
    // 等待网关发来 connect.challenge 后再发 connect（见 _handle）
    this.ws.addEventListener('open', () => {});
    this.ws.addEventListener('message', e => this._handle(String(e.data ?? '')));
    this.ws.addEventListener('close', e => {
      this.ws = null;
      this._flushPending(new Error(`closed (${e.code}): ${e.reason}`));
      this.onClose({ code: e.code, reason: e.reason });
      if (!this.closed) this._scheduleReconnect();
    });
    this.ws.addEventListener('error', () => {});
  }

  _scheduleReconnect() {
    this.backoffMs = Math.min(this.backoffMs * 1.7, 15000);
    setTimeout(() => this._connect(), this.backoffMs);
  }

  _flushPending(err) {
    for (const [, p] of this.pending) p.reject(err);
    this.pending.clear();
  }

  async _sendConnect() {
    if (this.connectSent) return;
    this.connectSent = true;
    this.backoffMs = 800;
    try {
      const result = await this.request('connect', {
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
      this.onHello(result);
    } catch (e) {
      this.onClose({ code: 4008, reason: String(e.message ?? e) });
      this.ws?.close(4008, 'connect failed');
    }
  }

  _handle(raw) {
    let msg;
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

  request(method, params) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error('not connected'));
    }
    const id = uid();
    this.ws.send(JSON.stringify({ type: 'req', id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }
}

export class GatewayError extends Error {
  constructor({ code, message, details }) {
    super(message);
    this.name = 'GatewayError';
    this.code = code;
    this.details = details;
  }
}
