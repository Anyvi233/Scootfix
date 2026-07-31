"use client";

import dynamic from "next/dynamic";

function ShopSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="h-10 w-64 bg-border/40 rounded-lg animate-pulse mb-8" />
      <div className="flex gap-8">
        <div className="hidden md:flex md:flex-col w-64 shrink-0 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-border/40 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-border/40" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-border/40 rounded w-1/3" />
                <div className="h-4 bg-border/40 rounded w-3/4" />
                <div className="h-9 bg-border/40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ssr:false lives here in a Client Component — this is required by Next.js
const ShopPageInner = dynamic(() => import("./_ShopPageInner"), {
  ssr: false,
  loading: ShopSkeleton,
});

export default function ShopClientWrapper() {
  return <ShopPageInner />;
}
