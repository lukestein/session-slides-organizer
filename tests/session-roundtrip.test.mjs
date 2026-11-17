import assert from "node:assert/strict";
import { test } from "node:test";
import { readLooseSession, readSessionZip } from "../docs/session-import.mjs";
import { buildManifest, parseManifest } from "../docs/session-manifest.mjs";
import { buildSessionZip, sessionZipSize } from "../docs/session-zip.mjs";
import { strToU8, zipSync } from "../docs/vendor/fflate/esm/browser.js";

const supportsPdf = extension => extension === "pdf";
const liveDeck = "https://docs.google.com/presentation/d/abcdefghijklmnopqrstuvwxyz/edit";
const onlineDeck = "https://example.org/deck";

test("ZIP and loose imports preserve titles, filenames, and source URLs", async () => {
  const title = "The `regress` and ``xtreg`` commands (https://example.org/rates)";
  const name = "1. The `regress` and ``xtreg`` commands.pdf";
  const file = new File(["saved PDF bytes"], name, { type: "application/pdf" });
  const entries = [
    { title, name, file, link: liveDeck },
    { title: "Slides about https://example.org/other", link: onlineDeck },
  ];
  const archive = await buildSessionZip("Morning session", entries);
  assert.equal(archive.size, sessionZipSize("Morning session", entries));
  const loose = readLooseSession(buildManifest("Morning session", entries), [{ name, file }], supportsPdf);
  for (const session of [await readSessionZip(archive, supportsPdf), loose]) {
    assert.deepEqual(session.missing, []);
    assert.equal(session.sessionName, "Morning session");
    assert.equal(session.entries[0].title, title);
    assert.equal(session.entries[0].file.name, name.slice(3));
    assert.equal(await session.entries[0].file.text(), await file.text());
    assert.equal(session.entries[0].link, liveDeck);
    assert.deepEqual(session.entries[1], { title: entries[1].title, link: onlineDeck });
  }
});

test("previously exported and hand-edited entries still import", () => {
  const lines = [
    "1. **An older title with `backticks`** — `1. An older title with `backticks`.pdf`",
    "2) Reworded talk - `2. Other.pdf`",
    `3. Online talk – ${onlineDeck}.`,
  ];
  assert.deepEqual(parseManifest(lines.join("\n")).order, [
    { title: "An older title with `backticks`", name: "1. An older title with `backticks`.pdf", link: "" },
    { title: "Reworded talk", name: "2. Other.pdf", link: "" },
    { title: "Online talk", name: "", link: onlineDeck },
  ]);
});

test("the canonical ZIP manifest wins over other Markdown files", async () => {
  const zip = zipSync({
    "README.md": strToU8("# Notes\n1. Conference website – https://example.org"),
    "folder/session.md": strToU8(buildManifest("Nested session", [{ title: "Another talk", link: onlineDeck }])),
    "session.md": strToU8(buildManifest("Morning session", [{ title: "Opening", link: liveDeck }])),
  });
  const { sessionName, entries } = await readSessionZip(new Blob([zip]), supportsPdf);
  assert.equal(sessionName, "Morning session");
  assert.deepEqual(entries, [{ title: "Opening", link: liveDeck }]);
});

test("a renamed ZIP manifest can follow a README without a running order", async () => {
  const zip = zipSync({
    "README.md": strToU8("# Conference notes"),
    "schedule.markdown": strToU8(buildManifest("Morning session", [{ title: "Opening", link: liveDeck }])),
  });
  const { sessionName, entries } = await readSessionZip(new Blob([zip]), supportsPdf);
  assert.equal(sessionName, "Morning session");
  assert.deepEqual(entries, [{ title: "Opening", link: liveDeck }]);
});
