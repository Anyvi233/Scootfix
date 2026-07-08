"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  count?: number;
}

export function CategoryCard({ name, slug, image, count }: CategoryCardProps) {
  return (
    <Link href={`/shop?categories=${encodeURIComponent(name)}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative h-48 sm:h-64 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-primary/90 group-hover:via-primary/40" />
        
        <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
          <h3 className="font-display font-semibold text-xl text-white mb-1">
            {name}
          </h3>
          {count !== undefined && (
            <p className="text-white/80 text-sm font-medium">
              {count} Products
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
