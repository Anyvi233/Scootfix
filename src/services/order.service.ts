import { OrderRepository } from "@/repositories/order.repository";
import { CartRepository } from "@/repositories/cart.repository";

export class OrderService {
  static async createOrder(
    userId: string,
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: string,
    paymentId?: string,
    notes?: string
  ) {
    // 1. Get cart items using CartRepository
    const cartItems = await CartRepository.findManyByUserId(userId);

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Calculate totals and check stock
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
      subtotal += item.product.price * item.quantity;
    }

    const tax = subtotal * 0.18; // 18% GST Example
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const total = subtotal + tax + shipping;

    // 3. Delegate transaction to OrderRepository
    return await OrderRepository.createOrderTransactional(
      userId,
      cartItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      notes
    );
  }

  static async getOrdersByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      OrderRepository.findManyByUserId(userId, skip, limit),
      OrderRepository.countByUserId(userId)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
