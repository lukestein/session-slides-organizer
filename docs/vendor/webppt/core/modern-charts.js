import { safeUnzipSync as i } from "./zip.js";
import { setChartExParser as o } from "./core.js";
let a;
async function m(r) {
  const t = r instanceof Uint8Array ? r : new Uint8Array(r);
  if (t[0] !== 80 || t[1] !== 75) return;
  let n;
  try {
    n = i(t, { filter: (e) => e.name === "[Content_Types].xml" && e.originalSize <= 4 * 1024 * 1024 })["[Content_Types].xml"];
  } catch {
    return;
  }
  if (!(!n || !new TextDecoder().decode(n).includes("vnd.ms-office.chartex+xml")))
    try {
      a ?? (a = import("./chart-ex.js").then(({ parseChartEx: e }) => e)), o(await a);
    } catch {
      a = void 0;
    }
}
export {
  m as prepareModernCharts
};
