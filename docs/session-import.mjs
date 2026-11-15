// Reads a session ZIP back into a running order. The manifest decides the order
// and the titles; anything in the ZIP it does not mention still comes in, after
// the talks it does, so a file is never silently dropped.
import { manifestName, parseManifest, stripPosition } from "./session-manifest.mjs";

const maxEntrySize = 2 * 1024 * 1024 * 1024;

function basename(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

// Folders, resource forks and the junk a desktop leaves in an archive.
function ignorable(path) {
  const name = basename(path);
  return path.endsWith("/") || !name || name.startsWith(".") || path.startsWith("__MACOSX/");
}

async function readZip(file) {
  const { unzip } = await import("./vendor/fflate/esm/browser.js");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    unzip(bytes, { filter: ({ originalSize }) => originalSize <= maxEntrySize }, (error, entries) => {
      if (error) reject(error);
      else resolve(entries);
    });
  });
}

/**
 * Turns a dropped ZIP into entries the list can take.
 * Returns { entries, sessionName, missing } — entries are { file, title },
 * where an empty title means the manifest did not name that file.
 */
export async function readSessionZip(file, isSupported) {
  const unpacked = await readZip(file);
  const paths = Object.keys(unpacked).filter(path => !ignorable(path));

  const manifestPath = paths.find(path => basename(path).toLowerCase() === manifestName);
  const manifest = manifestPath
    ? parseManifest(new TextDecoder().decode(unpacked[manifestPath]))
    : { sessionName: "", order: [] };

  // Index what is actually in the ZIP, by filename, so the manifest can point
  // at a file wherever it sits in the archive.
  const byName = new Map();
  for (const path of paths) {
    if (path === manifestPath) continue;
    byName.set(basename(path).toLowerCase(), path);
  }

  const taken = new Set();
  const entries = [];
  const missing = [];

  const take = (path, title) => {
    const name = basename(path);
    const extension = /[.]([^.]+)$/.exec(name)?.[1].toLowerCase();
    const bytes = unpacked[path];
    if (!isSupported(extension) || !bytes?.length) return false;
    taken.add(path);
    // The ZIP's numbering is positional, so it comes off: position is the list's
    // job, and it is reapplied on the way out.
    const plain = stripPosition(name);
    entries.push({
      // An empty title means the manifest did not name this file, which is not
      // the same as its name happening to match the filename: the export names
      // files after their titles, so the two usually agree. The list needs to
      // tell those apart to know whose name to trust.
      file: new File([bytes], plain, { type: "" }),
      title,
    });
    return true;
  };

  for (const { title, name } of manifest.order) {
    const path = byName.get(name.toLowerCase()) ?? byName.get(basename(name).toLowerCase());
    if (!path || taken.has(path)) {
      missing.push(name);
      continue;
    }
    if (!take(path, title)) missing.push(name);
  }

  // Whatever the manifest did not account for, in the ZIP's own order.
  for (const path of paths.sort()) {
    if (path === manifestPath || taken.has(path)) continue;
    take(path, "");
  }

  return { entries, sessionName: manifest.sessionName, missing };
}
