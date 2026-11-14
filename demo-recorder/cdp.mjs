// Minimal CDP client over Node's built-in WebSocket. No dependencies.
export class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = new Map(); }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = e => c._onMessage(JSON.parse(e.data));
    return c;
  }
  _onMessage(msg) {
    if (msg.id !== undefined) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message + " :: " + JSON.stringify(msg.error))) : p.resolve(msg.result);
      return;
    }
    const key = (msg.sessionId || "") + "|" + msg.method;
    for (const fn of this.handlers.get(key) || []) fn(msg.params);
    for (const fn of this.handlers.get("*|" + msg.method) || []) fn(msg.params, msg.sessionId);
  }
  // Every call gets a deadline. Without one, a command sent to a target that is
  // still paused at waitForDebuggerOnStart simply never answers, and the whole
  // run hangs with no clue as to where.
  send(method, params = {}, sessionId, timeout = 45000) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout after ${timeout}ms: ${method}`));
      }, timeout);
      const done = fn => value => { clearTimeout(timer); fn(value); };
      this.pending.set(id, { resolve: done(resolve), reject: done(reject) });
      this.ws.send(JSON.stringify(payload));
    });
  }
  on(method, fn, sessionId) {
    const key = (sessionId === undefined ? "*" : sessionId) + "|" + method;
    if (!this.handlers.has(key)) this.handlers.set(key, []);
    this.handlers.get(key).push(fn);
  }
  close() { this.ws.close(); }
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
