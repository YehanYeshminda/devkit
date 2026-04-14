import * as React from "react";
import { Bell, Search } from "lucide-react";

export function Preview() {
  return (
    <div className="relative h-[130px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#1e1e2e]">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: "scale(0.72)", width: `${100 / 0.72}%` }}
      >
        {/* Fixed bar */}
        <header className="flex items-center justify-between border-b border-white/10 bg-[#27293d] px-5 py-3">
          {/* Left: brand + links */}
          <div className="flex shrink-0 items-center gap-5">
            <span className="text-sm font-bold text-white">Acme</span>
            <nav className="flex gap-4 text-sm text-[#ced4da]/70">
              <span>Home</span>
              <span>Pricing</span>
              <span>Docs</span>
            </nav>
          </div>

          {/* Centre: search */}
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#ced4da]/40" />
            <div className="flex h-8 w-44 items-center rounded-md border border-white/10 bg-[#1e1e2e] pl-8 text-xs text-[#ced4da]/40">
              Search…
            </div>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <button className="rounded-full p-1.5 text-[#ced4da]/70">
                <Bell className="size-4" />
              </button>
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#6366f1] text-[9px] font-bold text-white">
                3
              </span>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#6366f1] text-xs font-semibold text-white">
              JD
            </div>
          </div>
        </header>

        {/* Content hint */}
        <div className="space-y-2.5 px-8 py-6">
          <div className="h-2.5 w-3/4 rounded bg-white/[0.05]" />
          <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
        </div>
        <p className="px-8 text-xs text-white/20">
          Stays pinned at the top — content renders below
        </p>
      </div>
    </div>
  );
}
