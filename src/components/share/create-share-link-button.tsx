"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, Link2, Loader2 } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ShareKind } from "@/lib/share-types";

type Props = {
  kind: ShareKind;
  getPayload: () => Record<string, unknown>;
  disabled?: boolean;
  className?: string;
};

export function CreateShareLinkButton({ kind, getPayload, disabled, className }: Props) {
  const { isLoaded, isSignedIn } = useAuth();
  const [ttl, setTtl] = React.useState(24);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ok, setOk] = React.useState(false);
  const [hint, setHint] = React.useState("");

  async function createLink() {
    setError("");
    setHint("");
    setOk(false);
    setLoading(true);
    try {
      const payload = getPayload();
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ttlHours: ttl, payload }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        path?: string;
        storage?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not create share");
        return;
      }
      const path = data.path;
      if (!path) {
        setError("Invalid response");
        return;
      }
      const full = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(full);
      setOk(true);
      setTimeout(() => setOk(false), 2200);
      if (data.storage === "memory") {
        setHint(
          "Using in-memory storage (dev). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.",
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <button type="button" disabled className={cn("rounded-lg border border-white/10 px-3 py-1.5 text-xs opacity-50", className)}>
        …
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">
          <Link href="/sign-in" className="text-[#a5b4fc] underline-offset-2 hover:underline">
            Sign in
          </Link>{" "}
          to create expiring share links.
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={ttl}
          onChange={(e) => setTtl(Number(e.target.value))}
          className="h-8 rounded-md border border-white/10 bg-white/[0.04] px-2 text-xs text-foreground [color-scheme:dark]"
          aria-label="Link lifetime"
        >
          {[6, 12, 24, 48, 72, 168].map((h) => (
            <option key={h} value={h}>
              {h === 168 ? "7 days" : `${h}h`}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => void createLink()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
            ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
            (disabled || loading) && "cursor-not-allowed opacity-50",
          )}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : ok ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
          {loading ? "Creating…" : ok ? "Copied link" : "Create share link"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="max-w-md text-[11px] text-amber-200/80">{hint}</p>}
    </div>
  );
}
