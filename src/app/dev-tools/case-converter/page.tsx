"use client";

import * as React from "react";
import { Check, Copy, X } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// ── conversion helpers ─────────────────────────────────────────────────────

function tokenize(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")        // split camelCase
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")  // split acronyms
    .replace(/[-_./\\]+/g, " ")                  // separators → space
    .split(/\s+/)
    .map(w => w.toLowerCase())
    .filter(Boolean);
}

function toCamel(s: string)         { const w = tokenize(s); return w.map((t,i) => i===0?t:t[0].toUpperCase()+t.slice(1)).join(""); }
function toPascal(s: string)        { return tokenize(s).map(t => t[0].toUpperCase()+t.slice(1)).join(""); }
function toSnake(s: string)         { return tokenize(s).join("_"); }
function toKebab(s: string)         { return tokenize(s).join("-"); }
function toScreaming(s: string)     { return tokenize(s).join("_").toUpperCase(); }
function toTitle(s: string)         { return tokenize(s).map(t => t[0].toUpperCase()+t.slice(1)).join(" "); }
function toDot(s: string)           { return tokenize(s).join("."); }
function toPath(s: string)          { return tokenize(s).join("/"); }
function toFlat(s: string)          { return tokenize(s).join(""); }
function toCobol(s: string)         { return tokenize(s).join("-").toUpperCase(); }
function toUpper(s: string)         { return s.toUpperCase(); }
function toLower(s: string)         { return s.toLowerCase(); }
function toSentence(s: string)      { const t = s.toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }
function toAlternating(s: string)   { return Array.from(s).map((c,i) => i%2===0?c.toUpperCase():c.toLowerCase()).join(""); }

const CONVERSIONS = [
  { label: "camelCase",          fn: toCamel,       example: "helloWorldFoo" },
  { label: "PascalCase",         fn: toPascal,      example: "HelloWorldFoo" },
  { label: "snake_case",         fn: toSnake,       example: "hello_world_foo" },
  { label: "kebab-case",         fn: toKebab,       example: "hello-world-foo" },
  { label: "SCREAMING_SNAKE",    fn: toScreaming,   example: "HELLO_WORLD_FOO" },
  { label: "Title Case",         fn: toTitle,       example: "Hello World Foo" },
  { label: "dot.case",           fn: toDot,         example: "hello.world.foo" },
  { label: "path/case",          fn: toPath,        example: "hello/world/foo" },
  { label: "flatcase",           fn: toFlat,        example: "helloworldfoo" },
  { label: "COBOL-CASE",         fn: toCobol,       example: "HELLO-WORLD-FOO" },
  { label: "Sentence case",      fn: toSentence,    example: "Hello world foo" },
  { label: "UPPERCASE",          fn: toUpper,       example: "HELLO WORLD FOO" },
  { label: "lowercase",          fn: toLower,       example: "hello world foo" },
  { label: "aLtErNaTiNg",        fn: toAlternating, example: "HeLlO WoRlD" },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); } catch {} }
  return (
    <button onClick={copy} className={cn("shrink-0 flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08]")}>
      {ok ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
    </button>
  );
}

export default function CaseConverterPage() {
  const [input, setInput] = React.useState("Hello World, this is a sample string");

  const results = React.useMemo(
    () => CONVERSIONS.map(c => ({ ...c, output: c.fn(input) })),
    [input]
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Case Converter</p>
          <h1 className="text-2xl font-semibold tracking-tight">Case Converter</h1>
          <p className="mt-1 text-sm text-muted-foreground">Convert text between camelCase, snake_case, PascalCase, kebab-case, and 10 more formats — all at once.</p>
        </div>

        {/* Input */}
        <div className="mb-6 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input text</label>
            {input && <button onClick={() => setInput("")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" />Clear</button>}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            placeholder="Type or paste any text, in any case…"
            className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-white/10"
          />
          <p className="text-xs text-muted-foreground">Handles camelCase, PascalCase, snake_case, kebab-case, and space-separated input.</p>
        </div>

        {/* Results grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ label, output }) => (
            <div key={label} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-card/60 p-4 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                <CopyBtn text={output} />
              </div>
              <p className="break-all font-mono text-sm text-foreground">{output || <span className="text-muted-foreground/40">—</span>}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
