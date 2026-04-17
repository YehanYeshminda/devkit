"use client";

import * as React from "react";
import { marked } from "marked";
import { Check, Copy, Download, X } from "lucide-react";
import { CreateShareLinkButton } from "@/components/share/create-share-link-button";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

// Configure marked options
marked.setOptions({ gfm: true, breaks: true });

const SAMPLE = `# Markdown Preview

A **live preview** for your Markdown. Supports _GitHub Flavored Markdown_.

## Features

- [x] Task lists
- [x] Tables
- [ ] Images (paste a URL)
- [x] Fenced code blocks

## Code example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Name   | Type   | Required |
|--------|--------|----------|
| id     | string | ✅       |
| email  | string | ✅       |
| role   | string | ❌       |

## Blockquote

> "Any fool can write code that a computer can understand.
> Good programmers write code that humans can understand."
> — Martin Fowler

---

**Bold**, _italic_, ~~strikethrough~~, and \`inline code\`.
`;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1300); } catch {} }
  return (
    <button onClick={copy} className={cn("flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", ok ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground")}>
      {ok ? <><Check className="size-3.5" />Copied!</> : <><Copy className="size-3.5" />Copy MD</>}
    </button>
  );
}

export default function MarkdownPreviewPage() {
  const [md, setMd] = React.useState(SAMPLE);

  const html = React.useMemo(() => {
    try { return marked.parse(md) as string; } catch { return "<p>Parse error</p>"; }
  }, [md]);

  function downloadMd() {
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "document.md"; a.click();
    URL.revokeObjectURL(url);
  }

  const wordCount = md.trim() ? md.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Developer Tools / Markdown Preview</p>
            <h1 className="text-2xl font-semibold tracking-tight">Markdown Preview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Live preview with GitHub Flavored Markdown — tables, task lists, fenced code blocks.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CreateShareLinkButton kind="markdown" getPayload={() => ({ markdown: md })} disabled={!md.trim()} />
            <span className="text-xs text-muted-foreground">{wordCount} words · ~{readingTime} min read</span>
            <CopyBtn text={md} />
            <button onClick={downloadMd} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
              <Download className="size-3.5" />Download
            </button>
            {md !== SAMPLE && <button onClick={() => setMd(SAMPLE)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><X className="size-3" />Reset</button>}
          </div>
        </div>

        {/* Split pane */}
        <div className="grid h-[calc(100vh-14rem)] min-h-[500px] gap-4 lg:grid-cols-2">
          {/* Editor */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Markdown</span>
              <span className="ml-auto text-[10px] text-muted-foreground/40">{md.length} chars</span>
            </div>
            <textarea
              value={md}
              onChange={e => setMd(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none bg-white/[0.02] p-4 font-mono text-sm text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10">
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">Preview</span>
            </div>
            <div
              className="markdown-body flex-1 overflow-y-auto bg-white/[0.02] p-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
