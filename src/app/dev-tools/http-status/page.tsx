"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────────────────────

type StatusCode = {
  code: number;
  name: string;
  description: string;
  note?: string;
};

const STATUS_CODES: StatusCode[] = [
  // 1xx
  { code: 100, name: "Continue",                        description: "The server received the request headers. The client should proceed to send the body.",                note: "Useful for large uploads — client can check server willingness before sending a big body." },
  { code: 101, name: "Switching Protocols",              description: "The server agrees to switch to the protocol specified in the Upgrade header.",                       note: "Used when upgrading HTTP to WebSocket." },
  { code: 102, name: "Processing",                       description: "The server has received the request and is processing it — no response available yet.",             note: "WebDAV; prevents client timeouts on long operations." },
  { code: 103, name: "Early Hints",                      description: "Used to preload resources while the server prepares a full response.",                              note: "Allows the browser to start loading assets before the final 200 response." },
  // 2xx
  { code: 200, name: "OK",                               description: "The request was successful. The response body contains the requested data.",                        note: "Default success response for GET, POST, PUT, PATCH." },
  { code: 201, name: "Created",                          description: "The request was successful and a new resource was created.",                                        note: "Return this after a successful POST that creates a resource. Often includes a Location header." },
  { code: 202, name: "Accepted",                         description: "The request has been received but not yet acted upon. Processing is deferred.",                     note: "Good for async jobs — the work will happen later." },
  { code: 203, name: "Non-Authoritative Information",    description: "The returned metadata is not from the origin server but from a local or third-party copy.",        note: "Rare — typically used by proxies or caches." },
  { code: 204, name: "No Content",                       description: "The request was successful but there is no content to return.",                                     note: "Common for DELETE or PUT where you don't need to return a body." },
  { code: 205, name: "Reset Content",                    description: "The server fulfilled the request. The client should reset the document view.",                     note: "Instructs the browser to clear form inputs after submission." },
  { code: 206, name: "Partial Content",                  description: "The server is returning only part of the resource, as requested via a Range header.",              note: "Used for resumable downloads and video streaming." },
  { code: 207, name: "Multi-Status",                     description: "The response body contains multiple separate response codes for different sub-requests.",           note: "WebDAV — returns XML with individual statuses for batch operations." },
  { code: 208, name: "Already Reported",                 description: "Members of a DAV binding have already been enumerated and are not included again.",                 note: "WebDAV — prevents redundant enumeration in deep hierarchies." },
  { code: 226, name: "IM Used",                          description: "The server fulfilled a GET request and the response is a result of one or more instance manipulations.", note: "HTTP Delta Encoding — rarely used." },
  // 3xx
  { code: 300, name: "Multiple Choices",                 description: "The request has more than one possible response. The client should choose one.",                   note: "Rare — e.g., a resource available in multiple formats." },
  { code: 301, name: "Moved Permanently",                description: "The URL has changed permanently. The new URL is in the Location header.",                          note: "Use for permanent URL changes. Browsers and crawlers cache this redirect." },
  { code: 302, name: "Found",                            description: "The URL has changed temporarily. Future requests should use the original URL.",                    note: "Common for temporary redirects. Many clients incorrectly reuse GET on redirect." },
  { code: 303, name: "See Other",                        description: "The response to the request can be found at another URI using GET.",                               note: "Used after a POST to redirect to a confirmation page (Post/Redirect/Get pattern)." },
  { code: 304, name: "Not Modified",                     description: "The response has not been modified. The client can use its cached version.",                       note: "Used with ETag and If-None-Match for cache validation." },
  { code: 307, name: "Temporary Redirect",               description: "The URL has changed temporarily but the client must use the same HTTP method for the new request.", note: "Unlike 302, the method is preserved. Use when you need to redirect a POST." },
  { code: 308, name: "Permanent Redirect",               description: "The URL has changed permanently and the client must use the same HTTP method for the new request.", note: "Permanent version of 307. Preserves method across the redirect." },
  // 4xx
  { code: 400, name: "Bad Request",                      description: "The server cannot process the request due to a client error (e.g., malformed syntax).",            note: "Return when request body validation fails." },
  { code: 401, name: "Unauthorized",                     description: "The client must authenticate itself to get the requested response.",                               note: "Despite the name, this means 'unauthenticated'. Include a WWW-Authenticate header." },
  { code: 402, name: "Payment Required",                 description: "Reserved for future use, originally intended for digital payment systems.",                       note: "Used informally by some SaaS APIs to indicate a paid feature limit." },
  { code: 403, name: "Forbidden",                        description: "The client is authenticated but does not have permission to access this resource.",                note: "Use when you know who the user is but they lack the required role or permission." },
  { code: 404, name: "Not Found",                        description: "The server cannot find the requested resource.",                                                   note: "Also used to hide existence of forbidden resources (instead of 403)." },
  { code: 405, name: "Method Not Allowed",               description: "The request method is not supported for the target resource.",                                     note: "Return an Allow header listing the permitted methods." },
  { code: 406, name: "Not Acceptable",                   description: "The server cannot produce a response matching the Accept headers sent by the client.",            note: "Used in content negotiation — no acceptable format available." },
  { code: 407, name: "Proxy Authentication Required",    description: "Authentication is required with the proxy before the request can be fulfilled.",                  note: "Similar to 401 but for proxy auth." },
  { code: 408, name: "Request Timeout",                  description: "The server closed the connection because the client did not send a request in time.",             note: "Server can send this even without a prior request from the client." },
  { code: 409, name: "Conflict",                         description: "The request conflicts with the current state of the resource.",                                    note: "Common when trying to create a duplicate resource or concurrent edits conflict." },
  { code: 410, name: "Gone",                             description: "The requested resource was permanently deleted and will not be available again.",                  note: "Stronger than 404 — tells clients and crawlers the resource is intentionally gone." },
  { code: 411, name: "Length Required",                  description: "The server rejected the request because the Content-Length header is missing.",                   note: "Some endpoints require a known content length before processing." },
  { code: 412, name: "Precondition Failed",              description: "The server does not meet one or more preconditions in the request headers.",                      note: "Used with If-Match / If-Unmodified-Since for conditional requests." },
  { code: 413, name: "Content Too Large",                description: "The request entity is larger than limits defined by the server.",                                  note: "Common when uploading files that exceed the server's max body size." },
  { code: 414, name: "URI Too Long",                     description: "The URI requested by the client is longer than the server is willing to interpret.",              note: "Can happen with very long query strings." },
  { code: 415, name: "Unsupported Media Type",           description: "The media type of the request data is not supported by the server.",                              note: "Check Content-Type header — often happens when JSON is expected but something else is sent." },
  { code: 416, name: "Range Not Satisfiable",            description: "The range specified in the Range header cannot be fulfilled.",                                     note: "Used in partial content requests when the range is outside the resource size." },
  { code: 417, name: "Expectation Failed",               description: "The expectation given in the Expect header could not be met by the server.",                     note: "Rare — server cannot satisfy the Expect: 100-continue requirement." },
  { code: 418, name: "I'm a Teapot",                     description: "The server refuses to brew coffee because it is, permanently, a teapot.",                         note: "An April Fools' RFC 2324 joke. Some APIs return this for intentionally unimplemented routes." },
  { code: 421, name: "Misdirected Request",              description: "The request was directed to a server unable to produce a response for that URL.",                 note: "Happens with HTTP/2 connection reuse across origins." },
  { code: 422, name: "Unprocessable Content",            description: "The request is well-formed but cannot be followed due to semantic errors.",                       note: "Better than 400 for logical validation failures (e.g., invalid date range)." },
  { code: 423, name: "Locked",                           description: "The resource that is being accessed is locked.",                                                   note: "WebDAV." },
  { code: 424, name: "Failed Dependency",                description: "The request failed because it depended on another request that also failed.",                     note: "WebDAV batch operations." },
  { code: 425, name: "Too Early",                        description: "The server is unwilling to risk processing a request that might be replayed.",                    note: "Used with TLS 0-RTT to prevent replay attacks." },
  { code: 426, name: "Upgrade Required",                 description: "The server refuses to perform the request using the current protocol.",                           note: "Includes an Upgrade header indicating the required protocol." },
  { code: 428, name: "Precondition Required",            description: "The server requires the request to be conditional.",                                              note: "Forces clients to use If-Match to prevent lost updates." },
  { code: 429, name: "Too Many Requests",                description: "The user has sent too many requests in a given amount of time (rate limiting).",                  note: "Include Retry-After header to indicate when to try again." },
  { code: 431, name: "Request Header Fields Too Large",  description: "The server refuses to process the request because header fields are too large.",                  note: "Often caused by huge cookies or over-sized authorization tokens." },
  { code: 451, name: "Unavailable For Legal Reasons",    description: "The user requested a resource that cannot be provided for legal reasons.",                        note: "Named after Fahrenheit 451. Used for geo-blocks or government censorship." },
  // 5xx
  { code: 500, name: "Internal Server Error",            description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",    note: "The generic catch-all server error. Always investigate — don't expose stack traces." },
  { code: 501, name: "Not Implemented",                  description: "The request method is not supported by the server and cannot be handled.",                        note: "Unlike 405, the server doesn't recognize the method at all." },
  { code: 502, name: "Bad Gateway",                      description: "The server, acting as a gateway, received an invalid response from an upstream server.",          note: "Common when a reverse proxy (nginx/Cloudflare) can't reach your app server." },
  { code: 503, name: "Service Unavailable",              description: "The server is not ready to handle the request — typically due to maintenance or overload.",       note: "Include Retry-After header. Used during deployments or under heavy load." },
  { code: 504, name: "Gateway Timeout",                  description: "The server, acting as a gateway, did not get a response from an upstream server in time.",        note: "Upstream server is too slow. Common in microservice architectures." },
  { code: 505, name: "HTTP Version Not Supported",       description: "The HTTP version used in the request is not supported by the server.",                            note: "Extremely rare in practice." },
  { code: 506, name: "Variant Also Negotiates",          description: "The server has an internal configuration error in transparent content negotiation.",              note: "Circular reference in content negotiation — very rare." },
  { code: 507, name: "Insufficient Storage",             description: "The server cannot store the representation needed to complete the request.",                      note: "WebDAV — disk is full." },
  { code: 508, name: "Loop Detected",                    description: "The server detected an infinite loop while processing the request.",                              note: "WebDAV." },
  { code: 510, name: "Not Extended",                     description: "Further extensions to the request are required for the server to fulfill it.",                    note: "RFC 2774 — very rare." },
  { code: 511, name: "Network Authentication Required",  description: "The client needs to authenticate to gain network access.",                                        note: "Used by captive portals (hotel Wi-Fi, airport login pages)." },
];

const CATEGORIES = ["All", "1xx", "2xx", "3xx", "4xx", "5xx"] as const;
type Category = (typeof CATEGORIES)[number];

function categoryOf(code: number): string {
  if (code < 200) return "1xx";
  if (code < 300) return "2xx";
  if (code < 400) return "3xx";
  if (code < 500) return "4xx";
  return "5xx";
}

const CATEGORY_COLORS: Record<string, { badge: string; dot: string; code: string }> = {
  "1xx": { badge: "bg-blue-500/15 text-blue-400",    dot: "bg-blue-400",    code: "text-blue-400" },
  "2xx": { badge: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400", code: "text-emerald-400" },
  "3xx": { badge: "bg-amber-500/15 text-amber-400",  dot: "bg-amber-400",   code: "text-amber-400" },
  "4xx": { badge: "bg-orange-500/15 text-orange-400",dot: "bg-orange-400",  code: "text-orange-400" },
  "5xx": { badge: "bg-red-500/15 text-red-400",      dot: "bg-red-400",     code: "text-red-400" },
};

export default function HttpStatusPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<Category>("All");
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();
    return STATUS_CODES.filter((s) => {
      const matchesCategory = category === "All" || categoryOf(s.code) === category;
      const matchesQuery =
        !q ||
        String(s.code).includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / HTTP Status Codes</p>
          <h1 className="text-2xl font-semibold tracking-tight">HTTP Status Codes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete reference for all {STATUS_CODES.length} HTTP status codes — search by code, name, or description.
          </p>
        </div>

        {/* Search + filter */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code, name, or description…"
            className="h-10 w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  category === cat
                    ? cat === "All"
                      ? "bg-white/10 text-foreground"
                      : `${CATEGORY_COLORS[cat]?.badge} font-semibold`
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          {filtered.length !== STATUS_CODES.length && (
            <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground/50">
            No status codes match &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const cat = categoryOf(s.code);
              const colors = CATEGORY_COLORS[cat];
              const isOpen = expanded === s.code;
              return (
                <button
                  key={s.code}
                  onClick={() => setExpanded(isOpen ? null : s.code)}
                  className={cn(
                    "group rounded-xl border text-left transition-colors",
                    isOpen
                      ? "border-white/20 bg-white/[0.06]"
                      : "border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/80"
                  )}
                >
                  <div className="flex items-start gap-3 p-4">
                    <span className={cn("mt-0.5 size-2 shrink-0 rounded-full", colors.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("text-lg font-bold tabular-nums leading-none", colors.code)}>
                          {s.code}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">{s.name}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{s.description}</p>
                      {isOpen && s.note && (
                        <p className="mt-2 rounded-md border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-xs leading-5 text-muted-foreground/80">
                          💡 {s.note}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
