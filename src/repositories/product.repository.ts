import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductFilters, ProductSortOption } from "@/types";

/**
 * ProductRepository
 * Handles data access logic for products and product relations.
 */
export class ProductRepository {
  /**
   * Fetch matching products based on filters, pagination, and sorting.
   */
  static async findMany(
    where: Prisma.ProductWhereInput,
    orderBy: Prisma.ProductOrderByWithRelationInput,
    skip: number,
    take: number
  ) {
    try {
      return await prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          stock: true,
          isFeatured: true,
          createdAt: true,
          images: {
            select: { url: true, alt: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          compatibilities: {
            select: {
              yearStart: true,
              yearEnd: true,
              notes: true,
              vehicleModel: {
                select: {
                  name: true,
                  yearStart: true,
                  yearEnd: true,
                  brand: { select: { name: true } },
                },
              },
            },
          },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error("ProductRepository.findMany error:", error);
      throw new Error("Failed to query products from database");
    }
  }

  /**
   * Count total products matching the filters.
   */
  static async count(where: Prisma.ProductWhereInput) {
    try {
      return await prisma.product.count({ where });
    } catch (error) {
      console.error("ProductRepository.count error:", error);
      throw new Error("Failed to count products in database");
    }
  }

  /**
   * Fetch product IDs that match the filter parameters, helper for aggregated lookups.
   */
  static async findIds(where: Prisma.ProductWhereInput, skip: number, take: number) {
    try {
      const items = await prisma.product.findMany({
        where,
        select: { id: true },
        skip,
        take,
      });
      return items.map((item) => item.id);
    } catch (error) {
      console.error("ProductRepository.findIds error:", error);
      throw new Error("Failed to query product IDs from database");
    }
  }

  /**
   * Get dynamic aggregated average ratings for a subset of products in one query.
   */
  static async getAverageRatingsForProductIds(productIds: string[]) {
    try {
      return await prisma.review.groupBy({
        by: ["productId"],
        _avg: { rating: true },
        where: {
          productId: {
            in: productIds,
          },
        },
      });
    } catch (error) {
      console.error("ProductRepository.getAverageRatingsForProductIds error:", error);
      throw new Error("Failed to calculate average product ratings from database");
    }
  }

  /**
   * Fetch a single product by its unique slug.
   */
  static async findBySlug(slug: string) {
    try {
      return await prisma.product.findUnique({
        where: { slug, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          compareAtPrice: true,
          sku: true,
          stock: true,
          specifications: true,
          isFeatured: true,
          images: { orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true, logo: true } },
          compatibilities: {
            select: {
              yearStart: true,
              yearEnd: true,
              notes: true,
              vehicleModel: {
                select: {
                  name: true,
                  yearStart: true,
                  yearEnd: true,
                  brand: { select: { name: true } },
                },
              },
            },
          },
          _count: { select: { reviews: true } },
        },
      });
    } catch (error) {
      console.error("ProductRepository.findBySlug error:", error);
      throw new Error("Failed to query product details by slug");
    }
  }

  /**
   * Get average rating and count of reviews for a single product.
   */
  static async getRatingMetricsForProduct(productId: string) {
    try {
      return await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
      });
    } catch (error) {
      console.error("ProductRepository.getRatingMetricsForProduct error:", error);
      throw new Error("Failed to query product review metrics");
    }
  }

  /**
   * Fetch featured products.
   */
  static async findFeatured(limit: number) {
    try {
      return await prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          stock: true,
          images: { select: { url: true, alt: true }, take: 1 },
          category: { select: { name: true } },
          brand: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("ProductRepository.findFeatured error:", error);
      throw new Error("Failed to query featured products");
    }
  }
}
