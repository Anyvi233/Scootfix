import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { OrderService } from "@/services/order.service";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderAlert } from "@/lib/mailer";
import { sendWhatsAppMessage } from "@/lib/whatsapp";



export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const ordersResult = await OrderService.getOrdersByUser(token.id as string, page, limit);
    return NextResponse.json(ordersResult);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { shippingAddress, billingAddress, paymentMethod, paymentId, notes, couponCode, deliveryOption } = body;

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await OrderService.createOrder(
      token.id as string,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      notes,
      couponCode,
      deliveryOption
    );
  // ---- Send WhatsApp admin notification ----
  await sendWhatsAppMessage(`New order placed: #${order.orderNumber}`);
// ---- Send transactional emails (non‑blocking) ----
const user = await prisma.user.findUnique({
  where: { id: token.id as string },
  select: { name: true, email: true },
});
const orderWithItems = await prisma.order.findUnique({
  where: { id: order.id },
  include: { items: true },
});
if (user?.email && orderWithItems) {
  const emailData = {
    orderNumber: order.orderNumber,
    customerName: user.name || shippingAddress.name || "Customer",
    customerEmail: user.email,
    items: orderWithItems.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      price: Number(i.price),
    })),
    subtotal: Number(order.subtotal),
    tax: Number(order.tax ?? 0),
    shipping: Number(order.shipping ?? 0),
    total: Number(order.total),
    paymentMethod,
    shippingAddress,
    createdAt: order.createdAt.toISOString(),
  };
  await Promise.allSettled([
    sendOrderConfirmationEmail(emailData),
    sendAdminOrderAlert(emailData),
  ]);
}
return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : "An error occurred") || "Failed to place order" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const cancelledOrder = await OrderService.cancelOrder(token.id as string, orderId);
    return NextResponse.json(cancelledOrder);
  } catch (error: unknown) {
    console.error("PATCH /api/orders error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : "An error occurred") || "Failed to cancel order" }, { status: 400 });
  }
}
