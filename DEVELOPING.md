# Developing Slide Organizer

For people and coding agents working on the code. What the tool does, from a user's side, is in the [README](README.md); read that first, since this file refers to its sections.

The site is plain static files in `docs/`, with no build step, backend, or runtime CDN dependency. Keep it that way: no analytics, no third-party requests the user did not ask for, and nothing that sends a user's files anywhere.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open <http://127.0.0.1:8000/>. PDF.js 6.5.438 and fflate 0.8.3 are bundled under `docs/vendor/` with their licenses.

Run the tests with `node --test tests/*.test.mjs`. After adding, removing or renaming anything in `docs/`, run `node scripts/offline-files.mjs`; a test fails until you do.

The service worker (see **Working offline**) is network first, so it does not hold back local edits, but the browser's HTTP cache may: reload with the cache bypassed (Shift-reload), or tick DevTools → Network → **Disable cache**. DevTools → Application → Service workers has **Unregister** if you want the worker gone.

## Project layout

| Path | What it is |
| --- | --- |
| `docs/index.html`, `docs/styles.css` | The organizer page, with its Content Security Policy |
| `docs/app.mjs` | The list: adding, renaming, reordering, removing, downloading |
| `docs/previews.mjs` | First-page thumbnails, slide counts and sizes |
| `docs/deck-viewer.mjs` | Which formats can be presented, and the blob-URL handoff to the presenter tab |
| `docs/present.html`, `docs/present.mjs` | The presenter shell: bar, keys, blanking, slide picker, full screen, and presenter view |
| `docs/audience.html`, `docs/audience.mjs`, `docs/audience-channel.mjs` | The audience screen for presenter view, and the messages the windows pass each other |
| `docs/deck-open.mjs`, `docs/deck-pdf.mjs`, `docs/deck-pptx.mjs` | Opening a file with the right engine, and one rendering engine per format, behind the presenter and the audience screen |
| `docs/session-zip.mjs`, `docs/session-manifest.mjs`, `docs/session-import.mjs`, `docs/file-identity.mjs` | Writing a session ZIP and its `session.md`, and reading one back without listing a talk twice |
| `docs/session-store.mjs` | Keeping the list, files included, in the browser's IndexedDB so it survives a refresh or a closed tab |
| `docs/sw.js`, `docs/offline-files.json` | The service worker that keeps a copy of the site for offline use, and the list of files it keeps |
| `docs/links.mjs` | Reading a pasted link, fetching a PDF or preview from Google Slides, and fetching a file a link points straight at |
| `docs/vendor/` | Bundled third-party code and font: PDF.js, fflate, web-ppt, Instrument Sans, with licenses |
| `docs/favicon.svg`, `docs/favicon-32.png`, `docs/apple-touch-icon.png`, `docs/social-card.png` | The mark, and the image chat apps show when the link is shared |
| `scripts/brand-images.mjs` | Renders the PNG icons and the social card |
| `scripts/offline-files.mjs` | Regenerates `docs/offline-files.json`; run it after adding, removing or renaming a file in `docs/` |
| `media/` | The demo video and screenshots the README embeds |
| `demo-recorder/` | The rig that records the video and takes the screenshots; see its own README |

## Publish with GitHub Pages

The live site is the `/docs` folder of `main`, served by GitHub Pages at <https://slideorg.org/>, a custom domain set in **Settings → Pages**, which keeps it in the `docs/CNAME` file GitHub commits. To publish a copy, push `main` to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, then choose **main** and **/docs** and save. GitHub will display the published URL. All asset paths are relative so the same files work under a project URL such as `https://OWNER.github.io/session-slides-organizer/`.

The footer dates itself. GitHub Pages sets `Last-Modified` on every deploy, the browser hands it
over as `document.lastModified`, and the page prints it as `Updated YYYY-MM-DD`. There is no build
step to stamp a version into and nothing to bump by hand, so a screenshot of the page says which
build it was, to the day. Served from a local folder the date is the file's own, which says the
same thing locally; if a browser cannot tell, the stamp is left out rather than guessed.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Brand

The name is **Slide Organizer** and the address is **slideorg.org**. The address carries the
branding: "org" appears twice in it, and the marks are built to make that memorable.

