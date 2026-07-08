"use client";

import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiShoppingBag, FiEdit, FiTrash, FiActivity, FiTruck, FiAlertCircle } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ orderId, status: nextStatus })
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      toast.success(`Order status updated to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/5 border border-danger/10 text-danger rounded-xl text-sm">
        <p className="font-semibold">Error Loading Orders</p>
        <p className="mt-1">{error}</p>
        <button onClick={fetchOrders} className="mt-3 text-xs bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded font-semibold transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Orders & Shipments Management</h1>
        <p className="text-xs text-text-secondary mt-1">Monitor user purchases, dispatch packages, and update delivery tracking status codes.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <FiShoppingBag className="mx-auto mb-4" size={40} />
            <p className="text-sm">No orders found in the system.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Primary Item</th>
                <th className="px-6 py-3.5 text-right">Order Total</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map(o => (
                <tr key={o.id} className="text-text-secondary hover:bg-surface-elevated/40 transition-colors">
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-text-primary">{o.orderNumber}</td>
                  <td className="px-6 py-3.5 font-medium text-text-primary">
                    <div>
                      <p>{o.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-text-muted font-normal font-mono">{o.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 truncate max-w-xs">{o.items[0]?.name || "EV Spare Part"}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-text-primary">{formatPrice(o.total)}</td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.status === "DELIVERED" ? "bg-success/10 text-success border border-success/20" : o.status === "PROCESSING" ? "bg-warning/10 text-warning border border-warning/20 animate-pulse" : o.status === "PENDING" ? "bg-info/10 text-info border border-info/20" : "bg-danger/10 text-danger border border-danger/20"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <select 
                      value={o.status} 
                      onChange={e => updateStatus(o.id, e.target.value)}
                      className="px-2 py-1 bg-surface border border-border rounded text-xs text-text-primary focus:outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
