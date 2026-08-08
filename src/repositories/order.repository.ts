import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";

/**
 * OrderRepository
 * Handles transactional order creations and order querying.
 */
export class OrderRepository {
  /**
   * Run the checkout process inside a database transaction to ensure atomicity.
   * Decrements stock, logs inventory changes, creates the order, and clears the cart.
   */
  static async createOrderTransactional(
    userId: string,
    cartItems: (import("@prisma/client").CartItem & { product: import("@prisma/client").Product })[],
    subtotal: number,
    tax: number,
    shipping: number,
    total: number,
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: string,
    paymentId?: string,
    notes?: string,
    razorpayOrderId?: string
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create the order
        const order = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId,
            status: paymentMethod === "online" ? "PAID" : "PENDING",
            subtotal,
            tax,
            shipping,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            paymentId,
            razorpayOrderId,
            notes,
            items: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
              })),
            },
          },
          include: { items: true },
        });

        // 2. Decrement stock & log inventory changes with guard
        for (const item of cartItems) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            // No rows updated means insufficient stock at transaction time
            throw new Error(`Insufficient stock for ${item.product.name}`);
          }

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: -item.quantity,
              reason: `ORDER:${order.orderNumber}`,
            },
          });
        }

        // 3. Clear user's cart
        await tx.cartItem.deleteMany({
          where: { userId },
        });

        return order;
      });
    } catch (error) {
      console.error("OrderRepository.createOrderTransactional error:", error);
      throw error; // Propagate the original error (e.g. out of stock or custom message)
    }
  }

  /**
   * Fetch all orders for a specific user, paginated.
   */
  static async findManyByUserId(userId: string, skip: number, take: number) {
    try {
      return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("OrderRepository.findManyByUserId error:", error);
      throw new Error("Failed to query user orders from database");
    }
  }

  /**
   * Count total orders matching a user ID.
   */
  static async countByUserId(userId: string) {
    try {
      return await prisma.order.count({
        where: { userId },
      });
    } catch (error) {
      console.error("OrderRepository.countByUserId error:", error);
      throw new Error("Failed to count user orders in database");
    }
  }
}
