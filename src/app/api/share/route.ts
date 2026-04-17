import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { createShareSignature } from "@/lib/share-crypto";
import { saveShareRecord, shareStorageMode } from "@/lib/share-store";
import type {
  ShareKind,
  SharePayload,
  SharePayloadDiff,
  SharePayloadJson,
  SharePayloadMarkdown,
  ShareRecordV1,
} from "@/lib/share-types";

export const dynamic = "force-dynamic";

const MAX_DIFF_SIDE = 280_000;
const MAX_MD = 400_000;
const MAX_JSON_RAW = 350_000;

function byteLen(s: string): number {
  return Buffer.byteLength(s, "utf8");
}

function parseTtlHours(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 24;
  return Math.min(168, Math.max(1, Math.floor(n)));
}

function validatePayload(kind: ShareKind, payload: unknown): SharePayload | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;

  if (kind === "diff") {
    if (typeof p.original !== "string" || typeof p.modified !== "string") return null;
    if (byteLen(p.original) > MAX_DIFF_SIDE || byteLen(p.modified) > MAX_DIFF_SIDE) return null;
    return { original: p.original, modified: p.modified } satisfies SharePayloadDiff;
  }

  if (kind === "json") {
    if (typeof p.raw !== "string") return null;
    if (byteLen(p.raw) > MAX_JSON_RAW) return null;
    const indent = p.indent === 4 ? 4 : 2;
    try {
      JSON.parse(p.raw);
    } catch {
      return null;
    }
    return { raw: p.raw, indent } satisfies SharePayloadJson;
  }

  if (kind === "markdown") {
    if (typeof p.markdown !== "string") return null;
    if (byteLen(p.markdown) > MAX_MD) return null;
    return { markdown: p.markdown } satisfies SharePayloadMarkdown;
  }

  return null;
}

export async function POST(req: Request) {
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
  const kind = b.kind as ShareKind;
  if (kind !== "diff" && kind !== "json" && kind !== "markdown") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const ttlHours = parseTtlHours(b.ttlHours);
  const ttlSeconds = ttlHours * 3600;
  const payload = validatePayload(kind, b.payload);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload for this kind" }, { status: 400 });
  }

  const id = randomBytes(18).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;

  const record: ShareRecordV1 = {
    v: 1,
    kind,
    ownerId: userId,
    createdAt: Date.now(),
    payload,
  };

  try {
    await saveShareRecord(id, record, ttlSeconds);
  } catch (e) {
    console.error("saveShareRecord", e);
    return NextResponse.json({ error: "Could not store share" }, { status: 500 });
  }

  const sig = createShareSignature(id, exp);
  const path = `/share/${encodeURIComponent(id)}?e=${exp}&sig=${encodeURIComponent(sig)}`;

  return NextResponse.json({
    ok: true as const,
    id,
    expiresAt: exp,
    path,
    storage: shareStorageMode(),
  });
}
