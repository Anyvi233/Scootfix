import prisma from "@/lib/prisma";

/**
 * VehicleRepository
 * Handles database operations for VehicleModels.
 */
export class VehicleRepository {
  /**
   * Fetch all vehicle models associated with a specific brand.
   */
  static async findManyByBrandId(brandId: string) {
    try {
      return await prisma.vehicleModel.findMany({
        where: { brandId },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      console.error("VehicleRepository.findManyByBrandId error:", error);
      throw new Error("Failed to query vehicle models from database");
    }
  }
}
