"use client";

import * as React from "react";
import { Check, Copy, X } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function toBase64(text: string): string {
  try { return btoa(unescape(encodeURIComponent(text))); } catch { return "Encoding error"; }
}
function fromBase64(b64: string): string {
  try { return decodeURIComponent(escape(atob(b64.trim()))); } catch { return "⚠ Invalid Base64 string"; }
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" />Copied!</> : <><Copy className="size-3.5" />Copy</>}
    </button>
  );
}

function EncodeTab() {
  const [input, setInput] = React.useState("Hello, world! 🌍");
  const output = React.useMemo(() => input ? toBase64(input) : "", [input]);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">Plain text</label>{input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" />Clear</button>}</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={14} placeholder="Type or paste text to encode…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
        <p className="text-xs text-muted-foreground">{input.length} characters · supports Unicode &amp; emoji</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">Base64 output</label>{output && <CopyBtn text={output} />}</div>
        <textarea readOnly value={output} rows={14} placeholder="Base64 output will appear here…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
        {output && <p className="text-xs text-muted-foreground">{output.length} characters (~{Math.ceil(input.length * 4 / 3)} expected)</p>}
      </div>
    </div>
  );
}

function DecodeTab() {
  const [input, setInput] = React.useState("SGVsbG8sIHdvcmxkISEg8J+MjQ==");
  const output = React.useMemo(() => input.trim() ? fromBase64(input) : "", [input]);
  const isError = output.startsWith("⚠");
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">Base64 input</label>{input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" />Clear</button>}</div>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={14} placeholder="Paste a Base64 string to decode…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">Decoded text</label>{output && !isError && <CopyBtn text={output} />}</div>
        <textarea readOnly value={output} rows={14} placeholder="Decoded text will appear here…" className={cn("w-full resize-none rounded-lg border p-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none", isError ? "border-red-500/20 bg-red-500/[0.04] text-red-400" : "border-white/10 bg-white/[0.02] text-muted-foreground")} />
      </div>
    </div>
  );
}

const TABS = [{ id: "encode", label: "Text → Base64" }, { id: "decode", label: "Base64 → Text" }] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Base64TextPage() {
  const [tab, setTab] = React.useState<TabId>("encode");
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Converters / Base64 ↔ Text</p>
          <h1 className="text-2xl font-semibold tracking-tight">Base64 ↔ Text</h1>
          <p className="mt-1 text-sm text-muted-foreground">Encode plain text to Base64 or decode a Base64 string back to text. Supports Unicode and emoji.</p>
        </div>
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={cn("rounded-md px-5 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>)}
        </div>
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 lg:p-8">
          {tab === "encode" ? <EncodeTab /> : <DecodeTab />}
        </div>
      </main>
    </div>
  );
}
