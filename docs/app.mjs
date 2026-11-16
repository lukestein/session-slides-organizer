import { makePreview } from "./previews.mjs";
import { buildSessionZip, sessionZipSize } from "./session-zip.mjs";
import { readLooseSession, readSessionZip } from "./session-import.mjs";
import { isManifestName, parseManifest } from "./session-manifest.mjs";
import { canPresent, needsCaveat, presentUrl } from "./deck-viewer.mjs";
import { findDuplicate } from "./file-identity.mjs";
import { fetchGooglePdf, fetchGooglePreview, googlePdfUrl, parseLink } from "./links.mjs";

const formats = {
  pdf: "PDF",
  ppt: "PowerPoint",
  pptx: "PowerPoint",
  pptm: "PowerPoint",
  pps: "PowerPoint",
  ppsx: "PowerPoint",
  ppsm: "PowerPoint",
  key: "Keynote",
};
const slides = [];
const list = document.querySelector("#slides");
const template = document.querySelector("#slide-row");
const picker = document.querySelector("#files");
const browse = document.querySelector("#browse");
const importDownloads = document.querySelector("#import-downloads");
const zone = document.querySelector("#drop-zone");
const error = document.querySelector("#error");
const notice = document.querySelector("#notice");
const status = document.querySelector("#status");
const exportButton = document.querySelector("#export");
const archive = document.querySelector("#session-archive");
const zipDetails = document.querySelector("#zip-details");
const zipName = document.querySelector("#zip-name");
const deckCaveat = document.querySelector("#deck-caveat");
const linkCaveat = document.querySelector("#link-caveat");
const googleCaveat = document.querySelector("#google-caveat");
const linkField = document.querySelector("#link");
const addLinkButton = document.querySelector("#add-link");
const megabytes = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const rowAnimations = new WeakMap();
let drag;
let fileDragDepth = 0;
let previewQueue = Promise.resolve();
let tabbing = false;

document.addEventListener("keydown", event => {
  tabbing = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
}, { capture: true });
document.addEventListener("keyup", () => { tabbing = false; });
document.addEventListener("pointerdown", () => { tabbing = false; }, { capture: true });
window.addEventListener("blur", () => { tabbing = false; });

function announce(message) {
  status.textContent = message;
}

function safeFilenameStem(stem) {
  return stem.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/[. ]+$/, "");
}

function archiveStem() {
  return safeFilenameStem(zipName.value.trim().replace(/\.zip$/i, "").trim()) || zipName.defaultValue;
}

function downloadName(slide, index, width = 1) {
  const extension = slide.file.name.slice(-(slide.extension.length + 1));
  const title = slide.friendlyName;
  let stem = slide.file.name.slice(0, -extension.length);
  if (title && title !== slide.defaultTitle) {
    stem = title.toLowerCase().endsWith(extension.toLowerCase())
      ? title.slice(0, -extension.length)
      : title;
  }
  const position = String(index + 1).padStart(width, "0");
  return `${position}. ${safeFilenameStem(stem) || "Slide"}${extension}`;
}

function updateDownload(slide, index) {
  if (!slide.file) return;
  const name = downloadName(slide, index);
  slide.download.download = name;
  // The presenter offers the same download, so it needs the same name, which
  // moves with the position and the title.
  if (slide.presentable) slide.open.href = presentUrl(slide.url, slide.friendlyName, name, slide.file.name);
}

// Every talk in order, for the manifest. A talk that lives online has no file
// and so no name in the ZIP, but keeps its position, so the numbers on the
// files still match the running order.
function sessionFiles() {
  const width = String(slides.length).length;
  return slides.map((slide, index) => ({
    file: slide.file,
    name: slide.file ? downloadName(slide, index, width) : "",
    title: slide.friendlyName,
    link: slide.link?.url ?? "",
  }));
}

function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function formatSize(bytes) {
  return bytes < 100_000 ? "<0.1 MB" : `${megabytes.format(bytes / 1_000_000)} MB`;
}

