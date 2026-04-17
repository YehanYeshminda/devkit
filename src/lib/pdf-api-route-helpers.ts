import { NextResponse } from "next/server";

import { MAX_PDF_API_BODY_BYTES } from "@/lib/pdf-api-constants";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function pdfResponse(bytes: Uint8Array, filename: string) {
  const body = new Uint8Array(bytes);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}

export function zipResponse(bytes: Uint8Array, filename: string) {
  const body = new Uint8Array(bytes);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function readMultipartPdfs(formData: FormData): Promise<Uint8Array[]> {
  const raw = formData.getAll("file");
  const out: Uint8Array[] = [];
  let total = 0;
  for (const item of raw) {
    if (!(item instanceof Blob)) continue;
    const buf = new Uint8Array(await item.arrayBuffer());
    total += buf.byteLength;
    if (total > MAX_PDF_API_BODY_BYTES) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    out.push(buf);
  }
  return out;
}

export async function readSinglePdf(formData: FormData): Promise<Uint8Array> {
  const f = formData.get("file");
  if (!(f instanceof Blob)) throw new Error("MISSING_FILE");
  const buf = new Uint8Array(await f.arrayBuffer());
  if (buf.byteLength > MAX_PDF_API_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  return buf;
}

export function readJsonField<T>(formData: FormData, key: string): T {
  const s = formData.get(key);
  if (typeof s !== "string" || !s.trim()) throw new Error("MISSING_JSON");
  return JSON.parse(s) as T;
}
