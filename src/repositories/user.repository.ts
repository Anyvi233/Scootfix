import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * UserRepository
 * Handles all database operations for the User model.
 */
export class UserRepository {
  /**
   * Create a new user record.
   */
  static async create(data: Prisma.UserCreateInput) {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      console.error("UserRepository.create error:", error);
      throw new Error("Failed to create user in database");
    }
  }

  /**
   * Find a user by their unique email address.
   */
  static async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error("UserRepository.findByEmail error:", error);
      throw new Error("Database query failed for user lookup by email");
    }
  }

  /**
   * Find a user by their unique ID, selecting only non-sensitive fields.
   */
  static async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("UserRepository.findById error:", error);
      throw new Error("Database query failed for user lookup by ID");
    }
  }

  /**
   * Update an existing user record.
   */
  static async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
          role: true,
        },
      });
    } catch (error) {
      console.error("UserRepository.update error:", error);
      throw new Error("Failed to update user in database");
    }
  }
}
