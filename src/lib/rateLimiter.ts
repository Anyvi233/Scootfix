import { NextRequest } from "next/server";

interface RateEntry {
  count: number;
  reset: number; // timestamp (ms) when the window resets
}

// In‑memory store (reset on server restart). For production use a distributed store like Upstash Redis.
const store = new Map<string, RateEntry>();

/**
 * Apply rate limiting.
 * @param req Incoming request – used to extract IP when needed.
 * @param identifier Unique key for the client (e.g., userId or IP address).
 * @param limit Maximum requests allowed within the window.
 * @param windowMs Time window in milliseconds.
 * @returns true if request is within the limit, false otherwise.
 */
export function rateLimit(req: NextRequest, identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(identifier);
  if (!entry || now > entry.reset) {
    store.set(identifier, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count < limit) {
    entry.count += 1;
    return true;
  }
  return false; // limit exceeded
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
