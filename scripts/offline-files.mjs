// Writes docs/offline-files.json: every file the site needs, which the
// service worker (docs/sw.js) keeps a copy of so the page opens offline.
// Run from the repository root after adding, removing or renaming a file in
// docs/:
//
//   node scripts/offline-files.mjs
//
// tests/offline.test.mjs fails when the list is out of date.
import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const docs = fileURLToPath(new URL("../docs/", import.meta.url));

// Not needed to run the tool: the link-preview image and home-screen icon are
// for other apps, and the list and the worker are fetched fresh anyway.
const skip = new Set([".nojekyll", "social-card.png", "apple-touch-icon.png", "offline-files.json", "sw.js"]);

export async function offlineFiles() {
  const entries = await readdir(docs, { recursive: true, withFileTypes: true });
  return entries
    .filter(entry => entry.isFile())
    .map(entry => `${entry.parentPath ?? entry.path}/${entry.name}`.slice(docs.length).replaceAll("\\", "/").replace(/^\//, ""))
    .filter(path => !skip.has(path) && !path.split("/").some(part => part === ".DS_Store" || /^LICENSE/.test(part)))
    .sort();
}

export function serialize(files) {
  return `${JSON.stringify(files, null, 1)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = await offlineFiles();
  await writeFile(new URL("../docs/offline-files.json", import.meta.url), serialize(files));
  console.log(`Wrote docs/offline-files.json: ${files.length} files.`);
}
