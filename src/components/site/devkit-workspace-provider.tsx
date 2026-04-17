"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { pathToVisit } from "@/lib/devkit-path-visit";
import {
  DEVKIT_LOCAL_STORAGE_KEY,
  clearRecent,
  defaultWorkspaceState,
  mergeVisit,
  parseWorkspaceState,
  removePin,
  setPrefs,
  togglePin,
} from "@/lib/devkit-workspace";
import type {
  DevkitPrefs,
  DevkitWorkspaceState,
  PinnedSnippet,
  SnippetCategory,
} from "@/lib/devkit-workspace-types";

type Ctx = {
  ready: boolean;
  state: DevkitWorkspaceState;
  syncError: string | null;
  recordVisit: (v: { href: string; name: string }) => void;
  toggleSnippetPin: (pin: PinnedSnippet) => void;
  removeSnippetPin: (category: SnippetCategory, id: string) => void;
  setWorkspacePrefs: (p: Partial<DevkitPrefs>) => void;
  clearRecentTools: () => void;
  isSnippetPinned: (category: SnippetCategory, id: string) => boolean;
  snippetHref: (category: SnippetCategory, id: string) => string;
};

const DevkitWorkspaceContext = React.createContext<Ctx | null>(null);

export function useDevkitWorkspace() {
  const v = React.useContext(DevkitWorkspaceContext);
  if (!v) throw new Error("useDevkitWorkspace must be used within DevkitWorkspaceProvider");
  return v;
}

function loadLocal(): DevkitWorkspaceState | null {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem(DEVKIT_LOCAL_STORAGE_KEY);
    if (!t) return null;
    return parseWorkspaceState(JSON.parse(t));
  } catch {
    return null;
  }
}

function saveLocal(state: DevkitWorkspaceState) {
  try {
    localStorage.setItem(DEVKIT_LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function DevkitWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();

  const [state, setState] = React.useState<DevkitWorkspaceState>(defaultWorkspaceState);
  const [ready, setReady] = React.useState(false);
  const [syncError, setSyncError] = React.useState<string | null>(null);

  const visitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingVisit = React.useRef<{ href: string; name: string } | null>(null);

  const persistCloud = React.useCallback(async (body: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/devkit/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? res.statusText);
      }
      const data = (await res.json()) as { state?: unknown };
      setState(parseWorkspaceState(data.state));
      setSyncError(null);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Sync failed");
    }
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setState(loadLocal() ?? defaultWorkspaceState());
      setReady(true);
      setSyncError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/devkit/workspace", { method: "GET" });
        const data = (await res.json()) as { state?: unknown };
        if (cancelled) return;
        setState(parseWorkspaceState(data.state));
        setSyncError(null);
      } catch {
        if (!cancelled) {
          setState(loadLocal() ?? defaultWorkspaceState());
          setSyncError("Could not load cloud workspace; showing data from this device.");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const recordVisit = React.useCallback(
    (v: { href: string; name: string }) => {
      setState((s) => {
        const next = mergeVisit(s, v);
        saveLocal(next);
        return next;
      });

      if (!isSignedIn) return;

      pendingVisit.current = v;
      if (visitTimer.current) clearTimeout(visitTimer.current);
      visitTimer.current = setTimeout(() => {
        const visit = pendingVisit.current;
        pendingVisit.current = null;
        if (visit) void persistCloud({ visit });
      }, 650);
    },
    [isSignedIn, persistCloud],
  );

  const toggleSnippetPin = React.useCallback(
    (pin: PinnedSnippet) => {
      setState((s) => {
        const next = togglePin(s, pin);
        saveLocal(next);
        return next;
      });
      if (isSignedIn) void persistCloud({ togglePin: pin });
    },
    [isSignedIn, persistCloud],
  );

  const removeSnippetPin = React.useCallback(
    (category: SnippetCategory, id: string) => {
      setState((s) => {
        const next = removePin(s, category, id);
        saveLocal(next);
        return next;
      });
      if (isSignedIn) void persistCloud({ removePin: { category, id } });
    },
    [isSignedIn, persistCloud],
  );

  const setWorkspacePrefs = React.useCallback(
    (p: Partial<DevkitPrefs>) => {
      setState((s) => {
        const next = setPrefs(s, p);
        saveLocal(next);
        return next;
      });
      if (isSignedIn) void persistCloud({ setPrefs: p });
    },
    [isSignedIn, persistCloud],
  );

  const clearRecentTools = React.useCallback(() => {
    setState((s) => {
      const next = clearRecent(s);
      saveLocal(next);
      return next;
    });
    if (isSignedIn) void persistCloud({ clearRecent: true });
  }, [isSignedIn, persistCloud]);

  const isSnippetPinned = React.useCallback(
    (category: SnippetCategory, id: string) =>
      state.pinnedSnippets.some((p) => p.category === category && p.id === id),
    [state.pinnedSnippets],
  );

  const snippetHref = React.useCallback(
    (category: SnippetCategory, id: string) => `/snippets/${category}#${encodeURIComponent(id)}`,
    [],
  );

  React.useEffect(() => {
    if (!ready || !pathname) return;
    const v = pathToVisit(pathname);
    if (v) recordVisit(v);
  }, [pathname, ready, recordVisit]);

  const value = React.useMemo(
    () => ({
      ready,
      state,
      syncError,
      recordVisit,
      toggleSnippetPin,
      removeSnippetPin,
      setWorkspacePrefs,
      clearRecentTools,
      isSnippetPinned,
      snippetHref,
    }),
    [
      ready,
      state,
      syncError,
      recordVisit,
      toggleSnippetPin,
      removeSnippetPin,
      setWorkspacePrefs,
      clearRecentTools,
      isSnippetPinned,
      snippetHref,
    ],
  );

  return <DevkitWorkspaceContext.Provider value={value}>{children}</DevkitWorkspaceContext.Provider>;
}