- **Three slides.** The address spelled out as three numbered 16:9 tiles, `slide`, `org`,
  `.org`, pale to deep green. It is the masthead while the list is empty, and the top of the
  link-preview card.
- **The stack.** The same three slides stacked on a green square, with `org` on the front slide:
  the icon. `favicon.svg` has no lettering, since an SVG favicon cannot load the site's font and
  the word is a smudge at 16px; the home-screen icon and the masthead carry it.
- **The wordmark.** `slide`**`org`**`.org` as text, with the first "org" in the deep green and
  ".org" in the middle green. It sits in the compact masthead, the footer and the presenter bar.
- **Colours.** `#006644` deep, `#5fa47f` middle, `#a9d3b9` pale, `#e3efe7` palest. On the green
  card the front slide (`org`) is white.
- **Words.** The tagline is "Every talk, in order, on the room computer." The benefit line is
  "Free · Open source · Private", with the middle dot, and on the page "Private: your files never
  leave this machine".

The masthead moves between its two states with CSS transitions on `.hero` (empty list) and
`.animate` (set by `app.mjs` once a saved list has been restored, so a refresh does not replay
the move). `prefers-reduced-motion` switches without movement. After changing the name, tagline,
colours or mark, rerun `node scripts/brand-images.mjs` for the PNG icons and the social card.
It needs Playwright, or just `playwright-core` with Google Chrome installed.

## Update the bundled libraries

