const lt = /* @__PURE__ */ new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"]
]);
class Yt {
  constructor(n) {
    this.namespaceURI = null, this.attributes = [], this.childNodes = [], this.nextElementSibling = null, this.namespaceBindings = lt, this.tagName = n;
    const r = n.indexOf(":");
    this.prefix = r < 0 ? null : n.slice(0, r), this.localName = r < 0 ? n : n.slice(r + 1);
  }
  resolveNamespaces(n) {
    let r;
    for (const e of this.attributes)
      e.name === "xmlns" ? (r ?? (r = new Map((n == null ? void 0 : n.namespaceBindings) ?? lt))).set("", e.value) : e.prefix === "xmlns" && (r ?? (r = new Map((n == null ? void 0 : n.namespaceBindings) ?? lt))).set(e.localName, e.value);
    this.namespaceBindings = r ?? (n == null ? void 0 : n.namespaceBindings) ?? lt, this.namespaceURI = this.lookupNamespaceURI(this.prefix);
    for (const e of this.attributes)
      e.name === "xmlns" || e.prefix === "xmlns" ? e.namespaceURI = "http://www.w3.org/2000/xmlns/" : e.prefix && (e.namespaceURI = this.lookupNamespaceURI(e.prefix));
  }
  get firstElementChild() {
    for (const n of this.childNodes) if (typeof n != "string") return n;
    return null;
  }
  get children() {
    return this.childNodes.filter((n) => typeof n != "string");
  }
  getAttribute(n) {
    for (const r of this.attributes) if (r.name === n) return r.value;
    return null;
  }
  lookupNamespaceURI(n) {
    const r = n ?? "";
    return this.namespaceBindings.get(r) || null;
  }
  get textContent() {
    let n = "";
    for (const r of this.childNodes) n += typeof r == "string" ? r : r.textContent;
    return n;
  }
  /** 只支持 '*'，与解析器里的用法一致 */
  getElementsByTagName(n) {
    const r = [], e = (o) => {
      for (const i of o.children)
        (n === "*" || i.localName === n || i.tagName === n) && r.push(i), e(i);
    };
    return e(this), r;
  }
}
const Gt = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function yt(t) {
  return t.indexOf("&") < 0 ? t : t.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (n, r) => {
    if (r[0] === "#") {
      const e = r[1] === "x" || r[1] === "X" ? parseInt(r.slice(2), 16) : parseInt(r.slice(1), 10);
      return Number.isFinite(e) && e >= 0 ? String.fromCodePoint(e) : n;
    }
    return Gt[r] ?? n;
  });
}
function Qt(t) {
  let n = 0;
  const r = t.length, e = [];
  let o = null;
  const i = (s, c) => {
    const l = s.children;
    l.length && (l[l.length - 1].nextElementSibling = c), s.childNodes.push(c);
  };
  for (; n < r; ) {
    const s = t.indexOf("<", n);
    if (s < 0) break;
    if (s > n) {
      const h = t.slice(n, s);
      e.length && h.trim() ? e[e.length - 1].childNodes.push(yt(h)) : e.length && h.includes(" ") && e[e.length - 1].childNodes.push(h);
    }
    if (t.startsWith("<!--", s)) {
      const h = t.indexOf("-->", s + 4);
      n = h < 0 ? r : h + 3;
      continue;
    }
    if (t.startsWith("<![CDATA[", s)) {
      const h = t.indexOf("]]>", s + 9), S = t.slice(s + 9, h < 0 ? r : h);
      e.length && e[e.length - 1].childNodes.push(S), n = h < 0 ? r : h + 3;
      continue;
    }
    if (t.startsWith("<?", s) || t.startsWith("<!", s)) {
      const h = t.indexOf(">", s);
      n = h < 0 ? r : h + 1;
      continue;
    }
    if (t[s + 1] === "/") {
      const h = t.indexOf(">", s);
      if (h < 0) break;
      e.pop(), n = h + 1;
      continue;
    }
    let c = s + 1, l = "";
    for (; c < r; ) {
      const h = t[c];
      if (l)
        h === l && (l = "");
      else if (h === '"' || h === "'") l = h;
      else if (h === ">") break;
      c++;
    }
    if (c >= r) break;
    const u = t[c - 1] === "/", d = t.slice(s + 1, u ? c - 1 : c);
    let $ = 0;
    for (; $ < d.length && !/[\s/]/.test(d[$]); ) $++;
    const g = new Yt(d.slice(0, $)), b = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    b.lastIndex = $;
    let C;
    for (; (C = b.exec(d)) !== null; ) {
      const h = C[1], S = h.indexOf(":");
      g.attributes.push({
        name: h,
        localName: S < 0 ? h : h.slice(S + 1),
        prefix: S < 0 ? null : h.slice(0, S),
        namespaceURI: null,
        value: yt(C[3] ?? C[4] ?? "")
      });
    }
    g.resolveNamespaces(e[e.length - 1]), e.length ? i(e[e.length - 1], g) : o || (o = g), u || e.push(g), n = c + 1;
  }
  if (!o) throw new Error("XML 解析失败：未找到根元素");
  return o;
}
const Pt = typeof DOMParser < "u" ? new DOMParser() : null;
function Ct(t) {
  if (!Pt)
    return Qt(t);
  const n = Pt.parseFromString(t, "application/xml"), r = n.getElementsByTagName("parsererror")[0];
  if (r) throw new Error("XML 解析失败: " + (r.textContent ?? "").slice(0, 200));
  return n.documentElement;
}
function Z(t, n) {
  const r = [];
  if (!t) return r;
  for (let e = t.firstElementChild; e; e = e.nextElementSibling)
    e.localName === n && r.push(e);
  return r;
}
function m(t, n) {
  if (!t) return null;
  for (let r = t.firstElementChild; r; r = r.nextElementSibling)
    if (r.localName === n) return r;
  return null;
}
function M(t, n) {
  if (!t) return null;
  if (n.includes(":")) {
    for (const o of Array.from(t.attributes)) if (o.name === n) return o.value;
    const e = n.split(":")[1];
    for (const o of Array.from(t.attributes)) if (o.localName === e) return o.value;
    return null;
  }
  const r = t.getAttribute(n);
  if (r !== null) return r;
  for (const e of Array.from(t.attributes)) if (e.localName === n) return e.value;
  return null;
}
function j(t, n) {
  const r = M(t, n);
  if (r === null || r === "") return null;
  const e = Number(r);
  return Number.isFinite(e) ? e : null;
}
function Mt(t, n, r = !1) {
  const e = M(t, n);
  return e === null ? r : e === "1" || e === "true";
}
const X = (t) => (t ?? 0) / 9525, rt = (t) => t / 100 * (96 / 72), Vt = new RegExp("[" + [
  "Arabic",
  "Hebrew",
  "Syriac",
  "Thaana",
  "Nko",
  "Thai",
  "Lao",
  "Khmer",
  "Myanmar",
  "Tibetan",
  "Devanagari",
  "Bengali",
  "Gurmukhi",
  "Gujarati",
  "Oriya",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Sinhala"
].map((t) => `\\p{Script=${t}}`).join("") + "]", "u");
function Kt(t, n) {
  const { latin: r, eastAsian: e, complexScript: o } = t, i = [];
  return r && i.push(r), e && e !== r && i.push(e), o && o !== r && o !== e && Vt.test(n) && i.push(o), i;
}
const T = {
  b: 1,
  i: 2,
  u: 4,
  strike: 8,
  size: 16,
  color: 64,
  baseline: 128,
  spacing: 256,
  caps: 512,
  outline: 1024,
  gradient: 2048,
  highlight: 4096,
  underlineColor: 8192,
  fontLatin: 16384,
  fontEastAsian: 32768,
  fontComplexScript: 65536
}, at = {
  bullet: 1,
  bulletColor: 2,
  bulletFont: 4,
  bulletSize: 8,
  rtl: 16
};
const Nt = 1.2, Jt = Object.freeze([
  "none",
  "words",
  "sng",
  "dbl",
  "heavy",
  "dotted",
  "dottedHeavy",
  "dash",
  "dashHeavy",
  "dashLong",
  "dashLongHeavy",
  "dotDash",
  "dotDashHeavy",
  "dotDotDash",
  "dotDotDashHeavy",
  "wavy",
  "wavyHeavy",
  "wavyDbl"
]), wt = Object.freeze(["noStrike", "sngStrike", "dblStrike"]), tn = { window: "FFFFFF", windowText: "000000" }, nn = {
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
}, en = ["srgbClr", "schemeClr", "sysClr", "prstClr", "scrgbClr", "hslClr"];
function Y(t, n) {
  if (!t) return null;
  for (const r of en) {
    const e = m(t, r);
    if (e) return rn(e, n);
  }
  return null;
}
function rn(t, n) {
  let r = on(t, n), e = 1;
  for (let c = t.firstElementChild; c; c = c.nextElementSibling) {
    const l = (j(c, "val") ?? 0) / 1e5;
    switch (c.localName) {
      case "alpha":
        e = l;
        break;
      case "shade":
        r = It(r, (u) => u * l);
        break;
      case "tint":
        r = It(r, (u) => u * l + (1 - l));
        break;
      case "lumMod":
        r = Lt(r, (u, d, $) => [u, d, $ * l]);
        break;
      case "lumOff":
        r = Lt(r, (u, d, $) => [u, d, $ + l]);
        break;
      case "satMod":
        r = Lt(r, (u, d, $) => [u, d * l, $]);
        break;
    }
  }
  const [o, i, s] = r.map((c) => Math.round(bt(c, 0, 255)));
  return e >= 1 ? `rgb(${o},${i},${s})` : `rgba(${o},${i},${s},${Math.round(e * 1e3) / 1e3})`;
}
function on(t, n) {
  switch (t.localName) {
    case "srgbClr":
      return it(M(t, "val") ?? "000000");
    case "sysClr":
      return it(M(t, "lastClr") ?? tn[M(t, "val") ?? ""] ?? "000000");
    case "prstClr":
      return it(nn[M(t, "val") ?? ""] ?? "808080");
    case "scrgbClr":
      return [
        (j(t, "r") ?? 0) / 1e5 * 255,
        (j(t, "g") ?? 0) / 1e5 * 255,
        (j(t, "b") ?? 0) / 1e5 * 255
      ];
    case "hslClr":
      return Ut(
        (j(t, "hue") ?? 0) / 6e4 / 360,
        (j(t, "sat") ?? 0) / 1e5,
        (j(t, "lum") ?? 0) / 1e5
      );
    case "schemeClr": {
      const r = M(t, "val") ?? "tx1";
      if (r === "phClr") return n.phClr ? an(n.phClr) : [128, 128, 128];
      const e = n.clrMap[r] ?? r;
      return it(n.theme[e] ?? n.theme[r] ?? "000000");
    }
  }
  return [0, 0, 0];
}
function an(t) {
  const n = t.match(/rgba?\(([^)]+)\)/);
  if (n) {
    const r = n[1].split(",").map((e) => Number(e.trim()));
    return [r[0] || 0, r[1] || 0, r[2] || 0];
  }
  return it(t);
}
function it(t) {
  const n = t.replace("#", "").padStart(6, "0");
  return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0];
}
function bt(t, n, r) {
  return Math.min(r, Math.max(n, t));
}
const sn = (t) => {
  const n = t / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}, cn = (t) => {
  const n = bt(t, 0, 1);
  return (n <= 31308e-7 ? n * 12.92 : 1.055 * n ** (1 / 2.4) - 0.055) * 255;
};
function It(t, n) {
  return t.map((r) => cn(n(sn(r))));
}
function Lt(t, n) {
  const [r, e, o] = ln(t), [i, s, c] = n(r, e, o);
  return Ut(i, bt(s, 0, 1), bt(c, 0, 1));
}
function ln([t, n, r]) {
  t /= 255, n /= 255, r /= 255;
  const e = Math.max(t, n, r), o = Math.min(t, n, r), i = (e + o) / 2;
  if (e === o) return [0, 0, i];
  const s = e - o, c = i > 0.5 ? s / (2 - e - o) : s / (e + o);
  let l;
  return e === t ? l = (n - r) / s + (n < r ? 6 : 0) : e === n ? l = (r - t) / s + 2 : l = (t - n) / s + 4, [l / 6, c, i];
}
function Ut(t, n, r) {
  if (n === 0) return [r * 255, r * 255, r * 255];
  const e = r < 0.5 ? r * (1 + n) : r + n - r * n, o = 2 * r - e, i = (s) => (s < 0 && (s += 1), s > 1 && (s -= 1), s < 1 / 6 ? o + (e - o) * 6 * s : s < 1 / 2 ? e : s < 2 / 3 ? o + (e - o) * (2 / 3 - s) * 6 : o);
  return [i(t + 1 / 3) * 255, i(t) * 255, i(t - 1 / 3) * 255];
}
function O(t, n) {
  const r = m(t, n);
  return r ? M(r, "val") : null;
}
function un(t) {
  if (!t) return "";
  let n = "";
  for (const r of Z(t, "t")) n += r.textContent ?? "";
  return n;
}
function pt(t, n = 12) {
  let r = "";
  for (let e = t.firstElementChild; e; e = e.nextElementSibling)
    e.localName === "t" ? r += e.textContent ?? "" : n > 0 && (r += pt(e, n - 1));
  return r;
}
function k(t, n, r) {
  const e = m(t, n);
  return e ? K(e, r) : [];
}
function K(t, n) {
  const r = [];
  for (let e = t.firstElementChild; e; e = e.nextElementSibling) {
    const o = dn(e, n);
    o && r.push(...o);
  }
  return r;
}
function dn(t, n) {
  if (n <= 0) {
    const e = pt(t);
    return e ? [{ kind: "run", text: e }] : null;
  }
  const r = n - 1;
  switch (t.localName) {
    case "r": {
      const e = un(t);
      if (!e) return null;
      const o = O(m(t, "rPr"), "sty");
      return [{ kind: "run", text: e, sty: o === "p" || o === "b" || o === "bi" ? o : "i" }];
    }
    case "f": {
      const e = O(m(t, "fPr"), "type");
      return [{
        kind: "frac",
        num: k(t, "num", r),
        den: k(t, "den", r),
        type: e === "noBar" || e === "skw" || e === "lin" ? e : "bar"
      }];
    }
    case "rad": {
      const e = O(m(t, "radPr"), "degHide");
      return [{
        kind: "rad",
        deg: e === "1" || e === "on" || e === "true" ? [] : k(t, "deg", r),
        base: k(t, "e", r)
      }];
    }
    case "sSup":
      return [{ kind: "script", base: k(t, "e", r), sup: k(t, "sup", r) }];
    case "sSub":
      return [{ kind: "script", base: k(t, "e", r), sub: k(t, "sub", r) }];
    case "sSubSup":
      return [{ kind: "script", base: k(t, "e", r), sub: k(t, "sub", r), sup: k(t, "sup", r) }];
    case "sPre":
      return [{ kind: "script", base: [], sub: k(t, "sub", r), sup: k(t, "sup", r) }, ...k(t, "e", r)];
    case "nary": {
      const e = m(t, "naryPr"), o = O(e, "limLoc"), i = O(e, "chr") ?? "∫", s = O(e, "subHide") === "1", c = O(e, "supHide") === "1";
      return [{
        kind: "nary",
        chr: i,
        sub: s ? [] : k(t, "sub", r),
        sup: c ? [] : k(t, "sup", r),
        base: k(t, "e", r),
        // 求和 / 连乘默认上下限在正上下，积分默认在右侧
        underOver: o ? o === "undOvr" : i !== "∫" && i !== "∮" && i !== "∬" && i !== "∭"
      }];
    }
    case "d": {
      const e = m(t, "dPr"), o = Z(t, "e").map((i) => K(i, r));
      return [{
        kind: "delim",
        beg: O(e, "begChr") ?? "(",
        end: O(e, "endChr") ?? ")",
        sep: O(e, "sepChr") ?? ",",
        items: o.length ? o : [[]]
      }];
    }
    case "m":
      return [{
        kind: "matrix",
        rows: Z(t, "mr").map((e) => Z(e, "e").map((o) => K(o, r)))
      }];
    case "acc":
      return [{ kind: "acc", chr: O(m(t, "accPr"), "chr") ?? "̂", base: k(t, "e", r) }];
    case "bar": {
      const e = O(m(t, "barPr"), "pos");
      return [{ kind: "acc", chr: "̅", base: k(t, "e", r), below: e === "bot" }];
    }
    case "groupChr": {
      const e = m(t, "groupChrPr"), o = O(e, "pos");
      return [{ kind: "acc", chr: O(e, "chr") ?? "⏟", base: k(t, "e", r), below: o !== "top" }];
    }
    case "limLow":
      return [{ kind: "lim", base: k(t, "e", r), limit: k(t, "lim", r), below: !0 }];
    case "limUpp":
      return [{ kind: "lim", base: k(t, "e", r), limit: k(t, "lim", r), below: !1 }];
    case "func":
      return [...k(t, "fName", r), { kind: "run", text: " " }, ...k(t, "e", r)];
    case "eqArr":
      return [{ kind: "stack", rows: Z(t, "e").map((e) => K(e, r)) }];
    case "box":
    case "borderBox":
    case "e":
    case "oMath":
      return K(t, r);
    case "phant":
      return [{ kind: "run", text: " ".repeat(Math.max(1, pt(t).length)), sty: "p" }];
    case "rPr":
    case "ctrlPr":
    case "argPr":
    case "fPr":
    case "radPr":
    case "naryPr":
    case "dPr":
    case "mPr":
    case "accPr":
    case "barPr":
    case "groupChrPr":
    case "limLowPr":
    case "limUppPr":
    case "funcPr":
    case "eqArrPr":
    case "boxPr":
    case "phantPr":
    case "sSupPr":
    case "sSubPr":
    case "sSubSupPr":
    case "sPrePr":
      return null;
    default: {
      const e = K(t, r);
      if (e.length) return e;
      const o = pt(t);
      return o ? [{ kind: "run", text: o }] : null;
    }
  }
}
function fn(t) {
  if (t.localName === "oMathPara") {
    const n = Z(t, "oMath").map((r) => K(r, 16));
    return n.length > 1 ? [{ kind: "stack", rows: n }] : n[0] ?? [];
  }
  return K(t, 16);
}
function R(t) {
  var r, e;
  let n = "";
  for (const o of t)
    switch (o.kind) {
      case "run":
        n += o.text;
        break;
      case "frac":
        n += `${R(o.num)}/${R(o.den)}`;
        break;
      case "rad":
        n += `√(${R(o.base)})`;
        break;
      case "script":
        n += R(o.base), (r = o.sub) != null && r.length && (n += `_${R(o.sub)}`), (e = o.sup) != null && e.length && (n += `^${R(o.sup)}`);
        break;
      case "nary":
        n += o.chr, o.sub.length && (n += `_${R(o.sub)}`), o.sup.length && (n += `^${R(o.sup)}`), n += R(o.base);
        break;
      case "delim":
        n += o.beg + o.items.map((i) => R(i)).join(o.sep) + o.end;
        break;
      case "matrix":
        n += o.rows.map((i) => i.map((s) => R(s)).join(" ")).join("; ");
        break;
      case "acc":
        n += R(o.base) + o.chr;
        break;
      case "lim":
        n += `${R(o.base)}(${R(o.limit)})`;
        break;
      case "stack":
        n += o.rows.map((i) => R(i)).join(" ");
        break;
    }
  return n;
}
const $n = {
  l: "left",
  ctr: "center",
  r: "right",
  just: "justify",
  dist: "justify"
};
function Ft(t, n) {
  const r = { ...t, ...n, rp: { ...t.rp, ...n.rp } };
  return n.lnPct !== void 0 && delete r.lnPx, n.lnPx !== void 0 && delete r.lnPct, n.buSizePct !== void 0 && delete r.buSizePts, n.buSizePts !== void 0 && delete r.buSizePct, r;
}
function mn(t, n) {
  let r = { rp: {} };
  for (const e of t) {
    e.def && (r = Ft(r, e.def));
    const o = e.lvls[n];
    o && (r = Ft(r, o));
  }
  return r;
}
function Tt(t, n, r) {
  let e = t.lnPct !== void 0 ? t.lnPct * Nt : null;
  return e === null && t.lnPx && (e = t.lnPx / n), r && (e = Math.max(0.5, (e ?? Nt) - r)), {
    align: $n[t.algn ?? "l"] ?? "left",
    lineHeight: e,
    spaceBefore: t.spcBef ?? 0,
    spaceAfter: t.spcAft ?? 0,
    marginLeft: t.marL ?? 0,
    indent: t.indent ?? 0
  };
}
function pn(t) {
  return {
    ...t.lvl !== void 0 ? { level: !0 } : {},
    ...t.algn !== void 0 ? { align: !0 } : {},
    ...t.lnPct !== void 0 || t.lnPx !== void 0 ? { lineHeight: !0 } : {},
    ...t.spcBef !== void 0 ? { spaceBefore: !0 } : {},
    ...t.spcAft !== void 0 ? { spaceAfter: !0 } : {},
    ...t.marL !== void 0 ? { marginLeft: !0 } : {},
    ...t.indent !== void 0 ? { indent: !0 } : {}
  };
}
function Rt(t) {
  let n = "", r = t;
  for (; r > 0; )
    n = String.fromCharCode(65 + (r - 1) % 26) + n, r = Math.floor((r - 1) / 26);
  return n;
}
function Et(t) {
  const n = [
    [1e3, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let r = "", e = t;
  for (const [o, i] of n)
    for (; e >= o; )
      r += i, e -= o;
  return r;
}
function gn(t, n) {
  let r;
  return t.startsWith("alphaLc") ? r = Rt(n).toLowerCase() : t.startsWith("alphaUc") ? r = Rt(n) : t.startsWith("romanLc") ? r = Et(n).toLowerCase() : t.startsWith("romanUc") ? r = Et(n) : t.startsWith("circleNum") ? r = n >= 1 && n <= 20 ? String.fromCharCode(9312 + n - 1) : String(n) : r = String(n), t.endsWith("ParenBoth") ? `(${r})` : t.endsWith("ParenR") ? `${r})` : t.endsWith("Period") ? `${r}.` : r;
}
const Mn = {
  "": "▪",
  "": "•",
  "": "➢",
  "": "✓",
  "": "●",
  "": "◆",
  "": "□",
  "": "❖",
  "§": "▪",
  n: "▪",
  l: "●",
  u: "◆",
  p: "❑",
  v: "❖",
  w: "♦",
  Ø: "➢",
  ü: "✓",
  F: "☞",
  q: "❑"
};
function bn(t, n, r) {
  if ((!t || t.kind !== "auto") && (n.length = r + 1, delete n[r]), !t || t.kind === "none" || t.kind === "image") return null;
  if (t.kind === "char") {
    const e = Mn[t.char];
    return e || (t.font && /wingdings|webdings|symbol/i.test(t.font) ? "•" : t.char);
  }
  return n.length = r + 1, n[r] = (n[r] ?? t.startAt - 1) + 1, gn(t.scheme, n[r]);
}
function Bt(t, n) {
  const r = t.bullet;
  if (!r || r.kind === "none") return { kind: "none" };
  const e = {
    ...t.buColor !== void 0 ? { color: t.buColor } : {},
    ...t.buFont !== void 0 ? { font: t.buFont } : {},
    ...t.buSizePts !== void 0 ? { size: { kind: "points", value: t.buSizePts * 0.75 } } : t.buSizePct !== void 0 ? { size: t.buSizePct === null ? null : { kind: "percent", value: t.buSizePct } } : {}
  };
  return r.kind === "char" ? {
    kind: "char",
    char: r.char,
    ...r.font && e.font === void 0 ? { font: r.font } : {},
    ...e
  } : r.kind === "auto" ? { kind: "autoNum", type: r.scheme, startAt: r.startAt, ...e } : {
    kind: "image",
    rid: r.rid,
    src: (n == null ? void 0 : n(r.rid)) ?? null,
    ...e
  };
}
function hn(t) {
  let n = 0;
  return t.bullet !== void 0 && (n |= at.bullet), t.buColor !== void 0 && (n |= at.bulletColor), t.buFont !== void 0 && (n |= at.bulletFont), (t.buSizePct !== void 0 || t.buSizePts !== void 0) && (n |= at.bulletSize), t.rtl !== void 0 && (n |= at.rtl), n;
}
function Cn(t) {
  var b, C;
  const {
    lvl: n,
    resolved: r,
    inherited: e,
    direct: o,
    directRun: i,
    runs: s,
    counters: c,
    lnSpcReduction: l,
    env: u
  } = t, d = Math.max(...s.map((h) => h.size), 1), $ = Tt(r, d, l), g = ((b = r.bullet) == null ? void 0 : b.kind) === "image" && u.resolveImage ? u.resolveImage(r.bullet.rid) : null;
  return {
    align: $.align,
    lvl: n,
    marL: $.marginLeft,
    indent: $.indent,
    bullet: bn(r.bullet, c, n),
    lineHeight: $.lineHeight,
    spaceBefore: $.spaceBefore,
    spaceAfter: $.spaceAfter,
    runs: s,
    bulletColor: r.buColor ?? null,
    bulletFont: r.buFont ?? null,
    bulletSize: r.buSizePts !== void 0 ? r.buSizePts / d : r.buSizePct ?? null,
    bulletImage: g,
    rtl: r.rtl,
    ...u.edit ? { editInfo: {
      inheritedParagraphProps: {
        level: 0,
        ...Tt(e, d, l)
      },
      directParagraphProps: pn(o),
      directRun: i,
      directLayout: hn(o),
      ...((C = r.bullet) == null ? void 0 : C.kind) === "auto" ? { autoNumbering: { scheme: r.bullet.scheme, startAt: r.bullet.startAt } } : {},
      bullet: Bt(r, u.resolveImage),
      inheritedBullet: Bt(e, u.resolveImage)
    } } : {}
  };
}
const G = {
  anchor: 1,
  insets: 2,
  wrap: 4,
  vert: 8,
  anchorCtr: 16,
  columns: 32,
  columnGap: 64,
  autoFit: 128
}, Ln = {
  horz: "horz",
  vert: "vert",
  vert270: "vert270",
  wordArtVert: "wordArtVert",
  eaVert: "vert",
  mongolianVert: "vert"
};
function tt(t, n) {
  for (const r of t) {
    const e = M(r, n);
    if (e !== null) return e;
  }
  return null;
}
function jn(t) {
  for (const n of t) {
    if (!n) continue;
    const r = m(n, "noAutofit") ?? m(n, "normAutofit") ?? m(n, "spAutoFit");
    if (r) return r;
  }
  return null;
}
function zt(t) {
  const n = tt(t, "anchor") ?? "t", r = (d, $) => {
    const g = tt(t, d);
    return X(g === null ? $ : Number(g));
  }, e = jn(t), o = (e == null ? void 0 : e.localName) === "normAutofit", i = (e == null ? void 0 : e.localName) === "spAutoFit", s = o ? j(e, "fontScale") : null, c = Number(tt(t, "numCol") ?? "1"), l = Number(tt(t, "spcCol") ?? "0"), u = Ln[tt(t, "vert") ?? "horz"];
  return {
    anchor: n === "ctr" ? "middle" : n === "b" ? "bottom" : "top",
    insets: [r("tIns", 45720), r("rIns", 91440), r("bIns", 45720), r("lIns", 91440)],
    wrap: tt(t, "wrap") !== "none",
    fontScale: s != null ? s / 1e5 : 1,
    ...o ? { autoFitNormal: !0 } : {},
    ...o && s == null ? { autoFitCompute: !0 } : {},
    ...o && (j(e, "lnSpcReduction") ?? 0) ? { lnSpcReduction: (j(e, "lnSpcReduction") ?? 0) / 1e5 } : {},
    ...i ? { autoFitShape: !0 } : {},
    ...u !== "horz" ? { vert: u } : {},
    ...tt(t, "anchorCtr") === "1" ? { anchorCtr: !0 } : {},
    ...c > 1 ? { columns: c } : {},
    ...Number.isFinite(l) && l !== 0 ? { columnGap: X(l) } : {}
  };
}
function Sn(t) {
  if (!t) return 0;
  let n = 0;
  return M(t, "anchor") !== null && (n |= G.anchor), ["tIns", "rIns", "bIns", "lIns"].some((r) => M(t, r) !== null) && (n |= G.insets), M(t, "wrap") !== null && (n |= G.wrap), M(t, "vert") !== null && (n |= G.vert), M(t, "anchorCtr") !== null && (n |= G.anchorCtr), M(t, "numCol") !== null && (n |= G.columns), M(t, "spcCol") !== null && (n |= G.columnGap), (m(t, "noAutofit") || m(t, "normAutofit") || m(t, "spAutoFit")) && (n |= G.autoFit), n;
}
function kn(t, n) {
  return {
    latin: t.latin ?? n.fonts.minor.latin,
    eastAsian: t.ea ?? n.fonts.minor.ea,
    complexScript: t.cs ?? n.fonts.minor.cs ?? null
  };
}
function An(t) {
  const n = t.u ?? "none", r = t.strike ?? "noStrike";
  return {
    u: n !== "none",
    strike: r !== "noStrike",
    ...n !== "none" ? { underline: n } : {},
    ...r !== "noStrike" ? { strikeType: r } : {}
  };
}
function Dt(t, n, r) {
  var o;
  const e = kn(t, n);
  return { fontSlots: e, props: {
    b: t.b ?? !1,
    i: t.i ?? !1,
    ...An(t),
    size: rt(t.sz ?? 1800),
    color: t.color ?? n.defaultColor ?? "rgb(0,0,0)",
    fonts: Kt(e, r),
    baseline: t.baseline || void 0,
    spacing: t.spc || void 0,
    caps: t.caps && t.caps !== "none" ? t.caps : void 0,
    outline: t.outline ?? null,
    gradient: t.gradient ?? null,
    highlight: t.highlight ?? null,
    underlineColor: t.uColor ?? null,
    ...t.gradientFill !== void 0 ? { gradientFill: t.gradientFill } : {},
    ...t.shadowEffect !== void 0 ? { shadow: t.shadow, shadowEffect: t.shadowEffect } : {},
    ...(o = t.generationIssues) != null && o.length ? { generationIssues: t.generationIssues } : {}
  } };
}
function ut(t, n, r, e, o = 0) {
  const i = Dt(n, r, t), s = r.edit && e ? Dt(e, r, t) : null;
  return {
    text: t,
    ...i.props,
    link: n.link,
    ...s ? { editInfo: {
      inheritedRunProps: s.props,
      inheritedFontSlots: s.fontSlots,
      direct: o,
      fontSlots: i.fontSlots
    } } : {}
  };
}
function Fn(t, n) {
  if (!t) return;
  const r = {}, e = m(t, "outerShdw"), o = m(t, "innerShdw"), i = e ?? o;
  if (i) {
    const u = X(j(i, "dist") ?? 0), d = (j(i, "dir") ?? 0) / 6e4 * (Math.PI / 180);
    r.shadow = {
      dx: u * Math.cos(d),
      dy: u * Math.sin(d),
      blur: X(j(i, "blurRad") ?? 0),
      color: Y(i, n) ?? "rgba(0,0,0,0.4)",
      inner: i === o
    };
  }
  const s = m(t, "glow");
  s && (r.glow = {
    radius: X(j(s, "rad") ?? 0),
    color: Y(s, n) ?? "rgba(0,0,0,0.4)"
  });
  const c = m(t, "softEdge");
  c && (r.softEdge = X(j(c, "rad") ?? 0));
  const l = m(t, "reflection");
  return l && (r.reflection = {
    alpha: (j(l, "stA") ?? 5e4) / 1e5,
    size: (j(l, "endPos") ?? 35e3) / 1e5,
    distance: X(j(l, "dist") ?? 0)
  }), Object.keys(r).length || t.localName === "effectLst" ? r : void 0;
}
function xn(t, n) {
  var l;
  if (!t) return {};
  const r = {}, e = [], o = m(t, "gradFill");
  if (o) {
    (M(o, "rotWithShape") === "0" || M(o, "rotWithShape") === "false" || M(o, "flip") !== null) && e.push("文字渐变旋转/翻转");
    const u = m(o, "lin");
    !u || m(o, "path") || m(o, "tileRect") ? e.push("文字渐变路径/平铺范围") : r.gradientFill = {
      angle: (j(u, "ang") ?? 0) / 6e4,
      scaled: Mt(u, "scaled") ?? !1,
      stops: Z(m(o, "gsLst"), "gs").map((d) => ({
        pos: (j(d, "pos") ?? 0) / 1e5,
        color: Y(d, n) ?? "#000000"
      })).sort((d, $) => d.pos - $.pos)
    };
  } else ["solidFill", "noFill", "blipFill", "pattFill", "grpFill"].some((u) => m(t, u)) && (r.gradientFill = null);
  for (const u of ["blipFill", "pattFill", "grpFill", "effectDag", "uLn", "uLnTx"])
    m(t, u) && e.push(`文字 ${u}`);
  const i = m(t, "ln");
  if (i) {
    for (const u of Array.from(i.children))
      ["solidFill", "noFill"].includes(u.localName) || e.push(`文字描边 ${u.localName}`);
    for (const u of ["cap", "cmpd", "algn"])
      M(i, u) !== null && e.push(`文字描边 ${u}`);
  }
  const s = m(t, "uFill");
  s && !m(s, "solidFill") && e.push("下划线非纯色填充");
  const c = m(t, "effectLst");
  if (c) {
    const u = (l = Fn(c, n)) == null ? void 0 : l.shadow;
    r.shadowEffect = u ?? null, r.shadow = u ? `${u.dx}px ${u.dy}px ${u.blur}px ${u.color}` : null, c.children.length > 1 && e.push("多重文字效果");
    for (const d of Array.from(c.children)) {
      d.localName !== "outerShdw" && e.push(`文字效果 ${d.localName}`);
      for (const [$, g] of [["sx", "100000"], ["sy", "100000"], ["kx", "0"], ["ky", "0"], ["algn", "b"], ["rotWithShape", "1"]]) {
        const b = M(d, $);
        b !== null && b !== g && e.push(`文字阴影 ${$}`);
      }
    }
  }
  return e.length && (r.generationIssues = e), r;
}
const vn = /* @__PURE__ */ new Set([
  "oMathPara",
  "oMath",
  "r",
  "t",
  "f",
  "num",
  "den",
  "rad",
  "deg",
  "e",
  "sSup",
  "sSub",
  "sSubSup",
  "sup",
  "sub",
  "nary",
  "d",
  "m",
  "mr",
  "acc",
  "bar",
  "groupChr",
  "limLow",
  "limUpp",
  "lim",
  "eqArr",
  "rPr",
  "fPr",
  "radPr",
  "naryPr",
  "dPr",
  "mPr",
  "accPr",
  "barPr",
  "groupChrPr",
  "limLowPr",
  "limUppPr",
  "eqArrPr",
  "sSupPr",
  "sSubPr",
  "sSubSupPr",
  "sty",
  "type",
  "degHide",
  "chr",
  "limLoc",
  "subHide",
  "supHide",
  "begChr",
  "endChr",
  "sepChr",
  "pos"
]), Ot = "http://schemas.openxmlformats.org/officeDocument/2006/math", yn = /* @__PURE__ */ new Set(["sty", "type", "degHide", "chr", "limLoc", "subHide", "supHide", "begChr", "endChr", "sepChr", "pos"]);
function Pn(t) {
  const n = /* @__PURE__ */ new Set(), r = (e, o) => {
    var s;
    if (o > 16) {
      n.add("公式超出解析深度");
      return;
    }
    (e.namespaceURI !== Ot || !vn.has(e.localName)) && n.add(`公式 ${e.tagName}`);
    for (const c of Array.from(e.attributes)) {
      const l = c.namespaceURI;
      l !== "http://www.w3.org/2000/xmlns/" && (e.localName === "t" && c.name === "xml:space" || yn.has(e.localName) && c.localName === "val" && (!l || l === Ot) || n.add(`公式属性 ${e.tagName}@${c.name}`));
    }
    const i = e.localName === "rad" ? [["radPr", "degHide", "deg"]] : e.localName === "nary" ? [["naryPr", "subHide", "sub"], ["naryPr", "supHide", "sup"]] : [];
    for (const [c, l, u] of i) {
      const d = m(m(e, c), l);
      d && !["0", "false", "off"].includes(M(d, "val") ?? "") && ((s = m(e, u)) != null && s.children.length) && n.add(`公式隐藏参数 ${u}`);
    }
    for (const c of Array.from(e.children)) r(c, o + 1);
  };
  return r(t, 0), [...n];
}
function Nn(t, n, r) {
  const e = { rp: {} };
  if (!t) return { props: e, directRun: 0 };
  const o = j(t, "lvl");
  o !== null && (e.lvl = o);
  const i = M(t, "algn");
  i && (e.algn = i);
  const s = j(t, "marL");
  s !== null && (e.marL = X(s));
  const c = j(t, "indent");
  c !== null && (e.indent = X(c)), M(t, "rtl") !== null && (e.rtl = Mt(t, "rtl"));
  const l = m(t, "lnSpc"), u = j(m(l, "spcPct"), "val");
  u !== null && (e.lnPct = u / 1e5);
  const d = j(m(l, "spcPts"), "val");
  d !== null && (e.lnPx = rt(d));
  const $ = j(m(m(t, "spcBef"), "spcPts"), "val");
  $ !== null && (e.spcBef = rt($));
  const g = j(m(m(t, "spcAft"), "spcPts"), "val");
  g !== null && (e.spcAft = rt(g)), m(t, "buNone") && (e.bullet = { kind: "none" });
  const b = m(t, "buChar");
  b && (e.bullet = { kind: "char", char: M(b, "char") ?? "•", font: M(m(t, "buFont"), "typeface") });
  const C = m(t, "buAutoNum");
  C && (e.bullet = {
    kind: "auto",
    scheme: M(C, "type") ?? "arabicPeriod",
    startAt: j(C, "startAt") ?? 1
  });
  const h = m(m(t, "buBlip"), "blip");
  if (h) {
    const v = M(h, "r:embed");
    v && (e.bullet = { kind: "image", rid: v });
  }
  const S = m(t, "buClr");
  S ? e.buColor = Y(S, n) ?? null : m(t, "buClrTx") && (e.buColor = null);
  const A = m(t, "buFont");
  A ? e.buFont = M(A, "typeface") : m(t, "buFontTx") && (e.buFont = null);
  const I = j(m(t, "buSzPct"), "val");
  if (I !== null) e.buSizePct = I / 1e5;
  else {
    const v = j(m(t, "buSzPts"), "val");
    v !== null ? e.buSizePts = rt(v) : m(t, "buSzTx") && (e.buSizePct = null);
  }
  const H = m(t, "defRPr"), B = gt(H, n, r);
  return e.rp = B.props, { props: e, directRun: B.direct };
}
function gt(t, n, r) {
  const e = {};
  let o = 0;
  if (!t) return { props: e, direct: o };
  const i = j(t, "sz");
  i !== null && (e.sz = i, o |= T.size), M(t, "b") !== null && (e.b = Mt(t, "b"), o |= T.b), M(t, "i") !== null && (e.i = Mt(t, "i"), o |= T.i);
  const s = M(t, "u");
  s !== null && (e.u = Jt.includes(s) ? s : "sng", o |= T.u);
  const c = M(t, "strike");
  c !== null && (e.strike = wt.includes(c) ? c : "sngStrike", o |= T.strike);
  const l = j(t, "baseline");
  l !== null && (e.baseline = l / 1e3, o |= T.baseline);
  const u = j(t, "spc");
  u !== null && (e.spc = rt(u), o |= T.spacing);
  const d = M(t, "cap");
  d && (e.caps = d === "all" ? "all" : d === "small" ? "small" : "none", o |= T.caps);
  const $ = m(t, "solidFill"), g = Y($, n);
  g && (e.color = g), $ && (e.gradient = null);
  const b = m(t, "gradFill");
  if (b) {
    const L = Z(m(b, "gsLst"), "gs").map((F) => ({ pos: (j(F, "pos") ?? 0) / 1e5, color: Y(F, n) ?? "#000" })).sort((F, z) => F.pos - z.pos);
    if (L.length) {
      const F = m(b, "lin"), z = F ? (j(F, "ang") ?? 0) / 6e4 + 90 : 180;
      e.gradient = `linear-gradient(${Math.round(z)}deg,${L.map((D) => `${D.color} ${Math.round(D.pos * 100)}%`).join(",")})`, e.color || (e.color = L[0].color);
    }
  }
  m(t, "noFill") && (e.color = "transparent", e.gradient = null), ($ || b || ["noFill", "blipFill", "pattFill", "grpFill"].some((L) => !!m(t, L))) && (o |= T.color | T.gradient), !$ && !b && ["blipFill", "pattFill", "grpFill"].some((L) => !!m(t, L)) && (e.color = "transparent", e.gradient = null);
  const C = Y(m(t, "uFill"), n) ?? Y(m(m(t, "uFill"), "solidFill"), n);
  C && (e.uColor = C), (m(t, "uFillTx") || m(t, "uFill") && !C) && (e.uColor = null), (m(t, "uFillTx") || m(t, "uFill")) && (o |= T.underlineColor);
  const h = m(t, "highlight");
  h && (e.highlight = Y(h, n) ?? null), h && (o |= T.highlight);
  const S = m(t, "ln");
  if (m(S, "noFill")) e.outline = null;
  else if (S) {
    const L = Y(m(S, "solidFill"), n);
    L ? e.outline = { color: L, width: X(j(S, "w") ?? 9525) } : e.outline = null;
  }
  S && (o |= T.outline);
  const A = m(t, "latin"), I = jt(M(A, "typeface"), r);
  I && (e.latin = I), M(A, "typeface") !== null && (o |= T.fontLatin);
  const H = m(t, "ea"), B = jt(M(H, "typeface"), r);
  B && (e.ea = B), M(H, "typeface") !== null && (o |= T.fontEastAsian);
  const v = m(t, "cs"), J = jt(M(v, "typeface"), r);
  return J && (e.cs = J), M(v, "typeface") !== null && (o |= T.fontComplexScript), Object.assign(e, xn(t, n)), { props: e, direct: o };
}
function jt(t, n) {
  return t ? t === "+mj-lt" ? n.major.latin : t === "+mj-ea" ? n.major.ea : t === "+mj-cs" ? n.major.cs ?? n.major.latin : t === "+mn-lt" ? n.minor.latin : t === "+mn-ea" ? n.minor.ea : t === "+mn-cs" ? n.minor.cs ?? n.minor.latin : t : null;
}
const St = (t, n) => ({ ...t, ...n });
function In(t) {
  for (const n of t) {
    const r = m(n, "prstTxWarp");
    if (!r) continue;
    const e = M(r, "prst");
    if (!e || e === "textNoShape") return;
    const o = {}, i = [];
    for (const s of Z(m(r, "avLst"), "gd")) {
      const c = M(s, "name"), l = M(s, "fmla") ?? "", u = Number(l.replace(/^val\s+/, ""));
      c && Number.isFinite(u) && (o[c] = u), (!c || !/^val\s+-?\d+$/.test(l) || !Number.isSafeInteger(u)) && i.push(`艺术字调整值 ${c ?? "(无名)"}：${l}`);
    }
    return { preset: e, adj: o, ...i.length ? { generationIssues: i } : {} };
  }
}
function Tn(t, n, r = !1) {
  if (!t) return null;
  const e = m(t, "bodyPr"), o = [e, ...n.bodyPrFallbacks ?? []], i = zt(o), s = (n.bodyPrFallbacks ?? []).some(Boolean), c = n.edit && s ? zt(o.slice(1)) : void 0, l = [], u = [];
  let d = !1;
  for (const $ of Z(t, "p")) {
    const g = m($, "pPr"), b = j(g, "lvl") ?? 0, C = mn(n.chain, b), h = Nn(g, n.ctx, n.fonts), S = h.props, A = Ft(C, S), I = [], H = (B, v) => {
      var J;
      for (let L = B.firstElementChild; L; L = L.nextElementSibling)
        if (L.localName === "r" || L.localName === "fld") {
          const F = m(L, "rPr"), z = gt(F, n.ctx, n.fonts), D = St(A.rp, z.props), q = m(F, "hlinkClick");
          let st = !1;
          if (q && n.resolveLink) {
            const ct = n.resolveLink(M(q, "r:id") ?? "", M(q, "action"));
            ct ? D.link = ct : st = !0;
          }
          let et = ((J = m(L, "t")) == null ? void 0 : J.textContent) ?? "";
          L.localName === "fld" && !et && (et = En(M(L, "type"), n));
          const w = ut(et, D, n, A.rp, z.direct);
          n.edit && st && w.editInfo && (w.editInfo = { ...w.editInfo, readonlyLink: !0 }), I.push(L.localName === "fld" ? { ...w, field: M(L, "type") ?? "unknown" } : w), et.trim() && (d = !0);
        } else if (L.localName === "br") {
          const F = m(L, "rPr"), z = gt(F, n.ctx, n.fonts), D = St(A.rp, z.props);
          I.push(ut(`
`, D, n, A.rp, z.direct));
        } else if (L.localName === "m" && L.namespaceURI === "http://schemas.microsoft.com/office/drawing/2010/main")
          v > 0 && H(L, v - 1);
        else if (L.localName === "AlternateContent") {
          const F = m(L, "Choice") ?? m(L, "Fallback");
          F && v > 0 && H(F, v - 1);
        } else if (L.localName === "oMathPara" || L.localName === "oMath") {
          const F = fn(L), z = F.length ? R(F) : Rn(L), D = Pn(L);
          if (F.length || z || D.length) {
            const q = ut(z, { ...A.rp, i: !0 }, n, A.rp);
            F.length && (q.math = F), D.length && (q.generationIssues = [...q.generationIssues ?? [], ...D]), I.push(q), d = !0;
          }
        } else v > 0 && (L.localName === "Choice" || L.localName === "Fallback") && H(L, v - 1);
    };
    if (H($, 4), I.length === 0) {
      const B = m($, "endParaRPr"), v = gt(B, n.ctx, n.fonts);
      I.push(ut(
        "",
        St(A.rp, v.props),
        n,
        A.rp,
        v.direct
      ));
    }
    u.push(Cn({
      lvl: b,
      resolved: A,
      inherited: C,
      direct: S,
      directRun: h.directRun,
      runs: I,
      counters: l,
      lnSpcReduction: i.lnSpcReduction ?? 0,
      env: n
    }));
  }
  return !d && !r ? null : {
    ...i,
    paragraphs: u,
    warp: In(o),
    ...n.edit ? { editInfo: {
      direct: Sn(e),
      ...c ? { inherited: c } : {}
    } } : {}
  };
}
function Rn(t) {
  const n = [], r = (e, o) => {
    for (let i = e.firstElementChild; i; i = i.nextElementSibling)
      i.localName === "t" ? n.push(i.textContent ?? "") : o > 0 && r(i, o - 1);
  };
  return r(t, 12), n.join("").trim();
}
function En(t, n) {
  return t ? t === "slidenum" ? String(n.slideNum) : t.startsWith("datetime") ? n.dateText ?? (/* @__PURE__ */ new Date()).toLocaleDateString() : t === "footer" ? n.footerText ?? "" : "" : "";
}
const a = (t) => Number.isFinite(t) ? String(Math.round(t * 1e3) / 1e3) : "0", ht = (t) => t * Math.PI / 180, P = (t) => ({ d: t, open: !0 }), f = (t, n, r) => (t[n] ?? r) / 1e5, Q = (t, n, r) => (t[n] ?? r) / 6e4;
function p(t, n = !0) {
  return t.length ? "M " + t.map(([r, e]) => `${a(r)} ${a(e)}`).join(" L ") + (n ? " Z" : "") : "";
}
function y(t, n, r, e, o) {
  return [t + r * Math.cos(ht(o)), n + e * Math.sin(ht(o))];
}
function E(t, n, r, e, o, i) {
  const s = Math.max(-359.99, Math.min(359.99, i)), [c, l] = y(t, n, r, e, o + s);
  return `A ${a(r)} ${a(e)} 0 ${Math.abs(s) > 180 ? 1 : 0} ${s >= 0 ? 1 : 0} ${a(c)} ${a(l)}`;
}
function kt(t, n, r, e, o, i) {
  const [s, c] = y(t, n, r, e, o);
  return `M ${a(s)} ${a(c)} ${E(t, n, r, e, o, i)}`;
}
function N(t) {
  if (t.length < 2) return "";
  const n = t.slice(0, -1).reverse();
  return "M " + [...t, ...n].map(([r, e]) => `${a(r)} ${a(e)}`).join(" L ");
}
function Zt(t, n, r, e) {
  return x(t, n, r, e) + " " + x(t, n, r, e, !0);
}
function x(t, n, r, e, o = !1) {
  const i = o ? -180 : 180;
  return `M ${a(t - r)} ${a(n)} ${E(t, n, r, e, 180, i)} ${E(t, n, r, e, 180 + i, i)} Z`;
}
function dt(t, n) {
  return (r, e) => {
    const o = [];
    for (let i = 0; i < t; i++) o.push(y(r / 2, e / 2, r / 2, e / 2, n + 360 * i / t));
    return p(o);
  };
}
function W(t, n) {
  return (r, e, o) => {
    const i = o.adj !== void 0 ? o.adj / 1e5 : n, s = Math.min(0.95, Math.max(0.05, i)), c = [];
    for (let l = 0; l < t * 2; l++) {
      const u = l % 2 === 0 ? 1 : s;
      c.push(y(r / 2, e / 2, r / 2 * u, e / 2 * u, -90 + l * 180 / t));
    }
    return p(c);
  };
}
function Xt(t, n, r, e) {
  const o = [[0, 0], [t, 0], [t, n], [0, n]], i = [[1, 0], [0, 1], [-1, 0], [0, -1]], s = [];
  for (let c = 0; c < 4; c++) {
    const [l, u] = o[c], d = Math.max(0, r[c]), $ = i[(c + 3) % 4], g = i[c], b = [l - $[0] * d, u - $[1] * d], C = [l + g[0] * d, u + g[1] * d];
    s.push(`${c === 0 ? "M" : "L"} ${a(b[0])} ${a(b[1])}`), d > 0 && s.push(e[c] === "r" ? `A ${a(d)} ${a(d)} 0 0 1 ${a(C[0])} ${a(C[1])}` : `L ${a(C[0])} ${a(C[1])}`);
  }
  return s.join(" ") + " Z";
}
const V = (t, n, r) => (e, o, i) => {
  const s = n.map((c, l) => c ? Math.min(e, o) * Math.min(f(i, c, r[l]), 0.5) : 0);
  return Xt(e, o, s, t);
}, qt = {
  r: ([t, n]) => [t, n],
  l: ([t, n], r) => [r - t, n],
  d: ([t, n]) => [n, t],
  u: ([t, n], r, e) => [n, e - t]
};
function ft(t) {
  return (n, r, e) => {
    const o = t === "r" || t === "l", i = o ? n : r, s = o ? r : n, c = s * Math.min(f(e, "adj1", 5e4), 1) / 2, l = Math.min(i, s * f(e, "adj2", 5e4)), u = s / 2, d = [
      [0, u - c],
      [i - l, u - c],
      [i - l, 0],
      [i, u],
      [i - l, s],
      [i - l, u + c],
      [0, u + c]
    ];
    return p(d.map(($) => qt[t]($, n, r)));
  };
}
function $t(t) {
  return (n, r, e) => {
    const o = t === "r" || t === "l", i = o ? n : r, s = o ? r : n, c = s * f(e, "adj1", 18515) / 2, l = Math.min(i / 2, s * f(e, "adj2", 18515)), u = Math.max(0, i - Math.max(l, i * (1 - f(e, "adj4", 66667)))), d = s / 2, $ = [
      [0, 0],
      [u, 0],
      [u, d - c],
      [i - l, d - c],
      [i - l, 0],
      [i, d],
      [i - l, s],
      [i - l, d + c],
      [u, d + c],
      [u, s],
      [0, s]
    ];
    return p($.map((g) => qt[t](g, n, r)));
  };
}
function xt(t, n, r) {
  return [t / 2 + t * f(r, "adj1", -20833), n / 2 + n * f(r, "adj2", 62500)];
}
function Ht(t, n, r) {
  const e = xt(t, n, r), o = e[0] - t / 2, i = e[1] - n / 2, s = t === 0 ? 0 : o * n / t, c = Math.abs(i) - Math.abs(s) > 0, l = t * (o > 0 ? 7 : 2) / 12, u = n * (i > 0 ? 7 : 2) / 12;
  return {
    x1: l,
    x2: t * (o > 0 ? 10 : 5) / 12,
    y1: u,
    y2: n * (i > 0 ? 10 : 5) / 12,
    top: c && i <= 0 ? e : [l, 0],
    right: !c && o > 0 ? e : [t, u],
    bottom: c && i > 0 ? e : [l, n],
    left: !c && o <= 0 ? e : [0, u]
  };
}
function Bn(t, n, r, e) {
  const o = [[t * 0.15, n]];
  return e === 1 ? o.push([t * f(r, "adj2", -8333), n + n * f(r, "adj1", 18750)]) : (o.push([t * 0.05, n * 1.2]), o.push([t * f(r, "adj4", -16667), n + n * f(r, "adj3", 44444)]), e >= 3 && o.push([t * f(r, "adj6", -16667) - t * 0.12, n + n * f(r, "adj5", 44444)])), " " + N(o);
}
function _(t, n) {
  return (r, e, o) => p([[0, 0], [r, 0], [r, e], [0, e]]) + (n ? " " + N([[0, 0], [0, e]]) : "") + Bn(r, e, o, t);
}
function At(t) {
  return (n, r) => {
    const e = Math.min(Math.hypot(n, r) / 20, Math.min(n, r) / 2), o = (i, s, c, l) => {
      const [u, d] = [i + c * e, s], [$, g] = [i, s + l * e];
      if (t === "s") return p([[i, s], [u, d], [u, g], [$, g]]);
      const b = t === "q" ? c * l > 0 ? 1 : 0 : c * l > 0 ? 0 : 1;
      return `M ${a(i)} ${a(s)} L ${a(u)} ${a(d)} A ${a(e)} ${a(e)} 0 0 ${b} ${a($)} ${a(g)} Z`;
    };
    return [
      o(0, 0, 1, 1),
      o(n, 0, -1, 1),
      o(n, r, -1, -1),
      o(0, r, 1, -1)
    ].join(" ");
  };
}
function mt(t, n, r, e) {
  const o = n / 4;
  return e ? `C ${a(n - o)} ${a(t + r)} ${a(o)} ${a(t - r)} 0 ${a(t)}` : `C ${a(o)} ${a(t - r)} ${a(o * 3)} ${a(t + r)} ${a(n)} ${a(t)}`;
}
function nt(t, n, r, e, o, i, s, c, l = !1) {
  const u = c >= s ? 1 : -1, d = Math.max(1, Math.min(i, Math.min(r, e) - o - 1)), $ = (r + e) / 2 - o / 2, g = Math.min(Math.abs(c - s) * (l ? 0.35 : 0.6), d / Math.max($, 1) * (180 / Math.PI)), b = c - u * g, C = l ? s + u * g : s, h = b - C, [S, A] = y(t, n, r, e, C), [I, H] = y(t, n, r + d, e + d, b), [B, v] = y(t, n, r - o / 2, e - o / 2, c), [J, L] = y(t, n, r - o - d, e - o - d, b), [F, z] = y(t, n, r - o, e - o, b);
  let D = "";
  if (l) {
    const [q, st] = y(t, n, r - o - d, e - o - d, C), [et, w] = y(t, n, r - o / 2, e - o / 2, s), [ct, Wt] = y(t, n, r + d, e + d, C);
    D = `L ${a(q)} ${a(st)} L ${a(et)} ${a(w)} L ${a(ct)} ${a(Wt)} `;
  }
  return `M ${a(S)} ${a(A)} ${E(t, n, r, e, C, h)} L ${a(I)} ${a(H)} L ${a(B)} ${a(v)} L ${a(J)} ${a(L)} L ${a(F)} ${a(z)} ${E(t, n, r - o, e - o, b, -h)} ${D}Z`;
}
function _t(t, n, r) {
  const e = t / 2, o = n / 2, i = Math.min(t, n) / 2, s = i * 0.78, c = 360 / r, l = [];
  for (let u = 0; u < r; u++) {
    const d = u * c;
    l.push(y(e, o, s, s, d - c * 0.28)), l.push(y(e, o, i, i, d - c * 0.16)), l.push(y(e, o, i, i, d + c * 0.16)), l.push(y(e, o, s, s, d + c * 0.28));
  }
  return p(l) + " " + x(e, o, i * 0.36, i * 0.36, !0);
}
function vt(t, n, r) {
  return p([[0, 0], [t, 0], [t, n], [0, n]]) + " " + N([[r, r], [t - r, r], [t - r, n - r], [r, n - r], [r, r]]);
}
function U(t, n, r) {
  const e = Math.min(t, n) * 0.125;
  return vt(t, n, e) + " " + r(Math.min(t, n) * 0.24, t / 2, n / 2);
}
const ot = {
  // 矩形族
  rect: (t, n) => p([[0, 0], [t, 0], [t, n], [0, n]]),
  roundRect: V(["r", "r", "r", "r"], ["adj", "adj", "adj", "adj"], [16667, 16667, 16667, 16667]),
  round1Rect: V(["n", "r", "n", "n"], [null, "adj", null, null], [0, 16667, 0, 0]),
  round2SameRect: V(["r", "r", "r", "r"], ["adj1", "adj1", "adj2", "adj2"], [16667, 16667, 0, 0]),
  round2DiagRect: V(["r", "r", "r", "r"], ["adj1", "adj2", "adj1", "adj2"], [16667, 0, 16667, 0]),
  snip1Rect: V(["n", "s", "n", "n"], [null, "adj", null, null], [0, 16667, 0, 0]),
  snip2SameRect: V(["s", "s", "s", "s"], ["adj1", "adj1", "adj2", "adj2"], [16667, 16667, 0, 0]),
  snip2DiagRect: V(["s", "s", "s", "s"], ["adj1", "adj2", "adj1", "adj2"], [0, 16667, 0, 16667]),
  snipRoundRect: V(["r", "s", "n", "n"], ["adj1", "adj2", null, null], [16667, 16667, 0, 0]),
  plaque: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 16667), 0.5);
    return `M ${a(e)} 0 L ${a(t - e)} 0 A ${a(e)} ${a(e)} 0 0 0 ${a(t)} ${a(e)} L ${a(t)} ${a(n - e)} A ${a(e)} ${a(e)} 0 0 0 ${a(t - e)} ${a(n)} L ${a(e)} ${a(n)} A ${a(e)} ${a(e)} 0 0 0 0 ${a(n - e)} L 0 ${a(e)} A ${a(e)} ${a(e)} 0 0 0 ${a(e)} 0 Z`;
  },
  bevel: (t, n, r) => vt(t, n, Math.min(t, n) * Math.min(f(r, "adj", 12500), 0.5)),
  // 四角装饰片：无调节值，尺寸由对角线长度决定
  cornerTabs: At("q"),
  squareTabs: At("s"),
  plaqueTabs: At("c"),
  frame: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj1", 12500), 0.5);
    return p([[0, 0], [t, 0], [t, n], [0, n]]) + " " + p([[e, e], [e, n - e], [t - e, n - e], [t - e, e]]);
  },
  halfFrame: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 33333), o = Math.min(t, n) * f(r, "adj2", 33333);
    return p([[0, 0], [t, 0], [t - o, e], [o, e], [o, n - e], [0, n]]);
  },
  corner: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 5e4), o = Math.min(t, n) * f(r, "adj2", 5e4);
    return p([[0, 0], [o, 0], [o, n - e], [t, n - e], [t, n], [0, n]]);
  },
  diagStripe: (t, n, r) => {
    const e = Math.min(f(r, "adj", 5e4), 1);
    return p([[0, n * (1 - e)], [t * (1 - e), 0], [t, 0], [0, n]]);
  },
  foldedCorner: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj", 16667);
    return p([[0, 0], [t, 0], [t, n - e], [t - e, n], [0, n]]) + ` M ${a(t - e)} ${a(n)} L ${a(t - e * 0.72)} ${a(n - e * 0.72)} L ${a(t)} ${a(n - e)} Z`;
  },
  // 基本形
  ellipse: (t, n) => x(t / 2, n / 2, t / 2, n / 2),
  triangle: (t, n, r) => p([[t * f(r, "adj", 5e4), 0], [t, n], [0, n]]),
  rtTriangle: (t, n) => p([[0, 0], [t, n], [0, n]]),
  diamond: (t, n) => p([[t / 2, 0], [t, n / 2], [t / 2, n], [0, n / 2]]),
  parallelogram: (t, n, r) => {
    const e = Math.min(t, Math.min(t, n) * f(r, "adj", 25e3));
    return p([[e, 0], [t, 0], [t - e, n], [0, n]]);
  },
  trapezoid: (t, n, r) => {
    const e = Math.min(t / 2, Math.min(t, n) * f(r, "adj", 25e3));
    return p([[e, 0], [t - e, 0], [t, n], [0, n]]);
  },
  nonIsoscelesTrapezoid: (t, n, r) => p([[t * f(r, "adj1", 25e3), 0], [t - t * f(r, "adj2", 25e3), 0], [t, n], [0, n]]),
  pentagon: dt(5, -90),
  heptagon: dt(7, -90),
  decagon: dt(10, -90),
  dodecagon: dt(12, -90),
  hexagon: (t, n, r) => {
    const e = Math.min(t / 2, Math.min(t, n) * f(r, "adj", 25e3));
    return p([[e, 0], [t - e, 0], [t, n / 2], [t - e, n], [e, n], [0, n / 2]]);
  },
  octagon: (t, n, r) => {
    const e = Math.min(Math.min(t, n) / 2, Math.min(t, n) * f(r, "adj", 29289));
    return p([[e, 0], [t - e, 0], [t, e], [t, n - e], [t - e, n], [e, n], [0, n - e], [0, e]]);
  },
  homePlate: (t, n, r) => {
    const e = Math.min(t, Math.min(t, n) * f(r, "adj", 5e4));
    return p([[0, 0], [t - e, 0], [t, n / 2], [t - e, n], [0, n]]);
  },
  chevron: (t, n, r) => {
    const e = Math.min(t, Math.min(t, n) * f(r, "adj", 5e4));
    return p([[0, 0], [t - e, 0], [t, n / 2], [t - e, n], [0, n], [e, n / 2]]);
  },
  plus: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 25e3), 0.5);
    return p([
      [e, 0],
      [t - e, 0],
      [t - e, e],
      [t, e],
      [t, n - e],
      [t - e, n - e],
      [t - e, n],
      [e, n],
      [e, n - e],
      [0, n - e],
      [0, e],
      [e, e]
    ]);
  },
  teardrop: (t, n, r) => {
    const e = Math.max(0, f(r, "adj", 1e5)), o = Math.SQRT1_2 + e * (1 - Math.SQRT1_2), i = t / 2, s = n / 2;
    return `M 0 ${a(s)} ${E(i, s, t / 2, n / 2, 180, 90)} L ${a(i + t / 2 * o)} ${a(s - n / 2 * o)} L ${a(t)} ${a(s)} ${E(i, s, t / 2, n / 2, 0, 180)} Z`;
  },
  can: (t, n, r) => {
    const e = Math.min(n / 2, n * f(r, "adj", 25e3) / 2);
    return `M 0 ${a(e)} ${E(t / 2, e, t / 2, e, 180, 180)} L ${a(t)} ${a(n - e)} ${E(t / 2, n - e, t / 2, e, 0, 180)} Z ` + Zt(t / 2, e, t / 2, e);
  },
  cube: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 25e3), 0.5);
    return p([[0, e], [e, 0], [t, 0], [t, n - e], [t - e, n], [0, n]]) + " " + N([[0, e], [t - e, e], [t, 0]]) + " " + N([[t - e, e], [t - e, n]]);
  },
  donut: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 25e3), 0.5);
    return x(t / 2, n / 2, t / 2, n / 2) + " " + x(t / 2, n / 2, t / 2 - e, n / 2 - e, !0);
  },
  noSmoking: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 18750), 0.5), o = t / 2 - e, i = n / 2 - e, s = t / 2, c = n / 2, l = e / 2, u = Math.cos(ht(-45)), d = Math.sin(ht(-45)), $ = -d, g = u, [b, C] = [s - u * o, c - d * i], [h, S] = [s + u * o, c + d * i], A = p([
      [b + $ * l, C + g * l],
      [h + $ * l, S + g * l],
      [h - $ * l, S - g * l],
      [b - $ * l, C - g * l]
    ]);
    return x(s, c, t / 2, n / 2) + " " + x(s, c, o, i, !0) + " " + A;
  },
  pie: (t, n, r) => {
    const e = Q(r, "adj1", 0), o = ((Q(r, "adj2", 270 * 6e4) - e) % 360 + 360) % 360, [i, s] = y(t / 2, n / 2, t / 2, n / 2, e);
    return `M ${a(t / 2)} ${a(n / 2)} L ${a(i)} ${a(s)} ${E(t / 2, n / 2, t / 2, n / 2, e, o)} Z`;
  },
  // 固定 90° 扇形：圆心在右下角，从 180° 顺时针扫到 270°
  pieWedge: (t, n) => `M 0 ${a(n)} ${E(t, n, t, n, 180, 90)} L ${a(t)} ${a(n)} Z`,
  chord: (t, n, r) => {
    const e = Q(r, "adj1", 27e5), o = ((Q(r, "adj2", 270 * 6e4) - e) % 360 + 360) % 360;
    return kt(t / 2, n / 2, t / 2, n / 2, e, o) + " Z";
  },
  arc: (t, n, r) => {
    const e = Q(r, "adj1", 162e5), o = ((Q(r, "adj2", 0) - e) % 360 + 360) % 360;
    return P(kt(t / 2, n / 2, t / 2, n / 2, e, o));
  },
  blockArc: (t, n, r) => {
    const e = Q(r, "adj1", 108e5), o = ((Q(r, "adj2", 0) - e) % 360 + 360) % 360, i = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.5), [s, c] = y(t / 2, n / 2, t / 2 - i, n / 2 - i, e + o);
    return kt(t / 2, n / 2, t / 2, n / 2, e, o) + ` L ${a(s)} ${a(c)} ${E(t / 2, n / 2, t / 2 - i, n / 2 - i, e + o, -o)} Z`;
  },
  cloud: (t, n) => {
    const r = (i) => i * t, e = (i) => i * n, o = (i, s, c, l, u, d) => `C ${a(r(i))} ${a(e(s))} ${a(r(c))} ${a(e(l))} ${a(r(u))} ${a(e(d))} `;
    return `M ${a(r(0.2))} ${a(e(0.79))} ` + o(0.06, 0.79, 0, 0.66, 0.07, 0.55) + o(0, 0.43, 0.1, 0.31, 0.22, 0.34) + o(0.25, 0.16, 0.44, 0.09, 0.56, 0.19) + o(0.65, 0.05, 0.86, 0.09, 0.88, 0.26) + o(1, 0.3, 1.01, 0.48, 0.92, 0.56) + o(1, 0.69, 0.9, 0.83, 0.76, 0.79) + o(0.68, 0.91, 0.5, 0.93, 0.42, 0.84) + o(0.36, 0.91, 0.25, 0.89, 0.2, 0.79) + "Z";
  },
  heart: (t, n) => {
    const r = (o) => o * t, e = (o) => o * n;
    return `M ${a(r(0.5))} ${a(e(1))} C ${a(r(-0.06))} ${a(e(0.53))} ${a(r(0.08))} ${a(e(-0.11))} ${a(r(0.5))} ${a(e(0.25))} C ${a(r(0.92))} ${a(e(-0.11))} ${a(r(1.06))} ${a(e(0.53))} ${a(r(0.5))} ${a(e(1))} Z`;
  },
  lightningBolt: (t, n) => p([[0.55, 0], [1, 0.55], [0.68, 0.55], [0.8, 1], [0, 0.42], [0.42, 0.42]].map(([r, e]) => [r * t, e * n])),
  sun: (t, n, r) => {
    const e = Math.min(f(r, "adj", 25e3), 0.45), o = t / 2, i = n / 2, s = o * (1 - e * 1.4), c = i * (1 - e * 1.4), l = [];
    for (let u = 0; u < 8; u++) {
      const d = u * 45, [$, g] = y(o, i, s, c, d - 9), [b, C] = y(o, i, o, i, d), [h, S] = y(o, i, s, c, d + 9);
      l.push(`M ${a($)} ${a(g)} L ${a(b)} ${a(C)} L ${a(h)} ${a(S)} Z`);
    }
    return x(o, i, s, c) + " " + l.join(" ");
  },
  moon: (t, n, r) => {
    const e = f(r, "adj", 5e4);
    return `M ${a(t)} 0 C ${a(t * (1 - e * 1.6))} ${a(n * 0.15)} ${a(t * (1 - e * 1.6))} ${a(n * 0.85)} ${a(t)} ${a(n)} C ${a(t * 0.1)} ${a(n * 0.92)} ${a(t * 0.1)} ${a(n * 0.08)} ${a(t)} 0 Z`;
  },
  smileyFace: (t, n, r) => {
    const e = n * f(r, "adj", 4653) * 2;
    return x(t / 2, n / 2, t / 2, n / 2) + " " + x(t * 0.32, n * 0.35, t * 0.055, n * 0.08, !0) + " " + x(t * 0.68, n * 0.35, t * 0.055, n * 0.08, !0) + ` M ${a(t * 0.26)} ${a(n * 0.63)} Q ${a(t * 0.5)} ${a(n * 0.85 + e)} ${a(t * 0.74)} ${a(n * 0.63)} Q ${a(t * 0.5)} ${a(n * 0.85 + e)} ${a(t * 0.26)} ${a(n * 0.63)}`;
  },
  irregularSeal1: (t, n) => p([
    [0.09, 0.28],
    [0.24, 0.35],
    [0.13, 0.09],
    [0.35, 0.26],
    [0.42, 0],
    [0.53, 0.24],
    [0.72, 0.06],
    [0.7, 0.31],
    [0.93, 0.24],
    [0.81, 0.45],
    [1, 0.53],
    [0.83, 0.64],
    [0.96, 0.83],
    [0.73, 0.79],
    [0.75, 1],
    [0.56, 0.86],
    [0.45, 1],
    [0.38, 0.83],
    [0.19, 0.94],
    [0.23, 0.72],
    [0, 0.75],
    [0.16, 0.58],
    [0, 0.45]
  ].map(([r, e]) => [r * t, e * n])),
  irregularSeal2: (t, n) => p([
    [0.11, 0.32],
    [0.25, 0.28],
    [0.15, 0.11],
    [0.36, 0.2],
    [0.4, 0.02],
    [0.55, 0.17],
    [0.68, 0],
    [0.71, 0.2],
    [0.9, 0.14],
    [0.85, 0.36],
    [1, 0.42],
    [0.86, 0.55],
    [0.98, 0.72],
    [0.79, 0.72],
    [0.82, 0.93],
    [0.63, 0.82],
    [0.55, 1],
    [0.44, 0.85],
    [0.28, 0.96],
    [0.28, 0.76],
    [0.06, 0.8],
    [0.17, 0.62],
    [0, 0.5]
  ].map(([r, e]) => [r * t, e * n])),
  gear6: (t, n) => _t(t, n, 6),
  gear9: (t, n) => _t(t, n, 9),
  funnel: (t, n) => {
    const r = n * 0.1;
    return `M 0 ${a(r)} ${E(t / 2, r, t / 2, r, 180, 180)} L ${a(t * 0.56)} ${a(n * 0.72)} L ${a(t * 0.56)} ${a(n)} L ${a(t * 0.44)} ${a(n)} L ${a(t * 0.44)} ${a(n * 0.72)} Z`;
  },
  // 星形
  star4: W(4, 0.3),
  star5: W(5, 0.382),
  star6: W(6, 0.577),
  star7: W(7, 0.605),
  star8: W(8, 0.375),
  star10: W(10, 0.618),
  star12: W(12, 0.5),
  star16: W(16, 0.375),
  star24: W(24, 0.375),
  star32: W(32, 0.375),
  // 箭头
  rightArrow: ft("r"),
  leftArrow: ft("l"),
  upArrow: ft("u"),
  downArrow: ft("d"),
  leftRightArrow: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 5e4), 1) / 2, o = Math.min(t / 2, n * f(r, "adj2", 5e4)), i = n / 2;
    return p([
      [0, i],
      [o, 0],
      [o, i - e],
      [t - o, i - e],
      [t - o, 0],
      [t, i],
      [t - o, n],
      [t - o, i + e],
      [o, i + e],
      [o, n]
    ]);
  },
  upDownArrow: (t, n, r) => {
    const e = t * Math.min(f(r, "adj1", 5e4), 1) / 2, o = Math.min(n / 2, t * f(r, "adj2", 5e4)), i = t / 2;
    return p([
      [i, 0],
      [t, o],
      [i + e, o],
      [i + e, n - o],
      [t, n - o],
      [i, n],
      [0, n - o],
      [i - e, n - o],
      [i - e, o],
      [0, o]
    ]);
  },
  quadArrow: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj2", 22500) / 2, o = Math.min(t, n) * f(r, "adj3", 25e3), i = t / 2, s = n / 2;
    return p([
      [i, 0],
      [i + o, o],
      [i + e, o],
      [i + e, s - e],
      [t - o, s - e],
      [t - o, s - o],
      [t, s],
      [t - o, s + o],
      [t - o, s + e],
      [i + e, s + e],
      [i + e, n - o],
      [i + o, n - o],
      [i, n],
      [i - o, n - o],
      [i - e, n - o],
      [i - e, s + e],
      [o, s + e],
      [o, s + o],
      [0, s],
      [o, s - o],
      [o, s - e],
      [i - e, s - e],
      [i - e, o],
      [i - o, o]
    ]);
  },
  leftRightUpArrow: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj2", 22500) / 2, o = Math.min(t, n) * f(r, "adj3", 25e3), i = t / 2, s = n - e;
    return p([
      [i, 0],
      [i + o, o],
      [i + e, o],
      [i + e, s - e],
      [t - o, s - e],
      [t - o, s - o],
      [t, s],
      [t - o, s + o],
      [t - o, n],
      [o, n],
      [o, s + o],
      [0, s],
      [o, s - o],
      [o, s - e],
      [i - e, s - e],
      [i - e, o],
      [i - o, o]
    ]);
  },
  bentUpArrow: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.6), o = Math.min(t / 2, Math.max(Math.min(t, n) * f(r, "adj1", 25e3), e * 0.6)), i = Math.min(n, Math.min(t, n) * f(r, "adj2", 25e3)), s = t - o;
    return p([
      [0, n],
      [s + e / 2, n],
      [s + e / 2, i],
      [t, i],
      [s, 0],
      [s - o, i],
      [s - e / 2, i],
      [s - e / 2, n - e],
      [0, n - e]
    ]);
  },
  leftUpArrow: (t, n, r) => {
    const e = Math.min(t, n), o = e * Math.min(f(r, "adj1", 25e3), 0.6), i = Math.min(e / 2, Math.max(e * f(r, "adj2", 25e3), o * 0.6)), s = Math.min(e, e * f(r, "adj3", 25e3));
    return p([
      [t - i, 0],
      [t, s],
      [t - i + o / 2, s],
      [t - i + o / 2, n],
      [s, n],
      [0, n - i],
      [s, n - 2 * i],
      [s, n - i - o / 2],
      [t - i - o / 2, n - i - o / 2],
      [t - i - o / 2, s],
      [t - 2 * i, s]
    ]);
  },
  bentArrow: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 25e3), o = Math.min(Math.min(t, n) * f(r, "adj2", 25e3), n / 2), i = o;
    return p([
      [0, n],
      [0, i - e / 2],
      [t - o, i - e / 2],
      [t - o, i - o],
      [t, i],
      [t - o, i + o],
      [t - o, i + e / 2],
      [e, i + e / 2],
      [e, n]
    ]);
  },
  uturnArrow: (t, n, r) => {
    const e = Math.min(t / 3, t * Math.max(f(r, "adj1", 25e3), 0.08)), o = e / 2, i = Math.min(e * 1.1, t / 4), s = Math.min(n / 3, i * 1.6), c = t - i, l = (c + o) / 2, u = Math.min(l, n - s - 4);
    return `M 0 ${a(n)} L 0 ${a(u)} A ${a(l)} ${a(u)} 0 0 1 ${a(l * 2)} ${a(u)} L ${a(c + o)} ${a(n - s)} L ${a(c + i)} ${a(n - s)} L ${a(c)} ${a(n)} L ${a(c - i)} ${a(n - s)} L ${a(c - o)} ${a(n - s)} L ${a(c - o)} ${a(u)} A ${a(l - e)} ${a(u - e)} 0 0 0 ${a(e)} ${a(u)} L ${a(e)} ${a(n)} Z`;
  },
  curvedRightArrow: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 25e3), 0.5), o = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.4);
    return nt(0, n, t - o, n - o, e, o, 270, 360);
  },
  curvedLeftArrow: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 25e3), 0.5), o = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.4);
    return nt(t, n, t - o, n - o, e, o, 270, 180);
  },
  curvedUpArrow: (t, n, r) => {
    const e = t * Math.min(f(r, "adj1", 25e3), 0.5), o = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.4);
    return nt(t, n, t - o, n - o, e, o, 180, 270);
  },
  curvedDownArrow: (t, n, r) => {
    const e = t * Math.min(f(r, "adj1", 25e3), 0.5), o = Math.min(t, n) * Math.min(f(r, "adj3", 25e3), 0.4);
    return nt(t, 0, t - o, n - o, e, o, 180, 90);
  },
  stripedRightArrow: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 5e4), 1) / 2, o = Math.min(t, n * f(r, "adj2", 5e4)), i = n / 2, s = t * 0.05;
    return p([[s * 2.4, i - e], [t - o, i - e], [t - o, 0], [t, i], [t - o, n], [t - o, i + e], [s * 2.4, i + e]]) + " " + p([[0, i - e], [s, i - e], [s, i + e], [0, i + e]]) + " " + p([[s * 1.4, i - e], [s * 2, i - e], [s * 2, i + e], [s * 1.4, i + e]]);
  },
  notchedRightArrow: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 5e4), 1) / 2, o = Math.min(t, n * f(r, "adj2", 5e4)), i = n / 2;
    return p([
      [0, i - e],
      [t - o, i - e],
      [t - o, 0],
      [t, i],
      [t - o, n],
      [t - o, i + e],
      [0, i + e],
      [o * 0.5, i]
    ]);
  },
  circularArrow: (t, n, r) => {
    const e = Math.min(t, n) / 2, o = e * Math.min(Math.max(f(r, "adj1", 12500), 0.06), 0.35), i = o * 1.6, s = e - i;
    return nt(t / 2, n / 2, s, s, o, i, 200, 450);
  },
  leftCircularArrow: (t, n, r) => {
    const e = Math.min(t, n) / 2, o = e * Math.min(Math.max(f(r, "adj1", 12500), 0.06), 0.35), i = o * 1.6;
    return nt(t / 2, n / 2, e - i, e - i, o, i, -20, -270);
  },
  leftRightCircularArrow: (t, n, r) => {
    const e = Math.min(t, n) / 2, o = e * Math.min(Math.max(f(r, "adj1", 12500), 0.06), 0.35), i = o * 1.6;
    return nt(t / 2, n / 2, e - i, e - i, o, i, 200, 430, !0);
  },
  swooshArrow: (t, n, r) => {
    const e = Math.min(t, n), o = e * Math.min(Math.max(f(r, "adj2", 16667), 0.04), 0.4), i = e * Math.min(Math.max(f(r, "adj1", 25e3), 0.08), 0.6), s = o * 1.6;
    return `M 0 ${a(n)} Q ${a(t * 0.65)} ${a(n * 0.95)} ${a(t - i * 1.2)} ${a(i * 0.1)} L ${a(t)} 0 L ${a(t - i * 0.1)} ${a(i * 1.2)} Q ${a(t * 0.65 - s)} ${a(n * 0.95 - s)} 0 ${a(n)} Z`;
  },
  rightArrowCallout: $t("r"),
  leftArrowCallout: $t("l"),
  upArrowCallout: $t("u"),
  downArrowCallout: $t("d"),
  leftRightArrowCallout: (t, n, r) => {
    const e = n * f(r, "adj1", 18515) / 2, o = Math.min(t / 3, n * f(r, "adj2", 18515)), i = t * f(r, "adj4", 48123), s = n / 2, c = (t - i) / 2, l = (t + i) / 2;
    return p([
      [0, s],
      [o, 0],
      [o, s - e],
      [c, s - e],
      [c, 0],
      [l, 0],
      [l, s - e],
      [t - o, s - e],
      [t - o, 0],
      [t, s],
      [t - o, n],
      [t - o, s + e],
      [l, s + e],
      [l, n],
      [c, n],
      [c, s + e],
      [o, s + e],
      [o, n]
    ]);
  },
  upDownArrowCallout: (t, n, r) => {
    const e = t * f(r, "adj1", 18515) / 2, o = Math.min(t / 2, e + t * f(r, "adj2", 18515)), i = Math.min(n * 0.3, t * f(r, "adj3", 18515)), s = Math.max(0, Math.min(n * f(r, "adj4", 48123), n - 2.4 * i)), c = t / 2, l = (n - s) / 2, u = (n + s) / 2;
    return p([
      [c, 0],
      [c + o, i],
      [c + e, i],
      [c + e, l],
      [t, l],
      [t, u],
      [c + e, u],
      [c + e, n - i],
      [c + o, n - i],
      [c, n],
      [c - o, n - i],
      [c - e, n - i],
      [c - e, u],
      [0, u],
      [0, l],
      [c - e, l],
      [c - e, i],
      [c - o, i]
    ]);
  },
  quadArrowCallout: (t, n, r) => {
    const e = Math.min(t, n), o = e * f(r, "adj3", 18515), i = e * f(r, "adj2", 18515) / 2, s = Math.min(Math.max(e * f(r, "adj4", 48123) / 2, i * 1.2), e / 2 - o), c = t / 2, l = n / 2;
    return p([
      [c, 0],
      [c + o, o],
      [c + i, o],
      [c + i, l - s],
      [c + s, l - s],
      [c + s, l - i],
      [t - o, l - i],
      [t - o, l - o],
      [t, l],
      [t - o, l + o],
      [t - o, l + i],
      [c + s, l + i],
      [c + s, l + s],
      [c + i, l + s],
      [c + i, n - o],
      [c + o, n - o],
      [c, n],
      [c - o, n - o],
      [c - i, n - o],
      [c - i, l + s],
      [c - s, l + s],
      [c - s, l + i],
      [o, l + i],
      [o, l + o],
      [0, l],
      [o, l - o],
      [o, l - i],
      [c - s, l - i],
      [c - s, l - s],
      [c - i, l - s],
      [c - i, o],
      [c - o, o]
    ]);
  },
  // 数学符号
  mathPlus: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2, o = t / 2, i = n / 2, s = t * 0.45, c = n * 0.45;
    return p([
      [o - e, i - c],
      [o + e, i - c],
      [o + e, i - e],
      [o + s, i - e],
      [o + s, i + e],
      [o + e, i + e],
      [o + e, i + c],
      [o - e, i + c],
      [o - e, i + e],
      [o - s, i + e],
      [o - s, i - e],
      [o - e, i - e]
    ]);
  },
  mathMinus: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2;
    return p([[t * 0.05, n / 2 - e], [t * 0.95, n / 2 - e], [t * 0.95, n / 2 + e], [t * 0.05, n / 2 + e]]);
  },
  mathMultiply: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2, o = t / 2, i = n / 2, s = Math.min(t, n) * 0.42, c = e * Math.SQRT2;
    return p([
      [o - s, i - s + c],
      [o - s + c, i - s],
      [o, i - c],
      [o + s - c, i - s],
      [o + s, i - s + c],
      [o + c, i],
      [o + s, i + s - c],
      [o + s - c, i + s],
      [o, i + c],
      [o - s + c, i + s],
      [o - s, i + s - c],
      [o - c, i]
    ]);
  },
  mathDivide: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2, o = Math.min(t, n) * 0.09;
    return p([[t * 0.08, n / 2 - e], [t * 0.92, n / 2 - e], [t * 0.92, n / 2 + e], [t * 0.08, n / 2 + e]]) + " " + x(t / 2, n * 0.22, o, o) + " " + x(t / 2, n * 0.78, o, o);
  },
  mathEqual: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2, o = n * f(r, "adj2", 11760);
    return p([[t * 0.05, n / 2 - o - e], [t * 0.95, n / 2 - o - e], [t * 0.95, n / 2 - o + e], [t * 0.05, n / 2 - o + e]]) + " " + p([[t * 0.05, n / 2 + o - e], [t * 0.95, n / 2 + o - e], [t * 0.95, n / 2 + o + e], [t * 0.05, n / 2 + o + e]]);
  },
  mathNotEqual: (t, n, r) => {
    const e = Math.min(t, n) * f(r, "adj1", 23520) / 2, o = n * 0.16;
    return p([[t * 0.05, n / 2 - o - e], [t * 0.95, n / 2 - o - e], [t * 0.95, n / 2 - o + e], [t * 0.05, n / 2 - o + e]]) + " " + p([[t * 0.05, n / 2 + o - e], [t * 0.95, n / 2 + o - e], [t * 0.95, n / 2 + o + e], [t * 0.05, n / 2 + o + e]]) + " " + p([[t * 0.42, 0], [t * 0.56, 0], [t * 0.62, n], [t * 0.48, n]]);
  },
  // 括号
  leftBracket: (t, n, r) => {
    const e = Math.min(n / 2, n * f(r, "adj", 8333));
    return P(`M ${a(t)} 0 L ${a(e)} 0 A ${a(e)} ${a(e)} 0 0 0 0 ${a(e)} L 0 ${a(n - e)} A ${a(e)} ${a(e)} 0 0 0 ${a(e)} ${a(n)} L ${a(t)} ${a(n)}`);
  },
  rightBracket: (t, n, r) => {
    const e = Math.min(n / 2, n * f(r, "adj", 8333));
    return P(`M 0 0 L ${a(t - e)} 0 A ${a(e)} ${a(e)} 0 0 1 ${a(t)} ${a(e)} L ${a(t)} ${a(n - e)} A ${a(e)} ${a(e)} 0 0 1 ${a(t - e)} ${a(n)} L 0 ${a(n)}`);
  },
  bracketPair: (t, n, r) => {
    const e = Math.min(Math.min(t, n) / 2, Math.min(t, n) * f(r, "adj", 16667));
    return P(
      `M ${a(e)} 0 A ${a(e)} ${a(e)} 0 0 0 0 ${a(e)} L 0 ${a(n - e)} A ${a(e)} ${a(e)} 0 0 0 ${a(e)} ${a(n)} M ${a(t - e)} 0 A ${a(e)} ${a(e)} 0 0 1 ${a(t)} ${a(e)} L ${a(t)} ${a(n - e)} A ${a(e)} ${a(e)} 0 0 1 ${a(t - e)} ${a(n)}`
    );
  },
  leftBrace: (t, n, r) => {
    const e = Math.min(n / 4, n * f(r, "adj1", 8333)), o = n * f(r, "adj2", 5e4);
    return P(
      `M ${a(t)} 0 A ${a(t)} ${a(e)} 0 0 0 ${a(t / 2)} ${a(e)} L ${a(t / 2)} ${a(o - e)} A ${a(t / 2)} ${a(e)} 0 0 1 0 ${a(o)} A ${a(t / 2)} ${a(e)} 0 0 1 ${a(t / 2)} ${a(o + e)} L ${a(t / 2)} ${a(n - e)} A ${a(t)} ${a(e)} 0 0 0 ${a(t)} ${a(n)}`
    );
  },
  rightBrace: (t, n, r) => {
    const e = Math.min(n / 4, n * f(r, "adj1", 8333)), o = n * f(r, "adj2", 5e4);
    return P(
      `M 0 0 A ${a(t)} ${a(e)} 0 0 1 ${a(t / 2)} ${a(e)} L ${a(t / 2)} ${a(o - e)} A ${a(t / 2)} ${a(e)} 0 0 0 ${a(t)} ${a(o)} A ${a(t / 2)} ${a(e)} 0 0 0 ${a(t / 2)} ${a(o + e)} L ${a(t / 2)} ${a(n - e)} A ${a(t)} ${a(e)} 0 0 1 0 ${a(n)}`
    );
  },
  bracePair: (t, n, r) => {
    const e = Math.min(n / 4, n * f(r, "adj", 8333)), o = t / 4;
    return P(
      `M ${a(o)} 0 A ${a(o)} ${a(e)} 0 0 0 ${a(o)} ${a(e)} L ${a(o)} ${a(n / 2 - e)} A ${a(o)} ${a(e)} 0 0 1 0 ${a(n / 2)} A ${a(o)} ${a(e)} 0 0 1 ${a(o)} ${a(n / 2 + e)} L ${a(o)} ${a(n - e)} A ${a(o)} ${a(e)} 0 0 0 ${a(o)} ${a(n)} M ${a(t - o)} 0 A ${a(o)} ${a(e)} 0 0 1 ${a(t - o)} ${a(e)} L ${a(t - o)} ${a(n / 2 - e)} A ${a(o)} ${a(e)} 0 0 0 ${a(t)} ${a(n / 2)} A ${a(o)} ${a(e)} 0 0 0 ${a(t - o)} ${a(n / 2 + e)} L ${a(t - o)} ${a(n - e)} A ${a(o)} ${a(e)} 0 0 1 ${a(t - o)} ${a(n)}`
    );
  },
  // 缎带 / 卷轴 / 波浪
  ribbon: (t, n, r) => {
    const e = n * f(r, "adj1", 16667), o = t * f(r, "adj2", 5e4) / 2, i = t / 2, s = [[0, 0], [i - o, 0], [i - o + e, n * 0.5], [i - o, n], [0, n], [e, n * 0.5]], c = [[t, 0], [i + o, 0], [i + o - e, n * 0.5], [i + o, n], [t, n], [t - e, n * 0.5]], l = [[i - o, 0], [i + o, 0], [i + o, n], [i - o, n]];
    return p(s) + " " + p(c) + " " + p(l);
  },
  ribbon2: (t, n, r) => {
    const e = n * f(r, "adj1", 16667), o = t * f(r, "adj2", 5e4) / 2, i = t / 2, s = [[i - o, n], [i + o, n], [i + o, 0], [i - o, 0]], c = [[0, n], [i - o, n], [i - o + e, n * 0.5], [i - o, 0], [0, 0], [e, n * 0.5]], l = [[t, n], [i + o, n], [i + o - e, n * 0.5], [i + o, 0], [t, 0], [t - e, n * 0.5]];
    return p(s) + " " + p(c) + " " + p(l);
  },
  ellipseRibbon: (t, n, r) => {
    const e = n * Math.min(f(r, "adj3", 12500) * 2, 0.5), o = n * Math.min(f(r, "adj1", 25e3), 0.35), i = t * Math.min(f(r, "adj2", 5e4) / 2, 0.3), s = n * 0.12, c = `M 0 ${a(o)} Q ${a(t / 2)} ${a(-o)} ${a(t)} ${a(o)} L ${a(t)} ${a(o + e)} Q ${a(t / 2)} ${a(e - o)} 0 ${a(o + e)} Z`, l = (u) => p([[u, o + e * 0.2], [u + i, o + e * 0.2], [u + i, n], [u + i / 2, n - s], [u, n]]);
    return `${c} ${l(0)} ${l(t - i)}`;
  },
  ellipseRibbon2: (t, n, r) => {
    const e = n * Math.min(f(r, "adj3", 12500) * 2, 0.5), o = n * Math.min(f(r, "adj1", 25e3), 0.35), i = t * Math.min(f(r, "adj2", 5e4) / 2, 0.3), s = n * 0.12, c = `M 0 ${a(n - o)} Q ${a(t / 2)} ${a(n + o)} ${a(t)} ${a(n - o)} L ${a(t)} ${a(n - o - e)} Q ${a(t / 2)} ${a(n + o - e)} 0 ${a(n - o - e)} Z`, l = (u) => p([[u, n - o - e * 0.2], [u + i, n - o - e * 0.2], [u + i, 0], [u + i / 2, s], [u, 0]]);
    return `${c} ${l(0)} ${l(t - i)}`;
  },
  leftRightRibbon: (t, n, r) => {
    const e = Math.min(n * Math.min(f(r, "adj1", 5e4), 1) / 2, n / 4), o = t * Math.min(f(r, "adj2", 5e4), 0.9) / 2, i = Math.min((t / 2 - o) * 0.6, Math.max(n * f(r, "adj3", 16667) * 2, 1)), s = e * 1.8, c = t / 2, l = n / 2;
    return p([
      [0, l],
      [i, l - s],
      [i, l - e],
      [c - o, l - e],
      [c - o, 0],
      [c + o, 0],
      [c + o, l - e],
      [t - i, l - e],
      [t - i, l - s],
      [t, l],
      [t - i, l + s],
      [t - i, l + e],
      [c + o, l + e],
      [c + o, n],
      [c - o, n],
      [c - o, l + e],
      [i, l + e],
      [i, l + s]
    ]);
  },
  verticalScroll: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 12500), 0.25);
    return `M ${a(e)} ${a(e)} L ${a(e)} ${a(n - e)} A ${a(e)} ${a(e)} 0 0 0 ${a(e * 2)} ${a(n)} L ${a(t)} ${a(n)} L ${a(t)} ${a(e)} A ${a(e)} ${a(e)} 0 0 0 ${a(t - e * 2)} ${a(e)} Z M ${a(e)} ${a(e)} A ${a(e)} ${a(e)} 0 0 1 ${a(e * 2)} 0 L ${a(t - e)} 0 A ${a(e)} ${a(e)} 0 0 1 ${a(t - e * 2)} ${a(e)} Z`;
  },
  horizontalScroll: (t, n, r) => {
    const e = Math.min(t, n) * Math.min(f(r, "adj", 12500), 0.25);
    return `M ${a(e)} ${a(e)} L ${a(t - e)} ${a(e)} A ${a(e)} ${a(e)} 0 0 1 ${a(t)} ${a(e * 2)} L ${a(t)} ${a(n)} L ${a(e * 2)} ${a(n)} A ${a(e)} ${a(e)} 0 0 1 ${a(e)} ${a(n - e * 2)} Z M ${a(e)} ${a(e)} A ${a(e)} ${a(e)} 0 0 0 0 ${a(e * 2)} L 0 ${a(n - e)} A ${a(e)} ${a(e)} 0 0 0 ${a(e)} ${a(n - e * 2)} Z`;
  },
  wave: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 12500), 0.4);
    return `M 0 ${a(e)} ${mt(e, t, e, !1)} L ${a(t)} ${a(n - e)} ${mt(n - e, t, e, !0)} Z`;
  },
  doubleWave: (t, n, r) => {
    const e = n * Math.min(f(r, "adj1", 6250), 0.25), o = t / 8, i = `C ${a(o)} ${a(e - e * 2)} ${a(o * 3)} ${a(e + e * 2)} ${a(t / 2)} ${a(e)} C ${a(t / 2 + o)} ${a(e - e * 2)} ${a(t / 2 + o * 3)} ${a(e + e * 2)} ${a(t)} ${a(e)}`, s = `C ${a(t - o)} ${a(n - e + e * 2)} ${a(t - o * 3)} ${a(n - e - e * 2)} ${a(t / 2)} ${a(n - e)} C ${a(t / 2 - o)} ${a(n - e + e * 2)} ${a(t / 2 - o * 3)} ${a(n - e - e * 2)} 0 ${a(n - e)}`;
    return `M 0 ${a(e)} ${i} L ${a(t)} ${a(n - e)} ${s} Z`;
  },
  // 标注
  wedgeRectCallout: (t, n, r) => {
    const { x1: e, x2: o, y1: i, y2: s, top: c, right: l, bottom: u, left: d } = Ht(t, n, r);
    return p([
      [0, 0],
      [e, 0],
      c,
      [o, 0],
      [t, 0],
      [t, i],
      l,
      [t, s],
      [t, n],
      [o, n],
      u,
      [e, n],
      [0, n],
      [0, s],
      d,
      [0, i]
    ]);
  },
  wedgeRoundRectCallout: (t, n, r) => {
    const { x1: e, x2: o, y1: i, y2: s, top: c, right: l, bottom: u, left: d } = Ht(t, n, r), $ = Math.min(t, n) * f(r, "adj3", 16667), g = (C, h) => `A ${a($)} ${a($)} 0 0 1 ${a(C)} ${a(h)}`, b = (...C) => C.map(([h, S]) => `L ${a(h)} ${a(S)}`).join(" ");
    return [
      `M 0 ${a($)}`,
      g($, 0),
      b([e, 0], c, [o, 0], [t - $, 0]),
      g(t, $),
      b([t, i], l, [t, s], [t, n - $]),
      g(t - $, n),
      b([o, n], u, [e, n], [$, n]),
      g(0, n - $),
      b([0, s], d, [0, i]),
      "Z"
    ].join(" ");
  },
  wedgeEllipseCallout: (t, n, r) => {
    const [e, o] = xt(t, n, r), i = t / 2, s = n / 2, c = Math.atan2(o - s, e - i) * 180 / Math.PI, [l, u] = y(i, s, t / 2, n / 2, c + 8);
    return `M ${a(l)} ${a(u)} ${E(i, s, t / 2, n / 2, c + 8, 344)} L ${a(e)} ${a(o)} Z`;
  },
  cloudCallout: (t, n, r) => {
    const [e, o] = xt(t, n, r);
    return ot.cloud(t, n * 0.8, {}) + " " + x(t * 0.36, n * 0.88, t * 0.045, n * 0.045) + " " + x(e, o, t * 0.025, n * 0.025);
  },
  borderCallout1: _(1, !1),
  borderCallout2: _(2, !1),
  borderCallout3: _(3, !1),
  callout1: _(1, !1),
  callout2: _(2, !1),
  callout3: _(3, !1),
  accentCallout1: _(1, !0),
  accentCallout2: _(2, !0),
  accentCallout3: _(3, !0),
  accentBorderCallout1: _(1, !0),
  accentBorderCallout2: _(2, !0),
  accentBorderCallout3: _(3, !0),
  // 流程图
  flowChartProcess: (t, n) => p([[0, 0], [t, 0], [t, n], [0, n]]),
  flowChartAlternateProcess: (t, n) => {
    const r = Math.min(t, n) * 0.1667;
    return Xt(t, n, [r, r, r, r], ["r", "r", "r", "r"]);
  },
  flowChartDecision: (t, n) => p([[t / 2, 0], [t, n / 2], [t / 2, n], [0, n / 2]]),
  flowChartInputOutput: (t, n) => p([[t * 0.2, 0], [t, 0], [t * 0.8, n], [0, n]]),
  flowChartPredefinedProcess: (t, n) => p([[0, 0], [t, 0], [t, n], [0, n]]) + " " + N([[t / 8, 0], [t / 8, n]]) + " " + N([[t * 7 / 8, 0], [t * 7 / 8, n]]),
  flowChartInternalStorage: (t, n) => p([[0, 0], [t, 0], [t, n], [0, n]]) + " " + N([[t / 8, 0], [t / 8, n]]) + " " + N([[0, n / 8], [t, n / 8]]),
  flowChartDocument: (t, n) => `M 0 0 L ${a(t)} 0 L ${a(t)} ${a(n * 0.84)} C ${a(t * 0.75)} ${a(n * 1.06)} ${a(t * 0.25)} ${a(n * 0.62)} 0 ${a(n * 0.84)} Z`,
  flowChartMultidocument: (t, n) => `M 0 ${a(n * 0.2)} L ${a(t * 0.9)} ${a(n * 0.2)} L ${a(t * 0.9)} ${a(n * 0.86)} C ${a(t * 0.68)} ${a(n * 1.04)} ${a(t * 0.22)} ${a(n * 0.66)} 0 ${a(n * 0.86)} Z ` + N([[t * 0.05, n * 0.1], [t * 0.95, n * 0.1], [t * 0.95, n * 0.76]]) + " " + N([[t * 0.1, 0], [t, 0], [t, n * 0.66]]),
  flowChartTerminator: (t, n) => {
    const r = Math.min(n / 2, t / 2);
    return `M ${a(r)} 0 L ${a(t - r)} 0 A ${a(r)} ${a(n / 2)} 0 0 1 ${a(t - r)} ${a(n)} L ${a(r)} ${a(n)} A ${a(r)} ${a(n / 2)} 0 0 1 ${a(r)} 0 Z`;
  },
  flowChartPreparation: (t, n) => p([[t * 0.2, 0], [t * 0.8, 0], [t, n / 2], [t * 0.8, n], [t * 0.2, n], [0, n / 2]]),
  flowChartManualInput: (t, n) => p([[0, n * 0.2], [t, 0], [t, n], [0, n]]),
  flowChartManualOperation: (t, n) => p([[0, 0], [t, 0], [t * 0.8, n], [t * 0.2, n]]),
  flowChartConnector: (t, n) => x(t / 2, n / 2, t / 2, n / 2),
  flowChartOffpageConnector: (t, n) => p([[0, 0], [t, 0], [t, n * 0.8], [t / 2, n], [0, n * 0.8]]),
  flowChartPunchedCard: (t, n) => p([[t * 0.2, 0], [t, 0], [t, n], [0, n], [0, n * 0.2]]),
  flowChartPunchedTape: (t, n) => `M 0 ${a(n * 0.11)} ${mt(n * 0.11, t, n * 0.11, !1)} L ${a(t)} ${a(n * 0.89)} ${mt(n * 0.89, t, n * 0.11, !0)} Z`,
  flowChartSummingJunction: (t, n) => x(t / 2, n / 2, t / 2, n / 2) + " " + N([[t * 0.1464, n * 0.1464], [t * (1 - 0.1464), n * (1 - 0.1464)]]) + " " + N([[t * (1 - 0.1464), n * 0.1464], [t * 0.1464, n * (1 - 0.1464)]]),
  flowChartOr: (t, n) => x(t / 2, n / 2, t / 2, n / 2) + " " + N([[t / 2, 0], [t / 2, n]]) + " " + N([[0, n / 2], [t, n / 2]]),
  flowChartCollate: (t, n) => p([[0, 0], [t, 0], [t / 2, n / 2], [t, n], [0, n], [t / 2, n / 2]]),
  flowChartSort: (t, n) => p([[t / 2, 0], [t, n / 2], [t / 2, n], [0, n / 2]]) + " " + N([[0, n / 2], [t, n / 2]]),
  flowChartExtract: (t, n) => p([[t / 2, 0], [t, n], [0, n]]),
  flowChartMerge: (t, n) => p([[0, 0], [t, 0], [t / 2, n]]),
  flowChartOnlineStorage: (t, n) => `M ${a(t * 0.16)} 0 L ${a(t)} 0 A ${a(t * 0.16)} ${a(n / 2)} 0 0 0 ${a(t)} ${a(n)} L ${a(t * 0.16)} ${a(n)} A ${a(t * 0.16)} ${a(n / 2)} 0 0 1 ${a(t * 0.16)} 0 Z`,
  flowChartOfflineStorage: (t, n) => p([[0, 0], [t, 0], [t / 2, n]]) + " " + N([[t * 0.1, n * 0.2], [t * 0.9, n * 0.2]]),
  flowChartMagneticTape: (t, n) => x(t / 2, n * 0.46, t / 2, n * 0.46) + ` M ${a(t * 0.5)} ${a(n * 0.92)} L ${a(t)} ${a(n * 0.92)} L ${a(t)} ${a(n)} L ${a(t * 0.5)} ${a(n)} Z`,
  flowChartMagneticDisk: (t, n) => ot.can(t, n, { adj: 25e3 }),
  flowChartMagneticDrum: (t, n) => {
    const r = Math.min(t / 2, t * 0.125);
    return `M ${a(r)} 0 L ${a(t - r)} 0 ${E(t - r, n / 2, r, n / 2, -90, 180)} L ${a(r)} ${a(n)} ${E(r, n / 2, r, n / 2, 90, 180)} Z ` + Zt(t - r, n / 2, r, n / 2);
  },
  flowChartDisplay: (t, n) => `M ${a(t * 0.16)} 0 L ${a(t * 0.84)} 0 A ${a(t * 0.16)} ${a(n / 2)} 0 0 1 ${a(t * 0.84)} ${a(n)} L ${a(t * 0.16)} ${a(n)} L 0 ${a(n / 2)} Z`,
  flowChartDelay: (t, n) => `M 0 0 L ${a(t / 2)} 0 A ${a(t / 2)} ${a(n / 2)} 0 0 1 ${a(t / 2)} ${a(n)} L 0 ${a(n)} Z`,
  // 动作按钮
  actionButtonBlank: (t, n) => vt(t, n, Math.min(t, n) * 0.125),
  actionButtonHome: (t, n) => U(t, n, (r, e, o) => p([[e, o - r], [e + r, o], [e + r * 0.6, o], [e + r * 0.6, o + r], [e - r * 0.6, o + r], [e - r * 0.6, o], [e - r, o]])),
  actionButtonForwardNext: (t, n) => U(t, n, (r, e, o) => p([[e - r * 0.6, o - r], [e + r * 0.7, o], [e - r * 0.6, o + r]])),
  actionButtonBackPrevious: (t, n) => U(t, n, (r, e, o) => p([[e + r * 0.6, o - r], [e - r * 0.7, o], [e + r * 0.6, o + r]])),
  actionButtonBeginning: (t, n) => U(t, n, (r, e, o) => p([[e + r * 0.7, o - r], [e - r * 0.3, o], [e + r * 0.7, o + r]]) + " " + p([[e - r * 0.7, o - r], [e - r * 0.45, o - r], [e - r * 0.45, o + r], [e - r * 0.7, o + r]])),
  actionButtonEnd: (t, n) => U(t, n, (r, e, o) => p([[e - r * 0.7, o - r], [e + r * 0.3, o], [e - r * 0.7, o + r]]) + " " + p([[e + r * 0.45, o - r], [e + r * 0.7, o - r], [e + r * 0.7, o + r], [e + r * 0.45, o + r]])),
  actionButtonInformation: (t, n) => U(t, n, (r, e, o) => x(e, o, r, r) + " " + x(e, o - r * 0.45, r * 0.16, r * 0.16) + " " + p([[e - r * 0.16, o - r * 0.15], [e + r * 0.16, o - r * 0.15], [e + r * 0.16, o + r * 0.6], [e - r * 0.16, o + r * 0.6]])),
  actionButtonReturn: (t, n) => U(t, n, (r, e, o) => `M ${a(e - r * 0.6)} ${a(o + r * 0.7)} L ${a(e + r * 0.2)} ${a(o + r * 0.7)} A ${a(r * 0.5)} ${a(r * 0.5)} 0 0 0 ${a(e + r * 0.2)} ${a(o - r * 0.3)} L ${a(e - r * 0.2)} ${a(o - r * 0.3)} M ${a(e - r * 0.2)} ${a(o - r * 0.6)} L ${a(e - r * 0.6)} ${a(o - r * 0.3)} L ${a(e - r * 0.2)} ${a(o)} Z`),
  actionButtonDocument: (t, n) => U(t, n, (r, e, o) => p([[e - r * 0.55, o - r * 0.8], [e + r * 0.2, o - r * 0.8], [e + r * 0.55, o - r * 0.45], [e + r * 0.55, o + r * 0.8], [e - r * 0.55, o + r * 0.8]])),
  actionButtonSound: (t, n) => U(t, n, (r, e, o) => p([[e - r * 0.7, o - r * 0.3], [e - r * 0.3, o - r * 0.3], [e + r * 0.1, o - r * 0.8], [e + r * 0.1, o + r * 0.8], [e - r * 0.3, o + r * 0.3], [e - r * 0.7, o + r * 0.3]]) + " " + N([[e + r * 0.35, o - r * 0.4], [e + r * 0.75, o - r * 0.6]]) + " " + N([[e + r * 0.35, o], [e + r * 0.8, o]]) + " " + N([[e + r * 0.35, o + r * 0.4], [e + r * 0.75, o + r * 0.6]])),
  actionButtonMovie: (t, n) => U(t, n, (r, e, o) => p([
    [e - r * 0.8, o - r * 0.5],
    [e + r * 0.35, o - r * 0.5],
    [e + r * 0.35, o - r * 0.15],
    [e + r * 0.8, o - r * 0.45],
    [e + r * 0.8, o + r * 0.45],
    [e + r * 0.35, o + r * 0.15],
    [e + r * 0.35, o + r * 0.5],
    [e - r * 0.8, o + r * 0.5]
  ])),
  actionButtonHelp: (t, n) => U(t, n, (r, e, o) => `M ${a(e - r * 0.35)} ${a(o - r * 0.3)} A ${a(r * 0.35)} ${a(r * 0.35)} 0 1 1 ${a(e)} ${a(o + r * 0.1)} L ${a(e)} ${a(o + r * 0.35)} ` + x(e, o + r * 0.68, r * 0.13, r * 0.13)),
  // 符号 / 连接线
  chartX: (t, n) => P(`M 0 0 L ${a(t)} ${a(n)} M ${a(t)} 0 L 0 ${a(n)}`),
  chartPlus: (t, n) => P(`M ${a(t / 2)} 0 L ${a(t / 2)} ${a(n)} M 0 ${a(n / 2)} L ${a(t)} ${a(n / 2)}`),
  chartStar: (t, n) => P(`M 0 0 L ${a(t)} ${a(n)} M ${a(t)} 0 L 0 ${a(n)} M ${a(t / 2)} 0 L ${a(t / 2)} ${a(n)}`),
  line: (t, n) => P(`M 0 0 L ${a(t)} ${a(n)}`),
  lineInv: (t, n) => P(`M 0 ${a(n)} L ${a(t)} 0`),
  straightConnector1: (t, n) => P(`M 0 0 L ${a(t)} ${a(n)}`),
  bentConnector2: (t, n) => P(`M 0 0 L ${a(t)} 0 L ${a(t)} ${a(n)}`),
  bentConnector3: (t, n, r) => {
    const e = t * f(r, "adj1", 5e4);
    return P(`M 0 0 L ${a(e)} 0 L ${a(e)} ${a(n)} L ${a(t)} ${a(n)}`);
  },
  bentConnector4: (t, n, r) => {
    const e = t * f(r, "adj1", 5e4), o = n * f(r, "adj2", 5e4);
    return P(`M 0 0 L ${a(e)} 0 L ${a(e)} ${a(o)} L ${a(t)} ${a(o)} L ${a(t)} ${a(n)}`);
  },
  bentConnector5: (t, n, r) => {
    const e = t * f(r, "adj1", 5e4), o = n * f(r, "adj2", 5e4), i = t * f(r, "adj3", 5e4);
    return P(`M 0 0 L ${a(e)} 0 L ${a(e)} ${a(o)} L ${a(i)} ${a(o)} L ${a(i)} ${a(n)} L ${a(t)} ${a(n)}`);
  },
  curvedConnector2: (t, n) => P(`M 0 0 Q ${a(t)} 0 ${a(t)} ${a(n)}`),
  curvedConnector3: (t, n, r) => {
    const e = t * f(r, "adj1", 5e4);
    return P(`M 0 0 C ${a(e)} 0 ${a(e)} ${a(n)} ${a(t)} ${a(n)}`);
  },
  curvedConnector4: (t, n) => P(`M 0 0 C ${a(t * 0.5)} 0 ${a(t * 0.5)} ${a(n * 0.5)} ${a(t * 0.75)} ${a(n * 0.5)} S ${a(t)} ${a(n * 0.75)} ${a(t)} ${a(n)}`),
  curvedConnector5: (t, n) => P(`M 0 0 C ${a(t * 0.4)} 0 ${a(t * 0.4)} ${a(n * 0.5)} ${a(t * 0.5)} ${a(n * 0.5)} S ${a(t * 0.6)} ${a(n)} ${a(t)} ${a(n)}`)
};
function zn(t, n, r, e) {
  const o = ot[t] ?? ot.rect, i = Math.max(n, 0), s = Math.max(r, 0);
  let c;
  try {
    const u = o(i, s, e);
    c = typeof u == "string" ? { d: u, open: !1 } : u;
  } catch {
    return { d: ot.rect(i, s, {}), open: !1 };
  }
  const l = Math.max(i, s) * 20 + 1e3;
  for (const u of c.d.match(/-?\d+(?:\.\d+)?/g) ?? [])
    if (Math.abs(Number(u)) > l)
      return { d: ot.rect(i, s, {}), open: !1 };
  return c;
}
function Dn(t) {
  const n = (M(t, "uniqueId") ?? "").toLowerCase();
  if (/orgchart|hierarchy/.test(n)) return "hierarchy";
  if (/pyramid/.test(n)) return "pyramid";
  if (/radial|cycle.*matrix/.test(n)) return "radial";
  if (/cycle|gear/.test(n)) return "cycle";
  if (/matrix|grid/.test(n)) return "snake";
  const r = /* @__PURE__ */ new Set(), e = (o, i) => {
    if (!(!o || i < 0))
      for (let s = o.firstElementChild; s; s = s.nextElementSibling) {
        if (s.localName === "alg") {
          const c = M(s, "type");
          c && r.add(c);
        }
        e(s, i - 1);
      }
  };
  return e(t, 12), r.has("hierRoot") || r.has("hierChild") ? "hierarchy" : r.has("pyra") ? "pyramid" : r.has("cycle") ? "cycle" : r.has("snake") ? "snake" : r.has("sp") && !r.has("lin") ? "radial" : "linear";
}
function On(t) {
  const n = (M(t, "uniqueId") ?? "").toLowerCase();
  if (/vlist|vertical|^.*\/list1$/.test(n)) return !0;
  const r = t == null ? void 0 : t.getElementsByTagName("*");
  for (let e = 0; r && e < r.length; e++)
    if (r[e].localName === "param" && M(r[e], "type") === "linDir")
      return M(r[e], "val") === "fromT" || M(r[e], "val") === "fromB";
  return !1;
}
function Zn(t) {
  if (!t) return [];
  const n = t.localName === "dataModel" ? t : m(t, "dataModel"), r = m(n, "ptLst"), e = m(n, "cxnLst");
  if (!r) return [];
  const o = /* @__PURE__ */ new Map();
  let i = null;
  for (const u of Z(r, "pt")) {
    const d = M(u, "modelId");
    if (!d) continue;
    const $ = M(u, "type") ?? "node";
    $ === "parTrans" || $ === "sibTrans" || $ === "pres" || ($ === "doc" && (i = d), o.set(d, { id: d, txBody: m(u, "t"), kids: [] }));
  }
  for (const u of Z(e, "cxn")) {
    if ((M(u, "type") ?? "parOf") !== "parOf") continue;
    const $ = M(u, "srcId"), g = M(u, "destId");
    if (!$ || !g) continue;
    const b = o.get($);
    !b || !o.has(g) || b.kids.push({ id: g, ord: j(u, "srcOrd") ?? 0 });
  }
  const s = /* @__PURE__ */ new Set(), c = (u, d) => {
    if (s.has(u) || d > 12) return null;
    s.add(u);
    const $ = o.get(u);
    return $ ? ($.kids.sort((g, b) => g.ord - b.ord), {
      id: u,
      text: null,
      children: $.kids.map((g) => c(g.id, d + 1)).filter((g) => g !== null),
      depth: d
    }) : null;
  };
  if (i) {
    const u = c(i, -1);
    return u ? u.children : [];
  }
  const l = /* @__PURE__ */ new Set();
  for (const u of o.values()) for (const d of u.kids) l.add(d.id);
  return [...o.keys()].filter((u) => !l.has(u)).map((u) => c(u, 0)).filter((u) => u !== null);
}
function Hn(t, n) {
  const r = (t == null ? void 0 : t.localName) === "dataModel" ? t : m(t, "dataModel");
  for (const e of Z(m(r, "ptLst"), "pt"))
    if (M(e, "modelId") === n) return m(e, "t");
  return null;
}
function _n(t) {
  if (!t) return [];
  const n = [], r = Z(t, "styleLbl"), e = r.find((i) => (M(i, "name") ?? "").startsWith("node")) ?? r[0], o = m(e ?? null, "fillClrLst");
  for (let i = (o == null ? void 0 : o.firstElementChild) ?? null; i; i = i.nextElementSibling) {
    const s = M(i, "val");
    s && n.push(s);
  }
  return n;
}
function Un(t) {
  const n = [], r = (e) => {
    for (const o of e)
      n.push(o), r(o.children);
  };
  return r(t), n;
}
function Xn(t, n, r, e) {
  const o = t.length ? t : [];
  if (!o.length) return [];
  const i = (e ? r : n) * 0.04, s = o.length;
  if (e) {
    const u = (r - i * (s - 1)) / s, d = Math.min(n, u * 5);
    return o.map(($, g) => ({
      x: (n - d) / 2,
      y: g * (u + i),
      w: d,
      h: u,
      pt: $,
      prst: "roundRect",
      colorIdx: g
    }));
  }
  const c = (n - i * (s - 1)) / s, l = Math.min(r, c * 0.8);
  return o.map((u, d) => ({
    x: d * (c + i),
    y: (r - l) / 2,
    w: c,
    h: l,
    pt: u,
    prst: "roundRect",
    colorIdx: d
  }));
}
function qn(t, n, r) {
  const e = t.length;
  if (!e) return [];
  const o = Math.min(n, r) * (e <= 4 ? 0.34 : 0.28), i = o * 0.62, s = (n - o) / 2, c = (r - i) / 2;
  return t.map((l, u) => {
    const d = -Math.PI / 2 + u * 2 * Math.PI / e;
    return {
      x: n / 2 + s * Math.cos(d) - o / 2,
      y: r / 2 + c * Math.sin(d) - i / 2,
      w: o,
      h: i,
      pt: l,
      prst: "ellipse",
      colorIdx: u
    };
  });
}
function Wn(t, n, r) {
  const e = t.length;
  if (!e) return [];
  const o = r / e;
  return t.map((i, s) => {
    const c = (s + 1) / e * n;
    return { x: (n - c) / 2, y: s * o, w: c, h: o * 0.94, pt: i, prst: "trapezoid", colorIdx: s };
  });
}
function Yn(t, n, r) {
  const e = t.length;
  if (!e) return [];
  const o = Math.ceil(Math.sqrt(e)), i = Math.ceil(e / o), s = n * 0.03, c = r * 0.05, l = (n - s * (o - 1)) / o, u = (r - c * (i - 1)) / i;
  return t.map((d, $) => ({
    x: $ % o * (l + s),
    y: Math.floor($ / o) * (u + c),
    w: l,
    h: u,
    pt: d,
    prst: "roundRect",
    colorIdx: $
  }));
}
function Gn(t, n, r) {
  if (!t.length) return [];
  const [e, ...o] = t, i = Math.min(n, r) * 0.3, s = [{
    x: (n - i) / 2,
    y: (r - i) / 2,
    w: i,
    h: i,
    pt: e,
    prst: "ellipse",
    colorIdx: 0
  }], c = o.length, l = Math.min(n, r) * 0.26, u = l * 0.62;
  return o.forEach((d, $) => {
    const g = -Math.PI / 2 + $ * 2 * Math.PI / Math.max(c, 1);
    s.push({
      x: n / 2 + (n - l) / 2 * Math.cos(g) - l / 2,
      y: r / 2 + (r - u) / 2 * Math.sin(g) - u / 2,
      w: l,
      h: u,
      pt: d,
      prst: "ellipse",
      colorIdx: $ + 1
    });
  }), s;
}
function Qn(t, n, r) {
  const e = [], o = (l, u) => {
    if (l.length) {
      (e[u] ?? (e[u] = [])).push(...l);
      for (const d of l) o(d.children, u + 1);
    }
  };
  if (o(t, 0), !e.length) return [];
  const i = r / e.length, s = i * 0.62, c = [];
  return e.forEach((l, u) => {
    const d = n * 0.03, $ = (n - d * (l.length - 1)) / l.length;
    l.forEach((g, b) => {
      c.push({
        x: b * ($ + d),
        y: u * i + (i - s) / 2,
        w: $,
        h: s,
        pt: g,
        prst: "roundRect",
        colorIdx: u
      });
    });
  }), c;
}
const Vn = {
  linear: Xn,
  cycle: (t, n, r) => qn(t, n, r),
  pyramid: (t, n, r) => Wn(t, n, r),
  hierarchy: (t, n, r) => Qn(t, n, r),
  snake: (t, n, r) => Yn(t, n, r),
  radial: (t, n, r) => Gn(t, n, r)
};
function Kn(t, n, r, e) {
  const o = e.family === "hierarchy" ? t : Un(t), i = Vn[e.family](o, n, r, e.vertical);
  if (!i.length) return [];
  const s = [];
  if (e.family === "hierarchy") {
    const c = new Map(i.map((d) => [d.pt.id, d])), l = (d, $) => {
      const g = d.x + d.w / 2, b = d.y + d.h, C = $.x + $.w / 2, h = $.y, S = (b + h) / 2, A = Math.min(g, C), I = Math.min(b, h), H = Math.max(Math.abs(C - g), 1), B = Math.max(h - b, 1), v = `M ${g - A} 0 L ${g - A} ${S - I} L ${C - A} ${S - I} L ${C - A} ${B}`;
      s.push({
        kind: "shape",
        x: A,
        y: I,
        w: H,
        h: B,
        rot: 0,
        flipH: !1,
        flipV: !1,
        path: v,
        fill: null,
        stroke: { color: e.colors[0] ?? "rgb(68,114,196)", width: 1.5, dash: null },
        text: null,
        openGeom: !0,
        name: "SmartArt 连线"
      });
    }, u = (d) => {
      for (const $ of d) {
        const g = c.get($.id);
        for (const b of $.children) {
          const C = c.get(b.id);
          g && C && l(g, C);
        }
        u($.children);
      }
    };
    u(t);
  }
  for (const c of i) {
    const u = { type: "solid", color: e.colors[c.colorIdx % Math.max(e.colors.length, 1)] ?? "rgb(68,114,196)" }, d = zn(c.prst, c.w, c.h, {}), $ = {
      kind: "shape",
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      rot: 0,
      flipH: !1,
      flipV: !1,
      path: d.d,
      fill: u,
      stroke: null,
      text: e.textOf(c.pt.id),
      name: "SmartArt 节点"
    };
    s.push($);
  }
  return s;
}
function Jn(t, n, r, e, o, i) {
  const s = Ct(t), c = n ? Ct(n) : null, l = _n(r ? Ct(r) : null), u = (l.length ? l : ["accent1", "accent2", "accent3", "accent4", "accent5", "accent6"]).map((g) => /^[0-9a-f]{6}$/i.test(g) ? `#${g}` : `#${i.ctx.theme[i.ctx.clrMap[g] ?? g] ?? "4472C4"}`), d = [];
  return { elements: Kn(Zn(s), e, o, {
    family: Dn(c),
    vertical: On(c),
    colors: u,
    textOf(g) {
      d.push(g);
      const b = Tn(Hn(s, g), {
        ctx: i.ctx,
        fonts: i.fonts,
        chain: [],
        defaultColor: "rgb(255,255,255)",
        slideNum: 1
      });
      return b ? { ...b, anchor: "middle", paragraphs: b.paragraphs.map((C) => ({ ...C, align: "center" })) } : null;
    }
  }), nodes: d };
}
function wn(t, n, r, e, o, i) {
  return Jn(t, n, r, e, o, i).elements;
}
export {
  Jn as layoutDiagramXml,
  wn as renderDiagramXml
};
