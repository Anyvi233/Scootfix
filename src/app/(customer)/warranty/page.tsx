"use client";

import React from "react";
import { COMPANY_DETAILS } from "@/lib/constants";

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Warranty Policy</h1>
      <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p className="text-text-secondary leading-relaxed mt-4">
        At <strong>{COMPANY_DETAILS.brandName}</strong>, we stand behind the quality of the electric vehicle spare parts we sell. This Warranty Policy outlines the coverage and procedures for warranty claims.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Warranty Coverage</h2>
      <p className="text-text-secondary leading-relaxed">
        Products are covered by a limited warranty against manufacturing defects. The duration of the warranty depends on the specific product category (e.g., Controllers usually have a 6-month warranty, whereas consumable items like brake pads have no warranty). The specific warranty period is listed on the individual product page.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. What is Not Covered</h2>
      <p className="text-text-secondary leading-relaxed">
        Our warranty does not cover damages resulting from:
      </p>
      <ul className="text-text-secondary leading-relaxed list-disc ml-6">
        <li>Improper installation or modification of the part.</li>
        <li>Water damage (unless the part is explicitly rated IP67+).</li>
        <li>Normal wear and tear.</li>
        <li>Accidents, misuse, or electrical short-circuits in the vehicle's wiring harness.</li>
      </ul>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Claim Process</h2>
      <p className="text-text-secondary leading-relaxed">
        To initiate a warranty claim, please contact our support team at <strong>{COMPANY_DETAILS.email}</strong> with your order number and a video demonstrating the defect. If approved, we will provide a replacement part.
      </p>
    </div>
  );
}
