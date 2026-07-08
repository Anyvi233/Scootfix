import { VehicleRepository } from "@/repositories/vehicle.repository";

export class VehicleService {
  static async getVehicleModelsByBrand(brandId: string) {
    return VehicleRepository.findManyByBrandId(brandId);
  }
}
