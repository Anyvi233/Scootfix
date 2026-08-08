"use client";

import React from "react";
import { COMPANY_DETAILS } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 max-w-3xl prose dark:prose-invert">
      <h1 className="font-display font-bold text-3xl text-text-primary mb-6">Privacy Policy</h1>
      <p className="text-text-secondary text-sm">Last updated: {new Date().toLocaleDateString()}</p>
      
      <p className="text-text-secondary leading-relaxed mt-4">
        At <strong>{COMPANY_DETAILS.brandName}</strong> (operated by {COMPANY_DETAILS.legalName}), we respect your privacy and are committed to protecting it. This Privacy Policy details how we collect, use, and safeguard your personal information when you use our website, order parts, or contact support.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">1. Information We Collect</h2>
      <p className="text-text-secondary leading-relaxed">
        We collect details such as your name, email address, phone number, shipping and billing addresses, and payment details during purchase transactions. Additionally, we track search queries and page interactions to improve user experience.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">2. How We Use Your Information</h2>
      <p className="text-text-secondary leading-relaxed">
        We use this information to process payments, dispatch orders, communicate order updates, handle returns, and present custom recommendations based on your vehicle configuration.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">3. Information Sharing</h2>
      <p className="text-text-secondary leading-relaxed">
        We do not sell your personal data. We share essential data only with shipping providers and payment processors (e.g. Razorpay) to complete your transactions.
      </p>

      <h2 className="text-xl font-bold text-text-primary mt-8 mb-4">4. Contact Us</h2>
      <p className="text-text-secondary leading-relaxed">
        If you have any questions about this Privacy Policy, please contact us at: <br/>
        <strong>{COMPANY_DETAILS.legalName}</strong><br/>
        {COMPANY_DETAILS.address}<br/>
        Email: {COMPANY_DETAILS.email}<br/>
        Phone: {COMPANY_DETAILS.phone}
      </p>
    </div>
  );
}
