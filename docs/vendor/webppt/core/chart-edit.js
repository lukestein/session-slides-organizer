const vt = /* @__PURE__ */ new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"]
]);
class Bn {
  constructor(n) {
    this.namespaceURI = null, this.attributes = [], this.childNodes = [], this.nextElementSibling = null, this.namespaceBindings = vt, this.tagName = n;
    const s = n.indexOf(":");
    this.prefix = s < 0 ? null : n.slice(0, s), this.localName = s < 0 ? n : n.slice(s + 1);
  }
  resolveNamespaces(n) {
    let s;
    for (const o of this.attributes)
      o.name === "xmlns" ? (s ?? (s = new Map((n == null ? void 0 : n.namespaceBindings) ?? vt))).set("", o.value) : o.prefix === "xmlns" && (s ?? (s = new Map((n == null ? void 0 : n.namespaceBindings) ?? vt))).set(o.localName, o.value);
    this.namespaceBindings = s ?? (n == null ? void 0 : n.namespaceBindings) ?? vt, this.namespaceURI = this.lookupNamespaceURI(this.prefix);
    for (const o of this.attributes)
      o.name === "xmlns" || o.prefix === "xmlns" ? o.namespaceURI = "http://www.w3.org/2000/xmlns/" : o.prefix && (o.namespaceURI = this.lookupNamespaceURI(o.prefix));
  }
  get firstElementChild() {
    for (const n of this.childNodes) if (typeof n != "string") return n;
    return null;
  }
  get children() {
    return this.childNodes.filter((n) => typeof n != "string");
  }
  getAttribute(n) {
    for (const s of this.attributes) if (s.name === n) return s.value;
    return null;
  }
  lookupNamespaceURI(n) {
    const s = n ?? "";
    return this.namespaceBindings.get(s) || null;
  }
  get textContent() {
    let n = "";
    for (const s of this.childNodes) n += typeof s == "string" ? s : s.textContent;
    return n;
  }
  /** 只支持 '*'，与解析器里的用法一致 */
  getElementsByTagName(n) {
    const s = [], o = (e) => {
      for (const l of e.children)
        (n === "*" || l.localName === n || l.tagName === n) && s.push(l), o(l);
    };
    return o(this), s;
  }
}
const jn = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function cn(t) {
  return t.indexOf("&") < 0 ? t : t.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (n, s) => {
    if (s[0] === "#") {
      const o = s[1] === "x" || s[1] === "X" ? parseInt(s.slice(2), 16) : parseInt(s.slice(1), 10);
      return Number.isFinite(o) && o >= 0 ? String.fromCodePoint(o) : n;
    }
    return jn[s] ?? n;
  });
}
function On(t) {
  let n = 0;
  const s = t.length, o = [];
  let e = null;
  const l = (i, r) => {
    const c = i.children;
    c.length && (c[c.length - 1].nextElementSibling = r), i.childNodes.push(r);
  };
  for (; n < s; ) {
    const i = t.indexOf("<", n);
    if (i < 0) break;
    if (i > n) {
      const h = t.slice(n, i);
      o.length && h.trim() ? o[o.length - 1].childNodes.push(cn(h)) : o.length && h.includes(" ") && o[o.length - 1].childNodes.push(h);
    }
    if (t.startsWith("<!--", i)) {
      const h = t.indexOf("-->", i + 4);
      n = h < 0 ? s : h + 3;
      continue;
    }
    if (t.startsWith("<![CDATA[", i)) {
      const h = t.indexOf("]]>", i + 9), L = t.slice(i + 9, h < 0 ? s : h);
      o.length && o[o.length - 1].childNodes.push(L), n = h < 0 ? s : h + 3;
      continue;
    }
    if (t.startsWith("<?", i) || t.startsWith("<!", i)) {
      const h = t.indexOf(">", i);
      n = h < 0 ? s : h + 1;
      continue;
    }
    if (t[i + 1] === "/") {
      const h = t.indexOf(">", i);
      if (h < 0) break;
      o.pop(), n = h + 1;
      continue;
    }
    let r = i + 1, c = "";
    for (; r < s; ) {
      const h = t[r];
      if (c)
        h === c && (c = "");
      else if (h === '"' || h === "'") c = h;
      else if (h === ">") break;
      r++;
    }
    if (r >= s) break;
    const u = t[r - 1] === "/", a = t.slice(i + 1, u ? r - 1 : r);
    let f = 0;
    for (; f < a.length && !/[\s/]/.test(a[f]); ) f++;
    const d = new Bn(a.slice(0, f)), x = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    x.lastIndex = f;
    let p;
    for (; (p = x.exec(a)) !== null; ) {
      const h = p[1], L = h.indexOf(":");
      d.attributes.push({
        name: h,
        localName: L < 0 ? h : h.slice(L + 1),
        prefix: L < 0 ? null : h.slice(0, L),
        namespaceURI: null,
        value: cn(p[3] ?? p[4] ?? "")
      });
    }
    d.resolveNamespaces(o[o.length - 1]), o.length ? l(o[o.length - 1], d) : e || (e = d), u || o.push(d), n = r + 1;
  }
  if (!e) throw new Error("XML 解析失败：未找到根元素");
  return e;
}
const an = typeof DOMParser < "u" ? new DOMParser() : null;
function Vn(t) {
  if (!an)
    return On(t);
  const n = an.parseFromString(t, "application/xml"), s = n.getElementsByTagName("parsererror")[0];
  if (s) throw new Error("XML 解析失败: " + (s.textContent ?? "").slice(0, 200));
  return n.documentElement;
}
function lt(t, n) {
  const s = [];
  if (!t) return s;
  for (let o = t.firstElementChild; o; o = o.nextElementSibling)
    o.localName === n && s.push(o);
  return s;
}
function S(t, n) {
  if (!t) return null;
  for (let s = t.firstElementChild; s; s = s.nextElementSibling)
    if (s.localName === n) return s;
  return null;
}
function dt(t, ...n) {
  let s = t;
  for (const o of n)
    if (s = S(s, o), !s) return null;
  return s;
}
function nt(t, n) {
  if (!t) return null;
  if (n.includes(":")) {
    for (const e of Array.from(t.attributes)) if (e.name === n) return e.value;
    const o = n.split(":")[1];
    for (const e of Array.from(t.attributes)) if (e.localName === o) return e.value;
    return null;
  }
  const s = t.getAttribute(n);
  if (s !== null) return s;
  for (const o of Array.from(t.attributes)) if (o.localName === n) return o.value;
  return null;
}
function Z(t, n) {
  const s = nt(t, n);
  if (s === null || s === "") return null;
  const o = Number(s);
  return Number.isFinite(o) ? o : null;
}
function xn(t, n, s = !1) {
  const o = nt(t, n);
  return o === null ? s : o === "1" || o === "true";
}
const Rn = (t) => (t ?? 0) / 9525, Wn = { window: "FFFFFF", windowText: "000000" }, Gn = {
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
}, Xn = ["srgbClr", "schemeClr", "sysClr", "prstClr", "scrgbClr", "hslClr"];
function kt(t, n) {
  if (!t) return null;
  for (const s of Xn) {
    const o = S(t, s);
    if (o) return Yn(o, n);
  }
  return null;
}
function Yn(t, n) {
  let s = Un(t, n), o = 1;
  for (let r = t.firstElementChild; r; r = r.nextElementSibling) {
    const c = (Z(r, "val") ?? 0) / 1e5;
    switch (r.localName) {
      case "alpha":
        o = c;
        break;
      case "shade":
        s = un(s, (u) => u * c);
        break;
      case "tint":
        s = un(s, (u) => u * c + (1 - c));
        break;
      case "lumMod":
        s = Rt(s, (u, a, f) => [u, a, f * c]);
        break;
      case "lumOff":
        s = Rt(s, (u, a, f) => [u, a, f + c]);
        break;
      case "satMod":
        s = Rt(s, (u, a, f) => [u, a * c, f]);
        break;
    }
  }
  const [e, l, i] = s.map((r) => Math.round(Nt(r, 0, 255)));
  return o >= 1 ? `rgb(${e},${l},${i})` : `rgba(${e},${l},${i},${Math.round(o * 1e3) / 1e3})`;
}
function Un(t, n) {
  switch (t.localName) {
    case "srgbClr":
      return Mt(nt(t, "val") ?? "000000");
    case "sysClr":
      return Mt(nt(t, "lastClr") ?? Wn[nt(t, "val") ?? ""] ?? "000000");
    case "prstClr":
      return Mt(Gn[nt(t, "val") ?? ""] ?? "808080");
    case "scrgbClr":
      return [
        (Z(t, "r") ?? 0) / 1e5 * 255,
        (Z(t, "g") ?? 0) / 1e5 * 255,
        (Z(t, "b") ?? 0) / 1e5 * 255
      ];
    case "hslClr":
      return bn(
        (Z(t, "hue") ?? 0) / 6e4 / 360,
        (Z(t, "sat") ?? 0) / 1e5,
        (Z(t, "lum") ?? 0) / 1e5
      );
    case "schemeClr": {
      const s = nt(t, "val") ?? "tx1";
      if (s === "phClr") return n.phClr ? Zn(n.phClr) : [128, 128, 128];
      const o = n.clrMap[s] ?? s;
      return Mt(n.theme[o] ?? n.theme[s] ?? "000000");
    }
  }
  return [0, 0, 0];
}
function Zn(t) {
  const n = t.match(/rgba?\(([^)]+)\)/);
  if (n) {
    const s = n[1].split(",").map((o) => Number(o.trim()));
    return [s[0] || 0, s[1] || 0, s[2] || 0];
  }
  return Mt(t);
}
function Mt(t) {
  const n = t.replace("#", "").padStart(6, "0");
  return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0];
}
function Nt(t, n, s) {
  return Math.min(s, Math.max(n, t));
}
const _n = (t) => {
  const n = t / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}, qn = (t) => {
  const n = Nt(t, 0, 1);
  return (n <= 31308e-7 ? n * 12.92 : 1.055 * n ** (1 / 2.4) - 0.055) * 255;
};
function un(t, n) {
  return t.map((s) => qn(n(_n(s))));
}
function Rt(t, n) {
  const [s, o, e] = Hn(t), [l, i, r] = n(s, o, e);
  return bn(l, Nt(i, 0, 1), Nt(r, 0, 1));
}
function Hn([t, n, s]) {
  t /= 255, n /= 255, s /= 255;
  const o = Math.max(t, n, s), e = Math.min(t, n, s), l = (o + e) / 2;
  if (o === e) return [0, 0, l];
  const i = o - e, r = l > 0.5 ? i / (2 - o - e) : i / (o + e);
  let c;
  return o === t ? c = (n - s) / i + (n < s ? 6 : 0) : o === n ? c = (s - t) / i + 2 : c = (t - n) / i + 4, [c / 6, r, l];
}
function bn(t, n, s) {
  if (n === 0) return [s * 255, s * 255, s * 255];
  const o = s < 0.5 ? s * (1 + n) : s + n - s * n, e = 2 * s - o, l = (i) => (i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? e + (o - e) * 6 * i : i < 1 / 2 ? o : i < 2 / 3 ? e + (o - e) * (2 / 3 - i) * 6 : e);
  return [l(t + 1 / 3) * 255, l(t) * 255, l(t - 1 / 3) * 255];
}
const ct = (t) => t * 96 / 72, b = (t) => {
  if (!Number.isFinite(t)) return "0";
  const n = Math.round(t * 100) / 100;
  return Object.is(n, -0) ? "0" : String(n);
}, V = (t, n, s) => t < n ? n : t > s ? s : t, ht = (t, n = 0) => Number.isFinite(t) ? t : n;
function q(t, n, s, o, e, l, i) {
  return {
    kind: "shape",
    x: ht(t),
    y: ht(n),
    w: Math.max(ht(s), 0),
    h: Math.max(ht(o), 0),
    rot: 0,
    flipH: !1,
    flipV: !1,
    path: e,
    fill: l,
    stroke: i,
    text: null
  };
}
const Kn = (t, n) => `M 0 0 L ${b(t)} 0 L ${b(t)} ${b(n)} L 0 ${b(n)} Z`;
function St(t, n, s) {
  return q(t.x, t.y, t.w, t.h, Kn(t.w, t.h), n, s);
}
function it(t, n, s, o, e) {
  if (!e || ![t, n, s, o].every(Number.isFinite)) return null;
  const l = Math.min(t, s), i = Math.min(n, o);
  return q(
    l,
    i,
    Math.abs(s - t),
    Math.abs(o - n),
    `M ${b(t - l)} ${b(n - i)} L ${b(s - l)} ${b(o - i)}`,
    null,
    e
  );
}
function Kt(t, n, s, o) {
  const e = t.map((a) => a.filter(([f, d]) => Number.isFinite(f) && Number.isFinite(d))).filter((a) => a.length >= 3);
  if (!e.length) return null;
  let l = 1 / 0, i = 1 / 0, r = -1 / 0, c = -1 / 0;
  for (const a of e)
    for (const [f, d] of a)
      l = Math.min(l, f), i = Math.min(i, d), r = Math.max(r, f), c = Math.max(c, d);
  const u = e.map((a) => "M " + a.map(([f, d]) => `${b(f - l)} ${b(d - i)}`).join(" L ") + " Z").join(" ");
  return q(l, i, r - l, c - i, u, n, s);
}
const Jn = (t, n = 0.25) => J(t, "#ffffff", n), Jt = (t, n = 0.2) => J(t, "#000000", n);
function yn(t, n, s) {
  return Kt([t], n, s);
}
function st(t, n, s, o, e, l = {}) {
  const i = {
    text: e,
    b: l.bold ?? !1,
    i: !1,
    u: !1,
    strike: !1,
    size: l.size ?? ct(10),
    color: l.color ?? "rgb(0,0,0)",
    fonts: l.fonts ?? []
  }, r = {
    align: l.align ?? "center",
    lvl: 0,
    marL: 0,
    indent: 0,
    bullet: null,
    lineHeight: 1.15,
    spaceBefore: 0,
    spaceAfter: 0,
    runs: [i]
  }, c = {
    anchor: l.anchor ?? "middle",
    insets: [0, 0, 0, 0],
    wrap: !1,
    fontScale: 1,
    paragraphs: [r]
  };
  return {
    kind: "shape",
    x: ht(t),
    y: ht(n),
    w: Math.max(ht(s), 0),
    h: Math.max(ht(o), 0),
    rot: l.rot ?? 0,
    flipH: !1,
    flipV: !1,
    path: null,
    fill: null,
    stroke: null,
    text: c
  };
}
function Qt(t, n) {
  let s = 0;
  for (const o of t) {
    const e = o.codePointAt(0) ?? 32;
    e >= 4352 && e <= 8191 || e >= 11904 && e <= 42191 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65072 && e <= 65376 ? s += 1 : `iljtf.,:;'"|!I[]()`.includes(o) ? s += 0.3 : "mwMW@%".includes(o) ? s += 0.85 : o >= "A" && o <= "Z" ? s += 0.66 : s += 0.53;
  }
  return s * n;
}
const U = (t) => ({ type: "solid", color: t });
function gn(t, n) {
  const s = t.clrMap[n] ?? n, o = (t.theme[s] ?? t.theme[n] ?? "000000").replace(/^#/, "");
  return "#" + (o.length >= 6 ? o.slice(0, 6) : o.padStart(6, "0"));
}
function fn(t) {
  const n = t.trim();
  if (n.startsWith("#")) {
    const o = n.slice(1), e = o.length === 3 ? o.split("").map((l) => l + l).join("") : o.padStart(6, "0");
    return [
      parseInt(e.slice(0, 2), 16) || 0,
      parseInt(e.slice(2, 4), 16) || 0,
      parseInt(e.slice(4, 6), 16) || 0
    ];
  }
  const s = n.match(/-?[\d.]+/g);
  return s && s.length >= 3 ? [Number(s[0]) || 0, Number(s[1]) || 0, Number(s[2]) || 0] : [0, 0, 0];
}
function J(t, n, s) {
  const o = fn(t), e = fn(n), l = V(s, 0, 1), i = o.map((r, c) => Math.round(r + (e[c] - r) * l));
  return `rgb(${i[0]},${i[1]},${i[2]})`;
}
function wn(t, n) {
  const s = (n % 6 + 6) % 6, o = gn(t, `accent${s + 1}`), e = Math.floor(n / 6);
  return e <= 0 ? o : e % 2 === 1 ? J(o, "#ffffff", V(0.3 * Math.ceil(e / 2), 0, 0.72)) : J(o, "#000000", V(0.22 * (e / 2), 0, 0.6));
}
function mt(t, n) {
  if (!t) return null;
  if (S(t, "noFill")) return { type: "none" };
  const s = S(t, "solidFill");
  if (s) return U(kt(s, n) ?? "rgb(0,0,0)");
  const o = S(t, "gradFill");
  if (o) {
    const l = lt(S(o, "gsLst"), "gs").map((r) => ({ pos: (Z(r, "pos") ?? 0) / 1e5, color: kt(r, n) ?? "rgb(0,0,0)" })).sort((r, c) => r.pos - c.pos);
    if (!l.length) return null;
    const i = S(o, "lin");
    return { type: "gradient", angle: i ? (Z(i, "ang") ?? 0) / 6e4 : 90, stops: l };
  }
  const e = S(t, "pattFill");
  if (e) {
    const l = kt(S(e, "fgClr"), n);
    if (l) return U(l);
  }
  return null;
}
const Qn = {
  dash: [4, 3],
  dashDot: [4, 3, 1, 3],
  dot: [1, 3],
  lgDash: [8, 3],
  lgDashDot: [8, 3, 1, 3],
  lgDashDotDot: [8, 3, 1, 3, 1, 3],
  sysDash: [3, 3],
  sysDashDot: [3, 3, 1, 3],
  sysDashDotDot: [3, 3, 1, 3, 1, 3],
  sysDot: [1, 1]
}, tn = { color: null, width: null, dash: null, none: !1, present: !1 };
function at(t, n) {
  if (!t) return { ...tn };
  const s = { color: null, width: null, dash: null, none: !1, present: !0 };
  if (S(t, "noFill"))
    return s.none = !0, s;
  s.color = kt(S(t, "solidFill"), n);
  const o = Z(t, "w");
  o !== null && (s.width = Rn(o));
  const e = nt(S(t, "prstDash"), "val");
  return e && e !== "solid" && (s.dash = (Qn[e] ?? [4, 3]).map((l) => l * Math.max(s.width ?? 1, 1))), s;
}
function Q(t, n, s) {
  const o = t ?? tn;
  if (o.none) return null;
  const e = o.color ?? n;
  if (!e) return null;
  const l = o.width ?? s;
  return l > 0 ? { color: e, width: l, dash: o.dash } : null;
}
function ts(t) {
  const n = [];
  let s = "", o = !1;
  for (let e = 0; e < t.length; e++) {
    const l = t[e];
    if (l === '"') {
      o = !o, s += l;
      continue;
    }
    if (l === "\\") {
      s += l + (t[e + 1] ?? ""), e++;
      continue;
    }
    if (l === ";" && !o) {
      n.push(s), s = "";
      continue;
    }
    s += l;
  }
  return n.push(s), n;
}
const Wt = (t) => t.replace(/\\(.)/g, "$1").replace(/"/g, "").replace(/[*_](.)/g, "").replace(/@/g, "");
function ns(t) {
  if (Number.isInteger(t)) return String(t);
  const n = Math.abs(t);
  return n !== 0 && (n >= 1e11 || n < 1e-4) ? t.toExponential(2) : String(Math.round(t * 1e6) / 1e6);
}
function ss(t) {
  return t.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function Gt(t, n) {
  const s = n.replace(/\[[^\]]*\]/g, "");
  let o = t;
  const e = o < 0;
  o = Math.abs(o);
  const l = (s.match(/%/g) ?? []).length;
  l && (o *= Math.pow(100, l));
  const i = s.match(/[#0?][#0?,]*(\.[#0?]+)?/);
  if (!i) return (e ? "-" : "") + Wt(s);
  const r = i[0], c = i.index ?? 0, u = Wt(s.slice(0, c)), a = Wt(s.slice(c + r.length)), f = r.indexOf(".");
  let d = f < 0 ? r : r.slice(0, f);
  const x = f < 0 ? "" : r.slice(f + 1), p = d.match(/,+$/);
  p && (o /= Math.pow(1e3, p[0].length), d = d.slice(0, -p[0].length));
  const h = d.includes(","), L = x.length, y = (x.match(/0/g) ?? []).length;
  let m = o.toFixed(Math.min(L, 20));
  L > y && (m = m.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, ""), (m.split(".")[1] ?? "").length < y && (m = o.toFixed(y)));
  let [k, w] = m.split(".");
  const g = (d.match(/0/g) ?? []).length;
  return k.length < g && (k = k.padStart(g, "0")), g === 0 && k === "0" && w && (k = ""), h && (k = ss(k)), (e ? "-" : "") + u + k + (w ? "." + w : "") + a;
}
function pt(t, n) {
  if (!Number.isFinite(t)) return "";
  const s = (n ?? "").trim();
  if (!s || /^general$/i.test(s)) return ns(t);
  if (/e[+-]/i.test(s)) return t.toExponential(2);
  const o = ts(s);
  return t < 0 && o.length > 1 && o[1].trim() ? Gt(-t, o[1]) : t === 0 && o.length > 2 && o[2].trim() ? Gt(0, o[2]) : Gt(t, o[0] ?? "");
}
const Lt = (t) => Number(t.toPrecision(12));
function nn(t, n, s = 5) {
  let o = Number.isFinite(t) ? t : 0, e = Number.isFinite(n) ? n : 1;
  if (e < o && ([o, e] = [e, o]), o === e)
    if (o === 0)
      o = 0, e = 1;
    else {
      const f = Math.abs(o) * 0.5;
      o -= f, e += f;
    }
  const l = (e - o) / Math.max(1, s), i = Math.pow(10, Math.floor(Math.log10(l))), r = l / i, c = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * i, u = Lt(Math.floor(o / c + 1e-9) * c);
  let a = Lt(Math.ceil(e / c - 1e-9) * c);
  return a > u || (a = Lt(u + c)), { min: u, max: a, step: c };
}
function os(t) {
  const n = [];
  if (!(t.step > 0) || !Number.isFinite(t.min) || !Number.isFinite(t.max)) return [t.min];
  const s = Math.floor((t.max - t.min) / t.step + 1e-6), o = Math.min(s, 60);
  for (let l = 0; l <= o; l++) n.push(Lt(t.min + l * t.step));
  const e = n[n.length - 1];
  return e !== void 0 && t.max - e > t.step * 1e-6 && n.push(Lt(t.max)), n;
}
const es = {
  barChart: "bar",
  bar3DChart: "bar",
  lineChart: "line",
  line3DChart: "line",
  stockChart: "stock",
  pieChart: "pie",
  pie3DChart: "pie",
  ofPieChart: "ofPie",
  doughnutChart: "doughnut",
  areaChart: "area",
  area3DChart: "area",
  scatterChart: "scatter",
  bubbleChart: "bubble",
  radarChart: "radar",
  surfaceChart: "surface",
  surface3DChart: "surface"
}, Mn = (t) => t === "scatter" || t === "bubble", _ = (t, n, s) => {
  const o = S(t, n);
  return o ? xn(o, "val", !0) : s;
}, G = (t, n) => Z(S(t, n), "val"), X = (t, n) => nt(S(t, n), "val");
function kn(t) {
  if (!t) return null;
  for (const n of ["numRef", "strRef", "multiLvlStrRef"]) {
    const s = S(t, n);
    if (s) return S(s, "numCache") ?? S(s, "strCache") ?? S(s, "multiLvlStrCache");
  }
  return S(t, "numLit") ?? S(t, "strLit") ?? null;
}
function Ln(t, n) {
  var o;
  const s = new Array(Math.max(0, Math.min(n, 2e4))).fill("");
  for (const e of lt(t, "pt")) {
    const l = Z(e, "idx") ?? -1;
    if (!(l < 0 || l > 2e4)) {
      for (; s.length <= l; ) s.push("");
      s[l] = ((o = S(e, "v")) == null ? void 0 : o.textContent) ?? "";
    }
  }
  return s;
}
function At(t) {
  var l;
  const n = kn(t);
  if (!n) return { vals: [], fmt: null };
  const s = ((l = S(n, "formatCode")) == null ? void 0 : l.textContent) ?? null;
  return { vals: Ln(n, Z(S(n, "ptCount"), "val") ?? 0).map((i) => {
    if (i === "") return null;
    const r = Number(i);
    return Number.isFinite(r) ? r : null;
  }), fmt: s };
}
function ls(t) {
  const n = kn(t);
  if (!n) return [];
  if (n.localName === "numCache" || n.localName === "numLit") {
    const { vals: e, fmt: l } = At(t);
    return e.map((i) => i === null ? "" : pt(i, l));
  }
  const s = lt(n, "lvl"), o = s.length ? s[0] : n;
  return Ln(o, Z(S(n, "ptCount"), "val") ?? 0);
}
function sn(t) {
  var e;
  const n = S(t, "rich");
  if (n)
    return lt(n, "p").map((i) => {
      var c;
      let r = "";
      for (let u = i.firstElementChild; u; u = u.nextElementSibling)
        u.localName === "r" || u.localName === "fld" ? r += ((c = S(u, "t")) == null ? void 0 : c.textContent) ?? "" : u.localName === "br" && (r += " ");
      return r;
    }).join(" ").trim();
  const s = S(t, "strRef");
  if (s) {
    const l = S(s, "strCache"), i = lt(l, "pt")[0];
    return (((e = S(i, "v")) == null ? void 0 : e.textContent) ?? "").trim();
  }
  const o = S(t, "v");
  return ((o == null ? void 0 : o.textContent) ?? "").trim();
}
function $t(t, n) {
  const s = dt(t, "p", "pPr", "defRPr") ?? dt(t, "rich", "p", "pPr", "defRPr"), o = dt(t, "rich", "p", "r", "rPr"), e = s ?? o;
  if (!e) return { size: null, color: null, bold: !1 };
  const l = Z(e, "sz");
  return {
    size: l !== null ? ct(l / 100) : null,
    color: kt(S(e, "solidFill"), n),
    bold: xn(e, "b", !1)
  };
}
const $n = {
  del: !0,
  showVal: !1,
  showCat: !1,
  showSer: !1,
  showPercent: !1,
  showSize: !1,
  fmt: null,
  pos: null,
  size: null,
  color: null
};
function Sn(t, n, s) {
  if (!t) return s;
  const o = _(t, "delete", !1), e = $t(S(t, "txPr"), n), l = {
    del: o,
    showVal: _(t, "showVal", s.showVal),
    showCat: _(t, "showCatName", s.showCat),
    showSer: _(t, "showSerName", s.showSer),
    showPercent: _(t, "showPercent", s.showPercent),
    showSize: _(t, "showBubbleSize", s.showSize),
    fmt: nt(S(t, "numFmt"), "formatCode") ?? s.fmt,
    pos: X(t, "dLblPos") ?? s.pos,
    size: e.size ?? s.size,
    color: e.color ?? s.color
  };
  return o ? { ...$n, fmt: l.fmt } : l;
}
const rt = (t) => !t.del && (t.showVal || t.showCat || t.showSer || t.showPercent || t.showSize);
function is(t, n) {
  if (!t) return null;
  const s = S(t, "spPr");
  return {
    symbol: X(t, "symbol") ?? "auto",
    size: G(t, "size") ?? 5,
    fill: mt(s, n),
    ln: at(S(s, "ln"), n)
  };
}
function rs(t, n, s, o, e) {
  const l = S(t, "spPr"), i = mt(l, s), r = at(S(l, "ln"), s), c = Mn(n), u = S(t, "val") ?? S(t, "yVal") ?? S(t, "bubbleSize"), { vals: a, fmt: f } = At(u), d = S(t, "xVal"), x = c && d ? At(d).vals : null, p = n === "bubble" ? S(t, "bubbleSize") : null, h = p ? At(p) : null, L = ls(S(t, "cat") ?? (c ? d : null)), y = /* @__PURE__ */ new Map();
  for (const w of lt(t, "dPt")) {
    const g = G(w, "idx");
    if (g === null || g < 0) continue;
    const M = S(w, "spPr");
    y.set(g, { fill: mt(M, s), ln: at(S(M, "ln"), s), explosion: G(w, "explosion") ?? 0 });
  }
  const m = n === "line" || n === "scatter" || n === "radar" || n === "stock";
  let k;
  return i && i.type === "solid" ? k = i.color : m && r.color ? k = r.color : k = wn(s, o), {
    idx: G(t, "idx") ?? o,
    order: G(t, "order") ?? o,
    name: sn(S(t, "tx")) || `系列 ${o + 1}`,
    cats: L,
    vals: a,
    xs: x,
    sizes: h ? h.vals : null,
    sizeFmt: h ? h.fmt : null,
    fill: i,
    ln: r,
    marker: is(S(t, "marker"), s),
    smooth: _(t, "smooth", !1),
    fmt: f,
    dLbls: Sn(S(t, "dLbls"), s, e),
    dPts: y,
    color: k
  };
}
const Tt = (t) => t.grouping === "stacked" || t.grouping === "percentStacked";
function cs(t, n) {
  if (!t) return null;
  const s = S(t, "upBars"), o = S(t, "downBars");
  return {
    gapWidth: G(t, "gapWidth") ?? 150,
    upFill: mt(S(s, "spPr"), n),
    downFill: mt(S(o, "spPr"), n),
    upLn: at(dt(s, "spPr", "ln"), n),
    downLn: at(dt(o, "spPr", "ln"), n)
  };
}
function as(t) {
  return {
    type: (X(t, "ofPieType") ?? "pie") === "bar" ? "bar" : "pie",
    splitType: X(t, "splitType") ?? "auto",
    splitPos: G(t, "splitPos"),
    custSplit: lt(S(t, "custSplit"), "secondPiePt").map((n) => Z(n, "val") ?? -1).filter((n) => n >= 0),
    secondSize: G(t, "secondPieSize") ?? 75,
    serLines: S(t, "serLines") !== null
  };
}
function us(t, n, s, o) {
  const e = X(t, "grouping") ?? (n === "bar" ? "clustered" : "standard"), l = Sn(S(t, "dLbls"), s, $n), r = lt(t, "ser").map((u, a) => rs(u, n, s, o + a, l));
  r.sort((u, a) => u.order - a.order);
  const c = /* @__PURE__ */ new Map();
  for (const u of lt(S(t, "bandFmts"), "bandFmt")) {
    const a = G(u, "idx"), f = mt(S(u, "spPr"), s);
    a !== null && a >= 0 && f && c.set(a, f);
  }
  return {
    kind: n,
    tag: t.localName,
    is3D: t.localName.endsWith("3DChart"),
    grouping: e,
    barDir: (X(t, "barDir") ?? "col") === "bar" ? "bar" : "col",
    gapWidth: G(t, "gapWidth") ?? 150,
    overlap: G(t, "overlap") ?? (e === "stacked" || e === "percentStacked" ? 100 : 0),
    holeSize: G(t, "holeSize") ?? 50,
    firstSliceAng: G(t, "firstSliceAng") ?? 0,
    varyColors: _(t, "varyColors", n === "pie" || n === "doughnut" || n === "ofPie"),
    showMarker: _(t, "marker", !1),
    radarStyle: X(t, "radarStyle") ?? "marker",
    scatterStyle: X(t, "scatterStyle") ?? "lineMarker",
    axIds: lt(t, "axId").map((u) => nt(u, "val") ?? ""),
    series: r,
    dLbls: l,
    bubbleScale: G(t, "bubbleScale") ?? 100,
    bubbleSizeBy: X(t, "sizeRepresents") ?? "area",
    upDown: cs(S(t, "upDownBars"), s),
    hiLowLines: S(t, "hiLowLines") ? at(dt(S(t, "hiLowLines"), "spPr", "ln"), s) : null,
    ofPie: n === "ofPie" ? as(t) : null,
    wireframe: _(t, "wireframe", !1),
    bandFills: c
  };
}
const fs = {
  catAx: "cat",
  valAx: "val",
  dateAx: "date",
  serAx: "ser"
};
function Et(t) {
  return {
    id: "",
    kind: t,
    del: !1,
    pos: null,
    crosses: null,
    crossAx: "",
    crossBetween: "between",
    min: null,
    max: null,
    majorUnit: null,
    reversed: !1,
    fmt: null,
    majorGrid: null,
    line: { ...tn },
    tickLblPos: "nextTo",
    majorTick: "out",
    lblSize: null,
    lblColor: null,
    title: null
  };
}
function hs(t, n, s) {
  const o = S(t, "scaling"), e = S(t, "majorGridlines"), l = $t(S(t, "txPr"), s);
  return {
    id: X(t, "axId") ?? "",
    kind: n,
    del: _(t, "delete", !1),
    pos: X(t, "axPos"),
    crosses: X(t, "crosses"),
    crossAx: X(t, "crossAx") ?? "",
    crossBetween: X(t, "crossBetween") ?? "between",
    min: G(o, "min"),
    max: G(o, "max"),
    majorUnit: G(t, "majorUnit"),
    reversed: X(o, "orientation") === "maxMin",
    fmt: nt(S(t, "numFmt"), "formatCode"),
    majorGrid: e ? at(dt(e, "spPr", "ln"), s) : null,
    line: at(dt(t, "spPr", "ln"), s),
    tickLblPos: X(t, "tickLblPos") ?? "nextTo",
    majorTick: X(t, "majorTickMark") ?? "out",
    lblSize: l.size,
    lblColor: l.color,
    title: (() => {
      const i = S(t, "title");
      return !i || _(t, "delete", !1) ? null : sn(S(i, "tx")) || null;
    })()
  };
}
function ds(t) {
  const n = S(t, "manualLayout");
  if (!n) return null;
  const s = (e) => G(n, e), o = {
    target: X(n, "layoutTarget") ?? "outer",
    x: s("x"),
    y: s("y"),
    w: s("w"),
    h: s("h")
  };
  return o.x === null && o.y === null && o.w === null && o.h === null ? null : o;
}
function ps(t) {
  return t ? {
    rotX: G(t, "rotX") ?? 15,
    rotY: G(t, "rotY") ?? 20,
    depthPercent: G(t, "depthPercent") ?? 100
  } : null;
}
function ms(t, n) {
  const s = S(t, "chart"), o = S(s, "plotArea"), e = $t(S(t, "txPr"), n), l = [], i = [];
  let r = 0;
  if (o)
    for (let k = o.firstElementChild; k; k = k.nextElementSibling) {
      const w = es[k.localName];
      if (!w) continue;
      if (w === "other") {
        i.push(k.localName);
        continue;
      }
      const g = us(k, w, n, r);
      r += g.series.length, l.push(g);
    }
  const c = [];
  if (o)
    for (let k = o.firstElementChild; k; k = k.nextElementSibling) {
      const w = fs[k.localName];
      w && c.push(hs(k, w, n));
    }
  const u = S(s, "title"), a = _(s, "autoTitleDeleted", !1), f = S(u, "tx"), d = u && !_(u, "delete", !1) ? sn(f) : "", x = $t(f ?? S(u, "txPr"), n), p = $t(S(u, "txPr"), n), h = S(s, "legend"), L = /* @__PURE__ */ new Set();
  for (const k of lt(h, "legendEntry")) {
    const w = G(k, "idx");
    w !== null && _(k, "delete", !1) && L.add(w);
  }
  const y = S(t, "spPr"), m = S(o, "spPr");
  return {
    title: d && !a ? d : null,
    titleSize: x.size ?? p.size ?? ct(14),
    titleColor: x.color ?? p.color,
    titleBold: x.bold || p.bold,
    legendPos: h ? X(h, "legendPos") ?? "r" : null,
    legendOverlay: _(h, "overlay", !1),
    legendDeleted: L,
    groups: l,
    axes: c,
    view3D: ps(S(s, "view3D")),
    fill: mt(y, n),
    ln: at(S(y, "ln"), n),
    plotFill: mt(m, n),
    plotLn: at(S(m, "ln"), n),
    plotLayout: ds(S(o, "layout")),
    textSize: e.size ?? ct(10),
    textColor: e.color ?? gn(n, "tx1"),
    unsupported: i
  };
}
const H = (t) => t * 1.4, Cn = (t) => t * 2.9, zn = (t, n) => Qt(t, n) + n * 0.5;
function It(t) {
  let n = 0;
  for (const s of t.labels) {
    const o = zn(s, t.size);
    o > n && (n = o);
  }
  return n;
}
const Dt = (t) => !t.axis.del && t.axis.tickLblPos !== "none", xs = 0.08;
function bs(t, n) {
  const s = Math.max(Math.min(n.h, n.w * 1.2) * xs, 6), o = V(t ? t.rotX : 15, -60, 60), e = V(t ? t.rotY : 20, -90, 90), l = V((t ? t.depthPercent : 100) / 100, 0.2, 3), i = s * V(e / 20, -2, 2) * l, r = -s * V(o / 20, -2, 2) * l;
  return Math.abs(i) < 1 && Math.abs(r) < 1 ? { dx: s * 0.5, dy: -s * 0.4 } : { dx: i, dy: r };
}
function ys(t, n) {
  const s = Math.abs(n.dx), o = Math.abs(n.dy);
  return {
    x: t.x + (n.dx < 0 ? s : 0),
    y: t.y + (n.dy < 0 ? o : 0),
    w: Math.max(t.w - s, 8),
    h: Math.max(t.h - o, 8)
  };
}
function gs(t, n, s) {
  const o = [], e = t.x, l = t.x + t.w, i = t.y, r = t.y + t.h, c = U(J(s, "#ffffff", 0.93)), u = U(J(s, "#ffffff", 0.86)), a = U(J(s, "#ffffff", 0.89)), f = (p, h) => {
    const L = yn(p, h, null);
    L && o.push(L);
  };
  f([[e + n.dx, i + n.dy], [l + n.dx, i + n.dy], [l + n.dx, r + n.dy], [e + n.dx, r + n.dy]], c);
  const d = n.dx >= 0 ? e : l;
  f([[d, i], [d + n.dx, i + n.dy], [d + n.dx, r + n.dy], [d, r]], a);
  const x = n.dy <= 0 ? r : i;
  return f([[e, x], [l, x], [l + n.dx, x + n.dy], [e + n.dx, x + n.dy]], u), o;
}
function Pn(t, n) {
  return t > 0 && n > 0 && t <= n * (5 / 6) ? 0 : t;
}
function vn(t) {
  if (t.lo !== t.hi) return t;
  if (t.lo === 0) return { lo: 0, hi: 1 };
  const n = Math.abs(t.lo) * 0.2;
  return { lo: t.lo - n, hi: t.hi + n };
}
function Bt(t) {
  let n = 1 / 0, s = -1 / 0, o = !1;
  const e = (l) => {
    Number.isFinite(l) && (l < n && (n = l), l > s && (s = l));
  };
  for (const l of t)
    if ((l.kind === "bar" || l.kind === "area") && (o = !0), l.grouping === "percentStacked") {
      let i = !1, r = !1;
      for (const c of l.series)
        for (const u of c.vals)
          u !== null && (u < 0 ? i = !0 : u > 0 && (r = !0));
      e(0), (r || !i) && e(1), i && e(-1);
    } else if (Tt(l)) {
      let i = 0;
      for (const r of l.series) i = Math.max(i, r.vals.length);
      for (let r = 0; r < i; r++) {
        let c = 0, u = 0;
        for (const a of l.series) {
          const f = a.vals[r];
          f == null || !Number.isFinite(f) || (f >= 0 ? c += f : u += f);
        }
        e(c), e(u);
      }
    } else
      for (const i of l.series) for (const r of i.vals) r !== null && e(r);
  return n === 1 / 0 ? { lo: 0, hi: 1 } : (o ? (n = Math.min(n, 0), s = Math.max(s, 0)) : n = Pn(n, s), vn({ lo: n, hi: s }));
}
function ws(t) {
  let n = 1 / 0, s = -1 / 0;
  for (const o of t)
    for (const e of o.series)
      if (e.xs)
        for (const l of e.xs)
          l === null || !Number.isFinite(l) || (l < n && (n = l), l > s && (s = l));
      else e.vals.length && (n = Math.min(n, 1), s = Math.max(s, e.vals.length));
  return n === 1 / 0 ? { lo: 0, hi: 1 } : vn({ lo: Pn(n, s), hi: s });
}
function Ms(t, n, s) {
  const o = nn(t.lo, t.hi, s);
  let e = n.min !== null && Number.isFinite(n.min) ? n.min : o.min, l = n.max !== null && Number.isFinite(n.max) ? n.max : o.max;
  l < e && ([e, l] = [l, e]);
  let i = n.majorUnit !== null && Number.isFinite(n.majorUnit) ? n.majorUnit : o.step;
  for (l === e && (l = e + Math.abs(i) || e + 1), i > 0 || (i = (l - e) / Math.max(1, s)), i > 0 || (i = 1); (l - e) / i > 100; ) i *= 2;
  return { min: e, max: l, step: i };
}
const jt = (t, n) => Math.round(V(t / Math.max(n * 3.2, 1), 2, 12));
function Fn(t, n, s, o, e, l) {
  const i = Ms(s, t, o), r = os(i), c = t.fmt ?? e;
  return {
    axis: t,
    side: n,
    scale: i,
    ticks: r,
    labels: r.map((u) => pt(u, c)),
    between: !1,
    catCount: r.length,
    size: t.lblSize ?? l.textSize,
    color: t.lblColor ?? l.textColor
  };
}
function ks(t, n, s, o, e) {
  return {
    axis: t,
    side: n,
    scale: null,
    ticks: s.map((l, i) => i),
    labels: s.slice(),
    between: o,
    catCount: s.length,
    size: t.lblSize ?? e.textSize,
    color: t.lblColor ?? e.textColor
  };
}
function hn(t, n, s, o) {
  const e = n ? t.h : t.w, l = Math.max(s.catCount, 1), i = s.between ? e / l : l > 1 ? e / (l - 1) : e, r = s.axis.reversed, c = (p) => {
    const h = r ? e - p : p;
    return n ? t.y + t.h - h : t.x + h;
  }, u = (p) => c(s.between ? (p + 0.5) * i : p * i), a = (p) => c(p * i), { at: f, clampValue: d } = Yt(t, n, o), x = (p, h) => n ? [h, p] : [p, h];
  return { rect: t, horizontal: n, catView: s, valView: o, band: i, cat: u, edge: a, val: f, clampVal: d, zero: f(d(0)), pt: x };
}
function Yt(t, n, s) {
  const o = s.scale ?? { min: 0, max: 1 }, e = o.max - o.min || 1;
  return {
    at: (l) => {
      let i = (l - o.min) / e;
      return Number.isFinite(i) || (i = 0), s.axis.reversed && (i = 1 - i), n ? t.x + i * t.w : t.y + t.h - i * t.h;
    },
    clampValue: (l) => Number.isFinite(l) ? V(l, o.min, o.max) : o.min
  };
}
function Ls(t, n, s) {
  const o = Yt(t, !0, n), e = Yt(t, !1, s);
  return { rect: t, x: o.at, y: e.at, clampX: o.clampValue, clampY: e.clampValue };
}
function Ut(t, n, s, o, e = null) {
  const l = t.textSize * 0.45, i = H(t.textSize * 1.05) + l * 0.6, r = { l: t.textSize * 0.4, r: t.textSize * 0.8, t: t.textSize * 0.8, b: t.textSize * 0.3 }, c = (u, a, f, d = !1) => {
    Dt(u) && (r[a] += (f ? d ? Cn(u.size) : H(u.size) : It(u)) + l), u.axis.title && (r[a] += i);
  };
  if (c(s, s.side === "r" ? "r" : "l", !1), e && c(e, e.side, e.side === "t" || e.side === "b"), c(n, n.side === "t" ? "t" : "b", !0, o), Dt(n) && n.scale) {
    const u = It(n) / 2;
    r.l += u, r.r += u;
  }
  return r;
}
function Zt(t, n) {
  const s = t.w * 0.72, o = t.h * 0.72;
  let { l: e, r: l, t: i, b: r } = n;
  if (e + l > s) {
    const c = s / (e + l);
    e *= c, l *= c;
  }
  if (i + r > o) {
    const c = o / (i + r);
    i *= c, r *= c;
  }
  return {
    x: t.x + e,
    y: t.y + i,
    w: Math.max(t.w - e - l, 8),
    h: Math.max(t.h - i - r, 8)
  };
}
function $s(t, n, s, o, e, l) {
  const i = e ? e.dx : 0, r = e ? e.dy : 0, c = it(t + i, n + r, s + i, o + r, l);
  return c ? [c] : [];
}
function on(t, n, s) {
  const o = [], { rect: e, hAxis: l, vAxis: i } = n, r = J(t.textColor, "#ffffff", 0.78), c = J(t.textColor, "#ffffff", 0.45), u = t.textSize * 0.45, a = n.depth;
  for (const p of [!1, !0]) {
    const h = p ? l : i, L = h.axis.majorGrid ? Q(h.axis.majorGrid, r, 1) : null;
    if (!L) continue;
    const y = p ? n.hEdge : n.vEdge, m = y ?? (p ? n.hPos : n.vPos), k = y ? p ? n.hEdgeCount : n.vEdgeCount : h.ticks.length;
    for (let w = 0; w < k; w++) {
      const g = m(w), M = p ? g : e.x, C = p ? e.y : g;
      if (o.push(...$s(
        M,
        C,
        p ? g : e.x + e.w,
        p ? e.y + e.h : g,
        a,
        L
      )), a && n.gridWalls !== !1) {
        const P = p ? g : a.dx < 0 ? e.x + e.w : e.x, $ = p ? a.dy > 0 ? e.y : e.y + e.h : g, A = it(P, $, P + a.dx, $ + a.dy, L);
        A && o.push(A);
      }
    }
  }
  const f = [], d = [], x = [];
  for (const p of [!0, !1]) {
    const h = p ? l : i, L = p ? n.hPos : n.vPos, y = p ? n.hLineAt : n.vLineAt;
    if (!h.axis.del) {
      const M = Q(h.axis.line, c, 1), C = p ? it(e.x, y, e.x + e.w, y, M) : it(y, e.y, y, e.y + e.h, M);
      C && f.push(C);
    }
    const m = h.size, k = p && n.hWrap, w = k ? Cn(m) : H(m);
    let g = 0;
    if (Dt(h)) {
      g = (p ? w : It(h)) + u;
      for (let M = 0; M < h.labels.length; M++) {
        const C = h.labels[M];
        if (!C) continue;
        const P = k ? Math.max(n.hBand * 0.98, m * 2) : zn(C, m), $ = p ? L(M) - P / 2 : h.side === "r" ? e.x + e.w + u : e.x - u - P, A = p ? h.side === "t" ? e.y - u - w : e.y + e.h + u : L(M) - w / 2, D = st($, A, P, w, C, {
          size: m,
          color: h.color,
          align: p ? "center" : h.side === "r" ? "left" : "right",
          anchor: p ? h.side === "t" ? "bottom" : "top" : "middle",
          fonts: s
        });
        k && D.text && (D.text.wrap = !0), d.push(D);
      }
    }
    if (h.axis.title) {
      const M = t.textSize * 1.05, C = H(M);
      if (p) {
        const P = h.side === "t" ? e.y - g - u - C : e.y + e.h + g + u * 0.4;
        x.push(st(
          e.x,
          P,
          e.w,
          C,
          h.axis.title,
          { size: M, color: t.textColor, align: "center", anchor: "middle", fonts: s }
        ));
      } else {
        const P = h.side === "r" ? e.x + e.w + g + u * 0.4 + C / 2 : e.x - g - u * 0.4 - C / 2;
        x.push(st(
          P - e.h / 2,
          e.y + e.h / 2 - C / 2,
          e.h,
          C,
          h.axis.title,
          { size: M, color: t.textColor, align: "center", anchor: "middle", fonts: s, rot: h.side === "r" ? 90 : -90 }
        ));
      }
    }
  }
  return o.push(...f, ...d, ...x), o;
}
function Ss(t, n, s) {
  const o = n.view.side === "l" || n.view.side === "r", e = n.grid ? n.view : { ...n.view, axis: { ...n.view.axis, majorGrid: null } }, l = { ...e, axis: { ...e.axis, del: !0, majorGrid: null, title: null } };
  return on(t, {
    rect: n.rect,
    hAxis: o ? l : e,
    vAxis: o ? e : l,
    hPos: n.pos,
    vPos: n.pos,
    hEdge: null,
    hEdgeCount: 0,
    vEdge: null,
    vEdgeCount: 0,
    hLineAt: n.at,
    vLineAt: n.at,
    hWrap: !1,
    hBand: 0,
    depth: n.depth,
    gridWalls: !1
  }, s);
}
function Cs(t, n) {
  return !Dt(t) || t.scale ? !1 : It(t) > n * 1.02;
}
const xt = Math.PI * 2, dn = ["circle", "square", "diamond", "triangle", "x", "plus", "star", "dot"];
function ot(t, n, s, o) {
  const e = n.dPts.get(s), l = t.varyColors ? wn(o, s) : n.color, i = (e == null ? void 0 : e.fill) ?? n.fill ?? U(l);
  return { fill: i, color: i.type === "solid" ? i.color : l };
}
function bt(t, n, s, o) {
  const e = t.dPts.get(n);
  return Q(e != null && e.ln.present ? e.ln : t.ln, s, o);
}
const W = (t) => t == null || !Number.isFinite(t) ? null : t;
function zs(t) {
  let n = 1 / 0, s = 1 / 0, o = -1 / 0, e = -1 / 0;
  for (const [l, i] of t)
    l < n && (n = l), i < s && (s = i), l > o && (o = l), i > e && (e = i);
  return { x: n, y: s, w: o - n, h: e - s };
}
function Ps(t, n, s) {
  const o = t.map(([l, i]) => [l - n, i - s]);
  let e = `M ${b(o[0][0])} ${b(o[0][1])}`;
  for (let l = 0; l < o.length - 1; l++) {
    const i = o[l === 0 ? 0 : l - 1], r = o[l], c = o[l + 1], u = o[l + 2 < o.length ? l + 2 : o.length - 1], a = [r[0] + (c[0] - i[0]) / 6, r[1] + (c[1] - i[1]) / 6], f = [c[0] - (u[0] - r[0]) / 6, c[1] - (u[1] - r[1]) / 6];
    e += ` C ${b(a[0])} ${b(a[1])} ${b(f[0])} ${b(f[1])} ${b(c[0])} ${b(c[1])}`;
  }
  return e;
}
function en(t, n, s, o, e) {
  const l = t.map((c) => c.filter(([u, a]) => Number.isFinite(u) && Number.isFinite(a))).filter((c) => c.length >= (o ? 3 : 2));
  if (!l.length) return null;
  const i = zs(l.flat()), r = l.map(
    (c) => (e && c.length > 2 ? Ps(c, i.x, i.y) : "M " + c.map(([u, a]) => `${b(u - i.x)} ${b(a - i.y)}`).join(" L ")) + (o ? " Z" : "")
  ).join(" ");
  return q(i.x, i.y, i.w, i.h, r, n, s);
}
function Ct(t, n, s) {
  return `M ${b(t - s)} ${b(n)} A ${b(s)} ${b(s)} 0 1 1 ${b(t + s)} ${b(n)} A ${b(s)} ${b(s)} 0 1 1 ${b(t - s)} ${b(n)} Z`;
}
function vs(t, n) {
  const s = n, o = n * 2;
  switch (t) {
    case "square":
      return { d: `M 0 0 L ${b(o)} 0 L ${b(o)} ${b(o)} L 0 ${b(o)} Z`, open: !1 };
    case "diamond":
      return { d: `M ${b(s)} 0 L ${b(o)} ${b(s)} L ${b(s)} ${b(o)} L 0 ${b(s)} Z`, open: !1 };
    case "triangle":
      return { d: `M ${b(s)} 0 L ${b(o)} ${b(o)} L 0 ${b(o)} Z`, open: !1 };
    case "x":
      return { d: `M 0 0 L ${b(o)} ${b(o)} M ${b(o)} 0 L 0 ${b(o)}`, open: !0 };
    case "plus":
      return { d: `M ${b(s)} 0 L ${b(s)} ${b(o)} M 0 ${b(s)} L ${b(o)} ${b(s)}`, open: !0 };
    case "star":
      return {
        d: `M ${b(s)} 0 L ${b(s)} ${b(o)} M 0 ${b(s)} L ${b(o)} ${b(s)} M 0 0 L ${b(o)} ${b(o)} M ${b(o)} 0 L 0 ${b(o)}`,
        open: !0
      };
    case "dash":
      return { d: `M 0 ${b(s)} L ${b(o)} ${b(s)}`, open: !0 };
    case "dot":
      return { d: Ct(s, s, n * 0.55), open: !1 };
    default:
      return { d: Ct(s, s, n), open: !1 };
  }
}
function Ot(t, n, s) {
  const o = t.kind === "scatter" ? t.scatterStyle !== "line" && t.scatterStyle !== "smooth" : t.showMarker;
  let e = n.marker ? n.marker.symbol : o ? "auto" : "none";
  return e === "auto" && (e = o ? dn[s % dn.length] : "none"), e;
}
function Vt(t, n, s, o, e) {
  var a, f;
  if (s === "none" || !Number.isFinite(t) || !Number.isFinite(n)) return null;
  const l = Math.max(ct(V(((a = o.marker) == null ? void 0 : a.size) ?? 5, 2, 72)) / 2, 1), { d: i, open: r } = vs(s, l), c = (f = o.marker) == null ? void 0 : f.fill, u = o.marker ? Q(o.marker.ln, null, 0) : null;
  return r ? q(t - l, n - l, l * 2, l * 2, i, null, u ?? { color: e, width: 1.25, dash: null }) : q(t - l, n - l, l * 2, l * 2, i, c ?? U(e), u);
}
function ut(t, n, s, o, e, l = null, i = e.cats[n] ?? "") {
  const r = t.dLbls, c = [];
  return r.showSer && c.push(t.name), r.showCat && c.push(i), r.showVal && c.push(pt(s, r.fmt ?? t.fmt)), r.showSize && l !== null && c.push(pt(l, t.sizeFmt ?? r.fmt ?? t.fmt)), r.showPercent && o !== null && c.push(pt(o, r.fmt && r.fmt.includes("%") ? r.fmt : "0%")), c.filter((u) => u !== "").join(" ");
}
function ft(t, n, s, o, e) {
  if (!s || !Number.isFinite(t) || !Number.isFinite(n)) return null;
  const l = o.size ?? e.size * 0.92, i = Math.max(s.length * l * 0.75, l * 2), r = H(l);
  return st(t - i / 2, n - r / 2, i, r, s, {
    size: l,
    color: o.color ?? e.color,
    align: "center",
    anchor: "middle",
    fonts: e.fonts
  });
}
function Fs(t, n, s, o, e) {
  const l = [], i = t.x, r = t.x + t.w, c = t.y, u = t.y + t.h, a = (x, p) => {
    const h = yn(x, U(p), e);
    h && l.push(h);
  }, f = n.dx >= 0 ? r : i;
  a([[f, c], [f + n.dx, c + n.dy], [f + n.dx, u + n.dy], [f, u]], Jt(o));
  const d = n.dy <= 0 ? c : u;
  return a([[i, d], [r, d], [r + n.dx, d + n.dy], [i + n.dx, d + n.dy]], Jn(o)), l.push(q(t.x, t.y, t.w, t.h, `M 0 0 L ${b(t.w)} 0 L ${b(t.w)} ${b(t.h)} L 0 ${b(t.h)} Z`, s, e)), l;
}
function As(t, n, s, o, e = null) {
  const l = [], i = V(t.gapWidth, 0, 800) / 100, r = V(t.overlap, -100, 100) / 100, c = Math.max(s.total, 1), u = 1 + (c - 1) * (1 - r) + i;
  let a = n.band / (u > 0 ? u : 1);
  a > 0 || (a = n.band * 0.6), a = Math.min(a, n.band);
  const f = a * (1 + (c - 1) * (1 - r)), d = a * (1 - r), x = Tt(t), p = t.grouping === "percentStacked", h = t.series.reduce((g, M) => Math.max(g, M.vals.length), 0), L = new Array(h).fill(0), y = new Array(h).fill(0), m = new Array(h).fill(0);
  if (p)
    for (let g = 0; g < h; g++) {
      let M = 0;
      for (const C of t.series) M += Math.abs(W(C.vals[g]) ?? 0);
      m[g] = M;
    }
  const k = [], w = [];
  if (t.series.forEach((g, M) => {
    const C = s.base + (x ? 0 : M), P = n.horizontal ? -1 : 1;
    for (let $ = 0; $ < h; $++) {
      const A = W(g.vals[$]);
      if (A === null) continue;
      const D = p ? m[$] > 0 ? A / m[$] : 0 : A;
      let N = 0;
      x && (N = D >= 0 ? L[$] : y[$], D >= 0 ? L[$] += D : y[$] += D);
      const F = n.cat($) + P * (-f / 2 + C * d + a / 2), T = n.val(n.clampVal(N)), z = n.val(n.clampVal(N + D)), [v, E] = n.pt(F - a / 2, T), [j, R] = n.pt(F + a / 2, z), B = {
        x: Math.min(v, j),
        y: Math.min(E, R),
        w: Math.abs(j - v),
        h: Math.abs(R - E)
      }, { fill: O, color: Pt } = ot(t, g, $, o.ctx);
      if (B.w > 0.05 && B.h > 0.05 && w.push({ r: B, fill: O, color: Pt, stroke: bt(g, $, null, 0), anchor: n.pt(F, T) }), rt(g.dLbls)) {
        const gt = ut(g, $, A, p && m[$] > 0 ? Math.abs(A) / m[$] : null, o), wt = g.dLbls.size ?? o.size * 0.92, I = H(wt) * 0.6, K = g.dLbls.pos ?? (x ? "ctr" : "outEnd");
        let et = (B.x + B.x + B.w) / 2, tt = (B.y + B.y + B.h) / 2;
        if (K !== "ctr") {
          const rn = K === "inEnd" || K === "inBase" ? -1 : 1;
          n.horizontal ? et = (D >= 0 ? B.x + B.w : B.x) + rn * (D >= 0 ? I : -I) : tt = (D >= 0 ? B.y : B.y + B.h) - rn * (D >= 0 ? I : -I);
        }
        const Y = ft(et, tt, gt, g.dLbls, o);
        Y && k.push(Y);
      }
    }
  }), e) {
    const g = (M) => M.anchor[0] * e.dx + M.anchor[1] * e.dy;
    w.sort((M, C) => g(M) - g(C));
    for (const M of w) l.push(...Fs(M.r, e, M.fill, M.color, M.stroke));
  } else
    for (const g of w)
      l.push(
        q(
          g.r.x,
          g.r.y,
          g.r.w,
          g.r.h,
          `M 0 0 L ${b(g.r.w)} 0 L ${b(g.r.w)} ${b(g.r.h)} L 0 ${b(g.r.h)} Z`,
          g.fill,
          g.stroke
        )
      );
  return l.concat(k);
}
function An(t) {
  const n = t.series.reduce((c, u) => Math.max(c, u.vals.length), 0), s = Tt(t), o = t.grouping === "percentStacked", e = new Array(n).fill(0);
  if (o)
    for (let c = 0; c < n; c++) {
      let u = 0;
      for (const a of t.series) u += Math.abs(W(a.vals[c]) ?? 0);
      e[c] = u;
    }
  const l = new Array(n).fill(0), i = [], r = [];
  for (const c of t.series) {
    const u = [], a = [];
    for (let f = 0; f < n; f++) {
      const d = W(c.vals[f]);
      if (d === null) {
        u.push(null), a.push(null);
        continue;
      }
      const x = o ? e[f] > 0 ? d / e[f] : 0 : d;
      s ? (a.push(l[f]), l[f] += x, u.push(l[f])) : (a.push(0), u.push(x));
    }
    i.push(u), r.push(a);
  }
  return { top: i, bottom: r };
}
function Ns(t, n, s) {
  const o = [], e = [], { top: l } = An(t), i = t.grouping === "percentStacked";
  return t.series.forEach((r, c) => {
    const u = l[c] ?? [], a = [];
    let f = [];
    const d = [];
    for (let L = 0; L < u.length; L++) {
      const y = u[L];
      if (y === null) {
        f.length && a.push(f), f = [], d.push(null);
        continue;
      }
      const m = n.pt(n.cat(L), n.val(n.clampVal(y)));
      f.push(m), d.push(m);
    }
    f.length && a.push(f);
    const x = Q(r.ln, r.color, ct(2.25)), p = en(a, null, x, !1, r.smooth);
    p && o.push(p);
    const h = Ot(t, r, c);
    for (let L = 0; L < d.length; L++) {
      const y = d[L];
      if (!y) continue;
      const { color: m } = ot(t, r, L, s.ctx), k = Vt(y[0], y[1], h, r, t.varyColors ? m : r.color);
      if (k && e.push(k), rt(r.dLbls)) {
        const w = W(r.vals[L]) ?? 0, g = ut(r, L, w, i ? u[L] ?? 0 : null, s), M = r.dLbls.size ?? s.size * 0.92, C = ft(y[0], y[1] - H(M) * 0.85, g, r.dLbls, s);
        C && e.push(C);
      }
    }
  }), o.concat(e);
}
function Es(t, n, s) {
  const o = [], e = [], { top: l, bottom: i } = An(t), r = t.grouping === "percentStacked";
  return t.series.forEach((c, u) => {
    const a = l[u] ?? [], f = i[u] ?? [], d = [];
    let x = [], p = [];
    const h = () => {
      x.length >= 2 && d.push(x.concat(p.slice().reverse())), x = [], p = [];
    };
    for (let m = 0; m < a.length; m++) {
      const k = a[m];
      if (k === null) {
        h();
        continue;
      }
      x.push(n.pt(n.cat(m), n.val(n.clampVal(k)))), p.push(n.pt(n.cat(m), n.val(n.clampVal(f[m] ?? 0))));
    }
    h();
    const { fill: L } = ot(t, c, 0, s.ctx), y = en(d, L, Q(c.ln, null, 0), !0, c.smooth);
    if (y && o.push(y), rt(c.dLbls))
      for (let m = 0; m < a.length; m++) {
        const k = a[m];
        if (k === null) continue;
        const [w, g] = n.pt(n.cat(m), n.val(n.clampVal(k))), M = W(c.vals[m]) ?? 0, C = c.dLbls.size ?? s.size * 0.92, P = ft(w, g - H(C) * 0.8, ut(c, m, M, r ? k : null, s), c.dLbls, s);
        P && e.push(P);
      }
  }), o.concat(e);
}
function Is(t, n, s) {
  const o = [], e = [], l = t.scatterStyle !== "marker" && t.scatterStyle !== "none";
  return t.series.forEach((i, r) => {
    const c = [];
    let u = [];
    const a = [];
    for (let d = 0; d < i.vals.length; d++) {
      const x = W(i.vals[d]), p = i.xs ? W(i.xs[d]) : d + 1;
      if (x === null || p === null) {
        u.length && c.push(u), u = [], a.push(null);
        continue;
      }
      const h = [n.x(n.clampX(p)), n.y(n.clampY(x))];
      u.push(h), a.push(h);
    }
    if (u.length && c.push(u), l) {
      const d = Q(i.ln, i.color, ct(2.25)), x = en(c, null, d, !1, i.smooth || t.scatterStyle === "smoothMarker");
      x && o.push(x);
    }
    const f = Ot(t, i, r);
    for (let d = 0; d < a.length; d++) {
      const x = a[d];
      if (!x) continue;
      const { color: p } = ot(t, i, d, s.ctx), h = Vt(x[0], x[1], f === "none" && !l ? "circle" : f, i, t.varyColors ? p : i.color);
      if (h && e.push(h), rt(i.dLbls)) {
        const L = i.dLbls.size ?? s.size * 0.92, y = ft(
          x[0],
          x[1] - H(L) * 0.85,
          ut(i, d, W(i.vals[d]) ?? 0, null, s, null, i.cats[d] ?? String(d + 1)),
          i.dLbls,
          s
        );
        y && e.push(y);
      }
    }
  }), o.concat(e);
}
function Ds(t, n, s) {
  const o = V(t.bubbleScale, 0, 300) / 100, e = Math.max(2, Math.min(n.rect.w, n.rect.h) * 0.13 * o);
  let l = 0;
  for (const a of t.series)
    for (const f of a.sizes ?? []) {
      const d = W(f);
      d !== null && (l = Math.max(l, Math.abs(d)));
    }
  const i = t.bubbleSizeBy !== "w", r = [];
  for (const a of t.series)
    for (let f = 0; f < a.vals.length; f++) {
      const d = W(a.vals[f]), x = a.xs ? W(a.xs[f]) : f + 1;
      if (d === null || x === null) continue;
      const p = a.sizes ? Math.abs(W(a.sizes[f]) ?? 0) : 0, h = l > 0 ? p / l : 1, L = Math.max(1.5, e * (i ? Math.sqrt(h) : h)), { fill: y, color: m } = ot(t, a, f, s.ctx), k = t.varyColors ? m : a.color;
      r.push({
        x: n.x(n.clampX(x)),
        y: n.y(n.clampY(d)),
        r: L,
        fill: t.varyColors ? U(k) : y,
        color: k,
        stroke: bt(a, f, Jt(k, 0.35), Math.max(1, ct(0.75))),
        label: rt(a.dLbls) ? ut(a, f, d, null, s, a.sizes ? W(a.sizes[f]) : null, a.cats[f] ?? String(f + 1)) : "",
        lblSpec: a
      });
    }
  r.sort((a, f) => f.r - a.r);
  const c = [], u = [];
  for (const a of r)
    if (c.push(q(a.x - a.r, a.y - a.r, a.r * 2, a.r * 2, Ct(a.r, a.r, a.r), a.fill, a.stroke)), a.label) {
      const f = ft(a.x, a.y, a.label, a.lblSpec.dLbls, s);
      f && u.push(f);
    }
  return c.concat(u);
}
function Ts(t, n, s) {
  var L;
  const o = t.series.length;
  if (o < 3) return [];
  const e = o >= 4 ? t.series.slice(o - 4) : t.series, l = o >= 4 ? e[0] : null, i = e[o >= 4 ? 1 : 0], r = e[o >= 4 ? 2 : 1], c = e[o >= 4 ? 3 : 2], u = J(s.color, "rgb(255,255,255)", 0.15), a = Q(t.hiLowLines, u, 1) ?? { color: u, width: 1, dash: null }, f = Math.max(i.vals.length, r.vals.length, c.vals.length), d = V(((L = t.upDown) == null ? void 0 : L.gapWidth) ?? 150, 0, 500) / 100, x = Math.max(1.5, Math.min(n.band / (1 + d), n.band * 0.9)), p = Math.max(1.5, x / 2), h = [];
  for (let y = 0; y < f; y++) {
    const m = W(i.vals[y]), k = W(r.vals[y]), w = W(c.vals[y]), g = l ? W(l.vals[y]) : null;
    if (m === null || k === null) continue;
    const M = n.cat(y), C = n.val(n.clampVal(Math.max(m, k))), P = n.val(n.clampVal(Math.min(m, k))), [$, A] = n.pt(M, C), [D, N] = n.pt(M, P), F = it($, A, D, N, a);
    if (F && h.push(F), t.upDown && g !== null && w !== null) {
      const T = w >= g, z = n.val(n.clampVal(g)), v = n.val(n.clampVal(w)), [E, j] = n.pt(M - x / 2, Math.min(z, v)), [R, B] = n.pt(M + x / 2, Math.max(z, v)), O = {
        x: Math.min(E, R),
        y: Math.min(j, B),
        w: Math.max(Math.abs(R - E), 1),
        h: Math.max(Math.abs(B - j), 1)
      }, gt = (T ? t.upDown.upFill : t.upDown.downFill) ?? U(T ? "rgb(255,255,255)" : u), wt = Q(T ? t.upDown.upLn : t.upDown.downLn, u, 1) ?? { color: u, width: 1, dash: null };
      h.push(q(
        O.x,
        O.y,
        O.w,
        O.h,
        `M 0 0 L ${b(O.w)} 0 L ${b(O.w)} ${b(O.h)} L 0 ${b(O.h)} Z`,
        gt,
        wt
      ));
    } else {
      if (g !== null) {
        const [T, z] = n.pt(M, n.val(n.clampVal(g))), v = it(T - (n.horizontal ? 0 : p), z - (n.horizontal ? p : 0), T, z, a);
        v && h.push(v);
      }
      if (w !== null) {
        const [T, z] = n.pt(M, n.val(n.clampVal(w))), v = it(T, z, T + (n.horizontal ? 0 : p), z + (n.horizontal ? p : 0), a);
        v && h.push(v);
      }
    }
    if (rt(c.dLbls) && w !== null) {
      const [T, z] = n.pt(M, n.val(n.clampVal(w))), v = c.dLbls.size ?? s.size * 0.92, E = ft(T + x, z - H(v) * 0.2, ut(c, y, w, null, s), c.dLbls, s);
      E && h.push(E);
    }
  }
  return h;
}
function _t(t, n, s, o, e, l) {
  const i = (u, a) => `${b(t + u * Math.cos(a))} ${b(n + u * Math.sin(a))}`, r = l - e;
  if (r >= xt - 1e-6) {
    const u = Ct(t, n, o);
    return s > 0.01 ? `${u} ${Ct(t, n, s)}` : u;
  }
  const c = r > Math.PI ? 1 : 0;
  return s <= 0.01 ? `M ${b(t)} ${b(n)} L ${i(o, e)} A ${b(o)} ${b(o)} 0 ${c} 1 ${i(o, l)} Z` : `M ${i(o, e)} A ${b(o)} ${b(o)} 0 ${c} 1 ${i(o, l)} L ${i(s, l)} A ${b(s)} ${b(s)} 0 ${c} 0 ${i(s, e)} Z`;
}
const Xt = 0.55, pn = 0.17, Nn = (t, n, s, o, e) => `${b(t + s * Math.cos(e))} ${b(n + o * Math.sin(e))}`;
function Bs(t, n, s, o, e, l) {
  const i = (u) => Nn(t, n, s, o, u), r = l - e;
  if (r >= xt - 1e-6)
    return `M ${b(t - s)} ${b(n)} A ${b(s)} ${b(o)} 0 1 1 ${b(t + s)} ${b(n)} A ${b(s)} ${b(o)} 0 1 1 ${b(t - s)} ${b(n)} Z`;
  const c = r > Math.PI ? 1 : 0;
  return `M ${b(t)} ${b(n)} L ${i(e)} A ${b(s)} ${b(o)} 0 ${c} 1 ${i(l)} Z`;
}
function js(t, n) {
  const s = [];
  for (let o = -1; o <= 2; o++) {
    const e = Math.max(t, o * xt), l = Math.min(n, o * xt + Math.PI);
    l - e > 1e-4 && s.push([e, l]);
  }
  return s;
}
function Os(t, n, s, o, e, l, i) {
  const r = (u, a) => Nn(t, n + a, s, o, u), c = l - e > Math.PI ? 1 : 0;
  return `M ${r(e, 0)} A ${b(s)} ${b(o)} 0 ${c} 1 ${r(l, 0)} L ${r(l, i)} A ${b(s)} ${b(o)} 0 ${c} 0 ${r(e, i)} Z`;
}
function Vs(t, n, s) {
  var L;
  const o = t.series[0];
  if (!o) return [];
  const e = rt(o.dLbls) ? 0.8 : 0.94, l = Math.min(n.w / 2, n.h / (2 * Xt + pn)) * e;
  if (!(l > 0)) return [];
  const i = l * Xt, r = l * pn, c = n.x + n.w / 2, u = n.y + (n.h - (2 * i + r)) / 2 + i, a = o.vals.map((y) => Math.abs(W(y) ?? 0)), f = a.reduce((y, m) => y + m, 0);
  if (!(f > 0)) return [];
  const d = [], x = [], p = [];
  let h = (V(t.firstSliceAng, 0, 360) - 90) * (Math.PI / 180);
  for (let y = 0; y < a.length; y++) {
    const m = a[y] / f, k = m * xt;
    if (!(k > 0)) continue;
    const w = h + k, g = h + k / 2, M = V(((L = o.dPts.get(y)) == null ? void 0 : L.explosion) ?? 0, 0, 400) / 100 * l * 0.5, C = c + Math.cos(g) * M, P = u + Math.sin(g) * M * Xt, { fill: $, color: A } = ot(t, o, y, s.ctx), D = bt(o, y, null, 0);
    for (const [N, F] of js(h, w)) {
      const T = q(
        C - l,
        P - i,
        l * 2,
        i * 2 + r,
        Os(l, i, l, i, N, F, r),
        U(Jt(A)),
        D
      );
      d.push({ el: T, depth: Math.sin((N + F) / 2) });
    }
    if (x.push(q(C - l, P - i, l * 2, i * 2, Bs(l, i, l, i, h, w), $, D)), rt(o.dLbls)) {
      const N = o.dLbls.pos === "outEnd" || o.dLbls.pos === "bestFit", F = N ? 1.2 : 0.62, T = Math.sin(g), z = T > 0 ? r * (N ? 1 : 0.5) : 0, v = ut(o, y, W(o.vals[y]) ?? 0, m, s), E = ft(C + Math.cos(g) * l * F, P + T * i * F + z, v, o.dLbls, s);
      E && p.push(E);
    }
    h = w;
  }
  return d.sort((y, m) => y.depth - m.depth), d.map((y) => y.el).concat(x, p);
}
function Rs(t, n, s) {
  const o = [], e = [], l = t.kind === "doughnut" ? t.series : t.series.slice(0, 1);
  if (!l.length) return o;
  const i = l.some((d) => rt(d.dLbls)), r = Math.min(n.w, n.h) / 2 * (i ? 0.78 : 0.92);
  if (!(r > 0)) return o;
  const c = n.x + n.w / 2, u = n.y + n.h / 2, a = t.kind === "doughnut" ? V(t.holeSize, 0, 90) / 100 : 0, f = r * (1 - a) / l.length;
  return l.forEach((d, x) => {
    var k;
    const p = r * a + x * f, h = p + f, L = d.vals.map((w) => Math.abs(W(w) ?? 0)), y = L.reduce((w, g) => w + g, 0);
    if (!(y > 0)) return;
    let m = (V(t.firstSliceAng, 0, 360) - 90) * (Math.PI / 180);
    for (let w = 0; w < L.length; w++) {
      const g = L[w] / y, M = g * xt;
      if (!(M > 0)) continue;
      const C = m + M / 2, P = V(((k = d.dPts.get(w)) == null ? void 0 : k.explosion) ?? 0, 0, 400) / 100 * h * 0.5, $ = c + Math.cos(C) * P, A = u + Math.sin(C) * P, { fill: D } = ot(t, d, w, s.ctx);
      if (o.push(
        q(
          $ - h,
          A - h,
          h * 2,
          h * 2,
          _t(h, h, p, h, m, m + M),
          D,
          bt(d, w, null, 0)
        )
      ), rt(d.dLbls)) {
        const F = d.dLbls.pos === "outEnd" || d.dLbls.pos === "bestFit" ? h * 1.16 : (p + h) / 2 + (p > 0 ? 0 : h * 0.12), T = ut(d, w, W(d.vals[w]) ?? 0, g, s), z = ft($ + Math.cos(C) * F, A + Math.sin(C) * F, T, d.dLbls, s);
        z && e.push(z);
      }
      m += M;
    }
  }), o.concat(e);
}
function Ws(t, n) {
  const s = t.ofPie, o = /* @__PURE__ */ new Set();
  if (!s || !n.length) return o;
  const e = n.reduce((l, i) => l + i, 0);
  switch (s.splitType) {
    case "val": {
      const l = s.splitPos ?? 0;
      n.forEach((i, r) => {
        i < l && o.add(r);
      });
      break;
    }
    case "percent": {
      const l = (s.splitPos ?? 0) / 100;
      n.forEach((i, r) => {
        e > 0 && i / e < l && o.add(r);
      });
      break;
    }
    case "custom":
      for (const l of s.custSplit) l >= 0 && l < n.length && o.add(l);
      break;
    default: {
      const l = V(Math.round(s.splitPos ?? 2), 1, Math.max(n.length - 1, 1));
      for (let i = Math.max(n.length - l, 1); i < n.length; i++) o.add(i);
    }
  }
  return o.size >= n.length && o.delete(0), o;
}
function Gs(t, n, s) {
  const o = t.series[0], e = t.ofPie;
  if (!o || !e) return [];
  const l = o.vals.map((z) => Math.abs(W(z) ?? 0)), i = l.reduce((z, v) => z + v, 0);
  if (!(i > 0)) return [];
  const r = Ws(t, l), c = l.map((z, v) => v).filter((z) => !r.has(z)), u = l.map((z, v) => v).filter((z) => r.has(z)), a = u.reduce((z, v) => z + l[v], 0), f = rt(o.dLbls), d = n.w * 0.08, x = (n.w - d) / 2, p = Math.max(6, Math.min(x * (f ? 0.72 : 0.86), n.h * (f ? 0.38 : 0.46))), h = Math.max(4, Math.min(p * V(e.secondSize, 5, 200) / 100, x * 0.86, n.h * 0.46)), L = n.y + n.h / 2, y = n.x + x / 2, m = n.x + x + d + x / 2, k = [], w = [], g = J(s.color, "rgb(255,255,255)", 0.55), M = (z, v, E, j) => {
    if (!f) return;
    const R = E === null ? `其他 ${pt(a / i, "0%")}` : ut(o, E, j, i > 0 ? j / i : null, s), B = ft(z, v, R, o.dLbls, s);
    B && w.push(B);
  }, C = c.map((z) => ({ idx: z, v: l[z] }));
  a > 0 && C.push({ idx: null, v: a });
  let P = (V(t.firstSliceAng, 0, 360) - 90) * (Math.PI / 180), $ = 0, A = 0;
  for (const z of C) {
    const v = z.v / i * xt;
    if (!(v > 0)) continue;
    const E = P + v / 2, j = z.idx === null ? U(g) : ot(t, o, z.idx, s.ctx).fill, R = z.idx === null ? null : bt(o, z.idx, null, 0);
    k.push(q(y - p, L - p, p * 2, p * 2, _t(p, p, 0, p, P, P + v), j, R));
    const B = o.dLbls.pos === "outEnd" || o.dLbls.pos === "bestFit" ? p * 1.15 : p * 0.62;
    M(y + Math.cos(E) * B, L + Math.sin(E) * B, z.idx, z.v), z.idx === null && ($ = P, A = P + v), P += v;
  }
  const D = a > 0 ? a : 1;
  let N = L - h, F = L + h, T = m - h;
  if (e.type === "bar") {
    const z = Math.max(8, h * 0.9), v = Math.max(12, h * 2);
    N = L - v / 2, F = L + v / 2, T = m - z / 2;
    let E = N;
    for (const j of u) {
      const R = l[j] / D * v;
      if (!(R > 0)) continue;
      const { fill: B } = ot(t, o, j, s.ctx);
      k.push(q(
        T,
        E,
        z,
        R,
        `M 0 0 L ${b(z)} 0 L ${b(z)} ${b(R)} L 0 ${b(R)} Z`,
        B,
        bt(o, j, null, 0)
      )), M(T + z / 2, E + R / 2, j, l[j]), E += R;
    }
  } else {
    let z = -Math.PI / 2;
    for (const v of u) {
      const E = l[v] / D * xt;
      if (!(E > 0)) continue;
      const j = z + E / 2, { fill: R } = ot(t, o, v, s.ctx);
      k.push(q(m - h, L - h, h * 2, h * 2, _t(h, h, 0, h, z, z + E), R, bt(o, v, null, 0)));
      const B = o.dLbls.pos === "outEnd" || o.dLbls.pos === "bestFit" ? h * 1.18 : h * 0.62;
      M(m + Math.cos(j) * B, L + Math.sin(j) * B, v, l[v]), z += E;
    }
  }
  if (e.serLines !== !1 && a > 0) {
    const z = { color: J(s.color, "rgb(255,255,255)", 0.45), width: 1, dash: null }, v = [y + Math.cos($) * p, L + Math.sin($) * p], E = [y + Math.cos(A) * p, L + Math.sin(A) * p], j = v[1] <= E[1] ? v : E, R = v[1] <= E[1] ? E : v, B = it(j[0], j[1], T, N, z), O = it(R[0], R[1], T, F, z);
    B && k.push(B), O && k.push(O);
  }
  return k.concat(w);
}
const Ft = [
  "rgb(49,84,163)",
  "rgb(84,148,200)",
  "rgb(160,208,224)",
  "rgb(224,238,196)",
  "rgb(253,224,144)",
  "rgb(244,146,74)",
  "rgb(200,60,44)"
];
function mn(t) {
  const n = V(t, 0, 1) * (Ft.length - 1), s = Math.min(Math.floor(n), Ft.length - 2);
  return J(Ft[s], Ft[s + 1], n - s);
}
function Xs(t, n, s) {
  const o = t.series.length, e = t.series.reduce((M, C) => Math.max(M, C.vals.length), 0);
  if (!o || !e) return [];
  const l = Math.min(n.rect.w * 0.16, s.size * 7), i = Math.min(n.rect.w * 0.2, Math.max(s.size * 4, Qt(Ys(t.series.map((M) => M.name)), s.size) + s.size)), r = H(s.size) * 1.2, c = n.rect.x + i, u = n.rect.y, a = Math.max(n.rect.w - i - l - s.size, 12), f = Math.max(n.rect.h - r, 12), d = a / e, x = f / o, p = n.max - n.min || 1, h = [], L = { color: "rgba(255,255,255,0.75)", width: 0.75, dash: null };
  t.series.forEach((M, C) => {
    const P = u + f - (C + 1) * x;
    for (let $ = 0; $ < e; $++) {
      const A = W(M.vals[$]);
      if (A === null) continue;
      const D = (A - n.min) / p, N = V(Math.floor(D * n.bands), 0, n.bands - 1), F = t.bandFills.get(N) ?? U(mn(n.bands > 1 ? N / (n.bands - 1) : D));
      h.push(St({ x: c + $ * d, y: P, w: d, h: x }, F, L));
    }
    h.push(st(n.rect.x, P + x / 2 - r / 2, Math.max(i - s.size * 0.4, 8), r, M.name, {
      size: s.size,
      color: s.color,
      align: "right",
      anchor: "middle",
      fonts: s.fonts
    }));
  });
  for (let M = 0; M < e && M < s.cats.length; M++)
    h.push(st(c + M * d, u + f, d, r, s.cats[M], {
      size: s.size,
      color: s.color,
      align: "center",
      anchor: "middle",
      fonts: s.fonts
    }));
  const y = Math.min(s.size * 1.1, l * 0.35), m = c + a + s.size * 0.6, k = f * 0.9, w = u + (f - k) / 2, g = k / n.bands;
  for (let M = 0; M < n.bands; M++) {
    const C = t.bandFills.get(M) ?? U(mn(n.bands > 1 ? M / (n.bands - 1) : 0.5));
    h.push(St({ x: m, y: w + k - (M + 1) * g, w: y, h: g }, C, null)), h.push(
      st(
        m + y + s.size * 0.3,
        w + k - (M + 1) * g - H(s.size * 0.85) / 2,
        l,
        H(s.size * 0.85),
        pt(n.min + (M + 1) * p / n.bands, n.fmt),
        {
          size: s.size * 0.85,
          color: s.color,
          align: "left",
          anchor: "middle",
          fonts: s.fonts
        }
      )
    );
  }
  return h;
}
const Ys = (t) => t.reduce((n, s) => s.length > n.length ? s : n, "");
function qt(t, n, s) {
  const o = t.angle(n), e = t.radius * t.norm(s);
  return [t.cx + e * Math.sin(o), t.cy - e * Math.cos(o)];
}
function Us(t, n, s, o, e, l) {
  const i = [];
  if (t.count < 3) return i;
  for (const c of n) {
    const u = [];
    for (let f = 0; f < t.count; f++) u.push(qt(t, f, c));
    const a = Kt([u], null, o);
    a && i.push(a);
  }
  for (let c = 0; c < t.count; c++) {
    const u = t.angle(c), a = it(t.cx, t.cy, t.cx + t.radius * Math.sin(u), t.cy - t.radius * Math.cos(u), e);
    a && i.push(a);
  }
  const r = s.size * 1.4;
  for (let c = 0; c < t.count && c < s.cats.length; c++) {
    const u = t.angle(c), a = s.size * 0.9, f = t.cx + (t.radius + a) * Math.sin(u), d = t.cy - (t.radius + a) * Math.cos(u), x = Math.sin(u), p = x > 0.2 ? "left" : x < -0.2 ? "right" : "center", h = Math.max(s.size * 6, 30), L = p === "left" ? f : p === "right" ? f - h : f - h / 2;
    i.push(st(L, d - r / 2, h, r, s.cats[c], {
      size: s.size,
      color: s.color,
      align: p,
      fonts: s.fonts
    }));
  }
  for (const c of n) {
    if (c === 0) continue;
    const [u, a] = qt(t, 0, c);
    i.push(st(u + 2, a - r / 2, s.size * 5, r, l(c), {
      size: s.size * 0.9,
      color: s.color,
      align: "left",
      fonts: s.fonts
    }));
  }
  return i;
}
function Zs(t, n, s) {
  const o = [], e = [], l = t.radarStyle === "filled", i = t.radarStyle === "marker";
  return t.series.forEach((r, c) => {
    const { fill: u, color: a } = ot(t, r, 0, s.ctx), f = [];
    for (let h = 0; h < n.count; h++) {
      const L = r.vals[h];
      L == null || !Number.isFinite(L) || f.push(qt(n, h, L));
    }
    if (f.length < 2) return;
    const d = Q(r.ln, a, 2) ?? { color: a, width: 2, dash: null }, x = l ? u.type === "solid" ? { type: "solid", color: _s(u.color, 0.45) } : u : null, p = Kt([f], x, d);
    if (p && o.push(p), i) {
      const h = Ot(t, r, c);
      for (const [L, y] of f) {
        const m = Vt(L, y, h, r, a);
        m && e.push(m);
      }
    }
  }), o.concat(e);
}
function _s(t, n) {
  const s = t.match(/rgba?\(([^)]+)\)/);
  if (!s) return t;
  const o = s[1].split(",").map((e) => Number(e.trim()));
  return `rgba(${o[0] || 0},${o[1] || 0},${o[2] || 0},${n})`;
}
function qs(t, n) {
  const s = t.axes.filter((o) => o.kind === "val");
  return n.map((o) => {
    const e = s.filter((c) => o.axIds.includes(c.id)), l = e.length ? e : s, i = l.find((c) => c.pos === "b" || c.pos === "t") ?? l[0] ?? Et("val"), r = l.find((c) => c !== i) ?? Et("val");
    return { group: o, x: i, y: r };
  });
}
function En(t, n, s, o = []) {
  const e = qs(t, n), l = (r, c = { lo: 0, hi: 1 }) => {
    const u = e.filter((x) => x.x === r).map((x) => x.group), a = [
      ...o.filter((x) => r.id && x.axIds.includes(r.id)),
      ...e.filter((x) => x.y === r).map((x) => x.group)
    ], f = u.length ? ws(u) : null, d = a.length ? Bt(a) : null;
    return f && d ? { lo: Math.min(f.lo, d.lo), hi: Math.max(f.hi, d.hi) } : f ?? d ?? c;
  };
  return { axes: (r = []) => {
    const c = new Map(r.map((a) => [a.axis, a])), u = (a, f, d) => {
      let x = c.get(a);
      return x || (x = Fn(
        a,
        f ? a.pos === "t" ? "t" : "b" : a.pos === "r" ? "r" : "l",
        l(a),
        jt(f ? s.w : s.h, t.textSize),
        f ? null : d,
        t
      ), c.set(a, x)), x;
    };
    return e.map(({ group: a, x: f, y: d }) => {
      var x;
      return {
        group: a,
        x: u(f, !0, null),
        y: u(d, !1, ((x = a.series.find((p) => p.fmt)) == null ? void 0 : x.fmt) ?? null)
      };
    });
  }, extent: l };
}
function Ht(t, n, s) {
  const o = { ...s };
  for (const e of n) {
    const l = Ut(t, e.x, e.y, !1);
    for (const i of ["l", "r", "t", "b"]) o[i] = Math.max(o[i], l[i]);
  }
  return o;
}
function In(t, n, s, o, e, l = /* @__PURE__ */ new Set()) {
  const i = [], r = [], c = (u) => l.has(u.axis) ? { ...u, axis: { ...u.axis, del: !0, title: null, majorGrid: null } } : (l.add(u.axis), u);
  for (const { group: u, x: a, y: f } of n) {
    const d = Ls(s, a, f);
    i.push(...on(t, {
      rect: s,
      hAxis: c(a),
      vAxis: c(f),
      hPos: (x) => d.x(a.ticks[x] ?? 0),
      vPos: (x) => d.y(f.ticks[x] ?? 0),
      hEdge: null,
      hEdgeCount: 0,
      vEdge: null,
      vEdgeCount: 0,
      hLineAt: d.y(d.clampY(0)),
      vLineAt: d.x(d.clampX(0)),
      hWrap: !1,
      hBand: 0,
      depth: null
    }, o)), r.push(...u.kind === "bubble" ? Ds(u, d, e) : Is(u, d, e));
  }
  return { axes: i, plots: r };
}
function Hs(t, n, s, o) {
  const e = Math.max(Number.isFinite(n) ? n : 0, 1), l = Math.max(Number.isFinite(s) ? s : 0, 1);
  try {
    return Qs(t, e, l, o);
  } catch {
    return [ln(e, l, "图表渲染失败")];
  }
}
function ln(t, n, s) {
  return { kind: "unsupported", x: 0, y: 0, w: t, h: n, rot: 0, flipH: !1, flipV: !1, label: s };
}
function Ks(t, n, s, o) {
  const e = [];
  if (n.length > 0 && n.every((r) => r.kind === "pie" || r.kind === "doughnut" || r.kind === "ofPie")) {
    const r = n[0], c = r.series[0];
    if (!c) return e;
    const u = Math.max(c.vals.length, s.length);
    for (let a = 0; a < u; a++) {
      if (t.legendDeleted.has(a)) continue;
      const { fill: f, color: d } = ot(r, c, a, o);
      e.push({ label: s[a] ?? String(a + 1), fill: f, color: d, stroke: null, marker: null, line: !1 });
    }
    return e;
  }
  let i = 0;
  for (const r of n)
    r.series.forEach((c, u) => {
      const a = i++;
      if (t.legendDeleted.has(a)) return;
      const f = r.kind === "line" || r.kind === "scatter";
      e.push({
        label: c.name,
        fill: f ? U(c.color) : c.fill ?? U(c.color),
        color: c.color,
        stroke: f ? Q(c.ln, c.color, ct(2)) : null,
        marker: f ? { sym: Ot(r, c, u), s: c } : null,
        line: f
      });
    });
  return e;
}
function Js(t, n, s, o) {
  const e = [];
  if (!t.legendPos || !n.length) return { els: e, region: s };
  const l = t.textSize, i = l * 1.2, r = l * 0.72, c = l * 1.75, u = l * 0.35, a = l * 0.9, f = n.map((y) => i + u + Qt(y.label, l) + a), d = t.legendPos, x = d === "t" || d === "b";
  let p, h = s;
  const L = (y, m, k, w) => {
    const g = k + c / 2;
    if (y.line) {
      const M = it(m, g, m + i, g, y.stroke ?? { color: y.color, width: ct(2), dash: null });
      if (M && e.push(M), y.marker && y.marker.sym !== "none") {
        const C = Vt(m + i / 2, g, y.marker.sym, y.marker.s, y.color);
        C && e.push(C);
      }
    } else
      e.push(St({ x: m, y: g - r / 2, w: i, h: r }, y.fill, null));
    e.push(
      st(m + i + u, k, w, c, y.label, {
        size: l,
        color: t.textColor,
        align: "left",
        anchor: "middle",
        fonts: o
      })
    );
  };
  if (x) {
    const y = s.w, m = [];
    let k = [], w = 0;
    for (let P = 0; P < n.length; P++) {
      const $ = Math.min(f[P], y);
      k.length && w + $ > y && (m.push(k), k = [], w = 0), k.push(P), w += $;
    }
    k.length && m.push(k);
    const g = Math.max(1, Math.floor(s.h * 0.4 / c)), M = m.slice(0, g), C = M.length * c;
    p = d === "t" ? { x: s.x, y: s.y, w: s.w, h: C } : { x: s.x, y: s.y + s.h - C, w: s.w, h: C }, t.legendOverlay || (h = d === "t" ? { x: s.x, y: s.y + C, w: s.w, h: s.h - C } : { x: s.x, y: s.y, w: s.w, h: s.h - C }), M.forEach((P, $) => {
      const A = P.reduce((F, T) => F + Math.min(f[T], y), 0);
      let D = p.x + Math.max((p.w - A) / 2, 0);
      const N = p.y + $ * c;
      for (const F of P) {
        const T = Math.min(f[F], y);
        L(n[F], D, N, Math.max(T - i - u - a * 0.5, l)), D += T;
      }
    });
  } else {
    const y = Math.max(1, Math.floor(s.h / c)), m = Math.max(1, Math.ceil(n.length / y)), k = f.reduce((A, D) => D > A ? D : A, 0), w = Math.min(k * m, s.w * 0.45), g = w / m, M = Math.min(y, Math.ceil(n.length / m)), C = d !== "l";
    p = {
      x: C ? s.x + s.w - w : s.x,
      y: s.y,
      w,
      h: s.h
    }, t.legendOverlay || (h = C ? { x: s.x, y: s.y, w: s.w - w, h: s.h } : { x: s.x + w, y: s.y, w: s.w - w, h: s.h });
    const P = M * c, $ = d === "tr" ? p.y : p.y + Math.max((p.h - P) / 2, 0);
    for (let A = 0; A < n.length && A < M * m; A++) {
      const D = Math.floor(A / M), N = A % M;
      L(n[A], p.x + D * g, $ + N * c, Math.max(g - i - u - l * 0.2, l));
    }
  }
  return { els: e, region: h };
}
function Dn(t) {
  let n = [], s = 0;
  for (const l of t)
    for (const i of l.series)
      i.vals.length > s && (s = i.vals.length), i.cats.length > n.length && (n = i.cats);
  const o = Math.max(s, n.length), e = [];
  for (let l = 0; l < o; l++) e.push(n[l] ?? String(l + 1));
  return e;
}
function yt(t, n, s, o) {
  if (!n) return t;
  const e = n.x !== null ? n.x * s : t.x, l = n.y !== null ? n.y * o : t.y, i = n.w !== null ? n.w * s : t.w, r = n.h !== null ? n.h * o : t.h;
  return !(i > 4) || !(r > 4) || !Number.isFinite(e) || !Number.isFinite(l) ? t : { x: e, y: l, w: i, h: r };
}
const Tn = (t) => {
  for (const n of t) for (const s of n.series) if (s.fmt) return s.fmt;
  return null;
};
function Qs(t, n, s, o) {
  const e = ms(t, o.ctx), l = [o.fonts.minor.latin, o.fonts.minor.ea].filter(($) => !!$), i = [], r = e.fill ?? U("rgb(255,255,255)"), c = Q(e.ln, null, 0);
  (r.type !== "none" || c) && i.push(St({ x: 0, y: 0, w: n, h: s }, r.type === "none" ? null : r, c));
  const u = e.groups.filter(($) => $.series.length > 0), a = u.filter(
    ($) => $.kind === "bar" || $.kind === "line" || $.kind === "area" || $.kind === "stock"
  ), f = u.filter(($) => Mn($.kind)), d = u.filter(($) => $.kind === "pie" || $.kind === "doughnut"), x = u.filter(($) => $.kind === "ofPie"), p = u.filter(($) => $.kind === "radar"), h = u.filter(($) => $.kind === "surface"), L = e.unsupported.slice();
  if (!a.length && !f.length && !d.length && !p.length && !x.length && !h.length) {
    const $ = L.length ? Array.from(new Set(L)).join("/") : "未知类型";
    return i.concat([ln(n, s, `不支持的图表类型: ${$}`)]);
  }
  const y = Math.min(e.textSize * 0.55, Math.min(n, s) * 0.06);
  let m = { x: y, y, w: Math.max(n - y * 2, 8), h: Math.max(s - y * 2, 8) };
  if (e.title) {
    const $ = e.titleSize, A = Math.min(H($) + e.textSize * 0.5, m.h * 0.3);
    i.push(
      st(m.x, m.y, m.w, A, e.title, {
        size: $,
        bold: e.titleBold,
        color: e.titleColor ?? e.textColor,
        align: "center",
        anchor: "middle",
        fonts: l
      })
    ), m = { x: m.x, y: m.y + A, w: m.w, h: Math.max(m.h - A, 8) };
  }
  const k = a.length ? u.filter(($) => a.includes($) || f.includes($)) : f.length ? f : p.length ? p : h.length ? h : x.length ? x : d, w = Dn(a.length ? a : k), g = h.length && h.length === u.length ? [] : Ks(e, k, w, o.ctx), M = Js(e, g, m, l);
  m = M.region, e.plotLayout && e.plotLayout.target !== "inner" && (m = yt(m, e.plotLayout, n, s));
  const C = { ctx: o.ctx, fonts: l, size: e.textSize, color: e.textColor, cats: w }, P = [];
  if (a.length ? P.push(...so(e, a, w, m, n, s, l, C, f)) : f.length ? P.push(...oo(e, f, m, n, s, l, C)) : p.length ? P.push(...io(e, p, m, n, s, C)) : h.length ? P.push(...eo(e, h, m, n, s, C)) : x.length ? P.push(...lo(e, x, m, n, s, C)) : P.push(...ao(e, d, m, n, s, C)), i.push(...P, ...M.els), L.length) {
    const $ = Array.from(new Set(L)).join("/"), A = e.textSize * 0.9;
    i.push(
      st(m.x, m.y + m.h - H(A), m.w, H(A), `未渲染: ${$}`, {
        size: A,
        color: e.textColor,
        align: "right",
        anchor: "middle",
        fonts: l
      })
    );
  }
  return i;
}
function to(t, n) {
  return t.crosses === "max" ? !0 : n ? t.pos === "t" : t.pos === "r";
}
function no(t, n, s) {
  const o = /* @__PURE__ */ new Map();
  for (const d of t.axes) d.id && o.set(d.id, d);
  const e = t.axes.find((d) => d.kind === "cat" || d.kind === "date") ?? Et("cat"), l = t.axes.find((d) => d.kind === "val") ?? Et("val"), i = [], r = /* @__PURE__ */ new Map();
  for (const d of n) {
    let x = null, p = null;
    for (const y of d.axIds) {
      const m = o.get(y);
      m && (m.kind === "val" ? p || (p = m) : (m.kind === "cat" || m.kind === "date") && (x || (x = m)));
    }
    const h = p && p.id || "v#";
    let L = r.get(h);
    L || (L = { cat: x ?? e, val: p ?? l, groups: [] }, r.set(h, L), i.push(h)), L.groups.push(d);
  }
  if (!i.length) return { primary: { cat: e, val: l, groups: n }, secondary: null };
  if (i.length === 1) return { primary: r.get(i[0]), secondary: null };
  let c = i.findIndex((d) => !to(r.get(d).val, s));
  c < 0 && (c = 0);
  const u = r.get(i[c]), a = i.filter((d, x) => x !== c).map((d) => r.get(d)), f = { cat: a[0].cat, val: a[0].val, groups: a.flatMap((d) => d.groups) };
  return { primary: u, secondary: f };
}
function so(t, n, s, o, e, l, i, r, c) {
  const u = n.some((I) => I.kind === "bar" && I.barDir === "bar"), { primary: a, secondary: f } = no(t, n, u), d = a.cat, x = u ? d.pos === "r" ? "r" : "l" : d.pos === "t" ? "t" : "b", p = u ? a.val.pos === "t" ? "t" : "b" : a.val.pos === "r" ? "r" : "l", h = u ? p === "b" ? "t" : "b" : p === "l" ? "r" : "l", L = u ? o.w : o.h, y = jt(L, t.textSize), m = En(t, c, o, n), k = (I, K) => {
    const et = I.groups.some((tt) => tt.grouping === "percentStacked") ? "0%" : Tn(I.groups);
    return Fn(I.val, K, m.extent(I.val, Bt(I.groups)), y, et, t);
  }, w = k(a, p), g = f ? k(f, h) : null, M = n.some((I) => I.kind === "bar"), C = n.every((I) => I.kind === "area"), P = M ? !0 : C ? !1 : d.crossBetween !== "midCat", $ = ks(d, x, s, P, t), A = u ? w : $, D = u ? $ : w, N = m.axes(g ? [w, g] : [w]);
  let F = Zt(o, Ht(t, N, Ut(t, A, D, !1, g))), T = !1;
  if (!u && s.length) {
    const I = P ? F.w / Math.max(s.length, 1) : F.w / Math.max(s.length - 1, 1);
    T = Cs($, I), T && (F = Zt(o, Ht(t, N, Ut(t, A, D, !0, g))));
  }
  t.plotLayout && t.plotLayout.target === "inner" && (F = yt(F, t.plotLayout, e, l));
  const z = n.some((I) => I.is3D);
  let v = null;
  z && (v = bs(t.view3D, F), F = ys(F, v));
  const E = hn(F, u, $, w), j = g ? hn(F, u, $, g) : null, R = P ? s.length + 1 : s.length, B = u ? {
    rect: F,
    hAxis: w,
    vAxis: $,
    hPos: (I) => E.val(w.ticks[I] ?? 0),
    vPos: (I) => E.cat(I),
    hEdge: null,
    hEdgeCount: 0,
    vEdge: (I) => E.edge(I),
    vEdgeCount: R,
    hLineAt: p === "t" ? F.y : F.y + F.h,
    vLineAt: E.zero,
    hWrap: !1,
    hBand: 0,
    depth: v
  } : {
    rect: F,
    hAxis: $,
    vAxis: w,
    hPos: (I) => E.cat(I),
    vPos: (I) => E.val(w.ticks[I] ?? 0),
    hEdge: (I) => E.edge(I),
    hEdgeCount: R,
    vEdge: null,
    vEdgeCount: 0,
    hLineAt: E.zero,
    vLineAt: p === "r" ? F.x + F.w : F.x,
    hWrap: T,
    hBand: E.band,
    depth: v
  }, O = [];
  if (O.push(...zt(t, F)), v && O.push(...gs(F, v, t.textColor)), O.push(...on(t, B, i)), g && j) {
    const I = h === "l" || h === "r";
    O.push(
      ...Ss(
        t,
        {
          rect: F,
          view: g,
          pos: (K) => j.val(g.ticks[K] ?? 0),
          at: I ? h === "r" ? F.x + F.w : F.x : h === "t" ? F.y : F.y + F.h,
          grid: !w.axis.majorGrid && !!g.axis.majorGrid,
          depth: v
        },
        i
      )
    );
  }
  const Pt = (I) => {
    const K = /* @__PURE__ */ new Map();
    let et = 0;
    for (const tt of I)
      K.set(tt, et), et += Tt(tt) ? 1 : tt.series.length;
    return (tt) => ({ base: K.get(tt) ?? 0, total: Math.max(et, 1) });
  }, gt = (I, K) => {
    const et = I.groups.filter((Y) => Y.kind === "bar"), tt = Pt(et);
    for (const Y of I.groups) Y.kind === "area" && O.push(...Es(Y, K, r));
    for (const Y of et) O.push(...As(Y, K, tt(Y), r, Y.is3D ? v : null));
    for (const Y of I.groups) Y.kind === "line" && O.push(...Ns(Y, K, r));
    for (const Y of I.groups) Y.kind === "stock" && O.push(...Ts(Y, K, r));
  }, wt = In(t, N, F, i, r, /* @__PURE__ */ new Set([a.cat, a.val, ...f ? [f.val] : []]));
  return O.push(...wt.axes), gt(a, E), f && j && gt(f, j), O.push(...wt.plots), O;
}
function oo(t, n, s, o, e, l, i) {
  const r = En(t, n, s).axes();
  let c = Zt(s, Ht(t, r, { l: 0, r: 0, t: 0, b: 0 }));
  t.plotLayout && t.plotLayout.target === "inner" && (c = yt(c, t.plotLayout, o, e));
  const u = In(t, r, c, l, i);
  return [...zt(t, c), ...u.axes, ...u.plots];
}
function eo(t, n, s, o, e, l) {
  let i = s;
  t.plotLayout && (i = yt(i, t.plotLayout, o, e));
  const r = Bt(n), c = nn(r.lo, r.hi, jt(i.h, t.textSize)), u = Math.max(2, Math.min(Math.round((c.max - c.min) / c.step), 12)), a = t.axes.find((x) => x.kind === "val"), f = {
    rect: i,
    min: c.min,
    max: c.max,
    bands: u,
    fmt: (a == null ? void 0 : a.fmt) ?? Tn(n)
  }, d = zt(t, i);
  for (const x of n) d.push(...Xs(x, f, l));
  return d;
}
function lo(t, n, s, o, e, l) {
  let i = s;
  t.plotLayout && (i = yt(i, t.plotLayout, o, e));
  const r = zt(t, i);
  for (const c of n) r.push(...Gs(c, i, l));
  return r;
}
function io(t, n, s, o, e, l) {
  var A, D;
  let i = s;
  t.plotLayout && (i = yt(i, t.plotLayout, o, e));
  const r = Dn(n), c = Math.max(r.length, ((D = (A = n[0]) == null ? void 0 : A.series[0]) == null ? void 0 : D.vals.length) ?? 0);
  if (c < 3) return [ln(o, e, "雷达图至少需要 3 个类目")];
  const u = Bt(n), a = nn(Math.min(u.lo, 0), u.hi, jt(Math.min(i.w, i.h), t.textSize)), f = a.max - a.min || 1, d = t.textSize * 4, x = Math.max(Math.min(i.w, i.h) - d, 24), p = i.x + i.w / 2, h = i.y + i.h / 2, L = {
    cx: p,
    cy: h,
    radius: x / 2,
    norm: (N) => ro((N - a.min) / f),
    angle: (N) => N * Math.PI * 2 / c,
    count: c
  }, y = [];
  for (let N = a.min; N <= a.max + a.step * 0.5; N += a.step) y.push(co(N));
  const m = t.axes.find((N) => N.kind === "val"), k = t.axes.find((N) => N.kind === "cat"), w = J(t.textColor, "rgb(255,255,255)", 0.72), g = J(t.textColor, "rgb(255,255,255)", 0.55), M = Q((m == null ? void 0 : m.majorGrid) ?? null, w, 1) ?? { color: w, width: 1, dash: null }, C = Q((k == null ? void 0 : k.line) ?? null, g, 1) ?? { color: g, width: 1, dash: null }, P = (m == null ? void 0 : m.fmt) ?? null, $ = Us(L, y, l, M, C, (N) => pt(N, P));
  for (const N of n) $.push(...Zs(N, L, l));
  return $;
}
const ro = (t) => Number.isFinite(t) ? Math.max(0, Math.min(1, t)) : 0, co = (t) => Number(t.toPrecision(12));
function ao(t, n, s, o, e, l) {
  let i = s;
  t.plotLayout && (i = yt(i, t.plotLayout, o, e));
  const r = Math.max(Math.min(i.w, i.h), 8), c = {
    x: i.x + (i.w - r) / 2,
    y: i.y + (i.h - r) / 2,
    w: r,
    h: r
  }, u = [];
  u.push(...zt(t, i));
  for (const a of n) u.push(...a.is3D ? Vs(a, i, l) : Rs(a, c, l));
  return u;
}
function zt(t, n) {
  const s = Q(t.plotLn, null, 0), o = t.plotFill && t.plotFill.type !== "none" ? t.plotFill : null;
  return !o && !s ? [] : [St(n, o, s)];
}
function fo(t, n, s, o) {
  return Hs(Vn(t), n, s, o);
}
export {
  fo as renderChartXml
};
