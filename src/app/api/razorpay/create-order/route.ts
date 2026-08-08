import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Razorpay from "razorpay";
import { CartRepository } from "@/repositories/cart.repository";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Compute authoritative amount from the user's cart (subtotal + shipping + GST)
    const userId = token.id as string;
const cartItems = await CartRepository.findManyByUserId(userId);
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.product.price * item.quantity;
    }

    // Apply default shipping (250 INR) and GST (if configured) – same as OrderService
    const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
    const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || 18);
    const shipping = subtotal > 5000 ? 0 : 250;
    const tax = gstNumber ? Math.round((subtotal + shipping) * (gstRate / 100)) : 0;
    const total = subtotal + shipping + tax;

    // Razorpay expects amount in paise (1 rupee = 100 paise)
    const order = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: true,
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("POST /api/razorpay/create-order error:", error);
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
