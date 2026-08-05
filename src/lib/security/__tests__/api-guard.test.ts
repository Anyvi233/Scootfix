/**
 * @file src/lib/security/__tests__/api-guard.test.ts
 *
 * Tests for the apiGuard() middleware:
 *  - Unauthenticated access to auth-required routes → 401
 *  - Non-admin access to admin-only routes → 403
 *  - Admin access to admin routes → 200
 *  - Public routes (no auth required) → passes through to handler
 *  - Rate limit response is forwarded as-is
 *  - Unhandled handler errors → 500
 *  - Security headers are applied to every response
 */

import { NextRequest, NextResponse } from "next/server";

// ── Mock next-auth ────────────────────────────────────────────────────────────
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// ── Mock rate limiters (pass-through by default) ──────────────────────────────
jest.mock("@/lib/security/rate-limiter", () => ({
  applyApiRateLimit: jest.fn().mockResolvedValue(null),
  applyAuthRateLimit: jest.fn().mockResolvedValue(null),
  applyAdminRateLimit: jest.fn().mockResolvedValue(null),
}));

// ── Mock audit logger (no DB needed) ─────────────────────────────────────────
jest.mock("@/lib/security/audit-logger", () => ({
  logUnauthorizedAccess: jest.fn().mockResolvedValue(undefined),
}));

// ── Mock auth options (just a stub — not used directly) ───────────────────────
jest.mock("@/lib/auth", () => ({ authOptions: {} }));

import { apiGuard } from "@/lib/security/api-guard";
import { getServerSession } from "next-auth/next";
import { applyApiRateLimit } from "@/lib/security/rate-limiter";
import { logUnauthorizedAccess } from "@/lib/security/audit-logger";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(path = "/api/test"): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, { method: "GET" });
}

const okHandler = jest.fn().mockResolvedValue(
  NextResponse.json({ ok: true }, { status: 200 })
);

const mockSession = getServerSession as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.mockResolvedValue(null); // unauthenticated by default
});

// ── Test suites ───────────────────────────────────────────────────────────────

describe("apiGuard — public route (no auth)", () => {
  it("calls the handler and returns 200", async () => {
    const req = makeRequest("/api/public");
    const res = await apiGuard(req, { auth: false }, okHandler);

    expect(res.status).toBe(200);
    expect(okHandler).toHaveBeenCalledTimes(1);
  });

  it("applies security headers to the response", async () => {
    const req = makeRequest("/api/public");
    const res = await apiGuard(req, { auth: false }, okHandler);

    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });
});

describe("apiGuard — auth-required route", () => {
  it("returns 401 when no session exists", async () => {
    mockSession.mockResolvedValue(null);
    const req = makeRequest("/api/protected");
    const res = await apiGuard(req, { auth: true }, okHandler);

    expect(res.status).toBe(401);
    expect(okHandler).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.error).toMatch(/logged in/i);
  });

  it("logs unauthorized access when session is missing", async () => {
    mockSession.mockResolvedValue(null);
    const req = makeRequest("/api/protected");
    await apiGuard(req, { auth: true }, okHandler);

    expect(logUnauthorizedAccess).toHaveBeenCalledWith(
      "/api/protected",
      "unknown"
    );
  });

  it("calls handler when session is valid", async () => {
    mockSession.mockResolvedValue({
      user: { id: "user-1", role: "CUSTOMER", email: "a@a.com" },
    });
    const req = makeRequest("/api/protected");
    const res = await apiGuard(req, { auth: true }, okHandler);

    expect(res.status).toBe(200);
    expect(okHandler).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1" })
    );
  });
});

describe("apiGuard — admin-only route", () => {
  it("returns 403 when user is a regular CUSTOMER", async () => {
    mockSession.mockResolvedValue({
      user: { id: "user-2", role: "CUSTOMER", email: "b@b.com" },
    });
    const req = makeRequest("/api/admin/data");
    const res = await apiGuard(req, { auth: true, admin: true }, okHandler);

    expect(res.status).toBe(403);
    expect(okHandler).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.error).toMatch(/permission/i);
  });

  it("returns 403 and logs access when non-admin tries to access admin route", async () => {
    mockSession.mockResolvedValue({
      user: { id: "user-2", role: "CUSTOMER", email: "b@b.com" },
    });
    const req = makeRequest("/api/admin/data");
    await apiGuard(req, { auth: true, admin: true }, okHandler);

    expect(logUnauthorizedAccess).toHaveBeenCalledWith(
      "/api/admin/data",
      "unknown",
      "user-2"
    );
  });

  it("calls handler when user is ADMIN", async () => {
    mockSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", email: "admin@scootfix.in" },
    });
    const req = makeRequest("/api/admin/data");
    const res = await apiGuard(req, { auth: true, admin: true }, okHandler);

    expect(res.status).toBe(200);
    expect(okHandler).toHaveBeenCalled();
  });
});

describe("apiGuard — rate limiting", () => {
  it("returns rate-limit response when limiter triggers", async () => {
    const rateLimitResponse = NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429 }
    );
    (applyApiRateLimit as jest.Mock).mockResolvedValueOnce(rateLimitResponse);

    const req = makeRequest("/api/products");
    const res = await apiGuard(req, { auth: false, rateLimit: "api" }, okHandler);

    expect(res.status).toBe(429);
    expect(okHandler).not.toHaveBeenCalled();
  });
});

describe("apiGuard — error handling", () => {
  it("returns 500 when handler throws an unexpected error", async () => {
    mockSession.mockResolvedValue({
      user: { id: "user-1", role: "CUSTOMER" },
    });
    const throwingHandler = jest
      .fn()
      .mockRejectedValue(new Error("Database connection lost"));

    const req = makeRequest("/api/cart");
    const res = await apiGuard(req, { auth: true }, throwingHandler);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/internal server error/i);
  });
});
