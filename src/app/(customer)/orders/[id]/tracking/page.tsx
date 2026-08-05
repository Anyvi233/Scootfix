import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { OrderTracker, OrderStatus } from "@/components/shared/OrderTracker";
import Link from "next/link";
import { FiArrowLeft, FiTruck, FiExternalLink, FiPackage, FiMapPin } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { AddressJson } from "@/types/json";

export default async function TrackingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, images: { take: 1, select: { url: true } } }
          }
        }
      }
    }
  });

  if (!order || order.userId !== (session.user as any).id) {
    notFound();
  }

  const shippingAddress = order.shippingAddress as unknown as AddressJson;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/orders" 
          className="p-2 bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors text-text-secondary hover:text-text-primary"
        >
          <FiArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Track Order</h1>
          <p className="text-sm text-text-secondary font-mono mt-1">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Tracking Timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">Delivery Status</h2>
            
            <OrderTracker 
              status={order.status as OrderStatus} 
              updatedAt={order.updatedAt.toISOString()} 
              compact={false} 
            />

            {/* Tracking Number Box */}
            {order.trackingNumber && (
              <div className="mt-8 p-4 bg-surface-elevated border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <FiTruck size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-text-muted">Tracking Number</p>
                    <p className="font-mono font-semibold text-text-primary mt-0.5">{order.trackingNumber}</p>
                  </div>
                </div>
                
                {order.trackingUrl && (
                  <a 
                    href={order.trackingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-glow"
                  >
                    Track on Carrier <FiExternalLink size={16} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <FiPackage className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Items in Shipment</h2>
            </div>
            
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="w-12 h-12 bg-background border border-border rounded-lg overflow-hidden shrink-0 relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.product?.images?.[0]?.url || 'https://via.placeholder.com/150'})` }} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Details */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
              <FiMapPin className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest">Shipping Details</h2>
            </div>
            
            <address className="not-italic text-sm text-text-secondary leading-relaxed">
              <span className="font-semibold text-text-primary block mb-1">
                {shippingAddress.name || `${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}`.trim()}
              </span>
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode || shippingAddress.zip}<br />
              {shippingAddress.phone && (
                <span className="block mt-2 pt-2 border-t border-border/50">
                  Phone: {shippingAddress.phone}
                </span>
              )}
            </address>
          </div>
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary pt-3 border-t border-border mt-3 text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
