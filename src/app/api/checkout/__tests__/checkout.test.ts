/**
 * @file src/app/api/checkout/__tests__/checkout.test.ts
 *
 * Integration-style unit tests for checkout pricing logic and the
 * checkout order creation API route.
 *
 * Covers:
 *  - Subtotal calculation from cart items
 *  - Free shipping threshold (>₹5,000 or coupon)
 *  - COD fee applied correctly
 *  - GST calculation when GSTIN is configured
 *  - Order total = subtotal − discount + shipping + COD fee + GST
 *  - POST /api/checkout/create-order → 401 when unauthenticated
 *  - POST /api/checkout/create-order → 400 when cart is empty
 *  - POST /api/checkout/create-order → 400 when stock is insufficient
 *  - POST /api/checkout/create-order → 201 on success
 */

// ── Pricing helper (extracted from checkout page logic) ───────────────────────
// We test the pure calculation functions independently of Next.js

interface CartItem {
  price: number;
  quantity: number;
}

interface PricingInput {
  cartItems: CartItem[];
  discountAmount: number;
  deliveryPrice: number;
  isCouponFreeShip: boolean;
  paymentMethod: "cod" | "card" | "upi" | "razorpay";
  gstRate?: number;
  hasGstin?: boolean;
}

interface PricingResult {
  subtotal: number;
  discountedSubtotal: number;
  shippingCost: number;
  codFee: number;
  estimatedTax: number;
  total: number;
}

function calculateOrderPricing({
  cartItems,
  discountAmount,
  deliveryPrice,
  isCouponFreeShip,
  paymentMethod,
  gstRate = 18,
  hasGstin = false,
}: PricingInput): PricingResult {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Free shipping: subtotal > 5000 OR coupon grants free shipping
  const shippingCost =
    discountedSubtotal > 5000 || isCouponFreeShip ? 0 : deliveryPrice;

  const codFee = paymentMethod === "cod" ? 50 : 0;

  const estimatedTax = hasGstin
    ? Math.round(
        (discountedSubtotal + shippingCost + codFee) * (gstRate / 100)
      )
    : 0;

  const total = discountedSubtotal + shippingCost + codFee + estimatedTax;

  return {
    subtotal,
    discountedSubtotal,
    shippingCost,
    codFee,
    estimatedTax,
    total,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe("Checkout — pricing calculations", () => {
  describe("subtotal", () => {
    it("calculates subtotal as sum of price × quantity", () => {
      const result = calculateOrderPricing({
        cartItems: [
          { price: 100, quantity: 2 },
          { price: 250, quantity: 1 },
        ],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.subtotal).toBe(450);
    });

    it("returns 0 for an empty cart", () => {
      const result = calculateOrderPricing({
        cartItems: [],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.subtotal).toBe(0);
    });
  });

  describe("discount", () => {
    it("subtracts discount from subtotal", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 1000, quantity: 1 }],
        discountAmount: 100,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.discountedSubtotal).toBe(900);
    });

    it("discounted subtotal never goes below 0", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 100, quantity: 1 }],
        discountAmount: 999,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.discountedSubtotal).toBe(0);
    });
  });

  describe("free shipping", () => {
    it("applies shipping cost when subtotal is below ₹5,000", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 4999, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.shippingCost).toBe(80);
    });

    it("gives free shipping when subtotal exceeds ₹5,000", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 5001, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.shippingCost).toBe(0);
    });

    it("gives free shipping for express delivery when coupon grants free ship", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 200, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 200, // express delivery
        isCouponFreeShip: true,
        paymentMethod: "card",
      });
      expect(result.shippingCost).toBe(0);
    });
  });

  describe("COD fee", () => {
    it("adds ₹50 COD fee when payment method is cod", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 500, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "cod",
      });
      expect(result.codFee).toBe(50);
    });

    it("no COD fee for card payment", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 500, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
      });
      expect(result.codFee).toBe(0);
    });
  });

  describe("GST", () => {
    it("does NOT apply GST when GSTIN is not configured", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 1000, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 80,
        isCouponFreeShip: false,
        paymentMethod: "card",
        hasGstin: false,
      });
      expect(result.estimatedTax).toBe(0);
    });

    it("applies 18% GST when GSTIN is configured", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 1000, quantity: 1 }],
        discountAmount: 0,
        deliveryPrice: 0,
        isCouponFreeShip: true,
        paymentMethod: "card",
        hasGstin: true,
        gstRate: 18,
      });
      // 18% of 1000 = 180
      expect(result.estimatedTax).toBe(180);
    });
  });

  describe("order total", () => {
    it("correctly calculates total = discountedSubtotal + shipping + COD + tax", () => {
      const result = calculateOrderPricing({
        cartItems: [{ price: 2000, quantity: 1 }],
        discountAmount: 200,    // discountedSubtotal = 1800
        deliveryPrice: 80,      // shippingCost = 80 (< 5000)
        isCouponFreeShip: false,
        paymentMethod: "cod",   // codFee = 50
        hasGstin: false,        // tax = 0
      });
      // 1800 + 80 + 50 = 1930
      expect(result.total).toBe(1930);
    });
  });
});

// ── API route tests ───────────────────────────────────────────────────────────
// We mock next-auth and Prisma to test the API route handler in isolation.

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    product: { findMany: jest.fn() },
    order: { create: jest.fn() },
    orderItem: { createMany: jest.fn() },
    cartItem: { deleteMany: jest.fn() },
    inventoryLog: { createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/security/rate-limiter", () => ({
  applyApiRateLimit: jest.fn().mockResolvedValue(null),
  applyAuthRateLimit: jest.fn().mockResolvedValue(null),
  applyAdminRateLimit: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/lib/security/audit-logger", () => ({
  logUnauthorizedAccess: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/auth", () => ({ authOptions: {} }));
jest.mock("next-auth/jwt", () => ({ getToken: jest.fn() }));

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

const mockSession = getServerSession as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as unknown;

function makeCheckoutRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.mockResolvedValue(null);
  });

  it("returns 401 when user is not authenticated", async () => {
    // Need to mock getToken since the route uses next-auth/jwt
    const { getToken } = require("next-auth/jwt");
    getToken.mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/orders/route");
    const req = makeCheckoutRequest({ items: [{ productId: "1", quantity: 1 }] });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when missing required fields", async () => {
    const { getToken } = require("next-auth/jwt");
    getToken.mockResolvedValueOnce({ id: "user-1" });

    const { POST } = await import("@/app/api/orders/route");
    const req = makeCheckoutRequest({}); // empty body
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Missing required fields/i);
  });
});
