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
const lineup = document.querySelector("#lineup");
const count = document.querySelector("#count");
const template = document.querySelector("#slide-row");
const picker = document.querySelector("#files");
const browse = document.querySelector("#browse");
const zone = document.querySelector("#drop-zone");
const error = document.querySelector("#error");
const status = document.querySelector("#status");
let draggedSlide;
let insertion;
let fileDragDepth = 0;
let previewQueue = Promise.resolve();

function announce(message) {
  status.textContent = message;
}

function updateList() {
  lineup.hidden = slides.length === 0;
  count.textContent = `${slides.length} ${slides.length === 1 ? "file" : "files"}`;
  slides.forEach((slide, index) => {
    slide.position.textContent = String(index + 1);
    slide.up.disabled = index === 0;
    slide.down.disabled = index === slides.length - 1;
  });
}

function moveSlide(slide, destination, focusAction) {
  const from = slides.indexOf(slide);
  if (from === destination || destination < 0 || destination >= slides.length) return;
  slides.splice(from, 1);
  slides.splice(destination, 0, slide);
  list.insertBefore(slide.row, slides[destination + 1]?.row ?? null);
  updateList();
  if (focusAction) {
    const control = slide[focusAction];
    (control.disabled ? slide.title : control).focus();
  }
  announce(`${slide.title.value.trim() || slide.file.name} moved to position ${destination + 1}.`);
}

function removeSlide(slide) {
  const index = slides.indexOf(slide);
  slides.splice(index, 1);
  slide.row.remove();
  URL.revokeObjectURL(slide.url);
  if (slide.previewUrl) URL.revokeObjectURL(slide.previewUrl);
  updateList();
  (slides[index]?.title ?? slides[index - 1]?.title ?? browse).focus();
  announce(`${slide.title.value.trim() || slide.file.name} removed.`);
}

function queuePreview(slide, extension) {
  previewQueue = previewQueue.then(async () => {
    if (!slide.row.isConnected) return;
    const preview = await makePreview(slide.file, slide.url, extension);
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
  const up = row.querySelector(".up");
  const down = row.querySelector(".down");
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
  const slide = { row, file, title, url, position, up, down };

  title.value = (file.name.slice(0, -(extension.length + 1)).trim() || file.name).slice(0, title.maxLength);
  filename.textContent = file.name;
  filename.title = file.name;
  row.querySelector(".thumbnail span").textContent = formats[extension];

  title.setAttribute("aria-label", `Title for ${file.name}`);
  up.setAttribute("aria-label", `Move ${file.name} up`);
  down.setAttribute("aria-label", `Move ${file.name} down`);
  remove.setAttribute("aria-label", `Remove ${file.name}`);
  openPdf.setAttribute("aria-label", `Open ${file.name} in a new browser tab`);
  download.setAttribute("aria-label", `Download ${file.name}`);

  openPdf.hidden = !isPdf;
  if (isPdf) openPdf.href = url;
  download.href = url;
  download.download = file.name;
  download.classList.toggle("primary", !isPdf);

  up.addEventListener("click", () => moveSlide(slide, slides.indexOf(slide) - 1, "up"));
  down.addEventListener("click", () => moveSlide(slide, slides.indexOf(slide) + 1, "down"));
  remove.addEventListener("click", () => removeSlide(slide));
  row.querySelector(".grip").addEventListener("dragstart", event => {
    draggedSlide = slide;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", file.name);
    row.classList.add("dragging");
  });
  row.addEventListener("dragend", resetReorder);

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

function clearInsertion() {
  insertion?.row.classList.remove("insert-before", "insert-after");
  insertion = undefined;
}

function resetReorder() {
  clearInsertion();
  draggedSlide?.row.classList.remove("dragging");
  draggedSlide = undefined;
}

function getInsertion(event) {
  const row = event.target.closest(".slide");
  if (!row || row === draggedSlide.row) return;
  const bounds = row.getBoundingClientRect();
  const after = event.clientY > bounds.top + bounds.height / 2;
  return { row, after };
}

list.addEventListener("dragover", event => {
  if (!draggedSlide) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  const target = getInsertion(event);
  clearInsertion();
  if (!target) return;
  insertion = target;
  target.row.classList.add(target.after ? "insert-after" : "insert-before");
});

list.addEventListener("dragleave", event => {
  if (!list.contains(event.relatedTarget)) clearInsertion();
});

list.addEventListener("drop", event => {
  if (!draggedSlide) return;
  event.preventDefault();
  const target = getInsertion(event);
  if (target) {
    const from = slides.indexOf(draggedSlide);
    const targetIndex = slides.findIndex(slide => slide.row === target.row);
    const destination = targetIndex + Number(target.after) - Number(from < targetIndex);
    moveSlide(draggedSlide, destination);
  }
  resetReorder();
});

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
