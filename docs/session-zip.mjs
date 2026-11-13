import { Zip, ZipPassThrough } from "./vendor/fflate/esm/browser.js";

export async function buildSessionZip(files) {
  const maxZipSize = 0xffffffff;
  const encoder = new TextEncoder();
  // Stored ZIP entries have 92 bytes of overhead plus two copies of the name.
  const size = files.reduce((total, { file, name }) => (
    total + file.size + 92 + 2 * encoder.encode(name).length
  ), 22);
  if (size >= maxZipSize || files.length >= 0xffff) {
    throw new RangeError("The session exceeds the ZIP format limits.");
  }

  const parts = [];
  const zip = new Zip((error, chunk) => {
    if (error) throw error;
    parts.push(chunk);
  });
  try {
    for (const { file, name } of files) {
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
