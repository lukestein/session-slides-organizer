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
- [ ] Explore opening PowerPoint and Keynote decks in a browser tab. Check local rendering, fidelity, and whether available tools require uploading the deck.
- [ ] Explore a PDF presentation view with one page at a time and a fullscreen control.

## Publish with GitHub Pages

Push `main` to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, then choose **main** and **/docs** and save. GitHub will display the published URL. All asset paths are relative so the same files work under a project URL such as `https://OWNER.github.io/session-slides-organizer/`.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
