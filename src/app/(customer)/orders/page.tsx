"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated") return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await res.json();
        setOrders(data.items || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong while loading your orders.");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <Badge variant="warning" pulse>Processing</Badge>;
      case "SHIPPED":
        return <Badge variant="info" pulse>Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="success">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PROCESSING":
        return <FiClock className="text-warning" size={20} />;
      case "SHIPPED":
        return <FiTruck className="text-info" size={20} />;
      case "DELIVERED":
        return <FiCheckCircle className="text-success" size={20} />;
      case "CANCELLED":
        return <FiAlertCircle className="text-danger" size={20} />;
      default:
        return <FiPackage className="text-text-muted" size={20} />;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center max-w-md">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted border border-border">
          <FiPackage size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Access Denied</h1>
        <p className="text-text-secondary mb-8">Please login to view your order history.</p>
        <Link href="/login" className="block w-full">
          <Button size="lg" className="w-full">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-12 text-center max-w-md">
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
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-xl">
          <FiPackage className="mx-auto text-text-muted mb-4" size={48} />
          <h2 className="text-xl font-display font-semibold text-text-primary mb-2">No Orders Found</h2>
          <p className="text-text-secondary mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop">
            <Button>Shop Spare Parts</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              
              {/* Order Header */}
              <div className="bg-surface-elevated border-b border-border p-4 flex flex-col sm:flex-row justify-between gap-4 text-sm text-text-secondary">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div>
                    <p className="text-xs uppercase font-semibold text-text-muted">Order Placed</p>
                    <p className="font-medium text-text-primary">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-text-muted">Total Amount</p>
                    <p className="font-medium text-text-primary font-bold">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-semibold text-text-muted">Order Number</p>
                    <p className="font-medium text-text-primary font-mono">{order.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-center">
                  {getStatusIcon(order.status)}
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border p-6">
                {order.items.map((item: any, index: number) => {
                  const itemSlug = item.product?.slug || item.name.toLowerCase().replace(/ /g, "-");
                  const itemImage = item.product?.images?.[0]?.url || "/placeholder.jpg";
                  return (
                    <div key={index} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4 items-center">
                        <div 
                          className="w-16 h-16 bg-background rounded-lg border border-border shrink-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${itemImage})` }}
                        />
                        <div>
                          <h3 className="font-medium text-text-primary text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-text-secondary mt-1">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-text-primary mt-0.5">{formatPrice(item.price)}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                        <Link href={`/products/${itemSlug}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" size="sm" className="w-full">View Product</Button>
                        </Link>
                        {order.status === "DELIVERED" && (
                          <Link href={`/returns?orderId=${order.id}&item=${encodeURIComponent(item.name)}`} className="flex-1 sm:flex-none">
                            <Button variant="secondary" size="sm" className="w-full">Return Item</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Footer - Tracking info */}
              {order.trackingNumber && (
                <div className="bg-surface-elevated border-t border-border p-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
                  <span className="text-text-secondary">Tracking ID: <span className="font-mono font-medium text-text-primary">{order.trackingNumber}</span></span>
                  <Button variant="ghost" size="sm" className="text-primary hover:underline">Track Package &rarr;</Button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
