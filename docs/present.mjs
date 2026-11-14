// Presents one PowerPoint deck in its own tab. The organizer passes the deck as
// a blob URL, the same way it hands a PDF to the browser's own viewer. Parsing
// and rendering stay on this computer; nothing is uploaded.
//
// Everything here calls the renderer's public API, so the vendored copy under
// vendor/webppt/ stays untouched and upstream updates drop straight in.
const stage = document.querySelector("#deck-stage");
const counter = document.querySelector("#deck-count");
const heading = document.querySelector("#deck-title");
const fullscreen = document.querySelector("#deck-fullscreen");
const blank = document.querySelector("#deck-blank");
const picker = document.querySelector("#deck-picker");
let core;
let presentation;
let viewer;

function message(text) {
  stage.replaceChildren(Object.assign(document.createElement("p"), {
    className: "deck-message", textContent: text,
  }));
}

function updateCount() {
  if (!viewer) return;
  counter.textContent = `${viewer.index + 1} / ${viewer.count}`;
  // picker.children is an HTMLCollection, which has no entries().
  Array.from(picker.children).forEach((thumb, index) => {
    thumb.classList.toggle("current", index === viewer.index);
  });
}

// B and W blank the screen as they do in PowerPoint. Any move resumes.
function setBlank(colour) {
  const next = blank.dataset.colour === colour ? "" : colour;
  blank.dataset.colour = next;
  blank.hidden = !next;
}

function resume() {
  blank.dataset.colour = "";
  blank.hidden = true;
}

function showPicker(open) {
  picker.hidden = !open;
  if (open) {
    fillPicker();
    picker.querySelector(".current")?.scrollIntoView({ block: "nearest", inline: "center" });
  }
}

// Thumbnails render only once they scroll into view, so a long deck does not
// pay for every slide up front.
const watcher = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const thumb = entry.target;
    watcher.unobserve(thumb);
    const slide = presentation.slides[Number(thumb.dataset.index)];
    try {
      thumb.insertAdjacentHTML("beforeend", core.renderSlideToSvg(presentation, slide));
    } catch {
      // A slide that will not render keeps its number and stays clickable.
    }
  }
}, { root: picker, rootMargin: "200px" });

function fillPicker() {
  if (picker.children.length) return;
  picker.replaceChildren(...presentation.slides.map((slide, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "deck-thumb";
    thumb.dataset.index = String(index);
    thumb.setAttribute("aria-label", `Slide ${index + 1}`);
    thumb.append(Object.assign(document.createElement("span"), {
      className: "deck-thumb-number", textContent: String(index + 1),
    }));
    thumb.addEventListener("click", () => {
      viewer?.goTo(index);
      resume();
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

document.querySelector("#deck-prev").addEventListener("click", step(() => viewer?.prev()));
document.querySelector("#deck-next").addEventListener("click", step(() => viewer?.next()));
blank.addEventListener("click", resume);
document.querySelector("#deck-slides").addEventListener("click", () => {
  resume();
  showPicker(picker.hidden);
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
    ArrowRight: () => viewer?.next(), PageDown: () => viewer?.next(), " ": () => viewer?.next(),
    ArrowDown: () => viewer?.next(), ArrowLeft: () => viewer?.prev(), PageUp: () => viewer?.prev(),
    ArrowUp: () => viewer?.prev(), Home: () => viewer?.goTo(0),
    End: () => viewer?.goTo((viewer.count ?? 1) - 1),
  };
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const move = moves[event.key];

  if (move) {
    event.preventDefault();
    resume();
    showPicker(false);
    move();
    updateCount();
    return;
  }
  if (key === "b" || key === "w") {
    event.preventDefault();
    showPicker(false);
    setBlank(key === "b" ? "black" : "white");
    return;
  }
  if (key === "g") {
    event.preventDefault();
    resume();
    showPicker(picker.hidden);
    return;
  }
  if (event.key === "Escape" && !picker.hidden) {
    event.preventDefault();
    showPicker(false);
  }
});

async function start() {
  const parameters = new URLSearchParams(location.search);
  const source = parameters.get("src");
  const title = parameters.get("title") ?? "";
  heading.textContent = title;
  document.title = title ? `Presenting ${title}` : "Presenting";

  if (!source?.startsWith("blob:")) {
    message("Open this deck from the organizer tab.");
    return;
  }

  let deck;
  try {
    // Read the deck up front so that closing the organizer tab, or removing the
    // row, cannot pull the file out from under a talk in progress.
    deck = await (await fetch(source)).arrayBuffer();
  } catch {
    message("This deck is no longer available. Open it again from the organizer tab.");
    return;
  }

  try {
    const [coreModule, viewerModule] = await Promise.all([
      import("./vendor/webppt/core/core.js"),
      import("./vendor/webppt/viewer/viewer-core.js"),
    ]);
    core = coreModule;
    presentation = await core.parse(deck);
    stage.replaceChildren();
    viewer = new viewerModule.Viewer(stage, presentation, { animate: true });
  } catch {
    message("This deck couldn’t be opened here. Download it to present in PowerPoint.");
    return;
  }
  // Outside the catch: a slip here is not the deck failing to open.
  updateCount();
}

start();
