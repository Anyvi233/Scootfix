"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiFilter, FiChevronDown, FiX, FiAlertCircle } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useVehicle } from "@/context/VehicleContext";

import { FilterSidebar } from "@/components/shared/FilterSidebarNew";

import { ProductCard } from "@/components/shared/ProductCard";

const SORT_OPTIONS = [
  { label: "Recommended",       value: "recommended" },
  { label: "Newest",            value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating_desc" },
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

export default function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const { selectedVehicle } = useVehicle();
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch db vehicle models to resolve context string to CUID on the client side
  useEffect(() => {
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setVehicleModels(data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(searchParams.toString());
      if (!params.get("page")) params.set("page", "1");

      // Inject contextual vehicle compatibility filters if they are not defined in the URL parameters
      if (!params.get("vehicleModelId") && selectedVehicle && vehicleModels.length > 0) {
        const brandMatch = vehicleModels.find(
          (b) => b.name.toLowerCase().includes(selectedVehicle.brand.toLowerCase()) ||
                 selectedVehicle.brand.toLowerCase().includes(b.name.toLowerCase())
        );
        if (brandMatch?.vehicles) {
          const modelMatch = brandMatch.vehicles.find(
            (v: any) => v.name.toLowerCase().includes(selectedVehicle.model.toLowerCase()) ||
                       selectedVehicle.model.toLowerCase().includes(v.name.toLowerCase())
          );
          if (modelMatch) {
            params.set("vehicleModelId", modelMatch.id);
            params.set("year", selectedVehicle.year);
          }
        }
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.items || []);
      setPagination({ total: data.total || 0, page: data.page || 1, limit: data.limit || 12, totalPages: data.totalPages || 1 });
    } catch {
      setError("Could not load products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, selectedVehicle, vehicleModels]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const currentSort   = searchParams.get("sort") || "recommended";
  const activeSearch  = searchParams.get("search");
  const currentPage   = parseInt(searchParams.get("page") || "1");
  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (k) => k !== "sort" && k !== "page" && k !== "search"
  ).length;

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.set("page", "1");
      router.push(`/shop?${params.toString()}`);
      setSortDropdownOpen(false);
    });
  };

  const removeSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
            {activeSearch ? "Search Results" : "Shop EV Spare Parts"}
          </h1>
          {activeSearch ? (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary text-sm">Results for: </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-surface-elevated border border-border rounded-full text-sm font-medium">
                "{activeSearch}"
                <button onClick={removeSearch} aria-label="Clear search"><FiX size={14} /></button>
              </span>
            </div>
          ) : !isLoading ? (
            <p className="text-text-secondary text-sm" aria-live="polite">
              Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)}–
              {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
              <strong>{pagination.total}</strong> products
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="md:hidden flex-1" onClick={() => setMobileFiltersOpen(true)} leftIcon={<FiFilter size={16} />}>
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          <div className="relative flex-1 md:w-56">
            <button
              className="w-full flex items-center justify-between px-4 py-2 border border-border bg-surface rounded-md text-sm font-medium text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
              onClick={() => setSortDropdownOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortDropdownOpen}
            >
              <span className="truncate">Sort: {SORT_OPTIONS.find((o) => o.value === currentSort)?.label}</span>
              <FiChevronDown className={`transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                  <motion.ul
                    role="listbox"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 top-full mt-1 w-full bg-surface border border-border rounded-md shadow-xl z-50 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <li key={opt.value} role="option" aria-selected={currentSort === opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`px-4 py-3 text-sm cursor-pointer transition-colors ${currentSort === opt.value ? "bg-primary/10 text-primary font-medium" : "text-text-primary hover:bg-border/50"}`}
                      >{opt.label}</li>
                    ))}
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <aside className="hidden md:block w-64 shrink-0 sticky top-24" aria-label="Product filters">
          <FilterSidebar />
        </aside>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileFiltersOpen(false)} />
              <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-surface border-r border-border z-50 p-6 overflow-y-auto shadow-2xl md:hidden"
                aria-label="Product filters">
                <FilterSidebar onClose={() => setMobileFiltersOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 w-full min-w-0">
          {error ? (
            <div key="error-container" className="flex flex-col items-center justify-center py-20 text-center border border-danger/30 rounded-2xl bg-danger/5">
              <FiAlertCircle size={40} className="text-danger mb-3" />
              <p className="text-text-secondary">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchProducts}>Try again</Button>
            </div>
          ) : isLoading || isPending ? (
            <div key="skeletons-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: pagination.limit }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <React.Fragment key="products-grid-fragment">
              <div key="products-container" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const image = product.images?.[0]?.url || "/placeholder.jpg";
                  const categoryName = product.category?.name || "Spare Parts";
                  return (
                    <div key={product.id}>
                      <ProductCard
                        id={product.id} name={product.name} slug={product.slug}
                        price={product.price} compareAtPrice={product.compareAtPrice}
                        image={image} category={categoryName}
                        rating={product.rating || 0} reviewsCount={product.reviewsCount || 0}
                        isNew={product.isNew}
                        onAddToCart={() => addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image, stock: product.stock })}
                        onToggleWishlist={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image, category: categoryName })}
                        isWishlisted={isInWishlist(product.id)}
                      />
                    </div>
                  );
                })}
              </div>
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} itemsPerPage={pagination.limit} />
            </React.Fragment>
          ) : (
            <div key="empty-container" className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-surface/50" role="status">
              <div className="w-16 h-16 bg-border/50 rounded-full flex items-center justify-center mb-4 text-text-muted">
                <FiFilter size={32} />
              </div>
              <h2 className="text-xl font-display font-semibold text-text-primary mb-2">No products found</h2>
              <p className="text-text-secondary mb-6 max-w-md">Try adjusting your filters or search to find what you're looking for.</p>
              <Button variant="outline" onClick={() => router.push("/shop")}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
