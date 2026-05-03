"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, Link2 } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

type EcLevel = "L" | "M" | "Q" | "H";

const DEFAULT_TEXT = "https://devkit.tools";

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1200);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
      )}
    >
      {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {ok ? "Copied" : label}
    </button>
  );
}

export default function QrGeneratorPage() {
  const [text, setText] = React.useState(DEFAULT_TEXT);
  const [size, setSize] = React.useState(320);
  const [margin, setMargin] = React.useState(2);
  const [ecLevel, setEcLevel] = React.useState<EcLevel>("M");
  const [fgColor, setFgColor] = React.useState("#0f172a");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [pngDataUrl, setPngDataUrl] = React.useState("");
  const [svgText, setSvgText] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function generate() {
      const payload = text.trim();
      if (!payload) {
        setPngDataUrl("");
        setSvgText("");
        setError("Enter text or URL to generate a QR code.");
        return;
      }

      try {
        const options = {
          errorCorrectionLevel: ecLevel,
          width: size,
          margin,
          color: { dark: fgColor, light: bgColor },
        } as const;

        const [png, svg] = await Promise.all([
          QRCode.toDataURL(payload, options),
          QRCode.toString(payload, { ...options, type: "svg" }),
        ]);

        if (!active) return;
        setPngDataUrl(png);
        setSvgText(svg);
        setError("");
      } catch {
        if (!active) return;
        setError("Could not generate QR code. Try shorter text or different settings.");
      }
    }

    void generate();
    return () => {
      active = false;
    };
  }, [text, size, margin, ecLevel, fgColor, bgColor]);

  function downloadPng() {
    if (!pngDataUrl) return;
    const a = document.createElement("a");
    a.href = pngDataUrl;
    a.download = "qr-code.png";
    a.click();
  }

  function downloadSvg() {
    if (!svgText) return;
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">
            Utilities / QR Generator
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">QR Generator</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Generate QR codes from links or plain text. Customize size, margin,
            colors, and download as PNG or SVG.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-white/10 bg-card/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Content</h2>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste URL or any text..."
              spellCheck={false}
              className="h-36 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Size ({size}px)</span>
                <input
                  type="range"
                  min={180}
                  max={640}
                  step={10}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Margin ({margin})</span>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Error correction</span>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as EcLevel)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                  <option value="L">L (~7%)</option>
                  <option value="M">M (~15%)</option>
                  <option value="Q">Q (~25%)</option>
                  <option value="H">H (~30%)</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Foreground</span>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] p-1"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.03] p-1"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-card/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Preview</h2>
              <span className="text-[11px] text-muted-foreground">
                {text.trim().length} chars
              </span>
            </div>

            <div className="flex min-h-[290px] items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] p-4">
              {pngDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pngDataUrl}
                  alt="Generated QR code"
                  className="h-auto max-h-[320px] w-full max-w-[320px] rounded-md bg-white object-contain p-2"
                />
              ) : (
                <p className="text-sm text-muted-foreground/70">{error || "No QR yet."}</p>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <CopyBtn text={text} label="Copy text" />
              <CopyBtn text={pngDataUrl} label="Copy PNG data URL" />
              <button
                type="button"
                onClick={downloadPng}
                disabled={!pngDataUrl}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Download className="size-3.5" />
                Download PNG
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                disabled={!svgText}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Download className="size-3.5" />
                Download SVG
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
