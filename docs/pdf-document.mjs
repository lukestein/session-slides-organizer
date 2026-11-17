const assets = new URL("./vendor/pdfjs/", import.meta.url);
let pdfLibrary;

export async function loadPdf(source) {
  pdfLibrary ??= import("./vendor/pdfjs/legacy/build/pdf.min.mjs");
  const library = await pdfLibrary;
  library.GlobalWorkerOptions.workerSrc = new URL("legacy/build/pdf.worker.min.mjs", assets).href;
  const task = library.getDocument({
    ...source,
    cMapUrl: new URL("cmaps/", assets).href,
    cMapPacked: true,
    standardFontDataUrl: new URL("standard_fonts/", assets).href,
    wasmUrl: new URL("wasm/", assets).href,
    iccUrl: new URL("iccs/", assets).href,
    enableXfa: false,
  });
  return { library, task };
}
