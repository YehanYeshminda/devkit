import { filenameFromContentDisposition } from "@/lib/pdf-api-client";

export type PostImageOk = { ok: true; blob: Blob; filenameHint: string | null };
export type PostImageErr = { ok: false; status: number; message: string };
export type PostImageResult = PostImageOk | PostImageErr;

export async function postImageForm(apiPath: string, formData: FormData): Promise<PostImageResult> {
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
