"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiHeart, FiShare2, FiShoppingCart, FiCheck,
  FiTruck, FiShield
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGallery } from "@/components/shared/ProductGallery";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { formatPrice, cn } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface Props {
  product: any;
}

export function ProductDetailsClient({ product }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const isWishlisted = isInWishlist(product.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const specs = product.specifications
    ? typeof product.specifications === "string"
      ? JSON.parse(product.specifications)
      : product.specifications
    : {};

  const tabItems = [
    {
      id: "description",
      label: "Description",
      content: (
        <div className="prose dark:prose-invert max-w-none text-text-secondary">
          <p>{product.description}</p>
        </div>
      ),
    },
    {
      id: "specifications",
      label: "Specifications",
      content: (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm text-left">
            <tbody>
              {Object.entries(specs).map(([key, value], index) => (
                <tr key={key} className={index % 2 === 0 ? "bg-surface-elevated" : "bg-surface"}>
                  <td className="px-6 py-4 font-medium text-text-primary border-r border-border w-1/3">{key}</td>
                  <td className="px-6 py-4 text-text-secondary">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },

    {
      id: "reviews",
      label: `Reviews (${(product as any).reviewsCount ?? 0})`,
      content: (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 items-center bg-surface p-6 rounded-xl border border-border">
            <div className="text-center sm:text-left">
              <p className="text-5xl font-display font-bold text-text-primary">
                {(product.rating ?? 0).toFixed(1)}
              </p>
              <div className="flex items-center text-warning justify-center sm:justify-start my-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current text-warning" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-muted text-sm">Based on {(product as any).reviewsCount ?? 0} reviews</p>
            </div>
            <div className="flex-grow w-full border-l border-border pl-0 sm:pl-8 pt-6 sm:pt-0 border-t sm:border-t-0 mt-6 sm:mt-0">
              <Button className="w-full sm:w-auto">Write a Review</Button>
            </div>
          </div>
          <div className="grid gap-6">
            <ReviewCard name="Rahul Sharma" rating={5} date="October 12, 2025" comment="Works perfectly. Range is exactly as advertised. Fast shipping!" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Product Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <ProductGallery images={product.images ?? []} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {product.brand?.name}
            </span>
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="p-2 text-text-muted hover:text-text-primary bg-surface rounded-full border border-border shadow-sm transition-colors"
            >
              <FiShare2 size={18} />
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-warning">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating ?? 0) ? "fill-current text-warning" : "text-border fill-border"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-text-muted font-medium ml-1">
                {(product.rating ?? 0).toFixed(1)} ({(product as any).reviewsCount ?? 0} Reviews)
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-sm text-text-muted">SKU: {product.sku}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={product.stock > 0 ? "success" : "danger"} pulse={product.stock > 0}>
              {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
            </Badge>
          </div>



          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-text-primary">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-text-muted line-through mb-1">{formatPrice(product.compareAtPrice)}</span>
                {discount > 0 && (
                  <span className="text-sm font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md mb-1.5">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="bg-surface-elevated rounded-xl p-4 border border-border mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-primary">
                <FiTruck className="text-primary" size={18} />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <FiShield className="text-primary" size={18} />
                <span>Warranty Included</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex gap-4">
              <div className="flex items-center border border-border rounded-lg bg-surface h-14">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >-</button>
                <span className="w-8 text-center font-medium text-text-primary" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <Button
                size="lg"
                className="flex-grow h-14 text-base shadow-glow"
                leftIcon={<FiShoppingCart size={20} />}
                disabled={product.stock === 0}
                onClick={() => addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", stock: product.stock }, quantity)}
              >
                Add to Cart
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="flex-grow h-14 text-base"
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", stock: product.stock }, quantity);
                  router.push("/checkout");
                }}
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={cn("h-14 w-14 shrink-0", isWishlisted && "text-danger border-danger/30 bg-danger/5")}
                onClick={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", category: product.category?.name })}
              >
                <FiHeart size={22} className={isWishlisted ? "fill-current" : ""} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-20">
        <Tabs items={tabItems} className="bg-surface rounded-2xl border border-border shadow-sm p-2 sm:p-6" />
      </div>
    </>
  );
}
