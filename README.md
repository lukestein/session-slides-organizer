# Session Slides

A browser-based organizer for conference sessions. Drop in PDFs, PowerPoint decks, and Keynote files, edit their display titles, and arrange the talks in speaking order. The app processes the files on the room computer and keeps the list for the life of the tab.

- **PDFs** can open in a new browser tab or download for use in a native viewer.
- **PowerPoint and Keynote** download under their original filenames. Open the copy from your browser’s downloads using the app installed on the room computer.
- **Previews** show the first page of a PDF or an embedded preview from a supported presentation when available.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory docs
```

Open <http://127.0.0.1:8000/>. The site has no build step, backend, or runtime CDN dependency. PDF.js 6.5.438 and fflate 0.8.3 are bundled under `docs/vendor/` with their licenses.

## Publish with GitHub Pages

Push `main` to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, then choose **main** and **/docs** and save. GitHub will display the published URL. All asset paths are relative so the same files work under a project URL such as `https://OWNER.github.io/session-slides-organizer/`.

[GitHub Pages publishing instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
