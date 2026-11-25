// Presents one deck in its own tab. The organizer hands over a blob URL; this
// page reads it, renders it, and never uploads anything.
//
// The shell here — bar, keyboard, blanking, thumbnail strip, full screen — is
// the same whatever the format. Rendering is a small engine per format, in
// deck-pptx.mjs and deck-pdf.mjs, opened through deck-open.mjs.
//
// Presenter view turns this tab into the speaker's side of a two-screen setup:
// the current slide, the next one, notes, a timer and every slide along the
// foot, while an audience screen (audience.mjs) in another window shows the
// slide to the room. Without one, nothing changes.
import { holdUntilClosed, newId, openAudienceWindow, openChannel, trackAudiences } from "./audience-channel.mjs";
import { extensionOf, makeMove, mimeTypes, moveFor, moveForClick, openDeck } from "./deck-open.mjs";
import { openVideoPlayer, openVideoRemote, videoKey } from "./deck-video.mjs";

const stage = document.querySelector("#deck-stage");
const counter = document.querySelector("#deck-count");
const heading = document.querySelector("#deck-title");
const sourceName = document.querySelector("#deck-source");
const fullscreen = document.querySelector("#deck-fullscreen");
const blank = document.querySelector("#deck-blank");
const picker = document.querySelector("#deck-picker");
const help = document.querySelector("#deck-help");
const downloadLink = document.querySelector("#deck-download");
const original = document.querySelector("#deck-original");
const presenterButton = document.querySelector("#deck-presenter");
const side = document.querySelector("#deck-side");
const upNext = document.querySelector("#deck-upnext");
const builds = document.querySelector("#deck-builds");
const notesSection = document.querySelector("#deck-notes-section");
const notesText = document.querySelector("#deck-notes");
const elapsed = document.querySelector("#deck-elapsed");
const clock = document.querySelector("#deck-time");
const screenStatus = document.querySelector("#deck-screen-status");
const screenAction = document.querySelector("#deck-screen-action");
const upNextSection = document.querySelector(".deck-upnext");
let deck;
// The picker stays put when it was asked for, and withdraws when it was only
// uncovered by the pointer resting at the foot of the slide.
let pickerPinned = false;

// Presenter view, and the audience screen it drives.
const id = newId("presenter");
let presenterView = false;
// { file, name, title }, or { video, title, cover } for a YouTube video: what
// an audience screen is handed.
let talk = null;
let seq = 0;
let applying = false;
let lastSent = "";
// Set when this tab opened an audience screen, so it claims that screen as
// soon as the screen says it is there.
let claimNext = false;
// Whether the audience screen was last showing this talk, so it can be taken
// back after the screen is reloaded.
let mine = false;
const audiences = trackAudiences(audienceChanged);
// So an audience screen can tell when the talk it shows has been closed,
// however that happened.
holdUntilClosed(id);
const channel = openChannel(receive);
channel?.postMessage({ type: "ping" });

function message(text) {
  stage.replaceChildren(Object.assign(document.createElement("p"), {
    className: "deck-message", textContent: text,
  }));
}

function updateCount() {
  if (!deck) return;
  if (deck.video) {
    counter.textContent = "";
    return;
  }
  counter.textContent = `${deck.index + 1} / ${deck.count}`;
  // picker.children is an HTMLCollection, which has no entries().
  Array.from(picker.children).forEach((thumb, index) => {
    thumb.classList.toggle("current", index === deck.index);
  });
}

// Runs after every move and every change of blanking, whatever caused it: a
// key, a click, a link on the slide, or the audience screen reporting one.
function changed() {
  updateCount();
  if (!presenterView) return;
  followStrip();
  updateSide();
  sendState();
}

function blanked() {
  return Boolean(blank.dataset.colour);
}

// B and W blank the screen as they do in PowerPoint. In presenter view they
// blank the audience screen, and this tab marks the slide as hidden.
function setBlank(colour) {
  const next = blank.dataset.colour === colour ? "" : colour;
  blank.dataset.colour = next;
  blank.hidden = !next;
  // A video playing under a blank screen would carry on being heard.
  if (next && deck?.video && !deck.remote) deck.pause();
  changed();
}

