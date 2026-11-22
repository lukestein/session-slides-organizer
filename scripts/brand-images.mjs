// Renders the PNG icons and the link-preview card from docs/favicon.svg and
// the HTML below. Run from the repository root after changing the name, the
// tagline or the mark:
//
//   node scripts/brand-images.mjs
//
// Needs Playwright (or just playwright-core, with Google Chrome installed).
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function load(name) { try { return require(name); } catch { return undefined; } }
const { chromium } = load("playwright") ?? load("playwright-core");

const mark = await readFile("docs/favicon.svg", "utf8");
const font = (await readFile("docs/vendor/instrument-sans/instrument-sans-latin-wght-normal.woff2")).toString("base64");

const fontFace = `@font-face { font-family: "Instrument Sans"; font-weight: 400 700;
  src: url(data:font/woff2;base64,${font}) format("woff2"); }`;

const tiles = (width, numbered) => `<div class="tiles" style="--w:${width}px">${
  [["slide", "a"], ["org", "b"], [".org", "c"]].map(([word, tone], index) =>
    `<div class="tile ${tone}">${numbered ? `<small>${index + 1}</small>` : ""}${word}</div>`).join("")}</div>`;

// The card: the address as three slides on the brand green, with "org" white
// because it is the front slide of the icon. Sized to stay readable when a chat
// app shrinks it to a 270px thumbnail.
const card = `<!doctype html><html><head><style>
${fontFace}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; font-family: "Instrument Sans"; background: #006644; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between; padding: 66px 78px; }
.tiles { display: flex; gap: calc(var(--w) * .07); }
.tile { position: relative; width: var(--w); aspect-ratio: 16 / 9; border-radius: calc(var(--w) * .07);
  display: grid; place-items: center; font-size: calc(var(--w) * .27); font-weight: 700; letter-spacing: -.01em; }
.tile small { position: absolute; top: 5%; left: 7%; font-size: calc(var(--w) * .1); font-weight: 500; opacity: .75; }
.a { background: #a9d3b9; color: #00402b; } .b { background: #fff; color: #006644; } .c { background: #5fa47f; color: #fff; }
h1 { font-size: 84px; font-weight: 600; line-height: 1.1; letter-spacing: -.015em; }
p { margin-top: 14px; font-size: 47px; color: #e3efe7; white-space: nowrap; }
.benefits { margin-top: 20px; font-size: 35px; font-weight: 500; color: #a9d3b9; }
.benefits span { color: #5fa47f; margin: 0 .5em; }
</style></head><body>
${tiles(252, true)}
<div><h1>Slide Organizer</h1><p>Every talk, in order, on the room computer.</p>
<p class="benefits">Free<span>·</span>Open source<span>·</span>Private</p></div>
</body></html>`;

// favicon.svg itself has no lettering, since an SVG favicon cannot load the
// site's font and "org" is a smudge at 16px anyway. The larger home-screen
// icon carries it, set in Instrument Sans here.
const lettered = mark.replace("</svg>",
  `<text x="14" y="21.6" text-anchor="middle" font-family="Instrument Sans" font-weight="700" font-size="7.6" fill="#006644">org</text></svg>`);
const icon = (svg, size) => `<!doctype html><html><head><style>${fontFace} * { margin: 0; } svg { display: block; width: ${size}px; height: ${size}px; }</style></head><body>${svg}</body></html>`;

// Playwright's own Chromium if it is installed, otherwise the system Chrome.
const browser = await chromium.launch().catch(() => chromium.launch({ channel: "chrome" }));
async function render(html, width, height, path) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path, omitBackground: true });
  await page.close();
}
await render(card, 1200, 630, "docs/social-card.png");
await render(icon(mark, 32), 32, 32, "docs/favicon-32.png");
// Apple draws its own rounded corners, so the touch icon is a full square.
await render(icon(lettered.replace('rx="7"', 'rx="0"'), 180), 180, 180, "docs/apple-touch-icon.png");
await browser.close();
console.log("Wrote docs/social-card.png, docs/favicon-32.png and docs/apple-touch-icon.png");
