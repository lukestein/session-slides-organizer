import { slideToPng as w } from "./core.js";
import { g, h as b, s as E, P } from "./document-Sjh4KWFC.js";
const l = 32767;
function N(n, e) {
  if (!Number.isFinite(e) || e <= 0)
    throw new RangeError("scale 必须是大于 0 的有限数");
  const a = Math.round(n.width * e), o = Math.round(n.height * e);
  if (a < 1 || o < 1 || a > l || o > l)
    throw new RangeError(`scale 产生了浏览器 canvas 不支持的尺寸：${a}×${o}`);
  return { width: a, height: o };
}
async function A(n, e = {}) {
  var f, m;
  const a = e.scale ?? 2, o = N(n, a);
  if (o.width * o.height > 16e6) throw new Error("PDF 单页不能超过 1600 万像素，请降低导出倍率");
  const s = [];
  n.slides.forEach((t, i) => {
    if (e.skipHidden && t.hidden) return;
    const r = e.animationSteps ? g(t.animations) : [];
    if (r.length) for (let h = 0; h <= r.length; h++) s.push({ slide: t, slideNumber: i + 1, hidden: [...b(r, h)] });
    else s.push({ slide: t, slideNumber: i + 1, hidden: [...E(t)] });
  });
  const c = new P(n.width * 0.75, n.height * 0.75, e.title), d = () => {
    var t;
    if ((t = e.signal) != null && t.aborted) throw new DOMException("PDF 导出已取消", "AbortError");
  };
  for (let t = 0; t < s.length; t++) {
    d();
    const i = s[t];
    try {
      const r = await w(n, i.slide, a, { showComments: e.showComments, hiddenElements: i.hidden, strictResources: !0 });
      d(), c.addPage(new Uint8Array(await r.arrayBuffer()), e.showComments ? i.slide.comments : void 0);
    } catch (r) {
      throw (f = e.signal) != null && f.aborted && d(), new Error(`第 ${i.slideNumber} 页 PDF 导出失败：${r instanceof Error ? r.message : String(r)}`);
    }
    (m = e.onProgress) == null || m.call(e, { completed: t + 1, total: s.length, slideNumber: i.slideNumber });
  }
  d();
  const u = c.finish();
  return new Blob([u.buffer], { type: "application/pdf" });
}
export {
  P as PdfDocument,
  A as presentationToPdf
};
