import prisma from "@/lib/prisma";

/**
 * CategoryRepository
 * Handles database operations for Categories.
 */
export class CategoryRepository {
  /**
   * Fetch all top-level categories with their children and products count.
   */
  static async findAllTopLevel() {
    try {
      return await prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: true,
          _count: { select: { products: true } },
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("CategoryRepository.findAllTopLevel error:", error);
      throw new Error("Failed to query categories from database");
    }
  }

  /**
   * Fetch a single category by slug, including its children.
   */
  static async findBySlug(slug: string) {
    try {
      return await prisma.category.findUnique({
        where: { slug },
        include: { children: true },
      });
    } catch (error) {
      console.error("CategoryRepository.findBySlug error:", error);
      throw new Error("Failed to query category by slug from database");
    }
  }
}
