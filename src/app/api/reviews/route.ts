import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/reviews?productId=xxx&page=1&limit=10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const [reviews, total, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.groupBy({
        by: ["rating"],
        where: { productId },
        _count: { rating: true },
      }),
    ]);

    // Format rating counts for horizontal meters (e.g. { "5": 12, "4": 3 })
    const ratingDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    aggregate.forEach((item) => {
      ratingDistribution[String(item.rating)] = item._count.rating;
    });

    return NextResponse.json({
      items: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      ratingDistribution,
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment } = body;

    const parsedRating = parseInt(rating);
    if (!productId || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Invalid rating or product ID" }, { status: 400 });
    }

    // 1. Fetch user ID from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check if user already reviewed this product (unique constraint)
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    // 3. Verify if user bought the product (Verified Purchase logic)
    const completedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
    });
    const isVerified = !!completedOrder;

    let review;
    if (existingReview) {
      // Overwrite/update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: parsedRating,
          title: title || null,
          comment: comment || null,
          isVerified,
        },
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId: user.id,
          productId,
          rating: parsedRating,
          title: title || null,
          comment: comment || null,
          isVerified,
        },
      });
    }

    // Invalidate product cache to recalculate aggregates
    try {
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
      if (product?.slug) {
        // Clear caches so client fetches updated aggregates
        const { ProductService } = require("@/services/product.service");
        ProductService.invalidateProductCache(product.slug);
      }
    } catch (e) {
      console.warn("Failed to invalidate product cache on review submit", e);
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
