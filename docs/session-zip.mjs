const encoder = new TextEncoder();

export function sessionZipSize(files) {
  // Stored ZIP entries have 92 bytes of overhead plus two copies of the name.
  return files.reduce((total, { file, name }) => (
    total + file.size + 92 + 2 * encoder.encode(name).length
  ), 22);
}

export async function buildSessionZip(files) {
  const maxZipSize = 0xffffffff;
  const size = sessionZipSize(files);
  if (size >= maxZipSize || files.length >= 0xffff) {
    throw new RangeError("The session exceeds the ZIP format limits.");
  }

  const { Zip, ZipPassThrough } = await import("./vendor/fflate/esm/browser.js");
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
