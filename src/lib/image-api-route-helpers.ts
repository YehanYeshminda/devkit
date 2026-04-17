import { NextResponse } from "next/server";

import { MAX_IMAGE_API_BODY_BYTES } from "@/lib/image-api-constants";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function imageResponse(buffer: Buffer, contentType: string, filename: string) {
  const safeName = filename.replace(/"/g, "");
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function readSingleImage(formData: FormData): Promise<Buffer> {
  const f = formData.get("file");
  if (!(f instanceof Blob)) throw new Error("MISSING_FILE");
  const buf = Buffer.from(await f.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_API_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
  return buf;
}
