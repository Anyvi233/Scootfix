"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { apiFetch } from "@/lib/api-client";
import { useCart } from "@/context/CartContext";

function CheckoutConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [error, setError] = useState<string | null>(null);
  const orderCreated = useRef(false);

  const paymentId = searchParams.get("payment_id");
  const refId = searchParams.get("ref");

  useEffect(() => {
    if (!paymentId || !refId) {
      setError("Missing payment details. Please contact customer support.");
      return;
    }

    if (orderCreated.current) return;
    orderCreated.current = true;

    const finalizeOrder = async () => {
      try {
        const saved = sessionStorage.getItem("scootfix_pending_order");
        if (!saved) {
          throw new Error("Order context not found. If payment succeeded, please check your email for confirmation.");
        }

        const context = JSON.parse(saved);

        // Verify refId matches
        if (context.refId !== refId) {
          throw new Error("Invalid payment session reference.");
        }

        // Call orders API to create the order in DB using the real paymentId
        const response = await apiFetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingAddress: context.shippingAddress,
            billingAddress: null,
            paymentMethod: context.paymentMethod,
            paymentId: paymentId,
            notes: context.notes,
            couponCode: context.couponCode,
            deliveryOption: context.deliveryOption,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to save order");
        }

        const order = await response.json();

        // Save invoice info
        const invoiceData = {
          orderId: order.orderNumber,
          date: new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          shipping: context.shippingAddress,
          delivery: context.notes,
          payment: "Paid Online (Razorpay)",
          paymentId: paymentId,
          items: context.cartSnapshot,
          subtotal: context.totals.subtotal,
          discountAmount: context.totals.discountAmount,
          shippingCost: context.totals.shippingCost,
          codFee: context.totals.codFee,
          tax: context.totals.tax,
          total: context.totals.total,
        };

        sessionStorage.setItem("scootfix_latest_invoice", JSON.stringify(invoiceData));
        sessionStorage.removeItem("scootfix_pending_order");
        sessionStorage.removeItem("scootfix_applied_coupon");

        clearCart();
        toast.success("Payment verified and order placed successfully!");
        router.push(`/order-success?id=${order.orderNumber}`);
      } catch (err: unknown) {
        console.error("Order finalization failed:", err);
        setError((err as Error).message || "Failed to finalize order.");
      }
    };

    finalizeOrder();
  }, [paymentId, refId, router, clearCart]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6 text-danger border border-danger/20">
          <FiAlertCircle size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Order Confirmation Error</h1>
        <p className="text-text-secondary mb-8">{error}</p>
        <button
          onClick={() => router.push("/cart")}
          className="w-full h-12 bg-surface border border-border text-text-primary rounded-xl font-semibold hover:bg-surface-elevated transition-colors"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 text-center max-w-md flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Verifying Payment...</h1>
      <p className="text-text-secondary text-sm">
        Please do not close this window or navigate away while we confirm your payment with Razorpay and finalize your order.
      </p>
    </div>
  );
}

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-32 text-center max-w-md flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Loading...</h1>
      </div>
    }>
      <CheckoutConfirmContent />
    </Suspense>
  );
}
