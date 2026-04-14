"use client";

import * as React from "react";

import { ComponentCard } from "@/components/site/component-card";
import { SearchBox } from "@/components/site/search";
import { SiteHeader } from "@/components/site/site-header";
import { components, FRAMEWORKS, type Framework } from "@/lib/component-registry";
import { cn } from "@/lib/utils";

export function HomeClient() {
  const [query, setQuery] = React.useState("");
  const [framework, setFramework] = React.useState<Framework | "all">("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return components.filter((c) => {
      const frameworkMatch = framework === "all" || c.framework === framework;
      if (!frameworkMatch) return false;
      if (!q) return true;
      const haystack = [c.name, c.slug, c.description, c.framework, ...(c.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, framework]);

  return (
    <div className="min-h-dvh">
      <SiteHeader>
        <SearchBox value={query} onChange={setQuery} />
      </SiteHeader>

      <main className="w-full px-5 py-8 sm:px-6 sm:py-10">
        {/* Page heading + framework tabs */}
        <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse components</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reusable UI components with preview and code.
            </p>
          </div>
          <div className="hidden rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-muted-foreground sm:block">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Framework filter tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 w-fit">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFramework(f.id)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                framework === f.id
                  ? "bg-white/10 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Component grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((component) => (
            <ComponentCard key={component.slug} component={component} />
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-xl border border-white/10 bg-card/60 p-8 text-sm text-muted-foreground">
            {framework !== "all" && query === "" ? (
              <>
                No{" "}
                <span className="font-medium text-foreground capitalize">{framework}</span>{" "}
                components yet. More coming soon.
              </>
            ) : (
              <>
                No components match{" "}
                <span className="font-mono">&ldquo;{query}&rdquo;</span>.
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
