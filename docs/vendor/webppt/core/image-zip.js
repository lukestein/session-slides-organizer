import { slideToPng as $ } from "./core.js";
var x = Uint8Array, D = Uint16Array, Z = Int32Array, k = new x([
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
]), H = new x([
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
]), I = function(r, t) {
  for (var e = new D(31), n = 0; n < 31; ++n)
    e[n] = t += 1 << r[n - 1];
  for (var o = new Z(e[30]), n = 1; n < 30; ++n)
    for (var i = e[n]; i < e[n + 1]; ++i)
      o[i] = i - e[n] << 5 | n;
  return { b: e, r: o };
}, U = I(k, 2), Y = U.b, G = U.r;
Y[28] = 258, G[258] = 28;
I(H, 0);
var L = new D(32768);
for (var c = 0; c < 32768; ++c) {
  var C = (c & 43690) >> 1 | (c & 21845) << 1;
  C = (C & 52428) >> 2 | (C & 13107) << 2, C = (C & 61680) >> 4 | (C & 3855) << 4, L[c] = ((C & 65280) >> 8 | (C & 255) << 8) >> 1;
}
var T = new x(288);
for (var c = 0; c < 144; ++c)
  T[c] = 8;
for (var c = 144; c < 256; ++c)
  T[c] = 9;
for (var c = 256; c < 280; ++c)
  T[c] = 7;
for (var c = 280; c < 288; ++c)
  T[c] = 8;
var X = new x(32);
for (var c = 0; c < 32; ++c)
  X[c] = 5;
