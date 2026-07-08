import type { Metadata } from "next";
import { buildPageMetadata, canonicalUrl, websiteJsonLd, organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import HomePageClient from "./_components/HomePageClient";

export const metadata: Metadata = buildPageMetadata({
  title: "ScootFix — Premium EV Spare Parts India",
  description:
    "Shop genuine and aftermarket spare parts for Ather 450X, Ola S1 Pro, TVS iQube and more. Batteries, brakes, tyres, electronics — fast delivery across India.",
  canonical: canonicalUrl(),
  keywords: [
    "EV spare parts India",
    "electric scooter spare parts",
    "Ather 450X battery",
    "Ola S1 Pro parts",
    "TVS iQube accessories",
    "EV brake pads",
    "electric vehicle tyres India",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <HomePageClient />
    </>
  );
}
