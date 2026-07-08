import prisma from "@/lib/prisma";

/**
 * WishlistRepository
 * Handles database operations for Wishlist.
 */
export class WishlistRepository {
  /**
   * Fetch a user's wishlist including product details and images.
   */
  static async findManyByUserId(userId: string) {
    try {
      return await prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("WishlistRepository.findManyByUserId error:", error);
      throw new Error("Failed to query wishlist from database");
    }
  }

  /**
   * Find a unique wishlist item by user ID and product ID.
   */
  static async findUnique(userId: string, productId: string) {
    try {
      return await prisma.wishlist.findUnique({
        where: {
          userId_productId: { userId, productId },
        },
      });
    } catch (error) {
      console.error("WishlistRepository.findUnique error:", error);
      throw new Error("Failed to query wishlist item from database");
    }
  }

  /**
   * Create a new wishlist item.
   */
  static async create(userId: string, productId: string) {
    try {
      return await prisma.wishlist.create({
        data: { userId, productId },
      });
    } catch (error) {
      console.error("WishlistRepository.create error:", error);
      throw new Error("Failed to add item to wishlist in database");
    }
  }

  /**
   * Delete a wishlist item.
   */
  static async delete(userId: string, productId: string) {
    try {
      return await prisma.wishlist.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });
    } catch (error) {
      console.error("WishlistRepository.delete error:", error);
      throw new Error("Failed to remove item from wishlist in database");
    }
  }
}
