import {
  jsonError,
  pdfResponse,
} from "@/lib/pdf-api-route-helpers";
import { normalizePdfBase64Input } from "@/lib/base64-pdf-server";
import {
  MAX_B64_TO_PDF_API_CHARS,
  MAX_PDF_API_BODY_BYTES,
} from "@/lib/pdf-api-constants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  base64?: string;
  filename?: string;
};

export async function POST(req: Request) {
  const cl = req.headers.get("content-length");
  if (cl && Number(cl) > MAX_PDF_API_BODY_BYTES) {
    return jsonError("Request body too large for server processing.", 413);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const raw = typeof body.base64 === "string" ? body.base64 : "";
  const b64 = normalizePdfBase64Input(raw);
  if (!b64) return jsonError("Missing or empty base64 field.", 400);
  if (b64.length > MAX_B64_TO_PDF_API_CHARS) {
    return jsonError(
      "Base64 string too large for server processing. Use browser download or shorten the input.",
      413,
    );
  }

  let decoded: Buffer;
  try {
    decoded = Buffer.from(b64, "base64");
  } catch {
    return jsonError("Invalid Base64 encoding.", 400);
  }

  if (decoded.length === 0) return jsonError("Decoded PDF is empty.", 400);
  if (decoded.length > MAX_PDF_API_BODY_BYTES) {
    return jsonError("Decoded PDF exceeds server size limit.", 413);
  }

  const head = decoded.subarray(0, Math.min(5, decoded.length)).toString("ascii");
  if (head !== "%PDF-") {
    return jsonError("Decoded data is not a PDF (missing %PDF- header).", 400);
  }

  const stem =
    typeof body.filename === "string" && body.filename.trim()
      ? body.filename.trim().replace(/[/\\?%*:|"<>]/g, "-").slice(0, 120)
      : "output";
  const safeName = stem.toLowerCase().endsWith(".pdf") ? stem : `${stem}.pdf`;

  return pdfResponse(new Uint8Array(decoded), safeName);
}
