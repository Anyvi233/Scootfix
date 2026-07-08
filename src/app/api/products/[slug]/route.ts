import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const product = await ProductService.getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error in product by slug API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
