// The audience screen is a second window, moved to the projector, that shows
// whatever talk a presenter view sends it. The organizer, the presenter tabs
// and the audience screen talk over a BroadcastChannel, which reaches only
// this site's other tabs in this browser: nothing leaves the computer.
//
// Messages, each with a `type`:
//   ping                 Anyone asking which audience screens are open.
//   audience             An audience screen saying it is there, and whose talk
//                        it shows (`owner`, a presenter tab's id, or null).
//   audience-closed      An audience screen going away. Its Web Lock says
//                        so too, in case this message never arrives.
//   present              A presenter tab handing over its file and position.
//                        The newest one takes the screen.
//   state                A move: `index`, `step` (builds played on the slide)
//                        and `blank`. From a presenter, or from an audience
//                        screen whose own keys or links moved it, on behalf
//                        of `owner`. `seq` puts moves in order.
//   release              A presenter tab giving the screen back.
//   video                Presenter view steering a YouTube video on the
//                        audience screen: `command` (play, pause or seek) and
//                        `time`. A `present` for a video carries `video`
//                        ({ id, start, playing }) and `cover` in place of a file.
//   video-status         The audience screen saying how that video is getting
//                        on, on behalf of `owner`: state, time, duration, error.
export const channelName = "slideorg-audience";

export function openChannel(onMessage) {
  if (typeof BroadcastChannel !== "function") return null;
  const channel = new BroadcastChannel(channelName);
  channel.addEventListener("message", event => {
    if (event.data && typeof event.data.type === "string") onMessage(event.data);
  });
  return channel;
}

export function newId(prefix) {
  return `${prefix}:${crypto.randomUUID()}`;
}

// A popup window rather than a tab, so it can be dragged onto the projector on
// its own. Must be called straight from a click, or the popup blocker steps in.
export function openAudienceWindow() {
  const width = Math.round(Math.min(screen.availWidth * 0.5, 960));
  const height = Math.round(width * 9 / 16);
  return window.open("./audience.html", "_blank", `popup,width=${width},height=${height}`);
}

// Keeps count of the audience screens that have said they are open, and whose
// talk each one shows. `changed` runs whenever that picture changes.
//
// Each audience screen and each presenter tab holds a Web Lock named after its
// own id for as long as it lives. A message sent while a window closes can be
// lost, and a crashed window sends none, but its lock is always released, so
// waiting on that lock is the reliable way to hear that it has gone.
export function holdUntilClosed(id, ready = () => {}) {
  if (!navigator.locks) {
    ready();
    return;
  }
  navigator.locks.request(id, () => {
    ready();
    return new Promise(() => {});
  }).catch(() => ready());
}

export function whenClosed(id, gone) {
  navigator.locks?.request(id, () => gone()).catch(() => {});
}

export function trackAudiences(changed) {
  const screens = new Map();
  return {
    screens,
    get open() { return screens.size > 0; },
    showing(owner) { return [...screens.values()].includes(owner); },
    get idle() { return screens.size > 0 && [...screens.values()].every(owner => !owner); },
    // Returns true for messages it handled.
    handle(message) {
      if (message.type === "audience") {
        if (!screens.has(message.from)) {
          whenClosed(message.from, () => {
            if (screens.delete(message.from)) changed({ type: "audience-closed", from: message.from });
          });
        }
        screens.set(message.from, message.owner ?? null);
      } else if (message.type === "audience-closed") {
        screens.delete(message.from);
      } else {
        return false;
      }
      changed(message);
      return true;
    },
  };
}
