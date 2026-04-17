import { MAX_PDF_API_BODY_BYTES, sumFileSizes } from "@/lib/pdf-api-constants";

export { MAX_PDF_API_BODY_BYTES, sumFileSizes };

export function canUsePdfApi(totalBytes: number): boolean {
  return totalBytes > 0 && totalBytes <= MAX_PDF_API_BODY_BYTES;
}

export type PostPdfFormOk = { ok: true; blob: Blob; filenameHint: string | null };
export type PostPdfFormErr = { ok: false; status: number; message: string };
export type PostPdfFormResult = PostPdfFormOk | PostPdfFormErr;

export function filenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;\s]+)/i.exec(cd);
  const raw = m?.[1] ?? m?.[2] ?? m?.[3];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.replace(/"/g, ""));
  } catch {
    return raw.replace(/"/g, "");
  }
}

/** When true, caller may retry with client-side pdf-lib (e.g. payload over server limit). */
export function shouldFallbackToClientPdf(status: number): boolean {
  return status === 413 || status === 502 || status === 503 || status >= 504 || status === 0;
}

export async function postPdfForm(apiPath: string, formData: FormData): Promise<PostPdfFormResult> {
  let res: Response;
  try {
    res = await fetch(apiPath, { method: "POST", body: formData });
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

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
