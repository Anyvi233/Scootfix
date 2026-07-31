import type { Metadata } from "next";
import { buildPageMetadata, canonicalUrl } from "@/lib/seo";
import ShopClientWrapper from "./_ShopClientWrapper";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop EV Spare Parts — Batteries, Brakes, Tyres & More",
  description:
    "Browse 500+ genuine and aftermarket EV spare parts. Filter by vehicle, brand, category or price. Free shipping on orders above ₹999.",
  canonical: canonicalUrl("shop"),
  keywords: [
    "buy EV spare parts online",
    "EV parts shop India",
    "Ather spare parts",
    "Ola S1 Pro replacement parts",
    "TVS iQube parts",
    "EV battery shop",
    "electric scooter brake pads",
  ],
});

// Server Component — just renders the client wrapper
// The client wrapper uses dynamic(ssr:false) to prevent ALL hydration mismatches
export default function ShopPage() {
  return <ShopClientWrapper />;
}
