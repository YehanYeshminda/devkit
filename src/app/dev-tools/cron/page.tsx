"use client";

import * as React from "react";
import cronstrue from "cronstrue";
import { Check, Copy, RefreshCw } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// ── types ─────────────────────────────────────────────────────────────────────

type Mode = "every" | "step" | "specific" | "range";

type CronField = {
  mode: Mode;
  step: number;
  specific: number[];
  from: number;
  to: number;
};

type CronState = {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function defaultField(min: number, max: number): CronField {
  return { mode: "every", step: min === 0 ? 1 : min, specific: [], from: min, to: max };
}

function fieldToStr(f: CronField): string {
  switch (f.mode) {
    case "every":    return "*";
    case "step":     return `*/${f.step}`;
    case "specific": return f.specific.length ? [...f.specific].sort((a, b) => a - b).join(",") : "*";
    case "range":    return `${f.from}-${f.to}`;
  }
}

function cronStr(s: CronState): string {
  return `${fieldToStr(s.minute)} ${fieldToStr(s.hour)} ${fieldToStr(s.dom)} ${fieldToStr(s.month)} ${fieldToStr(s.dow)}`;
}

function toHuman(expr: string): string {
  try {
    return cronstrue.toString(expr, { throwExceptionOnParseError: true });
  } catch {
    return "Invalid cron expression";
  }
}

// Parse a single field string back to CronField
function parsePart(raw: string, min: number, max: number): CronField {
  const base = defaultField(min, max);
  if (!raw || raw === "*") return base;
  if (raw.startsWith("*/")) {
    const s = parseInt(raw.slice(2));
    return { ...base, mode: "step", step: isNaN(s) ? 1 : s };
  }
  if (raw.includes("-")) {
    const [a, b] = raw.split("-").map(Number);
    return { ...base, mode: "range", from: isNaN(a) ? min : a, to: isNaN(b) ? max : b };
  }
  if (raw.includes(",") || /^\d+$/.test(raw)) {
    const vals = raw.split(",").map(Number).filter((n) => !isNaN(n));
    return { ...base, mode: "specific", specific: vals };
  }
  return base;
}

function parseCron(expr: string): CronState | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute: parsePart(parts[0], 0, 59),
    hour:   parsePart(parts[1], 0, 23),
    dom:    parsePart(parts[2], 1, 31),
    month:  parsePart(parts[3], 1, 12),
    dow:    parsePart(parts[4], 0, 6),
  };
}

// Next N run times (brute-force, up to 1 year lookahead)
function matchField(value: number, f: CronField): boolean {
  switch (f.mode) {
    case "every":    return true;
    case "step":     return value % f.step === 0;
    case "specific": return f.specific.includes(value);
    case "range":    return value >= f.from && value <= f.to;
  }
}

function getNextRuns(state: CronState, n: number): Date[] {
  const results: Date[] = [];
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  const ms = now.getTime();

  for (let i = 0; i < 527040 && results.length < n; i++) {
    const d = new Date(ms + i * 60000);
    if (
      matchField(d.getMinutes(),     state.minute) &&
      matchField(d.getHours(),       state.hour)   &&
      matchField(d.getDate(),        state.dom)     &&
      matchField(d.getMonth() + 1,   state.month)  &&
      matchField(d.getDay(),         state.dow)
    ) {
      results.push(d);
    }
  }
  return results;
}

// ── presets ───────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Every minute",       expr: "* * * * *" },
  { label: "Every 5 minutes",    expr: "*/5 * * * *" },
  { label: "Every hour",         expr: "0 * * * *" },
  { label: "Daily at midnight",  expr: "0 0 * * *" },
  { label: "Daily at noon",      expr: "0 12 * * *" },
  { label: "Every Monday 9am",   expr: "0 9 * * 1" },
  { label: "Every weekday 9am",  expr: "0 9 * * 1-5" },
  { label: "First of month",     expr: "0 0 1 * *" },
  { label: "Every Sunday midnight", expr: "0 0 * * 0" },
] as const;

