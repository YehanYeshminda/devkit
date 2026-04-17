"use client";

import * as React from "react";
import { Download, Loader2, Upload } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { canvasCropImage, downloadImageBlob } from "@/lib/image-canvas";
import { postImageForm } from "@/lib/image-api-client";
import {
  canUseImageApi,
  MAX_IMAGE_API_BODY_BYTES,
  MAX_IMAGE_PIXELS,
  MAX_IMAGE_SIDE,
} from "@/lib/image-api-constants";
import { shouldFallbackToClientPdf } from "@/lib/pdf-api-client";
import { cn } from "@/lib/utils";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

export default function CropImagePage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [stem, setStem] = React.useState("image");
  const [dims, setDims] = React.useState<{ w: number; h: number } | null>(null);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [cw, setCw] = React.useState(100);
  const [ch, setCh] = React.useState(100);
  const [localOnly, setLocalOnly] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!file) {
      setDims(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setDims({ w, h });
      setLeft(0);
      setTop(0);
      setCw(Math.min(w, MAX_IMAGE_SIDE));
      setCh(Math.min(h, MAX_IMAGE_SIDE));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setDims(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file]);

  function pickFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setFile(f);
    setStem(f.name.replace(/\.[^.]+$/, "") || "image");
  }

  async function process() {
    if (!file || !dims) return;
    const l = Math.floor(left);
    const t = Math.floor(top);
    const w = Math.floor(cw);
    const h = Math.floor(ch);
    if (l < 0 || t < 0 || w < 1 || h < 1 || w > MAX_IMAGE_SIDE || h > MAX_IMAGE_SIDE) {
      setError("Invalid crop rectangle.");
      return;
    }
    if (l + w > dims.w || t + h > dims.h) {
      setError(`Crop must fit within image (${dims.w}×${dims.h}).`);
      return;
    }
    setProcessing(true);
    setError("");
    try {
      if (!localOnly && canUseImageApi(file.size)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append(
          "options",
          JSON.stringify({
            left: l,
            top: t,
            width: w,
            height: h,
            filename: stem,
          }),
        );
        const api = await postImageForm("/api/image/crop", fd);
        if (api.ok) {
          downloadImageBlob(api.blob, api.filenameHint ?? `${stem}-cropped.png`);
          return;
        }
        if (!shouldFallbackToClientPdf(api.status)) {
          setError(api.message);
          return;
        }
      }
      const blob = await canvasCropImage(file, { left: l, top: t, width: w, height: h });
      downloadImageBlob(blob, `${stem}-cropped.png`);
    } catch (e) {
      setError(String(e));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <p className="mb-1.5 text-xs text-muted-foreground">Image Tools / Crop</p>
        <h1 className="text-2xl font-semibold tracking-tight">Crop image</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose pixel coordinates for the output. Output is PNG. Same server limits as resize (~
          {formatBytes(MAX_IMAGE_API_BODY_BYTES)} upload, ~{Math.round(MAX_IMAGE_PIXELS / 1_000_000)}M pixels).
        </p>

        <div className="mt-6 space-y-5 rounded-xl border border-white/10 bg-card/60 p-6 lg:p-8">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={localOnly}
              onChange={(e) => setLocalOnly(e.target.checked)}
              className="mt-0.5 accent-[#6366f1]"
            />
            <span>
              <span className="font-medium text-foreground">Process locally only</span> — do not upload to the server
            </span>
          </label>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) pickFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              file
                ? "border-[#6366f1]/40 bg-[#6366f1]/[0.04]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
            )}
          >
            <Upload className="size-7 text-muted-foreground" />
            {file ? (
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  {dims ? ` · ${dims.w}×${dims.h}px` : ""}
                </p>
              </div>
            ) : (
              <p className="text-sm font-medium text-foreground">Drop an image, or click to browse</p>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickFile(f);
              }}
            />
          </div>

          {dims && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Left (px)</label>
                <input
                  type="number"
                  min={0}
                  max={dims.w - 1}
                  value={left}
                  onChange={(e) => setLeft(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Top (px)</label>
                <input
                  type="number"
                  min={0}
                  max={dims.h - 1}
                  value={top}
                  onChange={(e) => setTop(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  max={Math.min(MAX_IMAGE_SIDE, dims.w - left)}
                  value={cw}
                  onChange={(e) => setCw(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  max={Math.min(MAX_IMAGE_SIDE, dims.h - top)}
                  value={ch}
                  onChange={(e) => setCh(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/10"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={process}
            disabled={processing || !file || !dims}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors",
              file && dims && !processing
                ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]"
                : "bg-white/[0.06] text-muted-foreground",
            )}
          >
            {processing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <Download className="size-4" /> Crop & download
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
