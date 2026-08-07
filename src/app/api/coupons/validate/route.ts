import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/coupons/validate
// Body: { code: string, orderAmount: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderAmount = 0, userId } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code. Please check and try again." }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }

    // Check if this user has already used the coupon
    const priorUsage = await prisma.couponUsage.findFirst({
      where: { couponId: coupon.id, userId },
    });
    if (priorUsage) {
      return NextResponse.json({ error: "Coupon already used by this user." }, { status: 400 });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        error: `This coupon requires a minimum order of ₹${coupon.minOrderAmount.toLocaleString("en-IN")}.`,
      }, { status: 400 });
    }

    // Calculate the discount amount
    let discountAmount = 0;
    let discountLabel = "";

    if (coupon.discountType === "PERCENT") {
      discountAmount = Math.round(orderAmount * (coupon.discountValue / 100));
      discountLabel = `${coupon.discountValue}% off`;
    } else if (coupon.discountType === "FLAT") {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
      discountLabel = `₹${coupon.discountValue} off`;
    } else if (coupon.discountType === "FREESHIP") {
      discountAmount = 0;
      discountLabel = "Free Shipping";
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      discountLabel,
      freeShipping: coupon.discountType === "FREESHIP",
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
