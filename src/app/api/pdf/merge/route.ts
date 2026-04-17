import {
  jsonError,
  pdfResponse,
  readMultipartPdfs,
} from "@/lib/pdf-api-route-helpers";
import { mergePdfsFromBuffers } from "@/lib/pdf-ops";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const bufs = await readMultipartPdfs(form);
    if (bufs.length < 2) return jsonError("At least two PDF files are required.");
    const out = await mergePdfsFromBuffers(bufs);
    return pdfResponse(out, "merged.pdf");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "PAYLOAD_TOO_LARGE") {
      return jsonError(
        "Total upload exceeds the server limit (~3.6MB). Use smaller files or browser processing.",
        413,
      );
    }
    return jsonError(msg, 500);
  }
}
