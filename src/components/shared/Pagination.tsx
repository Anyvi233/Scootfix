"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: true });
  };

  // Build visible page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 mt-10", className)}>
      {/* Count info */}
      <p className="text-sm text-text-secondary order-2 sm:order-1">
        Showing <span className="font-semibold text-text-primary">{startItem}–{endItem}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalItems}</span> products
      </p>

      {/* Page controls */}
      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="Pagination"
        role="navigation"
      >
        {/* Prev */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiChevronLeft size={16} />
        </button>

        {getPageNumbers().map((num, i) =>
          num === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-text-muted text-sm"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={num}
              onClick={() => goToPage(num as number)}
              aria-label={`Page ${num}`}
              aria-current={currentPage === num ? "page" : undefined}
              className={cn(
                "w-9 h-9 rounded-md text-sm font-medium transition-all",
                currentPage === num
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "border border-border text-text-secondary hover:text-text-primary hover:border-primary"
              )}
            >
              {num}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
