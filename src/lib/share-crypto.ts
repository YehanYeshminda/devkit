import { createHmac, timingSafeEqual } from "crypto";

function signingSecret(): string {
  const s = process.env.SHARE_SIGNING_SECRET?.trim();
  if (s) return s;
  const c = process.env.CLERK_SECRET_KEY?.trim();
  if (c) return c;
  throw new Error("Set SHARE_SIGNING_SECRET (recommended) or CLERK_SECRET_KEY for share links.");
}

/** `exp` = Unix seconds (UTC) when the link expires (same as blob TTL). */
export function createShareSignature(shareId: string, exp: number): string {
  return createHmac("sha256", signingSecret())
    .update(`${shareId}:${exp}`)
    .digest("hex");
}

export function verifyShareSignature(shareId: string, exp: number, sig: string): boolean {
  if (!sig || typeof sig !== "string" || !Number.isFinite(exp) || exp <= 0) return false;
  if (Math.floor(Date.now() / 1000) > exp) return false;
  try {
    const expected = createShareSignature(shareId, exp);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sig, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
