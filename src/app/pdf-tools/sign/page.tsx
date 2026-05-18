"use client";

import * as React from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  Check,
  Download,
  Eye,
  FileSignature,
  FileText,
  Loader2,
  PenLine,
  RotateCcw,
  Type,
  Upload,
  X,
} from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (event) => res(event.target!.result as ArrayBuffer);
    reader.onerror = () => rej(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

function downloadBytes(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(
    new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type SignatureMode = "draw" | "type";
type PageSize = { width: number; height: number };

function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingRef = React.useRef(false);
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#111827";
  }, []);

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function commit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
        <canvas
          ref={canvasRef}
          width={900}
          height={260}
          className="h-44 w-full touch-none cursor-crosshair"
          onPointerDown={(event) => {
            drawingRef.current = true;
            lastPointRef.current = pointFromEvent(event);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drawingRef.current || !lastPointRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx) return;
            const point = pointFromEvent(event);
            ctx.beginPath();
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            lastPointRef.current = point;
          }}
          onPointerUp={(event) => {
            drawingRef.current = false;
            lastPointRef.current = null;
            event.currentTarget.releasePointerCapture(event.pointerId);
            commit();
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
            lastPointRef.current = null;
            commit();
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Draw with your mouse, trackpad, stylus, or finger.
        </p>
        <button
          type="button"
          onClick={clear}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.045] px-3 text-xs font-semibold text-muted-foreground transition hover:border-white/15 hover:bg-white/[0.08] hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Clear
        </button>
      </div>
      {value ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-300">
          <Check className="size-3.5" />
          Signature captured
        </p>
      ) : null}
    </div>
  );
}

function PlacementSheet({
  pageSize,
  pageNumber,
  pageCount,
  mode,
  drawnSignature,
  typedSignature,
  signatureWidth,
  xPercent,
  yPercent,
  onPlace,
}: {
  pageSize: PageSize | null;
  pageNumber: number;
  pageCount: number;
  mode: SignatureMode;
  drawnSignature: string;
  typedSignature: string;
  signatureWidth: number;
  xPercent: number;
  yPercent: number;
  onPlace: (next: { xPercent: number; yPercent: number }) => void;
}) {
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);

  const aspectRatio = pageSize ? `${pageSize.width} / ${pageSize.height}` : "8.5 / 11";
  const markerWidthPercent = pageSize
    ? Math.min(42, Math.max(12, (signatureWidth / pageSize.width) * 100))
    : 27;
  const markerHeightPercent =
    mode === "draw"
      ? markerWidthPercent * (260 / 900)
      : Math.max(5, markerWidthPercent * 0.24);
  const clampedX = Math.min(Math.max(xPercent, 0), 100 - markerWidthPercent);
  const clampedY = Math.min(Math.max(yPercent, 0), 100 - markerHeightPercent);
  const hasSignature = mode === "draw" ? Boolean(drawnSignature) : Boolean(typedSignature.trim());

  function placeFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const rect = sheet.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width) * 100 - markerWidthPercent / 2;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100 - markerHeightPercent / 2;
    onPlace({
      xPercent: Math.round(Math.min(Math.max(nextX, 0), 100 - markerWidthPercent)),
      yPercent: Math.round(Math.min(Math.max(nextY, 0), 100 - markerHeightPercent)),
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-card/55 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Signature placement</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click the sheet, or drag the signature marker where it should appear.
          </p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground">
          Page {pageCount ? pageNumber : "-"} of {pageCount || "-"}
        </span>
      </div>

      <div className="flex justify-center rounded-xl border border-white/10 bg-[#080a10] p-4">
        <div
          ref={sheetRef}
          role="button"
          tabIndex={0}
          aria-label="Place signature on page"
          onPointerDown={(event) => {
            draggingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            placeFromPointer(event);
          }}
          onPointerMove={(event) => {
            if (!draggingRef.current) return;
            placeFromPointer(event);
          }}
          onPointerUp={(event) => {
            draggingRef.current = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            draggingRef.current = false;
          }}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 5 : 1;
            if (event.key === "ArrowLeft") onPlace({ xPercent: clampedX - step, yPercent: clampedY });
            if (event.key === "ArrowRight") onPlace({ xPercent: clampedX + step, yPercent: clampedY });
            if (event.key === "ArrowUp") onPlace({ xPercent: clampedX, yPercent: clampedY - step });
            if (event.key === "ArrowDown") onPlace({ xPercent: clampedX, yPercent: clampedY + step });
          }}
          className="relative w-full max-w-[23rem] touch-none cursor-crosshair overflow-hidden rounded-lg bg-white shadow-[0_20px_70px_rgba(0,0,0,0.28)] outline-none ring-1 ring-white/10 focus-visible:ring-2 focus-visible:ring-primary/50"
          style={{ aspectRatio }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[length:10%_10%]" />
          <div className="absolute left-[8%] right-[8%] top-[12%] space-y-2">
            <div className="h-2 rounded bg-slate-300" />
            <div className="h-2 w-4/5 rounded bg-slate-200" />
            <div className="h-2 w-3/5 rounded bg-slate-200" />
          </div>
          <div className="absolute bottom-[12%] left-[8%] right-[8%] grid grid-cols-2 gap-6">
            <div className="border-b border-slate-300 pb-1 text-[10px] text-slate-400">Date</div>
            <div className="border-b border-slate-300 pb-1 text-[10px] text-slate-400">Signature</div>
          </div>
          <div
            className={cn(
              "absolute flex items-center justify-center rounded-md border-2 border-primary bg-primary/10 shadow-[0_10px_30px_rgba(99,102,241,0.22)]",
              hasSignature ? "border-solid" : "border-dashed",
            )}
            style={{
              left: `${clampedX}%`,
              top: `${clampedY}%`,
              width: `${markerWidthPercent}%`,
              height: `${markerHeightPercent}%`,
            }}
          >
            {mode === "draw" && drawnSignature ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={drawnSignature} alt="Signature marker" className="h-full w-full object-contain mix-blend-multiply" />
            ) : (
              <span className="max-w-full truncate px-1 font-serif text-sm italic text-slate-950">
                {mode === "type" && typedSignature.trim() ? typedSignature.trim() : "Signature"}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Keyboard tip: focus the sheet and use arrow keys for 1% nudges, Shift + arrow for 5%.
      </p>
    </div>
  );
}

