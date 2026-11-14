// Slides open in their own tab, PDFs included. The file travels as a blob URL
// so the presenting tab can read it without a copy or an upload.
const presentable = ["pdf", "ppt", "pptx", "pptm", "pps", "ppsx", "ppsm"];

export function canPresent(extension) {
  return presentable.includes(extension);
}

// PowerPoint carries the caveat about rendering; PDF.js is the engine Firefox
// ships, so a PDF needs no asterisk.
export function needsCaveat(extension) {
  return canPresent(extension) && extension !== "pdf";
}

export function presentUrl(fileUrl, title, filename) {
  const parameters = new URLSearchParams({ src: fileUrl, title, name: filename });
  return `./present.html?${parameters}`;
}
