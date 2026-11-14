import { i as E, a as P, v as I } from "./vector-image-input-DvER4vWX.js";
const v = "data:image/png;base64,";
function A(o, r) {
  const n = o.toDataURL("image/png");
  if (!n.startsWith(v)) throw new Error(`${r}：画布 ${o.width}×${o.height} 无法编码为 PNG`);
  return Uint8Array.from(atob(n.slice(v.length)), (t) => t.charCodeAt(0));
}
async function M(o) {
  const r = () => {
    var i;
    if ((i = o.signal) != null && i.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
  };
  r();
  const n = E(o.bytes);
  let t, e;
  try {
    t = await createImageBitmap(
      new Blob([o.bytes.slice().buffer], { type: n.mimeType }),
      { imageOrientation: "from-image", colorSpaceConversion: "default", premultiplyAlpha: "none" }
    ), r(), P(t.width, t.height), e = document.createElement("canvas"), e.width = t.width, e.height = t.height;
    const i = e.getContext("2d", { colorSpace: "srgb", willReadFrequently: !0 });
    if (!i) throw new Error("PDF 图片无法获取 sRGB canvas 上下文");
    i.drawImage(t, 0, 0);
    const h = i.getImageData(0, 0, e.width, e.height), a = { width: e.width, height: e.height, rgba: new Uint8Array(h.data.buffer, h.data.byteOffset, h.data.byteLength) };
    return I(a, n), r(), a;
  } finally {
    t == null || t.close(), e && (e.width = e.height = 0);
  }
}
async function C(o) {
  const { signal: r } = o, n = 2, t = Math.ceil(o.width * n), e = Math.ceil(o.height * n), i = () => {
    if (r != null && r.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
  };
  if (i(), ![t, e].every((m) => Number.isSafeInteger(m) && m > 0) || t * e > 16e6) throw new Error("PDF 局部回退画布尺寸超限");
  const h = document.createElement("canvas"), a = document.createElement("canvas"), c = new Image();
  try {
    const m = o.svg.replace("<svg ", `<svg width="${t}" height="${e}" `);
    await new Promise((g, s) => {
      const u = () => {
        r == null || r.removeEventListener("abort", y), c.onload = c.onerror = null;
      }, y = () => {
        u(), c.removeAttribute("src"), s(new DOMException("PDF 导出已取消", "AbortError"));
      };
      c.onload = () => {
        u(), g();
      }, c.onerror = () => {
        u(), s(new Error("PDF 局部 SVG 渲染失败"));
      }, r == null || r.addEventListener("abort", y, { once: !0 }), c.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(m)}`;
    }), i(), h.width = t, h.height = e;
    const f = h.getContext("2d", { willReadFrequently: !0 }), p = a.getContext("2d");
    if (!f || !p) throw new Error("PDF 局部回退无法获取 canvas 上下文");
    f.drawImage(c, 0, 0, t, e);
    const x = f.getImageData(0, 0, t, e).data;
    let d = t, l = e, w = -1, b = -1;
    for (let g = 0; g < e; g++) for (let s = 0; s < t; s++) x[(g * t + s) * 4 + 3] && (d = Math.min(d, s), l = Math.min(l, g), w = Math.max(w, s), b = Math.max(b, g));
    if (i(), w < d) return null;
    a.width = w - d + 1, a.height = b - l + 1, p.drawImage(h, d, l, a.width, a.height, 0, 0, a.width, a.height);
    const D = A(a, "PDF 局部 PNG 编码失败");
    return i(), { bytes: D, x: d / n, y: l / n, width: a.width / n, height: a.height / n };
  } finally {
    c.removeAttribute("src"), h.width = h.height = a.width = a.height = 0;
  }
}
export {
  M as normalizeVectorPdfImage,
  C as rasterizeVectorPdfObject
};
