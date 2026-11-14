import { safeUnzipSync as un } from "./zip.js";
const yt = /* @__PURE__ */ new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"]
]);
class mn {
  constructor(n) {
    this.namespaceURI = null, this.attributes = [], this.childNodes = [], this.nextElementSibling = null, this.namespaceBindings = yt, this.tagName = n;
    const e = n.indexOf(":");
    this.prefix = e < 0 ? null : n.slice(0, e), this.localName = e < 0 ? n : n.slice(e + 1);
  }
  resolveNamespaces(n) {
    let e;
    for (const r of this.attributes)
      r.name === "xmlns" ? (e ?? (e = new Map((n == null ? void 0 : n.namespaceBindings) ?? yt))).set("", r.value) : r.prefix === "xmlns" && (e ?? (e = new Map((n == null ? void 0 : n.namespaceBindings) ?? yt))).set(r.localName, r.value);
    this.namespaceBindings = e ?? (n == null ? void 0 : n.namespaceBindings) ?? yt, this.namespaceURI = this.lookupNamespaceURI(this.prefix);
    for (const r of this.attributes)
      r.name === "xmlns" || r.prefix === "xmlns" ? r.namespaceURI = "http://www.w3.org/2000/xmlns/" : r.prefix && (r.namespaceURI = this.lookupNamespaceURI(r.prefix));
  }
  get firstElementChild() {
    for (const n of this.childNodes) if (typeof n != "string") return n;
    return null;
  }
  get children() {
    return this.childNodes.filter((n) => typeof n != "string");
  }
  getAttribute(n) {
    for (const e of this.attributes) if (e.name === n) return e.value;
    return null;
  }
  lookupNamespaceURI(n) {
    const e = n ?? "";
    return this.namespaceBindings.get(e) || null;
  }
  get textContent() {
    let n = "";
    for (const e of this.childNodes) n += typeof e == "string" ? e : e.textContent;
    return n;
  }
  /** 只支持 '*'，与解析器里的用法一致 */
  getElementsByTagName(n) {
    const e = [], r = (a) => {
      for (const i of a.children)
        (n === "*" || i.localName === n || i.tagName === n) && e.push(i), r(i);
    };
    return r(this), e;
  }
}
const pn = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function Bt(t) {
  return t.indexOf("&") < 0 ? t : t.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (n, e) => {
    if (e[0] === "#") {
      const r = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(r) && r >= 0 ? String.fromCodePoint(r) : n;
    }
    return pn[e] ?? n;
  });
}
function gn(t) {
  let n = 0;
  const e = t.length, r = [];
  let a = null;
  const i = (s, l) => {
    const o = s.children;
    o.length && (o[o.length - 1].nextElementSibling = l), s.childNodes.push(l);
  };
  for (; n < e; ) {
    const s = t.indexOf("<", n);
    if (s < 0) break;
    if (s > n) {
      const g = t.slice(n, s);
      r.length && g.trim() ? r[r.length - 1].childNodes.push(Bt(g)) : r.length && g.includes(" ") && r[r.length - 1].childNodes.push(g);
    }
    if (t.startsWith("<!--", s)) {
      const g = t.indexOf("-->", s + 4);
      n = g < 0 ? e : g + 3;
      continue;
    }
    if (t.startsWith("<![CDATA[", s)) {
      const g = t.indexOf("]]>", s + 9), y = t.slice(s + 9, g < 0 ? e : g);
      r.length && r[r.length - 1].childNodes.push(y), n = g < 0 ? e : g + 3;
      continue;
    }
    if (t.startsWith("<?", s) || t.startsWith("<!", s)) {
      const g = t.indexOf(">", s);
      n = g < 0 ? e : g + 1;
      continue;
    }
    if (t[s + 1] === "/") {
      const g = t.indexOf(">", s);
      if (g < 0) break;
      r.pop(), n = g + 1;
      continue;
    }
    let l = s + 1, o = "";
    for (; l < e; ) {
      const g = t[l];
      if (o)
        g === o && (o = "");
      else if (g === '"' || g === "'") o = g;
      else if (g === ">") break;
      l++;
    }
    if (l >= e) break;
    const u = t[l - 1] === "/", h = t.slice(s + 1, u ? l - 1 : l);
    let c = 0;
    for (; c < h.length && !/[\s/]/.test(h[c]); ) c++;
    const f = new mn(h.slice(0, c)), b = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    b.lastIndex = c;
    let E;
    for (; (E = b.exec(h)) !== null; ) {
      const g = E[1], y = g.indexOf(":");
      f.attributes.push({
        name: g,
        localName: y < 0 ? g : g.slice(y + 1),
        prefix: y < 0 ? null : g.slice(0, y),
        namespaceURI: null,
        value: Bt(E[3] ?? E[4] ?? "")
      });
    }
    f.resolveNamespaces(r[r.length - 1]), r.length ? i(r[r.length - 1], f) : a || (a = f), u || r.push(f), n = l + 1;
  }
  if (!a) throw new Error("XML 解析失败：未找到根元素");
  return a;
}
const jt = typeof DOMParser < "u" ? new DOMParser() : null;
function $t(t) {
  if (!jt)
    return gn(t);
  const n = jt.parseFromString(t, "application/xml"), e = n.getElementsByTagName("parsererror")[0];
  if (e) throw new Error("XML 解析失败: " + (e.textContent ?? "").slice(0, 200));
  return n.documentElement;
}
function Dt(t, n) {
  const e = [];
  if (!t) return e;
  for (let r = t.firstElementChild; r; r = r.nextElementSibling)
    r.localName === n && e.push(r);
  return e;
}
function Y(t, n) {
  if (!t) return null;
  for (let e = t.firstElementChild; e; e = e.nextElementSibling)
    if (e.localName === n) return e;
  return null;
}
function F(t, n) {
  if (!t) return null;
  if (n.includes(":")) {
    for (const a of Array.from(t.attributes)) if (a.name === n) return a.value;
    const r = n.split(":")[1];
    for (const a of Array.from(t.attributes)) if (a.localName === r) return a.value;
    return null;
  }
  const e = t.getAttribute(n);
  if (e !== null) return e;
  for (const r of Array.from(t.attributes)) if (r.localName === n) return r.value;
  return null;
}
function K(t, n) {
  const e = F(t, n);
  if (e === null || e === "") return null;
  const r = Number(e);
  return Number.isFinite(r) ? r : null;
}
function pt(t, n, e = !1) {
  const r = F(t, n);
  return r === null ? e : r === "1" || r === "true";
}
const wn = { window: "FFFFFF", windowText: "000000" }, dn = {
  black: "000000",
  white: "FFFFFF",
  red: "FF0000",
  green: "008000",
  lime: "00FF00",
  blue: "0000FF",
  yellow: "FFFF00",
  cyan: "00FFFF",
  magenta: "FF00FF",
  gray: "808080",
  ltGray: "C0C0C0",
  dkGray: "404040",
  orange: "FFA500",
  purple: "800080",
  brown: "A52A2A"
}, xn = ["srgbClr", "schemeClr", "sysClr", "prstClr", "scrgbClr", "hslClr"];
function kt(t, n) {
  if (!t) return null;
  for (const e of xn) {
    const r = Y(t, e);
    if (r) return En(r, n);
  }
  return null;
}
function En(t, n) {
  let e = yn(t, n), r = 1;
  for (let l = t.firstElementChild; l; l = l.nextElementSibling) {
    const o = (K(l, "val") ?? 0) / 1e5;
    switch (l.localName) {
      case "alpha":
        r = o;
        break;
      case "shade":
        e = Xt(e, (u) => u * o);
        break;
      case "tint":
        e = Xt(e, (u) => u * o + (1 - o));
        break;
      case "lumMod":
        e = St(e, (u, h, c) => [u, h, c * o]);
        break;
      case "lumOff":
        e = St(e, (u, h, c) => [u, h, c + o]);
        break;
      case "satMod":
        e = St(e, (u, h, c) => [u, h * o, c]);
        break;
    }
  }
  const [a, i, s] = e.map((l) => Math.round(Ct(l, 0, 255)));
  return r >= 1 ? `rgb(${a},${i},${s})` : `rgba(${a},${i},${s},${Math.round(r * 1e3) / 1e3})`;
}
function yn(t, n) {
  switch (t.localName) {
    case "srgbClr":
      return gt(F(t, "val") ?? "000000");
    case "sysClr":
      return gt(F(t, "lastClr") ?? wn[F(t, "val") ?? ""] ?? "000000");
    case "prstClr":
      return gt(dn[F(t, "val") ?? ""] ?? "808080");
    case "scrgbClr":
      return [
        (K(t, "r") ?? 0) / 1e5 * 255,
        (K(t, "g") ?? 0) / 1e5 * 255,
        (K(t, "b") ?? 0) / 1e5 * 255
      ];
    case "hslClr":
      return Kt(
        (K(t, "hue") ?? 0) / 6e4 / 360,
        (K(t, "sat") ?? 0) / 1e5,
        (K(t, "lum") ?? 0) / 1e5
      );
    case "schemeClr": {
      const e = F(t, "val") ?? "tx1";
      if (e === "phClr") return n.phClr ? Mn(n.phClr) : [128, 128, 128];
      const r = n.clrMap[e] ?? e;
      return gt(n.theme[r] ?? n.theme[e] ?? "000000");
    }
  }
  return [0, 0, 0];
}
function Mn(t) {
  const n = t.match(/rgba?\(([^)]+)\)/);
  if (n) {
    const e = n[1].split(",").map((r) => Number(r.trim()));
    return [e[0] || 0, e[1] || 0, e[2] || 0];
  }
  return gt(t);
}
function gt(t) {
  const n = t.replace("#", "").padStart(6, "0");
  return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0];
}
function Ct(t, n, e) {
  return Math.min(e, Math.max(n, t));
}
const bn = (t) => {
  const n = t / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}, vn = (t) => {
  const n = Ct(t, 0, 1);
  return (n <= 31308e-7 ? n * 12.92 : 1.055 * n ** (1 / 2.4) - 0.055) * 255;
};
function Xt(t, n) {
  return t.map((e) => vn(n(bn(e))));
}
function St(t, n) {
  const [e, r, a] = Cn(t), [i, s, l] = n(e, r, a);
  return Kt(i, Ct(s, 0, 1), Ct(l, 0, 1));
}
function Cn([t, n, e]) {
  t /= 255, n /= 255, e /= 255;
  const r = Math.max(t, n, e), a = Math.min(t, n, e), i = (r + a) / 2;
  if (r === a) return [0, 0, i];
  const s = r - a, l = i > 0.5 ? s / (2 - r - a) : s / (r + a);
  let o;
  return r === t ? o = (n - e) / s + (n < e ? 6 : 0) : r === n ? o = (e - t) / s + 2 : o = (t - n) / s + 4, [o / 6, l, i];
}
function Kt(t, n, e) {
  if (n === 0) return [e * 255, e * 255, e * 255];
  const r = e < 0.5 ? e * (1 + n) : e + n - e * n, a = 2 * e - r, i = (s) => (s < 0 && (s += 1), s > 1 && (s -= 1), s < 1 / 6 ? a + (r - a) * 6 * s : s < 1 / 2 ? r : s < 2 / 3 ? a + (r - a) * (2 / 3 - s) * 6 : a);
  return [i(t + 1 / 3) * 255, i(t) * 255, i(t - 1 / 3) * 255];
}
const Nn = (t) => t * 96 / 72, j = (t) => {
  if (!Number.isFinite(t)) return "0";
  const n = Math.round(t * 100) / 100;
  return Object.is(n, -0) ? "0" : String(n);
}, Tt = (t, n, e) => t < n ? n : t > e ? e : t, at = (t, n = 0) => Number.isFinite(t) ? t : n;
function xt(t, n, e, r, a, i, s) {
  return {
    kind: "shape",
    x: at(t),
    y: at(n),
    w: Math.max(at(e), 0),
    h: Math.max(at(r), 0),
    rot: 0,
    flipH: !1,
    flipV: !1,
    path: a,
    fill: i,
    stroke: s,
    text: null
  };
}
const Fn = (t, n) => `M 0 0 L ${j(t)} 0 L ${j(t)} ${j(n)} L 0 ${j(n)} Z`;
function Nt(t, n, e) {
  return xt(t.x, t.y, t.w, t.h, Fn(t.w, t.h), n, e);
}
function $n(t, n, e, r, a) {
  if (!a || ![t, n, e, r].every(Number.isFinite)) return null;
  const i = Math.min(t, e), s = Math.min(n, r);
  return xt(
    i,
    s,
    Math.abs(e - t),
    Math.abs(r - n),
    `M ${j(t - i)} ${j(n - s)} L ${j(e - i)} ${j(r - s)}`,
    null,
    a
  );
}
function _t(t, n, e, r) {
  const a = t.map((h) => h.filter(([c, f]) => Number.isFinite(c) && Number.isFinite(f))).filter((h) => h.length >= 2);
  if (!a.length) return null;
  let i = 1 / 0, s = 1 / 0, l = -1 / 0, o = -1 / 0;
  for (const h of a)
    for (const [c, f] of h)
      i = Math.min(i, c), s = Math.min(s, f), l = Math.max(l, c), o = Math.max(o, f);
  const u = a.map((h) => "M " + h.map(([c, f]) => `${j(c - i)} ${j(f - s)}`).join(" L ")).join(" ");
  return xt(i, s, l - i, o - s, u, n, e);
}
function tn(t, n, e, r, a, i = {}) {
  const s = {
    text: a,
    b: i.bold ?? !1,
    i: !1,
    u: !1,
    strike: !1,
    size: i.size ?? Nn(10),
    color: i.color ?? "rgb(0,0,0)",
    fonts: i.fonts ?? []
  }, l = {
    align: i.align ?? "center",
    lvl: 0,
    marL: 0,
    indent: 0,
    bullet: null,
    lineHeight: 1.15,
    spaceBefore: 0,
    spaceAfter: 0,
    runs: [s]
  }, o = {
    anchor: i.anchor ?? "middle",
    insets: [0, 0, 0, 0],
    wrap: !1,
    fontScale: 1,
    paragraphs: [l]
  };
  return {
    kind: "shape",
    x: at(t),
    y: at(n),
    w: Math.max(at(e), 0),
    h: Math.max(at(r), 0),
    rot: i.rot ?? 0,
    flipH: !1,
    flipV: !1,
    path: null,
    fill: null,
    stroke: null,
    text: o
  };
}
const nt = (t) => ({ type: "solid", color: t });
function nn(t, n) {
  const e = t.clrMap[n] ?? n, r = (t.theme[e] ?? t.theme[n] ?? "000000").replace(/^#/, "");
  return "#" + (r.length >= 6 ? r.slice(0, 6) : r.padStart(6, "0"));
}
function Ht(t) {
  const n = t.trim();
  if (n.startsWith("#")) {
    const r = n.slice(1), a = r.length === 3 ? r.split("").map((i) => i + i).join("") : r.padStart(6, "0");
    return [
      parseInt(a.slice(0, 2), 16) || 0,
      parseInt(a.slice(2, 4), 16) || 0,
      parseInt(a.slice(4, 6), 16) || 0
    ];
  }
  const e = n.match(/-?[\d.]+/g);
  return e && e.length >= 3 ? [Number(e[0]) || 0, Number(e[1]) || 0, Number(e[2]) || 0] : [0, 0, 0];
}
function Ft(t, n, e) {
  const r = Ht(t), a = Ht(n), i = Tt(e, 0, 1), s = r.map((l, o) => Math.round(l + (a[o] - l) * i));
  return `rgb(${s[0]},${s[1]},${s[2]})`;
}
function st(t, n) {
  const e = (n % 6 + 6) % 6, r = nn(t, `accent${e + 1}`), a = Math.floor(n / 6);
  return a <= 0 ? r : a % 2 === 1 ? Ft(r, "#ffffff", Tt(0.3 * Math.ceil(a / 2), 0, 0.72)) : Ft(r, "#000000", Tt(0.22 * (a / 2), 0, 0.6));
}
function At(t, n) {
  if (!t) return null;
  if (Y(t, "noFill")) return { type: "none" };
  const e = Y(t, "solidFill");
  if (e) return nt(kt(e, n) ?? "rgb(0,0,0)");
  const r = Y(t, "gradFill");
  if (r) {
    const i = Dt(Y(r, "gsLst"), "gs").map((l) => ({ pos: (K(l, "pos") ?? 0) / 1e5, color: kt(l, n) ?? "rgb(0,0,0)" })).sort((l, o) => l.pos - o.pos);
    if (!i.length) return null;
    const s = Y(r, "lin");
    return { type: "gradient", angle: s ? (K(s, "ang") ?? 0) / 6e4 : 90, stops: i };
  }
  const a = Y(t, "pattFill");
  if (a) {
    const i = kt(Y(a, "fgClr"), n);
    if (i) return nt(i);
  }
  return null;
}
function In(t) {
  const n = [];
  let e = "", r = !1;
  for (let a = 0; a < t.length; a++) {
    const i = t[a];
    if (i === '"') {
      r = !r, e += i;
      continue;
    }
    if (i === "\\") {
      e += i + (t[a + 1] ?? ""), a++;
      continue;
    }
    if (i === ";" && !r) {
      n.push(e), e = "";
      continue;
    }
    e += i;
  }
  return n.push(e), n;
}
const Pt = (t) => t.replace(/\\(.)/g, "$1").replace(/"/g, "").replace(/[*_](.)/g, "").replace(/@/g, "");
function kn(t) {
  if (Number.isInteger(t)) return String(t);
  const n = Math.abs(t);
  return n !== 0 && (n >= 1e11 || n < 1e-4) ? t.toExponential(2) : String(Math.round(t * 1e6) / 1e6);
}
function Sn(t) {
  return t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function Lt(t, n) {
  const e = n.replace(/\[[^\]]*\]/g, "");
  let r = t;
  const a = r < 0;
  r = Math.abs(r);
  const i = (e.match(/%/g) ?? []).length;
  i && (r *= Math.pow(100, i));
  const s = e.match(/[#0?][#0?,]*(\.[#0?]+)?/);
  if (!s) return (a ? "-" : "") + Pt(e);
  const l = s[0], o = s.index ?? 0, u = Pt(e.slice(0, o)), h = Pt(e.slice(o + l.length)), c = l.indexOf(".");
  let f = c < 0 ? l : l.slice(0, c);
  const b = c < 0 ? "" : l.slice(c + 1), E = f.match(/,+$/);
  E && (r /= Math.pow(1e3, E[0].length), f = f.slice(0, -E[0].length));
  const g = f.includes(","), y = b.length, x = (b.match(/0/g) ?? []).length;
  let m = r.toFixed(Math.min(y, 20));
  y > x && (m = m.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ""), (m.split(".")[1] ?? "").length < x && (m = r.toFixed(x)));
  let [p, M] = m.split(".");
  const w = (f.match(/0/g) ?? []).length;
  return p.length < w && (p = p.padStart(w, "0")), w === 0 && p === "0" && M && (p = ""), g && (p = Sn(p)), (a ? "-" : "") + u + p + (M ? "." + M : "") + h;
}
function Wt(t, n) {
  if (!Number.isFinite(t)) return "";
  const e = "".trim();
  if (!e || /^general$/i.test(e)) return kn(t);
  if (/e[+-]/i.test(e)) return t.toExponential(2);
  const r = In(e);
  return t < 0 && r.length > 1 && r[1].trim() ? Lt(-t, r[1]) : t === 0 && r.length > 2 && r[2].trim() ? Lt(0, r[2]) : Lt(t, r[0] ?? "");
}
const wt = (t) => Number(t.toPrecision(12));
function An(t, n, e = 5) {
  let r = Number.isFinite(t) ? t : 0, a = Number.isFinite(n) ? n : 1;
  if (a < r && ([r, a] = [a, r]), r === a)
    if (r === 0)
      r = 0, a = 1;
    else {
      const c = Math.abs(r) * 0.5;
      r -= c, a += c;
    }
  const i = (a - r) / Math.max(1, e), s = Math.pow(10, Math.floor(Math.log10(i))), l = i / s, o = (l <= 1 ? 1 : l <= 2 ? 2 : l <= 5 ? 5 : 10) * s, u = wt(Math.floor(r / o + 1e-9) * o);
  let h = wt(Math.ceil(a / o - 1e-9) * o);
  return h > u || (h = wt(u + o)), { min: u, max: h, step: o };
}
function Pn(t) {
  const n = [];
  if (!(t.step > 0) || !Number.isFinite(t.min) || !Number.isFinite(t.max)) return [t.min];
  const e = Math.floor((t.max - t.min) / t.step + 1e-6), r = Math.min(e, 60);
  for (let i = 0; i <= r; i++) n.push(wt(t.min + i * t.step));
  const a = n[n.length - 1];
  return a !== void 0 && t.max - a > t.step * 1e-6 && n.push(wt(t.max)), n;
}
const lt = "http://schemas.microsoft.com/office/drawing/2014/chartex", Ut = 1e4, z = (t, n, e = lt) => Array.from((t == null ? void 0 : t.children) ?? []).filter((r) => r.localName === n && r.namespaceURI === e), $ = (t, n, e = lt) => z(t, n, e)[0] ?? null;
function et(t, n = Ut) {
  if (t === null || !/^\d+$/.test(t))
    throw new Error("无效 ChartEx 索引");
  const e = Number(t);
  if (!Number.isSafeInteger(e) || e > n)
    throw new Error("ChartEx 索引超限");
  return e;
}
function ht(t) {
  if (t === null || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(t.trim()))
    throw new Error("无效 ChartEx 数值");
  const n = Number(t);
  if (!Number.isFinite(n))
    throw new Error("ChartEx 数值超限");
  return n;
}
function en(t, n) {
  const e = t.localName === "numDim", r = z(t, "f");
  if (r.length > 1)
    throw new Error("ChartEx 公式不唯一");
  const a = z(t, "lvl");
  let i = 0;
  const s = (o) => {
    const u = et(F(o, "ptCount"));
    if ((i += u) > Ut)
      throw new Error("ChartEx 数据超限");
    const h = Array.from({ length: u }, () => null), c = /* @__PURE__ */ new Set();
    for (const f of z(o, "pt")) {
      const b = et(F(f, "idx"));
      if (b >= u || c.has(b) || f.children.length)
        throw new Error("ChartEx 数据点冲突");
      c.add(b), h[b] = e ? ht(f.textContent) : f.textContent ?? "";
    }
    return h;
  }, l = a.length ? a.map(s) : r.length ? n(r[0]) : [];
  if (a.length && r.length) {
    const o = n(r[0]);
    if (JSON.stringify(l) !== JSON.stringify(o))
      throw new Error("ChartEx 缓存与工作簿不一致");
  }
  if (!l.length || l.some((o) => o.some((u) => u !== null && typeof u != (e ? "number" : "string"))))
    throw new Error("ChartEx 维度缺失或类型不匹配");
  return {
    type: F(t, "type") ?? "",
    numeric: e,
    source: a.length ? r.length ? "cache" : "literal" : "workbook",
    levels: l,
    format: F(a[0] ?? null, "formatCode")
  };
}
const H = "http://schemas.openxmlformats.org/spreadsheetml/2006/main", Mt = "http://schemas.openxmlformats.org/officeDocument/2006/relationships", Ln = "http://schemas.openxmlformats.org/package/2006/relationships", Zt = (t) => [...t.toUpperCase()].reduce((n, e) => n * 26 + e.charCodeAt(0) - 64, 0), rn = (t) => t ? rn(Math.floor((t - 1) / 26)) + String.fromCharCode(65 + (t - 1) % 26) : "", Gt = (t) => z(t, "t", H).map((n) => n.textContent ?? "").join("") + z(t, "r", H).map((n) => z(n, "t", H).map((e) => e.textContent ?? "").join("")).join("");
function on(t, n) {
  let e;
  return (r) => {
    var a;
    if (!e) {
      const i = z($(t, "chartData"), "externalData");
      if (i.length !== 1)
        throw new Error("ChartEx 缺少唯一内嵌工作簿");
      const s = n.rels[F(i[0], "r:id") ?? ""], l = (s == null ? void 0 : s.type) === `${Mt}/package` ? (a = n.readPart) == null ? void 0 : a.call(n, s.target) : void 0;
      if (!l)
        throw new Error("ChartEx 工作簿不可用");
      let o = 0;
      const u = un(l, { filter: (h) => {
        if (o += h.originalSize, o > 32 * 1024 * 1024)
          throw new Error("ChartEx 工作簿超限");
        return /\.xml$|\.rels$/.test(h.name);
      } });
      e = Rn(u);
    }
    return e(r);
  };
}
function Rn(t) {
  const n = /* @__PURE__ */ new Map(), e = (c) => {
    if (!t[c])
      throw new Error("ChartEx 工作簿 part 缺失");
    return n.has(c) || n.set(c, $t(new TextDecoder().decode(t[c]))), n.get(c);
  }, r = (c) => {
    const f = c.lastIndexOf("/") + 1, b = c.slice(0, f), E = `${b}_rels/${c.slice(f)}.rels`;
    return t[E] ? z(e(E), "Relationship", Ln).filter((g) => F(g, "TargetMode") !== "External").map((g) => {
      const y = F(g, "Target") ?? "";
      if (/^[a-z]+:|[?#\\]/i.test(y))
        throw new Error("ChartEx 非包内关系");
      const x = [];
      for (const m of (y.startsWith("/") ? y : b + y).split("/"))
        if (m === "..") {
          if (!x.length)
            throw new Error("ChartEx 关系越界");
          x.pop();
        } else m && m !== "." && x.push(m);
      return { id: F(g, "Id") ?? "", type: F(g, "Type") ?? "", target: x.join("/") };
    }) : [];
  }, a = (c) => {
    if (c.length !== 1)
      throw new Error("ChartEx 工作簿绑定歧义");
    return c[0];
  }, i = a(r("").filter((c) => c.type === `${Mt}/officeDocument`)), s = e(i.target);
  if (s.namespaceURI !== H || s.localName !== "workbook")
    throw new Error("ChartEx 非工作簿");
  const l = r(i.target), o = z($(s, "definedNames", H), "definedName", H), u = l.filter((c) => c.type === `${Mt}/sharedStrings`);
  if (u.length > 1)
    throw new Error("ChartEx 共享字符串歧义");
  const h = u.length ? z(e(u[0].target), "si", H).map(Gt) : [];
  return (c) => {
    var P;
    let f = c.textContent ?? "";
    const b = o.filter((k) => F(k, "name") === f);
    if (b.length) {
      const k = a(b);
      if (F(k, "localSheetId") !== null)
        throw new Error("ChartEx 局部名称不支持");
      f = k.textContent ?? "";
    }
    const E = /^(?:'((?:[^']|'')+)'|([^'!\[\]]+))!\$?([A-Z]+)\$?([1-9]\d*)(?::\$?([A-Z]+)\$?([1-9]\d*))?$/i.exec(f);
    if (!E)
      throw new Error("ChartEx 非矩形引用");
    const g = ((P = E[1]) == null ? void 0 : P.replace(/''/g, "'")) ?? E[2], y = a(z($(s, "sheets", H), "sheet", H).filter((k) => F(k, "name") === g)), x = a(l.filter((k) => k.id === F(y, "r:id") && k.type === `${Mt}/worksheet`)), m = Zt(E[3]), p = Number(E[4]), M = Zt(E[5] ?? E[3]), w = Number(E[6] ?? E[4]);
    if (m > M || p > w || M > 16384 || w > 1048576 || (M - m + 1) * (w - p + 1) > Ut)
      throw new Error("ChartEx 范围超限");
    const d = z($(e(x.target), "sheetData", H), "row", H).flatMap((k) => z(k, "c", H)), v = new Map(d.map((k) => [F(k, "r"), k]));
    if (v.size !== d.length)
      throw new Error("ChartEx 单元格重复");
    const C = (k) => {
      var U;
      if (!k)
        return null;
      const O = ((U = $(k, "v", H)) == null ? void 0 : U.textContent) ?? null, Z = F(k, "t") ?? "n";
      if (Z === "inlineStr")
        return Gt($(k, "is", H));
      if (Z === "str" && O !== null)
        return O;
      if (Z === "s") {
        const X = h[et(O, h.length - 1)];
        if (X === void 0)
          throw new Error("ChartEx 字符串索引无效");
        return X;
      }
      if (Z !== "n")
        throw new Error("ChartEx 单元格不是文字或数值");
      return O === null && !$(k, "f", H) ? null : ht(O);
    }, N = Array.from({ length: w - p + 1 }, (k, O) => Array.from({ length: M - m + 1 }, (Z, U) => C(v.get(`${rn(m + U)}${p + O}`)))), R = F(c, "dir") ?? "col";
    if (R !== "col" && R !== "row")
      throw new Error("ChartEx 维度方向无效");
    return (R === "row" ? N : N[0].map((k, O) => N.map((Z) => Z[O]))).reverse();
  };
}
function Yt(t) {
  var e;
  const n = $(t, "rich");
  return n ? Dt(n, "p").map((r) => Dt(r, "r").map((a) => {
    var i;
    return ((i = Y(a, "t")) == null ? void 0 : i.textContent) ?? "";
  }).join("")).join(`
`) : ((e = $($(t, "txData"), "v")) == null ? void 0 : e.textContent) ?? "";
}
function zn(t, n) {
  if (t.namespaceURI !== lt || t.localName !== "chartSpace")
    throw new Error("非 ChartEx");
  const e = $(t, "chart"), r = $(e, "plotArea"), a = $(r, "plotAreaRegion"), s = z(a, "series").map((y, x) => ({ node: y, index: x })).filter(({ node: y }) => !pt(y, "hidden")), l = s.filter(({ node: y }) => F(y, "layoutId") !== "paretoLine"), o = l.map(({ node: y }) => F(y, "layoutId"));
  if (!o.length || o.some((y) => y !== o[0]))
    throw new Error("ChartEx 混合布局不支持");
  const u = s.filter(({ node: y }) => F(y, "layoutId") === "paretoLine");
  if (u.length && (u.length !== 1 || l.length !== 1 || et(F(u[0].node, "ownerIdx")) !== l[0].index))
    throw new Error("ChartEx Pareto 归属不明");
  const h = o[0] === "clusteredColumn" ? u.length ? "pareto" : "histogram" : o[0];
  if (!["treemap", "sunburst", "histogram", "pareto", "boxWhisker", "waterfall", "funnel", "regionMap"].includes(h ?? ""))
    throw new Error("ChartEx 布局不支持");
  if (l.length !== 1 && h !== "boxWhisker")
    throw new Error("ChartEx 可见系列不唯一");
  const c = on(t, n), f = z($(t, "chartData"), "data"), b = f.map((y) => F(y, "id"));
  if (new Set(b).size !== b.length)
    throw new Error("ChartEx dataId 重复");
  const E = l.map(({ node: y, index: x }) => {
    const m = F($(y, "dataId"), "val");
    if (m === null)
      throw new Error("ChartEx dataId 缺失");
    const p = f.find((L) => F(L, "id") === m);
    if (!p)
      throw new Error("ChartEx 数据不存在");
    const M = [...z(p, "strDim"), ...z(p, "numDim")].map((L) => en(L, c)), w = (L, _ = !0) => {
      const rt = M.filter((ct) => ct.type === L);
      if (rt.length > 1 || _ && rt.length !== 1)
        throw new Error("ChartEx 维度歧义");
      return rt[0];
    }, d = h === "regionMap" ? w("colorVal", !1) ?? w("val", !1) ?? w("colorStr") : w(h === "treemap" || h === "sunburst" ? "size" : "val"), v = h === "regionMap" ? w("entityId", !1) : void 0, C = w("cat", !1);
    if (!d.numeric && !(h === "regionMap" && d.type === "colorStr") || d.levels.length !== 1 || C != null && C.numeric)
      throw new Error("ChartEx 数据类型不匹配");
    const N = d.numeric ? void 0 : d.levels[0], R = [...new Set(N == null ? void 0 : N.filter((L) => L !== null))], P = N ? N.map((L) => L === null ? null : R.indexOf(L)) : d.levels[0];
    if (C != null && C.levels.some((L) => L.length !== P.length))
      throw new Error("ChartEx 类别与数值错位");
    const k = $(y, "layoutPr"), O = $(k, "binning"), Z = $(k, "statistics"), U = $(k, "visibility"), X = (L) => {
      const _ = F(O, L);
      return _ === null || _ === "auto" ? void 0 : ht(_);
    }, Q = $(O, "binSize"), tt = $(O, "binCount");
    if (Q && tt)
      throw new Error("ChartEx 分箱配置冲突");
    const G = F(Z, "quartileMethod") ?? "exclusive", I = F($(k, "parentLabelLayout"), "val") ?? "overlapping", A = F(O, "intervalClosed") ?? "r";
    if (!["inclusive", "exclusive"].includes(G) || !["none", "banner", "overlapping"].includes(I) || !["l", "r"].includes(A))
      throw new Error("ChartEx 布局参数无效");
    const D = st(n.ctx, K(y, "formatIdx") ?? x), S = At($(y, "spPr"), n.ctx) ?? { type: "solid", color: D }, B = /* @__PURE__ */ new Map();
    for (const L of z(y, "dataPt")) {
      const _ = et(F(L, "idx"));
      if (_ >= P.length || B.has(_))
        throw new Error("ChartEx 点格式越界");
      B.set(_, At($(L, "spPr"), n.ctx) ?? S);
    }
    const q = new Set(z($(k, "subtotals"), "idx").map((L) => et(F(L, "val"))));
    if ([...q].some((L) => L >= P.length))
      throw new Error("ChartEx 小计索引越界");
    return {
      index: x,
      name: Yt($(y, "tx")),
      values: P,
      ...v ? { entities: v.levels[0] } : {},
      ...N ? { colorCategories: N } : {},
      categories: (C == null ? void 0 : C.levels) ?? [],
      fill: S,
      points: B,
      totals: q,
      parentLabels: I,
      quartile: G,
      outliers: pt(U, "outliers", !0),
      innerPoints: pt(U, "nonoutliers"),
      meanMarker: pt(U, "meanMarker", !0),
      meanLine: pt(U, "meanLine"),
      labels: $(y, "dataLabels") !== null,
      binning: {
        size: Q ? ht(Q.textContent) : void 0,
        count: tt ? et(tt.textContent, 1e3) : void 0,
        underflow: X("underflow"),
        overflow: X("overflow"),
        closed: A,
        aggregation: $(k, "aggregation") !== null
      }
    };
  }), g = K(Y(Y(Y($(t, "txPr"), "p"), "pPr"), "defRPr"), "sz");
  return {
    kind: h,
    series: E,
    title: Yt($($(e, "title"), "tx")),
    background: At($(t, "spPr"), n.ctx) ?? { type: "solid", color: "#ffffff" },
    textColor: nn(n.ctx, "tx1"),
    fonts: [n.fonts.minor.latin, n.fonts.minor.ea].filter((y) => !!y),
    size: g && g > 0 ? g / 75 : 14,
    legend: $(e, "legend") ? F($(e, "legend"), "pos") ?? "b" : null
  };
}
var W = Uint8Array, ft = Uint16Array, Dn = Int32Array, an = new W([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), sn = new W([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), Tn = new W([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), ln = function(t, n) {
  for (var e = new ft(31), r = 0; r < 31; ++r)
    e[r] = n += 1 << t[r - 1];
  for (var a = new Dn(e[30]), r = 1; r < 30; ++r)
    for (var i = e[r]; i < e[r + 1]; ++i)
      a[i] = i - e[r] << 5 | r;
  return { b: e, r: a };
}, cn = ln(an, 2), fn = cn.b, On = cn.r;
fn[28] = 258, On[258] = 28;
var Un = ln(sn, 0), qn = Un.b, Ot = new ft(32768);
for (var T = 0; T < 32768; ++T) {
  var ot = (T & 43690) >> 1 | (T & 21845) << 1;
  ot = (ot & 52428) >> 2 | (ot & 13107) << 2, ot = (ot & 61680) >> 4 | (ot & 3855) << 4, Ot[T] = ((ot & 65280) >> 8 | (ot & 255) << 8) >> 1;
}
var dt = function(t, n, e) {
  for (var r = t.length, a = 0, i = new ft(n); a < r; ++a)
    t[a] && ++i[t[a] - 1];
  var s = new ft(n);
  for (a = 1; a < n; ++a)
    s[a] = s[a - 1] + i[a - 1] << 1;
  var l;
  if (e) {
    l = new ft(1 << n);
    var o = 15 - n;
    for (a = 0; a < r; ++a)
      if (t[a])
        for (var u = a << 4 | t[a], h = n - t[a], c = s[t[a] - 1]++ << h, f = c | (1 << h) - 1; c <= f; ++c)
          l[Ot[c] >> o] = u;
  } else
    for (l = new ft(r), a = 0; a < r; ++a)
      t[a] && (l[a] = Ot[s[t[a] - 1]++] >> 15 - t[a]);
  return l;
}, Et = new W(288);
for (var T = 0; T < 144; ++T)
  Et[T] = 8;
for (var T = 144; T < 256; ++T)
  Et[T] = 9;
for (var T = 256; T < 280; ++T)
  Et[T] = 7;
for (var T = 280; T < 288; ++T)
  Et[T] = 8;
var hn = new W(32);
for (var T = 0; T < 32; ++T)
  hn[T] = 5;
var Bn = /* @__PURE__ */ dt(Et, 9, 1), jn = /* @__PURE__ */ dt(hn, 5, 1), Rt = function(t) {
  for (var n = t[0], e = 1; e < t.length; ++e)
    t[e] > n && (n = t[e]);
  return n;
}, J = function(t, n, e) {
  var r = n / 8 | 0;
  return (t[r] | t[r + 1] << 8) >> (n & 7) & e;
}, zt = function(t, n) {
  var e = n / 8 | 0;
  return (t[e] | t[e + 1] << 8 | t[e + 2] << 16) >> (n & 7);
}, Xn = function(t) {
  return (t + 7) / 8 | 0;
}, bt = function(t, n, e) {
  return (n == null || n < 0) && (n = 0), (e == null || e > t.length) && (e = t.length), new W(t.subarray(n, e));
}, _n = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
], V = function(t, n, e) {
  var r = new Error(n || _n[t]);
  if (r.code = t, Error.captureStackTrace && Error.captureStackTrace(r, V), !e)
    throw r;
  return r;
}, Hn = function(t, n, e, r) {
  var a = t.length, i = 0;
  if (!a || n.f && !n.l)
    return e || new W(0);
  var s = !e, l = s || n.i != 2, o = n.i;
  s && (e = new W(a * 3));
  var u = function(ut) {
    var mt = e.length;
    if (ut > mt) {
      var qt = new W(Math.max(mt * 2, ut));
      qt.set(e), e = qt;
    }
  }, h = n.f || 0, c = n.p || 0, f = n.b || 0, b = n.l, E = n.d, g = n.m, y = n.n, x = a * 8;
  do {
    if (!b) {
      h = J(t, c, 1);
      var m = J(t, c + 1, 3);
      if (c += 3, m)
        if (m == 1)
          b = Bn, E = jn, g = 9, y = 5;
        else if (m == 2) {
          var d = J(t, c, 31) + 257, v = J(t, c + 10, 15) + 4, C = d + J(t, c + 5, 31) + 1;
          c += 14;
          for (var N = new W(C), R = new W(19), P = 0; P < v; ++P)
            R[Tn[P]] = J(t, c + P * 3, 7);
          c += v * 3;
          for (var k = Rt(R), O = (1 << k) - 1, Z = dt(R, k, 1), P = 0; P < C; ) {
            var U = Z[J(t, c, O)];
            c += U & 15;
            var p = U >> 4;
            if (p < 16)
              N[P++] = p;
            else {
              var X = 0, Q = 0;
              for (p == 16 ? (Q = 3 + J(t, c, 3), c += 2, X = N[P - 1]) : p == 17 ? (Q = 3 + J(t, c, 7), c += 3) : p == 18 && (Q = 11 + J(t, c, 127), c += 7); Q--; )
                N[P++] = X;
            }
          }
          var tt = N.subarray(0, d), G = N.subarray(d);
          g = Rt(tt), y = Rt(G), b = dt(tt, g, 1), E = dt(G, y, 1);
        } else
          V(1);
      else {
        var p = Xn(c) + 4, M = t[p - 4] | t[p - 3] << 8, w = p + M;
        if (w > a) {
          o && V(0);
          break;
        }
        l && u(f + M), e.set(t.subarray(p, w), f), n.b = f += M, n.p = c = w * 8, n.f = h;
        continue;
      }
      if (c > x) {
        o && V(0);
        break;
      }
    }
    l && u(f + 131072);
    for (var I = (1 << g) - 1, A = (1 << y) - 1, D = c; ; D = c) {
      var X = b[zt(t, c) & I], S = X >> 4;
      if (c += X & 15, c > x) {
        o && V(0);
        break;
      }
      if (X || V(2), S < 256)
        e[f++] = S;
      else if (S == 256) {
        D = c, b = null;
        break;
      } else {
        var B = S - 254;
        if (S > 264) {
          var P = S - 257, q = an[P];
          B = J(t, c, (1 << q) - 1) + fn[P], c += q;
        }
        var L = E[zt(t, c) & A], _ = L >> 4;
        L || V(3), c += L & 15;
        var G = qn[_];
        if (_ > 3) {
          var q = sn[_];
          G += zt(t, c) & (1 << q) - 1, c += q;
        }
        if (c > x) {
          o && V(0);
          break;
        }
        l && u(f + 131072);
        var rt = f + B;
        if (f < G) {
          var ct = i - G, It = Math.min(G, rt);
          for (ct + f < 0 && V(3); f < It; ++f)
            e[f] = r[ct + f];
        }
        for (; f < rt; ++f)
          e[f] = e[f - G];
      }
    }
    n.l = b, n.p = D, n.b = f, n.f = h, b && (h = 1, n.m = g, n.d = E, n.n = y);
  } while (!h);
  return f != e.length && s ? bt(e, 0, f) : e.subarray(0, f);
}, Wn = /* @__PURE__ */ new W(0), Zn = /* @__PURE__ */ function() {
  function t(n, e) {
    typeof n == "function" && (e = n, n = {}), this.ondata = e;
    var r = n && n.dictionary && n.dictionary.subarray(-32768);
    this.s = { i: 0, b: r ? r.length : 0 }, this.o = new W(32768), this.p = new W(0), r && this.o.set(r);
  }
  return t.prototype.e = function(n) {
    if (this.ondata || V(5), this.d && V(4), !this.p.length)
      this.p = n;
    else if (n.length) {
      var e = new W(this.p.length + n.length);
      e.set(this.p), e.set(n, this.p.length), this.p = e;
    }
  }, t.prototype.c = function(n) {
    this.s.i = +(this.d = n || !1);
    var e = this.s.b, r = Hn(this.p, this.s, this.o);
    this.ondata(bt(r, e, this.s.b), this.d), this.o = bt(r, this.s.b - 32768), this.s.b = this.o.length, this.p = bt(this.p, this.s.p / 8 | 0), this.s.p &= 7;
  }, t.prototype.push = function(n, e) {
    this.e(n), this.c(e);
  }, t;
}(), Gn = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Yn = 0;
try {
  Gn.decode(Wn, { stream: !0 }), Yn = 1;
} catch {
}
const Qn = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", vt = (t) => t.normalize("NFKC").trim().toLowerCase();
function Jn(t) {
  const n = [];
  let e = 0, r = 0, a = 0;
  for (; e < t.length; ) {
    let i = 0, s = 1;
    for (; ; ) {
      const h = Qn.indexOf(t[e++] ?? "");
      if (h < 0 || e > t.length || s > 2 ** 50) throw new Error("地图边界编码无效");
      if (i += h % 32 * s, !Number.isSafeInteger(i)) throw new Error("地图边界整数超限");
      if (h < 32) break;
      s *= 32;
    }
    let l = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
    for (; l * (l + 1) / 2 > i; ) l--;
    for (; (l + 1) * (l + 2) / 2 <= i; ) l++;
    const o = i - l * (l + 1) / 2, u = l - o;
    if (r += u % 2 ? -(u + 1) / 2 : u / 2, a += o % 2 ? -(o + 1) / 2 : o / 2, Math.abs(r) > 18e6 || Math.abs(a) > 9e6 || n.length >= 2e5) throw new Error("地图坐标超限");
    n.push([r / 1e5, a / 1e5]);
  }
  if (n.length < 3) throw new Error("地图多边形顶点不足");
  return n;
}
function Vn(t) {
  const n = z(t, "clear");
  for (const e of z(t, "binary")) {
    const r = (e.textContent ?? "").replace(/\s/g, "");
    if (r.length > 16 * 1024 * 1024 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(r)) throw new Error("地图缓存编码无效");
    const a = Uint8Array.from(atob(r), (f) => f.charCodeAt(0)), i = [];
    let s = 0;
    const l = new Zn((f) => {
      if ((s += f.length) > 16 * 1024 * 1024) throw new Error("地图缓存解压超限");
      i.push(f);
    });
    for (let f = 0; f < a.length; f += 2048) l.push(a.subarray(f, f + 2048), !1);
    const o = new Uint8Array(s);
    let u = 0;
    for (const f of i)
      o.set(f, u), u += f.length;
    const h = new TextDecoder("utf-8", { fatal: !0 }).decode(o);
    if (!/<\/(?:[\w.-]+:)?clear>\s*$/.test(h)) throw new Error("地图缓存被截断");
    const c = $t(h);
    if (c.namespaceURI !== lt || c.localName !== "clear") throw new Error("地图缓存根无效");
    n.push(c);
  }
  return n;
}
function Kn(t) {
  const n = $(t, "geoCache");
  if (!n) throw new Error("地图缺少离线边界缓存");
  const e = [], r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  let i = 0;
  const s = Vn(n).flatMap((o) => [o, ...o.getElementsByTagName("*")]).filter((o) => o.namespaceURI === lt);
  for (const o of s) if (o.localName === "geoData") {
    const u = F(o, "entityId"), h = F(o, "entityName");
    if (!u || !h) throw new Error("地图区域身份缺失");
    const c = z($(o, "geoPolygons"), "geoPolygon").flatMap((f) => {
      const b = (F(f, "pcaRings") ?? "").split(",");
      if (b.shift() !== "1") throw new Error("地图边界版本不支持");
      const E = b.filter(Boolean).map(Jn), g = E.reduce((y, x) => y + x.length, 0);
      if (et(F(f, "numPoints"), 2e5) !== g || (i += g) > 3e5) throw new Error("地图顶点数量无效");
      return E;
    });
    c.length && !e.some((f) => f.id === u) && e.push({ id: u, name: h, rings: c, copyrights: z($(o, "copyrights"), "copyright").map((f) => f.textContent ?? "") }), r.set(vt(h), u);
  }
  const l = (o) => `${ht(F(o, "latitude")).toFixed(5)},${ht(F(o, "longitude")).toFixed(5)}`;
  for (const o of s) if (o.localName === "geoDataPointToEntityQueryResult") {
    const u = $(o, "geoDataPointQuery"), h = $(o, "geoDataPointToEntityQuery");
    u && h && F(h, "entityId") && a.set(l(u), F(h, "entityId"));
  }
  for (const o of s) if (o.localName === "geoLocationQueryResult") {
    const u = $(o, "geoLocationQuery");
    if (!u) continue;
    const h = z($(o, "geoLocations"), "geoLocation");
    if (h.length !== 1) continue;
    const c = h[0], f = a.get(l(c)) ?? r.get(vt(F(c, "entityName") ?? ""));
    if (!f) continue;
    for (const b of ["countryRegion", "adminDistrict1", "adminDistrict2", "locality", "postalCode", "query"]) {
      const E = F(u, b);
      E && r.set(vt(E), f);
    }
  }
  if (!e.length) throw new Error("地图缓存没有可绘制边界");
  return { regions: e, names: r };
}
const it = Math.PI / 180, Qt = [1, 0.9986, 0.9954, 0.99, 0.9822, 0.973, 0.96, 0.9427, 0.9216, 0.8962, 0.8679, 0.835, 0.7986, 0.7597, 0.7186, 0.6732, 0.6213, 0.5722, 0.5322], Jt = [0, 0.062, 0.124, 0.186, 0.248, 0.31, 0.372, 0.434, 0.4958, 0.5571, 0.6176, 0.6769, 0.7346, 0.7903, 0.8435, 0.8936, 0.9394, 0.9761, 1];
function te(t, n, e) {
  if (!["mercator", "miller", "robinson", "albers"].includes(t)) throw new Error("地图投影不支持");
  const r = Math.max(-70, Math.min(70, e - 15)) * it, a = Math.max(-75, Math.min(75, e + 15)) * it, i = (Math.sin(r) + Math.sin(a)) / 2, s = Math.cos(r) ** 2 + 2 * i * Math.sin(r);
  return ([l, o]) => {
    const u = (l - n) * it, h = Math.max(-89.999, Math.min(89.999, o)) * it;
    if (t === "mercator") return [u, -Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05113, Math.min(85.05113, o)) * it / 2))];
    if (t === "miller") return [u, -1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * h))];
    if (t === "albers" && Math.abs(i) > 1e-5) {
      const b = Math.sqrt(Math.max(0, s - 2 * i * Math.sin(h))) / i;
      return [b * Math.sin(i * u), b * Math.cos(i * u)];
    }
    if (t === "albers") return [u, -Math.sin(h)];
    const c = Math.min(17, Math.floor(Math.abs(o) / 5)), f = Math.min(1, Math.abs(o) / 5 - c);
    return [0.8487 * u * (Qt[c] * (1 - f) + Qt[c + 1] * f), -Math.sign(o) * 1.3523 * (Jt[c] * (1 - f) + Jt[c + 1] * f)];
  };
}
function ne(t, n) {
  let e = n;
  return t.map(([r, a]) => {
    for (; r - e > 180; ) r -= 360;
    for (; r - e < -180; ) r += 360;
    return e = r, [r, a];
  });
}
function Vt(t, n, e) {
  const r = [];
  for (let a = 0; a < t.length; a++) {
    const i = t[a], s = t[(a + 1) % t.length], l = (o) => e ? o[0] <= n : o[0] >= n;
    if (l(i) && r.push(i), l(i) !== l(s)) {
      const o = (n - i[0]) / (s[0] - i[0]);
      r.push([n, i[1] + o * (s[1] - i[1])]);
    }
  }
  return r;
}
function ee(t, n, e, r, a) {
  var G;
  if (!(e >= 40 && r >= 40) || !Number.isFinite(e + r)) throw new Error("地图画布无效");
  const i = n.series[0], s = z($($($(t, "chart"), "plotArea"), "plotAreaRegion"), "series")[i.index], l = $($(s ?? null, "layoutPr"), "geography");
  if (!l) throw new Error("地图地理属性缺失");
  const o = Kn(l), u = /* @__PURE__ */ new Map();
  if (i.values.forEach((I, A) => {
    var S, B;
    if (I === null) return;
    const D = ((S = i.entities) == null ? void 0 : S[A]) ?? o.names.get(vt(((B = i.categories[0]) == null ? void 0 : B[A]) ?? ""));
    if (!D || !o.regions.some((q) => q.id === D)) throw new Error("地图数据缺少离线边界");
    if (u.has(D)) throw new Error("地图数据区域重复");
    u.set(D, { value: I, index: A });
  }), !u.size) throw new Error("地图缺少有效数据");
  const h = o.regions.filter((I) => u.has(I.id)), c = h.flatMap((I) => I.rings.flatMap((A) => A)), f = Math.atan2(c.reduce((I, A) => I + Math.sin(A[0] * it), 0), c.reduce((I, A) => I + Math.cos(A[0] * it), 0)) / it, b = c.reduce((I, A) => I + A[1], 0) / c.length, E = te(F(l, "projectionType") ?? "mercator", f, b), g = o.regions.map((I) => ({ ...I, paths: I.rings.flatMap((A) => {
    const D = ne(A, f);
    return [-360, 0, 360].map((S) => Vt(Vt(D.map(([B, q]) => [B + S, q]), f - 180, !1), f + 180, !0)).filter((S) => S.length > 2).map((S) => S.map(E));
  }) })), y = F(l, "viewedRegionType") === "world" ? g : g.filter((I) => u.has(I.id));
  let x = 1 / 0, m = 1 / 0, p = -1 / 0, M = -1 / 0;
  for (const I of y) for (const A of I.paths) for (const [D, S] of A)
    x = Math.min(x, D), m = Math.min(m, S), p = Math.max(p, D), M = Math.max(M, S);
  const w = Math.max(8, Math.min(n.size, e / 20, r / 18)), d = Math.min(e, r) * 0.04, v = d + (n.title ? w * 2 : 0), C = w * (n.legend ? 4 : 2), N = Math.min((e - 2 * d) / Math.max(p - x, 1e-8), (r - v - C) / Math.max(M - m, 1e-8)), R = (e - (p - x) * N) / 2, P = v + (r - v - C - (M - m) * N) / 2, k = [Nt({ x: 0, y: 0, w: e, h: r }, n.background, null)], O = (I, A, D, S, B, q = w) => k.push(tn(I, A, D, S, B, { size: q, color: n.textColor, fonts: n.fonts, align: "center", anchor: "middle" }));
  n.title && O(d, d, e - d * 2, w * 2, n.title);
  const Z = [...u.values()].map((I) => I.value), U = Math.min(...Z), X = Math.max(...Z), Q = (I, A) => i.points.get(I) ?? (i.colorCategories ? nt(st(a.ctx, A)) : nt(Ft(i.fill.type === "solid" ? i.fill.color : st(a.ctx, 0), "#ffffff", X === U ? 0.25 : 0.85 - 0.8 * (A - U) / (X - U))));
  for (const I of y) {
    const A = u.get(I.id);
    let D = "", S = 0, B = 0, q = 0;
    for (const _ of I.paths)
      D += _.map(([rt, ct], It) => {
        const ut = R + (rt - x) * N, mt = P + (ct - m) * N;
        return S += ut, B += mt, q++, `${It ? "L" : "M"}${j(ut)} ${j(mt)}`;
      }).join(" ") + "Z";
    const L = xt(0, 0, e, r, D, A ? Q(A.index, A.value) : nt("#e2e8f0"), { color: "#ffffff", width: 0.6, dash: null });
    L.name = I.name, k.push(L), A && i.labels && q && O(S / q - w * 4, B / q - w, w * 8, w * 2, ((G = i.categories[0]) == null ? void 0 : G[A.index]) ?? I.name, w * 0.8);
  }
  if (n.legend) {
    const I = i.colorCategories ? [...new Set(i.colorCategories.filter((S) => S !== null))] : null, A = I ? Math.min(I.length, 8) : 8, D = (e - d * 2) / A;
    for (let S = 0; S < A; S++) k.push(Nt({ x: d + S * D, y: r - w * 3.8, w: D, h: w * 0.7 }, Q(-1, I ? S : U + (X - U) * S / 7), null));
    I ? I.slice(0, 8).forEach((S, B) => O(d + B * D, r - w * 3, D, w * 1.5, S, w * 0.75)) : (O(d, r - w * 3, w * 6, w * 1.5, String(U)), O(e - d - w * 6, r - w * 3, w * 6, w * 1.5, String(X)));
  }
  const tt = [...new Set([F(l, "attribution") ?? "", ...y.flatMap((I) => I.copyrights)].filter(Boolean))].join(" · ");
  return tt && O(d, r - w * 1.4, e - 2 * d, w * 1.2, tt, w * 0.65), k;
}
function re(t) {
  const n = [...t.categories].reverse();
  if (!n.length || n.length > 32)
    throw new Error("ChartEx 层级缺失或过深");
  const e = { name: "", value: 0, point: -1, children: [] };
  let r = [];
  const a = /* @__PURE__ */ new Set(), i = t.values.reduce((s, l) => Math.max(s, l ?? 0), 0);
  if (!(i > 0))
    throw new Error("ChartEx 层级无正面积");
  return t.values.forEach((s, l) => {
    if (s !== null && s < 0)
      throw new Error("ChartEx 层级负面积");
    const o = n.map((E) => E[l] ?? "");
    let u = o.length - 1;
    for (; u >= 0 && !o[u]; )
      u--;
    if (u < 0)
      throw new Error("ChartEx 层级路径缺失");
    const h = [];
    for (let E = 0; E <= u; E++) {
      const g = h.every((x, m) => x === r[m]), y = o[E] || (g ? r[E] : "");
      if (!y)
        throw new Error("ChartEx 层级父路径不明");
      h.push(y);
    }
    if (r = h, s === null || s === 0)
      return;
    const c = JSON.stringify(h);
    if (a.has(c))
      throw new Error("ChartEx 同路径重复叶未定义");
    a.add(c);
    let f = e;
    const b = s / i;
    if (!(b > 0)) throw new Error("ChartEx 层级权重下溢");
    f.value += b, h.forEach((E, g) => {
      let y = f.children.find((x) => x.name === E);
      if (y || (y = { name: E, value: 0, point: l, children: [] }, f.children.push(y)), g < h.length - 1 && a.has(JSON.stringify(h.slice(0, g + 1))))
        throw new Error("ChartEx 父叶角色冲突");
      if (g === h.length - 1 && y.children.length)
        throw new Error("ChartEx 父叶角色冲突");
      y.value += b, f = y;
    });
  }), e;
}
function oe(t, n) {
  const e = [...t].filter((h) => h.value > 0).sort((h, c) => c.value - h.value || h.point - c.point), r = e.reduce((h, c) => h + c.value, 0);
  if (!r || !(n.w > 0 && n.h > 0))
    return [];
  const a = n.w * n.h, i = e.map((h) => ({ node: h, area: h.value / r * a })), s = [];
  let l = { ...n }, o = 0;
  const u = (h, c) => {
    const f = h.reduce((b, E) => b + E.area, 0);
    return !f || !c ? 1 / 0 : Math.max(c * c * h[0].area / (f * f), f * f / (c * c * h[h.length - 1].area));
  };
  for (; o < i.length; ) {
    const h = Math.min(l.w, l.h), c = [i[o++]];
    for (; o < i.length && u([...c, i[o]], h) <= u(c, h); )
      c.push(i[o++]);
    const f = c.reduce((x, m) => x + m.area, 0), b = l.w >= l.h, E = b ? f / l.h : l.w, g = b ? l.h : f / l.w;
    let y = 0;
    c.forEach((x, m) => {
      const p = m === c.length - 1 ? (b ? l.h : l.w) - y : x.area / (b ? E : g);
      s.push({ node: x.node, rect: { x: l.x + (b ? 0 : y), y: l.y + (b ? y : 0), w: b ? E : p, h: b ? p : g } }), y += p;
    }), l = b ? { ...l, x: l.x + E, w: Math.max(0, l.w - E) } : { ...l, y: l.y + g, h: Math.max(0, l.h - g) };
  }
  return s;
}
function ie(t) {
  const n = [];
  let e = 0;
  const r = (a, i, s, l, o) => {
    let u = i;
    a.children.forEach((h, c) => {
      const f = c === a.children.length - 1 ? s : u + (s - i) * h.value / a.value, b = l === 0 ? c : o;
      n.push({ node: h, depth: l, start: u, end: f, group: b }), e = Math.max(e, l + 1), h.children.length && r(h, u, f, l + 1, b), u = f;
    });
  };
  return r(t, -Math.PI / 2, Math.PI * 1.5, 0, 0), { sectors: n, depth: e };
}
function ae(t, n) {
  const e = t.filter((u) => u !== null).sort((u, h) => u - h);
  if (!e.length)
    throw new Error("ChartEx 箱线无数据");
  const r = (u) => u.length % 2 ? u[(u.length - 1) / 2] : u[u.length / 2 - 1] / 2 + u[u.length / 2] / 2, a = Math.floor(e.length / 2), i = e.length === 1 ? e[0] : r(e.slice(0, a + (n === "inclusive" && e.length % 2 ? 1 : 0))), s = e.length === 1 ? e[0] : r(e.slice(a + (n === "exclusive" && e.length % 2 ? 1 : 0))), l = s - i, o = e.filter((u) => u >= i - 1.5 * l && u <= s + 1.5 * l);
  return {
    low: o[0],
    high: o[o.length - 1],
    q1: i,
    median: r(e),
    q3: s,
    mean: e.reduce((u, h) => u + h / e.length, 0),
    inner: o,
    outliers: e.filter((u) => u < i - 1.5 * l || u > s + 1.5 * l)
  };
}
function se(t) {
  const n = t.values.filter((E) => E !== null);
  if (!n.length)
    throw new Error("ChartEx 直方图无数据");
  if (t.binning.aggregation) {
    const E = /* @__PURE__ */ new Map();
    return t.values.forEach((g, y) => {
      var x;
      if (g !== null) {
        const m = (x = t.categories[0]) == null ? void 0 : x[y];
        if (m == null)
          throw new Error("ChartEx 聚合类别缺失");
        E.set(m, (E.get(m) ?? 0) + g);
      }
    }), [...E].map(([g, y]) => ({ label: g, count: y, lo: 0, hi: 0 }));
  }
  const e = t.binning;
  if (e.size !== void 0 && !(e.size > 0) || e.count !== void 0 && !(e.count > 0))
    throw new Error("ChartEx 分箱宽度/数量无效");
  const r = n.reduce((E, g) => Math.min(E, g), 1 / 0), a = n.reduce((E, g) => Math.max(E, g), -1 / 0), i = e.underflow ?? r, s = e.overflow ?? a;
  if (s < i)
    throw new Error("ChartEx 分箱边界反向");
  const l = n.reduce((E, g) => E + g / n.length, 0), o = Math.sqrt(n.reduce((E, g) => E + (g - l) * (g - l), 0) / Math.max(1, n.length - 1)), h = (e.size ?? (e.count ? (s - i) / e.count : 3.5 * o / Math.cbrt(n.length))) || 1, c = e.overflow !== void 0 || e.count !== void 0, f = s === i ? 1 : Math.max(1, e.count ?? (e.closed === "l" && !c ? Math.floor((s - i) / h) + 1 : Math.ceil((s - i) / h)));
  if (f > 1e3 || !Number.isFinite(h) || !Number.isFinite(f))
    throw new Error("ChartEx 分箱数量超限");
  const b = Array.from({ length: f }, (E, g) => ({
    lo: i + g * h,
    hi: g === f - 1 && c ? s : i + (g + 1) * h,
    closedLow: g === 0 ? e.underflow === void 0 : e.closed === "l",
    closedHigh: e.closed === "r" || g === f - 1 && c,
    count: 0,
    label: ""
  }));
  if (b.some((E) => !Number.isFinite(E.lo + E.hi) || E.hi < E.lo))
    throw new Error("ChartEx 分箱区间超限");
  e.underflow !== void 0 && b.unshift({ lo: -1 / 0, hi: i, closedLow: !1, closedHigh: !0, count: 0, label: `≤ ${i}` }), e.overflow !== void 0 && b.push({ lo: s, hi: 1 / 0, closedLow: !1, closedHigh: !1, count: 0, label: `> ${s}` });
  for (const E of n) {
    const g = b.find((y) => (E > y.lo || y.closedLow && E === y.lo) && (E < y.hi || y.closedHigh && E === y.hi));
    if (!g) throw new Error("ChartEx 观测不在分箱内");
    g.count++;
  }
  return b.map(({ lo: E, hi: g, count: y, label: x, closedLow: m, closedHigh: p }) => ({
    lo: E,
    hi: g,
    count: y,
    label: x || `${m ? "[" : "("}${+E.toPrecision(6)}, ${+g.toPrecision(6)}${p ? "]" : ")"}`
  }));
}
function le(t) {
  let n = 0;
  return t.values.map((e, r) => {
    const a = e ?? 0, i = t.totals.has(r), s = i ? 0 : n, l = i ? a : n + a;
    if (!Number.isFinite(l))
      throw new Error("ChartEx 瀑布累计超限");
    return n = l, { from: s, to: l, total: i };
  });
}
function ce(t, n, e, r) {
  if (!(n >= 40 && e >= 40) || !Number.isFinite(n + e))
    throw new Error("ChartEx 画布无效");
  const a = [Nt({ x: 0, y: 0, w: n, h: e }, t.background, null)], i = Math.max(8, Math.min(t.size, n / 15, e / 12)), s = (x, m, p = t.textColor, M = "center") => {
    if (!m || x.w < i * 1.5 || x.h < i)
      return;
    const w = tn(x.x, x.y, x.w, x.h, m, { size: i, color: p, fonts: t.fonts, align: M, anchor: "middle" });
    w.text && (w.text.wrap = !1, w.text.autoFitCompute = !0), a.push(w);
  }, l = Math.min(n, e) * 0.035;
  let o = { x: l, y: l, w: n - 2 * l, h: e - 2 * l };
  t.title && (s({ ...o, h: i * 2 }, t.title), o = { ...o, y: o.y + i * 2.4, h: o.h - i * 2.4 });
  const u = (x, m) => x.points.get(m) ?? x.fill, h = (x, m, p, M, w = t.textColor) => {
    const d = $n(x, m, p, M, { color: w, width: 1, dash: null });
    d && a.push(d);
  }, c = (x, m, p = "#ffffff") => {
    a.push(Nt(x, m, { color: p, width: 1, dash: null }));
  }, f = t.series[0], b = t.kind === "treemap" || t.kind === "sunburst" ? re(f) : null, E = (x, m) => f.points.get(x.point) ?? nt(st(r.ctx, m)), g = (x, m) => {
    var p;
    return ((p = x.categories[0]) == null ? void 0 : p[m]) ?? String(m + 1);
  };
  if (t.legend) {
    const x = b ? b.children.map((w, d) => ({ name: w.name, fill: E(w, d) })) : t.series.map((w) => ({ name: w.name, fill: w.fill })).filter((w) => w.name), m = t.legend === "t" || t.legend === "b", p = m ? Math.min(o.h * 0.2, i * 2) : Math.min(o.w * 0.3, i * 9), M = m ? { x: o.x, y: t.legend === "t" ? o.y : o.y + o.h - p, w: o.w, h: p } : { x: t.legend === "l" ? o.x : o.x + o.w - p, y: o.y, w: p, h: o.h };
    x.forEach((w, d) => {
      const v = m ? M.w / Math.max(1, x.length) : M.w, C = M.x + (m ? d * v : 0), N = M.y + (m ? 0 : d * i * 1.8);
      N + i * 1.8 > M.y + M.h || (c({ x: C, y: N + i * 0.4, w: i, h: i * 0.7 }, w.fill), s({ x: C + i * 1.4, y: N, w: Math.max(0, v - i * 1.4), h: i * 1.8 }, w.name, t.textColor, "left"));
    }), x.length && (o = m ? { ...o, y: o.y + (t.legend === "t" ? p : 0), h: o.h - p } : { ...o, x: o.x + (t.legend === "l" ? p : 0), w: o.w - p });
  }
  if (b) {
    const x = (m, p) => nt(Ft(st(r.ctx, m), "#ffffff", Math.min(0.5, p * 0.13)));
    if (t.kind === "treemap") {
      const m = (p, M, w, d) => {
        oe(p.children, M).forEach(({ node: v, rect: C }) => {
          const N = w === 0 ? b.children.indexOf(v) : d;
          if (c(C, w === 0 ? E(v, N) : f.points.get(v.point) ?? x(N, w)), v.children.length) {
            const R = w === 0 && f.parentLabels === "banner" ? Math.min(i * 1.7, C.h / 3) : 0;
            m(v, { x: C.x + 1, y: C.y + 1 + R, w: Math.max(0, C.w - 2), h: Math.max(0, C.h - 2 - R) }, w + 1, N), w === 0 && f.parentLabels !== "none" && s({ ...C, h: i * 1.7 }, v.name, "#ffffff", "left");
          } else
            s({ x: C.x + 3, y: C.y + 3, w: C.w - 6, h: C.h - 6 }, v.name, "#ffffff");
        });
      };
      m(b, o, 0, 0);
    } else {
      const m = ie(b), p = Math.min(o.w, o.h) / 2, M = o.x + o.w / 2, w = o.y + o.h / 2;
      for (const d of m.sectors) {
        const v = p * d.depth / m.depth, C = p * (d.depth + 1) / m.depth;
        a.push(xt(M - p, w - p, p * 2, p * 2, fe(p, v, C, d.start, d.end), f.points.get(d.node.point) ?? x(d.group, d.depth), { color: "#ffffff", width: 1, dash: null }));
        const N = (d.start + d.end) / 2, R = (v + C) / 2, P = Math.min(C - v - 3, (d.end - d.start) * R * 0.8);
        P >= i * 2 && s({ x: M + Math.cos(N) * R - P / 2, y: w + Math.sin(N) * R - i / 2, w: P, h: i * 1.2 }, d.node.name, "#ffffff");
      }
    }
    return a;
  }
  if (t.kind === "funnel") {
    if (f.values.some((M) => M !== null && M < 0))
      throw new Error("ChartEx 漏斗负宽度");
    const x = f.values.reduce((M, w) => Math.max(M, w ?? 0), 0);
    if (!(x > 0))
      throw new Error("ChartEx 漏斗无正值");
    const m = Math.min(o.w * 0.27, i * 8), p = o.h / f.values.length;
    return f.values.forEach((M, w) => {
      const d = (o.w - m) * (M ?? 0) / x;
      c({ x: o.x + m + (o.w - m - d) / 2, y: o.y + w * p + p * 0.13, w: d, h: p * 0.74 }, u(f, w)), s({ x: o.x, y: o.y + w * p, w: m - i / 2, h: p }, g(f, w), t.textColor, "right"), f.labels && s({ x: o.x + m, y: o.y + w * p, w: o.w - m, h: p }, Wt(M ?? 0));
    }), a;
  }
  o = { x: o.x + i * 3.5, y: o.y, w: Math.max(1, o.w - i * 4.5), h: Math.max(1, o.h - i * 3) };
  const y = (x) => {
    const m = x.reduce((d, v) => Math.min(d, v), 0), p = x.reduce((d, v) => Math.max(d, v), 0), M = An(m, p, 5);
    if (!Number.isFinite(M.max - M.min) || !(M.max > M.min))
      throw new Error("ChartEx 值域超限");
    const w = (d) => o.y + o.h * (1 - (d - M.min) / (M.max - M.min));
    for (const d of Pn(M))
      h(o.x, w(d), o.x + o.w, w(d), "#dddddd"), s({ x: 0, y: w(d) - i / 2, w: o.x - i / 2, h: i * 1.2 }, Wt(d), t.textColor, "right");
    return w;
  };
  if (t.kind === "waterfall") {
    const x = le(f), m = y(x.flatMap((M) => [M.from, M.to])), p = o.w / x.length;
    x.forEach((M, w) => {
      const d = f.points.get(w) ?? nt(st(r.ctx, M.total ? 2 : M.to >= M.from ? 0 : 1)), v = o.x + w * p + p * 0.15;
      c({ x: v, y: Math.min(m(M.from), m(M.to)), w: p * 0.7, h: Math.abs(m(M.from) - m(M.to)) }, d), w + 1 < x.length && h(v + p * 0.7, m(M.to), v + p, m(M.to), "#999999"), s({ x: o.x + w * p, y: o.y + o.h + i / 3, w: p, h: i * 2 }, g(f, w));
    });
  } else if (t.kind === "histogram" || t.kind === "pareto") {
    let x = se(f);
    if (t.kind === "pareto" && (x = x.map((v, C) => ({ ...v, i: C })).sort((v, C) => C.count - v.count || v.i - C.i)), x.some((v) => v.count < 0 || !Number.isFinite(v.count)))
      throw new Error("ChartEx 频数无效");
    const m = y(x.map((v) => v.count)), p = o.w / x.length;
    let M = 0;
    const w = x.reduce((v, C) => v + C.count, 0), d = [];
    if (x.forEach((v, C) => {
      const N = o.x + C * p;
      c({ x: N + 0.5, y: m(v.count), w: Math.max(0, p - 1), h: m(0) - m(v.count) }, f.fill), s({ x: N, y: o.y + o.h + i / 3, w: p, h: i * 2 }, v.label), M += v.count, d.push([N + p / 2, o.y + o.h * (1 - M / (w || 1))]);
    }), t.kind === "pareto") {
      const v = _t([d], null, { color: st(r.ctx, 1), width: 2, dash: null });
      v && a.push(v);
      for (const C of [0, 0.5, 1])
        s({ x: o.x + o.w, y: o.y + o.h * (1 - C) - i / 2, w: i * 2.8, h: i }, `${C * 100}%`);
    }
  } else {
    const x = t.series.map((d) => ae(d.values, d.quartile)), m = y(x.flatMap((d, v) => [d.low, d.high, ...t.series[v].outliers ? d.outliers : [], ...t.series[v].meanMarker || t.series[v].meanLine ? [d.mean] : []])), p = o.w / x.length, M = [];
    x.forEach((d, v) => {
      const C = t.series[v], N = o.x + p * (v + 0.5), R = p * 0.5;
      h(N, m(d.low), N, m(d.high)), h(N - R / 3, m(d.low), N + R / 3, m(d.low)), h(N - R / 3, m(d.high), N + R / 3, m(d.high)), c({ x: N - R / 2, y: m(d.q3), w: R, h: m(d.q1) - m(d.q3) }, C.fill, t.textColor), h(N - R / 2, m(d.median), N + R / 2, m(d.median));
      const P = [...C.outliers ? d.outliers : [], ...C.innerPoints ? d.inner : []];
      for (const k of P)
        c({ x: N - 2, y: m(k) - 2, w: 4, h: 4 }, nt(t.textColor), t.textColor);
      C.meanMarker && (h(N - 3, m(d.mean) - 3, N + 3, m(d.mean) + 3), h(N - 3, m(d.mean) + 3, N + 3, m(d.mean) - 3)), C.meanLine && M.push([N, m(d.mean)]), s({ x: o.x + p * v, y: o.y + o.h + i / 3, w: p, h: i * 2 }, C.name || String(v + 1));
    });
    const w = _t([M], null, { color: t.textColor, width: 1, dash: null });
    w && a.push(w);
  }
  return a;
}
function fe(t, n, e, r, a) {
  const i = (o, u) => `${j(t + o * Math.cos(u))} ${j(t + o * Math.sin(u))}`, s = (r + a) / 2, l = (o, u, h, c) => `A ${j(o)} ${j(o)} 0 0 ${c} ${i(o, u)} A ${j(o)} ${j(o)} 0 0 ${c} ${i(o, h)}`;
  return `M ${i(e, r)} ${l(e, s, a, 1)} L ${i(n, a)} ${n > 0 ? l(n, s, r, 0) : ""} Z`;
}
function me(t, n) {
  const e = $t(t);
  if (e.namespaceURI !== lt || e.localName !== "chartSpace") throw new Error("非 ChartEx 数据");
  const r = on(e, n), a = /* @__PURE__ */ new Set();
  return z($(e, "chartData"), "data").map((i) => {
    const s = F(i, "id");
    if (et(s, 4294967295), a.has(s)) throw new Error("ChartEx 数据身份重复");
    return a.add(s), { id: s, dimensions: Array.from(i.children).filter((l) => l.namespaceURI === lt && ["strDim", "numDim"].includes(l.localName)).map((l) => en(l, r)) };
  });
}
const he = (t, n, e, r) => {
  try {
    const a = zn(t, r);
    return a.kind === "regionMap" ? ee(t, a, n, e, r) : ce(a, n, e, r);
  } catch {
    return [];
  }
};
function pe(t, n, e, r) {
  try {
    return he($t(t), n, e, r);
  } catch {
    return [];
  }
}
export {
  he as parseChartEx,
  me as readChartExData,
  pe as renderChartExXml
};
