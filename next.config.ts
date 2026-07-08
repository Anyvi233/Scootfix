import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Image Optimisation ────────────────────────────────────────────────────
  images: {
    // Serve modern formats (AVIF → WebP → fallback)
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints for srcset generation
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days CDN cache
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // ─── Compiler ─────────────────────────────────────────────────────────────
  compiler: {
    // Strip console.log in production builds (keep error/warn)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ─── Headers ──────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply long-lived cache to all static assets
        source: "/:path((?!api).*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
        ],
      },
      {
        // Static files get aggressive caching
        source: "/(_next/static|favicon.ico|robots.txt|sitemap.xml)(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/compatibility",
        destination: "/vehicle-compatibility",
        permanent: true,
      },
    ];
  },

  // ─── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    // Optimize package imports (tree-shaking for icon libraries etc.)
    optimizePackageImports: [
      "framer-motion",
      "react-icons",
      "date-fns",
    ],
  },
};

export default nextConfig;
