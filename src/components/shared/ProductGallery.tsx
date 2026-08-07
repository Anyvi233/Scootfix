"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { cloudinaryUrl } from "@/lib/cloudinary";
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
        <Image
          src={cloudinaryUrl(images[activeIndex].url)}
          alt={images[activeIndex].alt || "Product image"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-200"
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
              <Image
                src={cloudinaryUrl(image.url)}
                alt={image.alt || "Thumbnail"}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
