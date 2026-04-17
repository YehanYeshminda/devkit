"use client";

import * as React from "react";
import { Check, Copy, Download, X } from "lucide-react";

import { CreateShareLinkButton } from "@/components/share/create-share-link-button";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" /> Copied!</> : <><Copy className="size-3.5" /> Copy</>}
    </button>
  );
}

export default function JsonFormatterPage() {
  const [input, setInput] = React.useState("");
  const [indent, setIndent] = React.useState<2 | 4>(2);
  const [error, setError] = React.useState("");

  const output = React.useMemo(() => {
    const t = input.trim();
    if (!t) { setError(""); return ""; }
    try {
      const result = JSON.stringify(JSON.parse(t), null, indent);
      setError("");
      return result;
    } catch (e) {
      setError(String(e));
      return "";
    }
  }, [input, indent]);

  function minify() {
    const t = input.trim();
    if (!t) return;
    try { setInput(JSON.stringify(JSON.parse(t))); } catch {}
  }

  function downloadJson() {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "formatted.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / JSON Formatter</p><h1 className="text-2xl font-semibold tracking-tight">JSON Formatter</h1><p className="mt-1 text-sm text-muted-foreground">Pretty-print, validate, and minify JSON data instantly.</p></div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <CreateShareLinkButton
            kind="json"
            getPayload={() => ({ raw: input, indent })}
            disabled={!input.trim() || Boolean(error)}
          />
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-1">
            {([2, 4] as const).map((n) => (
              <button key={n} onClick={() => setIndent(n)} className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors", indent === n ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {n} spaces
              </button>
            ))}
          </div>
          <button onClick={minify} disabled={!input.trim()} className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40">
            Minify
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Input JSON</label>
              {input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}
            </div>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={22} placeholder={'{"name":"Alice","age":30,"hobbies":["reading","coding"]}'} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Formatted output</label>
                {output && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Valid JSON</span>}
              </div>
              <div className="flex gap-2">
                {output && <><CopyBtn text={output} /><button onClick={downloadJson} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"><Download className="size-3.5" /> Download</button></>}
              </div>
            </div>
            <textarea readOnly value={output} rows={22} placeholder="Formatted JSON will appear here…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
          </div>
        </div>
      </main>
    </div>
  );
}
