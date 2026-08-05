/**
 * Product Detail Page — Server Component
 *
 * Architecture:
 *  - This file is a SERVER component (no "use client")
 *  - generateMetadata() runs server-side for per-product SEO
 *  - JSON-LD structured data injected directly in the <head>
 *  - The interactive UI is split into <ProductDetailsClient> (client component)
 *
 * This gives us:
 *  ✅ Full SEO (title, description, OG, Twitter card, canonical)
 *  ✅ Rich snippets (Product + BreadcrumbList schema.org)
 *  ✅ Server-rendered HTML for crawlers
 *  ✅ Client interactivity (cart, wishlist, tabs, gallery)
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductService } from "@/services/product.service";
import { buildProductMetadata, productJsonLd, breadcrumbJsonLd, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { ProductDetailsClient } from "./ProductDetailsClient";

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | ScootFix",
      robots: { index: false, follow: false },
    };
  }

  return buildProductMetadata({
    name: product.name,
    description: product.description,
    slug: product.slug,
    price: product.price,
    images: product.images,
    brand: product.brand,
    category: product.category,
  });
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) notFound();

  // Build structured data
  const productSchema = productJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    images: product.images,
    brand: product.brand,
    rating: product.rating,
    reviewsCount: (product as import("@prisma/client").Product & { _count?: { reviews: number } })._count?.reviews ?? product._count?.reviews,
  });

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home",  url: canonicalUrl() },
    { name: "Shop",  url: canonicalUrl("shop") },
    { name: product.category?.name ?? "Parts", url: canonicalUrl("shop") },
    { name: product.name, url: canonicalUrl("products", product.slug) },
  ]);

  return (
    <>
      {/* Inject JSON-LD into <head> */}
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Semantic breadcrumb with microdata */}
        <Breadcrumb
          items={[
            { label: "Home",  href: "/" },
            { label: "Shop",  href: "/shop" },
            { label: product.category?.name ?? "Parts", href: "/shop" },
            { label: product.name },
          ]}
        />

        {/* Client component handles all interactive behaviour */}
        <ProductDetailsClient product={product} />
      </div>
    </>
  );
}
