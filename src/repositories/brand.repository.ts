import prisma from "@/lib/prisma";

/**
 * BrandRepository
 * Handles data access logic for Brands.
 */
export class BrandRepository {
  /**
   * Fetch all brands ordered by name.
   */
  static async findAll() {
    try {
      return await prisma.brand.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      });
    } catch (error) {
      console.error("BrandRepository.findAll error:", error);
      throw new Error("Failed to fetch brands from database");
    }
  }

  /**
   * Fetch a single brand by its unique slug.
   */
  static async findBySlug(slug: string) {
    try {
      return await prisma.brand.findUnique({
        where: { slug },
      });
    } catch (error) {
      console.error("BrandRepository.findBySlug error:", error);
      throw new Error("Failed to fetch brand by slug");
    }
  }
}
