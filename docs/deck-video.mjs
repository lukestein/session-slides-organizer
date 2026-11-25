// A YouTube video as a talk. It plays in YouTube's own player, embedded from
// youtube-nocookie.com, and is steered with the messages that player accepts
// from the page around it, so none of YouTube's scripts run in this page.
//
// Two kinds of controller, sharing one set of methods so the presenter and the
// audience screen can treat either alike:
//
//   openVideoPlayer   The video itself, in this window. With `controls` it
//                     carries YouTube's own controls, for the presenter tab on
//                     its own; without, clicks fall through to the page, as the
//                     audience screen wants, so focus (and a clicker's keys)
//                     never disappear into the player.
//   openVideoRemote   For presenter view: the cover and a set of controls,
//                     whose commands go to the audience screen, which reports
//                     back how the video is getting on.
//
// Both have play(), pause(), toggle(), seek(seconds), seekBy(seconds),
// status() and destroy(). Status is { state, time, duration, error }, where
// state is one of "unstarted", "playing", "paused", "buffering", "ended".
// They also answer to the deck engines' index, count, step and steps, as a
// one-slide talk, so presenter view's blanking and messages carry over as is.

const playerHost = "https://www.youtube-nocookie.com";
const states = { "-1": "unstarted", 0: "ended", 1: "playing", 2: "paused", 3: "buffering", 5: "unstarted" };

// YouTube's error codes, in words someone at a podium can act on.
export function videoProblem(code) {
  if (code === 101 || code === 150) return "The video’s owner doesn’t allow it to be played on other sites. Open it on YouTube instead.";
  if (code === 100) return "This video is private or has been removed.";
  if (code === 153) return "YouTube refused to play the video here.";
  if (code === "offline") return "Playing a video needs the internet, and this computer seems to be offline.";
  return "YouTube couldn’t play this video.";
}

