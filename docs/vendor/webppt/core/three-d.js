import { setShape3DRenderer as V } from "./core.js";
const C = {
  isometricBottomDown: [35.4, 314.7, 299.8, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricBottomUp: [35.4, 45.3, 60.2, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricLeftDown: [35, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricLeftUp: [325, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis1Left: [18, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis1Right: [18, 334, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis1Top: [301.3, 306.5, 57.6, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis2Left: [18, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis2Right: [18, 296, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis2Top: [301.3, 53.5, 302.4, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis3Bottom: [58.7, 306.5, 302.4, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis3Left: [342, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis3Right: [342, 334, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis4Bottom: [58.7, 53.5, 57.6, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis4Left: [342, 26, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricOffAxis4Right: [342, 296, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricRightDown: [325, 315, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricRightUp: [35, 315, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricTopDown: [324.6, 45.3, 299.8, 0, 0, 0, 0, 0, 0, 0, 0],
  isometricTopUp: [324.6, 314.7, 60.2, 0, 0, 0, 0, 0, 0, 0, 0],
  legacyObliqueBottom: [0, 0, 0, 0, 0.5, 90, 0, 0.5, 0, 0, 0],
  legacyObliqueBottomLeft: [0, 0, 0, 0, 0.5, 45, -0.5, 0.5, 0, 0, 0],
  legacyObliqueBottomRight: [0, 0, 0, 0, 0.5, 135, 0.5, 0.5, 0, 0, 0],
  legacyObliqueFront: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  legacyObliqueLeft: [0, 0, 0, 0, 0.5, -360, -0.5, 0, 0, 0, 0],
  legacyObliqueRight: [0, 0, 0, 0, 0.5, 180, 0.5, 0, 0, 0, 0],
  legacyObliqueTop: [0, 0, 0, 0, 0.5, -90, 0, -0.5, 0, 0, 0],
  legacyObliqueTopLeft: [0, 0, 0, 0, 0.5, -45, -0.5, -0.5, 0, 0, 0],
  legacyObliqueTopRight: [0, 0, 0, 0, 0.5, -135, 0.5, -0.5, 0, 0, 0],
  legacyPerspectiveBottom: [0, 0, 0, 1, 0.5, 90, 0, 0.5, 0, 131.225197, 944.88189],
  legacyPerspectiveBottomLeft: [0, 0, 0, 1, 0.5, 45, -0.5, 0.5, -131.225197, 131.225197, 944.88189],
  legacyPerspectiveBottomRight: [0, 0, 0, 1, 0.5, 135, 0.5, 0.5, 131.225197, 131.225197, 944.88189],
  legacyPerspectiveFront: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 944.88189],
  legacyPerspectiveLeft: [0, 0, 0, 1, 0.5, -360, -0.5, 0, -131.225197, 0, 944.88189],
  legacyPerspectiveRight: [0, 0, 0, 1, 0.5, 180, 0.5, 0, 131.225197, 0, 944.88189],
  legacyPerspectiveTop: [0, 0, 0, 1, 0.5, -90, 0, -0.5, 0, -131.225197, 944.88189],
  legacyPerspectiveTopLeft: [0, 0, 0, 1, 0.5, -45, -0.5, -0.5, -131.225197, -131.225197, 944.88189],
  legacyPerspectiveTopRight: [0, 0, 0, 1, 0.5, -135, 0.5, -0.5, 131.225197, -131.225197, 944.88189],
  obliqueBottom: [0, 0, 0, 0, 0.3, 90, 0, 0.5, 0, 0, 0],
  obliqueBottomLeft: [0, 0, 0, 0, 0.3, 45, -0.5, 0.5, 0, 0, 0],
  obliqueBottomRight: [0, 0, 0, 0, 0.3, 135, 0.5, 0.5, 0, 0, 0],
  obliqueLeft: [0, 0, 0, 0, 0.3, -360, -0.5, 0, 0, 0, 0],
  obliqueRight: [0, 0, 0, 0, 0.3, 180, 0.5, 0, 0, 0, 0],
  obliqueTop: [0, 0, 0, 0, 0.3, -90, 0, -0.5, 0, 0, 0],
  obliqueTopLeft: [0, 0, 0, 0, 0.3, -45, -0.5, -0.5, 0, 0, 0],
  obliqueTopRight: [0, 0, 0, 0, 0.3, -135, 0.5, -0.5, 0, 0, 0],
  orthographicFront: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  perspectiveAbove: [340, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveAboveLeftFacing: [39.3, 14.3, 341.1, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveAboveRightFacing: [39.3, 345.7, 18.9, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveBelow: [20, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveContrastingLeftFacing: [10.4, 43.9, 356.4, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveContrastingRightFacing: [10.4, 316.1, 3.6, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveFront: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveHeroicExtremeLeftFacing: [8.1, 34.5, 357.1, 1, 0, 0, 0, 0, 0, 0, 717.392126],
  perspectiveHeroicExtremeRightFacing: [8.1, 325.5, 2.9, 1, 0, 0, 0, 0, 0, 0, 717.392126],
  perspectiveHeroicLeftFacing: [349, 14.3, 2.6, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveHeroicRightFacing: [349, 345.7, 357.4, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveLeft: [0, 20, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveRelaxed: [309.6, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveRelaxedModerately: [324.8, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142],
  perspectiveRight: [0, 340, 0, 1, 0, 0, 0, 0, 0, 0, 1453.266142]
};
function Z(t) {
  const r = C[t.camera ?? "orthographicFront"] ?? C.orthographicFront;
  return [t.rotX ?? r[0], t.rotY ?? r[1], t.rotZ ?? r[2]];
}
function N(t, r, e) {
  const i = C[e.camera ?? "orthographicFront"] ?? C.orthographicFront, c = !!i[3] || !e.camera && !!e.fieldOfView, h = i[4] * Math.cos(i[5] * Math.PI / 180), x = -i[4] * Math.sin(i[5] * Math.PI / 180), d = Z(e).map((l) => -l * Math.PI / 180), m = (l) => {
    let { x: n, y: a, z: o } = l;
    const [p, s, f] = d;
    return [n, o] = [n * Math.cos(s) + o * Math.sin(s), -n * Math.sin(s) + o * Math.cos(s)], [a, o] = [a * Math.cos(p) - o * Math.sin(p), a * Math.sin(p) + o * Math.cos(p)], [n, a] = [n * Math.cos(f) - a * Math.sin(f), n * Math.sin(f) + a * Math.cos(f)], { x: n, y: a, z: o };
  }, g = e.fieldOfView !== void 0 ? 602.88 / Math.tan(Math.max(0.5, Math.min(179.5, e.fieldOfView)) * Math.PI / 360) : i[10] || 1455, y = (l, n, a) => m({ x: l - t / 2, y: n - r / 2, z: a + (e.z ?? 0) });
  return { rotate: m, world: y, project: (l, n, a) => {
    const o = y(l, n, a);
    if (c && o.z >= g - 1e-3) throw new Error("三维对象越过相机近裁剪面");
    const p = (e.zoom ?? 1) * (c ? g / (g - o.z) : 1), s = c ? i[8] * (1 - p) : h * a, f = c ? i[9] * (1 - p) : x * a;
    return { x: t / 2 + o.x * p + s, y: r / 2 + o.y * p + f, z: o.z };
  }, perspective: c, distance: g, view: { x: -h, y: -x, z: 1 } };
}
function Q(t, r, e) {
  const i = { x: r.x - t.x, y: r.y - t.y, z: r.z - t.z }, c = { x: e.x - t.x, y: e.y - t.y, z: e.z - t.z }, h = i.y * c.z - i.z * c.y, x = i.z * c.x - i.x * c.z, d = i.x * c.y - i.y * c.x, m = Math.hypot(h, x, d) || 1;
  return { x: h / m, y: x / m, z: d / m };
}
const T = (t, r) => Math.hypot(t.x - r.x, t.y - r.y);
function G(t, r = 0.5) {
  const e = t.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) ?? [];
  if (e.length > 2e5) throw new Error("三维轮廓超出复杂度限制");
  let i = 0, c = "", h = { x: 0, y: 0 }, x = h, d, m;
  const g = [];
  let y, u = 0;
  const l = () => {
    const o = Number(e[i++]);
    if (!Number.isFinite(o)) throw new Error("三维路径参数不足");
    return o;
  }, n = (o) => {
    if (!y) throw new Error("三维轮廓缺少起点");
    if (++u > 2e4) throw new Error("三维轮廓顶点超限");
    (!y.points.length || T(y.points[y.points.length - 1], o) > 1e-8) && y.points.push(o), h = o;
  }, a = (o, p, s, f, M = 0) => {
    const w = T(o, p) + T(p, s) + T(s, f) - T(o, f);
    if (M >= 12 || w < r) {
      n(f);
      return;
    }
    const v = (b, R) => ({ x: (b.x + R.x) / 2, y: (b.y + R.y) / 2 }), $ = v(o, p), P = v(p, s), q = v(s, f), A = v($, P), j = v(P, q), z = v(A, j);
    a(o, $, A, z, M + 1), a(z, j, q, f, M + 1);
  };
  for (; i < e.length; ) {
    if (/^[a-zA-Z]$/.test(e[i])) c = e[i++];
    else if (!c || c.toUpperCase() === "Z") throw new Error("三维路径命令缺失");
    const o = c === c.toLowerCase(), p = c.toUpperCase(), s = h, f = () => ({ x: l() + (o ? s.x : 0), y: l() + (o ? s.y : 0) });
    if (p === "M") {
      const M = f();
      y = { points: [], closed: !1 }, g.push(y), n(M), x = M, c = o ? "l" : "L";
    } else if (p === "Z")
      y && (y.closed = !0), h = x;
    else if (p === "L") n(f());
    else if (p === "H") n({ x: l() + (o ? s.x : 0), y: s.y });
    else if (p === "V") n({ x: s.x, y: l() + (o ? s.y : 0) });
    else if (p === "C" || p === "S") {
      const M = p === "C" ? f() : d ? { x: 2 * s.x - d.x, y: 2 * s.y - d.y } : s, w = f(), v = f();
      a(s, M, w, v), d = w;
    } else if (p === "Q" || p === "T") {
      const M = p === "Q" ? f() : m ? { x: 2 * s.x - m.x, y: 2 * s.y - m.y } : s, w = f();
      a(
        s,
        { x: s.x + (M.x - s.x) * 2 / 3, y: s.y + (M.y - s.y) * 2 / 3 },
        { x: w.x + (M.x - w.x) * 2 / 3, y: w.y + (M.y - w.y) * 2 / 3 },
        w
      ), m = M;
    } else if (p === "A") {
      const M = l(), w = l(), v = l(), $ = l(), P = l(), q = f();
      for (const A of X(s, q, M, w, v, !!$, !!P, r)) n(A);
    } else throw new Error(`三维路径不支持 ${c}`);
    p !== "C" && p !== "S" && (d = void 0), p !== "Q" && p !== "T" && (m = void 0);
  }
  for (const o of g) o.points.length > 1 && T(o.points[0], o.points[o.points.length - 1]) < 1e-8 && o.points.pop();
  return g.filter((o) => o.points.length > 1);
}
function X(t, r, e, i, c, h, x, d) {
  if (e = Math.abs(e), i = Math.abs(i), !e || !i || T(t, r) < 1e-8) return [r];
  const m = c * Math.PI / 180, g = Math.cos(m), y = Math.sin(m), u = (t.x - r.x) / 2, l = (t.y - r.y) / 2, n = g * u + y * l, a = -y * u + g * l, o = Math.sqrt(Math.max(1, n * n / (e * e) + a * a / (i * i)));
  e *= o, i *= o;
  const p = (h === x ? -1 : 1) * Math.sqrt(Math.max(0, (e * e * i * i - e * e * a * a - i * i * n * n) / (e * e * a * a + i * i * n * n))), s = p * e * a / i, f = -p * i * n / e, M = g * s - y * f + (t.x + r.x) / 2, w = y * s + g * f + (t.y + r.y) / 2, v = Math.atan2((a - f) / i, (n - s) / e);
  let $ = Math.atan2((-a - f) / i, (-n - s) / e) - v;
  x && $ < 0 && ($ += Math.PI * 2), !x && $ > 0 && ($ -= Math.PI * 2);
  const P = Math.max(1, Math.min(1024, Math.ceil(Math.abs($) / (2 * Math.acos(Math.max(-1, 1 - d / Math.max(e, i)))))));
  return Array.from({ length: P }, (q, A) => {
    const j = v + $ * (A + 1) / P;
    return { x: M + g * e * Math.cos(j) - y * i * Math.sin(j), y: w + y * e * Math.cos(j) + g * i * Math.sin(j) };
  });
}
function U(t, r) {
  return r ? t.map((e, i) => {
    const c = t[(i + t.length - 1) % t.length], h = t[(i + 1) % t.length], x = Math.max(1e-8, T(c, e)), d = Math.max(1e-8, T(e, h)), m = -(e.y - c.y) / x, g = (e.x - c.x) / x, y = -(h.y - e.y) / d, u = (h.x - e.x) / d, l = Math.min(r * 4, r / Math.max(0.25, 1 + m * y + g * u));
    return { x: e.x + (m + y) * l, y: e.y + (g + u) * l };
  }) : t;
}
const B = (t) => String(Math.round(t * 1e4) / 1e4), k = (t) => t.map((r, e) => `${e ? "L" : "M"}${B(r.x)} ${B(r.y)}`).join("") + "Z";
function Y(t, r, e, i, c, h) {
  if (!t) return "";
  const x = (u) => c.project(u.x, u.y, i), d = (u, l, n) => {
    const a = x(u), o = x(l), p = x(n), s = l.x - u.x, f = l.y - u.y, M = n.x - u.x, w = n.y - u.y, v = s * w - f * M;
    if (Math.abs(v) < 1e-10) throw new Error("三维投影网格退化");
    const $ = ((o.x - a.x) * w - (p.x - a.x) * f) / v, P = ((o.y - a.y) * w - (p.y - a.y) * f) / v, q = ((p.x - a.x) * s - (o.x - a.x) * M) / v, A = ((p.y - a.y) * s - (o.y - a.y) * M) / v;
    return `matrix(${[$, P, q, A, a.x - $ * u.x - q * u.y, a.y - P * u.x - A * u.y].map(B).join(" ")})`;
  };
  if (!c.perspective) return `<g transform="${d({ x: 0, y: 0 }, { x: r, y: 0 }, { x: 0, y: e })}">${t}</g>`;
  const m = h.nextId("d3front");
  h.defs.push(`<g id="${m}">${t}</g>`);
  const g = 12, y = [];
  for (let u = 0; u < g; u++) for (let l = 0; l < g; l++) {
    const n = { x: l * r / g, y: u * e / g }, a = { x: (l + 1) * r / g, y: n.y }, o = { x: a.x, y: (u + 1) * e / g }, p = { x: n.x, y: o.y };
    for (const s of [[n, a, o], [n, o, p]]) {
      const f = s.map(x), M = f.map(($) => $.x), w = f.map(($) => $.y), v = h.nextId("d3tile");
      h.defs.push(`<mask id="${v}" maskUnits="userSpaceOnUse" x="${B(Math.min(...M) - 1)}" y="${B(Math.min(...w) - 1)}" width="${B(Math.max(...M) - Math.min(...M) + 2)}" height="${B(Math.max(...w) - Math.min(...w) + 2)}"><path d="${k(f)}" fill="#fff" shape-rendering="crispEdges"/></mask>`), y.push(`<g mask="url(#${v})"><use href="#${m}" xlink:href="#${m}" transform="${d(s[0], s[1], s[2])}"/></g>`);
    }
  }
  return y.join("");
}
function W(t, r, e) {
  const i = t.replace("#", ""), c = t.startsWith("#") ? i.length === 3 ? i.split("").map((n) => parseInt(n + n, 16)) : [0, 2, 4].map((n) => parseInt(i.slice(n, n + 2), 16)) : (t.match(/[\d.]+/g) ?? ["128", "128", "128"]).map(Number), h = e.lightDirection ?? "tl", x = h.includes("l") ? -0.5 : h.includes("r") ? 0.5 : 0, d = h.includes("t") ? -0.5 : h.includes("b") ? 0.5 : 0, m = Math.hypot(x, d, 0.8), g = Math.max(0, (r.x * x + r.y * d + r.z * 0.8) / m), y = e.material === "flat", u = /metal|plastic/i.test(e.material ?? "") ? Math.pow(g, 16) * 0.35 : 0, l = y ? 1 : 0.35 + g * 0.65;
  return `rgba(${c.slice(0, 3).map((n) => Math.max(0, Math.min(255, Math.round(n * l + 255 * u)))).join(",")},${c[3] ?? 1})`;
}
function _(t, r, e, i) {
  var q, A, j;
  const c = t.scene3d;
  if (!c || !t.path || t.w <= 0 || t.h <= 0) return r;
  const h = N(t.w, t.h, c), x = c.extrusion ?? 0, d = c.bevelTop ?? 0, m = c.bevelBottom ?? 0, g = Math.min(t.w, t.h) / 4, y = Math.min(c.bevelTopWidth ?? d, g), u = Math.min(c.bevelBottomWidth ?? m, g), l = G(t.path), n = l.filter((z) => z.closed || !t.openGeom), a = c.extrusionColor ?? (((q = t.fill) == null ? void 0 : q.type) === "solid" ? t.fill.color : ((A = t.fill) == null ? void 0 : A.type) === "gradient" ? (j = t.fill.stops[0]) == null ? void 0 : j.color : void 0) ?? "#808080", o = [], p = [], s = [], f = [], M = (z) => ({ x: t.flipH ? t.w - z.x : z.x, y: t.flipV ? t.h - z.y : z.y }), w = (z) => {
    const b = M(z);
    return h.world(b.x, b.y, z.z);
  }, v = (z) => {
    const b = M(z);
    return h.project(b.x, b.y, z.z);
  }, $ = (z) => {
    const b = z.map(w), R = z.map(v), O = Q(b[0], b[1], b[2]), L = b.reduce((H, D) => ({ x: H.x + D.x / 4, y: H.y + D.y / 4, z: H.z + D.z / 4 }), { x: 0, y: 0, z: 0 }), I = h.perspective ? O.z * (h.distance - L.z) - O.x * L.x - O.y * L.y : O.x * h.view.x + O.y * h.view.y + O.z, F = !!t.flipH != !!t.flipV ? -1 : 1;
    if (I * F <= 0) return;
    const E = { x: O.x * F, y: O.y * F, z: O.z * F }, S = W(a, E, c);
    o.push({ z: L.z, svg: `<path d="${k(R)}" fill="${c.material === "legacyWireframe" ? "none" : S}" stroke="${S}" stroke-width="${c.material === "legacyWireframe" ? 1 : 0.6}" stroke-linejoin="round"/>` });
  };
  for (const z of n) {
    const b = z.points, R = U(b, y), O = U(b, u);
    p.push(k(R.map(M))), f.push(k(O.map((L) => v({ ...L, z: -x - m })))), s.push(k(R.map((L) => v({ ...L, z: d }))));
    for (let L = 0; L < b.length; L++) {
      const I = (L + 1) % b.length, F = b[L], E = b[I];
      x && $([{ ...F, z: 0 }, { ...F, z: -x }, { ...E, z: -x }, { ...E, z: 0 }]), (y || d) && $([{ ...R[L], z: d }, { ...F, z: 0 }, { ...E, z: 0 }, { ...R[I], z: d }]), (u || m) && $([{ ...F, z: -x }, { ...O[L], z: -x - m }, { ...O[I], z: -x - m }, { ...E, z: -x }]);
    }
  }
  const P = h.rotate({ x: 0, y: 0, z: 1 });
  if (P.z >= 0) {
    let z = "";
    if (h.perspective && i && (!t.fill || t.fill.type === "solid" || t.fill.type === "none")) {
      const b = l.map((R) => {
        const O = k(R.points.map((L) => v({ ...L, z: d })));
        return R.closed || !t.openGeom ? O : O.slice(0, -1);
      }).join("");
      if (z = i.replace(/d="[^"]*"/, `d="${b}"`), r = r.replace(i, ""), y) {
        const R = e.nextId("d3surface");
        e.defs.push(`<clipPath id="${R}"><path d="${s.join("")}"/></clipPath>`), z = `<g clip-path="url(#${R})">${z}</g>`;
      }
    }
    if (y) {
      const b = e.nextId("d3bevel");
      e.defs.push(`<clipPath id="${b}"><path d="${p.join("")}" fill-rule="nonzero"/></clipPath>`), r = `<g clip-path="url(#${b})">${r}</g>`;
    }
    o.push({ z: h.world(t.w / 2, t.h / 2, d).z, svg: z + Y(r, t.w, t.h, d, h, e) });
  } else o.push({ z: h.world(t.w / 2, t.h / 2, -x - m).z, svg: `<path d="${f.join("")}" fill="${W(a, { x: -P.x, y: -P.y, z: -P.z }, c)}" fill-rule="nonzero"/>` });
  return `<g data-projection="${h.perspective ? "perspective" : "orthographic"}" data-depth="${B(x)}">${o.sort((z, b) => z.z - b.z).map((z) => z.svg).join("")}</g>`;
}
function K() {
  V(_);
}
export {
  Z as cameraAngles,
  N as createCamera,
  K as enableThreeD,
  _ as renderShape3D
};
