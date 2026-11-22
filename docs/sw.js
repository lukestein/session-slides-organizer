// Keeps a copy of the site in this browser, so the organizer opens even when
// the room computer has no internet. It never touches slide files: those are
// read from disk or fetched from other sites, and this only handles the
// site's own files.
//
// Network first: online, every request goes out exactly as it would without
// this (the browser's ordinary HTTP cache included), and the copy is refreshed
// from the answer, so being online is no staler than it was before. The copy
// is used only when the network fails, or is so slow that waiting would be
// worse, as behind a hotel Wi-Fi sign-in page.
//
// To switch this off for everyone, replace this file with:
//   self.addEventListener("install", () => self.skipWaiting());
//   self.addEventListener("activate", () => self.registration.unregister());
// and delete the caches it made (see DEVELOPING.md).

const cacheName = "session-slides-organizer";
const scope = new URL("./", self.location).href;
// How long a request may wait on the network before the copy is served
// instead. The network answer still refreshes the copy when it arrives.
const patience = 4000;
// How often, at most, the whole copy is checked against the server. Files
// used on a visit are refreshed anyway; this catches the ones that were not,
// such as the PowerPoint renderer on a day with only PDFs.
const refreshEvery = 12 * 60 * 60 * 1000;
const stampKey = `${scope}__refreshed`;
// After a fill that missed some files, how long to wait before trying again:
// soon enough that a dropped download is back well before the session, not so
// soon that every page load on a flaky network re-checks the whole site.
const retryAfter = 10 * 60 * 1000;

// Query strings never change the file: the presenter's carries the deck's
// blob address, which differs every time.
function cacheKey(url) {
  const key = new URL(url);
  key.search = "";
  key.hash = "";
  if (key.href === scope || key.href.endsWith("/")) key.pathname += "index.html";
  return key.href;
}

// Only a whole, same-site answer is worth keeping. A sign-in page that the
// network redirected to is not the file that was asked for.
function keepable(response) {
  return response.ok && response.type === "basic" && !response.redirected;
}

async function refreshCopy() {
  const cache = await caches.open(cacheName);
  const listing = await fetch(new URL("offline-files.json", scope), { cache: "no-cache" });
  if (!keepable(listing)) throw new Error("No file list.");
  const files = (await listing.json()).map(path => new URL(path, scope).href);
  // One at a time would be slow and all at once floods a weak connection.
  const queue = [...files];
  let complete = true;
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      try {
        const response = await fetch(url, { cache: "no-cache" });
        if (keepable(response)) await cache.put(url, response);
        else complete = false;
      } catch {
        complete = false;
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (!complete) {
    // Back-date the stamp so the next try comes after retryAfter rather than
    // a whole refreshEvery. This also replaces a recent stamp written for an
    // older worker's file list.
    await cache.put(stampKey, new Response(String(Date.now() - refreshEvery + retryAfter)));
    return;
  }
  // Forget files the site no longer has.
  const wanted = new Set(files);
  for (const request of await cache.keys()) {
    if (!wanted.has(request.url) && request.url !== stampKey) await cache.delete(request);
  }
  await cache.put(stampKey, new Response(String(Date.now())));
}

async function refreshIfDue() {
  const cache = await caches.open(cacheName);
  const stamp = await cache.match(stampKey);
  const last = stamp ? Number(await stamp.text()) : 0;
  if (Date.now() - last > refreshEvery) await refreshCopy();
}

self.addEventListener("install", event => {
  self.skipWaiting();
  // The page works before this finishes; a failure here just means the copy
  // is filled in later.
  event.waitUntil(refreshCopy().catch(() => {}));
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

async function respond(event) {
  const { request } = event;
  const key = cacheKey(request.url);
  const cache = await caches.open(cacheName);
  const network = fetch(request).then(async response => {
    if (keepable(response)) await cache.put(key, response.clone()).catch(() => {});
    return response;
  });
  // Keeps the refresh going even after the copy has answered.
  event.waitUntil(network.catch(() => {}));

  const timeout = new Promise(resolve => { setTimeout(resolve, patience); });
  try {
    const first = await Promise.race([network, timeout]);
    // A redirect elsewhere on navigation is most likely a Wi-Fi sign-in page;
    // the copy is better if there is one.
    const detour = request.mode === "navigate" && (first?.type === "opaqueredirect" || first?.redirected);
    if (first && !detour) return first;
  } catch {
    // Offline: fall through to the copy.
  }
  const copy = await cache.match(key);
  if (copy) return copy;
  return network;
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET" || !request.url.startsWith(scope)) return;
  // Partial requests (video seeking, say) are left to the browser.
  if (request.headers.has("range")) return;
  event.respondWith(respond(event));
  if (request.mode === "navigate") event.waitUntil(refreshIfDue().catch(() => {}));
});
