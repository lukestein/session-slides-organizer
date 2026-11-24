// Talks that live at a web address rather than in a file: Google Slides,
// PowerPoint for the web, Canva and the like. A link row opens on its own
// site. Google Slides is the one service that also hands over a PDF and a
// preview to a page like this, and only for a deck shared with anyone who has
// the link. Its preview and name are asked for as soon as such a link is
// added; the PDF only when someone clicks for it.
//
// A link straight to a file — a PDF on a personal site, say — is fetched as
// soon as it is added, and becomes a file row that remembers where it came
// from. That only works when the site lets other pages download it (CORS);
// GitHub Pages does, many university and file-sharing sites do not, and then
// the row stays a link.

import { loadPdf } from "./pdf-document.mjs";

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

// Kevin Bryan's ModernSlides (github.com/kevincure/ModernSlides) is a single
// page that its users host in a ModernSlides folder on their own sites. A deck
// opens as …/ModernSlides/?deck=Name, which loads Name/Name.json from beside
// the page. Only that documented address is relied on: the page and the deck
// format are his and change, and his site does not let other pages read the
// deck, so the row is named from the address and opens there like any link.
const modernSlidesPage = /\/ModernSlides\/(?:index\.html?)?$/i;

function modernSlidesDeck(url) {
  if (!modernSlidesPage.test(url.pathname)) return null;
  const deck = (url.searchParams.get("deck") || url.searchParams.get("xml") || "").trim();
  // The parameter may also be a path beside the page, such as
  // Class2/Class2Slides.txt, which reads best whole: the name is the path
  // without its extension. A full address keeps only its last part.
  const path = /^[a-z][a-z0-9+.-]*:/i.test(deck) ? deck.split("/").pop() : deck.replace(/^(\.?\/)+/, "");
  const name = path.replace(/\.(json|txt)$/i, "");
  if (!name) return null;
  const folder = url.pathname.replace(/index\.html?$/i, "");
  return { name, key: `modernslides:${url.origin}${folder}?deck=${deck}` };
}

/**
 * Reads pasted or dropped text as a link to online slides.
 * Returns { url, key, googleId, service, display, direct, name } or null when the text is
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
  const modernSlides = googleId ? null : modernSlidesDeck(url);
  const service = googleId
    ? "Google Slides"
    : modernSlides ? "ModernSlides" : services.find(([pattern]) => pattern.test(url.hostname))?.[1] ?? host;

  // Two links to the same deck should count as one talk. For Google that is
  // the deck ID, whatever view or account the address happens to open; for
  // ModernSlides, the page's folder and the deck, with or without index.html;
  // for anything else, the address without its fragment or a trailing slash.
  // The address as the URL parser writes it, so what is opened, and what
  // goes in session.md between angle brackets, is always properly escaped.
  const href = url.href;
  url.hash = "";
  const plain = url.href.replace(/\/$/, "");
  const key = googleId ? `google-slides:${googleId}` : modernSlides?.key ?? plain;
  const display = `${host}${url.pathname === "/" ? "" : url.pathname}`;
  // A host none of the services above, so the address may lead straight to
  // a file worth fetching.
  const direct = !googleId && service === host;
  // The deck's own name, where the address carries one, stands in for a title
  // until someone types one, as a filename does for a dropped file.
  const name = modernSlides?.name ?? "";
  return { url: href, key, googleId, service, display, direct, name };
}

const deckExtensions = /\.(pdf|pptx?|pptm|ppsx?|ppsm|key)$/i;

/** Whether the address ends in the name of a slide file, such as `talk.pdf`. */
export function looksLikeDeckFile(link) {
  try {
    return deckExtensions.test(decodeURIComponent(new URL(link.url).pathname));
  } catch {
    return false;
  }
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
// offer, on every export: the PDF and the preview image alike. Google appends
// the export's extension to a converted upload's name, so a deck that began as
// `talk.pptx` arrives as `talk.pptx.pdf`; the inner extension goes too.
// Returns the bare name, or "" when Google gave none.
function deckNameFrom(disposition) {
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
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\.(?:pdf|png)$/i, "")
    .replace(/\.(?:pptx?|pptm|ppsx?|key|odp)$/i, "")
    .trim();
}

async function startsWith(blob, signature) {
  const head = new Uint8Array(await blob.slice(0, signature.length).arrayBuffer());
  return signature.every((byte, index) => head[index] === byte);
}
const pdfMagic = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const zipMagic = [0x50, 0x4b, 0x03, 0x04]; // .pptx and .key are ZIP packages
const oleMagic = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]; // .ppt and .pps

async function validatePdf(blob) {
  const { task } = await loadPdf({ data: await blob.arrayBuffer() });
  try {
    const pdf = await task.promise;
    await pdf.getPage(1);
  } catch {
    throw new NotADeckError("The PDF could not be opened.");
  } finally {
    await task.destroy();
  }
}

