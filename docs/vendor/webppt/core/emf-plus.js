import { metafileToSvg as Xt, setMetafileDecoder as Ut } from "./core.js";
import { zlibSync as Ht } from "../../fflate/esm/browser.js";
let Wt = 0;
const Gt = (e) => `${e}${(++Wt).toString(36)}`, u = (e) => Number.isFinite(e) ? String(Math.round(e * 100) / 100) : "0", st = (e) => e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), et = [1, 0, 0, 1, 0, 0];
function Y(e, t) {
  const [i, r, s, n, o, c] = e, [h, a, f, l, d, p] = t;
  return [
    h * i + f * r,
    a * i + l * r,
    h * s + f * n,
    a * s + l * n,
    h * o + f * c + d,
    a * o + l * c + p
  ];
}
function $(e, t, i) {
  return { x: e[0] * t + e[2] * i + e[4], y: e[1] * t + e[3] * i + e[5] };
}
function bt(e) {
  const t = Math.abs(e[0] * e[3] - e[1] * e[2]), i = Math.sqrt(t);
  return Number.isFinite(i) && i > 1e-9 ? i : 1;
}
function _t(e) {
  const t = Math.hypot(e[2], e[3]);
  return Number.isFinite(t) && t > 1e-9 ? t : 1;
}
class H {
  constructor(t, i = 0, r) {
    this.p = 0, this.dv = new DataView(t.buffer, t.byteOffset, t.byteLength), this.end = Math.min(r ?? t.length, t.length), this.p = i;
  }
  has(t) {
    return this.p + t <= this.end;
  }
  get left() {
    return Math.max(0, this.end - this.p);
  }
  skip(t) {
    this.p += t;
  }
  seek(t) {
    this.p = t;
  }
  u8() {
    return this.has(1) ? this.dv.getUint8(this.p++) : (this.p += 1, 0);
  }
  i16() {
    if (!this.has(2))
      return this.p += 2, 0;
    const t = this.dv.getInt16(this.p, !0);
    return this.p += 2, t;
  }
  u16() {
    if (!this.has(2))
      return this.p += 2, 0;
    const t = this.dv.getUint16(this.p, !0);
    return this.p += 2, t;
  }
  i32() {
    if (!this.has(4))
      return this.p += 4, 0;
    const t = this.dv.getInt32(this.p, !0);
    return this.p += 4, t;
  }
  u32() {
    if (!this.has(4))
      return this.p += 4, 0;
    const t = this.dv.getUint32(this.p, !0);
    return this.p += 4, t;
  }
  f32() {
    if (!this.has(4))
      return this.p += 4, 0;
    const t = this.dv.getFloat32(this.p, !0);
    return this.p += 4, Number.isFinite(t) ? t : 0;
  }
  /** COLORREF 0x00BBGGRR */
  color() {
    const t = this.u32();
    return Vt(t & 255, t >> 8 & 255, t >> 16 & 255);
  }
  /** 32 位点（EMF POINTL）*/
  ptL() {
    return { x: this.i32(), y: this.i32() };
  }
  /** 16 位点（EMF POINT16 / WMF POINT16）*/
  pt16() {
    return { x: this.i16(), y: this.i16() };
  }
  /** EMF RECTL：左上右下 */
  rectL() {
    return { l: this.i32(), t: this.i32(), r: this.i32(), b: this.i32() };
  }
  /** UTF-16LE 定长字符串（字节数），截到第一个 NUL */
  utf16(t) {
    let i = "";
    const r = t >> 1;
    for (let s = 0; s < r; s++) {
      const n = this.u16();
      if (n === 0) {
        this.skip((r - s - 1) * 2);
        break;
      }
      i += String.fromCharCode(n);
    }
    return i;
  }
  /** 单字节字符串（按 latin1 近似），截到第一个 NUL */
  ansi(t) {
    let i = "";
    for (let r = 0; r < t; r++) {
      const s = this.u8();
      if (s === 0) {
        this.skip(t - r - 1);
        break;
      }
      i += String.fromCharCode(s);
    }
    return i;
  }
  // ---- 以下为 PICT（QuickDraw）所需：它是大端，与 EMF/WMF 相反 ----
  get pos() {
    return this.p;
  }
  get limit() {
    return this.end;
  }
  i8() {
    return this.u8() << 24 >> 24;
  }
  /** 大端 16 位有符号 */
  i16be() {
    if (!this.has(2))
      return this.p += 2, 0;
    const t = this.dv.getInt16(this.p, !1);
    return this.p += 2, t;
  }
  /** 大端 16 位无符号 */
  u16be() {
    if (!this.has(2))
      return this.p += 2, 0;
    const t = this.dv.getUint16(this.p, !1);
    return this.p += 2, t;
  }
  /** 大端 32 位无符号 */
  u32be() {
    if (!this.has(4))
      return this.p += 4, 0;
    const t = this.dv.getUint32(this.p, !1);
    return this.p += 4, t;
  }
  /** 取 len 字节并前移；越界时按剩余长度截断 */
  take(t) {
    const i = Math.max(0, Math.min(t, this.end - this.p)), r = new Uint8Array(this.dv.buffer, this.dv.byteOffset + this.p, i);
    return this.p += t, r;
  }
}
const ft = (e) => (e & 255).toString(16).padStart(2, "0"), Vt = (e, t, i) => `#${ft(e)}${ft(t)}${ft(i)}`, zt = 1, Tt = 5, Zt = 1, Kt = 0, qt = 1, Jt = 2, Qt = 3, te = 4, at = 5, lt = 0, $t = 1, ee = 2, kt = 3, yt = 5, it = () => ({ kind: "pen", style: Kt, width: 1, color: "#000000", cap: 0, join: 0 }), Rt = () => ({ kind: "brush", style: lt, color: "#ffffff", hatch: 0, href: null }), mt = () => ({
  kind: "font",
  height: -12,
  escapement: 0,
  weight: 400,
  italic: !1,
  underline: !1,
  strike: !1,
  face: "Arial",
  charset: 0
}), ie = () => ({ ...it(), style: at }), K = (e) => ({ kind: "brush", style: lt, color: e, hatch: 0, href: null });
function se(e) {
  switch (e & 255) {
    case 0:
      return K("#ffffff");
    case 1:
      return K("#c0c0c0");
    case 2:
      return K("#808080");
    case 3:
      return K("#404040");
    case 4:
      return K("#000000");
    case 5:
      return { ...Rt(), style: $t };
    case 6:
      return { ...it(), color: "#ffffff" };
    case 7:
      return it();
    case 8:
      return ie();
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 16:
    case 17:
      return mt();
    case 18:
      return K("#ffffff");
    case 19:
      return it();
    default:
      return null;
  }
}
const pt = 1, ne = 7;
function re(e) {
  return {
    ...e,
    pen: { ...e.pen },
    brush: { ...e.brush },
    font: { ...e.font },
    world: [...e.world],
    winOrg: { ...e.winOrg },
    winExt: { ...e.winExt },
    vpOrg: { ...e.vpOrg },
    vpExt: { ...e.vpExt },
    pos: { ...e.pos }
  };
}
const oe = {
  2: 0.1,
  // MM_LOMETRIC
  3: 0.01,
  // MM_HIMETRIC
  4: 25.4 / 100,
  // MM_LOENGLISH
  5: 25.4 / 1e3,
  // MM_HIENGLISH
  6: 25.4 / 1440
  // MM_TWIPS
};
class ce {
  constructor() {
    this.els = [], this.defs = [], this.cache = /* @__PURE__ */ new Map(), this.count = 0;
  }
  add(t) {
    this.els.push(t), this.count++;
  }
  /** 按 key 去重的 <defs> 条目，返回引用 id */
  def(t, i, r) {
    const s = this.cache.get(t);
    if (s !== void 0) return s;
    const n = Gt(i);
    return this.defs.push(r(n)), this.cache.set(t, n), n;
  }
  render(t, i, r) {
    const s = Math.max(1, t.r - t.l), n = Math.max(1, t.b - t.t), o = this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${u(i)}" height="${u(r)}" viewBox="${u(t.l)} ${u(t.t)} ${u(s)} ${u(n)}" preserveAspectRatio="xMidYMid meet">` + o + this.els.join("") + "</svg>";
  }
}
class ut {
  constructor() {
    this.d = [], this.started = !1;
  }
  get empty() {
    return this.d.length === 0;
  }
  get data() {
    return this.d.join("");
  }
  clear() {
    this.d = [], this.started = !1;
  }
  move(t) {
    v(t) && (this.d.push(`M${u(t.x)} ${u(t.y)}`), this.started = !0);
  }
  line(t) {
    v(t) && (this.started ? this.d.push(`L${u(t.x)} ${u(t.y)}`) : this.move(t));
  }
  cubic(t, i, r) {
    !v(t) || !v(i) || !v(r) || (this.started || this.move(t), this.d.push(`C${u(t.x)} ${u(t.y)} ${u(i.x)} ${u(i.y)} ${u(r.x)} ${u(r.y)}`));
  }
  close() {
    this.started && this.d.push("Z");
  }
}
const v = (e) => Number.isFinite(e.x) && Number.isFinite(e.y), he = 0.5522847498307936;
function q(e, t, i, r, s, n, o) {
  const c = [], h = n - s, a = Math.max(1, Math.ceil(Math.abs(h) / (Math.PI / 2))), f = h / a, l = he * Math.abs(f) / (Math.PI / 2) * Math.sign(f);
  let d = s;
  for (let p = 0; p < a; p++) {
    const w = d + f, x = Math.cos(d), m = Math.sin(d), M = Math.cos(w), y = Math.sin(w), g = { x: e + i * (x - l * m), y: t + r * (m + l * x) }, b = { x: e + i * (M + l * y), y: t + r * (y - l * M) }, L = { x: e + i * M, y: t + r * y };
    c.push([$(o, g.x, g.y), $(o, b.x, b.y), $(o, L.x, L.y)]), d = w;
  }
  return c;
}
const Ot = (e, t, i, r, s, n) => $(n, e + i * Math.cos(s), t + r * Math.sin(s));
function Pt(e, t, i, r, s, n) {
  const o = i !== 0 ? (s - e) / i : 0, c = r !== 0 ? (n - t) / r : 0;
  return o === 0 && c === 0 ? 0 : Math.atan2(c, o);
}
class It {
  constructor(t) {
    this.stack = [], this.objs = [], this.svg = new ce(), this.path = new ut(), this.inPath = !1, this.dev = t, this.dc = {
      pen: it(),
      brush: Rt(),
      font: mt(),
      textColor: "#000000",
      bkColor: "#ffffff",
      bkMode: 2,
      polyFill: 1,
      textAlign: 0,
      world: [...et],
      mapMode: pt,
      winOrg: { x: 0, y: 0 },
      winExt: { x: 1, y: 1 },
      vpOrg: { x: 0, y: 0 },
      vpExt: { x: 1, y: 1 },
      clip: null,
      pos: { x: 0, y: 0 }
    };
  }
  get drawn() {
    return this.svg.count;
  }
  // -------- 变换 --------
  /** 逻辑坐标 → 设备坐标的完整矩阵 */
  xf() {
    const t = this.dc;
    let i, r;
    const s = oe[t.mapMode];
    if (t.mapMode === pt)
      i = 1, r = 1;
    else if (s !== void 0)
      i = s * this.dev.pxPerMmX, r = -s * this.dev.pxPerMmY;
    else if (i = t.winExt.x !== 0 ? t.vpExt.x / t.winExt.x : 1, r = t.winExt.y !== 0 ? t.vpExt.y / t.winExt.y : 1, t.mapMode === ne) {
      const o = Math.min(Math.abs(i), Math.abs(r));
      i = o * Math.sign(i || 1), r = o * Math.sign(r || 1);
    }
    (!Number.isFinite(i) || i === 0) && (i = 1), (!Number.isFinite(r) || r === 0) && (r = 1);
    const n = [i, 0, 0, r, t.vpOrg.x - t.winOrg.x * i, t.vpOrg.y - t.winOrg.y * r];
    return Y(t.world, n);
  }
  tp(t, i) {
    return $(this.xf(), t, i);
  }
  // -------- DC 栈 / 对象表 --------
  save() {
    this.stack.push(re(this.dc));
  }
  restore(t = -1) {
    if (!this.stack.length) return;
    let i = t < 0 ? -t : Math.max(1, this.stack.length - t);
    i = Math.min(i, this.stack.length);
    let r;
    for (let s = 0; s < i; s++) r = this.stack.pop();
    r && (this.dc = r);
  }
  putObj(t, i) {
    t < 0 || t > 65535 || (this.objs[t] = i);
  }
  /** WMF：对象放进第一个空槽 */
  addObj(t) {
    for (let i = 0; i < this.objs.length; i++)
      if (!this.objs[i]) {
        this.objs[i] = t;
        return;
      }
    this.objs.length < 65536 && this.objs.push(t);
  }
  delObj(t) {
    t >= 0 && t < this.objs.length && (this.objs[t] = null);
  }
  selectIdx(t) {
    const i = t & 2147483648 || (t & 4294934528) === 32768 ? se(t) : this.objs[t] ?? null;
    i && this.select(i);
  }
  select(t) {
    t.kind === "pen" ? this.dc.pen = t : t.kind === "brush" ? this.dc.brush = t : this.dc.font = t;
  }
  // -------- 裁剪 --------
  intersectClip(t) {
    const i = this.xf(), r = [
      $(i, t.l, t.t),
      $(i, t.r, t.t),
      $(i, t.r, t.b),
      $(i, t.l, t.b)
    ];
    if (r.some((c) => !v(c))) return;
    const s = `M${u(r[0].x)} ${u(r[0].y)}L${u(r[1].x)} ${u(r[1].y)}L${u(r[2].x)} ${u(r[2].y)}L${u(r[3].x)} ${u(r[3].y)}Z`, n = this.dc.clip, o = `clip:${s}|${n ?? ""}`;
    this.dc.clip = this.svg.def(o, "c", (c) => `<clipPath id="${c}"${n ? ` clip-path="url(#${n})"` : ""}><path d="${s}"/></clipPath>`);
  }
  /** EXTSELECTCLIPRGN 用：清除裁剪 */
  clearClip() {
    this.dc.clip = null;
  }
  /**
   * 用一组矩形（区域）设置裁剪。intersect=true 时与当前裁剪求交（嵌套 clipPath），
   * 否则替换。矩形之间是并集——clipPath 的多个子元素天然如此。
   */
  setClipRects(t, i) {
    const r = this.xf(), s = [];
    for (const h of t) {
      const a = $(r, h.l, h.t), f = $(r, h.r, h.b);
      if (!v(a) || !v(f)) continue;
      const l = Math.min(a.x, f.x), d = Math.min(a.y, f.y), p = Math.abs(f.x - a.x), w = Math.abs(f.y - a.y);
      !(p > 0) || !(w > 0) || s.push(`<rect x="${u(l)}" y="${u(d)}" width="${u(p)}" height="${u(w)}"/>`);
    }
    if (!s.length) return;
    const n = i ? this.dc.clip : null, o = s.join(""), c = `rgn:${o}|${n ?? ""}`;
    this.dc.clip = this.svg.def(c, "c", (h) => `<clipPath id="${h}"${n ? ` clip-path="url(#${n})"` : ""}>${o}</clipPath>`);
  }
  clipAttr() {
    return this.dc.clip ? ` clip-path="url(#${this.dc.clip})"` : "";
  }
  // -------- 画笔 / 画刷 → SVG 属性 --------
  strokeAttrs() {
    const t = this.dc.pen;
    if (t.style === at) return ' stroke="none"';
    const i = Math.max(t.width, 0) * bt(this.xf()), r = i < 0.75 ? 0.75 : i;
    let s = ` stroke="${t.color}" stroke-width="${u(r)}"`;
    const n = ae(t.style, r);
    return n && (s += ` stroke-dasharray="${n}"`), n ? s += ' stroke-linecap="butt"' : t.cap === 256 ? s += ' stroke-linecap="square"' : t.cap === 512 ? s += ' stroke-linecap="butt"' : t.cap === 0 && (s += ' stroke-linecap="round"'), t.join === 4096 ? s += ' stroke-linejoin="bevel"' : t.join === 8192 ? s += ' stroke-linejoin="miter"' : t.join === 0 && (s += ' stroke-linejoin="round"'), s;
  }
  fillAttrs() {
    const t = this.dc.brush;
    if (t.style === $t) return ' fill="none"';
    if (t.style === ee) {
      const i = this.dc.bkMode === 2 ? this.dc.bkColor : "none", r = `h:${t.hatch}:${t.color}:${i}`;
      return ` fill="url(#${this.svg.def(r, "h", (n) => le(n, t.hatch, t.color, i))})"`;
    }
    if ((t.style === kt || t.style === yt) && t.href) {
      const i = `p:${t.href.length}:${t.href.slice(-32)}`;
      return ` fill="url(#${this.svg.def(i, "q", (s) => `<pattern id="${s}" width="16" height="16" patternUnits="userSpaceOnUse"><image xlink:href="${t.href}" width="16" height="16" preserveAspectRatio="none"/></pattern>`)})"`;
    }
    return t.style === kt || t.style === yt ? ` fill="${t.color}"` : ` fill="${t.color}"`;
  }
  ruleAttr() {
    return this.dc.polyFill === 1 ? ' fill-rule="evenodd"' : "";
  }
  /** 输出一条 path；mode 决定描边 / 填充 */
  emit(t, i) {
    if (!t) return;
    const r = i === "stroke" ? ' fill="none"' : this.fillAttrs() + this.ruleAttr(), s = i === "fill" ? ' stroke="none"' : this.strokeAttrs();
    this.svg.add(`<path d="${t}"${r}${s}${this.clipAttr()}/>`);
  }
  /** 绘图记录的统一出口：路径模式下累积，否则立即输出 */
  draw(t, i) {
    if (this.inPath) {
      t(this.path);
      return;
    }
    const r = new ut();
    t(r), this.emit(r.data, i);
  }
  // -------- 路径模式 --------
  beginPath() {
    this.path.clear(), this.inPath = !0;
  }
  endPath() {
    this.inPath = !1;
  }
  abortPath() {
    this.path.clear(), this.inPath = !1;
  }
  closeFigure() {
    this.path.close();
  }
  finishPath(t) {
    this.inPath = !1, this.emit(this.path.data, t), this.path.clear();
  }
  /** SELECTCLIPPATH：把当前路径当作裁剪区 */
  clipToPath() {
    const t = this.path.data;
    if (this.inPath = !1, !t) return;
    const i = this.dc.clip;
    this.dc.clip = this.svg.def(`clipP:${t}|${i ?? ""}`, "c", (r) => `<clipPath id="${r}"${i ? ` clip-path="url(#${i})"` : ""}><path d="${t}"/></clipPath>`), this.path.clear();
  }
  // -------- 绘图原语（入参均为逻辑坐标）--------
  moveTo(t, i) {
    this.dc.pos = { x: t, y: i }, this.inPath && this.path.move(this.tp(t, i));
  }
  lineTo(t, i) {
    const r = this.xf(), s = $(r, this.dc.pos.x, this.dc.pos.y), n = $(r, t, i);
    this.inPath ? this.path.line(n) : this.emit(`M${u(s.x)} ${u(s.y)}L${u(n.x)} ${u(n.y)}`, "stroke"), this.dc.pos = { x: t, y: i };
  }
  polyline(t, i) {
    if (t.length < 2) return;
    const r = this.xf(), s = t.map((o) => $(r, o.x, o.y));
    this.draw((o) => {
      o.move(s[0]);
      for (let c = 1; c < s.length; c++) o.line(s[c]);
      i && o.close();
    }, i ? "both" : "stroke");
    const n = t[t.length - 1];
    this.dc.pos = { x: n.x, y: n.y };
  }
  /** POLYLINETO：从当前点续画 */
  polylineTo(t) {
    if (!t.length) return;
    const i = this.xf();
    if (this.inPath)
      for (const s of t) this.path.line($(i, s.x, s.y));
    else {
      const s = $(i, this.dc.pos.x, this.dc.pos.y);
      let n = `M${u(s.x)} ${u(s.y)}`;
      for (const o of t) {
        const c = $(i, o.x, o.y);
        n += `L${u(c.x)} ${u(c.y)}`;
      }
      this.emit(n, "stroke");
    }
    const r = t[t.length - 1];
    this.dc.pos = { x: r.x, y: r.y };
  }
  polyBezier(t, i) {
    const r = this.xf(), s = t.map((o) => $(r, o.x, o.y)), n = (o) => {
      let c = 0;
      if (i)
        this.inPath || o.move($(r, this.dc.pos.x, this.dc.pos.y));
      else {
        if (!s.length) return;
        o.move(s[0]), c = 1;
      }
      for (; c + 2 < s.length; c += 3) o.cubic(s[c], s[c + 1], s[c + 2]);
    };
    if (this.inPath) n(this.path);
    else {
      const o = new ut();
      n(o), this.emit(o.data, "stroke");
    }
    if (t.length) {
      const o = t[t.length - 1];
      this.dc.pos = { x: o.x, y: o.y };
    }
  }
  polyPoly(t, i) {
    const r = this.xf();
    this.draw((s) => {
      for (const n of t)
        if (!(n.length < 2)) {
          s.move($(r, n[0].x, n[0].y));
          for (let o = 1; o < n.length; o++) s.line($(r, n[o].x, n[o].y));
          i && s.close();
        }
    }, i ? "both" : "stroke");
  }
  rect(t) {
    const i = this.xf();
    if (!this.inPath && i[1] === 0 && i[2] === 0) {
      const s = $(i, t.l, t.t), n = $(i, t.r, t.b);
      if (v(s) && v(n)) {
        const o = Math.abs(n.x - s.x), c = Math.abs(n.y - s.y);
        this.svg.add(`<rect x="${u(Math.min(s.x, n.x))}" y="${u(Math.min(s.y, n.y))}" width="${u(o)}" height="${u(c)}"${this.fillAttrs()}${this.strokeAttrs()}${this.clipAttr()}/>`);
        return;
      }
    }
    const r = [$(i, t.l, t.t), $(i, t.r, t.t), $(i, t.r, t.b), $(i, t.l, t.b)];
    this.draw((s) => {
      s.move(r[0]), s.line(r[1]), s.line(r[2]), s.line(r[3]), s.close();
    }, "both");
  }
  ellipse(t) {
    const i = this.xf(), r = (t.l + t.r) / 2, s = (t.t + t.b) / 2, n = Math.abs(t.r - t.l) / 2, o = Math.abs(t.b - t.t) / 2;
    this.draw((c) => {
      c.move(Ot(r, s, n, o, 0, i));
      for (const h of q(r, s, n, o, 0, Math.PI * 2, i)) c.cubic(h[0], h[1], h[2]);
      c.close();
    }, "both");
  }
  roundRect(t, i, r) {
    const s = this.xf(), n = Math.min(t.l, t.r), o = Math.min(t.t, t.b), c = Math.max(t.l, t.r), h = Math.max(t.t, t.b), a = Math.min(Math.abs(i) / 2, (c - n) / 2), f = Math.min(Math.abs(r) / 2, (h - o) / 2);
    if (a <= 0 || f <= 0) {
      this.rect(t);
      return;
    }
    this.draw((l) => {
      l.move($(s, n + a, o)), l.line($(s, c - a, o));
      for (const d of q(c - a, o + f, a, f, -Math.PI / 2, 0, s)) l.cubic(d[0], d[1], d[2]);
      l.line($(s, c, h - f));
      for (const d of q(c - a, h - f, a, f, 0, Math.PI / 2, s)) l.cubic(d[0], d[1], d[2]);
      l.line($(s, n + a, h));
      for (const d of q(n + a, h - f, a, f, Math.PI / 2, Math.PI, s)) l.cubic(d[0], d[1], d[2]);
      l.line($(s, n, o + f));
      for (const d of q(n + a, o + f, a, f, Math.PI, Math.PI * 1.5, s)) l.cubic(d[0], d[1], d[2]);
      l.close();
    }, "both");
  }
  /** GDI 弧默认逆时针（屏幕上看），即参数角递减方向 */
  arc(t, i, r, s, n, o, c = !1) {
    const h = this.xf(), a = (t.l + t.r) / 2, f = (t.t + t.b) / 2, l = Math.abs(t.r - t.l) / 2, d = Math.abs(t.b - t.t) / 2;
    if (l <= 0 || d <= 0) return;
    const p = Pt(a, f, l, d, i, r);
    let w = Pt(a, f, l, d, s, n), x = p - w;
    for (; x <= 0; ) x += Math.PI * 2;
    w = p - x;
    const m = o === "arc" ? "stroke" : "both";
    this.draw((y) => {
      const g = Ot(a, f, l, d, p, h);
      o === "pie" ? (y.move($(h, a, f)), y.line(g)) : c && this.inPath ? y.line(g) : y.move(g);
      for (const b of q(a, f, l, d, p, w, h)) y.cubic(b[0], b[1], b[2]);
      o !== "arc" && y.close();
    }, m);
    const M = { x: a + l * Math.cos(w), y: f + d * Math.sin(w) };
    this.dc.pos = M;
  }
  /** POLYDRAW：点 + 类型数组（PT_MOVETO 6 / PT_LINETO 2 / PT_BEZIERTO 4 / PT_CLOSEFIGURE 1）*/
  polyDraw(t, i) {
    const r = this.xf(), s = Math.min(t.length, i.length);
    this.draw((n) => {
      for (let o = 0; o < s; o++) {
        const c = i[o] & 6;
        c === 4 && o + 2 < s ? (n.cubic($(r, t[o].x, t[o].y), $(r, t[o + 1].x, t[o + 1].y), $(r, t[o + 2].x, t[o + 2].y)), o += 2) : c === 6 ? n.move($(r, t[o].x, t[o].y)) : n.line($(r, t[o].x, t[o].y)), i[o] & 1 && n.close();
      }
    }, "stroke"), s && (this.dc.pos = { x: t[s - 1].x, y: t[s - 1].y });
  }
  // -------- 文本 --------
  text(t, i, r, s, n) {
    if (!r) return;
    const o = this.xf(), c = $(o, t, i);
    if (!v(c)) return;
    const h = this.dc.font, f = (h.height < 0 ? -h.height : h.height * 0.87) * _t(o);
    if (!(f > 0) || !Number.isFinite(f)) return;
    if (n && this.dc.bkMode === 2) {
      const x = $(o, n.l, n.t), m = $(o, n.r, n.b);
      v(x) && v(m) && this.svg.add(`<rect x="${u(Math.min(x.x, m.x))}" y="${u(Math.min(x.y, m.y))}" width="${u(Math.abs(m.x - x.x))}" height="${u(Math.abs(m.y - x.y))}" fill="${this.dc.bkColor}"${this.clipAttr()}/>`);
    }
    const l = this.dc.textAlign, d = (l & 6) === 2 ? "end" : (l & 6) === 6 ? "middle" : "start", p = (l & 24) === 24 ? "" : (l & 24) === 8 ? "text-after-edge" : "text-before-edge";
    let w = ` x="${u(c.x)}" y="${u(c.y)}"`;
    if (h.escapement && (w += ` transform="rotate(${u(-h.escapement / 10)} ${u(c.x)} ${u(c.y)})"`), w += ` font-family="${st(fe(h.face))}" font-size="${u(f)}" fill="${this.dc.textColor}"`, h.weight >= 600 && (w += ` font-weight="${h.weight}"`), h.italic && (w += ' font-style="italic"'), h.underline && h.strike ? w += ' text-decoration="underline line-through"' : h.underline ? w += ' text-decoration="underline"' : h.strike && (w += ' text-decoration="line-through"'), d !== "start" && (w += ` text-anchor="${d}"`), p && (w += ` dominant-baseline="${p}"`), s && s.length) {
      let x = 0;
      for (const M of s) x += M;
      const m = x * bt(o);
      m > 0 && Number.isFinite(m) && (w += ` textLength="${u(m)}" lengthAdjust="spacingAndGlyphs"`);
    }
    this.svg.add(`<text${w} xml:space="preserve"${this.clipAttr()}>${st(r)}</text>`);
  }
  // -------- 位图 --------
  image(t, i) {
    const r = this.xf(), s = t.r - t.l, n = t.b - t.t, o = $(r, t.l, t.t), c = $(r, t.l + s, t.t + n);
    if (!v(o) || !v(c)) return;
    const h = Math.min(o.x, c.x), a = Math.min(o.y, c.y), f = Math.abs(c.x - o.x), l = Math.abs(c.y - o.y);
    !(f > 0) || !(l > 0) || this.svg.add(`<image x="${u(h)}" y="${u(a)}" width="${u(f)}" height="${u(l)}" preserveAspectRatio="none" xlink:href="${i}"${this.clipAttr()}/>`);
  }
  render(t, i, r) {
    return this.svg.render(t, i, r);
  }
}
function ae(e, t) {
  const i = Math.max(t, 1);
  switch (e) {
    case qt:
      return `${u(i * 6)} ${u(i * 3)}`;
    case Jt:
      return `${u(i)} ${u(i * 3)}`;
    case Qt:
      return `${u(i * 6)} ${u(i * 3)} ${u(i)} ${u(i * 3)}`;
    case te:
      return `${u(i * 6)} ${u(i * 3)} ${u(i)} ${u(i * 3)} ${u(i)} ${u(i * 3)}`;
    default:
      return "";
  }
}
const Lt = {
  0: "M0 4H8",
  // HS_HORIZONTAL
  1: "M4 0V8",
  // HS_VERTICAL
  2: "M0 0L8 8",
  // HS_FDIAGONAL
  3: "M0 8L8 0",
  // HS_BDIAGONAL
  4: "M0 4H8M4 0V8",
  // HS_CROSS
  5: "M0 0L8 8M0 8L8 0"
  // HS_DIAGCROSS
};
function le(e, t, i, r) {
  const s = Lt[t] ?? Lt[0], n = r === "none" ? "" : `<rect width="8" height="8" fill="${r}"/>`;
  return `<pattern id="${e}" width="8" height="8" patternUnits="userSpaceOnUse">${n}<path d="${s}" stroke="${i}" stroke-width="1" fill="none"/></pattern>`;
}
const vt = ", 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif";
function fe(e) {
  const t = e.trim();
  return t ? /^(symbol|wingdings|webdings)/i.test(t) ? `'${t}'` : `'${t}'${vt}` : `Arial${vt}`;
}
const ue = {
  0: "windows-1252",
  1: "windows-1252",
  2: "windows-1252",
  77: "macintosh",
  128: "shift_jis",
  129: "euc-kr",
  130: "euc-kr",
  134: "gbk",
  136: "big5",
  161: "windows-1253",
  162: "windows-1254",
  163: "windows-1258",
  177: "windows-1255",
  178: "windows-1256",
  186: "windows-1257",
  204: "windows-1251",
  222: "windows-874",
  238: "windows-1250"
};
function de(e, t) {
  const i = ue[t];
  if (i && typeof TextDecoder < "u")
    try {
      return new TextDecoder(i, { fatal: !1 }).decode(e).replace(/\0+$/, "");
    } catch {
    }
  let r = "";
  for (let s = 0; s < e.length && e[s] !== 0; s++)
    r += String.fromCharCode(e[s]);
  return r;
}
const B = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function ht(e) {
  let t = "", i = 0;
  for (; i + 2 < e.length; i += 3) {
    const s = e[i] << 16 | e[i + 1] << 8 | e[i + 2];
    t += B[s >> 18 & 63] + B[s >> 12 & 63] + B[s >> 6 & 63] + B[s & 63];
  }
  const r = e.length - i;
  if (r === 1) {
    const s = e[i] << 16;
    t += B[s >> 18 & 63] + B[s >> 12 & 63] + "==";
  } else if (r === 2) {
    const s = e[i] << 16 | e[i + 1] << 8;
    t += B[s >> 18 & 63] + B[s >> 12 & 63] + B[s >> 6 & 63] + "=";
  }
  return t;
}
let dt = null;
function Ee(e) {
  if (!dt) {
    const i = new Int32Array(256);
    for (let r = 0; r < 256; r++) {
      let s = r;
      for (let n = 0; n < 8; n++) s = s & 1 ? 3988292384 ^ s >>> 1 : s >>> 1;
      i[r] = s;
    }
    dt = i;
  }
  let t = -1;
  for (let i = 0; i < e.length; i++) t = dt[(t ^ e[i]) & 255] ^ t >>> 8;
  return (t ^ -1) >>> 0;
}
function Et(e, t) {
  const i = new Uint8Array(t.length + 12), r = new DataView(i.buffer);
  r.setUint32(0, t.length);
  for (let s = 0; s < 4; s++) i[4 + s] = e.charCodeAt(s);
  return i.set(t, 8), r.setUint32(t.length + 8, Ee(i.subarray(4, t.length + 8))), i;
}
function Ct(e, t, i) {
  const r = new Uint8Array(i * (t * 4 + 1));
  for (let l = 0; l < i; l++)
    r[l * (t * 4 + 1)] = 0, r.set(e.subarray(l * t * 4, (l + 1) * t * 4), l * (t * 4 + 1) + 1);
  const s = new Uint8Array(13), n = new DataView(s.buffer);
  n.setUint32(0, t), n.setUint32(4, i), s[8] = 8, s[9] = 6;
  const c = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    Et("IHDR", s),
    Et("IDAT", Ht(r, { level: 6 })),
    Et("IEND", new Uint8Array(0))
  ];
  let h = 0;
  for (const l of c) h += l.length;
  const a = new Uint8Array(h);
  let f = 0;
  for (const l of c)
    a.set(l, f), f += l.length;
  return a;
}
const we = 8192 * 8192;
function wt(e) {
  if (!e) return { shift: 0, scale: 0 };
  let t = 0, i = e;
  for (; !(i & 1); )
    i >>>= 1, t++;
  let r = 0;
  for (; i & 1; )
    i >>>= 1, r++;
  return { shift: t, scale: r > 0 ? 255 / ((1 << r) - 1) : 0 };
}
function pe(e, t, i, r, s, n) {
  if (!(r > 0) || !(s > 0)) return null;
  const o = new Uint8Array(r * s);
  let c = t;
  const h = Math.min(e.length, t + i);
  let a = 0, f = s - 1;
  const l = (d) => {
    a >= 0 && a < r && f >= 0 && f < s && (o[f * r + a] = d), a++;
  };
  for (; c + 1 < h && f >= 0; ) {
    const d = e[c++], p = e[c++];
    if (d > 0) {
      if (n) {
        const w = p >> 4 & 15, x = p & 15;
        for (let m = 0; m < d; m++) l(m % 2 === 0 ? w : x);
      } else
        for (let w = 0; w < d; w++) l(p);
      continue;
    }
    if (p === 0) {
      a = 0, f--;
      continue;
    }
    if (p === 1) break;
    if (p === 2) {
      if (c + 1 >= h) break;
      a += e[c++], f -= e[c++];
      continue;
    }
    if (n) {
      const w = p + 1 >> 1;
      if (c + w > h) break;
      for (let x = 0; x < p; x++) {
        const m = e[c + (x >> 1)];
        l(x % 2 === 0 ? m >> 4 & 15 : m & 15);
      }
      c += w + (w & 1);
    } else {
      if (c + p > h) break;
      for (let w = 0; w < p; w++) l(e[c + w]);
      c += p + (p & 1);
    }
  }
  return o;
}
function xe(e, t, i, r, s) {
  if (t < 0 || i < 12 || t + 12 > e.length) return null;
  const n = new H(e, t, Math.min(e.length, t + Math.max(i, 12))), o = n.u32();
  let c, h, a, f = 0, l = 0, d = !1;
  if (o === 12)
    d = !0, c = n.i16(), h = n.i16(), n.u16(), a = n.u16();
  else if (o >= 16)
    c = n.i32(), h = n.i32(), n.u16(), a = n.u16(), o >= 24 && (f = n.u32(), n.u32()), o >= 36 && (n.u32(), n.u32(), l = n.u32());
  else return null;
  const p = h < 0;
  if (h = Math.abs(h), !(c > 0) || !(h > 0) || c * h > we || f === 4 || f === 5) return null;
  const w = f === 1, x = f === 2;
  if (f !== 0 && f !== 3 && !w && !x || w && a !== 8 || x && a !== 4 || ![1, 4, 8, 16, 24, 32].includes(a)) return null;
  let m = 0, M = 0, y = 0;
  if (f === 3) {
    const T = new H(e, t + o, e.length);
    m = T.u32(), M = T.u32(), y = T.u32();
  } else a === 16 ? (m = 31744, M = 992, y = 31) : a === 32 && (m = 16711680, M = 65280, y = 255);
  let g = null;
  if (a <= 8) {
    const T = l > 0 ? Math.min(l, 1 << a) : 1 << a, A = d ? 3 : 4, O = t + o + (f === 3 ? 12 : 0);
    g = new Uint8Array(T * 3);
    const P = new H(e, O, e.length);
    for (let k = 0; k < T; k++) {
      const S = P.u8(), F = P.u8(), R = P.u8();
      A === 4 && P.u8(), g[k * 3] = R, g[k * 3 + 1] = F, g[k * 3 + 2] = S;
    }
  }
  const b = c * a + 31 >> 5 << 2, L = r, X = Math.min(s > 0 ? s : e.length - L, e.length - L);
  if (L < 0 || L >= e.length) return null;
  if (w || x) {
    const T = pe(e, L, X, c, h, x);
    if (!T) return null;
    const A = new Uint8Array(c * h * 4);
    for (let O = 0; O < T.length; O++) {
      const P = T[O] * 3, k = O * 4;
      g && P + 2 < g.length && (A[k] = g[P], A[k + 1] = g[P + 1], A[k + 2] = g[P + 2]), A[k + 3] = 255;
    }
    return { w: c, h, rgba: A };
  }
  if (X < b) return null;
  const z = Math.min(h, Math.floor(X / b));
  if (z <= 0) return null;
  const C = new Uint8Array(c * h * 4), U = wt(m), W = wt(M), D = wt(y);
  let G = !1;
  for (let T = 0; T < z; T++) {
    const A = p ? T : h - 1 - T;
    let O = L + T * b, P = A * c * 4;
    for (let k = 0; k < c; k++) {
      let S = 0, F = 0, R = 0, Z = 255;
      if (a === 24)
        R = e[O], F = e[O + 1], S = e[O + 2], O += 3;
      else if (a === 32) {
        const I = e[O] | e[O + 1] << 8 | e[O + 2] << 16 | e[O + 3] << 24;
        S = U.scale ? ((I & m) >>> U.shift) * U.scale : 0, F = W.scale ? ((I & M) >>> W.shift) * W.scale : 0, R = D.scale ? ((I & y) >>> D.shift) * D.scale : 0, Z = e[O + 3], Z !== 0 && (G = !0), O += 4;
      } else if (a === 16) {
        const I = e[O] | e[O + 1] << 8;
        S = ((I & m) >>> U.shift) * U.scale, F = ((I & M) >>> W.shift) * W.scale, R = ((I & y) >>> D.shift) * D.scale, O += 2;
      } else {
        const I = k * a, nt = e[L + T * b + (I >> 3)] ?? 0, gt = a === 8 ? nt : a === 4 ? I % 8 === 0 ? nt >> 4 : nt & 15 : nt >> 7 - (I & 7) & 1, rt = gt * 3;
        g && rt + 2 < g.length ? (S = g[rt], F = g[rt + 1], R = g[rt + 2]) : S = F = R = gt ? 255 : 0;
      }
      C[P] = S | 0, C[P + 1] = F | 0, C[P + 2] = R | 0, C[P + 3] = Z, P += 4;
    }
  }
  if (a === 32 && !G)
    for (let T = 3; T < C.length; T += 4) C[T] = 255;
  return { w: c, h, rgba: C };
}
function Mt(e, t, i, r, s) {
  try {
    if (t >= 0 && t + 20 <= e.length) {
      const o = new H(e, t, e.length);
      if (o.u32() >= 24) {
        o.skip(12);
        const h = o.u32();
        if ((h === 4 || h === 5) && s > 0 && r + s <= e.length)
          return `data:${h === 4 ? "image/jpeg" : "image/png"};base64,${ht(e.subarray(r, r + s))}`;
      }
    }
    const n = xe(e, t, i, r, s);
    return n ? `data:image/png;base64,${ht(Ct(n.rgba, n.w, n.h))}` : null;
  } catch {
    return null;
  }
}
const $e = 1179469088, me = 1e5, E = {
  HEADER: 1,
  POLYBEZIER: 2,
  POLYGON: 3,
  POLYLINE: 4,
  POLYBEZIERTO: 5,
  POLYLINETO: 6,
  POLYPOLYLINE: 7,
  POLYPOLYGON: 8,
  SETWINDOWEXTEX: 9,
  SETWINDOWORGEX: 10,
  SETVIEWPORTEXTEX: 11,
  SETVIEWPORTORGEX: 12,
  EOF: 14,
  SETPIXELV: 15,
  SETMAPMODE: 17,
  SETBKMODE: 18,
  SETPOLYFILLMODE: 19,
  SETTEXTALIGN: 22,
  SETTEXTCOLOR: 24,
  SETBKCOLOR: 25,
  MOVETOEX: 27,
  INTERSECTCLIPRECT: 30,
  SCALEVIEWPORTEXTEX: 31,
  SCALEWINDOWEXTEX: 32,
  SAVEDC: 33,
  RESTOREDC: 34,
  SETWORLDTRANSFORM: 35,
  MODIFYWORLDTRANSFORM: 36,
  SELECTOBJECT: 37,
  CREATEPEN: 38,
  CREATEBRUSHINDIRECT: 39,
  DELETEOBJECT: 40,
  ELLIPSE: 42,
  RECTANGLE: 43,
  ROUNDRECT: 44,
  ARC: 45,
  CHORD: 46,
  PIE: 47,
  LINETO: 54,
  ARCTO: 55,
  POLYDRAW: 56,
  BEGINPATH: 59,
  ENDPATH: 60,
  CLOSEFIGURE: 61,
  FILLPATH: 62,
  STROKEANDFILLPATH: 63,
  STROKEPATH: 64,
  SELECTCLIPPATH: 67,
  ABORTPATH: 68,
  EXTSELECTCLIPRGN: 75,
  BITBLT: 76,
  STRETCHBLT: 77,
  STRETCHDIBITS: 81,
  EXTCREATEFONTINDIRECTW: 82,
  EXTTEXTOUTA: 83,
  EXTTEXTOUTW: 84,
  POLYBEZIER16: 85,
  POLYGON16: 86,
  POLYLINE16: 87,
  POLYBEZIERTO16: 88,
  POLYLINETO16: 89,
  POLYPOLYLINE16: 90,
  POLYPOLYGON16: 91,
  POLYDRAW16: 92,
  CREATEMONOBRUSH: 93,
  CREATEDIBPATTERNBRUSHPT: 94,
  EXTCREATEPEN: 95
};
function Dt(e) {
  if (e.length < 88) return !1;
  const t = new DataView(e.buffer, e.byteOffset, e.byteLength);
  return t.getUint32(0, !0) === 1 && t.getUint32(40, !0) === $e;
}
function Me(e, t = {}) {
  try {
    return ge(e, t);
  } catch {
    return null;
  }
}
function ge(e, t) {
  if (!Dt(e)) return null;
  const i = new H(e, 0, e.length);
  i.skip(8);
  const r = i.rectL(), s = i.rectL();
  i.skip(16), i.skip(16);
  const n = i.i32(), o = i.i32(), c = i.i32(), h = i.i32(), a = c > 0 && n > 0 ? n / c : 96 / 25.4, f = h > 0 && o > 0 ? o / h : 96 / 25.4, l = new It({ pxPerMmX: a, pxPerMmY: f });
  let d = r;
  if (!(d.r > d.l) || !(d.b > d.t)) {
    const g = Math.round((s.r - s.l) * a / 100), b = Math.round((s.b - s.t) * f / 100);
    d = { l: 0, t: 0, r: g > 0 ? g : 1024, b: b > 0 ? b : 768 };
  }
  d = { l: d.l, t: d.t, r: d.r + 1, b: d.b + 1 };
  const p = (s.r - s.l) * 96 / 2540, w = (s.b - s.t) * 96 / 2540, x = t.width ?? (p > 0 ? p : d.r - d.l), m = t.height ?? (w > 0 ? w : d.b - d.t);
  l.dc.mapMode = pt;
  let M = 0, y = 0;
  for (; M + 8 <= e.length && y < me; ) {
    const g = new DataView(e.buffer, e.byteOffset, e.byteLength), b = g.getUint32(M, !0), L = g.getUint32(M + 4, !0);
    if (L < 8 || L % 4 !== 0 || M + L > e.length || b === E.EOF) break;
    b !== E.HEADER && Ft(l, e, b, M, L), M += L, y++;
  }
  return l.render(d, x, m);
}
function Ft(e, t, i, r, s) {
  const n = new H(t, r + 8, r + s);
  switch (i) {
    case E.POLYGON:
      e.polyline(Q(n), !0);
      break;
    case E.POLYLINE:
      e.polyline(Q(n), !1);
      break;
    case E.POLYBEZIER:
      e.polyBezier(Q(n), !1);
      break;
    case E.POLYLINETO:
      e.polylineTo(Q(n));
      break;
    case E.POLYBEZIERTO:
      e.polyBezier(Q(n), !0);
      break;
    case E.POLYGON16:
      e.polyline(tt(n), !0);
      break;
    case E.POLYLINE16:
      e.polyline(tt(n), !1);
      break;
    case E.POLYBEZIER16:
      e.polyBezier(tt(n), !1);
      break;
    case E.POLYLINETO16:
      e.polylineTo(tt(n));
      break;
    case E.POLYBEZIERTO16:
      e.polyBezier(tt(n), !0);
      break;
    case E.POLYPOLYGON:
      e.polyPoly(ot(n, !1), !0);
      break;
    case E.POLYPOLYLINE:
      e.polyPoly(ot(n, !1), !1);
      break;
    case E.POLYPOLYGON16:
      e.polyPoly(ot(n, !0), !0);
      break;
    case E.POLYPOLYLINE16:
      e.polyPoly(ot(n, !0), !1);
      break;
    case E.POLYDRAW:
    case E.POLYDRAW16: {
      n.skip(16);
      const o = J(n.i32()), c = [];
      for (let a = 0; a < o; a++) c.push(i === E.POLYDRAW ? n.ptL() : n.pt16());
      const h = [];
      for (let a = 0; a < o; a++) h.push(n.u8());
      e.polyDraw(c, h);
      break;
    }
    case E.RECTANGLE:
      e.rect(n.rectL());
      break;
    case E.ELLIPSE:
      e.ellipse(n.rectL());
      break;
    case E.ROUNDRECT: {
      const o = n.rectL();
      e.roundRect(o, n.i32(), n.i32());
      break;
    }
    case E.ARC:
    case E.CHORD:
    case E.PIE:
    case E.ARCTO: {
      const o = n.rectL(), c = n.ptL(), h = n.ptL(), a = i === E.CHORD ? "chord" : i === E.PIE ? "pie" : "arc";
      e.arc(o, c.x, c.y, h.x, h.y, a, i === E.ARCTO);
      break;
    }
    case E.MOVETOEX: {
      const o = n.ptL();
      e.moveTo(o.x, o.y);
      break;
    }
    case E.LINETO: {
      const o = n.ptL();
      e.lineTo(o.x, o.y);
      break;
    }
    case E.SETPIXELV: {
      const o = n.ptL(), c = n.color();
      e.dc.brush = { kind: "brush", style: lt, color: c, hatch: 0, href: null }, e.dc.pen = { ...e.dc.pen, style: at }, e.rect({ l: o.x, t: o.y, r: o.x + 1, b: o.y + 1 });
      break;
    }
    case E.BEGINPATH:
      e.beginPath();
      break;
    case E.ENDPATH:
      e.endPath();
      break;
    case E.CLOSEFIGURE:
      e.closeFigure();
      break;
    case E.FILLPATH:
      e.finishPath("fill");
      break;
    case E.STROKEPATH:
      e.finishPath("stroke");
      break;
    case E.STROKEANDFILLPATH:
      e.finishPath("both");
      break;
    case E.ABORTPATH:
      e.abortPath();
      break;
    case E.SELECTCLIPPATH:
      e.clipToPath();
      break;
    case E.CREATEPEN: {
      const o = n.i32();
      e.putObj(o, Te(n));
      break;
    }
    case E.EXTCREATEPEN: {
      const o = n.i32();
      e.putObj(o, ke(n));
      break;
    }
    case E.CREATEBRUSHINDIRECT: {
      const o = n.i32();
      e.putObj(o, ye(n));
      break;
    }
    case E.CREATEMONOBRUSH:
    case E.CREATEDIBPATTERNBRUSHPT: {
      const o = n.i32();
      e.putObj(o, Oe(n, t, r));
      break;
    }
    case E.EXTCREATEFONTINDIRECTW: {
      const o = n.i32();
      e.putObj(o, Pe(n));
      break;
    }
    case E.SELECTOBJECT:
      e.selectIdx(n.u32());
      break;
    case E.DELETEOBJECT:
      e.delObj(n.u32());
      break;
    case E.SETWORLDTRANSFORM:
      e.dc.world = At(n);
      break;
    case E.MODIFYWORLDTRANSFORM: {
      const o = At(n), c = n.u32();
      c === 1 ? e.dc.world = [...et] : c === 2 ? e.dc.world = Y(o, e.dc.world) : c === 3 && (e.dc.world = Y(e.dc.world, o));
      break;
    }
    case E.SETWINDOWEXTEX:
      e.dc.winExt = { x: n.i32(), y: n.i32() };
      break;
    case E.SETWINDOWORGEX:
      e.dc.winOrg = n.ptL();
      break;
    case E.SETVIEWPORTEXTEX:
      e.dc.vpExt = { x: n.i32(), y: n.i32() };
      break;
    case E.SETVIEWPORTORGEX:
      e.dc.vpOrg = n.ptL();
      break;
    case E.SETMAPMODE:
      e.dc.mapMode = n.u32();
      break;
    case E.SCALEVIEWPORTEXTEX: {
      const o = n.i32(), c = n.i32(), h = n.i32(), a = n.i32();
      c && (e.dc.vpExt.x = e.dc.vpExt.x * o / c), a && (e.dc.vpExt.y = e.dc.vpExt.y * h / a);
      break;
    }
    case E.SCALEWINDOWEXTEX: {
      const o = n.i32(), c = n.i32(), h = n.i32(), a = n.i32();
      c && (e.dc.winExt.x = e.dc.winExt.x * o / c), a && (e.dc.winExt.y = e.dc.winExt.y * h / a);
      break;
    }
    case E.SAVEDC:
      e.save();
      break;
    case E.RESTOREDC:
      e.restore(n.i32());
      break;
    case E.SETBKMODE:
      e.dc.bkMode = n.u32();
      break;
    case E.SETPOLYFILLMODE:
      e.dc.polyFill = n.u32();
      break;
    case E.SETTEXTALIGN:
      e.dc.textAlign = n.u32();
      break;
    case E.SETTEXTCOLOR:
      e.dc.textColor = n.color();
      break;
    case E.SETBKCOLOR:
      e.dc.bkColor = n.color();
      break;
    case E.INTERSECTCLIPRECT:
      e.intersectClip(n.rectL());
      break;
    case E.EXTSELECTCLIPRGN:
      Le(e, n);
      break;
    case E.EXTTEXTOUTW:
    case E.EXTTEXTOUTA:
      ve(e, n, t, r, s, i === E.EXTTEXTOUTW);
      break;
    case E.STRETCHDIBITS:
      Ae(e, n, t, r);
      break;
    case E.BITBLT:
    case E.STRETCHBLT:
      Se(e, n, t, r, i === E.STRETCHBLT);
      break;
  }
}
const be = 1 << 20, J = (e) => e > 0 && e < be ? e | 0 : 0;
function Q(e) {
  e.skip(16);
  const t = Math.min(J(e.i32()), e.left >> 3), i = [];
  for (let r = 0; r < t; r++) i.push(e.ptL());
  return i;
}
function tt(e) {
  e.skip(16);
  const t = Math.min(J(e.i32()), e.left >> 2), i = [];
  for (let r = 0; r < t; r++) i.push(e.pt16());
  return i;
}
function ot(e, t) {
  e.skip(16);
  const i = J(e.i32()), r = J(e.i32());
  if (!i || !r || i > r) return [];
  const s = [];
  let n = 0;
  for (let a = 0; a < i; a++) {
    const f = J(e.i32());
    s.push(f), n += f;
  }
  if (n > r) return [];
  const o = t ? e.left >> 2 : e.left >> 3, c = [];
  let h = 0;
  for (const a of s) {
    const f = [];
    for (let l = 0; l < a && h < o; l++, h++) f.push(t ? e.pt16() : e.ptL());
    c.push(f);
  }
  return c;
}
function Te(e) {
  const t = e.u32(), i = e.i32();
  return e.i32(), {
    kind: "pen",
    style: t & 15,
    width: Math.abs(i) || 1,
    color: e.color(),
    cap: 0,
    join: 0
  };
}
function ke(e) {
  e.skip(16);
  const t = e.u32(), i = e.u32(), r = e.u32(), s = e.color();
  return {
    kind: "pen",
    style: r === $t ? at : t & 15,
    width: Math.max(i || 1, 1),
    color: s,
    cap: t & 3840,
    join: t & 61440
  };
}
function ye(e) {
  const t = e.u32(), i = e.color(), r = e.u32();
  return { kind: "brush", style: t, color: i, hatch: r, href: null };
}
function Oe(e, t, i) {
  e.u32();
  const r = e.u32(), s = e.u32(), n = e.u32(), o = e.u32(), c = s > 0 ? Mt(t, i + r, s, i + n, o) : null;
  return { kind: "brush", style: c ? 5 : lt, color: "#808080", hatch: 0, href: c };
}
function Pe(e) {
  const t = e.i32();
  e.i32();
  const i = e.i32();
  e.i32();
  const r = e.i32(), s = e.u8() !== 0, n = e.u8() !== 0, o = e.u8() !== 0, c = e.u8();
  e.skip(4);
  const h = e.utf16(64), a = mt();
  return {
    kind: "font",
    height: t || a.height,
    escapement: i,
    weight: r > 0 ? r : 400,
    italic: s,
    underline: n,
    strike: o,
    charset: c,
    face: h || a.face
  };
}
function At(e) {
  return [e.f32(), e.f32(), e.f32(), e.f32(), e.f32(), e.f32()];
}
function Le(e, t) {
  const i = t.u32(), r = t.u32();
  if (i === 0) {
    r === Tt && e.clearClip();
    return;
  }
  t.u32();
  const s = t.u32(), n = t.u32();
  if (t.u32(), t.rectL(), s !== Zt || n <= 0 || n > 65536) return;
  const o = [];
  for (let c = 0; c < n; c++) o.push(t.rectL());
  r === Tt ? e.setClipRects(o, !1) : r === zt && e.setClipRects(o, !0);
}
function ve(e, t, i, r, s, n) {
  t.skip(16), t.u32();
  const o = t.f32();
  t.f32();
  const c = t.ptL(), h = t.u32(), a = t.u32(), f = t.u32(), l = t.rectL(), d = t.u32();
  if (!h || h > 65536) return;
  const p = r + a, w = n ? h * 2 : h;
  if (a < 8 || p + w > r + s) return;
  const x = n ? new H(i, p, p + w).utf16(w) : de(i.subarray(p, p + w), e.dc.font.charset);
  if (!x) return;
  let m = null;
  const M = r + d;
  if (d >= 8 && M + h * 4 <= r + s) {
    const g = new H(i, M, M + h * 4);
    m = [];
    for (let b = 0; b < h; b++) m.push(g.i32());
    o > 0 && o !== 1 && Number.isFinite(o) && (m = m.map((b) => b * o));
  }
  const y = f & 2 ? l : null;
  e.text(c.x, c.y, x, m, y);
}
function Ae(e, t, i, r) {
  t.skip(16);
  const s = t.i32(), n = t.i32();
  t.i32(), t.i32(), t.i32(), t.i32();
  const o = t.u32(), c = t.u32(), h = t.u32(), a = t.u32();
  t.u32(), t.u32();
  const f = t.i32(), l = t.i32();
  if (!c || !a) return;
  const d = Mt(i, r + o, c, r + h, a);
  d && e.image({ l: s, t: n, r: s + f, b: n + l }, d);
}
function Se(e, t, i, r, s) {
  t.skip(16);
  const n = t.i32(), o = t.i32(), c = t.i32(), h = t.i32();
  t.u32(), t.i32(), t.i32(), t.skip(24), t.u32(), t.u32();
  const a = t.u32(), f = t.u32(), l = t.u32(), d = t.u32();
  if (s && (t.i32(), t.i32()), !f || !d) return;
  const p = Mt(i, r + a, f, r + l, d);
  p && e.image({ l: n, t: o, r: n + c, b: o + h }, p);
}
class V {
  constructor(t) {
    this.bytes = t, this.p = 0, this.view = new DataView(t.buffer, t.byteOffset, t.byteLength);
  }
  get left() {
    return this.bytes.length - this.p;
  }
  take(t) {
    if (!Number.isSafeInteger(t) || t < 0 || t > this.left) throw new Error("EMF+ 数据越界");
    const i = this.bytes.subarray(this.p, this.p + t);
    return this.p += t, i;
  }
  u8() {
    return this.take(1)[0];
  }
  u16() {
    const t = this.p;
    return this.take(2), this.view.getUint16(t, !0);
  }
  i16() {
    const t = this.u16();
    return t & 32768 ? t - 65536 : t;
  }
  u32() {
    const t = this.p;
    return this.take(4), this.view.getUint32(t, !0);
  }
  i32() {
    return this.u32() | 0;
  }
  f32() {
    const t = this.p;
    this.take(4);
    const i = this.view.getFloat32(t, !0);
    if (!Number.isFinite(i) || Math.abs(i) > 1e12) throw new Error("EMF+ 非法坐标");
    return i;
  }
  count(t = 1e5) {
    const i = this.u32();
    if (i > t) throw new Error("EMF+ 数量超限");
    return i;
  }
  text(t) {
    this.take(t * 2);
    let i = "";
    for (let r = this.p - t * 2; r < this.p; r += 2) i += String.fromCharCode(this.view.getUint16(r, !0));
    return i.replace(/\0+$/, "");
  }
  matrix() {
    return [this.f32(), this.f32(), this.f32(), this.f32(), this.f32(), this.f32()];
  }
  rect(t = !1) {
    const i = () => t ? this.i16() : this.f32();
    return { x: i(), y: i(), w: i(), h: i() };
  }
  relative() {
    const t = this.u8(), i = t & 127;
    return t & 128 ? (i & 64 ? i - 128 : i) * 256 + this.u8() : i & 64 ? i - 128 : i;
  }
  points(t, i) {
    if (t > 1e5) throw new Error("EMF+ 点数量超限");
    const r = [];
    let s = 0, n = 0;
    for (let o = 0; o < t; o++)
      i & 2048 ? (s += this.relative(), n += this.relative()) : (s = i & 16384 ? this.i16() : this.f32(), n = i & 16384 ? this.i16() : this.f32()), r.push({ x: s, y: n });
    return r;
  }
}
const j = (e) => `#${(e >>> 0).toString(16).padStart(8, "0").slice(2)}${(e >>> 24).toString(16).padStart(2, "0")}`;
function _(e, t) {
  const i = [1, 1, 1, t / 72, t, t / 300, t / 25.4][e];
  if (i === void 0) throw new Error("EMF+ 未知单位");
  return i;
}
const N = (e) => `${u(e.x)} ${u(e.y)}`;
function Nt(e, t, i = !1) {
  let r = "";
  for (let s = 0; s < e.length; s++) {
    const n = (t == null ? void 0 : t[s]) ?? (s ? 1 : 0), o = n & 7;
    if (!s && o !== 0) throw new Error("EMF+ 路径缺少起点");
    if (o === 0) r += `M${N(e[s])}`;
    else if (o === 1) r += `L${N(e[s])}`;
    else if (o === 3 && s + 2 < e.length && (t[s + 1] & 7) === 3 && (t[s + 2] & 7) === 3)
      r += `C${N(e[s])} ${N(e[s + 1])} ${N(e[s + 2])}`, s += 2;
    else throw new Error("EMF+ 非法路径点类型");
    ((t == null ? void 0 : t[s]) ?? n) & 128 && (r += "Z");
  }
  return r + (i ? "Z" : "");
}
function Re(e, t, i, r = 0, s = e.length - 1) {
  if (e.length < 2 || r < 0 || s < 1 || r + s >= e.length && !i) throw new Error("EMF+ 非法样条");
  const n = (c) => i ? e[(c + e.length) % e.length] : e[Math.max(0, Math.min(e.length - 1, c))];
  let o = `M${N(n(r))}`;
  for (let c = r; c < r + (i ? e.length : s); c++) {
    const h = n(c - 1), a = n(c), f = n(c + 1), l = n(c + 2), d = t / 3;
    o += `C${u(a.x + (f.x - h.x) * d)} ${u(a.y + (f.y - h.y) * d)} ${u(f.x - (l.x - a.x) * d)} ${u(f.y - (l.y - a.y) * d)} ${N(f)}`;
  }
  return o + (i ? "Z" : "");
}
function Ie(e, t, i, r) {
  const s = e.x + e.w / 2, n = e.y + e.h / 2, o = Math.abs(e.w / 2), c = Math.abs(e.h / 2);
  i = Math.max(-360, Math.min(360, i));
  const h = (l) => ({ x: s + o * Math.cos(l * Math.PI / 180), y: n + c * Math.sin(l * Math.PI / 180) });
  let a = r ? `M${u(s)} ${u(n)}L${N(h(t))}` : `M${N(h(t))}`;
  const f = Math.max(1, Math.ceil(Math.abs(i) / 180));
  for (let l = 1; l <= f; l++) a += `A${u(o)} ${u(c)} 0 0 ${i >= 0 ? 1 : 0} ${N(h(t + i * l / f))}`;
  return a + (r ? "Z" : "");
}
function Bt(e) {
  e.u32();
  const t = e.u32();
  if (t === 0) return { kind: "solid", color: j(e.u32()) };
  if (t === 1) {
    const a = e.u32();
    if (a > 5) throw new Error("EMF+ 暂不支持该网纹");
    return { kind: "hatch", style: a, color: j(e.u32()), background: j(e.u32()) };
  }
  if (t !== 4) throw new Error("EMF+ 暂不支持该画刷");
  const i = e.u32(), r = e.u32(), s = e.rect(), n = e.u32(), o = e.u32();
  if (e.take(8), i & -159 || i & 16) throw new Error("EMF+ 暂不支持双向渐变");
  const c = i & 2 ? e.matrix() : void 0;
  let h = [{ offset: 0, color: j(n) }, { offset: 1, color: j(o) }];
  if (i & 4 || i & 8) {
    const a = e.count(4096);
    h = Array.from({ length: a }, () => e.f32()).map((l) => {
      if (l < 0 || l > 1) throw new Error("EMF+ 非法渐变位置");
      if (i & 4) return { offset: l, color: j(e.u32()) };
      const d = Math.max(0, Math.min(1, e.f32()));
      let p = 0;
      for (let w = 0; w <= 24; w += 8) p += Math.round((n >>> w & 255) * (1 - d) + (o >>> w & 255) * d) * 2 ** w;
      return { offset: l, color: j(p) };
    });
  }
  return { kind: "gradient", box: s, stops: h, matrix: c, wrap: r, gamma: !!(i & 128) };
}
function Ce(e) {
  if (e.u32(), e.u32()) throw new Error("EMF+ 非法画笔类型");
  const t = e.u32(), i = e.u32(), r = e.f32();
  if (t & -511) throw new Error("EMF+ 暂不支持该画笔轮廓");
  const s = t & 2 ? e.u32() : 0, n = t & 4 ? e.u32() : 0, o = t & 8 ? e.u32() : 0, c = t & 16 ? e.f32() : 10, h = t & 32 ? e.u32() : 0, a = t & 64 ? e.u32() : 0, f = t & 128 ? e.f32() : 0, l = t & 256 ? Array.from({ length: e.count(4096) }, () => e.f32()) : [[], [3, 1], [1, 1], [3, 1, 1, 1], [3, 1, 1, 1, 1, 1]][h];
  if (!l || l.some((d) => d < 0) || r < 0 || s > 2 || n > 2 || a > 2 || o > 3) throw new Error("EMF+ 非法描边参数");
  return { paint: Bt(e), unit: i, width: r, start: s, end: n, join: o, miter: c, dash: l, offset: f };
}
function De(e) {
  if (e.u32(), e.u32() !== 1) throw new Error("EMF+ 嵌套图元暂不支持");
  const t = e.i32(), i = e.i32(), r = e.i32(), s = e.u32(), n = e.u32();
  if (n === 1) {
    const a = e.take(e.left), f = a[0] === 137 && a[1] === 80 && a[2] === 78 && a[3] === 71 ? "png" : a[0] === 255 && a[1] === 216 ? "jpeg" : a[0] === 71 && a[1] === 73 && a[2] === 70 ? "gif" : "";
    if (!f) throw new Error("EMF+ 未识别压缩图片");
    return { width: t, height: i, href: `data:image/${f};base64,${ht(a)}` };
  }
  const o = s >>> 8 & 255;
  if (n !== 0 || t <= 0 || i <= 0 || t * i > 16e6 || ![24, 32].includes(o) || Math.abs(r) < t * o / 8) throw new Error("EMF+ 非法位图");
  const c = e.take(Math.abs(r) * i), h = new Uint8Array(t * i * 4);
  for (let a = 0; a < i; a++) for (let f = 0; f < t; f++) {
    const l = (r < 0 ? i - 1 - a : a) * Math.abs(r) + f * o / 8, d = (a * t + f) * 4, p = o === 32 && s & 262144 ? c[l + 3] : 255, w = s & 524288 ? p ? 255 / p : 0 : 1;
    for (let x = 0; x < 3; x++) h[d + x] = Math.min(255, Math.round(c[l + 2 - x] * w));
    h[d + 3] = p;
  }
  return { width: t, height: i, href: `data:image/png;base64,${ht(Ct(h, t, i))}` };
}
class Fe {
  constructor() {
    this.raw = /* @__PURE__ */ new Map(), this.partial = /* @__PURE__ */ new Map();
  }
  set(t, i) {
    const r = t & 255, s = t >>> 8 & 127;
    if (r > 63 || i.length > 32 * 1024 * 1024) throw new Error("EMF+ 对象超限");
    let n = this.partial.get(r);
    if (t & 32768 || n) {
      const o = new V(i), c = o.count(32 * 1024 * 1024);
      if (n ?? (n = { type: s, size: c, at: 0, bytes: new Uint8Array(c) }), s !== n.type || c !== n.size || n.at + o.left > c) throw new Error("EMF+ 继续对象不一致");
      const h = o.take(o.left);
      if (n.bytes.set(h, n.at), n.at += h.length, t & 32768) {
        this.partial.set(r, n);
        return;
      }
      if (n.at !== c) throw new Error("EMF+ 对象不完整");
      this.partial.delete(r), i = n.bytes;
    }
    this.raw.set(r, { type: s, bytes: i });
  }
  get(t, i) {
    const r = this.raw.get(t);
    if (!r || r.type !== i || this.partial.has(t)) throw new Error("EMF+ 对象引用失效");
    return r.value === void 0 && (r.value = Ne(i, new V(r.bytes))), r.value;
  }
  finish() {
    if (this.partial.size) throw new Error("EMF+ 对象缺少尾段");
  }
}
function Ne(e, t) {
  if (e === 1) return Bt(t);
  if (e === 2) return Ce(t);
  if (e === 5) return De(t);
  if (t.u32(), e === 3) {
    const n = t.count(), o = t.u32(), c = t.points(n, o), h = [];
    for (; h.length < n; ) {
      const a = t.u8();
      if (o & 2048 && a & 64) {
        const f = a & 63, l = t.u8();
        if (!f || f + h.length > n) throw new Error("EMF+ 路径 RLE 越界");
        for (let d = 0; d < f; d++) h.push(l);
      } else h.push(a);
    }
    return Nt(c, h);
  }
  if (e === 6) {
    const n = t.f32(), o = t.u32(), c = t.u32();
    if (t.u32(), n <= 0) throw new Error("EMF+ 非法字号");
    return { size: n, unit: o, style: c, name: t.text(t.count(4096)) };
  }
  const i = t.u32();
  t.u32();
  const r = t.u32(), s = t.u32();
  return { flags: i, align: r, lineAlign: s };
}
let Be = 0;
const jt = () => `emfp${++Be}`, xt = (e) => `matrix(${e.map(u).join(" ")})`;
function Yt(e, t) {
  if (e.kind === "solid") return e.color;
  const i = jt();
  if (e.kind === "gradient") {
    const r = e.box;
    t.push(`<linearGradient id="${i}" gradientUnits="userSpaceOnUse" x1="${u(r.x)}" y1="${u(r.y)}" x2="${u(r.x + r.w)}" y2="${u(r.y + r.h)}" spreadMethod="${e.wrap === 4 ? "pad" : e.wrap ? "reflect" : "repeat"}" color-interpolation="${e.gamma ? "linearRGB" : "sRGB"}"${e.matrix ? ` gradientTransform="${xt(e.matrix)}"` : ""}>${e.stops.map((s) => `<stop offset="${u(s.offset * 100)}%" stop-color="${s.color}"/>`).join("")}</linearGradient>`);
  } else {
    const r = ["M0 4H8", "M4 0V8", "M-1 1L7 9M1-1L9 7", "M-1 7L7-1M1 9L9 1", "M0 4H8M4 0V8", "M-1 1L7 9M1-1L9 7M-1 7L7-1M1 9L9 1"];
    t.push(`<pattern id="${i}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${e.background}"/><path d="${r[e.style]}" stroke="${e.color}" fill="none"/></pattern>`);
  }
  return `url(#${i})`;
}
function je(e, t, i, r) {
  if (e.start !== e.end) throw new Error("EMF+ 非对称线帽暂不支持");
  const s = e.width ? e.width * (e.unit === 0 ? 1 : _(e.unit, t) / i) : 1 / i;
  return `fill="none" stroke="${Yt(e.paint, r)}" stroke-width="${u(s)}" stroke-linecap="${["butt", "square", "round"][e.start]}" stroke-linejoin="${["miter", "bevel", "round", "miter"][e.join]}" stroke-miterlimit="${u(Math.max(1, e.miter))}"${e.dash.length ? ` stroke-dasharray="${e.dash.map((n) => u(n * s)).join(" ")}" stroke-dashoffset="${u(e.offset * s)}"` : ""}`;
}
function St(e, t) {
  return `font-family="${st(e.name)}" font-size="${u(t)}"${e.style & 1 ? ' font-weight="700"' : ""}${e.style & 2 ? ' font-style="italic"' : ""}${e.style & 12 ? ` text-decoration="${[e.style & 4 ? "underline" : "", e.style & 8 ? "line-through" : ""].filter(Boolean).join(" ")}"` : ""}`;
}
function Ye(e, t, i, r) {
  if (r.flags & 2) throw new Error("EMF+ 竖排字符串暂不支持");
  const s = (l) => Array.from(l).reduce((d, p) => d + (p.charCodeAt(0) >= 11904 ? 1 : /[il.,' ]/.test(p) ? 0.3 : 0.56) * i, 0), n = [];
  for (const l of e.replace(/\r\n?/g, `
`).split(`
`)) {
    let d = "";
    for (const p of l.match(/\S+\s*|\s+/g) ?? [""])
      !(r.flags & 4096) && t.w > 0 && d && s(d + p) > t.w && (n.push(d.trimEnd()), d = ""), d += p;
    n.push(d);
  }
  const o = n.length * i * 1.2, c = t.y + Math.max(0, t.h - o) * (r.lineAlign === 1 ? 0.5 : r.lineAlign === 2 ? 1 : 0), h = !!(r.flags & 1), a = h ? 2 - r.align : r.align, f = t.x + t.w * (a === 1 ? 0.5 : a === 2 ? 1 : 0);
  return n.map((l, d) => `<tspan x="${u(f)}" y="${u(c + i + d * i * 1.2)}" text-anchor="${["start", "middle", "end"][a] ?? "start"}"${h ? ' direction="rtl" unicode-bidi="embed"' : ""}>${st(l)}</tspan>`).join("");
}
class Xe {
  constructor(t, i, r) {
    this.bounds = t, this.emit = i, this.clear = r, this.active = !1, this.dual = !1, this.getDC = !1, this.ended = !1, this.dpiX = 96, this.dpiY = 96, this.objects = new Fe(), this.defs = [], this.state = { world: [...et], sx: 1, sy: 1, clip: null }, this.stack = [];
  }
  matrix() {
    return Y(this.state.world, [this.state.sx, 0, 0, this.state.sy, 0, 0]);
  }
  add(t, i = this.matrix()) {
    this.emit(`<g${this.state.clip ? ` clip-path="url(#${this.state.clip})"` : ""}><g transform="${xt(i)}">${t}</g></g>`);
  }
  fill(t, i) {
    const r = t.u32();
    return i & 32768 ? j(r) : Yt(this.objects.get(r, 1), this.defs);
  }
  stroke(t) {
    return je(this.objects.get(t, 2), this.dpiY, this.state.sy, this.defs);
  }
  clip(t, i) {
    if (i !== 0 && i !== 1) throw new Error("EMF+ 暂不支持该裁剪组合");
    const r = jt(), s = i === 1 ? this.state.clip : null;
    this.defs.push(`<clipPath id="${r}"${s ? ` clip-path="url(#${s})"` : ""}>${t.replace(/^<(\w+)/, `<$1 transform="${xt(this.matrix())}"`)}</clipPath>`), this.state.clip = r;
  }
  record(t, i, r) {
    const s = new V(r), n = i & 255, o = !!(i & 16384);
    if (this.getDC = !1, t === 16385) {
      if (this.active) throw new Error("EMF+ 重复头记录");
      if (this.active = !0, this.dual = !!(i & 1), s.take(8), this.dpiX = s.u32(), this.dpiY = s.u32(), !this.dpiX || !this.dpiY || this.dpiX > 1e5 || this.dpiY > 1e5) throw new Error("EMF+ 非法 DPI");
      return;
    }
    if (!this.active || this.ended) throw new Error("EMF+ 记录顺序错误");
    if (t === 16386) {
      this.objects.finish(), this.ended = !0;
      return;
    }
    if (t !== 16387) {
      if (t === 16392) {
        this.objects.set(i, r);
        return;
      }
      if (t === 16393) {
        const c = j(s.u32());
        this.clear(), this.emit(`<rect ${ct(this.bounds)} fill="${c}"/>`);
        return;
      }
      if (t === 16394 || t === 16395) {
        const c = t === 16394 ? `fill="${this.fill(s, i)}"` : this.stroke(n), h = s.count();
        for (let a = 0; a < h; a++) this.add(`<rect ${ct(s.rect(o))} ${c}/>`);
        return;
      }
      if (t === 16396 || t === 16397 || t === 16409) {
        const c = t === 16396 ? `fill="${this.fill(s, i)}" fill-rule="${i & 8192 ? "nonzero" : "evenodd"}"` : this.stroke(n), h = s.points(s.count(), i), a = t === 16409 ? h.map((f, l) => l ? 3 : 0) : void 0;
        this.add(`<path d="${Nt(h, a, t === 16396 || t === 16397 && !!(i & 8192))}" ${c}/>`);
        return;
      }
      if (t === 16398 || t === 16399) {
        const c = t === 16398 ? `fill="${this.fill(s, i)}"` : this.stroke(n), h = s.rect(o);
        this.add(`<ellipse cx="${u(h.x + h.w / 2)}" cy="${u(h.y + h.h / 2)}" rx="${u(Math.abs(h.w / 2))}" ry="${u(Math.abs(h.h / 2))}" ${c}/>`);
        return;
      }
      if (t >= 16400 && t <= 16402) {
        const c = t === 16400 ? `fill="${this.fill(s, i)}"` : this.stroke(n), h = s.f32(), a = s.f32();
        this.add(`<path d="${Ie(s.rect(o), h, a, t !== 16402)}" ${c}/>`);
        return;
      }
      if (t === 16404 || t === 16405) {
        const c = t === 16404 ? `fill="${this.fill(s, i)}" fill-rule="evenodd"` : this.stroke(s.u32());
        this.add(`<path d="${this.objects.get(n, 3)}" ${c}/>`);
        return;
      }
      if (t >= 16406 && t <= 16408) {
        const c = t === 16406 ? `fill="${this.fill(s, i)}" fill-rule="${i & 8192 ? "nonzero" : "evenodd"}"` : this.stroke(n), h = s.f32(), a = t === 16408 ? s.count() : 0, f = t === 16408 ? s.count() : void 0;
        this.add(`<path d="${Re(s.points(s.count(), i), h, t !== 16408, a, f)}" ${c}/>`);
        return;
      }
      if (t === 16410 || t === 16411) {
        if (s.u32() !== 4294967295) throw new Error("EMF+ 图片颜色变换暂不支持");
        if (s.u32() !== 2) throw new Error("EMF+ 图片来源必须为像素");
        const h = s.rect(), a = this.objects.get(n, 5);
        let f;
        if (t === 16410) {
          const l = s.rect(o);
          f = [l.w, 0, 0, l.h, l.x, l.y];
        } else {
          if (s.count() !== 3) throw new Error("EMF+ 图片目标不是三点");
          const [l, d, p] = s.points(3, i);
          f = [d.x - l.x, d.y - l.y, p.x - l.x, p.y - l.y, l.x, l.y];
        }
        if (h.w <= 0 || h.h <= 0) throw new Error("EMF+ 图片裁剪无效");
        this.add(`<svg width="1" height="1" viewBox="${[h.x, h.y, h.w, h.h].map(u).join(" ")}" preserveAspectRatio="none" overflow="hidden"><image href="${a.href}" x="0" y="0"${a.width > 0 && a.height > 0 ? ` width="${a.width}" height="${a.height}"` : ""}/></svg>`, Y(f, this.matrix()));
        return;
      }
      if (t === 16412) {
        const c = this.fill(s, i), h = s.u32(), a = s.count(), f = s.rect(), l = s.text(a), d = this.objects.get(n, 6), p = h === 4294967295 ? { flags: 0, align: 0, lineAlign: 0 } : this.objects.get(h, 7), w = d.size * _(d.unit, this.dpiY) / this.state.sy, x = this.state.clip;
        !(p.flags & 16384) && f.w > 0 && f.h > 0 && this.clip(`<rect ${ct(f)}/>`, 1), this.add(`<text xml:space="preserve" fill="${c}" ${St(d, w)}>${Ye(l, f, w, p)}</text>`), this.state.clip = x;
        return;
      }
      if (t === 16438) {
        const c = this.fill(s, i), h = s.u32(), a = s.u32(), f = s.count();
        if (!(h & 1) || h & -2) throw new Error("EMF+ 字形索引/竖排驱动文本暂不支持");
        const l = s.text(f), d = s.points(f, 0), p = a ? s.matrix() : et, w = this.objects.get(n, 6), x = w.size * _(w.unit, this.dpiY) / this.state.sy;
        this.add(`<text fill="${c}" ${St(w, x)}>${d.map((m, M) => `<tspan x="${u(m.x)}" y="${u(m.y)}">${st(l[M] ?? "")}</tspan>`).join("")}</text>`, Y(p, this.matrix()));
        return;
      }
      this.control(t, i, s);
    }
  }
  control(t, i, r) {
    if (!(t >= 16413 && t <= 16418 || t === 16420)) {
      if (t === 16388) {
        this.getDC = !0;
        return;
      }
      if (t === 16419) {
        if (i & 255) throw new Error("EMF+ SourceCopy 暂不支持");
        return;
      }
      if (t === 16421 || t === 16424 || t === 16423) {
        let s;
        if (t === 16423) {
          const n = r.rect(), o = r.rect(), c = _(i & 255, this.dpiX) / this.state.sx, h = _(i & 255, this.dpiY) / this.state.sy;
          if (!o.w || !o.h) throw new Error("EMF+ 容器来源为空");
          s = [n.w / (o.w * c), 0, 0, n.h / (o.h * h), n.x - o.x * n.w / o.w, n.y - o.y * n.h / o.h];
        }
        if (this.stack.length > 1024) throw new Error("EMF+ 状态栈超限");
        this.stack.push({ id: r.u32(), container: t !== 16421, state: { ...this.state, world: [...this.state.world] } }), s && (this.state.world = Y(s, this.state.world));
        return;
      }
      if (t === 16422 || t === 16425) {
        const s = r.u32();
        let n = this.stack.length - 1;
        for (; n >= 0 && (this.stack[n].id !== s || this.stack[n].container !== (t === 16425)); ) n--;
        if (n < 0) throw new Error("EMF+ 状态恢复失效");
        this.state = this.stack[n].state, this.stack.length = n;
        return;
      }
      if (t === 16427) {
        this.state.world = [...et];
        return;
      }
      if (t === 16432) {
        const s = r.f32();
        if (s <= 0) throw new Error("EMF+ 非法页面比例");
        this.state.sx = s * _(i & 255, this.dpiX), this.state.sy = s * _(i & 255, this.dpiY);
        return;
      }
      if (t >= 16426 && t <= 16431) {
        let s;
        if (t === 16426 || t === 16428) s = r.matrix();
        else if (t === 16429) s = [1, 0, 0, 1, r.f32(), r.f32()];
        else if (t === 16430) s = [r.f32(), 0, 0, r.f32(), 0, 0];
        else {
          const n = r.f32() * Math.PI / 180;
          s = [Math.cos(n), Math.sin(n), -Math.sin(n), Math.cos(n), 0, 0];
        }
        this.state.world = t === 16426 ? s : i & 8192 ? Y(this.state.world, s) : Y(s, this.state.world);
        return;
      }
      if (t === 16433) {
        this.state.clip = null;
        return;
      }
      if (t === 16434) {
        this.clip(`<rect ${ct(r.rect())}/>`, i >>> 8 & 15);
        return;
      }
      if (t === 16435) {
        this.clip(`<path d="${this.objects.get(i & 255, 3)}" fill-rule="evenodd"/>`, i >>> 8 & 15);
        return;
      }
      throw new Error(`EMF+ 暂不支持记录 0x${t.toString(16)}`);
    }
  }
}
function ct(e) {
  return `x="${u(e.x)}" y="${u(e.y)}" width="${u(Math.max(0, e.w))}" height="${u(Math.max(0, e.h))}"`;
}
function Ue(e, t = {}) {
  var r;
  if (!Dt(e)) return { mode: "absent", svg: null };
  let i;
  try {
    const s = new V(e);
    s.take(8);
    const n = s.i32(), o = s.i32(), c = s.i32(), h = s.i32(), a = s.i32(), f = s.i32(), l = s.i32(), d = s.i32();
    s.take(32);
    const p = s.i32(), w = s.i32(), x = s.i32(), m = s.i32(), M = { x: n, y: o, w: Math.max(1, c - n + 1), h: Math.max(1, h - o + 1) }, y = { l: n, t: o, r: n + M.w, b: o + M.h }, g = t.width ?? ((l - a) * 96 / 2540 || M.w), b = t.height ?? ((d - f) * 96 / 2540 || M.h), L = new It({ pxPerMmX: x > 0 ? p / x : 96 / 25.4, pxPerMmY: m > 0 ? w / m : 96 / 25.4 }), X = [];
    let z = 0, C = "", U = "", W = 0;
    i = new Xe(M, (G) => {
      if (z += G.length, z > 32 * 1024 * 1024) throw new Error("EMF+ 输出超限");
      X.push(G);
    }, () => {
      X.length = 0, z = 0;
    });
    const D = new V(e);
    for (; D.left; ) {
      if (++W > 1e5) throw new Error("EMF+ 记录超限");
      const G = D.p, T = D.u32(), A = D.u32();
      if (A < 8 || A % 4) throw new Error("EMF 记录长度错误");
      const O = D.take(A - 8);
      if (T === 14) break;
      if (T === 70 && O.length >= 8) {
        const P = new V(O), k = new V(P.take(P.u32()));
        if (k.u32() !== 726027589) continue;
        for (; k.left; ) {
          const S = k.u16(), F = k.u16(), R = k.u32(), Z = k.u32();
          if (R < 12 || R % 4 || Z > R - 12) throw new Error("EMF+ 记录长度错误");
          const I = k.take(R - 12);
          i.record(S, F, I.subarray(0, Z));
        }
      } else if (T !== 1 && i.active && i.getDC) {
        Ft(L, e, T, G, A);
        const P = L.render(y, g, b), k = P.slice(P.indexOf(">") + 1, -6);
        U = ((r = k.match(/^<defs>([\s\S]*?)<\/defs>/)) == null ? void 0 : r[1]) ?? "";
        const S = k.replace(/^<defs>[\s\S]*?<\/defs>/, "");
        S.length > C.length && X.push(`<g${i.state.clip ? ` clip-path="url(#${i.state.clip})"` : ""}>${S.slice(C.length)}</g>`), C = S;
      }
    }
    if (!i.active) return { mode: "absent", svg: null };
    if (!i.ended) throw new Error("EMF+ 缺少结束记录");
    return { mode: "emf-plus", svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${u(g)}" height="${u(b)}" viewBox="${[n, o, M.w, M.h].map(u).join(" ")}"><defs>${U}${i.defs.join("")}</defs>${X.join("")}</svg>` };
  } catch (s) {
    const n = s instanceof Error ? s.message : String(s);
    return i != null && i.dual ? { mode: "emf-fallback", svg: Me(e, t), reason: n } : { mode: "unsupported", svg: null, reason: n };
  }
}
function He(e, t) {
  const i = Ue(e, t);
  return i.mode === "absent" ? Xt(e, t) : i.svg;
}
function _e() {
  Ut(He);
}
export {
  Ue as decodeEmfPlus,
  He as emfPlusToSvg,
  _e as enableEmfPlus
};
