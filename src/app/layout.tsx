import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SkipNav } from "@/components/ui/SkipNav";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

// display:swap prevents FOIT (flash of invisible text)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://scootfix.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${APP_NAME} — Premium EV Spare Parts`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "ScootFix is India's leading e-commerce store for premium electric vehicle spare parts. Find genuine and aftermarket parts for Ather, Ola, TVS, and more.",
  keywords: [
    "EV spare parts",
    "electric scooter parts",
    "Ather 450X parts",
    "Ola S1 Pro spare parts",
    "EV battery replacement",
    "electric vehicle accessories India",
    "ScootFix",
  ],
  authors: [{ name: "ScootFix" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Premium EV Spare Parts`,
    description:
      "Shop genuine and aftermarket EV spare parts for Ather, Ola Electric, TVS iQube and more. Fast shipping across India.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ScootFix EV Parts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Premium EV Spare Parts`,
    description: "India's best EV spare parts marketplace.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Razorpay Checkout script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <SkipNav />
        <Providers>
          <div id="main-content" className="flex flex-col flex-1">
             {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
