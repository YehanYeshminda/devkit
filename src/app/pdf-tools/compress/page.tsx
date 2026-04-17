"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Check, Download, FileText, Loader2, Upload, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { canUsePdfApi, postPdfForm, shouldFallbackToClientPdf } from "@/lib/pdf-api-client";
import { cn } from "@/lib/utils";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target!.result as ArrayBuffer);
    r.onerror = () => rej(new Error("Read error"));
    r.readAsArrayBuffer(file);
  });
}

function downloadPdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function SizeBar({ original, compressed }: { original: number; compressed: number }) {
  const ratio = original > 0 ? compressed / original : 1;
  const saved = original - compressed;
  const pct = ((1 - ratio) * 100).toFixed(1);
  const isSmaller = compressed < original;

  return (
    <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-xs text-muted-foreground">Original size</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">{formatBytes(original)}</p>
        </div>
        <div className={cn("rounded-lg border p-3", isSmaller ? "border-emerald-500/20 bg-emerald-500/[0.06]" : "border-white/10 bg-white/[0.02]")}>
          <p className="text-xs text-muted-foreground">Compressed size</p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", isSmaller ? "text-emerald-400" : "")}>{formatBytes(compressed)}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">
          {isSmaller ? `Saved ${formatBytes(saved)} — ${pct}% smaller` : "No reduction achieved (PDF may already be optimised or is image-heavy)"}
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full transition-all", isSmaller ? "bg-emerald-500" : "bg-white/20")} style={{ width: `${Math.max(2, (1 - ratio) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function CompressPdfPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [sourceBuf, setSourceBuf] = React.useState<ArrayBuffer | null>(null);
  const [removeMetadata, setRemoveMetadata] = React.useState(true);
  const [useObjectStreams, setUseObjectStreams] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [result, setResult] = React.useState<{ bytes: Uint8Array; size: number } | null>(null);
  const [error, setError] = React.useState("");

  function clearFile() {
    setFile(null); setSourceBuf(null); setResult(null); setError("");
  }

  async function handleFile(f: File) {
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF."); return; }
    setError(""); setResult(null); setFile(f);
    try {
      const buf = await readAsArrayBuffer(f);
      setSourceBuf(buf);
    } catch { setError("Failed to read PDF."); }
  }

  async function compress() {
    if (!sourceBuf || !file) return;
    setProcessing(true); setError(""); setResult(null);
    try {
      if (canUsePdfApi(file.size)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("options", JSON.stringify({ removeMetadata, useObjectStreams }));
        const api = await postPdfForm("/api/pdf/compress", fd);
        if (api.ok) {
          const ab = await api.blob.arrayBuffer();
          const bytes = new Uint8Array(ab);
          setResult({ bytes, size: bytes.byteLength });
          return;
        }
        if (!shouldFallbackToClientPdf(api.status)) {
          setError(api.message);
          return;
        }
      }

      const doc = await PDFDocument.load(sourceBuf, { ignoreEncryption: true });
      if (removeMetadata) {
        doc.setTitle(""); doc.setAuthor(""); doc.setSubject("");
        doc.setKeywords([]); doc.setProducer(""); doc.setCreator("");
        doc.setCreationDate(new Date(0)); doc.setModificationDate(new Date(0));
      }
      const bytes = await doc.save({ useObjectStreams });
      setResult({ bytes, size: bytes.length });
    } catch (e) { setError(String(e)); }
    finally { setProcessing(false); }
  }

  function download() {
    if (!result || !file) return;
    downloadPdf(result.bytes, file.name.replace(/\.pdf$/i, "-compressed.pdf"));
  }

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">PDF Tools / Compress PDF</p>
          <h1 className="text-2xl font-semibold tracking-tight">Compress PDF</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reduce PDF file size by rewriting the internal structure and stripping unused metadata. Best results on text-heavy PDFs. Files under ~3.6MB may compress on the server; larger files stay in your browser.</p>
        </div>

        <div className="space-y-5">
          {/* Upload */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => !file && inputRef.current?.click()}
            className={cn("flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors", file ? "border-[#6366f1]/40 bg-[#6366f1]/[0.04] cursor-default" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]")}
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileText className="size-8 text-[#6366f1]" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="ml-2 rounded-md p-1 text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="size-7 text-muted-foreground" />
                <div><p className="text-sm font-medium text-foreground">Drop a PDF here, or click to browse</p></div>
              </>
            )}
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {/* Options */}
          {file && (
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-3">
              <p className="text-sm font-medium">Options</p>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                <input type="checkbox" checked={useObjectStreams} onChange={(e) => setUseObjectStreams(e.target.checked)} className="mt-0.5 accent-[#6366f1]" />
                <span><span className="font-medium text-foreground">Object streams</span> — pack PDF objects tightly using cross-reference streams (recommended)</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                <input type="checkbox" checked={removeMetadata} onChange={(e) => setRemoveMetadata(e.target.checked)} className="mt-0.5 accent-[#6366f1]" />
                <span><span className="font-medium text-foreground">Strip metadata</span> — remove title, author, creator, producer, and timestamps</span>
              </label>
              <p className="text-xs text-muted-foreground/60">Note: embedded image data is not recompressed. For image-heavy PDFs, savings may be minimal.</p>
            </div>
          )}

          {/* Result */}
          {result && file && <SizeBar original={file.size} compressed={result.size} />}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button onClick={compress} disabled={processing || !file} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors", file && !processing ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]" : "bg-white/[0.06] text-muted-foreground")}>
              {processing ? <><Loader2 className="size-4 animate-spin" /> Compressing…</> : "Compress"}
            </button>
            {result && (
              <button onClick={download} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-foreground hover:bg-white/[0.08]">
                <Check className="size-4 text-emerald-400" /><Download className="size-4" /> Download
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
