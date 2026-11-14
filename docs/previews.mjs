const pdfAssets = new URL("./vendor/pdfjs/", import.meta.url);
const embeddedPreview = /^(?:docProps\/thumbnail|preview(?:-web)?)[.](?:jpe?g|png|webp)$/i;
let pdfLibrary;

async function pdfPreview(fileUrl, reportCount) {
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
    reportCount(pdf.numPages, "page");
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

async function packagePreview(file, extension, reportCount) {
  const { unzipSync } = await import("./vendor/fflate/esm/browser.js");
  const presentationPath = "ppt/presentation.xml";
  const maxEntrySize = 4 * 1024 * 1024;
  const selected = new Set();
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()), {
    filter: ({ name, size, originalSize }) => {
      if (size > maxEntrySize || originalSize > maxEntrySize) return false;
      const normalized = name.toLowerCase();
      if (selected.has(normalized)) return false;
      if (!embeddedPreview.test(name) && (extension === "key" || name !== presentationPath)) return false;
      selected.add(normalized);
      return true;
    },
  });
  if (entries[presentationPath]) {
    const xml = new TextDecoder().decode(entries[presentationPath]);
    const { documentElement } = new DOMParser().parseFromString(xml, "application/xml");
    const slideList = Array.from(documentElement.children).find(child => (
      child.localName === "sldIdLst" && child.namespaceURI === documentElement.namespaceURI
    ));
    if (slideList) {
      const slides = Array.from(slideList.children).filter(child => (
        child.localName === "sldId" && child.namespaceURI === slideList.namespaceURI
      ));
      reportCount(slides.length, "slide");
    }
  }
  const images = Object.keys(entries).filter(name => embeddedPreview.test(name));
  const entry = images.find(name => /^docProps\/thumbnail[.]|^preview[.]/i.test(name)) ?? images[0];
  if (!entry) return null;
  const imageExtension = entry.split(".").at(-1).toLowerCase();
  const format = imageExtension === "jpg" ? "jpeg" : imageExtension;
  return new Blob([entries[entry]], { type: `image/${format}` });
}

// The 1997–2003 binary formats are OLE containers, not ZIPs, so there is no
// embedded thumbnail to lift out. Render their first slide instead. This pulls
// in the deck renderer, so it runs only for the files that need it.
async function legacyPreview(file, reportCount) {
  const core = await import("./vendor/webppt/core/core.js");
  const presentation = await core.parse(await file.arrayBuffer());
  reportCount(presentation.slides.length, "slide");
  const [first] = presentation.slides;
  return first ? await core.slideToPng(presentation, first, 0.3) : null;
}

export function makePreview(file, fileUrl, extension, reportCount) {
  if (extension === "pdf") return pdfPreview(fileUrl, reportCount);
  if (["pptx", "pptm", "ppsx", "ppsm", "key"].includes(extension)) {
    return packagePreview(file, extension, reportCount);
  }
  if (["ppt", "pps"].includes(extension)) return legacyPreview(file, reportCount);
  return null;
}
