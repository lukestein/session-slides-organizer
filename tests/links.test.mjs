import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchLinkedFile, looksLikeDeckFile, NotADeckError, parseLink } from "../docs/links.mjs";

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

function serve(body, headers = {}) {
  globalThis.fetch = async () => new Response(body, { headers });
}

const pdfBytes = "%PDF-1.4\n%%EOF";
const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0]);

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
  serve(pdfBytes, { "Content-Type": "application/octet-stream" });
  const file = await fetchLinkedFile(parseLink("https://example.org/download?id=7"));
  assert.equal(file.name, "download.pdf");
  serve(pdfBytes, { "Content-Disposition": "attachment; filename=\"Keynote talk.pdf\"" });
  assert.equal((await fetchLinkedFile(parseLink("https://example.org/x"))).name, "Keynote talk.pdf");
});

test("a PowerPoint file needs both its name and a matching package", async () => {
  serve(zipBytes, { "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
  assert.equal((await fetchLinkedFile(parseLink("https://example.org/talk.pptx"))).name, "talk.pptx");
  serve(zipBytes);
  await assert.rejects(fetchLinkedFile(parseLink("https://example.org/archive.zip")));
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
