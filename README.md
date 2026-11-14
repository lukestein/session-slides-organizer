# Session Slides Organizer

A browser-based organizer for conference sessions. Drop in PDFs, PowerPoint decks, and Keynote files, edit their display titles, and arrange the talks in speaking order. The app processes the files on the room computer and keeps the list for the life of the tab.

- **PDFs** can open in a new browser tab, fit to one page where the viewer supports it, or download for use in a native viewer.
- **Downloads** use the current position, title, and original extension, as in `2. Opening paper.pptx`. If the title is blank or unchanged, the download uses the original filename after the position.
- **Download session ZIP** bundles the decks locally in speaking order. Positions are padded with zeros when needed so sorting by filename preserves the order.
- **Previews and file details** include the first page of a PDF or an embedded deck preview when available. All files show their size. PDFs and modern PowerPoint decks show their page or slide count when readable.
- **Reordering** works by dragging a row. On a touch screen use the handle. With a keyboard, focus the handle and press the up or down arrow key.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open <http://127.0.0.1:8000/>. The site has no build step, backend, or runtime CDN dependency. PDF.js 6.5.438 and fflate 0.8.3 are bundled under `docs/vendor/` with their licenses.

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

Update the version numbers in this README and review the vendor diff. Keep PDF.js and its worker on the same version. Test a PDF thumbnail and page count, plus a PowerPoint deck with an embedded preview and slide count. Commit the updated files and licenses together.

## To do

- [x] Add one-click ZIP export with decks numbered and named in session order.
- [ ] Test the PairDrop handoff on the classroom computer. **Receive with PairDrop** creates a temporary room in a separate tab. Set the classroom browser’s display name in PairDrop to **Presentation Computer** so presenters know which device to select. PairDrop saves the name in that browser profile. Have presenters join with the QR code or room code and send one deck at a time. Accept it in PairDrop, then return to the organizer and click **Import received files** or drop the downloaded deck into the list. The picker starts in Downloads where supported.
- [x] Explore opening PowerPoint and Keynote decks in a browser tab. See **Presenting decks in the browser** below. PowerPoint works locally; Keynote does not.
- [ ] Decide whether to keep the in-browser deck presenter, given the bundle size, the relaxed style CSP, and the age of the renderer.
- [ ] Explore a PDF presentation view with one page at a time and a fullscreen control.

## Presenting decks in the browser

**Open in browser** now appears on PowerPoint rows as well as PDFs. It opens the deck in a
presenter overlay in the same tab: arrow keys, space, Page Up/Down, Home/End to move, Esc to
close, and a full-screen button. Parsing and rendering happen on this computer and the deck is
never uploaded.

Rendering uses [web-ppt](https://github.com/unStone/web-ppt) (MIT), vendored under
`docs/vendor/webppt/`. Its only runtime dependency is fflate, which the site already bundles.

### What works

- `.pptx`, `.pptm`, `.ppsx`, `.ppsm` and the 1997–2003 binary `.ppt`.
- Text, bullets, theme fonts and colors, tables, pictures, native PowerPoint charts, and
  click-by-click entrance animations.

### What does not

- **Keynote cannot be rendered.** A `.key` file keeps its slides in Apple's undocumented IWA
  format (Snappy-compressed protobuf whose schema changes between Keynote releases), and no
  JavaScript parser exists. The package carries only a slide-1 `preview.jpg` plus a cache of
  356x200 navigator thumbnails that is often incomplete and has no reliable slide order, so it
  cannot stand in for a render. Keynote rows keep the preview, the download, and the ZIP.
  Some `.key` files are also package *directories* rather than single files; those cannot be
  added to the list at all.
- Fidelity is close but not exact. Autofit text can wrap differently from PowerPoint, and
  picture placeholders may pick up a border PowerPoint does not draw. Decks that rely on fonts
  the room computer lacks will substitute, as they would in PowerPoint.

Entrance animations and click-by-click builds do play, so a deck that reveals bullets on click
behaves as the presenter expects. The list on the page says only that decks "may not match
PowerPoint exactly", because the differences are easier to show than to enumerate.

### Trade-offs to weigh before keeping this

- `docs/vendor/webppt/` adds about 1.1 MB to the repository, loaded only when a deck is opened.
- `style-src-attr 'unsafe-inline'` had to be added to the CSP in `docs/index.html`: the renderer
  positions every shape with an inline `style` attribute. This is the narrowest exception that
  works — it permits inline style *attributes* only, so injected `<style>` blocks and external
  stylesheets stay blocked, and `script-src 'self'` is untouched.
- web-ppt is young and has few users. It is the real risk here, not the CSP line: it is 1.1 MB of
  third-party code that parses decks handed over by presenters. Review it before trusting it on a
  conference machine, and re-check on each update. Vendored files carry no manifest, so
  Dependabot will not warn about them.
- Full screen through the browser's Fullscreen API is **untested on a real browser** — it was
  refused by the embedded browser used during development. The button falls back to naming the
  browser's own full-screen shortcut, and the overlay already covers the window. Confirm this on
  the classroom computer.

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

## Publish with GitHub Pages

Push `main` to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, then choose **main** and **/docs** and save. GitHub will display the published URL. All asset paths are relative so the same files work under a project URL such as `https://OWNER.github.io/session-slides-organizer/`.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
