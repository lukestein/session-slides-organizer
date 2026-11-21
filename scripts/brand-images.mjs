// Renders the PNG icons and the link-preview card from docs/favicon.svg and
// the HTML below. Run from the repository root after changing the name, the
// tagline or the mark:
//
//   node scripts/brand-images.mjs
//
// Needs Playwright with Chromium (npx playwright install chromium).
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const mark = await readFile("docs/favicon.svg", "utf8");
const font = (await readFile("docs/vendor/instrument-sans/instrument-sans-latin-wght-normal.woff2")).toString("base64");

const fontFace = `@font-face { font-family: "Instrument Sans"; font-weight: 400 700;
  src: url(data:font/woff2;base64,${font}) format("woff2"); }`;

const rows = [
  ["Opening paper", "PDF · 23 pages"],
  ["Discussion", "PowerPoint · 13 slides"],
  ["Second paper", "Google Slides · 32 pages"],
];

const card = `<!doctype html><html><head><style>
${fontFace}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; font-family: "Instrument Sans"; background: #f5f7f3; color: #1c3028;
  display: grid; grid-template-columns: 1fr 610px; align-items: center; gap: 48px; padding: 0 72px;
  border-top: 18px solid #006644; }
.mark svg { width: 96px; height: 96px; }
h1 { margin-top: 30px; font-size: 56px; line-height: 1.02; letter-spacing: -.03em; font-weight: 700; }
p { margin-top: 26px; font-size: 27px; line-height: 1.4; color: #52645a; }
ol { list-style: none; padding: 0; display: grid; gap: 16px; }
li { display: grid; grid-template-columns: 34px 104px 1fr 150px; align-items: center; gap: 18px;
  padding: 16px 20px; background: #fff; border: 1px solid #d8e1d9; border-radius: 16px;
  box-shadow: 0 3px 8px #12362510; }
.n { color: #006644; font-size: 30px; font-weight: 700; text-align: center; }
.thumb { aspect-ratio: 16/10; border-radius: 6px; border: 1px solid #d8e1d9;
  background: linear-gradient(#006644 0 22%, #fff 22%); position: relative; }
.thumb::after { content: ""; position: absolute; left: 12%; right: 30%; top: 40%; height: 9%;
  background: #c9d7c8; box-shadow: 0 14px 0 #e3eddf, 0 28px 0 #e3eddf; border-radius: 3px; }
.t { font-size: 23px; font-weight: 650; }
.d { margin-top: 4px; font-size: 16px; color: #52645a; }
.b { height: 50px; border-radius: 10px; background: #006644; color: #fff; display: grid; place-items: center;
  font-size: 17px; font-weight: 650; }
</style></head><body>
<div><div class="mark">${mark}</div><h1>Session Slides Organizer</h1>
<p>Every speaker’s slides in one list, in speaking order. Present from the browser. Nothing uploaded.</p></div>
<ol>${rows.map(([title, detail], index) => `<li><span class="n">${index + 1}</span><span class="thumb"></span>
<span><div class="t">${title}</div><div class="d">${detail}</div></span><span class="b">Open in browser</span></li>`).join("")}</ol>
</body></html>`;

const icon = size => `<!doctype html><html><head><style>* { margin: 0; } svg { display: block; width: ${size}px; height: ${size}px; }</style></head><body>${mark}</body></html>`;

const browser = await chromium.launch();
async function render(html, width, height, path) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, omitBackground: true });
  await page.close();
}
await render(card, 1200, 630, "docs/social-card.png");
await render(icon(32), 32, 32, "docs/favicon-32.png");
// Apple draws its own rounded corners, so the touch icon is a full square.
await render(icon(180).replace('rx="7"', 'rx="0"'), 180, 180, "docs/apple-touch-icon.png");
await browser.close();
console.log("Wrote docs/social-card.png, docs/favicon-32.png and docs/apple-touch-icon.png");
