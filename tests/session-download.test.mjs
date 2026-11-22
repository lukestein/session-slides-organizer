import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";

const app = await readFile(new URL("../docs/app.mjs", import.meta.url), "utf8");
function section(start, end) {
  const from = app.indexOf(start);
  const to = app.indexOf(end, from);
  assert.ok(from >= 0 && to > from, "Download UI test boundaries must exist");
  return app.slice(from, to);
}
const downloadCode = section("async function downloadSessionZip(", "// When this copy");
const dialogCode = section("// Clear list asks first", "// Saving the list in this browser.");

function element() {
  const listeners = new Map();
  return {
    disabled: false, hidden: true, textContent: "",
    addEventListener(name, handler) { listeners.set(name, handler); },
    click() { if (!this.disabled) return listeners.get("click")?.(); },
  };
}

// Run the real handlers with deferred ZIP preparation and browser download
// stand-ins, so feedback can be checked both before and after completion.
function harness() {
  const elements = Object.fromEntries(
    ["clear-download", "clear-confirm", "clear-cancel", "clear-error", "clear-message"]
      .map(id => [`#${id}`, element()]),
  );
  const exportButton = element();
  const clearButton = element();
  const error = element();
  const builds = [];
  const downloads = [];
  const clearDialog = { open: false, showModal() { this.open = true; }, close() { this.open = false; } };
  const context = vm.createContext({
    exportButton, clearButton, clearDialog, error, slides: [{}],
    announce() {}, sessionFiles: () => [{ name: "1. Talk.pdf" }], archiveStem: () => "Session",
    buildSessionZip: (name, files) => new Promise((resolve, reject) => builds.push({ name, files, resolve, reject })),
    URL: { createObjectURL: () => "blob:session", revokeObjectURL() {} },
    setTimeout() {},
    document: {
      querySelector: selector => elements[selector],
      body: { append() {} },
      createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }),
    },
  });
  vm.runInContext(downloadCode + dialogCode, context);
  return { elements, builds, downloads, exportButton, clearButton, clearDialog, error };
}

test("the clear dialog waits for ZIP preparation before reporting a download", async () => {
  const h = harness();
  h.clearButton.click();
  const pending = h.elements["#clear-download"].click();
  assert.equal(h.elements["#clear-download"].textContent, "Preparing ZIP…");
  assert.equal(h.elements["#clear-download"].disabled, true);
  assert.equal(h.elements["#clear-confirm"].disabled, true);
  assert.equal(h.downloads.length, 0);
  assert.equal(h.clearDialog.open, true);
  h.builds[0].resolve({});
  await pending;
  assert.deepEqual(h.downloads, ["Session.zip"]);
  assert.equal(h.elements["#clear-download"].textContent, "Download started");
  assert.equal(h.elements["#clear-confirm"].disabled, false);
  assert.equal(h.elements["#clear-error"].hidden, true);
});

test("a failed dialog export shows its error inside the dialog and allows retry", async () => {
  const h = harness();
  h.clearButton.click();
  const pending = h.elements["#clear-download"].click();
  h.builds[0].reject(new RangeError("ZIP limit exceeded"));
  await pending;
  assert.equal(h.downloads.length, 0);
  assert.equal(h.elements["#clear-error"].hidden, false);
  assert.match(h.elements["#clear-error"].textContent, /Couldn’t create the session ZIP/);
  assert.equal(h.error.hidden, true);
  assert.equal(h.elements["#clear-download"].textContent, "Download ZIP");
  assert.equal(h.elements["#clear-download"].disabled, false);
  assert.equal(h.elements["#clear-confirm"].disabled, false);
  const retry = h.elements["#clear-download"].click();
  assert.equal(h.elements["#clear-error"].hidden, true);
  h.builds[1].resolve({});
  await retry;
  assert.deepEqual(h.downloads, ["Session.zip"]);
  assert.equal(h.elements["#clear-download"].textContent, "Download started");
});

test("the main export button still reports failures and allows retry", async () => {
  const h = harness();
  const pending = h.exportButton.click();
  assert.equal(h.exportButton.disabled, true);
  assert.equal(h.clearButton.disabled, true);
  h.exportButton.click();
  assert.equal(h.builds.length, 1);
  h.builds[0].reject(new Error("File read failed"));
  await pending;
  assert.equal(h.error.hidden, false);
  assert.equal(h.exportButton.disabled, false);
  assert.equal(h.clearButton.disabled, false);
  const retry = h.exportButton.click();
  assert.equal(h.error.hidden, true);
  h.builds[1].resolve({});
  await retry;
  assert.deepEqual(h.downloads, ["Session.zip"]);
});

test("cancelling during export permits reopening only after preparation ends", async () => {
  const h = harness();
  h.clearButton.click();
  const pending = h.elements["#clear-download"].click();
  h.elements["#clear-cancel"].click();
  assert.equal(h.clearDialog.open, false);
  h.clearButton.click();
  assert.equal(h.clearDialog.open, false);
  h.builds[0].reject(new Error("File read failed"));
  await pending;
  h.clearButton.click();
  assert.equal(h.clearDialog.open, true);
  assert.equal(h.elements["#clear-error"].hidden, true);
  assert.equal(h.elements["#clear-download"].textContent, "Download ZIP");
  assert.equal(h.elements["#clear-download"].disabled, false);
  assert.equal(h.elements["#clear-confirm"].disabled, false);
});
