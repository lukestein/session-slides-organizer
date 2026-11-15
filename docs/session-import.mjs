// Reads a saved session back into a running order, whether it arrives as a ZIP
// or as the files someone extracted from one. The manifest decides the order
// and the titles; anything it does not mention still comes in, after the talks
// it does, so a file is never silently dropped.
import { isManifestName, parseManifest, stripPosition } from "./session-manifest.mjs";

const maxEntrySize = 2 * 1024 * 1024 * 1024;
const emptyManifest = { sessionName: "", order: [] };

function basename(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}

function extensionOf(name) {
  return /[.]([^.]+)$/.exec(name)?.[1].toLowerCase();
}

// Folders, resource forks and the junk a desktop leaves in an archive.
function ignorable(path) {
  const name = basename(path);
  return path.endsWith("/") || !name || name.startsWith(".") || path.startsWith("__MACOSX/");
}

// "2. Paper b" sorts before "10. Paper j", which a plain sort gets wrong as
// soon as a session runs past nine talks.
function byName(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
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
 * Puts candidate files into the order a manifest asks for, renaming each to
 * drop its positional prefix. Candidates are { name, file }; the result's
 * entries are { file, title }, where an empty title means the manifest did not
 * name that file. This is the one place the running order is applied, so a ZIP
 * and a folder of its contents cannot drift apart.
 */
export function orderBySession(manifest, candidates) {
  const byFilename = new Map();
  for (const candidate of candidates) {
    const key = candidate.name.toLowerCase();
    if (!byFilename.has(key)) byFilename.set(key, candidate);
  }

  const taken = new Set();
  const entries = [];
  const missing = [];

  const take = (candidate, title) => {
    taken.add(candidate);
    // The numbering is positional, so it comes off: position is the list's job,
    // and it is reapplied on the way out.
    const plain = stripPosition(candidate.name);
    const { file } = candidate;
    entries.push({
      // An empty title means the manifest did not name this file, which is not
      // the same as its name happening to match the filename: the export names
      // files after their titles, so the two usually agree. The list needs to
      // tell those apart to know whose name to trust.
      file: plain === file.name ? file : new File([file], plain, { type: file.type }),
      title,
    });
  };

  for (const { title, name } of manifest.order) {
    const candidate = byFilename.get(basename(name).toLowerCase());
    if (!candidate || taken.has(candidate)) {
      missing.push(name);
      continue;
    }
    take(candidate, title);
  }

  // Whatever the manifest did not account for, by filename, which is the order
  // the export numbered them in.
  for (const candidate of [...candidates].sort(byName)) {
    if (!taken.has(candidate)) take(candidate, "");
  }

  return { entries, missing };
}

/**
 * Turns a dropped ZIP into entries the list can take.
 * Returns { entries, sessionName, missing }.
 */
export async function readSessionZip(file, isSupported) {
  const unpacked = await readZip(file);
  const paths = Object.keys(unpacked).filter(path => !ignorable(path));

  const manifestPath = paths.find(path => isManifestName(basename(path)));
  const manifest = manifestPath
    ? parseManifest(new TextDecoder().decode(unpacked[manifestPath]))
    : emptyManifest;

  // A ZIP may hold more than slides — notes, a logo, whatever was in the
  // folder. Those are passed over rather than reported, since nobody chose
  // them file by file.
  const candidates = [];
  for (const path of paths) {
    if (path === manifestPath) continue;
    const name = basename(path);
    const bytes = unpacked[path];
    if (!isSupported(extensionOf(name)) || !bytes?.length) continue;
    candidates.push({ name, file: new File([bytes], name, { type: "" }) });
  }

  const { entries, missing } = orderBySession(manifest, candidates);
  return { entries, sessionName: manifest.sessionName, missing };
}

/**
 * The same, for loose files — a session ZIP someone extracted, then dragged in.
 * `manifestText` is a `session.md` dropped alongside them, if there was one.
 *
 * Without a manifest, the files are still treated as a session when every one
 * of them carries a positional prefix, since that is what the export leaves
 * behind and nothing else arrives looking like it. Anything else keeps the
 * order it was dropped in, under its own name.
 */
export function readLooseSession(manifestText, candidates, isSupported) {
  const manifest = manifestText ? parseManifest(manifestText) : emptyManifest;
  const slides = candidates.filter(({ name }) => isSupported(extensionOf(name)));
  const numbered = slides.length > 1
    && slides.every(({ name }) => stripPosition(name) !== name);
  const ordered = Boolean(manifest.order.length) || numbered;

  if (!ordered) {
    return {
      entries: candidates.map(({ file }) => ({ file, title: "" })),
      missing: [],
      sessionName: "",
      ordered: false,
    };
  }

  const { entries, missing } = orderBySession(manifest, candidates);
  return { entries, missing, sessionName: manifest.sessionName, ordered: true };
}
