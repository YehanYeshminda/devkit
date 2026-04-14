"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type CopyInputProps = {
  value: string;
  label?: string;
  className?: string;
};

export function CopyInput({ value, label, className }: CopyInputProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked in some contexts */
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex h-10 items-center overflow-hidden rounded-lg border border-border bg-muted/30 pr-1 pl-3">
        <span className="flex-1 truncate font-mono text-sm text-muted-foreground">
          {value}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className={cn(
            "ml-2 flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
              : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
