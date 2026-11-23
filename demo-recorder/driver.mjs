import { CDP, sleep } from "./cdp.mjs";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from "node:fs";

export const DIR = new URL(".", import.meta.url).pathname;
// Filled in by fitToWindow(). The emulated viewport MUST match the real window's
// content box: when it does not, Chrome scales the page to fit, which makes the
// window visibly flicker and — worse — rescales injected input coordinates, so
// clicks and drags land somewhere other than where they were aimed.
export const VIEW = { width: 1280, height: 720, scale: 1.5, ready: false };
export const OUTPUT_WIDTH = 1920;
export const HARNESS = readFileSync(DIR + "harness.js", "utf8");

// Width/height straight out of a JPEG's SOF marker, so the recorder can measure
// a probe frame without shelling out to anything.
export function jpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

// Make the real window 16:9 and emulate exactly that. The emulated viewport has
// to equal the window's content box: a smaller override is not inherited reliably
// by the presenter popup, which then lays out taller than the capture clip and
// loses the foot of every slide and the picker strip off the bottom.
//
// Chrome ignores --window-size, and a MAXIMIZED window ignores bounds changes
// altogether -- the state has to be cleared in a call of its own first, because
// windowState cannot be combined with left/top/width/height in one call.
export async function fitToWindow(cdp, sessionId, targetWidth = 1504, ratio = 16 / 9) {
  const read = async () => (await cdp.send("Runtime.evaluate",
    { expression: "[innerWidth, innerHeight]", returnByValue: true }, sessionId)).result.value;
  const { windowId } = await cdp.send("Browser.getWindowForTarget", {}, sessionId);
  await cdp.send("Browser.setWindowBounds", { windowId, bounds: { windowState: "normal" } });
  await sleep(300);
  const setBounds = async (width, height) => {
    await cdp.send("Browser.setWindowBounds", { windowId, bounds: { left: 0, top: 25, width, height } });
    await sleep(420);
    return read();
  };
  let [w, h] = await setBounds(targetWidth, 980);
  const furniture = 980 - h;                       // tab strip + toolbar
  for (let i = 0; i < 2; i++) {
    const want = Math.round(w / ratio);
    if (h === want) break;
    [w, h] = await setBounds(w, want + furniture);
  }
  // Park the window almost entirely off the left edge. Chrome fires a synthetic
  // pointermove at the user's REAL pointer whenever the page relayouts, so a
  // window under their mouse is a window they are unwittingly driving: with the
  // pointer near the foot the app lifts the slide picker over the slide mid-take,
  // and a click meant for a slide link lands on a thumbnail instead. Out of reach
  // is the fix; headless also works but captures a third slower.
  if (!process.env.HEADLESS) {
    await cdp.send("Browser.setWindowBounds",
      { windowId, bounds: { left: -(w - 8), top: 25 } }).catch(() => {});
    await sleep(400);
  }
  VIEW.width = w; VIEW.height = h;
  VIEW.scale = Math.round((OUTPUT_WIDTH / w) * 10000) / 10000;
  VIEW.ready = true;
  await cdp.send("Emulation.setDeviceMetricsOverride",
    { width: w, height: h, deviceScaleFactor: VIEW.scale, mobile: false }, sessionId);
  return { ...VIEW, furniture, ratio: +(w / h).toFixed(3),
           capture: [Math.round(w * VIEW.scale), Math.round(h * VIEW.scale)] };
}

