// Presents one PowerPoint deck in its own tab. The organizer passes the deck as
// a blob URL, the same way it hands a PDF to the browser's own viewer. Parsing
// and rendering stay on this computer; nothing is uploaded.
const stage = document.querySelector("#deck-stage");
const counter = document.querySelector("#deck-count");
const heading = document.querySelector("#deck-title");
const fullscreen = document.querySelector("#deck-fullscreen");
let viewer;

function message(text) {
  stage.replaceChildren(Object.assign(document.createElement("p"), {
    className: "deck-message", textContent: text,
  }));
}

function updateCount() {
  if (viewer) counter.textContent = `${viewer.index + 1} / ${viewer.count}`;
}

function step(move) {
  return () => { move(); updateCount(); };
}

document.querySelector("#deck-prev").addEventListener("click", step(() => viewer?.prev()));
document.querySelector("#deck-next").addEventListener("click", step(() => viewer?.next()));

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
  const keys = {
    ArrowRight: () => viewer?.next(), PageDown: () => viewer?.next(), " ": () => viewer?.next(),
    ArrowDown: () => viewer?.next(), ArrowLeft: () => viewer?.prev(), PageUp: () => viewer?.prev(),
    ArrowUp: () => viewer?.prev(), Home: () => viewer?.goTo(0),
    End: () => viewer?.goTo((viewer.count ?? 1) - 1),
  };
  const action = keys[event.key];
  if (!action) return;
  event.preventDefault();
  action();
  updateCount();
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
    const [core, viewerModule] = await Promise.all([
      import("./vendor/webppt/core/core.js"),
      import("./vendor/webppt/viewer/viewer-core.js"),
    ]);
    const presentation = await core.parse(deck);
    stage.replaceChildren();
    viewer = new viewerModule.Viewer(stage, presentation, { animate: true });
    updateCount();
  } catch {
    message("This deck couldn’t be opened here. Download it to present in PowerPoint.");
  }
}

start();
