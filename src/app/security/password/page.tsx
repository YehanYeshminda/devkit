"use client";

import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMS  = "0123456789";
const SYMS  = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function generate(len: number, u: boolean, l: boolean, n: boolean, s: boolean, noAmb: boolean): string {
  let pool = [u ? UPPER : "", l ? LOWER : "", n ? NUMS : "", s ? SYMS : ""].join("");
  if (noAmb) pool = pool.replace(/[0Ol1I]/g, "");
  if (!pool) return "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => pool[v % pool.length]).join("");
}

function strength(pwd: string): { score: number; label: string; color: string } {
  let sc = 0;
  if (pwd.length >= 8) sc++;
  if (pwd.length >= 12) sc++;
  if (pwd.length >= 16) sc++;
  if (/[A-Z]/.test(pwd)) sc++;
  if (/[0-9]/.test(pwd)) sc++;
  if (/[^A-Za-z0-9]/.test(pwd)) sc++;
  if (sc <= 1) return { score: sc, label: "Very weak",  color: "bg-red-500" };
  if (sc <= 2) return { score: sc, label: "Weak",       color: "bg-orange-500" };
  if (sc <= 3) return { score: sc, label: "Fair",       color: "bg-amber-400" };
  if (sc <= 4) return { score: sc, label: "Strong",     color: "bg-emerald-500" };
  return              { score: sc, label: "Very strong", color: "bg-emerald-400" };
}

export default function PasswordGeneratorPage() {
  const [len, setLen] = React.useState(20);
  const [upper, setUpper] = React.useState(true);
  const [lower, setLower] = React.useState(true);
  const [nums,  setNums]  = React.useState(true);
  const [syms,  setSyms]  = React.useState(true);
  const [noAmb, setNoAmb] = React.useState(false);
  const [qty,   setQty]   = React.useState(1);
  const [passwords, setPasswords] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState<number | null>(null);
  const [allCopied, setAllCopied] = React.useState(false);

  function regen() {
    setPasswords(Array.from({ length: qty }, () => generate(len, upper, lower, nums, syms, noAmb)));
  }

  React.useEffect(() => { regen(); }, [len, upper, lower, nums, syms, noAmb, qty]); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyOne(i: number) {
    try { await navigator.clipboard.writeText(passwords[i]); setCopied(i); setTimeout(() => setCopied(null), 1200); } catch {}
  }
  async function copyAll() {
    try { await navigator.clipboard.writeText(passwords.join("\n")); setAllCopied(true); setTimeout(() => setAllCopied(false), 1500); } catch {}
  }

  const st = passwords[0] ? strength(passwords[0]) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Security / Password Generator</p><h1 className="text-2xl font-semibold tracking-tight">Password Generator</h1><p className="mt-1 text-sm text-muted-foreground">Generate strong random passwords using <code className="rounded bg-white/[0.06] px-1">crypto.getRandomValues</code>. Nothing leaves your browser.</p></div>

        <div className="space-y-6">
          {/* Options */}
          <div className="rounded-xl border border-white/10 bg-card/60 p-5 space-y-5">
            {/* Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between"><label className="text-sm font-medium">Length</label><span className="text-sm font-semibold tabular-nums text-[#6366f1]">{len}</span></div>
              <input type="range" min={6} max={128} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-[#6366f1]" />
              <div className="flex justify-between text-[10px] text-muted-foreground/50"><span>6</span><span>128</span></div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Uppercase A–Z", upper, setUpper], ["Lowercase a–z", lower, setLower], ["Numbers 0–9", nums, setNums], ["Symbols !@#$", syms, setSyms]].map(([label, val, set]) => (
                <label key={label as string} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <input type="checkbox" checked={val as boolean} onChange={(e) => (set as (v: boolean) => void)(e.target.checked)} className="accent-[#6366f1]" />
                  {label as string}
                </label>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <input type="checkbox" checked={noAmb} onChange={(e) => setNoAmb(e.target.checked)} className="accent-[#6366f1]" />
              Exclude ambiguous characters (0, O, l, I)
            </label>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Generate</label>
              <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
                {[1, 5, 10, 25].map((q) => (
                  <button key={q} onClick={() => setQty(q)} className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors", qty === q ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>{q}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Strength */}
          {st && qty === 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Strength</span><span className="font-medium">{st.label}</span></div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-all ${st.color}`} style={{ width: `${Math.min(100, (st.score / 6) * 100)}%` }} /></div>
            </div>
          )}

          {/* Passwords */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{qty > 1 ? `${qty} passwords` : "Password"}</span>
              <div className="flex gap-2">
                {qty > 1 && <button onClick={copyAll} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", allCopied ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>{allCopied ? <><Check className="size-3.5" /> All copied!</> : <><Copy className="size-3.5" /> Copy all</>}</button>}
                <button onClick={regen} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"><RefreshCw className="size-3.5" /> Regenerate</button>
              </div>
            </div>
            {passwords.map((pwd, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
                <span className="flex-1 break-all font-mono text-sm text-foreground">{pwd}</span>
                <button onClick={() => copyOne(i)} className={cn("shrink-0 flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors", copied === i ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>{copied === i ? <Check className="size-3" /> : <Copy className="size-3" />}</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
