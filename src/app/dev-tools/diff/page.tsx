"use client";

import * as React from "react";
import { ArrowLeftRight, Check, Copy, Minus, Plus, X } from "lucide-react";

import { CreateShareLinkButton } from "@/components/share/create-share-link-button";
import { SiteHeader } from "@/components/site/site-header";
import { computeDiff, type DiffRow } from "@/lib/diff-view";
import { cn } from "@/lib/utils";

// ── helpers ───────────────────────────────────────────────────────────────────

function LineNum({ n }: { n: number | null }) {
  return (
    <span className="w-10 shrink-0 select-none text-right text-[10px] tabular-nums text-muted-foreground/30 pr-2">
      {n ?? ""}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); } catch {}
  }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" /> Copied</> : <><Copy className="size-3.5" /> Copy</>}
    </button>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const PLACEHOLDER_A = `function greet(name) {
  console.log("Hello, " + name);
  return name;
}

const result = greet("World");`;

const PLACEHOLDER_B = `function greet(name, greeting = "Hello") {
  console.log(\`\${greeting}, \${name}!\`);
  return { name, greeting };
}

const result = greet("World", "Hi");
console.log(result);`;

export default function DiffViewerPage() {
  const [original, setOriginal] = React.useState(PLACEHOLDER_A);
  const [modified, setModified] = React.useState(PLACEHOLDER_B);
  const [view, setView] = React.useState<"unified" | "split">("unified");
  const [showUnchanged, setShowUnchanged] = React.useState(true);

  const rows = React.useMemo(() => computeDiff(original, modified), [original, modified]);

  const added   = rows.filter((r) => r.type === "added").length;
  const removed = rows.filter((r) => r.type === "removed").length;
  const same    = rows.filter((r) => r.type === "unchanged").length;
  const noDiff  = added === 0 && removed === 0;

  const visibleRows = showUnchanged ? rows : rows.filter((r) => r.type !== "unchanged");

  // For split view: build left (orig) + right (mod) columns
  const splitRows = React.useMemo(() => {
    const result: { left: DiffRow | null; right: DiffRow | null }[] = [];
    let i = 0;
    while (i < rows.length) {
      const row = rows[i];
      if (row.type === "unchanged") {
        result.push({ left: row, right: { ...row } });
        i++;
      } else if (row.type === "removed") {
        // Pair with subsequent added lines
        let j = i + 1;
        while (j < rows.length && rows[j].type === "removed") j++;
        const removedGroup = rows.slice(i, j);
        const addedGroup: DiffRow[] = [];
        while (j < rows.length && rows[j].type === "added") {
          addedGroup.push(rows[j]); j++;
        }
        const maxLen = Math.max(removedGroup.length, addedGroup.length);
        for (let k = 0; k < maxLen; k++) {
          result.push({ left: removedGroup[k] ?? null, right: addedGroup[k] ?? null });
        }
        i = j;
      } else {
        result.push({ left: null, right: row });
        i++;
      }
    }
    return result;
  }, [rows]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Diff Viewer</p>
          <h1 className="text-2xl font-semibold tracking-tight">Diff Viewer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste two blocks of text or code to see a line-by-line diff. Runs entirely in the browser.
          </p>
        </div>

        {/* Input area */}
        <div className="mb-5 grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-4 items-center justify-center rounded bg-red-500/20 text-[10px] text-red-400">A</span>
                Original
              </label>
              <div className="flex gap-2">
                <CopyBtn text={original} />
                {original && <button onClick={() => setOriginal("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}
              </div>
            </div>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-4 items-center justify-center rounded bg-emerald-500/20 text-[10px] text-emerald-400">B</span>
                Modified
              </label>
              <div className="flex gap-2">
                <CopyBtn text={modified} />
                {modified && <button onClick={() => setModified("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" /> Clear</button>}
              </div>
            </div>
            <textarea
              value={modified}
              onChange={(e) => setModified(e.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 font-mono text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {/* Stats */}
          {noDiff ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Check className="size-3" /> Identical
            </span>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              {added > 0   && <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-400"><Plus className="size-3" /> {added} added</span>}
              {removed > 0 && <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-red-400"><Minus className="size-3" /> {removed} removed</span>}
              {same > 0    && <span className="text-muted-foreground/50">{same} unchanged</span>}
            </div>
          )}

          <CreateShareLinkButton
            kind="diff"
            getPayload={() => ({ original, modified })}
            disabled={!original.trim() && !modified.trim()}
          />

          {/* View toggle */}
          <div className="ml-auto flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground select-none">
              <input type="checkbox" checked={showUnchanged} onChange={(e) => setShowUnchanged(e.target.checked)} className="accent-[#6366f1]" />
              Show unchanged
            </label>
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5">
              <button onClick={() => setView("unified")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors", view === "unified" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                Unified
              </button>
              <button onClick={() => setView("split")} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors", view === "split" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                <ArrowLeftRight className="size-3" /> Split
              </button>
            </div>
          </div>
        </div>

        {/* Diff output */}
        {rows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f]">
            {view === "unified" ? (
              // ── Unified view ────────────────────────────────────────────────
              <div className="overflow-x-auto">
                {visibleRows.map((row, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex min-w-0 items-baseline border-b border-white/[0.04] last:border-0",
                      row.type === "removed"   && "bg-red-500/[0.08]",
                      row.type === "added"     && "bg-emerald-500/[0.08]",
                      row.type === "unchanged" && "bg-transparent"
                    )}
                  >
                    <LineNum n={row.origLine} />
                    <LineNum n={row.modLine} />
                    <span className={cn("w-4 shrink-0 text-center text-xs select-none",
                      row.type === "removed" ? "text-red-500" : row.type === "added" ? "text-emerald-500" : "text-transparent"
                    )}>
                      {row.type === "removed" ? "−" : row.type === "added" ? "+" : " "}
                    </span>
                    <pre className={cn("flex-1 overflow-x-visible whitespace-pre py-0.5 pr-4 font-mono text-xs",
                      row.type === "removed"   && "text-red-300",
                      row.type === "added"     && "text-emerald-300",
                      row.type === "unchanged" && "text-muted-foreground/60"
                    )}>
                      {row.text || " "}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              // ── Split view ──────────────────────────────────────────────────
              <div className="grid grid-cols-2 divide-x divide-white/[0.06] overflow-x-auto">
                {/* Left header */}
                <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-400/60">Original (A)</div>
                <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400/60">Modified (B)</div>

                {splitRows.map((pair, i) => (
                  <React.Fragment key={i}>
                    {/* Left cell */}
                    <div className={cn("flex items-baseline border-b border-white/[0.04] last:border-0", pair.left?.type === "removed" ? "bg-red-500/[0.08]" : "bg-transparent")}>
                      <LineNum n={pair.left?.origLine ?? null} />
                      {pair.left?.type === "removed" && <span className="w-3 shrink-0 text-[10px] text-red-500">−</span>}
                      <pre className={cn("flex-1 overflow-x-visible whitespace-pre py-0.5 pr-3 font-mono text-xs", pair.left?.type === "removed" ? "text-red-300" : "text-muted-foreground/60")}>
                        {pair.left?.text ?? ""}
                      </pre>
                    </div>
                    {/* Right cell */}
                    <div className={cn("flex items-baseline border-b border-white/[0.04] last:border-0", pair.right?.type === "added" ? "bg-emerald-500/[0.08]" : "bg-transparent")}>
                      <LineNum n={pair.right?.modLine ?? null} />
                      {pair.right?.type === "added" && <span className="w-3 shrink-0 text-[10px] text-emerald-500">+</span>}
                      <pre className={cn("flex-1 overflow-x-visible whitespace-pre py-0.5 pr-3 font-mono text-xs", pair.right?.type === "added" ? "text-emerald-300" : "text-muted-foreground/60")}>
                        {pair.right?.text ?? ""}
                      </pre>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