function updateArchive() {
  const count = slides.length;
  archive.hidden = count === 0;
  if (count) {
    const size = formatSize(sessionZipSize(archiveStem(), sessionFiles()));
    const files = slides.filter(slide => slide.file).length;
    const parts = [files && plural(files, "file"), count - files && plural(count - files, "link")];
    zipDetails.textContent = `${parts.filter(Boolean).join(", ")} (${size})`;
  }
}

function updateList() {
  list.hidden = slides.length === 0;
  deckCaveat.hidden = !slides.some(slide => needsCaveat(slide.extension));
  linkCaveat.hidden = !slides.some(slide => !slide.file);
  googleCaveat.hidden = !slides.some(slide => slide.file && slide.link);
  updateArchive();
  slides.forEach((slide, index) => {
    slide.position.textContent = String(index + 1);
    updateDownload(slide, index);
  });
}

function moveSlide(slide, destination) {
  const from = slides.indexOf(slide);
  if (from === destination || destination < 0 || destination >= slides.length) return;
  slides.splice(from, 1);
  slides.splice(destination, 0, slide);
  list.insertBefore(slide.row, slides[destination + 1]?.row ?? null);
  updateList();
}

function animateRow(row, distance) {
  if (reducedMotion.matches || Math.abs(distance) < 1) return;
  rowAnimations.set(row, row.animate(
    [{ transform: `translateY(${distance}px)` }, { transform: "none" }],
    { duration: 180, easing: "cubic-bezier(.2,.7,.3,1)" },
  ));
}

function layoutTop(row) {
  return list.getBoundingClientRect().top + list.clientTop + row.offsetTop;
}

function announceMove(slide) {
  announce(`${slide.friendlyName} moved to position ${slides.indexOf(slide) + 1}.`);
}

function setMetadata(slide, count, unit) {
  if (!slide.file) {
    slide.metadata.textContent = `(${slide.link.service})`;
    return;
  }
  const size = formatSize(slide.file.size);
  const quantity = count ? `${count} ${unit}${count === 1 ? "" : "s"}, ` : "";
  slide.metadata.textContent = `(${quantity}${size})`;
}

// Gives a row a name it did not have, exactly as typing one would: the
// filename stem stays the fallback, so clearing the field still returns to it,
// and the next export names the file after the new title.
function renameSlide(slide, name) {
  slide.friendlyName = name.slice(0, slide.title.maxLength);
  slide.named = true;
  slide.title.value = slide.friendlyName;
  slide.title.defaultValue = slide.friendlyName;
}

function removeSlide(slide) {
  const index = slides.indexOf(slide);
  slides.splice(index, 1);
  slide.row.remove();
  releaseUrls(slide);
  updateList();
  (slides[index]?.title ?? slides[index - 1]?.title ?? browse).focus();
  announce(`${slide.friendlyName} removed.`);
}

function releaseUrls(slide) {
  if (slide.url) URL.revokeObjectURL(slide.url);
  if (slide.previewUrl) URL.revokeObjectURL(slide.previewUrl);
}

function showPreview(slide, blob) {
  if (slide.previewUrl) URL.revokeObjectURL(slide.previewUrl);
  slide.previewUrl = URL.createObjectURL(blob);
  const image = slide.row.querySelector("img");
  image.addEventListener("load", () => { image.hidden = false; }, { once: true });
  image.src = slide.previewUrl;
}

function queuePreview(slide, extension) {
  previewQueue = previewQueue.then(async () => {
    if (!slide.row.isConnected) return;
    const preview = await makePreview(slide.file, slide.url, extension, (count, unit) => {
      if (slide.row.isConnected) setMetadata(slide, count, unit);
    });
    if (!preview || !slide.row.isConnected) return;
    showPreview(slide, preview);
  }).catch(() => {
    // Keep the file-type label when a preview is missing or unreadable.
  });
}

