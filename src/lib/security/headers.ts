/**
 * @file src/lib/security/headers.ts
 * @description Security HTTP response headers.
 * Apply these to every API route response for defence-in-depth.
 *
 * Covers:
 *  - Content-Security-Policy (blocks XSS / data injection)
 *  - X-Frame-Options (blocks clickjacking)
 *  - X-Content-Type-Options (blocks MIME sniffing)
 *  - Referrer-Policy (limits information leakage)
 *  - Permissions-Policy (disables dangerous browser APIs)
 *  - Strict-Transport-Security (enforces HTTPS)
 */

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline needed for Next.js inline scripts; tighten with nonce in prod
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),

  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block", // legacy but still useful for older browsers
};

/**
 * Inject security headers into a NextResponse or standard Response.
 */
export function applySecurityHeaders(
  res: Response | import("next/server").NextResponse
): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
}

/**
 * Return a new Headers object pre-populated with the security headers.
 * Useful when constructing a NextResponse from scratch.
 */
export function buildSecureHeaders(
  extra?: Record<string, string>
): Record<string, string> {
  return { ...SECURITY_HEADERS, ...extra };
}
