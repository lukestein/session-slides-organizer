// What the presenter tab and the audience screen share: opening a file with
// the right engine, and which keys move a slide.
//
// Every engine returns the same shape:
//   count, index         Slides, and the one on screen.
//   step, steps          Click-by-click builds played on this slide, and how
//                        many it has. Always 0 for a PDF.
//   next(), prev()       As a clicker would: a deck plays its next build first.
//   goTo(index)          Straight to a slide.
//   show(index, step)    To an exact position, as another window reported it.
//   renderThumb(i, box)  A small picture of a slide, appended to `box`.
//   notes(i)             Speaker notes, or "".
//   resize(), destroy()  Optional.
// `onChange` runs after every move, however it came about: a key, a click on a
// link inside the slide, or show().
export const mimeTypes = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pps: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pptm: "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  ppsm: "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
};

export function extensionOf(filename) {
  return /[.]([^.]+)$/.exec(filename ?? "")?.[1].toLowerCase() ?? "";
}

export async function openDeck(stage, data, extension, onChange) {
  if (extension === "pdf") {
    const { openPdf } = await import("./deck-pdf.mjs");
    return openPdf(stage, data, onChange);
  }
  const { openPowerPoint } = await import("./deck-pptx.mjs");
  return openPowerPoint(stage, data, onChange);
}

const moves = {
  ArrowRight: "next", ArrowDown: "next", PageDown: "next", " ": "next",
  ArrowLeft: "prev", ArrowUp: "prev", PageUp: "prev",
  Home: "first", End: "last",
};

// The move a key asks for, or null. The arrow pairs and the Page keys cover
// the usual presentation clickers.
export function moveFor(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return null;
  return moves[event.key] ?? null;
}

export function makeMove(deck, move) {
  if (!deck) return;
  if (move === "next") deck.next();
  else if (move === "prev") deck.prev();
  else if (move === "first") deck.goTo(0);
  else if (move === "last") deck.goTo(deck.count - 1);
}

// A click on the current slide advances; its leftmost eighth goes back.
// Measure the rendered page, rather than its stage, so letterboxing doesn't
// move the backward zone away from the slide's left edge. Links and media
// keep their own clicks, including PowerPoint's SVG links and audio controls.
export function moveForClick(event, stage) {
  if (event.defaultPrevented || event.button !== 0 || !stage.contains(event.target)) return null;
  if (event.target.closest("a, button, input, select, textarea, audio, video, [role='button'], [role='link'], [data-slide], [data-media-toggle]")) return null;
  const page = stage.querySelector(".pdf-page, svg") ?? stage;
  const bounds = page.getBoundingClientRect();
  return event.clientX <= bounds.left + bounds.width / 8 ? "prev" : "next";
}
