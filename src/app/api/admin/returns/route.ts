import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const returns = await prisma.return.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, total: true } },
        items: {
          include: {
            orderItem: {
              select: {
                name: true,
                price: true,
                quantity: true,
                productId: true,
              }
            }
          }
        }
      }
    });
    return NextResponse.json(returns);
  });
}

export async function PATCH(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async (user) => {
    try {
      const body = await req.json();
      const { returnId, status, resolution } = body; // status: APPROVED | REJECTED | PROCESSING

      if (!returnId || !status) {
        return NextResponse.json({ error: "returnId and status are required." }, { status: 400 });
      }

      const returnReq = await prisma.return.findUnique({
        where: { id: returnId },
        include: {
          items: {
            include: {
              orderItem: { select: { productId: true, name: true } }
            }
          }
        }
      });

      if (!returnReq) {
        return NextResponse.json({ error: "Return request not found." }, { status: 404 });
      }

      // If APPROVED → restock items via transaction
      if (status === "APPROVED") {
        await prisma.$transaction(async (tx) => {
          // Update return status
          await tx.return.update({
            where: { id: returnId },
            data: { status, resolution: resolution || "Return approved. Refund will be processed within 3-5 business days." }
          });

          // Restock each returned item and log it
          for (const returnItem of returnReq.items) {
            const productId = returnItem.orderItem.productId;
            if (!productId) continue;

            await tx.product.update({
              where: { id: productId },
              data: { stock: { increment: returnItem.quantity } }
            });

            await tx.inventoryLog.create({
              data: {
                productId,
                change: returnItem.quantity,
                reason: `RETURN:${returnReq.id.slice(0, 8)}`,
                userId: user.id,
              }
            });
          }
        });
      } else {
        // REJECTED or PROCESSING — just update status
        await prisma.return.update({
          where: { id: returnId },
          data: {
            status,
            resolution: resolution || (status === "REJECTED" ? "Return request rejected after review." : undefined)
          }
        });
      }

      return NextResponse.json({ success: true });
    } catch (err: any) {
      console.error("PATCH /api/admin/returns error:", err);
      return NextResponse.json({ error: err.message || "Failed to update return." }, { status: 500 });
    }
  });
}
