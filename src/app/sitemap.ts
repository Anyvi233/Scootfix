import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXTAUTH_URL || "https://scootfix.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/shop`,               lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE_URL}/categories`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/brands`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/vehicle-compatibility`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
  ];

  // Dynamic product pages
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic category pages
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
