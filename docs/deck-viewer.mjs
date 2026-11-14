// PowerPoint decks open in their own tab, the way PDFs do. The deck travels as
// a blob URL so the presenting tab can read it without a copy or an upload.
const presentable = ["ppt", "pptx", "pptm", "pps", "ppsx", "ppsm"];

export function canPresent(extension) {
  return presentable.includes(extension);
}

export function presentUrl(fileUrl, title) {
  const parameters = new URLSearchParams({ src: fileUrl, title });
  return `./present.html?${parameters}`;
}
