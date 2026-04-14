"use client";

import * as React from "react";
import { Check, Copy, Search } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

interface Snippet { id: string; title: string; description: string; tags: string[]; language: string; code: string; }

const SNIPPETS: Snippet[] = [
  {
    id: "gradient-text",
    title: "Gradient Text",
    description: "Apply a colorful gradient to any text using background-clip.",
    tags: ["text", "gradient", "effect"],
    language: "css",
    code: `.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`,
  },
  {
    id: "glass-morphism",
    title: "Glass Morphism Card",
    description: "Frosted glass effect for modern dark/light UIs.",
    tags: ["card", "glass", "backdrop", "effect"],
    language: "css",
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}`,
  },
  {
    id: "custom-scrollbar",
    title: "Custom Scrollbar",
    description: "Style the browser scrollbar to match your design system.",
    tags: ["scrollbar", "ux"],
    language: "css",
    code: `/* Works in Chrome, Edge, Safari */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
/* Firefox */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }`,
  },
  {
    id: "custom-checkbox",
    title: "Custom Checkbox",
    description: "Replace the native checkbox with a fully custom-styled one.",
    tags: ["form", "checkbox", "input"],
    language: "css",
    code: `.custom-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, background 0.15s;
}
.custom-checkbox:checked {
  background: #6366f1;
  border-color: #6366f1;
}
.custom-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 4px; top: 1px;
  width: 6px; height: 10px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg);
}`,
  },
  {
    id: "hover-lift",
    title: "Hover Lift Effect",
    description: "Cards that smoothly lift on hover with a shadow.",
    tags: ["card", "hover", "animation", "shadow"],
    language: "css",
    code: `.lift-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
}
.lift-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}`,
  },
  {
    id: "animated-border",
    title: "Animated Gradient Border",
    description: "A rotating gradient border using conic-gradient and masking.",
    tags: ["border", "gradient", "animation"],
    language: "css",
    code: `.gradient-border {
  --border-width: 2px;
  position: relative;
  border-radius: 12px;
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--border-width));
  border-radius: inherit;
  background: conic-gradient(from 0deg, #6366f1, #a855f7, #ec4899, #6366f1);
  animation: spin-border 3s linear infinite;
  z-index: -1;
}
@keyframes spin-border { to { rotate: 360deg; } }`,
  },
  {
    id: "skeleton-loader",
    title: "Skeleton Loading",
    description: "Animated skeleton screen placeholder for loading states.",
    tags: ["loading", "skeleton", "animation"],
    language: "css",
    code: `.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.06) 25%,
    rgba(255,255,255,0.12) 50%,
    rgba(255,255,255,0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}`,
  },
  {
    id: "text-clamp",
    title: "Clamp Multiline Text",
    description: "Truncate text after N lines with an ellipsis.",
    tags: ["text", "truncate", "typography"],
    language: "css",
    code: `.clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
