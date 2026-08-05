"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCornerUpLeft, FiCheckCircle, FiPackage, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

const RETURN_REASONS = [
  "Defective or does not work",
  "Incompatible with my vehicle",
  "Incorrect item received",
  "Item damaged in transit",
  "No longer needed / changed mind",
];

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReturnItemState {
  orderItemId: string;
  quantity: number;
  reason: string;
  selected: boolean;
}

function ReturnsForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryOrderId = searchParams.get("orderId") || "";

  const [order, setOrder] = useState<{ id: string; orderNumber: string; items: OrderItem[] } | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(!!queryOrderId);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [globalReason, setGlobalReason] = useState("");
  const [description, setDescription] = useState("");
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the specific order's items when orderId is in URL
  useEffect(() => {
    if (!queryOrderId) return;
    const fetchOrder = async () => {
      setIsLoadingOrder(true);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Could not load orders.");
        const data = await res.json();
        const found = (data.items || []).find((o: import("@/types/models").OrderWithItems) => o.id === queryOrderId);
        if (!found) throw new Error("Order not found in your account.");
        setOrder({ id: found.id, orderNumber: found.orderNumber, items: found.items });
        setReturnItems(
          found.items.map((item: OrderItem) => ({
            orderItemId: item.id,
            quantity: 1,
            reason: "",
            selected: true,
          }))
        );
      } catch (err: unknown) {
        setOrderError((err instanceof Error ? err.message : "An error occurred") || "Failed to load order.");
      } finally {
        setIsLoadingOrder(false);
      }
    };
    fetchOrder();
  }, [queryOrderId]);

  const toggleItem = (idx: number) => {
    setReturnItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, selected: !it.selected } : it))
    );
  };

  const setItemQty = (idx: number, qty: number) => {
    const max = order?.items[idx].quantity ?? 1;
    setReturnItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, Math.min(qty, max)) } : it))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalReason) {
      toast.error("Please select a reason for the return.");
      return;
    }

    const selectedItems = returnItems.filter((it) => it.selected);
    if (order && selectedItems.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        orderId: order?.id || queryOrderId,
        reason: globalReason,
        description,
        items: selectedItems.map((it) => ({
          orderItemId: it.orderItemId,
          quantity: it.quantity,
          reason: globalReason,
        })),
      };

      const res = await apiFetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit return.");

      setIsSubmitted(true);
      toast.success("Return request submitted successfully!");
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 text-success border border-success/20">
          <FiCheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-display font-bold text-text-primary mb-3">Return Request Filed!</h1>
        <p className="text-text-secondary mb-2">
          Your return request has been registered and is pending review.
        </p>
        <p className="text-text-secondary mb-8 text-sm">
          Our team will review it within 24–48 hours. You'll receive a confirmation once approved.
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.push("/orders")} className="w-full">
            Back to Orders
          </Button>
          <Button variant="outline" onClick={() => router.push("/shop")} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Loading order
  if (isLoadingOrder) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary mt-4">Loading your order...</p>
      </div>
    );
  }

  // Order not found error
  if (orderError) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertCircle size={30} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Order Not Found</h1>
        <p className="text-text-secondary mb-6">{orderError}</p>
        <Link href="/orders"><Button className="w-full">Go to My Orders</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-2">
          <FiCornerUpLeft className="text-primary" /> Request a Return
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          ScootFix offers hassle-free 10-day returns on all unused EV spare parts and accessories.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Order reference badge */}
        {order && (
          <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <FiPackage size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Returning from order</p>
              <p className="font-mono font-bold text-text-primary">{order.orderNumber}</p>
            </div>
          </div>
        )}

        {/* Item Selection */}
        {order && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface-elevated/50">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Select Items to Return</p>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, idx) => {
                const ri = returnItems[idx];
                if (!ri) return null;
                return (
                  <div key={item.id} className={`p-4 flex items-center gap-4 transition-colors ${ri.selected ? "bg-primary/3" : "opacity-50"}`}>
                    <input
                      type="checkbox"
                      checked={ri.selected}
                      onChange={() => toggleItem(idx)}
                      className="w-4 h-4 accent-primary shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">{item.name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatPrice(item.price)} × {item.quantity} ordered</p>
                    </div>
                    {ri.selected && (
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-xs text-text-muted">Qty:</p>
                        <input
                          type="number"
                          min={1}
                          max={item.quantity}
                          value={ri.quantity}
                          onChange={(e) => setItemQty(idx, parseInt(e.target.value) || 1)}
                          className="w-14 h-8 text-center border border-border rounded-lg text-sm bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface-elevated/50">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Reason for Return</p>
          </div>
          <div className="p-4">
            <select
              value={globalReason}
              onChange={(e) => setGlobalReason(e.target.value)}
              className="w-full h-11 px-3 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            >
              <option value="" disabled>Select a reason...</option>
              {RETURN_REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional details */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface-elevated/50">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Additional Details <span className="text-text-muted font-normal normal-case tracking-normal">(optional)</span></p>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail — e.g. part arrived cracked, wrong fitment, stopped working after first use..."
              className="w-full p-3 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Policy note */}
        <div className="flex gap-3 p-4 bg-info/5 border border-info/20 rounded-xl text-info text-xs">
          <span className="text-base mt-0.5">ℹ️</span>
          <p>Returns are accepted within <strong>10 days</strong> of delivery. Items must be unused and in original packaging. Once approved, your refund will be processed within 3–5 business days.</p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 shadow-glow"
          isLoading={isLoading}
        >
          Submit Return Request
        </Button>
      </form>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary mt-4">Loading return form...</p>
      </div>
    }>
      <ReturnsForm />
    </Suspense>
  );
}
