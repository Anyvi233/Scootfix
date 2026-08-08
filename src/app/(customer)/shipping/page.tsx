"use client";

import React from "react";
import { COMPANY_DETAILS } from "@/lib/constants";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Shipping Policy</h1>
      <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p className="text-text-secondary leading-relaxed mt-4">
        Thank you for choosing <strong>{COMPANY_DETAILS.brandName}</strong> for your EV spare parts. Following are the terms and conditions that constitute our Shipping Policy.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Shipment Processing Time</h2>
      <p className="text-text-secondary leading-relaxed">
        All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Shipping Rates & Delivery Estimates</h2>
      <p className="text-text-secondary leading-relaxed">
        Shipping charges for your order will be calculated and displayed at checkout. We offer Standard (3-5 business days) and Express (1-2 business days) shipping options across India. Free standard shipping is available on prepaid orders above ₹5,000.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Shipment Confirmation & Order Tracking</h2>
      <p className="text-text-secondary leading-relaxed">
        You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">4. Damages</h2>
      <p className="text-text-secondary leading-relaxed">
        {COMPANY_DETAILS.brandName} is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
      </p>
    </div>
  );
}
