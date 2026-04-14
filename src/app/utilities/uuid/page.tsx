"use client";

import * as React from "react";
import { Check, Copy, RefreshCw, Trash2 } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

export default function UuidGeneratorPage() {
  const [qty, setQty] = React.useState(5);
  const [upper, setUpper] = React.useState(false);
  const [uuids, setUuids] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState<number | "all" | null>(null);

  function gen() {
    const list = Array.from({ length: qty }, () => {
      const id = crypto.randomUUID();
      return upper ? id.toUpperCase() : id;
    });
    setUuids(list);
  }

  React.useEffect(() => { gen(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyOne(i: number) {
    try { await navigator.clipboard.writeText(uuids[i]); setCopied(i); setTimeout(() => setCopied(null), 1200); } catch {}
  }
  async function copyAll() {
    try { await navigator.clipboard.writeText(uuids.join("\n")); setCopied("all"); setTimeout(() => setCopied(null), 1500); } catch {}
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Utilities / UUID Generator</p><h1 className="text-2xl font-semibold tracking-tight">UUID Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate v4 (random) UUIDs using <code className="rounded bg-white/[0.06] px-1">crypto.randomUUID()</code>. RFC 4122 compliant, generated locally.</p></div>

        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-card/60 px-5 py-4">
            {/* Qty */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Count</label>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
                {[1, 5, 10, 25, 100].map((q) => (
                  <button key={q} onClick={() => setQty(q)} className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors", qty === q ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>{q}</button>
                ))}
              </div>
            </div>

            {/* Case */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} className="accent-[#6366f1]" />
              Uppercase
            </label>

            <button onClick={gen} className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white shadow shadow-[#6366f1]/20 hover:bg-[#4f51d4]">
              <RefreshCw className="size-3.5" /> Generate
            </button>
          </div>

          {/* UUID list */}
          {uuids.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{uuids.length} UUID{uuids.length !== 1 ? "s" : ""}</span>
                <div className="flex gap-2">
                  <button onClick={copyAll} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", copied === "all" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
                    {copied === "all" ? <><Check className="size-3.5" /> All copied!</> : <><Copy className="size-3.5" /> Copy all</>}
                  </button>
                  <button onClick={() => setUuids([])} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
                    <Trash2 className="size-3.5" /> Clear
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] divide-y divide-white/[0.06]">
                {uuids.map((id, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03]">
                    <span className="w-6 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground/40">{i + 1}</span>
                    <span className="flex-1 font-mono text-sm text-foreground/80">{id}</span>
                    <button onClick={() => copyOne(i)} className={cn("shrink-0 flex items-center gap-1 rounded border px-2 py-1 text-[10px] transition-colors", copied === i ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
                      {copied === i ? <Check className="size-3" /> : <Copy className="size-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
