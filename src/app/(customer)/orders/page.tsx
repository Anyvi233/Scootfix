"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { OrderTracker, OrderStatus } from "@/components/shared/OrderTracker";

const STATUS_COLOR: Record<string, string> = {
  PENDING:    "bg-info/10 text-info border-info/20",
  CONFIRMED:  "bg-primary/10 text-primary border-primary/20",
  PROCESSING: "bg-warning/10 text-warning border-warning/20",
  SHIPPED:    "bg-violet-500/10 text-violet-500 border-violet-500/20",
  DELIVERED:  "bg-success/10 text-success border-success/20",
  CANCELLED:  "bg-danger/10 text-danger border-danger/20",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated") return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.items || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") fetchOrders();
    else if (status === "unauthenticated") setIsLoading(false);
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
          <FiPackage size={28} className="text-text-muted" />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Sign In Required</h1>
        <p className="text-text-secondary mb-8">Please login to view your order history.</p>
        <Link href="/login"><Button size="lg" className="w-full">Sign In</Button></Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
          <FiAlertCircle size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Error Loading Orders</h1>
        <p className="text-text-secondary mb-8">{error}</p>
        <Button size="lg" className="w-full" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-primary">My Orders</h1>
        <p className="text-text-secondary text-sm mt-1">Track and manage your spare parts orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
          <FiPackage className="mx-auto text-text-muted mb-4" size={48} />
          <h2 className="text-xl font-display font-semibold text-text-primary mb-2">No Orders Yet</h2>
          <p className="text-text-secondary mb-6">You haven&rsquo;t placed any orders yet.</p>
          <Link href="/shop"><Button>Shop Spare Parts</Button></Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const statusClass = STATUS_COLOR[order.status] || STATUS_COLOR.PENDING;

            return (
              <div key={order.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">

                {/* ── Order Card Header ── */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    {/* Left meta */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Order</p>
                        <p className="font-mono font-semibold text-text-primary">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Date</p>
                        <p className="text-text-primary">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Total</p>
                        <p className="font-bold text-text-primary">{formatPrice(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Items</p>
                        <p className="text-text-primary">{order.items?.length ?? 0} item{order.items?.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${statusClass}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* ── Compact Tracking Stepper ── */}
                  {order.status !== "CANCELLED" && (
                    <div className="mt-2">
                      <OrderTracker
                        status={order.status as OrderStatus}
                        updatedAt={order.updatedAt}
                        compact
                      />
                    </div>
                  )}

                  {order.status === "CANCELLED" && (
                    <div className="mt-2">
                      <OrderTracker status="CANCELLED" updatedAt={order.updatedAt} compact={false} />
                    </div>
                  )}
                </div>

                {/* ── Expand Toggle ── */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between px-5 py-3 bg-surface-elevated border-t border-border text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated/80 transition-colors"
                >
                  <span className="font-medium">{isExpanded ? "Hide Details" : "View Order Details"}</span>
                  {isExpanded ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                </button>

                {/* ── Expanded Detail Panel ── */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-0">

                      {/* Full Tracking Timeline */}
                      <div className="md:col-span-2 p-6 border-b md:border-b-0 md:border-r border-border bg-surface-elevated/40">
                        <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-5">Delivery Timeline</h3>
                        <OrderTracker
                          status={order.status as OrderStatus}
                          updatedAt={order.updatedAt}
                          compact={false}
                        />
                      </div>

                      {/* Order Items */}
                      <div className="md:col-span-3 p-6">
                        <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-4">Items in this Order</h3>
                        <div className="divide-y divide-border">
                          {order.items.map((item: any, idx: number) => {
                            const itemSlug = item.product?.slug || item.name.toLowerCase().replace(/ /g, "-");
                            const itemImage = item.product?.images?.[0]?.url || "/placeholder.jpg";
                            return (
                              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                                <div
                                  className="w-14 h-14 rounded-lg border border-border shrink-0 bg-cover bg-center bg-background"
                                  style={{ backgroundImage: `url(${itemImage})` }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-text-primary line-clamp-1">{item.name}</h4>
                                  <p className="text-xs text-text-secondary mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Link href={`/products/${itemSlug}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                  {order.status === "DELIVERED" && (
                                    <Link href={`/returns?orderId=${order.id}&item=${encodeURIComponent(item.name)}`}>
                                      <Button variant="secondary" size="sm">Return</Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="mt-5 pt-5 border-t border-border">
                            <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-2">Shipping Address</h3>
                            <p className="text-sm text-text-secondary">
                              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                              {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                              {order.shippingAddress.state} – {order.shippingAddress.zip}
                            </p>
                          </div>
                        )}
                      </div>
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
