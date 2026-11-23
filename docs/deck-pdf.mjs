// PDF engine for the presenter: one page at a time, fitted to the stage, with
// a live link layer so clicking a link still works as it does in the browser's
// own viewer.
import { loadPdf } from "./pdf-document.mjs";

// PDF.js asks a "link service" what to do with a link. The full one lives in
// pdfjs-dist's web/ bundle, which this site does not vendor, so here is the
// little of it that display-only rendering actually calls.
function makeLinkService(pdf, goTo) {
  return {
    eventBus: { on() {}, off() {}, dispatch() {} },
    externalLinkTarget: 2, // _blank
    externalLinkRel: "noopener noreferrer",
    getAnchorUrl(hash) { return hash; },
    getDestinationHash(dest) { return `#${JSON.stringify(dest)}`; },
    // PDF.js hands us each link element to dress. External links open in a new
    // tab so a click never navigates the talk away from the slides.
    addLinkAttributes(link, url, newWindow = false) {
      link.href = url ?? "";
      link.title = url ?? "";
      if (newWindow || /^[a-z][a-z0-9+.-]*:/i.test(url ?? "")) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    },
    async goToDestination(dest) {
      try {
        // A named destination resolves to an array whose first entry points at
        // the page; an explicit destination is already that array.
        const target = typeof dest === "string" ? await pdf.getDestination(dest) : dest;
        if (!target) return;
        const index = await pdf.getPageIndex(target[0]);
        goTo(index);
      } catch {
        // A link that will not resolve should not take the talk down.
      }
    },
    getAttachmentContent() {},
    executeNamedAction() {},
    executeSetOCGState() {},
  };
}

export async function openPdf(stage, data, onPageChange) {
  const { library, task: loading } = await loadPdf({ data });
  const pdf = await loading.promise;

  const holder = document.createElement("div");
  holder.className = "pdf-page";
  const canvas = document.createElement("canvas");
  const paper = canvas.getContext("2d");
  // Pages are painted into this and copied across, never drawn on screen
  // directly. See paint() for why.
  const buffer = document.createElement("canvas");
  const links = document.createElement("div");
  // annotationLayer is the class PDF.js's own rules key off; the subset this
  // site needs for links is in styles.css.
  links.className = "annotationLayer";
  holder.append(canvas, links);
  stage.replaceChildren(holder);

  let index = 0;
  let task;
  let drawing = Promise.resolve();
  const linkService = makeLinkService(pdf, target => deck.goTo(target));

  // The stage's own padding is not room the page can use, so measure the
  // content box rather than the border box or the page overflows it.
  function roomOnStage() {
    const styles = getComputedStyle(stage);
    const horizontal = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const vertical = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    return {
      width: Math.max(stage.clientWidth - horizontal, 1),
      height: Math.max(stage.clientHeight - vertical, 1),
    };
  }

  async function paint() {
    const page = await pdf.getPage(index + 1);
    const natural = page.getViewport({ scale: 1 });
    const room = roomOnStage();
    const fit = Math.min(room.width / natural.width, room.height / natural.height);
    const scale = Math.max(fit, 0.05);
    const viewport = page.getViewport({ scale });
    const ratio = window.devicePixelRatio || 1;

    // Draw into the buffer, not onto the screen. Assigning to a canvas's width
    // clears it outright, and PDF.js then paints asynchronously, flooding the
    // page with white before any content lands -- so rendering straight to the
    // visible canvas blanks the slide on every page turn, for as long as the
    // page takes to draw. Measured on a 23-page deck that is a median of 13ms
    // and up to 69ms: short, but a white flash on a projector all the same.
    //
    // Stoatworks Labs' PDF Presenter (MIT) hit this and fixed it the same way;
    // the approach is theirs. See src/renderer/src/pdf.ts and issue #28 in
    // https://github.com/stoatworks-labs/pdf-presenter -- worth re-reading if
    // page turns ever need more work than this.
    task?.cancel();
    buffer.width = Math.ceil(viewport.width * ratio);
    buffer.height = Math.ceil(viewport.height * ratio);

    task = page.render({ canvas: buffer, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
    try {
      await task.promise;
    } catch {
      // Cancelled by a newer page or a resize. The slide on screen is untouched,
      // so it simply stays up rather than blanking for the abandoned render.
      return;
    }

    // Resize and blit in one synchronous step. Sizing the visible canvas clears
    // it, and the compositor must not get a frame between that and the copy.
    holder.style.width = `${Math.floor(viewport.width)}px`;
    holder.style.height = `${Math.floor(viewport.height)}px`;
    // The link layer sizes itself from this, via PDF.js's own formula.
    holder.style.setProperty("--scale-factor", String(scale));
    canvas.width = buffer.width;
    canvas.height = buffer.height;
    paper.drawImage(buffer, 0, 0);

    // Links are a bonus: a page that renders but whose links do not must still
    // be presentable, so this failing cannot take the page down with it.
    try {
      await drawLinks(page, viewport);
    } catch {
      links.replaceChildren();
    }
  }

  async function drawLinks(page, viewport) {
    links.replaceChildren();
    const annotations = await page.getAnnotations({ intent: "display" });
    if (!annotations.length) return;
    // Sizes the layer and sets the scale custom property the rules expect.
    library.setLayerDimensions(links, viewport);
    const layer = new library.AnnotationLayer({
      div: links,
      page,
      viewport: viewport.clone({ dontFlip: true }),
      accessibilityManager: null,
      annotationCanvasMap: null,
      annotationEditorUIManager: null,
      structTreeLayer: null,
      commentManager: null,
      linkService,
      annotationStorage: null,
    });
    await layer.render({
      annotations,
      div: links,
      page,
      viewport: viewport.clone({ dontFlip: true }),
      linkService,
      renderForms: false,
    });
  }

  function redraw() {
    drawing = drawing.then(paint).catch(() => {});
    return drawing;
  }

  const deck = {
    get count() { return pdf.numPages; },
    get index() { return index; },
    // A PDF has no builds: every page arrives finished.
    step: 0,
    steps: 0,
    show(target) { deck.goTo(target); },
    notes() { return ""; },
    goTo(target) {
      const next = Math.min(Math.max(target, 0), pdf.numPages - 1);
      if (next === index) return;
      index = next;
      redraw();
      onPageChange?.();
    },
    next() { deck.goTo(index + 1); },
    prev() { deck.goTo(index - 1); },
    resize() { redraw(); },
    destroy() {
      task?.cancel();
      loading.destroy();
    },
    async renderThumb(target, thumb) {
      const page = await pdf.getPage(target + 1);
      const natural = page.getViewport({ scale: 1 });
      // Sharp on a high-density screen too: the presenter view's next-slide
      // preview is large enough for the difference to show.
      const ratio = window.devicePixelRatio || 1;
      const width = (thumb.clientWidth || 144) * ratio;
      const viewport = page.getViewport({ scale: width / natural.width });
      const sheet = document.createElement("canvas");
      sheet.width = Math.ceil(viewport.width);
      sheet.height = Math.ceil(viewport.height);
      await page.render({ canvas: sheet, viewport }).promise;
      thumb.append(sheet);
    },
  };

  await redraw();
  return deck;
}
