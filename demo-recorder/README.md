# demo-recorder

Records the short, silent demo of the organizer for social media, **without
needing macOS screen-recording or accessibility permission**. It launches a real
Google Chrome with a throwaway profile, drives it over the DevTools Protocol, and
pulls frames out of the browser itself (`Page.captureScreenshot`). Nothing outside
the page can reach the frame: no Finder, no file picker, no directory structure,
no tab strip, bookmarks or URL bar. Output is 1920x1080, H.264, no audio.

## Nothing here is committed by accident

`.gitignore` is an **allow-list**: everything is ignored except the README, the
scripts and `sync.sh`. That is deliberate. `serve/demo-assets/` holds copies of
real, unpublished decks, `frames/` holds ~1500 pictures of their slides, and
`downloads/` holds a ZIP of all four. A block-list would need a new rule every
time the rig grows a new output directory; an allow-list cannot be caught out.

Check what a commit would actually include with:

```sh
git add -An demo-recorder/
```

Note that the finished video shows real slide content full screen. That is the
point of the demo, but it is worth a look before posting.

## Scratch output — safe to delete

`frames/` holds the ~1000 JPEGs ffmpeg turns into `demo.mp4`. It is pure
intermediate output: rewritten from scratch on every run and never read again
once the video exists, so delete it whenever you like. Same for `downloads/`,
`shots/`, `serve/`, `chrome-profile-*/` and the `.log` files — `sync.sh` and the
next run rebuild everything they need.

Do note what is in there: `frames/` is a few hundred megabytes of rendered images
of the actual slides, and `downloads/` holds a ZIP of all four decks. Your own
content, nothing from outside — but not a folder to pass around casually. None of
it can be committed; see the allow-list above.

## Run it

```sh
./sync.sh                 # freeze the committed site + the sample decks into serve/
node demo.mjs             # dry run, no video, prints what each beat did
node demo.mjs --video     # writes demo.mp4
node demo.mjs --beats=drop1,drop3,reorder   # just these beats
node --test recorder.test.mjs             # capture pairing, cuts and safe tab switching
```

`node screenshots.mjs` takes the still screenshots the top-level README embeds (the list, the
presenters, the slide picker, the shortcut guide) from the same `serve/` copy, into `shots-readme/`.
Copy the ones worth keeping into `../media/`. The list shot includes the same
Google Slides PDF and five edited titles as the social demo, so this capture
needs network access for the shared Google deck.

`sync.sh` builds `serve/` from a git ref rather than the working tree, so a take
always matches something that shipped — `REF=main` by default, and `SLIDES=...`
overrides where the decks come from (`../../sample slides`).

## Branded social introduction

The standalone introduction for a first-time audience is `../media/social-demo.mp4`:
59.9 seconds, 1920×1080, H.264 at 30 fps, intentionally silent with readable feature
captions. The companion `social-cover.png` is the upload thumbnail, and
`brand-animation.mp4` is a six-second loop of the three slides becoming the stack
and opening out again. All use the site's Instrument Sans and green palette.

Rebuild from the repository root:

```sh
./demo-recorder/sync.sh
HEADLESS=1 node demo-recorder/demo.mjs --video --social
HEADLESS=1 node demo-recorder/social.mjs
```

`--social` shows the Google Slides link and PDF conversion together before
ordering the talks, and omits the shortcut dialog while retaining visible clicks
through PDF links. The four sample decks and actual app interactions are the same as the original take. `take.json`
records beat timecodes after navigation waits have been cut, so the edit follows
the new recording rather than hard-coded source timestamps. The social take opens
**Presenter view** straight from the PowerPoint cover slide. Both tabs are captured in the same recorder iteration, with shared timestamps and loading
cuts; `audience.mp4` is the synchronized companion to `demo.mp4`. The edit
animates from one full-width recording into two complete, labeled frames,
shows quick synchronized keyboard advances, a 1.2-second black-screen hold with B,
and the timer’s reset and hide controls. Closing the PowerPoint returns the left
frame to the queue while the same audience window shows its branded waiting
screen. Opening a PDF feeds it into that existing window; the recorder checks
the window id, and the edit stays split throughout the handoff. It then expands
back to one frame before ZIP download and restore. No tab content
is cropped. `presenter_open` and `presenter_close` in `take.json` anchor the
transitions to the actual clicks. The old recorder
without `--social` still produces the original walkthrough.