function resume() {
  if (!blanked()) return;
  blank.dataset.colour = "";
  blank.hidden = true;
  changed();
}

function showHelp(open) {
  help.hidden = !open;
}

function pickerOpen() {
  return picker.classList.contains("open");
}

function centreStrip() {
  const current = picker.querySelector(".current");
  if (!current) return;
  // Scroll the strip itself rather than calling scrollIntoView, which walks up
  // and scrolls every scrollable ancestor — and a clipped box still scrolls
  // programmatically, which yanked the slide to the top of the window.
  picker.scrollTo({
    left: current.offsetLeft - (picker.clientWidth - current.offsetWidth) / 2,
    behavior: "instant",
  });
}

function showPicker(open, pin = false) {
  // Presenter view keeps the strip along the foot at all times.
  if (presenterView && !open) return;
  // A class, not the hidden attribute, so the strip can slide both ways.
  picker.classList.toggle("open", open);
  pickerPinned = open && pin;
  if (!open) return;
  fillPicker();
  centreStrip();
  requestAnimationFrame(() => requestAnimationFrame(paintVisibleThumbs));
}

// In presenter view the strip keeps the current slide in sight, without
// jumping while it is still on screen.
function followStrip() {
  const current = picker.querySelector(".current");
  if (!current) return;
  const strip = picker.getBoundingClientRect();
  const box = current.getBoundingClientRect();
  if (box.left < strip.left || box.right > strip.right) centreStrip();
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
      changed();
    });
    return thumb;
  }));
  for (const thumb of picker.children) watcher.observe(thumb);
  updateCount();
}

function step(move) {
  return () => { resume(); move(); changed(); };
}

document.querySelector("#deck-prev").addEventListener("click", step(() => deck?.prev()));
document.querySelector("#deck-next").addEventListener("click", step(() => deck?.next()));

// Click the current slide to advance, or its leftmost eighth to go back.
// Shared with the audience window so links, media and letterboxing behave
// the same in both. The next-slide preview and page controls keep their clicks.
document.addEventListener("click", event => {
  if (!deck) return;
  if (event.target.closest(".deck-blank")) {
    resume();
    return;
  }
  // A video has its own controls; a stray click should not start or stop it.
  if (deck.video) return;
  const move = moveForClick(event, stage);
  if (move) step(() => makeMove(deck, move))();
});
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
  if (event.pointerType === "touch" || pickerPinned || presenterView || deck?.video) return;
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
  const move = moveFor(event);
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  // A video takes play, pause and skipping; blanking and the guide work as
  // for slides, and any key that moves brings a blanked screen back.
  if (deck?.video && help.hidden && !blanked() && videoKey(event, deck)) return;
  if (deck?.video && key === "g") return;

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
    makeMove(deck, move);
    changed();
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
  if (event.key === "Escape" && (!help.hidden || (pickerOpen() && !presenterView))) {
    event.preventDefault();
    showHelp(false);
    showPicker(false);
  }
});

// Re-fit the page after the window changes shape, and after entering or leaving
// full screen. Only the PDF engine needs this; the deck renderer scales itself.
let resizing;
function refit() {
  clearTimeout(resizing);
  resizing = setTimeout(() => deck?.resize?.(), 120);
}
window.addEventListener("resize", refit);
document.addEventListener("fullscreenchange", refit);

// ---- Presenter view -------------------------------------------------------

function position() {
  return { index: deck.index, step: deck.step ?? 0, blank: blank.dataset.colour || "" };
}

function onScreen() {
  return audiences.showing(id);
}

