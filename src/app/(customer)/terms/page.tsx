"use client";

import React from "react";
import { COMPANY_DETAILS } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Terms and Conditions</h1>
      <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p className="text-text-secondary leading-relaxed mt-4">
        Welcome to <strong>{COMPANY_DETAILS.brandName}</strong>. These terms and conditions outline the rules and regulations for the use of {COMPANY_DETAILS.legalName}'s Website, located at our domain.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Acceptance of Terms</h2>
      <p className="text-text-secondary leading-relaxed">
        By accessing this website, we assume you accept these terms and conditions. Do not continue to use {COMPANY_DETAILS.brandName} if you do not agree to all of the terms and conditions stated on this page.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. Products and Pricing</h2>
      <p className="text-text-secondary leading-relaxed">
        All aftermarket and genuine EV spare parts are subject to availability. Prices for our products are subject to change without notice. We reserve the right to modify or discontinue a product without notice at any time.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Accuracy of Information</h2>
      <p className="text-text-secondary leading-relaxed">
        We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions, especially regarding electrical components for electric vehicles.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">4. Business Information</h2>
      <p className="text-text-secondary leading-relaxed">
        <strong>{COMPANY_DETAILS.legalName}</strong><br/>
        {COMPANY_DETAILS.address}<br/>
        Email: {COMPANY_DETAILS.email}<br/>
        Phone: {COMPANY_DETAILS.phone}
      </p>
    </div>
  );
}
