export type SnippetCategory = "css" | "git" | "bash";

export type PinnedSnippet = {
  category: SnippetCategory;
  id: string;
  title: string;
};

export type RecentTool = {
  href: string;
  name: string;
  at: number;
};

export type DevkitPrefs = {
  /** Larger snippet cards / spacing (snippet pages read this later if you wire it). */
  spaciousSnippetCards?: boolean;
};

export type DevkitWorkspaceState = {
  recentTools: RecentTool[];
  pinnedSnippets: PinnedSnippet[];
  prefs: DevkitPrefs;
};

/** Stored under Clerk `publicMetadata` (merged with other keys). */
export const DEVKIT_WORKSPACE_METADATA_KEY = "devkitWorkspace" as const;

export const MAX_RECENT = 12;
export const MAX_PINS = 24;

export function defaultWorkspaceState(): DevkitWorkspaceState {
  return {
    recentTools: [],
    pinnedSnippets: [],
    prefs: {},
  };
}
