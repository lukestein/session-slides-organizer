import { buildManifest, manifestName } from "./session-manifest.mjs";

const encoder = new TextEncoder();

function entryCost(name, size) {
  // Stored ZIP entries have 92 bytes of overhead plus two copies of the name.
  return size + 92 + 2 * encoder.encode(name).length;
}

function manifestBytes(sessionName, files) {
  return encoder.encode(buildManifest(sessionName, files));
}

// Entries are every talk in order, for the manifest; only those with a file
// take a place in the ZIP itself. A talk that lives online is a line in
// session.md and nothing more.
export function sessionZipSize(sessionName, files) {
  const slides = files.filter(({ file }) => file)
    .reduce((total, { file, name }) => total + entryCost(name, file.size), 22);
  return slides + entryCost(manifestName, manifestBytes(sessionName, files).length);
}

export async function buildSessionZip(sessionName, files) {
  const maxZipSize = 0xffffffff;
  const size = sessionZipSize(sessionName, files);
  const decks = files.filter(({ file }) => file);
  if (size >= maxZipSize || decks.length + 1 >= 0xffff) {
    throw new RangeError("The session exceeds the ZIP format limits.");
  }

  const { Zip, ZipPassThrough } = await import("./vendor/fflate/esm/browser.js");
  const parts = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    parts.push(chunk);
  });
  try {
    // The running order goes in first, so it is what an extracted folder or a
    // ZIP listing shows at the top.
    const manifest = new ZipPassThrough(manifestName);
    zip.add(manifest);
    manifest.push(manifestBytes(sessionName, files), true);

    for (const { file, name } of decks) {
      const entry = new ZipPassThrough(name);
      zip.add(entry);
      for await (const chunk of file.stream()) entry.push(chunk);
      entry.push(new Uint8Array(), true);
    }
    zip.end();
    return new Blob(parts, { type: "application/zip" });
  } finally {
    zip.terminate();
  }
}
