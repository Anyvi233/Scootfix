import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata, canonicalUrl } from "@/lib/seo";
import ShopPageInner from "./_ShopPageInner";

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

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}
