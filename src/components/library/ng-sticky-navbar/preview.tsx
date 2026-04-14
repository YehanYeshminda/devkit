import * as React from "react";
import { ChevronDown, Home, BookOpen, Mail, Package } from "lucide-react";

export function Preview() {
  return (
    /* Outer: fixed visible height, clips the oversized scaled inner */
    <div className="relative h-[130px] w-full overflow-hidden rounded-lg border border-white/10 bg-[#1e1e2e]">
      {/* Inner: renders at natural (wider) size then scales to 70% */}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: "scale(0.72)", width: `${100 / 0.72}%` }}
      >
        {/* Sticky bar */}
        <nav className="flex items-center justify-between border-b border-white/10 bg-[#27293d] px-5 py-3">
          <span className="shrink-0 text-base font-bold text-white">Acme</span>

          <ul className="flex shrink-0 items-center gap-1 text-sm">
            {[
              { icon: <Home className="size-3.5" />, label: "Home" },
              { icon: <Package className="size-3.5" />, label: "Products", drop: true },
              { icon: <BookOpen className="size-3.5" />, label: "Docs" },
              { icon: <Mail className="size-3.5" />, label: "Contact" },
            ].map(({ icon, label, drop }) => (
              <li
                key={label}
                className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-[#ced4da] hover:bg-white/[0.06]"
              >
                {icon}
                <span>{label}</span>
                {drop && <ChevronDown className="size-3 opacity-60" />}
              </li>
            ))}
          </ul>

          <button className="shrink-0 rounded-md border border-[#6366f1]/60 px-3 py-1 text-xs font-medium text-[#6366f1]">
            Sign in
          </button>
        </nav>

        {/* Content hint */}
        <div className="space-y-2.5 px-8 py-6">
          <div className="h-2.5 w-3/4 rounded bg-white/[0.05]" />
          <div className="h-2.5 w-1/2 rounded bg-white/[0.04]" />
          <div className="h-2.5 w-2/3 rounded bg-white/[0.03]" />
        </div>
        <p className="px-8 text-xs text-white/20">
          Bar sticks to the top as the page scrolls
        </p>
      </div>
    </div>
  );
}
