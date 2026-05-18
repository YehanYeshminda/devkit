import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { ShareButtons } from "@/components/site/share-buttons";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";

function liveCount(id: string) {
  const cat = TOOL_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.tools.filter((t) => t.status === "live").length : 0;
}

const SECTIONS = [
  {
    id: "components",
    tag: "UI",
    name: "Component Library",
    description:
      "Copy-paste React & Angular components — animated buttons, navbars, data tables, and more.",
    href: "/components",
    count: "10+ components",
  },
  {
    id: "converters",
    tag: "Files",
    name: "Converters",
    description:
      "Base64 ↔ PDF, Image ↔ Base64, Base64 ↔ Text, JSON ↔ CSV — all in your browser, nothing uploaded.",
    href: "/converters",
    count: `${liveCount("converters")} converters`,
  },
  {
    id: "pdf-tools",
    tag: "PDF",
    name: "PDF Tools",
    description:
      "Merge, split, rotate, compress, extract pages, and add visual signatures to PDF forms.",
    href: "/pdf-tools",
    count: `${liveCount("pdf-tools")} tools`,
  },
  {
    id: "dev-tools",
    tag: "Dev",
    name: "Developer Tools",
    description:
      "JWT decoder, JSON formatter, Regex tester, Diff viewer, Cron builder, Timestamp converter, and more.",
    href: "/dev-tools",
    count: `${liveCount("dev-tools")} tools`,
  },
  {
    id: "security",
    tag: "Security",
    name: "Security",
    description:
      "Hash Generator (SHA-1, 256, 384, 512) and a Password Generator with strength metering.",
    href: "/security",
    count: `${liveCount("security")} tools`,
  },
  {
    id: "snippets",
    tag: "Snippets",
    name: "Code Snippets",
    description:
      "17 CSS patterns, 40 Git commands, and 37 Bash one-liners — all searchable, copy-paste ready.",
    href: "/snippets",
    count: "94+ snippets",
  },
];

const WHATS_NEW = [
  {
    title: "Sign PDF",
    description:
      "Add a drawn or typed visual signature to a PDF form, position it, preview, and download.",
    href: "/pdf-tools/sign",
    badge: "New",
    area: "PDF Tools",
  },
  {
    title: "QR Generator",
    description:
      "Generate customizable QR codes from text or URLs with PNG and SVG download.",
    href: "/utilities/qr",
    badge: "New",
    area: "Utilities",
  },
  {
    title: "HTML Previewer",
    description:
      "New dev tool for writing HTML and seeing a live sandboxed preview instantly.",
    href: "/dev-tools/html-previewer",
    badge: "New",
    area: "Developer Tools",
  },
  {
    title: "Tools Search",
    description:
      "Search inside the Tools dropdown to find categories and tools faster.",
    href: "/dev-tools",
    badge: "Update",
    area: "Navigation",
  },
  {
    title: "Favorites in Tools",
    description:
      "Star your frequent tools and access them quickly from the Favorites section.",
    href: "/dev-tools",
    badge: "Update",
    area: "Navigation",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="home-bg-orb home-bg-orb-a" />
            <div className="home-bg-orb home-bg-orb-b" />
            <div className="home-bg-grid" />
          </div>

          <div className="relative mx-auto max-w-2xl">
            <p className="mb-5 text-sm text-muted-foreground">
              Open source · free · no account needed
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              The tools I kept<br />
              googling for.
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              I got tired of juggling ten tabs to decode a JWT, convert a Base64
              string, or grab a CSS snippet. DevKit is what I built instead —
              components, converters, PDF tools, and code snippets in one place,
              all offline-first.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/components"
                className="rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f51d4]"
              >
                Browse components
              </Link>
              <Link
                href="/dev-tools"
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Open dev tools
              </Link>
            </div>

            <Link
              href="/pdf-tools/sign"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-3 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-400/30 hover:bg-amber-500/[0.12]"
            >
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-amber-100">
                New
              </span>
              Sign PDF forms with draw, type, and placement controls →
            </Link>

            <p className="mt-8 text-xs text-muted-foreground/50">
              10+ components · 40+ tools · 100+ snippets · zero sign-ups
            </p>
          </div>
        </section>

        {/* ── What&apos;s inside ── */}
        <section className="px-6 pb-20 lg:px-10">
          <div className="mx-auto max-w-2xl lg:max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                What&apos;s inside
              </p>
              <Link
                href="/dev-tools"
                className="text-xs text-muted-foreground transition hover:text-foreground"
              >
                View all tools →
              </Link>
            </div>

            <div className="mb-6 rounded-xl border border-white/10 bg-card/65 p-3.5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/55">
                Recent updates
              </p>
              <div className="flex flex-wrap gap-2">
                {WHATS_NEW.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group inline-flex min-w-0 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    <span className="rounded-full border border-[#6366f1]/35 bg-[#6366f1]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#a5b4fc]">
                      {item.badge}
                    </span>
                    <span className="font-medium text-foreground/90 group-hover:text-foreground">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-border grid gap-px sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((s) => (
                <Link
                  key={s.id}
                  href={s.href}
                  className="group flex flex-col bg-card p-6 transition-colors hover:bg-muted/30"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      {s.tag}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">{s.count}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                  <span className="mt-5 text-xs text-muted-foreground/30 transition group-hover:text-muted-foreground">
                    Open →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="mx-auto w-full max-w-2xl px-6 lg:max-w-6xl lg:px-10">
          <div className="h-px bg-border/60" />
        </div>

        {/* ── Share ── */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every tool here started as something I personally needed. If DevKit
              saves you even a few minutes, sharing it helps me keep building.
            </p>
            <div className="mt-6">
              <ShareButtons />
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-border px-6 py-5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>DevKit — a developer&apos;s personal toolkit, made public.</span>
            <div className="flex items-center gap-5">
              <Link href="/components" className="transition hover:text-foreground">Components</Link>
              <Link href="/converters" className="transition hover:text-foreground">Converters</Link>
              <Link href="/dev-tools"  className="transition hover:text-foreground">Dev Tools</Link>
              <Link href="/snippets"   className="transition hover:text-foreground">Snippets</Link>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
