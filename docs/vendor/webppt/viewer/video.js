import { transitionPreferredDirection as Mt, slideToSvgFile as xt, groupSteps as kt, placeGroupChild as $t, hiddenBefore as Et, staticHidden as Pt } from "../core/core.js";
const j = 6;
function M(r) {
  return `${Math.round(r * 1e3) / 1e3}%`;
}
function ct(r, t) {
  const e = r === "vert", n = [];
  for (let a = 0; a < j; a++) {
    const o = a / j * 100, s = (a + 1) / j * 100, l = t ? s : o;
    n.push(e ? $(o, 0, l, 100) : $(0, o, 100, l));
  }
  return D(n);
}
const lt = [
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)",
  "linear-gradient(#000,#000)"
].join(", "), gt = { l: 0, t: 0, w: 100, h: 100 };
function bt(r) {
  return r.l === 0 && r.t === 0 && r.w === 100 && r.h === 100;
}
function q(r, t = gt) {
  if (bt(t)) {
    const l = r ? 50 : 0, i = `100% ${l}%, 100% ${l}%, ${l}% 100%, ${l}% 100%`;
    return {
      opacity: 1,
      maskImage: lt,
      maskRepeat: "no-repeat",
      maskPosition: "center top, center bottom, left center, right center",
      maskSize: i,
      maskOrigin: "fill-box",
      maskClip: "fill-box"
    };
  }
  const e = r ? 0.501 : 0, n = t.h * e, a = t.w * e, o = 100 - (t.t + t.h), s = 100 - (t.l + t.w);
  return {
    opacity: 1,
    maskImage: lt,
    maskRepeat: "no-repeat",
    // 位置在两帧里不变，只让尺寸插值。底边和右边钉在墨迹框上，条带向中心长。
    maskPosition: [
      `left ${M(t.l)} top ${M(t.t)}`,
      `left ${M(t.l)} bottom ${M(o)}`,
      `left ${M(t.l)} top ${M(t.t)}`,
      `right ${M(s)} top ${M(t.t)}`
    ].join(", "),
    maskSize: [
      `${M(t.w)} ${M(n)}`,
      `${M(t.w)} ${M(n)}`,
      `${M(a)} ${M(t.h)}`,
      `${M(a)} ${M(t.h)}`
    ].join(", "),
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function H(r, t = gt) {
  if (bt(t))
    return r ? "inset(0% 0% 0% 0%) fill-box" : "inset(50% 50% 50% 50%) fill-box";
  const e = r ? t.t : t.t + t.h / 2, n = r ? t.l : t.l + t.w / 2, a = r ? 100 - (t.t + t.h) : 100 - (t.t + t.h / 2), o = r ? 100 - (t.l + t.w) : 100 - (t.l + t.w / 2);
  return `inset(${M(e)} ${M(o)} ${M(a)} ${M(n)}) fill-box`;
}
function D(r, t = []) {
  return {
    opacity: 1,
    maskImage: r.map(() => "linear-gradient(#000,#000)").join(", "),
    maskRepeat: "no-repeat",
    maskPosition: r.map((e, n) => {
      var a, o;
      return `${((a = t[n]) == null ? void 0 : a.x) === "right" ? `right ${M(100 - e[2][0])}` : `left ${M(e[0][0])}`} ${((o = t[n]) == null ? void 0 : o.y) === "bottom" ? `bottom ${M(100 - e[2][1])}` : `top ${M(e[0][1])}`}`;
    }).join(", "),
    maskSize: r.map((e) => `${M(e[2][0] - e[0][0])} ${M(e[2][1] - e[0][1])}`).join(", "),
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function Q(r, t = !1) {
  const e = (o) => Math.round(o * 1e3) / 1e3, n = r.map((o) => `M${e(o[0][0])} ${e(o[0][1])} ` + o.slice(1).map(([s, l]) => `L${e(s)} ${e(l)}`).join(" ") + " Z").join(" "), a = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="#000" fill-rule="${t ? "evenodd" : "nonzero"}" d="${n}"/></svg>`;
  return {
    opacity: 1,
    maskImage: `url("data:image/svg+xml,${encodeURIComponent(a)}")`,
    maskRepeat: "no-repeat",
    maskPosition: "center",
    maskSize: "100% 100%",
    maskOrigin: "fill-box",
    maskClip: "fill-box"
  };
}
function $(r, t, e, n) {
  return [[r, t], [e, t], [e, n], [r, n]];
}
function ft(r, t) {
  const e = (r == null ? void 0 : r.endsWith("vert")) ?? !0, n = (r == null ? void 0 : r.startsWith("in")) ?? !1, a = t ? 50 : 0;
  return D(e ? n ? [$(0, 0, a, 100), $(100 - a, 0, 100, 100)] : [$(50 - a, 0, 50, 100), $(50, 0, 50 + a, 100)] : n ? [$(0, 0, 100, a), $(0, 100 - a, 100, 100)] : [$(0, 50 - a, 100, 50), $(0, 50, 100, 50 + a)]);
}
function ut(r, t) {
  const e = [];
  for (let n = 0; n < 6; n++) for (let a = 0; a < 8; a++) {
    const o = a * 12.5, s = n * (100 / 6), l = o + 12.5, i = s + 100 / 6, f = (n + a) % 2 === 1;
    r === "down" ? e.push($(
      o,
      f ? i - (t ? i - s : 0) : s,
      l,
      f ? i : s + (t ? i - s : 0)
    )) : e.push($(
      f ? l - (t ? l - o : 0) : o,
      s,
      f ? l : o + (t ? l - o : 0),
      i
    ));
  }
  return D(e);
}
function Z(r, t) {
  const e = r === "vert", n = 128, a = typeof t == "boolean" ? Number(t) : t, o = [];
  for (let s = 0; s < n; s++) {
    const l = s * 100 / n, i = (s + 1) * 100 / n, f = s * 73 % n, u = Math.min(1, Math.max(0, a * n - f)) * (i - l);
    o.push(e ? $(l, 0, l + u, 100) : $(0, l, 100, l + u));
  }
  return D(o);
}
function J(r, t) {
  const e = (r == null ? void 0 : r.startsWith("l")) ?? !1, n = (r == null ? void 0 : r.endsWith("u")) ?? !1, a = typeof t == "boolean" ? Number(t) : t, o = 8, s = [];
  for (let l = 0; l < o; l++) {
    const i = l * 100 / o, f = (l + 1) * 100 / o, u = (n ? o - l - 1 : l) / (2 * o), h = Math.min(1, Math.max(0, (a - u) / (1 - (o - 1) / (2 * o)))) * 100;
    s.push(e ? $(100 - h, i, 100, f) : $(0, i, h, f));
  }
  return D(s, e ? s.map(() => ({ x: "right" })) : []);
}
function St(r, t) {
  if (r === "circle") return Array.from({ length: 40 }, (n, a) => {
    const o = a * Math.PI / 20 - Math.PI / 2;
    return [50 + t * Math.cos(o), 50 + t * Math.sin(o)];
  });
  if (r === "diamond") return [
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
function tt(r, t, e) {
  const n = typeof e == "boolean" ? Number(e) : e;
  if (r === "plus" && t === "in") {
    const l = n * 50;
    return D([
      $(0, 0, l, l),
      $(100 - l, 0, 100, l),
      $(0, 100 - l, l, 100),
      $(100 - l, 100 - l, 100, 100)
    ], [{}, { x: "right" }, { y: "bottom" }, { x: "right", y: "bottom" }]);
  }
  const a = r === "circle" ? 72 : r === "diamond" ? 101 : 151, o = (t === "in" ? 1 - n : n) * a, s = St(r, o);
  return t === "in" ? Q([$(0, 0, 100, 100), s], !0) : Q([s]);
}
function et(r, t) {
  const e = [1, 2, 3, 4, 8].includes(Number(r)) ? Number(r) : 1, n = typeof t == "boolean" ? Number(t) : t, a = [];
  for (let o = 0; o < e; o++) {
    const s = -Math.PI / 2 + o * 2 * Math.PI / e, l = n * 2 * Math.PI / e, i = [[50, 50]];
    for (let f = 0; f <= 16; f++) {
      const u = s + l * f / 16;
      i.push([50 + 200 * Math.cos(u), 50 + 200 * Math.sin(u)]);
    }
    a.push(i);
  }
  return Q(a);
}
function rt(r, t) {
  const e = typeof r == "boolean" ? Number(r) : r, n = [];
  for (let a = 0; a < 8; a++) for (let o = 0; o < 10; o++) {
    const s = o * 10, l = a * 12.5, i = (o + 1) * 10, f = (a + 1) * 12.5;
    let u = Math.imul(a * 10 + o + t * 101, 73244475);
    u = Math.imul(u ^ u >>> 16, 73244475), u = (u ^ u >>> 16) >>> 0;
    const c = u % 17 / 17, h = s + (i - s) * c, d = l + (f - l) * (1 - c), m = (u >>> 8) % 8, g = Math.min(1, Math.max(0, e * 8 - m));
    n.push($(
      h + (s - h) * g,
      d + (l - d) * g,
      h + (i - h) * g,
      d + (f - d) * g
    ));
  }
  return D(n);
}
const At = 2147483647;
function Ct(r, t, e) {
  const n = r.querySelector("audio,video");
  if (!n) return null;
  if (!Number.isFinite(e) || e < 0)
    throw new Error(`媒体调用的起始时间无效：${e}ms`);
  let a = null, o = e, s = !1, l = !1, i, f;
  const u = new Promise((m, g) => {
    i = m, f = g;
  }), c = () => {
    l = !0, Promise.resolve(n.play()).then(i, f);
  }, h = () => {
    if (a = null, !s)
      try {
        switch (t.action) {
          case "play":
            t.fromSeconds !== void 0 && (n.currentTime = t.fromSeconds), c();
            return;
          case "resume":
            c();
            return;
          case "pause":
            n.pause();
            break;
          case "stop":
            n.pause(), n.currentTime = 0;
            break;
          case "togglePause":
            if (n.paused) {
              c();
              return;
            }
            n.pause();
            break;
        }
        i();
      } catch (m) {
        f(m);
      }
  }, d = () => {
    if (o === 0) {
      h();
      return;
    }
    const m = Math.min(o, At);
    a = setTimeout(() => {
      o -= m, d();
    }, m);
  };
  return d(), {
    finished: u,
    cancel: () => {
      s = !0, a !== null && clearTimeout(a), l && n.pause(), i();
    }
  };
}
const C = 1.15;
function Nt(r) {
  switch (r) {
    case "l":
      return [-100 * C, 0];
    case "r":
      return [100 * C, 0];
    case "u":
      return [0, -100 * C];
    case "d":
      return [0, 100 * C];
    case "lu":
      return [-100 * C, -100 * C];
    case "ru":
      return [100 * C, -100 * C];
    case "ld":
      return [-100 * C, 100 * C];
    case "rd":
      return [100 * C, 100 * C];
    default:
      return [0, 100 * C];
  }
}
function Ot(r, t, e) {
  const n = r.querySelector("svg");
  if (!n || typeof n.getBoundingClientRect != "function" || typeof t.getBoundingClientRect != "function") return null;
  const a = n.getBoundingClientRect(), o = t.getBoundingClientRect();
  if (a.width < 1 || a.height < 1 || o.width < 1 || o.height < 1) return null;
  const s = (a.left - o.right - 4) / o.width * 100, l = (a.right - o.left + 4) / o.width * 100, i = (a.top - o.bottom - 4) / o.height * 100, f = (a.bottom - o.top + 4) / o.height * 100, u = e != null && e.includes("l") ? s : e != null && e.includes("r") ? l : 0, c = e != null && e.includes("u") ? i : e != null && e.includes("d") || !e ? f : 0;
  return `translate(${u}%, ${c}%)`;
}
function L(r, t) {
  return r === t ? `scale(${r})` : `scale(${r}, ${t})`;
}
const Tt = ["maskImage", "maskRepeat", "maskPosition", "maskSize"];
function Ft(r) {
  var c, h;
  const t = (c = r.getBoundingClientRect) == null ? void 0 : c.call(r), e = (h = r.ownerDocument) == null ? void 0 : h.createRange;
  if (!t || t.width < 1 || t.height < 1 || typeof e != "function") return null;
  const n = e.call(r.ownerDocument);
  n.selectNodeContents(r);
  const a = n.getBoundingClientRect();
  if (a.width < 1 || a.height < 1) return null;
  const o = Math.min(100, Math.max(0, (a.left - t.left) / t.width * 100)), s = Math.min(100, Math.max(0, (a.top - t.top) / t.height * 100)), l = Math.min(100, Math.max(o, (a.right - t.left) / t.width * 100)), i = Math.min(100, Math.max(s, (a.bottom - t.top) / t.height * 100)), f = l - o, u = i - s;
  return f < 1 || u < 1 ? null : { l: o, t: s, w: f, h: u };
}
function It(r, t) {
  if (!t || typeof r.querySelectorAll != "function") return [];
  const e = [];
  for (const a of r.querySelectorAll("[data-p]")) {
    const o = Number(a.getAttribute("data-p"));
    Number.isInteger(o) && o >= t.start && o <= t.end && e.push(a);
  }
  if (e.length) return e;
  const n = [];
  for (const a of r.querySelectorAll("foreignObject > :first-child")) {
    const o = [...a.children].filter((s) => s.localName === "div");
    for (let s = t.start; s <= t.end && s < o.length; s++)
      n.push(o[s]);
  }
  return n;
}
function Rt(r, t, e) {
  if (r.kind !== "emphasis" && r.kind !== "motion" && r.effect === "zoom" && (r.dir === "in" || r.dir === "out")) {
    const n = Ft(t);
    if (n) {
      const a = r.dir === "in" ? {
        from: q(!1, n),
        to: q(!0, n)
      } : {
        from: { opacity: 1, clipPath: H(!1, n) },
        to: { opacity: 1, clipPath: H(!0, n) }
      }, o = r.kind === "exit" ? [a.to, a.from] : [a.from, a.to];
      return ot(o);
    }
  }
  return ot(e);
}
function ot(r) {
  const t = (e) => e.clipPath !== void 0 || e.maskSize !== void 0;
  return r.some(t) ? r.map((e) => {
    const n = {};
    e.clipPath !== void 0 && (n.clipPath = String(e.clipPath).replace(/ fill-box/g, ""));
    for (const a of Tt) e[a] !== void 0 && (n[a] = e[a]);
    return e.maskSize !== void 0 && (n.maskOrigin = "border-box", n.maskClip = "border-box"), e.offset !== void 0 && (n.offset = e.offset), n;
  }) : null;
}
function V(r, t) {
  const e = t ? 100 : 0;
  switch (r) {
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
const Yt = {
  d: { origin: "center bottom", axis: "scaleY" },
  u: { origin: "center top", axis: "scaleY" },
  l: { origin: "left center", axis: "scaleX" },
  r: { origin: "right center", axis: "scaleX" },
  lu: { origin: "left top", axis: "scale" },
  ru: { origin: "right top", axis: "scale" },
  ld: { origin: "left bottom", axis: "scale" },
  rd: { origin: "right bottom", axis: "scale" }
};
function Wt(r) {
  return (r ? Yt[r] : void 0) ?? { origin: "center", axis: "scaleX" };
}
function nt(r, t) {
  const e = Math.round(Math.sin(2.5 * Math.PI * t) * 1e4) / 1e4;
  return {
    opacity: t,
    transform: r === "horz" ? `scaleY(${e})` : `scaleX(${e})`
  };
}
function st(r) {
  var t, e, n, a, o, s, l, i, f, u;
  switch (r.effect) {
    case "appear":
      return { from: { opacity: 0 }, to: { opacity: 1 } };
    case "fly": {
      const [c, h] = Nt(r.dir);
      return {
        from: { opacity: 0, transform: `translate(${c}%, ${h}%)` },
        to: { opacity: 1, transform: "translate(0, 0)" }
      };
    }
    case "zoom":
      return r.dir === "in" ? { from: q(!1), to: q(!0) } : r.dir === "out" ? {
        from: { opacity: 1, clipPath: H(!1) },
        to: { opacity: 1, clipPath: H(!0) }
      } : {
        from: { opacity: 0, transform: L(((t = r.scale) == null ? void 0 : t.fromX) ?? 0, ((e = r.scale) == null ? void 0 : e.fromY) ?? 0) },
        to: { opacity: 1, transform: L(((n = r.scale) == null ? void 0 : n.toX) ?? 1, ((a = r.scale) == null ? void 0 : a.toY) ?? 1) }
      };
    case "grow":
      return {
        from: { opacity: 1, transform: `${L(((o = r.scale) == null ? void 0 : o.fromX) ?? 0, ((s = r.scale) == null ? void 0 : s.fromY) ?? 0)} rotate(${((l = r.rotation) == null ? void 0 : l.from) ?? 0}deg)` },
        to: { opacity: 1, transform: `${L(((i = r.scale) == null ? void 0 : i.toX) ?? 1, ((f = r.scale) == null ? void 0 : f.toY) ?? 1)} rotate(${((u = r.rotation) == null ? void 0 : u.to) ?? 90}deg)` }
      };
    case "spin":
      return { from: { opacity: 0, transform: "rotate(-180deg) scale(0.4)" }, to: { opacity: 1, transform: "rotate(0) scale(1)" } };
    case "swivel":
      return { from: nt(r.dir, 0), to: nt(r.dir, 1) };
    case "float":
      return { from: { opacity: 0, transform: "translateY(30%)" }, to: { opacity: 1, transform: "translateY(0)" } };
    case "bounce":
      return { from: { opacity: 0, transform: "translateY(-60%)" }, to: { opacity: 1, transform: "translateY(0)" } };
    case "stretch": {
      if (r.scale)
        return {
          from: { opacity: 0, transform: L(r.scale.fromX, r.scale.fromY) },
          to: { opacity: 1, transform: L(r.scale.toX, r.scale.toY) }
        };
      const { origin: c, axis: h } = Wt(r.dir);
      return {
        from: { opacity: 1, transform: `${h}(0)`, transformOrigin: c },
        to: { opacity: 1, transform: `${h}(1)`, transformOrigin: c }
      };
    }
    case "blinds":
      return {
        from: ct(r.dir, !1),
        to: ct(r.dir, !0)
      };
    case "checkerboard":
      return {
        from: ut(r.dir, !1),
        to: ut(r.dir, !0)
      };
    case "randomBar":
      return {
        from: Z(r.dir, !1),
        to: Z(r.dir, !0)
      };
    case "strips":
      return {
        from: J(r.dir, !1),
        to: J(r.dir, !0)
      };
    case "circle":
    case "diamond":
    case "plus":
      return {
        from: tt(r.effect, r.dir, !1),
        to: tt(r.effect, r.dir, !0)
      };
    case "wipe":
      return {
        from: { opacity: 1, clipPath: V(r.dir, !0) },
        to: { opacity: 1, clipPath: V(r.dir, !1) }
      };
    case "split":
      return {
        from: ft(r.dir, !1),
        to: ft(r.dir, !0)
      };
    case "wheel":
      return {
        from: et(r.dir, !1),
        to: et(r.dir, !0)
      };
    case "dissolve":
      return {
        from: rt(!1, r.target),
        to: rt(!0, r.target)
      };
    case "random":
      return st({ ...r, effect: ["fly", "wipe", "zoom"][r.target % 3], dir: "d" });
    case "fade":
    default:
      return { from: { opacity: 0 }, to: { opacity: 1 } };
  }
}
function Xt(r) {
  const t = st({ ...r, kind: "entrance" });
  return { from: t.to, to: t.from };
}
function Lt(r) {
  var t, e, n, a;
  switch (r.effect) {
    case "spin":
      return { from: { transform: "rotate(0)" }, to: { transform: "rotate(360deg)" } };
    case "grow":
      return {
        from: { transform: L(((t = r.scale) == null ? void 0 : t.fromX) ?? 1, ((e = r.scale) == null ? void 0 : e.fromY) ?? 1) },
        to: { transform: L(((n = r.scale) == null ? void 0 : n.toX) ?? 1.25, ((a = r.scale) == null ? void 0 : a.toY) ?? 1.25) }
      };
    default:
      return { from: { opacity: 1 }, to: { opacity: 0.5 } };
  }
}
function Vt(r) {
  return r.kind === "exit" ? Xt(r) : r.kind === "emphasis" ? Lt(r) : r.kind === "motion" ? { from: { opacity: 1 }, to: { opacity: 1 } } : st(r);
}
function Dt(r, t) {
  var i, f, u;
  const e = [], n = [], a = [];
  let o = !1, s = 0, l = 0;
  for (const c of t) {
    const h = c.trigger === "afterPrev" ? l + c.delayMs : c.trigger === "withPrev" ? s + c.delayMs : c.delayMs;
    s = h, l = h + c.durationMs;
    const d = r.querySelector(`[data-el="${c.target}"]`);
    if (!d) continue;
    if (c.mediaCommand) {
      const b = Ct(d, c.mediaCommand, h);
      b && a.push(b);
      continue;
    }
    c.kind === "exit" && n.push(d);
    const { from: m, to: g } = Vt(c);
    if (d.style.visibility = "visible", c.kind === "entrance" && (d.style.opacity = ""), c.effect === "fly" && (c.kind === "entrance" || c.kind === "exit")) {
      const b = Ot(r, d, c.dir);
      b && (c.kind === "entrance" ? m.transform = b : g.transform = b);
    }
    const k = (i = c.motionPath) == null ? void 0 : i.reduce((b, [p, R], N, y) => (N === 0 ? b.push(0) : b.push(b[N - 1] + Math.hypot(p - y[N - 1][0], R - y[N - 1][1])), b), []), A = (k == null ? void 0 : k[k.length - 1]) ?? 0, I = (f = c.motionPath) != null && f.length ? c.motionPath.map(([b, p], R) => ({
      transform: `translate(${b}px, ${p}px)`,
      offset: A > 0 ? k[R] / A : R / (c.motionPath.length - 1)
    })) : c.effect === "randomBar" ? Array.from({ length: 13 }, (b, p) => ({
      ...Z(c.dir, c.kind === "exit" ? 1 - p / 12 : p / 12),
      offset: p / 12
    })) : c.effect === "strips" ? Array.from({ length: 21 }, (b, p) => ({
      ...J(c.dir, c.kind === "exit" ? 1 - p / 20 : p / 20),
      offset: p / 20
    })) : c.effect === "wheel" ? Array.from({ length: 73 }, (b, p) => ({
      ...et(c.dir, c.kind === "exit" ? 1 - p / 72 : p / 72),
      offset: p / 72
    })) : c.effect === "circle" || c.effect === "diamond" || c.effect === "plus" && c.dir !== "in" ? Array.from({ length: 37 }, (b, p) => ({
      ...tt(
        c.effect,
        c.dir,
        c.kind === "exit" ? 1 - p / 36 : p / 36
      ),
      offset: p / 36
    })) : c.effect === "dissolve" ? Array.from({ length: 9 }, (b, p) => ({
      ...rt(c.kind === "exit" ? 1 - p / 8 : p / 8, c.target),
      offset: p / 8
    })) : c.effect === "swivel" && (c.kind === "entrance" || c.kind === "exit") ? Array.from({ length: 41 }, (b, p) => ({
      ...nt(c.dir, c.kind === "exit" ? 1 - p / 40 : p / 40),
      offset: p / 40
    })) : c.effect === "bounce" && c.kind === "entrance" ? [
      { opacity: 0, transform: "translateY(-60%)", offset: 0 },
      { opacity: 1, transform: "translateY(10%)", offset: 0.5 },
      { opacity: 1, transform: "translateY(-8%)", offset: 0.7 },
      { opacity: 1, transform: "translateY(3%)", offset: 0.85 },
      { opacity: 1, transform: "translateY(0)", offset: 1 }
    ] : [m, g];
    try {
      const b = (u = c.motionPath) != null && u.length || c.effect === "randomBar" || c.effect === "strips" || c.effect === "wheel" || c.effect === "circle" || c.effect === "diamond" || c.effect === "plus" || c.effect === "dissolve" || c.effect === "bounce" || c.effect === "swivel" ? "linear" : c.effect === "appear" && c.kind === "entrance" ? "steps(1, start)" : c.effect === "appear" && c.kind === "exit" ? "steps(1, end)" : "cubic-bezier(0.25, 0.46, 0.45, 0.94)", p = d.animate(I, {
        duration: c.durationMs,
        delay: h,
        // 路径动画在 PowerPoint 里是匀速，不能套入场用的缓动
        easing: b,
        fill: "both"
      });
      c.kind === "exit" && p.finished.then(() => {
        o || (d.style.visibility = "hidden");
      }).catch(() => {
      }), e.push(p);
      const R = ot(I);
      if (!R || typeof d.querySelectorAll != "function") continue;
      const N = It(d, c.paragraphRange), y = N.length ? N : d.querySelectorAll("foreignObject > :first-child");
      for (const v of y) {
        if (!(v instanceof HTMLElement)) continue;
        const P = N.length ? Rt(c, v, I) : R;
        P && e.push(v.animate(P, {
          duration: c.durationMs,
          delay: h,
          easing: b,
          fill: "both"
        }));
      }
    } catch {
      Object.assign(d.style, I[I.length - 1] ?? g), c.kind === "exit" && (d.style.visibility = "hidden");
    }
  }
  return {
    animations: e,
    cancel: () => {
      o = !0, e.forEach((c) => {
        try {
          c.finish();
        } catch {
        }
      }), a.forEach((c) => c.cancel());
      for (const c of n) c.style.visibility = "hidden";
    },
    // 等全部视觉与媒体调用落定后再报告：媒体失败不能让批次提前收尾、截断仍在播的视觉动画。
    finished: Promise.all([
      Promise.all(e.map((c) => c.finished.catch(() => {
      }))),
      Promise.allSettled(a.map((c) => c.finished))
    ]).then(([, c]) => {
      const h = c.find((d) => d.status === "rejected");
      if (h) throw h.reason;
    })
  };
}
function ht(r, t) {
  const e = r.dir ?? Mt(r.type) ?? "", n = (o, s) => `translate(${o}, ${s})`, a = () => {
    const o = {
      l: ["-100%", "0"],
      r: ["100%", "0"],
      u: ["0", "-100%"],
      d: ["0", "100%"],
      lu: ["-100%", "-100%"],
      ld: ["-100%", "100%"],
      ru: ["100%", "-100%"],
      rd: ["100%", "100%"]
    };
    return o[e] ?? o.d;
  };
  switch (r.type) {
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
      const [o, s] = a(), l = r.type === "pull" ? -1 : 1, i = (f) => f === "0" ? "0" : `${-parseFloat(f) * l}%`;
      return t ? [{ transform: n(l > 0 ? o : i(o), l > 0 ? s : i(s)) }, { transform: "translate(0,0)" }] : [{ transform: "translate(0,0)" }, { transform: n(i(o), i(s)) }];
    }
    case "cover": {
      const [o, s] = a();
      return t ? [{ transform: n(o, s) }, { transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "wipe": {
      const o = V(e || "d", !0), s = V(e || "d", !1);
      return t ? [{ clipPath: o }, { clipPath: s }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "split": {
      const o = e.startsWith("vert"), s = e.endsWith("out"), l = o ? "inset(0 50% 0 50%)" : "inset(50% 0 50% 0)", i = "inset(0 0 0 0)";
      return t ? s ? [{ clipPath: l }, { clipPath: i }] : [{ clipPath: i }, { clipPath: i }] : [{ clipPath: i }, { clipPath: l }];
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
      const o = {
        lu: "0% 0%",
        ld: "0% 100%",
        ru: "100% 0%",
        rd: "100% 100%",
        center: "50% 50%"
      }, s = o[e] ?? o.center;
      return t ? [{ clipPath: `circle(0% at ${s})` }, { clipPath: `circle(145% at ${s})` }] : [{ opacity: 1 }, { opacity: 1 }];
    }
    case "vortex": {
      const [o, s] = a(), l = e === "r" || e === "d" ? 180 : -180;
      return t ? [{ opacity: 0, transformOrigin: `${o === "0" ? "50%" : o.startsWith("-") ? "0%" : "100%"} ${s === "0" ? "50%" : s.startsWith("-") ? "0%" : "100%"}`, transform: `scale(0.2) rotate(${l}deg)` }, { opacity: 1, transform: "none" }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "honeycomb":
      return t ? [{ opacity: 0, transform: "scale(0.85) rotate(-6deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(1.1)" }];
    case "glitter":
      return t ? [{ opacity: 0, clipPath: V(e || "l", !0) }, { opacity: 1, clipPath: V(e || "l", !1) }] : [{ opacity: 1 }, { opacity: 0 }];
    case "shred": {
      const o = e === "out";
      return t ? [{ opacity: 0, transform: o ? "scale(1.35) rotate(5deg)" : "scale(0.72) rotate(-5deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: o ? "scaleY(0.72)" : "scaleY(1.2)" }];
    }
    case "flash":
      return t ? [{ opacity: 0, filter: "brightness(3)" }, { opacity: 1, filter: "brightness(1)" }] : [{ opacity: 1, filter: "brightness(1)" }, { opacity: 0, filter: "brightness(3)" }];
    case "reveal": {
      const [o, s] = a();
      return t ? [{ opacity: 0, transform: n(o, s) }, { opacity: 1, transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "wheelReverse":
      return t ? [{ opacity: 0, transform: "scale(1.3) rotate(20deg)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "doors":
      return t ? [{ clipPath: e === "horz" ? "inset(50% 0 50% 0)" : "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0 0 0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    case "window":
      return t ? [{ clipPath: e === "horz" ? "inset(0 50% 0 50%)" : "inset(50% 0 50% 0)" }, { clipPath: "inset(0 0 0 0)" }] : [{ opacity: 1 }, { opacity: 1 }];
    case "switch":
    case "flip": {
      const o = (r.type === "flip" ? -1 : 1) * (e === "r" ? -1 : 1);
      return t ? [
        { opacity: 0, transform: `perspective(1400px) rotateY(${o * -80}deg)` },
        { opacity: 1, transform: "perspective(1400px) rotateY(0)" }
      ] : [
        { opacity: 1, transform: "perspective(1400px) rotateY(0)" },
        { opacity: 0, transform: `perspective(1400px) rotateY(${o * 80}deg)` }
      ];
    }
    case "prism": {
      const o = e === "u" || e === "d", s = e === "r" || e === "d" ? -1 : 1, l = (i) => o ? `rotateX(${i}deg)` : `rotateY(${i}deg)`;
      return t ? [
        { opacity: 0, transform: `perspective(1400px) ${l(s * -70)}` },
        { opacity: 1, transform: `perspective(1400px) ${l(0)}` }
      ] : [
        { opacity: 1, transform: `perspective(1400px) ${l(0)}` },
        { opacity: 0, transform: `perspective(1400px) ${l(s * 70)}` }
      ];
    }
    case "ferris": {
      const o = e === "r" ? -1 : 1;
      return t ? [
        { opacity: 0, transform: `perspective(1400px) rotateX(${o * 70}deg)` },
        { opacity: 1, transform: "perspective(1400px) rotateX(0)" }
      ] : [
        { opacity: 1, transform: "perspective(1400px) rotateX(0)" },
        { opacity: 0, transform: `perspective(1400px) rotateX(${o * -70}deg)` }
      ];
    }
    case "gallery":
    case "conveyor": {
      const o = r.type === "conveyor" ? 25 : 12, s = e.includes("l") ? "-100%" : "100%", l = e.includes("l") ? "100%" : "-100%";
      return t ? [
        { transform: `perspective(1600px) translateX(${s}) rotateY(${o}deg)` },
        { transform: "perspective(1600px) translateX(0) rotateY(0)" }
      ] : [
        { transform: "perspective(1600px) translateX(0) rotateY(0)" },
        { transform: `perspective(1600px) translateX(${l}) rotateY(${-o}deg)` }
      ];
    }
    case "pan": {
      const [o, s] = a(), l = (i) => i === "0" ? "0" : `${-parseFloat(i)}%`;
      return t ? [{ transform: n(o, s) }, { transform: "translate(0,0)" }] : [{ transform: "translate(0,0)" }, { transform: n(l(o), l(s)) }];
    }
    case "flythrough":
      return t ? [{ opacity: 0, transform: `perspective(1000px) scale(${e === "out" ? 2.2 : 0.15})` }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `perspective(1000px) scale(${e === "out" ? 0.15 : 2.2})` }];
    case "warp": {
      const o = e === "out";
      return t ? [{ opacity: 0, transform: o ? "skewX(-18deg) scale(1.35)" : "skewX(18deg) scale(0.65)" }, { opacity: 1, transform: "none" }] : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: o ? "skewX(18deg) scale(0.65)" : "skewX(-18deg) scale(1.35)" }];
    }
    case "blinds":
    case "checker":
    case "randomBar": {
      const o = V(e, !0);
      return t ? [{ opacity: 0.2, clipPath: o }, { opacity: 1, clipPath: V(e, !1) }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "comb":
      return t ? [{ opacity: 0, transform: e === "vert" ? "translateY(-100%)" : "translateX(-100%)" }, { opacity: 1, transform: "translate(0,0)" }] : [{ opacity: 1 }, { opacity: 0 }];
    case "strips": {
      const o = {
        lu: "0% 0%",
        ld: "0% 100%",
        ru: "100% 0%",
        rd: "100% 100%"
      }, s = o[e] ?? o.rd;
      return t ? [{ opacity: 0, clipPath: `circle(0% at ${s})` }, { opacity: 1, clipPath: `circle(145% at ${s})` }] : [{ opacity: 1 }, { opacity: 0 }];
    }
    case "newsflash":
    case "dissolve":
    case "fade":
    case "morph":
    default:
      return t ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }];
  }
}
function zt(r, t) {
  const e = /* @__PURE__ */ new Map();
  r.querySelectorAll("[data-el]").forEach((a) => {
    const o = a.getBoundingClientRect();
    (o.width > 0 || o.height > 0) && e.set(a.getAttribute("data-el") ?? "", o);
  });
  const n = [];
  return t.querySelectorAll("[data-el]").forEach((a) => {
    const o = e.get(a.getAttribute("data-el") ?? "");
    if (!o) return;
    const s = a.getBoundingClientRect();
    s.width <= 0 && s.height <= 0 || n.push({ node: a, from: o, to: s });
  }), n;
}
const G = "http://www.w3.org/2000/svg", dt = ["transform", "transform-origin", "transform-box", "opacity", "clip-path", "filter", "visibility"];
class Bt {
  constructor(t, e) {
    this.pres = t, this.showComments = e, this.host = document.createElement("div"), this.svg = document.createElementNS(G, "svg"), this.animations = [], this.host.style.cssText = `position:fixed;left:-20000px;top:0;width:${t.width}px;height:${t.height}px;pointer-events:none;contain:layout style;`, this.host.setAttribute("aria-hidden", "true"), this.svg.setAttribute("xmlns", G), this.svg.setAttribute("width", String(t.width)), this.svg.setAttribute("height", String(t.height)), this.svg.setAttribute("viewBox", `0 0 ${t.width} ${t.height}`), this.host.append(this.svg), document.body.append(this.host);
  }
  async page(t, e) {
    const n = await xt(this.pres, t, e, { showComments: this.showComments });
    if (/<image\b[^>]*\bhref="(?:blob:|https?:)/.test(n) || /@font-face\{[^}]*src:url\(['"]?(?:blob:|https?:)/.test(n)) throw new Error("视频资源内联失败");
    const a = new DOMParser().parseFromString(n, "image/svg+xml");
    if (a.querySelector("parsererror")) throw new Error("视频页面 SVG 无效");
    const o = document.createElementNS(G, "g");
    return o.style.transformBox = "fill-box", o.style.transformOrigin = "center", o.append(document.importNode(a.documentElement, !0)), this.svg.append(o), o;
  }
  pause(t) {
    for (const e of t)
      e.pause(), e.currentTime = 0;
    return this.animations.push(...t), [...t];
  }
  group(t, e) {
    return this.pause(Dt(t, e).animations);
  }
  transition(t, e, n) {
    const a = n.transition;
    if (!a || a.type === "none") return [];
    const o = [], s = (l, i) => {
      const f = l.animate(i, { duration: a.durationMs, easing: "ease-in-out", fill: "both" });
      f.finished.catch(() => {
      }), o.push(f);
    };
    if (a.type === "morph") {
      const l = zt(t, e), i = new Set(l.map((f) => f.node.getAttribute("data-el")));
      for (const { node: f, from: u, to: c } of l) s(f, [{ transformOrigin: "left top", transform: `translate(${u.left - c.left}px,${u.top - c.top}px) scale(${c.width ? u.width / c.width : 1},${c.height ? u.height / c.height : 1})` }, { transformOrigin: "left top", transform: "none" }]);
      for (const f of t.querySelectorAll("[data-el]")) s(f, i.has(f.getAttribute("data-el")) ? [{ opacity: 0 }, { opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }]);
      for (const f of e.querySelectorAll("[data-el]")) i.has(f.getAttribute("data-el")) || s(f, [{ opacity: 0 }, { opacity: 1 }]);
    } else
      s(t, ht(a, !1)), s(e, ht(a, !0));
    return this.pause(o);
  }
  settle(t) {
    for (const e of t) {
      const n = e.effect, a = n == null ? void 0 : n.target;
      if (n && a) {
        e.currentTime = Number(n.getComputedTiming().endTime);
        const o = getComputedStyle(a);
        for (const s of dt) a.style.setProperty(s, o.getPropertyValue(s));
      }
      e.cancel(), this.animations.splice(this.animations.indexOf(e), 1);
    }
  }
  async draw(t, e, n) {
    const a = this.svg.cloneNode(!0), o = [this.svg, ...this.svg.querySelectorAll("*")], s = [a, ...a.querySelectorAll("*")], l = new Set(this.animations.map((f) => {
      var u;
      return (u = f.effect) == null ? void 0 : u.target;
    }));
    for (let f = 0; f < o.length; f++) if (l.has(o[f])) {
      const u = getComputedStyle(o[f]);
      for (const c of dt) s[f].style.setProperty(c, u.getPropertyValue(c));
    }
    const i = new Image();
    i.decoding = "sync", await new Promise((f, u) => {
      i.onload = () => f(), i.onerror = () => u(new Error("视频帧 SVG 渲染失败")), i.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(a))}`;
    }), t.fillStyle = "#fff", t.fillRect(0, 0, e, n), t.drawImage(i, 0, 0, e, n);
  }
  dispose() {
    for (const t of this.animations) t.cancel();
    this.animations.length = 0, this.host.remove();
  }
}
const vt = (r) => new TextEncoder().encode(r);
function at(r, t = Math.max(1, Math.ceil(Math.log2(r + 1) / 8))) {
  const e = new Uint8Array(t);
  for (let n = t - 1; n >= 0; n--)
    e[n] = r % 256, r = Math.floor(r / 256);
  return e;
}
function _t(r) {
  const t = new Uint8Array(r.reduce((n, a) => n + a.length, 0));
  let e = 0;
  for (const n of r)
    t.set(n, e), e += n.length;
  return t;
}
function E(r, ...t) {
  const e = t.reduce((o, s) => o + s.length, 0);
  let n = 1;
  for (; e >= 2 ** (7 * n) - 1; ) n++;
  const a = at(e, n);
  return a[0] |= 1 << 8 - n, _t([at(r), a, ...t]);
}
const x = (r, t) => E(r, at(t)), B = (r, t) => E(r, vt(t));
function mt(r, t) {
  const e = new Uint8Array(8);
  return new DataView(e.buffer).setFloat64(0, t), E(r, e);
}
class qt {
  constructor(t, e, n, a, o) {
    if (this.width = t, this.height = e, this.fps = n, this.codec = a, this.audio = o, this.clusters = [], this.last = -1, this.audioLast = -1, this.audioBlocks = 0, this.duration = 0, this.length = 0, this.closed = !1, ![t, e, n].every((s) => Number.isInteger(s) && s > 0) || t * e > 8388608 || n > 60) throw new Error("WebM 视频尺寸或帧率无效");
    if (o && (!Number.isInteger(o.sampleRate) || o.sampleRate <= 0)) throw new Error("WebM 音频采样率无效");
  }
  clusterFor(t, e) {
    let n = this.clusters[this.clusters.length - 1];
    return (!n || t - n.time > 32767 || e && t - n.time >= 1e3 || t - n.time >= 3e4) && (n = { time: t, blocks: [], key: e }, this.clusters.push(n)), n;
  }
  addFrame(t, e, n, a) {
    if (this.closed) throw new Error("WebM 已结束");
    if (!Number.isSafeInteger(e) || e <= this.last || e < 0 || !Number.isSafeInteger(n) || n <= 0) throw new Error("WebM 帧时间必须严格递增");
    if (!t.length || t.length > 32 * 1024 * 1024 || this.length + t.length > 256 * 1024 * 1024) throw new Error("WebM 视频超过导出大小限制");
    if (!this.clusters.length && !a) throw new Error("WebM 第一帧必须是关键帧");
    const o = Math.round(e / 1e3), s = this.clusterFor(o, a), l = new Uint8Array(4);
    l[0] = 129, new DataView(l.buffer).setInt16(1, o - s.time), l[3] = a ? 128 : 0, s.blocks.push(E(163, l, t)), this.length += t.length, this.last = e, this.duration = (e + n) / 1e3;
  }
  /** Opus 音频块：时间戳毫秒、流内严格递增；与视频块按簇交错 */
  addAudio(t, e) {
    if (this.closed) throw new Error("WebM 已结束");
    if (!this.audio) throw new Error("WebM 未声明音频轨");
    if (!Number.isSafeInteger(e) || e < 0 || e <= this.audioLast) throw new Error("WebM 音频时间必须严格递增");
    if (!t.length || t.length > 1024 * 1024) throw new Error("WebM 音频块为空或超限");
    const n = Math.round(e), a = this.clusterFor(n, !1), o = new Uint8Array(4);
    o[0] = 130, new DataView(o.buffer).setInt16(1, Math.max(0, n - a.time)), a.blocks.push(E(163, o, t)), this.audioBlocks++, this.audioLast = e, this.length += t.length;
  }
  finish() {
    if (this.closed) throw new Error("WebM 已结束");
    if (!this.clusters.length) throw new Error("没有可导出的视频帧");
    if (this.audio && !this.audioBlocks) throw new Error("声明了音频轨但没有音频块");
    this.closed = !0;
    const t = E(440786851, x(17030, 1), x(17143, 1), x(17138, 4), x(17139, 8), B(17026, "webm"), x(17031, 4), x(17029, 2)), e = E(357149030, x(2807729, 1e6), mt(17545, this.duration), B(19840, "Web-PPT"), B(22337, "Web-PPT")), a = [E(174, x(215, 1), x(29637, 1), x(131, 1), x(156, 0), B(134, `V_${this.codec}`), x(2352003, Math.round(1e9 / this.fps)), E(224, x(176, this.width), x(186, this.height)))];
    if (this.audio) {
      const u = new Uint8Array(19);
      u.set(vt("OpusHead"), 0), u[8] = 1, u[9] = this.audio.channels, new DataView(u.buffer).setUint16(10, 312, !0), new DataView(u.buffer).setUint32(12, this.audio.sampleRate, !0), a.push(E(
        174,
        x(215, 2),
        x(29637, 2),
        x(131, 2),
        x(156, 0),
        B(134, "A_OPUS"),
        E(25506, u),
        E(225, mt(181, this.audio.sampleRate), x(159, this.audio.channels))
      ));
    }
    const o = E(374648427, ...a), s = [], l = [];
    let i = e.length + o.length;
    for (const u of this.clusters) {
      const c = E(524531317, x(231, u.time), ...u.blocks);
      u.key && l.push(E(187, x(179, u.time), E(183, x(247, 1), x(241, i)))), s.push(c), i += c.length;
    }
    const f = E(408125543, e, o, ...s, E(475249515, ...l));
    return this.clusters.length = 0, new Blob([t.buffer, f.buffer], { type: "video/webm" });
  }
}
function _(r) {
  let t = 0, e = 0, n = 0;
  for (const a of r) {
    if (![a.delayMs, a.durationMs].every((o) => Number.isFinite(o) && o >= 0 && o <= 36e5)) throw new Error("视频动画时长无效");
    t = (a.trigger === "afterPrev" ? e : a.trigger === "withPrev" ? t : 0) + a.delayMs, e = t + a.durationMs, n = Math.max(n, e);
  }
  return n;
}
function Ht(r, t) {
  const e = t.fps ?? 24, n = t.scale ?? 1, a = t.slideDurationMs ?? 3e3, o = t.clickDelayMs ?? 700;
  if (!Number.isInteger(e) || e < 1 || e > 60 || !Number.isFinite(n) || n <= 0 || ![a, o].every((h) => Number.isFinite(h) && h >= 0 && h <= 36e5)) throw new Error("视频帧率、倍率或停留时长无效");
  const s = Math.round(r.width * n), l = Math.round(r.height * n);
  if (![s, l].every((h) => Number.isFinite(h) && h > 0 && h <= 4096) || s * l > 8388608) throw new Error("视频尺寸需要在 4096 边长、800 万像素以内");
  const i = t.bitrate ?? Math.max(1e6, s * l * e * 0.15);
  if (!Number.isFinite(i) || i < 1e4 || i > 1e8) throw new Error("视频码率无效");
  const f = (h) => Math.max(1, Math.ceil(h * e / 1e3)), u = r.slides.flatMap((h, d) => {
    var A, I, b;
    if (t.skipHidden && h.hidden) return [];
    const m = t.animations === !1 ? [] : kt(h.animations), g = t.transitions !== !1 && ((A = h.transition) == null ? void 0 : A.type) !== "none" ? ((I = h.transition) == null ? void 0 : I.durationMs) ?? 0 : 0, k = ((b = h.transition) == null ? void 0 : b.advanceAfterMs) ?? a;
    if (![k, g].every((p) => Number.isFinite(p) && p >= 0 && p <= 36e5)) throw new Error("视频页面时长无效");
    return [{ slide: h, slideNumber: d + 1, groups: m, transition: g, hold: k, click: o }];
  }), c = u.reduce((h, d, m) => h + (m && d.transition ? f(d.transition) : 0) + f(d.hold) + d.groups.reduce((g, k) => g + (o ? f(o) : 0) + f(_(k)), 0), 0);
  if (!u.length) throw new Error("没有可导出的视频页面");
  if (c / e > 3600 || c > 108e3) throw new Error("视频不能超过一小时或 108000 帧");
  return { width: s, height: l, fps: e, bitrate: Math.round(i), pages: u, total: c, frames: f };
}
function Ut(r, t, e) {
  const n = r.samples.length / r.channels;
  if (!Number.isInteger(n)) return null;
  let a = t;
  if (r.loop) a %= n;
  else if (t < 0 || t >= n) return null;
  const o = Math.floor(a), s = a - o, l = Math.min(o + 1, n - 1), i = r.samples[o * r.channels + e], f = r.samples[l * r.channels + e];
  return i + (f - i) * s;
}
function jt(r, t, e = {}) {
  const n = e.sampleRate ?? 48e3, a = e.channels ?? 2;
  if (!Number.isFinite(t) || t < 0) throw new Error("混音总时长必须是非负毫秒");
  if (!Number.isInteger(n) || n <= 0) throw new Error("输出采样率必须是正整数");
  if (r.some((i) => !Number.isInteger(i.sampleRate) || i.sampleRate <= 0)) throw new Error("片段采样率必须是正整数");
  if (r.some((i) => i.channels !== 1 && i.channels !== 2)) throw new Error("片段声道数只支持单声道或立体声");
  if (r.some((i) => !Number.isFinite(i.startMs) || i.startMs < 0)) throw new Error("片段起始时间必须是非负毫秒");
  if (r.some((i) => i.samples.length % i.channels !== 0)) throw new Error("片段样本长度必须是声道数的整数倍");
  const o = r.map((i) => i.volume ?? 1);
  if (o.some((i) => !Number.isFinite(i) || i < 0 || i > 1)) throw new Error("片段音量必须在 [0,1]");
  const s = Math.ceil(t / 1e3 * n), l = new Float32Array(s * a);
  for (const [i, f] of r.entries()) {
    if (f.endMs !== void 0 && f.endMs < f.startMs) throw new Error("片段截止时间早于起始时间");
    const u = f.endMs ?? Number.POSITIVE_INFINITY, c = Math.floor(f.startMs / 1e3 * n);
    for (let h = Math.max(c, 0); h < s && !(h / n * 1e3 >= u); h++) {
      const d = (h - f.startMs / 1e3 * n) * f.sampleRate / n;
      for (let m = 0; m < a; m++) {
        const g = Ut(f, d, f.channels === 1 ? 0 : m);
        g !== null && (l[h * a + m] += g * o[i]);
      }
    }
  }
  for (let i = 0; i < l.length; i++) l[i] = Math.max(-1, Math.min(1, l[i]));
  return l;
}
const Gt = 5e3, Kt = 500, Qt = (r) => new Promise((t) => {
  const e = (s) => {
    clearTimeout(o), r.removeEventListener("loadeddata", n), r.removeEventListener("error", a), t(s && Number.isFinite(r.duration) && r.duration > 0);
  }, n = () => e(!0), a = () => e(!1), o = setTimeout(a, Gt);
  r.addEventListener("loadeddata", n), r.addEventListener("error", a), r.readyState >= 2 && e(!0);
}), Zt = (r, t) => new Promise((e) => {
  const n = (s) => {
    clearTimeout(o), r.removeEventListener("seeked", a), e(s);
  }, a = () => n(!0), o = setTimeout(() => n(!1), Kt);
  r.addEventListener("seeked", a), r.currentTime = t;
}), K = (r) => {
  r.removeAttribute("src"), r.load();
}, pt = (r) => {
  const t = r.x + r.w / 2, e = r.y + r.h / 2, n = new DOMMatrix().translateSelf(t, e);
  return r.rot && n.rotateSelf(r.rot), n.translateSelf(-t, -e).translateSelf(r.x, r.y);
}, yt = (r) => !r.flipH && !r.flipV ? new DOMMatrix() : new DOMMatrix().translateSelf(r.w / 2, r.h / 2).scaleSelf(r.flipH ? -1 : 1, r.flipV ? -1 : 1).translateSelf(-r.w / 2, -r.h / 2);
class Jt {
  constructor(t) {
    this.warn = t, this.videos = /* @__PURE__ */ new Map(), this.disposed = !1;
  }
  /** 预加载页面的视频媒体（每页一个列表；须在导出循环前调用） */
  async load(t, e, n, a) {
    const o = [], s = (f, u, c) => {
      for (const h of f) {
        const d = c ? $t(c, h) : h;
        if (d.kind === "group") {
          const m = [...u, pt(d), yt(d)];
          s(d.children, m, d);
        } else if (d.kind === "image" && d.media && d.media.kind === "video" && d.media.src) {
          const m = d.media.playback;
          if (!m) continue;
          const g = a.length ? a[Math.min(m.clickGroup, a.length - 1)] : 0, k = document.createElement("video");
          k.muted = !0, k.preload = "auto", k.playsInline = !0, k.src = d.media.src, o.push({
            el: k,
            x: d.x,
            y: d.y,
            w: d.w,
            h: d.h,
            rot: d.rot,
            flipH: d.flipH,
            flipV: d.flipV,
            crop: d.crop,
            alpha: d.alpha,
            clipPath: d.clipPath,
            filter: d.filter,
            chain: u,
            startMs: g,
            durationS: Number.isFinite(k.duration) ? k.duration : 0,
            loop: m.loop,
            name: d.name ?? "",
            frameWarned: !1
          });
        }
      }
    };
    if (s(e.elements, []), !o.length) return;
    const l = await Promise.all(o.map((f) => Qt(f.el)));
    if (this.disposed) {
      for (const f of o) K(f.el);
      return;
    }
    const i = o.filter((f, u) => {
      var c;
      return l[u] ? (f.durationS = f.el.duration, !0) : (K(f.el), (c = this.warn) == null || c.call(this, "video-overlay-unavailable", { slideNumber: n, elementName: f.name }), !1);
    });
    this.videos.set(n, i);
  }
  /**
   * 把当前时间轴的视频帧画到画布。在 SVG 光栅化之后调用，叠加在海报帧之上；
   * scaleX/scaleY 把幻灯片坐标换算到导出画布坐标。
   */
  async draw(t, e, n, a, o) {
    var l;
    const s = this.videos.get(e);
    if (s)
      for (const i of s) {
        const f = (n - i.startMs) / 1e3;
        if (f < 0) continue;
        const u = i.loop ? i.durationS > 0 ? f % i.durationS : 0 : Math.min(f, i.durationS);
        if ((!(Math.abs(i.el.currentTime - u) <= 1 / 30 || await Zt(i.el, u)) || i.el.readyState < 2) && (i.frameWarned || (i.frameWarned = !0, (l = this.warn) == null || l.call(this, "video-overlay-frame-unavailable", { slideNumber: e, elementName: i.name })), i.el.readyState < 2))
          continue;
        t.save(), t.setTransform(new DOMMatrix().scaleSelf(a, o));
        for (const m of i.chain) t.transform(m.a, m.b, m.c, m.d, m.e, m.f);
        t.transform(...(() => {
          const m = pt(i);
          return [m.a, m.b, m.c, m.d, m.e, m.f];
        })());
        const h = yt(i);
        t.transform(h.a, h.b, h.c, h.d, h.e, h.f), i.clipPath && t.clip(new Path2D(i.clipPath)), i.alpha !== void 0 && (t.globalAlpha *= Math.max(0, Math.min(1, i.alpha))), i.filter && (t.filter = i.filter);
        const d = i.el;
        if (i.crop && (i.crop.l || i.crop.t || i.crop.r || i.crop.b)) {
          const m = d.videoWidth, g = d.videoHeight;
          t.drawImage(
            d,
            i.crop.l * m,
            i.crop.t * g,
            Math.max(1, (1 - i.crop.l - i.crop.r) * m),
            Math.max(1, (1 - i.crop.t - i.crop.b) * g),
            0,
            0,
            i.w,
            i.h
          );
        } else
          t.drawImage(d, 0, 0, i.w, i.h);
        t.restore();
      }
  }
  dispose() {
    this.disposed = !0;
    for (const t of this.videos.values()) for (const e of t) K(e.el);
    this.videos.clear();
  }
}
const wt = (r) => {
  const t = [], e = (n) => {
    for (const a of n)
      a.kind === "image" && a.media && a.media.playback && a.media.src ? t.push(a) : a.kind === "group" && e(a.children);
  };
  return e(r), t;
};
async function te(r, t) {
  const e = await fetch(r, { signal: t });
  if (!e.ok) throw new Error(`音频媒体读取失败：HTTP ${e.status}`);
  const n = await e.arrayBuffer(), a = globalThis.OfflineAudioContext;
  if (!a) throw new Error("当前浏览器不支持音频解码（OfflineAudioContext 缺失）");
  const o = await new a(1, 1, 48e3).decodeAudioData(n), s = new Float32Array(o.length * o.numberOfChannels);
  for (let l = 0; l < o.numberOfChannels; l++)
    s.set(o.getChannelData(l), l * o.length);
  return { samples: s, sampleRate: o.sampleRate, channels: Math.min(2, o.numberOfChannels) };
}
async function ee(r, t, e, n, a) {
  const o = { codec: "opus", sampleRate: e, numberOfChannels: n, bitrate: 96e3 };
  if (typeof AudioEncoder > "u" || typeof AudioData > "u" || !(await AudioEncoder.isConfigSupported(o)).supported) throw new Error("当前浏览器不支持 Opus 音频编码");
  let s;
  const l = new AudioEncoder({ output: (f) => {
    try {
      const u = new Uint8Array(f.byteLength);
      f.copyTo(u), r.addAudio(u, Math.round(f.timestamp / 1e3));
    } catch (u) {
      s = u;
    }
  }, error: (f) => {
    s = f;
  } }), i = () => {
    l.state !== "closed" && l.close();
  };
  a == null || a.addEventListener("abort", i, { once: !0 });
  try {
    l.configure(o);
    const f = Math.round(e * 0.02);
    for (let u = 0; u * n < t.length; u += f) {
      if (a != null && a.aborted) throw new DOMException("视频导出已取消", "AbortError");
      if (s) throw s;
      const c = Math.min(f, Math.floor(t.length / n) - u);
      if (c <= 0) break;
      const h = new AudioData({
        format: "f32",
        sampleRate: e,
        numberOfFrames: c,
        numberOfChannels: n,
        timestamp: Math.round(u / e * 1e6),
        data: new Float32Array(t.subarray(u * n, (u + c) * n))
      });
      try {
        l.encode(h);
      } finally {
        h.close();
      }
      l.encodeQueueSize >= 16 && await new Promise((d) => {
        const m = () => {
          (l.encodeQueueSize < 16 || s) && (l.removeEventListener("dequeue", m), d());
        };
        l.addEventListener("dequeue", m), m();
      });
    }
    if (await l.flush(), s) throw s;
  } finally {
    a == null || a.removeEventListener("abort", i), i();
  }
}
async function oe(r, t = {}) {
  var p, R, N;
  const e = Ht(r, t), n = () => {
    var y;
    if ((y = t.signal) != null && y.aborted) throw new DOMException("视频导出已取消", "AbortError");
  };
  if (n(), typeof VideoEncoder > "u" || typeof VideoFrame > "u" || typeof document > "u") throw new Error("当前浏览器不支持 WebCodecs 视频编码，请使用支持的 HTTPS 或本机浏览器");
  const a = (y) => y.some((v) => v.kind === "image" && !!v.media || v.kind === "group" && a(v.children));
  if (!t.mediaPosters && e.pages.some((y) => a(y.slide.elements))) throw new Error("文稿含内嵌音视频，导出时可能以静态封面呈现（含 audio / videoOverlay 未覆盖或失败的媒体）；请设置 mediaPosters: true 显式允许");
  let o, s = "VP9";
  for (const y of ["vp09.00.10.08", "vp8"]) {
    const v = { codec: y, width: e.width, height: e.height, framerate: e.fps, bitrate: e.bitrate, latencyMode: "realtime" };
    if ((await VideoEncoder.isConfigSupported(v)).supported) {
      o = v, s = y === "vp8" ? "VP8" : "VP9";
      break;
    }
  }
  if (!o) throw new Error("当前浏览器没有支持此尺寸的 VP8/VP9 视频编码器");
  n();
  const l = !!t.audio && e.pages.some((y) => wt(y.slide.elements).length > 0), i = new qt(e.width, e.height, e.fps, s, l ? { sampleRate: 48e3, channels: 2 } : void 0);
  let f, u = 0;
  const c = new VideoEncoder({
    output: (y) => {
      try {
        const v = new Uint8Array(y.byteLength);
        y.copyTo(v), i.addFrame(v, y.timestamp, y.duration ?? Math.round(1e6 / e.fps), y.type === "key");
      } catch (v) {
        f = v;
      }
    },
    error: (y) => {
      f = y;
    }
  }), h = document.createElement("canvas");
  h.width = e.width, h.height = e.height;
  const d = h.getContext("2d");
  if (!d)
    throw c.close(), new Error("无法获取视频画布");
  const m = new Bt(r, !!t.showComments), g = t.videoOverlay ? new Jt(t.onWarning) : null, k = () => {
    c.state !== "closed" && c.close();
  };
  (p = t.signal) == null || p.addEventListener("abort", k, { once: !0 });
  const A = () => {
    if (n(), f) throw f;
  }, I = async () => {
    c.encodeQueueSize < 8 || (await new Promise((y, v) => {
      var O;
      const P = () => {
        var T;
        clearTimeout(W), c.removeEventListener("dequeue", w), (T = t.signal) == null || T.removeEventListener("abort", Y);
      }, w = () => {
        (c.encodeQueueSize < 8 || f) && (P(), y());
      }, Y = () => {
        P(), v(new DOMException("视频导出已取消", "AbortError"));
      }, W = setTimeout(() => {
        P(), v(new Error("视频编码器等待超时"));
      }, 3e4);
      c.addEventListener("dequeue", w), (O = t.signal) == null || O.addEventListener("abort", Y, { once: !0 }), w();
    }), A());
  }, b = async (y, v, P = [], w) => {
    var W;
    const Y = e.frames(y);
    for (let O = 0; O < Y; O++) {
      A();
      for (const X of P) X.currentTime = y * O / Y;
      await m.draw(d, e.width, e.height), A(), g && await g.draw(d, v, (w ?? 0) + y * O / Y, e.width / r.width, e.height / r.height), await I();
      const T = Math.round(u * 1e6 / e.fps), F = Math.round((u + 1) * 1e6 / e.fps), S = new VideoFrame(h, { timestamp: T, duration: F - T });
      try {
        c.encode(S, { keyFrame: u % (e.fps * 2) === 0 });
      } finally {
        S.close();
      }
      u++, (W = t.onProgress) == null || W.call(t, { completed: u, total: e.total, slideNumber: v });
    }
    m.settle(P), await Promise.resolve();
  };
  try {
    const y = [];
    c.configure(o);
    let v, P = 0;
    for (const w of e.pages) {
      A();
      const Y = w.groups.length ? Et(w.groups, 0) : Pt(w.slide), W = v && w.transition ? w.transition : 0, O = await m.page(w.slide, [...Y]);
      A();
      const T = [];
      {
        let S = P + W;
        for (const X of w.groups)
          T.push(S), S += (w.click ?? 0) + _(X);
      }
      g && await g.load(r, w.slide, w.slideNumber, T);
      let F = P;
      if (W && (await b(w.transition, w.slideNumber, m.transition(v, O, w.slide), F), F += W), v == null || v.remove(), t.audio)
        for (const S of wt(w.slide.elements)) {
          const X = S.media.playback, it = T.length ? T[Math.min(X.clickGroup, T.length - 1)] : P + W;
          let z;
          try {
            z = await te(S.media.src, t.signal);
          } catch (U) {
            if (!(U instanceof DOMException && U.name === "AbortError") && S.media.kind === "video") {
              (R = t.onWarning) == null || R.call(t, "video-audio-decode-failed", { slideNumber: w.slideNumber, elementName: S.name ?? "" });
              continue;
            }
            throw U;
          }
          A(), y.push({
            samples: z.samples,
            sampleRate: z.sampleRate,
            channels: z.channels,
            startMs: it,
            loop: X.loop,
            volume: X.volume,
            endMs: X.loop ? void 0 : it + z.samples.length / z.channels / z.sampleRate * 1e3
          });
        }
      for (const S of w.groups)
        w.click && (await b(w.click, w.slideNumber, void 0, F), F += w.click), await b(_(S), w.slideNumber, m.group(O, S), F), F += _(S);
      await b(w.hold, w.slideNumber, void 0, F), F += w.hold, P = F, v = O;
    }
    if (await c.flush(), A(), t.audio && y.length) {
      const w = Math.round(u / e.fps * 1e3), Y = jt(y, w, { sampleRate: 48e3, channels: 2 });
      await ee(i, Y, 48e3, 2, t.signal);
    }
    return i.finish();
  } finally {
    (N = t.signal) == null || N.removeEventListener("abort", k), k(), g == null || g.dispose(), m.dispose(), h.width = h.height = 0;
  }
}
export {
  oe as presentationToVideo,
  Ht as videoPlan
};
