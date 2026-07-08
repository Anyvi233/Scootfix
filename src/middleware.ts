/**
 * @file src/middleware.ts
 * @description Next.js edge middleware.
 *
 * Responsibilities:
 *  1. Enforce authentication on protected routes (via NextAuth JWT)
 *  2. Enforce ADMIN role on /admin/* routes
 *  3. Redirect authenticated users away from auth pages
 *  4. Inject security response headers on every request
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security/headers";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");
    const isAdminRoute = pathname.startsWith("/admin");

    let response: NextResponse | null = null;

    // Redirect logged-in users away from auth pages
    if (isAuthPage && isAuth) {
      response = NextResponse.redirect(new URL("/", req.url));
    }
    // Block non-admins from /admin routes
    else if (isAdminRoute && token?.role !== "ADMIN") {
      response = NextResponse.redirect(new URL("/", req.url));
    }

    // Apply security headers to every response
    const finalResponse = response ?? NextResponse.next();
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      finalResponse.headers.set(key, value);
    }
    return finalResponse;
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const isProtected =
          pathname.startsWith("/checkout") ||
          pathname.startsWith("/orders") ||
          pathname.startsWith("/returns") ||
          pathname.startsWith("/profile") ||
          pathname.startsWith("/settings") ||
          pathname.startsWith("/wishlist") ||
          pathname.startsWith("/admin");

        if (isProtected) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/returns/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/wishlist/:path*",
    "/login",
    "/register",
  ],
};
