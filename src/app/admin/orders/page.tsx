"use client";

import React, { useState, useEffect } from "react";
import { FiShoppingBag, FiChevronDown, FiChevronUp, FiArrowRight } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { OrderTracker, OrderStatus } from "@/components/shared/OrderTracker";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED",
];

// One-click "next" progression (smart advance)
const NEXT_STATUS: Record<string, OrderStatus | null> = {
  PENDING:    "CONFIRMED",
  CONFIRMED:  "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED:    "DELIVERED",
  DELIVERED:  null,
  CANCELLED:  null,
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-info/10 text-info border-info/20",
  CONFIRMED:  "bg-primary/10 text-primary border-primary/20",
  PROCESSING: "bg-warning/10 text-warning border-warning/20",
  SHIPPED:    "bg-violet-500/10 text-violet-500 border-violet-500/20",
  DELIVERED:  "bg-success/10 text-success border-success/20",
  CANCELLED:  "bg-danger/10 text-danger border-danger/20",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.items || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toISOString() } : o)
      );
      toast.success(`Order moved to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/5 border border-danger/10 text-danger rounded-xl text-sm">
        <p className="font-semibold">Error Loading Orders</p>
        <p className="mt-1">{error}</p>
        <button onClick={fetchOrders} className="mt-3 text-xs bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded font-semibold transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Orders &amp; Shipments</h1>
        <p className="text-xs text-text-secondary mt-1">Manage customer orders and update delivery status in real-time.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl text-text-muted">
          <FiShoppingBag className="mx-auto mb-4" size={40} />
          <p className="text-sm">No orders found in the system.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const isExpanded = expandedId === o.id;
            const isUpdating = updatingId === o.id;
            const nextStatus = NEXT_STATUS[o.status];
            const statusClass = STATUS_COLOR[o.status] || STATUS_COLOR.PENDING;

            return (
              <div key={o.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">

                {/* ── Row ── */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">

                  {/* Order meta */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Order ID</p>
                      <p className="font-mono font-semibold text-text-primary text-xs">{o.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Customer</p>
                      <p className="font-medium text-text-primary truncate">{o.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-text-muted font-mono truncate">{o.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Total</p>
                      <p className="font-bold text-text-primary">{formatPrice(o.total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Date</p>
                      <p className="text-text-primary">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                      {o.status}
                    </span>

                    {/* Quick advance button */}
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(o.id, nextStatus)}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {isUpdating ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiArrowRight size={12} />
                        )}
                        → {nextStatus}
                      </button>
                    )}

                    {/* Full status selector */}
                    <select
                      value={o.status}
                      disabled={isUpdating}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      className="p-1.5 border border-border rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* ── Expanded Panel ── */}
                {isExpanded && (
                  <div className="border-t border-border grid grid-cols-1 md:grid-cols-5">

                    {/* Tracking timeline */}
                    <div className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-border bg-surface-elevated/30">
                      <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-5">Order Progress</h3>
                      <OrderTracker
                        status={o.status as OrderStatus}
                        updatedAt={o.updatedAt}
                        compact={false}
                      />
                    </div>

                    {/* Items list */}
                    <div className="md:col-span-3 p-6">
                      <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-4">Items ({o.items?.length})</h3>
                      <div className="divide-y divide-border">
                        {o.items?.map((item: any, idx: number) => (
                          <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 text-sm">
                            <div
                              className="w-10 h-10 rounded-lg border border-border shrink-0 bg-cover bg-center bg-background"
                              style={{ backgroundImage: `url(${item.product?.images?.[0]?.url || "/placeholder.jpg"})` }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-text-primary truncate">{item.name}</p>
                              <p className="text-xs text-text-muted">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                            <p className="font-bold text-text-primary shrink-0">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping address */}
                      {o.shippingAddress && (
                        <div className="mt-5 pt-5 border-t border-border">
                          <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Ship To</h3>
                          <p className="text-sm text-text-secondary">
                            {o.shippingAddress.firstName} {o.shippingAddress.lastName} &bull; {o.shippingAddress.phone || ""}<br />
                            {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} – {o.shippingAddress.zip}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
