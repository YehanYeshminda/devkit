"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CodeBlock({
  code,
  language = "tsx",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div
      className={cn(
        "surface-glow relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020]",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="size-2 rounded-full bg-rose-400/80" />
        <span className="size-2 rounded-full bg-amber-400/80" />
        <span className="size-2 rounded-full bg-emerald-400/80" />
        <span className="ml-3 text-xs text-white/45">{language}</span>
      </div>
      <div className="absolute right-2 top-2 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full border-white/10 bg-white/5 text-white backdrop-blur hover:bg-white/10 hover:text-white"
          onClick={onCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <Highlight
        theme={themes.vsDark as any}
        code={code.trimEnd()}
        language={language as any}
      >
        {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              preClassName,
              "max-h-[520px] overflow-auto p-5 text-sm leading-relaxed",
              "bg-transparent",
              "font-mono"
            )}
            style={style}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="select-none pr-4 text-xs text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

