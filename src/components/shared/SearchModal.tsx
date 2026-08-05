"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiX, FiClock, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface SearchResult {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    category: { name: string };
    images: { url: string }[];
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from local storage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&skip=0&take=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Input Area */}
          <form onSubmit={handleSearch} className="relative flex items-center p-4 border-b border-border">
            <FiSearch className="absolute left-6 text-text-muted" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, categories, or SKUs..."
              className="w-full h-12 pl-12 pr-12 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted text-lg"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-14 p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <FiX size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 p-2 text-text-muted hover:text-text-primary transition-colors rounded-md hover:bg-border/50"
            >
              <span className="sr-only">Close</span>
              <kbd className="hidden sm:inline-block text-[10px] font-sans font-semibold border border-border rounded px-1.5 py-0.5">ESC</kbd>
              <FiX className="sm:hidden" size={20} />
            </button>
          </form>

          {/* Results Area */}
          <div className="overflow-y-auto flex-grow p-4">
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Default State (Recent Searches) */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Recent Searches</h3>
                  <button onClick={clearRecentSearches} className="text-xs text-primary hover:underline">Clear</button>
                </div>
                <div className="flex flex-col gap-1">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term);
                        saveRecentSearch(term);
                      }}
                      className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-border/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-text-primary">
                        <FiClock className="text-text-muted" />
                        <span>{term}</span>
                      </div>
                      <span 
                        onClick={(e) => removeRecentSearch(term, e)}
                        className="p-1 text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger transition-all rounded-md hover:bg-surface"
                      >
                        <FiX size={14} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results State */}
            {query.length >= 2 && !isLoading && results?.products.length === 0 && results?.categories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-text-primary font-medium mb-1">No results found for "{query}"</p>
                <p className="text-sm text-text-secondary">Try checking for typos or using more generic terms.</p>
              </div>
            )}

            {/* Results State */}
            {query.length >= 2 && !isLoading && results && (results.products.length > 0 || results.categories.length > 0) && (
              <div className="flex flex-col gap-6">
                
                {/* Categories */}
                {results.categories.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">Categories</h3>
                    <div className="flex flex-wrap gap-2 px-2">
                      {results.categories.map(cat => (
                        <Link 
                          key={cat.id} 
                          href={`/categories/${cat.slug}`}
                          onClick={() => { saveRecentSearch(query); onClose(); }}
                          className="inline-flex items-center px-3 py-1.5 bg-surface-elevated border border-border rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">Products</h3>
                    <div className="flex flex-col gap-2">
                      {results.products.map(prod => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug}`}
                          onClick={() => { saveRecentSearch(query); onClose(); }}
                          className="flex items-center gap-4 p-2 rounded-xl hover:bg-border/50 transition-colors group"
                        >
                          <div className="w-12 h-12 bg-background rounded-lg border border-border overflow-hidden shrink-0 relative">
                             {/* Placeholder image representation */}
                             <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${prod.images[0]?.url || 'https://via.placeholder.com/150'})` }} />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">{prod.name}</p>
                            <p className="text-xs text-text-muted">{prod.category.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-text-primary">{formatPrice(prod.price)}</p>
                            {prod.compareAtPrice && (
                              <p className="text-xs text-text-muted line-through">{formatPrice(prod.compareAtPrice)}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <button 
                      onClick={handleSearch}
                      className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      View all results for "{query}" <FiArrowRight size={16} />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
