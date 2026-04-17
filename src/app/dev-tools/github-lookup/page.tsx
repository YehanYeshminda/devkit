"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

type Parsed =
  | { kind: "user"; login: string }
  | { kind: "repo"; owner: string; repo: string };

function parseGithubQuery(raw: string): Parsed | null {
  let s = raw.trim();
  if (!s) return null;
  if (s.startsWith("@")) s = s.slice(1);

  if (/github\.com/i.test(s)) {
    try {
      const u = /^https?:\/\//i.test(s) ? new URL(s) : new URL(`https://${s}`);
      const seg = u.pathname.split("/").filter(Boolean);
      if (seg[0] === "orgs" && seg[1]) {
        return { kind: "user", login: seg[1] };
      }
      if (seg.length >= 2) {
        const owner = seg[0];
        const repo = seg[1].replace(/\.git$/, "");
        if (owner && repo) return { kind: "repo", owner, repo };
      }
      if (seg.length === 1) {
        return { kind: "user", login: seg[0] };
      }
      return null;
    } catch {
      return null;
    }
  }

  if (!/\s/.test(s) && /^[^/]+\/[^/#?]+/.test(s)) {
    const slash = s.indexOf("/");
    const owner = s.slice(0, slash);
    const rest = s.slice(slash + 1);
    const repo = rest.split(/[/#?]/)[0]?.replace(/\.git$/, "") ?? "";
    if (owner && repo) return { kind: "repo", owner, repo };
  }

  if (/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(s)) {
    return { kind: "user", login: s };
  }

  return null;
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1300);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy"
      className={cn(
        "flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-colors",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]",
      )}
    >
      {ok ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
    </button>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

type RateInfo = {
  remaining: string | null;
  limit: string | null;
  reset: string | null;
};

function readRateLimit(res: Response): RateInfo {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const limit = res.headers.get("x-ratelimit-limit");
  const resetRaw = res.headers.get("x-ratelimit-reset");
  let reset: string | null = null;
  if (resetRaw) {
    const sec = Number(resetRaw);
    if (!Number.isNaN(sec)) {
      reset = new Date(sec * 1000).toLocaleString();
    }
  }
  return { remaining, limit, reset };
}

export default function GitHubLookupPage() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [payload, setPayload] = React.useState<Record<string, unknown> | null>(null);
  const [rate, setRate] = React.useState<RateInfo | null>(null);

  async function runLookup() {
    const p = parseGithubQuery(query);
    if (!p) {
      setError(
        "Enter a username (e.g. octocat), owner/repo (e.g. vercel/next.js), or a github.com URL.",
      );
      setParsed(null);
      setPayload(null);
      setRate(null);
      return;
    }

    setError("");
    setLoading(true);
    setPayload(null);
    setParsed(p);

    const url =
      p.kind === "user"
        ? `https://api.github.com/users/${encodeURIComponent(p.login)}`
        : `https://api.github.com/repos/${encodeURIComponent(p.owner)}/${encodeURIComponent(p.repo)}`;

    try {
      const res = await fetch(url, { headers: { ...GH_HEADERS } });
      setRate(readRateLimit(res));

      const json = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        const msg =
          typeof json.message === "string"
            ? json.message
            : `Request failed with HTTP ${res.status}`;
        setError(msg);
        setPayload(json);
        setLoading(false);
        return;
      }

      setPayload(json);
      setError("");
    } catch {
      setError("Network error — check your connection or try again.");
      setPayload(null);
      setRate(null);
    } finally {
      setLoading(false);
    }
  }

  const userHtml =
    parsed?.kind === "user" && payload
      ? (typeof payload.html_url === "string" ? payload.html_url : null)
      : null;
  const repoHtml =
    parsed?.kind === "repo" && payload
      ? (typeof payload.html_url === "string" ? payload.html_url : null)
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / GitHub Lookup</p>
          <h1 className="text-2xl font-semibold tracking-tight">GitHub Lookup</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Fetch public profile or repository metadata from{" "}
            <span className="text-foreground/80">api.github.com</span>. No token — anonymous
            requests are limited to{" "}
            <span className="text-foreground/80">60 calls per hour per IP</span> (GitHub&apos;s
            limit, shown below after each request).
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="gh-query" className="text-sm font-medium">
              Username, owner/repo, or URL
            </label>
            <input
              id="gh-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void runLookup();
                }
              }}
              placeholder="octocat · vercel/next.js · https://github.com/facebook/react"
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <button
            type="button"
            onClick={() => void runLookup()}
            disabled={loading}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-5 text-sm font-semibold text-white transition hover:bg-[#4f51d4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Fetching…" : "Look up"}
          </button>
        </div>

        <p className="mb-6 text-[11px] text-muted-foreground/60">
          Tip: press{" "}
          <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to run a lookup.
        </p>

        {rate && (rate.remaining != null || rate.limit != null) && (
          <div className="mb-6 flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-muted-foreground">
            <span>
              API rate limit:{" "}
              <span className="font-mono text-foreground/90">
                {rate.remaining ?? "—"} / {rate.limit ?? "—"}
              </span>{" "}
              remaining this hour
            </span>
            {rate.reset && (
              <span>
                Resets{" "}
                <span className="font-mono text-foreground/90">{rate.reset}</span>
              </span>
            )}
          </div>
        )}

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        {payload && parsed?.kind === "user" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-card/60 p-5 sm:flex-row sm:items-start">
              {typeof payload.avatar_url === "string" && (
                // eslint-disable-next-line @next/next/no-img-element -- external GitHub avatar, dynamic URL
                <img
                  src={payload.avatar_url}
                  alt=""
                  width={80}
                  height={80}
                  className="size-20 shrink-0 rounded-xl border border-white/10"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {typeof payload.name === "string" && payload.name.trim()
                      ? payload.name
                      : String(payload.login ?? parsed.login)}
                  </h2>
                  <span className="font-mono text-sm text-muted-foreground">
                    @{String(payload.login ?? parsed.login)}
                  </span>
                </div>
                {typeof payload.bio === "string" && payload.bio.trim() && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{payload.bio}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {typeof payload.company === "string" && payload.company && (
                    <span>{payload.company}</span>
                  )}
                  {typeof payload.location === "string" && payload.location && (
                    <span>· {payload.location}</span>
                  )}
                  {typeof payload.blog === "string" && payload.blog && (
                    <a
                      href={
                        payload.blog.startsWith("http")
                          ? payload.blog
                          : `https://${payload.blog}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6366f1] hover:underline"
                    >
                      {payload.blog}
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {userHtml && (
                    <a
                      href={userHtml}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/[0.08]"
                    >
                      Profile on GitHub <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Public repos" value={String(payload.public_repos ?? "—")} />
              <Stat label="Followers" value={String(payload.followers ?? "—")} />
              <Stat label="Following" value={String(payload.following ?? "—")} />
              <Stat
                label="Joined"
                value={
                  typeof payload.created_at === "string"
                    ? new Date(payload.created_at).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </div>
        )}

        {payload && parsed?.kind === "repo" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-card/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-mono text-lg font-semibold text-foreground">
                    {String(payload.full_name ?? `${parsed.owner}/${parsed.repo}`)}
                  </h2>
                  {typeof payload.description === "string" && payload.description.trim() && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {payload.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(payload.topics) &&
                      (payload.topics as unknown[]).filter((t) => typeof t === "string").length >
                        0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(payload.topics as string[]).slice(0, 12).map((t) => (
                            <span
                              key={t}
                              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
                {repoHtml && (
                  <a
                    href={repoHtml}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/[0.08]"
                  >
                    Repo on GitHub <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <Stat label="Stars" value={String(payload.stargazers_count ?? "—")} />
              <Stat label="Forks" value={String(payload.forks_count ?? "—")} />
              <Stat label="Open issues" value={String(payload.open_issues_count ?? "—")} />
              <Stat label="Watchers" value={String(payload.subscribers_count ?? "—")} />
              <Stat
                label="Default branch"
                value={
                  typeof payload.default_branch === "string" ? (
                    <span className="font-mono text-xs font-normal">{payload.default_branch}</span>
                  ) : (
                    "—"
                  )
                }
              />
              <Stat
                label="Language"
                value={
                  typeof payload.language === "string" ? (
                    <span className="font-mono text-xs font-normal">{payload.language}</span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>

            {typeof payload.license === "object" &&
              payload.license !== null &&
              "spdx_id" in payload.license && (
                <p className="text-xs text-muted-foreground">
                  License:{" "}
                  <span className="font-mono text-foreground/90">
                    {String((payload.license as { spdx_id?: string }).spdx_id ?? "")}
                  </span>
                </p>
              )}
          </div>
        )}

        {payload && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-xs font-semibold text-muted-foreground">Raw JSON</span>
              <CopyBtn text={JSON.stringify(payload, null, 2)} />
            </div>
            <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed text-muted-foreground">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
