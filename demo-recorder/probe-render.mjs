// How long does a page take to paint? That is exactly how long the canvas sits
// blank between slides, so it decides whether double-buffering is worth it.
import { DIR, startSite, launch, page, fitToWindow } from "./driver.mjs";
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp } = await launch({});
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
await fitToWindow(cdp, sessionId);
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
const file = process.argv[2] || "barnes-stein.pdf";
const r = await p.eval(`(async () => {
  const lib = await import(new URL("vendor/pdfjs/legacy/build/pdf.min.mjs", location.href).href);
  lib.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs/legacy/build/pdf.worker.min.mjs", location.href).href;
  const data = await (await fetch("./demo-assets/${file}")).arrayBuffer();
  const pdf = await lib.getDocument({ data }).promise;
  // Same geometry the presenter uses: fit the page into the stage, at dpr.
  const stage = { width: innerWidth - 64, height: innerHeight - 48 - 64 };
  const ratio = devicePixelRatio || 1;
  const times = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const natural = pg.getViewport({ scale: 1 });
    const scale = Math.min(stage.width / natural.width, stage.height / natural.height);
    const viewport = pg.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width * ratio);
    canvas.height = Math.ceil(viewport.height * ratio);
    const t0 = performance.now();
    await pg.render({ canvas, viewport, transform: [ratio, 0, 0, ratio, 0, 0] }).promise;
    times.push(Math.round(performance.now() - t0));
  }
  return times;
})()`);
const sorted = [...r].sort((a, b) => a - b);
console.log(`${file}: ${r.length} pages`);
console.log("  per page ms:", r.join(" "));
console.log(`  median ${sorted[Math.floor(sorted.length / 2)]}ms  min ${sorted[0]}ms  max ${sorted.at(-1)}ms`);
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
