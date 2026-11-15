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

// `filename` is the name a download should carry, which follows the position
// and the title. `source` is the file's own name, shown beside the title when
// the two say different things.
export function presentUrl(fileUrl, title, filename, source) {
  const parameters = new URLSearchParams({ src: fileUrl, title, name: filename, file: source });
  return `./present.html?${parameters}`;
}
