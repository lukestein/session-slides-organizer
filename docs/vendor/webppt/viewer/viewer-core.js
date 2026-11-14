import { transitionPreferredDirection as rt, hiddenBefore as st, staticHidden as tt, groupSteps as ot, slideText as at, renderSlideToSvg as G, invalidateTextMeasureCaches as ct, slideToPng as lt } from "../core/core.js";
import { groupSteps as It, hiddenBefore as Ft, staticHidden as _t } from "../core/core.js";
const z = 6;
function d(n) {
  return `${Math.round(n * 1e3) / 1e3}%`;
}
function W(n, t) {
  const e = n === "vert", r = [];
  for (let s = 0; s < z; s++) {
    const i = s / z * 100, o = (s + 1) / z * 100, c = t ? o : i;
    r.push(e ? g(i, 0, c, 100) : g(0, i, 100, c));
  }
  return A(r);
}
const K = [
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)"
].join(", "), et = { l: 0, t: 0, w: 100, h: 100 };
function nt(n) {
  return n.l === 0 && n.t === 0 && n.w === 100 && n.h === 100;
}
function L(n, t = et) {
  if (nt(t)) {
    const c = n ? 50 : 0, l = `100% ${c}%, 100% ${c}%, ${c}% 100%, ${c}% 100%`;
    return {
      opacity: 1,
      maskImage: K,
      maskRepeat: "no-repeat",
      maskPosition: "center top, center bottom, left center, right center",
      maskSize: l,
      maskOrigin: "fill-box",
      maskClip: "fill-box"
    };
  }
  const e = n ? 0.501 : 0, r = t.h * e, s = t.w * e, i = 100 - (t.t + t.h), o = 100 - (t.l + t.w);
  return {
    opacity: 1,
    maskImage: K,
    maskRepeat: "no-repeat",
    // 位置在两帧里不变，只让尺寸插值。底边和右边钉在墨迹框上，条带向中心长。
    maskPosition: [
      `left ${d(t.l)} top ${d(t.t)}`,
      `left ${d(t.l)} bottom ${d(i)}`,
      `left ${d(t.l)} top ${d(t.t)}`,
      `right ${d(o)} top ${d(t.t)}`
    ].join(", "),
    maskSize: [
      `${d(t.w)} ${d(r)}`,
      `${d(t.w)} ${d(r)}`,
      `${d(s)} ${d(t.h)}`,
      `${d(s)} ${d(t.h)}`
    ].join(", "),
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function Y(n, t = et) {
  if (nt(t))
    return n ? "inset(0% 0% 0% 0%) fill-box" : "inset(50% 50% 50% 50%) fill-box";
  const e = n ? t.t : t.t + t.h / 2, r = n ? t.l : t.l + t.w / 2, s = n ? 100 - (t.t + t.h) : 100 - (t.t + t.h / 2), i = n ? 100 - (t.l + t.w) : 100 - (t.l + t.w / 2);
  return `inset(${d(e)} ${d(i)} ${d(s)} ${d(r)}) fill-box`;
}
function A(n, t = []) {
  return {
    opacity: 1,
    maskImage: n.map(() => "linear-gradient(#000,#000)").join(", "),
    maskRepeat: "no-repeat",
    maskPosition: n.map((e, r) => {
      var s, i;
      return `${((s = t[r]) == null ? void 0 : s.x) === "right" ? `right ${d(100 - e[2][0])}` : `left ${d(e[0][0])}`} ${((i = t[r]) == null ? void 0 : i.y) === "bottom" ? `bottom ${d(100 - e[2][1])}` : `top ${d(e[0][1])}`}`;
    }).join(", "),
    maskSize: n.map((e) => `${d(e[2][0] - e[0][0])} ${d(e[2][1] - e[0][1])}`).join(", "),
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function R(n, t = !1) {
  const e = (i) => Math.round(i * 1e3) / 1e3, r = n.map((i) => `M${e(i[0][0])} ${e(i[0][1])} ` + i.slice(1).map(([o, c]) => `L${e(o)} ${e(c)}`).join(" ") + " Z").join(" "), s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="#000" fill-rule="${t ? "evenodd" : "nonzero"}" d="${r}"/></svg>`;
  return {
    opacity: 1,
    maskImage: `url("data:image/svg+xml,${encodeURIComponent(s)}")`,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "100% 100%",
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function g(n, t, e, r) {
  return [[n, t], [e, t], [e, r], [n, r]];
}
function Z(n, t) {
  const e = (n == null ? void 0 : n.endsWith("vert")) ?? !0, r = (n == null ? void 0 : n.startsWith("in")) ?? !1, s = t ? 50 : 0;
  return A(e ? r ? [g(0, 0, s, 100), g(100 - s, 0, 100, 100)] : [g(50 - s, 0, 50, 100), g(50, 0, 50 + s, 100)] : r ? [g(0, 0, 100, s), g(0, 100 - s, 100, 100)] : [g(0, 50 - s, 100, 50), g(0, 50, 100, 50 + s)]);
}
function U(n, t) {
  const e = [];
  for (let r = 0; r < 6; r++) for (let s = 0; s < 8; s++) {
    const i = s * 12.5, o = r * (100 / 6), c = i + 12.5, l = o + 100 / 6, h = (r + s) % 2 === 1;
    n === "down" ? e.push(g(
      i,
      h ? l - (t ? l - o : 0) : o,
      c,
      h ? l : o + (t ? l - o : 0)
    )) : e.push(g(
      h ? c - (t ? c - i : 0) : i,
      o,
      h ? c : i + (t ? c - i : 0),
      l
    ));
  }
  return A(e);
}
function N(n, t) {
  const e = n === "vert", r = 128, s = typeof t == "boolean" ? Number(t) : t, i = [];
  for (let o = 0; o < r; o++) {
    const c = o * 100 / r, l = (o + 1) * 100 / r, h = o * 73 % r, u = Math.min(1, Math.max(0, s * r - h)) * (l - c);
    i.push(e ? g(c, 0, c + u, 100) : g(0, c, 100, c + u));
  }
  return A(i);
}
function D(n, t) {
  const e = (n == null ? void 0 : n.startsWith("l")) ?? !1, r = (n == null ? void 0 : n.endsWith("u")) ?? !1, s = typeof t == "boolean" ? Number(t) : t, i = 8, o = [];
  for (let c = 0; c < i; c++) {
    const l = c * 100 / i, h = (c + 1) * 100 / i, u = (r ? i - c - 1 : c) / (2 * i), f = Math.min(1, Math.max(0, (s - u) / (1 - (i - 1) / (2 * i)))) * 100;
    o.push(e ? g(100 - f, l, 100, h) : g(0, l, f, h));
  }
  return A(o, e ? o.map(() => ({ x: "right" })) : []);
}
function ht(n, t) {
  if (n === "circle") return Array.from({ length: 40 }, (r, s) => {
    const i = s * Math.PI / 20 - Math.PI / 2;
    return [50 + t * Math.cos(i), 50 + t * Math.sin(i)];
  });
  if (n === "diamond") return [
    [50, 50 - t],
    [50 + t, 50],
    [50, 50 + t],
    [50 - t, 50]
  ];
  const e = t / 3;
  return [
    [50 - e, 50 - t],
    [50 + e, 50 - t],
    [50 + e, 50 - e],
    [50 + t, 50 - e],
    [50 + t, 50 + e],
    [50 + e, 50 + e],
    [50 + e, 50 + t],
    [50 - e, 50 + t],
    [50 - e, 50 + e],
    [50 - t, 50 + e],
    [50 - t, 50 - e],
    [50 - e, 50 - e]
  ];
}
function O(n, t, e) {
  const r = typeof e == "boolean" ? Number(e) : e;
  if (n === "plus" && t === "in") {
    const c = r * 50;
    return A([
      g(0, 0, c, c),
      g(100 - c, 0, 100, c),
      g(0, 100 - c, c, 100),
      g(100 - c, 100 - c, 100, 100)
    ], [{}, { x: "right" }, { y: "bottom" }, { x: "right", y: "bottom" }]);
  }
  const s = n === "circle" ? 72 : n === "diamond" ? 101 : 151, i = (t === "in" ? 1 - r : r) * s, o = ht(n, i);
  return t === "in" ? R([g(0, 0, 100, 100), o], !0) : R([o]);
}
function j(n, t) {
  const e = [1, 2, 3, 4, 8].includes(Number(n)) ? Number(n) : 1, r = typeof t == "boolean" ? Number(t) : t, s = [];
  for (let i = 0; i < e; i++) {
    const o = -Math.PI / 2 + i * 2 * Math.PI / e, c = r * 2 * Math.PI / e, l = [[50, 50]];
    for (let h = 0; h <= 16; h++) {
      const u = o + c * h / 16;
      l.push([50 + 200 * Math.cos(u), 50 + 200 * Math.sin(u)]);
    }
    s.push(l);
  }
  return R(s);
}
function I(n, t) {
  const e = typeof n == "boolean" ? Number(n) : n, r = [];
  for (let s = 0; s < 8; s++) for (let i = 0; i < 10; i++) {
    const o = i * 10, c = s * 12.5, l = (i + 1) * 10, h = (s + 1) * 12.5;
    let u = Math.imul(s * 10 + i + t * 101, 73244475);
    u = Math.imul(u ^ u >>> 16, 73244475), u = (u ^ u >>> 16) >>> 0;
    const a = u % 17 / 17, f = o + (l - o) * a, m = c + (h - c) * (1 - a), v = (u >>> 8) % 8, b = Math.min(1, Math.max(0, e * 8 - v));
    r.push(g(
      f + (o - f) * b,
      m + (c - m) * b,
      f + (l - f) * b,
      m + (h - m) * b
    ));
  }
  return A(r);
}
const ut = 2147483647;
function ft(n, t, e) {
  const r = n.querySelector("audio,video");
  if (!r) return null;
  if (!Number.isFinite(e) || e < 0)
    throw new Error(`媒体调用的起始时间无效：${e}ms`);
  let s = null, i = e, o = !1, c = !1, l, h;
  const u = new Promise((v, b) => {
    l = v, h = b;
  }), a = () => {
    c = !0, Promise.resolve(r.play()).then(l, h);
  }, f = () => {
    if (s = null, !o)
      try {
        switch (t.action) {
          case "play":
            t.fromSeconds !== void 0 && (r.currentTime = t.fromSeconds), a();
            return;
          case "resume":
            a();
            return;
          case "pause":
            r.pause();
            break;
          case "stop":
            r.pause(), r.currentTime = 0;
            break;
          case "togglePause":
            if (r.paused) {
              a();
              return;
            }
            r.pause();
            break;
        }
        l();
      } catch (v) {
        h(v);
      }
  }, m = () => {
    if (i === 0) {
      f();
      return;
    }
    const v = Math.min(i, ut);
    s = setTimeout(() => {
      i -= v, m();
    }, v);
  };
  return m(), {
    finished: u,
    cancel: () => {
      o = !0, s !== null && clearTimeout(s), c && r.pause(), l();
    }
  };
}
const x = 1.15;
function pt(n) {
  switch (n) {
    case "l":
      return [-100 * x, 0];
    case "r":
      return [100 * x, 0];
    case "u":
      return [0, -100 * x];
    case "d":
      return [0, 100 * x];
    case "lu":
      return [-100 * x, -100 * x];
    case "ru":
      return [100 * x, -100 * x];
    case "ld":
      return [-100 * x, 100 * x];
    case "rd":
      return [100 * x, 100 * x];
    default:
      return [0, 100 * x];
  }
}
function dt(n, t, e) {
  const r = n.querySelector("svg");
  if (!r || typeof r.getBoundingClientRect != "function" || typeof t.getBoundingClientRect != "function") return null;
  const s = r.getBoundingClientRect(), i = t.getBoundingClientRect();
  if (s.width < 1 || s.height < 1 || i.width < 1 || i.height < 1) return null;
  const o = (s.left - i.right - 4) / i.width * 100, c = (s.right - i.left + 4) / i.width * 100, l = (s.top - i.bottom - 4) / i.height * 100, h = (s.bottom - i.top + 4) / i.height * 100, u = e != null && e.includes("l") ? o : e != null && e.includes("r") ? c : 0, a = e != null && e.includes("u") ? l : e != null && e.includes("d") || !e ? h : 0;
  return `translate(${u}%, ${a}%)`;
}
function k(n, t) {
  return n === t ? `scale(${n})` : `scale(${n}, ${t})`;
}
const mt = ["maskImage", "maskRepeat", "maskPosition", "maskSize"];
function yt(n) {
  var a, f;
  const t = (a = n.getBoundingClientRect) == null ? void 0 : a.call(n), e = (f = n.ownerDocument) == null ? void 0 : f.createRange;
  if (!t || t.width < 1 || t.height < 1 || typeof e != "function") return null;
  const r = e.call(n.ownerDocument);
  r.selectNodeContents(n);
  const s = r.getBoundingClientRect();
  if (s.width < 1 || s.height < 1) return null;
  const i = Math.min(100, Math.max(0, (s.left - t.left) / t.width * 100)), o = Math.min(100, Math.max(0, (s.top - t.top) / t.height * 100)), c = Math.min(100, Math.max(i, (s.right - t.left) / t.width * 100)), l = Math.min(100, Math.max(o, (s.bottom - t.top) / t.height * 100)), h = c - i, u = l - o;
  return h < 1 || u < 1 ? null : { l: i, t: o, w: h, h: u };
}
function gt(n, t) {
  if (!t || typeof n.querySelectorAll != "function") return [];
  const e = [];
  for (const s of n.querySelectorAll("[data-p]")) {
    const i = Number(s.getAttribute("data-p"));
    Number.isInteger(i) && i >= t.start && i <= t.end && e.push(s);
  }
  if (e.length) return e;
  const r = [];
  for (const s of n.querySelectorAll("foreignObject > :first-child")) {
    const i = [...s.children].filter((o) => o.localName === "div");
    for (let o = t.start; o <= t.end && o < i.length; o++)
      r.push(i[o]);
  }
  return r;
}
function vt(n, t, e) {
  if (n.kind !== "emphasis" && n.kind !== "motion" && n.effect === "zoom" && (n.dir === "in" || n.dir === "out")) {
    const r = yt(t);
    if (r) {
      const s = n.dir === "in" ? {
        from: L(!1, r),
        to: L(!0, r)
      } : {
        from: { opacity: 1, clipPath: Y(!1, r) },
        to: { opacity: 1, clipPath: Y(!0, r) }
      }, i = n.kind === "exit" ? [s.to, s.from] : [s.from, s.to];
      return F(i);
    }
  }
  return F(e);
}
function F(n) {
  const t = (e) => e.clipPath !== void 0 || e.maskSize !== void 0;
  return n.some(t) ? n.map((e) => {
    const r = {};
    e.clipPath !== void 0 && (r.clipPath = String(e.clipPath).replace(/ fill-box/g, ""));
    for (const s of mt) e[s] !== void 0 && (r[s] = e[s]);
    return e.maskSize !== void 0 && (r.maskOrigin = "border-box", r.maskClip = "border-box"), e.offset !== void 0 && (r.offset = e.offset), r;
  }) : null;
}
function $(n, t) {
  const e = t ? 100 : 0;
  switch (n) {
    case "l":
      return `inset(0 ${e}% 0 0)`;
    case "r":
      return `inset(0 0 0 ${e}%)`;
    case "u":
      return `inset(0 0 ${e}% 0)`;
    case "horz":
      return `inset(0 ${e / 2}% 0 ${e / 2}%)`;
    case "vert":
      return `inset(${e / 2}% 0 ${e / 2}% 0)`;
    default:
      return `inset(${e}% 0 0 0)`;
  }
}
const xt = {
  d: { origin: "center bottom", axis: "scaleY" },
  u: { origin: "center top", axis: "scaleY" },
  l: { origin: "left center", axis: "scaleX" },
  r: { origin: "right center", axis: "scaleX" },
  lu: { origin: "left top", axis: "scale" },
  ru: { origin: "right top", axis: "scale" },
  ld: { origin: "left bottom", axis: "scale" },
  rd: { origin: "right bottom", axis: "scale" }
};
function bt(n) {
  return (n ? xt[n] : void 0) ?? { origin: "center", axis: "scaleX" };
}
function _(n, t) {
  const e = Math.round(Math.sin(2.5 * Math.PI * t) * 1e4) / 1e4;
  return {
    opacity: t,
    transform: n === "horz" ? `scaleY(${e})` : `scaleX(${e})`
  };
}
function q(n) {
  var t, e, r, s, i, o, c, l, h, u;
  switch (n.effect) {
    case "appear":
      return { from: { opacity: 0 }, to: { opacity: 1 } };
    case "fly": {
      const [a, f] = pt(n.dir);
      return {
        from: { opacity: 0, transform: `translate(${a}%, ${f}%)` },
        to: { opacity: 1, transform: "translate(0, 0)" }
      };
    }
    case "zoom":
      return n.dir === "in" ? { from: L(!1), to: L(!0) } : n.dir === "out" ? {
        from: { opacity: 1, clipPath: Y(!1) },
        to: { opacity: 1, clipPath: Y(!0) }
      } : {
        from: { opacity: 0, transform: k(((t = n.scale) == null ? void 0 : t.fromX) ?? 0, ((e = n.scale) == null ? void 0 : e.fromY) ?? 0) },
        to: { opacity: 1, transform: k(((r = n.scale) == null ? void 0 : r.toX) ?? 1, ((s = n.scale) == null ? void 0 : s.toY) ?? 1) }
      };
    case "grow":
      return {
        from: { opacity: 1, transform: `${k(((i = n.scale) == null ? void 0 : i.fromX) ?? 0, ((o = n.scale) == null ? void 0 : o.fromY) ?? 0)} rotate(${((c = n.rotation) == null ? void 0 : c.from) ?? 0}deg)` },
        to: { opacity: 1, transform: `${k(((l = n.scale) == null ? void 0 : l.toX) ?? 1, ((h = n.scale) == null ? void 0 : h.toY) ?? 1)} rotate(${((u = n.rotation) == null ? void 0 : u.to) ?? 90}deg)` }
      };
    case "spin":
      return { from: { opacity: 0, transform: "rotate(-180deg) scale(0.4)" }, to: { opacity: 1, transform: "rotate(0) scale(1)" } };
    case "swivel":
      return { from: _(n.dir, 0), to: _(n.dir, 1) };
    case "float":
      return { from: { opacity: 0, transform: "translateY(30%)" }, to: { opacity: 1, transform: "translateY(0)" } };
    case "bounce":
      return { from: { opacity: 0, transform: "translateY(-60%)" }, to: { opacity: 1, transform: "translateY(0)" } };
    case "stretch": {
      if (n.scale)
        return {
          from: { opacity: 0, transform: k(n.scale.fromX, n.scale.fromY) },
          to: { opacity: 1, transform: k(n.scale.toX, n.scale.toY) }
        };
      const { origin: a, axis: f } = bt(n.dir);
      return {
        from: { opacity: 1, transform: `${f}(0)`, transformOrigin: a },
        to: { opacity: 1, transform: `${f}(1)`, transformOrigin: a }
      };
    }
    case "blinds":
      return {
        from: W(n.dir, !1),
        to: W(n.dir, !0)
      };
    case "checkerboard":
      return {
        from: U(n.dir, !1),
        to: U(n.dir, !0)
      };
    case "randomBar":
      return {
        from: N(n.dir, !1),
        to: N(n.dir, !0)
      };
    case "strips":
      return {
        from: D(n.dir, !1),
        to: D(n.dir, !0)
      };
    case "circle":
    case "diamond":
    case "plus":
      return {
        from: O(n.effect, n.dir, !1),
        to: O(n.effect, n.dir, !0)
      };
    case "wipe":
      return {
        from: { opacity: 1, clipPath: $(n.dir, !0) },
        to: { opacity: 1, clipPath: $(n.dir, !1) }
      };
    case "split":
      return {
        from: Z(n.dir, !1),
        to: Z(n.dir, !0)
      };
    case "wheel":
      return {
        from: j(n.dir, !1),
        to: j(n.dir, !0)
      };
    case "dissolve":
      return {
        from: I(!1, n.target),
        to: I(!0, n.target)
      };
    case "random":
      return q({ ...n, effect: ["fly", "wipe", "zoom"][n.target % 3], dir: "d" });
    case "fade":
    default:
      return { from: { opacity: 0 }, to: { opacity: 1 } };
  }
}
function wt(n) {
  const t = q({ ...n, kind: "entrance" });
  return { from: t.to, to: t.from };
}
function kt(n) {
  var t, e, r, s;
  switch (n.effect) {
    case "spin":
      return { from: { transform: "rotate(0)" }, to: { transform: "rotate(360deg)" } };
    case "grow":
      return {
        from: { transform: k(((t = n.scale) == null ? void 0 : t.fromX) ?? 1, ((e = n.scale) == null ? void 0 : e.fromY) ?? 1) },
        to: { transform: k(((r = n.scale) == null ? void 0 : r.toX) ?? 1.25, ((s = n.scale) == null ? void 0 : s.toY) ?? 1.25) }
      };
    default:
      return { from: { opacity: 1 }, to: { opacity: 0.5 } };
  }
}
function B(n) {
  return n.kind === "exit" ? wt(n) : n.kind === "emphasis" ? kt(n) : n.kind === "motion" ? { from: { opacity: 1 }, to: { opacity: 1 } } : q(n);
}
function $t(n, t) {
  var l, h, u;
  const e = [], r = [], s = [];
  let i = !1, o = 0, c = 0;
  for (const a of t) {
    const f = a.trigger === "afterPrev" ? c + a.delayMs : a.trigger === "withPrev" ? o + a.delayMs : a.delayMs;
    o = f, c = f + a.durationMs;
    const m = n.querySelector(`[data-el="${a.target}"]`);
    if (!m) continue;
    if (a.mediaCommand) {
      const y = ft(m, a.mediaCommand, f);
      y && s.push(y);
      continue;
    }
    a.kind === "exit" && r.push(m);
    const { from: v, to: b } = B(a);
    if (m.style.visibility = "visible", a.kind === "entrance" && (m.style.opacity = ""), a.effect === "fly" && (a.kind === "entrance" || a.kind === "exit")) {
      const y = dt(n, m, a.dir);
      y && (a.kind === "entrance" ? v.transform = y : b.transform = y);
    }
    const S = (l = a.motionPath) == null ? void 0 : l.reduce((y, [p, P], w, T) => (w === 0 ? y.push(0) : y.push(y[w - 1] + Math.hypot(p - T[w - 1][0], P - T[w - 1][1])), y), []), V = (S == null ? void 0 : S[S.length - 1]) ?? 0, M = (h = a.motionPath) != null && h.length ? a.motionPath.map(([y, p], P) => ({
      transform: `translate(${y}px, ${p}px)`,
      offset: V > 0 ? S[P] / V : P / (a.motionPath.length - 1)
    })) : a.effect === "randomBar" ? Array.from({ length: 13 }, (y, p) => ({
      ...N(a.dir, a.kind === "exit" ? 1 - p / 12 : p / 12),
      offset: p / 12
    })) : a.effect === "strips" ? Array.from({ length: 21 }, (y, p) => ({
      ...D(a.dir, a.kind === "exit" ? 1 - p / 20 : p / 20),
      offset: p / 20
    })) : a.effect === "wheel" ? Array.from({ length: 73 }, (y, p) => ({
      ...j(a.dir, a.kind === "exit" ? 1 - p / 72 : p / 72),
      offset: p / 72
    })) : a.effect === "circle" || a.effect === "diamond" || a.effect === "plus" && a.dir !== "in" ? Array.from({ length: 37 }, (y, p) => ({
      ...O(
        a.effect,
        a.dir,
        a.kind === "exit" ? 1 - p / 36 : p / 36
      ),
      offset: p / 36
    })) : a.effect === "dissolve" ? Array.from({ length: 9 }, (y, p) => ({
      ...I(a.kind === "exit" ? 1 - p / 8 : p / 8, a.target),
      offset: p / 8
    })) : a.effect === "swivel" && (a.kind === "entrance" || a.kind === "exit") ? Array.from({ length: 41 }, (y, p) => ({
      ..._(a.dir, a.kind === "exit" ? 1 - p / 40 : p / 40),
      offset: p / 40
    })) : a.effect === "bounce" && a.kind === "entrance" ? [
      { opacity: 0, transform: "translateY(-60%)", offset: 0 },
      { opacity: 1, transform: "translateY(10%)", offset: 0.5 },
      { opacity: 1, transform: "translateY(-8%)", offset: 0.7 },
      { opacity: 1, transform: "translateY(3%)", offset: 0.85 },
      { opacity: 1, transform: "translateY(0)", offset: 1 }
    ] : [v, b];
    try {
      const y = (u = a.motionPath) != null && u.length || a.effect === "randomBar" || a.effect === "strips" || a.effect === "wheel" || a.effect === "circle" || a.effect === "diamond" || a.effect === "plus" || a.effect === "dissolve" || a.effect === "bounce" || a.effect === "swivel" ? "linear" : a.effect === "appear" && a.kind === "entrance" ? "steps(1, start)" : a.effect === "appear" && a.kind === "exit" ? "steps(1, end)" : "cubic-bezier(0.25, 0.46, 0.45, 0.94)", p = m.animate(M, {
        duration: a.durationMs,
        delay: f,
        // 路径动画在 PowerPoint 里是匀速，不能套入场用的缓动
        easing: y,
        fill: "both"
      });
      a.kind === "exit" && p.finished.then(() => {
        i || (m.style.visibility = "hidden");
      }).catch(() => {
      }), e.push(p);
      const P = F(M);
      if (!P || typeof m.querySelectorAll != "function") continue;
      const w = gt(m, a.paragraphRange), T = w.length ? w : m.querySelectorAll("foreignObject > :first-child");
      for (const X of T) {
        if (!(X instanceof HTMLElement)) continue;
        const H = w.length ? vt(a, X, M) : P;
        H && e.push(X.animate(H, {
          duration: a.durationMs,
          delay: f,
          easing: y,
          fill: "both"
        }));
      }
    } catch {
      Object.assign(m.style, M[M.length - 1] ?? b), a.kind === "exit" && (m.style.visibility = "hidden");
    }
  }
  return {
    animations: e,
    cancel: () => {
      i = !0, e.forEach((a) => {
        try {
          a.finish();
        } catch {
        }
      }), s.forEach((a) => a.cancel());
      for (const a of r) a.style.visibility = "hidden";
    },
    // 等全部视觉与媒体调用落定后再报告：媒体失败不能让批次提前收尾、截断仍在播的视觉动画。
    finished: Promise.all([
      Promise.all(e.map((a) => a.finished.catch(() => {
      }))),
      Promise.allSettled(s.map((a) => a.finished))
    ]).then(([, a]) => {
      const f = a.find((m) => m.status === "rejected");
      if (f) throw f.reason;
    })
  };
}
function J(n, t) {
  const e = n.dir ?? rt(n.type) ?? "", r = (i, o) => `translate(${i}, ${o})`, s = () => {
    const i = {
      l: ["-100%", "0"],
      r: ["100%", "0"],
      u: ["0", "-100%"],
      d: ["0", "100%"],
      lu: ["-100%", "-100%"],
      ld: ["-100%", "100%"],
      ru: ["100%", "-100%"],
      rd: ["100%", "100%"]
    };
    return i[e] ?? i.d;
  };
  switch (n.type) {
    case "cut":
      return t ? [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: 0.49 },
        { opacity: 1, offset: 0.5 },
        { opacity: 1, offset: 1 }
      ] : [
        { opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.49 },
        { opacity: 0, offset: 0.5 },
        { opacity: 0, offset: 1 }
      ];
    case "push":
    case "pull": {
      const [i, o] = s(), c = n.type === "pull" ? -1 : 1, l = (h) => h === "0" ? "0" : `${-parseFloat(h) * c}%`;
      return t ? [{ transform: r(c > 0 ? i : l(i), c > 0 ? o : l(o)) }, { transform: "translate(0,0)" }] : [{ transform: "translate(0,0)" }, { transform: r(l(i), l(o)) }];
    }
    case "cover": {
      const [i, o] = s();
      return t ? [{ transform: r(i, o) }, { transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "wipe": {
      const i = $(e || "d", !0), o = $(e || "d", !1);
      return t ? [{ clipPath: i }, { clipPath: o }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "split": {
      const i = e.startsWith("vert"), o = e.endsWith("out"), c = i ? "inset(0 50% 0 50%)" : "inset(50% 0 50% 0)", l = "inset(0 0 0 0)";
      return t ? o ? [{ clipPath: c }, { clipPath: l }] : [{ clipPath: l }, { clipPath: l }] : [{ clipPath: l }, { clipPath: c }];
    }
    case "zoom":
      return t ? [{ opacity: 0, transform: e === "out" ? "scale(1.4)" : "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "wheel":
    case "circle":
    case "diamond":
    case "plus":
    case "wedge":
      return t ? [{ opacity: 0, transform: "scale(0.7)" }, { opacity: 1, transform: "scale(1)" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "ripple": {
      const i = {
        lu: "0% 0%",
        ld: "0% 100%",
        ru: "100% 0%",
        rd: "100% 100%",
        center: "50% 50%"
      }, o = i[e] ?? i.center;
      return t ? [{ clipPath: `circle(0% at ${o})` }, { clipPath: `circle(145% at ${o})` }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "vortex": {
      const [i, o] = s(), c = e === "r" || e === "d" ? 180 : -180;
      return t ? [{ opacity: 0, transformOrigin: `${i === "0" ? "50%" : i.startsWith("-") ? "0%" : "100%"} ${o === "0" ? "50%" : o.startsWith("-") ? "0%" : "100%"}`, transform: `scale(0.2) rotate(${c}deg)` }, { opacity: 1, transform: "none" }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "honeycomb":
      return t ? [{ opacity: 0, transform: "scale(0.85) rotate(-6deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(1.1)" }];
    case "glitter":
      return t ? [{ opacity: 0, clipPath: $(e || "l", !0) }, { opacity: 1, clipPath: $(e || "l", !1) }] : [{ opacity: 1 }, { opacity: 0 }];
    case "shred": {
      const i = e === "out";
      return t ? [{ opacity: 0, transform: i ? "scale(1.35) rotate(5deg)" : "scale(0.72) rotate(-5deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: i ? "scaleY(0.72)" : "scaleY(1.2)" }];
    }
    case "flash":
      return t ? [{ opacity: 0, filter: "brightness(3)" }, { opacity: 1, filter: "brightness(1)" }] : [{ opacity: 1, filter: "brightness(1)" }, { opacity: 0, filter: "brightness(3)" }];
    case "reveal": {
      const [i, o] = s();
      return t ? [{ opacity: 0, transform: r(i, o) }, { opacity: 1, transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "wheelReverse":
      return t ? [{ opacity: 0, transform: "scale(1.3) rotate(20deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "doors":
      return t ? [{ clipPath: e === "horz" ? "inset(50% 0 50% 0)" : "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0 0 0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    case "window":
      return t ? [{ clipPath: e === "horz" ? "inset(0 50% 0 50%)" : "inset(50% 0 50% 0)" }, { clipPath: "inset(0 0 0 0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    case "switch":
    case "flip": {
      const i = (n.type === "flip" ? -1 : 1) * (e === "r" ? -1 : 1);
      return t ? [
        { opacity: 0, transform: `perspective(1400px) rotateY(${i * -80}deg)` },
        { opacity: 1, transform: "perspective(1400px) rotateY(0)" }
      ] : [
        { opacity: 1, transform: "perspective(1400px) rotateY(0)" },
        { opacity: 0, transform: `perspective(1400px) rotateY(${i * 80}deg)` }
      ];
    }
    case "prism": {
      const i = e === "u" || e === "d", o = e === "r" || e === "d" ? -1 : 1, c = (l) => i ? `rotateX(${l}deg)` : `rotateY(${l}deg)`;
      return t ? [
        { opacity: 0, transform: `perspective(1400px) ${c(o * -70)}` },
        { opacity: 1, transform: `perspective(1400px) ${c(0)}` }
      ] : [
        { opacity: 1, transform: `perspective(1400px) ${c(0)}` },
        { opacity: 0, transform: `perspective(1400px) ${c(o * 70)}` }
      ];
    }
    case "ferris": {
      const i = e === "r" ? -1 : 1;
      return t ? [
        { opacity: 0, transform: `perspective(1400px) rotateX(${i * 70}deg)` },
        { opacity: 1, transform: "perspective(1400px) rotateX(0)" }
      ] : [
        { opacity: 1, transform: "perspective(1400px) rotateX(0)" },
        { opacity: 0, transform: `perspective(1400px) rotateX(${i * -70}deg)` }
      ];
    }
    case "gallery":
    case "conveyor": {
      const i = n.type === "conveyor" ? 25 : 12, o = e.includes("l") ? "-100%" : "100%", c = e.includes("l") ? "100%" : "-100%";
      return t ? [
        { transform: `perspective(1600px) translateX(${o}) rotateY(${i}deg)` },
        { transform: "perspective(1600px) translateX(0) rotateY(0)" }
      ] : [
        { transform: "perspective(1600px) translateX(0) rotateY(0)" },
        { transform: `perspective(1600px) translateX(${c}) rotateY(${-i}deg)` }
      ];
    }
    case "pan": {
      const [i, o] = s(), c = (l) => l === "0" ? "0" : `${-parseFloat(l)}%`;
      return t ? [{ transform: r(i, o) }, { transform: "translate(0,0)" }] : [{ transform: "translate(0,0)" }, { transform: r(c(i), c(o)) }];
    }
    case "flythrough":
      return t ? [{ opacity: 0, transform: `perspective(1000px) scale(${e === "out" ? 2.2 : 0.15})` }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `perspective(1000px) scale(${e === "out" ? 0.15 : 2.2})` }];
    case "warp": {
      const i = e === "out";
      return t ? [{ opacity: 0, transform: i ? "skewX(-18deg) scale(1.35)" : "skewX(18deg) scale(0.65)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: i ? "skewX(18deg) scale(0.65)" : "skewX(-18deg) scale(1.35)" }];
    }
    case "blinds":
    case "checker":
    case "randomBar": {
      const i = $(e, !0);
      return t ? [{ opacity: 0.2, clipPath: i }, { opacity: 1, clipPath: $(e, !1) }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "comb":
      return t ? [{ opacity: 0, transform: e === "vert" ? "translateY(-100%)" : "translateX(-100%)" }, { opacity: 1, transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "strips": {
      const i = {
        lu: "0% 0%",
        ld: "0% 100%",
        ru: "100% 0%",
        rd: "100% 100%"
      }, o = i[e] ?? i.rd;
      return t ? [{ opacity: 0, clipPath: `circle(0% at ${o})` }, { opacity: 1, clipPath: `circle(145% at ${o})` }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "newsflash":
    case "dissolve":
    case "fade":
    case "morph":
    default:
      return t ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];
  }
}
function At(n, t) {
  const e = Promise.all(n.map((r) => r.catch(() => {
  }))).then(() => {
  });
  return typeof setTimeout != "function" ? e : Promise.race([e, new Promise((r) => setTimeout(r, t + 250))]);
}
function Pt(n, t) {
  const e = /* @__PURE__ */ new Map();
  n.querySelectorAll("[data-el]").forEach((s) => {
    const i = s.getBoundingClientRect();
    (i.width > 0 || i.height > 0) && e.set(s.getAttribute("data-el") ?? "", i);
  });
  const r = [];
  return t.querySelectorAll("[data-el]").forEach((s) => {
    const i = e.get(s.getAttribute("data-el") ?? "");
    if (!i) return;
    const o = s.getBoundingClientRect();
    o.width <= 0 && o.height <= 0 || r.push({ node: s, from: i, to: o });
  }), r;
}
function E(n, t, e) {
  let r = !1;
  const s = () => {
    if (!r) {
      r = !0;
      for (const o of n)
        try {
          o.cancel();
        } catch {
        }
      t == null || t.remove();
    }
  }, i = At(n.map((o) => o.finished), e).then(s);
  return { animations: n, finished: i, cancel: s };
}
function St(n, t, e) {
  if (!n) return E([], null, e.durationMs);
  const r = { duration: e.durationMs, easing: "ease-in-out", fill: "both" }, s = Pt(n, t), i = new Set(s.map((l) => l.node.getAttribute("data-el"))), o = [], c = (l, h) => {
    try {
      o.push(l.animate(h, r));
    } catch {
    }
  };
  for (const { node: l, from: h, to: u } of s) {
    const a = h.left - u.left, f = h.top - u.top, m = u.width > 0 ? h.width / u.width : 1, v = u.height > 0 ? h.height / u.height : 1;
    c(l, [
      { transformOrigin: "left top", transform: `translate(${a}px, ${f}px) scale(${m}, ${v})` },
      { transformOrigin: "left top", transform: "none" }
    ]);
  }
  return n.querySelectorAll("[data-el]").forEach((l) => {
    const h = i.has(l.getAttribute("data-el"));
    c(l, h ? [{ opacity: 0 }, { opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }]);
  }), t.querySelectorAll("[data-el]").forEach((l) => {
    i.has(l.getAttribute("data-el")) || c(l, [{ opacity: 0 }, { opacity: 1 }]);
  }), E(o, n, e.durationMs);
}
function it(n, t, e) {
  if (!e || e.type === "none")
    return n == null || n.remove(), E([], null, 0);
  if (e.type === "morph" && n) return St(n, t, e);
  const r = { duration: e.durationMs, easing: "ease-in-out", fill: "both" }, s = [];
  try {
    s.push(t.animate(J(e, !0), r)), n && s.push(n.animate(J(e, !1), r));
  } catch {
    for (const i of s) {
      i.finished.catch(() => {
      });
      try {
        i.cancel();
      } catch {
      }
    }
    return n == null || n.remove(), E([], null, 0);
  }
  return E(s, n, e.durationMs);
}
function Rt(n, t, e) {
  return it(n, t, e).finished;
}
function Mt(n) {
  var e;
  const t = (e = n.transition) == null ? void 0 : e.advanceAfterMs;
  return t !== void 0 && t >= 0 ? t : null;
}
const Ct = 2147483647;
class Et {
  constructor(t, e = {}) {
    this.presentation = t, this.options = e, this.idx = 0, this.zoomValue = 1, this.groups = [], this.cursor = 0, this.listeners = /* @__PURE__ */ new Set(), this.autoTimer = null, this.textCache = /* @__PURE__ */ new Map(), this.idx = this.clamp(e.index ?? 0), this.loadAnimations();
  }
  // ---------------- 只读状态 ----------------
  get index() {
    return this.idx;
  }
  get count() {
    return this.presentation.slides.length;
  }
  get slide() {
    return this.presentation.slides[this.idx];
  }
  get zoom() {
    return this.zoomValue;
  }
  get animate() {
    return this.options.animate === !0;
  }
  get animationTotal() {
    return this.groups.length;
  }
  get animationDone() {
    return this.cursor;
  }
  get hasPendingAnimation() {
    return this.animate && this.cursor < this.groups.length;
  }
  /** 光标之前已经结束的步骤。终态样式按这个顺序覆盖。 */
  get completedSteps() {
    const t = [];
    for (let e = 0; e < this.cursor && e < this.groups.length; e++) t.push(...this.groups[e]);
    return t;
  }
  /**
   * 当前应当隐藏的元素 id —— UI 据此设置可见性。
   *
   * 不播动画时不是「全部可见」，而是动画终态：入场与退场的元素属于不同时刻，
   * 一起画出来就是几帧叠在一起（见 core 的 staticHidden）。
   */
  get hiddenElementIds() {
    return this.animate ? st(this.groups, this.cursor) : tt(this.slide);
  }
  /** 本页的自动换片延迟（毫秒），未配置则为 null */
  get autoAdvanceDelay() {
    return this.options.autoAdvance ? Mt(this.slide) : null;
  }
  // ---------------- 订阅 ----------------
  subscribe(t) {
    return this.listeners.add(t), () => this.listeners.delete(t);
  }
  emit(t) {
    for (const e of this.listeners) e(t);
  }
  // ---------------- 导航 ----------------
  clamp(t) {
    return Math.max(0, Math.min(this.count - 1, t));
  }
  visible(t) {
    var e;
    return !this.options.skipHidden || !((e = this.presentation.slides[t]) != null && e.hidden);
  }
  /**
   * 跳转到指定页。返回是否真的换了页。
   * 前进时带上目标页的切换效果；回退不播切换，避免观感错乱。
   */
  goTo(t, e = "forward") {
    const r = this.clamp(t);
    if (r === this.idx) return !1;
    const s = this.idx;
    return this.idx = r, this.loadAnimations(), this.emit({
      type: "slide",
      index: r,
      previous: s,
      transition: e === "forward" && this.animate ? this.slide.transition : void 0
    }), !0;
  }
  /** 有待播动画时先播动画，否则翻页 */
  next() {
    if (this.playNextAnimation()) return;
    let t = this.idx + 1;
    for (; t < this.count && !this.visible(t); ) t++;
    t < this.count && this.goTo(t);
  }
  /**
   * 放映时先退回一批已经播过的点击；本页还在开头，才去上一张可见页。
   *
   * 上一页要落在终态，否则入场又藏起来，没法继续往回退。
   * 光标必须在发出 slide 之前拨到末批，不然会先画出开头那一帧。
   * 浏览关掉动画时批次表是空的，这里仍是整页回退。
   */
  prev() {
    if (this.animate && this.cursor > 0) {
      this.cursor--, this.emit({
        type: "animation",
        done: this.cursor,
        total: this.groups.length,
        group: null,
        settle: !0
      });
      return;
    }
    let t = this.idx - 1;
    for (; t >= 0 && !this.visible(t); ) t--;
    if (t < 0) return;
    const e = this.idx;
    this.idx = t, this.loadAnimations(), this.animate && (this.cursor = this.groups.length), this.emit({ type: "slide", index: this.idx, previous: e });
  }
  setZoom(t) {
    const e = Math.max(0.1, Math.min(8, t));
    e !== this.zoomValue && (this.zoomValue = e, this.emit({ type: "zoom", zoom: e }));
  }
  setAnimate(t) {
    this.options.animate !== t && (this.options = { ...this.options, animate: t }, this.loadAnimations(), this.emit({ type: "animation", done: this.cursor, total: this.groups.length, group: null }));
  }
  // ---------------- 动画 ----------------
  loadAnimations() {
    this.groups = this.animate ? ot(this.slide.animations) : [], this.cursor = 0;
  }
  /**
   * 推进一批动画。返回应播放的这一批；没有待播批次时返回 null。
   * 真正的播放由 UI 层执行——状态机只负责「该播哪一批」。
   */
  playNextAnimation() {
    if (!this.hasPendingAnimation) return null;
    const t = this.groups[this.cursor];
    return this.cursor++, this.emit({ type: "animation", done: this.cursor, total: this.groups.length, group: t }), t;
  }
  /** 直接跳到本页动画终态 */
  finishAnimations() {
    this.cursor !== this.groups.length && (this.cursor = this.groups.length, this.emit({ type: "animation", done: this.cursor, total: this.groups.length, group: null }));
  }
  // ---------------- 自动换片 ----------------
  /** 启动自动换片计时；返回取消函数。由 UI 层在每次换页后调用。 */
  scheduleAutoAdvance() {
    this.cancelAutoAdvance();
    const t = this.autoAdvanceDelay;
    if (t === null) return () => {
    };
    let e = t;
    const r = () => {
      const s = Math.min(e, Ct);
      this.autoTimer = setTimeout(() => {
        this.autoTimer = null, e -= s, e > 0 ? r() : this.next();
      }, s);
    };
    return r(), () => this.cancelAutoAdvance();
  }
  cancelAutoAdvance() {
    this.autoTimer !== null && (clearTimeout(this.autoTimer), this.autoTimer = null);
  }
  // ---------------- 文本 / 搜索 ----------------
  text(t) {
    let e = this.textCache.get(t);
    return e === void 0 && (e = at(this.presentation.slides[t]), this.textCache.set(t, e)), e;
  }
  /** 全文搜索，返回命中的页索引 */
  search(t) {
    const e = t.trim().toLowerCase();
    if (!e) return [];
    const r = [];
    for (let s = 0; s < this.count; s++)
      this.text(s).toLowerCase().includes(e) && r.push(s);
    return r;
  }
  /** 解析绝对或相对内部跳转；相对动作保留到点击时，页序变化后仍指向正确目标。 */
  resolveLink(t) {
    if (!t.startsWith("slide:")) return null;
    const e = t.slice(6), r = e === "next" ? this.idx + 2 : e === "previous" ? this.idx : e === "first" ? 1 : e === "last" ? this.count : Number(e);
    return Number.isFinite(r) ? this.clamp(r - 1) : null;
  }
  destroy() {
    this.cancelAutoAdvance(), this.listeners.clear(), this.textCache.clear();
  }
}
const Q = "http://www.w3.org/2000/svg", Tt = "http://www.w3.org/1999/xhtml";
let C = null;
function Nt() {
  C = null;
}
function Lt(n) {
  if (C !== null) return C;
  const t = n.body ?? n.documentElement;
  if (!t) return !0;
  const e = n.createElementNS(Q, "svg");
  e.setAttribute("viewBox", "0 0 100 100"), e.setAttribute("width", "200"), e.setAttribute("height", "200"), e.setAttribute("style", "position:absolute;left:-9999px;top:-9999px;pointer-events:none");
  const r = n.createElementNS(Q, "foreignObject");
  r.setAttribute("width", "100"), r.setAttribute("height", "100");
  const s = n.createElementNS(Tt, "div");
  s.setAttribute("style", "width:100px;height:100px"), r.appendChild(s), e.appendChild(r), t.appendChild(e);
  const i = s.getBoundingClientRect().width;
  return e.remove(), C = i === 0 || i > 150, C;
}
const Yt = /* @__PURE__ */ new Set(["offset", "easing", "composite"]);
function Xt(n) {
  if (n.mediaCommand) return null;
  if (n.kind === "entrance")
    return n.effect === "grow" && n.rotation ? { transform: String(B(n).to.transform) } : null;
  if (n.kind === "exit") return null;
  if (n.kind === "motion") {
    const e = n.motionPath;
    if (!(e != null && e.length)) return null;
    const [r, s] = e[e.length - 1];
    return { transform: `translate(${r}px, ${s}px)` };
  }
  const t = {};
  for (const [e, r] of Object.entries(B(n).to))
    Yt.has(e) || r == null || typeof r == "object" || (t[e] = String(r));
  return Object.keys(t).length ? t : null;
}
class Dt {
  constructor(t, e, r = {}) {
    this.container = t, this.presentation = e, this.svgCache = /* @__PURE__ */ new Map(), this.playing = null, this.playingGroup = null, this.transition = null, this.currentLayer = null, this.cancelAuto = null, this.onChange = null, this.onAnimStep = null, this.onLinkClick = null, this.handleClick = (i) => {
      var a;
      const o = i.target, c = (a = o == null ? void 0 : o.closest("[data-media-toggle]")) == null ? void 0 : a.querySelector("audio");
      if (c) {
        i.preventDefault(), c.paused ? Promise.resolve(c.play()).catch((f) => this.reportPlaybackError(f)) : c.pause();
        return;
      }
      const l = o == null ? void 0 : o.closest("[data-slide]");
      if (l) {
        i.preventDefault();
        const f = this.state.resolveLink(`slide:${l.getAttribute("data-slide") ?? ""}`);
        f !== null && this.goTo(f);
        return;
      }
      const h = o == null ? void 0 : o.closest("a[href]"), u = h == null ? void 0 : h.getAttribute("href");
      u && this.onLinkClick && this.onLinkClick(u) === !0 && i.preventDefault();
    }, this.handleKeyDown = (i) => {
      if (i.key !== "Enter") return;
      const o = i.target, c = o == null ? void 0 : o.closest("[data-slide]");
      if (!c) return;
      const l = this.state.resolveLink(`slide:${c.getAttribute("data-slide") ?? ""}`);
      l !== null && (i.preventDefault(), this.goTo(l));
    }, this.media = r.media ?? "badge";
    const s = r.textMode ?? "auto";
    this.textMode = s !== "auto" ? s : Lt(t.ownerDocument) ? "html" : "svg", this.state = new Et(e, r), this.unsubscribe = this.state.subscribe((i) => {
      var o, c;
      i.type === "slide" ? (this.paint(i.transition), (o = this.onChange) == null || o.call(this, i.index)) : i.type === "animation" ? (i.group ? this.play(i.group) : i.settle ? this.paint() : (this.releasePlayback(!0), this.applyVisibility(), this.applySettled()), i.settle || (c = this.onAnimStep) == null || c.call(this, i.done, i.total)) : i.type === "zoom" && this.applyZoom();
    }), this.container.addEventListener("click", this.handleClick), this.container.addEventListener("keydown", this.handleKeyDown), this.paint();
  }
  // ---------------- 转发给状态机 ----------------
  get index() {
    return this.state.index;
  }
  get count() {
    return this.state.count;
  }
  get slide() {
    return this.state.slide;
  }
  get zoomLevel() {
    return this.state.zoom;
  }
  get animationTotal() {
    return this.state.animationTotal;
  }
  get animationDone() {
    return this.state.animationDone;
  }
  get hasPendingAnimation() {
    return this.state.hasPendingAnimation;
  }
  goTo(t, e = "forward") {
    this.state.goTo(t, e);
  }
  next() {
    this.state.next();
  }
  prev() {
    this.state.prev();
  }
  setZoom(t) {
    this.state.setZoom(t);
  }
  finishAnimations() {
    this.state.finishAnimations(), this.playing && (this.releasePlayback(!0), this.applyVisibility(), this.applySettled());
  }
  search(t) {
    return this.state.search(t);
  }
  text(t) {
    return this.state.text(t);
  }
  setAnimate(t) {
    this.state.setAnimate(t), this.paint();
  }
  playNextAnimation() {
    return this.state.playNextAnimation() !== null;
  }
  // ---------------- 渲染 ----------------
  /** 带缓存的单页 SVG（主视图用） */
  slideSvg(t) {
    let e = this.svgCache.get(t);
    return e === void 0 && (e = G(this.presentation, this.presentation.slides[t], {
      media: this.media,
      textMode: this.textMode
    }), this.svgCache.set(t, e)), e;
  }
  /** 不走缓存，用于缩略图等需要独立 defs id 的场景 */
  renderSlide(t) {
    const e = this.presentation.slides[t];
    return G(this.presentation, e, {
      // 缩略图不嵌播放器：既没意义，还会为每个缩略图各建一个媒体元素
      textMode: this.textMode,
      // 缩略图是静态产物，没有后续的 applyVisibility，隐藏状态只能烘进 SVG
      hiddenElements: [...tt(e)]
    });
  }
  /**
   * 重渲当前页，页码与动画进度都不变。
   *
   * 给「渲染完之后世界才变」的情况用，最典型的是网络字体到货：原生 `<text>`
   * 路径的断行是渲染时拿 canvas 量出来烘进 SVG 的，字体换了就必须重量一遍；
   * `foreignObject` 路径由浏览器自己重排，重渲只是顺带把缓存换掉。
   */
  refresh() {
    ct(), this.svgCache.delete(this.index), this.paint();
  }
  exportPng(t = 2, e = this.index) {
    return lt(this.presentation, this.presentation.slides[e], t);
  }
  paint(t) {
    var l, h, u, a;
    const e = t ? this.playingGroup : null, r = this.currentLayer;
    this.releasePlayback(!!e), e && r && this.applySettled(e, r, /* @__PURE__ */ new Set()), (l = this.transition) == null || l.cancel(), this.transition = null, (h = this.cancelAuto) == null || h.call(this);
    const s = this.container.ownerDocument.createElement("div");
    s.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center", s.innerHTML = this.slideSvg(this.index);
    const i = ((u = this.currentLayer) == null ? void 0 : u.parentElement) === this.container ? this.currentLayer : this.container.firstElementChild, o = this.container.ownerDocument.defaultView;
    if ((!o || o.getComputedStyle(this.container).position === "static") && (this.container.style.position = "relative"), t && i) {
      this.container.appendChild(s), this.currentLayer = s;
      const f = it(i, s, t);
      this.transition = f, f.finished.then(() => {
        this.transition === f && (this.transition = null, this.startAutoAdvance());
      });
    } else
      this.container.innerHTML = "", this.container.appendChild(s), this.currentLayer = s, this.startAutoAdvance();
    const c = s.querySelector("svg");
    c && (c.style.display = "block", c.style.maxWidth = "none"), this.applyZoom(), this.applyVisibility(), this.applySettled(), (a = this.onAnimStep) == null || a.call(this, this.state.animationDone, this.state.animationTotal);
  }
  play(t) {
    this.releasePlayback(!0), this.applySettled(this.state.completedSteps.slice(0, -t.length));
    const e = this.currentLayer;
    if (!e) return;
    const r = $t(e, t);
    this.playing = r, this.playingGroup = t, this.applyVisibility();
    const s = () => {
      this.playing === r && (this.releasePlayback(!1), this.applyVisibility(), this.applySettled());
    };
    r.finished.then(s, (i) => {
      s(), this.reportPlaybackError(i);
    });
  }
  reportPlaybackError(t) {
    const e = this.container.ownerDocument.createEvent("CustomEvent");
    e.initCustomEvent("web-ppt-playback-error", !1, !1, t), this.container.dispatchEvent(e);
  }
  releasePlayback(t) {
    const e = this.playing;
    if (e) {
      this.playing = null, this.playingGroup = null, t && e.cancel();
      for (const r of e.animations)
        try {
          r.cancel();
        } catch {
        }
    }
  }
  /**
   * 按状态机给出的隐藏集合设置元素可见性。
   *
   * 不播动画时也要跑：静态画面取的是动画终态，退场元素同样得藏起来。
   */
  applyVisibility() {
    var r, s;
    const t = this.state.hiddenElementIds, e = new Set((r = this.playingGroup) == null ? void 0 : r.filter((i) => i.kind === "exit").map((i) => i.target));
    (s = this.currentLayer) == null || s.querySelectorAll("[data-el]").forEach((i) => {
      const o = Number(i.getAttribute("data-el"));
      i.style.visibility = t.has(o) && !e.has(o) ? "hidden" : "";
    });
  }
  /**
   * 已播完的强调和路径不会写进隐藏集。重绘清掉 fill 之后，要把终态再铺回去。
   */
  applySettled(t = this.state.completedSteps, e = this.currentLayer, r = this.state.hiddenElementIds) {
    var s;
    for (const i of t) {
      const o = Xt(i);
      if (!o || r.has(i.target)) continue;
      const l = e == null ? void 0 : e.querySelector(`[data-el="${i.target}"]`);
      if ((s = l == null ? void 0 : l.style) != null && s.setProperty)
        for (const [h, u] of Object.entries(o))
          l.style.setProperty(h.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`), u);
    }
  }
  applyZoom() {
    var r;
    const t = (r = this.currentLayer) == null ? void 0 : r.querySelector("svg");
    if (!t) return;
    const e = this.state.zoom;
    e === 1 ? (t.style.width = "100%", t.style.height = "100%") : (t.style.width = `${this.presentation.width * e}px`, t.style.height = `${this.presentation.height * e}px`);
  }
  startAutoAdvance() {
    this.cancelAuto = this.state.scheduleAutoAdvance();
  }
  destroy() {
    var t, e;
    this.container.removeEventListener("click", this.handleClick), this.container.removeEventListener("keydown", this.handleKeyDown), this.unsubscribe(), this.releasePlayback(!1), (t = this.transition) == null || t.cancel(), this.transition = null, this.currentLayer = null, (e = this.cancelAuto) == null || e.call(this), this.state.destroy(), this.container.innerHTML = "", this.svgCache.clear();
  }
}
export {
  Et as PresentationState,
  Dt as Viewer,
  Mt as autoAdvanceMs,
  Lt as foreignObjectScalesCorrectly,
  B as framesFor,
  It as groupSteps,
  Ft as hiddenBefore,
  Pt as morphPairs,
  $t as playGroup,
  Rt as playTransition,
  it as playTransitionControlled,
  Nt as resetForeignObjectProbe,
  Xt as settledDeclaration,
  _t as staticHidden,
  J as transitionFrames
};