// Hands this talk to the audience screens. The newest talk handed over is the
// one they show, so opening the next talk moves the room on to it.
function sendTalk() {
  if (!channel || !deck || !talk) return;
  claimNext = false;
  seq += 1;
  const now = position();
  lastSent = JSON.stringify(now);
  // A video picks up where it is, playing or not.
  const video = deck.video
    ? { ...talk.video, start: deck.status().time, playing: deck.status().state === "playing" }
    : undefined;
  channel.postMessage({ type: "present", from: id, seq, ...talk, ...now, ...(video && { video }) });
}

function sendState() {
  if (applying || !channel || !deck || !onScreen()) return;
  const now = position();
  const key = JSON.stringify(now);
  if (key === lastSent) return;
  lastSent = key;
  seq += 1;
  channel.postMessage({ type: "state", from: id, seq, ...now });
}

function receive(message) {
  if (audiences.handle(message)) return;
  // How the video on the audience screen is getting on.
  if (message.type === "video-status" && message.owner === id && deck?.remote) {
    deck.update(message);
    return;
  }
  // A move made on the audience screen, by its own keys or a link on the slide.
  if (message.type === "state" && message.owner === id && message.from.startsWith("audience:")) {
    if (!deck || !(message.seq > seq)) return;
    seq = message.seq;
    applying = true;
    try {
      deck.show(message.index, message.step);
      blank.dataset.colour = message.blank || "";
      blank.hidden = !message.blank;
    } finally {
      applying = false;
    }
    lastSent = JSON.stringify(position());
    changed();
  }
}

function audienceChanged(message) {
  if (message.type === "audience") {
    if (message.owner === id) mine = true;
    else if (message.owner) mine = false;
    // A screen that has just opened, or been reloaded, and is waiting: the tab
    // that opened it claims it, as does the tab whose talk it was showing.
    else if (presenterView && deck && (claimNext || mine)) sendTalk();
  }
  updateScreenStatus();
}

function updateScreenStatus() {
  if (!presenterView) return;
  let text;
  let action = "";
  if (!channel) {
    text = "This browser can’t link windows together.";
  } else if (onScreen()) {
    text = "Showing on the audience screen.";
  } else if (audiences.open) {
    text = audiences.idle
      ? "The audience screen is waiting."
      : "The audience screen is showing another talk.";
    action = "Show this talk";
  } else if (claimNext) {
    text = "Opening the audience screen…";
  } else {
    text = "No audience screen is open. Open one, then move it to the projector.";
    action = "Open audience screen";
  }
  screenStatus.textContent = text;
  side.dataset.screen = onScreen() ? "live" : "off";
  screenAction.textContent = action;
  screenAction.hidden = !action;
}

screenAction.addEventListener("click", () => {
  if (audiences.open) {
    sendTalk();
  } else {
    claimNext = true;
    if (!openAudienceWindow()) {
      claimNext = false;
      screenStatus.textContent = "The browser blocked the new window. Allow pop-ups for this site and try again.";
      return;
    }
    updateScreenStatus();
  }
});

// The next slide, and how many builds are still to come on this one.
const previews = new Map();
function updateSide() {
  if (!deck) return;
  upNextSection.hidden = Boolean(deck.video);
  if (deck.video) {
    notesSection.hidden = true;
    side.classList.remove("has-notes");
    return;
  }
  const remaining = (deck.steps ?? 0) - (deck.step ?? 0);
  builds.hidden = remaining <= 0;
  builds.textContent = remaining === 1 ? "1 more click on this slide"
    : `${remaining} more clicks on this slide`;

  const following = deck.index + 1;
  if (following >= deck.count) {
    upNext.replaceChildren(Object.assign(document.createElement("p"), {
      className: "deck-end", textContent: "End of presentation",
    }));
  } else if (previews.has(following)) {
    upNext.replaceChildren(previews.get(following));
  } else {
    const box = document.createElement("div");
    box.className = "deck-upnext-picture";
    upNext.replaceChildren(box);
    Promise.resolve()
      .then(() => deck.renderThumb(following, box))
      .then(() => previews.set(following, box))
      .catch(() => {});
  }

  const notes = deck.notes?.(deck.index) ?? "";
  notesText.textContent = notes;
  notesSection.hidden = !notes;
  side.classList.toggle("has-notes", Boolean(notes));
}

