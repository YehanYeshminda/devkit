import { readJsonField } from "@/lib/pdf-api-route-helpers";
import {
  imageResponse,
  jsonError,
  readSingleImage,
} from "@/lib/image-api-route-helpers";
import { sharpCrop } from "@/lib/image-ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Options = {
  left: number;
  top: number;
  width: number;
  height: number;
  filename?: string;
};

function safeStem(raw: string | undefined, fallback: string) {
  const t = (typeof raw === "string" && raw.trim() ? raw.trim() : fallback)
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\.(png|jpe?g|webp|gif)$/i, "")
    .slice(0, 80);
  return t || fallback;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const input = await readSingleImage(form);
    const opts = readJsonField<Options>(form, "options");
    const out = await sharpCrop(input, {
      left: Math.floor(Number(opts.left)),
      top: Math.floor(Number(opts.top)),
      width: Math.floor(Number(opts.width)),
      height: Math.floor(Number(opts.height)),
    });
    const stem = safeStem(opts.filename, "image");
    return imageResponse(out.buffer, out.contentType, `${stem}-cropped.${out.ext}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "PAYLOAD_TOO_LARGE") {
      return jsonError("File exceeds the server upload limit (~3.6MB). Use local processing.", 413);
    }
    if (msg === "MISSING_FILE" || msg === "MISSING_JSON") {
      return jsonError(msg === "MISSING_FILE" ? "Missing image file." : "Missing options.", 400);
    }
    if (msg === "CROP_OUT_OF_BOUNDS") {
      return jsonError("Crop rectangle is outside image bounds.", 400);
    }
    if (msg === "CROP_ORIGIN_INTEGER") {
      return jsonError("Crop left and top must be whole pixels.", 400);
    }
    if (msg === "IMAGE_TOO_LARGE" || /Input image exceeds|pixel limit/i.test(msg)) {
      return jsonError("Image is too large (pixels) for server processing.", 413);
    }
    if (msg.startsWith("INVALID_") || msg === "BAD_IMAGE") {
      return jsonError("Invalid image or crop parameters.", 400);
    }
    return jsonError(msg, 500);
  }
}
