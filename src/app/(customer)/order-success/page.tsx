"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiArrowRight, FiFileText, FiPrinter } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface InvoiceData {
  orderId: string;
  date: string;
  shipping: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  delivery: string;
  payment: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  shippingCost: number;
  codFee: number;
  tax: number;
  total: number;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("scootfix_latest_invoice");
    if (data) {
      try {
        setInvoice(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <FiCheckCircle className="mx-auto text-success mb-4 animate-bounce" size={48} />
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Order Confirmed!</h1>
        <p className="text-text-secondary mb-8">Thank you for your purchase. We are processing your order.</p>
        <Link href="/shop" className="block w-full">
          <Button size="lg" className="w-full">Browse More Spares</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl space-y-8">
      
      {/* Visual Success Confirmation Banner */}
      <div className="text-center space-y-3 pb-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
          <FiCheckCircle size={36} />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary">Order Confirmed!</h1>
        <p className="text-text-secondary text-sm">
          A receipt and delivery updates have been sent to <strong>{invoice.shipping.email}</strong>.
        </p>
      </div>

      {/* Invoice Area (Style print-friendly) */}
      <div 
        ref={invoiceRef}
        className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0 print:text-black"
      >
        {/* Invoice Header */}
        <div className="flex justify-between border-b border-border pb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-text-primary print:text-black">ScootFix Spares</h2>
            <p className="text-xs text-text-secondary mt-1">123 Tech Park, HSR Layout, Bengaluru - 560102</p>
            {process.env.NEXT_PUBLIC_GST_NUMBER && (
              <p className="text-xs text-text-secondary">GSTIN: {process.env.NEXT_PUBLIC_GST_NUMBER}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-lg font-mono font-bold text-text-primary print:text-black">INVOICE</h3>
            <p className="text-xs text-text-secondary mt-1">Invoice ID: <strong>{invoice.orderId}</strong></p>
            <p className="text-xs text-text-secondary">Date: {invoice.date}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-text-primary uppercase text-xs tracking-wider text-text-muted mb-2">Billed & Shipped To:</h4>
            <p className="font-medium text-text-primary">{invoice.shipping.name}</p>
            <p className="text-text-secondary leading-relaxed mt-1">
              {invoice.shipping.street}, <br />
              {invoice.shipping.city}, {invoice.shipping.state} - {invoice.shipping.zipCode}
            </p>
            <p className="text-text-secondary mt-1">Tel: {invoice.shipping.phone}</p>
          </div>
          <div className="sm:text-right">
            <h4 className="font-semibold text-text-primary uppercase text-xs tracking-wider text-text-muted mb-2">Transaction Info:</h4>
            <p className="text-text-secondary">Payment Method: <strong>{invoice.payment}</strong></p>
            <p className="text-text-secondary">Delivery Class: <strong>{invoice.delivery}</strong></p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="text-text-secondary">
                  <td className="py-3 font-medium text-text-primary">{item.name}</td>
                  <td className="py-3 text-right">{formatPrice(item.price)}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right font-semibold text-text-primary">{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-border pt-4 flex flex-col items-end text-sm space-y-2">
          <div className="w-64 flex justify-between text-text-secondary">
            <span>Subtotal:</span>
            <span>{formatPrice(invoice.subtotal)}</span>
          </div>
          {invoice.shippingCost > 0 && (
            <div className="w-64 flex justify-between text-text-secondary">
              <span>Shipping Fee:</span>
              <span>{formatPrice(invoice.shippingCost)}</span>
            </div>
          )}
          {invoice.codFee > 0 && (
            <div className="w-64 flex justify-between text-text-secondary">
              <span>COD Fee:</span>
              <span>{formatPrice(invoice.codFee)}</span>
            </div>
          )}
          {process.env.NEXT_PUBLIC_GST_NUMBER ? (
            <div className="w-64 flex justify-between text-text-secondary">
              <span>GST ({process.env.NEXT_PUBLIC_GST_RATE || 18}%):</span>
              <span>{formatPrice(invoice.tax)}</span>
            </div>
          ) : (
            <div className="w-64 flex justify-between text-text-secondary">
              <span>Taxes &amp; Fees:</span>
              <span>Incl. in price</span>
            </div>
          )}
          <div className="w-64 flex justify-between border-t border-border pt-2 font-bold text-base text-text-primary">
            <span>Amount Due:</span>
            <span>{formatPrice(invoice.total)}</span>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="text-center text-[10px] text-text-muted pt-6 border-t border-border">
          This is a computer-generated transaction invoice and does not require a physical signature. For queries, contact support@scootfix.com.
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
        <Button 
          variant="outline" 
          onClick={handlePrint}
          leftIcon={<FiPrinter />}
          className="h-12"
        >
          Print / Download Invoice
        </Button>
        <Link href="/shop">
          <Button 
            className="h-12 shadow-glow w-full sm:w-auto"
            rightIcon={<FiArrowRight />}
          >
            Continue Shopping
          </Button>
        </Link>
      </div>

    </div>
  );
}
