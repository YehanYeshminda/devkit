import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  DEVKIT_WORKSPACE_METADATA_KEY,
  clearRecent,
  mergeVisit,
  parseWorkspaceState,
  removePin,
  setPrefs,
  togglePin,
} from "@/lib/devkit-workspace";
import type { DevkitWorkspaceState, PinnedSnippet, SnippetCategory } from "@/lib/devkit-workspace-types";

export const dynamic = "force-dynamic";

function isSnippetCategory(x: unknown): x is SnippetCategory {
  return x === "css" || x === "git" || x === "bash";
}

function parsePinned(body: unknown): PinnedSnippet | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (!isSnippetCategory(o.category)) return null;
  if (typeof o.id !== "string" || typeof o.title !== "string") return null;
  return { category: o.category, id: o.id, title: o.title };
}

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ ok: true as const, signedIn: false as const, state: null });
  }

  const client = clerkClient();
  const user = await client.users.getUser(userId);
  const raw = user.publicMetadata?.[DEVKIT_WORKSPACE_METADATA_KEY];
  const state = parseWorkspaceState(raw);

  return NextResponse.json({ ok: true as const, signedIn: true as const, state });
}

export async function PATCH(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const client = clerkClient();
  const user = await client.users.getUser(userId);
  const raw = user.publicMetadata?.[DEVKIT_WORKSPACE_METADATA_KEY];
  let state = parseWorkspaceState(raw);

  if (b.visit && typeof b.visit === "object") {
    const v = b.visit as Record<string, unknown>;
    if (typeof v.href === "string" && typeof v.name === "string") {
      state = mergeVisit(state, { href: v.href, name: v.name });
    }
  }

  if (b.togglePin) {
    const pin = parsePinned(b.togglePin);
    if (pin) state = togglePin(state, pin);
  }

  if (b.removePin && typeof b.removePin === "object") {
    const r = b.removePin as Record<string, unknown>;
    if (isSnippetCategory(r.category) && typeof r.id === "string") {
      state = removePin(state, r.category, r.id);
    }
  }

  if (b.setPrefs && typeof b.setPrefs === "object" && !Array.isArray(b.setPrefs)) {
    const pr = b.setPrefs as Record<string, unknown>;
    const partial: DevkitWorkspaceState["prefs"] = {};
    if (typeof pr.spaciousSnippetCards === "boolean") partial.spaciousSnippetCards = pr.spaciousSnippetCards;
    state = setPrefs(state, partial);
  }

  if (b.clearRecent === true) {
    state = clearRecent(state);
  }

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      [DEVKIT_WORKSPACE_METADATA_KEY]: state,
    },
  });

  return NextResponse.json({ ok: true as const, state });
}
