import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            include: {
              product: {
                select: {
                  slug: true,
                  images: { select: { url: true }, take: 1 }
                }
              }
            }
          }
        }
      }),
      prisma.order.count()
    ]);

    return NextResponse.json({
      items: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status, trackingNumber, trackingUrl } = body;

    const VALID_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!orderId || !status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
    }

    const updateData: any = { status };
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl || null;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("PATCH /api/admin/orders error:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 400 });
  }
}
