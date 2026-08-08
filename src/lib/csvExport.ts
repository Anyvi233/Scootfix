/**
 * CSV Export Utility for Order Data
 *
 * Generates a complete business-record CSV containing:
 * Order → Customer → Items → Tax → Shipping → Payment → Invoice → Refund
 *
 * One row per order-item, with order-level fields repeated.
 */

interface CsvOrderItem {
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  product?: {
    sku: string;
    name: string;
  } | null;
}

interface CsvRefund {
  id: string;
  amount: number;
  status: string;
  gatewayId: string | null;
  reason: string | null;
  createdAt: Date;
}

interface CsvOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentId: string | null;
  razorpayOrderId: string | null;
  shippingAddress: unknown;
  billingAddress: unknown;
  notes: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  items: CsvOrderItem[];
  refunds: CsvRefund[];
}

const CSV_HEADERS = [
  "Order Number",
  "Order Date",
  "Order Status",
  "Customer Name",
  "Customer Email",
  "Customer Phone",
  "Shipping Address",
  "Billing Address",
  "Item SKU",
  "Item Name",
  "Item Qty",
  "Item Unit Price",
  "Item Total",
  "Subtotal",
  "Tax",
  "Shipping",
  "Order Total",
  "Payment Method",
  "Payment ID",
  "Razorpay Order ID",
  "Tracking Number",
  "Tracking URL",
  "Refund IDs",
  "Refund Amounts",
  "Refund Statuses",
  "Refund Gateway IDs",
  "Refund Reasons",
  "Notes",
  "Updated At",
];

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatAddress(addr: unknown): string {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    const a = addr as Record<string, string>;
    const parts = [
      a.firstName,
      a.lastName,
      a.street,
      a.city,
      a.state,
      a.zip,
      a.country,
      a.phone,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return String(addr);
}

function formatDate(d: Date): string {
  return new Date(d).toISOString().replace("T", " ").slice(0, 19);
}

export function generateOrderCsv(orders: CsvOrder[]): string {
  const rows: string[] = [];

  // Header row
  rows.push(CSV_HEADERS.map(escapeCsvField).join(","));

  for (const order of orders) {
    // Aggregate refund info at order level
    const refundIds = order.refunds.map((r) => r.id).join("; ");
    const refundAmounts = order.refunds.map((r) => r.amount.toFixed(2)).join("; ");
    const refundStatuses = order.refunds.map((r) => r.status).join("; ");
    const refundGatewayIds = order.refunds.map((r) => r.gatewayId || "").join("; ");
    const refundReasons = order.refunds.map((r) => r.reason || "").join("; ");

    const shippingAddr = formatAddress(order.shippingAddress);
    const billingAddr = formatAddress(order.billingAddress);

    // If no items (shouldn't happen but safety), emit one row with blanks
    const items = order.items.length > 0 ? order.items : [null];

    for (const item of items) {
      const fields = [
        order.orderNumber,
        formatDate(order.createdAt),
        order.status,
        order.user?.name || "",
        order.user?.email || "",
        order.user?.phone || "",
        shippingAddr,
        billingAddr,
        item?.product?.sku || "",
        item?.name || item?.product?.name || "",
        item ? String(item.quantity) : "",
        item ? item.price.toFixed(2) : "",
        item ? (item.price * item.quantity).toFixed(2) : "",
        order.subtotal.toFixed(2),
        order.tax.toFixed(2),
        order.shipping.toFixed(2),
        order.total.toFixed(2),
        order.paymentMethod,
        order.paymentId || "",
        order.razorpayOrderId || "",
        order.trackingNumber || "",
        order.trackingUrl || "",
        refundIds,
        refundAmounts,
        refundStatuses,
        refundGatewayIds,
        refundReasons,
        order.notes || "",
        formatDate(order.updatedAt),
      ];

      rows.push(fields.map(escapeCsvField).join(","));
    }
  }

  return rows.join("\n");
}
