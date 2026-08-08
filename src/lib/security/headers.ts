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
    // unsafe-inline needed for Next.js inline scripts; also allow Razorpay checkout script and dynamically loaded chunks
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.razorpay.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Allow images from Razorpay popup (card brand icons etc.) and Google auth avatars
    "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://*.razorpay.com https://lh3.googleusercontent.com",
    // Allow API calls to Razorpay (used internally by checkout.js)
    "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com",
    // Allow Razorpay payment iframe to render inside our page
    "frame-src 'self' https://*.razorpay.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.razorpay.com",
  ].join("; "),

  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
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
