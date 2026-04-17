import {
  jsonError,
  pdfResponse,
  readJsonField,
  readSinglePdf,
} from "@/lib/pdf-api-route-helpers";
import { rotatePdfBuffer } from "@/lib/pdf-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RotateOpts = {
  rotateAll: boolean;
  selected0Based: number[];
  delta: number;
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const buf = await readSinglePdf(form);
    const opts = readJsonField<RotateOpts>(form, "options");
    if (typeof opts.rotateAll !== "boolean" || typeof opts.delta !== "number" || !Array.isArray(opts.selected0Based)) {
      return jsonError("Invalid options payload.");
    }
    if (!opts.rotateAll && opts.selected0Based.length === 0) {
      return jsonError("Select at least one page, or choose all pages.");
    }
    const out = await rotatePdfBuffer(buf, {
      rotateAll: opts.rotateAll,
      selected0Based: opts.selected0Based.map((n) => Math.floor(Number(n))).filter((n) => Number.isFinite(n)),
      delta: opts.delta,
    });
    return pdfResponse(out, "rotated.pdf");
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
