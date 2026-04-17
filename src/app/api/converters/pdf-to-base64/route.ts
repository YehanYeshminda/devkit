import { NextResponse } from "next/server";

import { MAX_PDF_TO_B64_API_FILE_BYTES } from "@/lib/pdf-api-constants";
import { jsonError, readSinglePdf } from "@/lib/pdf-api-route-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const buf = await readSinglePdf(form);
    if (buf.byteLength > MAX_PDF_TO_B64_API_FILE_BYTES) {
      return jsonError(
        "PDF too large for server encoding (response size limit). Use browser encoding or a smaller file.",
        413,
      );
    }
    if (buf.byteLength >= 5) {
      const head = new TextDecoder("ascii", { fatal: false }).decode(buf.subarray(0, 5));
      if (head !== "%PDF-") {
        return jsonError("Uploaded file does not look like a PDF.", 400);
      }
    }
    const base64 = Buffer.from(buf).toString("base64");
    return NextResponse.json(
      { base64 },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "PAYLOAD_TOO_LARGE") {
      return jsonError(
        "File exceeds the server upload limit (~3.6MB). Use browser processing.",
        413,
      );
    }
    if (msg === "MISSING_FILE") return jsonError("Missing PDF file.", 400);
    return jsonError(msg, 500);
  }
}
