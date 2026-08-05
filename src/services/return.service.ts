import { ReturnRepository } from "@/repositories/return.repository";

export class ReturnService {
  static async createReturn(userId: string, data: { orderId: string, resolution?: string, notes?: string, description?: string, reason?: string, items: any[] }) {
    return ReturnRepository.create({
      user: { connect: { id: userId } },
      order: { connect: { id: data.orderId } },
      reason: data.reason || "OTHER",
      description: data.description,
      items: {
        create: data.items.map((item: any) => ({
          orderItem: { connect: { id: item.orderItemId } },
          quantity: item.quantity,
          reason: item.reason
        }))
      }
    });
  }

  static async getReturnsByUser(userId: string) {
    return ReturnRepository.findManyByUserId(userId);
  }
}
