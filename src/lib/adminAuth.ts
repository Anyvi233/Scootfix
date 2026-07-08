/**
 * @file src/lib/adminAuth.ts
 * @description Shared utility to verify admin JWT in App Router API routes.
 * Uses getToken (JWT extraction) instead of getServerSession, which is more
 * reliable in Next.js App Router API route handlers.
 */

import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

/**
 * Returns true if the incoming request carries a valid ADMIN JWT token.
 * Works consistently in all Next.js App Router API routes.
 */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return !!(token && token.role === "ADMIN");
}

/**
 * Returns the authenticated user's ID from the JWT, or null if not authenticated.
 */
export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.id as string | null;
}
