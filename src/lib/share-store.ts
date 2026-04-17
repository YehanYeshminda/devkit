import { Redis } from "@upstash/redis";

import type { ShareRecordV1 } from "@/lib/share-types";

const PREFIX = "devkit:share:";

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    redis = url && token ? new Redis({ url, token }) : null;
  }
  return redis;
}

type MemEntry = { body: string; expiresAt: number };
const memory = new Map<string, MemEntry>();
const MAX_MEMORY_SHARES = 400;

function trimMemoryIfNeeded() {
  while (memory.size > MAX_MEMORY_SHARES) {
    const first = memory.keys().next().value;
    if (first === undefined) break;
    memory.delete(first);
  }
}

export async function saveShareRecord(id: string, record: ShareRecordV1, ttlSeconds: number): Promise<void> {
  const body = JSON.stringify(record);
  const client = getRedis();
  if (client) {
    await client.set(`${PREFIX}${id}`, body, { ex: ttlSeconds });
    return;
  }
  memory.set(id, { body, expiresAt: Date.now() + ttlSeconds * 1000 });
  trimMemoryIfNeeded();
}

function parseRecord(raw: unknown): ShareRecordV1 | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as ShareRecordV1;
    if (o.v === 1 && o.kind && o.ownerId && o.payload) return o;
    return null;
  }
  if (typeof raw !== "string") return null;
  try {
    const o = JSON.parse(raw) as ShareRecordV1;
    if (o?.v !== 1 || !o.kind || !o.ownerId || !o.payload) return null;
    return o;
  } catch {
    return null;
  }
}

export async function loadShareRecord(id: string): Promise<ShareRecordV1 | null> {
  const client = getRedis();
  if (client) {
    const got = await client.get(`${PREFIX}${id}`);
    const parsed = parseRecord(got);
    return parsed;
  }

  const m = memory.get(id);
  if (!m) return null;
  if (Date.now() > m.expiresAt) {
    memory.delete(id);
    return null;
  }
  return parseRecord(m.body);
}

export function shareStorageMode(): "redis" | "memory" {
  return getRedis() ? "redis" : "memory";
}
