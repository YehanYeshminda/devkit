"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ChevronDown, LayoutDashboard, Search, Star, X } from "lucide-react";

import { Logo } from "@/components/site/logo";
import { TOOL_CATEGORIES } from "@/lib/tools-registry";
import { cn } from "@/lib/utils";

// ── Mega-menu: 4 columns, each category capped at 5 visible tools ─────────
const MENU_COLS = [
  [TOOL_CATEGORIES[0], TOOL_CATEGORIES[1]],            // Converters + PDF Tools
  [TOOL_CATEGORIES[2], TOOL_CATEGORIES[4], TOOL_CATEGORIES[5]], // Image + Security + Utilities
  [TOOL_CATEGORIES[3]],                                // Dev Tools (many)
  [TOOL_CATEGORIES[6]],                                // Code Snippets
];
const MAX_TOOLS_IN_MENU = 5;
const TOOLS_FAVORITES_STORAGE_KEY = "devkit.tools.favorites.v1";

type FlattenedTool = {
  categoryId: string;
  categoryName: string;
  categoryHref: string;
  tool: (typeof TOOL_CATEGORIES)[number]["tools"][number];
};

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [favoriteHrefs, setFavoriteHrefs] = React.useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Close on navigation
  React.useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(TOOLS_FAVORITES_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setFavoriteHrefs(parsed.filter((v): v is string => typeof v === "string"));
    } catch {
      // Ignore malformed localStorage value.
    } finally {
      setFavoritesReady(true);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined" || !favoritesReady) return;
    try {
      window.localStorage.setItem(TOOLS_FAVORITES_STORAGE_KEY, JSON.stringify(favoriteHrefs));
    } catch {
      // Ignore storage write failures.
    }
  }, [favoriteHrefs, favoritesReady]);

  const isToolsActive =
    ["/converters", "/pdf-tools", "/image-tools", "/dev-tools", "/security", "/utilities"]
      .some((p) => pathname === p || pathname.startsWith(p + "/"));

  const normalizedQuery = query.trim().toLowerCase();

  const allTools = React.useMemo<FlattenedTool[]>(
    () =>
      TOOL_CATEGORIES.flatMap((category) =>
        category.tools.map((tool) => ({
          categoryId: category.id,
          categoryName: category.name,
          categoryHref: category.href,
          tool,
        })),
      ),
    [],
  );

  const favoriteTools = React.useMemo(
    () =>
      favoriteHrefs
        .map((href) => allTools.find((entry) => entry.tool.href === href))
        .filter((entry): entry is FlattenedTool => Boolean(entry)),
    [allTools, favoriteHrefs],
  );

  const filteredByCategory = React.useMemo(() => {
    if (!normalizedQuery) return TOOL_CATEGORIES;
    return TOOL_CATEGORIES.map((category) => ({
      ...category,
      tools: category.tools.filter((tool) => {
        const haystack = [
          category.name,
          tool.name,
          tool.description,
          ...(tool.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    })).filter((category) => category.tools.length > 0);
  }, [normalizedQuery]);

  function toggleFavorite(href: string) {
    setFavoriteHrefs((prev) =>
      prev.includes(href) ? prev.filter((v) => v !== href) : [...prev, href],
    );
  }

  function renderToolItem({
    tool,
    compact = false,
  }: {
    tool: FlattenedTool["tool"];
    compact?: boolean;
  }) {
    const isFavorite = favoriteHrefs.includes(tool.href);

    return (
      <li key={tool.href}>
        <div
          className={cn(
            "group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors",
            compact ? "bg-white/[0.02]" : "",
            tool.status === "live" ? "hover:bg-white/[0.06]" : "cursor-default select-none",
          )}
        >
          <Link
            href={tool.status === "live" ? tool.href : "#"}
            onClick={tool.status === "soon" ? (e) => e.preventDefault() : undefined}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 text-xs",
              tool.status === "live"
                ? "text-muted-foreground group-hover:text-foreground"
                : "text-muted-foreground/35",
            )}
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", tool.status === "live" ? "bg-emerald-500" : "bg-white/20")} />
            <span className="truncate">{tool.name}</span>
            {tool.status === "soon" && (
              <span className="ml-auto text-[9px] font-medium uppercase tracking-wide text-muted-foreground/30">soon</span>
            )}
          </Link>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(tool.href);
            }}
            title={isFavorite ? "Remove favorite" : "Add favorite"}
            aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
            aria-pressed={isFavorite}
            className={cn(
              "rounded-md p-1 text-muted-foreground/40 transition-colors hover:text-amber-300",
              isFavorite && "text-amber-400",
            )}
          >
            <Star className={cn("size-3.5", isFavorite && "fill-current")} />
          </button>
        </div>
      </li>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex w-full items-center gap-3 px-5 py-3 sm:px-6">

        {/* Logo + nav */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Logo />

          <nav className="ml-2 hidden items-center md:flex">
            <NavLink href="/" label="Home" pathname={pathname} exact />
            <NavLink href="/components" label="Components" pathname={pathname} />

            {/* Tools dropdown trigger */}
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isToolsActive || open
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                Tools
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </button>

              {/* ── Mega-menu ── */}
              {open && (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[860px] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#0c0c10] p-5 shadow-2xl ring-1 ring-black/40">
                  {/* Close button */}
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground/50 hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>

                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3">
                    <Search className="size-3.5 shrink-0 text-muted-foreground/60" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search tools, categories, or tags..."
                      className="h-9 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/45"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {favoriteTools.length > 0 && (
                    <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-amber-300/90">
                        Favorites
                      </p>
                      <ul className="grid grid-cols-2 gap-1.5">
                        {favoriteTools.slice(0, 8).map((entry) => (
                          <li key={entry.tool.href}>
                            <Link
                              href={entry.tool.status === "live" ? entry.tool.href : "#"}
                              onClick={entry.tool.status === "soon" ? (e) => e.preventDefault() : undefined}
                              className={cn(
                                "group flex items-center gap-2 rounded-md border border-amber-500/20 px-2.5 py-1.5 text-xs transition-colors",
                                entry.tool.status === "live"
                                  ? "text-amber-100/90 hover:bg-amber-500/15"
                                  : "cursor-default text-amber-100/45",
                              )}
                            >
                              <Star className="size-3 shrink-0 fill-current text-amber-300" />
                              <span className="truncate">{entry.tool.name}</span>
                              <span className="ml-auto truncate text-[10px] text-amber-200/70">
                                {entry.categoryName}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {normalizedQuery ? (
                    filteredByCategory.length > 0 ? (
                      <div className="grid max-h-[300px] grid-cols-3 gap-5 overflow-y-auto pr-1">
                        {filteredByCategory.map((cat) => (
                          <div key={cat.id}>
                            <Link href={cat.href} className="mb-2 flex items-center gap-1.5 group">
                              <span className="text-sm">{cat.emoji}</span>
                              <span className="text-xs font-semibold text-foreground/80 group-hover:text-[#6366f1] transition-colors">
                                {cat.name}
                              </span>
                            </Link>
                            <ul className="space-y-1">
                              {cat.tools.map((tool) => renderToolItem({ tool, compact: true }))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-white/10 p-5 text-center text-sm text-muted-foreground/60">
                        No tools match "{query.trim()}".
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-4 gap-5">
                      {MENU_COLS.map((col, ci) => (
                        <div key={ci} className="space-y-5">
                          {col.map((cat) => {
                            const visible = cat.tools.slice(0, MAX_TOOLS_IN_MENU);
                            const extra = cat.tools.length - visible.length;
                            return (
                              <div key={cat.id}>
                                <Link href={cat.href} className="mb-2 flex items-center gap-1.5 group">
                                  <span className="text-sm">{cat.emoji}</span>
                                  <span className="text-xs font-semibold text-foreground/80 group-hover:text-[#6366f1] transition-colors">
                                    {cat.name}
                                  </span>
                                </Link>
                                <ul className="space-y-0.5">
                                  {visible.map((tool) => renderToolItem({ tool }))}
                                  {extra > 0 && (
                                    <li>
                                      <Link href={cat.href} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/40 hover:text-foreground transition-colors">
                                        & {extra} more →
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          {children ? (
            <div className="flex min-w-0 max-w-[11rem] flex-1 justify-end sm:max-w-xs md:max-w-sm">
              {children}
            </div>
          ) : null}
          <SignedIn>
            <Link
              href="/account"
              className={cn(
                "flex rounded-md border border-white/10 p-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground",
                pathname.startsWith("/account") && "border-white/20 bg-white/[0.06] text-foreground",
              )}
              title="Workspace"
            >
              <LayoutDashboard className="size-4" />
            </Link>
          </SignedIn>
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}

function HeaderAuth() {
  return (
    <>
      <SignedOut>
        <div className="flex items-center gap-1.5">
          <SignInButton>
            <button
              type="button"
              className={cn(
                "rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition sm:px-3 sm:text-sm",
                "hover:bg-white/[0.08] hover:text-foreground",
              )}
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              type="button"
              className="rounded-md bg-[#6366f1] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4f51d4] sm:px-3 sm:text-sm"
            >
              Sign up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SignedIn>
    </>
  );
}

function NavLink({
  href, label, pathname, exact,
}: {
  href: string; label: string; pathname: string; exact?: boolean;
}) {
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-white/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
