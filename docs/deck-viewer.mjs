// Presents PowerPoint decks in the page. Parsing and rendering stay on this
// computer: the deck is never uploaded and no network request is made.
const presentable = ["ppt", "pptx", "pptm", "pps", "ppsx", "ppsm"];

let enginePromise;
let overlay;
let viewer;
let onKey;

export function canPresent(extension) {
  return presentable.includes(extension);
}

function loadEngine() {
  enginePromise ??= Promise.all([
    import("./vendor/webppt/core/core.js"),
    import("./vendor/webppt/viewer/viewer-core.js"),
  ]).catch(error => {
    enginePromise = undefined;
    throw error;
  });
  return enginePromise;
}

function build() {
  const node = document.createElement("div");
  node.className = "deck-overlay";
  node.tabIndex = -1;
  node.innerHTML = `
    <div class="deck-bar">
      <span class="deck-title"></span>
      <span class="deck-count" role="status"></span>
      <button type="button" class="deck-button deck-fullscreen">Full screen</button>
      <button type="button" class="deck-button deck-close">Close</button>
    </div>
    <div class="deck-stage"><div class="deck-message">Opening deck…</div></div>
    <button type="button" class="deck-edge deck-prev" aria-label="Previous slide"></button>
    <button type="button" class="deck-edge deck-next" aria-label="Next slide"></button>`;
  return node;
}

function updateCount() {
  if (!viewer || !overlay) return;
  overlay.querySelector(".deck-count").textContent = `${viewer.index + 1} / ${viewer.count}`;
}

export function closeDeck() {
  if (!overlay) return;
  document.removeEventListener("keydown", onKey, true);
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  viewer?.destroy?.();
  viewer = undefined;
  overlay.remove();
  overlay = undefined;
  document.body.classList.remove("presenting");
}

export async function openDeck(file, title) {
  closeDeck();
  overlay = build();
  document.body.append(overlay);
  document.body.classList.add("presenting");
  overlay.querySelector(".deck-title").textContent = title;
  overlay.focus();

  const stage = overlay.querySelector(".deck-stage");
  const message = text => { stage.innerHTML = `<div class="deck-message">${text}</div>`; };

  overlay.querySelector(".deck-close").addEventListener("click", closeDeck);
  overlay.querySelector(".deck-fullscreen").addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else overlay.requestFullscreen?.().catch(() => {});
  });

  onKey = event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const keys = {
      ArrowRight: () => viewer?.next(), PageDown: () => viewer?.next(), " ": () => viewer?.next(),
      ArrowDown: () => viewer?.next(), ArrowLeft: () => viewer?.prev(), PageUp: () => viewer?.prev(),
      ArrowUp: () => viewer?.prev(), Home: () => viewer?.goTo(0),
      End: () => viewer?.goTo((viewer.count ?? 1) - 1), Escape: closeDeck,
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    updateCount();
  };
  document.addEventListener("keydown", onKey, true);

  overlay.querySelector(".deck-prev").addEventListener("click", () => { viewer?.prev(); updateCount(); });
  overlay.querySelector(".deck-next").addEventListener("click", () => { viewer?.next(); updateCount(); });

  try {
    const [core, viewerModule] = await loadEngine();
    if (!overlay) return;
    const presentation = await core.parse(await file.arrayBuffer());
    if (!overlay) return;
    stage.textContent = "";
    viewer = new viewerModule.Viewer(stage, presentation, { animate: true });
    updateCount();
  } catch {
    message("This deck couldn’t be opened here. Download it to present in PowerPoint or Keynote.");
  }
}
