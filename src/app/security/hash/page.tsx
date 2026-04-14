"use client";

import * as React from "react";
import { Check, Copy, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const ALGORITHMS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGORITHMS)[number];

async function hashText(text: string, algo: Algo): Promise<{ hex: string; b64: string }> {
  const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
  const bytes = new Uint8Array(buf);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
  return { hex, b64 };
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); } catch {} }
  return (
    <button onClick={copy} title="Copy" className={cn("flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
    </button>
  );
}

export default function HashGeneratorPage() {
  const [input, setInput] = React.useState("");
  const [hashes, setHashes] = React.useState<Record<string, { hex: string; b64: string }>>({});
  const [format, setFormat] = React.useState<"hex" | "b64">("hex");

  React.useEffect(() => {
    if (!input) { setHashes({}); return; }
    Promise.all(ALGORITHMS.map(async (a) => [a, await hashText(input, a)] as const))
      .then((entries) => setHashes(Object.fromEntries(entries)));
  }, [input]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Security / Hash Generator</p><h1 className="text-2xl font-semibold tracking-tight">Hash Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate SHA hashes from any text using the browser&apos;s built-in Web Crypto API. Nothing is sent to a server.</p></div>

        <div className="space-y-6">
          {/* Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between"><label className="text-sm font-medium">Input text</label>{input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}</div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={5} placeholder="Type or paste any text to hash…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
          </div>

          {/* Format toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Format:</span>
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
              {(["hex", "b64"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)} className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors", format === f ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {f === "hex" ? "Hex" : "Base64"}
                </button>
              ))}
            </div>
          </div>

          {/* Hash results */}
          <div className="space-y-3">
            {ALGORITHMS.map((algo) => {
              const val = hashes[algo]?.[format] ?? "";
              return (
                <div key={algo} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6366f1]">{algo}</span>
                    {val && <CopyBtn text={val} />}
                  </div>
                  <p className="break-all font-mono text-xs text-muted-foreground">{val || <span className="text-muted-foreground/30">Hash will appear here…</span>}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
