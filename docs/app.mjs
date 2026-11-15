import { makePreview } from "./previews.mjs";
import { buildSessionZip, sessionZipSize } from "./session-zip.mjs";
import { readSessionZip } from "./session-import.mjs";
import { canPresent, needsCaveat, presentUrl } from "./deck-viewer.mjs";
import { findDuplicate } from "./file-identity.mjs";

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
  const name = downloadName(slide, index);
  slide.download.download = name;
  // The presenter offers the same download, so it needs the same name, which
  // moves with the position and the title.
  if (slide.presentable) slide.open.href = presentUrl(slide.url, slide.friendlyName, name);
}

function sessionFiles() {
  const width = String(slides.length).length;
  return slides.map((slide, index) => ({
    file: slide.file,
    name: downloadName(slide, index, width),
    title: slide.friendlyName,
  }));
}

function formatSize(bytes) {
  return bytes < 100_000 ? "<0.1 MB" : `${megabytes.format(bytes / 1_000_000)} MB`;
}

function updateArchive() {
  const count = slides.length;
  archive.hidden = count === 0;
  if (count) {
    const size = formatSize(sessionZipSize(archiveStem(), sessionFiles()));
    zipDetails.textContent = `${count} ${count === 1 ? "file" : "files"} (${size})`;
  }
}

function updateList() {
  list.hidden = slides.length === 0;
  deckCaveat.hidden = !slides.some(slide => needsCaveat(slide.extension));
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
  URL.revokeObjectURL(slide.url);
  if (slide.previewUrl) URL.revokeObjectURL(slide.previewUrl);
  updateList();
  (slides[index]?.title ?? slides[index - 1]?.title ?? browse).focus();
  announce(`${slide.friendlyName} removed.`);
}

function queuePreview(slide, extension) {
  previewQueue = previewQueue.then(async () => {
    if (!slide.row.isConnected) return;
    const preview = await makePreview(slide.file, slide.url, extension, (count, unit) => {
      if (slide.row.isConnected) setMetadata(slide, count, unit);
    });
    if (!preview || !slide.row.isConnected) return;
    slide.previewUrl = URL.createObjectURL(preview);
    const image = slide.row.querySelector("img");
    image.addEventListener("load", () => { image.hidden = false; }, { once: true });
    image.src = slide.previewUrl;
  }).catch(() => {
    // Keep the file-type label when a preview is missing or unreadable.
  });
}

function makeRow(file, extension, presetTitle) {
  const row = template.content.firstElementChild.cloneNode(true);
  const title = row.querySelector(".title");
  const handle = row.querySelector(".order");
  const remove = row.querySelector(".remove");
  const position = row.querySelector(".position");
  const filename = row.querySelector(".filename");
  const openPdf = row.querySelector(".open-pdf");
  const download = row.querySelector(".download");
  const isPdf = extension === "pdf";
  const source = isPdf && file.type !== "application/pdf"
    ? file.slice(0, file.size, "application/pdf")
    : file;
  const url = URL.createObjectURL(source);
  const fromFilename = file.name.slice(0, -(extension.length + 1)).trim() || file.name;
  const defaultTitle = (presetTitle?.trim() || fromFilename).slice(0, title.maxLength);
  const metadata = row.querySelector(".metadata");
  // `named` records that this talk has a name someone chose — typed here, or
  // carried in a session manifest — as opposed to the stem of its filename.
  const slide = { row, file, title, url, position, download, open: openPdf, extension, defaultTitle, metadata, friendlyName: defaultTitle, named: Boolean(presetTitle?.trim()), presentable: canPresent(extension) };

  title.defaultValue = defaultTitle;
  title.placeholder = defaultTitle;
  setMetadata(slide);
  filename.textContent = file.name;
  filename.title = file.name;
  row.querySelector(".thumbnail span").textContent = formats[extension];

  title.setAttribute("aria-label", `Title for ${file.name}`);
  handle.setAttribute("aria-label", `Reorder ${file.name} with the arrow keys`);
  remove.setAttribute("aria-label", `Remove ${file.name}`);
  openPdf.setAttribute("aria-label", `Open in browser: ${file.name}`);
  download.setAttribute("aria-label", `Download ${file.name}`);

  const { presentable } = slide;
  openPdf.hidden = !presentable;
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
  download.href = url;
  download.draggable = false;

  title.addEventListener("input", () => {
    if (title.value.trim()) slide.named = true;
    slide.friendlyName = title.value.trim() || defaultTitle;
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
    if (event.target.closest("input, a, .remove")) return;
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

// Entries are { file, title }; a title of its own is what a session ZIP brings
// back, and everything else leaves it empty and takes the filename.
async function addEntries(entries, { rejected = [], problems = [], note = "" } = {}) {
  let added = 0;
  const repeats = [];
  const adopted = [];
  const kept = [];
  for (const { file, title } of entries) {
    const extension = /[.]([^.]+)$/.exec(file.name)?.[1].toLowerCase();
    if (!supported(extension) || file.size === 0) {
      rejected.push(file.name);
      continue;
    }
    // Against the list as it stands, which grows as this loop runs, so a drop
    // carrying the same file twice is caught alongside one that repeats a talk
    // already listed.
    const repeat = await findDuplicate(file, slides);
    if (repeat) {
      // The file is already here, so only its name is in question. A name
      // someone chose beats one taken from a filename, and when both sides have
      // one the list wins, because it is what is on screen and being edited.
      const chosen = (title || "").trim();
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
    const slide = makeRow(file, extension, title);
    slides.push(slide);
    list.append(slide.row);
    queuePreview(slide, extension);
    added++;
  }
  updateList();
  const messages = [...problems];
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
  if (added) announce(`${added} ${added === 1 ? "file" : "files"} added.${note}`);
  else if (notices.length) announce(notice.textContent);
  return added;
}

// A dropped ZIP is unpacked in place, so a drop mixing an archive with loose
// files keeps the order they arrived in.
async function addFiles(files) {
  const rejected = [];
  const problems = [];
  const entries = [];
  const unaccounted = [];
  let restored = 0;
  let sessionName = "";
  const startedEmpty = slides.length === 0;

  for (const file of files) {
    if (!/[.]zip$/i.test(file.name)) {
      entries.push({ file, title: "" });
      continue;
    }
    try {
      const session = await readSessionZip(file, supported);
      if (!session.entries.length) {
        problems.push(`${file.name} held no slides. A session ZIP needs at least one PDF, PowerPoint, or Keynote file.`);
        continue;
      }
      entries.push(...session.entries);
      unaccounted.push(...session.missing);
      restored += session.entries.length;
      sessionName ||= session.sessionName;
    } catch {
      problems.push(`Couldn’t read ${file.name}. It may not be a ZIP, or it may be damaged.`);
    }
  }

  // A hand-edited manifest can name a file that is not in the ZIP. Say so,
  // rather than leaving someone to notice a talk is missing.
  if (unaccounted.length) {
    problems.push(`Named in the running order but not in the ZIP: ${unaccounted.join(", ")}.`);
  }

  // Not a count: a repeat already in the list is skipped, so the number of
  // files the ZIP carried is not the number that joined the session.
  const note = restored ? " Session order restored." : "";
  const added = await addEntries(entries, { rejected, problems, note });
  // Only name the session after the ZIP when there was nothing to overwrite.
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

function hasFiles(event) {
  return event.dataTransfer?.types.includes("Files");
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
  addFiles(event.dataTransfer.files);
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

window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  // Restore names from the preserved list if the browser resets form controls.
  requestAnimationFrame(() => {
    for (const slide of slides) slide.title.value = slide.friendlyName;
  });
});
