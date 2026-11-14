// Presents one deck in its own tab. The organizer hands over a blob URL; this
// page reads it, renders it, and never uploads anything.
//
// The shell here — bar, keyboard, blanking, thumbnail strip, full screen — is
// the same whatever the format. Rendering is a small engine per format, in
// deck-pptx.mjs and deck-pdf.mjs.
const stage = document.querySelector("#deck-stage");
const counter = document.querySelector("#deck-count");
const heading = document.querySelector("#deck-title");
const fullscreen = document.querySelector("#deck-fullscreen");
const blank = document.querySelector("#deck-blank");
const picker = document.querySelector("#deck-picker");
const help = document.querySelector("#deck-help");
const downloadLink = document.querySelector("#deck-download");
const original = document.querySelector("#deck-original");
let deck;
// The picker stays put when it was asked for, and withdraws when it was only
// uncovered by the pointer resting at the foot of the slide.
let pickerPinned = false;

function message(text) {
  stage.replaceChildren(Object.assign(document.createElement("p"), {
    className: "deck-message", textContent: text,
  }));
}

function updateCount() {
  if (!deck) return;
  counter.textContent = `${deck.index + 1} / ${deck.count}`;
  // picker.children is an HTMLCollection, which has no entries().
  Array.from(picker.children).forEach((thumb, index) => {
    thumb.classList.toggle("current", index === deck.index);
  });
}

function blanked() {
  return Boolean(blank.dataset.colour);
}

// B and W blank the screen as they do in PowerPoint.
function setBlank(colour) {
  const next = blank.dataset.colour === colour ? "" : colour;
  blank.dataset.colour = next;
  blank.hidden = !next;
}

function resume() {
  blank.dataset.colour = "";
  blank.hidden = true;
}

function showHelp(open) {
  help.hidden = !open;
}

function pickerOpen() {
  return picker.classList.contains("open");
}

function showPicker(open, pin = false) {
  // A class, not the hidden attribute, so the strip can slide both ways.
  picker.classList.toggle("open", open);
  pickerPinned = open && pin;
  if (!open) return;
  fillPicker();
  const current = picker.querySelector(".current");
  if (!current) return;
  // Scroll the strip itself rather than calling scrollIntoView, which walks up
  // and scrolls every scrollable ancestor — and a clipped box still scrolls
  // programmatically, which yanked the slide to the top of the window.
  picker.scrollTo({
    left: current.offsetLeft - (picker.clientWidth - current.offsetWidth) / 2,
    behavior: "instant",
  });
  requestAnimationFrame(() => requestAnimationFrame(paintVisibleThumbs));
}

// Thumbnails render only once they come into view, so a long deck does not pay
// for every slide up front.
function paintThumb(thumb) {
  if (thumb.dataset.painted) return;
  thumb.dataset.painted = "yes";
  watcher.unobserve(thumb);
  Promise.resolve()
    .then(() => deck.renderThumb(Number(thumb.dataset.index), thumb))
    .catch(() => {
      // A slide that will not render keeps its number and stays clickable.
    });
}

const watcher = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) paintThumb(entry.target);
  }
}, { root: picker, rootMargin: "200px" });

// The observer can miss the very first open, while the strip is still sliding
// into place, so sweep what is on screen once it has settled.
function paintVisibleThumbs() {
  const strip = picker.getBoundingClientRect();
  for (const thumb of picker.children) {
    const box = thumb.getBoundingClientRect();
    if (box.right > strip.left - 200 && box.left < strip.right + 200) paintThumb(thumb);
  }
}

function fillPicker() {
  if (picker.children.length || !deck) return;
  picker.replaceChildren(...Array.from({ length: deck.count }, (unused, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "deck-thumb";
    thumb.dataset.index = String(index);
    thumb.setAttribute("aria-label", `Slide ${index + 1}`);
    thumb.append(Object.assign(document.createElement("span"), {
      className: "deck-thumb-number", textContent: String(index + 1),
    }));
    thumb.addEventListener("click", () => {
      resume();
      deck?.goTo(index);
      showPicker(false);
      updateCount();
    });
    return thumb;
  }));
  for (const thumb of picker.children) watcher.observe(thumb);
  updateCount();
}

function step(move) {
  return () => { resume(); move(); updateCount(); };
}

document.querySelector("#deck-prev").addEventListener("click", step(() => deck?.prev()));
document.querySelector("#deck-next").addEventListener("click", step(() => deck?.next()));

// Clicking near the left or right edge moves a slide. The strips that mark
// those zones are not hit-testable, so a link sitting at the edge of a page
// still takes its own click; what is left over is placed by where it landed.
const edgeShare = 0.12;
document.addEventListener("click", event => {
  if (!deck) return;
  // Links, controls and the page furniture keep their own clicks.
  if (event.target.closest("a, button, input, .deck-bar, .deck-picker, .deck-help, .deck-blank")) {
    return;
  }
  const edge = window.innerWidth * edgeShare;
  if (event.clientX <= edge) step(() => deck.prev())();
  else if (event.clientX >= window.innerWidth - edge) step(() => deck.next())();
});
blank.addEventListener("click", resume);
help.addEventListener("click", () => showHelp(false));

document.querySelector("#deck-slides").addEventListener("click", () => {
  resume();
  showPicker(!pickerOpen(), true);
});

