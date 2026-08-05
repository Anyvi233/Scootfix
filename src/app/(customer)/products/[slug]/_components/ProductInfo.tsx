"use client";

import React from "react";
import { FiTruck, FiShield } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/lib/utils";
import { FiStar } from "react-icons/fi";

interface ProductInfoProps {
  product: import("@prisma/client").Product & { brand?: { name: string } };
  averageRating: number;
  reviewsCount: number;
}

/**
 * Displays static product metadata: brand, name, rating summary,
 * stock badge, price, and shipping/warranty trust badges.
 * No interactivity — safe to render on the server if extracted further.
 */
export function ProductInfo({ product, averageRating, reviewsCount }: ProductInfoProps) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <section aria-label="Product details">
      {/* Brand */}
      <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
        {product.brand?.name}
      </p>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-text-primary leading-tight mb-4">
        {product.name}
      </h1>

      {/* Rating summary */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div
          className="flex items-center gap-1"
          role="img"
          aria-label={`Rated ${averageRating.toFixed(1)} out of 5 stars, ${reviewsCount} reviews`}
        >
          <div className="flex items-center text-warning" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-current text-warning" : "text-border fill-border"}`}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-text-muted font-medium ml-1">
            {averageRating.toFixed(1)} ({reviewsCount} Reviews)
          </span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
        <span className="text-sm text-text-muted">SKU: <span className="font-mono">{product.sku}</span></span>
      </div>

      {/* Stock badge */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant={product.stock > 0 ? "success" : "danger"}>
          <span aria-live="polite">
            {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
          </span>
        </Badge>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 mb-8" aria-label={`Price: ${formatPrice(product.price)}${discount > 0 ? `, ${discount}% off` : ""}`}>
        <span className="text-3xl md:text-4xl font-bold text-text-primary">{formatPrice(product.price)}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-xl text-text-muted line-through mb-1" aria-label={`Original price ${formatPrice(product.compareAtPrice)}`}>
              {formatPrice(product.compareAtPrice)}
            </span>
            {discount > 0 && (
              <span className="text-sm font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md mb-1.5">
                Save {discount}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Trust badges */}
      <div className="bg-surface-elevated rounded-xl p-4 border border-border mb-8" aria-label="Shipping and warranty information">
        <ul className="grid grid-cols-2 gap-4 text-sm list-none m-0 p-0">
          <li className="flex items-center gap-2 text-text-primary">
            <FiTruck className="text-primary" size={18} aria-hidden="true" />
            <span>Free Shipping</span>
          </li>
          <li className="flex items-center gap-2 text-text-primary">
            <FiShield className="text-primary" size={18} aria-hidden="true" />
            <span>Warranty Included</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