export async function startSite(port, root) {
  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1",
    "--directory", root], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${port}/index.html`); return server; } catch { await sleep(200); }
  }
  throw new Error("site did not start");
}

export async function launch({ port = 9345, profile, downloads }) {
  // A fresh profile per run. Reusing one path means a Chrome left over from an
  // earlier run can still be writing into it, and the delete fails with ENOTEMPTY
  // before the run even starts -- which looks like a successful no-op take.
  profile ??= `${DIR}chrome-profile-${Date.now()}`;
  for (const stale of readdirSync(DIR).filter(n => n.startsWith("chrome-profile"))) {
    try { rmSync(DIR + stale, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }); }
    catch { /* still in use by a browser we did not start; leave it */ }
  }
  const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
    `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--no-service-autorun",
    "--disable-features=Translate,MediaRouter,OptimizationGuideModelDownloading",
    "--disable-backgrounding-occluded-windows", "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling", "--hide-crash-restore-bubble",
    // HEADLESS=1 forces headless. The default is a headed window parked almost
    // entirely off-screen, which captures about half as fast again as headless
    // while still being out of reach of the user's pointer -- see fitToWindow.
    ...(process.env.HEADLESS ? ["--headless=new"] : []),
    "about:blank",
  ], { stdio: "ignore" });
  let version;
  for (let i = 0; i < 80; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; }
    catch { await sleep(250); }
  }
  if (!version) throw new Error("chrome did not start");
  const cdp = await CDP.connect(version.webSocketDebuggerUrl);
  const pages = new Map();

  cdp.on("Target.attachedToTarget", async ({ sessionId, targetInfo, waitingForDebugger }) => {
    if (targetInfo.type !== "page") return;
    pages.set(sessionId, targetInfo);
    // Resume FIRST. A target paused at waitForDebuggerOnStart does not answer
    // Page.enable either, so doing the setup first just hangs on the first call.
    if (waitingForDebugger)
      await cdp.send("Runtime.runIfWaitingForDebugger", {}, sessionId)
        .catch(e => console.error("resume failed:", e.message));
    for (const [method, params] of [
      ["Page.enable", {}],
      ["Runtime.enable", {}],
      ["Page.setBypassCSP", { enabled: true }],
      ...(VIEW.ready ? [["Emulation.setDeviceMetricsOverride",
        { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.scale, mobile: false }]] : []),
    ]) await cdp.send(method, params, sessionId).catch(e => console.error("attach", method, e.message));
  });
  await cdp.send("Target.setAutoAttach",
    { autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
  if (downloads) {
    mkdirSync(downloads, { recursive: true });
    await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  }
  return { chrome, cdp, pages, wsUrl: version.webSocketDebuggerUrl };
}

// --- page helpers -----------------------------------------------------------
export function page(cdp, sessionId) {
  const call = (method, params) => cdp.send(method, params, sessionId);
  const api = {
    sessionId,
    call,
    async eval(expression, awaitPromise = true) {
      const r = await call("Runtime.evaluate",
        { expression, awaitPromise, returnByValue: true, userGesture: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed");
      return r.result.value;
    },
    demo: (body, awaitPromise = true) => api.eval(`(async () => { ${body} })()`, awaitPromise),
    box: sel => api.eval(`__demo.box(${JSON.stringify(sel)})`),
    // Previews, slide counts and sizes arrive asynchronously and move rows as
    // they land, so never aim at a coordinate until the layout has stopped.
    async settle(quiet = 450, timeout = 40000) {
      const stop = Date.now() + timeout;
      let last = null;
      while (Date.now() < stop) {
        const now = await api.eval(`JSON.stringify([__demo.rows().map(r => r.y),
          document.documentElement.scrollHeight,
          [...document.querySelectorAll('#slides img')].filter(i => !i.hidden).length])`);
        if (now === last) return true;
        last = now;
        await sleep(quiet);
      }
      return false;
    },
    async inject() {
      await api.until("document.readyState !== 'loading'");
      await api.eval(HARNESS, false);
      await api.until("!!window.__demo");
    },
    async until(expression, timeout = 20000, every = 100) {
      const stop = Date.now() + timeout;
      while (Date.now() < stop) {
        if (await api.eval(expression).catch(() => false)) return true;
        await sleep(every);
      }
      throw new Error("timed out waiting for " + expression);
    },
    // --- trusted input -------------------------------------------------
    // CDP input coordinates live in the real window's space, which is not the
    // emulated viewport's space when setDeviceMetricsOverride has to scale the
    // page down to fit. Probe two points and solve for the mapping rather than
    // assuming one.
    sx: 1, sy: 1, ox: 0, oy: 0,
    async calibrate() {
      // Read the coordinates the page actually receives, from the event itself.
      // The drawn pointer is placed explicitly now, so it cannot be used to
      // measure this -- it would always report exactly what we asked for.
      const probe = async (x, y) => {
        await api.eval("window.__probe = null; addEventListener('pointermove'," +
          " e => { window.__probe = [e.clientX, e.clientY]; }, { once: true, capture: true })", false);
        await call("Input.dispatchMouseEvent",
          { type: "mouseMoved", x, y, buttons: 0, button: "none" });
        for (let i = 0; i < 20; i++) {
          const got = await api.eval("window.__probe");
          if (got) return { x: got[0], y: got[1] };
          await sleep(25);
        }
        return null;
      };
      for (let attempt = 0; attempt < 3; attempt++) {
        const a = await probe(100, 100);
        const b = await probe(600, 500);
        if (!a || !b) continue;
        const sx = (b.x - a.x) / 500, sy = (b.y - a.y) / 400;
        // A stray synthetic move -- Chrome fires one at the user's real mouse
        // position on relayout -- can land in a probe and skew it. Reject the
        // implausible rather than silently aiming everything a bit wrong.
        if (![sx, sy].every(v => isFinite(v) && v > 0.2 && v < 5)) continue;
        api.sx = sx; api.sy = sy;
        api.ox = a.x - 100 * sx; api.oy = a.y - 100 * sy;
        return { sx, sy, ox: api.ox, oy: api.oy };
      }
      throw new Error("input calibration failed");
    },
    // page-space point -> the coordinates to hand Input.dispatchMouseEvent
    pt(X, Y) { return { x: (X - api.ox) / api.sx, y: (Y - api.oy) / api.sy }; },
    async move(X, Y, buttons = 0) {
      const { x, y } = api.pt(X, Y);
      await call("Input.dispatchMouseEvent",
        { type: "mouseMoved", x, y, buttons, button: buttons ? "left" : "none" });
      // Place the drawn pointer rather than letting it follow events: see the
      // note in harness.js about Chrome's synthetic moves.
      await call("Runtime.evaluate",
        { expression: `__demo.place(${X}, ${Y})`, returnByValue: false });
    },
    async glide(X1, Y1, ms, buttons = 0) {
      const from = await api.eval("__demo.at()");
      const steps = Math.max(2, Math.round(ms / 16));
      const ease = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
      const t0 = Date.now();
      for (let i = 1; i <= steps; i++) {
        const e = ease(i / steps);
        await api.move(from.x + (X1 - from.x) * e, from.y + (Y1 - from.y) * e, buttons);
        const due = t0 + (ms * i) / steps, now = Date.now();
        if (due > now) await sleep(due - now);
      }
    },
    async down(X, Y) {
      const { x, y } = api.pt(X, Y);
      await call("Input.dispatchMouseEvent",
        { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
    },
    async up(X, Y, clickCount = 1) {
      const { x, y } = api.pt(X, Y);
      await call("Input.dispatchMouseEvent",
        { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount });
    },
    async click(X, Y, clickCount = 1) {
      const { x, y } = api.pt(X, Y);
      for (let i = 1; i <= clickCount; i++) {
        await call("Input.dispatchMouseEvent",
          { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: i });
        await sleep(28);
        await call("Input.dispatchMouseEvent",
          { type: "mouseReleased", x, y, button: "left", buttons: 0, clickCount: i });
        if (i < clickCount) await sleep(45);
      }
    },
    async key(key, { code, vk, text, mods = 0 } = {}) {
      const base = { key, code: code ?? key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers: mods };
      await call("Input.dispatchKeyEvent", { ...base, type: text ? "keyDown" : "rawKeyDown", text });
      await call("Input.dispatchKeyEvent", { ...base, type: "keyUp" });
    },
    async type(text, perChar = 55) {
      for (const ch of text) {
        await call("Input.insertText", { text: ch });
        await sleep(perChar);
      }
    },
  };
  return api;
}

export const KEYS = {
  ArrowRight: { code: "ArrowRight", vk: 39 },
  ArrowLeft: { code: "ArrowLeft", vk: 37 },
  Escape: { code: "Escape", vk: 27 },
  Tab: { code: "Tab", vk: 9 },
  Enter: { code: "Enter", vk: 13 },
  g: { code: "KeyG", vk: 71, text: "g" },
  b: { code: "KeyB", vk: 66, text: "b" },
  "?": { code: "Slash", vk: 191, text: "?", mods: 8 },
};

// --- capture ----------------------------------------------------------------
// The recorder gets its own socket. Sharing one with the driver puts ~200 KB
// screenshot payloads in front of every input command, which delays them
// enough that drags land in the wrong place.
export class Recorder {
  constructor(wsUrl, frameDir, { paired = false } = {}) {
    this.wsUrl = wsUrl; this.dir = frameDir; this.paired = paired;
    this.n = 0; this.times = []; this.running = false; this.cuts = [];
    this.sessions = new Map();
    rmSync(frameDir, { recursive: true, force: true });
    mkdirSync(frameDir, { recursive: true });
  }
  async init() { this.cdp = await CDP.connect(this.wsUrl); }
  async attach(targetId) {
    if (!this.sessions.has(targetId)) {
      const { sessionId } = await this.cdp.send("Target.attachToTarget", { targetId, flatten: true });
      // The driver owns viewport metrics. Capture the viewport itself rather
      // than a scaled clip: a clip taken during a resize can tile Chrome’s old
      // compositor surface into the new dimensions.
      this.sessions.set(targetId, sessionId);
    }
    return { session: this.sessions.get(targetId) };
  }
  async focus(targetId) {
    this.paused = true;
    try {
      await this.pendingCapture;
      Object.assign(this, await this.attach(targetId));
    } finally { this.paused = false; }
  }
  async pair(targetId) {
    this.paused = true;
    try {
      await this.pendingCapture;
      this.companion = targetId ? await this.attach(targetId) : null;
    } finally { this.paused = false; }
  }
  start() {
    this.running = true; this.t0 = Date.now();
    this.loop = (async () => {
      while (this.running) {
        if (!this.session || this.paused) { await sleep(10); continue; }
        try {
          // Capture both tabs in the same iteration, with one shared timestamp
          // and edit decision list. Independent recordings drift at every cut.
          const capture = ({ session }) => this.cdp.send("Page.captureScreenshot", {
            format: "jpeg", quality: 90, fromSurface: true, captureBeyondViewport: false,
          }, session);
          this.pendingCapture = Promise.all([
            capture(this), this.companion ? capture(this.companion) : null,
          ]);
          const [main, other] = await this.pendingCapture;
          for (const frame of [main, other].filter(Boolean)) {
            const size = jpegSize(Buffer.from(frame.data, 'base64'));
            if (size && (size.width * 9 !== size.height * 16))
              throw new Error(`Unexpected capture aspect ratio: ${size.width}×${size.height}`);
          }
          const name = String(this.n).padStart(5, "0");
          writeFileSync(`${this.dir}/f${name}.jpg`, Buffer.from(main.data, "base64"));
          if (this.paired) writeFileSync(`${this.dir}/a${name}.jpg`, Buffer.from(other?.data ?? main.data, "base64"));
          this.times.push(Date.now() - this.t0);
          this.n++;
        } catch (error) { this.error = error; this.running = false; }
      }
    })();
  }
  // Runs `work` and drops what was captured while it ran, so waiting on the
  // network reads as a straight cut in the video: the Google preview, the PDF
  // download, a page reload. `keep` ms of the start survive, so the click that
  // started it is still seen landing.
  async cut(work, keep = 120) {
    const from = Date.now() - this.t0 + keep;
    try {
      return await work();
    } finally {
      const to = Date.now() - this.t0;
      if (to > from) this.cuts.push([from, to]);
    }
  }
  async stop() { this.running = false; await this.loop; this.cdp.close();
    if (this.error) throw this.error;
    return { frames: this.n, ms: Date.now() - this.t0 }; }
  // Frames inside a cut are dropped, and the time after it moves up by the
  // cut's length, so each surviving frame keeps its real duration.
  writeList(path, prefix = "f") {
    const inCut = t => this.cuts.some(([a, b]) => t > a && t < b);
    const shift = t => this.cuts.reduce((sum, [a, b]) => sum + (t >= b ? b - a : 0), 0);
    const kept = [];
    for (let i = 0; i < this.n; i++) {
      if (!inCut(this.times[i])) kept.push({ i, t: this.times[i] - shift(this.times[i]) });
    }
    const lines = [];
    kept.forEach(({ i, t }, k) => {
      const next = k + 1 < kept.length ? kept[k + 1].t : t + 40;
      lines.push(`file '${prefix}${String(i).padStart(5, "0")}.jpg'`,
        `duration ${(Math.max(next - t, 1) / 1000).toFixed(4)}`);
    });
    lines.push(`file '${prefix}${String(kept.at(-1).i).padStart(5, "0")}.jpg'`);
    writeFileSync(path, lines.join("\n") + "\n");
    return { frames: kept.length, cutMs: this.cuts.reduce((sum, [a, b]) => sum + b - a, 0) };
  }
}
