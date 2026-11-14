import { safeUnzipSync as m } from "./zip.js";
let l, o;
async function h(i) {
  const r = i instanceof Uint8Array ? i : new Uint8Array(i), a = (e) => {
    for (let t = 0; t + 16 <= e.length; t++)
      if (e[t] === 69 && e[t + 1] === 77 && e[t + 2] === 70 && e[t + 3] === 43 && e[t + 4] === 1 && e[t + 5] === 64) return !0;
    return !1;
  };
  let s = !1, c = !1;
  try {
    if (r[0] === 80 && r[1] === 75) {
      let e = 0;
      const t = m(r, { filter: (n) => (/\/media\/.+\.[ew]mf$/i.test(n.name) || /^ppt\/(slides|slideLayouts|slideMasters|theme)\/.*\.xml$/.test(n.name)) && n.originalSize <= 32 * 1024 * 1024 && (e += n.originalSize) <= 128 * 1024 * 1024 });
      s = Object.values(t).some(a), c = Object.entries(t).some(([n, f]) => n.endsWith(".xml") && /<(?:[\w]+:)?(?:scene3d|sp3d)[\s>]/.test(new TextDecoder().decode(f)));
    } else s = a(r);
  } catch {
    return;
  }
  if (c)
    try {
      o ?? (o = import("./three-d.js").then((e) => e.enableThreeD())), await o;
    } catch {
      o = void 0;
    }
  if (s)
    try {
      l ?? (l = import("./emf-plus.js").then((e) => e.enableEmfPlus())), await l;
    } catch {
      l = void 0;
    }
}
export {
  h as prepareAdvancedRendering
};
