import { DIR, startSite, launch, page, fitToWindow } from "./driver.mjs";
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp } = await launch({});
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
await fitToWindow(cdp, sessionId);
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
const links = await p.eval(`(async () => {
  const lib = await import(new URL("vendor/pdfjs/legacy/build/pdf.min.mjs", location.href).href);
  lib.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs/legacy/build/pdf.worker.min.mjs", location.href).href;
  const data = await (await fetch("./demo-assets/barnes-stein.pdf")).arrayBuffer();
  const pdf = await lib.getDocument({ data }).promise;
  const out = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const anns = await pg.getAnnotations({ intent: "display" });
    for (const a of anns.filter(x => x.subtype === "Link")) {
      let dest = null;
      if (a.dest) {
        try {
          const d = typeof a.dest === "string" ? await pdf.getDestination(a.dest) : a.dest;
          if (d) dest = (await pdf.getPageIndex(d[0])) + 1;
        } catch {}
      }
      out.push({ page: i, to: dest, url: a.url ?? null });
    }
  }
  return { pages: pdf.numPages, out };
})()`);
console.log("pages:", links.pages);
for (const l of links.out) console.log(`  p${l.page} -> ${l.to ?? "(external) " + l.url}`);
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
