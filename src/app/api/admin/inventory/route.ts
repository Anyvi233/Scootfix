import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const inventoryItems = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        supplier: true,
        stock: true,
        lowStockThreshold: true,
        price: true,
        purchasePrice: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { select: { url: true }, take: 1 },
        inventoryLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            change: true,
            reason: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { stock: "asc" },
    });

    return NextResponse.json(inventoryItems);
  });
}
