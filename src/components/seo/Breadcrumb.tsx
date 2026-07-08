import React from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb — visual navigation trail with schema.org microdata.
 * Works alongside BreadcrumbList JSON-LD for dual coverage.
 */
export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol
        className="flex flex-wrap items-center gap-1 text-sm text-text-secondary"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={index}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {/* Hidden schema microdata */}
              <meta itemProp="position" content={String(index + 1)} />

              {isLast || !item.href ? (
                <span
                  itemProp="name"
                  aria-current="page"
                  className="text-text-primary font-medium truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  itemProp="item"
                  className="hover:text-primary transition-colors truncate max-w-[160px]"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}

              {!isLast && (
                <FiChevronRight
                  size={13}
                  className="text-text-muted shrink-0"
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
