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
    // In development, allow unauthenticated requests for easier testing
    if (!token || !token.id) {
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      description,
      callbackUrl,
    } = await req.json();

    // Compute authoritative amount from the user's cart (subtotal + shipping + GST)
    const userId = token?.id as string || "dev_mock_user_id";
    const cartItems = await CartRepository.findManyByUserId(userId);
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.product.price * item.quantity;
    }
    const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
    const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || 18);
    const shipping = subtotal > 5000 ? 0 : 250;
    const tax = gstNumber ? Math.round((subtotal + shipping) * (gstRate / 100)) : 0;
    const total = subtotal + shipping + tax;

    // Razorpay disallows contact numbers with all recurring digits (e.g. 9999999999)
    // We clean and check if it's repeating, empty, or not 10 digits
    let contact = (customerPhone || "").replace(/\D/g, "");
    if (/^(\d)\1+$/.test(contact) || contact.length < 10) {
      contact = "9876543210";
    } else {
      // Ensure it starts with country code if needed, but standard 10 digit works
      contact = contact.slice(-10);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const cancelUrl = `${siteUrl}/checkout`;

    // Create a Razorpay Payment Link
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentLink = await (razorpay as any).paymentLink.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      accept_partial: false,
      description: description || "ScootFix Order Payment",
      customer: {
        name: customerName || "",
        email: customerEmail || "",
        contact: contact,
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: false,
      callback_url: callbackUrl || `${siteUrl}/api/razorpay/callback`,
      callback_method: "get",
      options: {
        checkout: {
          name: "ScootFix",
          theme: { hide_topbar: false },
        },
      },
    });

    return NextResponse.json({
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
    });
  } catch (error) {
    console.error("POST /api/razorpay/payment-link error:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