// A link row opens on its own site and has nothing to download. For Google
// Slides, the empty thumbnail offers a preview and Get PDF takes the place of
// Download; both ask Google, so neither happens until someone clicks.
function makeLinkControls(slide, { thumbnail, openPdf, download, getPdf }) {
  const { link } = slide;
  openPdf.textContent = "Open link";
  openPdf.href = link.url;
  openPdf.rel = "noopener noreferrer";
  openPdf.title = `Opens in ${link.service}`;
  openPdf.setAttribute("aria-label", `Open link: ${link.display}`);
  download.hidden = true;
  thumbnail.classList.add("link-thumbnail");
  thumbnail.insertAdjacentHTML("afterbegin", globe);
  if (!link.googleId) return;

  // The preview and the deck's name come in one small request, made as soon
  // as the link is added. If it fails — a private deck, or no network yet —
  // the web icon stays, and becomes a button to try again.
  const retry = document.createElement("button");
  retry.type = "button";
  retry.className = "preview-button";
  retry.title = "Couldn’t load a preview from Google. Click to try again.";
  retry.setAttribute("aria-label", `Try again to load a preview of ${link.display} from Google`);
  retry.append(Object.assign(document.createElement("span"), { textContent: "Retry" }));
  retry.hidden = true;
  thumbnail.prepend(retry);
  retry.addEventListener("click", async () => {
    if (!await loadGooglePreview(slide, retry)) showProblem(googleRefusal(slide, "a preview"));
  });
  loadGooglePreview(slide, retry);

  getPdf.hidden = false;
  getPdf.setAttribute("aria-label", `Get a PDF of ${link.display} from Google`);
  getPdf.addEventListener("click", () => importGooglePdf(slide, getPdf));
}

async function loadGooglePreview(slide, retry) {
  retry.disabled = true;
  try {
    const { image, name } = await fetchGooglePreview(slide.link.googleId);
    if (!slide.row.isConnected) return true;
    showPreview(slide, image);
    if (name) adoptDeckName(slide, name);
    retry.remove();
    slide.row.querySelector(".link-thumbnail svg")?.remove();
    return true;
  } catch {
    if (!slide.row.isConnected) return true;
    // Reachable now, so the icon says it can be clicked.
    retry.disabled = false;
    retry.hidden = false;
    retry.parentElement.removeAttribute("aria-hidden");
    retry.prepend(slide.row.querySelector(".link-thumbnail svg"));
    return false;
  }
}

// The deck's own name replaces the service's as the fallback title, the same
// part a filename plays for a dropped file: a title someone typed or brought in
// a session stays, and clearing the field returns to this.
function adoptDeckName(slide, name) {
  slide.defaultTitle = name.slice(0, slide.title.maxLength);
  slide.title.placeholder = slide.defaultTitle;
  if (slide.named) return;
  slide.friendlyName = slide.defaultTitle;
  slide.title.defaultValue = slide.defaultTitle;
  if (document.activeElement !== slide.title) slide.title.value = slide.defaultTitle;
  updateList();
}

// Google will not hand a private deck to a page, and says so only by failing.
// The way round is the user's own browser, signed in, which downloads the PDF
// to be dropped in like any other.
function googleRefusal(slide, what) {
  const message = document.createDocumentFragment();
  const fallback = Object.assign(document.createElement("a"), {
    href: googlePdfUrl(slide.link.googleId),
    target: "_blank",
    rel: "noopener noreferrer",
    textContent: "Download the PDF from Google",
  });
  message.append(
    `Google didn’t send ${what} of ${slide.named ? `“${slide.friendlyName}”` : "this deck"}. `
      + "It only does for a deck shared with "
      + "anyone who has the link, and it needs the internet. ",
    fallback,
    " instead, signed in to Google, then drop the file here.",
  );
  return message;
}

function showProblem(content) {
  error.replaceChildren(content);
  error.hidden = false;
}

