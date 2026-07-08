import { ProductFilters, ProductSortOption } from "@/types";
import { cache, CacheKeys, TTL } from "@/lib/cache";
import { ProductRepository } from "@/repositories/product.repository";
import { Prisma } from "@prisma/client";

export class ProductService {
  /**
   * Fetch a paginated, filtered, sorted product list.
   * Results are cached per unique query string for 60 seconds.
   * Rating averages are computed in a single aggregated subquery
   * instead of N+1 per-product round-trips.
   */
  static async getProducts(
    filters: ProductFilters,
    page = 1,
    limit = 12,
    sort: ProductSortOption = "newest"
  ) {
    // Build deterministic cache key from all query params
    const cacheKey = CacheKeys.productList(
      JSON.stringify({ filters, page, limit, sort })
    );
    const cached = cache.get<any>(cacheKey);
    if (cached) return cached;

    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    const categoryConditions: Prisma.CategoryWhereInput[] = [];
    if (filters.categoryId) {
      categoryConditions.push({ id: filters.categoryId });
    }
    if (filters.categories && filters.categories.length > 0) {
      categoryConditions.push({
        OR: filters.categories.map(c => ({
          name: { contains: c }
        }))
      });
    }
    if (categoryConditions.length > 0) {
      where.category = {
        is: {
          AND: categoryConditions
        }
      };
    }

    const brandConditions: Prisma.BrandWhereInput[] = [];
    if (filters.brandId) {
      brandConditions.push({ id: filters.brandId });
    }
    if (filters.brands && filters.brands.length > 0) {
      brandConditions.push({
        OR: [
          { name: { in: filters.brands } },
          { slug: { in: filters.brands.map(b => b.toLowerCase().replace(/\s+/g, '-')) } }
        ]
      });
    }
    if (filters.oem !== undefined || filters.aftermarket !== undefined) {
      const isOemOnly = filters.oem && !filters.aftermarket;
      const isAftermarketOnly = filters.aftermarket && !filters.oem;

      if (isOemOnly) {
        brandConditions.push({
          slug: { in: ["ather-genuine", "ola-genuine", "tvs-genuine"] }
        });
      } else if (isAftermarketOnly) {
        brandConditions.push({
          slug: { notIn: ["ather-genuine", "ola-genuine", "tvs-genuine"] }
        });
      }
    }
    if (brandConditions.length > 0) {
      where.brand = {
        is: {
          AND: brandConditions
        }
      };
    }

    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.vehicleModelId || (filters.vehicleBrands && filters.vehicleBrands.length > 0)) {
      where.compatibilities = {
        some: {
          ...(filters.vehicleModelId ? { vehicleModelId: filters.vehicleModelId } : {}),
          ...(filters.vehicleBrands && filters.vehicleBrands.length > 0
            ? {
                vehicleModel: {
                  brand: {
                    OR: [
                      { name: { in: filters.vehicleBrands } },
                      { slug: { in: filters.vehicleBrands.map(v => v.toLowerCase().replace(/\s+/g, '-')) } }
                    ]
                  }
                }
              }
            : {}),
          ...(filters.year
            ? {
                yearStart: { lte: filters.year },
                OR: [
                  { yearEnd: { gte: filters.year } },
                  { yearEnd: null },
                ],
              }
            : {}),
        },
      };
    }


    // Availability filter (In stock)
    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    // Offers filter (Discounted)
    if (filters.discount) {
      where.compareAtPrice = { not: null };
    }

    // Rating filter (Minimum average rating)
    if (filters.rating) {
      const eligibleProducts = await ProductRepository.findIds(where, 0, 10000);
      const ratingAggs = await ProductRepository.getAverageRatingsForProductIds(eligibleProducts);
      const targetRating = filters.rating;
      const matchedIds = ratingAggs
        .filter(r => (r._avg.rating ?? 0) >= targetRating)
        .map(r => r.productId);

      where.id = { in: matchedIds };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":  orderBy = { price: "asc" };  break;
      case "price_desc": orderBy = { price: "desc" }; break;
      case "rating_desc":
        orderBy = { reviews: { _count: "desc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const skip = (page - 1) * limit;

    // Single parallel query delegated to repository
    const [products, total, productIdsForPage] = await Promise.all([
      ProductRepository.findMany(where, orderBy, skip, limit),
      ProductRepository.count(where),
      ProductRepository.findIds(where, skip, limit),
    ]);

    const ratingAggs = await ProductRepository.getAverageRatingsForProductIds(productIdsForPage);

    // Map ratings onto products in O(n)
    const ratingMap = new Map(
      ratingAggs.map((r) => [r.productId, r._avg.rating ?? 0])
    );

    const result = {
      items: products.map((p) => ({
        ...p,
        rating: ratingMap.get(p.id) ?? 0,
        reviewsCount: p._count.reviews,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    cache.set(cacheKey, result, TTL.PRODUCTS_LIST);
    return result;
  }

  /**
   * Fetch a single product by slug.
   * Cached for 2 minutes; invalidated on product update.
   */
  static async getProductBySlug(slug: string) {
    const cacheKey = CacheKeys.productDetail(slug);
    const cached = cache.get<any>(cacheKey);
    if (cached) return cached;

    const product = await ProductRepository.findBySlug(slug);
    if (!product) return null;

    const aggregations = await ProductRepository.getRatingMetricsForProduct(product.id);

    const result = {
      ...product,
      rating: aggregations._avg.rating ?? 0,
      reviewsCount: product._count.reviews,
    };

    cache.set(cacheKey, result, TTL.PRODUCT_DETAIL);
    return result;
  }

  /** Get only featured products (heavily cached). */
  static async getFeaturedProducts(limit = 8) {
    const cacheKey = CacheKeys.featured();
    const cached = cache.get<any[]>(cacheKey);
    if (cached) return cached;

    const products = await ProductRepository.findFeatured(limit);

    cache.set(cacheKey, products, TTL.FEATURED);
    return products;
  }

  /** Invalidate all product-related cache entries (call after any write). */
  static invalidateProductCache(slug?: string): void {
    cache.invalidatePrefix("products:");
    if (slug) cache.del(CacheKeys.productDetail(slug));
  }
}
