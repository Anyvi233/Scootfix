"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiHeart, FiShoppingCart, FiX } from "react-icons/fi";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center animate-pulse text-text-muted">
        Loading wishlist...
      </div>
    );
  }

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      image: item.image,
      stock: 5 // Default high stock for wishlist transfers if not specified
    });
    toggleWishlist(item); // Remove from wishlist on transfer
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted border border-border">
          <FiHeart size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Your Wishlist is Empty</h1>
        <p className="text-text-secondary mb-8">
          Save your favorite spare parts and accessories to keep track of them. Add items by clicking the heart button on product cards.
        </p>
        <Link href="/shop">
          <Button size="lg" className="w-full">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">My Wishlist</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="group relative bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
            {/* Remove button */}
            <button
              onClick={() => toggleWishlist(item)}
              className="absolute top-3 right-3 z-10 p-2 bg-background/80 hover:bg-danger/10 hover:text-danger text-text-muted rounded-full transition-colors backdrop-blur-xs"
              aria-label="Remove from wishlist"
            >
              <FiX size={16} />
            </button>

            {/* Product image */}
            <Link href={`/products/${item.slug}`} className="block relative aspect-square overflow-hidden bg-surface-elevated">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            </Link>

            {/* Product info */}
            <div className="p-4 flex-grow flex flex-col">
              <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase mb-1">{item.category}</span>
              <Link href={`/products/${item.slug}`} className="font-semibold text-text-primary hover:text-primary transition-colors line-clamp-2 text-sm leading-tight flex-grow mb-2">
                {item.name}
              </Link>
              <div className="mb-4">
                <span className="font-bold text-text-primary">{formatPrice(item.price)}</span>
              </div>

              {/* Action */}
              <Button
                onClick={() => handleMoveToCart(item)}
                className="w-full mt-auto"
                size="sm"
                leftIcon={<FiShoppingCart size={16} />}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
