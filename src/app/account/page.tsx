"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { LayoutDashboard, Trash2 } from "lucide-react";

import { useDevkitWorkspace } from "@/components/site/devkit-workspace-provider";
import { SiteHeader } from "@/components/site/site-header";

function AccountInner() {
  const { state, syncError, clearRecentTools, removeSnippetPin, setWorkspacePrefs, snippetHref } =
    useDevkitWorkspace();
  const spacious = Boolean(state.prefs.spaciousSnippetCards);

  return (
    <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
      <div className="mb-8">
        <p className="mb-1.5 text-xs text-muted-foreground">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Recent tools, pinned snippets, and a few preferences sync to your Clerk profile when
          you&apos;re signed in. Otherwise they stay on this device only.
        </p>
      </div>

      {syncError && (
        <p className="mb-6 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {syncError}
        </p>
      )}

      <section className="mb-10 rounded-xl border border-white/10 bg-card/50 p-5">
        <h2 className="text-sm font-semibold text-foreground">Preferences</h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={spacious}
            onChange={(e) => setWorkspacePrefs({ spaciousSnippetCards: e.target.checked })}
            className="mt-1 size-4 rounded border-white/20 bg-white/[0.04] accent-[#6366f1]"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Spacious snippet grids</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Adds a bit more vertical spacing on CSS, Git, and Bash snippet pages.
            </span>
          </span>
        </label>
      </section>

      <section className="mb-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Recent tools</h2>
          {state.recentTools.length > 0 && (
            <button
              type="button"
              onClick={clearRecentTools}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
            >
              <Trash2 className="size-3" />
              Clear
            </button>
          )}
        </div>
        {state.recentTools.length === 0 ? (
          <p className="text-sm text-muted-foreground/70">Browse tools and pages — they&apos;ll show up here.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10">
            {state.recentTools.map((r) => (
              <li key={`${r.href}-${r.at}`}>
                <Link
                  href={r.href}
                  className="flex items-center justify-between gap-3 bg-white/[0.02] px-4 py-3 text-sm transition hover:bg-white/[0.05]"
                >
                  <span className="font-medium text-foreground">{r.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground/60">{r.href}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Pinned snippets</h2>
        {state.pinnedSnippets.length === 0 ? (
          <p className="text-sm text-muted-foreground/70">
            Open CSS, Git, or Bash snippets and use <strong className="text-foreground/80">Pin</strong> on a
            card.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10">
            {state.pinnedSnippets.map((p) => (
              <li key={`${p.category}-${p.id}`}>
                <div className="flex items-center justify-between gap-3 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.05]">
                  <Link href={snippetHref(p.category, p.id)} className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{p.title}</span>
                    <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground/50">
                      {p.category}
                    </span>
                  </Link>
                  <button
                    type="button"
                    title="Remove pin"
                    onClick={() => removeSnippetPin(p.category, p.id)}
                    className="shrink-0 rounded-md border border-white/10 p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function AccountPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <SignedOut>
        <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <LayoutDashboard className="mb-4 size-10 text-muted-foreground/40" />
          <h1 className="text-xl font-semibold tracking-tight">Sign in for a synced workspace</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Recent tools, pinned snippets, and preferences can follow you across devices once you
            have an account.
          </p>
          <SignInButton>
            <button
              type="button"
              className="mt-6 rounded-lg bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f51d4]"
            >
              Sign in
            </button>
          </SignInButton>
        </main>
      </SignedOut>
      <SignedIn>
        <AccountInner />
      </SignedIn>
    </div>
  );
}
