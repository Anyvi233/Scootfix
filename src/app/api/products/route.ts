import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { ProductFilters, ProductSortOption } from "@/types";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: ProductFilters = {};

    const search = searchParams.get("search");
    if (search) filters.search = search.slice(0, 200); // cap length

    const categoryId = searchParams.get("categoryId");
    if (categoryId) filters.categoryId = categoryId;

    const categories = searchParams.get("categories");
    if (categories) filters.categories = categories.split(",").map(c => c.trim()).filter(Boolean);

    const brandId = searchParams.get("brandId");
    if (brandId) filters.brandId = brandId;

    const brands = searchParams.get("brands");
    if (brands) filters.brands = brands.split(",").map(b => b.trim()).filter(Boolean);

    const minPrice = searchParams.get("minPrice");
    if (minPrice) filters.minPrice = Math.max(0, parseFloat(minPrice));

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) filters.maxPrice = Math.min(10_000_000, parseFloat(maxPrice));

    const isFeatured = searchParams.get("isFeatured");
    if (isFeatured) filters.isFeatured = isFeatured === "true";

    const vehicleModelId = searchParams.get("vehicleModelId");
    if (vehicleModelId) filters.vehicleModelId = vehicleModelId;

    const vehicleBrands = searchParams.get("vbrands");
    if (vehicleBrands) filters.vehicleBrands = vehicleBrands.split(",").map(v => v.trim()).filter(Boolean);

    const year = searchParams.get("year");
    if (year) filters.year = parseInt(year);

    const rating = searchParams.get("rating");
    if (rating) filters.rating = parseFloat(rating);

    const oem = searchParams.get("oem");
    if (oem) filters.oem = oem === "true";

    const aftermarket = searchParams.get("aftermarket");
    if (aftermarket) filters.aftermarket = aftermarket === "true";

    const inStock = searchParams.get("inStock");
    if (inStock) filters.inStock = inStock === "true";

    const discount = searchParams.get("discount");
    if (discount) filters.discount = discount === "true";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const sort = (searchParams.get("sort") || "newest") as ProductSortOption;

    const result = await ProductService.getProducts(filters, page, limit, sort);

    const response = NextResponse.json(result);

    // Cache-Control: public, 60 sec fresh, 120 sec stale-while-revalidate
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    );
    applySecurityHeaders(response);

    return response;
  } catch (error) {
    console.error("Error in products API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
