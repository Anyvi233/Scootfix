import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const skipParam = searchParams.get("skip");
    const takeParam = searchParams.get("take");

    if (!skipParam || !takeParam) {
      return NextResponse.json({ error: "skip and take parameters are required" }, { status: 400 });
    }

    const skip = parseInt(skipParam, 10);
    const take = parseInt(takeParam, 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    // Search Products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
        ]
      },
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        category: { select: { name: true } },
        images: { take: 1, select: { url: true } }
      }
    });

    // Search Categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: query }
      },
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
