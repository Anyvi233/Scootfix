"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";


import { useVehicle } from "@/context/VehicleContext";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category: string;
  rating?: number;
  reviewsCount?: number;
  isNew?: boolean;
  compatibilities?: { brand: string; model: string; years: string }[];
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

import { FiHeart, FiShoppingCart } from "react-icons/fi";

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
  rating = 0,
  reviewsCount = 0,
  isNew,
  compatibilities,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const { selectedVehicle, isCompatible } = useVehicle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-surface rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <Badge variant="danger" className="px-2 py-0.5 shadow-sm">
            {discount}% OFF
          </Badge>
        )}
        {isNew && (
          <Badge variant="success" className="px-2 py-0.5 shadow-sm">
            NEW
          </Badge>
        )}

      </div>

      {/* Compatibility Badge — only render after mount to avoid hydration mismatch */}
      {mounted && selectedVehicle && compatibilities && (
        <div className="absolute top-3 left-3 z-10">
          {(() => {
            const { compatible } = isCompatible(
              compatibilities.map(c => ({
                vehicleId: "unknown",
                vehicleModel: { 
                  brand: c.brand, 
                  model: c.model, 
                  yearStart: parseInt(c.years.split('-')[0]) || 0, 
                  yearEnd: parseInt(c.years.split('-')[1]) || 0 
                }
              }))
            );
            return (
              <Badge
                variant={compatible ? "success" : "warning"}
                className="px-2.5 py-1 text-[10px] font-bold shadow-md uppercase tracking-wider backdrop-blur-md bg-opacity-95"
              >
                {compatible ? `✓ Fits ${selectedVehicle.model}` : "⚠ Fits others"}
              </Badge>
            );
          })()}
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist?.();
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-surface/80 backdrop-blur-md text-text-secondary hover:text-danger hover:bg-surface transition-colors shadow-sm"
        aria-label="Add to wishlist"
      >
        <FiHeart
          size={18}
          className={mounted && isWishlisted ? "fill-danger text-danger" : ""}
        />
      </button>

      {/* Image */}
      <Link href={`/products/${slug}`} className="relative aspect-[4/3] w-full bg-background overflow-hidden block">
        {/* Placeholder image rendering since we don't have actual next/image setup with domains yet */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        <Link href={`/products/${slug}`} className="flex flex-col flex-grow group-hover:text-primary transition-colors">
          <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">{category}</p>
          <h3 className="font-display font-semibold text-text-primary text-base line-clamp-2 mb-2">
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mt-auto mb-3">
            <div className="flex items-center text-warning">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "fill-current text-warning" : "text-border fill-border"}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-text-muted">({reviewsCount})</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="font-semibold text-lg text-text-primary">
              {formatPrice(price)}
            </span>
            {compareAtPrice && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Add to Cart */}
        <Button
          variant="outline"
          className="w-full mt-4 border-border hover:border-primary hover:bg-primary hover:text-white transition-colors"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
          leftIcon={<FiShoppingCart size={16} />}
        >
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}
