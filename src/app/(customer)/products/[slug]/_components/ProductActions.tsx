"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiHeart, FiShare2, FiShoppingCart } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { toast } from "react-hot-toast";

interface ProductActionsProps {
  product: any;
}

/**
 * Quantity selector, Add-to-Cart, Buy-Now, Wishlist toggle, and Share button.
 * All interactive controls with full keyboard accessibility and ARIA labels.
 */
export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const cartItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0]?.url || "",
    stock: product.stock,
  };

  const wishlistItem = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0]?.url || "",
    category: product.category?.name,
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <section aria-label="Purchase options" className="flex flex-col gap-4 mt-auto">
      {/* Share button — placed above actions for layout */}
      <div className="flex justify-end">
        <button
          onClick={handleShare}
          aria-label="Share this product"
          className="p-2 text-text-muted hover:text-text-primary bg-surface rounded-full border border-border shadow-sm transition-colors"
        >
          <FiShare2 size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Quantity + Add to Cart */}
      <div className="flex gap-4" role="group" aria-label="Quantity and add to cart">
        <div
          className="flex items-center border border-border rounded-lg bg-surface h-14"
          role="group"
          aria-label="Quantity selector"
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            aria-disabled={quantity <= 1}
          >
            <span aria-hidden="true">−</span>
          </button>
          <output
            className="w-8 text-center font-medium text-text-primary"
            aria-live="polite"
            aria-label={`Quantity: ${quantity}`}
          >
            {quantity}
          </output>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
            aria-disabled={quantity >= product.stock}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <Button
          size="lg"
          className="flex-grow h-14 text-base shadow-glow"
          leftIcon={<FiShoppingCart size={20} aria-hidden="true" />}
          disabled={product.stock === 0}
          aria-disabled={product.stock === 0}
          onClick={() => addToCart(cartItem, quantity)}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>

      {/* Buy Now + Wishlist */}
      <div className="flex gap-4" role="group" aria-label="Buy now or save to wishlist">
        <Button
          variant="secondary"
          size="lg"
          className="flex-grow h-14 text-base"
          disabled={product.stock === 0}
          aria-disabled={product.stock === 0}
          onClick={() => {
            addToCart(cartItem, quantity);
            router.push("/checkout");
          }}
        >
          Buy Now
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className={cn("h-14 w-14 shrink-0", isWishlisted && "text-danger border-danger/30 bg-danger/5")}
          onClick={() => toggleWishlist(wishlistItem)}
        >
          <FiHeart size={22} className={isWishlisted ? "fill-current" : ""} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
