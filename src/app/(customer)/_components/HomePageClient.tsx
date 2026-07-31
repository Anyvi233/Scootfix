"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiShield, FiTruck, FiZap } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/shared/ProductCard";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { HeroSection } from "@/components/shared/HeroSection";

const FEATURED_CATEGORIES = [
  { id: "1", name: "Bearings", slug: "bearings", image: "https://images.unsplash.com/photo-1618976563759-b6aaee63a2f8?auto=format&fit=crop&q=80&w=800", count: 3 },
  { id: "2", name: "Drum brakes", slug: "drum-brakes", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800", count: 3 },
  { id: "3", name: "Disk Brakes", slug: "disk-brakes", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800", count: 3 },
  { id: "4", name: "Lithium Iron Chargers", slug: "chargers", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800", count: 3 },
];

const TRUST_BADGES = [
  { icon: FiShield, label: "Genuine Parts", desc: "OEM & certified aftermarket only" },
  { icon: FiTruck, label: "Free Shipping", desc: "On orders above ₹999" },
  { icon: FiCheckCircle, label: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: FiZap, label: "Fast Delivery", desc: "2–5 business days pan-India" },
];

function ProductCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-border/50" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-border/50 rounded w-1/3" />
        <div className="h-4 bg-border/50 rounded w-3/4" />
        <div className="h-4 bg-border/50 rounded w-1/2" />
        <div className="h-9 bg-border/50 rounded-md mt-2" />
      </div>
    </div>
  );
}

export default function HomePageClient() {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?isFeatured=true&limit=4")
      .then((r) => r.json())
      .then((d) => setFeaturedProducts(d.items || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <HeroSection />

      {/* ── Trust badges ───────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface" aria-label="Why ScootFix">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">{label}</p>
                  <p className="text-xs text-text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ─────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-4 md:px-6" aria-labelledby="categories-heading">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary font-semibold text-sm mb-1">Shop by Category</p>
            <h2 id="categories-heading" className="text-3xl md:text-4xl font-display font-bold text-text-primary">
              Find Your Part
            </h2>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-1 text-sm text-primary hover:underline">
            All categories <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {FEATURED_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <CategoryCard {...cat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────────────── */}
      <section className="py-20 bg-surface" aria-labelledby="featured-heading">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-semibold text-sm mb-1">Handpicked for You</p>
              <h2 id="featured-heading" className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                Featured Products
              </h2>
            </div>
            <Link href="/shop?isFeatured=true" className="hidden md:flex items-center gap-1 text-sm text-primary hover:underline">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.map((p) => {
                  const image = p.images?.[0]?.url || "/placeholder.jpg";
                  return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      price={p.price}
                      compareAtPrice={p.compareAtPrice}
                      image={image}
                      category={p.category?.name || "Parts"}
                      rating={p.rating || 0}
                      reviewsCount={p.reviewsCount || 0}
                      isNew={p.isNew}
                      onAddToCart={() => addToCart({ id: p.id, name: p.name, slug: p.slug, price: p.price, image, stock: p.stock })}
                      onToggleWishlist={() => toggleWishlist({ id: p.id, name: p.name, slug: p.slug, price: p.price, image, category: p.category?.name })}
                      isWishlisted={isInWishlist(p.id)}
                    />
                  );
                })}
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-4 md:px-6" aria-labelledby="reviews-heading">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm mb-1">Customer Stories</p>
          <h2 id="reviews-heading" className="text-3xl md:text-4xl font-display font-bold text-text-primary">
            Trusted by Riders Across India
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReviewCard name="Rahul Sharma" rating={5} date="Oct 2025" comment="Battery pack works flawlessly. Range improved significantly. Fast delivery!" />
          <ReviewCard name="Priya Menon" rating={5} date="Sep 2025" comment="Found the exact brake pads for my Ather 450X. Genuine quality, great price." />
          <ReviewCard name="Vikram Nair" rating={4} date="Nov 2025" comment="Display console was easy to install. Support team was very helpful." />
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-t border-border" aria-labelledby="newsletter-heading">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-xl">
          <h2 id="newsletter-heading" className="text-3xl font-display font-bold text-text-primary mb-3">
            Stay Updated
          </h2>
          <p className="text-text-secondary mb-8">Get the latest deals, new arrivals, and compatibility updates direct to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()} aria-label="Newsletter signup">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 px-4 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Email address"
              required
            />
            <Button type="submit" className="h-12 px-6 shrink-0">Subscribe</Button>
          </form>
        </div>
      </section>
    </>
  );
}
