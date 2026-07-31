import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // 1. All orders from last 6 months
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { total: true, createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    // 2. Group by month
    const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
    for (const order of orders) {
      const key = order.createdAt.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, orders: 0 };
      monthlyMap[key].revenue += order.total;
      monthlyMap[key].orders += 1;
    }
    const revenueByMonth = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

    // 3. Top selling products (from OrderItems)
    const topProducts = await prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // 4. Order status breakdown
    const statusGroups = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // 5. KPI totals
    const [totalRevenue, totalOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    return NextResponse.json({
      revenueByMonth,
      topProducts: topProducts.map((p) => ({
        name: p.name.length > 30 ? p.name.slice(0, 30) + "…" : p.name,
        units: p._sum.quantity || 0,
        revenue: (p._sum.price || 0) * (p._sum.quantity || 0),
      })),
      statusBreakdown: statusGroups.map((s) => ({ status: s.status, count: s._count.status })),
      kpis: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalProducts,
        totalCustomers: totalUsers,
      },
    });
  });
}
