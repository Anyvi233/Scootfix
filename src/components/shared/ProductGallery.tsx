"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ProductGalleryProps {
  images: { url: string; alt?: string }[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images.length) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image with Zoom */}
      <div 
        ref={containerRef}
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-200"
          style={{ 
            backgroundImage: `url(${images[activeIndex].url})`,
            backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
            backgroundSize: isZoomed ? '200%' : 'contain',
          }}
          aria-label={images[activeIndex].alt || "Product image"}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                activeIndex === index 
                  ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
                  : "border-border hover:border-text-muted"
              )}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${image.url})` }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
