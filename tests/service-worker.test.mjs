import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../docs/sw.js", import.meta.url), "utf8");
const scope = "https://example.test/organizer/";
const stampKey = `${scope}__refreshed`;

function harness() {
  let clock = Date.now();
  const contents = new Map();
  const attempts = new Map();
  let failure;
  const cache = {
    put: async (key, response) => { contents.set(String(key), response); },
    // A real cache hands back a fresh response each time, so its body can be read again.
    match: async key => { const hit = contents.get(String(key)); return hit?.clone ? hit.clone() : hit; },
    keys: async () => [...contents.keys()].map(url => ({ url })),
    delete: async key => contents.delete(typeof key === "string" ? key : key.url),
  };
  const context = vm.createContext({
    URL, Response, Date: { now: () => clock },
    self: { location: `${scope}sw.js`, addEventListener() {} },
    caches: { open: async () => cache },
    fetch: async input => {
      const url = String(input);
      attempts.set(url, (attempts.get(url) ?? 0) + 1);
      if (url.endsWith("deck-pptx.mjs")) {
        if (failure === "network") throw new Error("Connection interrupted");
        if (failure === "http") return { ok: false, type: "basic" };
        if (failure === "redirect") return { ok: true, type: "basic", redirected: true };
      }
      return {
        ok: true, type: "basic", redirected: false,
        json: async () => ["index.html", "deck-pptx.mjs"],
      };
    },
  });
  vm.runInContext(source, context);
  return {
    contents, attempts,
    fail: kind => { failure = kind; },
    advance: minutes => { clock += minutes * 60 * 1000; },
    refresh: () => vm.runInContext("refreshCopy()", context),
    navigate: () => vm.runInContext("refreshIfDue()", context),
  };
}

for (const kind of ["network", "http", "redirect"]) {
  test(`offline fill retries ten minutes after a ${kind} failure, even with a recent older stamp`, async () => {
    const h = harness();
    h.contents.set(stampKey, new Response(String(Date.now())));
    h.contents.set(`${scope}old-module.mjs`, {});
    h.fail(kind);
    await h.refresh();
    assert.equal(h.contents.has(`${scope}deck-pptx.mjs`), false);
    assert.equal(h.contents.has(`${scope}index.html`), true);
    assert.equal(h.contents.has(`${scope}old-module.mjs`), true);
    h.fail(undefined);
    // Not straight away, which on a flaky network would re-check every file
    // on every page load...
    await h.navigate();
    assert.equal(h.attempts.get(`${scope}deck-pptx.mjs`), 1);
    h.advance(9);
    await h.navigate();
    assert.equal(h.attempts.get(`${scope}deck-pptx.mjs`), 1);
    // ...but well within the hour, not after the usual twelve.
    h.advance(2);
    await h.navigate();
    assert.equal(h.attempts.get(`${scope}deck-pptx.mjs`), 2);
    assert.equal(h.contents.has(`${scope}deck-pptx.mjs`), true);
    assert.equal(h.contents.has(stampKey), true);
    assert.equal(h.contents.has(`${scope}old-module.mjs`), false);
    await h.navigate();
    assert.equal(h.attempts.get(`${scope}deck-pptx.mjs`), 2);
  });
}
