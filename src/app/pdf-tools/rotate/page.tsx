"use client";

import * as React from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Check, Download, FileText, Loader2, RotateCcw, RotateCw, Upload, X } from "lucide-react";

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
        <button onClick={() => onChange(new Set(Array.from({ length: count }, (_, i) => i)))} className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">All</button>
        <button onClick={() => onChange(new Set())} className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">None</button>
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

const ROTATIONS = [
  { label: "90° CW",  icon: <RotateCw  className="size-4" />, delta: 270 },
  { label: "90° CCW", icon: <RotateCcw className="size-4" />, delta: 90  },
  { label: "180°",    icon: <span className="text-xs font-semibold">180°</span>, delta: 180 },
] as const;

export default function RotatePdfPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [sourceBuf, setSourceBuf] = React.useState<ArrayBuffer | null>(null);
  const [rotateAll, setRotateAll] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [delta, setDelta] = React.useState<number>(270); // 90° CW by default
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("Please select a PDF."); return; }
    setError(""); setDone(false); setFile(f);
    try {
      const buf = await readAsArrayBuffer(f);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setSourceBuf(buf);
      setSelected(new Set());
    } catch { setError("Failed to read PDF."); }
  }

  async function rotate() {
    if (!sourceBuf) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const doc = await PDFDocument.load(sourceBuf, { ignoreEncryption: true });
      const pages = doc.getPages();
      const targets = rotateAll ? pages : pages.filter((_, i) => selected.has(i));
      targets.forEach((page) => {
        const cur = page.getRotation().angle;
        page.setRotation(degrees((cur + delta) % 360));
      });
      const bytes = await doc.save();
      downloadPdf(bytes, file!.name.replace(/\.pdf$/i, "-rotated.pdf"));
      setDone(true);
    } catch (e) { setError(String(e)); }
    finally { setProcessing(false); }
  }

  const canProcess = !!sourceBuf && (rotateAll || selected.size > 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">PDF Tools / Rotate PDF</p>
          <h1 className="text-2xl font-semibold tracking-tight">Rotate PDF</h1>
          <p className="mt-1 text-sm text-muted-foreground">Rotate all or selected pages by 90°, 180°, or 270°. Processed locally using pdf-lib.</p>
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
                <button onClick={(e) => { e.stopPropagation(); setFile(null); setPageCount(0); setSourceBuf(null); setDone(false); }} className="ml-2 rounded-md p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
              </div>
            ) : (
              <><Upload className="size-7 text-muted-foreground" /><p className="text-sm font-medium text-foreground">Drop a PDF here, or click to browse</p></>
            )}
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {pageCount > 0 && (
            <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-5">
              {/* Rotation angle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation angle</label>
                <div className="flex gap-2">
                  {ROTATIONS.map((r) => (
                    <button key={r.label} onClick={() => setDelta(r.delta)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors", delta === r.delta ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-[#6366f1]" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
                      {r.icon} {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page selection */}
              <div className="space-y-3">
                <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] w-fit p-1">
                  <button onClick={() => setRotateAll(true)} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", rotateAll ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>All pages</button>
                  <button onClick={() => setRotateAll(false)} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", !rotateAll ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>Selected pages</button>
                </div>
                {!rotateAll && <PageGrid count={pageCount} selected={selected} onChange={setSelected} />}
              </div>
            </div>
          )}

          {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}
          {done && <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400"><Check className="size-4" /> Rotated PDF downloaded.</div>}

          <button onClick={rotate} disabled={processing || !canProcess} className={cn("flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-colors", canProcess && !processing ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]" : "bg-white/[0.06] text-muted-foreground")}>
            {processing ? <><Loader2 className="size-4 animate-spin" /> Processing…</> : <><Download className="size-4" /> Rotate & Download</>}
          </button>
        </div>
      </main>
    </div>
  );
}
