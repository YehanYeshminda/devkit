"use client";

import * as React from "react";
import { Check, Copy, Download, Eye, EyeOff, Upload, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {}
  }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" /> Copied!</> : <><Copy className="size-3.5" /> Copy</>}
    </button>
  );
}

function ImageToBase64() {
  const [file, setFile] = React.useState<File | null>(null);
  const [dataUrl, setDataUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    if (!f.type.startsWith("image/")) { setError("Please select an image file."); return; }
    setError(""); setFile(f); setLoading(true); setShowPreview(true);
    try {
      const url = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target?.result as string);
        r.onerror = () => rej(new Error("Read error"));
        r.readAsDataURL(f);
      });
      setDataUrl(url);
    } catch { setError("Failed to read file."); } finally { setLoading(false); }
  }

  function clear() { setFile(null); setDataUrl(""); setError(""); setShowPreview(false); if (inputRef.current) inputRef.current.value = ""; }
  const rawBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
  const hasSide = Boolean(dataUrl && showPreview);

  return (
    <div className={cn("grid items-start gap-6", hasSide ? "lg:grid-cols-2" : "")}>
      <div className="space-y-5">
        {/* Drop zone */}
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onClick={() => inputRef.current?.click()}
          className={cn("relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors", file ? "border-[#6366f1]/40 bg-[#6366f1]/[0.04]" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]")}>
          <Upload className="size-7 text-muted-foreground" />
          {file ? <div><p className="font-medium text-foreground">{file.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(file.size)} · {file.type} — click to replace</p></div>
            : <div><p className="text-sm font-medium text-foreground">Drop an image here, or click to browse</p><p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP, GIF, SVG supported</p></div>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {loading && <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60"><div className="size-6 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" /></div>}
        </div>

        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        {dataUrl && !showPreview && (
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
            <Eye className="size-4" /> Show image preview
          </button>
        )}

        {dataUrl && (
          <div className="space-y-4">
            {/* Data URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><p className="text-sm font-medium">Full Data URL <span className="ml-1 text-xs text-muted-foreground">(use in CSS/HTML src)</span></p><div className="flex gap-2"><CopyBtn text={dataUrl} /><button onClick={clear} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08]"><X className="size-3.5" /> Clear</button></div></div>
              <textarea readOnly value={dataUrl} rows={4} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground focus:outline-none" />
            </div>
            {/* Raw base64 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><p className="text-sm font-medium">Raw Base64 <span className="ml-1 text-xs text-muted-foreground">(without data: prefix)</span></p><CopyBtn text={rawBase64} /></div>
              <textarea readOnly value={rawBase64} rows={4} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground focus:outline-none" />
              <p className="text-xs text-muted-foreground">String length: {rawBase64.length.toLocaleString()} chars · ~{formatBytes(Math.round(rawBase64.length * 0.75))}</p>
            </div>
          </div>
        )}
      </div>

      {hasSide && (
        <div className="sticky top-20 flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
              <Eye className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Image preview</span>
              <button onClick={() => setShowPreview(false)} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><EyeOff className="size-3.5" /> Hide</button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Base64ToImage() {
  const [input, setInput] = React.useState("");
  const [imgType, setImgType] = React.useState("image/png");
  const [error, setError] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState("");
  const [filename, setFilename] = React.useState("image");

  const isDataUrl = input.trim().startsWith("data:");

  function buildDataUrl() {
    const t = input.trim();
    if (!t) return "";
    if (t.startsWith("data:")) return t;
    return `data:${imgType};base64,${t}`;
  }

  function handlePreview() {
    setError("");
    const src = buildDataUrl();
    if (!src) { setError("Paste a Base64 string or data URL first."); return; }
    setPreviewSrc(src); setShowPreview(true);
  }

  function handleDownload() {
    setError("");
    const src = buildDataUrl();
    if (!src) { setError("Paste a Base64 string or data URL first."); return; }
    const ext = isDataUrl ? (input.split(";")[0].split("/")[1] ?? "png") : imgType.split("/")[1];
    const a = document.createElement("a");
    a.href = src;
    a.download = filename.includes(".") ? filename : `${filename}.${ext}`;
    a.click();
  }

  const hasSide = Boolean(previewSrc && showPreview);
  const estBytes = input.trim().length > 0 ? Math.round(input.trim().replace(/^data:[^,]+,/, "").length * 0.75) : 0;

  return (
    <div className={cn("grid items-start gap-6", hasSide ? "lg:grid-cols-2" : "")}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Output filename</label>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none" />
          </div>
          {!isDataUrl && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Image type</label>
              <select value={imgType} onChange={(e) => setImgType(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3 text-sm text-foreground focus:outline-none">
                {["image/png","image/jpeg","image/webp","image/gif","image/svg+xml"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base64 string or data URL</label>
            {input && <button onClick={() => { setInput(""); setPreviewSrc(""); setShowPreview(false); setError(""); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}
          </div>
          <textarea value={input} onChange={(e) => { setInput(e.target.value); setPreviewSrc(""); setShowPreview(false); }} rows={8} placeholder={`Paste raw Base64 or a full data URL (data:image/png;base64,...)`} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
          {estBytes > 0 && <p className="text-xs text-muted-foreground">Estimated image size: ~{formatBytes(estBytes)}</p>}
        </div>

        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button onClick={hasSide ? () => { setShowPreview(false); setPreviewSrc(""); } : handlePreview}
            className={cn("flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition", hasSide ? "border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
            {hasSide ? <><EyeOff className="size-4" /> Hide preview</> : <><Eye className="size-4" /> Preview image</>}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]">
            <Download className="size-4" /> Download
          </button>
        </div>
      </div>

      {hasSide && (
        <div className="sticky top-20 flex flex-col" style={{ height: "calc(100vh - 6rem)" }}>
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
              <Eye className="size-3.5 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground">Image preview</span>
              <button onClick={() => { setShowPreview(false); setPreviewSrc(""); }} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><EyeOff className="size-3.5" /> Hide</button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TABS = [{ id: "to-base64", label: "Image → Base64" }, { id: "from-base64", label: "Base64 → Image" }] as const;
type TabId = (typeof TABS)[number]["id"];

export default function ImageBase64Page() {
  const [tab, setTab] = React.useState<TabId>("to-base64");
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Converters / Image ↔ Base64</p><h1 className="text-2xl font-semibold tracking-tight">Image ↔ Base64</h1><p className="mt-1 text-sm text-muted-foreground">Convert images to Base64 strings and back — entirely in your browser.</p></div>
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {TABS.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("rounded-md px-5 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>))}
        </div>
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 lg:p-8">
          {tab === "to-base64" ? <ImageToBase64 /> : <Base64ToImage />}
        </div>
      </main>
    </div>
  );
}
