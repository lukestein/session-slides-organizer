import { sleep } from "./cdp.mjs";
import { DIR, VIEW, startSite, launch, page, KEYS, Recorder, fitToWindow } from "./driver.mjs";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync } from "node:fs";

const PORT = 8099, SITE = DIR + "serve";
const ONE = "barnes-stein.pdf";
const REST = ["rd174_don_2026_lehigh.pdf", "Stein discussion - Hamdi et al.pptx",
              "Stein perceived skin tone NBER SI.key"];
const ALL = [ONE, ...REST];
const TITLES = ["Paper A", "Discussion A", "Paper B", "Discussion B"];
// Luke's own deck, shared with anyone who has the link. Its title, first slide
// and address are all on screen, so it must stay one he chose for this.
const GOOGLE = "https://docs.google.com/presentation/d/1xI_Som_kSUjr9tY1vDGqkquRlGC_YdYY3YUk31ccPW0/edit";
const SESSION = "Corporate finance 11am";
const makeVideo = process.argv.includes("--video");
const only = (process.argv.find(a => a.startsWith("--beats=")) || "").slice(8).split(",").filter(Boolean);
const want = name => !only.length || only.includes(name);
const log = (...a) => console.log(new Date().toISOString().slice(14, 22), ...a);

const site = await startSite(PORT, SITE);
const { chrome, cdp, wsUrl } = await launch({ downloads: DIR + "downloads" });

const attached = [];
cdp.on("Target.attachedToTarget", ({ sessionId, targetInfo }) => {
  if (targetInfo.type === "page") attached.push({ sessionId, targetInfo });
});
async function waitForPage(match, timeout = 20000) {
  const stop = Date.now() + timeout;
  while (Date.now() < stop) {
    const hit = attached.find(p => p.targetInfo.url.includes(match));
    if (hit) return hit;
    await sleep(100);
  }
  throw new Error("no page matching " + match);
}

