const pdfAssets = new URL("./vendor/pdfjs/", import.meta.url);
const embeddedPreview = /^(?:docProps\/thumbnail|preview(?:-web)?)[.](?:jpe?g|png|webp)$/i;
let pdfLibrary;

async function pdfPreview(fileUrl) {
  pdfLibrary ??= import("./vendor/pdfjs/legacy/build/pdf.min.mjs");
  const { getDocument, GlobalWorkerOptions } = await pdfLibrary;
  GlobalWorkerOptions.workerSrc = new URL("legacy/build/pdf.worker.min.mjs", pdfAssets).href;
  const task = getDocument({
    url: fileUrl,
    cMapUrl: new URL("cmaps/", pdfAssets).href,
    cMapPacked: true,
    standardFontDataUrl: new URL("standard_fonts/", pdfAssets).href,
    wasmUrl: new URL("wasm/", pdfAssets).href,
    iccUrl: new URL("iccs/", pdfAssets).href,
    enableXfa: false,
  });
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const original = page.getViewport({ scale: 1 });
    const scale = Math.min(300 / original.width, 190 / original.height);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    await page.render({ canvas, viewport }).promise;
    return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  } finally {
    await task.destroy();
  }
}

async function packagePreview(file) {
  const { unzipSync } = await import("./vendor/fflate/esm/browser.js");
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: ({ name, originalSize }) => originalSize <= 4 * 1024 * 1024 && embeddedPreview.test(name),
  });
  const entry = Object.keys(entries).find(name => /^docProps\/thumbnail[.]|^preview[.]/i.test(name))
    ?? Object.keys(entries)[0];
  if (!entry) return null;
  const extension = entry.split(".").at(-1).toLowerCase();
  const format = extension === "jpg" ? "jpeg" : extension;
  return new Blob([entries[entry]], { type: `image/${format}` });
}

export function makePreview(file, fileUrl, extension) {
  if (extension === "pdf") return pdfPreview(fileUrl);
  if (["pptx", "pptm", "ppsx", "ppsm", "key"].includes(extension)) return packagePreview(file);
  return null;
}
