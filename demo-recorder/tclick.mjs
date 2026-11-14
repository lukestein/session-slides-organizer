import { sleep } from "./cdp.mjs";
import { DIR, startSite, launch, page, fitToWindow, Recorder } from "./driver.mjs";
const ALL = ["barnes-stein.pdf", "rd174_don_2026_lehigh.pdf",
  "Stein discussion - Hamdi et al.pptx", "Stein perceived skin tone NBER SI.key"];
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp, wsUrl } = await launch({});
const attached = [];
cdp.on("Target.attachedToTarget", ({ targetInfo }) => { if (targetInfo.type === "page") attached.push(targetInfo.url); });
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
console.log("viewport:", JSON.stringify(await fitToWindow(cdp, sessionId)));
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
await p.inject();
console.log("calib:", JSON.stringify(await p.calibrate()));
await p.eval(`__demo.load(${JSON.stringify(ALL)})`);
await p.eval(`__demo.place(700, 500); __demo.release(${JSON.stringify(ALL)})`);
await p.until("__demo.rows().length === 4");
await sleep(2500);
let rec;
if (process.argv.includes("--rec")) {
  rec = new Recorder(wsUrl, DIR + "frames-tclick");
  await rec.init(); await rec.focus(targetId); rec.start();
  console.log("recorder running");
}
await p.eval(`window.__log = []; for (const k of ['pointerdown','mousedown','click','pointerup'])
  document.addEventListener(k, e => __log.push([k, Math.round(e.clientX), Math.round(e.clientY), e.isTrusted,
    (e.target.className||'').toString().slice(0,24)]), true);`);
const box = await p.box("#slides .slide:nth-child(1) .open-pdf");
console.log("box:", JSON.stringify(box));
await p.move(box.x, box.y);
await sleep(120);
console.log("cursor after move:", JSON.stringify(await p.eval("__demo.at()")));
const n = attached.length;
await p.click(box.x, box.y);
await sleep(1500);
console.log("received:", JSON.stringify(await p.eval("__log")));
console.log("new page targets:", attached.length - n, attached.slice(n));
if (rec) console.log("frames:", (await rec.stop()).frames);
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