// ── field editor ──────────────────────────────────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function FieldEditor({
  label, field, min, max, onChange, names,
}: {
  label: string;
  field: CronField;
  min: number;
  max: number;
  onChange: (f: CronField) => void;
  names?: string[];
}) {
  function update(patch: Partial<CronField>) { onChange({ ...field, ...patch }); }

  function toggleSpecific(n: number) {
    const next = field.specific.includes(n)
      ? field.specific.filter((v) => v !== n)
      : [...field.specific, n];
    update({ specific: next });
  }

  const values = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-mono text-sm text-[#6366f1]">{fieldToStr(field)}</span>
      </div>

      {/* Mode buttons */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5 text-xs">
        {(["every", "step", "specific", "range"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => update({ mode: m })}
            className={cn("flex-1 rounded-md py-1 font-medium capitalize transition-colors", field.mode === m ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {m === "every" ? "Every" : m === "step" ? "Step" : m === "specific" ? "Pick" : "Range"}
          </button>
        ))}
      </div>

      {/* Value input per mode */}
      {field.mode === "step" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Every</span>
          <input
            type="number" min={2} max={max}
            value={field.step}
            onChange={(e) => update({ step: Math.max(2, parseInt(e.target.value) || 2) })}
            className="h-8 w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-center text-sm text-foreground focus:outline-none"
          />
          <span className="text-muted-foreground lowercase">{label.replace(" of Month","")}{field.step !== 1 ? "s" : ""}</span>
        </div>
      )}

      {field.mode === "specific" && (
        <div className="max-h-32 overflow-y-auto">
          <div className="grid grid-cols-6 gap-1">
            {values.map((n) => (
              <button
                key={n}
                onClick={() => toggleSpecific(n)}
                className={cn("rounded border py-1 text-xs font-mono transition-colors", field.specific.includes(n) ? "border-[#6366f1]/40 bg-[#6366f1]/20 text-[#6366f1]" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}
              >
                {names ? names[n - min] : n}
              </button>
            ))}
          </div>
        </div>
      )}

      {field.mode === "range" && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number" min={min} max={field.to}
            value={field.from}
            onChange={(e) => update({ from: Math.min(parseInt(e.target.value) || min, field.to) })}
            className="h-8 w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-center text-sm text-foreground focus:outline-none"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="number" min={field.from} max={max}
            value={field.to}
            onChange={(e) => update({ to: Math.max(parseInt(e.target.value) || max, field.from) })}
            className="h-8 w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-center text-sm text-foreground focus:outline-none"
          />
          {names && <span className="text-xs text-muted-foreground">({names[field.from - min]}–{names[field.to - min]})</span>}
        </div>
      )}
    </div>
  );
}

// ── copy button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" /> Copied!</> : <><Copy className="size-3.5" /> Copy</>}
    </button>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

const DEFAULT_STATE: CronState = {
  minute: defaultField(0, 59),
  hour:   defaultField(0, 23),
  dom:    defaultField(1, 31),
  month:  defaultField(1, 12),
  dow:    defaultField(0, 6),
};

export default function CronBuilderPage() {
  const [state, setState] = React.useState<CronState>(DEFAULT_STATE);
  const [rawExpr, setRawExpr] = React.useState("* * * * *");
  const [syncError, setSyncError] = React.useState(false);

  const expr = cronStr(state);

  // Sync expr → rawExpr when builder changes
  React.useEffect(() => {
    setRawExpr(expr);
    setSyncError(false);
  }, [expr]);

  function applyRawExpr(val: string) {
    setRawExpr(val);
    const parsed = parseCron(val);
    if (parsed) { setState(parsed); setSyncError(false); }
    else setSyncError(true);
  }

  function applyPreset(e: string) {
    setRawExpr(e);
    const parsed = parseCron(e);
    if (parsed) setState(parsed);
  }

  const human = toHuman(rawExpr);
  const isValid = !syncError && human !== "Invalid cron expression";
  const nextRuns = React.useMemo(() => isValid ? getNextRuns(state, 5) : [], [state, isValid]); // eslint-disable-line react-hooks/exhaustive-deps

  function update(key: keyof CronState) {
    return (f: CronField) => setState((s) => ({ ...s, [key]: f }));
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Cron Builder</p>
          <h1 className="text-2xl font-semibold tracking-tight">Cron Expression Builder</h1>
          <p className="mt-1 text-sm text-muted-foreground">Build cron expressions visually or type them directly. See the schedule in plain English and the next 5 run times.</p>
        </div>

        {/* Expression row */}
        <div className="mb-5 rounded-xl border border-white/10 bg-card/60 p-5">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cron Expression</label>
              <div className="flex items-center gap-2">
                <input
                  value={rawExpr}
                  onChange={(e) => applyRawExpr(e.target.value)}
                  spellCheck={false}
                  className={cn("h-10 flex-1 rounded-lg border bg-white/[0.03] px-4 font-mono text-lg text-foreground focus:outline-none focus:ring-1 transition-colors",
                    syncError ? "border-red-500/40 focus:ring-red-500/20" : "border-white/10 focus:ring-white/10")}
                />
                <CopyBtn text={rawExpr} />
                <button onClick={() => { setState(DEFAULT_STATE); }} title="Reset" className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
                  <RefreshCw className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Human description */}
          <div className={cn("rounded-lg border px-4 py-2.5 text-sm transition-colors", isValid ? "border-[#6366f1]/20 bg-[#6366f1]/[0.06] text-foreground" : "border-red-500/20 bg-red-500/10 text-red-400")}>
            {human}
          </div>

          {/* Next runs */}
          {isValid && nextRuns.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Next {nextRuns.length} runs</p>
              <div className="flex flex-wrap gap-2">
                {nextRuns.map((d, i) => (
                  <span key={i} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted-foreground">
                    {d.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                onClick={() => applyPreset(p.expr)}
                className={cn("rounded-lg border px-3 py-1.5 text-xs transition-colors", rawExpr === p.expr ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-[#6366f1]" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground")}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Field editors */}
        <div className="mb-2">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{rawExpr}</span>
            <span>=</span>
            <span>minute · hour · day-of-month · month · day-of-week</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FieldEditor label="Minute"       field={state.minute} min={0}  max={59} onChange={update("minute")} />
          <FieldEditor label="Hour"         field={state.hour}   min={0}  max={23} onChange={update("hour")} />
          <FieldEditor label="Day of Month" field={state.dom}    min={1}  max={31} onChange={update("dom")} />
          <FieldEditor label="Month"        field={state.month}  min={1}  max={12} onChange={update("month")} names={MONTH_NAMES} />
          <FieldEditor label="Day of Week"  field={state.dow}    min={0}  max={6}  onChange={update("dow")}   names={DOW_NAMES} />
        </div>
      </main>
    </div>
  );
}
