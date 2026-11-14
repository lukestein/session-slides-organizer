import { sleep } from "./cdp.mjs";
import { DIR, startSite, launch, page } from "./driver.mjs";
const ALL = ["barnes-stein.pdf", "rd174_don_2026_lehigh.pdf",
  "Stein discussion - Hamdi et al.pptx", "Stein perceived skin tone NBER SI.key"];
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp } = await launch({});
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
await p.inject();
await p.calibrate();
await p.eval(`__demo.load(${JSON.stringify(ALL)})`);
await p.eval(`__demo.place(700, 500); __demo.release(${JSON.stringify(ALL)})`);
await p.until("__demo.rows().length === 4");
await sleep(2500);
await p.eval(`window.__c = {down:0, move:0, up:0, cap:0, lost:0};
  const l = document.querySelector('#slides');
  l.addEventListener('pointerdown', () => __c.down++, true);
  l.addEventListener('pointermove', () => __c.move++, true);
  l.addEventListener('pointerup', () => __c.up++, true);
  l.addEventListener('gotpointercapture', () => __c.cap++, true);
  l.addEventListener('lostpointercapture', () => __c.lost++, true);`);
const handle = await p.box("#slides .slide:nth-child(4) .order");
const second = await p.box("#slides .slide:nth-child(2)");
console.log("handle:", JSON.stringify(handle), "second y:", second.y);
console.log("before:", (await p.eval("__demo.rows()")).map(r => r.name.slice(0, 18)));
await p.glide(handle.x, handle.y, 400);
await sleep(150);
await p.down(handle.x, handle.y);
await sleep(150);
console.log("after down:", JSON.stringify(await p.eval("__c")),
  "dragging rows:", await p.eval("document.querySelectorAll('#slides .dragging').length"),
  "reordering:", await p.eval("document.querySelector('#slides').classList.contains('reordering')"));
await p.glide(handle.x, second.y - 6, 800, 1);
await sleep(200);
console.log("after glide:", JSON.stringify(await p.eval("__c")),
  "dragging rows:", await p.eval("document.querySelectorAll('#slides .dragging').length"));
await p.up(handle.x, second.y - 6);
await sleep(600);
console.log("after up:", JSON.stringify(await p.eval("__c")));
console.log("after:", (await p.eval("__demo.rows()")).map(r => r.name.slice(0, 18)));
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
