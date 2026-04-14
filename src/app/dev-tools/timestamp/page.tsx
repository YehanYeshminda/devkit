"use client";

import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} title="Copy" className={cn("flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
      {ok ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
    </button>
  );
}

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const future = diff < 0;
  if (abs < 5000) return "just now";
  if (abs < 60000) return `${Math.round(abs/1000)}s ${future?"from now":"ago"}`;
  if (abs < 3600000) return `${Math.round(abs/60000)}m ${future?"from now":"ago"}`;
  if (abs < 86400000) return `${Math.round(abs/3600000)}h ${future?"from now":"ago"}`;
  if (abs < 2592000000) return `${Math.round(abs/86400000)}d ${future?"from now":"ago"}`;
  return `${Math.round(abs/2592000000)}mo ${future?"from now":"ago"}`;
}

function makeFormats(ms: number) {
  const d = new Date(ms);
  return [
    { label: "Unix (seconds)",   value: String(Math.floor(ms/1000)) },
    { label: "Unix (milliseconds)", value: String(ms) },
    { label: "ISO 8601",         value: d.toISOString() },
    { label: "RFC 2822",         value: d.toUTCString() },
    { label: "Local date",       value: d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" }) },
    { label: "Local time",       value: d.toLocaleTimeString() },
    { label: "UTC date",         value: d.toUTCString().split(" ").slice(0,4).join(" ") },
    { label: "Relative",         value: formatRelative(ms) },
    { label: "Day of week",      value: d.toLocaleDateString(undefined, { weekday:"long" }) },
    { label: "Week number",      value: `Week ${Math.ceil(((d.getTime() - new Date(d.getFullYear(),0,1).getTime()) / 86400000 + new Date(d.getFullYear(),0,1).getDay() + 1)) / 7}` },
  ];
}

export default function TimestampPage() {
  const [now, setNow] = React.useState(() => Date.now());
  const [input, setInput] = React.useState("");
  const [dateInput, setDateInput] = React.useState("");
  const [error, setError] = React.useState("");

  // Live clock
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const targetMs = React.useMemo(() => {
    const t = input.trim();
    if (!t) return now;
    const n = Number(t);
    if (isNaN(n)) { setError("Not a valid number"); return now; }
    setError("");
    return n > 1e10 ? n : n * 1000; // auto-detect sec vs ms
  }, [input, now]);

  function applyDateInput() {
    if (!dateInput) return;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) { setError("Invalid date"); return; }
    setError("");
    setInput(String(Math.floor(d.getTime() / 1000)));
  }

  const formats = makeFormats(targetMs);
  const isCustom = Boolean(input.trim());

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Unix Timestamp</p>
          <h1 className="text-2xl font-semibold tracking-tight">Unix Timestamp Converter</h1>
          <p className="mt-1 text-sm text-muted-foreground">Convert epoch timestamps to human-readable dates and vice versa. Auto-detects seconds vs milliseconds.</p>
        </div>

        {/* Live clock */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-card/60 px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Unix timestamp (seconds)</p>
            <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-foreground">{Math.floor(now / 1000)}</p>
          </div>
          <CopyBtn text={String(Math.floor(now / 1000))} />
          <div className="ml-4 border-l border-white/10 pl-4">
            <p className="text-xs text-muted-foreground">Milliseconds</p>
            <p className="mt-0.5 font-mono text-sm tabular-nums text-muted-foreground">{now}</p>
          </div>
          <CopyBtn text={String(now)} />
          <button onClick={() => setInput("")} className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
            <RefreshCw className="size-3.5" /> Use current time
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Timestamp (seconds or milliseconds)</label>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={String(Math.floor(now / 1000))}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
              />
              <p className="text-xs text-muted-foreground">
                {isCustom ? `Auto-detected as ${targetMs > 1e10 ? "milliseconds" : "seconds"}` : "Showing current time — enter a timestamp to convert"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Or convert from a date</label>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={dateInput}
                  onChange={e => setDateInput(e.target.value)}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/10 [color-scheme:dark]"
                />
                <button onClick={applyDateInput} className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f51d4]">
                  Convert
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          {/* Formats output */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">All formats</label>
            <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10">
              {formats.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04]">
                  <span className="w-44 shrink-0 text-xs text-muted-foreground/70">{label}</span>
                  <span className="flex-1 truncate font-mono text-xs text-foreground">{value}</span>
                  <CopyBtn text={value} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
