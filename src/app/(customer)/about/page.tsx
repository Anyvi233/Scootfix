"use client";

import React from "react";
import { FiCheckCircle, FiShield, FiHeart, FiCpu } from "react-icons/fi";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-4xl space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary leading-tight">
          Powering the Future of EV Maintenance
        </h1>
        <p className="text-lg text-text-secondary">
          ScootFix is India's leading e-commerce destination for high-quality, verified spare parts and accessories for electric scooters and smart vehicles.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-surface border border-border rounded-xl space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <FiShield size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">100% Quality Guaranteed</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Every battery pack, brake pad, or adapter harness listed on ScootFix is subjected to rigorous quality check criteria to ensure strict compliance with EV standards.
          </p>
        </div>

        <div className="p-6 bg-surface border border-border rounded-xl space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <FiCpu size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Advanced Compatibility</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            No more guessing if a part fits your model. Our custom compatibility matcher automatically cross-references part dimensions and connectors with your vehicle's make and model.
          </p>
        </div>
      </div>

      {/* Our Mission */}
      <div className="bg-surface-elevated border border-border rounded-2xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary">Our Mission</h2>
        <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
          We want to make electric vehicle ownership reliable, cheap, and long-lasting. By providing access to certified replacement parts, we empower EV owners and independent mechanics to keep vehicles running safely without paying sky-high dealership prices.
        </p>
        <Link href="/shop" className="inline-block pt-2">
          <Button size="lg">Explore our Catalog</Button>
        </Link>
      </div>

    </div>
  );
}
