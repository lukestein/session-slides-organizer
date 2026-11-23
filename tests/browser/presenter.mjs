// Run separately from the Node unit tests; see DEVELOPING.md.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { powerPoint, pdf } from './fixtures.mjs';

const { chromium, firefox, webkit } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const engine = process.env.BROWSER || 'chromium';
// An isolated server lets us cut the real network connection for offline
// tests. WebKit's emulated offline mode can strand window.open at about:blank
// before its service worker gets a navigation to handle.
const root = fileURLToPath(new URL('../../docs/', import.meta.url));
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (request, response) => {
  try {
    let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Outside docs');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const base = `http://127.0.0.1:${server.address().port}`;
server.unref();
const browser = await ({ chromium, firefox, webkit }[engine]).launch({
  headless: true,
  ...(engine === 'chromium' ? { channel: 'chrome' } : {}),
});
console.log(`Testing ${engine} ${browser.version()}`);
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const errors = [];
context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
const screenshot = async (page, name) => {
  if (!process.env.TEST_ARTIFACTS) return;
  await mkdir(process.env.TEST_ARTIFACTS, { recursive: true });
  await page.screenshot({ path: resolve(process.env.TEST_ARTIFACTS, `${engine}-${name}.png`) });
};
const wait = async (page, fn, arg) => {
  const until = Date.now() + 10000;
  while (Date.now() < until) {
    if (await page.evaluate(fn, arg).catch(() => false)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`Timed out: ${fn}`);
};
const count = (page, text) => wait(page, text => document.querySelector('#deck-count').textContent === text, text);
const live = page => wait(page, () => document.querySelector('#deck-screen-status').textContent === 'Showing on the audience screen.');
const buildsAt = (page, step) => wait(page, step => [3, 4, 5].every((id, index) => {
  const element = document.querySelector(`.deck-stage [data-el="${id}"]`);
  return element && (getComputedStyle(element).visibility !== 'hidden') === (index < step);
}), step);
const clickSlide = async (page, fraction = .5) => {
  const box = await page.locator('.deck-stage .pdf-page, .deck-stage svg').first().boundingBox();
  await page.mouse.click(box.x + box.width * fraction, box.y + box.height * .5);
};
const openTalk = async (organizer, row) => {
  const popup = organizer.waitForEvent('popup');
  await organizer.locator('#slides .slide').nth(row).getByRole('link', { name: /Open in browser/ }).click();
  const page = await popup;
  await count(page, row === 0 ? '1 / 60' : '1 / 3');
  return page;
};

try {
  const organizer = await context.newPage();
  await organizer.goto(base);
  await organizer.locator('#files').setInputFiles([
    { name: 'Builds.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', buffer: powerPoint() },
    { name: 'Second.pdf', mimeType: 'application/pdf', buffer: pdf() },
  ]);
  await organizer.locator('#audience-open').waitFor({ state: 'visible' });
  const popup = organizer.waitForEvent('popup');
  await organizer.locator('#audience-open').click();
  const audience = await popup;
  await wait(audience, () => document.body.classList.contains('idle'));
  const first = await openTalk(organizer, 0);
  await live(first);
  await wait(audience, () => document.querySelector('.audience-stage svg'));
  await wait(first, () => document.querySelector('#deck-builds').textContent === '3 more clicks on this slide');
  await buildsAt(audience, 0);
  await screenshot(first, 'presenter');
  console.log('PASS organizer → audience → animated PowerPoint with notes');

  // An already-open talk can leave the audience screen waiting. Explain how
  // to reconnect it, and keep that guidance visible in full screen too.
  await first.locator('#deck-presenter').click();
  await wait(audience, () => document.body.classList.contains('idle'));
  assert.match(await audience.locator('#audience-setup').textContent(), /Choose a deck from the organizer, or click Presenter view/);
  assert.match(await audience.locator('#audience-setup').textContent(), /Show this talk/);
  await audience.bringToFront();
  await audience.evaluate(() => {
    const request = document.documentElement.requestFullscreen;
    document.documentElement.requestFullscreen = function (...args) {
      return request.apply(this, args).catch(error => {
        window.fullscreenError = `${error.name}: ${error.message}`;
        throw error;
      });
    };
  });
  await audience.locator('#audience-fullscreen').click();
  await wait(audience, () => document.fullscreenElement || window.fullscreenError);
  let fullscreenPage = audience;
  let fullscreenContext;
  if (!await audience.evaluate(() => Boolean(document.fullscreenElement))) {
    // Chrome's headless popup can refuse fullscreen after switching windows.
    // Check its fallback, then exercise real fullscreen in a separate window.
    assert.ok(await audience.locator('#audience-hint').isVisible());
    console.log('INFO popup fullscreen refused; checking guidance in a separate window');
    fullscreenContext = await browser.newContext();
    fullscreenPage = await fullscreenContext.newPage();
    await fullscreenPage.goto(`${base}/audience.html`);
    await fullscreenPage.locator('#audience-fullscreen').click();
    await wait(fullscreenPage, () => document.fullscreenElement);
  }
  await wait(fullscreenPage, () => !document.querySelector('#audience-setup').hidden && getComputedStyle(document.querySelector('#audience-setup')).opacity === '1');
  await wait(fullscreenPage, () => document.querySelector('#audience-fullscreen').textContent === 'Exit full screen');
  await fullscreenPage.locator('#audience-fullscreen').evaluate(el => el.blur());
  await fullscreenPage.mouse.move(100, 100);
  await wait(fullscreenPage, () => document.body.classList.contains('still'));
  assert.ok(await fullscreenPage.locator('#audience-setup').isVisible());
  assert.equal(await fullscreenPage.locator('#audience-setup').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await fullscreenPage.locator('.audience-brand').innerText(), 'slideorg.org');
  assert.ok(await fullscreenPage.locator('.audience-brand').isVisible());
  const brand = await fullscreenPage.locator('.audience-brand').boundingBox();
  const instructions = await fullscreenPage.locator('#audience-setup').boundingBox();
  assert.ok(brand.y + brand.height <= instructions.y, 'branding must not overlap the instructions');
  await screenshot(fullscreenPage, 'waiting-fullscreen');
  if (fullscreenContext) await fullscreenContext.close();
  await first.locator('#deck-presenter').click();
  await live(first);
  await wait(audience, () => document.querySelector('#audience-setup').hidden && document.querySelector('.audience-stage svg'));
  if (await audience.evaluate(() => Boolean(document.fullscreenElement))) {
    await audience.evaluate(() => document.exitFullscreen());
  }
  console.log('PASS existing-talk instructions and fullscreen waiting-screen guidance');

  // Observe actual channel traffic without exposing application internals.
  await audience.evaluate(async () => {
    const { openChannel } = await import('./audience-channel.mjs');
    window.moves = [];
    window.monitor = openChannel(message => { if (message.type === 'state') window.moves.push(message); });
  });
  for (let step = 1; step <= 3; step++) {
    await first.keyboard.press('PageDown');
    await wait(audience, step => window.moves.at(-1)?.step === step, step);
    await buildsAt(audience, step);
  }
  await audience.keyboard.press('PageDown');
  await count(first, '2 / 60');
  await audience.keyboard.press('PageUp');
  await count(first, '1 / 60');
  await wait(first, () => document.querySelector('#deck-builds').hidden);
  await audience.keyboard.press('PageUp');
  await wait(first, () => document.querySelector('#deck-builds').textContent === '1 more click on this slide');
  await buildsAt(first, 2);
  await buildsAt(audience, 2);
  console.log('PASS forward/backward builds and audience clicker controls');

  await clickSlide(first);
  await buildsAt(audience, 3);
  await clickSlide(first, .05);
  await buildsAt(audience, 2);
  await clickSlide(audience);
  await buildsAt(first, 3);
  await clickSlide(audience, .05);
  await buildsAt(first, 2);
  await first.locator('#deck-upnext').click();
  await buildsAt(first, 2);
  await first.keyboard.press('b');
  await first.locator('#deck-blank').click();
  await wait(audience, () => document.querySelector('#deck-blank').hidden);
  await buildsAt(first, 2);
  await audience.keyboard.press('w');
  await audience.locator('#deck-blank').click();
  await wait(first, () => document.querySelector('#deck-blank').hidden);
  await buildsAt(audience, 2);
  console.log('PASS center/left slide clicks, preview exclusion and blank-screen clicks');

  await audience.keyboard.press('b');
  await wait(first, () => document.querySelector('#deck-blank').dataset.colour === 'black');
  await audience.keyboard.press('PageDown');
  await wait(first, () => document.querySelector('#deck-blank').hidden);
  await count(first, '1 / 60');
  await audience.reload();
  await wait(audience, () => document.querySelector('.audience-stage svg'));
  await live(first);
  await buildsAt(audience, 2);
  console.log('PASS blank/resume and audience reload');

  const second = await openTalk(organizer, 1);
  await live(second);
  await wait(audience, () => document.querySelector('.audience-stage canvas'));
  // PDF fits must follow actual stage bounds after leaving full screen.
  const fits = async page => {
    await wait(page, () => {
      const stage = document.querySelector('.deck-stage').getBoundingClientRect();
      const paper = document.querySelector('.pdf-page').getBoundingClientRect();
      return paper.width > 0 && paper.left >= stage.left && paper.top >= stage.top
        && paper.right <= stage.right + 1 && paper.bottom <= stage.bottom + 1;
    });
  };
  await audience.locator('#audience-corner').click();
  const fullscreenWorked = await audience.evaluate(() => Boolean(document.fullscreenElement));
  if (fullscreenWorked) {
    await audience.evaluate(() => document.exitFullscreen());
  }
  await audience.setViewportSize({ width: 800, height: 600 });
  await fits(audience);
  await second.setViewportSize({ width: 1024, height: 768 });
  await fits(second);
  await audience.keyboard.press('PageDown');
  await count(second, '2 / 3');
  await clickSlide(audience);
  await count(second, '3 / 3');
  await clickSlide(audience, .05);
  await count(second, '2 / 3');
  await clickSlide(second);
  await count(second, '3 / 3');
  await clickSlide(second, .05);
  await count(second, '2 / 3');
  await second.keyboard.press('Home');
  await audience.locator('.annotationLayer a').first().click();
  await count(second, '2 / 3');
  await second.keyboard.press('Home');
  await second.locator('.annotationLayer a').nth(1).click();
  await count(second, '2 / 3');
  console.log('PASS PDF center/left clicks and links at the edge and middle');
  console.log(`PASS 4:3 PDF resize${fullscreenWorked ? ' after fullscreen exit' : ' (fullscreen unavailable)'}`);

  // A refused fullscreen request must leave visible, actionable feedback
  // while a talk is up, not just on the hidden waiting-screen setup card.
  await audience.evaluate(() => {
    document.documentElement.requestFullscreen = async () => { throw new Error('Refused'); };
    document.dispatchEvent(new Event('pointermove'));
  });
  await audience.locator('#audience-corner').click();
  assert.ok(await audience.locator('#audience-hint').isVisible(), 'fullscreen refusal feedback must be visible during a talk');
  assert.match(await audience.locator('#audience-hint').textContent(), /full screen/);
  await screenshot(audience, 'fullscreen-refused');
  await second.close();
  await wait(audience, () => document.body.classList.contains('idle'));
  await first.locator('#deck-screen-action').click();
  await live(first);
  await wait(audience, () => document.querySelector('.audience-stage svg'));
  console.log('PASS talk takeover, close-to-waiting, reclaim older talk');

  const notes = await first.locator('#deck-notes').evaluate(el => ({ scroll: el.scrollHeight, height: el.clientHeight, text: el.textContent }));
  assert.match(notes.text, /note line 40/);
  assert.ok(notes.scroll > notes.height, 'long notes must scroll');
  await first.keyboard.press('End');
  await count(first, '60 / 60');
  await wait(first, () => document.querySelector('.deck-thumb.current').getBoundingClientRect().right <= innerWidth);
  await first.keyboard.press('Home');
  await count(first, '1 / 60');
  await first.locator('#deck-stage [data-slide]').first().click();
  await count(first, '4 / 60');
  await buildsAt(first, 0);
  console.log('PASS long notes, 60-slide strip and PowerPoint internal link');

  await organizer.close();
  await audience.keyboard.press('PageDown');
  await wait(first, () => document.querySelector('#deck-builds').textContent === '2 more clicks on this slide');
  await audience.close();
  await wait(first, () => document.querySelector('#deck-screen-status').textContent.startsWith('No audience screen'));
  await first.locator('#deck-presenter').click();
  await wait(first, () => !document.body.classList.contains('presenter-view'));
  await first.keyboard.press('b');
  await first.keyboard.press('ArrowRight');
  await count(first, '4 / 60');
  await clickSlide(first);
  await buildsAt(first, 2);
  await clickSlide(first, .05);
  await buildsAt(first, 1);
  await first.keyboard.press('g');
  await wait(first, () => document.querySelector('#deck-picker').classList.contains('open'));
  await first.keyboard.press('Escape');
  await wait(first, () => !document.querySelector('#deck-picker').classList.contains('open'));
  await first.mouse.move(500, 795);
  await wait(first, () => document.querySelector('#deck-picker').classList.contains('open'));
  await first.mouse.move(500, 200);
  await wait(first, () => !document.querySelector('#deck-picker').classList.contains('open'));
  await first.keyboard.press('?');
  await wait(first, () => !document.querySelector('#deck-help').hidden);
  await first.keyboard.press('Escape');
  await wait(first, () => document.querySelector('#deck-help').hidden);
  await first.locator('#deck-fullscreen').click();
  if (await first.evaluate(() => Boolean(document.fullscreenElement))) {
    await first.locator('#deck-fullscreen').click();
    await wait(first, () => !document.fullscreenElement);
  }
  console.log('PASS organizer close, audience close detection and single-screen controls');

  // Wait for the first visit's complete offline copy, then open a new window
  // with the network disabled and reload it while presenting.
  await wait(first, async () => {
    const cache = await caches.open('session-slides-organizer');
    return Boolean(await cache.match(new URL('__refreshed', location.href).href));
  });
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  const offlinePopup = first.waitForEvent('popup');
  await first.locator('#deck-presenter').click();
  const offlineAudience = await offlinePopup;
  await wait(offlineAudience, () => document.querySelector('.audience-stage svg'));
  await offlineAudience.reload();
  await wait(offlineAudience, () => document.querySelector('.audience-stage svg'));
  await offlineAudience.keyboard.press('End');
  await count(first, '60 / 60');
  console.log('PASS audience opens, reloads and moves the talk offline');

  assert.deepEqual(errors, []);
  console.log(`PASS ${engine}: no uncaught browser errors`);
} catch (error) {
  for (const page of context.pages()) {
    console.error(await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(-1500) })).catch(() => 'Page unavailable'));
  }
  console.error('Browser errors:', errors);
  throw error;
} finally {
  server.closeAllConnections();
  server.close();
  await browser.close();
}
