"use client";

import * as React from "react";
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

/** Converts base64 to a PDF Blob in 128 KB chunks, reporting progress 0→100. */
async function base64ToPdfBlobAsync(
  b64: string,
  onProgress: (pct: number) => void
): Promise<Blob> {
  onProgress(3);
  await tick(); // yield before atob (can be slow on huge strings)
  const binary = atob(b64.trim());
  onProgress(12);

  const len = binary.length;
  const bytes = new Uint8Array(len);
  const CHUNK = 128 * 1024; // 128 KB per tick

  for (let i = 0; i < len; i += CHUNK) {
    const end = Math.min(i + CHUNK, len);
    for (let j = i; j < end; j++) bytes[j] = binary.charCodeAt(j);
    // map 12 % → 94 %
    onProgress(12 + Math.round((end / len) * 82));
    await tick();
  }

  onProgress(98);
  const blob = new Blob([bytes], { type: "application/pdf" });
  onProgress(100);
  return blob;
}

function tick() {
  return new Promise<void>((r) => setTimeout(r, 0));
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function estimatedPdfBytes(b64Len: number) {
  return Math.round(b64Len * 0.75);
}

// ── shared sub-components ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PdfPreviewFrame({
  url,
  onHide,
}: {
  url: string;
  onHide: () => void;
}) {
  return (
    // h-full so it fills the sticky wrapper's height
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {/* Title bar — fixed height */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
        <Eye className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          PDF preview
        </span>
        <span className="ml-1 text-[10px] text-muted-foreground/40">
          (browser built-in viewer)
        </span>
        <button
          onClick={onHide}
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <EyeOff className="size-3.5" /> Hide
        </button>
      </div>
      {/* iframe takes all remaining height via flex-1 */}
      <iframe
        src={url}
        title="PDF preview"
        className="min-h-0 w-full flex-1"
        style={{ border: "none" }}
      />
    </div>
  );
}

// ── Tab 1: PDF → Base64 ──────────────────────────────────────────────────

function PdfToBase64() {
  const [file, setFile] = React.useState<File | null>(null);
  const [base64, setBase64] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPreview, setShowPreview] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewUrlRef = React.useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  function setUrl(url: string | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  async function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    setError("");
    setFile(f);
    setLoading(true);
    setUrl(URL.createObjectURL(f));
    setShowPreview(true);
    try {
      const result = await fileToBase64(f);
      setBase64(result);
    } catch {
      setError("Failed to read file. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function clear() {
    setFile(null);
    setBase64("");
    setError("");
    setUrl(null);
    setShowPreview(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasSidePreview = Boolean(previewUrl && showPreview);

  return (
    <div
      className={cn(
        "grid items-start gap-6",
        hasSidePreview ? "lg:grid-cols-2" : ""
      )}
    >
      {/* ── Controls column ─────────────────────────────────── */}
      <div className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            file
              ? "border-[#6366f1]/40 bg-[#6366f1]/[0.04]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          )}
        >
          <Upload className="size-7 text-muted-foreground" />
          {file ? (
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(file.size)} — click to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop a PDF here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only .pdf files accepted
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="size-6 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Preview toggle (when file is loaded but preview is hidden) */}
        {previewUrl && !showPreview && (
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
          >
            <Eye className="size-4" /> Show PDF preview
          </button>
        )}

        {/* Base64 Output */}
        {base64 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Base64 output
                <span className="ml-2 text-xs text-muted-foreground">
                  ({formatBytes(base64.length)} string)
                </span>
              </p>
              <div className="flex items-center gap-2">
                <CopyButton text={base64} />
                <button
                  onClick={clear}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                >
                  <X className="size-3.5" /> Clear
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={base64}
              rows={10}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* ── Side preview column (sticky) ────────────────────── */}
      {hasSidePreview && (
        <div
          className="sticky top-20 flex flex-col"
          style={{ height: "calc(100vh - 6rem)" }}
        >
          <PdfPreviewFrame url={previewUrl!} onHide={() => setShowPreview(false)} />
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Base64 → PDF ──────────────────────────────────────────────────

function Base64ToPdf() {
  const [input, setInput] = React.useState("");
  const [filename, setFilename] = React.useState("output");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const previewUrlRef = React.useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  function setUrl(url: string | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }

  React.useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const trimmed = input.trim();
  const b64Len = trimmed.length;
  const estBytes = b64Len > 0 ? estimatedPdfBytes(b64Len) : 0;

  function handlePreview() {
    setError("");
    if (!trimmed) { setError("Paste a Base64 string first."); return; }
    try {
      // For preview we use the fast sync version — it's just rendering, not downloading
      const binary = atob(trimmed);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      setUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    } catch {
      setError("Invalid Base64 — paste the raw string (no data:… prefix).");
    }
  }

  async function handleDownload() {
    setError("");
    setSuccess(false);
    if (!trimmed) { setError("Please paste a Base64 string first."); return; }

    setIsDownloading(true);
    setProgress(0);
    try {
      const blob = await base64ToPdfBlobAsync(trimmed, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError("Invalid Base64 — make sure you pasted the raw string (no data:… prefix).");
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  }

  function clearAll() {
    setInput("");
    setError("");
    setSuccess(false);
    setUrl(null);
    setShowPreview(false);
    setProgress(null);
  }

  const hasSidePreview = Boolean(previewUrl && showPreview);

  return (
    <div
      className={cn(
        "grid items-start gap-6",
        hasSidePreview ? "lg:grid-cols-2" : ""
      )}
    >
      {/* ── Controls column ─────────────────────────────────── */}
      <div className="space-y-5">
        {/* Filename */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Output filename</label>
          <div className="flex h-10 items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] pr-3">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="output"
              className="flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
            <span className="text-xs text-muted-foreground">.pdf</span>
          </div>
        </div>

        {/* Base64 input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base64 string</label>
            {input && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Clear
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (previewUrl) { setUrl(null); setShowPreview(false); }
            }}
            rows={10}
            placeholder="Paste your Base64 string here… (raw Base64, no data:… prefix)"
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
          {/* Size info */}
          {estBytes > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                Base64 length:{" "}
                <span className="font-medium text-foreground/70">
                  {b64Len.toLocaleString()} chars
                </span>
              </span>
              <span className="opacity-40">·</span>
              <span>
                Estimated PDF size:{" "}
                <span className="font-medium text-foreground/70">
                  ~{formatBytes(estBytes)}
                </span>
              </span>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Preview toggle */}
          <button
            onClick={
              hasSidePreview ? () => setShowPreview(false) : handlePreview
            }
            disabled={isDownloading}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:opacity-40",
              hasSidePreview
                ? "border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]"
                : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
            )}
          >
            {hasSidePreview ? (
              <><EyeOff className="size-4" /> Hide preview</>
            ) : (
              <><Eye className="size-4" /> Preview PDF</>
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition disabled:opacity-60",
              success
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]"
            )}
          >
            {success ? (
              <><Check className="size-4" /> Downloaded!</>
            ) : isDownloading ? (
              <><div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Preparing…</>
            ) : (
              <><Download className="size-4" /> Download PDF</>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {progress !== null && (
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Processing{" "}
                <span className="font-medium text-foreground/70">
                  ~{formatBytes(estBytes)}
                </span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#6366f1] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground/50">
              Converting in 128 KB chunks to keep the browser responsive…
            </p>
          </div>
        )}
      </div>

      {/* ── Side preview column (sticky) ────────────────────── */}
      {hasSidePreview && (
        <div
          className="sticky top-20 flex flex-col"
          style={{ height: "calc(100vh - 6rem)" }}
        >
          <PdfPreviewFrame url={previewUrl!} onHide={() => setShowPreview(false)} />
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "to-base64",   label: "PDF → Base64" },
  { id: "from-base64", label: "Base64 → PDF"  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function PdfConverterPage() {
  const [tab, setTab] = React.useState<TabId>("to-base64");

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        {/* Page header */}
        <div className="mb-6">
          <div className="mb-1.5 text-xs text-muted-foreground">
            Converters / PDF
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                PDF ↔ Base64 Converter
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Convert PDFs to Base64 strings and back — entirely in your browser.
              </p>
            </div>
            {/* Privacy badge */}
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs text-emerald-400">
              <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
              100% client-side — files never leave your tab
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-5 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel — full width */}
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 lg:p-8">
          {tab === "to-base64" ? <PdfToBase64 /> : <Base64ToPdf />}
        </div>
      </main>
    </div>
  );
}
