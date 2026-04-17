import {
  jsonError,
  pdfResponse,
  readJsonField,
  readSinglePdf,
} from "@/lib/pdf-api-route-helpers";
import { deletePagesFromBuffer } from "@/lib/pdf-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { indices: number[] };

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const buf = await readSinglePdf(form);
    const body = readJsonField<Body>(form, "options");
    if (!Array.isArray(body.indices) || body.indices.length === 0) {
      return jsonError("Provide a non-empty indices array (0-based pages to delete).");
    }
    const indices = body.indices.map((n) => Math.floor(Number(n))).filter((n) => Number.isFinite(n) && n >= 0);
    if (indices.length === 0) return jsonError("Invalid page indices.");
    const out = await deletePagesFromBuffer(buf, indices);
    return pdfResponse(out, "edited.pdf");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "PAYLOAD_TOO_LARGE") {
      return jsonError(
        "File exceeds the server limit (~3.6MB). Use browser processing instead.",
        413,
      );
    }
    if (msg === "MISSING_FILE" || msg === "MISSING_JSON") {
      return jsonError(msg === "MISSING_FILE" ? "Missing PDF file." : "Missing options.", 400);
    }
    return jsonError(msg, 500);
  }
}