var V = function(r, t, e) {
  return (e == null || e > r.length) && (e = r.length), new x(r.subarray(t, e));
}, q = [
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
], A = function(r, t, e) {
  var n = new Error(t || q[r]);
  if (n.code = r, Error.captureStackTrace && Error.captureStackTrace(n, A), !e)
    throw n;
  return n;
}, J = /* @__PURE__ */ new x(0), K = /* @__PURE__ */ function() {
  for (var r = new Int32Array(256), t = 0; t < 256; ++t) {
    for (var e = t, n = 9; --n; )
      e = (e & 1 && -306674912) ^ e >>> 1;
    r[t] = e;
  }
  return r;
}(), Q = function() {
  var r = -1;
  return {
    p: function(t) {
      for (var e = r, n = 0; n < t.length; ++n)
        e = K[e & 255 ^ t[n]] ^ e >>> 8;
      r = e;
    },
    d: function() {
      return ~r;
    }
  };
}, W = function(r, t) {
  var e = {};
  for (var n in r)
    e[n] = r[n];
  for (var n in t)
    e[n] = t[n];
  return e;
}, l = function(r, t, e) {
  for (; e; ++t)
    r[t] = e, e >>>= 8;
}, z = typeof TextEncoder < "u" && /* @__PURE__ */ new TextEncoder(), j = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), b = 0;
try {
  j.decode(J, { stream: !0 }), b = 1;
} catch {
}
function M(r, t) {
  var e;
  if (z)
    return z.encode(r);
  for (var n = r.length, o = new x(r.length + (r.length >> 1)), i = 0, a = function(d) {
    o[i++] = d;
  }, e = 0; e < n; ++e) {
    if (i + 5 > o.length) {
      var v = new x(i + 8 + (n - e << 1));
      v.set(o), o = v;
    }
    var s = r.charCodeAt(e);
    s < 128 || t ? a(s) : s < 2048 ? (a(192 | s >> 6), a(128 | s & 63)) : s > 55295 && s < 57344 ? (s = 65536 + (s & 1047552) | r.charCodeAt(++e) & 1023, a(240 | s >> 18), a(128 | s >> 12 & 63), a(128 | s >> 6 & 63), a(128 | s & 63)) : (a(224 | s >> 12), a(128 | s >> 6 & 63), a(128 | s & 63));
  }
  return V(o, 0, i);
}
var S = function(r) {
  var t = 0;
  if (r)
    for (var e in r) {
      var n = r[e].length;
      n > 65535 && A(9), t += n + 4;
    }
  return t;
}, P = function(r, t, e, n, o, i, a, v) {
  var s = n.length, d = e.extra, p = v && v.length, h = S(d);
  l(r, t, a != null ? 33639248 : 67324752), t += 4, a != null && (r[t++] = 20, r[t++] = e.os), r[t] = 20, t += 2, r[t++] = e.flag << 1 | (i < 0 && 8), r[t++] = o && 8, r[t++] = e.compression & 255, r[t++] = e.compression >> 8;
  var f = new Date(e.mtime == null ? Date.now() : e.mtime), y = f.getFullYear() - 1980;
  if ((y < 0 || y > 119) && A(10), l(r, t, y << 25 | f.getMonth() + 1 << 21 | f.getDate() << 16 | f.getHours() << 11 | f.getMinutes() << 5 | f.getSeconds() >> 1), t += 4, i != -1 && (l(r, t, e.crc), l(r, t + 4, i < 0 ? -i - 2 : i), l(r, t + 8, e.size)), l(r, t + 12, s), l(r, t + 14, h), t += 16, a != null && (l(r, t, p), l(r, t + 6, e.attrs), l(r, t + 10, a), t += 14), r.set(n, t), t += s, h)
    for (var m in d) {
      var w = d[m], g = w.length;
      l(r, t, +m), l(r, t + 2, g), r.set(w, t + 4), t += 4 + g;
    }
  return p && (r.set(v, t), t += p), t;
}, _ = function(r, t, e, n, o) {
  l(r, t, 101010256), l(r, t + 8, e), l(r, t + 10, e), l(r, t + 12, n), l(r, t + 16, o);
}, tt = /* @__PURE__ */ function() {
  function r(t) {
    this.filename = t, this.c = Q(), this.size = 0, this.compression = 0;
  }
  return r.prototype.process = function(t, e) {
    this.ondata(null, t, e);
  }, r.prototype.push = function(t, e) {
    this.ondata || A(5), this.c.p(t), this.size += t.length, e && (this.crc = this.c.d()), this.process(t, e || !1);
  }, r;
}(), et = /* @__PURE__ */ function() {
  function r(t) {
    this.ondata = t, this.u = [], this.d = 1;
  }
  return r.prototype.add = function(t) {
    var e = this;
    if (this.ondata || A(5), this.d & 2)
      this.ondata(A(4 + (this.d & 1) * 8, 0, 1), null, !1);
    else {
      var n = M(t.filename), o = n.length, i = t.comment, a = i && M(i), v = o != t.filename.length || a && i.length != a.length, s = o + S(t.extra) + 30;
      o > 65535 && this.ondata(A(11, 0, 1), null, !1);
      var d = new x(s);
      P(d, 0, t, n, v, -1);
      var p = [d], h = function() {
        for (var g = 0, u = p; g < u.length; g++) {
          var E = u[g];
          e.ondata(null, E, !1);
        }
        p = [];
      }, f = this.d;
      this.d = 0;
      var y = this.u.length, m = W(t, {
        f: n,
        u: v,
        o: a,
        t: function() {
          t.terminate && t.terminate();
        },
        r: function() {
          if (h(), f) {
            var g = e.u[y + 1];
            g ? g.r() : e.d = 1;
          }
          f = 1;
        }
      }), w = 0;
      t.ondata = function(g, u, E) {
        if (g)
          e.ondata(g, u, E), e.terminate();
        else if (w += u.length, p.push(u), E) {
          var N = new x(16);
          l(N, 0, 134695760), l(N, 4, t.crc), l(N, 8, w), l(N, 12, t.size), p.push(N), m.c = w, m.b = s + w + 16, m.crc = t.crc, m.size = t.size, f && m.r(), f = 1;
        } else f && h();
      }, this.u.push(m);
    }
  }, r.prototype.end = function() {
    var t = this;
    if (this.d & 2) {
      this.ondata(A(4 + (this.d & 1) * 8, 0, 1), null, !0);
      return;
    }
    this.d ? this.e() : this.u.push({
      r: function() {
        t.d & 1 && (t.u.splice(-1, 1), t.e());
      },
      t: function() {
      }
    }), this.d = 3;
  }, r.prototype.e = function() {
    for (var t = 0, e = 0, n = 0, o = 0, i = this.u; o < i.length; o++) {
      var a = i[o];
      n += 46 + a.f.length + S(a.extra) + (a.o ? a.o.length : 0);
    }
    for (var v = new x(n + 22), s = 0, d = this.u; s < d.length; s++) {
      var a = d[s];
      P(v, t, a, a.f, a.u, -a.c - 2, e, a.o), t += 46 + a.f.length + S(a.extra) + (a.o ? a.o.length : 0), e += a.b;
    }
    _(v, t, this.u.length, n, e), this.ondata(null, v, !0), this.d = 2;
  }, r.prototype.terminate = function() {
    for (var t = 0, e = this.u; t < e.length; t++) {
      var n = e[t];
      n.t();
    }
    this.d = 2;
  }, r;
}();
function rt(r) {
  if (!(r != null && r.length)) return [];
  const t = [];
  for (const e of r) {
    const n = e.clickGroup ?? 0;
    (t[n] ?? (t[n] = [])).push(e);
  }
  return t.filter(Boolean);
}
function nt(r, t) {
  const e = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
  for (const o of r)
    for (const i of o)
      i.kind !== "entrance" && i.kind !== "exit" || n.has(i.target) || (n.add(i.target), i.kind === "entrance" && e.add(i.target));
  for (let o = 0; o < t && o < r.length; o++)
    for (const i of r[o])
      i.kind === "entrance" ? e.delete(i.target) : i.kind === "exit" && e.add(i.target);
  return e;
}
function it(r) {
  const t = rt(r.animations);
  if (!t.length) return /* @__PURE__ */ new Set();
  const e = nt(t, t.length);
  if (!e.size) return e;
  const n = [], o = (i) => {
    for (const a of i)
      a.id !== void 0 && n.push(a.id), a.kind === "group" && o(a.children);
  };
  return o(r.elements), n.length && n.every((i) => e.has(i)) ? /* @__PURE__ */ new Set() : e;
}
const R = 32767;
function at(r, t) {
  if (!Number.isFinite(t) || t <= 0)
    throw new RangeError("scale 必须是大于 0 的有限数");
  const e = Math.round(r.width * t), n = Math.round(r.height * t);
  if (e < 1 || n < 1 || e > R || n > R)
    throw new RangeError(`scale 产生了浏览器 canvas 不支持的尺寸：${e}×${n}`);
  return { width: e, height: n };
}
const ot = 2, B = 8, st = new Date(1980, 0, 1, 0, 0, 0, 0);
class F extends Error {
  constructor(t, e, n) {
    const o = n instanceof Error ? n.message : String(n);
    super(`第 ${t} 页（${e}）导出失败：${o}`), this.name = "PresentationImageExportError", this.slideNumber = t, this.fileName = e, this.cause = n;
  }
}
function ft(r) {
  const t = r.scale ?? 2, e = r.concurrency ?? ot;
  if (!Number.isFinite(t) || t <= 0) throw new RangeError("scale 必须是大于 0 的有限数");
  if (!Number.isInteger(e) || e < 1 || e > B)
    throw new RangeError(`concurrency 必须是 1–${B} 的整数`);
  return { scale: t, concurrency: e, skipHidden: r.skipHidden ?? !1, onProgress: r.onProgress, showComments: r.showComments };
}
function ct(r, t) {
  const e = Math.max(3, String(r.slides.length).length);
  return r.slides.flatMap((n, o) => {
    if (t && n.hidden) return [];
    const i = o + 1;
    return [{ slide: n, slideNumber: i, fileName: `slide-${String(i).padStart(e, "0")}.png` }];
  });
}
async function lt(r, t, e, n) {
  try {
    const o = await $(r, t.slide, e, {
      showComments: n,
      hiddenElements: [...it(t.slide)],
      strictResources: !0
    });
    return new Uint8Array(await o.arrayBuffer());
  } catch (o) {
    throw new F(t.slideNumber, t.fileName, o);
  }
}
async function ut(r, t = {}) {
  var p;
  const e = ft(t);
  at(r, e.scale);
  const n = ct(r, e.skipHidden), o = [];
  let i, a;
  const v = new Promise((h) => {
    a = h;
  }), s = new et((h, f, y) => {
    h ? i = h : f && o.push(f), (h || y) && (a == null || a());
  });
  let d = 0;
  try {
    for (let f = 0; f < n.length; f += e.concurrency) {
      const y = n.slice(f, f + e.concurrency), m = await Promise.allSettled(
        y.map((u) => lt(r, u, e.scale, e.showComments))
      ), w = m.find((u) => u.status === "rejected");
      if ((w == null ? void 0 : w.status) === "rejected") throw w.reason;
      const g = m.map((u) => u.value);
      for (let u = 0; u < y.length; u++) {
        const E = y[u], N = new tt(E.fileName);
        N.mtime = st, N.os = 0, s.add(N), N.push(g[u], !0), d++;
        try {
          (p = e.onProgress) == null || p.call(e, {
            completed: d,
            total: n.length,
            slideNumber: E.slideNumber,
            fileName: E.fileName
          });
        } catch (O) {
          throw new F(E.slideNumber, E.fileName, O);
        }
        if (i) throw i;
      }
    }
    if (s.end(), await v, i) throw i;
    const h = o.map((f) => f.buffer.slice(
      f.byteOffset,
      f.byteOffset + f.byteLength
    ));
    return new Blob(h, { type: "application/zip" });
  } catch (h) {
    if (s.terminate(), h instanceof F) throw h;
    const f = n[Math.min(d, Math.max(0, n.length - 1))];
    throw f ? new F(f.slideNumber, f.fileName, h) : h;
  }
}
export {
  F as PresentationImageExportError,
  ut as presentationToImageZip
};
