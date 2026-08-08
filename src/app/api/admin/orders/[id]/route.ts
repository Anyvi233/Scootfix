import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";
import { sendShippingEmail } from "@/lib/email";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    try {
      const { id } = await context.params;
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
        },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(order);
    } catch (error: any) {
      console.error("Admin order GET error:", error);
      return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
    }
  });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    try {
      const { id } = await context.params;
      const { status, trackingNumber, trackingUrl } = await req.json();

      const order = await prisma.order.findUnique({
        where: { id },
        include: { user: true, items: true }
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const isCancelling = (status === "CANCELLED" || status === "REFUNDED") &&
                           (order.status !== "CANCELLED" && order.status !== "REFUNDED");
                           
      let updatedOrder;

      if (isCancelling) {
        const operations: any[] = [];
        
        operations.push(
          prisma.order.update({
            where: { id },
            data: {
              status: status || undefined,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
              trackingUrl: trackingUrl !== undefined ? trackingUrl : undefined,
            },
            include: {
              user: { select: { name: true, email: true } },
              items: true,
            },
          })
        );
        
        const reasonPrefix = status === "CANCELLED" ? "CANCEL_ORDER:" : "REFUND_ORDER:";
        
        for (const item of order.items) {
          if (item.productId) {
            operations.push(
              prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
              })
            );
            operations.push(
              prisma.inventoryLog.create({
                data: {
                  productId: item.productId,
                  change: item.quantity,
                  reason: `${reasonPrefix}${order.orderNumber}`
                }
              })
            );
          }
        }
        
        const results = await prisma.$transaction(operations);
        updatedOrder = results[0];
      } else {
        updatedOrder = await prisma.order.update({
          where: { id },
          data: {
            status: status || undefined,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
            trackingUrl: trackingUrl !== undefined ? trackingUrl : undefined,
          },
          include: {
            user: { select: { name: true, email: true } },
            items: true,
          },
        });
      }

      // If status is SHIPPED, and it either transitioned to SHIPPED or added tracking info
      const isTransitioningToShipped = status === "SHIPPED" && order.status !== "SHIPPED";
      const isAddingTrackingToAlreadyShipped = 
        order.status === "SHIPPED" && 
        status === "SHIPPED" && 
        !order.trackingNumber && 
        !order.trackingUrl && 
        (trackingNumber || trackingUrl);

      if (
        (isTransitioningToShipped || isAddingTrackingToAlreadyShipped) &&
        order.user?.email &&
        (trackingUrl || trackingNumber)
      ) {
        const finalTrackingUrl = trackingUrl || `https://www.17track.net/en/track?nums=${trackingNumber}`;
        await sendShippingEmail(order.user.email, order.orderNumber, finalTrackingUrl);
      }

      return NextResponse.json(updatedOrder);
    } catch (error: any) {
      console.error("Admin order PATCH error:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
  });
}
