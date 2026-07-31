import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiGuard } from "@/lib/security/api-guard";

// PATCH /api/admin/reviews/[id] — flag or unflag a review
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const { id } = await params;
    const body = await req.json();
    const { isFlagged } = body;

    const review = await prisma.review.update({
      where: { id },
      data: { isFlagged: Boolean(isFlagged) },
    });

    return NextResponse.json(review);
  });
}

// DELETE /api/admin/reviews/[id] — permanently delete a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiGuard(req, { auth: true, admin: true, rateLimit: "admin" }, async () => {
    const { id } = await params;

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  });
}
