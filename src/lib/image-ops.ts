import sharp from "sharp";

import {
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_SIDE,
} from "@/lib/image-api-constants";

function assertSide(n: number, label: string) {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > MAX_IMAGE_SIDE) {
    throw new Error(`INVALID_${label}`);
  }
}

function assertInputPixels(meta: sharp.Metadata) {
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < 1 || h < 1) throw new Error("BAD_IMAGE");
  if (w * h > MAX_IMAGE_PIXELS) throw new Error("IMAGE_TOO_LARGE");
}

export type ResizeFit = "contain" | "cover" | "fill";

export async function sharpResize(
  input: Buffer,
  opts: {
    width: number;
    height: number;
    fit: ResizeFit;
    withoutEnlargement?: boolean;
    format?: "png" | "jpeg" | "webp";
    quality?: number;
  },
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  assertSide(opts.width, "WIDTH");
  assertSide(opts.height, "HEIGHT");

  const img = sharp(input, {
    failOn: "truncated",
    limitInputPixels: MAX_IMAGE_PIXELS,
  });
  const meta = await img.metadata();
  assertInputPixels(meta);

  const pipe: sharp.Sharp = img.resize({
    width: opts.width,
    height: opts.height,
    fit: opts.fit,
    withoutEnlargement: opts.withoutEnlargement ?? false,
  });

  const format = opts.format ?? "png";
  const q = Math.min(100, Math.max(1, Math.round(opts.quality ?? 90)));

  if (format === "jpeg") {
    const buffer = await pipe.jpeg({ quality: q, mozjpeg: true }).toBuffer();
    return { buffer, contentType: "image/jpeg", ext: "jpg" };
  }
  if (format === "webp") {
    const buffer = await pipe.webp({ quality: q }).toBuffer();
    return { buffer, contentType: "image/webp", ext: "webp" };
  }
  const buffer = await pipe.png({ compressionLevel: 9 }).toBuffer();
  return { buffer, contentType: "image/png", ext: "png" };
}

export async function sharpCrop(
  input: Buffer,
  opts: { left: number; top: number; width: number; height: number },
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  assertSide(opts.width, "CROP_W");
  assertSide(opts.height, "CROP_H");
  if (!Number.isFinite(opts.left) || !Number.isFinite(opts.top) || opts.left < 0 || opts.top < 0) {
    throw new Error("INVALID_CROP_ORIGIN");
  }
  if (!Number.isInteger(opts.left) || !Number.isInteger(opts.top)) {
    throw new Error("CROP_ORIGIN_INTEGER");
  }

  const img = sharp(input, {
    failOn: "truncated",
    limitInputPixels: MAX_IMAGE_PIXELS,
  });
  const meta = await img.metadata();
  assertInputPixels(meta);
  const iw = meta.width ?? 0;
  const ih = meta.height ?? 0;
  if (opts.left + opts.width > iw || opts.top + opts.height > ih) {
    throw new Error("CROP_OUT_OF_BOUNDS");
  }

  const buffer = await img
    .extract({
      left: opts.left,
      top: opts.top,
      width: opts.width,
      height: opts.height,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { buffer, contentType: "image/png", ext: "png" };
}

export type ConvertFormat = "png" | "jpeg" | "webp";

export async function sharpConvert(
  input: Buffer,
  opts: { format: ConvertFormat; quality?: number },
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const img = sharp(input, {
    failOn: "truncated",
    limitInputPixels: MAX_IMAGE_PIXELS,
  });
  const meta = await img.metadata();
  assertInputPixels(meta);

  const q = Math.min(100, Math.max(1, Math.round(opts.quality ?? 90)));

  if (opts.format === "jpeg") {
    const buffer = await img.jpeg({ quality: q, mozjpeg: true }).toBuffer();
    return { buffer, contentType: "image/jpeg", ext: "jpg" };
  }
  if (opts.format === "webp") {
    const buffer = await img.webp({ quality: q }).toBuffer();
    return { buffer, contentType: "image/webp", ext: "webp" };
  }
  const buffer = await img.png({ compressionLevel: 9 }).toBuffer();
  return { buffer, contentType: "image/png", ext: "png" };
}
