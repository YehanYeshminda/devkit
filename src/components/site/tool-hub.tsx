import Link from "next/link";

import { SiteHeader } from "@/components/site/site-header";
import type { ToolCategory } from "@/lib/tools-registry";

export function ToolHub({ category }: { category: ToolCategory }) {
  const liveCount = category.tools.filter((t) => t.status === "live").length;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 py-10 sm:px-8 lg:px-10">
        {/* Breadcrumb */}
        <p className="mb-3 text-xs text-muted-foreground">
          Tools / {category.name}
        </p>

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{category.emoji}</span>
              <h1 className="text-2xl font-semibold tracking-tight">
                {category.name}
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {category.description}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
            {liveCount} of {category.tools.length} live
          </div>
        </div>

        {/* Tool grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {category.tools.map((tool) => (
            <div
              key={tool.href}
              className="flex flex-col rounded-xl border border-white/10 bg-card/60 p-5 transition-colors hover:border-white/20"
            >
              {/* Icon row */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-xl">
                  {tool.emoji}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    tool.status === "live"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-white/[0.06] text-muted-foreground/50"
                  }`}
                >
                  {tool.status === "live" ? "Live" : "Coming soon"}
                </span>
              </div>

              <h2 className="text-sm font-semibold">{tool.name}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">
                {tool.description}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(tool.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {tool.status === "live" ? (
                <Link
                  href={tool.href}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-white/[0.08]"
                >
                  Open tool →
                </Link>
              ) : (
                <span className="mt-4 inline-flex w-fit items-center rounded-md border border-white/[0.06] px-3.5 py-2 text-sm text-muted-foreground/40">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
