"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiTruck, FiPackage, FiSave } from "react-icons/fi";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiFetch(`/api/admin/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to fetch order:", data.error || res.statusText);
          return;
        }
        setOrder(data);
        setStatus(data.status);
        setTrackingNumber(data.trackingNumber || "");
        setTrackingUrl(data.trackingUrl || "");
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status, trackingNumber, trackingUrl }),
      });
      if (res.ok) {
        toast.success("Order updated successfully");
        const updated = await res.json();
        setOrder(updated);
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-muted animate-pulse">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-danger">Order not found.</div>;
  }

  const shippingAddress = order.shippingAddress as any;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/orders">
          <button className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors text-text-secondary">
            <FiArrowLeft />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Order {order.orderNumber}</h1>
          <p className="text-sm text-text-secondary">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Order Items & Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FiPackage className="text-primary" /> Items Purchased
            </h2>
            <div className="divide-y divide-border">
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-text-primary">{item.name}</p>
                    <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>₹{order.shipping.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>₹{order.tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary text-base pt-2">
                <span>Total</span>
                <span className="text-primary">₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Customer & Shipping Info</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-1">Customer Account</p>
                {order.user ? (
                  <>
                    <p className="font-medium text-text-primary">{order.user.name}</p>
                    <p className="text-text-secondary">{order.user.email}</p>
                  </>
                ) : (
                  <p className="italic text-text-muted">Deleted User</p>
                )}
              </div>
              <div>
                <p className="text-text-muted mb-1">Shipping Address</p>
                {shippingAddress ? (
                  <address className="not-italic text-text-secondary">
                    <span className="font-medium text-text-primary">{shippingAddress.firstName} {shippingAddress.lastName}</span><br />
                    {shippingAddress.address}<br />
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                    {shippingAddress.phone}
                  </address>
                ) : (
                  <p>No shipping info available.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Fulfillment Controls */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FiTruck className="text-primary" /> Fulfillment
            </h2>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                Tracking Number
              </label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. AW123456789IN"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                Tracking URL (Optional)
              </label>
              <Input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <Button 
              className="w-full" 
              leftIcon={<FiSave />} 
              onClick={handleUpdate}
              isLoading={saving}
            >
              Update Order
            </Button>
            
            {status === "SHIPPED" && order.status !== "SHIPPED" && (
              <p className="text-xs text-warning mt-2 italic text-center">
                Updating to SHIPPED will trigger a notification email to the customer.
              </p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