The edit starts with a complete, readable cover on frame zero: “Every talk.
One place.”, a description, and the domain. The three slides become the stack
within the three-second opening. Six captioned chapters follow (4 / 4 / 5 /
11 / 22 / 8 seconds): gathering files, Google Slides, ordering, presenting,
presenter view with an audience screen, and saving.
The 2.9-second closing card contains only the icon, address, and
“Free · Open source · Private.” Captions sit above the complete browser frame.
`social.mjs` draws the animation on a canvas with deterministic frame times,
using the site's tile-to-stack geometry. It needs no npm packages. Adjust its
chapter copy and durations there; rebuild to apply them. Intermediate frames,
chapter cards, clips and the JSON edit report live in ignored `social-build/`.
Google image loading is cut until the preview has actually decoded; PDF loading
and settling are cut too, leaving only a brief pause after each result. All five
titles are edited, with faster typing after the first. In the PDF presenter,
a brief cover-slide pause and three keyboard advances precede the picker jump to
slide 5, followed by the regression-table link and a brisker click back. Rings mark button and link clicks,
not ordinary slide advances.
The top-level README embeds the video through an uploaded GitHub attachment.
After each new render, upload `media/social-demo.mp4` by
dragging it into a GitHub comment box, then copy the generated `user-attachments`
URL to its own line in the README. Use a public repository and check the URL
while signed out before publishing; an attachment that requires your sign-in
will not play for other visitors. Each new take needs a new upload and URL. The clickable `media/social-cover.png` preview linking
to `media/social-demo.mp4?raw=true` is a fallback, not an inline player.
The original `media/demo.mp4` remains a separate output.

## The storyboard

One beat per block in `demo.mjs`, runnable alone with `--beats=`:

| beat | what it shows |
| --- | --- |
| `drop1` | one deck drifts in from off-frame, the drop zone lights up, a row appears with thumbnail, page count and size |
| `drop3` | three more arrive as a stack with a count badge — PDF, PowerPoint and Keynote together |
| `link` | a Google Slides address pasted into the field under the drop zone, then **Add link**. The preview and the deck's own name arrive from Google; the wait for them is cut |
| `reorder` | the PowerPoint is dragged from third to second, so the list reads paper, discussion, paper, discussion |
| `rename` | one click into the first title, then **Tab** along the row — the app moves focus and selects the next title itself — retitling all five talks to Paper A / Discussion A / Paper B / Discussion B / Closing talk, original filenames still visible underneath |
| `pdf` | **Open in browser** on a PDF. The **?** shortcut card over the cover slide, then **G** and a click straight to slide 5, its link out to the regression table on 15 and the link back. The pointer is parked against the right edge and hidden while slides are up — visible only for the clicks |
| `pptx` | open PowerPoint and **Presenter view**, advance with the keyboard, blank/resume with **B**, reset and hide the timer, then close the talk and open a PDF from the queue into the same audience window, all while split |
| `getpdf` | **Get PDF** on the Google row, which becomes an ordinary PDF row with its † and a link back to Google Slides; the download is cut |
| `zip` | the session ZIP renamed to "Corporate finance 11am" and downloaded |
| `import` | a fresh, empty organizer in a new tab, and that ZIP drifting back in from off-frame: order, titles and session name return |

The Google deck is Luke's own, shared with anyone who has the link, and its address, title and
first slide are all on screen. The `link` and `getpdf` beats need the network.

### Cutting out the waits

`rec.cut(work)` runs `work` and drops whatever was captured meanwhile, so waiting on Google or on a
new tab reads as a straight cut, and the frames after it move up in time. The original
walkthrough runs about 48 seconds; the social edit has its own fixed 59.9-second
chapter timeline.

## How it works

- `driver.mjs` — launches Chrome, attaches over CDP, exposes trusted input
  (`Input.dispatch*`, so `requestFullscreen` and downloads work), and the
  `Recorder` that writes JPEG frames with their real timestamps for ffmpeg.
- `harness.js` — injected into each page via `Runtime.evaluate`. Draws the macOS
  pointer and the drag ghosts, fetches the decks as `File` objects, and
  synthesises the `dragenter`/`dragover`/`drop`. This is the only simulated part,
  and it is what lets files arrive from off-frame with no file picker. Everything
  the app does in response is real.
- `demo.mjs` — the beat list above.

## Things already learned the hard way

- **Capture the viewport, not a scaled clip.** A scaled clip during a popup resize
  can tile the old compositor surface into the new picture. Finish popup setup,
  calibration and paint before switching the recorder to it; cut those setup
  frames. Capture with `fromSurface: true, captureBeyondViewport: false`. Every
  captured viewport must stay 16:9, or the take fails. The encoder scales the
  complete frames to 1920×1080; Chrome can capture a popup at CSS-pixel density
  even when the organizer is captured at its emulated device-pixel density.