// Elapsed time since presenter view began, and the time of day.
let startedAt = 0;
let ticking;
function tick() {
  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const rest = String(seconds % 60).padStart(2, "0");
  elapsed.textContent = hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
document.querySelector("#deck-restart").addEventListener("click", () => {
  startedAt = Date.now();
  tick();
});

// A running clock is not for everyone. Hiding it keeps the time of day, and
// lasts for this talk only, so the next speaker at a shared podium gets it back.
const timerParts = ["#deck-elapsed", "#deck-timer-close", "#deck-restart"]
  .map(selector => document.querySelector(selector));
const timerShow = document.querySelector("#deck-timer-show");
function showTimer(on) {
  for (const part of timerParts) part.hidden = !on;
  timerShow.hidden = on;
}
document.querySelector("#deck-timer-close").addEventListener("click", () => {
  showTimer(false);
  timerShow.focus();
});
timerShow.addEventListener("click", () => {
  showTimer(true);
  document.querySelector("#deck-restart").focus();
});

function setPresenterView(on) {
  if (presenterView === on) return;
  presenterView = on;
  document.body.classList.toggle("presenter-view", on);
  side.hidden = !on;
  presenterButton.textContent = on ? "Leave presenter view" : "Presenter view";
  presenterButton.title = on
    ? "Back to one screen: the slides fill this tab, and the audience screen waits"
    : "Notes, the next slide and a timer here, with the slides on a second screen";
  document.querySelector("#deck-slides").hidden = on;
  if (deck?.video) {
    if (on) steerVideo();
    else playVideoHere(deck.status().time, false);
  }
  if (on) {
    startedAt = Date.now();
    tick();
    ticking = setInterval(tick, 1000);
    if (!deck?.video) showPicker(true);
    updateSide();
    updateScreenStatus();
  } else {
    clearInterval(ticking);
    if (onScreen()) channel?.postMessage({ type: "release", from: id });
    claimNext = false;
    mine = false;
    picker.classList.remove("open");
    pickerPinned = false;
  }
  refit();
}

presenterButton.addEventListener("click", () => {
  if (presenterView) {
    setPresenterView(false);
    return;
  }
  setPresenterView(true);
  if (audiences.open) {
    sendTalk();
  } else if (channel) {
    // Straight from the click, or the popup blocker steps in.
    claimNext = Boolean(openAudienceWindow());
    updateScreenStatus();
  }
});

// Closing the tab hands the room back to the audience screen's waiting page.
// The lock taken above does this too, but only once the tab is gone, which a
// browser may put off while it keeps the page in its back-forward cache.
window.addEventListener("pagehide", () => {
  if (onScreen()) channel?.postMessage({ type: "release", from: id });
});

// Waits briefly for an audience screen to answer the ping sent on load.
function audienceAnswer(within) {
  if (audiences.open || !channel) return Promise.resolve();
  return new Promise(done => {
    const timer = setTimeout(done, within);
    channel.addEventListener("message", function heard(event) {
      if (event.data?.type !== "audience") return;
      clearTimeout(timer);
      channel.removeEventListener("message", heard);
      done();
    });
  });
}

// ---- A YouTube video -------------------------------------------------------

// On its own, the video plays in this tab with YouTube's controls.
function playVideoHere(start, autoplay) {
  deck?.destroy?.();
  deck = openVideoPlayer(stage, { ...talk.video, start, autoplay, controls: true, cover: talk.coverUrl });
}

// In presenter view it plays on the audience screen, and this tab holds the
// controls. Whatever was playing here carries on there.
function steerVideo() {
  const was = deck?.status?.() ?? { time: talk.video.start, state: "unstarted" };
  deck?.destroy?.();
  deck = openVideoRemote(stage, {
    start: was.time,
    cover: talk.coverUrl,
    title: talk.title,
    send(command) {
      if (!onScreen()) {
        deck.say("This video isn’t on the audience screen. Use Show this talk first.");
        return;
      }
      channel.postMessage({ type: "video", from: id, ...command });
    },
  });
  if (was.state === "playing") deck.update({ state: "playing" });
}

async function startVideo(parameters, title) {
  const video = parameters.get("video") ?? "";
  if (!/^[A-Za-z0-9_-]{11}$/.test(video)) {
    message("Open this video from the organizer tab.");
    return;
  }
  document.body.classList.add("video-talk");
  document.querySelector("#deck-slides").hidden = true;
  document.title = title ? `Playing ${title}` : "Playing a video";
  original.href = `https://www.youtube.com/watch?v=${video}`;
  original.textContent = "Open on YouTube";
  original.title = "Watch this video on YouTube itself";
  original.rel = "noopener noreferrer";
  original.hidden = false;
  // The cover comes from the organizer tab, which may let it go, so keep a copy.
  let cover = null;
  const coverSource = parameters.get("cover") ?? "";
  if (coverSource.startsWith("blob:")) {
    try {
      cover = await (await fetch(coverSource)).blob();
    } catch {
      cover = null;
    }
  }
  const start = Math.max(0, Number(parameters.get("start")) || 0);
  talk = { video: { id: video, start }, title, cover, coverUrl: cover ? URL.createObjectURL(cover) : "" };
  playVideoHere(start, false);
  updateCount();
  await audienceAnswer(400);
  if (audiences.open) {
    setPresenterView(true);
    sendTalk();
  }
}

// ---------------------------------------------------------------------------

async function start() {
  const parameters = new URLSearchParams(location.search);
  const source = parameters.get("src");
  const title = parameters.get("title") ?? "";
  const filename = parameters.get("name") ?? "";
  const sourceFile = parameters.get("file") ?? "";
  heading.textContent = title;
  document.title = title ? `Presenting ${title}` : "Presenting";

  // The file's own name, when the talk goes by something else: enough to tell
  // which deck is on screen without repeating the title back in another form.
  const stem = sourceFile.replace(/[.][^.]+$/, "");
  if (sourceFile && title.trim() && title.trim() !== sourceFile && title.trim() !== stem) {
    sourceName.textContent = sourceFile;
    sourceName.title = sourceFile;
    sourceName.hidden = false;
  }

  if (parameters.has("video")) {
    await startVideo(parameters, title);
    return;
  }

  if (!source?.startsWith("blob:")) {
    message("Open this presentation from the organizer tab.");
    return;
  }

  let data;
  try {
    // Read the file up front so that closing the organizer tab, or removing the
    // row, cannot pull it out from under a talk in progress.
    data = await (await fetch(source)).arrayBuffer();
  } catch {
    message("This presentation is no longer available. Open it again from the organizer tab.");
    return;
  }

  const extension = extensionOf(filename);
  const type = mimeTypes[extension] ?? "application/octet-stream";
  // A copy of our own, so the buttons keep working however the organizer tab
  // fares. Blob() copies, so the renderer may still claim the buffer below.
  const file = new Blob([data], { type });
  const ours = URL.createObjectURL(file);
  talk = { file, name: filename, title };
  downloadLink.href = ours;
  downloadLink.download = filename || "presentation";
  downloadLink.hidden = false;
  if (extension === "pdf") {
    // Links, search and printing live in the browser's own PDF viewer.
    original.href = ours;
    original.hidden = false;
  }

  try {
    deck = await openDeck(stage, data, extension, changed);
  } catch {
    message(extension === "pdf"
      ? "This PDF couldn’t be opened here. Download it to open in another viewer."
      : "This presentation couldn’t be opened here. Download it to present in PowerPoint.");
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
  // With an audience screen open, a talk starts in presenter view and takes
  // the screen over: that is how one talk follows another in a room with a
  // podium screen and a projector.
  await audienceAnswer(400);
  if (audiences.open) {
    setPresenterView(true);
    sendTalk();
  }
}

// Without a way to reach another window there is no audience screen to drive.
presenterButton.hidden = !channel;

start();
