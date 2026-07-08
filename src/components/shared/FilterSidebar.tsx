"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronDown, FiChevronUp, FiFilter, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

// Seeded data for filters


const CATEGORIES = [
  "Bearings",
  "Drum brakes",
  "switches",
  "key sets",
  "Disk Brakes",
  "front Rims",
  "Bulbs",
  "Lithium Iron Chargers"
];
const RATINGS = [4, 3, 2, 1]; // "4 Stars & Up", etc.

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, defaultOpen = true, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button 
        className="flex w-full items-center justify-between text-left font-medium text-text-primary mb-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterSidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current state from URL

  const currentCategories = searchParams.get("categories")?.split(",") || [];
  const currentRating = searchParams.get("rating") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const isOem = searchParams.get("oem") === "true";
  const isAftermarket = searchParams.get("aftermarket") === "true";
  const inStock = searchParams.get("inStock") === "true";
  const hasDiscount = searchParams.get("discount") === "true";

  // Helpers
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to page 1 on filter change
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const toggleArrayParam = (key: string, value: string, currentArray: string[]) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateParam(key, newArray.length > 0 ? newArray.join(",") : null);
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get("min") as string;
    const max = formData.get("max") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min); else params.delete("minPrice");
    if (max) params.set("maxPrice", max); else params.delete("maxPrice");
    params.delete("page");
    router.push(`/shop?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/shop");
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <FiFilter /> Filters
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-primary">
            <FiX size={24} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 hidden lg:flex">
        <h2 className="text-lg font-display font-bold">Filters</h2>
        {(searchParams.toString().length > 0) && (
          <button onClick={clearAll} className="text-sm text-primary hover:underline font-medium">
            Clear All
          </button>
        )}
      </div>

      {/* Part Type (OEM vs Aftermarket) */}
      <FilterSection title="Part Origin" defaultOpen={true}>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" checked={isOem} onChange={() => updateParam("oem", isOem ? null : "true")} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-text-secondary">OEM (Genuine)</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" checked={isAftermarket} onChange={() => updateParam("aftermarket", isAftermarket ? null : "true")} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-text-secondary">Premium Aftermarket</span>
        </label>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2 mt-2">
          <div className="flex-1">
            <input type="number" name="min" defaultValue={currentMinPrice} placeholder="Min ₹" className="w-full px-3 py-2 bg-surface text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <span className="text-text-muted">-</span>
          <div className="flex-1">
            <input type="number" name="max" defaultValue={currentMaxPrice} placeholder="Max ₹" className="w-full px-3 py-2 bg-surface text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <button type="submit" className="p-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20">
            <FiChevronDown className="rotate-[-90deg]" size={16} />
          </button>
        </form>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Category">
        {CATEGORIES.map(cat => (
          <label key={cat} className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={currentCategories.includes(cat)}
              onChange={() => toggleArrayParam("categories", cat, currentCategories)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" 
            />
            <span className="text-sm text-text-secondary">{cat}</span>
          </label>
        ))}
      </FilterSection>




      {/* Rating */}
      <FilterSection title="Customer Rating" defaultOpen={false}>
        {RATINGS.map(rating => (
          <label key={rating} className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="radio" 
              name="rating"
              checked={currentRating === rating.toString()}
              onChange={() => updateParam("rating", rating.toString())}
              className="w-4 h-4 rounded-full border-border text-primary focus:ring-primary" 
            />
            <div className="flex items-center">
              <div className="flex items-center text-warning mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-border fill-border"}`} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span className="text-sm text-text-secondary">& Up</span>
            </div>
          </label>
        ))}
      </FilterSection>

      {/* Availability & Offers */}
      <FilterSection title="Availability & Offers" defaultOpen={true}>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={() => updateParam("inStock", inStock ? null : "true")} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-text-secondary">In Stock Only</span>
        </label>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input type="checkbox" checked={hasDiscount} onChange={() => updateParam("discount", hasDiscount ? null : "true")} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-text-secondary flex items-center gap-1">On Sale <span className="px-1.5 py-0.5 rounded text-[10px] bg-danger/10 text-danger font-bold ml-1">HOT</span></span>
        </label>
      </FilterSection>
      
      {/* Mobile Apply Button */}
      <div className="mt-8 lg:hidden pb-8">
        <Button onClick={onClose} className="w-full">Apply Filters</Button>
        <Button variant="ghost" onClick={clearAll} className="w-full mt-2">Clear All</Button>
      </div>
    </div>
  );
}
