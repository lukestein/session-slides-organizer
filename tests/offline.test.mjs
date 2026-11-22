import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { offlineFiles, serialize } from "../scripts/offline-files.mjs";

test("docs/offline-files.json lists every file the site needs", async () => {
  const listed = await readFile(new URL("../docs/offline-files.json", import.meta.url), "utf8");
  assert.equal(listed, serialize(await offlineFiles()),
    "The offline file list is out of date. Run: node scripts/offline-files.mjs");
});
