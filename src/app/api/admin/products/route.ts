import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } }
      }
    });

    const mapped = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      category: p.category?.name || "Uncategorized",
      brand: p.brand?.name || "Aftermarket",
      isActive: p.isActive
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, sku, price, stock, categoryName, brandName } = body;

    if (!name || !sku || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get or create category
    let category = await prisma.category.findFirst({
      where: { name: categoryName || "General" }
    });
    if (!category) {
      const slug = (categoryName || "General").toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
      category = await prisma.category.create({
        data: { name: categoryName || "General", slug }
      });
    }

    // 2. Get or create brand
    let brand = await prisma.brand.findFirst({
      where: { name: brandName || "Scootfix Genuine" }
    });
    if (!brand) {
      const slug = (brandName || "Scootfix Genuine").toLowerCase().replace(/\s+/g, '-');
      brand = await prisma.brand.create({
        data: { name: brandName || "Scootfix Genuine", slug }
      });
    }

    const slug = name.toLowerCase().replace(/ & /g, '-').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check unique slug/sku
    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug }] }
    });
    if (existing) {
      return NextResponse.json({ error: "Product with this SKU or Name already exists" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        description: name,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId: category.id,
        brandId: brand.id,
        purchasePrice: parseFloat(price) * 0.6 // simulated
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : "An error occurred") || "Failed to create product" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!await isAdminRequest(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 400 });
  }
}
