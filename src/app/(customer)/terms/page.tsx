"use client";

import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Terms of Service</h1>
      <p className="text-text-secondary text-sm">Last updated: October 20, 2025</p>

      <p className="text-text-secondary leading-relaxed mt-4">
        By accessing the ScootFix website, purchasing parts, or requesting services, you agree to comply with and be bound by these Terms of Service.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Product Information & Compatibility</h2>
      <p className="text-text-secondary leading-relaxed">
        We strive for maximum accuracy in compatibility listings. However, vehicle models may vary by region or batch. You are ultimately responsible for verifying physical fitment before installing parts. We are not liable for installation damage caused by user error or independent third-party mechanics.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Purchases & Returns</h2>
      <p className="text-text-secondary leading-relaxed">
        All orders are subject to availability. Returns are valid only for unused components in original packaging within 10 days of delivery. Installed or modified items cannot be returned.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Limitation of Liability</h2>
      <p className="text-text-secondary leading-relaxed">
        ScootFix will not be held liable for any indirect, incidental, or consequential damages resulting from battery failure, component installation, or vehicle operation.
      </p>
    </div>
  );
}
