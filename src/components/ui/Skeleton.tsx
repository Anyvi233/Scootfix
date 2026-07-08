import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-border/50", className)}
      {...props}
    />
  );
}

export function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-border/30",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface/40 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Shimmer className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-4 w-1/2" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Shimmer className="h-5 w-1/4" />
        <Shimmer className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
