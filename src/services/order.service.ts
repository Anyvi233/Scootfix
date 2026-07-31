import { OrderRepository } from "@/repositories/order.repository";
import { CartRepository } from "@/repositories/cart.repository";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export class OrderService {
  static async createOrder(
    userId: string,
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: string,
    paymentId?: string,
    notes?: string,
    couponCode?: string
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

    // 3. Process coupon validation if provided
    let discountAmount = 0;
    let isFreeShipping = false;
    
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date() <= new Date(coupon.expiresAt);
        const withinUses = coupon.maxUses === null || coupon.usedCount < coupon.maxUses;
        const metMinAmount = subtotal >= coupon.minOrderAmount;

        if (notExpired && withinUses && metMinAmount) {
          if (coupon.discountType === "PERCENT") {
            discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
          } else if (coupon.discountType === "FLAT") {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          } else if (coupon.discountType === "FREESHIP") {
            isFreeShipping = true;
          }

          // Increment coupon usage count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(discountedSubtotal * 0.18); // 18% GST
    const shipping = discountedSubtotal > 5000 || isFreeShipping ? 0 : 250; // Align with checkout logic
    const total = discountedSubtotal + tax + shipping;

    // 4. Delegate transaction to OrderRepository
    const order = await OrderRepository.createOrderTransactional(
      userId,
      cartItems,
      discountedSubtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      notes
    );

    // 5. Send order confirmation email (non-blocking — don't fail order if email fails)
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    if (user?.email) {
      sendOrderConfirmationEmail({
        orderNumber:   order.orderNumber,
        customerName:  user.name || shippingAddress.name || "Customer",
        customerEmail: shippingAddress.email || user.email,
        items: cartItems.map(i => ({
          name:     i.product.name,
          quantity: i.quantity,
          price:    i.product.price,
        })),
        subtotal:      discountedSubtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        shippingAddress,
        createdAt: order.createdAt.toISOString(),
      }).catch(err => console.error("[Email] Failed to send confirmation:", err));
    }

    return order;
  }

  static async cancelOrder(userId: string, orderId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.userId !== userId) {
        throw new Error("Unauthorized");
      }

      if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
        throw new Error(`Orders in ${order.status} status cannot be cancelled.`);
      }

      // 2. Update status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });

      // 3. Restore product stock & log inventory
      for (const item of order.items) {
        if (!item.productId) continue;

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: item.quantity,
            reason: `CANCEL_ORDER:${order.orderNumber}`,
          }
        });
      }

      return updatedOrder;
    });
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
