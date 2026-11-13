import { makePreview } from "./previews.mjs";

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
const zone = document.querySelector("#drop-zone");
const error = document.querySelector("#error");
const status = document.querySelector("#status");
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

function updateDownload(slide, index) {
  const extension = slide.file.name.slice(-(slide.extension.length + 1));
  const title = slide.friendlyName;
  let name = slide.file.name;
  if (title && title !== slide.defaultTitle) {
    const stem = title.toLowerCase().endsWith(extension.toLowerCase())
      ? title.slice(0, -extension.length)
      : title;
    const safeStem = stem.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").replace(/[. ]+$/, "");
    if (safeStem) name = safeStem + extension;
  }
  slide.download.download = `${index + 1}. ${name}`;
}

function updateList() {
  list.hidden = slides.length === 0;
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
  const size = slide.file.size < 100_000 ? "<0.1 MB" : `${megabytes.format(slide.file.size / 1_000_000)} MB`;
  const quantity = count ? `${count} ${unit}${count === 1 ? "" : "s"}, ` : "";
  slide.metadata.textContent = `(${quantity}${size})`;
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

function makeRow(file, extension) {
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
  const defaultTitle = (file.name.slice(0, -(extension.length + 1)).trim() || file.name).slice(0, title.maxLength);
  const metadata = row.querySelector(".metadata");
  const slide = { row, file, title, url, position, download, extension, defaultTitle, metadata, friendlyName: defaultTitle };

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

  openPdf.hidden = !isPdf;
  if (isPdf) openPdf.href = `${url}#view=Fit`;
  download.href = url;
  download.draggable = false;

  title.addEventListener("input", () => {
    slide.friendlyName = title.value.trim() || defaultTitle;
    title.defaultValue = slide.friendlyName;
    updateDownload(slide, slides.indexOf(slide));
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
      const next = slides[slides.indexOf(slide) + (event.shiftKey ? -1 : 1)];
      if (next) {
        event.preventDefault();
        next.title.focus();
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

function addFiles(files) {
  const rejected = [];
  let added = 0;
  for (const file of files) {
    const extension = /[.]([^.]+)$/.exec(file.name)?.[1].toLowerCase();
    if (!Object.hasOwn(formats, extension) || file.size === 0) {
      rejected.push(file.name);
      continue;
    }
    const slide = makeRow(file, extension);
    slides.push(slide);
    list.append(slide.row);
    queuePreview(slide, extension);
    added++;
  }
  updateList();
  error.hidden = rejected.length === 0;
  error.textContent = rejected.length ? `Couldn’t add ${rejected.join(", ")}. Choose a PDF, PowerPoint, or Keynote file.` : "";
  if (added) announce(`${added} ${added === 1 ? "file" : "files"} added.`);
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
picker.addEventListener("change", () => {
  addFiles(picker.files);
  picker.value = "";
});

window.addEventListener("pageshow", event => {
  if (!event.persisted) return;
  // Restore names from the preserved list if the browser resets form controls.
  requestAnimationFrame(() => {
    for (const slide of slides) slide.title.value = slide.friendlyName;
  });
});
