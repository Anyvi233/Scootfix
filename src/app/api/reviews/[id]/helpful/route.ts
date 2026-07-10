import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const review = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("PATCH /api/reviews/[id]/helpful error:", error);
    return NextResponse.json({ error: "Failed to update review rating" }, { status: 400 });
  }
}
