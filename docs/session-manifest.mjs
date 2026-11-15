// The running order, written into the session ZIP as Markdown so it reads as a
// list of talks and can be edited by hand. Reading it back is what lets a ZIP
// be dropped in to restore a session.
export const manifestName = "session.md";

// Printed in the manifest so whoever opens the ZIP can find the tool. It is
// the published site rather than wherever this copy happens to be running,
// since the file is made to be passed on.
export const siteUrl = "https://lukestein.com/session-slides-organizer/";

// The export always writes `session.md`, but the file is meant to be handled,
// and renaming it is the obvious thing to do with a file named after nothing
// in particular. Any Markdown file is worth reading as a running order; one
// that turns out not to be is rejected by the caller, which parses it first.
export function isManifestName(filename) {
  return /[.](?:md|markdown)$/i.test(filename.trim());
}

// "1. **Opening paper** — `1. Opening paper.pptx`". The title may be bold or
// plain, the dash may be any of the three, and a line carrying only a filename
// still counts, so a hand-edited file is unlikely to be rejected.
const entryPattern = /^\s*\d+[.)]\s*(.*?)\s*(?:[—–-]\s*)?`([^`]+)`\s*$/;

function stripEmphasis(text) {
  return text.replace(/^\*\*(.*)\*\*$/, "$1").replace(/^\*(.*)\*$/, "$1").trim();
}

// A session ZIP numbers its files to hold the order. That prefix is the ZIP's
// business, not a name anyone wants to read, so it comes off on the way back in.
export function stripPosition(filename) {
  return filename.replace(/^\s*\d+\s*[.)]\s+/, "");
}

export function buildManifest(sessionName, entries) {
  const lines = [
    `# ${sessionName}`,
    "",
    "Import these files to the Session Slides Organizer to restore this running",
    "order. Drag in the whole ZIP, or the files it holds along with this one.",
    "",
    siteUrl,
    "",
    "Reordering the list below, or rewriting a title, changes what the import does.",
    "",
  ];
  entries.forEach(({ title, name }, index) => {
    // Fall back to the file's own name, so a missing title never reads
    // "undefined" in a file someone is meant to be able to read.
    const shown = (title || "").trim() || stripPosition(name).replace(/\.[^.]+$/, "");
    lines.push(`${index + 1}. **${shown}** — \`${name}\``);
  });
  return `${lines.join("\n")}\n`;
}

export function parseManifest(text) {
  const order = [];
  let sessionName = "";
  for (const line of text.split(/\r?\n/)) {
    const heading = /^#\s+(.+?)\s*$/.exec(line);
    if (heading && !sessionName) {
      sessionName = heading[1];
      continue;
    }
    const entry = entryPattern.exec(line);
    if (!entry) continue;
    const name = entry[2].trim();
    const title = stripEmphasis(entry[1]) || stripPosition(name).replace(/\.[^.]+$/, "");
    order.push({ title, name });
  }
  return { sessionName, order };
}