async function importGooglePdf(slide, button) {
  button.disabled = true;
  button.textContent = "Getting…";
  announce(`Getting a PDF of ${slide.friendlyName} from Google.`);
  let file;
  try {
    file = await fetchGooglePdf(slide.link.googleId);
  } catch {
    button.disabled = false;
    button.textContent = "Get PDF";
    if (slide.row.isConnected) showProblem(googleRefusal(slide, "a PDF"));
    return;
  }
  const index = slides.indexOf(slide);
  if (index < 0) return;
  // The PDF takes the link's place in the list, keeping its position and any
  // title someone typed; an untouched title gives way to the deck's own name.
  const replacement = makeRow({
    file,
    extension: "pdf",
    link: slide.link,
    presetTitle: slide.named ? slide.friendlyName : "",
  });
  slides[index] = replacement;
  slide.row.replaceWith(replacement.row);
  releaseUrls(slide);
  queuePreview(replacement, "pdf");
  updateList();
  error.hidden = true;
  notice.hidden = true;
  replacement.open.focus();
  announce(`${replacement.friendlyName} is now a PDF in this list.`);
}

const globe = `<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>
</svg>`;

// A row holds a file, a link, or both: a PDF fetched from Google Slides
// remembers where it came from. `link` is what parseLink() returns.
function makeRow({ file = null, extension = "", link = null, presetTitle = "" }) {
  const row = template.content.firstElementChild.cloneNode(true);
  const title = row.querySelector(".title");
  const handle = row.querySelector(".order");
  const remove = row.querySelector(".remove");
  const position = row.querySelector(".position");
  const filename = row.querySelector(".filename");
  const openPdf = row.querySelector(".open-pdf");
  const download = row.querySelector(".download");
  const getPdf = row.querySelector(".get-pdf");
  const thumbnail = row.querySelector(".thumbnail");
  let url = "";
  let fromFilename = link?.service ?? "";
  if (file) {
    const source = extension === "pdf" && file.type !== "application/pdf"
      ? file.slice(0, file.size, "application/pdf")
      : file;
    url = URL.createObjectURL(source);
    fromFilename = file.name.slice(0, -(extension.length + 1)).trim() || file.name;
  }
  const label = file?.name ?? link.display;
  const defaultTitle = (presetTitle?.trim() || fromFilename).slice(0, title.maxLength);
  const metadata = row.querySelector(".metadata");
  // `named` records that this talk has a name someone chose — typed here, or
  // carried in a session manifest — as opposed to the stem of its filename.
  const slide = { row, file, link, title, url, position, download, open: openPdf, extension, defaultTitle, metadata, friendlyName: defaultTitle, named: Boolean(presetTitle?.trim()), presentable: Boolean(file) && canPresent(extension) };

  title.defaultValue = defaultTitle;
  title.placeholder = defaultTitle;
  setMetadata(slide);
  filename.textContent = label;
  filename.title = file ? file.name : link.url;
  thumbnail.querySelector("span").textContent = file ? formats[extension] : "";

  title.setAttribute("aria-label", `Title for ${label}`);
  handle.setAttribute("aria-label", `Reorder ${label} with the arrow keys`);
  remove.setAttribute("aria-label", `Remove ${label}`);
  remove.title = file ? "Remove file" : "Remove link";

  if (file) {
    openPdf.setAttribute("aria-label", `Open in browser: ${file.name}`);
    download.setAttribute("aria-label", `Download ${file.name}`);
    if (link) {
      // The dagger points at the note on what a PDF from Google leaves out.
      for (const button of [openPdf, download]) {
        button.append(Object.assign(document.createElement("b"), {
          textContent: "†", ariaHidden: "true",
        }));
      }
      openPdf.setAttribute("aria-label",
        `Open in browser: ${file.name}. Saved from Google Slides, without animations, video or audio.`);
      download.setAttribute("aria-label",
        `Download ${file.name}. Saved from Google Slides, without animations, video or audio.`);
      // Where the PDF came from, for presenting from the live deck instead.
      const source = row.querySelector(".source-link");
      source.href = link.url;
      source.textContent = `${link.service} ↗`;
      source.setAttribute("aria-label", `Open the original in ${link.service}`);
      source.hidden = false;
    }
  } else {
    makeLinkControls(slide, { thumbnail, openPdf, download, getPdf });
  }

  const { presentable } = slide;
  openPdf.hidden = !presentable && !link;
  if (needsCaveat(extension)) {
    // The asterisk points at the rendering caveat below the list.
    openPdf.append(Object.assign(document.createElement("b"), {
      textContent: "*", ariaHidden: "true",
    }));
    openPdf.setAttribute("aria-label",
      `Open in browser: ${file.name}. May not match PowerPoint exactly.`);
  }
  // Every format goes to the presenter: PDFs for the slide picker and blanking,
  // decks because a blob URL would only download them again. updateDownload()
  // fills in the href, since it depends on the position.
  if (file) download.href = url;
  download.draggable = false;

  title.addEventListener("input", () => {
    if (title.value.trim()) slide.named = true;
    slide.friendlyName = title.value.trim() || slide.defaultTitle;
    title.defaultValue = slide.friendlyName;
    updateDownload(slide, slides.indexOf(slide));
    updateArchive();
  });
  title.addEventListener("blur", () => {
    title.value = slide.friendlyName;
  });
  title.addEventListener("focus", () => {
    if (tabbing) title.select();
  });
  title.addEventListener("keydown", event => {
    if (event.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      title.blur();
    }
    if (tabbing) {
      const index = slides.indexOf(slide) + (event.shiftKey ? -1 : 1);
      const next = index === slides.length ? zipName : slides[index]?.title;
      if (next) {
        event.preventDefault();
        next.focus();
      }
    }
  });
  handle.addEventListener("keydown", event => {
    const offset = { ArrowUp: -1, ArrowDown: 1 }[event.key];
    const index = slides.indexOf(slide);
    if (!offset || !slides[index + offset]) return;
    event.preventDefault();
    moveSlide(slide, index + offset);
    handle.focus();
    announceMove(slide);
  });
  remove.addEventListener("click", () => removeSlide(slide));
  row.addEventListener("pointerdown", event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    if (event.target.closest("input, a, .remove, .get-pdf, .preview-button")) return;
    if (event.pointerType !== "mouse" && !handle.contains(event.target)) return;
    drag = {
      slide,
      pointerId: event.pointerId,
      start: slides.indexOf(slide),
      y: event.clientY,
      grabOffset: event.clientY - row.getBoundingClientRect().top,
    };
    if (handle.contains(event.target)) handle.focus({ preventScroll: true });
    list.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  return slide;
}

function supported(extension) {
  return Object.hasOwn(formats, extension);
}

// The talk already listed that `link` points at, if any. A fetched PDF still
// counts, so a link pasted again does not bring back the deck it became.
function findLink(link) {
  return link && slides.find(slide => slide.link?.key === link.key);
}

// Entries are { file, title, link }, with a file, a link, or both; a title of
// its own is what a session ZIP brings back, and everything else leaves it
// empty and takes the filename.
async function addEntries(entries, { rejected = [], problems = [], note = "" } = {}) {
  let added = 0;
  const repeats = [];
  const adopted = [];
  const kept = [];
  const badLinks = [];
  for (const { file, title, link: address } of entries) {
    // A link from a hand-edited manifest is checked like a pasted one, so
    // nothing but an http(s) address ever becomes something to click.
    const link = address ? parseLink(address) : null;
    if (address && !link) badLinks.push(address);
    if (!file && !link) continue;
    // An untitled link goes into session.md under its service's name, which
    // is a placeholder rather than a name anyone chose.
    const chosenTitle = !file && title === link.service ? "" : title;
    const extension = file ? /[.]([^.]+)$/.exec(file.name)?.[1].toLowerCase() : "";
    if (file && (!supported(extension) || file.size === 0)) {
      rejected.push(file.name);
      continue;
    }
    // Against the list as it stands, which grows as this loop runs, so a drop
    // carrying the same file twice is caught alongside one that repeats a talk
    // already listed.
    const repeat = (file && await findDuplicate(file, slides)) || findLink(link);
    if (repeat) {
      // The file is already here, so only its name is in question. A name
      // someone chose beats one taken from a filename, and when both sides have
      // one the list wins, because it is what is on screen and being edited.
      const chosen = (chosenTitle || "").trim();
      if (!chosen || chosen === repeat.friendlyName) {
        repeats.push(repeat.friendlyName);
      } else if (repeat.named) {
        kept.push(`${repeat.friendlyName}, which the ZIP calls ${chosen}`);
      } else {
        renameSlide(repeat, chosen);
        adopted.push(repeat.friendlyName);
      }
      continue;
    }
    const slide = makeRow({ file, extension, link, presetTitle: chosenTitle });
    slides.push(slide);
    list.append(slide.row);
    if (file) queuePreview(slide, extension);
    added++;
  }
  updateList();
  const messages = [...problems];
  if (badLinks.length) {
    messages.push(`Couldn’t add ${badLinks.join(", ")}. That isn’t a web address this can open.`);
  }
  if (rejected.length) {
    messages.push(`Couldn’t add ${rejected.join(", ")}. Choose a PDF, PowerPoint, or Keynote file.`);
  }
  error.hidden = messages.length === 0;
  error.textContent = messages.join(" ");
  // Skipping a repeat is the expected outcome, not a failure, so it is said
  // quietly and apart from the errors.
  const notices = [];
  if (repeats.length) {
    notices.push(`Already in this session, so not added again: ${repeats.join(", ")}.`);
  }
  // Each talk is named once, in whichever sentence says the most about it.
  if (adopted.length) {
    notices.push(`Already here, and now named from the running order: ${adopted.join(", ")}.`);
  }
  if (kept.length) {
    notices.push(`Already here, keeping the name in the list for ${kept.join("; ")}.`);
  }
  notice.hidden = notices.length === 0;
  notice.textContent = notices.join(" ");
  if (added) announce(`${added} ${added === 1 ? "talk" : "talks"} added.${note}`);
  else if (notices.length) announce(notice.textContent);
  return added;
}

// A dropped ZIP is unpacked where it was dropped, so a drop mixing an archive
// with loose files keeps the order they arrived in. The loose files are one
// group, held together wherever the first of them landed, because a running
// order can only be applied to all of them at once.
async function addFiles(files) {
  const rejected = [];
  const problems = [];
  const groups = [];
  const loose = [];
  const unaccounted = [];
  let looseGroup = -1;
  let manifestText = "";
  let restored = false;
  let sessionName = "";
  const startedEmpty = slides.length === 0;

  for (const file of files) {
    // A running order dragged in beside its decks, rather than inside a ZIP.
    // Anything else ending in .md is not one, and falls through to be rejected
    // like any other file that is not a deck.
    if (isManifestName(file.name) && !manifestText) {
      const text = await file.text();
      if (parseManifest(text).order.length) {
        manifestText = text;
        continue;
      }
    }
    if (!/[.]zip$/i.test(file.name)) {
      if (looseGroup < 0) {
        looseGroup = groups.length;
        groups.push([]);
      }
      loose.push({ name: file.name, file });
      continue;
    }
    try {
      const session = await readSessionZip(file, supported);
      if (!session.entries.length) {
        problems.push(`${file.name} held no slides. A session ZIP needs at least one PDF, PowerPoint, or Keynote file.`);
        continue;
      }
      groups.push(session.entries);
      unaccounted.push(...session.missing);
      restored = true;
      sessionName ||= session.sessionName;
    } catch {
      problems.push(`Couldn’t read ${file.name}. It may not be a ZIP, or it may be damaged.`);
    }
  }

  // A running order dropped on its own can still bring back the talks that
  // live online; it is only empty-handed when it names nothing but files.
  const onlineOnly = !loose.length && manifestText
    && parseManifest(manifestText).order.some(({ link }) => link);
  if (loose.length || onlineOnly) {
    const session = readLooseSession(manifestText, loose, supported);
    if (looseGroup < 0) {
      looseGroup = groups.length;
      groups.push([]);
    }
    groups[looseGroup] = session.entries;
    unaccounted.push(...session.missing);
    restored ||= session.ordered;
    sessionName ||= session.sessionName;
  } else if (manifestText) {
    problems.push("A running order on its own has no slides. Drag in the files beside it, or the whole session ZIP.");
  }

  const entries = groups.flat();

  // A hand-edited manifest can name a file that is not in the ZIP. Say so,
  // rather than leaving someone to notice a talk is missing.
  if (unaccounted.length) {
    problems.push(`Named in the running order but not found: ${unaccounted.join(", ")}.`);
  }

  // Not a count: a repeat already in the list is skipped, so the number of
  // files that arrived is not the number that joined the session.
  const note = restored ? " Session order restored." : "";
  const added = await addEntries(entries, { rejected, problems, note });
  // Only take the session's name when there was nothing to overwrite.
  if (added && startedEmpty && sessionName) {
    zipName.value = sessionName;
    exportButton.setAttribute("aria-label", `Download ${zipName.value}.zip`);
  }
  return added;
}

function followPointer(y) {
  if (!drag.active && Math.abs(y - drag.y) < 5) return;
  drag.active = true;
  const { slide, grabOffset } = drag;
  const { row } = slide;
  rowAnimations.get(row)?.cancel();
  row.classList.add("dragging");
  list.classList.add("reordering");
  drag.y = y;
  const top = y - grabOffset;
  const center = top + row.offsetHeight / 2;
  const from = slides.indexOf(slide);
  const direction = Math.sign(center - (layoutTop(row) + row.offsetHeight / 2));
  let destination = from;
  for (let index = from + direction; direction && slides[index]; index += direction) {
    const neighbor = slides[index].row;
    const midpoint = layoutTop(neighbor) + neighbor.offsetHeight / 2;
    if ((center - midpoint) * direction < 0) break;
    destination = index;
  }
  if (destination !== from) {
    const displaced = slides.slice(Math.min(from, destination), Math.max(from, destination) + 1)
      .filter(item => item !== slide)
      .map(({ row }) => ({ row, top: row.getBoundingClientRect().top }));
    displaced.forEach(({ row }) => rowAnimations.get(row)?.cancel());
    moveSlide(slide, destination);
    displaced.forEach(({ row, top }) => animateRow(row, top - layoutTop(row)));
  }
  row.style.transform = `translateY(${top - layoutTop(row)}px)`;
}

list.addEventListener("pointermove", event => {
  if (drag?.pointerId === event.pointerId) followPointer(event.clientY);
});

window.addEventListener("scroll", () => {
  if (drag?.active) followPointer(drag.y);
}, { passive: true });

function finishDrag(event) {
  if (drag?.pointerId !== event.pointerId) return;
  const { slide, start, active } = drag;
  const top = slide.row.getBoundingClientRect().top;
  drag = undefined;
  slide.row.style.removeProperty("transform");
  slide.row.classList.remove("dragging");
  list.classList.remove("reordering");
  if (event.type !== "pointerup") {
    moveSlide(slide, start);
  } else if (slides.indexOf(slide) !== start) {
    announceMove(slide);
  }
  if (active) animateRow(slide.row, top - layoutTop(slide.row));
}

list.addEventListener("pointerup", finishDrag);
list.addEventListener("pointercancel", finishDrag);
list.addEventListener("lostpointercapture", finishDrag);

// A link dragged in from another tab's address bar or page counts as much as
// a file. One dragged from this page — the footer, say — does not.
let draggingFromPage = false;
document.addEventListener("dragstart", () => { draggingFromPage = true; });
document.addEventListener("dragend", () => { draggingFromPage = false; });

function hasFiles(event) {
  const types = event.dataTransfer?.types ?? [];
  return types.includes("Files") || (!draggingFromPage && types.includes("text/uri-list"));
}

function addLinks(text) {
  const addresses = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#"));
  if (!addresses.length) return Promise.resolve(0);
  return addEntries(addresses.map(link => ({ link, title: "" })));
}

window.addEventListener("dragenter", event => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  fileDragDepth++;
  zone.classList.add("active");
});
window.addEventListener("dragleave", event => {
  if (!hasFiles(event)) return;
  fileDragDepth = Math.max(0, fileDragDepth - 1);
  if (!fileDragDepth) zone.classList.remove("active");
});
window.addEventListener("dragover", event => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});
window.addEventListener("drop", event => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  fileDragDepth = 0;
  zone.classList.remove("active");
  if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  else addLinks(event.dataTransfer.getData("text/uri-list"));
});

