import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";
import { generateOrderCsv } from "@/lib/csvExport";

export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            include: {
              product: { select: { sku: true, name: true } },
            },
          },
          refunds: true,
        },
      });

      const csv = generateOrderCsv(orders);
      const today = new Date().toISOString().split("T")[0];

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="scootfix_orders_${today}.csv"`,
        },
      });
    } catch (error: any) {
      console.error("Admin orders export error:", error);
      return NextResponse.json(
        { error: "Failed to export orders" },
        { status: 500 }
      );
    }
  });
}
