import {
  jsonError,
  pdfResponse,
  readJsonField,
  readSinglePdf,
} from "@/lib/pdf-api-route-helpers";
import { compressPdfBuffer } from "@/lib/pdf-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type CompressOpts = {
  removeMetadata: boolean;
  useObjectStreams: boolean;
};

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const buf = await readSinglePdf(form);
    const opts = readJsonField<CompressOpts>(form, "options");
    if (typeof opts.removeMetadata !== "boolean" || typeof opts.useObjectStreams !== "boolean") {
      return jsonError("Invalid options payload.");
    }
    const out = await compressPdfBuffer(buf, opts);
    return pdfResponse(out, "compressed.pdf");
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
