"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { Check, Download, FileText, Loader2, Upload, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { canUsePdfApi, downloadBlob, postPdfForm, shouldFallbackToClientPdf } from "@/lib/pdf-api-client";
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

type ParsedRange = { label: string; indices: number[] };

function parseRanges(str: string, max: number): ParsedRange[] | null {
  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return null;
  const result: ParsedRange[] = [];
  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (isNaN(a) || isNaN(b) || a < 1 || b < a || b > max) return null;
      result.push({ label: `Pages ${a}–${b}`, indices: Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i) });
    } else {
      const n = parseInt(part, 10);
      if (isNaN(n) || n < 1 || n > max) return null;
      result.push({ label: `Page ${n}`, indices: [n - 1] });
    }
  }
  return result.length ? result : null;
}

export default function SplitPdfPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [mode, setMode] = React.useState<"ranges" | "every">("ranges");
  const [rangeStr, setRangeStr] = React.useState("");
  const [everyN, setEveryN] = React.useState(1);
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [deliveredAsZip, setDeliveredAsZip] = React.useState(false);
  const [error, setError] = React.useState("");
  const [progress, setProgress] = React.useState("");
  const [sourceBuf, setSourceBuf] = React.useState<ArrayBuffer | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF file."); return; }
    setError(""); setDone(false); setRangeStr(""); setFile(f);
    try {
      const buf = await readAsArrayBuffer(f);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setSourceBuf(buf);
    } catch { setError("Failed to read PDF. The file may be corrupted or encrypted."); }
  }

  // Compute ranges for "every N pages" mode
  function computeEveryRanges(): ParsedRange[] {
    const ranges: ParsedRange[] = [];
    for (let s = 0; s < pageCount; s += everyN) {
      const e = Math.min(s + everyN, pageCount);
      ranges.push({ label: `Pages ${s + 1}–${e}`, indices: Array.from({ length: e - s }, (_, i) => s + i) });
    }
    return ranges;
  }

  const parsedRanges = mode === "every" ? computeEveryRanges() : (rangeStr ? parseRanges(rangeStr, pageCount) : null);

  async function split() {
    if (!sourceBuf || !file || !parsedRanges) return;
    setProcessing(true); setError(""); setDone(false); setDeliveredAsZip(false);
    try {
      if (canUsePdfApi(file.size)) {
        setProgress("Splitting on server…");
        const baseName = file.name.replace(/\.pdf$/i, "");
        const parts = parsedRanges.map((r) => r.indices);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("options", JSON.stringify({ baseName, parts }));
        const api = await postPdfForm("/api/pdf/split", fd);
        if (api.ok) {
          downloadBlob(api.blob, api.filenameHint ?? `${baseName}-split.zip`);
          setDeliveredAsZip(true);
          setDone(true);
          return;
        }
        if (!shouldFallbackToClientPdf(api.status)) {
          setError(api.message);
          return;
        }
      }

      for (let i = 0; i < parsedRanges.length; i++) {
        const r = parsedRanges[i];
        setProgress(`Creating part ${i + 1} / ${parsedRanges.length}…`);
        const newDoc = await PDFDocument.create();
        const srcDoc = await PDFDocument.load(sourceBuf, { ignoreEncryption: true });
        const copied = await newDoc.copyPages(srcDoc, r.indices);
        copied.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const baseName = file.name.replace(/\.pdf$/i, "");
        downloadPdf(bytes, `${baseName}-part${i + 1}.pdf`);
        if (i < parsedRanges.length - 1) await new Promise((r) => setTimeout(r, 250));
      }
      setDeliveredAsZip(false);
      setDone(true);
    } catch (e) { setError(String(e)); }
    finally { setProcessing(false); setProgress(""); }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">PDF Tools / Split PDF</p>
          <h1 className="text-2xl font-semibold tracking-tight">Split PDF</h1>
          <p className="mt-1 text-sm text-muted-foreground">Split a PDF by page ranges or every N pages. Under ~3.6MB you may get a single ZIP from the server; larger PDFs download each part separately in the browser.</p>
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
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {pageCount} pages</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPageCount(0); setSourceBuf(null); setDone(false); }} className="ml-2 rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
            ) : (
              <>
                <Upload className="size-7 text-muted-foreground" />
                <div><p className="text-sm font-medium text-foreground">Drop a PDF here, or click to browse</p></div>
              </>
            )}
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {pageCount > 0 && (
            <>
              {/* Mode */}
              <div className="space-y-3">
                <div className="flex gap-1 w-fit rounded-lg border border-white/10 bg-white/[0.02] p-1">
                  {(["ranges", "every"] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", mode === m ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      {m === "ranges" ? "Custom ranges" : "Every N pages"}
                    </button>
                  ))}
                </div>

                {mode === "ranges" ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Page ranges <span className="text-xs text-muted-foreground">(PDF has {pageCount} pages)</span></label>
                    <input value={rangeStr} onChange={(e) => setRangeStr(e.target.value)} placeholder="e.g. 1-3, 4-6, 7, 8-10" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/10" />
                    <p className="text-xs text-muted-foreground">Each range becomes a separate PDF download. Use commas to separate ranges.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Split every</label>
                    <input type="number" min={1} max={pageCount} value={everyN} onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value) || 1))} className="h-10 w-24 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-center text-foreground focus:outline-none" />
                    <label className="text-sm font-medium">page{everyN !== 1 ? "s" : ""}</label>
                  </div>
                )}
              </div>

              {/* Range preview */}
              {parsedRanges && parsedRanges.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Output: {parsedRanges.length} file{parsedRanges.length !== 1 ? "s" : ""}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedRanges.map((r, i) => (
                      <span key={i} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-muted-foreground">
                        Part {i + 1}: {r.label} ({r.indices.length}p)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
          {done && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
              <Check className="size-4" />
              {deliveredAsZip ? "ZIP with all parts downloaded." : "All parts downloaded as separate PDFs."}
            </div>
          )}

          <button
            onClick={split}
            disabled={processing || !parsedRanges || parsedRanges.length === 0}
            className={cn("flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors", !processing && parsedRanges && parsedRanges.length > 0 ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]" : "bg-white/[0.06] text-muted-foreground")}
          >
            {processing ? <><Loader2 className="size-4 animate-spin" />{progress || "Processing…"}</> : <><Download className="size-4" />Split & Download {parsedRanges ? `${parsedRanges.length} File${parsedRanges.length !== 1 ? "s" : ""}` : ""}</>}
          </button>
        </div>
      </main>
    </div>
  );
}
