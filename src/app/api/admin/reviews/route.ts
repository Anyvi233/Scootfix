import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

// GET /api/admin/reviews — fetch all reviews with user + product context
export async function GET(req: NextRequest) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, image: true } },
        product: { select: { name: true, slug: true } },
      },
    });
    return NextResponse.json(reviews);
  });
}
