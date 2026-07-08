import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * CartRepository
 * Handles database access logic for CartItems.
 */
export class CartRepository {
  /**
   * Fetch all cart items for a user including product details and images.
   */
  static async findManyByUserId(userId: string) {
    try {
      return await prisma.cartItem.findMany({
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
      console.error("CartRepository.findManyByUserId error:", error);
      throw new Error("Failed to fetch cart items from database");
    }
  }

  /**
   * Find a unique cart item by user ID and product ID.
   */
  static async findUnique(userId: string, productId: string) {
    try {
      return await prisma.cartItem.findUnique({
        where: {
          userId_productId: { userId, productId },
        },
      });
    } catch (error) {
      console.error("CartRepository.findUnique error:", error);
      throw new Error("Failed to find cart item");
    }
  }

  /**
   * Update cart item quantity by ID.
   */
  static async update(id: string, data: Prisma.CartItemUpdateInput) {
    try {
      return await prisma.cartItem.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("CartRepository.update error:", error);
      throw new Error("Failed to update cart item quantity");
    }
  }

  /**
   * Update cart item quantity by composite keys.
   */
  static async updateByCompositeKey(userId: string, productId: string, quantity: number) {
    try {
      return await prisma.cartItem.update({
        where: {
          userId_productId: { userId, productId },
        },
        data: { quantity },
      });
    } catch (error) {
      console.error("CartRepository.updateByCompositeKey error:", error);
      throw new Error("Failed to update cart item quantity");
    }
  }

  /**
   * Create a new cart item.
   */
  static async create(userId: string, productId: string, quantity: number) {
    try {
      return await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    } catch (error) {
      console.error("CartRepository.create error:", error);
      throw new Error("Failed to create cart item");
    }
  }

  /**
   * Delete a cart item by composite keys.
   */
  static async delete(userId: string, productId: string) {
    try {
      return await prisma.cartItem.delete({
        where: {
          userId_productId: { userId, productId },
        },
      });
    } catch (error) {
      console.error("CartRepository.delete error:", error);
      throw new Error("Failed to remove item from cart");
    }
  }
}