/* Single-line truncation */
.truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`,
  },
  {
    id: "flexbox-center",
    title: "Flexbox Dead Center",
    description: "The classic way to perfectly center anything inside a container.",
    tags: ["layout", "flexbox", "centering"],
    language: "css",
    code: `.center-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh; /* or any height */
}`,
  },
  {
    id: "auto-grid",
    title: "Auto-fill Responsive Grid",
    description: "A grid that auto-fills columns and stays responsive with no media queries.",
    tags: ["layout", "grid", "responsive"],
    language: "css",
    code: `.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    id: "aspect-ratio",
    title: "Aspect Ratio Box",
    description: "Maintain a 16:9 (or any) ratio without JavaScript.",
    tags: ["layout", "responsive", "ratio"],
    language: "css",
    code: `/* Modern approach */
.ratio-16-9 {
  aspect-ratio: 16 / 9;
  width: 100%;
  object-fit: cover; /* for img/video */
}

/* Legacy fallback */
.ratio-box {
  position: relative;
  padding-top: 56.25%; /* 9/16 = 56.25% */
}
.ratio-box > * {
  position: absolute;
  inset: 0;
}`,
  },
  {
    id: "css-variables",
    title: "CSS Variable Theme Setup",
    description: "Define a design token system with CSS custom properties and dark mode.",
    tags: ["variables", "theme", "dark-mode"],
    language: "css",
    code: `:root {
  --color-bg: #0c0c10;
  --color-surface: #16161e;
  --color-border: rgba(255, 255, 255, 0.1);
  --color-text: #e2e8f0;
  --color-muted: #94a3b8;
  --color-accent: #6366f1;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,0.4);
}

@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #ffffff;
    --color-surface: #f8fafc;
    --color-border: rgba(0, 0, 0, 0.1);
    --color-text: #0f172a;
    --color-muted: #64748b;
  }
}`,
  },
  {
    id: "smooth-scroll",
    title: "Smooth Scrolling",
    description: "Enable smooth anchor scrolling site-wide.",
    tags: ["scroll", "ux"],
    language: "css",
    code: `html {
  scroll-behavior: smooth;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; }
}`,
  },
  {
    id: "gradient-button",
    title: "Gradient Button with Glow",
    description: "A vivid gradient button with animated glow on hover.",
    tags: ["button", "gradient", "hover", "effect"],
    language: "css",
    code: `.glow-button {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: #fff;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.25s, transform 0.2s;
}
.glow-button:hover {
  transform: scale(1.04);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.6), 0 0 40px rgba(168, 85, 247, 0.3);
}`,
  },
  {
    id: "mesh-gradient",
    title: "Mesh Gradient Background",
    description: "A beautiful multi-point gradient background effect.",
    tags: ["background", "gradient", "mesh"],
    language: "css",
    code: `.mesh-bg {
  background-color: #0d0d14;
  background-image:
    radial-gradient(at 20% 30%, hsla(240,60%,50%,0.25) 0px, transparent 50%),
    radial-gradient(at 80% 70%, hsla(280,60%,50%,0.2)  0px, transparent 50%),
    radial-gradient(at 50% 10%, hsla(200,80%,55%,0.15)  0px, transparent 40%),
    radial-gradient(at 10% 80%, hsla(320,60%,55%,0.15)  0px, transparent 40%);
}`,
  },
  {
    id: "focus-ring",
    title: "Accessible Focus Ring",
    description: "Custom focus ring that is visible but non-intrusive.",
    tags: ["accessibility", "focus", "form"],
    language: "css",
    code: `/* Remove default and replace with custom */
*:focus { outline: none; }
*:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
  border-radius: 4px;
}`,
  },
  {
    id: "sticky-header",
    title: "Sticky Header with Blur",
    description: "A header that becomes blurred/frosted when scrolling.",
    tags: ["header", "navigation", "backdrop"],
    language: "css",
    code: `.sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(12, 12, 16, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.2s;
}`,
  },
];

const ALL_TAGS = Array.from(new Set(SNIPPETS.flatMap(s => s.tags))).sort();

function CopyBtn({ code }: { code: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(code); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3" />Copied!</> : <><Copy className="size-3" />Copy</>}
    </button>
  );
}

export default function CSSSnippetsPage() {
  const [search, setSearch] = React.useState("");
  const [activeTag, setActiveTag] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let list = SNIPPETS;
    if (activeTag) list = list.filter(s => s.tags.includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)));
    }
    return list;
  }, [search, activeTag]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Code Snippets / CSS</p>
          <h1 className="text-2xl font-semibold tracking-tight">CSS Snippets</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ready-to-paste CSS for gradients, glass morphism, scrollbars, animations, and layouts. {SNIPPETS.length} snippets.</p>
        </div>

        {/* Search + tags */}
        <div className="mb-5 space-y-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snippets…" className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveTag(null)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", !activeTag ? "bg-[#6366f1]/20 text-[#6366f1]" : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06]")}>All</button>
            {ALL_TAGS.map(tag => <button key={tag} onClick={() => setActiveTag(t => t === tag ? null : tag)} className={cn("rounded-full px-3 py-1 text-xs font-medium transition-colors", activeTag === tag ? "bg-[#6366f1]/20 text-[#6366f1]" : "border border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.06]")}>{tag}</button>)}
          </div>
        </div>

        {/* Snippets */}
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map(snip => (
            <div key={snip.id} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-card/60 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{snip.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{snip.description}</p>
                </div>
                <CopyBtn code={snip.code} />
              </div>
              <div className="flex flex-wrap gap-1 px-4 pb-2">
                {snip.tags.map(t => <span key={t} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-muted-foreground/70">{t}</span>)}
              </div>
              <pre className="flex-1 overflow-x-auto border-t border-white/[0.06] bg-black/20 p-4 font-mono text-xs text-muted-foreground/90 leading-relaxed"><code>{snip.code}</code></pre>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-2 py-16 text-center text-sm text-muted-foreground/50">No snippets match &ldquo;{search}&rdquo;</div>}
        </div>
      </main>
    </div>
  );
}
