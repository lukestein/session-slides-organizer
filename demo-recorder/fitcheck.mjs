import { sleep } from "./cdp.mjs";
import { DIR, startSite, launch, page, fitToWindow } from "./driver.mjs";
const ALL = ["barnes-stein.pdf", "rd174_don_2026_lehigh.pdf",
  "Stein discussion - Hamdi et al.pptx", "Stein perceived skin tone NBER SI.key"];
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp } = await launch({});
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
console.log("viewport:", JSON.stringify(await fitToWindow(cdp, sessionId)));
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
await p.inject();
await p.eval(`__demo.load(${JSON.stringify(ALL)})`);
await p.eval(`__demo.place(700, 500); __demo.release(${JSON.stringify(ALL)})`);
await p.until("__demo.rows().length === 4");
await p.settle();
console.log("fit:", JSON.stringify(await p.eval(`({ content: document.documentElement.scrollHeight,
  viewport: innerHeight, slack: innerHeight - document.documentElement.scrollHeight,
  scrolls: document.documentElement.scrollHeight > innerHeight })`)));
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
