import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

// GET /api/cart
// Fetches the active database cart for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: token.id as string },
      include: {
        product: {
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map DB items to match client CartItem interface
    const cartItems = items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      compareAtPrice: item.product.compareAtPrice,
      image: item.product.images[0]?.url || "/placeholder.jpg",
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/cart
// Synchronizes client-side localStorage cart with database
// Body: { items: { id: string, quantity: number }[] }
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items = [] } = body;

    // Run in a transaction to replace database cart items
    await prisma.$transaction(async (tx) => {
      // 1. Clear existing database cart items
      await tx.cartItem.deleteMany({
        where: { userId: token.id as string },
      });

      // 2. Insert new cart items if any
      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item: any) => ({
            userId: token.id as string,
            productId: item.id,
            quantity: item.quantity,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
