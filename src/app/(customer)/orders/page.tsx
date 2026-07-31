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
  FiPrinter,
  FiExternalLink,
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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order? This will release the stock immediately.")) return;
    setCancellingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: "CANCELLED", updatedAt: new Date().toISOString() } : o)
      );
      toast.success("Order cancelled successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  const handlePrintInvoice = (o: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented printing. Please allow popups.");
      return;
    }

    const itemsHtml = (o.items || [])
      .map((item: any, idx: number) => {
        const itemSubtotal = item.price * item.quantity;
        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            <td style="padding: 12px 8px; text-align: left; color: #1e293b;">${idx + 1}</td>
            <td style="padding: 12px 8px; text-align: left; color: #1e293b; font-weight: 500;">${item.name}</td>
            <td style="padding: 12px 8px; text-align: center; color: #475569;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right; color: #475569;">₹${item.price.toLocaleString("en-IN")}</td>
            <td style="padding: 12px 8px; text-align: right; color: #1e293b; font-weight: 600;">₹${itemSubtotal.toLocaleString("en-IN")}</td>
          </tr>
        `;
      })
      .join("");

    const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const address = o.shippingAddress || {};
    const name = address.name || `${address.firstName || ""} ${address.lastName || ""}`.trim();
    const zip = address.zipCode || address.zip || "";
    const addressHtml = `
      <strong>${name}</strong><br />
      ${address.street || ""}<br />
      ${address.city || ""}, ${address.state || ""} – ${zip}<br />
      Phone: ${address.phone || "N/A"}<br />
      Email: ${session?.user?.email || "N/A"}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${o.orderNumber}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1e293b;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .address-section {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          .address-cell {
            width: 50%;
            vertical-align: top;
            font-size: 13px;
            line-height: 1.6;
            color: #475569;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 8px;
            border-bottom: 2px solid #e2e8f0;
          }
          .summary-table {
            width: 320px;
            margin-left: auto;
            border-collapse: collapse;
            font-size: 14px;
          }
          .summary-table td {
            padding: 8px 4px;
          }
          .summary-label {
            color: #64748b;
            text-align: left;
          }
          .summary-val {
            color: #1e293b;
            text-align: right;
            font-weight: 500;
          }
          .summary-total {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            border-top: 2px solid #e2e8f0;
            padding-top: 12px !important;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .badge-paid {
            background-color: #dcfce7;
            color: #15803d;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <table class="header-table">
          <tr>
            <td style="vertical-align: middle;">
              <span style="font-size: 24px; font-weight: 800; color: #0f172a; tracking: -0.02em;">SCOOT<span style="color: #2563eb;">FIX</span></span>
              <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-weight: 500;">Premium EV Spares & Upgrades</p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a;">TAX INVOICE</h2>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Invoice #: <strong>${o.orderNumber}</strong></p>
              <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Date: ${dateStr}</p>
            </td>
          </tr>
        </table>

        <!-- Addresses -->
        <table class="address-section">
          <tr>
            <td class="address-cell">
              <span style="font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Seller Details</span>
              <strong>ScootFix EV Spares Pvt. Ltd.</strong><br />
              Plot 45, Sector 4, HSR Layout<br />
              Bangalore, Karnataka – 560102<br />
              ${process.env.NEXT_PUBLIC_GST_NUMBER ? `GSTIN: ${process.env.NEXT_PUBLIC_GST_NUMBER}<br />` : ""}
              Contact: warehouse@scootfix.com
            </td>
            <td class="address-cell" style="padding-left: 40px; border-left: 1px solid #e2e8f0;">
              <span style="font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Billed & Shipped To</span>
              ${addressHtml}
            </td>
          </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th style="text-align: left;">Item Description</th>
              <th style="width: 80px; text-align: center;">Qty</th>
              <th style="width: 120px; text-align: right;">Unit Price</th>
              <th style="width: 120px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Summary & Totals -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; font-size: 12px; color: #64748b; line-height: 1.6;">
              <span style="font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Payment Method</span>
              ${o.paymentMethod || "Online Transfer"} (Prepaid)<br />
              Status: <span class="badge badge-paid">PAID</span>
              ${o.notes ? `<div style="margin-top: 16px;"><strong>Notes:</strong> ${o.notes}</div>` : ""}
            </td>
            <td style="vertical-align: top; text-align: right;">
              <table class="summary-table">
                <tr>
                  <td class="summary-label">Subtotal</td>
                  <td class="summary-val">₹${o.subtotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td class="summary-label">${process.env.NEXT_PUBLIC_GST_NUMBER ? `GST (${process.env.NEXT_PUBLIC_GST_RATE || 18}%)` : 'Taxes & Fees'}</td>
                  <td class="summary-val">${process.env.NEXT_PUBLIC_GST_NUMBER ? `₹${o.tax.toLocaleString('en-IN')}` : 'Incl. in price'}</td>
                </tr>
                <tr>
                  <td class="summary-label">Shipping</td>
                  <td class="summary-val">${o.shipping === 0 ? "FREE" : `₹${o.shipping.toLocaleString("en-IN")}`}</td>
                </tr>
                <tr class="summary-total">
                  <td style="font-weight: 700; padding-top: 12px;">Total Paid</td>
                  <td style="font-weight: 800; color: #2563eb; text-align: right; padding-top: 12px;">₹${o.total.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="margin-top: 80px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          This is a computer-generated tax invoice and requires no physical signature. Thank you for your business!<br />
          For installation guides and parts compatibility help, visit <strong>scootfix.com/guides</strong>.
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

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
                          <div className="mt-5 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xs uppercase font-bold tracking-widest text-text-muted mb-2">Shipping Address</h3>
                                <p className="text-sm text-text-secondary">
                                  {order.shippingAddress.name || `${order.shippingAddress.firstName || ""} ${order.shippingAddress.lastName || ""}`.trim()}<br />
                                  {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                                  {order.shippingAddress.state} – {order.shippingAddress.zipCode || order.shippingAddress.zip}
                                  {order.shippingAddress.phone && <><br />Phone: {order.shippingAddress.phone}</>}
                                </p>
                              </div>
                              {order.trackingNumber && (
                                <div className="p-3 bg-surface-elevated border border-border rounded-xl flex items-center gap-3 max-w-sm">
                                  <FiTruck className="text-primary shrink-0" size={16} />
                                  <div className="text-xs">
                                    <p className="font-bold text-text-primary">Tracking Number: {order.trackingNumber}</p>
                                    {order.trackingUrl ? (
                                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold">
                                        Track shipment <FiExternalLink size={10} />
                                      </a>
                                    ) : (
                                      <p className="text-text-muted">In transit via standard carrier</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handlePrintInvoice(order)}
                                variant="outline"
                                size="sm"
                                leftIcon={<FiPrinter size={14} />}
                              >
                                Print Invoice
                              </Button>
                              {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                                <Button
                                  onClick={() => handleCancelOrder(order.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-danger/30 hover:border-danger hover:bg-danger/5 text-danger font-semibold transition-colors"
                                  isLoading={cancellingId === order.id}
                                >
                                  Cancel Order
                                </Button>
                              )}
                            </div>
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
