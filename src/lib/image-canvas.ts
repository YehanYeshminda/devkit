export type ResizeFit = "contain" | "cover" | "fill";

function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/png",
    );
  });
}

export async function canvasResizeImage(
  file: File,
  opts: { width: number; height: number; fit: ResizeFit; withoutEnlargement: boolean },
): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const sw = bmp.width;
  const sh = bmp.height;
  const dw = opts.width;
  const dh = opts.height;

  try {
    if (opts.fit === "fill") {
      const canvas = document.createElement("canvas");
      canvas.width = dw;
      canvas.height = dh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2D context");
      ctx.drawImage(bmp, 0, 0, sw, sh, 0, 0, dw, dh);
      return await toPngBlob(canvas);
    }

    if (opts.fit === "contain") {
      let s = Math.min(dw / sw, dh / sh);
      if (opts.withoutEnlargement) s = Math.min(s, 1);
      const cw = Math.max(1, Math.round(sw * s));
      const ch = Math.max(1, Math.round(sh * s));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No 2D context");
      ctx.drawImage(bmp, 0, 0, sw, sh, 0, 0, cw, ch);
      return await toPngBlob(canvas);
    }

    // cover
    let s = Math.max(dw / sw, dh / sh);
    if (opts.withoutEnlargement) s = Math.min(s, 1);
    const rw = sw * s;
    const rh = sh * s;
    const canvas = document.createElement("canvas");
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    ctx.drawImage(bmp, 0, 0, sw, sh, (dw - rw) / 2, (dh - rh) / 2, rw, rh);
    return await toPngBlob(canvas);
  } finally {
    bmp.close();
  }
}

export async function canvasCropImage(
  file: File,
  opts: { left: number; top: number; width: number; height: number },
): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = opts.width;
    canvas.height = opts.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    ctx.drawImage(bmp, opts.left, opts.top, opts.width, opts.height, 0, 0, opts.width, opts.height);
    return await toPngBlob(canvas);
  } finally {
    bmp.close();
  }
}

export type CanvasConvertFormat = "png" | "jpeg" | "webp";

export async function canvasConvertImage(
  file: File,
  opts: { format: CanvasConvertFormat; quality: number },
): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2D context");
    ctx.drawImage(bmp, 0, 0);
    const mime =
      opts.format === "jpeg" ? "image/jpeg" : opts.format === "webp" ? "image/webp" : "image/png";
    const q = Math.min(1, Math.max(0.05, opts.quality));
    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
        mime,
        opts.format === "png" ? undefined : q,
      );
    });
  } finally {
    bmp.close();
  }
}

export function downloadImageBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
