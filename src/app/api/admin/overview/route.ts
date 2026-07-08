import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Revenue (sum order totals where status is not CANCELLED)
    const revenueSum = await prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" }
      },
      _sum: {
        total: true
      }
    });
    const totalRevenue = revenueSum._sum.total || 0;

    // 2. Completed / Active Orders (count where status is not CANCELLED)
    const completedOrders = await prisma.order.count({
      where: {
        status: { not: "CANCELLED" }
      }
    });

    // 3. Total Customers (users with role CUSTOMER)
    const totalCustomers = await prisma.user.count({
      where: {
        role: "CUSTOMER"
      }
    });

    // 4. Low Stock Alerts count & Low Stock Watchlist (stock <= lowStockThreshold)
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true
      }
    });

    const lowStockItems = activeProducts.filter(p => p.stock <= p.lowStockThreshold);
    const lowStockCount = lowStockItems.length;

    // 5. Recent Orders Feed (latest 5 orders)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: {
          select: { name: true }
        },
        items: {
          take: 1,
          select: { name: true }
        }
      }
    });

    const recentOrdersMapped = recentOrders.map(ord => ({
      id: ord.orderNumber,
      name: ord.user?.name || "Customer",
      item: ord.items[0]?.name || "EV Spare Part",
      total: ord.total,
      date: new Date(ord.createdAt).toLocaleDateString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    }));

    // 6. Low Stock Watchlist (up to 5 products)
    const lowStockProducts = lowStockItems.slice(0, 5);

    return NextResponse.json({
      stats: {
        totalRevenue,
        completedOrders,
        totalCustomers,
        lowStockAlerts: lowStockCount
      },
      recentOrders: recentOrdersMapped,
      lowStockProducts: lowStockProducts.map(p => ({
        name: p.name,
        sku: p.sku,
        stock: p.stock
      }))
    });
  } catch (error) {
    console.error("GET /api/admin/overview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
