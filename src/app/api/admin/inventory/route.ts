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

export async function POST(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async (user) => {
    try {
      const body = await req.json();
      const { productId, change, reason, supplier, purchasePrice, price } = body;

      const parsedChange = parseInt(change);
      if (!productId || isNaN(parsedChange) || parsedChange === 0 || !reason) {
        return NextResponse.json(
          { error: "Invalid parameters. productId, non-zero change, and reason are required." },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }

      const newStock = Math.max(0, product.stock + parsedChange);

      const updatedProduct = await prisma.$transaction(async (tx) => {
        await tx.inventoryLog.create({
          data: {
            productId,
            change: parsedChange,
            reason,
            userId: user.id,
          },
        });

        const updateData: any = {
          stock: newStock,
        };

        if (supplier) updateData.supplier = supplier;
        if (purchasePrice !== undefined && purchasePrice !== null && !isNaN(parseFloat(purchasePrice))) {
          updateData.purchasePrice = parseFloat(purchasePrice);
        }
        if (price !== undefined && price !== null && !isNaN(parseFloat(price))) {
          updateData.price = parseFloat(price);
        }

        return await tx.product.update({
          where: { id: productId },
          data: updateData,
          select: {
            id: true,
            name: true,
            stock: true,
          },
        });
      });

      return NextResponse.json({ success: true, product: updatedProduct });
    } catch (err: any) {
      console.error("POST /api/admin/inventory error:", err);
      return NextResponse.json({ error: err.message || "Failed to update inventory." }, { status: 500 });
    }
  });
}