// The entry that makes a ZIP a deck: a PowerPoint package's presentation part,
// or a Keynote package's document. Only the ZIP's directory is read; nothing is
// unpacked, so even a deck full of video is checked in moments.
const packageDocument = {
  key: /^(?:Index\/Document\.iwa|index\.apxl(?:\.gz)?)$/,
  pptx: /^ppt\/presentation\.xml$/,
};

async function hasPackageEntry(blob, pattern) {
  const { unzipSync } = await import("./vendor/fflate/esm/browser.js");
  let found = false;
  unzipSync(new Uint8Array(await blob.arrayBuffer()), {
    filter: ({ name, originalSize }) => {
      if (originalSize && pattern.test(name)) found = true;
      return false;
    },
  });
  return found;
}

// The 1997–2003 formats are OLE containers with no cheap way to look inside,
// so those alone are opened with the deck reader to make sure they hold slides.
async function hasLegacySlides(blob) {
  const { parse } = await import("./vendor/webppt/core/core.js");
  const presentation = await parse(await blob.arrayBuffer());
  const hasSlides = presentation.slides.length > 0;
  presentation.dispose?.();
  return hasSlides;
}

async function isPresentation(blob, extension) {
  if (!extension || extension === "pdf") return false;
  const legacy = ["ppt", "pps"].includes(extension);
  if (!await startsWith(blob, legacy ? oleMagic : zipMagic)) return false;
  try {
    if (legacy) return await hasLegacySlides(blob);
    return await hasPackageEntry(blob, packageDocument[extension === "key" ? "key" : "pptx"]);
  } catch {
    return false;
  }
}

/** The deck as a PDF File, or a thrown error when Google will not hand it over. */
export async function fetchGooglePdf(id) {
  const response = await fetchFromGoogle(id, "pdf");
  const blob = await response.blob();
  if (!await startsWith(blob, pdfMagic)) throw new Error("Google did not send a PDF.");
  await validatePdf(blob);
  const name = deckNameFrom(response.headers.get("Content-Disposition")) || "Google Slides";
  return new File([blob], `${name}.pdf`, { type: "application/pdf" });
}

/**
 * The first slide as an image Blob, and the deck's name, which comes with it.
 * Returns { image, name }; name is "" when Google gave none. There is no slide
 * count to be had this cheaply: only the PDF says reliably, and that is what
 * Get PDF is for.
 */
export async function fetchGooglePreview(id) {
  const response = await fetchFromGoogle(id, "png");
  const image = await response.blob();
  if (!image.type.startsWith("image/") || !image.size) throw new Error("Google did not send an image.");
  return { image, name: deckNameFrom(response.headers.get("Content-Disposition")) };
}

// The filename a download would be saved under: Content-Disposition when the
// site sends one, else the last part of the address.
function remoteFilename(response, address) {
  const fromHeader = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(response.headers.get("Content-Disposition") ?? "")?.[1]
    ?? /filename\s*=\s*"?([^";]+)"?/i.exec(response.headers.get("Content-Disposition") ?? "")?.[1];
  let name = "";
  try {
    name = decodeURIComponent((fromHeader ?? new URL(address).pathname.split("/").pop() ?? "").trim());
  } catch {
    name = "";
  }
  return name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim();
}

// Thrown when the site answered but sent something other than a deck, so
// asking again will not help, unlike a refusal or a network failure.
export class NotADeckError extends Error {}

/**
 * Downloads a slide file straight from the address it was linked at.
 * Returns a File named as the site names it, or throws when the site refuses,
 * the network fails, or what comes back is not a PDF, PowerPoint or Keynote
 * file. The check is on the bytes rather than the address, so a web page or an
 * image never passes for a deck, and an address without a filename still can.
 */
export async function fetchLinkedFile(link) {
  const response = await fetch(link.url, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok) throw new Error(`The site answered ${response.status}.`);
  // A web page, a picture or a video is plainly not a deck; stop before
  // downloading the whole of it.
  if (/^(?:text\/html|application\/xhtml|image\/|video\/|audio\/)/i.test(response.headers.get("Content-Type") ?? "")) {
    response.body?.cancel();
    throw new NotADeckError("The link leads to a web page, not a slide file.");
  }
  const blob = await response.blob();
  let name = remoteFilename(response, response.url || link.url) || link.service;
  const extension = deckExtensions.exec(name)?.[1].toLowerCase();
  if (await startsWith(blob, pdfMagic)) {
    await validatePdf(blob);
    if (extension !== "pdf") name = `${name.replace(/\.[^.]*$/, "") || "Slides"}.pdf`;
  } else if (!await isPresentation(blob, extension)) {
    throw new NotADeckError("The link does not lead to a PDF, PowerPoint or Keynote file.");
  }
  return new File([blob], name, { type: blob.type });
}

/** A fresh copy of the file a row was fetched from, wherever that was. */
export function fetchSourceFile(link) {
  return link.googleId ? fetchGooglePdf(link.googleId) : fetchLinkedFile(link);
}
