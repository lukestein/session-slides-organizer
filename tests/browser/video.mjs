// Run with PLAYWRIGHT_MODULE as documented for presenter.mjs in DEVELOPING.md.
// A simulated YouTube iframe keeps these checks independent of streaming,
// network availability and browser autoplay policy.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = fileURLToPath(new URL('../../docs/', import.meta.url));
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
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
server.unref();
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const errors = [];
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
  await context.route('https://www.youtube-nocookie.com/**', route => route.fulfill({
    contentType: 'text/html',
    body: `<script>
      window.blockPlayback = new URL(location.href).searchParams.get('controls') === '0';
      window.playerState = -1;
      window.commands = [];
      function report() {
        parent.postMessage(JSON.stringify({ event: 'infoDelivery', info: {
          playerState, currentTime: 30, duration: 120,
        } }), '*');
      }
      addEventListener('message', event => {
        const data = JSON.parse(event.data);
        if (data.event === 'listening') {
          parent.postMessage(JSON.stringify({ event: 'onReady' }), '*');
          report();
        }
        if (data.event !== 'command') return;
        commands.push(data.func);
        if (data.func === 'playVideo' && !blockPlayback) { playerState = 1; report(); }
        if (data.func === 'pauseVideo') { playerState = 2; report(); }
      });
    </script>`,
  }));
  const presenter = await context.newPage();
  await presenter.goto(`http://127.0.0.1:${server.address().port}/present.html?video=aqz-KE-bpKQ&title=Video`);
  const player = page => page.frames().find(frame => frame.url().startsWith('https://www.youtube-nocookie.com/'));
  const state = async (page, expected) => {
    await page.locator('iframe').waitFor();
    const deadline = Date.now() + 10000;
    while (!player(page) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
    assert.ok(player(page), 'Video iframe loaded');
    await player(page).waitForFunction(expected => window.playerState === expected, expected);
  };
  await presenter.locator('.video-cover').click();
  await state(presenter, 1);
  const popup = presenter.waitForEvent('popup');
  await presenter.locator('#deck-presenter').click();
  const audience = await popup;
  await audience.locator('iframe').waitFor();
  await presenter.locator('.video-note').filter({ hasText: 'holding back sound' }).waitFor();
  assert.ok((await player(audience).evaluate(() => commands)).includes('playVideo'));
  console.log('PASS blocked handoff autoplay reports how to enable sound');

  await player(audience).evaluate(() => { window.blockPlayback = false; });
  const play = () => presenter.locator('.video-toggle').click();
  for (const source of [audience, presenter]) {
    for (const key of ['b', 'w']) {
      await play();
      await state(audience, 1);
      await source.keyboard.press(key);
      await state(audience, 2);
      assert.equal(await audience.locator('#deck-blank').getAttribute('data-colour'), key === 'b' ? 'black' : 'white');
      // Wait for the pause report before trying to play again.
      await presenter.waitForFunction(() => document.querySelector('.video-toggle').textContent === 'Play');
      await source.keyboard.press(key);
      await audience.waitForFunction(() => document.querySelector('#deck-blank').hidden);
      assert.equal(await player(audience).evaluate(() => playerState), 2);
    }
  }
  console.log('PASS audience and presenter B/W pause playback; unblanking keeps it paused');
  assert.deepEqual(errors, []);
  console.log('PASS video: no uncaught browser errors');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
