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
    couponCode?: string,
    deliveryOption?: string,
    razorpayOrderId?: string
  ) {
    // --- COMMERCIAL FRAUD & ABUSE PREVENTION ---
    
    // 1. Address Integrity
    if (shippingAddress) {
      const zip = shippingAddress.zipCode || shippingAddress.zip || "";
      if (!/^\d{6}$/.test(String(zip).trim())) {
        throw new Error("Invalid ZIP Code. Please enter a valid 6-digit PIN code.");
      }
      if (!shippingAddress.street || String(shippingAddress.street).trim().length < 5) {
        throw new Error("Please enter a complete and valid street address.");
      }
    }

    // 2. COD Abuse & Serial Returner Penalties
    if (paymentMethod === "cod") {
      const returnCount = await prisma.return.count({
        where: { userId }
      });
      if (returnCount >= 3) {
        throw new Error("Cash on Delivery is disabled for this account due to a history of multiple returns. Please use an online payment method.");
      }

      const activeCodOrders = await prisma.order.count({
        where: {
          userId,
          paymentMethod: "cod",
          status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"] }
        }
      });
      if (activeCodOrders >= 2) {
        throw new Error("You have reached the maximum limit of active Cash on Delivery orders. Please wait for delivery or pay online.");
      }
    }

    // 1. Get cart items using CartRepository
    const cartItems = await CartRepository.findManyByUserId(userId);

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Calculate totals and check stock
    let subtotal = 0;
    for (const item of cartItems) {
      // 3. Reseller & Quantity Limits
      if (item.quantity > 5) {
        throw new Error(`Quantity limit exceeded: You cannot order more than 5 units of ${item.product.name}.`);
      }
      if (item.product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
      subtotal += item.product.price * item.quantity;
    }

    if (subtotal > 100000) {
      throw new Error("Order total exceeds the maximum allowed retail limit of ₹1,00,000.");
    }

    // 3. Process coupon validation if provided
    let discountAmount = 0;
    let isFreeShipping = false;
    
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        throw new Error("Invalid or inactive coupon code.");
      }

      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        throw new Error("This coupon has expired.");
      }

      if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new Error("This coupon has reached its maximum usage limit.");
      }

      if (subtotal < coupon.minOrderAmount) {
        throw new Error(`Order amount must be at least ₹${coupon.minOrderAmount} to use this coupon.`);
      }

      // Check if user already used this specific coupon
      const existingUsage = await prisma.couponUsage.findUnique({
        where: {
          couponId_userId: {
            couponId: coupon.id,
            userId: userId,
          }
        }
      });

      if (existingUsage) {
        throw new Error("This coupon has already been used by your account.");
      }

      if (coupon.discountType === "PERCENT") {
        discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
      } else if (coupon.discountType === "FLAT") {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      } else if (coupon.discountType === "FREESHIP") {
        isFreeShipping = true;
      }

      // Record coupon usage for the user and increment usage count atomically
      try {
        await prisma.$transaction([
          prisma.couponUsage.create({
            data: { couponId: coupon.id, userId },
          }),
          prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          }),
        ]);
      } catch (err: any) {
        if (err.code === "P2002") {
          throw new Error("This coupon has already been used by your account.");
        }
        throw err;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    
    // GST — only active when a real GSTIN is configured in .env
    const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
    const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || 18);
    const codFee = paymentMethod === "cod" ? 50 : 0;
    
    let baseShipping = 0;
    if (deliveryOption === "express") {
      baseShipping = 600;
    } else if (deliveryOption === "saturday") {
      baseShipping = 800;
    } else {
      baseShipping = (discountedSubtotal > 5000 || isFreeShipping) ? 0 : 250;
    }
    
    const shipping = baseShipping + codFee;
    const tax = gstNumber ? Math.round((discountedSubtotal + shipping) * (gstRate / 100)) : 0;
    const total = discountedSubtotal + tax + shipping;

    // 3.5. Razorpay payment verification server-side to prevent tampering/fake orders
    if (paymentMethod !== "cod") {
      if (!paymentId || !paymentId.startsWith("pay_")) {
        throw new Error("A valid Razorpay payment ID is required for online payments.");
      }

      // Check for duplicate payment ID to prevent double order submissions
      const existingOrder = await prisma.order.findFirst({
        where: { paymentId },
      });
      if (existingOrder) {
        throw new Error("This payment has already been associated with another order.");
      }

      // Fetch payment details directly from Razorpay API
      try {
        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID || "",
          key_secret: process.env.RAZORPAY_KEY_SECRET || "",
        });

        const payment = await razorpay.payments.fetch(paymentId);
        if (!payment) {
          throw new Error("Payment record not found on Razorpay.");
        }

        if (payment.status !== "captured" && payment.status !== "authorized") {
          throw new Error(`Razorpay payment status is ${payment.status}, expected captured or authorized.`);
        }

        // Verify payment amount matches computed order total (within 1 INR margin for rounding)
        const expectedPaise = Math.round(total * 100);
        const actualPaise = payment.amount;
        if (Math.abs(expectedPaise - actualPaise) > 100) {
          throw new Error(`Payment amount mismatch. Expected: INR ${total}, Paid: INR ${actualPaise / 100}`);
        }
      } catch (err: any) {
        console.error("[Razorpay Verify Error] Failed to verify payment:", err);
        throw new Error(err.message || "Razorpay payment verification failed.");
      }
    }

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
      notes,
      razorpayOrderId
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
