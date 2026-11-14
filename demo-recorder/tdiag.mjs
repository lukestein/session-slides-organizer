import { sleep } from "./cdp.mjs";
import { DIR, startSite, launch, page, Recorder } from "./driver.mjs";
const ALL = ["barnes-stein.pdf", "rd174_don_2026_lehigh.pdf",
  "Stein discussion - Hamdi et al.pptx", "Stein perceived skin tone NBER SI.key"];
const site = await startSite(8099, DIR + "serve");
const { chrome, cdp, wsUrl } = await launch({});
const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const p = page(cdp, sessionId);
await p.call("Page.navigate", { url: "http://127.0.0.1:8099/" });
await p.until("document.readyState === 'complete' && location.port === '8099'");
await p.inject();
console.log("calib", JSON.stringify(await p.calibrate()));
await p.eval(`__demo.load(${JSON.stringify(ALL)})`);
await p.eval(`__demo.place(700, 500); __demo.release(${JSON.stringify(ALL)})`);
await p.until("__demo.rows().length === 4");
await sleep(2500);
const rec = new Recorder(wsUrl, DIR + "frames-diag");
await rec.init(); await rec.focus(targetId); rec.start();

const dump = async label => {
  const d = await p.eval(`(() => {
    const l = document.querySelector('#slides');
    return { listClass: l.className, scroll: [scrollX, scrollY],
      rows: [...l.querySelectorAll('.slide')].map(r => {
        const b = r.getBoundingClientRect();
        return [r.querySelector('.filename').textContent.slice(0,14), Math.round(b.top), Math.round(b.height),
                r.className, r.style.transform || '-'];
      }) };
  })()`);
  console.log(label, JSON.stringify(d, null, 0));
};
await dump("BEFORE");
const handle = await p.box("#slides .slide:nth-child(4) .order");
const second = await p.box("#slides .slide:nth-child(2)");
console.log("handle", JSON.stringify(handle), "second", JSON.stringify(second));
await p.glide(handle.x, handle.y, 650);
await sleep(220);
await p.down(handle.x, handle.y);
await sleep(160);
await dump("AFTER DOWN");
await p.glide(handle.x, second.top + 2, 1000, 1);
await sleep(420);
await dump("AT TARGET");
console.log("cursor", JSON.stringify(await p.eval("__demo.at()")));
await p.up(handle.x, second.top + 2);
await sleep(900);
await dump("AFTER UP");
await rec.stop();
await cdp.send("Browser.close").catch(()=>{}); cdp.close(); chrome.kill(); site.kill(); process.exit(0);
