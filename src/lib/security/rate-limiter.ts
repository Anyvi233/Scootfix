/**
 * @file src/lib/security/rate-limiter.ts
 * @description In-memory rate limiter using rate-limiter-flexible.
 * Provides multiple limiters for different endpoints (auth, api, global).
 */

import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// --- Limiter Definitions ---

/** Strict limiter for auth endpoints: 5 attempts per 15 minutes per IP */
const authLimiter = new RateLimiterMemory({
  keyPrefix: "auth",
  points: 5,        // max attempts
  duration: 15 * 60, // per 15 minutes
  blockDuration: 15 * 60, // block for 15 min after exceeding
});

/** General API limiter: 100 requests per minute per IP */
const apiLimiter = new RateLimiterMemory({
  keyPrefix: "api",
  points: 100,
  duration: 60,
  blockDuration: 60,
});

/** Admin API limiter: 50 requests per minute per IP */
const adminLimiter = new RateLimiterMemory({
  keyPrefix: "admin",
  points: 50,
  duration: 60,
  blockDuration: 60,
});

// --- Helper ---

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

function tooManyRequestsResponse(retryAfter: number) {
  return NextResponse.json(
    { success: false, error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(retryAfter)),
        "X-RateLimit-Limit": "5",
      },
    }
  );
}

// --- Public Wrappers ---

export async function applyAuthRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await authLimiter.consume(ip);
    return null; // Allowed
  } catch (e) {
    if (e instanceof RateLimiterRes) {
      return tooManyRequestsResponse(e.msBeforeNext / 1000);
    }
    return null;
  }
}

export async function applyApiRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await apiLimiter.consume(ip);
    return null;
  } catch (e) {
    if (e instanceof RateLimiterRes) {
      return tooManyRequestsResponse(e.msBeforeNext / 1000);
    }
    return null;
  }
}

export async function applyAdminRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  try {
    await adminLimiter.consume(ip);
    return null;
  } catch (e) {
    if (e instanceof RateLimiterRes) {
      return tooManyRequestsResponse(e.msBeforeNext / 1000);
    }
    return null;
  }
}
