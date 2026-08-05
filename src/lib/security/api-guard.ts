/**
 * @file src/lib/security/api-guard.ts
 * @description Composable API route security guard.
 *
 * Usage:
 *   export async function POST(req: NextRequest) {
 *     return apiGuard(req, { auth: true, admin: true, rateLimit: 'auth' }, async (user) => {
 *       // ...handler logic
 *     });
 *   }
 *
 * Applies (in order):
 *   1. Rate limiting
 *   2. Input body injection scanning (if body is parsed upstream)
 *   3. Authentication (JWT session verification)
 *   4. Role-based authorisation
 *   5. Audit logging on unauthorized attempts
 *   6. Security response headers
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { applySecurityHeaders } from "./headers";
import { applyApiRateLimit, applyAuthRateLimit, applyAdminRateLimit } from "./rate-limiter";
import { logUnauthorizedAccess } from "./audit-logger";
import { createHash } from "crypto";

type RateLimitType = "auth" | "api" | "admin" | "none";

interface GuardOptions {
  /** Require a valid logged-in session */
  auth?: boolean;
  /** Require the ADMIN role */
  admin?: boolean;
  /** Which rate limiter to apply */
  rateLimit?: RateLimitType;
}

type GuardedHandler = (user: import("@prisma/client").User | null) => Promise<NextResponse>;

function withHeaders(res: NextResponse): NextResponse {
  applySecurityHeaders(res);
  return res;
}

function forbidden(message = "Forbidden"): NextResponse {
  return withHeaders(
    NextResponse.json({ success: false, error: message }, { status: 403 })
  );
}

function unauthorized(message = "Unauthorized"): NextResponse {
  return withHeaders(
    NextResponse.json({ success: false, error: message }, { status: 401 })
  );
}

function validateCSRF(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return true;
  if (req.nextUrl.pathname.startsWith("/api/webhooks")) return true;

  const cookieName = process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token";
  const csrfCookie = req.cookies.get(cookieName)?.value;
  console.log("[CSRF DEBUG] cookieName:", cookieName, "csrfCookie exists:", !!csrfCookie);
  if (!csrfCookie) return false;

  const parts = csrfCookie.split("|");
  if (parts.length !== 2) {
    console.log("[CSRF DEBUG] csrfCookie split parts length !== 2:", parts);
    return false;
  }
  const [csrfToken, cookieHash] = parts;
  const secret = process.env.NEXTAUTH_SECRET || "";

  const headerToken = req.headers.get("x-csrf-token");
  console.log("[CSRF DEBUG] headerToken:", headerToken, "csrfToken:", csrfToken);
  if (!headerToken) return false;

  // The client getCsrfToken() returns the raw token value.
  // We compare it directly to the raw token extracted from the cookie.
  if (headerToken !== csrfToken) {
    console.log("[CSRF DEBUG] headerToken !== csrfToken mismatch");
    return false;
  }

  const expectedHash = createHash("sha256").update(`${csrfToken}${secret}`).digest("hex");
  const hashMatches = cookieHash === expectedHash;
  console.log("[CSRF DEBUG] cookieHash:", cookieHash, "expectedHash:", expectedHash, "matches:", hashMatches);
  return hashMatches;
}

export async function apiGuard(
  req: NextRequest,
  options: GuardOptions,
  handler: GuardedHandler
): Promise<NextResponse> {
  const { auth = false, admin = false, rateLimit = "api" } = options;
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  // 1. Rate Limiting
  if (rateLimit !== "none") {
    let limitResult: NextResponse | null = null;
    if (rateLimit === "auth") limitResult = await applyAuthRateLimit(req);
    else if (rateLimit === "admin") limitResult = await applyAdminRateLimit(req);
    else limitResult = await applyApiRateLimit(req);

    if (limitResult) {
      applySecurityHeaders(limitResult);
      return limitResult;
    }
  }

  // 2. CSRF Protection
  if (!validateCSRF(req)) {
    return forbidden("Invalid or missing CSRF token.");
  }

  // 3. Authentication
  const session = await getServerSession(authOptions);
  const user = session?.user as import("@prisma/client").User | null;

  if (auth && !user) {
    await logUnauthorizedAccess(req.nextUrl.pathname, ip);
    return unauthorized("You must be logged in to access this resource.");
  }

  // 3. Authorization (Role Check)
  if (admin && user?.role !== "ADMIN") {
    await logUnauthorizedAccess(req.nextUrl.pathname, ip, user?.id);
    return forbidden("You do not have permission to perform this action.");
  }

  // 4. Execute handler and apply security headers to the response
  try {
    const response = await handler(user);
    applySecurityHeaders(response);
    return response;
  } catch (error: unknown) {
    console.error(`[API ERROR] ${req.nextUrl.pathname}:`, error);
    return withHeaders(
      NextResponse.json(
        { success: false, error: "An internal server error occurred." },
        { status: 500 }
      )
    );
  }
}
