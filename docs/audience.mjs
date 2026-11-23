// The audience screen: a window moved to the projector that shows whatever
// talk a presenter view sends it, and keeps showing talks as one follows
// another. It renders each file itself, so links on the slide work here too,
// and a clicker pointed at this window moves the presenter view along with it.
// See audience-channel.mjs for the messages.
import { holdUntilClosed, newId, openChannel, whenClosed } from "./audience-channel.mjs";
import { extensionOf, makeMove, moveFor, moveForClick, openDeck } from "./deck-open.mjs";

const blank = document.querySelector("#deck-blank");
const setup = document.querySelector("#audience-setup");
const hint = document.querySelector("#audience-hint");
const corner = document.querySelector("#audience-corner");
const otherDisplay = document.querySelector("#audience-other");
const id = newId("audience");
let stage = document.querySelector("#deck-stage");
let deck = null;
// The presenter tab whose talk is up, or null while waiting for one.
let owner = null;
// Moves are numbered so a late echo can never pull the screen backwards.
let seq = 0;
let applying = false;
let loading = 0;
// The newest position reported while a file was still opening.
let pending = null;

const channel = openChannel(receive);

function post(message) {
  channel?.postMessage({ ...message, from: id });
}

// Set once this screen holds its lock; see the foot of this file.
let ready = false;

function announce() {
  if (ready) post({ type: "audience", owner });
}

function receive(message) {
  if (message.type === "ping") {
    announce();
  } else if (message.type === "present") {
    load(message);
  } else if (message.type === "release" && message.from === owner) {
    idle();
  } else if (message.type === "state" && owner) {
    // From the presenter view, or from a second audience screen showing the
    // same talk and moved by its own keys.
    const fromPresenter = message.from === owner;
    const fromTwin = message.from !== id && message.from.startsWith("audience:") && message.owner === owner;
    if (!(fromPresenter || fromTwin) || !(message.seq > seq)) return;
    seq = message.seq;
    if (deck) apply(message);
    else pending = message;
  }
}

function setBlank(colour) {
  blank.dataset.colour = colour || "";
  blank.hidden = !colour;
}

function apply(position) {
  if (!position || !deck) return;
  applying = true;
  try {
    deck.show(position.index, position.step);
    setBlank(position.blank);
  } finally {
    applying = false;
  }
}

// A move made here, by a key or a link on the slide, goes back to the
// presenter view so the two stay together.
function changed() {
  if (applying || !owner || !deck) return;
  seq += 1;
  post({
    type: "state", owner, seq,
    index: deck.index, step: deck.step, blank: blank.dataset.colour || "",
  });
}

function freshStage() {
  // Each talk renders into a stage of its own, so a file still opening when
  // the next one arrives cannot paint over it.
  const next = document.createElement("div");
  next.className = "deck-stage audience-stage";
  stage.replaceWith(next);
  stage = next;
}

function message(text) {
  stage.replaceChildren(Object.assign(document.createElement("p"), {
    className: "deck-message", textContent: text,
  }));
}

// When the presenter tab whose talk is up closes, or crashes, go back to
// waiting rather than leaving its last slide up.
function watch(presenter) {
  whenClosed(presenter, () => {
    if (owner === presenter) idle();
  });
}

async function load(handover) {
  const ticket = ++loading;
  if (handover.from !== owner) watch(handover.from);
  owner = handover.from;
  seq = handover.seq ?? 0;
  pending = handover;
  announce();
  deck?.destroy?.();
  deck = null;
  freshStage();
  const target = stage;
  setBlank(handover.blank);
  document.body.classList.remove("idle");
  layout();
  try {
    const data = await handover.file.arrayBuffer();
    if (ticket !== loading) return;
    const opened = await openDeck(target, data, extensionOf(handover.name), changed);
    if (ticket !== loading) {
      opened.destroy?.();
      return;
    }
    deck = opened;
    apply(pending);
    pending = null;
  } catch {
    if (ticket === loading) message("This presentation couldn’t be shown here.");
  }
}

function idle() {
  loading += 1;
  owner = null;
  pending = null;
  deck?.destroy?.();
  deck = null;
  freshStage();
  setBlank("");
  document.body.classList.add("idle");
  layout();
  announce();
}

