import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * ReviewRepository
 * Handles database operations for Reviews.
 */
export class ReviewRepository {
  /**
   * Check if a user has purchased a product.
   */
  static async findOrderWithProduct(userId: string, productId: string) {
    try {
      return await prisma.order.findFirst({
        where: {
          userId,
          items: { some: { productId } },
        },
      });
    } catch (error) {
      console.error("ReviewRepository.findOrderWithProduct error:", error);
      throw new Error("Failed to check product purchase history");
    }
  }

  /**
   * Create a new review record.
   */
  static async create(data: Prisma.ReviewCreateInput) {
    try {
      return await prisma.review.create({ data });
    } catch (error) {
      console.error("ReviewRepository.create error:", error);
      throw new Error("Failed to create review in database");
    }
  }

  /**
   * Fetch reviews for a specific product, paginated.
   */
  static async findManyByProductId(productId: string, skip: number, take: number) {
    try {
      return await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      });
    } catch (error) {
      console.error("ReviewRepository.findManyByProductId error:", error);
      throw new Error("Failed to fetch product reviews from database");
    }
  }

  /**
   * Count total reviews for a specific product.
   */
  static async countByProductId(productId: string) {
    try {
      return await prisma.review.count({
        where: { productId },
      });
    } catch (error) {
      console.error("ReviewRepository.countByProductId error:", error);
      throw new Error("Failed to count reviews in database");
    }
  }
}
