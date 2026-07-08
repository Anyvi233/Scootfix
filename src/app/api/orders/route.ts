import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { OrderService } from "@/services/order.service";

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
    const { shippingAddress, billingAddress, paymentMethod, paymentId, notes } = body;

    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await OrderService.createOrder(
      token.id as string,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentId,
      notes
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 400 });
  }
}
