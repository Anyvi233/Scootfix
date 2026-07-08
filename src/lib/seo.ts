/**
 * @file src/lib/seo.ts
 * @description Centralised SEO helpers.
 * Generates canonical Metadata objects, JSON-LD structured data,
 * and Open Graph payloads for every page type.
 */

import type { Metadata } from "next";

export const BASE_URL =
  process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://scootfix.in";

export const SITE_NAME = "ScootFix";
export const SITE_DESCRIPTION =
  "India's leading marketplace for premium EV spare parts. Genuine and aftermarket parts for Ather, Ola Electric, TVS iQube and more.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function canonicalUrl(...segments: string[]): string {
  const path = segments.filter(Boolean).join("/").replace(/\/+/g, "/");
  return `${BASE_URL}/${path}`.replace(/([^:])\/\/+/g, "$1/");
}

/** Default OG image used when a page has no product image */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

// ─── Page-level metadata builders ─────────────────────────────────────────────

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const image = opts.image || DEFAULT_OG_IMAGE;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: opts.canonical },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

export function buildProductMetadata(product: {
  name: string;
  description: string;
  slug: string;
  price: number;
  images?: { url: string }[];
  brand?: { name: string };
  category?: { name: string };
}): Metadata {
  const image = product.images?.[0]?.url || DEFAULT_OG_IMAGE;
  const canonical = canonicalUrl("products", product.slug);
  const title = `${product.name} | ${SITE_NAME}`;

  return {
    title,
    description: product.description.slice(0, 155),
    alternates: { canonical },
    keywords: [
      product.name,
      product.brand?.name ?? "",
      product.category?.name ?? "",
      "EV spare parts",
      "electric vehicle parts India",
    ].filter(Boolean),
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: product.description.slice(0, 155),
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description.slice(0, 155),
      images: [image],
    },
  };
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

/** Product schema.org JSON-LD — enables rich snippets in Google Search */
export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  images?: { url: string; alt?: string }[];
  brand?: { name: string };
  rating?: number;
  reviewsCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    url: canonicalUrl("products", product.slug),
    image: product.images?.map((img) => img.url) ?? [],
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl("products", product.slug),
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    ...(product.rating && product.reviewsCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewsCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

/** BreadcrumbList JSON-LD — enables breadcrumbs in search results */
export function breadcrumbJsonLd(
  crumbs: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** Organization JSON-LD for the homepage */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };
}

/** WebSite JSON-LD — enables Sitelinks Searchbox in Google */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** ItemList JSON-LD for category / shop pages */
export function itemListJsonLd(
  items: { name: string; url: string; image?: string }[],
  listName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
      image: item.image,
    })),
  };
}
