import { CDP } from "./cdp.mjs";
const list = await (await fetch("http://127.0.0.1:9345/json/list")).json();
const t = list.find(x => x.type === "page" && x.url.includes("8099"));
const c = await CDP.connect(t.webSocketDebuggerUrl);
const r = await c.send("Runtime.evaluate", { expression: `(() => {
  const row = document.querySelector('#slides .slide:nth-child(1)');
  const a = row.querySelector('.open-pdf');
  const b = a.getBoundingClientRect();
  return JSON.stringify({
    rows: [...document.querySelectorAll('#slides .slide')].map(r => r.querySelector('.filename').textContent),
    hidden: a.hidden, href: a.href.slice(0, 70), target: a.target,
    box: {x: Math.round(b.x+b.width/2), y: Math.round(b.y+b.height/2), w: Math.round(b.width), h: Math.round(b.height)},
    atPoint: (document.elementFromPoint(Math.round(b.x+b.width/2), Math.round(b.y+b.height/2))||{}).className,
    cursor: window.__demo ? __demo.at() : null,
    inner: [innerWidth, innerHeight], dpr: devicePixelRatio,
  });
})()`, returnByValue: true });
console.log(r.result.value);
c.close(); process.exit(0);