// Resting the pointer at the foot of the slide lifts the picker into view.
// This reads the pointer's own position rather than enter and leave events on
// the strip: the open strip covers the ground that opened it, so hit testing
// alone would uncover it, re-cover it, and flicker without the pointer moving.
// Opening within 2.5rem of the foot and closing only above the open strip
// leaves a band where neither happens, which settles it.
const liftWithin = 40;
document.addEventListener("pointermove", event => {
  if (event.pointerType === "touch" || pickerPinned) return;
  const fromFoot = window.innerHeight - event.clientY;
  if (!pickerOpen()) {
    if (deck && fromFoot <= liftWithin && !blanked() && help.hidden) showPicker(true);
  } else if (fromFoot > Math.max(picker.offsetHeight, liftWithin) + 8) {
    // max(): an unfilled strip measures only its padding, which would put the
    // closing line below the opening one and shut it the moment it opened.
    showPicker(false);
  }
});

fullscreen.addEventListener("click", async () => {
  let worked = true;
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
      // Some embedded browsers resolve the request without acting on it.
      worked = Boolean(document.fullscreenElement);
    }
  } catch {
    worked = false;
  }
  if (worked) return;
  // Point at the browser's own full screen rather than looking broken.
  const shortcut = navigator.platform.startsWith("Mac") ? "⌃⌘F" : "F11";
  fullscreen.textContent = `Use ${shortcut}`;
  setTimeout(() => { fullscreen.textContent = "Full screen"; }, 4000);
});

document.addEventListener("fullscreenchange", () => {
  fullscreen.textContent = document.fullscreenElement ? "Exit full screen" : "Full screen";
});

document.addEventListener("keydown", event => {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const moves = {
    ArrowRight: () => deck?.next(), PageDown: () => deck?.next(), " ": () => deck?.next(),
    ArrowDown: () => deck?.next(), ArrowLeft: () => deck?.prev(), PageUp: () => deck?.prev(),
    ArrowUp: () => deck?.prev(), Home: () => deck?.goTo(0),
    End: () => deck?.goTo((deck.count ?? 1) - 1),
  };
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const move = moves[event.key];

  if (move) {
    event.preventDefault();
    // Coming back from a blank screen returns to the slide that was up, rather
    // than moving on from it.
    if (blanked()) {
      resume();
      return;
    }
    showHelp(false);
    showPicker(false);
    move();
    updateCount();
    return;
  }
  if (key === "b" || key === "w") {
    event.preventDefault();
    showHelp(false);
    showPicker(false);
    setBlank(key === "b" ? "black" : "white");
    return;
  }
  if (key === "g") {
    event.preventDefault();
    resume();
    showHelp(false);
    showPicker(!pickerOpen(), true);
    return;
  }
  // Slash and question mark, shifted or not, raise the guide.
  if (key === "?" || key === "/") {
    event.preventDefault();
    resume();
    showPicker(false);
    showHelp(help.hidden);
    return;
  }
  if (event.key === "Escape" && (!help.hidden || pickerOpen())) {
    event.preventDefault();
    showHelp(false);
    showPicker(false);
  }
});

const mimeTypes = {
  pdf: "application/pdf",
  ppt: "application/vnd.ms-powerpoint",
  pps: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pptm: "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  ppsx: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  ppsm: "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
};

// Re-fit the page after the window changes shape, and after entering or leaving
// full screen. Only the PDF engine needs this; the deck renderer scales itself.
let resizing;
function refit() {
  clearTimeout(resizing);
  resizing = setTimeout(() => deck?.resize?.(), 120);
}
window.addEventListener("resize", refit);
document.addEventListener("fullscreenchange", refit);

async function start() {
  const parameters = new URLSearchParams(location.search);
  const source = parameters.get("src");
  const title = parameters.get("title") ?? "";
  const filename = parameters.get("name") ?? "";
  heading.textContent = title;
  document.title = title ? `Presenting ${title}` : "Presenting";

  if (!source?.startsWith("blob:")) {
    message("Open this deck from the organizer tab.");
    return;
  }

  let data;
  try {
    // Read the file up front so that closing the organizer tab, or removing the
    // row, cannot pull it out from under a talk in progress.
    data = await (await fetch(source)).arrayBuffer();
  } catch {
    message("This deck is no longer available. Open it again from the organizer tab.");
    return;
  }

  const extension = /[.]([^.]+)$/.exec(filename)?.[1].toLowerCase() ?? "";
  const type = mimeTypes[extension] ?? "application/octet-stream";
  // A copy of our own, so the buttons keep working however the organizer tab
  // fares. Blob() copies, so the renderer may still claim the buffer below.
  const ours = URL.createObjectURL(new Blob([data], { type }));
  downloadLink.href = ours;
  downloadLink.download = filename || "presentation";
  downloadLink.hidden = false;
  if (extension === "pdf") {
    // Links, search and printing live in the browser's own PDF viewer.
    original.href = ours;
    original.hidden = false;
  }

  try {
    if (extension === "pdf") {
      const { openPdf } = await import("./deck-pdf.mjs");
      deck = await openPdf(stage, data, updateCount);
    } else {
      const { openPowerPoint } = await import("./deck-pptx.mjs");
      deck = await openPowerPoint(stage, data);
    }
  } catch {
    message(extension === "pdf"
      ? "This PDF couldn\u2019t be opened here. Download it to open in another viewer."
      : "This deck couldn\u2019t be opened here. Download it to present in PowerPoint.");
    return;
  }
  // Outside the catch: a slip here is not the file failing to open.
  updateCount();
  // The strip can be lifted by a resting pointer before the file has loaded,
  // in which case it opened with nothing to show. Fill it now.
  if (pickerOpen()) {
    fillPicker();
    paintVisibleThumbs();
  }
}

start();