async function addTypedLink() {
  const text = linkField.value.trim();
  if (!text) {
    linkField.focus();
    return;
  }
  if (!parseLink(text)) {
    showProblem("That doesn’t look like a web link. Copy it from the address bar, starting with https://.");
    linkField.focus();
    return;
  }
  await addLinks(text);
  linkField.value = "";
}
addLinkButton.addEventListener("click", addTypedLink);
linkField.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    addTypedLink();
  }
});

// Pasting a link anywhere on the page adds it, as long as no text field has
// the focus; files on the clipboard come in as a drop would.
document.addEventListener("paste", event => {
  if (event.target.closest?.("input, textarea, [contenteditable]")) return;
  const files = event.clipboardData?.files;
  if (files?.length) {
    event.preventDefault();
    addFiles(files);
    return;
  }
  const text = (event.clipboardData?.getData("text/plain") ?? "").trim();
  if (text && text.split(/\r?\n/).filter(Boolean).every(line => parseLink(line))) {
    event.preventDefault();
    addLinks(text);
  }
});

browse.addEventListener("click", () => picker.click());
importDownloads.addEventListener("click", async () => {
  if (typeof window.showOpenFilePicker !== "function") {
    picker.click();
    return;
  }

  try {
    const handles = await window.showOpenFilePicker({
      startIn: "downloads",
      multiple: true,
      types: [{
        description: "Presentations and session ZIPs",
        accept: {
          "application/pdf": [".pdf"],
          "application/zip": [".zip"],
          "application/octet-stream": Object.keys(formats).filter(extension => extension !== "pdf")
            .map(extension => `.${extension}`),
        },
      }],
    });
    addFiles(await Promise.all(handles.map(handle => handle.getFile())));
  } catch (error) {
    if (error.name !== "AbortError") picker.click();
  }
});
picker.addEventListener("change", () => {
  addFiles(picker.files);
  picker.value = "";
});