const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
const listPage = { sessionId, targetInfo: { targetId, url: `http://127.0.0.1:${PORT}/` } };
const list = page(cdp, sessionId);
console.log("viewport:", JSON.stringify(await fitToWindow(cdp, sessionId)));
// Five rows run taller than the frame, and a scrollbar along the right edge
// reads as a stray line in the video.
await list.call("Emulation.setScrollbarsHidden", { hidden: true });
await list.call("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
await list.until("document.readyState === 'complete' && location.port === '" + PORT + "'");
await list.inject();
console.log('calibration:', JSON.stringify(await list.calibrate()));
const names = await list.eval(`__demo.load(${JSON.stringify(ALL)})`);
log("files loaded:", names.length);

const rec = new Recorder(wsUrl, DIR + "frames");
await rec.init();
await rec.focus(targetId);
rec.start();
const mark = {};
const beat = name => { mark[name] = Date.now() - rec.t0; log("beat", name); };

// ---------------------------------------------------------------- 1. one file
if (want("drop1")) {
  beat("drop1");
  await list.eval("__demo.show(true); __demo.place(1420, 820)");
  const zone = await list.box("#drop-zone");
  await list.eval(`__demo.ghost(${JSON.stringify([ONE])})`);
  await list.demo(`await __demo.glide(${zone.x + 70}, ${zone.y + 6}, 1000, 'out')`);
  await list.move(zone.x + 70, zone.y + 6);
  await list.eval(`__demo.drop(${JSON.stringify([ONE])})`);
  await sleep(420);
  await list.eval(`__demo.release(${JSON.stringify([ONE])})`);
  await list.until("__demo.rows().length === 1");
  await sleep(1100);
}

// ------------------------------------------------------------- 2. three files
if (want("drop3")) {
  beat("drop3");
  const zone = await list.box("#drop-zone");
  await list.demo(`await __demo.glide(1420, 800, 420, 'inout')`);
  await list.eval(`__demo.ghost(${JSON.stringify(REST)})`);
  await list.demo(`await __demo.glide(${zone.x - 40}, ${zone.y}, 950, 'out')`);
  await list.move(zone.x - 40, zone.y);
  await list.eval(`__demo.drop(${JSON.stringify(REST)})`);
  await sleep(420);
  await list.eval(`__demo.release(${JSON.stringify(REST)})`);
  await list.until("__demo.rows().length === 4");
  await list.settle();
}

// ------------------------------------------------------- 2b. a Google link
// Into the field under the drop zone, all at once, as a paste lands. The
// preview and the deck's name arrive from Google; the wait for them is cut.
if (want("link")) {
  beat("link");
  await list.settle();
  const field = await list.box("#link");
  await list.glide(field.left + 90, field.y, 650);
  await sleep(160);
  await list.click(field.left + 90, field.y);
  await sleep(300);
  await list.call("Input.insertText", { text: GOOGLE });
  await sleep(650);
  const add = await list.box("#add-link");
  await list.glide(add.x, add.y, 420);
  await sleep(150);
  const before = (await list.eval("__demo.rows()")).length;
  await list.click(add.x, add.y);
  await rec.cut(() => list.until(`document.querySelectorAll('#slides .slide').length > ${before}
    && !document.querySelector('#slides .slide:last-child img').hidden`, 30000), 350);
  await sleep(1300);
  console.log("  google row:", JSON.stringify((await list.eval("__demo.rows()")).at(-1)));
}

// ----------------------------------------------------------------- 3. reorder
if (want("reorder")) {
  beat("reorder");
  await list.settle();
  const from = await list.eval("__demo.rows().findIndex(r => r.name.endsWith('.pptx')) + 1");
  const handle = await list.box(`#slides .slide:nth-child(${from}) .order`);
  // Aim at the destination row's TOP edge: the dragged row's centre follows the
  // pointer, and it is that centre crossing a neighbour's that decides the swap.
  const target = await list.box("#slides .slide:nth-child(2)");
  await list.glide(handle.x, handle.y, 620);
  await sleep(200);
  await list.down(handle.x, handle.y);
  await sleep(150);
  console.log(`  cursor after down: ${JSON.stringify(await list.eval("__demo.at()"))} (handle ${handle.x},${handle.y})`);
  const midY = Math.round((handle.y + target.top) / 2);
  await list.glide(handle.x, midY, 440, 1);
  console.log(`  cursor mid-drag: ${JSON.stringify(await list.eval("__demo.at()"))} (want ${handle.x},${midY})`);
  await list.glide(handle.x, target.top + 2, 440, 1);
  await sleep(380);
  await list.up(handle.x, target.top + 2);
  await sleep(600);
  console.log("  order now:", (await list.eval("__demo.rows()")).map(r => r.name.slice(0, 12)).join(" | "));
}

// ------------------------------------------------------------------ 4. rename
// One click into the first title, then Tab along the row. The app moves focus
// itself on Tab and selects the next title, so there is no pointer work between
// fields and the typing is the only thing on screen.
if (want("rename")) {
  beat("rename");
  await list.settle();
  const first = await list.box("#slides .slide:nth-child(1) .title");
  await list.glide(first.left + 60, first.y, 460);
  await sleep(130);
  await list.click(first.left + 60, first.y, 3);   // triple click selects the title
  await sleep(190);
  for (const [i, text] of TITLES.entries()) {
    await list.type(text, 30);
    if (i === TITLES.length - 1) break;
    await sleep(120);
    await list.key("Tab", KEYS.Tab);
    await sleep(150);
  }
  await sleep(170);
  await list.key("Enter", KEYS.Enter);
  await sleep(450);
  console.log("  titles now:", (await list.eval("__demo.rows()")).map(r => r.title).join(" | "));
}

// -------------------------------------------------- 5 & 6. present in browser
// barnes-stein.pdf is built the way conference decks usually are: page 5 carries a
// link out to the regression table on page 15, and page 15 carries one back. That
// pair is what the link beat follows. probe-links.mjs prints the whole map.
const LINK_PAGE = 5;

async function openPresenter(rowSelector, label) {
  await list.settle();
  const open = await list.box(`${rowSelector} .open-pdf`);
  await list.glide(open.x, open.y, 620);
  await sleep(190);
  const before = attached.length;
  await list.click(open.x, open.y);
  const deadline = Date.now() + 15000;
  while (attached.length === before) {
    if (Date.now() > deadline) throw new Error(`${label}: clicking "Open in browser" opened no tab`);
    await sleep(60);
  }
  const entry = attached[attached.length - 1];
  const deck = page(cdp, entry.sessionId);
  await cdp.send("Target.activateTarget", { targetId: entry.targetInfo.targetId });
  await rec.focus(entry.targetInfo.targetId);
  await deck.inject();
  await deck.until("!!document.querySelector('#deck-count')?.textContent.trim()", 40000);
  // The popup does not reliably inherit the override; check rather than assume.
  await deck.call("Emulation.setDeviceMetricsOverride",
    { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.scale, mobile: false });
  await sleep(250);
  // Calibrate AFTER that, never before: applying the override can change the
  // viewport, and a mapping measured beforehand is then wrong by exactly that
  // factor. Every later click lands somewhere else -- which once put a click
  // meant for a slide link onto a picker thumbnail instead.
  await deck.calibrate();
  const seen = await deck.eval("[innerWidth, innerHeight]");
  console.log(`  ${label} viewport: ${seen} (want ${[VIEW.width, VIEW.height]})`,
    seen[1] === VIEW.height ? "OK" : "*** MISMATCH: frame will be clipped ***");
  console.log(`  ${label} rendered: ${await deck.eval("document.querySelector('#deck-count').textContent")}`);
  // Park the pointer against the right edge and hide it: nobody wants a cursor
  // sitting on a slide. .deck-edge reacts to focus-visible, not hover.
  const park = [VIEW.width - 8, Math.round(VIEW.height * 0.4)];
  await deck.move(park[0], park[1]);
  await deck.eval("__demo.show(false)");
  await sleep(450);
  return { deck, park, entry };
}

async function closePresenter(entry) {
  await sleep(300);
  await cdp.send("Target.closeTarget", { targetId: entry.targetInfo.targetId });
  await rec.focus(targetId);
  await cdp.send("Target.activateTarget", { targetId });
  await sleep(500);
}

const page_no = deck => deck.eval("parseInt(document.querySelector('#deck-count').textContent, 10)");

// Open the picker, jump to one slide, close it again. Approaches down the right
// edge and in along the strip so the pointer never crosses the slide, and hides
// the moment it clicks, because the picker closes out from under it.
//
// The strip scrolls itself to centre the current slide, so a fixed nth-child is
// usually outside the viewport: the click then lands on nothing and the jump
// silently does not happen. Choose from the thumbnails actually on screen.
async function jumpVia(deck, park, pick) {
  const from = await page_no(deck);
  await deck.key("g", KEYS.g);
  await sleep(750);
  const thumbs = await deck.eval(`[...document.querySelector('#deck-picker').children].map((el, i) => {
    const r = el.getBoundingClientRect();
    return { n: i + 1, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
             on: r.width > 0 && r.left >= 4 && r.right <= innerWidth - 4 };
  }).filter(t => t.on)`);
  if (!thumbs.length) {
    console.log("  picker jump: no thumbnail on screen");
    await deck.key("Escape", KEYS.Escape);
    await sleep(400);
    return;
  }
  const thumb = pick(thumbs);
  await deck.eval("__demo.show(true)");
  await deck.glide(park[0], thumb.y, 320);
  await deck.glide(thumb.x, thumb.y, 440);
  await sleep(150);
  await deck.click(thumb.x, thumb.y);
  await sleep(220);
  await deck.eval("__demo.show(false)");
  await deck.move(park[0], park[1]);
  await sleep(650);
  console.log(`  picker jump: ${from} -> ${await page_no(deck)} (thumb ${thumb.n} of ${thumbs.length} on screen)`);
}

if (want("pdf")) {
  beat("pdf");
  const { deck, park, entry } = await openPresenter("#slides .slide:nth-child(1)", "pdf");

  // The shortcut card first, over the cover slide: it names the keys the rest of
  // the beat then actually uses.
  await deck.key("?", KEYS["?"]);
  await sleep(1400);
  await deck.key("Escape", KEYS.Escape);
  await sleep(600);

  // Straight to the slide carrying a link, through the picker, rather than
  // paging there: the demo is about managing the session, not reading slides.
  await jumpVia(deck, park, t => t.find(x => x.n === LINK_PAGE) ?? t[t.length - 1]);
  while (await page_no(deck) < LINK_PAGE) {
    await deck.key("ArrowRight", KEYS.ArrowRight);
    await sleep(700);
  }
  await deck.until("!!document.querySelector('.annotationLayer a')", 15000);

  // Follow the link out to the appendix, then the one that comes back. The
  // pointer is visible here on purpose -- clicking the link is the point.
  await deck.eval("__demo.show(true)");
  for (const leg of ["out", "back"]) {
    const from = await page_no(deck);
    const link = await deck.box(".annotationLayer a");
    await deck.glide(link.x, link.y, 620);
    await sleep(240);
    // Chrome fires a synthetic pointermove at the user's REAL mouse position
    // whenever the page relayouts. If their pointer happens to rest near the
    // foot of the window the app lifts the slide picker over the slide -- quite
    // correctly -- and this click lands on a thumbnail instead of the link.
    // Check what is actually under the point, and clear it if it is not the link.
    const under = () => deck.eval(`(() => { const e = document.elementFromPoint(${link.x}, ${link.y});
      return e && e.closest(".annotationLayer a") ? "link" : "blocked"; })()`);
    for (let i = 0; i < 4 && await under() === "blocked"; i++) {
      await deck.key("Escape", KEYS.Escape);
      await deck.move(park[0], park[1]);
      await sleep(260);
      await deck.move(link.x, link.y);
      await sleep(160);
    }
    if (await under() === "blocked") throw new Error("link is covered; cannot click it");
    await deck.click(link.x, link.y);
    await deck.until(`parseInt(document.querySelector('#deck-count').textContent, 10) !== ${from}`, 10000);
    console.log(`  link ${leg}: ${from} -> ${await page_no(deck)}`);
    await sleep(1150);
    await deck.until("!!document.querySelector('.annotationLayer a')", 15000);
  }
  await deck.eval("__demo.show(false)");
  await deck.move(park[0], park[1]);
  await closePresenter(entry);
}

if (want("pptx")) {
  beat("pptx");
  const idx = await list.eval("__demo.rows().findIndex(r => r.name.endsWith('.pptx')) + 1");
  const { deck, park, entry } = await openPresenter(`#slides .slide:nth-child(${idx})`, "pptx");
  await sleep(500);
  await deck.key("ArrowRight", KEYS.ArrowRight);
  await sleep(1000);
  await closePresenter(entry);
}

// ------------------------------------------------------------- 6b. Get PDF
// The Google row becomes an ordinary PDF row, dagger and all. The download
// from Google is cut.
if (want("getpdf")) {
  beat("getpdf");
  await list.settle();
  const button = await list.box("#slides .get-pdf:not([hidden])");
  await list.glide(button.x, button.y, 650);
  await sleep(200);
  await list.click(button.x, button.y);
  await rec.cut(() => list.until(`!document.querySelector('#slides .get-pdf:not([hidden])')
    && !!document.querySelector('#slides .source-link:not([hidden])')`, 60000), 300);
  await list.settle();
  await sleep(1500);
  console.log("  pdf row:", JSON.stringify((await list.eval("__demo.rows()")).at(-1)));
}

// --------------------------------------------------------------------- 7. zip
if (want("zip")) {
  beat("zip");
  await list.settle();
  const field = await list.box("#zip-name");
  await list.glide(field.left + 50, field.y, 650);
  await sleep(180);
  await list.click(field.left + 50, field.y, 3);
  await sleep(300);
  await list.type(SESSION, 38);
  await sleep(400);
  const dl = await list.box("#export");
  await list.glide(dl.x, dl.y, 600);
  await sleep(200);
  await list.click(dl.x, dl.y);
  await sleep(1300);
}

// ------------------------------------------------------------- 8. pick it up
// Later, on the room computer: a fresh organizer, and the ZIP from the last
// beat dropped back in. The reload between is cut.
if (want("import")) {
  beat("import");
  const zipName = `${SESSION}.zip`;
  const saved = DIR + "downloads/" + zipName;
  const deadline = Date.now() + 15000;
  while (!existsSync(saved) && Date.now() < deadline) await sleep(100);
  if (!existsSync(saved)) throw new Error(`no ${zipName} in downloads/: ${readdirSync(DIR + "downloads")}`);
  copyFileSync(saved, SITE + "/demo-assets/" + zipName);
  // A new tab rather than a reload of this one: the recorder's screenshot call
  // into a page mid-navigation never returns, and stalls the capture for good.
  const fresh = await rec.cut(async () => {
    const { targetId: id } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId: sid } = await cdp.send("Target.attachToTarget", { targetId: id, flatten: true });
    const tab = page(cdp, sid);
    await tab.call("Emulation.setDeviceMetricsOverride",
      { width: VIEW.width, height: VIEW.height, deviceScaleFactor: VIEW.scale, mobile: false });
    await tab.call("Emulation.setScrollbarsHidden", { hidden: true });
    await tab.call("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    await tab.until("document.readyState === 'complete' && location.port === '" + PORT + "'");
    await tab.inject();
    await tab.calibrate();
    await tab.eval(`__demo.load(${JSON.stringify([zipName])})`);
    await tab.eval("__demo.show(true); __demo.place(1420, 820)");
    await cdp.send("Target.activateTarget", { targetId: id });
    await rec.focus(id);
    await sleep(150);
    return tab;
  }, 0);
  await sleep(700);
  const zone = await fresh.box("#drop-zone");
  await fresh.eval(`__demo.ghost(${JSON.stringify([zipName])})`);
  await fresh.demo(`await __demo.glide(${zone.x + 70}, ${zone.y + 6}, 1000, 'out')`);
  await fresh.move(zone.x + 70, zone.y + 6);
  await fresh.eval(`__demo.drop(${JSON.stringify([zipName])})`);
  await sleep(420);
  await fresh.eval(`__demo.release(${JSON.stringify([zipName])})`);
  await fresh.until("document.querySelectorAll('#slides .slide').length >= 5", 20000);
  await fresh.eval("__demo.show(false)");
  await fresh.settle();
  console.log("  restored:", JSON.stringify((await fresh.eval("__demo.rows()")).map(r => r.title)),
    "as", await fresh.eval("document.querySelector('#zip-name').value"));
  await sleep(2200);
}

console.log("final rows:", JSON.stringify(await list.eval("__demo.rows().map(r => [r.name.slice(0,16), r.title.slice(0,20)])")));
const stats = await rec.stop();
log("captured", stats.frames, "frames over", (stats.ms / 1000).toFixed(1), "s",
    "=", (stats.frames / (stats.ms / 1000)).toFixed(1), "fps");
console.log("beats:", JSON.stringify(mark));

if (makeVideo) {
  rec.writeList(DIR + "frames/list.txt");
  const r = spawnSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", DIR + "frames/list.txt",
    "-fps_mode", "cfr", "-r", "30",
    "-vf", "scale=1920:1080:flags=lanczos,setsar=1",
    "-c:v", "libx264", "-preset", "slow", "-crf", "19",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", DIR + "demo.mp4"],
    { stdio: ["ignore", "ignore", "pipe"] });
  console.log(r.status === 0 ? "video: " + DIR + "demo.mp4" : r.stderr.toString().slice(-1500));
}

await cdp.send("Browser.close").catch(() => {});
cdp.close(); chrome.kill(); site.kill();
process.exit(0);
