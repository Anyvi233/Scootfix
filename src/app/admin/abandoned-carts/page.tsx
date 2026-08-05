"use client";

import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiMail, FiRefreshCw, FiClock, FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "@/lib/api-client";

export default function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCarts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/abandoned-carts");
      if (res.ok) {
        const data = await res.json();
        setCarts(data);
      } else {
        toast.error("Failed to load active carts.");
      }
    } catch (e) {
      toast.error("An error occurred loading carts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const sendReminder = async (userId: string) => {
    setSendingId(userId);
    try {
      const res = await apiFetch("/api/admin/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🛒 Recovery email sent successfully!");
        // Update local eligibility in UI
        setCarts(prev =>
          prev.map(c => c.userId === userId ? { ...c, isEligible: false } : c)
        );
      } else {
        toast.error(data.error || "Failed to send email.");
      }
    } catch (e) {
      toast.error("Error sending email reminder.");
    } finally {
      setSendingId(null);
    }
  };

  const totalActiveCarts = carts.length;
  const eligibleForReminder = carts.filter(c => c.isEligible).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiShoppingCart className="text-primary" /> Abandoned Carts Manager
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Recover potential buyers by dispatching customized shopping cart reminders with 10% coupon incentives.</p>
        </div>
        <button
          onClick={fetchCarts}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Total Active Carts</p>
          <p className="text-2xl font-bold mt-1 text-text-primary">{totalActiveCarts}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Eligible for Reminder</p>
          <p className="text-2xl font-bold mt-1 text-primary">{eligibleForReminder}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Coupon Code Incentive</p>
          <p className="text-2xl font-bold mt-1 text-success font-mono">CART10 (10% OFF)</p>
        </div>
      </div>

      {/* Table view */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : carts.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl text-text-muted">
          <FiShoppingCart className="mx-auto mb-4" size={40} />
          <p className="text-sm">No active customer carts found in database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart: any) => {
            const isExpanded = expandedId === cart.userId;
            const isSending = sendingId === cart.userId;
            const subtotal = cart.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

            return (
              <div key={cart.userId} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                {/* Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Customer</p>
                      <p className="font-semibold text-text-primary truncate">{cart.name}</p>
                      <p className="text-[10px] text-text-muted font-mono truncate">{cart.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Cart Value</p>
                      <p className="font-bold text-text-primary">{formatPrice(subtotal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Items Count</p>
                      <p className="text-text-primary font-medium">{cart.itemCount} items</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Last Activity</p>
                      <p className="text-text-primary flex items-center gap-1">
                        <FiClock size={12} className="text-text-muted" />
                        {cart.inactiveMinutes > 60
                          ? `${Math.floor(cart.inactiveMinutes / 60)} hrs ago`
                          : `${cart.inactiveMinutes} mins ago`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {cart.isEligible ? (
                      <button
                        onClick={() => sendReminder(cart.userId)}
                        disabled={isSending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors shadow-glow"
                      >
                        {isSending ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiMail size={13} />
                        )}
                        Send Email Reminder
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-success/10 border border-success/20 text-success text-xs font-semibold rounded-lg">
                        <FiCheckCircle size={13} /> Sent / Cooloff
                      </span>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : cart.userId)}
                      className="p-1.5 border border-border rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded items view */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-surface-elevated/20 border-t border-border"
                    >
                      <div className="p-6">
                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-3">Cart Contents</h3>
                        <div className="space-y-2">
                          {cart.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-3 bg-surface border border-border rounded-xl">
                              <div>
                                <p className="font-medium text-text-primary">{item.name}</p>
                                <p className="text-xs text-text-muted">Qty: {item.quantity} &times; {formatPrice(item.price)}</p>
                              </div>
                              <p className="font-bold text-text-primary">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
