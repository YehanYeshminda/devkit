import {
  canDecodeBase64ToPdfOnServer,
  canEncodePdfToBase64OnServer,
  MAX_B64_TO_PDF_API_CHARS,
  MAX_PDF_TO_B64_API_FILE_BYTES,
} from "@/lib/pdf-api-constants";
import {
  filenameFromContentDisposition,
  type PostPdfFormResult,
  shouldFallbackToClientPdf,
} from "@/lib/pdf-api-client";

export {
  canDecodeBase64ToPdfOnServer,
  canEncodePdfToBase64OnServer,
  MAX_B64_TO_PDF_API_CHARS,
  MAX_PDF_TO_B64_API_FILE_BYTES,
  shouldFallbackToClientPdf,
};

export type PdfToBase64Result =
  | { ok: true; base64: string }
  | { ok: false; status: number; message: string };

export async function postPdfToBase64Api(file: File): Promise<PdfToBase64Result> {
  const fd = new FormData();
  fd.append("file", file);
  let res: Response;
  try {
    res = await fetch("/api/converters/pdf-to-base64", { method: "POST", body: fd });
  } catch {
    return { ok: false, status: 0, message: "Network error" };
  }
  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok) {
    let message = res.statusText;
    if (ct.includes("application/json")) {
      try {
        const j = (await res.json()) as { error?: string };
        if (typeof j.error === "string") message = j.error;
      } catch {
        // ignore
      }
    }
    return { ok: false, status: res.status, message };
  }
  try {
    const data = (await res.json()) as { base64?: string };
    if (typeof data.base64 !== "string") {
      return { ok: false, status: 500, message: "Invalid server response." };
    }
    return { ok: true, base64: data.base64 };
  } catch {
    return { ok: false, status: 500, message: "Invalid server response." };
  }
}

export async function postBase64ToPdfApi(
  base64: string,
  filenameStem: string,
): Promise<PostPdfFormResult> {
  let res: Response;
  try {
    res = await fetch("/api/converters/base64-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64,
        filename: filenameStem.replace(/\.pdf$/i, "").replace(/[/\\?%*:|"<>]/g, "-").slice(0, 120),
      }),
    });
  } catch {
    return { ok: false, status: 0, message: "Network error" };
  }
  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok) {
    let message = res.statusText;
    if (ct.includes("application/json")) {
      try {
        const j = (await res.json()) as { error?: string };
        if (typeof j.error === "string") message = j.error;
      } catch {
        // ignore
      }
    }
    return { ok: false, status: res.status, message };
  }
  const blob = await res.blob();
  return {
    ok: true,
    blob,
    filenameHint: filenameFromContentDisposition(res.headers.get("Content-Disposition")),
  };
}
