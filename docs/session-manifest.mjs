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
// still counts, so a hand-edited file is unlikely to be rejected. A talk that
// lives online carries its address in angle brackets where the filename would
// be, and a PDF fetched from one carries both: "`2. Keynote.pdf` from <https://…>".
const entryPattern = /^\s*\d+[.)]\s*(.*)$/;
const filenamePattern = /`([^`]+)`/;
const linkPattern = /<(https?:\/\/[^>\s]+)>|(https?:\/\/\S+)/i;
const writtenEntry = /^\*\*(?<title>.+)\*\*\s+[—–-]\s+(?:(?<fence>`+)(?<name>.+?)\k<fence>(?:\s+from\s+<(?<source>https?:\/\/[^>\s]+)>)?|<(?<link>https?:\/\/[^>\s]+)>)$/i;

function filenameSpan(name) {
  const runs = name.match(/`+/g) ?? [];
  const fence = "`".repeat(Math.max(0, ...runs.map(run => run.length)) + 1);
  return fence.length === 1 ? `${fence}${name}${fence}` : `${fence} ${name} ${fence}`;
}

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
  entries.forEach(({ title, name, link }, index) => {
    // Fall back to the file's own name, so a missing title never reads
    // "undefined" in a file someone is meant to be able to read.
    const shown = (title || "").trim()
      || (name ? stripPosition(name).replace(/\.[^.]+$/, "") : "Online slides");
    const where = [name && filenameSpan(name), link && `<${link}>`].filter(Boolean).join(" from ");
    lines.push(`${index + 1}. **${shown}** — ${where}`);
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
    const entry = entryPattern.exec(line)?.[1];
    if (!entry) continue;
    // Read the source after the bold title as a unit. URLs and code spans in
    // the title are part of the title, and backticks can also live in a filename.
    const written = writtenEntry.exec(entry.trimEnd())?.groups;
    if (written) {
      order.push({ title: written.title, name: written.name?.trim() ?? "", link: written.source ?? written.link ?? "" });
      continue;
    }
    const filename = filenamePattern.exec(entry);
    const link = linkPattern.exec(entry);
    if (!filename && !link) continue;
    // The title is whatever comes before the filename or the address, less
    // the dash that separates them.
    const start = Math.min(filename?.index ?? Infinity, link?.index ?? Infinity);
    const before = stripEmphasis(entry.slice(0, start).replace(/\s*[—–-]?\s*$/, ""));
    const name = filename?.[1].trim() ?? "";
    const title = before || (name ? stripPosition(name).replace(/\.[^.]+$/, "") : "");
    // A bare address typed by hand may run into the punctuation after it.
    const address = link ? (link[1] ?? link[2].replace(/[.,;:!?)\]]+$/, "")) : "";
    order.push({ title, name, link: address });
  }
  return { sessionName, order };
}
