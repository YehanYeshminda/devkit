"use client";

import * as React from "react";
import { Check, Copy, X } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

type Segment = { text: string; matched: boolean; groupIdx?: number };
type MatchInfo = { match: string; index: number; groups: string[] };

function buildSegments(text: string, regex: RegExp): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = regex.global ? regex : new RegExp(regex.source, regex.flags + "g");
  re.lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segments.push({ text: text.slice(last, m.index), matched: false });
    segments.push({ text: m[0], matched: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < text.length) segments.push({ text: text.slice(last), matched: false });
  return segments;
}

function getMatches(text: string, regex: RegExp): MatchInfo[] {
  const results: MatchInfo[] = [];
  const re = regex.global ? regex : new RegExp(regex.source, regex.flags + "g");
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    results.push({ match: m[0], index: m.index, groups: Array.from(m).slice(1).map(g => g ?? "undefined") });
    if (m[0].length === 0) re.lastIndex++;
  }
  return results;
}

const FLAG_LIST = [
  { flag: "g", label: "global",     desc: "Find all matches" },
  { flag: "i", label: "insensitive",desc: "Case insensitive" },
  { flag: "m", label: "multiline",  desc: "^ and $ match line boundaries" },
  { flag: "s", label: "dotAll",     desc: ". matches newlines" },
] as const;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
      {ok ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
    </button>
  );
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = React.useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = React.useState<Set<string>>(new Set(["g", "i"]));
  const [testStr, setTestStr] = React.useState(
    "Contact us at hello@devkit.io or support@example.com\nInvalid: not-an-email, @nope"
  );
  const [error, setError] = React.useState("");

  const flagStr = ["g","i","m","s"].filter(f => flags.has(f)).join("");

  const { regex, segments, matches } = React.useMemo(() => {
    if (!pattern) return { regex: null, segments: [], matches: [] };
    try {
      const re = new RegExp(pattern, flagStr);
      setError("");
      const segs = testStr ? buildSegments(testStr, re) : [];
      const mts  = testStr ? getMatches(testStr, re) : [];
      return { regex: re, segments: segs, matches: mts };
    } catch (e) {
      setError(String(e).replace("SyntaxError: ", ""));
      return { regex: null, segments: [], matches: [] };
    }
  }, [pattern, flagStr, testStr]);

  function toggleFlag(f: string) {
    setFlags(prev => { const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n; });
  }

  const hasCaptures = matches.some(m => m.groups.length > 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Regex Tester</p>
          <h1 className="text-2xl font-semibold tracking-tight">Regex Tester</h1>
          <p className="mt-1 text-sm text-muted-foreground">Write a regular expression and test it against any text. Matches highlighted live.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: pattern + flags + test string */}
          <div className="space-y-4">
            {/* Pattern input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Pattern</label>
              <div className={cn("flex items-center rounded-lg border bg-white/[0.02] px-3 transition-colors", error ? "border-red-500/40" : "border-white/10 focus-within:border-white/20")}>
                <span className="shrink-0 font-mono text-muted-foreground/60 text-sm">/</span>
                <input
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  spellCheck={false}
                  placeholder="your pattern here"
                  className="h-10 flex-1 bg-transparent px-1 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
                />
                <span className="shrink-0 font-mono text-muted-foreground/60 text-sm">/{flagStr}</span>
                {pattern && <button onClick={() => setPattern("")} className="ml-2 text-muted-foreground/50 hover:text-foreground"><X className="size-3.5" /></button>}
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>

            {/* Flags */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Flags</label>
              <div className="flex flex-wrap gap-2">
                {FLAG_LIST.map(({ flag, label, desc }) => (
                  <button
                    key={flag}
                    onClick={() => toggleFlag(flag)}
                    title={desc}
                    className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", flags.has(flag) ? "border-[#6366f1]/40 bg-[#6366f1]/15 text-[#6366f1]" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]")}
                  >
                    <code className="font-mono">{flag}</code>
                    <span className="hidden sm:inline text-muted-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Test string */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Test string</label>
                {testStr && <button onClick={() => setTestStr("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" />Clear</button>}
              </div>
              <textarea
                value={testStr}
                onChange={e => setTestStr(e.target.value)}
                rows={10}
                spellCheck={false}
                placeholder="Paste text to test against your pattern…"
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
              />
            </div>
          </div>

          {/* Right: highlighted output + match list */}
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              {error ? (
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">Invalid pattern</span>
              ) : matches.length > 0 ? (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">{matches.length} match{matches.length !== 1 ? "es" : ""}</span>
              ) : pattern ? (
                <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-muted-foreground">No matches</span>
              ) : null}
            </div>

            {/* Highlighted preview */}
            {testStr && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Highlighted matches</label>
                <div className="min-h-[120px] rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap break-all">
                    {segments.length > 0
                      ? segments.map((seg, i) =>
                          seg.matched
                            ? <mark key={i} className="rounded bg-[#6366f1]/30 text-foreground not-italic">{seg.text}</mark>
                            : <span key={i}>{seg.text}</span>
                        )
                      : testStr}
                  </pre>
                </div>
              </div>
            )}

            {/* Match list */}
            {matches.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Match details</label>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] divide-y divide-white/[0.06]">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2">
                      <span className="mt-0.5 w-5 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground/40">{i+1}</span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 truncate rounded bg-[#6366f1]/10 px-1.5 py-0.5 font-mono text-xs text-[#6366f1]">{m.match || "(empty)"}</code>
                          <CopyBtn text={m.match} />
                          <span className="text-[10px] text-muted-foreground/40">@{m.index}</span>
                        </div>
                        {hasCaptures && m.groups.map((g, gi) => (
                          <div key={gi} className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground/50">Group {gi+1}:</span>
                            <code className="font-mono text-xs text-amber-400/80">{g}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!regex && !error && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-sm text-muted-foreground/40">
                Enter a pattern to start matching
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
