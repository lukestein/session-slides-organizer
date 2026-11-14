const d = (n, i, a) => [...a].every((t, o) => n[i + o] === t.charCodeAt(0)), x = (n, i) => n[i] * 256 + n[i + 1], M = (n, i) => n[i] + n[i + 1] * 256, R = (n, i) => n[i] + n[i + 1] * 256 + n[i + 2] * 65536, F = (n, i) => n[i] * 16777216 + n[i + 1] * 65536 + n[i + 2] * 256 + n[i + 3], I = (n, i) => n[i] + n[i + 1] * 256 + n[i + 2] * 65536 + n[i + 3] * 16777216 >>> 0, $ = (n, i) => {
  const a = x(n, i);
  return a > 32767 ? a - 65536 : a;
}, k = (n, i) => {
  const a = M(n, i);
  return a > 32767 ? a - 65536 : a;
}, v = (n, i) => I(n, i) | 0, w = (n, i, a = 96, t = 96) => Number.isFinite(n) && Number.isFinite(i) && n > 0 && i > 0 ? { width: n, height: i, dpiX: a > 0 ? a : 96, dpiY: t > 0 ? t : 96 } : null;
function A(n) {
  if (n.length < 24 || !d(n, 1, "PNG")) return null;
  const i = F(n, 16), a = F(n, 20);
  let t = 96, o = 96;
  for (let f = 8; f + 12 <= n.length; ) {
    const r = F(n, f);
    if (r > n.length - f - 12) break;
    d(n, f + 4, "pHYs") && r === 9 && n[f + 16] === 1 && (t = F(n, f + 8) * 0.0254, o = F(n, f + 12) * 0.0254), f += r + 12;
  }
  return w(i, a, t, o);
}
const T = /* @__PURE__ */ new Set([
  192,
  193,
  194,
  195,
  197,
  198,
  199,
  201,
  202,
  203,
  205,
  206,
  207
]);
function B(n, i, a) {
  if (i + 14 > a || !d(n, i, "Exif\0\0")) return null;
  const t = i + 6, o = d(n, t, "II");
  if (!o && !d(n, t, "MM")) return null;
  const f = (g, p) => g >= t && g + p <= a, r = (g) => o ? M(n, g) : x(n, g), e = (g) => o ? I(n, g) : F(n, g);
  if (!f(t, 8) || r(t + 2) !== 42) return null;
  const l = t + e(t + 4);
  if (!f(l, 2)) return null;
  let c = 0, u = 0, m = 2;
  const P = r(l);
  for (let g = 0; g < P; g++) {
    const p = l + 2 + g * 12;
    if (!f(p, 12)) break;
    const L = r(p), j = r(p + 2), C = e(p + 4);
    let D = 0;
    if (C === 1 && j === 3) D = r(p + 8);
    else if (C === 1 && j === 5) {
      const N = t + e(p + 8);
      f(N, 8) && (D = e(N) / Math.max(e(N + 4), 1));
    }
    L === 282 ? c = D : L === 283 ? u = D : L === 296 && D && (m = D);
  }
  const s = m === 3 ? 2.54 : m === 2 ? 1 : 0;
  return c > 0 && s ? [c * s, (u || c) * s] : null;
}
function G(n) {
  if (n.length < 12 || n[0] !== 255 || n[1] !== 216) return null;
  let i = 0, a = 0, t = null, o = null;
  for (let r = 2; r + 4 <= n.length; ) {
    if (n[r++] !== 255) continue;
    for (; n[r] === 255; ) r++;
    const e = n[r++];
    if (e === 218 || e === 217) break;
    if (e === 1 || e >= 208 && e <= 215) continue;
    if (r + 2 > n.length) break;
    const l = x(n, r);
    if (l < 2 || r + l > n.length) break;
    const c = r + 2;
    if (e === 224 && l >= 14 && d(n, c, "JFIF\0")) {
      const u = n[c + 7], m = u === 1 ? 1 : u === 2 ? 2.54 : 0;
      m && (t = [x(n, c + 8) * m, x(n, c + 10) * m]);
    } else e === 225 && l >= 16 ? o ?? (o = B(n, c, r + l)) : T.has(e) && l >= 7 && (a = x(n, c + 1), i = x(n, c + 3));
    r += l;
  }
  const f = t ?? o ?? [96, 96];
  return w(i, a, f[0], f[1]);
}
function H(n) {
  return n.length < 10 || !d(n, 0, "GIF87a") && !d(n, 0, "GIF89a") ? null : w(M(n, 6), M(n, 8));
}
function S(n) {
  if (n.length < 26 || !d(n, 0, "BM")) return null;
  const i = I(n, 14);
  if (i === 12) return w(M(n, 18), M(n, 20));
  if (i < 40 || n.length < 46) return null;
  const a = Math.abs(v(n, 18)), t = Math.abs(v(n, 22)), o = v(n, 38) * 0.0254, f = v(n, 42) * 0.0254;
  return w(a, t, o, f);
}
function U(n) {
  if (n.length < 30 || !d(n, 0, "RIFF") || !d(n, 8, "WEBP")) return null;
  for (let i = 12; i + 8 <= n.length; ) {
    const a = I(n, i + 4), t = i + 8;
    if (a > n.length - t) break;
    if (d(n, i, "VP8X") && a >= 10)
      return w(R(n, t + 4) + 1, R(n, t + 7) + 1);
    if (d(n, i, "VP8L") && a >= 5 && n[t] === 47) {
      const o = I(n, t + 1);
      return w((o & 16383) + 1, (o >>> 14 & 16383) + 1);
    }
    if (d(n, i, "VP8 ") && a >= 10 && d(n, t + 3, "*"))
      return w(M(n, t + 6) & 16383, M(n, t + 8) & 16383);
    i = t + a + (a & 1);
  }
  return null;
}
function W(n) {
  if (n.length < 16) return null;
  const i = d(n, 0, "II");
  if (!i && !d(n, 0, "MM")) return null;
  const a = (c) => i ? M(n, c) : x(n, c), t = (c) => i ? I(n, c) : F(n, c);
  if (a(2) !== 42) return null;
  const o = t(4);
  if (o + 2 > n.length) return null;
  const f = a(o), r = /* @__PURE__ */ new Map();
  for (let c = 0; c < f; c++) {
    const u = o + 2 + c * 12;
    if (u + 12 > n.length) break;
    const m = a(u), P = a(u + 2), s = t(u + 4);
    let g = 0;
    if (s === 1 && P === 3) g = a(u + 8);
    else if (s === 1 && P === 4) g = t(u + 8);
    else if (s === 1 && P === 5) {
      const p = t(u + 8);
      p + 8 <= n.length && (g = t(p) / Math.max(t(p + 4), 1));
    }
    g && r.set(m, g);
  }
  const e = r.get(296) ?? 2, l = e === 3 ? 2.54 : e === 2 ? 1 : 0;
  return w(
    r.get(256) ?? 0,
    r.get(257) ?? 0,
    l ? (r.get(282) ?? 96) * l : 96,
    l ? (r.get(283) ?? r.get(282) ?? 96) * l : 96
  );
}
function X(n) {
  var e, l;
  const a = (e = new TextDecoder().decode(n.subarray(0, Math.min(n.length, 65536))).match(/<svg\b[^>]*>/i)) == null ? void 0 : e[0];
  if (!a) return null;
  const t = (c) => {
    var s;
    const u = (s = a.match(new RegExp(`\\b${c}\\s*=\\s*["']([^"']+)["']`, "i"))) == null ? void 0 : s[1], m = u == null ? void 0 : u.trim().match(/^([0-9]+(?:\.[0-9]+)?)(px|in|cm|mm|pt|pc)?$/i);
    if (!m) return null;
    const P = {
      px: 1,
      in: 96,
      cm: 96 / 2.54,
      mm: 96 / 25.4,
      pt: 96 / 72,
      pc: 16
    };
    return Number(m[1]) * P[(m[2] ?? "px").toLowerCase()];
  };
  let o = t("width"), f = t("height");
  const r = (l = a.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)) == null ? void 0 : l[1].trim().split(/[ ,]+/).map(Number);
  return (!o || !f) && (r == null ? void 0 : r.length) === 4 && r.every(Number.isFinite) && (o || (o = Math.abs(r[2])), f || (f = Math.abs(r[3]))), w(o ?? 0, f ?? 0);
}
function z(n) {
  if (n.length >= 44 && I(n, 0) === 1 && I(n, 40) === 1179469088) {
    const i = Math.abs(v(n, 16) - v(n, 8)), a = Math.abs(v(n, 20) - v(n, 12)), t = Math.abs(v(n, 32) - v(n, 24)), o = Math.abs(v(n, 36) - v(n, 28));
    return w(
      i || t * 96 / 2540,
      a || o * 96 / 2540,
      t ? i * 2540 / t : 96,
      o ? a * 2540 / o : 96
    );
  }
  if (n.length >= 22 && I(n, 0) === 2596720087)
    return w(
      Math.abs(k(n, 10) - k(n, 6)),
      Math.abs(k(n, 12) - k(n, 8)),
      M(n, 14),
      M(n, 14)
    );
  for (const i of [512, 0]) {
    if (i + 14 > n.length) continue;
    const a = $(n, i + 2), t = $(n, i + 4), o = $(n, i + 6), f = $(n, i + 8);
    if (f > t && o > a) return w(f - t, o - a, 72, 72);
  }
  return null;
}
function O(n) {
  return A(n) ?? G(n) ?? H(n) ?? S(n) ?? U(n) ?? W(n) ?? X(n) ?? z(n);
}
class Y extends Error {
  constructor(i, a, t) {
    super(`PDF 字体：${i}`), this.detail = { reason: i, fontFamilies: [...a], text: t.slice(0, 80).replace(/[\ud800-\udbff]$/u, "") };
  }
}
class h extends Error {
  constructor(i) {
    super(`PDF 图片：${i}`), this.detail = { reason: i };
  }
}
function J(n, i, a) {
  const t = i === void 0 ? void 0 : a.get(i);
  return { slideNumber: n, ...t ? { elementPath: [...t] } : i !== void 0 ? { elementId: i } : {} };
}
function Z(n, i, a, t) {
  throw n instanceof Y || n instanceof h ? new _({ ...J(i, a, t), ...n.detail }) : n;
}
class _ extends Error {
  constructor(i) {
    const a = i.elementId !== void 0 ? `对象 ${i.elementId}` : i.elementPath ? `对象路径 ${i.elementPath.map((t) => t + 1).join("/")}` : "";
    super(`第 ${i.slideNumber} 页${a} PDF 导出失败：${i.reason}`), this.issue = i, this.name = "VectorPdfError";
  }
}
const q = 32 * 1024 * 1024;
function V(n, i) {
  if (![n, i].every((a) => Number.isSafeInteger(a) && a > 0)) throw new h("image-data-invalid");
  if (n * i > 16e6) throw new h("image-pixel-limit");
}
const E = (n, i, a) => [...a].every((t, o) => n[i + o] === t.charCodeAt(0));
function K(n) {
  var r;
  const i = new DataView(n.buffer, n.byteOffset, n.byteLength);
  let a = !1, t = !1, o = !1, f = !1;
  for (let e = 8; e < n.length; ) {
    if (e + 12 > n.length) throw new h("image-data-invalid");
    const l = i.getUint32(e), c = String.fromCharCode(...n.subarray(e + 4, e + 8));
    if (l > n.length - e - 12 || e === 8 && (c !== "IHDR" || l !== 13)) throw new h("image-data-invalid");
    if (c === "IHDR") {
      if (e !== 8 || l !== 13) throw new h("image-data-invalid");
      const u = n[e + 16], m = n[e + 17];
      if (!((r = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] }[m]) != null && r.includes(u)) || n[e + 18] || n[e + 19] || n[e + 20] > 1) throw new h("image-data-invalid");
      t || (t = u !== 8 || m === 3 || n[e + 20] !== 0);
    } else if (c === "IDAT") o = !0;
    else if (c === "IEND") {
      if (l || e + 12 !== n.length) throw new h("image-data-invalid");
      f = !0;
    } else if (["gAMA", "cHRM", "iCCP", "cICP", "eXIf", "mDCv", "cLLi", "sBIT"].includes(c)) a = !0;
    else if (["PLTE", "tRNS", "acTL", "fcTL", "fdAT"].includes(c)) t = !0;
    else if (!(n[e + 4] & 32)) throw new h("image-format-unsupported");
    e += l + 12;
  }
  if (!o || !f) throw new h("image-data-invalid");
  return a ? "image-png-color" : t ? "image-png-layout" : void 0;
}
function Q(n) {
  const i = new DataView(n.buffer, n.byteOffset, n.byteLength);
  let a = !1, t = !1, o = !1, f = !1, r = !1;
  for (let e = 2; e < n.length; ) {
    if (r)
      for (; e < n.length && n[e] !== 255; ) e++;
    if (n[e++] !== 255) throw new h("image-data-invalid");
    for (; n[e] === 255; ) e++;
    const l = n[e++];
    if (r && (l === 0 || l >= 208 && l <= 215)) continue;
    if (r = !1, l === 217) {
      f = e === n.length;
      break;
    }
    if (e + 2 > n.length) throw new h("image-data-invalid");
    const c = i.getUint16(e);
    if (c < 2 || c > n.length - e) throw new h("image-data-invalid");
    if (a || (a = [225, 226, 238].includes(l)), l >= 192 && l <= 207 && ![196, 200, 204].includes(l)) {
      if (c < 8) throw new h("image-data-invalid");
      t || (t = ![192, 193, 194].includes(l) || n[e + 2] !== 8 || ![1, 3].includes(n[e + 7]));
    }
    e += c, l === 218 && (o = !0, r = !0);
  }
  if (!o || !f) throw new h("image-data-invalid");
  return a ? "image-jpeg-metadata" : t ? "image-jpeg-format" : void 0;
}
function b(n) {
  if (!(n instanceof Uint8Array)) throw new h("image-data-invalid");
  if (n.length > q) throw new h("image-byte-limit");
  const i = [137, 80, 78, 71, 13, 10, 26, 10].every((r, e) => n[e] === r) ? "image/png" : n[0] === 255 && n[1] === 216 ? "image/jpeg" : E(n, 0, "BM") ? "image/bmp" : E(n, 0, "GIF87a") || E(n, 0, "GIF89a") ? "image/gif" : E(n, 0, "RIFF") && E(n, 8, "WEBP") ? "image/webp" : void 0;
  if (!i) throw new h("image-format-unsupported");
  const a = O(n);
  if (!a) throw new h("image-data-invalid");
  const { width: t, height: o } = a;
  V(t, o);
  const f = i === "image/png" ? K(n) : i === "image/jpeg" ? Q(n) : `image-${i.slice(6)}-format`;
  return { width: t, height: o, mimeType: i, reason: f };
}
function y(n, i) {
  if (!n || !(n.rgba instanceof Uint8Array)) throw new h("image-normalizer-result");
  if (V(n.width, n.height), n.rgba.length !== n.width * n.height * 4 || !(n.width === i.width && n.height === i.height || n.width === i.height && n.height === i.width))
    throw new h("image-normalizer-result");
}
export {
  Y as P,
  _ as V,
  V as a,
  h as b,
  q as c,
  J as d,
  b as i,
  Z as l,
  y as v
};
