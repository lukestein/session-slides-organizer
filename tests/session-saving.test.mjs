import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";

const app = await readFile(new URL("../docs/app.mjs", import.meta.url), "utf8");
// Run the app's persistence handlers with controlled storage and timers. No
// browser rendering or IndexedDB implementation is needed to exercise timing.
const persistence = app.slice(app.indexOf('let saving = "off";'));
const tick = () => new Promise(resolve => setImmediate(resolve));

function harness() {
  const handlers = {};
  const timers = new Map();
  const writes = [];
  const slides = [{ id: "one", named: true, friendlyName: "Original" }];
  let nextTimer = 0;
  const context = vm.createContext({
    slides, zipName: { value: "Session" }, notice: {}, navigator: {},
    clearButton: { addEventListener() {} },
    window: { addEventListener: (name, fn) => { handlers[name] = fn; } },
    document: {
      visibilityState: "hidden",
      addEventListener: (name, fn) => { handlers[name] = fn; },
    },
    setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; },
    clearTimeout: id => timers.delete(id),
    saveSession: state => new Promise(resolve => writes.push({ state, resolve })),
  });
  vm.runInContext(persistence, context);
  return {
    slides, writes,
    enable: () => vm.runInContext('saving = "idle";', context),
    change: () => vm.runInContext("scheduleSave();", context),
    hide: () => handlers.visibilitychange(),
    timer: () => { for (const fn of [...timers.values()]) fn(); },
    unload: () => {
      let warned = false;
      handlers.beforeunload({ preventDefault() { warned = true; } });
      return warned;
    },
  };
}

for (const olderSucceeded of [true, false]) {
  test(`a queued newer save stays unsaved after an older ${olderSucceeded ? "success" : "failure"}`, async () => {
    const h = harness();
    h.enable();
    h.change();
    h.timer();
    await tick();
    h.slides[0].friendlyName = "Latest title";
    h.change();
    h.timer();
    h.writes[0].resolve(olderSucceeded);
    await tick();
    assert.equal(h.writes.length, 2);
    assert.equal(h.writes[1].state.rows[0].title, "Latest title");
    assert.equal(h.unload(), true);
    h.writes[1].resolve(true);
    await tick();
    assert.equal(h.unload(), false);
  });
}

test("an older completion leaves a newer debounce timer pending", async () => {
  const h = harness();
  h.enable();
  h.change();
  h.timer();
  await tick();
  h.slides[0].friendlyName = "New title";
  h.change();
  h.writes[0].resolve(true);
  await tick();
  h.timer();
  await tick();
  assert.equal(h.writes.length, 2);
  assert.equal(h.writes[1].state.rows[0].title, "New title");
  h.writes[1].resolve(false);
  await tick();
  assert.equal(h.unload(), true);
});

test("removing the final talk flushes and warns on unload until saved", async () => {
  const h = harness();
  h.enable();
  h.slides.length = 0;
  h.change();
  assert.equal(h.unload(), true);
  await tick();
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].state.rows.length, 0);
  h.writes[0].resolve(true);
  await tick();
  assert.equal(h.unload(), false);
});

test("hiding an empty list flushes its pending removal", async () => {
  const h = harness();
  h.enable();
  h.slides.length = 0;
  h.change();
  h.hide();
  await tick();
  assert.equal(h.writes[0].state.rows.length, 0);
  h.writes[0].resolve(false);
  await tick();
  assert.equal(h.unload(), true);
});

test("an unsaved secondary tab warns only when it contains talks", () => {
  const h = harness();
  assert.equal(h.unload(), true);
  h.slides.length = 0;
  assert.equal(h.unload(), false);
});
