const B = /* @__PURE__ */ new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"]
]);
class q {
  constructor(t) {
    this.namespaceURI = null, this.attributes = [], this.childNodes = [], this.nextElementSibling = null, this.namespaceBindings = B, this.tagName = t;
    const n = t.indexOf(":");
    this.prefix = n < 0 ? null : t.slice(0, n), this.localName = n < 0 ? t : t.slice(n + 1);
  }
  resolveNamespaces(t) {
    let n;
    for (const e of this.attributes)
      e.name === "xmlns" ? (n ?? (n = new Map((t == null ? void 0 : t.namespaceBindings) ?? B))).set("", e.value) : e.prefix === "xmlns" && (n ?? (n = new Map((t == null ? void 0 : t.namespaceBindings) ?? B))).set(e.localName, e.value);
    this.namespaceBindings = n ?? (t == null ? void 0 : t.namespaceBindings) ?? B, this.namespaceURI = this.lookupNamespaceURI(this.prefix);
    for (const e of this.attributes)
      e.name === "xmlns" || e.prefix === "xmlns" ? e.namespaceURI = "http://www.w3.org/2000/xmlns/" : e.prefix && (e.namespaceURI = this.lookupNamespaceURI(e.prefix));
  }
  get firstElementChild() {
    for (const t of this.childNodes) if (typeof t != "string") return t;
    return null;
  }
  get children() {
    return this.childNodes.filter((t) => typeof t != "string");
  }
  getAttribute(t) {
    for (const n of this.attributes) if (n.name === t) return n.value;
    return null;
  }
  lookupNamespaceURI(t) {
    const n = t ?? "";
    return this.namespaceBindings.get(n) || null;
  }
  get textContent() {
    let t = "";
    for (const n of this.childNodes) t += typeof n == "string" ? n : n.textContent;
    return t;
  }
  /** 只支持 '*'，与解析器里的用法一致 */
  getElementsByTagName(t) {
    const n = [], e = (a) => {
      for (const u of a.children)
        (t === "*" || u.localName === t || u.tagName === t) && n.push(u), e(u);
    };
    return e(this), n;
  }
}
const G = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function Y(i) {
  return i.indexOf("&") < 0 ? i : i.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (t, n) => {
    if (n[0] === "#") {
      const e = n[1] === "x" || n[1] === "X" ? parseInt(n.slice(2), 16) : parseInt(n.slice(1), 10);
      return Number.isFinite(e) && e >= 0 ? String.fromCodePoint(e) : t;
    }
    return G[n] ?? t;
  });
}
function J(i) {
  let t = 0;
  const n = i.length, e = [];
  let a = null;
  const u = (r, h) => {
    const w = r.children;
    w.length && (w[w.length - 1].nextElementSibling = h), r.childNodes.push(h);
  };
  for (; t < n; ) {
    const r = i.indexOf("<", t);
    if (r < 0) break;
    if (r > t) {
      const s = i.slice(t, r);
      e.length && s.trim() ? e[e.length - 1].childNodes.push(Y(s)) : e.length && s.includes(" ") && e[e.length - 1].childNodes.push(s);
    }
    if (i.startsWith("<!--", r)) {
      const s = i.indexOf("-->", r + 4);
      t = s < 0 ? n : s + 3;
      continue;
    }
    if (i.startsWith("<![CDATA[", r)) {
      const s = i.indexOf("]]>", r + 9), m = i.slice(r + 9, s < 0 ? n : s);
      e.length && e[e.length - 1].childNodes.push(m), t = s < 0 ? n : s + 3;
      continue;
    }
    if (i.startsWith("<?", r) || i.startsWith("<!", r)) {
      const s = i.indexOf(">", r);
      t = s < 0 ? n : s + 1;
      continue;
    }
    if (i[r + 1] === "/") {
      const s = i.indexOf(">", r);
      if (s < 0) break;
      e.pop(), t = s + 1;
      continue;
    }
    let h = r + 1, w = "";
    for (; h < n; ) {
      const s = i[h];
      if (w)
        s === w && (w = "");
      else if (s === '"' || s === "'") w = s;
      else if (s === ">") break;
      h++;
    }
    if (h >= n) break;
    const k = i[h - 1] === "/", p = i.slice(r + 1, k ? h - 1 : h);
    let l = 0;
    for (; l < p.length && !/[\s/]/.test(p[l]); ) l++;
    const o = new q(p.slice(0, l)), f = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    f.lastIndex = l;
    let c;
    for (; (c = f.exec(p)) !== null; ) {
      const s = c[1], m = s.indexOf(":");
      o.attributes.push({
        name: s,
        localName: m < 0 ? s : s.slice(m + 1),
        prefix: m < 0 ? null : s.slice(0, m),
        namespaceURI: null,
        value: Y(c[3] ?? c[4] ?? "")
      });
    }
    o.resolveNamespaces(e[e.length - 1]), e.length ? u(e[e.length - 1], o) : a || (a = o), k || e.push(o), t = h + 1;
  }
  if (!a) throw new Error("XML 解析失败：未找到根元素");
  return a;
}
const D = typeof DOMParser < "u" ? new DOMParser() : null;
function W(i) {
  if (!D)
    return J(i);
  const t = D.parseFromString(i, "application/xml"), n = t.getElementsByTagName("parsererror")[0];
  if (n) throw new Error("XML 解析失败: " + (n.textContent ?? "").slice(0, 200));
  return t.documentElement;
}
function U(i, t) {
  const n = [];
  if (!i) return n;
  for (let e = i.firstElementChild; e; e = e.nextElementSibling)
    e.localName === t && n.push(e);
  return n;
}
function T(i, t) {
  if (!i) return null;
  for (let n = i.firstElementChild; n; n = n.nextElementSibling)
    if (n.localName === t) return n;
  return null;
}
function g(i, t) {
  if (!i) return null;
  if (t.includes(":")) {
    for (const a of Array.from(i.attributes)) if (a.name === t) return a.value;
    const e = t.split(":")[1];
    for (const a of Array.from(i.attributes)) if (a.localName === e) return a.value;
    return null;
  }
  const n = i.getAttribute(t);
  if (n !== null) return n;
  for (const e of Array.from(i.attributes)) if (e.localName === t) return e.value;
  return null;
}
const $ = "http://www.w3.org/2003/InkML", P = (i, t) => [...i.getElementsByTagName("*")].filter((n) => n.namespaceURI === $ && n.localName === t);
function _(i, t) {
  if (i.length > 4e6) throw new Error("InkML 采样数据超限");
  const n = [], e = [], a = [], u = [], r = t.indexOf("X"), h = t.indexOf("Y");
  if (r < 0 || h < 0 || t.length > 32) throw new Error("InkML 通道不支持编辑");
  for (const w of i.split(",")) {
    if (!w.trim()) continue;
    const k = /\s*([!'\"]?)\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\*)/gy;
    let p = 0, l = 0;
    for (; p < w.length && w.slice(p).trim(); ) {
      k.lastIndex = p;
      const o = k.exec(w);
      if (!o || l >= t.length) throw new Error("InkML 含无法编辑的采样编码");
      p = k.lastIndex;
      const [, f, c] = o;
      if (c !== "*") {
        const s = Number(c);
        if (!Number.isFinite(s)) throw new Error("InkML 非有限采样值");
        const m = n.length && (f || u[l]) || "!";
        u[l] = m, m === "'" ? (a[l] = s, e[l] = (e[l] ?? 0) + s) : m === '"' ? (a[l] = (a[l] ?? 0) + s, e[l] = (e[l] ?? 0) + a[l]) : (e[l] = s, a[l] = 0);
      }
      if (!Number.isFinite(e[l])) throw new Error("InkML 缺少首点通道值");
      l++;
    }
    if (!Number.isFinite(e[r]) || !Number.isFinite(e[h])) throw new Error("InkML 缺少坐标");
    if (n.push({ x: e[r], y: e[h], values: e.slice(0, l) }), n.length > 1e5) throw new Error("InkML 笔画采样超限");
  }
  return n;
}
function H(i) {
  return j(W(i));
}
function j(i) {
  if (i.namespaceURI !== $ || i.localName !== "ink") throw new Error("不是 InkML 文档");
  const t = [i, ...i.getElementsByTagName("*")], n = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
  for (const o of t) for (const f of Array.from(o.children)) e.set(f, o);
  const a = (o, f) => {
    let c = o;
    for (; c; ) {
      const s = g(c, f);
      if (s !== null) return s;
      c = e.get(c);
    }
    return null;
  };
  for (const o of t) {
    const f = g(o, "xml:id");
    if (f) {
      if (n.has(f)) throw new Error("InkML 身份重复");
      n.set(f, o);
    }
  }
  const u = (o) => o != null && o.startsWith("#") ? n.get(o.slice(1)) : void 0, r = P(i, "trace"), h = [];
  if (r.length > 1e3) throw new Error("InkML 笔画数量超限");
  const w = T(i, "traceFormat") ?? P(i, "traceFormat")[0], k = P(i, "brush");
  let p, l = 0;
  if (r.forEach((o, f) => {
    var N;
    const c = [], s = /* @__PURE__ */ new Set();
    let m = u(a(o, "contextRef"));
    for (; m; ) {
      if (s.has(m) || c.length > 32) throw new Error("InkML 上下文引用循环");
      s.add(m), c.push(m), m = u(g(m, "contextRef"));
    }
    const b = (d) => c.map((y) => g(y, d)).find((y) => y !== null) ?? null, O = (d) => c.map((y) => T(y, d)).find((y) => y !== null) ?? null, S = O("inkSource") ?? u(b("inkSourceRef")), I = O("traceFormat") ?? u(b("traceFormatRef")) ?? T(S ?? null, "traceFormat") ?? w, M = I ? U(I, "channel").map((d) => (g(d, "name") ?? "").toUpperCase()) : ["X", "Y"], E = _(o.textContent ?? "", M);
    if ((l += E.length) > 1e5) throw new Error("InkML 采样总量超限");
    const v = u(a(o, "brushRef")) ?? u(b("brushRef")) ?? k[0];
    let F = "#000000", L = 0;
    for (const d of U(v ?? null, "brushProperty")) {
      const y = (N = g(d, "name")) == null ? void 0 : N.toLowerCase(), A = g(d, "value") ?? "";
      y === "color" ? F = /^[\da-f]{6}$/i.test(A) ? "#" + A : A : (y === "width" || y === "height") && (L = Math.max(L, Number(A) || 0));
    }
    const C = u(b("canvasRef")), X = T(C ?? null, "traceFormat"), R = U(X, "channel").find((d) => g(d, "name") === "X"), x = U(X, "channel").find((d) => g(d, "name") === "Y");
    if (R && x && ["min", "max"].every((d) => g(R, d) !== null && g(x, d) !== null)) {
      const d = { x: Number(g(R, "min")), y: Number(g(x, "min")), width: Number(g(R, "max")) - Number(g(R, "min")), height: Number(g(x, "max")) - Number(g(x, "min")) };
      if (Object.values(d).every(Number.isFinite) && d.width >= 0 && d.height >= 0) {
        if (p && JSON.stringify(p) !== JSON.stringify(d)) throw new Error("InkML 多画布不支持共同编辑");
        p = d;
      }
    }
    h.push({ id: g(o, "xml:id") ?? `trace-${f + 1}`, points: E, channels: M, color: F, width: L });
  }), !p) {
    let o = 1 / 0, f = 1 / 0, c = -1 / 0, s = -1 / 0;
    for (const m of h) for (const b of m.points)
      o = Math.min(o, b.x), f = Math.min(f, b.y), c = Math.max(c, b.x), s = Math.max(s, b.y);
    p = Number.isFinite(o) ? { x: o, y: f, width: c - o, height: s - f } : { x: 0, y: 0, width: 1, height: 1 };
  }
  return { strokes: h, bounds: p };
}
function z(i, t, n) {
  var O, S;
  const e = j(i), a = e.strokes.filter((I) => I.points.length >= 2).map((I) => ({ pts: I.points.map((M) => [M.x, M.y]), brush: I }));
  if (!a.length) return [];
  const { x: u, y: r, width: h, height: w } = e.bounds, k = u + h, p = r + w, l = k - u, o = p - r, f = Math.min(l > 0 ? t / l : 1 / 0, o > 0 ? n / o : 1 / 0), c = Number.isFinite(f) && f > 0 ? f : 1, s = (t - l * c) / 2, m = (n - o * c) / 2, b = [];
  for (const I of a) {
    const M = I.pts.map(([x, N]) => [s + (x - u) * c, m + (N - r) * c]);
    let E = 1 / 0, v = 1 / 0, F = -1 / 0, L = -1 / 0;
    for (const [x, N] of M)
      x < E && (E = x), N < v && (v = N), x > F && (F = x), N > L && (L = N);
    const C = (x) => String(Math.round(x * 100) / 100), X = "M " + M.map(([x, N]) => `${C(x - E)} ${C(N - v)}`).join(" L "), R = Math.max(0.75, Math.min((((O = I.brush) == null ? void 0 : O.width) ?? 0) * c || 2, 24));
    b.push({
      kind: "shape",
      x: E,
      y: v,
      w: Math.max(F - E, 0),
      h: Math.max(L - v, 0),
      rot: 0,
      flipH: !1,
      flipV: !1,
      path: X,
      fill: { type: "none" },
      stroke: { color: ((S = I.brush) == null ? void 0 : S.color) ?? "rgb(0,0,0)", width: R, dash: null, cap: "round", join: "round" },
      text: null,
      openGeom: !0
    });
  }
  return b;
}
function K(i, t, n) {
  return z(W(i), t, n);
}
export {
  _ as decodeInkPoints,
  H as readInkData,
  K as renderInkXml
};
