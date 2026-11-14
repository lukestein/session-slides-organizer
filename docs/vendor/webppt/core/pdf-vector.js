import { renderSlideToSvg as bt, placeGroupChild as yt, renderElementToSvg as $t } from "./core.js";
import { l as Z, P as B, i as ot, b as R, c as at, v as xt, d as vt, V as kt } from "./vector-image-input-DvER4vWX.js";
import { p as W, a as Nt, g as Pt, h as At, s as Ft } from "./document-Sjh4KWFC.js";
import { zlibSync as ct } from "../../fflate/esm/browser.js";
async function Mt(a, t, e, i, s) {
  const n = async (r) => {
    if (r.kind === "group") {
      for (const o of r.children) await n(yt(r, o));
      return;
    }
    try {
      await i.render((o) => $t(r, { textMode: "svg", idPrefix: "pdf-measure", measureText: o }).markup);
    } catch (o) {
      Z(o, e, r.id, s);
    }
  };
  for (const r of t.elements) await n(r);
  try {
    return await i.render((r) => bt({ ...a, embeddedFonts: [] }, t, { textMode: "svg", idPrefix: "pdf", measureText: r }));
  } catch (r) {
    Z(r, e, void 0, s);
  }
}
const et = (a) => a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function Et(a) {
  return a.replace(/['"\\<>&\u0000-\u001f\u007f]/gu, (t) => `\\${t.codePointAt(0).toString(16)} `);
}
const ht = { m: 2, l: 2, c: 6, h: 0, re: 4 };
function* gt(a) {
  let t = [];
  for (const e of a.matchAll(/\S+/g)) {
    const i = e[0], s = Number(i);
    if (Number.isFinite(s)) {
      t.push(s);
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(ht, i) || t.length !== ht[i]) throw new Error("PDF 归一化路径无效");
    yield { op: i, values: t }, t = [];
  }
  if (t.length) throw new Error("PDF 归一化路径无效");
}
function it(a) {
  let t = 0, e = 0, i = 0, s = 0, n = 1 / 0, r = 1 / 0, o = -1 / 0, h = -1 / 0;
  const c = (g, b) => {
    n = Math.min(n, g), r = Math.min(r, b), o = Math.max(o, g), h = Math.max(h, b);
  }, u = (g, b, f, w) => {
    const y = -g + 3 * b - 3 * f + w, x = 2 * (g - 2 * b + f), m = b - g;
    if (Math.abs(y) < 1e-12) return Math.abs(x) < 1e-12 ? [] : [-m / x];
    const d = x * x - 4 * y * m;
    return d < 0 ? [] : [(-x + Math.sqrt(d)) / (2 * y), (-x - Math.sqrt(d)) / (2 * y)];
  }, l = (g, b, f, w, y) => (1 - g) ** 3 * b + 3 * (1 - g) ** 2 * g * f + 3 * (1 - g) * g * g * w + g ** 3 * y;
  for (const { op: g, values: b } of gt(a))
    if (g === "m")
      [t, e] = b, i = t, s = e;
    else if (g === "l")
      c(t, e), [t, e] = b, c(t, e);
    else if (g === "c") {
      const [f, w, y, x, m, d] = b;
      c(t, e), c(m, d);
      for (const $ of [...u(t, f, y, m), ...u(e, w, x, d)]) $ > 0 && $ < 1 && c(l($, t, f, y, m), l($, e, w, x, d));
      t = m, e = d;
    } else if (g === "h")
      c(t, e), c(i, s), t = i, e = s;
    else if (g === "re") {
      const [f, w, y, x] = b;
      c(f, w), c(f + y, w + x), t = i = f, e = s = w;
    } else throw new Error("PDF 路径边界无法计算");
  return Number.isFinite(n) ? [n, r, o - n, h - r] : [0, 0, 0, 0];
}
function Dt(a, t, e, i, s, n) {
  if (![a, t, e, i, s, n].every(Number.isFinite)) return [];
  const r = Math.abs(e), o = Math.abs(i);
  if (!n) return [];
  const h = s * Math.PI / 180, c = a - r * Math.cos(h), u = t - o * Math.sin(h), l = Math.min(4096, Math.max(1, Math.ceil(Math.abs(n) / 90))), g = n / l * Math.PI / 180, b = [];
  for (let f = 0; f < l; f++) {
    const w = h + g * f, y = w + g, x = 4 / 3 * Math.tan(g / 4), m = c + r * Math.cos(y), d = u + o * Math.sin(y);
    b.push([
      [
        c + r * (Math.cos(w) - x * Math.sin(w)),
        u + o * (Math.sin(w) + x * Math.cos(w))
      ],
      [
        c + r * (Math.cos(y) + x * Math.sin(y)),
        u + o * (Math.sin(y) - x * Math.cos(y))
      ],
      [m, d]
    ]);
  }
  return b;
}
const z = (a) => new TextEncoder().encode(a), p = (a) => {
  if (!Number.isFinite(a) || Math.abs(a) > 1e9) throw new Error("PDF 坐标无效");
  return String(Math.round(a * 1e6) / 1e6);
};
class St {
  constructor(t, e, i = "") {
    if (this.width = t, this.height = e, this.title = i, this.objects = [null, null, null], this.pages = [], this.size = 0, ![t, e].every((s) => Number.isFinite(s) && s > 0 && s <= 14400)) throw new Error("PDF 页面尺寸必须为 0–14400 pt");
  }
  reserve() {
    return this.objects.push(null), this.objects.length - 1;
  }
  put(t, e) {
    if (this.objects[t]) throw new Error("PDF 对象重复写入");
    const i = e.map((s) => typeof s == "string" ? z(s) : s);
    if (this.size += i.reduce((s, n) => s + n.length, 0), this.size > 256 * 1024 * 1024) throw new Error("PDF 文件超过浏览器导出大小限制");
    this.objects[t] = i;
  }
  add(t) {
    const e = this.reserve();
    return this.put(e, [t]), e;
  }
  stream(t, e = "") {
    const i = typeof t == "string" ? z(t) : t, s = this.reserve();
    return this.put(s, [`<< /Length ${i.length} ${e} >>
stream
`, i, `
endstream`]), s;
  }
  page(t, e, i = []) {
    if (this.pages.length >= 1e4) throw new Error("PDF 页数超限");
    if (i.length > 1e4 || i.some((c) => ![c.x, c.y].every(Number.isFinite))) throw new Error("PDF 批注数量或坐标无效");
    const s = /* @__PURE__ */ new Set();
    for (const c of i) {
      if (c.id && s.has(c.id)) throw new Error("PDF 批注身份重复");
      c.id && s.add(c.id);
    }
    const n = this.reserve(), r = i.map(() => this.reserve()), o = new Map(i.map((c, u) => [c.id, r[u]]));
    i.forEach((c, u) => {
      const l = Math.max(0, Math.min(this.width - 12, c.x * 0.75)), g = Math.max(0, Math.min(this.height - 12, this.height - c.y * 0.75 - 12)), b = c.parentId ? o.get(c.parentId) : void 0;
      this.put(r[u], [`<< /Type /Annot /Subtype /Text /Rect [${[l, g, l + 12, g + 12].map(p).join(" ")}] /Contents ${W(c.text)} /T ${W(c.author ?? "")} /Name /Comment /F 4 /P ${n} 0 R${b ? ` /IRT ${b} 0 R /RT /R` : ""} >>`]);
    });
    const h = this.stream(`q .75 0 0 -.75 0 ${p(this.height)} cm
${t}
Q`);
    this.put(n, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${p(this.width)} ${p(this.height)}] /Resources << ${e} >> /Contents ${h} 0 R${r.length ? ` /Annots [${r.map((c) => `${c} 0 R`).join(" ")}]` : ""} >>`]), this.pages.push(n);
  }
  finish() {
    if (!this.pages.length) throw new Error("没有可导出的 PDF 页面");
    this.put(1, ["<< /Type /Catalog /Pages 2 0 R >>"]), this.put(2, [`<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map((c) => `${c} 0 R`).join(" ")}] >>`]);
    const t = this.add(`<< /Producer ${W("Web-PPT")} /Title ${W(this.title)} >>`), e = [z(`%PDF-1.7
%`), new Uint8Array([226, 227, 207, 211, 10])], i = [0];
    let s = e.reduce((c, u) => c + u.length, 0);
    const n = (c) => {
      e.push(c), s += c.length;
    };
    for (let c = 1; c < this.objects.length; c++) {
      const u = this.objects[c];
      if (!u) throw new Error("PDF 对象尚未写入");
      i.push(s), n(z(`${c} 0 obj
`)), u.forEach(n), n(z(`
endobj
`));
    }
    const r = s;
    n(z(`xref
0 ${i.length}
0000000000 65535 f 
${i.slice(1).map((c) => `${String(c).padStart(10, "0")} 00000 n 
`).join("")}trailer
<< /Size ${i.length} /Root 1 0 R /Info ${t} 0 R >>
startxref
${r}
%%EOF
`));
    const o = new Uint8Array(s);
    let h = 0;
    for (const c of e)
      o.set(c, h), h += c.length;
    return this.objects.length = 0, o;
  }
}
function jt(a, t, e, i, s, n, r) {
  if (![0, 1].includes(n) || ![0, 1].includes(r)) throw new Error("PDF 圆弧标志无效");
  if (a[0] === t[0] && a[1] === t[1]) return "";
  if (e = Math.abs(e), i = Math.abs(i), !e || !i) return `${t.map(p).join(" ")} l`;
  const o = s * Math.PI / 180, h = Math.cos(o), c = Math.sin(o), u = (a[0] - t[0]) / 2, l = (a[1] - t[1]) / 2, g = h * u + c * l, b = -c * u + h * l, f = Math.sqrt(Math.max(1, g * g / (e * e) + b * b / (i * i)));
  e *= f, i *= f;
  const w = (n === r ? -1 : 1) * Math.sqrt(Math.max(
    0,
    (e * e * i * i - e * e * b * b - i * i * g * g) / (e * e * b * b + i * i * g * g)
  )), y = w * e * b / i, x = -w * i * g / e, m = Math.atan2((b - x) / i, (g - y) / e);
  let d = Math.atan2((-b - x) / i, (-g - y) / e) - m;
  return r && d < 0 && (d += Math.PI * 2), !r && d > 0 && (d -= Math.PI * 2), Dt(g, b, e, i, m * 180 / Math.PI, d * 180 / Math.PI).map((k) => k.map((F) => [
    h * F[0] - c * F[1] + (a[0] + t[0]) / 2,
    c * F[0] + h * F[1] + (a[1] + t[1]) / 2
  ].map(p).join(" ")).join(" ") + " c").join(`
`);
}
function K(a) {
  var u;
  const t = a.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) ?? [];
  if (t.join("") !== a.replace(/[\s,]/g, "") || t.length && ((u = t[0]) == null ? void 0 : u.toUpperCase()) !== "M") throw new Error("PDF 路径无效");
  if (t.length > 2e5) throw new Error("PDF 路径复杂度超限");
  const e = [];
  let i = 0, s = [0, 0], n = s, r = s, o = "", h = "";
  const c = (l = !1) => {
    const g = t[i];
    if (g === void 0) throw new Error("PDF 路径无效");
    if (l) {
      if (g[0] !== "0" && g[0] !== "1") throw new Error("PDF 圆弧标志无效");
      return g.length === 1 ? i++ : t[i] = g.slice(1), Number(g[0]);
    }
    i++;
    const b = Number(g);
    if (!Number.isFinite(b)) throw new Error("PDF 路径无效");
    return b;
  };
  for (; i < t.length; ) {
    /^[a-z]$/i.test(t[i]) && (o = t[i++]);
    const l = o.toUpperCase(), g = o !== l;
    if (l === "Z") {
      e.push("h"), s = n, h = l, o = "";
      continue;
    }
    const b = l === "M" || l === "L" || l === "T" ? 2 : l === "C" ? 6 : l === "A" ? 7 : l === "Q" || l === "S" ? 4 : l === "H" || l === "V" ? 1 : 0;
    if (!b) throw new Error(`PDF 暂不支持路径指令：${o}`);
    let f = Array.from({ length: b }, (x, m) => c(l === "A" && (m === 3 || m === 4)));
    g && (f = f.map((x, m) => l === "A" && m < 5 ? x : x + s[l === "V" ? 1 : l === "A" ? (m - 5) % 2 : m % 2]));
    const w = l === "S" && ["C", "S"].includes(h) || l === "T" && ["Q", "T"].includes(h) ? [2 * s[0] - r[0], 2 * s[1] - r[1]] : s;
    (l === "S" || l === "T") && f.unshift(...w);
    const y = l === "H" ? [f[0], s[1]] : l === "V" ? [s[0], f[0]] : [f[f.length - 2], f[f.length - 1]];
    l === "A" ? e.push(jt(s, y, f[0], f[1], f[2], f[3], f[4])) : l === "Q" || l === "T" ? e.push([
      s[0] + (f[0] - s[0]) * 2 / 3,
      s[1] + (f[1] - s[1]) * 2 / 3,
      y[0] + (f[0] - y[0]) * 2 / 3,
      y[1] + (f[1] - y[1]) * 2 / 3,
      ...y
    ].map(p).join(" ") + " c") : l === "H" || l === "V" ? e.push(`${y.map(p).join(" ")} l`) : e.push(`${f.map(p).join(" ")} ${l === "M" ? "m" : l === "L" ? "l" : "c"}`), r = l === "Q" || l === "T" ? [f[0], f[1]] : [f[f.length - 4], f[f.length - 3]], s = y, h = l, l === "M" && (n = y, o = g ? "l" : "L");
  }
  return e.join(`
`);
}
class It {
  constructor(t, e, i) {
    this.source = t, this.language = e, this.signal = i, this.cache = /* @__PURE__ */ new Map(), this.boxes = /* @__PURE__ */ new Map(), this.characters = 0;
  }
  abort() {
    var t;
    if ((t = this.signal) != null && t.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
  }
  /**
   * 字形墨迹框（字体单位域，含曲线极值）。渐变的 objectBoundingBox 以真实墨迹
   * 为准——advance 范围只在水平轴下等价，垂直 / 斜向的取色依赖 y，必须量轮廓。
   * outline 走 provider 公开接口，仅对需要墨迹的渐变文字按字形惰性计算并缓存。
   */
  async glyphBox(t, e) {
    this.abort();
    const i = `${t.face.id}|${e}`, s = this.boxes.get(i);
    if (s) return s;
    const n = this.source.provider.outline;
    if (!n) throw new B("outline-unavailable", [t.face.family], t.text);
    const r = await n.call(this.source.provider, t.face.id, e, { purpose: "view-print", signal: this.signal });
    if (this.abort(), !r.ok) throw new B(r.reason, [t.face.family], t.text);
    const o = it(K(r.value));
    return this.boxes.size < 16384 && this.boxes.set(i, o), o;
  }
  key(t, e) {
    return JSON.stringify([t, e.fonts, !!e.b, !!e.i]);
  }
  async shape(t, e) {
    this.abort();
    const i = this.key(t, e), s = this.cache.get(i);
    if (s) return s;
    if (this.characters += t.length, this.cache.size >= 8192 || this.characters > 1e6) throw new Error("PDF 字体测量资源超限");
    const n = this.source.segmentText(t, { language: this.language, direction: "ltr" });
    if (!n.ok) throw new B(n.reason, e.fonts, t);
    const r = [], o = { purpose: "view-print", signal: this.signal };
    for (const h of n.value) {
      let c, u = "face-unavailable", l;
      const g = e.fonts.length ? e.fonts : ["Helvetica", "Arial"];
      for (const b of g) {
        const f = await this.source.provider.resolve({ ...o, family: b, weight: e.b ? 700 : 400, italic: !!e.i });
        if (this.abort(), !f.ok) {
          u = f.reason;
          continue;
        }
        const w = await this.source.provider.shape(f.value.id, h.text, {
          ...o,
          script: h.script,
          direction: h.direction,
          language: h.language
        });
        if (this.abort(), !w.ok) {
          l = w.reason;
          continue;
        }
        c = { face: f.value, run: w.value, text: h.text };
        break;
      }
      if (!c) throw new B(l ?? u, g, h.text);
      r.push(c);
    }
    return this.cache.set(i, r), r;
  }
  async embedding(t) {
    const e = await this.source.provider.embedding(t.face.id, { purpose: "view-print", signal: this.signal });
    if (this.abort(), !e.ok) throw new B(e.reason, [t.face.family], t.text);
    if (!e.value.info.embedding.outlineAllowed) throw new B("embedding-restricted", [t.face.family], t.text);
    return e.value.bytes;
  }
  async styleTag(t) {
    const e = new Map(t.map((s) => [s.face.id, s])), i = [];
    for (const s of e.values()) {
      const n = s.face, r = await this.embedding(s);
      let o = "";
      for (let h = 0; h < r.length; h += 16384) o += String.fromCharCode(...r.subarray(h, h + 16384));
      i.push(`@font-face{font-family:'${Et(n.family)}';font-weight:${n.weight};font-style:${n.italic ? "italic" : "normal"};src:url('data:font/ttf;base64,${btoa(o)}');}`);
    }
    return i.length ? `<style>${et(i.join(""))}</style>` : "";
  }
  async render(t) {
    const e = /* @__PURE__ */ new Map(), i = (s, n, r) => {
      if (!s) return 0;
      const o = this.key(s, n), h = this.cache.get(o), c = n.size * r * (n.baseline ? 0.65 : 1);
      return h || e.set(o, { text: s, style: { fonts: n.fonts, b: n.b, i: n.i } }), (h ? h.reduce((u, l) => u + l.run.xAdvance / l.run.unitsPerEm, 0) : s.length) * c + (n.spacing ?? 0) * s.length;
    };
    for (let s = 0; s < 8; s++) {
      this.abort(), e.clear();
      const n = t(i);
      if (!e.size) return n;
      for (const r of e.values()) await this.shape(r.text, r.style);
    }
    throw new Error("PDF 字体测量未收敛");
  }
}
const V = /* @__PURE__ */ new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"]
]);
class Tt {
  constructor(t) {
    this.namespaceURI = null, this.attributes = [], this.childNodes = [], this.nextElementSibling = null, this.namespaceBindings = V, this.tagName = t;
    const e = t.indexOf(":");
    this.prefix = e < 0 ? null : t.slice(0, e), this.localName = e < 0 ? t : t.slice(e + 1);
  }
  resolveNamespaces(t) {
    let e;
    for (const i of this.attributes)
      i.name === "xmlns" ? (e ?? (e = new Map((t == null ? void 0 : t.namespaceBindings) ?? V))).set("", i.value) : i.prefix === "xmlns" && (e ?? (e = new Map((t == null ? void 0 : t.namespaceBindings) ?? V))).set(i.localName, i.value);
    this.namespaceBindings = e ?? (t == null ? void 0 : t.namespaceBindings) ?? V, this.namespaceURI = this.lookupNamespaceURI(this.prefix);
    for (const i of this.attributes)
      i.name === "xmlns" || i.prefix === "xmlns" ? i.namespaceURI = "http://www.w3.org/2000/xmlns/" : i.prefix && (i.namespaceURI = this.lookupNamespaceURI(i.prefix));
  }
  get firstElementChild() {
    for (const t of this.childNodes) if (typeof t != "string") return t;
    return null;
  }
  get children() {
    return this.childNodes.filter((t) => typeof t != "string");
  }
  getAttribute(t) {
    for (const e of this.attributes) if (e.name === t) return e.value;
    return null;
  }
  lookupNamespaceURI(t) {
    const e = t ?? "";
    return this.namespaceBindings.get(e) || null;
  }
  get textContent() {
    let t = "";
    for (const e of this.childNodes) t += typeof e == "string" ? e : e.textContent;
    return t;
  }
  /** 只支持 '*'，与解析器里的用法一致 */
  getElementsByTagName(t) {
    const e = [], i = (s) => {
      for (const n of s.children)
        (t === "*" || n.localName === t || n.tagName === t) && e.push(n), i(n);
    };
    return i(this), e;
  }
}
const Ct = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function lt(a) {
  return a.indexOf("&") < 0 ? a : a.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (t, e) => {
    if (e[0] === "#") {
      const i = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(i) && i >= 0 ? String.fromCodePoint(i) : t;
    }
    return Ct[e] ?? t;
  });
}
function Rt(a) {
  let t = 0;
  const e = a.length, i = [];
  let s = null;
  const n = (r, o) => {
    const h = r.children;
    h.length && (h[h.length - 1].nextElementSibling = o), r.childNodes.push(o);
  };
  for (; t < e; ) {
    const r = a.indexOf("<", t);
    if (r < 0) break;
    if (r > t) {
      const w = a.slice(t, r);
      i.length && w.trim() ? i[i.length - 1].childNodes.push(lt(w)) : i.length && w.includes(" ") && i[i.length - 1].childNodes.push(w);
    }
    if (a.startsWith("<!--", r)) {
      const w = a.indexOf("-->", r + 4);
      t = w < 0 ? e : w + 3;
      continue;
    }
    if (a.startsWith("<![CDATA[", r)) {
      const w = a.indexOf("]]>", r + 9), y = a.slice(r + 9, w < 0 ? e : w);
      i.length && i[i.length - 1].childNodes.push(y), t = w < 0 ? e : w + 3;
      continue;
    }
    if (a.startsWith("<?", r) || a.startsWith("<!", r)) {
      const w = a.indexOf(">", r);
      t = w < 0 ? e : w + 1;
      continue;
    }
    if (a[r + 1] === "/") {
      const w = a.indexOf(">", r);
      if (w < 0) break;
      i.pop(), t = w + 1;
      continue;
    }
    let o = r + 1, h = "";
    for (; o < e; ) {
      const w = a[o];
      if (h)
        w === h && (h = "");
      else if (w === '"' || w === "'") h = w;
      else if (w === ">") break;
      o++;
    }
    if (o >= e) break;
    const c = a[o - 1] === "/", u = a.slice(r + 1, c ? o - 1 : o);
    let l = 0;
    for (; l < u.length && !/[\s/]/.test(u[l]); ) l++;
    const g = new Tt(u.slice(0, l)), b = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    b.lastIndex = l;
    let f;
    for (; (f = b.exec(u)) !== null; ) {
      const w = f[1], y = w.indexOf(":");
      g.attributes.push({
        name: w,
        localName: y < 0 ? w : w.slice(y + 1),
        prefix: y < 0 ? null : w.slice(0, y),
        namespaceURI: null,
        value: lt(f[3] ?? f[4] ?? "")
      });
    }
    g.resolveNamespaces(i[i.length - 1]), i.length ? n(i[i.length - 1], g) : s || (s = g), c || i.push(g), t = o + 1;
  }
  if (!s) throw new Error("XML 解析失败：未找到根元素");
  return s;
}
const J = (a) => a.toString(16).padStart(4, "0"), mt = (a) => {
  let t = "";
  for (let e = 0; e < a.length; e++) t += J(a.charCodeAt(e));
  return t;
};
class Ot {
  constructor(t, e, i, s) {
    this.pdf = t, this.name = e, this.face = i, this.bytes = s, this.entries = [{ gid: 0, text: "" }], this.cids = /* @__PURE__ */ new Map(), this.object = t.reserve();
  }
  cid(t, e) {
    const i = JSON.stringify([t, e]), s = this.cids.get(i);
    if (s !== void 0) return s;
    if (this.entries.length >= 65536) throw new Error("PDF 字体 CID 数量超限");
    const n = this.entries.length;
    return this.entries.push({ gid: t, text: e }), this.cids.set(i, n), n;
  }
  decoration(t, e) {
    const i = e / 10;
    if (t === "underline") return { offset: Math.max(1, Math.ceil(i / 2)), thickness: i };
    const s = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    for (let n = 0; n < s.getUint16(4); n++) {
      const r = 12 + n * 16;
      if (String.fromCharCode(...this.bytes.subarray(r, r + 4)) !== "hhea") continue;
      const o = s.getUint32(r + 8), h = e / this.face.unitsPerEm;
      return { offset: -s.getInt16(o + 4) * h / 3 - i / 2, thickness: i };
    }
    throw new Error("PDF 字体缺少 hhea");
  }
  finish() {
    const t = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength), e = /* @__PURE__ */ new Map();
    for (let N = 0; N < t.getUint16(4); N++) {
      const v = 12 + N * 16, D = String.fromCharCode(...this.bytes.subarray(v, v + 4));
      e.set(D, t.getUint32(v + 8));
    }
    const i = (N) => {
      const v = e.get(N);
      if (v === void 0) throw new Error(`PDF 字体缺少 ${N}`);
      return v;
    }, s = 1e3 / this.face.unitsPerEm, n = i("hhea"), r = i("hmtx"), o = t.getUint16(n + 34), h = e.get("OS/2"), c = e.get("post"), u = t.getInt16(n + 4) * s, l = t.getInt16(n + 6) * s, g = h !== void 0 && t.getUint16(h) >= 2 ? t.getInt16(h + 88) * s : u, b = c === void 0 ? 0 : t.getInt32(c + 4) / 65536, f = this.pdf.stream(this.bytes, `/Length1 ${this.bytes.length}`), w = this.pdf.add(`<< /Type /FontDescriptor /FontName /${this.name} /Flags ${4 + (this.face.italic ? 64 : 0)} /FontBBox [${this.face.bbox.map((N) => p(N * s)).join(" ")}] /ItalicAngle ${p(b)} /Ascent ${p(u)} /Descent ${p(l)} /CapHeight ${p(g)} /StemV 80 /FontFile2 ${f} 0 R >>`), y = new Uint8Array(this.entries.length * 2), x = [], m = [];
    this.entries.forEach(({ gid: N, text: v }, D) => {
      y[D * 2] = N >> 8, y[D * 2 + 1] = N & 255, x.push(p(t.getUint16(r + Math.min(N, o - 1) * 4) * s)), v && m.push(`<${J(D)}> <${mt(v)}>`);
    });
    const d = this.pdf.stream(y), $ = [];
    for (let N = 0; N < m.length; N += 100) {
      const v = m.slice(N, N + 100);
      $.push(`${v.length} beginbfchar
${v.join(`
`)}
endbfchar`);
    }
    const k = this.pdf.stream(`/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /${this.name}Unicode def
/CMapType 2 def
1 begincodespacerange
<0000> <FFFF>
endcodespacerange
${$.join(`
`)}
endcmap
CMapName currentdict /CMap defineresource pop
end end`), F = this.pdf.add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${this.name} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${w} 0 R /CIDToGIDMap ${d} 0 R /DW 1000 /W [0 [${x.join(" ")}]] >>`);
    this.pdf.put(this.object, [`<< /Type /Font /Subtype /Type0 /BaseFont /${this.name} /Encoding /Identity-H /DescendantFonts [${F} 0 R] /ToUnicode ${k} 0 R >>`]);
  }
}
function _(a) {
  const t = (r, o = 0) => Number(a.getAttribute(r) ?? o);
  if (a.localName === "path") return K(a.getAttribute("d") ?? "");
  if (a.localName === "rect") return ["x", "y", "width", "height"].map((r) => p(t(r))).join(" ") + " re";
  if (a.localName === "line") return `${p(t("x1"))} ${p(t("y1"))} m ${p(t("x2"))} ${p(t("y2"))} l`;
  if (a.localName !== "circle" && a.localName !== "ellipse") return;
  const e = t("cx"), i = t("cy"), s = t(a.localName === "circle" ? "r" : "rx"), n = t(a.localName === "circle" ? "r" : "ry");
  if (!s || !n) return "";
  if (s < 0 || n < 0) throw new Error("PDF 椭圆半径无效");
  return K(`M ${p(e - s)} ${p(i)} A ${p(s)} ${p(n)} 0 1 1 ${p(e + s)} ${p(i)} A ${p(s)} ${p(n)} 0 1 1 ${p(e - s)} ${p(i)} Z`);
}
function Bt(a) {
  if (a[0] !== 255 || a[1] !== 216) return null;
  const t = new DataView(a.buffer, a.byteOffset, a.byteLength);
  let e = 0, i = 0, s = 0, n = !1;
  if (a.length < 4 || a[a.length - 2] !== 255 || a[a.length - 1] !== 217) throw new Error("PDF JPEG 数据已截断");
  for (let r = 2; r + 3 < a.length; ) {
    if (a[r++] !== 255) throw new Error("PDF JPEG 标记无效");
    for (; a[r] === 255; ) r++;
    const o = a[r++];
    if (o === 218) {
      n = !0;
      break;
    }
    if (o === 217) break;
    const h = t.getUint16(r);
    if (h < 2 || h > a.length - r) throw new Error("PDF JPEG 标记已截断");
    if (o === 225 || o === 226 || o === 238) throw new Error("PDF JPEG 元数据需要图片规范化");
    if ([192, 193, 194].includes(o)) {
      if (e || h < 8 || a[r + 2] !== 8) throw new Error("PDF JPEG 帧无效");
      if (i = t.getUint16(r + 3), e = t.getUint16(r + 5), s = a[r + 7], h !== 8 + s * 3) throw new Error("PDF JPEG 分量无效");
    } else if (o >= 192 && o <= 207 && ![196, 200, 204].includes(o)) throw new Error("PDF JPEG 编码不支持");
    r += h;
  }
  if (!n || !e || !i || e * i > 16e6 || ![1, 3].includes(s)) throw new Error("PDF JPEG 尺寸或颜色模式不支持");
  return { width: e, height: i, compressed: a, colorSpace: s === 1 ? "DeviceGray" : "DeviceRGB" };
}
class zt {
  constructor(t, e, i, s) {
    this.pdf = t, this.resources = e, this.signal = i, this.normalize = s, this.images = /* @__PURE__ */ new Map(), this.count = 0;
  }
  async dataUri(t) {
    const e = await this.bytes(t), { mimeType: i } = ot(e);
    let s = "";
    for (let n = 0; n < e.length; n += 16384) s += String.fromCharCode(...e.subarray(n, n + 16384));
    return `data:${i};base64,${btoa(s)}`;
  }
  abort() {
    var t;
    if ((t = this.signal) != null && t.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
  }
  async bytes(t) {
    try {
      return await this.read(t);
    } catch (e) {
      throw this.abort(), e instanceof R ? e : new R("image-fetch-failed");
    }
  }
  async read(t) {
    var c, u;
    this.abort();
    const e = await fetch(t, { signal: this.signal });
    if (!e.ok)
      throw await ((c = e.body) == null ? void 0 : c.cancel()), new R("image-fetch-failed");
    if (Number(e.headers.get("content-length")) > at)
      throw await ((u = e.body) == null ? void 0 : u.cancel()), new R("image-byte-limit");
    if (!e.body) throw new R("image-data-invalid");
    const i = e.body.getReader(), s = [];
    let n = 0, r = !1;
    try {
      for (; ; ) {
        this.abort();
        const l = await i.read();
        if (this.abort(), l.done) {
          r = !0;
          break;
        }
        if (n += l.value.length, n > at) throw new R("image-byte-limit");
        s.push(l.value);
      }
    } finally {
      r || await i.cancel().catch(() => {
      }), i.releaseLock();
    }
    const o = new Uint8Array(n);
    let h = 0;
    for (const l of s)
      o.set(l, h), h += l.length;
    return o;
  }
  async draw(t, e, i, s, n) {
    if (this.abort(), ![e, i, s, n].every(Number.isFinite) || s <= 0 || n <= 0) throw new R("image-placement-invalid");
    let r = this.images.get(t);
    return r || (r = await this.resource(await this.bytes(t)), this.images.set(t, r)), this.place(r, e, i, s, n);
  }
  async drawBytes(t, e, i, s, n) {
    if (this.abort(), ![e, i, s, n].every(Number.isFinite) || s <= 0 || n <= 0) throw new R("image-placement-invalid");
    return this.place(await this.resource(t), e, i, s, n);
  }
  async resource(t) {
    if (this.count >= 4096) throw new R("image-count-limit");
    const e = ot(t);
    let i = null, s;
    if (e.reason) {
      if (!this.normalize) throw new R(e.reason);
      let c;
      try {
        c = await this.normalize({ bytes: t, mimeType: e.mimeType, signal: this.signal });
      } catch (f) {
        throw this.abort(), f instanceof R || f instanceof Error && f.name === "AbortError" ? f : new R("image-normalization-failed");
      }
      this.abort(), xt(c, e);
      const u = c.width * c.height, l = new Uint8Array(u * 3), g = new Uint8Array(u);
      let b = !1;
      for (let f = 0; f < u; f++)
        l[f * 3] = c.rgba[f * 4], l[f * 3 + 1] = c.rgba[f * 4 + 1], l[f * 3 + 2] = c.rgba[f * 4 + 2], g[f] = c.rgba[f * 4 + 3], b || (b = g[f] !== 255);
      s = {
        width: c.width,
        height: c.height,
        compressed: ct(l, { level: 6 }),
        ...b ? { softMask: ct(g, { level: 6 }) } : {}
      };
    } else
      try {
        i = Bt(t), s = i ?? Nt(t, !0);
      } catch {
        throw new R("image-data-invalid");
      }
    this.abort();
    const n = `/Type /XObject /Subtype /Image /Width ${s.width} /Height ${s.height} /BitsPerComponent 8 /Interpolate true`, r = "softMask" in s ? s.softMask : void 0, o = r ? this.pdf.stream(r, `${n} /Filter /FlateDecode /ColorSpace /DeviceGray`) : void 0, h = this.pdf.stream(s.compressed, `${n} /Filter /${i ? "DCTDecode" : "FlateDecode"} /ColorSpace /${(i == null ? void 0 : i.colorSpace) ?? "DeviceRGB"}${o ? ` /SMask ${o} 0 R` : ""}`);
    return { name: `Im${++this.count}`, object: h };
  }
  place(t, e, i, s, n) {
    return this.resources.use("XObject", t), `q ${[s, 0, 0, -n, e, i + n].map(p).join(" ")} cm /${t.name} Do Q`;
  }
}
const wt = [1, 0, 0, 1, 0, 0];
function L(a, t) {
  return [
    a[0] * t[0] + a[2] * t[1],
    a[1] * t[0] + a[3] * t[1],
    a[0] * t[2] + a[2] * t[3],
    a[1] * t[2] + a[3] * t[3],
    a[0] * t[4] + a[2] * t[5] + a[4],
    a[1] * t[4] + a[3] * t[5] + a[5]
  ];
}
function Ut(a) {
  const t = a[0] * a[3] - a[1] * a[2];
  if (!Number.isFinite(t) || Math.abs(t) < 1e-12) throw new Error("PDF 对象变换不可逆");
  return [a[3] / t, -a[1] / t, -a[2] / t, a[0] / t, (a[2] * a[5] - a[3] * a[4]) / t, (a[1] * a[4] - a[0] * a[5]) / t];
}
function st(a) {
  let t = wt, e = "";
  for (const i of a.matchAll(/([a-zA-Z]+)\(([^)]*)\)/g)) {
    const s = i[2].trim() ? i[2].trim().split(/[\s,]+/).map(Number) : [];
    e += i[0];
    let n;
    if (i[1] === "translate" && (s.length === 1 || s.length === 2)) n = [1, 0, 0, 1, s[0], s[1] ?? 0];
    else if (i[1] === "scale" && (s.length === 1 || s.length === 2)) n = [s[0], 0, 0, s[1] ?? s[0], 0, 0];
    else if (i[1] === "matrix" && s.length === 6) n = [s[0], s[1], s[2], s[3], s[4], s[5]];
    else if (i[1] === "rotate" && (s.length === 1 || s.length === 3)) {
      const r = Math.cos(s[0] * Math.PI / 180), o = Math.sin(s[0] * Math.PI / 180), h = s[1] ?? 0, c = s[2] ?? 0;
      n = [r, o, -o, r, h - r * h + o * c, c - o * h - r * c];
    } else throw new Error(`PDF 暂不支持变换：${i[1]}`);
    if (!n.every(Number.isFinite)) throw new Error("PDF 变换无效");
    t = L(t, n);
  }
  if (e.replace(/[\s,]/g, "") !== a.replace(/[\s,]/g, "")) throw new Error("PDF 变换无效");
  return t;
}
function rt(a) {
  const t = a.getAttribute("style") ?? "", e = [];
  let i = 0, s = "", n = 0;
  for (let o = 0; o < t.length; o++) {
    const h = t[o];
    if (h === "\\") {
      o++;
      continue;
    }
    if (s) {
      h === s && (s = "");
      continue;
    }
    h === '"' || h === "'" ? s = h : h === "(" ? n++ : h === ")" ? n-- : h === ";" && !n && (e.push(t.slice(i, o)), i = o + 1);
  }
  if (s || n) throw new Error("PDF SVG 内联样式无效");
  e.push(t.slice(i));
  const r = /* @__PURE__ */ new Map();
  for (const o of e) {
    if (!o.trim()) continue;
    const h = o.indexOf(":");
    if (h <= 0) throw new Error("PDF SVG 内联样式无效");
    r.set(o.slice(0, h).trim().toLowerCase(), o.slice(h + 1).trim());
  }
  return r;
}
function tt(a) {
  return /^[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?(?:px)?$/i.test(a) ? Number(a.replace(/px$/i, "")) : NaN;
}
function G(a) {
  const t = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d*\.?\d+))?\s*\)$/.exec(a);
  if (t && t.slice(1, 4).every((e) => Number(e) <= 255) && Number(t[4] ?? 1) <= 1)
    return { rgb: t.slice(1, 4).map((e) => Number(e) / 255), alpha: Number(t[4] ?? 1) };
  if (/^#[0-9a-f]{3}$/i.test(a) && (a = "#" + [...a.slice(1)].map((e) => e + e).join("")), !/^#[0-9a-f]{6}$/i.test(a)) throw new Error(`PDF 暂不支持填充：${a}`);
  return { rgb: [1, 3, 5].map((e) => parseInt(a.slice(e, e + 2), 16) / 255), alpha: 1 };
}
class Gt {
  constructor(t, e) {
    this.pdf = t, this.resources = e, this.states = /* @__PURE__ */ new Map();
  }
  alpha(t, e, i) {
    if (![t, e].every((r) => Number.isFinite(r) && r >= 0 && r <= 1)) throw new Error("PDF 透明度无效");
    const s = `${p(t)} ${p(e)} ${i ?? ""}`;
    let n = this.states.get(s);
    if (!n) {
      if (this.states.size >= 4096) throw new Error("PDF 透明度资源超限");
      n = { name: `GS${this.states.size + 1}`, object: this.pdf.add(`<< /Type /ExtGState /ca ${p(t)} /CA ${p(e)} /BM /Normal /SMask ${i ? `<< /S /Luminosity /G ${i} 0 R /BC [0] >>` : "/None"} >>`) }, this.states.set(s, n);
    }
    return this.resources.use("ExtGState", n), `/${n.name} gs`;
  }
  solid(t, e = "none") {
    const i = t === "none" ? void 0 : G(t), s = e === "none" ? void 0 : G(e);
    return [this.alpha((i == null ? void 0 : i.alpha) ?? 1, (s == null ? void 0 : s.alpha) ?? 1), i && `${i.rgb.map(p).join(" ")} rg`, s && `${s.rgb.map(p).join(" ")} RG`].filter(Boolean).join(`
`);
  }
}
const ut = new Set("id style fill stroke stroke-width font-family font-size font-weight font-style letter-spacing".split(" ")), Wt = new Set("role tabindex target rel pointer-events".split(" ")), ft = {
  svg: "xmlns xmlns:xlink viewBox x y width height overflow",
  g: "transform clip-path",
  a: "href transform clip-path",
  path: "d transform clip-path fill-rule stroke-dasharray stroke-linecap stroke-linejoin marker-start marker-end",
  rect: "x y width height transform clip-path fill-rule stroke-dasharray stroke-linecap stroke-linejoin",
  line: "x1 y1 x2 y2 transform clip-path stroke-dasharray stroke-linecap stroke-linejoin marker-start marker-end",
  circle: "cx cy r transform clip-path fill-rule stroke-dasharray stroke-linecap stroke-linejoin",
  ellipse: "cx cy rx ry transform clip-path fill-rule stroke-dasharray stroke-linecap stroke-linejoin",
  image: "href xlink:href x y width height opacity preserveAspectRatio transform clip-path",
  text: "x y text-anchor xml:space transform direction unicode-bidi stroke stroke-width paint-order",
  tspan: "dx dy xml:space stroke stroke-width paint-order",
  title: "",
  desc: ""
}, dt = {
  linearGradient: "id x1 y1 x2 y2 gradientUnits",
  radialGradient: "id cx cy r fx fy gradientUnits",
  stop: "offset stop-color stop-opacity",
  clipPath: "id clip-rule clipPathUnits",
  marker: "id viewBox refX refY markerWidth markerHeight markerUnits orient",
  pattern: "id x y width height patternUnits"
}, Vt = new Set("fill stroke stroke-width paint-order font-family font-size font-weight font-style letter-spacing text-decoration text-decoration-line text-decoration-color text-decoration-style".split(" ")), qt = {
  "text-anchor": ["start", "middle", "end"],
  "fill-rule": ["nonzero", "evenodd"],
  "clip-rule": ["nonzero", "evenodd"],
  "stroke-linecap": ["butt", "round", "square"],
  "stroke-linejoin": ["miter", "round", "bevel"],
  gradientUnits: ["userSpaceOnUse", "objectBoundingBox"],
  clipPathUnits: ["userSpaceOnUse", "objectBoundingBox"],
  direction: ["ltr", "rtl"],
  "unicode-bidi": ["normal", "embed"],
  "xml:space": ["preserve"],
  markerUnits: ["strokeWidth", "userSpaceOnUse"]
};
class Xt {
  constructor(t, e) {
    this.definitions = t, this.root = e;
  }
  reason(t) {
    return this.visit(t, t, !1, /* @__PURE__ */ new Set());
  }
  visit(t, e, i, s, n = !1) {
    var w, y, x;
    if (t.localName === "defs" || t.localName === "style" || t !== e && t.getAttribute("data-el") !== null) return;
    if (t.getAttribute("data-render-error") !== null) return "svg-render-error";
    for (const m of ["filter", "mask"]) if (t.getAttribute(m) !== null) return `svg-${m}`;
    const r = t.localName, o = Object.prototype.hasOwnProperty.call(ft, r) ? ft[r] : void 0, h = Object.prototype.hasOwnProperty.call(dt, r) ? dt[r] : void 0, c = n ? h ?? o : o;
    if (c === void 0) return `svg-node-${r}`;
    if (r === "svg" && t !== this.root) {
      if (t.getAttribute("viewBox") !== null) return "svg-viewport-viewbox";
      if (t.getAttribute("overflow") !== "hidden") return "svg-viewport-overflow";
      if (t.getAttribute("width") === null || t.getAttribute("height") === null) return "svg-viewport-size";
    }
    const u = new Set(c.split(" "));
    for (const m of t.attributes)
      if (!(m.name.startsWith("data-") || m.name.startsWith("aria-") || Wt.has(m.name))) {
        if (!(n ? u.has(m.name) || h === void 0 && ut.has(m.name) : u.has(m.name) || ut.has(m.name))) return `svg-attribute-${m.name}`;
        if (i && m.name === "transform") return "svg-text-transform";
      }
    let l;
    try {
      l = rt(t);
    } catch {
      return "svg-css-syntax";
    }
    for (const [m, d] of l)
      if (!(m === "filter" && d === "none") && !(m === "cursor" || m === "transform-box" && d === "fill-box" || m === "transform-origin" && d === "center")) {
        if (!Vt.has(m)) return `svg-css-${m}`;
        if ((m === "text-decoration" || m === "text-decoration-line") && !/^(underline|line-through)$/.test(d)) return `svg-css-${m}`;
        if (m === "text-decoration-style" && !["solid", "dashed", "dotted", "double", "wavy"].includes(d)) return "svg-css-text-decoration-style";
      }
    for (const [m, d] of Object.entries(qt)) {
      const $ = t.getAttribute(m);
      if ($ !== null && !d.includes($)) return `svg-value-${m}`;
    }
    for (const m of ["x", "y", "width", "height", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "dy", "opacity"]) {
      const d = t.getAttribute(m);
      if (!(d === null || r.endsWith("Gradient")) && (!d.trim() || !Number.isFinite(Number(d)) || ["width", "height", "r", "rx", "ry"].includes(m) && Number(d) < 0))
        return `svg-value-${m}`;
    }
    for (const m of ["dx", "stroke-dasharray"]) {
      const d = t.getAttribute(m);
      if (!d || m === "stroke-dasharray" && d === "none") continue;
      if (d.trim().split(/[\s,]+/).map(Number).some((k) => !Number.isFinite(k) || m === "stroke-dasharray" && k < 0)) return `svg-value-${m}`;
    }
    const g = l.get("paint-order") ?? t.getAttribute("paint-order");
    if ((i || r === "text" || r === "tspan") && (l.get("stroke") ?? t.getAttribute("stroke") ?? "none") !== "none" && g !== "stroke") return "svg-text-stroke";
    for (const m of ["font-size", "stroke-width", "letter-spacing"]) {
      const d = l.get(m) ?? t.getAttribute(m);
      if (d != null && (!Number.isFinite(tt(d)) || m !== "letter-spacing" && tt(d) < 0)) return `svg-value-${m}`;
    }
    const b = l.get("font-weight") ?? t.getAttribute("font-weight");
    if (b && !["400", "700", "normal", "bold"].includes(b)) return "svg-value-font-weight";
    const f = l.get("font-style") ?? t.getAttribute("font-style");
    if (f && !["normal", "italic"].includes(f)) return "svg-value-font-style";
    if (t.getAttribute("direction") === "rtl") return "svg-direction";
    if (r === "marker") {
      const m = t.getAttribute("orient");
      if (m && !["auto", "auto-start-reverse"].includes(m) && !Number.isFinite(Number(m))) return "svg-marker-orient";
      for (const $ of ["refX", "refY", "markerWidth", "markerHeight"]) {
        const k = t.getAttribute($);
        if (k !== null && (!Number.isFinite(Number(k)) || $.startsWith("marker") && Number(k) < 0)) return `svg-value-${$}`;
      }
      const d = (w = t.getAttribute("viewBox")) == null ? void 0 : w.trim().split(/[\s,]+/).map(Number);
      if (d && (d.length !== 4 || !d.every(Number.isFinite) || d[2] <= 0 || d[3] <= 0)) return "svg-marker-viewbox";
    }
    if (r === "image" && t.getAttribute("preserveAspectRatio") !== "none") return "svg-image-aspect-ratio";
    if (r === "pattern" && t.getAttribute("patternUnits") !== "userSpaceOnUse") return "svg-pattern-units";
    for (const m of ["fill", "stroke", "clip-path", "marker-start", "marker-end"]) {
      const d = l.get(m) ?? t.getAttribute(m);
      if (!d || d === "none") continue;
      if (!d.startsWith("url(")) {
        if (m === "clip-path") return "svg-value-clip-path";
        try {
          G(d);
        } catch {
          return `svg-value-${m}`;
        }
        continue;
      }
      if (m === "stroke" || (i || r === "text" || r === "tspan") && m === "fill") {
        const N = (y = /^url\(#([^)]*)\)$/.exec(d)) == null ? void 0 : y[1], v = N && this.definitions.get(N);
        if (m === "stroke" || !v || v.localName !== "linearGradient" || Number(v.getAttribute("x2") ?? 1) === Number(v.getAttribute("x1") ?? 0) && Number(v.getAttribute("y2") ?? 0) === Number(v.getAttribute("y1") ?? 0)) return "svg-text-paint";
      }
      const $ = (x = /^url\(#([^)]*)\)$/.exec(d)) == null ? void 0 : x[1], k = $ && this.definitions.get($);
      if (!k || !$) return "svg-reference";
      if (s.has($)) return "svg-reference-cycle";
      if (m === "fill" && !["linearGradient", "radialGradient", "pattern"].includes(k.localName)) return `svg-paint-${k.localName}`;
      if (m === "clip-path" && k.localName !== "clipPath") return "svg-clip-path";
      if (m.startsWith("marker-") && k.localName !== "marker") return "svg-marker-reference";
      if (k.getAttribute("clipPathUnits") === "objectBoundingBox") return "svg-clip-units";
      s.add($);
      const F = this.visit(k, k, !1, s, !0);
      if (s.delete($), F) return F;
    }
    try {
      t.getAttribute("transform") && st(t.getAttribute("transform")), _(t);
    } catch {
      return "svg-geometry";
    }
    for (const m of t.children) {
      if (r === "clipPath" && m.getAttribute("transform")) return "svg-clip-transform";
      const d = this.visit(m, e, i || r === "text", s, n);
      if (d) return d;
    }
  }
}
function H(a, t, e = a.attributes) {
  return `<${a.tagName}${e.map((i) => ` ${i.name}="${et(i.value)}"`).join("")}>${t}</${a.tagName}>`;
}
class Jt {
  constructor(t, e, i, s, n, r, o) {
    this.root = t, this.images = e, this.options = i, this.slideNumber = s, this.issues = n, this.anonymous = r, this.coverage = new Xt(o, t);
  }
  async render(t, e, i) {
    var w;
    const s = t.getAttribute("data-el");
    if (s === null && e.length) return;
    const n = this.coverage.reason(t);
    if (!n) return;
    const r = { ...vt(this.slideNumber, s === null ? void 0 : Number(s), this.anonymous), reason: n };
    if (s === null || n === "svg-render-error" || !this.options.rasterize) throw new kt(r);
    const o = /* @__PURE__ */ new Map(), h = async (y) => {
      const x = [], m = [];
      for (const d of y.childNodes) x.push(typeof d == "string" ? et(d) : await h(d));
      for (const d of y.attributes) {
        if (y.localName !== "image" || d.localName !== "href") {
          m.push(d);
          continue;
        }
        let $ = o.get(d.value);
        $ || ($ = await this.images.dataUri(d.value), o.set(d.value, $)), m.push({ ...d, value: $ });
      }
      return H(y, x.join(""), m);
    };
    let c = await h(t);
    for (const y of [...e].reverse()) y !== this.root && (c = H(y, c));
    let u = "";
    for (const y of this.root.children) y.localName === "defs" && (u += await h(y));
    const l = (this.root.getAttribute("viewBox") ?? "").split(/[\s,]+/).map(Number), g = await i(), b = await this.options.rasterize({ svg: H(this.root, u + g + c), width: l[2], height: l[3], signal: this.options.signal });
    if ((w = this.options.signal) != null && w.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
    if (this.issues.push(r), !b) return "";
    const f = e.reduce((y, x) => L(y, st(x.getAttribute("transform") ?? "")), wt);
    return `q ${Ut(f).map(p).join(" ")} cm ${await this.images.drawBytes(b.bytes, b.x, b.y, b.width, b.height)} Q`;
  }
}
const q = (a, t) => a === null ? t : Number(a.replace("%", "")) / (a.endsWith("%") ? 100 : 1);
class Lt {
  constructor(t, e, i) {
    this.pdf = t, this.paint = e, this.resources = i, this.shadings = /* @__PURE__ */ new Map(), this.masks = /* @__PURE__ */ new Map(), this.textPatterns = /* @__PURE__ */ new Map();
  }
  /**
   * 文字渐变：把 Shading 包成 Pattern（PatternType 2），经 Pattern colorspace 填充字形。
   *
   * PDF 文字的填充只能是色彩空间值，不能像路径那样先 W n 再 sh。坐标口径经
   * 三实现实测（MuPDF / poppler / CoreGraphics）：PatternMatrix 在文字填充下
   * **不生效**（非恒等矩阵整段取末端色），正确表达是矩阵保持恒等、把局部
   * 端点经累计 CTM（ctm）换算成页面绝对坐标直接写进 Shading 的 Coords。
   *
   * objectBoundingBox 单位端点 (x1,y1)/(x2,y2) 经墨迹框（x..x+width、
   * inkTop..inkTop+inkHeight，局部坐标）映射后绝对化；轴不限方向，
   * 垂直 / 斜向的精度取决于墨迹框 y 的字形轮廓测量（VectorFonts.glyphBox）。
   */
  textPattern(t, e, i, s, n, r, o, h = !1) {
    var j, S;
    if (s <= 0 || r <= 0) throw new Error("PDF 文字渐变范围无效");
    const c = (A, E) => [o[0] * A + o[2] * E + o[4], o[1] * A + o[3] * E + o[5]], u = (A) => i + A * s, l = (A) => n + A * r, g = JSON.stringify([t, u(0), l(0), u(1), l(1), o]), b = (j = /^url\(#([^)]*)\)$/.exec(t)) == null ? void 0 : j[1], f = b && e.get(b);
    if (!f || f.localName !== "linearGradient") throw new Error("PDF 文字渐变定义无效");
    if (f.getAttribute("gradientTransform") || (f.getAttribute("spreadMethod") ?? "pad") !== "pad") throw new Error("PDF 渐变变换或延伸方式尚未支持");
    const w = [];
    for (const A of f.children) {
      if (A.localName !== "stop" || w.length >= 4096) throw new Error("PDF 渐变色标无效");
      const E = Math.max(((S = w[w.length - 1]) == null ? void 0 : S.pos) ?? 0, Math.min(1, q(A.getAttribute("offset"), 0))), T = G(A.getAttribute("stop-color") ?? "#000"), I = T.alpha * Number(A.getAttribute("stop-opacity") ?? 1);
      if (!Number.isFinite(I) || I < 0 || I > 1) throw new Error("PDF 渐变透明度无效");
      w.push({ pos: E, color: T.rgb, alpha: I });
    }
    if (!w.length) throw new Error("PDF 渐变色标无效");
    if (w[0].pos > 0 && w.unshift({ ...w[0], pos: 0 }), w[w.length - 1].pos < 1 && w.push({ ...w[w.length - 1], pos: 1 }), w.some((A) => A.alpha !== 1)) throw new Error("PDF 暂不支持文字渐变透明度");
    const y = (A, E) => q(f.getAttribute(A), E), x = y("x1", 0), m = y("y1", 0), d = y("x2", 1), $ = y("y2", 0);
    if (m === $ && x === d) throw new Error("PDF 暂不支持文字渐变方向");
    const [k, F] = c(u(x), l(m)), [N, v] = c(u(d), l($)), D = JSON.stringify(["text", k, F, N, v, w]);
    let P = this.shadings.get(D);
    if (!P) {
      if (this.shadings.size >= 4096) throw new Error("PDF 渐变资源超限");
      const A = [], E = [];
      for (let C = 1; C < w.length; C++) {
        const U = w[C - 1], O = w[C];
        U.pos !== O.pos && (A.push(this.pdf.add(`<< /FunctionType 2 /Domain [0 1] /C0 [${U.color.map(p).join(" ")}] /C1 [${O.color.map(p).join(" ")}] /N 1 >>`)), E.push(O.pos));
      }
      const T = this.pdf.add(`<< /FunctionType 3 /Domain [0 1] /Functions [${A.map((C) => `${C} 0 R`).join(" ")}] /Bounds [${E.slice(0, -1).map(p).join(" ")}] /Encode [${A.map(() => "0 1").join(" ")}] >>`), I = this.pdf.add(`<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [${[k, F, N, v].map(p).join(" ")}] /Function ${T} 0 R /Extend [true true] >>`);
      P = { name: `Sh${this.shadings.size + 1}`, object: I }, this.shadings.set(D, P);
    }
    let M = this.textPatterns.get(g);
    if (!M) {
      const A = this.pdf.add(`<< /PatternType 2 /Shading ${P.object} 0 R >>`);
      M = { name: `Pt${A}`, object: A }, this.textPatterns.set(g, M);
    }
    return this.resources.use("Pattern", M), h ? `/Pattern CS /${M.name} SCN` : `/Pattern cs /${M.name} scn`;
  }
  fill(t, e, i, s) {
    var F, N;
    const n = (F = /^url\(#([^)]*)\)$/.exec(e)) == null ? void 0 : F[1], r = n && i.get(n);
    if (!r || !["linearGradient", "radialGradient"].includes(r.localName)) throw new Error("PDF 渐变定义无效");
    if (r.getAttribute("gradientTransform") || (r.getAttribute("spreadMethod") ?? "pad") !== "pad") throw new Error("PDF 渐变变换或延伸方式尚未支持");
    const o = [];
    for (const v of r.children) {
      if (v.localName !== "stop" || o.length >= 4096) throw new Error("PDF 渐变色标无效");
      const D = Math.max(((N = o[o.length - 1]) == null ? void 0 : N.pos) ?? 0, Math.min(1, q(v.getAttribute("offset"), 0))), P = G(v.getAttribute("stop-color") ?? "#000"), M = P.alpha * Number(v.getAttribute("stop-opacity") ?? 1);
      if (!Number.isFinite(M) || M < 0 || M > 1) throw new Error("PDF 渐变透明度无效");
      o.push({ pos: D, color: P.rgb, alpha: M });
    }
    if (!o.length) return "";
    o[0].pos > 0 && o.unshift({ ...o[0], pos: 0 }), o[o.length - 1].pos < 1 && o.push({ ...o[o.length - 1], pos: 1 });
    const h = (v, D) => q(r.getAttribute(v), D), c = r.localName === "radialGradient", u = h("cx", 0.5), l = h("cy", 0.5), g = c ? [h("fx", u), h("fy", l), 0, u, l, h("r", 0.5)] : [h("x1", 0), h("y1", 0), h("x2", 1), h("y2", 0)], b = JSON.stringify([c, g, o]);
    let f = this.shadings.get(b);
    if (!f) {
      if (this.shadings.size >= 4096) throw new Error("PDF 渐变资源超限");
      const v = (D) => {
        const P = [], M = [];
        for (let S = 1; S < o.length; S++) {
          const A = o[S - 1], E = o[S];
          if (A.pos === E.pos) continue;
          const T = D ? [A.alpha] : A.color, I = D ? [E.alpha] : E.color;
          P.push(this.pdf.add(`<< /FunctionType 2 /Domain [0 1] /C0 [${T.map(p).join(" ")}] /C1 [${I.map(p).join(" ")}] /N 1 >>`)), M.push(E.pos);
        }
        const j = this.pdf.add(`<< /FunctionType 3 /Domain [0 1] /Functions [${P.map((S) => `${S} 0 R`).join(" ")}] /Bounds [${M.slice(0, -1).map(p).join(" ")}] /Encode [${P.map(() => "0 1").join(" ")}] >>`);
        return this.pdf.add(`<< /ShadingType ${c ? 3 : 2} /ColorSpace /${D ? "DeviceGray" : "DeviceRGB"} /Coords [${g.map(p).join(" ")}] /Function ${j} 0 R /Extend [true true] >>`);
      };
      f = { name: `Sh${this.shadings.size + 1}`, object: v(!1), ...o.some((D) => D.alpha !== 1) ? { alpha: v(!0) } : {} }, this.shadings.set(b, f);
    }
    const [w, y, x, m] = it(t);
    if (!x || !m) return "";
    this.resources.use("Shading", f);
    const d = r.getAttribute("gradientUnits") === "userSpaceOnUse", $ = d ? "" : `${[x, 0, 0, m, w, y].map(p).join(" ")} cm`;
    let k = "";
    if (f.alpha) {
      const v = d ? [w, y, w + x, y + m] : [0, 0, 1, 1], D = JSON.stringify([f.alpha, v]);
      let P = this.masks.get(D);
      P || (P = this.pdf.stream("/A sh", `/Type /XObject /Subtype /Form /BBox [${v.map(p).join(" ")}] /Group << /S /Transparency /CS /DeviceGray /I true >> /Resources << /Shading << /A ${f.alpha} 0 R >> >>`), this.masks.set(D, P)), k = this.paint.alpha(1, 1, P);
    }
    return `q ${t} ${s ? "W*" : "W"} n ${$} ${k} /${f.name} sh Q`;
  }
}
function Ht(a, t, e) {
  const i = rt(a), s = i.get("text-decoration-line") ?? i.get("text-decoration");
  return s ? [...t, ...s.split(/\s+/).map((n) => {
    if (n !== "underline" && n !== "line-through") throw new Error(`PDF 文字装饰尚未支持：${n}`);
    return { line: n, color: i.get("text-decoration-color") ?? e, style: i.get("text-decoration-style") ?? "solid" };
  })] : t;
}
function Qt(a, t, e, i, s) {
  const n = t.thickness, r = i + t.offset + n / 2, o = s - e;
  switch (a.style) {
    case "solid":
      return `${p(n)} w ${p(e)} ${p(r)} m ${p(s)} ${p(r)} l S`;
    case "dashed":
      return `[${p(n * 2)} ${p(n)}] 0 d ${p(n)} w ${p(e)} ${p(r)} m ${p(s)} ${p(r)} l S`;
    case "dotted":
      return `[0 ${p(n)}] 0 d 1 J ${p(n)} w ${p(e)} ${p(r)} m ${p(s)} ${p(r)} l S`;
    case "double": {
      const h = n * 1.5;
      return `${p(n * 0.75)} w ${p(e)} ${p(r - h / 2)} m ${p(s)} ${p(r - h / 2)} l S ${p(e)} ${p(r + h / 2)} m ${p(s)} ${p(r + h / 2)} l S`;
    }
    case "wavy": {
      const h = n * 3, c = n * 0.75, u = Math.max(1, Math.ceil(o / h));
      let l = `${p(n * 0.8)} w ${p(e)} ${p(r)} m`;
      for (let g = 0; g < u; g++) {
        const b = e + g * h;
        l += ` ${p(b + h * 0.25)} ${p(r - c)} ${p(b + h * 0.75)} ${p(r + c)} ${p(b + h)} ${p(r)} c`;
      }
      return `${l} S`;
    }
    default:
      throw new Error(`PDF 文字装饰线型尚未支持：${a.style}`);
  }
}
function pt(a, t, e, i, s, n, r, o) {
  return a.map((h) => {
    const c = t.decoration(h.line, r);
    return `q ${h.color.startsWith("url(") && o ? o : e.solid("none", h.color)} ${Qt(h, c, i, s, n)} Q`;
  }).join(`
`);
}
function Yt(a) {
  const t = [];
  let e = [0, 0], i;
  const s = (c, u) => {
    for (const l of u) {
      const g = [l[0] - c[0], l[1] - c[1]];
      if (g[0] || g[1]) return g;
    }
  };
  for (const { op: c, values: u } of gt(a)) {
    if (c === "m") {
      e = [u[0], u[1]], i = { start: e, end: e, segments: 0, closed: !1 }, t.push(i);
      continue;
    }
    if (!i) throw new Error("PDF 路径缺少起点");
    let l, g, b;
    if (c === "c") {
      l = [u[4], u[5]], g = s(e, [[u[0], u[1]], [u[2], u[3]], l]);
      const f = s(l, [[u[2], u[3]], [u[0], u[1]], e]);
      f && (b = [-f[0], -f[1]]);
    } else if (c === "l" || c === "h")
      l = c === "h" ? i.start : [u[0], u[1]], g = b = s(e, [l]);
    else throw new Error("PDF 箭头路径类型无效");
    i.segments++ === 0 && (i.first = g), i.last = b, i.closed = c === "h", i.end = e = l;
  }
  const n = t[0], r = t[t.length - 1];
  if (!n) return;
  const o = (c) => c ? Math.atan2(c[1], c[0]) : 0, h = (c) => {
    let u = o(c.first), l = o(c.last);
    return Math.abs(u - l) > Math.PI && (u < l ? u += 2 * Math.PI : l += 2 * Math.PI), (u + l) / 2;
  };
  return {
    start: { point: n.start, angle: n.closed ? h(n) : o(n.first) },
    end: { point: r.end, angle: r.closed ? h(r) : o(r.last) }
  };
}
async function Zt(a, t, e, i, s) {
  var o, h;
  if (!a.getAttribute("marker-start") && !a.getAttribute("marker-end")) return "";
  const n = Yt(t);
  if (!n) return "";
  const r = [];
  for (const c of [!0, !1]) {
    const u = a.getAttribute(c ? "marker-start" : "marker-end");
    if (!u || u === "none") continue;
    const l = (o = /^url\(#([^)]*)\)$/.exec(u)) == null ? void 0 : o[1], g = l && i.get(l);
    if (!g || g.localName !== "marker") throw new Error("PDF 箭头定义无效");
    const b = Number(g.getAttribute("markerWidth") ?? 3), f = Number(g.getAttribute("markerHeight") ?? 3), w = (g.getAttribute("markerUnits") ?? "strokeWidth") === "strokeWidth" ? e : 1;
    if (!b || !f || !w) continue;
    const y = ((h = g.getAttribute("viewBox")) == null ? void 0 : h.trim().split(/[\s,]+/).map(Number)) ?? [0, 0, b, f];
    if (y.length !== 4 || y[2] <= 0 || y[3] <= 0 || b < 0 || f < 0) throw new Error("PDF 箭头视口无效");
    const x = Math.min(b / y[2], f / y[3]), m = (b - y[2] * x) / 2 - y[0] * x, d = (f - y[3] * x) / 2 - y[1] * x, $ = Number(g.getAttribute("refX") ?? 0) * x + m, k = Number(g.getAttribute("refY") ?? 0) * x + d, F = c ? n.start : n.end, N = g.getAttribute("orient") ?? "0", v = N === "auto" || N === "auto-start-reverse" ? F.angle + (c && N === "auto-start-reverse" ? Math.PI : 0) : Number(N) * Math.PI / 180, D = Math.cos(v), P = Math.sin(v);
    r.push(
      "q",
      `${[D * w, P * w, -P * w, D * w, ...F.point].map(p).join(" ")} cm`,
      `1 0 0 1 ${p(-$)} ${p(-k)} cm`,
      `0 0 ${p(b)} ${p(f)} re W n`,
      `${p(x)} 0 0 ${p(x)} ${p(m)} ${p(d)} cm`,
      "[] 0 d 0 J 0 j 4 M 1 w"
    );
    for (const M of g.children) r.push(await s(M));
    r.push("Q");
  }
  return r.join(`
`);
}
class Kt {
  constructor(t, e) {
    this.pdf = t, this.resources = e, this.patterns = /* @__PURE__ */ new WeakMap(), this.count = 0;
  }
  async fill(t, e, i, s) {
    const [n, r, o, h] = it(t);
    if (!o || !h) return "";
    const c = Number(e.getAttribute("width") ?? 0), u = Number(e.getAttribute("height") ?? 0);
    if (!c || !u) return "";
    if (c < 0 || u < 0 || e.getAttribute("patternUnits") !== "userSpaceOnUse") throw new Error("PDF 图案单元无效");
    if (this.count >= 4096) throw new Error("PDF 图案资源超限");
    let l = this.patterns.get(e);
    if (!l) {
      const { commands: f, resources: w } = await this.resources.capture(async () => {
        const m = ["q", "1 w 0 J 0 j 4 M [] 0 d"];
        for (const d of e.children) m.push(await s(d));
        return m.push("Q"), m.join(`
`);
      }), y = Number(e.getAttribute("x") ?? 0), x = Number(e.getAttribute("y") ?? 0);
      l = this.pdf.stream(f, `/Type /Pattern /PatternType 1 /PaintType 1 /TilingType 2 /BBox [0 0 ${p(c)} ${p(u)}] /XStep ${p(c)} /YStep ${p(u)} /Matrix [1 0 0 1 ${p(y)} ${p(x)}] /Resources << ${w} >>`), this.patterns.set(e, l);
    }
    const g = this.pdf.stream(
      `/Pattern cs /P scn
${t}
${i ? "f*" : "f"}`,
      `/Type /XObject /Subtype /Form /BBox [${[n, r, n + o, r + h].map(p).join(" ")}] /Resources << /Pattern << /P ${l} 0 R >> >>`
    ), b = `Pt${++this.count}`;
    return this.resources.use("XObject", { name: b, object: g }), `q /${b} Do Q`;
  }
}
class _t {
  constructor() {
    this.current = /* @__PURE__ */ new Map();
  }
  use(t, e) {
    let i = this.current.get(t);
    i || this.current.set(t, i = /* @__PURE__ */ new Map()), i.set(e.name, e.object);
  }
  async capture(t) {
    const e = this.current;
    this.current = /* @__PURE__ */ new Map();
    try {
      const i = await t(), s = [...this.current].map(([n, r]) => `/${n} << ${[...r].map(([o, h]) => `/${o} ${h} 0 R`).join(" ")} >>`).join(" ");
      return { commands: i, resources: s };
    } finally {
      this.current = e;
    }
  }
}
const Q = { fonts: [], size: 16, fill: "#000000", stroke: "none", strokeWidth: 1, spacing: 0, decorations: [] }, X = (a) => a.trim() ? a.trim().split(/[\s,]+/).map(Number) : [];
function te(a) {
  return (a.match(/'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|[^,]+/g) ?? []).map((t) => t.trim().replace(/^['"]|['"]$/g, "").replace(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (e, i, s) => i ? String.fromCodePoint(parseInt(i, 16)) : s));
}
function Y(a, t) {
  const e = { ...t }, i = rt(a), s = (h) => i.get(h) ?? a.getAttribute(h);
  for (const [h, c] of [["fill", "fill"], ["stroke", "stroke"]]) {
    const u = s(h);
    u !== null && (e[c] = u);
  }
  for (const [h, c] of [["font-size", "size"], ["stroke-width", "strokeWidth"], ["letter-spacing", "spacing"]]) {
    const u = s(h);
    u !== null && (e[c] = tt(u));
  }
  const n = s("font-family");
  n && (e.fonts = te(n));
  const r = s("font-weight");
  r && (e.b = r === "700" || r === "bold");
  const o = s("font-style");
  return o && (e.i = o === "italic"), e.decorations = Ht(a, t.decorations, e.fill), e;
}
function ee(a) {
  const t = [];
  let e = "";
  for (const i of a.matchAll(/([a-zA-Z]+)\(([^)]*)\)/g)) {
    const s = X(i[2]);
    e += i[0];
    let n;
    if (i[1] === "translate" && (s.length === 1 || s.length === 2)) n = [1, 0, 0, 1, s[0], s[1] ?? 0];
    else if (i[1] === "scale" && (s.length === 1 || s.length === 2)) n = [s[0], 0, 0, s[1] ?? s[0], 0, 0];
    else if (i[1] === "matrix" && s.length === 6) n = s;
    else if (i[1] === "rotate" && (s.length === 1 || s.length === 3)) {
      const r = Math.cos(s[0] * Math.PI / 180), o = Math.sin(s[0] * Math.PI / 180), h = s[1] ?? 0, c = s[2] ?? 0;
      n = [r, o, -o, r, h - r * h + o * c, c - o * h - r * c];
    } else throw new Error(`PDF 暂不支持变换：${i[1]}`);
    t.push(`${n.map(p).join(" ")} cm`);
  }
  if (e.replace(/\s/g, "") !== a.replace(/\s/g, "")) throw new Error("PDF 变换无效");
  return t.join(`
`);
}
class ie {
  constructor(t, e, i, s) {
    this.pdf = t, this.fonts = e, this.options = i, this.issues = s, this.resources = /* @__PURE__ */ new Map(), this.references = new _t(), this.definitions = /* @__PURE__ */ new Map(), this.slideNumber = 0, this.anonymous = /* @__PURE__ */ new Map(), this.images = new zt(t, this.references, i.signal, i.normalizeImage), this.paint = new Gt(t, this.references), this.gradient = new Lt(t, this.paint, this.references), this.pattern = new Kt(t, this.references);
  }
  async page(t, e, i, s = /* @__PURE__ */ new Map()) {
    const n = Rt(t);
    this.slideNumber = e, this.anonymous = s, this.definitions.clear();
    const r = (c) => {
      const u = c.getAttribute("id");
      u && this.definitions.set(u, c);
      for (const l of c.children) r(l);
    };
    r(n), this.fallback = new Jt(n, this.images, this.options, e, this.issues, s, this.definitions);
    const { commands: o, resources: h } = await this.references.capture(() => this.element(n, Q));
    this.pdf.page(o, h, i);
  }
  finish() {
    for (const t of this.resources.values()) t.finish();
  }
  async rasterFontStyle(t, e) {
    const i = [], s = async (n, r, o = !1) => {
      if (n.localName === "defs" || n.localName === "style") return;
      const h = Y(n, r), c = o || n.localName === "text";
      for (const u of n.childNodes)
        typeof u == "string" ? c && u && i.push(...await this.fonts.shape(u, h)) : await s(u, h, c);
    };
    return await s(t, e), this.fonts.styleTag(i);
  }
  clip(t) {
    var n;
    const e = (n = /^url\(#([^)]*)\)$/.exec(t)) == null ? void 0 : n[1], i = e && this.definitions.get(e);
    if (!i || i.localName !== "clipPath" || i.getAttribute("clipPathUnits") === "objectBoundingBox") throw new Error("PDF 裁剪定义无效");
    return i.children.map((r) => {
      if (r.getAttribute("transform")) throw new Error("PDF 暂不支持裁剪变换");
      const o = _(r);
      if (o !== void 0) return o;
      throw new Error(`PDF 暂不支持裁剪节点：${r.localName}`);
    }).join(`
`) + (i.getAttribute("clip-rule") === "evenodd" ? `
W* n` : `
W n`);
  }
  async resource(t) {
    let e = this.resources.get(t.face.id);
    return e || (e = new Ot(this.pdf, `F${this.resources.size + 1}`, t.face, await this.fonts.embedding(t)), this.resources.set(t.face.id, e)), this.references.use("Font", e), e;
  }
  async text(t, e, i) {
    var m;
    const s = [], n = async (d, $) => {
      const k = Y(d, $);
      let F = X(d.getAttribute("dx") ?? ""), N = Number(d.getAttribute("dy") ?? 0);
      for (const v of d.childNodes)
        if (typeof v == "string")
          s.push({ text: v, style: k, dx: F, dy: N, parts: await this.fonts.shape(v, k) }), F = [], N = 0;
        else if (v.localName === "tspan" || v.localName === "a") await n(v, k);
        else throw new Error(`PDF 暂不支持文字节点：${v.localName}`);
      N && s.push({ text: "", style: k, dx: [], dy: N, parts: [] });
    };
    if (t.getAttribute("direction") === "rtl") throw new Error("PDF 字体：unsupported-direction");
    await n(t, e);
    let r = Number(t.getAttribute("x") ?? 0), o = Number(t.getAttribute("y") ?? 0);
    const h = s.reduce((d, $) => d + $.parts.reduce((k, F) => k + F.run.xAdvance / F.run.unitsPerEm * $.style.size, 0) + $.style.spacing * $.text.length + $.dx.reduce((k, F) => k + F, 0), 0), c = t.getAttribute("text-anchor");
    c === "middle" ? r -= h / 2 : c === "end" && (r -= h);
    const u = [], l = [], g = [], b = s.filter((d) => d.style.fill.startsWith("url("));
    if (b.length && i === null) throw new Error("PDF 暂不支持图案单元内文字渐变");
    const f = /* @__PURE__ */ new Map();
    let w = 0, y = 1;
    if (b.length) {
      const d = b.some((D) => {
        var j;
        const P = (j = /^url\(#([^)]*)\)$/.exec(D.style.fill)) == null ? void 0 : j[1], M = P && this.definitions.get(P);
        return M && Number(M.getAttribute("y1") ?? 0) !== Number(M.getAttribute("y2") ?? 0);
      });
      let $ = 1 / 0, k = -1 / 0, F = 0, N = r, v = o;
      for (const [D, P] of s.entries()) {
        v += P.dy;
        let M = 1 / 0, j = -1 / 0, S = 0;
        for (const A of P.parts) {
          const E = P.style.size / A.run.unitsPerEm;
          for (const T of A.run.glyphs) {
            if (b.includes(P)) {
              const I = await this.fonts.glyphBox(A, T.id);
              F++, M = Math.min(M, (S + T.xOffset + I[0]) * E), j = Math.max(j, (S + T.xOffset + I[2]) * E), d && ($ = Math.min($, v - (I[3] + T.yOffset) * E), k = Math.max(k, v - (I[1] + T.yOffset) * E));
            }
            S += T.xAdvance;
          }
        }
        b.includes(P) && F && Number.isFinite(M) && f.set(D, [N + M, N + j]), N += S / (((m = P.parts[0]) == null ? void 0 : m.run.unitsPerEm) ?? 1e3) * P.style.size + P.style.spacing * P.text.length + P.dx.reduce((A, E) => A + E, 0);
      }
      if (d) {
        if (!F || !Number.isFinite($) || !Number.isFinite(k) || k <= $) throw new Error("PDF 文字渐变墨迹范围无效");
        w = $, y = k - $;
      }
      for (const D of b) {
        const P = s.indexOf(D);
        if (!f.has(P)) throw new Error("PDF 文字渐变墨迹范围无效");
      }
    }
    const x = /* @__PURE__ */ new Map();
    for (const d of s) {
      o += d.dy;
      let $ = 0;
      const k = d.style.stroke !== "none";
      let F = "", N = "";
      if (d.style.fill.startsWith("url(")) {
        const P = d.style.fill, [M, j] = f.get(s.indexOf(d)), S = `${P}@${M}-${j}`, A = x.get(S);
        if (A ? F = A : (F = this.gradient.textPattern(P, this.definitions, M, j - M, w, y, i), x.set(S, F)), d.style.decorations.length) {
          const E = `S@${S}`, T = x.get(E);
          N = T ?? this.gradient.textPattern(P, this.definitions, M, j - M, w, y, i, !0), T || x.set(E, N);
        }
      } else F = this.paint.solid(d.style.fill);
      const v = [], D = [];
      for (const P of d.parts) {
        const M = r, j = o, S = await this.resource(P), A = d.style.size / P.run.unitsPerEm;
        for (const E of P.run.clusters) {
          const T = [...E.text];
          r += d.dx.slice($, $ + T.length).reduce((I, C) => I + C, 0), $ += T.length, D.push(`/Span << /ActualText <feff${mt(E.text)}> >> BDC`);
          for (let I = E.glyphStart; I < E.glyphEnd; I++) {
            const C = P.run.glyphs[I], U = S.cid(C.id, I === E.glyphStart ? E.text : ""), O = r + C.xOffset * A, nt = o - C.yOffset * A;
            v.push({ font: S.name, size: d.style.size, x: O, y: nt, cid: J(U) }), D.push(`BT /${S.name} ${p(d.style.size)} Tf 1 0 0 -1 ${p(O)} ${p(nt)} Tm <${J(U)}> Tj ET`), r += C.xAdvance * A, o -= C.yAdvance * A;
          }
          D.push("EMC"), r += d.style.spacing * E.text.length;
        }
        l.push(pt(d.style.decorations.filter((E) => E.line === "underline"), S, this.paint, M, j, r, d.style.size, N)), g.push(pt(d.style.decorations.filter((E) => E.line === "line-through"), S, this.paint, M, j, r, d.style.size, N));
      }
      if (k) {
        const P = this.paint.solid("none", d.style.stroke), M = /([\d.]+ [\d.]+ [\d.]+) RG/.exec(P), j = (M == null ? void 0 : M[1]) ?? "0 0 0";
        u.push(`q ${j} RG ${p(d.style.strokeWidth)} w`);
        for (const S of v)
          u.push(`BT /${S.font} ${p(S.size)} Tf 1 Tr 1 0 0 -1 ${p(S.x)} ${p(S.y)} Tm <${S.cid}> Tj ET`);
        u.push("Q");
      }
      u.push(F), u.push(...D);
    }
    return [...l, ...u, ...g].filter(Boolean).join(`
`);
  }
  async element(t, e, i = [], s = null) {
    try {
      return await this.drawElement(t, e, i, s ?? [0.75, 0, 0, -0.75, 0, this.pdf.height]);
    } catch (n) {
      const r = t.getAttribute("data-el");
      if (r === null && i.length) throw n;
      Z(n, this.slideNumber, r === null ? void 0 : Number(r), this.anonymous);
    }
  }
  async drawElement(t, e, i, s) {
    var l, g;
    if (this.fonts.abort(), ["defs", "style", "title", "desc"].includes(t.localName) || t.getAttribute("visibility") === "hidden" || /(?:^|;)\s*visibility\s*:\s*hidden(?:;|$)/.test(t.getAttribute("style") ?? "")) return "";
    if (t.getAttribute("data-render-error")) throw new Error("PDF 原生 SVG 渲染失败");
    const n = await ((l = this.fallback) == null ? void 0 : l.render(t, i, () => this.rasterFontStyle(t, e)));
    if (n !== void 0) return n;
    for (const b of ["filter", "mask", "opacity", "fill-opacity", "stroke-opacity"])
      if (!(b === "opacity" && t.localName === "image") && t.getAttribute(b) !== null)
        throw new Error(`PDF 暂不支持效果：${b}`);
    const r = Y(t, e), o = ["q", ee(t.getAttribute("transform") ?? "")], h = t.getAttribute("transform") ? st(t.getAttribute("transform")) : null;
    let c = s === null || !h ? s : L(s, h);
    const u = t.getAttribute("clip-path");
    if (u && o.push(this.clip(u)), t.localName === "text") o.push(await this.text(t, r, c));
    else if (t.localName === "image") {
      if (t.getAttribute("preserveAspectRatio") !== "none") throw new Error("PDF 暂不支持图片宽高比模式");
      o.push(this.paint.alpha(Math.max(0, Math.min(1, Number(t.getAttribute("opacity") ?? 1))), 1)), o.push(await this.images.draw(
        t.getAttribute("href") ?? t.getAttribute("xlink:href") ?? "",
        Number(t.getAttribute("x") ?? 0),
        Number(t.getAttribute("y") ?? 0),
        Number(t.getAttribute("width")),
        Number(t.getAttribute("height"))
      ));
    } else if (["svg", "g", "a"].includes(t.localName)) {
      if (t.localName === "svg" && i.length) {
        const b = Number(t.getAttribute("width")), f = Number(t.getAttribute("height"));
        if (!b || !f) return "";
        const w = Number(t.getAttribute("x") ?? 0), y = Number(t.getAttribute("y") ?? 0);
        o.push(`1 0 0 1 ${p(w)} ${p(y)} cm`, `0 0 ${p(b)} ${p(f)} re W n`), c && (c = L(c, [1, 0, 0, 1, w, y]));
      }
      for (const b of t.children) o.push(await this.element(b, r, [...i, t], c));
    } else if (["rect", "path", "line", "circle", "ellipse"].includes(t.localName)) {
      const b = t.localName === "line" ? "none" : r.fill, f = b.startsWith("url("), w = r.strokeWidth === 0 ? "none" : r.stroke;
      if (o.push(this.paint.solid(f ? "none" : b, w)), w !== "none") {
        o.push(`${p(r.strokeWidth)} w`);
        const m = t.getAttribute("stroke-linecap"), d = t.getAttribute("stroke-linejoin"), $ = t.getAttribute("stroke-dasharray");
        m && o.push(`${["butt", "round", "square"].indexOf(m)} J`), d && o.push(`${["miter", "round", "bevel"].indexOf(d)} j`), $ && $ !== "none" && X($).some((k) => k !== 0) && o.push(`[${X($).map(p).join(" ")}] 0 d`);
      }
      const y = _(t), x = f ? this.definitions.get(((g = /^url\(#([^)]*)\)$/.exec(b)) == null ? void 0 : g[1]) ?? "") : void 0;
      (x == null ? void 0 : x.localName) === "pattern" ? o.push(await this.pattern.fill(
        y,
        x,
        t.getAttribute("fill-rule") === "evenodd",
        (m) => this.element(m, Q, [...i, t], null)
      )) : f ? o.push(this.gradient.fill(y, b, this.definitions, t.getAttribute("fill-rule") === "evenodd")) : b !== "none" && o.push(y, t.getAttribute("fill-rule") === "evenodd" ? "f*" : "f"), w !== "none" && o.push(y, "S"), o.push(await Zt(t, y, r.strokeWidth, this.definitions, (m) => this.element(m, Q, [...i, t], null)));
    } else throw new Error(`PDF 暂不支持 SVG 节点：${t.localName}`);
    return o.push("Q"), o.filter(Boolean).join(`
`);
  }
}
async function ae(a, t) {
  var h;
  const e = new It(t.fonts, t.language ?? "und", t.signal), i = [], s = new St(a.width * 0.75, a.height * 0.75, t.title), n = new ie(s, e, t, i), r = [];
  a.slides.forEach((c, u) => {
    if (t.skipHidden && c.hidden) return;
    const l = t.animationSteps ? Pt(c.animations) : [];
    if (l.length) for (let g = 0; g <= l.length; g++) r.push({ slide: c, slideNumber: u + 1, hidden: [...At(l, g)] });
    else r.push({ slide: c, slideNumber: u + 1, hidden: [...Ft(c)] });
  });
  for (const [c, u] of r.entries()) {
    e.abort();
    const l = new Set(u.hidden), g = /* @__PURE__ */ new Set(), b = /* @__PURE__ */ new Map(), f = (d) => {
      for (const $ of d)
        $.id !== void 0 && g.add($.id), $.kind === "group" && f($.children);
    };
    f(u.slide.elements);
    let w = -1;
    const y = (d, $ = []) => d.flatMap((k, F) => {
      if (k.id !== void 0 && l.has(k.id)) return [];
      const N = [...$, F];
      let v = k.id;
      if (v === void 0) {
        for (; g.has(w); ) w--;
        v = w--, b.set(v, N);
      }
      return [k.kind === "group" ? { ...k, id: v, children: y(k.children, N) } : { ...k, id: v }];
    }), x = { ...u.slide, elements: y(u.slide.elements) }, m = await Mt(a, x, u.slideNumber, e, b);
    await n.page(m, u.slideNumber, t.showComments ? u.slide.comments : void 0, b), e.abort(), (h = t.onProgress) == null || h.call(t, { completed: c + 1, total: r.length, slideNumber: u.slideNumber });
  }
  e.abort(), n.finish();
  const o = s.finish();
  return { blob: new Blob([o.buffer], { type: "application/pdf" }), issues: i };
}
export {
  kt as VectorPdfError,
  ae as presentationToVectorPdf
};
