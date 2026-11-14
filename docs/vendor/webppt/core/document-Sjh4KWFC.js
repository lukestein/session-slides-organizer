import { Unzlib as N, zlibSync as x } from "../../fflate/esm/browser.js";
function v(o) {
  if (!(o != null && o.length)) return [];
  const h = [];
  for (const r of o) {
    const i = r.clickGroup ?? 0;
    (h[i] ?? (h[i] = [])).push(r);
  }
  return h.filter(Boolean);
}
function I(o, h) {
  const r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  for (const t of o)
    for (const n of t)
      n.kind !== "entrance" && n.kind !== "exit" || i.has(n.target) || (i.add(n.target), n.kind === "entrance" && r.add(n.target));
  for (let t = 0; t < h && t < o.length; t++)
    for (const n of o[t])
      n.kind === "entrance" ? r.delete(n.target) : n.kind === "exit" && r.add(n.target);
  return r;
}
function k(o) {
  const h = v(o.animations);
  if (!h.length) return /* @__PURE__ */ new Set();
  const r = I(h, h.length);
  if (!r.size) return r;
  const i = [], t = (n) => {
    for (const s of n)
      s.id !== void 0 && i.push(s.id), s.kind === "group" && t(s.children);
  };
  return t(o.elements), i.length && i.every((n) => r.has(n)) ? /* @__PURE__ */ new Set() : r;
}
function T(o, h = !1) {
  if (o.length < 33 || [137, 80, 78, 71, 13, 10, 26, 10].some((e, f) => o[f] !== e)) throw new Error("PDF 页面不是 PNG");
  const r = new DataView(o.buffer, o.byteOffset, o.byteLength), i = [];
  let t = 0, n = 0, s = 0, c = !1, P = !1;
  for (let e = 8; e + 12 <= o.length; ) {
    const f = r.getUint32(e), d = String.fromCharCode(...o.subarray(e + 4, e + 8));
    if (f > o.length - e - 12) throw new Error("PDF 页面 PNG 已截断");
    const l = o.subarray(e + 8, e + 8 + f);
    if (d === "IHDR") {
      if (t || f !== 13 || e !== 8) throw new Error("PDF 页面 PNG 头无效");
      if (t = r.getUint32(e + 8), n = r.getUint32(e + 12), s = { 0: 1, 2: 3, 4: 2, 6: 4 }[l[9]], !t || !n || t * n > 16e6 || l[8] !== 8 || !s || l[10] || l[11] || l[12]) throw new Error("PDF 页面需要不超过 1600 万像素的非交错 8-bit PNG");
    } else if (d === "IDAT") {
      if (!s || P) throw new Error("PDF 页面 PNG 数据块顺序无效");
      i.push(l);
    } else if (d === "IEND") {
      if (f || e + 12 !== o.length) throw new Error("PDF 页面 PNG 结束块无效");
      c = !0;
      break;
    } else if (d === "tRNS") throw new Error("PDF 页面 PNG 透明色键暂不支持");
    if (d !== "IDAT" && i.length && (P = !0), d !== "IHDR" && d !== "IDAT" && d !== "IEND" && !(o[e + 4] & 32)) throw new Error("PDF 页面 PNG 存在不支持的关键块");
    e += f + 12;
  }
  if (!c || !s || !i.length) throw new Error("PDF 页面 PNG 不完整");
  const a = t * s, u = (a + 1) * n, w = new Uint8Array(u);
  let y = 0;
  const g = new N((e) => {
    if (y + e.length > u) throw new Error("PDF 页面 PNG 解压超限");
    w.set(e, y), y += e.length;
  });
  for (let e = 0; e < i.length; e++)
    for (let f = 0; f < i[e].length; f += 4096) g.push(i[e].subarray(f, f + 4096), !1);
  if (g.push(new Uint8Array(), !0), y !== u) throw new Error("PDF 页面 PNG 像素长度不符");
  const E = new Uint8Array(t * n * 3), D = h && (s === 2 || s === 4) ? new Uint8Array(t * n) : void 0, S = (e, f, d) => {
    const l = e + f - d, p = Math.abs(l - e), b = Math.abs(l - f), $ = Math.abs(l - d);
    return p <= b && p <= $ ? e : b <= $ ? f : d;
  };
  for (let e = 0; e < n; e++) {
    const f = e * (a + 1), d = w[f];
    if (d > 4) throw new Error("PDF 页面 PNG 滤波器无效");
    for (let l = 1; l <= a; l++) {
      const p = l > s ? w[f + l - s] : 0, b = e ? w[f + l - a - 1] : 0, $ = e && l > s ? w[f + l - a - 1 - s] : 0;
      w[f + l] += d === 0 ? 0 : d === 1 ? p : d === 2 ? b : d === 3 ? Math.floor((p + b) / 2) : S(p, b, $);
    }
    for (let l = 0; l < t; l++) {
      const p = f + 1 + l * s, b = (e * t + l) * 3, $ = s === 2 || s === 4 ? w[p + s - 1] / 255 : 1;
      D && (D[e * t + l] = w[p + s - 1]);
      for (let m = 0; m < 3; m++) E[b + m] = h ? w[p + (s <= 2 ? 0 : m)] : Math.round(w[p + (s <= 2 ? 0 : m)] * $ + 255 * (1 - $));
    }
  }
  return {
    width: t,
    height: n,
    compressed: x(E, { level: 6 }),
    ...D ? { softMask: x(D, { level: 6 }) } : {}
  };
}
const G = new TextEncoder(), F = (o) => G.encode(o), R = (o) => String(Math.round(o * 1e3) / 1e3);
function j(o) {
  let h = "feff";
  for (let r = 0; r < o.length; r++) h += o.charCodeAt(r).toString(16).padStart(4, "0");
  return `<${h}>`;
}
class A {
  constructor(h, r, i = "") {
    if (this.width = h, this.height = r, this.title = i, this.objects = [null, null, null], this.pages = [], this.total = 0, this.closed = !1, ![h, r].every((t) => Number.isFinite(t) && t > 0 && t <= 14400)) throw new Error("PDF 页面尺寸必须为 0–14400 pt");
  }
  reserve() {
    return this.objects.push(null), this.objects.length - 1;
  }
  put(h, r) {
    const i = r.map((t) => typeof t == "string" ? F(t) : t);
    if (this.total += i.reduce((t, n) => t + n.length, 0), this.total > 256 * 1024 * 1024) throw new Error("PDF 文件超过浏览器导出大小限制");
    this.objects[h] = i;
  }
  addPage(h, r = []) {
    if (this.closed) throw new Error("PDF 已结束");
    if (this.pages.length >= 1e4) throw new Error("PDF 页数超限");
    if (r.length > 1e4 || r.some((c) => ![c.x, c.y].every(Number.isFinite))) throw new Error("PDF 批注数量或坐标无效");
    const i = /* @__PURE__ */ new Set();
    for (const c of r) {
      if (c.id && i.has(c.id)) throw new Error("PDF 批注身份重复");
      c.id && i.add(c.id);
    }
    const t = T(h), n = this.objects.length, s = this.total;
    try {
      const c = this.reserve(), P = this.reserve(), a = this.reserve(), u = `q ${R(this.width)} 0 0 ${R(this.height)} 0 0 cm /Im0 Do Q
`;
      this.put(a, [`<< /Length ${F(u).length} >>
stream
`, u, "endstream"]), this.put(P, [`<< /Type /XObject /Subtype /Image /Width ${t.width} /Height ${t.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${t.compressed.length} >>
stream
`, t.compressed, `
endstream`]);
      const w = r.map(() => this.reserve()), y = new Map(r.map((g, E) => [g.id, w[E]]));
      r.forEach((g, E) => {
        const D = Math.max(0, Math.min(this.width - 12, (g.x ?? 0) * 0.75)), S = Math.max(0, Math.min(this.height - 12, this.height - (g.y ?? 0) * 0.75 - 12)), e = g.parentId ? y.get(g.parentId) : void 0;
        this.put(w[E], [`<< /Type /Annot /Subtype /Text /Rect [${[D, S, D + 12, S + 12].map(R).join(" ")}] /Contents ${j(g.text)} /T ${j(g.author ?? "")} /Name /Comment /F 4 /P ${c} 0 R${e ? ` /IRT ${e} 0 R /RT /R` : ""} >>`]);
      }), this.put(c, [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${R(this.width)} ${R(this.height)}] /Resources << /XObject << /Im0 ${P} 0 R >> >> /Contents ${a} 0 R${w.length ? ` /Annots [${w.map((g) => `${g} 0 R`).join(" ")}]` : ""} >>`]), this.pages.push(c);
    } catch (c) {
      throw this.objects.length = n, this.total = s, c;
    }
  }
  finish() {
    if (this.closed) throw new Error("PDF 已结束");
    if (!this.pages.length) throw new Error("没有可导出的 PDF 页面");
    this.closed = !0;
    const h = this.reserve();
    this.put(1, ["<< /Type /Catalog /Pages 2 0 R >>"]), this.put(2, [`<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map((a) => `${a} 0 R`).join(" ")}] >>`]), this.put(h, [`<< /Producer ${j("Web-PPT")} /Title ${j(this.title)} >>`]);
    const r = [F(`%PDF-1.4
%`), new Uint8Array([226, 227, 207, 211, 10])], i = [0];
    let t = r.reduce((a, u) => a + u.length, 0);
    const n = (a) => {
      r.push(a), t += a.length;
    };
    for (let a = 1; a < this.objects.length; a++) {
      const u = this.objects[a];
      if (!u) throw new Error("PDF 对象尚未写入");
      i.push(t), n(F(`${a} 0 obj
`)), u.forEach(n), n(F(`
endobj
`));
    }
    const s = t;
    n(F(`xref
0 ${i.length}
0000000000 65535 f 
${i.slice(1).map((a) => `${String(a).padStart(10, "0")} 00000 n 
`).join("")}trailer
<< /Size ${i.length} /Root 1 0 R /Info ${h} 0 R >>
startxref
${s}
%%EOF
`));
    const c = new Uint8Array(t);
    let P = 0;
    for (const a of r)
      c.set(a, P), P += a.length;
    return this.objects.length = 0, c;
  }
}
export {
  A as P,
  T as a,
  v as g,
  I as h,
  j as p,
  k as s
};