export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor(whole / 60) % 60;
  const rest = String(whole % 60).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`;
}

// The keys, shared by the presenter tab and the audience screen. A clicker's
// forward button plays and pauses; its back button skips back ten seconds.
// The arrows, J and L, and Home follow YouTube's own keys. Returns true when
// the key was for the video.
export function videoKey(event, video) {
  if (!video || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return false;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const action = {
    " ": () => video.toggle(), k: () => video.toggle(), Enter: () => video.toggle(),
    PageDown: () => video.toggle(), ArrowDown: () => video.toggle(),
    PageUp: () => video.seekBy(-10), ArrowUp: () => video.seekBy(-10),
    ArrowLeft: () => video.seekBy(-5), ArrowRight: () => video.seekBy(5),
    j: () => video.seekBy(-10), l: () => video.seekBy(10),
    Home: () => video.seek(0), 0: () => video.seek(0),
  }[key];
  if (!action) return false;
  // Enter on a focused button is the button's business.
  if (key === "Enter" && event.target.closest?.("button, a, input")) return false;
  event.preventDefault();
  action();
  return true;
}

function cover(stage, image, onClick) {
  const box = document.createElement(onClick ? "button" : "div");
  box.className = "video-cover";
  if (onClick) {
    box.type = "button";
    box.setAttribute("aria-label", "Play the video");
    box.addEventListener("click", onClick);
  }
  if (image) {
    const picture = new Image();
    picture.alt = "";
    picture.src = image;
    box.append(picture);
  }
  if (onClick) box.insertAdjacentHTML("beforeend", playMark);
  stage.append(box);
  return box;
}

const playMark = `<svg class="video-play-mark" aria-hidden="true" viewBox="0 0 68 48" width="68" height="48">
  <rect width="68" height="48" rx="12" fill="#006644"/><path d="M27 15v18l16-9z" fill="#fff"/></svg>`;

function shell(stage) {
  const frame = document.createElement("div");
  frame.className = "video-stage";
  stage.replaceChildren(frame);
  return frame;
}

function message(frame, text) {
  frame.querySelector(".video-problem")?.remove();
  if (!text) return;
  frame.append(Object.assign(document.createElement("p"), { className: "deck-message video-problem", textContent: text }));
}

// One-slide answers for the parts of the presenter that speak in slides.
const asTalk = {
  video: true, index: 0, count: 1, step: 0, steps: 0,
  show() {}, goTo() {}, resize() {},
};

/**
 * The player. `start` is where to begin, in seconds; `autoplay` starts it as
 * soon as it is ready; `cover` is an image URL shown before it plays and after
 * it ends, in place of YouTube's title card and suggestions; `onStatus` hears
 * every change of state, and the time about four times a second while it plays.
 */
export function openVideoPlayer(stage, { id, start = 0, autoplay = false, controls = false, cover: image = "", onStatus = () => {} }) {
  const frame = shell(stage);
  frame.classList.toggle("video-remote-controlled", !controls);
  const iframe = document.createElement("iframe");
  const parameters = new URLSearchParams({
    enablejsapi: "1", rel: "0", playsinline: "1", modestbranding: "1", iv_load_policy: "3",
    controls: controls ? "1" : "0", disablekb: controls ? "0" : "1", fs: "0",
    origin: location.origin,
  });
  if (start) parameters.set("start", String(Math.floor(start)));
  iframe.src = `${playerHost}/embed/${encodeURIComponent(id)}?${parameters}`;
  iframe.title = "YouTube video";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  // YouTube's player refuses to run without knowing which site embeds it, so
  // this one request carries the site's address — the origin, nothing more.
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  frame.append(iframe);

  const status = { state: "unstarted", time: start, duration: 0, error: null };
  let ready = false;
  let played = false;
  let wanted = autoplay ? "play" : null;
  let seekTo = null;
  let stuck;
  const poster = cover(frame, image, controls ? () => controller.play() : null);

  function send(func, args = []) {
    iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args, id: 1, channel: "widget" }), playerHost);
  }
  function report() {
    poster.hidden = !["unstarted", "ended"].includes(status.state) || Boolean(status.error) || (status.state === "unstarted" && wanted === "play");
    onStatus({ ...status });
  }
  let lastReported = "";
  function heard(event) {
    if (event.source !== iframe.contentWindow || event.origin !== playerHost) return;
    let data;
    try {
      data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    } catch {
      return;
    }
    if (data?.event === "onReady") {
      ready = true;
      if (seekTo !== null) send("seekTo", [seekTo, true]);
      if (wanted === "play") send("playVideo");
      return;
    }
    if (data?.event === "onError") {
      status.error = Number(data.info);
      message(frame, videoProblem(status.error));
      report();
      return;
    }
    if (data?.event !== "infoDelivery" || !data.info) return;
    const info = data.info;
    let changed = false;
    if ("playerState" in info && states[info.playerState] && states[info.playerState] !== status.state) {
      status.state = states[info.playerState];
      changed = true;
      if (status.state === "playing" || status.state === "buffering") clearTimeout(stuck);
    }
    if (typeof info.duration === "number" && info.duration && info.duration !== status.duration) {
      status.duration = info.duration;
      changed = true;
    }
    if (status.state === "playing") played = true;
    // While loading, the player reports 0:00 before it has moved to the
    // start time, which would lose that time if the talk were handed over.
    if (typeof info.currentTime === "number" && (played || info.currentTime || !start)) {
      status.time = info.currentTime;
      // Every quarter second is plenty for a clock and a progress bar.
      const mark = `${status.state}:${Math.floor(status.time * 4)}`;
      if (mark !== lastReported) changed = true;
    }
    if (changed) {
      lastReported = `${status.state}:${Math.floor(status.time * 4)}`;
      report();
    }
  }
  window.addEventListener("message", heard);
  // Ask the player to report back; it starts once it hears from the page.
  iframe.addEventListener("load", () => {
    iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), playerHost);
    send("addEventListener", ["onReady"]);
    send("addEventListener", ["onError"]);
  });
  if (!navigator.onLine) message(frame, videoProblem("offline"));

  const controller = {
    ...asTalk,
    play() {
      wanted = "play";
      poster.hidden = true;
      clearTimeout(stuck);
      // A browser that holds back sound until the window has been clicked
      // leaves the player sitting still. Say so, rather than look broken.
      stuck = setTimeout(() => {
        if (wanted === "play" && !["playing", "buffering"].includes(status.state)) onStatus({ ...status, blocked: true });
      }, 4000);
      if (ready) send("playVideo");
    },
    pause() {
      wanted = "pause";
      clearTimeout(stuck);
      if (ready) send("pauseVideo");
    },
    toggle() {
      if (status.state === "playing" || status.state === "buffering" || (wanted === "play" && status.state === "unstarted")) this.pause();
      else this.play();
    },
    seek(seconds) {
      const time = Math.max(0, status.duration ? Math.min(seconds, status.duration - 0.5) : seconds);
      status.time = time;
      seekTo = time;
      played = true;
      if (ready) send("seekTo", [time, true]);
      report();
    },
    seekBy(seconds) {
      this.seek(status.time + seconds);
    },
    status: () => ({ ...status }),
    // The audience screen obeys the presenter's commands with these.
    command({ command, time }) {
      if (command === "play") this.play();
      else if (command === "pause") this.pause();
      else if (command === "seek" && Number.isFinite(time)) this.seek(time);
    },
    next() { this.toggle(); },
    prev() { this.seekBy(-10); },
    destroy() {
      clearTimeout(stuck);
      window.removeEventListener("message", heard);
      iframe.src = "about:blank";
      frame.remove();
    },
  };
  return controller;
}

/**
 * Presenter view's side of a video: the cover, and controls whose commands go
 * through `send({ command, time })` to the audience screen. update(status)
 * takes what the audience screen reports.
 */
export function openVideoRemote(stage, { start = 0, cover: image = "", title = "", send }) {
  const frame = shell(stage);
  frame.classList.add("video-remote");
  const picture = cover(frame, image, null);
  picture.hidden = false;
  const panel = document.createElement("div");
  panel.className = "video-panel";
  panel.innerHTML = `
    <p class="video-heading"></p>
    <div class="video-buttons">
      <button type="button" class="deck-button" data-act="restart" title="Back to the start (Home)">⏮ Start</button>
      <button type="button" class="deck-button" data-act="back" title="Back 10 seconds (J, Page Up)">−10 s</button>
      <button type="button" class="deck-button video-toggle" data-act="toggle" title="Play or pause (Space, K, Page Down)">Play</button>
      <button type="button" class="deck-button" data-act="forward" title="Forward 10 seconds (L)">+10 s</button>
    </div>
    <input type="range" class="video-progress" min="0" max="0" step="1" value="0" aria-label="Position in the video">
    <p class="video-time"><span class="video-now">0:00</span> / <span class="video-length">–:––</span></p>
    <p class="video-note" role="status"></p>`;
  frame.append(panel);
  panel.querySelector(".video-heading").textContent = title;
  const toggleButton = panel.querySelector(".video-toggle");
  const progress = panel.querySelector(".video-progress");
  const now = panel.querySelector(".video-now");
  const length = panel.querySelector(".video-length");
  const note = panel.querySelector(".video-note");

  const status = { state: "unstarted", time: start, duration: 0, error: null };
  let dragging = false;
  function paint() {
    const playing = status.state === "playing" || status.state === "buffering";
    toggleButton.textContent = playing ? "Pause" : status.state === "ended" ? "Play again" : "Play";
    now.textContent = formatTime(status.time);
    length.textContent = status.duration ? formatTime(status.duration) : "–:––";
    progress.max = String(Math.floor(status.duration || 0));
    if (!dragging) progress.value = String(Math.floor(status.time || 0));
    progress.disabled = !status.duration;
    picture.classList.toggle("dim", playing);
  }
  function say(text) {
    note.textContent = text;
  }
  paint();

  const controller = {
    ...asTalk,
    remote: true,
    play() {
      if (status.state === "ended") send({ command: "seek", time: 0 });
      send({ command: "play" });
    },
    pause() { send({ command: "pause" }); },
    toggle() {
      if (status.state === "playing" || status.state === "buffering") this.pause();
      else this.play();
    },
    seek(seconds) {
      const time = Math.max(0, status.duration ? Math.min(seconds, status.duration - 0.5) : seconds);
      status.time = time;
      paint();
      send({ command: "seek", time });
    },
    seekBy(seconds) { this.seek(status.time + seconds); },
    status: () => ({ ...status }),
    update(report) {
      Object.assign(status, {
        state: report.state ?? status.state,
        time: report.time ?? status.time,
        duration: report.duration || status.duration,
        error: report.error ?? null,
      });
      if (report.error) say(videoProblem(report.error));
      else if (report.blocked) say("The audience screen is holding back sound until it has been clicked. Click it once, then press Play again.");
      else if (status.state === "buffering") say("Loading…");
      else say("");
      paint();
    },
    say,
    next() { this.toggle(); },
    prev() { this.seekBy(-10); },
    destroy() { frame.remove(); },
  };

  panel.addEventListener("click", event => {
    const act = event.target.closest("button")?.dataset.act;
    if (act === "toggle") controller.toggle();
    else if (act === "back") controller.seekBy(-10);
    else if (act === "forward") controller.seekBy(10);
    else if (act === "restart") controller.seek(0);
  });
  progress.addEventListener("input", () => {
    dragging = true;
    now.textContent = formatTime(Number(progress.value));
  });
  progress.addEventListener("change", () => {
    dragging = false;
    controller.seek(Number(progress.value));
  });
  // The arrows on the slider would otherwise move it and the video both.
  progress.addEventListener("keydown", event => event.stopPropagation());
  return controller;
}
