const fe = /[、。，．：；！？」』】〕）》〉｝］”]/, Kt = /[「『【〔（《〈｛［“]/, U = (t) => Kt.test(t);
function D(t) {
  return fe.test(t) || Kt.test(t) ? 0.5 : 0;
}
function Mt(t) {
  let e = 0;
  for (const r of t) e += D(r);
  return e;
}
function Qt(t, e) {
  const r = t.length, s = new Array(r).fill(0), n = new Array(r).fill(0);
  let o = 0;
  for (let i = 0; i < r; i++) {
    const c = D(t[i]);
    !c || !(e || i === 0 && U(t[i]) || i === r - 1 && !U(t[i]) || i > 0 && D(t[i - 1]) > 0) || (n[i] = c, o += c, U(t[i]) ? s[i] -= c : i + 1 < r && (s[i + 1] -= c));
  }
  return { dx: s, amount: n, total: o };
}
function de(t) {
  const e = t.codePointAt(0) ?? 0;
  return e >= 4352 && e <= 4447 || e >= 11904 && e <= 12350 || e >= 12353 && e <= 13311 || e >= 13312 && e <= 19903 || e >= 19968 && e <= 40959 || e >= 40960 && e <= 42191 || e >= 44032 && e <= 55203 || e >= 63744 && e <= 64255 || e >= 65072 && e <= 65135 || e >= 65280 && e <= 65376 || e >= 65504 && e <= 65510 || e >= 131072 && e <= 262141;
}
const x = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), a = (t) => Number.isFinite(t) ? String(Math.round(t * 100) / 100) : "0";
function tt(t) {
  return t.replace(/['"\\<>&\u0000-\u001f\u007f]/gu, (e) => `\\${e.codePointAt(0).toString(16)} `);
}
const pe = "'Cambria Math','Latin Modern Math','STIX Two Math','Times New Roman',serif", kt = {
  "̀": "ˋ",
  "́": "ˊ",
  "̂": "ˆ",
  "̃": "˜",
  "̆": "˘",
  "̇": "˙",
  "̈": "¨",
  "̊": "˚",
  "̌": "ˇ",
  "⃖": "←",
  "⃗": "→",
  "⃡": "↔",
  "⃛": "⋯",
  "⃜": "⋯"
}, X = /* @__PURE__ */ new Set(["̅", "̄", "‾", "¯", "̲", "̳", "_"]), $e = /* @__PURE__ */ new Set(["⏞", "⏟", "⎴", "⎵", "⏜", "⏝"]), pt = 0.72, me = 0.5, R = (t, e) => ({ ...t, size: Math.max(t.size * e, t.size * me) });
function B() {
  return { w: 0, h: 0, d: 0, draw: () => "" };
}
const et = 0.72, nt = 0.22;
function Jt(t, e, r, s, n, o, i = "") {
  const c = `font-family:${pe};font-size:${a(e.size)}px;` + (r ? "font-style:italic;" : "") + (s ? "font-weight:700;" : "");
  return i ? `<text x="0" y="0" style="${c}" fill="${e.color}" xml:space="preserve" transform="${i}">${x(t)}</text>` : `<text x="${a(n)}" y="${a(o)}" style="${c}" fill="${e.color}" xml:space="preserve">${x(t)}</text>`;
}
function F(t, e, r, s) {
  return {
    w: e.measure(t, e.size, r, s),
    h: e.size * et,
    d: e.size * nt,
    draw: (n, o) => Jt(t, e, r, s, n, o)
  };
}
function It(t, e, r, s) {
  const n = F(t, e, !1, !1), o = e.size * (et + nt), i = r + s;
  if (i <= o * 1.02) return n;
  const c = i / o, l = (s - r) / 2 + (et - nt) / 2 * e.size * c;
  return {
    w: n.w,
    h: r,
    d: s,
    draw: (h, u) => Jt(
      t,
      e,
      !1,
      !1,
      0,
      0,
      `translate(${a(h)} ${a(u + l)}) scale(1 ${a(c)})`
    )
  };
}
function ge(t, e, r) {
  return {
    w: t,
    h: e,
    d: 0,
    draw: (s, n) => `<rect x="${a(s)}" y="${a(n - e)}" width="${a(t)}" height="${a(e)}" fill="${r}"/>`
  };
}
function q(t) {
  if (!t.length) return B();
  const e = t.reduce((n, o) => n + o.w, 0), r = Math.max(...t.map((n) => n.h)), s = Math.max(...t.map((n) => n.d));
  return {
    w: e,
    h: r,
    d: s,
    draw: (n, o) => {
      let i = n;
      const c = [];
      for (const l of t)
        c.push(l.draw(i, o)), i += l.w;
      return c.join("");
    }
  };
}
function V(t, e, r) {
  if (!t.length) return B();
  const s = Math.max(...t.map((i) => i.w));
  let n = 0, o = 0;
  return t.forEach((i, c) => {
    c < r ? n += i.h + i.d + e : c === r ? (n += i.h, o += i.d) : o += i.h + i.d + e;
  }), {
    w: s,
    h: n,
    d: o,
    draw: (i, c) => {
      let l = c - n;
      const h = [];
      for (const u of t)
        l += u.h, h.push(u.draw(i + (s - u.w) / 2, l)), l += u.d + e;
      return h.join("");
    }
  };
}
function T(t, e) {
  return q(t.map((r) => we(r, e)));
}
function we(t, e) {
  var r, s;
  switch (t.kind) {
    case "run": {
      const n = t.sty ?? "i", o = /^[\d\s.,+\-=<>()[\]{}|/*]+$/.test(t.text);
      return F(t.text, e, (n === "i" || n === "bi") && !o, n === "b" || n === "bi");
    }
    case "frac": {
      if (t.type === "lin")
        return q([T(t.num, e), F("/", e, !1, !1), T(t.den, e)]);
      if (t.type === "skw") {
        const p = R(e, 0.85);
        return q([T(t.num, p), F("⁄", e, !1, !1), T(t.den, p)]);
      }
      const n = R(e, 0.9), o = T(t.num, n), i = T(t.den, n), c = e.size * 0.22, l = Math.max(o.w, i.w) + c * 2, h = Math.max(0.6, e.size * 0.055), u = e.size * 0.28, d = e.size * 0.18, $ = u + h + d + o.h + o.d, m = -u + h + d + i.h + i.d;
      return {
        w: l,
        h: $,
        d: m,
        draw: (p, f) => {
          const w = f - u, g = [
            o.draw(p + (l - o.w) / 2, w - d - o.d),
            i.draw(p + (l - i.w) / 2, w + h + d + i.h)
          ];
          return t.type !== "noBar" && g.push(`<rect x="${a(p + c * 0.4)}" y="${a(w)}" width="${a(l - c * 0.8)}" height="${a(h)}" fill="${e.color}"/>`), g.join("");
        }
      };
    }
    case "rad": {
      const n = T(t.base, e), o = Math.max(0.6, e.size * 0.05), i = e.size * 0.12, c = e.size * 0.55, l = t.deg.length ? T(t.deg, R(e, 0.55)) : null, h = l ? Math.max(0, l.w - c * 0.35) : 0, u = n.h + i + o, d = n.d, $ = h + c + n.w + e.size * 0.12;
      return {
        w: $,
        h: Math.max(u, l ? u + l.h * 0.3 : u),
        d,
        draw: (m, p) => {
          const f = m + h, w = p - u, g = p + d, z = [
            `<path d="${`M ${a(f)} ${a(g - (g - w) * 0.45)} L ${a(f + c * 0.3)} ${a(g - (g - w) * 0.3)} L ${a(f + c * 0.62)} ${a(g)} L ${a(f + c)} ${a(w)} L ${a(m + $)} ${a(w)}`}" fill="none" stroke="${e.color}" stroke-width="${a(o)}" stroke-linejoin="miter"/>`,
            n.draw(f + c + e.size * 0.06, p)
          ];
          return l && z.push(l.draw(m, p - (g - w) * 0.42)), z.join("");
        }
      };
    }
    case "script": {
      const n = t.base.length ? T(t.base, e) : B(), o = R(e, pt), i = (r = t.sup) != null && r.length ? T(t.sup, o) : null, c = (s = t.sub) != null && s.length ? T(t.sub, o) : null, l = e.size * 0.42, h = e.size * 0.22;
      return {
        w: n.w + Math.max((i == null ? void 0 : i.w) ?? 0, (c == null ? void 0 : c.w) ?? 0) + e.size * 0.04,
        h: Math.max(n.h, i ? l + i.h : 0),
        d: Math.max(n.d, c ? h + c.d : 0),
        draw: (d, $) => {
          const m = [n.draw(d, $)], p = d + n.w + e.size * 0.02;
          return i && m.push(i.draw(p, $ - l)), c && m.push(c.draw(p, $ + h)), m.join("");
        }
      };
    }
    case "nary": {
      const n = { ...e, size: e.size * 1.45 }, o = F(t.chr, n, !1, !1), i = R(e, pt), c = t.sup.length ? T(t.sup, i) : null, l = t.sub.length ? T(t.sub, i) : null, h = T(t.base, e);
      if (t.underOver) {
        const p = [];
        c && p.push(c), p.push(o), l && p.push(l);
        const f = V(p, e.size * 0.08, c ? 1 : 0);
        return q([f, { ...B(), w: e.size * 0.12 }, h]);
      }
      const u = e.size * 0.55, d = e.size * 0.45, $ = Math.max((c == null ? void 0 : c.w) ?? 0, (l == null ? void 0 : l.w) ?? 0), m = {
        w: o.w + $ + e.size * 0.06,
        h: Math.max(o.h, c ? u + c.h : 0),
        d: Math.max(o.d, l ? d + l.d : 0),
        draw: (p, f) => {
          const w = [o.draw(p, f)];
          return c && w.push(c.draw(p + o.w + e.size * 0.04, f - u)), l && w.push(l.draw(p + o.w + e.size * 0.04, f + d)), w.join("");
        }
      };
      return q([m, { ...B(), w: e.size * 0.1 }, h]);
    }
    case "delim": {
      const n = [];
      t.items.forEach((m, p) => {
        p > 0 && t.sep && n.push(F(t.sep, e, !1, !1)), n.push(T(m, e));
      });
      const o = q(n), i = e.size * 0.06, c = Math.max(o.h + i, e.size * et), l = Math.max(o.d + i, e.size * nt), h = t.beg && t.beg !== " " ? It(t.beg, e, c, l) : null, u = t.end && t.end !== " " ? It(t.end, e, c, l) : null, d = [h, o, u].filter((m) => m !== null);
      return {
        w: d.reduce((m, p) => m + p.w, 0),
        h: Math.max(o.h, h ? h.h : 0),
        d: Math.max(o.d, h ? h.d : 0),
        draw: (m, p) => {
          let f = m;
          const w = [];
          for (const g of d)
            w.push(g.draw(f, p)), f += g.w;
          return w.join("");
        }
      };
    }
    case "matrix": {
      const n = t.rows.map((p) => p.map((f) => T(f, e))), o = Math.max(0, ...n.map((p) => p.length)), i = [];
      for (let p = 0; p < o; p++) i.push(Math.max(0, ...n.map((f) => {
        var w;
        return ((w = f[p]) == null ? void 0 : w.w) ?? 0;
      })));
      const c = e.size * 0.5, l = e.size * 0.35, h = n.map((p) => Math.max(e.size * 0.72, ...p.map((f) => f.h))), u = n.map((p) => Math.max(e.size * 0.22, ...p.map((f) => f.d))), d = i.reduce((p, f) => p + f, 0) + c * Math.max(0, o - 1), $ = h.reduce((p, f, w) => p + f + u[w], 0) + l * Math.max(0, n.length - 1), m = e.size * 0.28;
      return {
        w: d,
        h: $ / 2 + m,
        d: $ / 2 - m,
        draw: (p, f) => {
          const w = [];
          let g = f - ($ / 2 + m);
          return n.forEach((b, z) => {
            g += h[z];
            let S = p;
            b.forEach((M, v) => {
              w.push(M.draw(S + (i[v] - M.w) / 2, g)), S += i[v] + c;
            }), g += u[z] + l;
          }), w.join("");
        }
      };
    }
    case "acc": {
      const n = T(t.base, e), o = e.size * 0.9, i = t.chr.trim(), c = Math.max(0.6, e.size * 0.05), l = e.size * (X.has(t.chr) || X.has(t.chr.trim()) ? 0.06 : 0.02);
      let h;
      if (X.has(t.chr) || X.has(i))
        h = ge(n.w, c, e.color);
      else if ($e.has(i)) {
        const u = F(i, { ...e, size: o }, !1, !1), d = u.w > 0 ? n.w / u.w : 1;
        h = {
          w: n.w,
          h: u.h,
          d: u.d,
          draw: ($, m) => `<g transform="translate(${a($)} ${a(m)}) scale(${a(d)} 1)">${u.draw(0, 0)}</g>`
        };
      } else {
        const u = kt[i] ?? kt[t.chr] ?? (i || "^"), d = F(u, { ...e, size: o }, !1, !1), $ = d.w > n.w * 1.1 && n.w > 0 ? n.w * 1.1 / d.w : 1;
        h = $ === 1 ? d : {
          w: d.w * $,
          h: d.h,
          d: d.d,
          draw: (m, p) => `<g transform="translate(${a(m)} ${a(p)}) scale(${a($)} 1)">${d.draw(0, 0)}</g>`
        };
      }
      return t.below ? {
        w: Math.max(n.w, h.w),
        h: n.h,
        d: n.d + l + h.h + h.d,
        draw: (u, d) => n.draw(u + (Math.max(n.w, h.w) - n.w) / 2, d) + h.draw(u + (Math.max(n.w, h.w) - h.w) / 2, d + n.d + l + h.h)
      } : {
        w: Math.max(n.w, h.w),
        h: n.h + l + h.h,
        d: n.d,
        draw: (u, d) => n.draw(u + (Math.max(n.w, h.w) - n.w) / 2, d) + h.draw(u + (Math.max(n.w, h.w) - h.w) / 2, d - n.h - l)
      };
    }
    case "lim": {
      const n = T(t.base, e), o = T(t.limit, R(e, pt));
      return t.below ? V([n, o], e.size * 0.08, 0) : V([o, n], e.size * 0.08, 1);
    }
    case "stack": {
      const n = t.rows.map((o) => T(o, e));
      return V(n, e.size * 0.3, Math.floor((n.length - 1) / 2));
    }
  }
}
function xe(t, e, r, s) {
  const n = T(t, { size: e, measure: s, color: r });
  return { w: n.w, h: n.h, d: n.d, svg: n.draw(0, 0) };
}
const be = "'Cambria Math','Latin Modern Math','STIX Two Math','Times New Roman',serif", Ht = ["'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "sans-serif"], Me = { boldSizeAdjust: 95.4, underscoreSizeAdjust: 74.6 }, yt = "WebPPT DengXian Latin", ye = [`'${yt}'`, "'Arial'", "'Helvetica'", "'Arimo'", "'Liberation Sans'"], Et = ["Arial", "ArialMT", "Helvetica", "Arimo", "Arimo-Regular", "Liberation Sans", "LiberationSans"], Nt = [
  "Arial Bold",
  "Arial-BoldMT",
  "Helvetica Bold",
  "Helvetica-Bold",
  "Arimo Bold",
  "Arimo-Bold",
  "Liberation Sans Bold",
  "LiberationSans-Bold"
];
function ve(t) {
  return /^(等线|dengxian)$/i.test(t.fonts[0] ?? "");
}
function ze() {
  const { boldSizeAdjust: t, underscoreSizeAdjust: e } = Me, r = (s, n, o) => `@font-face{font-family:'${yt}';src:${s.map((i) => `local('${i}')`).join(",")};font-weight:${n};${o}}`;
  return r(Et, "1 599", "") + r(Nt, "600 1000", `size-adjust:${t}%;`) + r(Et, "1 599", `unicode-range:U+5F;size-adjust:${e}%;`) + r(Nt, "600 1000", `unicode-range:U+5F;size-adjust:${e}%;`);
}
let Y = null, Pt = !1;
function te() {
  if (Pt) return Y;
  Pt = !0;
  try {
    const t = document.createElement("canvas").getContext("2d");
    Y = t && typeof t.measureText == "function" ? t : null;
  } catch {
    Y = null;
  }
  return Y;
}
function Ft(t, e) {
  const r = [], s = /* @__PURE__ */ new Set();
  for (const n of t) {
    const o = n.toLowerCase();
    n && !s.has(o) && (s.add(o), r.push(`'${tt(n)}'`));
  }
  for (const n of e) {
    const o = n.replace(/'/g, "").toLowerCase();
    s.has(o) || (s.add(o), r.push(n));
  }
  return r.join(",");
}
function vt(t) {
  const e = ve(t) ? [...ye, ...Ht] : Ht;
  return t.fonts.length ? Ft(t.fonts, e) : Ft(["Helvetica", "Arial"], e);
}
function j(t, e) {
  const r = t.size * e;
  return t.baseline ? r * 0.65 : r;
}
function Se(t, e, r, s) {
  const n = te();
  return n ? (n.font = `${r ? "italic " : ""}${s ? "700 " : "400 "}${e}px ${be}`, n.measureText(t).width) : t.length * e * 0.55;
}
const Z = /* @__PURE__ */ new Map();
function ct(t, e) {
  var o;
  if (!((o = t.math) != null && o.length)) return null;
  const r = t.size * e, s = `${r}|${t.color}|${JSON.stringify(t.math)}`;
  let n = Z.get(s);
  return n || (n = xe(t.math, r, t.color, Se), Z.size > 512 && Z.clear(), Z.set(s, n)), n;
}
function rt(t, e, r, s) {
  var i, c;
  if ((i = e.math) != null && i.length) return ((c = ct(e, r)) == null ? void 0 : c.w) ?? 0;
  if (s) {
    const l = s(t, e, r);
    return Number.isFinite(l) && l > 0 ? l : 0;
  }
  if (!t) return 0;
  const n = te(), o = j(e, r);
  if (!n) {
    let l = 0;
    for (const h of t) l += de(h) ? o : o * 0.55;
    return l;
  }
  return n.font = `${e.i ? "italic " : ""}${e.b ? "700 " : "400 "}${o}px ${vt(e)}`, n.measureText(t).width + (e.spacing ?? 0) * t.length;
}
const Ae = (t) => t.squeezed ? t.width - t.squeeze : t.width;
function Ce(t) {
  const e = [], r = t.run.text;
  for (let s = t.from; s < t.to; ) {
    const n = r.codePointAt(s), o = String.fromCodePoint(n), i = Math.min(t.to, s + o.length);
    e.push({ from: s, to: i, display: t.run.caps === "all" ? o.toUpperCase() : o }), s = i;
  }
  return e;
}
function Te(t, e, r, s, n) {
  const o = t.width - (r ? t.squeeze : 0);
  if (t.atomic)
    return [{ offset: t.from, x: e }, { offset: t.to, x: e + o }];
  const i = Ce(t);
  if (!i.length) return [{ offset: t.from, x: e }];
  const c = i.map((m) => rt(m.display, t.run, s, n)), l = c.reduce((m, p) => m + p, 0), h = l > 0 ? t.width / l : 0, u = l > 0 ? 0 : t.width / i.length;
  let d = e;
  const $ = [{ offset: i[0].from, x: d }];
  return i.forEach((m, p) => {
    const f = r ? D(m.display) * j(t.run, s) : 0;
    f && U(m.display) && (d -= f, $[$.length - 1].x = d), d += l > 0 ? c[p] * h : u, f && !U(m.display) && (d -= f), $.push({ offset: m.to, x: d });
  }), $[$.length - 1].x = e + o, $;
}
function _e(t, e, r, s, n, o) {
  let i = e;
  const c = t.segs.map((h) => {
    const u = h.width - (t.squeezed ? Mt(h.text) * j(h.run, r) : 0), d = [];
    let $ = i;
    if (n && !h.bullet)
      for (const p of h.tokens ?? []) {
        const f = Te(p, $, t.squeezed, r, o);
        d.length && f.length && d[d.length - 1].offset === f[0].offset && f.shift(), d.push(...f), $ += p.width - (t.squeezed ? p.squeeze : 0);
      }
    const m = {
      runIndex: h.runIndex ?? -1,
      from: h.from ?? 0,
      to: h.to ?? 0,
      text: h.text,
      x: i,
      width: u,
      naturalWidth: h.width,
      bullet: h.bullet === !0,
      atomic: h.atomic === !0,
      carets: h.bullet ? [] : d
    };
    return i += u, m;
  });
  if (!s) return c;
  const l = e * 2 + Ae(t);
  for (const h of c)
    h.carets.length ? (h.carets = h.carets.map((u) => ({ ...u, x: l - u.x })), h.x = Math.min(...h.carets.map((u) => u.x))) : h.x = l - h.x - h.width;
  return c;
}
const Le = /* @__PURE__ */ new Set([
  "textArchUp",
  "textArchDown",
  "textArchUpPour",
  "textArchDownPour",
  "textCircle",
  "textWave1",
  "textWave2",
  "textCurveUp",
  "textCurveDown",
  "textCanUp",
  "textCanDown",
  "textTriangle",
  "textChevron",
  "textInflate",
  "textDeflate"
]), st = (t) => !!t && Le.has(t);
function ke(t) {
  return t === "dbl" ? "double" : t === "dotted" || t === "dottedHeavy" ? "dotted" : t.startsWith("wavy") ? "wavy" : t === "dash" || t === "dashHeavy" || t === "dashLong" || t === "dashLongHeavy" || t.startsWith("dotDash") || t.startsWith("dotDotDash") ? "dashed" : "solid";
}
const Ie = (t) => t === "heavy" || t.endsWith("Heavy");
function He(t) {
  const e = t.underline ?? (t.u ? "sng" : "none"), r = t.strikeType ?? (t.strike ? "sngStrike" : "noStrike"), s = t.underlineColor ? `;text-decoration-color:${t.underlineColor}` : "", n = Ie(e) ? ";text-decoration-thickness:0.12em" : "", o = e === "words" ? ";text-decoration-skip-spaces:all" : "";
  return {
    ...e !== "none" ? {
      underline: `text-decoration-line:underline;text-decoration-style:${ke(e)}${s}${n}${o}`
    } : {},
    ...r !== "noStrike" ? {
      strike: `text-decoration-line:line-through;text-decoration-style:${r === "dblStrike" ? "double" : "solid"}`
    } : {}
  };
}
function ee(t, e, r, s = e.color) {
  const n = He(e);
  let o = t;
  return n.strike && (o = `<${r} style="${n.strike}">${o}</${r}>`), n.underline && (o = r === "tspan" && e.underlineColor ? `<tspan style="${n.underline}" fill="${x(e.underlineColor)}"><tspan fill="${x(s)}">${o}</tspan></tspan>` : `<${r} style="${n.underline}">${o}</${r}>`), o;
}
function zt(t) {
  return {
    text: t.text,
    b: !1,
    i: !1,
    u: !1,
    strike: !1,
    size: t.size,
    color: t.color,
    fonts: [...t.fonts]
  };
}
function Ee(t) {
  if (t.caps !== "all") {
    const n = Array.from({ length: t.text.length + 1 }, (o, i) => i);
    return { text: t.text, starts: n, ends: n };
  }
  let e = "";
  const r = [0], s = [0];
  for (let n = 0; n < t.text.length; ) {
    const o = t.text.codePointAt(n), i = String.fromCodePoint(o), c = n + i.length, l = i.toUpperCase(), h = e.length;
    e += l;
    for (let u = 0; u <= l.length; u++)
      r[h + u] = u === l.length ? c : n, s[h + u] = u === 0 ? n : c;
    n = c;
  }
  return { text: e, starts: r, ends: s };
}
function ne(t, e, r) {
  var n;
  const s = [];
  for (const o of t) {
    const { run: i, runIndex: c, bullet: l } = o;
    if ((n = i.math) != null && n.length) {
      s.push({
        text: i.text,
        run: i,
        runIndex: c,
        from: 0,
        to: i.text.length,
        bullet: l,
        atomic: !0,
        width: rt(i.text, i, e, r),
        br: !1,
        space: !1,
        squeeze: 0
      });
      continue;
    }
    const h = Ee(i), u = h.text;
    if (!u) continue;
    const d = u.matchAll(/\n|[^\S\n]+|[⺀-鿿가-퟿＀-｠　-〿]|[^\s⺀-鿿가-퟿＀-｠　-〿]+/g);
    for (const $ of d) {
      const m = $[0], p = $.index, f = p + m.length;
      s.push({
        text: m,
        run: i,
        runIndex: c,
        from: h.starts[p] ?? 0,
        to: h.ends[f] ?? i.text.length,
        bullet: l,
        atomic: !1,
        width: m === `
` ? 0 : rt(m, i, e, r),
        br: m === `
`,
        space: /^[^\S\n]+$/.test(m),
        squeeze: Mt(m) * j(i, e)
      });
    }
  }
  return s;
}
const Ne = (t) => t.squeezed ? t.width - t.squeeze : t.width - t.baseSqueeze;
function Pe(t) {
  const e = [], r = [];
  for (const o of t.segs)
    for (const i of o.text)
      e.push(i), r.push(o.run.size);
  const s = Qt(e, !1);
  let n = 0;
  for (let o = 0; o < e.length; o++) n += s.amount[o] * r[o];
  return n;
}
function Fe(t, e) {
  var n;
  const r = t.segs[t.segs.length - 1];
  r && r.run === e.run && r.to === e.from && r.bullet === e.bullet ? (r.text += e.text, r.width += e.width, r.to = e.to, r.atomic || (r.atomic = e.atomic), r.tokens.push(e)) : t.segs.push({
    text: e.text,
    run: e.run,
    runIndex: e.runIndex,
    from: e.from,
    to: e.to,
    bullet: e.bullet,
    atomic: e.atomic,
    tokens: [e],
    width: e.width
  }), t.width += e.width, t.squeeze += e.squeeze;
  const s = (n = e.run.math) != null && n.length ? ct(e.run, 1) : null;
  t.size = Math.max(t.size, s ? (s.h + s.d) / 1.2 : e.run.size);
}
function re(t, e, r, s) {
  const n = [], o = () => ({ segs: [], width: 0, size: 0, squeeze: 0, squeezed: !1, baseSqueeze: 0 });
  let i = o(), c = Math.max(1, e - Math.max(0, s));
  const l = () => {
    i.squeezed = i.width > c && i.width - i.squeeze <= c, i.baseSqueeze = i.squeezed ? 0 : Pe(i), n.push(i), i = o(), c = Math.max(1, e);
  };
  for (const h of t) {
    if (h.br) {
      l();
      continue;
    }
    const u = i.width + h.width - (i.squeeze + h.squeeze) <= c;
    if (r && i.width > 0 && !u) {
      if (h.space) continue;
      l();
    }
    Fe(i, h);
  }
  return l(), n;
}
function je(t, e, r, s, n) {
  if (e <= 0 || !t.runs.some((i) => Mt(i.text) > 0)) return !1;
  const o = t.runs.map((i, c) => ({ run: i, runIndex: c, bullet: !1 }));
  return re(ne(o, r, n), e, s, t.indent).some((i) => i.squeezed);
}
const We = {
  left: "start",
  center: "middle",
  right: "end",
  justify: "start"
};
function se(t, e, r, s) {
  return t.paragraphs.map((n) => {
    const o = n.runs[0], i = n.bullet && o ? zt({
      ...o,
      text: `${n.bullet} `,
      size: o.size * (n.bulletSize ?? 1),
      color: n.bulletColor ?? o.color
    }) : null, c = [
      ...i ? [{ run: i, runIndex: -1, bullet: !0 }] : [],
      ...n.runs.map((d, $) => ({ run: d, runIndex: $, bullet: !1 }))
    ], l = Math.max(1, e - Math.max(0, n.marL)), h = re(ne(c, r, s), l, t.wrap, n.indent), u = h.map((d) => (d.size || (o == null ? void 0 : o.size) || 18) * r * (n.lineHeight ?? 1.2));
    return { lines: h, para: n, before: n.spaceBefore, after: n.spaceAfter, lineHeights: u };
  });
}
function jt(t, e, r, s) {
  return se(t, e, r, s).reduce(
    (n, o) => n + o.before + o.after + o.lineHeights.reduce((i, c) => i + c, 0),
    0
  );
}
function Re(t, e, r, s, n = {}) {
  const [o, i, c, l] = n.insets ?? t.insets, h = n.vert ?? t.vert ?? "horz", u = h === "vert" || h === "wordArtVert" || h === "vert270" ? r : e, d = h === "vert" || h === "wordArtVert" || h === "vert270" ? e : r, $ = Math.max(1, u - l - i), m = Math.max(1, d - o - c);
  if (jt(t, $, 1, s) <= m) return 1;
  let p = qe, f = 1;
  for (let w = 0; w < 12; w++) {
    const g = (p + f) / 2;
    jt(t, $, g, s) <= m ? p = g : f = g;
  }
  return p;
}
const qe = 0.25;
function St(t, e, r, s, n = {}) {
  const o = Number.isFinite(t.fontScale) && t.fontScale > 0 ? t.fontScale : 1;
  return !t.autoFitCompute || t.autoFitShape ? o : o * Re(t, e, r, s, n);
}
function Ue(t) {
  const e = [];
  return t.forEach((r, s) => {
    r.lines.forEach((n, o) => {
      e.push({
        lp: r,
        line: n,
        paragraphIndex: s,
        li: o,
        h: r.lineHeights[o] + (o === 0 ? r.before : 0) + (o === r.lines.length - 1 ? r.after : 0),
        padTop: o === 0 ? r.before : 0
      });
    });
  }), e;
}
const Wt = (t) => t.reduce((e, r) => e + r.h, 0);
function At(t, e, r, s = {}) {
  var z, S;
  const n = s.vert ?? t.vert ?? "horz", o = Number.isFinite(s.scale) && s.scale > 0 ? s.scale : St(t, e, r, s.measureText, { insets: s.insets, vert: s.vert }), i = t.autoFitShape ? "shape" : t.autoFitNormal || t.autoFitCompute ? "normal" : "none";
  if (n === "vert" || n === "wordArtVert" || n === "vert270") {
    const M = At({ ...t, vert: void 0 }, r, e, {
      ...s,
      vert: "horz",
      scale: o
    }), [, v, , A] = s.insets ?? t.insets, H = M.lines.some((I) => I.x < A - 1e-9 || I.x + I.width > r - v + 1e-9);
    return {
      ...M,
      width: e,
      height: r,
      layoutWidth: r,
      layoutHeight: e,
      scale: o,
      autoFit: i,
      vert: n,
      transform: n === "vert270" ? [0, -1, 1, 0, 0, r] : [0, 1, -1, 0, e, 0],
      unwarped: st((z = t.warp) == null ? void 0 : z.preset),
      overflow: M.overflow || H
    };
  }
  const [c, l, h, u] = s.insets ?? t.insets, d = Math.max(1, e - u - l), $ = Math.max(1, Math.min(Math.floor(t.columns ?? 1), 16)), m = t.columnGap ?? 0, p = $ === 1 ? d : Math.max(1, (d - m * ($ - 1)) / $), f = Ue(se(t, p, o, s.measureText)), w = [[]];
  if ($ === 1)
    w[0].push(...f);
  else {
    const M = Math.max(1, r - c - h);
    let v = 0;
    for (const A of f)
      v > 0 && v + A.h > M && w.length < $ && (w.push([]), v = 0), w[w.length - 1].push(A), v += A.h;
  }
  const g = s.anchor ?? t.anchor, b = [];
  return w.forEach((M, v) => {
    let A = c;
    const H = Wt(M);
    g === "middle" ? A = c + Math.max(0, (r - c - h - H) / 2) : g === "bottom" && (A = Math.max(c, r - h - H));
    const I = u + v * (p + m);
    for (const { lp: L, line: y, paragraphIndex: C, li: _, padTop: E } of M) {
      A += E;
      const N = L.lineHeights[_], W = A + N * 0.78, ft = _ === 0 ? L.para.indent : 0, k = I + Math.max(0, L.para.marL) + ft, P = We[L.para.align], O = P === "middle" ? I + p / 2 : P === "end" ? I + p : k, dt = Ne(y), _t = P === "middle" ? O - dt / 2 : P === "end" ? O - dt : O, Lt = L.para.rtl === !0;
      b.push({
        paragraphIndex: C,
        lineIndex: _,
        columnIndex: v,
        x: _t,
        y: A,
        width: dt,
        naturalWidth: y.width,
        height: N,
        baseline: W,
        anchorX: O,
        align: L.para.align,
        rtl: Lt,
        squeezed: y.squeezed,
        segments: _e(y, _t, o, Lt, s.includeCarets !== !1, s.measureText)
      }), A += N + (_ === L.lines.length - 1 ? L.after : 0);
    }
  }), {
    width: e,
    height: r,
    layoutWidth: e,
    layoutHeight: r,
    scale: o,
    autoFit: i,
    columns: $,
    vert: n,
    transform: [1, 0, 0, 1, 0, 0],
    unwarped: st((S = t.warp) == null ? void 0 : S.preset),
    overflow: w.some((M) => Wt(M) > r - c - h + 1e-9),
    lines: b
  };
}
const Rt = 2048;
function De(t) {
  if (t.length > Rt || /[\u0000-\u001f\u007f]/.test(t)) return null;
  let e;
  try {
    e = new URL(t);
  } catch {
    return null;
  }
  return e.protocol !== "http:" && e.protocol !== "https:" && e.protocol !== "mailto:" || e.username || e.password || (e.protocol === "http:" || e.protocol === "https:") && !e.hostname ? null : e.href.length <= Rt ? e : null;
}
function Ge(t) {
  return t.startsWith("slide:") ? `data-slide="${x(t.slice(6))}" tabindex="0" role="link" style="cursor:pointer;text-decoration:underline"` : De(t) ? `href="${x(t)}" target="_blank" rel="noopener noreferrer"` : `data-unsafe-href="${x(t)}" aria-disabled="true"`;
}
function lt(t, e) {
  return e ? `<a ${Ge(e)}>${t}</a>` : t;
}
const Be = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end"
}, Oe = {
  vert: "writing-mode:vertical-rl;",
  vert270: "writing-mode:vertical-rl;transform:rotate(180deg);",
  wordArtVert: "writing-mode:vertical-rl;text-orientation:upright;"
}, Xe = ["'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "sans-serif"];
function Ve(t, e) {
  const r = [], s = /* @__PURE__ */ new Set();
  for (const n of t) {
    const o = n.toLowerCase();
    n && !s.has(o) && (s.add(o), r.push(`'${tt(n)}'`));
  }
  for (const n of e) {
    const o = n.replace(/'/g, "").toLowerCase();
    s.has(o) || (s.add(o), r.push(n));
  }
  return r.join(",");
}
function Ye(t, e) {
  const r = t.size * e;
  let s = `font-size:${a(r)}px;`;
  return s += t.gradient ? `background-image:${t.gradient};-webkit-background-clip:text;background-clip:text;color:transparent;` : `color:${t.color};`, t.b && (s += "font-weight:700;"), t.i && (s += "font-style:italic;"), t.fonts.length && (s += `font-family:${vt(t)};`), t.spacing && (s += `letter-spacing:${a(t.spacing)}px;`), t.caps === "all" ? s += "text-transform:uppercase;" : t.caps === "small" && (s += "font-variant:small-caps;"), t.highlight && (s += `background-color:${t.highlight};`), t.outline && (s += `-webkit-text-stroke:${a(t.outline.width)}px ${t.outline.color};`), t.shadow && (s += `text-shadow:${t.shadow};`), t.baseline && (s += `vertical-align:${t.baseline > 0 ? "super" : "sub"};font-size:${a(r * 0.65)}px;`), s;
}
function Ze(t, e) {
  const r = [...t];
  let s = "";
  for (let n = 0; n < r.length; n++) {
    const o = r[n];
    if (o === `
`) {
      s += "<br/>";
      continue;
    }
    const i = D(o);
    if (!i || !(e || n > 0 && D(r[n - 1]) > 0)) {
      s += x(o);
      continue;
    }
    s += `<span style="margin-${U(o) ? "left" : "right"}:-${i}em">${x(o)}</span>`;
  }
  return s;
}
function oe(t, e, r, s) {
  var l;
  if ((l = t.math) != null && l.length) {
    const h = ct(t, e);
    if (h && h.w > 0)
      return `<svg${s} xmlns="http://www.w3.org/2000/svg" width="${a(h.w)}" height="${a(h.h + h.d)}" viewBox="0 ${a(-h.h)} ${a(h.w)} ${a(h.h + h.d)}" style="display:inline-block;vertical-align:${a(-h.d)}px;overflow:visible">${h.svg}</svg>`;
  }
  const n = !t.text, o = t.text ? Ze(t.text, r) : "&#160;", c = `<span${s}${s && n ? ' data-empty="true"' : ""} style="${x(Ye(t, e))}">${ee(o, t, "span")}</span>`;
  return lt(c, t.link);
}
function Ke(t, e, r, s) {
  const n = s.scale, o = Number.isFinite(n) && n > 0 ? n : St(t, e, r, s.measureText, { insets: s.insets, vert: s.vert });
  return o === t.fontScale ? t : { ...t, fontScale: o };
}
function qt(t, e, r, s) {
  return ` data-r="${t}.${e}" data-from="${r}" data-to="${s}"`;
}
function $t(t, e, r, s, n, o, i, c = !1) {
  const l = oe({ ...t, text: e }, r, s, n), h = `position:absolute;left:${a(o)}px;top:0;height:${a(i)}px;line-height:${a(i)}px;white-space:pre;` + (c ? "width:0;overflow:hidden;opacity:0;" : "overflow:visible;");
  return `<span data-engine-${c ? "semantic" : "segment"}="true" style="${x(h)}">${l}</span>`;
}
function Qe(t, e, r, s) {
  var p;
  const n = t.paragraphs[e], o = r.map((f) => ({ line: f, pieces: [] }));
  if (!o.length) return `<div data-p="${e}"></div>`;
  const i = n.runs.map(() => 0), c = n.runs.map(() => !1);
  let l = 0, h = o[0];
  const u = (f, w, g, b, z) => {
    const S = n.runs[f], M = !S.text.length;
    g <= w && (!M || c[f]) || (c[f] || (c[f] = M), b.pieces.push($t(
      S,
      S.text.slice(w, g),
      s,
      b.line.squeezed,
      qt(e, f, w, g),
      z - b.line.x,
      b.line.height,
      !0
    )));
  }, d = (f, w, g) => {
    const b = n.runs[f];
    u(f, i[f], b.text.length, w, g), i[f] = b.text.length;
  };
  for (const f of o) {
    h = f;
    for (const w of f.line.segments) {
      if (w.bullet) {
        const M = n.runs[0];
        if (M) {
          const v = zt({
            ...M,
            text: w.text,
            size: M.size * (n.bulletSize ?? 1),
            color: n.bulletColor ?? M.color
          });
          f.pieces.push($t(
            v,
            w.text,
            s,
            f.line.squeezed,
            ' data-bullet="true" contenteditable="false"',
            w.x - f.line.x,
            f.line.height
          ));
        }
        continue;
      }
      for (; l < w.runIndex; )
        d(l, f, w.x), l++;
      const g = n.runs[w.runIndex];
      if (!g) continue;
      u(w.runIndex, i[w.runIndex], w.from, f, w.x);
      const b = !!((p = g.math) != null && p.length), z = b ? 0 : w.from, S = b ? 1 : w.to;
      f.pieces.push($t(
        g,
        b ? g.text : g.text.slice(w.from, w.to),
        s,
        f.line.squeezed,
        qt(e, w.runIndex, z, S),
        w.x - f.line.x,
        f.line.height
      )), i[w.runIndex] = w.to, l = w.runIndex;
    }
  }
  const $ = h.line.x + h.line.width;
  for (; l < n.runs.length; )
    d(l, h, $), l++;
  const m = o.map(({ line: f, pieces: w }) => {
    const g = `position:absolute;left:${a(f.x)}px;top:${a(f.y)}px;width:${a(Math.max(1, f.width))}px;height:${a(f.height)}px;line-height:${a(f.height)}px;white-space:pre;overflow:visible;` + (f.rtl ? "direction:rtl;unicode-bidi:plaintext;" : "");
    return `<span data-engine-line="${e}.${f.lineIndex}" data-x="${a(f.x)}" data-y="${a(f.y)}" style="${x(g)}">${w.join("")}</span>`;
  }).join("");
  return `<div data-p="${e}" style="position:absolute;inset:0">${m}</div>`;
}
function Je(t, e, r, s) {
  const n = At(t, e, r, {
    insets: s.insets,
    anchor: s.anchor,
    vert: s.vert,
    scale: s.scale,
    measureText: s.measureText
  }), o = t.paragraphs.map((p, f) => n.lines.filter((w) => w.paragraphIndex === f)), i = t.paragraphs.map((p, f) => Qe(t, f, o[f], n.scale)).join(""), [c, l, h, u, d, $] = n.transform, m = `position:relative;width:${a(n.layoutWidth)}px;height:${a(n.layoutHeight)}px;box-sizing:border-box;white-space:pre;overflow:visible;transform-origin:0 0;transform:matrix(${a(c)},${a(l)},${a(h)},${a(u)},${a(d)},${a($)});`;
  return `<div data-layout="engine" data-font-scale="${a(n.scale)}" data-autofit="${n.autoFit}" xmlns="http://www.w3.org/1999/xhtml" style="${x(m)}">${i}</div>`;
}
function tn(t, e, r, s = {}) {
  if (s.layout === "engine") return Je(t, e, r, s);
  const n = Ke(t, e, r, s), [o, i, c, l] = s.insets ?? n.insets, h = n.fontScale, u = s.includeEditMarkers !== !1, d = n.paragraphs.map((g, b) => {
    const z = g.runs[0], S = ((z == null ? void 0 : z.size) ?? 18) * h, M = n.wrap && je(g, e - l - i - Math.max(0, g.marL), h, !0, s.measureText), v = g.runs.map((y, C) => oe(y, h, M, u ? ` data-r="${b}.${C}"` : "")).join("");
    let A = "";
    const H = u ? ' data-bullet="true" contenteditable="false"' : "";
    if (g.bulletImage)
      A = `<img${H} src="${x(g.bulletImage)}" style="height:${a(S * 0.8)}px;vertical-align:middle;margin-right:4px"/>`;
    else if (g.bullet) {
      const y = S * (g.bulletSize ?? 1), C = g.bulletColor ?? (z == null ? void 0 : z.color) ?? "#000", _ = g.bulletFont && !/wingdings|webdings|symbol/i.test(g.bulletFont) ? `font-family:${Ve([g.bulletFont], Xe)};` : "";
      A = `<span${H} style="${x(`font-size:${a(y)}px;color:${C};${_}`)}">${x(g.bullet)}&#160;</span>`;
    }
    const I = `margin:${a(g.spaceBefore)}px 0 ${a(g.spaceAfter)}px 0;text-align:${g.align};padding-left:${a(Math.max(0, g.marL))}px;text-indent:${a(g.indent)}px;line-height:${g.lineHeight !== null ? a(g.lineHeight) : "1.2"};` + (g.rtl ? "direction:rtl;" : "") + `white-space:${n.wrap ? "pre-wrap" : "pre"};word-break:break-word;`;
    return `<div${u ? ` data-p="${b}"` : ""} style="${x(I)}">${A}${v}</div>`;
  }).join(""), $ = s.anchor ?? n.anchor, m = s.vert ?? n.vert, p = `width:${a(e)}px;height:${a(r)}px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:${Be[$]};` + (n.anchorCtr ? "align-items:center;" : "") + `padding:${a(o)}px ${a(i)}px ${a(c)}px ${a(l)}px;` + (n.columns ? `column-count:${n.columns};column-gap:${a(n.columnGap ?? 0)}px;display:block;` : "") + (m ? Oe[m] ?? "" : "") + "overflow:visible;", f = n.autoFitShape ? "shape" : t.autoFitNormal || t.autoFitCompute ? "normal" : "none";
  return `<div${u ? ` data-font-scale="${a(h)}" data-autofit="${f}"` : ""} xmlns="http://www.w3.org/1999/xhtml" style="${x(p)}">${d}</div>`;
}
const ie = {
  left: "start",
  center: "middle",
  right: "end",
  justify: "start"
}, ae = (t) => t === "start" ? "end" : t === "end" ? "start" : t, en = (t, e) => e.caps === "all" ? t.toUpperCase() : t;
function gt(t, e, r, s, n, o, i = !1, c) {
  var w;
  if (t.vert === "vert" || t.vert === "wordArtVert") {
    const g = gt(
      { ...t, vert: void 0 },
      r,
      e,
      s,
      n,
      o,
      i,
      c
    );
    return `<g transform="translate(${a(e)} 0) rotate(90)">${g}</g>`;
  }
  if (t.vert === "vert270") {
    const g = gt(
      { ...t, vert: void 0 },
      r,
      e,
      s,
      n,
      o,
      i,
      c
    );
    return `<g transform="translate(0 ${a(r)}) rotate(-90)">${g}</g>`;
  }
  const [l, h, u, d] = n ?? t.insets, $ = t.fontScale, m = cn(t, e, r, s, [l, h, u, d], o ?? t.anchor, c);
  if (m) return m;
  const p = At(t, e, r, {
    insets: n,
    anchor: o,
    vert: "horz",
    // 调用者已经解析过裸 normAutofit；显式传入防止重复缩放。
    scale: $,
    includeCarets: !1,
    measureText: c
  }), f = [];
  for (const g of p.lines) {
    const b = t.paragraphs[g.paragraphIndex], z = b.runs[0], S = g.segments.map((y) => {
      const C = y.runIndex >= 0 ? b.runs[y.runIndex] : zt({
        ...z,
        text: `${b.bullet} `,
        size: z.size * (b.bulletSize ?? 1),
        color: b.bulletColor ?? z.color
      });
      return {
        text: y.text,
        run: C,
        width: y.naturalWidth,
        paragraphIndex: g.paragraphIndex,
        runIndex: y.runIndex,
        from: y.from,
        to: y.to
      };
    });
    if (!S.length) continue;
    const M = [], v = [];
    for (const y of S) {
      const C = [...y.text];
      v.push([M.length, M.length + C.length]), M.push(...C);
    }
    const A = Qt(M, g.squeezed), H = S.map((y, C) => {
      const [_, E] = v[C];
      let N = 0;
      for (let W = _; W < E; W++) N += A.amount[W];
      return N * j(y.run, $);
    });
    let I = g.x;
    for (const [y, C] of S.entries()) {
      if (C.run.highlight) {
        const _ = j(C.run, $);
        f.push(
          `<rect x="${a(I)}" y="${a(g.baseline - _ * 0.82)}" width="${a(C.width)}" height="${a(_ * 1.12)}" fill="${x(C.run.highlight)}"/>`
        );
      }
      I += C.width - H[y];
    }
    const L = ie[g.align];
    if (S.some((y) => {
      var C;
      return (C = y.run.math) == null ? void 0 : C.length;
    })) {
      let y = g.x;
      for (const [C, _] of S.entries()) {
        const E = (w = _.run.math) != null && w.length ? ct(_.run, $) : null;
        E ? f.push(lt(
          `<g transform="translate(${a(y)} ${a(g.baseline)})">${E.svg}</g>`,
          _.run.link
        )) : f.push(
          `<text x="${a(y)}" y="${a(g.baseline)}" text-anchor="start"` + (g.rtl ? ' direction="rtl" unicode-bidi="embed"' : "") + ` xml:space="preserve">${ot(
            _,
            $,
            s,
            void 0,
            i
          )}</text>`
        ), y += _.width - H[C];
      }
    } else {
      const y = A.total > 0 ? rn(S, v, A, $, s, i) : S.map((C) => ot(
        C,
        $,
        s,
        void 0,
        i
      )).join("");
      f.push(
        `<text x="${a(g.anchorX)}" y="${a(g.baseline)}" text-anchor="${g.rtl ? ae(L) : L}"` + (g.rtl ? ' direction="rtl" unicode-bidi="embed"' : "") + ` xml:space="preserve">${y}</text>`
      );
    }
  }
  return f.join("");
}
function nn(t, e) {
  var $;
  const r = ($ = t.match(/linear-gradient\(([^]*)\)$/)) == null ? void 0 : $[1];
  if (!r) return null;
  const s = r.split(/,(?![^(]*\))/).map((m) => m.trim()), n = s[0].match(/^(-?[\d.]+)deg$/), o = n ? Number(n[1]) : 180, c = (n ? s.slice(1) : s).map((m) => {
    const p = m.match(/^(.*?)\s+([\d.]+)%$/);
    return p ? { color: p[1].trim(), pos: Number(p[2]) } : { color: m, pos: null };
  }).map((m, p, f) => ({ color: m.color, pos: m.pos ?? (f.length > 1 ? p / (f.length - 1) * 100 : 0) }));
  if (!c.length) return null;
  const l = (o - 90) * Math.PI / 180, h = Math.cos(l) / 2, u = Math.sin(l) / 2;
  return `url(#${e(
    `<linearGradient id="__ID__" x1="${a(0.5 - h)}" y1="${a(0.5 - u)}" x2="${a(0.5 + h)}" y2="${a(0.5 + u)}">` + c.map((m) => `<stop offset="${a(m.pos)}%" stop-color="${x(m.color)}"/>`).join("") + "</linearGradient>"
  )})`;
}
function rn(t, e, r, s, n, o = !1) {
  return t.map((i, c) => {
    const [l, h] = e[c], u = j(i.run, s), d = r.dx.slice(l, h).map((m) => m * u), $ = d.some((m) => m !== 0);
    return ot(i, s, n, $ ? d : void 0, o);
  }).join("");
}
function ot(t, e, r, s, n = !1) {
  const o = t.run, i = j(o, e), c = o.gradient ? nn(o.gradient, r) : null, l = [
    `font-size="${a(i)}"`,
    `font-family="${x(vt(o))}"`,
    `fill="${x(c ?? o.color)}"`
  ];
  o.b && l.push('font-weight="700"'), o.i && l.push('font-style="italic"'), o.spacing && l.push(`letter-spacing="${a(o.spacing)}"`), o.caps === "small" && l.push('font-variant="small-caps"'), o.baseline && l.push(`dy="${a(o.baseline > 0 ? -i * 0.45 : i * 0.25)}"`), o.outline && l.push(`stroke="${x(o.outline.color)}" stroke-width="${a(o.outline.width)}" paint-order="stroke"`), s != null && s.some(($) => $ !== 0) && l.push(`dx="${s.map(($) => a($)).join(" ")}"`);
  const u = `<tspan${n && t.runIndex !== void 0 && t.runIndex >= 0 ? ` data-r="${t.paragraphIndex}.${t.runIndex}" data-from="${t.from}" data-to="${t.to}"` : ""} ${l.join(" ")}>${ee(x(t.text), o, "tspan", c ?? o.color)}</tspan>`, d = o.baseline ? `${u}<tspan dy="${a(o.baseline > 0 ? i * 0.45 : -i * 0.25)}"></tspan>` : u;
  return lt(d, o.link);
}
const wt = (t, e, r) => Math.min(r, Math.max(e, t));
function Ut(t, e, r, s, n, o) {
  const i = ($) => {
    const m = $ * Math.PI / 180;
    return [t + r * Math.cos(m), e + s * Math.sin(m)];
  }, [c, l] = i(n), [h, u] = i(o), d = Math.abs(o - n);
  return {
    d: `M${a(c)} ${a(l)}A${a(r)} ${a(s)} 0 ${d > 180 ? 1 : 0} ${o > n ? 1 : 0} ${a(h)} ${a(u)}`,
    len: d * Math.PI / 180 * ((r + s) / 2),
    fill: !0
  };
}
function Dt(t, e, r = 28) {
  const s = [];
  for (let i = 0; i <= r; i++) s.push([e * i / r, t(i / r)]);
  let n = `M${a(s[0][0])} ${a(s[0][1])}`, o = 0;
  for (let i = 0; i < r; i++) {
    const c = s[Math.max(0, i - 1)], l = s[i], h = s[i + 1], u = s[Math.min(r, i + 2)];
    n += `C${a(l[0] + (h[0] - c[0]) / 6)} ${a(l[1] + (h[1] - c[1]) / 6)} ${a(h[0] - (u[0] - l[0]) / 6)} ${a(h[1] - (u[1] - l[1]) / 6)} ${a(h[0])} ${a(h[1])}`, o += Math.hypot(h[0] - l[0], h[1] - l[1]);
  }
  return { d: n, len: o };
}
const sn = {
  textCurveUp: 0.3,
  textCurveDown: -0.3,
  textCanUp: 0.16,
  textCanDown: -0.16,
  textDeflate: 0.22,
  textInflate: -0.22,
  textTriangle: 0.2,
  textChevron: 0.34
}, on = /* @__PURE__ */ new Set(["textTriangle", "textChevron"]);
function an(t, e, r, s, n, o) {
  const i = r / 2, c = s / 2, l = wt((e.adj ?? e.adj1 ?? 108e5) / 6e4, 20, 350);
  if (t === "textCircle") {
    const p = Math.max(1, i - n * 0.3), f = Math.max(1, c - n * 0.3);
    return {
      d: `M${a(i)} ${a(c + f)}A${a(p)} ${a(f)} 0 1 1 ${a(i)} ${a(c - f)}A${a(p)} ${a(f)} 0 1 1 ${a(i)} ${a(c + f)}`,
      len: Math.PI * (p + f),
      fill: !0
    };
  }
  if (t.startsWith("textArch")) {
    const p = t.startsWith("textArchDown"), f = t.endsWith("Pour"), w = n * 0.4, g = Math.max(1, (i - n * 0.1) * (f ? 0.72 : 1)), b = Math.max(1, (c - w) * (f ? 0.72 : 1));
    return p ? Ut(i, c - w, g, b, 90 + l / 2, 90 - l / 2) : Ut(i, c + w, g, b, -90 - l / 2, -90 + l / 2);
  }
  const h = t === "textWave1" ? 1 : t === "textWave2" ? -1 : 0, u = o === "top" ? n * 0.85 : o === "bottom" ? s - n * 0.2 : c + n * 0.32;
  if (h) {
    const p = s * 0.16 * wt((e.adj1 ?? 6250) / 6250, 0.25, 3);
    return Dt((f) => u - h * p * Math.sin(2 * Math.PI * f), r);
  }
  const d = sn[t];
  if (d === void 0) return null;
  const $ = d * s, m = on.has(t) ? (p) => 1 - Math.abs(2 * p - 1) : (p) => Math.sin(Math.PI * p);
  return Dt((p) => u + $ / 2 - $ * m(p), r);
}
function cn(t, e, r, s, n, o, i) {
  const c = t.warp;
  if (!c || !st(c.preset)) return null;
  const [l, h, u, d] = n, $ = Math.max(1, e - d - h), m = Math.max(1, r - l - u), p = t.fontScale, f = t.paragraphs.filter((b) => b.runs.some((z) => z.text.trim()));
  if (!f.length) return null;
  const w = m / f.length, g = [];
  return f.forEach((b, z) => {
    const S = b.runs.filter((k) => k.text);
    if (!S.length) return;
    const M = Math.max(...S.map((k) => k.size), 1) * p, v = an(c.preset, c.adj, $, w, M, f.length > 1 ? "middle" : o);
    if (!v) return;
    const A = S.map((k) => ({
      text: en(k.text, k).replace(/\n/g, " "),
      run: k,
      width: rt(k.text, k, p, i)
    })), H = A.reduce((k, P) => k + P.width, 0), I = H > v.len ? Math.max(0.25, v.len / H) : 1, L = H * I, y = A.reduce((k, P) => k + P.text.length, 0), C = v.fill && y > 1 && L > 0 ? (L * wt(v.len / L, 1, 2.2) - L) / y : 0, _ = s(`<path id="__ID__" fill="none" d="${v.d}"/>`), E = ie[b.align], N = b.rtl === !0, W = E === "end" ? "100%" : E === "middle" ? "50%" : "0%", ft = A.map((k) => ot(k, p * I, s)).join("");
    g.push(
      `<g transform="translate(${a(d)} ${a(l + w * z)})"><text text-anchor="${N ? ae(E) : E}"` + (C > 0.05 ? ` letter-spacing="${a(C)}"` : "") + (N ? ' direction="rtl" unicode-bidi="embed"' : "") + ` xml:space="preserve"><textPath href="#${_}" xlink:href="#${_}" startOffset="${W}">${ft}</textPath></text></g>`
    );
  }), g.length ? g.join("") : null;
}
const G = 1 / 1e5, Gt = 0.01;
function ln(t, e, r, s, n, o, i) {
  const c = t.crop ?? { l: 0, t: 0, r: 0, b: 0 }, l = s / Math.max(1 - c.l - c.r, G), h = n / Math.max(1 - c.t - c.b, G), u = `<image href="${x(t.src)}" x="${a(-c.l * l)}" y="${a(-c.t * h)}" width="${a(l)}" height="${a(h)}" preserveAspectRatio="none"` + (t.alpha !== void 0 ? ` opacity="${a(t.alpha)}"` : "") + "/>", d = o || i ? `<g transform="translate(${a(o ? s : 0)} ${a(i ? n : 0)}) scale(${o ? -1 : 1} ${i ? -1 : 1})">${u}</g>` : u;
  return `<svg x="${a(e)}" y="${a(r)}" width="${a(s)}" height="${a(n)}" overflow="hidden">${d}</svg>`;
}
function hn(t) {
  switch (t ?? "tl") {
    case "t":
      return [0.5, 0];
    case "tr":
      return [1, 0];
    case "l":
      return [0, 0.5];
    case "ctr":
      return [0.5, 0.5];
    case "r":
      return [1, 0.5];
    case "bl":
      return [0, 1];
    case "b":
      return [0.5, 1];
    case "br":
      return [1, 1];
    default:
      return [0, 0];
  }
}
function un(t, e, r, s, n) {
  const o = t.tile, i = t.crop ?? { l: 0, t: 0, r: 0, b: 0 }, c = Math.max(1 - i.l - i.r, G), l = Math.max(1 - i.t - i.b, G), h = o.sourceWidth ?? s * 0.25, u = o.sourceHeight ?? n * 0.25, d = Math.max(Gt, h * c * o.sx), $ = Math.max(Gt, u * l * o.sy), [m, p] = hn(o.algn), f = (s - d) * m + (o.tx ?? 0), w = (n - $) * p + (o.ty ?? 0), g = o.flip === "x" || o.flip === "xy", b = o.flip === "y" || o.flip === "xy", z = g ? 2 : 1, S = b ? 2 : 1;
  let M = "";
  for (let v = 0; v < S; v++)
    for (let A = 0; A < z; A++)
      M += ln(
        t,
        A * d,
        v * $,
        d,
        $,
        A === 1,
        v === 1
      );
  e.defs.push(
    `<pattern id="${r}" patternUnits="userSpaceOnUse" x="${a(f)}" y="${a(w)}" width="${a(d * z)}" height="${a($ * S)}">${M}</pattern>`
  );
}
function fn(t, e, r, s) {
  const n = e.nextId("p");
  if (t.tile)
    un(t, e, n, r, s);
  else if (t.crop && (t.crop.l || t.crop.t || t.crop.r || t.crop.b)) {
    const o = t.crop, i = r / Math.max(1 - o.l - o.r, G), c = s / Math.max(1 - o.t - o.b, G);
    e.defs.push(
      `<pattern id="${n}" patternUnits="userSpaceOnUse" width="${a(r)}" height="${a(s)}"><image href="${x(t.src)}" x="${a(-o.l * i)}" y="${a(-o.t * c)}" width="${a(i)}" height="${a(c)}" preserveAspectRatio="none"` + (t.alpha !== void 0 ? ` opacity="${a(t.alpha)}"` : "") + "/></pattern>"
    );
  } else
    e.defs.push(
      `<pattern id="${n}" patternUnits="userSpaceOnUse" width="${a(r)}" height="${a(s)}"><image href="${x(t.src)}" width="${a(r)}" height="${a(s)}" preserveAspectRatio="none"` + (t.alpha !== void 0 ? ` opacity="${a(t.alpha)}"` : "") + "/></pattern>"
    );
  return `url(#${n})`;
}
const Bt = {
  pct5: "M0 0h1v1H0z",
  pct10: "M0 0h1v1H0z",
  pct20: "M0 0h2v2H0z",
  pct25: "M0 0h2v2H0z",
  pct30: "M0 0h2v2H0zM2 2h2v2H2z",
  pct40: "M0 0h2v2H0zM2 2h2v2H2z",
  pct50: "M0 0h2v2H0zM2 2h2v2H2z",
  pct60: "M0 0h3v3H0z",
  pct70: "M0 0h3v3H0z",
  pct75: "M0 0h3v3H0z",
  pct80: "M0 0h4v4H0z",
  pct90: "M0 0h4v4H0z",
  ltHorz: "M0 2h8v1H0z",
  horz: "M0 2h8v2H0z",
  dkHorz: "M0 1h8v3H0z",
  ltVert: "M2 0h1v8H0z",
  vert: "M2 0h2v8H2z",
  dkVert: "M1 0h3v8H1z",
  ltUpDiag: "M0 8L8 0M-2 2L2 -2M6 10L10 6",
  upDiag: "M0 8L8 0M-2 2L2 -2M6 10L10 6",
  ltDnDiag: "M0 0L8 8M-2 6L2 10M6 -2L10 2",
  dnDiag: "M0 0L8 8M-2 6L2 10M6 -2L10 2",
  smGrid: "M0 0h8v1H0zM0 0h1v8H0z",
  lgGrid: "M0 0h8v1H0zM0 0h1v8H0z",
  cross: "M0 3h8v2H0zM3 0h2v8H3z",
  diagCross: "M0 0L8 8M8 0L0 8",
  trellis: "M0 0L8 8M8 0L0 8",
  wave: "M0 4Q2 2 4 4T8 4"
}, dn = {
  pct5: 8,
  pct10: 6,
  pct20: 5,
  pct25: 4,
  pct30: 4,
  pct40: 4,
  pct50: 4,
  pct60: 4,
  pct70: 4,
  pct75: 4,
  pct80: 5,
  pct90: 5
};
function Ct(t, e, r, s) {
  switch (t.type) {
    case "none":
      return "none";
    case "solid":
      return t.color;
    case "gradient": {
      const n = e.nextId("g"), o = t.stops.map((i) => `<stop offset="${a(Math.max(0, Math.min(1, i.pos)) * 100)}%" stop-color="${i.color}"/>`).join("");
      if (t.radial)
        e.defs.push(`<radialGradient id="${n}" cx="50%" cy="50%" r="70%">${o}</radialGradient>`);
      else {
        const i = t.angle * Math.PI / 180, c = Math.cos(i) / 2, l = Math.sin(i) / 2;
        e.defs.push(
          `<linearGradient id="${n}" x1="${a(0.5 - c)}" y1="${a(0.5 - l)}" x2="${a(0.5 + c)}" y2="${a(0.5 + l)}">${o}</linearGradient>`
        );
      }
      return `url(#${n})`;
    }
    case "image":
      return fn(t, e, r, s);
    case "pattern": {
      const n = e.nextId("pt"), o = dn[t.preset] ?? 8, i = Bt[t.preset] ?? Bt.pct50, c = /^[MLQT].*[ML]/.test(i) && !i.includes("h") && !i.includes("v");
      return e.defs.push(
        `<pattern id="${n}" patternUnits="userSpaceOnUse" width="${o}" height="${o}"><rect width="${o}" height="${o}" fill="${t.bg}"/><path d="${i}" ${c ? `stroke="${t.fg}" stroke-width="1" fill="none"` : `fill="${t.fg}"`}/></pattern>`
      ), `url(#${n})`;
    }
  }
}
function pn(t, e) {
  if (!t) return "";
  const r = [];
  let s = "SourceGraphic", n = 0;
  const o = (l) => {
    const h = `e${++n}`;
    r.push(l.replace(/__IN__/g, s).replace(/__OUT__/g, h)), s = h;
  };
  t.glow && o(`<feDropShadow in="__IN__" dx="0" dy="0" stdDeviation="${a(t.glow.radius / 2)}" flood-color="${t.glow.color}" flood-opacity="1" result="__OUT__"/>`);
  const i = t.shadow;
  if (i && !i.inner && o(`<feDropShadow in="__IN__" dx="${a(i.dx)}" dy="${a(i.dy)}" stdDeviation="${a(i.blur / 2)}" flood-color="${i.color}" result="__OUT__"/>`), i != null && i.inner) {
    const l = `is${n}`;
    r.push(
      `<feComponentTransfer in="SourceAlpha" result="${l}a"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer><feGaussianBlur in="${l}a" stdDeviation="${a(i.blur / 2)}" result="${l}b"/><feOffset in="${l}b" dx="${a(i.dx)}" dy="${a(i.dy)}" result="${l}c"/><feComposite in="${l}c" in2="SourceAlpha" operator="in" result="${l}d"/><feFlood flood-color="${i.color}" result="${l}e"/><feComposite in="${l}e" in2="${l}d" operator="in" result="${l}f"/>`
    ), o(`<feComposite in="${l}f" in2="__IN__" operator="over" result="__OUT__"/>`);
  }
  if (t.softEdge && (r.push(
    `<feGaussianBlur in="SourceAlpha" stdDeviation="${a(t.softEdge / 2)}" result="se"/><feComponentTransfer in="se" result="seMask"><feFuncA type="linear" slope="2.2" intercept="-0.6"/></feComponentTransfer>`
  ), o('<feComposite in="__IN__" in2="seMask" operator="in" result="__OUT__"/>')), !r.length) return "";
  const c = e.nextId("f");
  return e.defs.push(`<filter id="${c}" x="-30%" y="-30%" width="160%" height="160%">${r.join("")}</filter>`), ` filter="url(#${c})"`;
}
function $n(t, e, r) {
  var $;
  const s = ($ = t.effects) == null ? void 0 : $.reflection;
  if (!s) return "";
  const n = Math.max(0, Math.min(1, s.alpha));
  if (n <= 0 || t.h <= 0) return "";
  const o = Math.max(0, s.distance), i = t.h + o, c = Math.max(1, t.h * Math.max(0.02, Math.min(1, s.size))), l = -t.w * 0.25, h = t.w * 1.5, u = r.nextId("rg"), d = r.nextId("rm");
  return r.defs.push(
    `<linearGradient id="${u}" gradientUnits="userSpaceOnUse" x1="0" y1="${a(i)}" x2="0" y2="${a(i + c)}"><stop offset="0" stop-color="#fff" stop-opacity="${a(n)}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
  ), r.defs.push(
    `<mask id="${d}" maskUnits="userSpaceOnUse" x="${a(l)}" y="${a(i)}" width="${a(h)}" height="${a(c)}"><rect x="${a(l)}" y="${a(i)}" width="${a(h)}" height="${a(c)}" fill="url(#${u})"/></mask>`
  ), `<g mask="url(#${d})" aria-hidden="true"><use href="#${e}" xlink:href="#${e}" transform="translate(0 ${a(2 * t.h + o)}) scale(1 -1)"/></g>`;
}
function xt(t) {
  const e = t.match(/rgba?\(([^)]+)\)/);
  if (e) {
    const s = e[1].split(",").map(Number);
    return [s[0] || 0, s[1] || 0, s[2] || 0];
  }
  const r = t.replace("#", "");
  return r.length >= 6 ? [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)] : [128, 128, 128];
}
function it(t, e, r) {
  const s = xt(t), n = xt(e);
  return `rgb(${s.map((i, c) => Math.round(i * (1 - r) + n[c] * r)).join(",")})`;
}
function mn(t, e, r) {
  const s = Math.min(e.extrusion ?? 0, Math.max(t.w, t.h));
  if (s <= 0.5) return "";
  const n = ((e.rotY ?? 0) || 35) * Math.PI / 180, o = Math.cos(n) * s, i = Math.sin(((e.rotX ?? 0) || 20) * Math.PI / 180) * s, c = e.extrusionColor ?? it(r, "#000", 0.32), l = Math.max(2, Math.min(14, Math.round(s))), h = [];
  for (let u = l; u >= 1; u--) {
    const d = u / l;
    h.push(`<g transform="translate(${a(o * d)} ${a(i * d)})"><path d="${t.path}" fill="${c}" fill-rule="nonzero"/></g>`);
  }
  return h.join("");
}
function gn(t, e, r, s) {
  const n = e.bevelTop ?? 0;
  if (n <= 0.3 || !t.path) return "";
  const o = it(r, "#fff", 0.5), i = it(r, "#000", 0.25), c = Math.min(n * 2, Math.min(t.w, t.h) / 3), l = s.nextId("bv");
  return s.defs.push(`<clipPath id="${l}"><path d="${t.path}"/></clipPath>`), `<g clip-path="url(#${l})"><path d="${t.path}" fill="none" stroke="${o}" stroke-width="${a(c)}" stroke-linejoin="round" opacity="0.55"/><path d="${t.path}" fill="none" stroke="${i}" stroke-width="${a(c / 3)}" stroke-linejoin="round" opacity="0.35" transform="translate(0 ${a(c / 3)})"/></g>`;
}
function wn(t, e) {
  const [r, s] = t.map(xt), n = r.flatMap((o, i) => [
    ...[0.213, 0.715, 0.072].map((c) => c * (s[i] - o) / 255),
    0,
    o / 255
  ]);
  return `<filter id="${e}" color-interpolation-filters="sRGB"><feColorMatrix values="${n.join(" ")} 0 0 0 1 0"/></filter>`;
}
const bt = {
  m: ["x", "y"],
  l: ["x", "y"],
  t: ["x", "y"],
  h: ["x"],
  v: ["y"],
  c: ["x", "y", "x", "y", "x", "y"],
  s: ["x", "y", "x", "y"],
  q: ["x", "y", "x", "y"],
  a: ["rx", "ry", "angle", "flag", "flag", "x", "y"],
  z: []
}, mt = (t) => t === " " || t === "	" || t === `
` || t === "\r" || t === "\f", K = (t) => t >= "0" && t <= "9";
function xn(t) {
  const e = [];
  let r = 0;
  const s = (c) => new Error(`路径数据无效：位置 ${r} 期望${c}，实际为「${t.slice(r, r + 12)}」（${t.slice(0, 60)}）`), n = () => {
    for (; r < t.length && mt(t[r]); ) r++;
    if (t[r] === ",")
      for (r++; r < t.length && mt(t[r]); ) r++;
  }, o = () => {
    const c = r;
    (t[r] === "+" || t[r] === "-") && r++;
    let l = 0;
    for (; K(t[r]); )
      r++, l++;
    if (t[r] === ".")
      for (r++; K(t[r]); )
        r++, l++;
    if (!l)
      throw r = c, s("数值");
    if (t[r] === "e" || t[r] === "E") {
      const h = r;
      if (r++, (t[r] === "+" || t[r] === "-") && r++, !K(t[r]))
        throw r = h, s("指数");
      for (; K(t[r]); ) r++;
    }
    return Number(t.slice(c, r));
  }, i = () => {
    if (t[r] !== "0" && t[r] !== "1") throw s("弧线标志 0 或 1");
    return Number(t[r++]);
  };
  for (; r < t.length && mt(t[r]); ) r++;
  for (; r < t.length; ) {
    const c = t[r], l = bt[c.toLowerCase()];
    if (!l) throw s("路径命令");
    if (!e.length && c.toLowerCase() !== "m") throw s("以 M/m 开头");
    if (r++, n(), !l.length) {
      e.push({ command: c, values: [] });
      continue;
    }
    let h = c;
    do {
      const u = l.map((d, $) => ($ && n(), d === "flag" ? i() : o()));
      e.push({ command: h, values: u }), h === "M" ? h = "L" : h === "m" && (h = "l"), n();
    } while (r < t.length && !bt[t[r].toLowerCase()]);
  }
  return e;
}
function bn(t, e, r, s, n) {
  t = Math.abs(t), e = Math.abs(e);
  const o = r * Math.PI / 180, i = Math.cos(o), c = Math.sin(o);
  if (s === n || c === 0 || i === 0) {
    const m = i === 0 && c !== 0;
    return [t * (m ? n : s), e * (m ? s : n), r];
  }
  const l = (t * t * i * i + e * e * c * c) * s * s, h = (t * t - e * e) * i * c * s * n, u = (t * t * c * c + e * e * i * i) * n * n, d = (l + u) / 2, $ = Math.hypot((l - u) / 2, h);
  return [
    Math.sqrt(d + $),
    Math.sqrt(Math.max(0, d - $)),
    Math.atan2(2 * h, l - u) / 2 * 180 / Math.PI
  ];
}
function Ot(t, e, r) {
  if (!(Number.isFinite(e) && e > 0 && Number.isFinite(r) && r > 0))
    throw new Error(`路径缩放比例必须是正有限数：kx=${e}，ky=${r}`);
  return xn(t).map(({ command: s, values: n }) => {
    const o = bt[s.toLowerCase()];
    if (o.includes("rx")) {
      const [i, c, l] = bn(n[0], n[1], n[2], e, r);
      n = [i, c, l, n[3], n[4], n[5] * e, n[6] * r];
    } else
      n = n.map((i, c) => i * (o[c] === "y" ? r : e));
    return n.length ? `${s} ${n.map(a).join(" ")}` : s;
  }).join(" ");
}
function Mn(t) {
  const e = (t % 360 + 360) % 360;
  return e >= 45 && e < 135 || e >= 225 && e < 315;
}
function Xt(t, e, r) {
  const s = t || 1;
  if (!Number.isFinite(s) || s <= 0)
    throw new Error(`组合 ${r.name ?? r.id ?? ""} 的 ${e} 缩放无效：${t}`);
  return s;
}
function ce(t, e) {
  const r = Xt(t.scaleX, "scaleX", t), s = Xt(t.scaleY, "scaleY", t), n = Mn(e.rot), o = n ? s : r, i = n ? r : s, c = e.w * o, l = e.h * i;
  return {
    x: (e.x + e.w / 2 - t.childX) * r - c / 2,
    y: (e.y + e.h / 2 - t.childY) * s - l / 2,
    w: c,
    h: l,
    kx: o,
    ky: i
  };
}
function yn(t, e) {
  const { kx: r, ky: s, ...n } = ce(t, e);
  if (r === 1 && s === 1) return { ...e, ...n };
  switch (e.kind) {
    case "shape":
      return { ...e, ...n, path: e.path && Ot(e.path, r, s) };
    case "image":
      return { ...e, ...n, ...e.clipPath ? { clipPath: Ot(e.clipPath, r, s) } : {} };
    case "group":
      return { ...e, ...n, scaleX: (e.scaleX || 1) * r, scaleY: (e.scaleY || 1) * s };
    case "table":
      return {
        ...e,
        ...n,
        colWidths: e.colWidths.map((o) => o * r),
        rows: e.rows.map((o) => ({ ...o, height: o.height * s }))
      };
    case "unsupported":
      return { ...e, ...n };
  }
}
let vn = 0;
const zn = (t) => `${t}${++vn}`;
function Sn(t) {
  return t.replace(
    /^[0-9-]|[^A-Za-z0-9-]/gu,
    (e) => `_u${e.codePointAt(0).toString(16)}_`
  );
}
const Vt = 1 / 1e5;
function An(t) {
  const e = t.textMode ?? "html";
  let r = 0;
  const s = t.idPrefix === void 0 ? null : Sn(t.idPrefix);
  return {
    defs: [],
    nextId: s === null ? zn : (n) => `${s}${n}${++r}`,
    textMode: e,
    measureText: t.measureText,
    // 'svg' 文本模式是给「交出去的文件」用的，里面不该出现只有浏览器认的 foreignObject
    media: t.media === "player" && e === "html" ? "player" : "badge",
    hidden: t.hiddenElements && t.hiddenElements.length ? new Set(t.hiddenElements) : null,
    includeEditMarkers: t.includeEditMarkers === !0,
    resolveLink: (n) => n
  };
}
function Cn(t, e) {
  const r = t.slides.indexOf(e) + 1;
  return (s) => {
    if (!s) return s;
    if (s.startsWith("slide-part:"))
      try {
        const n = decodeURIComponent(s.slice(11)), o = t.slides.findIndex((i) => i.editInfo && i.editInfo.origin.part === n);
        return o < 0 ? s : `slide:${o + 1}`;
      } catch {
        return s;
      }
    return s.startsWith("slide:") ? s === "slide:next" ? `slide:${r + 1}` : s === "slide:previous" ? `slide:${r - 1}` : s === "slide:first" ? "slide:1" : s === "slide:last" ? `slide:${t.slides.length}` : s : s;
  };
}
function Tn(t, e, r = {}) {
  const s = An(r);
  s.resolveLink = Cn(t, e);
  let n = "#fff";
  try {
    e.background && (n = Ct(e.background, s, t.width, t.height));
  } catch {
  }
  const o = `<rect width="${a(t.width)}" height="${a(t.height)}" fill="${n}"/>`, i = e.elements.map((u) => le(u, s)).join("") + (r.showComments ? Wn(e.comments, t.width, t.height) : ""), c = (t.embeddedFonts ?? []).map((u) => `@font-face{font-family:'${tt(u.family)}';src:url('${tt(u.src)}');font-weight:${u.bold ? 700 : 400};font-style:${u.italic ? "italic" : "normal"};}`).join("") + (i.includes(yt) ? ze() : ""), l = c ? `<style>${c}</style>` : "", h = r.includeNotes && e.notes ? `<desc>${x(e.notes)}</desc>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${a(t.width)} ${a(t.height)}" font-family="Helvetica, Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif">` + h + `<defs>${l}${s.defs.join("")}</defs>` + o + i + "</svg>";
}
function ht(t, e, r) {
  const s = pn(t.effects, r);
  if (!t.effects || !t.effects.reflection) return `<g transform="${at(t)}"${s}>${e}</g>`;
  const n = r.nextId("rc"), o = `<g id="${n}">${e}</g>`;
  return `<g transform="${at(t)}">` + $n(t, n, r) + (s ? `<g${s}>${o}</g>` : o) + "</g>";
}
const _n = {
  none: { d: "", fill: !1 },
  triangle: { d: "M0 0 L10 5 L0 10 z", fill: !0 },
  stealth: { d: "M0 0 L10 5 L0 10 L3 5 z", fill: !0 },
  diamond: { d: "M0 5 L5 0 L10 5 L5 10 z", fill: !0 },
  oval: { d: "M0 5 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0", fill: !0 },
  arrow: { d: "M0 0 L10 5 L0 10", fill: !1 }
};
function Yt(t, e, r, s) {
  const n = _n[t.type];
  if (!n.d) return "";
  const o = r.nextId("m"), i = Math.max(1, t.h), c = Math.max(1, t.w);
  return r.defs.push(
    `<marker id="${o}" viewBox="0 0 10 10" refX="${s ? 0 : 10}" refY="5" markerWidth="${a(i)}" markerHeight="${a(c)}" markerUnits="strokeWidth" orient="${s ? "auto-start-reverse" : "auto"}"><path d="${n.d}" ${n.fill ? `fill="${e}"` : `fill="none" stroke="${e}" stroke-width="1.6"`}/></marker>`
  ), `url(#${o})`;
}
function Tt(t, e) {
  if (!t) return "";
  let r = ` stroke="${t.color}" stroke-width="${a(t.width)}"`;
  if (t.dash && (r += ` stroke-dasharray="${t.dash.map(a).join(" ")}"`), t.cap && (r += ` stroke-linecap="${t.cap}"`), t.join && (r += ` stroke-linejoin="${t.join}"`), t.head) {
    const s = Yt(t.head, t.color, e, !0);
    s && (r += ` marker-start="${s}"`);
  }
  if (t.tail) {
    const s = Yt(t.tail, t.color, e, !1);
    s && (r += ` marker-end="${s}"`);
  }
  return r;
}
function at(t) {
  return `${t.rot ? `rotate(${a(t.rot)} ${a(t.x + t.w / 2)} ${a(t.y + t.h / 2)}) ` : ""}translate(${a(t.x)} ${a(t.y)})`;
}
function ut(t) {
  return !t.flipH && !t.flipV ? "" : `translate(${a(t.w / 2)} ${a(t.h / 2)}) scale(${t.flipH ? -1 : 1} ${t.flipV ? -1 : 1}) translate(${a(-t.w / 2)} ${a(-t.h / 2)})`;
}
function Ln(t, e) {
  try {
    const r = e instanceof Error ? e.message : String(e), s = t.name ? `${t.kind} · ${t.name}` : t.kind;
    return `<g transform="${at(t)}" data-render-error="1"><title>${x(s)} 渲染失败：${x(r.slice(0, 200))}</title><rect width="${a(t.w)}" height="${a(t.h)}" fill="rgba(220,38,38,0.06)" stroke="#dc2626" stroke-width="1" stroke-dasharray="5 4"/></g>`;
  } catch {
    return "";
  }
}
function le(t, e, r) {
  var n;
  let s;
  try {
    const o = r ? yn(r, t) : t;
    switch (o.kind) {
      case "shape":
        s = kn(o, e);
        break;
      case "image":
        s = Nn(o, e);
        break;
      case "group":
        s = Pn(o, e);
        break;
      case "table":
        s = jn(o, e);
        break;
      case "unsupported":
        s = Rn(o);
        break;
    }
  } catch (o) {
    s = Ln(r ? { ...t, ...ce(r, t) } : t, o);
  }
  if (e.includeEditMarkers !== null && (t.id !== void 0 || e.includeEditMarkers)) {
    const o = t.id !== void 0 && ((n = e.hidden) != null && n.has(t.id)) ? "visibility:hidden;" : "";
    s = `<g data-el="${t.id ?? ""}" style="${o}transform-box:fill-box;transform-origin:center">${s}</g>`;
  }
  return lt(s, e.resolveLink(t.link));
}
function kn(t, e) {
  var o, i;
  let r = "", s;
  const n = t.scene3d;
  if (t.path) {
    const c = t.openGeom ? "none" : t.fill ? Ct(t.fill, e, t.w, t.h) : "none", l = ((o = t.fill) == null ? void 0 : o.type) === "solid" ? t.fill.color : ((i = t.fill) == null ? void 0 : i.type) === "gradient" && t.fill.stops.length ? t.fill.stops[0].color : "rgb(128,128,128)";
    n && (r += mn(t, n, l));
    const h = n != null && n.contourWidth ? ` stroke="${n.contourColor ?? it(l, "#000", 0.45)}" stroke-width="${a(n.contourWidth)}"` : Tt(t.stroke, e);
    s = `<path d="${t.path}" fill="${c}" fill-rule="nonzero"${h}/>`;
    const u = ut(t);
    r += u ? `<g transform="${u}">${s}</g>` : s, n && (r += gn(t, n, l, e));
  }
  return t.text && (r += ue(
    t.text,
    t.w,
    t.h,
    e
  )), ht(t, r, e);
}
function In(t, e) {
  const r = Math.max(6, Math.min(Math.min(t.w, t.h) * 0.22, 34)), s = t.w / 2, n = t.h / 2, o = `<circle cx="${a(s)}" cy="${a(n)}" r="${a(r)}" fill="rgba(17,17,17,0.55)" stroke="rgba(255,255,255,0.92)" stroke-width="${a(Math.max(1, r * 0.09))}"/>`;
  let i;
  if (e.kind === "audio") {
    const c = r * 0.42, l = s - c * 1.15;
    i = `<path d="M${a(l)} ${a(n - c * 0.42)} H${a(l + c * 0.62)} L${a(l + c * 1.5)} ${a(n - c)} V${a(n + c)} L${a(l + c * 0.62)} ${a(n + c * 0.42)} H${a(l)} Z" fill="#fff"/><path d="M${a(s + c * 0.65)} ${a(n - c * 0.6)} A ${a(c * 0.75)} ${a(c * 0.75)} 0 0 1 ${a(s + c * 0.65)} ${a(n + c * 0.6)}" fill="none" stroke="#fff" stroke-width="${a(Math.max(1, c * 0.26))}" stroke-linecap="round"/><path d="M${a(s + c * 1.15)} ${a(n - c * 1.05)} A ${a(c * 1.35)} ${a(c * 1.35)} 0 0 1 ${a(s + c * 1.15)} ${a(n + c * 1.05)}" fill="none" stroke="#fff" stroke-width="${a(Math.max(1, c * 0.26))}" stroke-linecap="round" opacity="0.85"/>`;
  } else {
    const c = r * 0.46;
    i = `<path d="M${a(s - c * 0.62)} ${a(n - c)} L${a(s + c)} ${a(n)} L${a(s - c * 0.62)} ${a(n + c)} Z" fill="#fff"/>`;
  }
  return `<g aria-hidden="true" pointer-events="none">${he(e)}${o}${i}</g>`;
}
function he(t) {
  const e = t.kind === "audio" ? "音频" : "视频", r = t.src ? t.external ? `${e}（外链）` : e : `${e}（源不可用）`;
  return `<title>${x(r)}</title>`;
}
function Hn(t, e) {
  return `<foreignObject x="0" y="0" width="${a(t.w)}" height="${a(t.h)}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%"><video controls preload="metadata" src="${x(e.src ?? "")}"` + (t.src ? ` poster="${x(t.src)}"` : "") + ' style="width:100%;height:100%;display:block;object-fit:contain;background:#000"></video></div></foreignObject>';
}
function En(t, e) {
  return `<g data-media-toggle="" style="cursor:pointer">${t}<foreignObject width="0" height="0"><div xmlns="http://www.w3.org/1999/xhtml"><audio preload="none" src="${x(e.src ?? "")}"></audio></div></foreignObject></g>`;
}
function Nn(t, e) {
  let r = t.filter ?? "";
  if (t.duotone) {
    const i = e.nextId("dt");
    e.defs.push(wn(t.duotone, i)), r = `${r} url(#${i})`.trim();
  }
  const s = (t.alpha !== void 0 && t.alpha < 1 ? ` opacity="${a(t.alpha)}"` : "") + (r ? ` style="filter:${x(r)}"` : "");
  let n;
  if (!t.src)
    n = `<rect width="${a(t.w)}" height="${a(t.h)}" fill="rgb(38,42,48)"/>`;
  else if (t.crop && (t.crop.l || t.crop.t || t.crop.r || t.crop.b)) {
    const i = t.w / Math.max(1 - t.crop.l - t.crop.r, Vt), c = t.h / Math.max(1 - t.crop.t - t.crop.b, Vt), l = e.nextId("c");
    e.defs.push(`<clipPath id="${l}"><rect width="${a(t.w)}" height="${a(t.h)}"/></clipPath>`), n = `<g clip-path="url(#${l})"><image href="${x(t.src)}" x="${a(-t.crop.l * i)}" y="${a(-t.crop.t * c)}" width="${a(i)}" height="${a(c)}" preserveAspectRatio="none"${s}/></g>`;
  } else
    n = `<image href="${x(t.src)}" width="${a(t.w)}" height="${a(t.h)}" preserveAspectRatio="none"${s}/>`;
  if (t.clipPath) {
    const i = e.nextId("cs");
    e.defs.push(`<clipPath id="${i}"><path d="${t.clipPath}"/></clipPath>`), n = `<g clip-path="url(#${i})">${n}</g>`;
  }
  t.stroke && (n += `<path d="${t.clipPath ?? `M0 0 H${a(t.w)} V${a(t.h)} H0 Z`}" fill="none"${Tt(t.stroke, e)}/>`);
  const o = ut(t);
  if (o && (n = `<g transform="${o}">${n}</g>`), t.media) {
    const i = e.media === "player" && !!t.media.src;
    i && t.media.kind === "video" ? n += Hn(t, t.media) : (n = t.media.kind === "video" || !t.src || !t.media.src ? n + In(t, t.media) : he(t.media) + n, i && (n = En(n, t.media)));
  }
  return ht(t, n, e);
}
function Pn(t, e) {
  const r = e.includeEditMarkers && t.editInfo && t.editInfo.editable === "frame" ? { ...e, includeEditMarkers: null } : e, s = t.children.map((i) => le(i, r, t)).join(""), n = e.includeEditMarkers ? ' data-edit-group-children="1"' : "", o = ut(t);
  return ht(t, `<g${n}${o ? ` transform="${o}"` : ""}>${s}</g>`, e);
}
const Fn = { color: "rgba(0,0,0,0.25)", width: 1, dash: null };
function Q(t, e, r, s, n, o) {
  if (t === null) return "";
  const i = t ?? Fn;
  return `<line x1="${a(e)}" y1="${a(r)}" x2="${a(s)}" y2="${a(n)}"${Tt(i, o)}/>`;
}
function jn(t, e) {
  const r = [], s = [];
  let n = 0;
  t.rows.forEach((i, c) => {
    let l = 0;
    i.cells.forEach((h, u) => {
      const d = t.colWidths.slice(u, u + h.colSpan).reduce((f, w) => f + w, 0) || t.colWidths[u] || 0;
      if (h.merged) {
        l += t.colWidths[u] ?? 0;
        return;
      }
      const $ = t.rows.slice(c, c + h.rowSpan).reduce((f, w) => f + w.height, 0) || i.height, m = h.fill ? Ct(h.fill, e, d, $) : "none", p = h.borders ?? {};
      r.push(
        `<g${e.includeEditMarkers ? ` data-table-cell="${c}:${u}"` : ""} transform="translate(${a(l)} ${a(n)})"><rect width="${a(d)}" height="${a($)}" fill="${m}"${e.includeEditMarkers ? ' pointer-events="visibleFill"' : ""}/>` + (h.text ? ue(h.text, d, $, e, h.margins, h.vAlign, h.vert) : "") + "</g>"
      ), s.push(
        `<g transform="translate(${a(l)} ${a(n)})">` + Q(p.t, 0, 0, d, 0, e) + Q(p.b, 0, $, d, $, e) + Q(p.l, 0, 0, 0, $, e) + Q(p.r, d, 0, d, $, e) + "</g>"
      ), l += t.colWidths[u] ?? 0;
    }), n += i.height;
  });
  const o = r.join("") + s.join("");
  return ht(t, t.flipH || t.flipV ? `<g transform="${ut(t)}">${o}</g>` : o, e);
}
function Wn(t, e, r) {
  if (!(t != null && t.length)) return "";
  const s = Math.max(14, Math.min(e, r) * 0.036), n = [];
  return t.forEach((o, i) => {
    const c = Math.max(0, Math.min(Number.isFinite(o.x) ? o.x : 0, e - s)), l = Math.max(0, Math.min(Number.isFinite(o.y) ? o.y : 0, r - s)), h = String(o.idx ?? i + 1), u = [o.author, o.date, o.text].filter(Boolean).join(" · ");
    n.push(
      `<g class="ppt-comment" data-comment="${x(h)}" transform="translate(${a(c)} ${a(l)})"><title>${x(u)}</title><path d="M${a(s * 0.16)} 0 H${a(s * 0.84)} A ${a(s * 0.16)} ${a(s * 0.16)} 0 0 1 ${a(s)} ${a(s * 0.16)} V${a(s * 0.62)} A ${a(s * 0.16)} ${a(s * 0.16)} 0 0 1 ${a(s * 0.84)} ${a(s * 0.78)} H${a(s * 0.42)} L${a(s * 0.16)} ${a(s)} V${a(s * 0.78)} A ${a(s * 0.16)} ${a(s * 0.16)} 0 0 1 0 ${a(s * 0.62)} V${a(s * 0.16)} A ${a(s * 0.16)} ${a(s * 0.16)} 0 0 1 ${a(s * 0.16)} 0 Z" fill="rgb(255,196,60)" stroke="rgba(120,80,0,0.55)" stroke-width="${a(Math.max(0.6, s * 0.045))}"/><text x="${a(s * 0.5)}" y="${a(s * 0.42)}" text-anchor="middle" dominant-baseline="central" fill="rgb(60,40,0)" font-size="${a(s * 0.52)}" font-weight="700">${x(h)}</text></g>`
    );
  }), n.join("");
}
function Rn(t) {
  const e = Math.max(10, Math.min(16, t.h / 6)), r = t.preview ? `<image href="${x(t.preview)}" width="${a(t.w)}" height="${a(t.h)}" preserveAspectRatio="none"/>` : "";
  return `<g transform="${at(t)}">` + r + `<rect width="${a(t.w)}" height="${a(t.h)}" fill="rgba(127,127,127,0.07)" stroke="#aaa" stroke-dasharray="6 4"/><text x="${a(t.w / 2)}" y="${a(t.h / 2)}" text-anchor="middle" dominant-baseline="middle" fill="#888" font-size="${a(e)}">${x(t.label)}</text></g>`;
}
function ue(t, e, r, s, n, o, i) {
  var l;
  if (t.paragraphs.some((h) => h.runs.some((u) => {
    var d;
    return ((d = u.link) == null ? void 0 : d.startsWith("slide-part:")) || /^slide:(next|previous|first|last)$/.test(u.link ?? "");
  })) && (t = { ...t, paragraphs: t.paragraphs.map((h) => ({
    ...h,
    runs: h.runs.map((u) => {
      const d = s.resolveLink(u.link);
      return d === u.link ? u : { ...u, link: d };
    })
  })) }), s.textMode === "svg" || st((l = t.warp) == null ? void 0 : l.preset)) {
    if (t.autoFitCompute && !t.autoFitShape) {
      const u = St(t, e, r, s.measureText, {
        insets: n,
        vert: i
      });
      u !== t.fontScale && (t = { ...t, fontScale: u });
    }
    const h = (u) => {
      const d = s.nextId("tg");
      return s.defs.push(u.replace("__ID__", d)), d;
    };
    return gt(
      i && i !== t.vert ? { ...t, vert: i } : t,
      e,
      r,
      h,
      n,
      o,
      !!s.includeEditMarkers,
      s.measureText
    );
  }
  const c = tn(t, e, r, {
    insets: n,
    anchor: o,
    vert: i,
    includeEditMarkers: !!s.includeEditMarkers,
    measureText: s.measureText
  });
  return `<foreignObject width="${a(e)}" height="${a(r)}" style="overflow:visible">${c}</foreignObject>`;
}
const Zt = 32767;
function qn(t, e) {
  if (!Number.isFinite(e) || e <= 0)
    throw new RangeError("scale 必须是大于 0 的有限数");
  const r = Math.round(t.width * e), s = Math.round(t.height * e);
  if (r < 1 || s < 1 || r > Zt || s > Zt)
    throw new RangeError(`scale 产生了浏览器 canvas 不支持的尺寸：${r}×${s}`);
  return { width: r, height: s };
}
class J extends Error {
  constructor(e, r) {
    super(r), this.name = "NodeRenderError", this.reason = e;
  }
}
function Un(t, e, r) {
  if (typeof (r == null ? void 0 : r.measureText) != "function")
    throw new J(
      "node-measure-required",
      "Node 渲染需要显式注入 measureText（例如 @web-ppt/fonts/glyphs 的 withFontMeasurement 产物）；不注入时没有可信字宽，渲染会静默退回估算断行，这里直接拒绝"
    );
  return Tn(t, e, {
    ...r,
    textMode: "svg",
    measureText: r.measureText,
    // 'player' 依赖 foreignObject 与真实媒体元素，脱离浏览器无意义；导出语义下 badge 是唯一正确形态。
    media: "badge"
  });
}
async function Dn(t, e, r) {
  if (typeof (r == null ? void 0 : r.measureText) != "function")
    throw new J(
      "node-measure-required",
      "Node PNG 渲染需要显式注入 measureText；不注入时没有可信字宽，渲染会静默退回估算断行，这里直接拒绝"
    );
  if (typeof (r == null ? void 0 : r.rasterize) != "function")
    throw new J(
      "node-rasterizer-required",
      "Node PNG 需要宿主注入 rasterize 光栅化函数（例如 resvg）；core 不内置任何光栅化依赖"
    );
  const s = Un(t, e, r), n = await r.rasterize(s, qn(t, r.scale ?? 2));
  if (!(n instanceof Uint8Array) || n.length === 0)
    throw new J(
      "node-rasterizer-required",
      `rasterize 必须返回非空 PNG 字节（Uint8Array），收到 ${n == null ? String(n) : `长度 ${n.length}`}`
    );
  return n;
}
export {
  J as NodeRenderError,
  Dn as renderSlidePngInNode,
  Un as renderSlideSvgInNode
};
