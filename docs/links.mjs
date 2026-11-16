// Talks that live at a web address rather than in a file: Google Slides,
// PowerPoint for the web, Canva and the like. A link row opens on its own
// site. Google Slides is the one service that also hands over a PDF and a
// preview to a page like this, and only for a deck shared with anyone who has
// the link; those requests are made only when someone clicks for them.

// The names shown for the services people are likely to paste. Anything else
// is still accepted, and goes by its host name.
const services = [
  [/(^|\.)docs\.google\.com$/, "Google Slides"],
  [/(^|\.)canva\.com$/, "Canva"],
  [/(^|\.)pitch\.com$/, "Pitch"],
  [/(^|\.)figma\.com$/, "Figma"],
  [/(^|\.)prezi\.com$/, "Prezi"],
  [/(^|\.)gamma\.app$/, "Gamma"],
  [/(^|\.)icloud\.com$/, "iCloud Keynote"],
  [/(^|\.)(sharepoint\.com|onedrive\.live\.com|1drv\.ms|office\.com|cloud\.microsoft)$/, "PowerPoint for the web"],
];

// /presentation/d/<id>/edit, with or without a /u/0/ account switch in front.
// A deck published to the web (/presentation/d/e/2PACX…/pub) carries a
// different kind of ID that the export does not accept, so it stays an
// ordinary link; the short "e" never matches the length required here.
const googleDeck = /^\/presentation(?:\/u\/\d+)?\/d\/([A-Za-z0-9_-]{20,})(?:[/?#]|$)/;

/**
 * Reads pasted or dropped text as a link to online slides.
 * Returns { url, key, googleId, service, display } or null when the text is
 * not a single http(s) address. The scheme is required, so a pasted filename
 * such as `talk.pdf` is never mistaken for a website.
 */
export function parseLink(text) {
  const trimmed = String(text ?? "").trim();
  if (!/^https?:\/\/\S+$/i.test(trimmed)) return null;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (!url.hostname.includes(".")) return null;

  const host = url.hostname.replace(/^www\./, "");
  const googleId = /(^|\.)docs\.google\.com$/.test(url.hostname)
    ? googleDeck.exec(url.pathname)?.[1] ?? null
    : null;
  const service = googleId
    ? "Google Slides"
    : services.find(([pattern]) => pattern.test(url.hostname))?.[1] ?? host;

  // Two links to the same deck should count as one talk. For Google that is
  // the deck ID, whatever view or account the address happens to open; for
  // anything else, the address without its fragment or a trailing slash.
  // The address as the URL parser writes it, so what is opened, and what
  // goes in session.md between angle brackets, is always properly escaped.
  const href = url.href;
  url.hash = "";
  const plain = url.href.replace(/\/$/, "");
  const key = googleId ? `google-slides:${googleId}` : plain;
  const display = `${host}${url.pathname === "/" ? "" : url.pathname}`;
  return { url: href, key, googleId, service, display };
}

function googleExport(id, format) {
  return `https://docs.google.com/presentation/d/${encodeURIComponent(id)}/export/${format}`;
}

/** Where to send someone to download the PDF themselves, signed in to Google. */
export function googlePdfUrl(id) {
  return googleExport(id, "pdf");
}

// No cookies and no referrer: the request reaches Google as an anonymous one,
// so it says nothing about who is asking or from which list, and it can only
// succeed for a deck shared with anyone who has the link.
async function fetchFromGoogle(id, format) {
  const response = await fetch(googleExport(id, format), {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`Google answered ${response.status}.`);
  return response;
}

// Content-Disposition carries the deck's own name, which is the best title on
// offer. Google appends ".pdf" to a converted upload's name, so a deck that
// began as `talk.pptx` arrives as `talk.pptx.pdf`; the inner extension goes.
function filenameFrom(disposition) {
  const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(disposition ?? "")?.[1];
  let name = "";
  if (encoded) {
    try {
      name = decodeURIComponent(encoded.trim());
    } catch {
      name = "";
    }
  }
  name ||= /filename\s*=\s*"([^"]*)"/i.exec(disposition ?? "")?.[1] ?? "";
  name = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();
  name = name.replace(/\.(?:pptx?|pptm|ppsx?|key|odp)(?=\.pdf$)/i, "");
  if (!/\.pdf$/i.test(name)) name = name ? `${name}.pdf` : "";
  return name.replace(/^\.pdf$/i, "") || "Google Slides.pdf";
}

/** The deck as a PDF File, or a thrown error when Google will not hand it over. */
export async function fetchGooglePdf(id) {
  const response = await fetchFromGoogle(id, "pdf");
  const blob = await response.blob();
  const magic = new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer());
  if (magic !== "%PDF-") throw new Error("Google did not send a PDF.");
  const name = filenameFrom(response.headers.get("Content-Disposition"));
  return new File([blob], name, { type: "application/pdf" });
}

/** The first slide as an image Blob. */
export async function fetchGooglePreview(id) {
  const response = await fetchFromGoogle(id, "png");
  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || !blob.size) throw new Error("Google did not send an image.");
  return blob;
}
