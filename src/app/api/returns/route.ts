import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { orderId, reason, description, items } = body;
    // items = [{ orderItemId, quantity, reason }]

    if (!orderId || !reason || !items?.length) {
      return NextResponse.json({ error: "orderId, reason, and items are required." }, { status: 400 });
    }

    // Verify order belongs to this user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: token.id as string }
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const returnReq = await prisma.return.create({
      data: {
        orderId,
        userId: token.id as string,
        reason,
        description,
        status: "REQUESTED",
        items: {
          create: items.map((i: { orderItemId: string, reason: string, quantity?: number }) => ({
            orderItemId: i.orderItemId,
            quantity: i.quantity || 1,
            reason: i.reason || reason,
          }))
        }
      }
    });

    return NextResponse.json(returnReq, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/returns error:", err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : "An error occurred") || "Failed to create return request." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const returns = await prisma.return.findMany({
      where: { userId: token.id as string },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { orderNumber: true } },
        items: {
          include: {
            orderItem: { select: { name: true, price: true } }
          }
        }
      }
    });
    return NextResponse.json(returns);
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch returns." }, { status: 500 });
  }
}
