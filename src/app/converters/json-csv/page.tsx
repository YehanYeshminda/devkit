"use client";

import * as React from "react";
import { Check, Copy, Download, X } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// ── conversion helpers ────────────────────────────────────────────────────

function escapeField(v: unknown): string {
  const s = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
  return /[,"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error("Input must be a JSON array of objects.");
  if (data.length === 0) return "";
  const headers = Array.from(new Set(data.flatMap((r) => Object.keys(r))));
  return [headers.map(escapeField).join(","), ...data.map((row) => headers.map((h) => escapeField(row[h])).join(","))].join("\n");
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 1) throw new Error("CSV is empty.");
  const headers = parseCsvRow(lines[0]);
  const rows = lines.slice(1).filter(Boolean).map((line) => {
    const vals = parseCsvRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
  return JSON.stringify(rows, null, 2);
}

function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"' && !inQ) { inQ = true; continue; }
    if (ch === '"' && inQ) { if (row[i + 1] === '"') { cur += '"'; i++; } else inQ = false; continue; }
    if (ch === "," && !inQ) { result.push(cur); cur = ""; continue; }
    cur += ch;
  }
  result.push(cur);
  return result;
}

// ── shared ────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" /> Copied!</> : <><Copy className="size-3.5" /> Copy</>}
    </button>
  );
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Tab 1: JSON → CSV ─────────────────────────────────────────────────────

function JsonToCsvTab() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState("");

  function convert() {
    setError("");
    if (!input.trim()) { setError("Paste a JSON array first."); return; }
    try { setOutput(jsonToCsv(input.trim())); } catch (e) { setError(String(e)); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">JSON input</label>{input && <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}</div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16} placeholder={'[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob",   "age": 25 }\n]'} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
        <button onClick={convert} className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]">Convert →</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">CSV output</label><div className="flex gap-2">{output && <><CopyBtn text={output} /><button onClick={() => downloadText(output, "output.csv")} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"><Download className="size-3.5" /> Download</button></>}</div></div>
        <textarea readOnly value={output} rows={16} placeholder="CSV output will appear here…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
      </div>
    </div>
  );
}

// ── Tab 2: CSV → JSON ─────────────────────────────────────────────────────

function CsvToJsonTab() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState("");

  function convert() {
    setError("");
    if (!input.trim()) { setError("Paste CSV data first."); return; }
    try { setOutput(csvToJson(input.trim())); } catch (e) { setError(String(e)); }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">CSV input</label>{input && <button onClick={() => { setInput(""); setOutput(""); setError(""); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}</div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16} placeholder={"name,age,city\nAlice,30,London\nBob,25,Paris"} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
        {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
        <button onClick={convert} className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#6366f1]/20 hover:bg-[#4f51d4]">Convert →</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between"><label className="text-sm font-medium">JSON output</label><div className="flex gap-2">{output && <><CopyBtn text={output} /><button onClick={() => downloadText(output, "output.json")} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"><Download className="size-3.5" /> Download</button></>}</div></div>
        <textarea readOnly value={output} rows={16} placeholder="JSON output will appear here…" className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
      </div>
    </div>
  );
}

const TABS = [{ id: "to-csv", label: "JSON → CSV" }, { id: "to-json", label: "CSV → JSON" }] as const;
type TabId = (typeof TABS)[number]["id"];

export default function JsonCsvPage() {
  const [tab, setTab] = React.useState<TabId>("to-csv");
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6"><p className="mb-1.5 text-xs text-muted-foreground">Converters / JSON ↔ CSV</p><h1 className="text-2xl font-semibold tracking-tight">JSON ↔ CSV</h1><p className="mt-1 text-sm text-muted-foreground">Convert between JSON arrays and CSV files. Handles quoted fields, commas inside values, and nested objects.</p></div>
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {TABS.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("rounded-md px-5 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>{t.label}</button>))}
        </div>
        <div className="rounded-xl border border-white/10 bg-card/60 p-6 lg:p-8">
          {tab === "to-csv" ? <JsonToCsvTab /> : <CsvToJsonTab />}
        </div>
      </main>
    </div>
  );
}
