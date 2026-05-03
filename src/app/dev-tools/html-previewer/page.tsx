"use client";

import * as React from "react";
import { Check, Copy, Download, Eye, RotateCcw } from "lucide-react";

import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

const STARTER_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
      }
      .wrap {
        max-width: 720px;
        margin: 3rem auto;
        padding: 1.5rem;
        border: 1px solid #334155;
        border-radius: 12px;
        background: #111827;
      }
      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }
      p {
        color: #94a3b8;
        line-height: 1.65;
      }
      button {
        border: 0;
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        background: #6366f1;
        color: white;
        font-weight: 600;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>HTML Previewer</h1>
      <p>Edit this HTML in the left pane and watch the live preview update.</p>
      <button>Sample Button</button>
    </div>
  </body>
</html>
`;

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setOk(true);
      setTimeout(() => setOk(false), 1300);
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
        ok
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
      )}
    >
      {ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {ok ? "Copied" : "Copy HTML"}
    </button>
  );
}

export default function HtmlPreviewerPage() {
  const [html, setHtml] = React.useState(STARTER_HTML);
  const [key, setKey] = React.useState(0);

  const chars = html.length;
  const lines = html ? html.split("\n").length : 0;

  function onDownload() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "preview.html";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Developer Tools / HTML Previewer
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">HTML Previewer</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Live HTML preview in a sandboxed iframe. Great for quick snippets,
              layouts, and style experiments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-muted-foreground">
              {lines} lines · {chars} chars
            </span>
            <CopyBtn text={html} />
            <button
              type="button"
              onClick={onDownload}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            >
              <Download className="size-3.5" />
              Download
            </button>
            <button
              type="button"
              onClick={() => setHtml(STARTER_HTML)}
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setKey((v) => v + 1)}
              className="flex items-center gap-1.5 rounded-md bg-[#6366f1] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#4f51d4]"
            >
              <Eye className="size-3.5" />
              Refresh preview
            </button>
          </div>
        </div>

        <p className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground/80">
          Note: preview runs in a sandbox for safety. Scripts can execute, but the
          frame cannot navigate your main app.
        </p>

        <div className="grid h-[calc(100vh-14rem)] min-h-[520px] gap-4 lg:grid-cols-2">
          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10">
            <div className="flex items-center border-b border-white/10 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                HTML input
              </span>
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none bg-white/[0.02] p-4 font-mono text-sm text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-white/10">
            <div className="flex items-center border-b border-white/10 px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                Live preview
              </span>
            </div>
            <iframe
              key={key}
              title="HTML preview"
              srcDoc={html}
              sandbox="allow-scripts allow-modals allow-forms"
              className="h-full w-full bg-white"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
