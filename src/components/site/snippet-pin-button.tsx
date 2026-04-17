"use client";

import { Star } from "lucide-react";

import { useDevkitWorkspace } from "@/components/site/devkit-workspace-provider";
import { cn } from "@/lib/utils";
import type { SnippetCategory } from "@/lib/devkit-workspace-types";

export function SnippetPinButton({
  category,
  id,
  title,
}: {
  category: SnippetCategory;
  id: string;
  title: string;
}) {
  const { isSnippetPinned, toggleSnippetPin } = useDevkitWorkspace();
  const pinned = isSnippetPinned(category, id);

  return (
    <button
      type="button"
      title={pinned ? "Unpin snippet" : "Pin snippet"}
      aria-pressed={pinned}
      onClick={() => toggleSnippetPin({ category, id, title })}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors",
        pinned
          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
          : "border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
      )}
    >
      <Star className={cn("size-3", pinned && "fill-current")} />
      {pinned ? "Pinned" : "Pin"}
    </button>
  );
}
