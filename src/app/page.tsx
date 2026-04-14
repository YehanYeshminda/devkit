import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { ShareButtons } from "@/components/site/share-buttons";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

const STATS = [
  { value: "10+",  label: "UI Components" },
  { value: "40+",  label: "Tools & converters" },
  { value: "100+", label: "Code snippets" },
  { value: "0",    label: "Sign-ups needed" },
];

// Count only live tools per category
function liveCount(id: string) {
  const cat = TOOL_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.tools.filter((t) => t.status === "live").length : 0;
}

const SECTIONS = [
  {
    id: "components",
    emoji: "📦",
    name: "Component Library",
    description: "Copy-paste React & Angular components — animated buttons, navbars, data tables, and more.",
    href: "/components",
    count: "10+ components",
    gradient: "from-[#6366f1]/20 to-transparent",
    border: "border-[#6366f1]/20",
  },
  {
    id: "converters",
    emoji: "🔄",
    name: "Converters",
    description: "Base64 ↔ PDF, Image ↔ Base64, Base64 ↔ Text, JSON ↔ CSV — all in your browser, nothing uploaded.",
    href: "/converters",
    count: `${liveCount("converters")} converters`,
    gradient: "from-[#06b6d4]/20 to-transparent",
    border: "border-[#06b6d4]/20",
  },
  {
    id: "pdf-tools",
    emoji: "📑",
    name: "PDF Tools",
    description: "Merge, split, rotate, compress, delete pages, and extract pages — powered by pdf-lib entirely client-side.",
    href: "/pdf-tools",
    count: `${liveCount("pdf-tools")} tools`,
    gradient: "from-[#f59e0b]/20 to-transparent",
    border: "border-[#f59e0b]/20",
  },
  {
    id: "dev-tools",
    emoji: "⚙️",
    name: "Developer Tools",
    description: "JWT decoder, JSON formatter, Regex tester, Diff viewer, Cron builder, Timestamp converter, and more.",
    href: "/dev-tools",
    count: `${liveCount("dev-tools")} tools`,
    gradient: "from-[#8b5cf6]/20 to-transparent",
    border: "border-[#8b5cf6]/20",
  },
  {
    id: "security",
    emoji: "🔒",
    name: "Security",
    description: "Hash Generator (SHA-1, 256, 384, 512) and a Password Generator with strength metering.",
    href: "/security",
    count: `${liveCount("security")} tools`,
    gradient: "from-[#ef4444]/20 to-transparent",
    border: "border-[#ef4444]/20",
  },
  {
    id: "snippets",
    emoji: "📋",
    name: "Code Snippets",
    description: "17 CSS patterns, 40 Git commands, and 37 Bash one-liners — all searchable, all copy-paste ready.",
    href: "/snippets",
    count: "94+ snippets",
    gradient: "from-[#10b981]/20 to-transparent",
    border: "border-[#10b981]/20",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28 text-center">
          {/* Background glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#6366f1] opacity-[0.07] blur-[120px]" />
            <div className="absolute left-1/4 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-[#8b5cf6] opacity-[0.05] blur-[100px]" />
            <div className="absolute right-1/4 top-1/2 h-[300px] w-[400px] -translate-y-1/2 rounded-full bg-[#06b6d4] opacity-[0.04] blur-[100px]" />
          </div>

          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Open source · 100% free · No sign-up required
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Built for devs,{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
              with love.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            DevKit started as a personal collection of tools I kept searching for and never
            finding in one clean place. Now it&apos;s yours — components, converters,
            PDF tools, and code snippets, all offline-first.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/components"
              className="rounded-lg bg-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/25 transition hover:bg-[#4f51d4] hover:shadow-[#6366f1]/40"
            >
              Explore components
            </Link>
            <Link
              href="/dev-tools"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:bg-white/[0.09]"
            >
              Open dev tools
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── What&apos;s inside ─────────────────────────────────────────── */}
        <section className="px-6 pb-20 lg:px-10">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">What&apos;s been built</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Six sections, growing every week — all free, all client-side.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border ${s.border} bg-card/50 p-6 transition-all hover:border-white/20 hover:bg-card/80 hover:-translate-y-0.5`}
              >
                {/* gradient tint */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60`}
                />

                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {s.count}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/60 transition group-hover:text-foreground group-hover:gap-1.5">
                    Explore {s.name.toLowerCase()} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ── Share the love ───────────────────────────────────────────── */}
        <section className="px-6 py-20 text-center">
          <div className="mx-auto max-w-xl">
            {/* Heart icon */}
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl">
              ❤️
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              If it helped you, share it.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Every tool here was built in free time because I needed it. If DevKit
              saves you even five minutes, sharing it with your team or on social
              means the world — it keeps me motivated to build more.
            </p>

            <div className="mt-8">
              <ShareButtons />
            </div>

            <p className="mt-6 text-xs text-muted-foreground/50">
              No tracking links. No referral schemes. Just genuine appreciation.
            </p>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 px-6 py-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>DevKit — built with ❤️ for developers, by a developer.</span>
            <div className="flex items-center gap-5">
              <Link href="/components" className="hover:text-foreground transition-colors">Components</Link>
              <Link href="/converters" className="hover:text-foreground transition-colors">Converters</Link>
              <Link href="/dev-tools"  className="hover:text-foreground transition-colors">Dev Tools</Link>
              <Link href="/snippets"   className="hover:text-foreground transition-colors">Snippets</Link>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
