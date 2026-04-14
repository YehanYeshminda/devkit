"use client";

import * as React from "react";
import { Check, Copy, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function b64urlDecode(s: string): string {
  // base64url → base64 → decode
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return atob(b64 + pad);
}

function decodeJwt(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT must have exactly 3 parts separated by dots.");
  const header = JSON.parse(b64urlDecode(parts[0]));
  const payload = JSON.parse(b64urlDecode(parts[1]));
  return { header, payload, signature: parts[2] };
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

function JsonPanel({ label, data, color }: { label: string; data: object; color: string }) {
  const text = JSON.stringify(data, null, 2);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
        <CopyBtn text={text} />
      </div>
      <pre className="overflow-x-auto p-3 text-xs text-muted-foreground">{text}</pre>
    </div>
  );
}

function expStatus(payload: Record<string, unknown>) {
  if (!("exp" in payload)) return null;
  const exp = Number(payload.exp);
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;
  if (diff < 0) return { expired: true, label: `Expired ${Math.abs(diff)} seconds ago` };
  if (diff < 3600) return { expired: false, label: `Expires in ${diff}s` };
  if (diff < 86400) return { expired: false, label: `Expires in ${Math.round(diff / 60)}m` };
  return { expired: false, label: `Expires in ${Math.round(diff / 86400)}d` };
}

export default function JwtDecoderPage() {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<ReturnType<typeof decodeJwt> | null>(null);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const t = input.trim();
    if (!t) { setResult(null); setError(""); return; }
    try { setResult(decodeJwt(t)); setError(""); } catch (e) { setResult(null); setError(String(e)); }
  }, [input]);

  const status = result ? expStatus(result.payload as Record<string, unknown>) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / JWT Decoder</p><h1 className="text-2xl font-semibold tracking-tight">JWT Decoder</h1><p className="mt-1 text-sm text-muted-foreground">Paste a JSON Web Token to inspect its header, payload, and expiry. Decoding is local — the token never leaves your browser.</p></div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Left: input */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><label className="text-sm font-medium">JWT Token</label>{input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}</div>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0..." className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
            </div>

            {status && (
              <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium", status.expired ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400")}>
                <span className={cn("size-1.5 rounded-full", status.expired ? "bg-red-500" : "bg-emerald-500")} />
                {status.label}
              </div>
            )}

            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">{error}</p>}

            {result && (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Signature</p>
                <p className="break-all font-mono text-xs text-muted-foreground/60">{result.signature}</p>
              </div>
            )}
          </div>

          {/* Right: decoded panels */}
          <div className="space-y-4">
            {result ? (
              <>
                <JsonPanel label="HEADER" data={result.header} color="text-[#6366f1]" />
                <JsonPanel label="PAYLOAD" data={result.payload} color="text-amber-400" />
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-muted-foreground/50">
                Decoded header and payload will appear here
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
