import { PDFDocument, degrees } from "pdf-lib";
import { zipSync } from "fflate";

export async function mergePdfsFromBuffers(buffers: Uint8Array[]): Promise<Uint8Array> {
  if (buffers.length < 2) throw new Error("At least two PDFs required.");
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

export async function compressPdfBuffer(
  buf: Uint8Array,
  opts: { removeMetadata: boolean; useObjectStreams: boolean },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  if (opts.removeMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
    doc.setCreationDate(new Date(0));
    doc.setModificationDate(new Date(0));
  }
  return doc.save({ useObjectStreams: opts.useObjectStreams });
}

export async function rotatePdfBuffer(
  buf: Uint8Array,
  opts: { rotateAll: boolean; selected0Based: number[]; delta: number },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pages = doc.getPages();
  const selected = new Set(opts.selected0Based);
  const targets = opts.rotateAll ? pages : pages.filter((_, i) => selected.has(i));
  targets.forEach((page) => {
    const cur = page.getRotation().angle;
    page.setRotation(degrees((cur + opts.delta) % 360));
  });
  return doc.save();
}

export async function deletePagesFromBuffer(buf: Uint8Array, delete0Based: number[]): Promise<Uint8Array> {
  if (delete0Based.length === 0) throw new Error("No pages to delete.");
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const n = doc.getPageCount();
  if (delete0Based.length >= n) throw new Error("Cannot delete all pages.");
  const toDelete = [...delete0Based].sort((a, b) => b - a);
  toDelete.forEach((i) => doc.removePage(i));
  return doc.save();
}

export async function extractPagesFromBuffer(buf: Uint8Array, keep0Based: number[]): Promise<Uint8Array> {
  if (keep0Based.length === 0) throw new Error("No pages selected.");
  const newDoc = await PDFDocument.create();
  const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const indices = [...keep0Based].sort((a, b) => a - b);
  const copied = await newDoc.copyPages(srcDoc, indices);
  copied.forEach((p) => newDoc.addPage(p));
  return newDoc.save();
}

/** Each entry is 0-based page indices for one output PDF. */
export async function splitPdfToZip(
  buf: Uint8Array,
  parts: number[][],
  baseName: string,
): Promise<Uint8Array> {
  if (!parts.length) throw new Error("No split parts.");
  const safeBase = baseName.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 80) || "document";
  const entries: Record<string, Uint8Array> = {};
  const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });

  for (let i = 0; i < parts.length; i++) {
    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, parts[i]);
    copied.forEach((p) => newDoc.addPage(p));
    const bytes = await newDoc.save();
    entries[`${safeBase}-part${i + 1}.pdf`] = bytes;
  }

  return zipSync(entries, { level: 6 });
}
