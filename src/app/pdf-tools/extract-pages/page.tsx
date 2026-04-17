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

function PageGrid({ count, selected, onChange }: { count: number; selected: Set<number>; onChange: (s: Set<number>) => void }) {
  function toggle(i: number) {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i); else next.add(i);
    onChange(next);
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => onChange(new Set(Array.from({ length: count }, (_, i) => i)))} className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">Select all</button>
        <button onClick={() => onChange(new Set())} className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">Select none</button>
        <span className="text-xs text-muted-foreground">{selected.size} of {count} selected</span>
      </div>
      <div className="max-h-52 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-12">
          {Array.from({ length: count }, (_, i) => (
            <button key={i} onClick={() => toggle(i)} className={cn("rounded border py-1.5 text-xs font-mono transition-colors", selected.has(i) ? "border-[#6366f1]/40 bg-[#6366f1]/20 text-[#6366f1]" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExtractPagesPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [sourceBuf, setSourceBuf] = React.useState<ArrayBuffer | null>(null);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF."); return; }
    setError(""); setDone(false); setFile(f); setSelected(new Set());
    try {
      const buf = await readAsArrayBuffer(f);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setSourceBuf(buf);
    } catch { setError("Failed to read PDF."); }
  }

  async function extract() {
    if (!sourceBuf || !file || selected.size === 0) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const indices = Array.from(selected).sort((a, b) => a - b);
      if (canUsePdfApi(file.size)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("options", JSON.stringify({ indices }));
        const api = await postPdfForm("/api/pdf/extract-pages", fd);
        if (api.ok) {
          downloadBlob(api.blob, api.filenameHint ?? file.name.replace(/\.pdf$/i, "-extracted.pdf"));
          setDone(true);
          return;
        }
        if (!shouldFallbackToClientPdf(api.status)) {
          setError(api.message);
          return;
        }
      }

      const newDoc = await PDFDocument.create();
      const srcDoc = await PDFDocument.load(sourceBuf, { ignoreEncryption: true });
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => newDoc.addPage(p));
      const bytes = await newDoc.save();
      downloadPdf(bytes, file.name.replace(/\.pdf$/i, "-extracted.pdf"));
      setDone(true);
    } catch (e) { setError(String(e)); }
    finally { setProcessing(false); }
  }

  const canProcess = !!sourceBuf && selected.size > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">PDF Tools / Extract Pages</p>
          <h1 className="text-2xl font-semibold tracking-tight">Extract Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select the pages you want to keep and extract them into a new PDF. Under ~3.6MB the file may be sent to our server; larger PDFs stay in your browser.</p>
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
                <div className="text-left"><p className="font-medium text-foreground">{file.name}</p><p className="text-xs text-muted-foreground">{formatBytes(file.size)} · {pageCount} pages</p></div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPageCount(0); setSourceBuf(null); setSelected(new Set()); setDone(false); }} className="ml-2 rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
            ) : (
              <><Upload className="size-7 text-muted-foreground" /><p className="text-sm font-medium text-foreground">Drop a PDF here, or click to browse</p></>
            )}
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {pageCount > 0 && (
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium">Select pages to <span className="text-[#6366f1]">keep</span> in the output</p>
                <p className="text-xs text-muted-foreground">Selected pages will be copied into a new PDF in their original order.</p>
              </div>
              <PageGrid count={pageCount} selected={selected} onChange={setSelected} />
            </div>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
          {done && <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400"><Check className="size-4" /> Extracted {selected.size} page{selected.size !== 1 ? "s" : ""} downloaded.</div>}

          <button onClick={extract} disabled={processing || !canProcess} className={cn("flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors", canProcess && !processing ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]" : "bg-white/[0.06] text-muted-foreground")}>
            {processing ? <><Loader2 className="size-4 animate-spin" /> Processing…</> : <><Download className="size-4" />Extract {selected.size > 0 ? `${selected.size} Page${selected.size !== 1 ? "s" : ""} &` : ""} Download</>}
          </button>
        </div>
      </main>
    </div>
  );
}