// Instructions and branding stay visible while waiting, even in full screen.
// Once a talk is up, only the small full-screen button remains.
function layout() {
  const full = Boolean(document.fullscreenElement);
  setup.hidden = !document.body.classList.contains("idle");
  corner.hidden = full || document.body.classList.contains("idle");
  otherDisplay.hidden = full || !(screen.isExtended && "getScreenDetails" in window);
  document.querySelector("#audience-fullscreen").textContent = full ? "Exit full screen" : "Full screen";
}

let hintTimer;
async function goFullScreen(onOtherDisplay) {
  clearTimeout(hintTimer);
  hint.textContent = "";
  if (document.fullscreenElement) {
    await document.exitFullscreen().catch(() => {});
    return;
  }
  const options = {};
  if (onOtherDisplay) {
    // Chrome and Edge can place a full-screen window on a chosen display,
    // after asking once for permission to see the displays.
    try {
      const details = await window.getScreenDetails();
      const elsewhere = details.screens.find(display => display !== details.currentScreen);
      if (elsewhere) options.screen = elsewhere;
    } catch {
      // Refused: full screen where the window already is.
    }
  }
  try {
    await document.documentElement.requestFullscreen(options);
    if (document.fullscreenElement) return;
  } catch {
    // Some browsers refuse, or the permission prompt used up the click.
  }
  const shortcut = navigator.platform.startsWith("Mac") ? "⌃⌘F" : "F11";
  hint.textContent = onOtherDisplay
    ? "Click again, or drag this window to the other display and use Full screen."
    : `Use ${shortcut} to make this window full screen.`;
  // This hint lives outside the waiting-screen card so it is visible during
  // a talk too. Remove it soon so it does not stay over the projected slide.
  hintTimer = setTimeout(() => { hint.textContent = ""; }, 6000);
}

document.querySelector("#audience-fullscreen").addEventListener("click", () => goFullScreen(false));
otherDisplay.addEventListener("click", () => goFullScreen(true));
corner.addEventListener("click", () => goFullScreen(false));
document.addEventListener("fullscreenchange", layout);

// The pointer and the corner button keep out of the audience's way.
let still;
function stir() {
  document.body.classList.remove("still");
  clearTimeout(still);
  still = setTimeout(() => document.body.classList.add("still"), 2500);
}
document.addEventListener("pointermove", stir);
document.addEventListener("pointerdown", stir);
stir();

function resume() {
  if (!blank.dataset.colour) return false;
  setBlank("");
  changed();
  return true;
}

document.addEventListener("keydown", event => {
  const move = moveFor(event);
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (move) {
    event.preventDefault();
    // Coming back from a blank screen returns to the slide that was up.
    if (resume()) return;
    makeMove(deck, move);
  } else if ((key === "b" || key === "w") && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    const colour = key === "b" ? "black" : "white";
    setBlank(blank.dataset.colour === colour ? "" : colour);
    changed();
  } else if (key === "f" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    goFullScreen(false);
  }
});

// Click to advance, except for links, media and the leftmost eighth (back).
document.addEventListener("click", event => {
  if (!deck) return;
  if (event.target.closest(".deck-blank")) {
    resume();
    return;
  }
  const move = moveForClick(event, stage);
  if (move) makeMove(deck, move);
});

let resizing;
function refit() {
  clearTimeout(resizing);
  resizing = setTimeout(() => deck?.resize?.(), 120);
}
window.addEventListener("resize", refit);
document.addEventListener("fullscreenchange", refit);

window.addEventListener("pagehide", () => post({ type: "audience-closed" }));
// Back from the browser's page cache, as after a reload undone.
window.addEventListener("pageshow", event => { if (event.persisted) idle(); });

layout();
if (!channel) {
  hint.textContent = "This browser can’t link windows together. Try a current Chrome, Edge, Firefox or Safari.";
}
// Announced only once the lock is held, so nobody waiting on it can take it
// first and conclude this screen has already closed.
holdUntilClosed(id, () => {
  ready = true;
  announce();
});
