"use client";

import * as React from "react";
import Link from "next/link";
import { marked } from "marked";
import { Check, Minus, Plus } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { computeDiff, type DiffRow } from "@/lib/diff-view";
import { cn } from "@/lib/utils";
import type { ShareKind, ShareRecordV1 } from "@/lib/share-types";

marked.setOptions({ gfm: true, breaks: true });

function LineNum({ n }: { n: number | null }) {
  return (
    <span className="w-10 shrink-0 select-none pr-2 text-right text-[10px] tabular-nums text-muted-foreground/30">
      {n ?? ""}
    </span>
  );
}

function formatExp(exp: number): string {
  try {
    return new Date(exp * 1000).toLocaleString();
  } catch {
    return String(exp);
  }
}

export function ShareReadClient({
  kind,
  payload,
  expiresAt,
}: {
  kind: ShareKind;
  payload: ShareRecordV1["payload"];
  expiresAt: number;
}) {
  const rows = React.useMemo(() => {
    if (kind !== "diff") return [] as DiffRow[];
    const p = payload as { original: string; modified: string };
    return computeDiff(p.original, p.modified);
  }, [kind, payload]);

  const jsonOut = React.useMemo(() => {
    if (kind !== "json") return "";
    const p = payload as { raw: string; indent: 2 | 4 };
    try {
      return JSON.stringify(JSON.parse(p.raw), null, p.indent);
    } catch {
      return "";
    }
  }, [kind, payload]);

  const mdHtml = React.useMemo(() => {
    if (kind !== "markdown") return "";
    const p = payload as { markdown: string };
    try {
      return marked.parse(p.markdown) as string;
    } catch {
      return "<p>Could not render markdown.</p>";
    }
  }, [kind, payload]);

  const added = rows.filter((r) => r.type === "added").length;
  const removed = rows.filter((r) => r.type === "removed").length;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          <strong className="text-amber-50">Read-only share</strong> — link expires{" "}
          <span className="font-mono text-xs">{formatExp(expiresAt)}</span>. Anyone with the link
          can view this content.
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Shared</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {kind === "diff" && "Diff"}
              {kind === "json" && "JSON"}
              {kind === "markdown" && "Markdown"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">View only — editing is disabled.</p>
          </div>
          <Link
            href="/"
            className="text-sm text-[#a5b4fc] underline-offset-2 hover:underline"
          >
            ← Back to DevKit
          </Link>
        </div>

        {kind === "diff" && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f]">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 text-xs">
              {added > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-emerald-400">
                  <Plus className="size-3" /> {added} added
                </span>
              )}
              {removed > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-1 text-red-400">
                  <Minus className="size-3" /> {removed} removed
                </span>
              )}
              {added === 0 && removed === 0 && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="size-3" /> Identical
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex min-w-0 items-baseline border-b border-white/[0.04] last:border-0",
                    row.type === "removed" && "bg-red-500/[0.08]",
                    row.type === "added" && "bg-emerald-500/[0.08]",
                    row.type === "unchanged" && "bg-transparent",
                  )}
                >
                  <LineNum n={row.origLine} />
                  <LineNum n={row.modLine} />
                  <span
                    className={cn(
                      "w-4 shrink-0 select-none text-center text-xs",
                      row.type === "removed"
                        ? "text-red-500"
                        : row.type === "added"
                          ? "text-emerald-500"
                          : "text-transparent",
                    )}
                  >
                    {row.type === "removed" ? "−" : row.type === "added" ? "+" : " "}
                  </span>
                  <pre
                    className={cn(
                      "flex-1 overflow-x-visible whitespace-pre py-0.5 pr-4 font-mono text-xs",
                      row.type === "removed" && "text-red-300",
                      row.type === "added" && "text-emerald-300",
                      row.type === "unchanged" && "text-muted-foreground/60",
                    )}
                  >
                    {row.text || " "}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {kind === "json" && (
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {jsonOut || "—"}
          </pre>
        )}

        {kind === "markdown" && (
          <div
            className="markdown-body rounded-xl border border-white/10 bg-white/[0.02] p-6"
            dangerouslySetInnerHTML={{ __html: mdHtml }}
          />
        )}
      </main>
    </div>
  );
}
