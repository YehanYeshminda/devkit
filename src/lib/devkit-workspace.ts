import {
  type DevkitPrefs,
  type DevkitWorkspaceState,
  type PinnedSnippet,
  type RecentTool,
  type SnippetCategory,
  MAX_PINS,
  MAX_RECENT,
  defaultWorkspaceState,
  DEVKIT_WORKSPACE_METADATA_KEY,
} from "@/lib/devkit-workspace-types";

export type {
  DevkitPrefs,
  DevkitWorkspaceState,
  PinnedSnippet,
  RecentTool,
  SnippetCategory,
} from "@/lib/devkit-workspace-types";

export {
  DEVKIT_WORKSPACE_METADATA_KEY,
  MAX_PINS,
  MAX_RECENT,
  defaultWorkspaceState,
} from "@/lib/devkit-workspace-types";

export const DEVKIT_LOCAL_STORAGE_KEY = "devkit-workspace-v1";

export function parseWorkspaceState(raw: unknown): DevkitWorkspaceState {
  const d = defaultWorkspaceState();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
  const o = raw as Record<string, unknown>;

  const recent: RecentTool[] = [];
  if (Array.isArray(o.recentTools)) {
    for (const item of o.recentTools) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      if (typeof r.href !== "string" || typeof r.name !== "string") continue;
      const at = typeof r.at === "number" && Number.isFinite(r.at) ? r.at : Date.now();
      recent.push({ href: r.href.slice(0, 512), name: r.name.slice(0, 200), at });
    }
  }

  const pins: PinnedSnippet[] = [];
  if (Array.isArray(o.pinnedSnippets)) {
    for (const item of o.pinnedSnippets) {
      if (!item || typeof item !== "object") continue;
      const p = item as Record<string, unknown>;
      const cat = p.category;
      if (cat !== "css" && cat !== "git" && cat !== "bash") continue;
      if (typeof p.id !== "string" || typeof p.title !== "string") continue;
      pins.push({
        category: cat as SnippetCategory,
        id: p.id.slice(0, 120),
        title: p.title.slice(0, 200),
      });
    }
  }

  const prefs: DevkitPrefs = { ...d.prefs };
  if (o.prefs && typeof o.prefs === "object" && !Array.isArray(o.prefs)) {
    const pr = o.prefs as Record<string, unknown>;
    if (typeof pr.spaciousSnippetCards === "boolean") prefs.spaciousSnippetCards = pr.spaciousSnippetCards;
  }

  return {
    recentTools: recent.slice(0, MAX_RECENT),
    pinnedSnippets: pins.slice(0, MAX_PINS),
    prefs,
  };
}

export function mergeVisit(state: DevkitWorkspaceState, visit: { href: string; name: string }): DevkitWorkspaceState {
  const at = Date.now();
  const href = visit.href.slice(0, 512);
  const name = visit.name.slice(0, 200);
  const rest = state.recentTools.filter((x) => x.href !== href);
  return {
    ...state,
    recentTools: [{ href, name, at }, ...rest].slice(0, MAX_RECENT),
  };
}

export function togglePin(state: DevkitWorkspaceState, pin: PinnedSnippet): DevkitWorkspaceState {
  const id = pin.id.slice(0, 120);
  const title = pin.title.slice(0, 200);
  const category = pin.category;
  const i = state.pinnedSnippets.findIndex((p) => p.category === category && p.id === id);
  let next = state.pinnedSnippets;
  if (i >= 0) next = state.pinnedSnippets.filter((_, j) => j !== i);
  else next = [{ category, id, title }, ...state.pinnedSnippets].slice(0, MAX_PINS);
  return { ...state, pinnedSnippets: next };
}

export function removePin(state: DevkitWorkspaceState, category: SnippetCategory, id: string): DevkitWorkspaceState {
  return {
    ...state,
    pinnedSnippets: state.pinnedSnippets.filter((p) => !(p.category === category && p.id === id)),
  };
}

export function setPrefs(state: DevkitWorkspaceState, partial: Partial<DevkitPrefs>): DevkitWorkspaceState {
  return { ...state, prefs: { ...state.prefs, ...partial } };
}

export function clearRecent(state: DevkitWorkspaceState): DevkitWorkspaceState {
  return { ...state, recentTools: [] };
}
