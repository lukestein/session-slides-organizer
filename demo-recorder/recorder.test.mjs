import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Recorder } from './driver.mjs';

function recording(t) {
  const dir = mkdtempSync(join(tmpdir(), 'slideorg-recorder-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return new Recorder('unused', dir, { paired: true });
}

test('main and audience frames share a capture iteration and timestamp', async t => {
  const rec = recording(t);
  rec.session = 'presenter'; rec.scale = 1;
  rec.companion = { session: 'audience', scale: 1 };
  const sessions = [];
  rec.cdp = { send: async (method, params, session) => {
    assert.equal(method, 'Page.captureScreenshot');
    sessions.push(session);
    if (session === 'audience') rec.running = false;
    return { data: Buffer.from(session).toString('base64') };
  } };
  rec.start();
  await rec.loop;
  assert.deepEqual(sessions, ['presenter', 'audience']);
  assert.equal(rec.n, 1);
  assert.equal(rec.times.length, 1);
  assert.equal(readFileSync(join(rec.dir, 'f00000.jpg'), 'utf8'), 'presenter');
  assert.equal(readFileSync(join(rec.dir, 'a00000.jpg'), 'utf8'), 'audience');
});

test('both recordings remove the same loading frames and preserve durations', t => {
  const rec = recording(t);
  rec.n = 5; rec.times = [0, 40, 80, 120, 160]; rec.cuts = [[50, 110]];
  const main = join(rec.dir, 'main.txt'), audience = join(rec.dir, 'audience.txt');
  rec.writeList(main); rec.writeList(audience, 'a');
  const edit = readFileSync(main, 'utf8');
  assert.equal(readFileSync(audience, 'utf8'), edit.replaceAll("file 'f", "file 'a"));
  assert.doesNotMatch(edit, /00002/);
  assert.match(edit, /f00001.jpg'\nduration 0.0200/);
  assert.match(edit, /f00003.jpg'\nduration 0.0400/);
});

test('switching away drains pending screenshots before a tab can close', async t => {
  const rec = recording(t);
  rec.session = 'old';
  let finish;
  rec.pendingCapture = new Promise(resolve => { finish = resolve; });
  rec.attach = async () => ({ session: 'new', scale: 1 });
  const switching = rec.focus('new');
  await Promise.resolve();
  assert.equal(rec.paused, true);
  assert.equal(rec.session, 'old');
  finish(); await switching;
  assert.equal(rec.session, 'new');
  assert.equal(rec.paused, false);
});

test('unexpected viewport aspect ratios stop the take instead of exporting bad frames', async t => {
  const rec = recording(t);
  rec.session = 'presenter';
  // A JPEG SOF header for a 1504×900 viewport, clipping the expected 16:9 view.
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, 3, 132, 5, 224, 0]);
  rec.cdp = { send: async () => ({ data: jpeg.toString('base64') }), close() {} };
  rec.start();
  await assert.rejects(rec.stop(), /Unexpected capture aspect ratio: 1504×900/);
  assert.equal(rec.n, 0);
});

test('complete 16:9 CSS-pixel popup frames remain valid for encoder scaling', async t => {
  const rec = recording(t);
  rec.session = 'presenter';
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, 3, 78, 5, 224, 0]);
  rec.cdp = { send: async () => {
    rec.running = false;
    return { data: jpeg.toString('base64') };
  }, close() {} };
  rec.start();
  await rec.stop();
  assert.equal(rec.n, 1);
});
