import {
  jsonError,
  readJsonField,
  readSinglePdf,
  zipResponse,
} from "@/lib/pdf-api-route-helpers";
import { splitPdfToZip } from "@/lib/pdf-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { baseName: string; parts: number[][] };

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const buf = await readSinglePdf(form);
    const body = readJsonField<Body>(form, "options");
    if (typeof body.baseName !== "string" || !Array.isArray(body.parts) || body.parts.length === 0) {
      return jsonError("Invalid split payload (baseName and parts required).");
    }
    const parts = body.parts.map((p) =>
      Array.isArray(p)
        ? p.map((n) => Math.floor(Number(n))).filter((n) => Number.isFinite(n) && n >= 0)
        : [],
    );
    if (parts.some((p) => p.length === 0)) {
      return jsonError("Each split part must include at least one page index.");
    }
    const zipBytes = await splitPdfToZip(buf, parts, body.baseName);
    const safe = body.baseName.replace(/[/\\?%*:|"<>]/g, "-").slice(0, 40) || "document";
    return zipResponse(zipBytes, `${safe}-split.zip`);
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
