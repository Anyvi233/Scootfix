"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import Image from "next/image";
import { cloudinaryUrl } from "@/lib/cloudinary";
export interface ReviewCardProps {
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  comment: string;
  verified?: boolean;
}

export function ReviewCard({ name, avatar, rating, date, comment, verified = true }: ReviewCardProps) {
  return (
    <Card className="h-full bg-surface border-border p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden relative">
            {avatar ? (
              <Image
                src={cloudinaryUrl(avatar)}
                alt={name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="font-semibold text-text-primary text-sm">{name}</h4>
            {verified && <span className="text-[10px] uppercase tracking-wider font-semibold text-success">Verified Buyer</span>}
          </div>
        </div>
        <div className="text-xs text-text-muted">{date}</div>
      </div>
      
      <div className="flex items-center text-warning mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "fill-current text-warning" : "text-border fill-border"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      
      <p className="text-text-secondary text-sm leading-relaxed italic">"{comment}"</p>
    </Card>
  );
}
