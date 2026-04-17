"use client";

import * as React from "react";
import { Check, Copy, Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "PTR",
  "SRV",
  "CAA",
] as const;

type RecordType = (typeof RECORD_TYPES)[number];

/** RFC 6895 DNS response codes */
const DNS_STATUS: Record<number, string> = {
  0: "NOERROR — query succeeded",
  1: "FORMERR — malformed query",
  2: "SERVFAIL — server failed to complete the lookup",
  3: "NXDOMAIN — domain does not exist",
  4: "NOTIMP — query type not implemented",
  5: "REFUSED — server refused the query",
  6: "YXDOMAIN — name exists when it should not",
  7: "YXRRSET — RR set exists when it should not",
  8: "NXRRSET — RR set that should exist does not",
  9: "NOTAUTH — not authorized",
  10: "NOTZONE — name not contained in zone",
};

/** Common DNS RR type numbers (IANA) */
const RR_TYPE_NAMES: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
  35: "NAPTR",
  39: "DNAME",
  41: "OPT",
  43: "DS",
  46: "RRSIG",
  47: "NSEC",
  48: "DNSKEY",
  257: "CAA",
  65: "HTTPS",
};

type DnsQuestion = { name: string; type: number };
type DnsRr = { name: string; type: number; TTL?: number; data: string };

type DnsGoogleJson = {
  Status: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: DnsQuestion[];
  Answer?: DnsRr[];
  Authority?: DnsRr[];
  Additional?: DnsRr[];
  Comment?: string;
};

function rrTypeName(type: number): string {
  return RR_TYPE_NAMES[type] ?? `TYPE${type}`;
}

/** Strip URLs/paths so users can paste a full link and still resolve the host. */
function parseHostname(raw: string): string {
  const t = raw.trim().replace(/\.$/, "");
  if (!t) return "";

  if (/^https?:\/\//i.test(t)) {
    try {
      return new URL(t).hostname;
    } catch {
      return t;
    }
  }

  if (t.includes("://")) {
    try {
      return new URL(t).hostname;
    } catch {
      /* fall through */
    }
  }

  if (t.includes("/") || t.includes("?") || t.includes("#")) {
    try {
      return new URL(`https://${t}`).hostname;
    } catch {
      return t.split("/")[0]?.split("?")[0]?.split("#")[0]?.split(":")[0] ?? t;
    }
  }

  return t.split(":")[0] ?? t;
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

function FlagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

function RecordTable({
  title,
  rows,
}: {
  title: string;
  rows: DnsRr[] | undefined;
}) {
  if (!rows?.length) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="border-b border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <span className="ml-2 text-xs text-muted-foreground">({rows.length})</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {rows.map((rr, i) => {
          const typeLabel = rrTypeName(rr.type);
          const copyText =
            typeLabel === "MX" && rr.data.includes(" ")
              ? rr.data.split(/\s+/).slice(1).join(" ")
              : rr.data;
          return (
            <div
              key={`${rr.name}-${rr.type}-${i}-${rr.data}`}
              className="flex flex-col gap-2 bg-white/[0.02] px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {typeLabel}
                  </span>
                  {rr.TTL != null && (
                    <span className="text-[10px] text-muted-foreground/60">TTL {rr.TTL}s</span>
                  )}
                </div>
                <p className="break-all font-mono text-xs text-foreground">{rr.data}</p>
                <p className="truncate text-[10px] text-muted-foreground/50">{rr.name}</p>
              </div>
              <CopyBtn text={copyText} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DnsLookupPage() {
  const [hostInput, setHostInput] = React.useState("");
  const [recordType, setRecordType] = React.useState<RecordType>("A");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<DnsGoogleJson | null>(null);
  const [resolvedName, setResolvedName] = React.useState("");

  async function lookup() {
    const hostname = parseHostname(hostInput);
    if (!hostname) {
      setError("Enter a domain or URL.");
      setResult(null);
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);
    setResolvedName(hostname);

    const url = new URL("https://dns.google/resolve");
    url.searchParams.set("name", hostname);
    url.searchParams.set("type", recordType);

    try {
      const res = await fetch(url.toString(), { method: "GET" });
      if (!res.ok) {
        setError(`DNS API returned HTTP ${res.status}. Try again in a moment.`);
        setLoading(false);
        return;
      }
      const json = (await res.json()) as DnsGoogleJson;
      if (typeof json.Status !== "number") {
        setError("Unexpected response from DNS API.");
        setLoading(false);
        return;
      }
      setResult(json);
    } catch {
      setError("Network error — check your connection or try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusLabel =
    result != null
      ? DNS_STATUS[result.Status] ?? `Unknown status (${result.Status})`
      : "";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / DNS Lookup</p>
          <h1 className="text-2xl font-semibold tracking-tight">DNS Lookup</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Resolve DNS records for any hostname. Queries go to{" "}
            <span className="text-foreground/80">Google Public DNS</span> over HTTPS (JSON API) —
            no API key, no server round-trip through DevKit.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="dns-host" className="text-sm font-medium">
              Domain or URL
            </label>
            <input
              id="dns-host"
              value={hostInput}
              onChange={(e) => setHostInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void lookup();
                }
              }}
              placeholder="example.com or https://example.com/path"
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <div className="w-full space-y-1.5 sm:w-40">
            <label htmlFor="dns-type" className="text-sm font-medium">
              Record type
            </label>
            <select
              id="dns-type"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as RecordType)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-white/20 [color-scheme:dark]"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void lookup()}
            disabled={loading}
            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-5 text-sm font-semibold text-white transition hover:bg-[#4f51d4] disabled:cursor-not-allowed disabled:opacity-60 sm:mb-0"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {loading ? "Looking up…" : "Look up"}
          </button>
        </div>

        <p className="mb-6 text-[11px] text-muted-foreground/60">
          Tip: press{" "}
          <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          in the domain field to run a lookup.
        </p>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        {result && (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-card/60 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm text-foreground">{resolvedName}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                    result.Status === 0
                      ? "bg-emerald-500/15 text-emerald-400"
                      : result.Status === 3
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400",
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              {result.Question && result.Question.length > 0 && (
                <p className="mb-3 text-xs text-muted-foreground">
                  Question:{" "}
                  <span className="font-mono text-foreground/90">
                    {result.Question.map((q) => `${q.name} ${rrTypeName(q.type)}`).join(" · ")}
                  </span>
                </p>
              )}

              

              <div className="grid gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-2 lg:grid-cols-4">
                <FlagRow label="Truncated (TC)" value={result.TC ? "yes" : "no"} />
                <FlagRow label="Recursion desired (RD)" value={result.RD ? "yes" : "no"} />
                <FlagRow label="Recursion available (RA)" value={result.RA ? "yes" : "no"} />
                <FlagRow label="DNSSEC authentic (AD)" value={result.AD ? "yes" : "no"} />
              </div>

              {result.Comment && (
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
                  {result.Comment}
                </p>
              )}
            </div>

            {!result.Answer?.length &&
            !result.Authority?.length &&
            !result.Additional?.length &&
            result.Status === 0 ? (
              <p className="text-sm text-muted-foreground">
                No records returned for {recordType}. The name exists but this record type is empty
                for this zone.
              </p>
            ) : null}

            <RecordTable title="Answer" rows={result.Answer} />
            <RecordTable title="Authority" rows={result.Authority} />
            <RecordTable title="Additional" rows={result.Additional} />

            <div className="rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">Raw JSON</span>
                <CopyBtn text={JSON.stringify(result, null, 2)} />
              </div>
              <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed text-muted-foreground">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
