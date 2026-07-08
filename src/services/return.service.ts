import { ReturnRepository } from "@/repositories/return.repository";

export class ReturnService {
  static async createReturn(userId: string, data: any) {
    return ReturnRepository.create({
      user: { connect: { id: userId } },
      order: { connect: { id: data.orderId } },
      reason: data.reason,
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