- **The emulated viewport must equal the real window's content box.** If it does
  not, Chrome scales the page to fit, the window visibly flickers, and injected
  input is rescaled by the same factor, so clicks and drags land off target. An
  override that is merely *smaller* than the window is no good either: the
  presenter popup does not inherit it, lays out at the window's full height, and
  the capture clip then cuts the foot off every slide and most of the picker.
- **Force the window to 16:9 rather than emulating a 16:9 box inside it.** Chrome
  ignores `--window-size`, and a **maximized** window ignores bounds changes
  entirely — `windowState` cannot be combined with left/top/width/height, so clear
  it in a call of its own first, then set the bounds. `fitToWindow()` does this,
  measures the tab strip and toolbar, and lands a 1512x851 content box.
- **Give every run its own Chrome profile.** Reusing one path lets a browser left
  over from an earlier run hold it, and the delete fails with `ENOTEMPTY` before
  the run starts — which looks exactly like a successful take, except the video on
  disk is the previous one.
- **Never reload or navigate the recorded tab mid-take.** The recorder's screenshot call into a
  page mid-navigation never returns, which stalls the capture loop for the rest of the run with
  no error — the video just ends early. The `import` beat opens a new tab instead.
- **Hide scrollbars in the emulated view** (`Emulation.setScrollbarsHidden`). With five rows the
  list runs taller than the frame, and the scrollbar reads as a stray line down the right edge.
- **Let the renderer finish before advancing.** Pressing the next-page key faster
  than PDF.js paints puts blank white pages in the video.
- **The slide picker scrolls itself** to centre the current slide, so a fixed
  `nth-child` is usually outside the viewport: the click lands on nothing and the
  jump silently does not happen, with the page counter the only clue. `jumpVia()`
  reads the strip and chooses from the thumbnails actually on screen.
- **Make the window width a multiple of 16.** 1504 gives a content box of exactly
  1504x846, which scales to exactly 1920x1080, so ffmpeg does no resampling at
  all. 1512 yields 1081 rows and a pointless rescale of every frame.
- **Only follow internal PDF links.** An external one opens a tab mid-take.
  `probe-links.mjs` prints the link map for the Barnes deck — page 5 goes out to
  the regression table on 15, and 15 comes back to 5.
- **Resume a newly attached target before any other command.** A target paused at
  `waitForDebuggerOnStart` will not answer `Page.enable` either, so setting up
  first just hangs on the first call with no error until the CDP timeout.
- **The recorder must not set its own `setDeviceMetricsOverride`.** A second
  session setting one makes Chrome rescale injected input mid-gesture: a mousedown
  landed at 1.56x the aimed point while the mouseup landed correctly, so the click
  resolved against a common ancestor and the link never opened.
- **The recorder needs its own CDP socket**, or ~200 KB screenshot payloads queue
  ahead of every input command.
- **Always `await page.settle()` before aiming at anything.** Previews, slide
  counts and sizes arrive asynchronously and move rows as they land.
- `requestFullscreen` keeps the emulated viewport, so the capture size holds
  steady across the full-screen transition.
- `Page.addScriptToEvaluateOnNewDocument` is too late for an already-committed
  document — create the target at `about:blank`, then navigate.
- The site's CSP blocks injected `<style>` blocks, so the harness styles
  everything through `style` attributes.

## Why the demo never enters full screen

The **Full screen** button stays visible in the presenter bar but is never clicked.
With no browser chrome in frame the presenter already fills the picture, so
entering full screen changes nothing a viewer can see — while `requestFullscreen`
throws away a device-metrics override that is smaller than the window and resizes
the viewport mid-take. That re-frames the capture and clips the slide picker off
the bottom, and on the second presenter it made the request fail outright.

Not entering full screen is what lets `fitToWindow()` emulate a 16:9 box *inside*
the window, which is what makes the capture exactly 1920x1080 with nothing cropped
away. If a take ever needs a real full-screen transition, record with browser
chrome visible instead and accept the viewport change.

## Still open

- Capture runs about 23 fps and plays back at 30, so fast pointer moves are a
  little steppy. Keep the motion slow, or trim in post.
- No visible confirmation for the ZIP download: with no browser chrome in frame
  there is no download shelf, so that beat ends on the finished list.
- The shortcut card is only up for about 1.2s. Deliberate, but easy to lengthen.

`tdiag.mjs`, `treorder.mjs`, `tclick.mjs`, `fitcheck.mjs` and `peek.mjs` are the
isolation tests used to find the above; `peek.mjs` inspects a run still in flight.