zipName.addEventListener("focus", () => {
  if (tabbing) zipName.select();
});
zipName.addEventListener("blur", () => {
  zipName.value = archiveStem();
  exportButton.setAttribute("aria-label", `Download ${zipName.value}.zip`);
});
zipName.addEventListener("keydown", event => {
  if (event.isComposing) return;
  if (event.key === "Enter") {
    event.preventDefault();
    zipName.blur();
  } else if (tabbing && event.shiftKey && slides.length) {
    event.preventDefault();
    slides.at(-1).title.focus();
  }
});

exportButton.addEventListener("click", async () => {
  const files = sessionFiles();
  const filename = `${archiveStem()}.zip`;
  exportButton.disabled = true;
  announce("Preparing session ZIP.");
  error.hidden = true;
  try {
    const url = URL.createObjectURL(await buildSessionZip(archiveStem(), files));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    announce("Session ZIP ready.");
  } catch {
    error.textContent = "Couldn’t create the session ZIP. Try again or download the slides individually.";
    error.hidden = false;
  } finally {
    exportButton.disabled = false;
  }
});

// When this copy of the page was published. There is no build step to stamp a
// version into, but GitHub Pages sets Last-Modified on every deploy and the
// browser hands it over as document.lastModified — so the footer dates itself,
// with nothing to remember to update. Served from a local folder it reports the
// file's own date, which is the same thing said locally. A browser that cannot
// tell gives the current time, so the stamp stays hidden unless it parses.
const built = new Date(document.lastModified);
if (!Number.isNaN(built.getTime())) {
  const stamp = [
    built.getFullYear(),
    String(built.getMonth() + 1).padStart(2, "0"),
    String(built.getDate()).padStart(2, "0"),
  ].join("-");
  const date = document.querySelector("#build-date");
  date.dateTime = stamp;
  date.textContent = stamp;
  document.querySelector("#build-stamp").hidden = false;
}

window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  // Restore names from the preserved list if the browser resets form controls.
  requestAnimationFrame(() => {
    for (const slide of slides) slide.title.value = slide.friendlyName;
  });
});
