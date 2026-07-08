import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXTAUTH_URL || "https://scootfix.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/products/", "/categories", "/brands", "/vehicle-compatibility"],
        disallow: ["/admin/", "/api/", "/checkout", "/profile", "/orders", "/settings"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
