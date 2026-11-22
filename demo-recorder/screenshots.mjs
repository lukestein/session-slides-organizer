// Takes the still screenshots the top-level README embeds, from the same
// serve/ copy and the same throwaway Chrome the demo video uses -- so, like the
// video, it needs no macOS screen-recording or accessibility permission and
// nothing outside the page can appear in frame.
//
//   ./sync.sh && node screenshots.mjs        # writes demo-recorder/shots-readme/
//
// Copy the ones worth keeping into ../media/. Like the video they show real slide
// content from the sample decks, so look before committing.
import { sleep } from "./cdp.mjs";
import { DIR, VIEW, startSite, launch, page, KEYS, fitToWindow } from "./driver.mjs";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = 8098, SITE = DIR + "serve", OUT = DIR + "shots-readme/";
const WIDTH = 1280, RATIO = 16 / 10, DPR = 1.25;           // 1600x1000 images
// Positioned as the final README shows them: paper, discussion, paper, discussion.
const ALL = ["barnes-stein.pdf", "Stein discussion - Hamdi et al.pptx",
             "rd174_don_2026_lehigh.pdf", "Stein perceived skin tone NBER SI.key"];
const TITLES = ["Paper A", "Discussion A", "Paper B", "Discussion B", "Closing talk"];
const GOOGLE = "https://docs.google.com/presentation/d/1xI_Som_kSUjr9tY1vDGqkquRlGC_YdYY3YUk31ccPW0/edit";
const PDF_SLIDE = 7;
mkdirSync(OUT, { recursive: true });

const site = await startSite(PORT, SITE);
const { chrome, cdp } = await launch({});
const attached = [];
cdp.on("Target.attachedToTarget", ({ sessionId, targetInfo }) => {
  if (targetInfo.type === "page") attached.push({ sessionId, targetInfo });
});

const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const list = page(cdp, sessionId);
await fitToWindow(cdp, sessionId, WIDTH, RATIO);
// fitToWindow emulates a 1920-wide capture; ask for the README size instead.
const setDpr = async p => p.call("Emulation.setDeviceMetricsOverride",
  { width: VIEW.width, height: VIEW.height, deviceScaleFactor: DPR, mobile: false });
await setDpr(list);
await list.call("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
await list.until("document.readyState === 'complete' && location.port === '" + PORT + "'");
await list.inject();
await list.calibrate();

async function shot(p, name) {
  await sleep(500);
  const { data } = await p.call("Page.captureScreenshot", { format: "png" });
  writeFileSync(OUT + name, Buffer.from(data, "base64"));
  console.log("wrote", name);
}

// 1. Four local decks and a Google Slides PDF, matching the social demo.
await list.eval(`__demo.load(${JSON.stringify(ALL)})`);
const zone = await list.box("#drop-zone");
await list.eval(`__demo.place(${zone.x}, ${zone.y})`);
await list.eval(`__demo.drop(${JSON.stringify(ALL)})`);
await list.eval(`__demo.release(${JSON.stringify(ALL)})`);
await list.until("__demo.rows().length === 4");
await list.settle();
const link = await list.box("#link");
await list.click(link.x, link.y);
await list.call("Input.insertText", { text: GOOGLE });
const add = await list.box("#add-link");
await list.click(add.x, add.y);
await list.until(`__demo.rows().length === 5 && (() => {
  const img = document.querySelector('#slides .slide:last-child img');
  return img && !img.hidden && img.complete && img.naturalWidth > 0;
})()`, 30000);
await list.settle();
const getPdf = await list.box("#slides .get-pdf:not([hidden])");
await list.click(getPdf.x, getPdf.y);
await list.until(`!document.querySelector('#slides .get-pdf:not([hidden])')
  && !!document.querySelector('#slides .source-link:not([hidden])')`, 60000);
await list.settle();
const first = await list.box("#slides .slide:nth-child(1) .title");
await list.click(first.left + 60, first.y, 3);
await sleep(200);
for (const [i, text] of TITLES.entries()) {
  await list.type(text, 10);
  if (i < TITLES.length - 1) { await list.key("Tab", KEYS.Tab); await sleep(150); }
}
await list.key("Enter", KEYS.Enter);
const zip = await list.box("#zip-name");
await list.click(zip.left + 50, zip.y, 3);
await list.type("Corporate finance 11am", 10);
await list.key("Enter", KEYS.Enter);
await list.eval("document.activeElement?.blur()");
// Park the pointer well out of frame: nothing should look hovered.
await list.eval(`__demo.place(${VIEW.width - 4}, ${VIEW.height - 4})`);
await list.settle();
// A little taller than the 16:10 frame, so the whole list and the footer fit
// without a scrollbar.
await list.call("Emulation.setDeviceMetricsOverride",
  { width: VIEW.width, height: Math.max(860, await list.eval("document.documentElement.scrollHeight")),
    deviceScaleFactor: DPR, mobile: false });
await list.calibrate();
await shot(list, "01-list.png");

// 2. The presenters.
async function openPresenter(row) {
  const open = await list.box(`${row} .open-pdf`);
  await list.eval(`__demo.place(${open.x}, ${open.y})`);
  const before = attached.length;
  await list.click(open.x, open.y);
  for (let i = 0; attached.length === before; i++) {
    if (i > 250) throw new Error("no presenter tab opened");
    await sleep(60);
  }
  const entry = attached[attached.length - 1];
  const deck = page(cdp, entry.sessionId);
  await cdp.send("Target.activateTarget", { targetId: entry.targetInfo.targetId });
  await deck.inject();
  await deck.until("!!document.querySelector('#deck-count')?.textContent.trim()", 40000);
  await setDpr(deck);
  await deck.calibrate();
  // Park the pointer against the edge and hide it, so no cursor sits on a slide.
  await deck.move(VIEW.width - 8, Math.round(VIEW.height * 0.4));
  await deck.eval("__demo.show(false)");
  await sleep(600);
  return { deck, entry };
}
const pageNo = deck => deck.eval("parseInt(document.querySelector('#deck-count').textContent, 10)");

{
  const { deck, entry } = await openPresenter("#slides .slide:nth-child(1)");
  while (await pageNo(deck) < PDF_SLIDE) {
    await deck.key("ArrowRight", KEYS.ArrowRight);
    await sleep(1000);
  }
  await sleep(800);
  await shot(deck, "02-presenter.png");
  await deck.key("g", KEYS.g);
  await sleep(1500);
  await shot(deck, "03-picker.png");
  await deck.key("Escape", KEYS.Escape);
  await sleep(500);
  await deck.key("?", KEYS["?"]);
  await sleep(700);
  await shot(deck, "04-shortcuts.png");
  await cdp.send("Target.closeTarget", { targetId: entry.targetInfo.targetId });
  await sleep(500);
}

{
  const { deck, entry } = await openPresenter("#slides .slide:nth-child(2)");
  await deck.key("ArrowRight", KEYS.ArrowRight);
  await sleep(1400);
  await shot(deck, "05-powerpoint.png");
  await cdp.send("Target.closeTarget", { targetId: entry.targetInfo.targetId });
}

await cdp.send("Browser.close").catch(() => {});
cdp.close(); chrome.kill(); site.kill();
process.exit(0);
