"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_URL = "https://devkit-seven.vercel.app";

const SHARE_OPTIONS = [
  {
    id: "twitter",
    label: "Share on X",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.633 5.902-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    url: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent("DevKit — free dev tools in one tab. Copy-paste components, PDF tools, converters, and 100+ code snippets. No sign-up.")}&url=${encodeURIComponent(SITE_URL)}`,
    className: "bg-black border-white/10 hover:bg-neutral-900",
  },
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    url: () => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent("DevKit — free developer toolkit")}&summary=${encodeURIComponent("Copy-paste UI components, PDF tools, converters, and 100+ code snippets. Free, browser-based, no sign-up.")}`,
    className: "bg-[#0a66c2]/80 border-[#0a66c2]/50 hover:bg-[#0a66c2]",
  },
] as const;

export function ShareButtons() {
  const [copied, setCopied] = React.useState(false);

  async function copyLink() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : SITE_URL;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SHARE_OPTIONS.map((o) => (
        <a
          key={o.id}
          href={o.url()}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium text-white transition-colors",
            o.className
          )}
        >
          {o.icon}
          {o.label}
        </a>
      ))}

      <button
        onClick={copyLink}
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
        )}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
