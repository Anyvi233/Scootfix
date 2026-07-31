"use client";

import React, { useState, useEffect } from "react";
import { FiShoppingBag, FiChevronDown, FiChevronUp, FiArrowRight, FiPrinter, FiFileText, FiTruck, FiExternalLink } from "react-icons/fi";
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
  // Tracking number modal state
  const [trackingModal, setTrackingModal] = useState<{ orderId: string; nextStatus: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingUrlInput, setTrackingUrlInput] = useState("");

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
      Email: ${o.user?.email || "N/A"}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${o.orderNumber}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;8500&display=swap" rel="stylesheet" />
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
            border-t: 2px solid #e2e8f0;
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
                  <td style="font-weight: 700; padding-top: 12px;">Total Due</td>
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

  const handlePrintLabel = (o: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocker prevented printing. Please allow popups.");
      return;
    }

    const dateStr = new Date(o.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const address = o.shippingAddress || {};
    const deliveryName = (address.name || `${address.firstName || ""} ${address.lastName || ""}`).trim().toUpperCase();
    const deliveryZip = address.zipCode || address.zip || "";

    const barcodeBars = Array.from({ length: 42 })
      .map(() => {
        const width = Math.floor(Math.random() * 4) + 1;
        const isSpace = Math.random() > 0.55;
        return `<div style="width: ${width}px; background-color: ${isSpace ? "transparent" : "#000000"}; height: 60px; float: left;"></div>`;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${o.orderNumber}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 20px;
            background: #ffffff;
            color: #000000;
            display: flex;
            justify-content: center;
          }
          .label-container {
            width: 380px;
            border: 3px solid #000000;
            padding: 16px;
            box-sizing: border-box;
          }
          .border-bottom {
            border-bottom: 2px dashed #000000;
            padding-bottom: 12px;
            margin-bottom: 12px;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .routing-code {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.02em;
            border: 2px solid #000000;
            padding: 4px 8px;
            line-height: 1;
          }
          .address-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
            color: #555555;
          }
          .address-body {
            font-size: 13px;
            line-height: 1.5;
          }
          .delivery-name {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 6px;
          }
          .barcode-container {
            margin: 16px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .barcode-graphic {
            height: 60px;
            overflow: hidden;
            margin-bottom: 6px;
          }
          .barcode-text {
            font-family: monospace;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.15em;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="border-bottom header-row">
            <div>
              <span style="font-size: 18px; font-weight: 800;">SCOOT<span style="text-decoration: underline;">FIX</span></span>
              <p style="font-size: 9px; margin: 2px 0 0 0; font-weight: 600; letter-spacing: 0.05em;">EXPRESS LOGISTICS</p>
            </div>
            <div class="routing-code">EV-IN-94</div>
          </div>

          <div class="border-bottom" style="font-size: 10px; line-height: 1.4; color: #333333;">
            <div class="address-title">Return Address</div>
            <strong>ScootFix Dispatch Facility</strong>, Plot 45, Sector 4, HSR Layout, Bangalore, KA – 560102
          </div>

          <div class="border-bottom" style="min-height: 100px;">
            <div class="address-title">Deliver To</div>
            <div class="address-body">
              <div class="delivery-name">${deliveryName}</div>
              ${address.street || ""}<br />
              ${address.city || ""}, ${address.state || ""}<br />
              <strong>PIN: ${deliveryZip}</strong><br />
              Phone: ${address.phone || ""}
            </div>
          </div>

          <div class="barcode-container border-bottom">
            <div class="barcode-graphic">
              ${barcodeBars}
            </div>
            <span class="barcode-text">*${o.orderNumber.toUpperCase()}*</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600;">
            <div>
              ORDER: #${o.orderNumber}<br />
              DATE: ${dateStr}
            </div>
            <div style="text-align: right;">
              WEIGHT: 1.25 KG<br />
              METHOD: STANDARD
            </div>
          </div>
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

  const updateStatus = async (orderId: string, nextStatus: string, tracking?: { trackingNumber: string; trackingUrl: string }) => {
    setUpdatingId(orderId);
    try {
      const body: any = { orderId, status: nextStatus };
      if (tracking) {
        body.trackingNumber = tracking.trackingNumber;
        body.trackingUrl = tracking.trackingUrl;
      }
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setOrders(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, status: nextStatus, updatedAt: new Date().toISOString(), ...(tracking || {}) }
          : o
        )
      );
      toast.success(`Order moved to ${nextStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdvanceStatus = (orderId: string, nextStatus: string) => {
    if (nextStatus === "SHIPPED") {
      // Show tracking modal before advancing
      setTrackingInput("");
      setTrackingUrlInput("");
      setTrackingModal({ orderId, nextStatus });
    } else {
      updateStatus(orderId, nextStatus);
    }
  };

  const handleTrackingSubmit = () => {
    if (!trackingModal) return;
    updateStatus(trackingModal.orderId, trackingModal.nextStatus, {
      trackingNumber: trackingInput.trim(),
      trackingUrl: trackingUrlInput.trim(),
    });
    setTrackingModal(null);
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
                        onClick={() => handleAdvanceStatus(o.id, nextStatus)}
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
                      onChange={e => handleAdvanceStatus(o.id, e.target.value)}
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

                      {/* Shipping address & Tracking Details */}
                      {o.shippingAddress && (
                        <div className="mt-5 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Ship To</h3>
                              <p className="text-sm text-text-secondary">
                                {o.shippingAddress.name || `${o.shippingAddress.firstName || ""} ${o.shippingAddress.lastName || ""}`.trim()} &bull; {o.shippingAddress.phone || ""}<br />
                                {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} – {o.shippingAddress.zipCode || o.shippingAddress.zip}
                              </p>
                            </div>
                            {o.trackingNumber && (
                              <div className="p-3 bg-surface-elevated border border-border rounded-xl flex items-center gap-3 max-w-sm">
                                <FiTruck className="text-primary shrink-0" size={16} />
                                <div className="text-xs">
                                  <p className="font-bold text-text-primary">Tracking: {o.trackingNumber}</p>
                                  {o.trackingUrl ? (
                                    <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold">
                                      Track shipment <FiExternalLink size={10} />
                                    </a>
                                  ) : (
                                    <p className="text-text-muted">Standard Carrier Dispatch</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePrintInvoice(o)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-border border border-border text-text-primary text-xs font-semibold rounded-lg transition-colors"
                              title="Print Tax Invoice"
                            >
                              <FiPrinter size={14} />
                              <span>Invoice</span>
                            </button>
                            <button
                              onClick={() => handlePrintLabel(o)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-border border border-border text-text-primary text-xs font-semibold rounded-lg transition-colors"
                              title="Print Shipping Label"
                            >
                              <FiFileText size={14} />
                              <span>Shipping Label</span>
                            </button>
                          </div>
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

      {/* Tracking Number Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FiTruck className="text-primary" /> Ship Order
              </h3>
              <p className="text-xs text-text-secondary mt-1">Provide tracking details to notify the customer about their dispatch.</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Tracking / AWB Number</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. 78394029412"
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Tracking URL (Optional)</label>
                <input
                  type="url"
                  value={trackingUrlInput}
                  onChange={e => setTrackingUrlInput(e.target.value)}
                  placeholder="e.g. https://delhivery.com/track?id=..."
                  className="w-full h-11 px-3 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTrackingModal(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-text-primary hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTrackingSubmit}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-glow"
              >
                Mark Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
