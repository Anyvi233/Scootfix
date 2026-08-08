import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Razorpay from "razorpay";

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
      amount,
      customerName,
      customerEmail,
      customerPhone,
      description,
      callbackUrl,
    } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

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
      amount: Math.round(amount * 100), // paise
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
