import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchLinkedFile, looksLikeDeckFile, NotADeckError, parseLink } from "../docs/links.mjs";
import { strToU8, zipSync } from "../docs/vendor/fflate/esm/browser.js";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function serve(body, headers = {}) {
  globalThis.fetch = async () => new Response(body, { headers });
}

function onePagePdf() {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 180] /Resources << >> >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += "xref\n0 4\n0000000000 65535 f \n";
  pdf += offsets.map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  return `${pdf}trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
}

test("a ModernSlides deck is named from its address", () => {
  const link = parseLink("https://kevinbryanecon.com/ModernSlides/?deck=Progress2025Class1");
  assert.equal(link.service, "ModernSlides");
  assert.equal(link.name, "Progress2025Class1");
  assert.equal(link.direct, false);
  // The same deck through index.html, or with a fragment, is the same talk.
  assert.equal(parseLink("https://kevinbryanecon.com/ModernSlides/index.html?deck=Progress2025Class1").key, link.key);
  assert.equal(parseLink("https://kevinbryanecon.com/ModernSlides/?deck=Progress2025Class1#slide-2").key, link.key);
  assert.equal(parseLink("https://kevinbryanecon.com/modernslides/?deck=Progress2025Class1").service, "ModernSlides");
  assert.notEqual(parseLink("https://kevinbryanecon.com/ModernSlides/?deck=Other").key, link.key);
  assert.equal(parseLink("https://kevinbryanecon.com/ModernSlides/?xml=Progress2025Class2/Class2Slides.txt").name, "Progress2025Class2/Class2Slides");
  assert.equal(parseLink("https://example.edu/ModernSlides/?deck=./Talk/Talk.json").name, "Talk/Talk");
  assert.equal(parseLink("https://example.edu/ModernSlides/?deck=https://example.org/decks/Talk.json").name, "Talk");
});

test("only a deck on a ModernSlides page counts as one", () => {
  // The page with no deck shows its demo; a deck parameter elsewhere means nothing.
  assert.equal(parseLink("https://kevinbryanecon.com/ModernSlides/").service, "kevinbryanecon.com");
  assert.equal(parseLink("https://kevinbryanecon.com/ModernSlides/").name, "");
  assert.equal(parseLink("https://example.com/slides/?deck=Talk").service, "example.com");
  assert.equal(parseLink("https://docs.google.com/presentation/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit").name, "");
});

test("only addresses on ordinary hosts are fetched directly", () => {
  assert.equal(parseLink("https://donbowen.github.io/PublicFiles/rd174_syracuse.pdf").direct, true);
  assert.equal(parseLink("https://docs.google.com/presentation/d/abcdefghijklmnopqrstuvwxyz/edit").direct, false);
  assert.equal(parseLink("https://www.canva.com/design/abc/view").direct, false);
});

test("an address naming a slide file is recognized", () => {
  assert.equal(looksLikeDeckFile(parseLink("https://example.org/talks/My%20talk.PPTX?dl=1")), true);
  assert.equal(looksLikeDeckFile(parseLink("https://example.org/talks/")), false);
});

test("a PDF is taken by its bytes, whatever the address calls it", async () => {
  serve(onePagePdf(), { "Content-Type": "application/octet-stream" });
  const file = await fetchLinkedFile(parseLink("https://example.org/download?id=7"));
  assert.equal(file.name, "download.pdf");
  serve(onePagePdf(), { "Content-Disposition": "attachment; filename=\"Keynote talk.pdf\"" });
  assert.equal((await fetchLinkedFile(parseLink("https://example.org/x"))).name, "Keynote talk.pdf");
});

test("a slide filename cannot turn an ordinary ZIP into a deck", async () => {
  const archive = zipSync({ "notes.txt": strToU8("There are no slides here.") });
  serve(archive, { "Content-Type": "application/octet-stream" });
  for (const extension of ["pptx", "ppt", "key", "zip"]) {
    await assert.rejects(fetchLinkedFile(parseLink(`https://example.org/talk.${extension}`)), NotADeckError);
  }
});

test("a PowerPoint package is recognized by its presentation part", async () => {
  serve(zipSync({ "[Content_Types].xml": strToU8("<Types/>"), "ppt/presentation.xml": strToU8("<p:presentation/>") }));
  for (const extension of ["pptx", "pptm", "ppsx", "ppsm"]) {
    assert.equal((await fetchLinkedFile(parseLink(`https://example.org/talk.${extension}`))).name, `talk.${extension}`);
  }
});

test("a Keynote package is recognized by its document entry", async () => {
  serve(zipSync({ "Index/Document.iwa": new Uint8Array([1]) }));
  assert.equal((await fetchLinkedFile(parseLink("https://example.org/talk.key"))).name, "talk.key");
});

test("a PDF signature alone does not pass validation", async () => {
  serve("%PDF-1.4\n%%EOF", { "Content-Type": "application/pdf" });
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/talk.pdf")), NotADeckError);
});

test("web pages, images and failed requests stay links", async () => {
  // A wrong answer will be wrong again; a failure might not be.
  serve("<!doctype html>", { "Content-Type": "text/html" });
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/talk.pdf")), NotADeckError);
  serve("not a pdf", { "Content-Type": "application/pdf" });
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/talk.pdf")), NotADeckError);
  globalThis.fetch = async () => new Response("", { status: 503 });
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/talk.pdf")),
    problem => !(problem instanceof NotADeckError));
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/talk.pdf")),
    problem => !(problem instanceof NotADeckError));
});
