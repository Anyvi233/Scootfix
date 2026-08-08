"use client";

import React from "react";
import { COMPANY_DETAILS } from "@/lib/constants";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Return & Refund Policy</h1>
      <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p className="text-text-secondary leading-relaxed mt-4">
        At <strong>{COMPANY_DETAILS.brandName}</strong>, we strive to ensure you receive high-quality EV spare parts. If you are not entirely satisfied with your purchase, we're here to help.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Returns Window</h2>
      <p className="text-text-secondary leading-relaxed">
        You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused, uninstalled, and in the exact condition that you received it. Your item must be in the original packaging.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Non-returnable Items</h2>
      <p className="text-text-secondary leading-relaxed">
        Certain types of items cannot be returned, such as opened electronic controllers, batteries that have been connected to an EV, and clearance items. 
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Refunds</h2>
      <p className="text-text-secondary leading-relaxed">
        Once we receive your item, we will inspect it and notify you that we have received your returned item. If your return is approved, we will initiate a refund to your original method of payment (or bank account for COD orders). You will receive the credit within 5-7 business days.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">4. Shipping for Returns</h2>
      <p className="text-text-secondary leading-relaxed">
        You will be responsible for paying for your own shipping costs for returning your item unless the return is due to an error on our part (e.g., incorrect or defective part). Shipping costs are non-refundable.
      </p>
    </div>
  );
}