export default function SignPdfPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [sourceBuffer, setSourceBuffer] = React.useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [pageSizes, setPageSizes] = React.useState<PageSize[]>([]);
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [signedUrl, setSignedUrl] = React.useState("");
  const [signedBytes, setSignedBytes] = React.useState<Uint8Array | null>(null);
  const [mode, setMode] = React.useState<SignatureMode>("draw");
  const [drawnSignature, setDrawnSignature] = React.useState("");
  const [typedSignature, setTypedSignature] = React.useState("");
  const [pageNumber, setPageNumber] = React.useState(1);
  const [xPercent, setXPercent] = React.useState(66);
  const [yPercent, setYPercent] = React.useState(72);
  const [signatureWidth, setSignatureWidth] = React.useState(160);
  const [includeDate, setIncludeDate] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedPageSize = pageSizes[pageNumber - 1] ?? null;

  React.useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (signedUrl) URL.revokeObjectURL(signedUrl);
    };
  }, [sourceUrl, signedUrl]);

  React.useEffect(() => {
    if (!signedUrl && !signedBytes && !done) return;
    if (signedUrl) URL.revokeObjectURL(signedUrl);
    setSignedUrl("");
    setSignedBytes(null);
    setDone(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    drawnSignature,
    typedSignature,
    pageNumber,
    xPercent,
    yPercent,
    signatureWidth,
    includeDate,
  ]);

  function replaceObjectUrl(setter: (value: string) => void, current: string, next: string) {
    if (current) URL.revokeObjectURL(current);
    setter(next);
  }

  async function handleFile(nextFile: File) {
    if (nextFile.type !== "application/pdf" && !nextFile.name.endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    setProcessing(false);
    setDone(false);
    setError("");
    setSignedBytes(null);
    if (signedUrl) {
      URL.revokeObjectURL(signedUrl);
      setSignedUrl("");
    }

    try {
      const buffer = await readAsArrayBuffer(nextFile);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const sizes = doc.getPages().map((page) => {
        const { width, height } = page.getSize();
        return { width, height };
      });
      setFile(nextFile);
      setSourceBuffer(buffer);
      setPageCount(doc.getPageCount());
      setPageSizes(sizes);
      setPageNumber(1);
      replaceObjectUrl(setSourceUrl, sourceUrl, URL.createObjectURL(nextFile));
    } catch {
      setError("Could not read this PDF. Try another file.");
    }
  }

  function clearFile() {
    setFile(null);
    setSourceBuffer(null);
    setPageCount(0);
    setPageSizes([]);
    setSignedBytes(null);
    setDone(false);
    setError("");
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (signedUrl) URL.revokeObjectURL(signedUrl);
    setSourceUrl("");
    setSignedUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function placeSignature(next: { xPercent: number; yPercent: number }) {
    const pageSize = selectedPageSize;
    const markerWidthPercent = pageSize
      ? Math.min(42, Math.max(12, (signatureWidth / pageSize.width) * 100))
      : 27;
    const markerHeightPercent =
      mode === "draw"
        ? markerWidthPercent * (260 / 900)
        : Math.max(5, markerWidthPercent * 0.24);
    setXPercent(Math.round(Math.min(Math.max(next.xPercent, 0), 100 - markerWidthPercent)));
    setYPercent(Math.round(Math.min(Math.max(next.yPercent, 0), 100 - markerHeightPercent)));
    setDone(false);
  }

  async function signPdf({ download }: { download: boolean }) {
    if (!file || !sourceBuffer) {
      setError("Upload a PDF first.");
      return;
    }
    if (mode === "draw" && !drawnSignature) {
      setError("Draw your signature first.");
      return;
    }
    if (mode === "type" && !typedSignature.trim()) {
      setError("Type your signature first.");
      return;
    }

    setProcessing(true);
    setDone(false);
    setError("");

    try {
      const doc = await PDFDocument.load(sourceBuffer, { ignoreEncryption: true });
      const page = doc.getPage(Math.min(pageNumber, doc.getPageCount()) - 1);
      const { width: pageWidth, height: pageHeight } = page.getSize();
      const x = (xPercent / 100) * pageWidth;
      const yFromTop = (yPercent / 100) * pageHeight;

      if (mode === "draw") {
        const image = await doc.embedPng(drawnSignature);
        const height = signatureWidth * (image.height / image.width);
        page.drawImage(image, {
          x: Math.min(x, pageWidth - signatureWidth - 18),
          y: Math.max(18, pageHeight - yFromTop - height),
          width: signatureWidth,
          height,
        });
      } else {
        const font = await doc.embedFont(StandardFonts.HelveticaOblique);
        const text = typedSignature.trim();
        const fontSize = Math.max(18, Math.min(34, signatureWidth / Math.max(text.length * 0.55, 5)));
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: Math.min(x, pageWidth - Math.min(textWidth, signatureWidth) - 18),
          y: Math.max(18, pageHeight - yFromTop - fontSize),
          size: fontSize,
          font,
          color: rgb(0.08, 0.09, 0.12),
          maxWidth: signatureWidth,
        });
      }

      if (includeDate) {
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const dateText = new Date().toLocaleDateString();
        page.drawText(dateText, {
          x: Math.min(x, pageWidth - 120),
          y: Math.max(8, pageHeight - yFromTop - 38),
          size: 10,
          font,
          color: rgb(0.25, 0.27, 0.32),
        });
      }

      const bytes = await doc.save();
      setSignedBytes(bytes);
      const nextUrl = URL.createObjectURL(
        new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }),
      );
      replaceObjectUrl(setSignedUrl, signedUrl, nextUrl);
      if (download) {
        downloadBytes(bytes, file.name.replace(/\.pdf$/i, "-signed.pdf"));
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign PDF.");
    } finally {
      setProcessing(false);
    }
  }

  const canSign =
    Boolean(file && sourceBuffer) &&
    (mode === "draw" ? Boolean(drawnSignature) : Boolean(typedSignature.trim()));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-7 sm:px-8 lg:px-10">
        <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/72 shadow-[0_18px_70px_rgba(0,0,0,0.22)]">
          <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                PDF Tools / Sign PDF
              </p>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <FileSignature className="size-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Sign PDF</h1>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Add a drawn or typed visual signature to a PDF form, preview the result, then download a signed copy.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 text-xs font-medium text-amber-200">
              Visual signature stamp, not a certificate signature
            </div>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-[#0b0d14]/90 p-4">
              <p className="text-xs font-medium text-muted-foreground">1. Upload form</p>
              <p className="mt-1 text-sm text-foreground">Open the PDF you need to sign.</p>
            </div>
            <div className="bg-[#0b0d14]/90 p-4">
              <p className="text-xs font-medium text-muted-foreground">2. Make signature</p>
              <p className="mt-1 text-sm text-foreground">Draw it or type your name.</p>
            </div>
            <div className="bg-[#0b0d14]/90 p-4">
              <p className="text-xs font-medium text-muted-foreground">3. Place and download</p>
              <p className="mt-1 text-sm text-foreground">Choose the page and position.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
          <div className="space-y-5">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const dropped = event.dataTransfer.files[0];
                if (dropped) handleFile(dropped);
              }}
              onClick={() => !file && inputRef.current?.click()}
              className={cn(
                "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
                file
                  ? "border-primary/35 bg-primary/[0.07]"
                  : "border-white/10 bg-white/[0.025] hover:border-primary/35 hover:bg-white/[0.045]",
              )}
            >
              {file ? (
                <div className="flex max-w-full items-center gap-3">
                  <FileText className="size-8 shrink-0 text-primary" />
                  <div className="min-w-0 text-left">
                    <p className="truncate font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.size)} · {pageCount} page{pageCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      clearFile();
                    }}
                    className="ml-2 rounded-md p-1 text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                    aria-label="Remove PDF"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.045]">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drop your PDF form here, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Your file is edited locally in the browser.</p>
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) handleFile(nextFile);
                }}
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-card/55 p-5">
              <div className="mb-4 flex gap-1 rounded-lg border border-white/10 bg-white/[0.025] p-1">
                <button
                  type="button"
                  onClick={() => setMode("draw")}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                    mode === "draw"
                      ? "bg-white/[0.11] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                  )}
                >
                  <PenLine className="size-4" />
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setMode("type")}
                  className={cn(
                    "flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                    mode === "type"
                      ? "bg-white/[0.11] text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                  )}
                >
                  <Type className="size-4" />
                  Type
                </button>
              </div>

              {mode === "draw" ? (
                <SignaturePad value={drawnSignature} onChange={setDrawnSignature} />
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Typed signature</label>
                  <input
                    value={typedSignature}
                    onChange={(event) => setTypedSignature(event.target.value)}
                    placeholder="Your name"
                    className="h-12 w-full rounded-lg border border-white/10 bg-[#080a10] px-3 text-lg text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-1 focus:ring-primary/35"
                  />
                  <div className="rounded-xl border border-white/10 bg-white p-5 text-center">
                    <span className="font-serif text-3xl italic text-slate-950">
                      {typedSignature || "Your signature"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <PlacementSheet
              pageSize={selectedPageSize}
              pageNumber={pageNumber}
              pageCount={pageCount}
              mode={mode}
              drawnSignature={drawnSignature}
              typedSignature={typedSignature}
              signatureWidth={signatureWidth}
              xPercent={xPercent}
              yPercent={yPercent}
              onPlace={placeSignature}
            />

            <div className="grid gap-4 rounded-xl border border-white/10 bg-card/55 p-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Page</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(pageCount, 1)}
                  value={pageNumber}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setPageNumber(Math.min(Math.max(next, 1), Math.max(pageCount, 1)));
                    setDone(false);
                  }}
                  className="h-11 w-full rounded-lg border border-white/10 bg-[#080a10] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/35"
                />
                <p className="text-xs text-muted-foreground">
                  {pageCount > 0 ? `${pageCount} pages available` : "Upload a PDF to detect pages"}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Signature width</label>
                <input
                  type="range"
                  min={80}
                  max={280}
                  value={signatureWidth}
                  onChange={(event) => {
                    setSignatureWidth(Number(event.target.value));
                    setDone(false);
                  }}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">{signatureWidth} pt wide</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Horizontal position</label>
                <input
                  type="range"
                  min={3}
                  max={90}
                  value={xPercent}
                  onChange={(event) => placeSignature({ xPercent: Number(event.target.value), yPercent })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">{xPercent}% from left</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Vertical position</label>
                <input
                  type="range"
                  min={5}
                  max={92}
                  value={yPercent}
                  onChange={(event) => placeSignature({ xPercent, yPercent: Number(event.target.value) })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">{yPercent}% from top</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(event) => setIncludeDate(event.target.checked)}
                  className="size-4 rounded border-white/10 accent-primary"
                />
                Add today&apos;s date under the signature
              </label>
            </div>

            {error ? (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                {error}
              </p>
            ) : null}

            {done ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
                <Check className="size-4" />
                Signed PDF is ready.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => signPdf({ download: false })}
                disabled={processing || !canSign}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition disabled:opacity-45",
                  canSign && !processing
                    ? "border-white/10 bg-white/[0.045] text-muted-foreground hover:border-white/15 hover:bg-white/[0.08] hover:text-foreground"
                    : "border-white/10 bg-white/[0.035] text-muted-foreground",
                )}
              >
                {processing ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                Preview signed PDF
              </button>
              <button
                type="button"
                onClick={() =>
                  signedBytes
                    ? downloadBytes(signedBytes, file!.name.replace(/\.pdf$/i, "-signed.pdf"))
                    : signPdf({ download: true })
                }
                disabled={processing || !canSign}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:opacity-45",
                  canSign && !processing
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    : "bg-white/[0.06] text-muted-foreground",
                )}
              >
                {processing ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Download signed PDF
              </button>
            </div>
          </div>

          <div className="sticky top-20 h-[calc(100vh-6rem)] min-h-[520px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/80 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.035] px-3 py-2.5">
                <Eye className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {signedUrl ? "Signed preview" : "PDF preview"}
                </span>
              </div>
              {signedUrl || sourceUrl ? (
                <iframe
                  src={signedUrl || sourceUrl}
                  title="PDF preview"
                  className="min-h-0 flex-1"
                  style={{ border: "none" }}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <FileText className="mx-auto size-9 text-muted-foreground/60" />
                    <p className="mt-3 text-sm font-medium text-foreground">Upload a PDF to preview it here.</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      After signing, this panel updates to the signed copy.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
