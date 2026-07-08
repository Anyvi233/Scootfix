import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * ReturnRepository
 * Handles database operations for Returns.
 */
export class ReturnRepository {
  /**
   * Create a new return request with its items.
   */
  static async create(data: Prisma.ReturnCreateInput) {
    try {
      return await prisma.return.create({
        data,
      });
    } catch (error) {
      console.error("ReturnRepository.create error:", error);
      throw new Error("Failed to create return request in database");
    }
  }

  /**
   * Fetch all returns filed by a specific user.
   */
  static async findManyByUserId(userId: string) {
    try {
      return await prisma.return.findMany({
        where: { userId },
        include: {
          order: true,
          items: {
            include: { orderItem: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("ReturnRepository.findManyByUserId error:", error);
      throw new Error("Failed to fetch returns from database");
    }
  }
}