Review upstream releases and security fixes, then choose exact versions of [PDF.js](https://github.com/mozilla/pdf.js/releases) and [fflate](https://github.com/101arrowz/fflate/releases). The current copies came from the official npm packages. From the repository root, set the versions below and run the commands to stage replacement files in a temporary directory.

```sh
(
  set -eu
  pdfjs_version=6.5.438
  fflate_version=0.8.3
  staging="$(mktemp -d)"
  trap 'rm -rf "$staging"' EXIT
  mkdir -p "$staging/pdfjs" "$staging/fflate"
  npm pack --pack-destination "$staging" "pdfjs-dist@$pdfjs_version"
  npm pack --pack-destination "$staging" "fflate@$fflate_version"

  tar -xzf "$staging/pdfjs-dist-$pdfjs_version.tgz" -C "$staging/pdfjs" \
    --strip-components 1 package/LICENSE package/legacy/build/pdf.min.mjs \
    package/legacy/build/pdf.worker.min.mjs package/cmaps package/iccs \
    package/standard_fonts package/wasm
  tar -xzf "$staging/fflate-$fflate_version.tgz" -C "$staging/fflate" \
    --strip-components 1 package/LICENSE package/esm/browser.js

  rsync -a --delete "$staging/pdfjs/" docs/vendor/pdfjs/
  rsync -a --delete "$staging/fflate/" docs/vendor/fflate/
)
```

Update the version numbers in this file and review the vendor diff. Keep PDF.js and its worker on the same version. Test a PDF thumbnail and page count, plus a PowerPoint deck with an embedded preview and slide count. Commit the updated files and licenses together.

## Presenting in the browser

**Open in browser** opens the file in a new tab, so it can go to the projector while the list
stays on the laptop. PDFs and PowerPoint decks share one presenter: the same keys, the same
thumbnail strip, the same blanking. Parsing and rendering happen on this computer and nothing is
uploaded. PowerPoint rows carry an asterisk pointing at the rendering caveat; PDFs do not need
one, since PDF.js is the engine Firefox ships.

The presenter's own bar carries **Download**, which hands over the same numbered file the row
would, and, for a PDF, **Open original**, which opens it in the browser's own viewer.

### Presenter behaviour

The keys are in the table under **Presenter keyboard shortcuts** in the README. For a PDF the arrows move
a page at a time; for a deck they play the next click-by-click build before moving on, as
PowerPoint does.

Clicking the outer eighth of either side moves a slide as well, except where a link sits there:
a link takes its own click, so one at the very edge of a page is still reachable. Coming back
from a blank screen returns to the slide that was up rather than moving on from it, so a key
pressed to wake the screen does not cost a slide. Resting the pointer at the foot of the
slide also lifts the picker into view, and it withdraws when the pointer leaves; opening it with
**G** or the **All slides** button keeps it up until it is closed.

Both the arrow pairs and the Page keys move, which covers the usual presentation clickers. The
**All slides** and **Full screen** buttons in the top bar do the same as **G** and the browser's own
full screen; in full screen the bar hides until the pointer reaches the top.

Thumbnails render only as they scroll into view, so a long deck does not pay for every slide when
the picker opens. All of this lives in `docs/present.mjs` and calls only the renderer's public
API, so the vendored copy stays untouched and upstream updates drop straight in.

The deck reaches `docs/present.html` as a blob URL in the query string, the same handoff the PDF
rows already use. That page reads the file into memory before rendering, so closing the organizer
tab or removing the row cannot interrupt a talk in progress.

Rendering uses [web-ppt](https://github.com/unStone/web-ppt) (MIT), vendored under
`docs/vendor/webppt/`. Its only runtime dependency is fflate, which the site already bundles.

PDF pages render into an off-screen buffer and are copied onto the visible canvas in one step once
the page is complete. Painting straight to the visible canvas blanks the slide on every page turn:
assigning to a canvas's width clears it outright, and PDF.js then floods the page white of its own
accord before any content lands. Measured in the page on the 23-page test deck, that cost one blank
run per turn of one to four frames — brief, but a white flash in a dark room. The approach is
[Stoatworks Labs' PDF Presenter](https://github.com/stoatworks-labs/pdf-presenter)'s (MIT), which
hit the same flash in its issue #28; its `src/renderer/src/pdf.ts` is worth re-reading if page
turns ever need more work than this. PowerPoint needs none of it — web-ppt already builds each
slide detached and swaps it in, which is also how it does transitions.

### Presenter view and the audience screen

For a room whose projector is a second display. The README's **Presenter view** section has what
it does; this is how.

- **Two renderers, one position.** The presenter tab and the audience screen (`audience.html`, a
  popup window) each render the file themselves, so links work in both and a clicker pointed at
  either moves the talk. What passes between them is the file once, as a `Blob` (which crosses a
  `BroadcastChannel` without being copied), and then only `{index, step, blank}`. `step` is the
  number of click-by-click builds played on the slide; every engine has `step`, `steps` and
  `show(index, step)` for this, described at the top of `deck-open.mjs`. In a PowerPoint deck a
  single step forward plays its animation on the other window; any other jump settles straight
  into place.
- **No echoes.** A move applied from the other window is applied with a flag set, so the engine's
  change callback does not send it back. Each move also carries a `seq`, and a window ignores any
  move not newer than the last it saw, so a late message cannot pull a talk backwards.
- **Who is on screen.** The newest `present` message wins: opening the next talk puts it up. Each
  audience screen announces whose talk it shows, and the presenter tabs, and the organizer,
  keep track (`trackAudiences()`). A presenter tab that loads while an audience screen is open
  starts in presenter view and takes the screen; that is the whole of the session workflow, and
  the organizer's links are unchanged. A tab that opened an audience screen, or whose talk was
  up before the screen reloaded, claims it again when the screen says it is waiting.
- **Noticing a closed window.** Every presenter tab and audience screen holds a Web Lock named
  after its own id for its whole life, and the others ask for that lock to learn when it has
  gone. Messages sent from `pagehide` are sent too, but were not delivered reliably when a tab
  closed during testing, and a crashed window sends nothing; a lock is always released. An
  audience screen announces itself only once it holds its lock, so a listener cannot take the
  lock first and decide the screen has already closed.
- **Full screen on the other display** uses the Window Management API (`getScreenDetails()` and
  `requestFullscreen({ screen })`), in Chromium only, shown only when `screen.isExtended`. It asks
  for permission once. It has not yet been tried on a real two-display machine; the plain
  **Full screen** button is the fallback and always works.
- A popup opened from the presenter must come straight from the click, so presenter tabs and the
  organizer track open audience screens continuously rather than asking at click time.
- The embedded browser used during development opens popups in the same tab and does not repaint
  background tabs, so test with the audience screen and presenter in separate windows.

### Format support in detail

What works:

- PDFs, through the copy of PDF.js the site already bundles for thumbnails, so presenting them
  costs no extra download. Links keep working, internal jumps included.
- `.pptx`, `.pptm`, `.ppsx`, `.ppsm` and the 1997–2003 binary `.ppt` and `.pps`.
- Text, bullets, theme fonts and colors, tables, pictures, native PowerPoint charts, and
  click-by-click entrance animations.
- Thumbnails and slide counts for the binary formats too. They are OLE containers rather than
  ZIPs, so there is no embedded thumbnail to lift out and `docs/previews.mjs` renders their first
  slide instead — which loads the deck renderer, but only for a file that needs it.

What does not:

- **Keynote cannot be rendered.** A `.key` file keeps its slides in Apple's undocumented IWA
  format (Snappy-compressed protobuf whose schema changes between Keynote releases), and no
  JavaScript parser exists. The package carries only a slide-1 `preview.jpg` plus a cache of
  356x200 navigator thumbnails that is often incomplete and has no reliable slide order, so it
  cannot stand in for a render. Keynote rows keep the preview, the download, and the ZIP.
  Some `.key` files are also package *directories* rather than single files; those cannot be
  added to the list at all.
- A PDF in the presenter gives up what the browser's own viewer offers around the page: its
  toolbar, printing, and find across the whole document — the browser's own find reaches only the
  page on screen. **Open original** is one click away for all of it.
- Fidelity is close but not exact. Autofit text can wrap differently from PowerPoint, and
  picture placeholders may pick up a border PowerPoint does not draw. Decks that rely on fonts
  the room computer lacks will substitute, as they would in PowerPoint.

Entrance animations and click-by-click builds do play, so a deck that reveals bullets on click
behaves as the presenter expects. The list on the page says only that decks "may not match
PowerPoint exactly", because the differences are easier to show than to enumerate.

### Trade-offs of the in-browser presenter

The presenter is staying. These are the costs it carries, and what to watch.

- `docs/vendor/webppt/` adds about 1.1 MB to the repository, loaded only when a deck is opened.
- Two CSP exceptions in `docs/index.html`. `style-src-attr 'unsafe-inline'`, because the renderer
  positions every shape with an inline `style` attribute; this is the narrowest form that works,
  so injected `<style>` blocks and external stylesheets stay blocked. And `data:` in `img-src`,
  because the rasterizer behind the binary-format thumbnails draws through a `data:` SVG URL.
  Both are image and style concessions only — `script-src 'self'` is untouched.
- web-ppt is young and has few users. It is the real risk here, not the CSP line: it is 1.1 MB of
  third-party code that parses decks handed over by presenters. Review it before trusting it on a
  conference machine, and re-check on each update. Vendored files carry no manifest, so
  Dependabot will not warn about them.
- Full screen works; it was confirmed by hand on macOS, because the embedded browser used during
  development refuses the Fullscreen API. If some browser refuses it, the button falls back to
  naming that browser's own full-screen shortcut, and the presenter page fills its tab either
  way. It has since been checked on a classroom computer too.
- No other browser PowerPoint renderer is known to be clearly better, but several have appeared
  that would be worth a side-by-side test on the sample decks: PptxViewJS, pptx-browser,
  `@silurus/ooxml` (office-open-xml-viewer, which renders in a Web Worker) and pptx-glimpse. Judge
  them on fidelity with real conference decks, click-by-click builds, size, and whether they need
  more CSP exceptions. Until then, watch web-ppt's releases.

### Update the bundled renderer

web-ppt ships bare specifiers that browsers cannot resolve without an import map, and an inline
import map would need another CSP exception. Vendoring rewrites them to relative paths instead.
From the repository root:

```sh
(
  set -eu
  webppt_version=0.8.0
  staging="$(mktemp -d)"
  trap 'rm -rf "$staging"' EXIT
  npm pack --pack-destination "$staging" "@web-ppt/core@$webppt_version"
  npm pack --pack-destination "$staging" "@web-ppt/viewer-core@$webppt_version"
  mkdir -p "$staging/core" "$staging/viewer"
  tar -xzf "$staging/web-ppt-core-$webppt_version.tgz" -C "$staging/core" --strip-components 1
  tar -xzf "$staging/web-ppt-viewer-core-$webppt_version.tgz" -C "$staging/viewer" --strip-components 1

  rm -rf docs/vendor/webppt
  mkdir -p docs/vendor/webppt/core docs/vendor/webppt/viewer
  cp "$staging"/core/dist/*.js docs/vendor/webppt/core/
  cp "$staging"/viewer/dist/*.js docs/vendor/webppt/viewer/
  cp "$staging/core/LICENSE" docs/vendor/webppt/LICENSE

  sed -i '' \
    -e 's|"@web-ppt/core/chart-ex"|"./chart-ex.js"|g' \
    -e 's|"@web-ppt/core/emf-plus"|"./emf-plus.js"|g' \
    -e 's|"@web-ppt/core/three-d"|"./three-d.js"|g' \
    -e 's|"@web-ppt/core/zip"|"./zip.js"|g' \
    -e 's|"@web-ppt/core"|"./core.js"|g' \
    -e 's|"fflate"|"../../fflate/esm/browser.js"|g' docs/vendor/webppt/core/*.js
  sed -i '' -e 's|"@web-ppt/core"|"../core/core.js"|g' docs/vendor/webppt/viewer/*.js

  grep -r '"@web-ppt/\|"fflate"' docs/vendor/webppt/ && echo "UNRESOLVED SPECIFIERS" || echo "specifiers rewritten"
)
```

Keep `@web-ppt/core` and `@web-ppt/viewer-core` on the same version. Test a `.pptx` with charts
and pictures, a legacy `.ppt`, and confirm the browser console reports no CSP violations.

## Session manifest and import rules

How the "Pick the session up again" behaviour in the README is built, and the edge cases it settles.

Every session ZIP carries a `session.md` beside the decks — the running order, in Markdown, meant
to be read:

```markdown
# SFS Cavalcade session

Import these files to Slide Organizer to restore this running order. Drag
in the whole ZIP, or the files it holds along with this one.

https://slideorg.org/

Reordering the list below, or rewriting a title, changes what the import does.

1. **Opening paper** — `1. Opening paper.pptx`
2. **Discussion of Hamdi et al** — `2. Discussion of Hamdi et al.pdf`
3. **Perceived skin tone** — `3. Perceived skin tone.key`
4. **Live demo** — <https://www.canva.com/design/DAG…/view>
5. **Keynote address** — `5. Keynote address.pdf` from <https://docs.google.com/presentation/d/1AbC…/edit>
```

A talk that lives online has its link in angle brackets where a filename would be, and has no
file in the ZIP; its number is skipped among the filenames, so they still match the running
order. A PDF fetched from Google Slides carries both, and if the PDF has gone missing from the
folder the import falls back to the link rather than dropping the talk. Links are compared by
address (for Google Slides, by deck ID, whatever view the address opens), so pasting one twice
lists it once. Only `http` and `https` addresses become links, whether pasted or read from a
hand-edited `session.md`.

In exported entries, the filename and link follow the bold title. A filename containing backticks
uses a longer backtick delimiter so the filename and title can both be restored.

Dropping that ZIP back in rebuilds the session: the order and the edited titles return, the
heading becomes the ZIP's name again when the list started empty, and the positional `1. ` prefixes
come off the filenames, since position is the list's job and is reapplied on the way out.

Reordering the manifest lines changes the order on import, and editing a title changes the title
on import. Unlisted decks are added after the talks in the manifest. If a listed deck is missing,
the importer uses its source link when available and reports the missing filename otherwise.

Inside a ZIP, `session.md` takes priority over other Markdown files. If it is absent, the importer
looks for a Markdown file with a running order, so a renamed manifest still works.

The ZIP does not have to stay a ZIP. Unpack it and drag the files in — `session.md` among them —
and the running order is applied just the same, whatever order the desktop hands them over in.
The importer reads any Markdown file dropped with the slides as a candidate running order, so
renaming `session.md` to something meaningful does not break it; a Markdown file that holds no
running order is rejected like any other file that is not a deck.

For loose drops without a manifest, multiple decks that all carry a positional prefix are put in
numerical order and the prefixes come off. This puts `2.` before `10.`. Other loose drops keep
their original file names and drop order.

Dropping onto a list that already has talks adds to the end, so two sessions can be combined, and
a drop can mix an archive with loose files. Loose files stay together as one group, at the place
the first of them landed, because a running order applies to all of them at once.

A file already in the session is not added a second time. Names cannot settle this — the export
renames decks as it numbers them, and a title someone edited travels in the manifest — so the
comparison is of the file's contents, hashed with SHA-256. Dropping the same ZIP in twice, or
dropping a session ZIP over the loose decks it was built from, leaves the list as it is and says
which talks were already there. Sizes are compared first, so the hash only runs when two files
could actually be the same. ZIPs can unpack independently, and batches enter the list one at a time
so overlapping drops see the files already added. The check uses the current list, so a talk can
be added again after it is removed.

That leaves the names to settle, since the repeat and the talk already listed may be called
different things. A name someone chose beats one taken from a filename: a paper sitting in the
list under `rd174_don_2026_lehigh.pdf` takes the name the archive has for it. When both sides
have a chosen name, the one in the list wins — it is on screen and being edited, and an import
should not overwrite a title just typed — and the archive's name is reported rather than dropped
silently. The adopted name behaves as a typed one: it names the file on the next export, and
clearing the field still falls back to the filename.

## Saving the list in the browser

`docs/session-store.mjs` keeps the list in IndexedDB, under the site's own origin, so a refresh,
a crash or a closed tab on the room computer does not lose it. Nothing leaves the computer.

- **What is stored.** One small record holds the ZIP name and, for each row in order, an id, its
  link, and its title if someone chose one. Each file is stored once, under its row's id, in a
  separate store. Typing a title or dragging a row rewrites only the record; a file is written
  when its row appears and deleted when its row goes. A file fetched again (Refresh, Get PDF)
  gets a new row, and so a new id.
- **When.** `updateList()`, title edits and the ZIP name schedule a save 400 ms later. Hiding the
  tab saves at once.
- **Restoring.** On load the saved rows go through `insertEntries()`, the same path as a session
  ZIP, so a restored row is built exactly like a new one. Google Slides previews are fetched again,
  as after a ZIP import; direct links are not re-downloaded. Nothing is saved until restoring
  finishes, so an empty page cannot overwrite a saved list.
- **One tab saves.** A Web Lock (`navigator.locks`) goes to the first organizer tab. Any other
  tab neither restores nor saves, and says so, rather than overwriting the first tab's list.
- **Leaving the page.** The browser's "Leave site?" prompt appears only when the list holds
  something not yet saved: a save still pending, a save that failed (storage full), or a tab that
  does not hold the lock.
- **Clear list** empties the list and the store. It asks first in its own `<dialog>` (Cancel,
  Download ZIP, Clear list) rather than `confirm()`, whose OK could be read as "download".
  The dialog waits for ZIP preparation before reporting that the download started; failures
  appear inside the dialog and allow retry. Clear list is disabled while the ZIP is prepared.
- **Tests.** `tests/session-saving.test.mjs` runs the part of `app.mjs` from
  `let saving = "off";` to the end without a page, so code placed there must not touch the DOM
  directly; put UI wiring above that line, as the Clear list dialog is. Likewise
  `tests/session-download.test.mjs` runs `downloadSessionZip()` up to the `// When this copy`
  comment, and the Clear list dialog code from its `// Clear list asks first` comment to
  `// Saving the list in this browser.`, so keep those comments and that order when editing.
- **Shared computers.** The saved list stays until someone clears it, so the next person at a
  podium sees the last session's list. The README tells chairs to clear it when done.

## Working offline

`docs/sw.js` is a service worker, registered by `app.mjs` once the page has loaded. It handles
only GET requests for the site's own files; slide files, Google and other sites, and blob URLs
never pass through it.

- **Network first.** Every request goes out as it would without the worker, through the
  browser's ordinary HTTP cache (GitHub Pages lets a browser reuse a file for 10 minutes), and a
  good answer refreshes the stored copy. The copy answers only when the network fails, takes
  longer than four seconds, or a navigation is redirected (most likely a Wi-Fi sign-in page). So
  online visitors are exactly as up to date as before, with no "reload to update" step.
- **Filling the copy.** On install, and on a navigation when the last check is more than 12 hours
  old, it fetches every file in `docs/offline-files.json` (about 7 MB, six at a time,
  revalidating with the server) and drops anything the list no longer names. If any file fails,
  nothing is dropped and the next try comes 10 minutes later instead of 12 hours. Files used on a
  visit are refreshed anyway; this catches the rest, such as the PowerPoint renderer on a day
  with only PDFs, so an offline visit never mixes an old renderer with a new page.
- **Query strings are ignored** in the stored copy, since the presenter's URL carries a
  different blob address each time. A directory URL maps to its `index.html`.
- **The file list** is generated by `scripts/offline-files.mjs`, and `tests/offline.test.mjs`
  fails when it is out of date. It leaves out the link-preview image, the home-screen icon,
  licenses, GitHub's `CNAME` file, and itself.
- **Switching it off.** Service workers outlive the page that registered them, so a broken one is
  removed by publishing a replacement, not by deleting the file. Replace `docs/sw.js` with the
  two lines in its header comment, which unregister it on every browser's next visit, and remove
  the `register()` call from `app.mjs`. The stored copy is in Cache Storage under
  `session-slides-organizer`.
- Like saved lists, the worker and its copy belong to one address. After a domain move, the new
  address fills its own copy on the first visit.

## Links and Google Slides

The organizer cannot render an online deck, so a link row hands it to the service in a new tab
(`rel="noopener noreferrer"`). Google Slides is the exception worth special handling: its
`/presentation/d/<id>/export/pdf` and `/export/png` endpoints send CORS headers, so for a deck
shared with anyone who has the link the page can fetch the PDF and treat it like a dropped file.
Requests go out with `credentials: "omit"` and no referrer. They never carry the user's Google
session, which keeps a page script from reading anything the user can see but has not shared,
and is also why private decks fail. The fallback is a plain link to the export URL, which the
browser opens signed in and saves as a download.

A link on an ordinary website is fetched when it is added, the same anonymous way. The app
uses the bytes to identify PDFs and the filename and container format to identify PowerPoint
and Keynote files. It checks that a PDF opens in the bundled reader, that a PowerPoint or Keynote
package lists its presentation document (read from the ZIP directory, without unpacking), and
that an older `.ppt` or `.pps` file holds slides. An HTML, image or media
`Content-Type` stops the fetch before it downloads the body. The site needs to send CORS
headers, which GitHub Pages does and many others don't.
Because the hosts can be anything, `connect-src` allows `https:`. Requests still omit credentials
and the referrer, and `script-src` stays `'self'`, so the wider `connect-src` lets the page read
public files, not run them. Google does not document the export
URLs as an API. If they stop working, link rows still open, and the error offers the manual
download. Drive's `/thumbnail` endpoint was tried for previews and rejected: its redirect sends no
CORS headers.

The preview is `/export/png`, about 25 KB, fetched as soon as a Google link is added; its
`Content-Disposition` carries the deck's name, which becomes the row's fallback title the way a
filename does for a dropped file, so a title someone typed or brought in a session is never
replaced. No cheap export gives a slide count: `/export/txt` runs every slide's text together
with nothing marking where one slide ends.

## Demo video and screenshots

The video and screenshots at the top of the README live in `media/` and come from `demo-recorder/`,
which drives a throwaway Chrome over the DevTools Protocol, so recording needs no macOS
screen-recording or accessibility permission. Its own [README](demo-recorder/README.md) has the
storyboard and the pitfalls already solved.

To retake the screenshots from the committed site:

```sh
cd demo-recorder
./sync.sh                 # copy the site from main, plus the sample decks, into serve/
node screenshots.mjs      # writes shots-readme/; copy the keepers into ../media/
```

The original walkthrough (`media/demo.mp4`) shows online decks: it pastes a Google Slides
link, fetches its PDF, and drops the session ZIP back into a fresh tab. Retake it with
`node demo.mjs --video`. The README introduces the site with the branded social video
below. For an inline GitHub player, drag `media/social-demo.mp4` into a GitHub comment
box, wait for the upload, then paste the generated `user-attachments` URL on its own
line in the README. The upload happens before the comment is submitted; posting the
comment is unnecessary. A linked `media/social-cover.png` is a fallback that opens
the video; it does not embed a player. Retaking the local MP4 does not update an
uploaded attachment: upload each new take and replace its URL.
Both the video and the screenshots show real slide content from the sample decks, and
the video also shows a real Google Slides deck, so look at them before committing.

The branded social introduction is `media/social-demo.mp4` (47 seconds), with
`media/social-cover.png` and the standalone six-second `media/brand-animation.mp4`.
To rebuild it, sync the recorder, record with `node demo.mjs --video --social`,
then run `node social.mjs`, both from `demo-recorder/` (`HEADLESS=1` is supported).
See the recorder README for its chapter timings and editable caption/animation
source. This edit introduces the site to a first-time audience and has no audio.

## To do

- [x] Add one-click ZIP export with decks numbered and named in session order.
- [x] Test the PairDrop handoff on the classroom computer. **Receive with PairDrop** creates a temporary room in a separate tab. Set the classroom browser’s display name in PairDrop to **Presentation Computer** so presenters know which device to select. PairDrop saves the name in that browser profile. Have presenters join with the QR code or room code and send one deck at a time. Accept it in PairDrop, then return to the organizer and click **Import received files** or drop the downloaded deck into the list. The picker starts in Downloads where supported.
- [x] Explore opening PowerPoint and Keynote decks in a browser tab. See **Presenting in the browser** above, and the README's format table. PowerPoint works locally; Keynote does not.
- [x] Decide whether to keep the in-browser presenter, given the bundle size, the CSP exceptions, and the age of the deck renderer. Kept; see **Trade-offs of the in-browser presenter** above.
- [x] Explore a PDF presentation view with one page at a time and a fullscreen control. PDFs now use the same presenter as decks, with their links intact.
- [x] Consider putting an `index.html` inside the session ZIP, so a session can be picked up again
  on a fresh machine or in a new tab. Done as a `session.md` manifest rather than a page: carrying
  the whole site would have added about 7 MB to every ZIP, and a page opened from `file://` cannot
  load ES modules in Chrome, so it would not have run from the extracted folder anyway. See
  **Session manifest and import rules** above.
- [x] Offer a presenter view for rooms with a separate projector, with an audience screen that
  stays open from one talk to the next. See **Presenter view and the audience screen** above.
- [ ] Try **Full screen on the other display** on a podium computer with a real second display,
  and the whole presenter view with a clicker there.
- [ ] Consider a **Next talk** button in the presenter, in the top bar where the full-screen chrome
  hides it, moving to the next presentation in the session in the same tab and skipping anything
  the browser cannot render. The presenter is deliberately self-contained today: it reads the file
  into memory up front so that closing the organizer tab cannot interrupt a talk. Reaching the
  next file means asking the organizer tab for it at the moment of the click — through
  `window.opener` or a `BroadcastChannel`, rather than a URL baked in when the presenter opened,
  which would go stale as soon as the running order changed. So the button needs a sensible
  disabled state for when that tab has gone.
- [x] Link rows for decks that live at a URL: Google Slides, PowerPoint for the web, Canva and
  the rest. See **Online presentations** in the README. Google Slides presentations can also be fetched as a PDF.
- [ ] Try **Get PDF** on the classroom network, and on a deck shared only within a school's
  Google domain rather than with anyone who has the link, to see how the refusal reads.
- [x] Keep the list across a refresh or a closed tab. See **Saving the list in the browser** above.
- [x] Open offline once visited. See **Working offline** above.
- [x] Move to a domain of its own, slideorg.org, with the name Slide Organizer. See **Brand**
  above. The old lukestein.com address should keep redirecting, since saved `session.md` files
  point at it. Saved lists and offline copies do not move with the site: browser storage belongs
  to one address, so a list kept at the old address stays there.
- [ ] Let a speaker send a deck straight to the organizer from their own laptop or phone, as an
  alternative to a USB stick or signing the room computer in to their email. The organizer shows
  a short code and a QR code; the speaker opens `…/send#CODE`, picks a file, and it streams to
  the organizer tab over a WebRTC data channel, encrypted end to end, and lands in the list
  directly. The two browsers find each other through a small signaling service, which only passes
  connection details and never sees a file: a Cloudflare Worker on the free tier is the likely
  choice (or Trystero or PeerJS, which need nothing of ours). On restrictive networks a direct
  connection can fail and would need a TURN relay, which carries the still-encrypted bytes; start
  without one and see how often it matters, with PairDrop and links as the fallback. The CSP's
  `connect-src` would need the signaling host. Both ends must be online at once, which suits the
  day-of use this tool is for.
