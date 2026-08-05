import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { id: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } }
        },
      });
      return NextResponse.json(orders);
    } catch (error: any) {
      console.error("Admin orders GET error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
  });
}
