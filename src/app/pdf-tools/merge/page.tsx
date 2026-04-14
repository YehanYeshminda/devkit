"use client";

import * as React from "react";
import { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, Check, Download, Loader2, Trash2, Upload } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
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
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsArrayBuffer(file);
  });
}

function downloadPdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function MergePdfsPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [progress, setProgress] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  function addFiles(added: FileList | null) {
    if (!added) return;
    const pdfs = Array.from(added).filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (!pdfs.length) { setError("Please select PDF files."); return; }
    setFiles((prev) => [...prev, ...pdfs]);
    setDone(false); setError("");
  }

  function remove(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setDone(false);
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...files];
    const t = idx + dir;
    if (t < 0 || t >= next.length) return;
    [next[idx], next[t]] = [next[t], next[idx]];
    setFiles(next);
  }

  async function merge() {
    if (files.length < 2) { setError("Add at least 2 PDF files."); return; }
    setProcessing(true); setError(""); setDone(false);
    try {
      const merged = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(`Loading ${i + 1} / ${files.length}…`);
        const buf = await readAsArrayBuffer(files[i]);
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setProgress("Saving…");
      const bytes = await merged.save();
      downloadPdf(bytes, "merged.pdf");
      setDone(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setProcessing(false); setProgress("");
    }
  }

  const total = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">PDF Tools / Merge PDFs</p>
          <h1 className="text-2xl font-semibold tracking-tight">Merge PDFs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Combine multiple PDF files into a single document. Drag to reorder. All processing happens locally.</p>
        </div>

        <div className="space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-white/20 hover:bg-white/[0.04]"
          >
            <Upload className="size-7 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Drop PDF files here, or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">You can add as many files as you need</p>
            </div>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{files.length} file{files.length !== 1 ? "s" : ""} · {formatBytes(total)}</span>
                <button onClick={() => { setFiles([]); setDone(false); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Trash2 className="size-3" /> Clear all
                </button>
              </div>

              <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04]">
                    <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground/40">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(f.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                      <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                      <button onClick={() => remove(i)} className="rounded p-1 text-muted-foreground hover:bg-red-500/20 hover:text-red-400"><Trash2 className="size-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

          {done && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
              <Check className="size-4" /> PDF merged and downloaded successfully.
            </div>
          )}

          <button
            onClick={merge}
            disabled={processing || files.length < 2}
            className={cn("flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors", files.length >= 2 && !processing ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]" : "bg-white/[0.06] text-muted-foreground")}
          >
            {processing ? <><Loader2 className="size-4 animate-spin" />{progress || "Processing…"}</> : <><Download className="size-4" /> Merge & Download</>}
          </button>
        </div>
      </main>
    </div>
  );
}
