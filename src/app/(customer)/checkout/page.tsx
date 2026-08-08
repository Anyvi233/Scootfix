"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiCreditCard,
  FiLock,
  FiTruck,
  FiArrowRight,
  FiMapPin,
  FiInfo,
  FiShoppingBag,
  FiTag,
  FiTrash2,
  FiSmartphone,
} from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", price: 250, description: "Delivered in 3-5 business days" },
  { id: "express", label: "Express Delivery", price: 600, description: "Delivered in 1-2 business days" },
  { id: "saturday", label: "Scheduled Priority", price: 800, description: "Delivered next morning before 10 AM" },
];

const PAYMENT_METHODS = [
  { id: "online", label: "Pay Online", description: "UPI, Cards, Net Banking via Razorpay" },
  { id: "cod", label: "Cash on Delivery (COD)", description: "Pay when package arrives (+₹50 fee)" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      setKeyboardOpen(vv.height < window.innerHeight * 0.75);
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const goToStep = (n: number) => {
    setStep(n);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT" | "FREESHIP" | "">("");
  const [discountValue, setDiscountValue] = useState(0);
  const [isCouponFreeShip, setIsCouponFreeShip] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("scootfix_applied_coupon");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAppliedCoupon(data.code);
        setDiscountType(data.discountType);
        setDiscountValue(data.discountValue);
        setIsCouponFreeShip(data.freeShipping);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Calculations
  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (discountType === "PERCENT") return Math.round(cartSubtotal * (discountValue / 100));
    if (discountType === "FLAT") return Math.min(discountValue, cartSubtotal);
    return 0;
  })();

  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryOption);
  const rawShipping = selectedDelivery ? selectedDelivery.price : 0;
  const shippingCost =
    (discountedSubtotal > 5000 || isCouponFreeShip) && deliveryOption === "standard" ? 0 : rawShipping;
  const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
  const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || 18);
  const codFee = paymentMethod === "cod" ? 50 : 0;
  const estimatedTax = gstNumber
    ? Math.round((discountedSubtotal + shippingCost + codFee) * (gstRate / 100))
    : 0;
  const totalCost = discountedSubtotal + shippingCost + codFee + estimatedTax;

  const isAddressValid = () =>
    shippingAddress.name.trim() !== "" &&
    shippingAddress.phone.trim() !== "" &&
    shippingAddress.email.trim() !== "" &&
    shippingAddress.street.trim() !== "" &&
    shippingAddress.city.trim() !== "" &&
    shippingAddress.state.trim() !== "" &&
    shippingAddress.zipCode.trim() !== "";

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddressValid()) { toast.error("Please fill in all shipping fields."); return; }
    goToStep(2);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToStep(3);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setIsCouponLoading(true);
    try {
      const res = await apiFetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderAmount: cartSubtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon code.");
      } else {
        setAppliedCoupon(data.code);
        setDiscountType(data.discountType);
        setDiscountValue(data.discountValue);
        setIsCouponFreeShip(data.freeShipping);
        sessionStorage.setItem("scootfix_applied_coupon", JSON.stringify(data));
        toast.success(`✓ Coupon ${data.code} applied!`);
        setCouponInput("");
      }
    } catch {
      toast.error("Failed to validate coupon.");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(""); setDiscountType(""); setDiscountValue(0); setIsCouponFreeShip(false);
    sessionStorage.removeItem("scootfix_applied_coupon");
    toast.success("Coupon removed.");
  };

  /** Save order context to sessionStorage so the confirm page can use it */
  const savePendingOrderContext = (refId: string) => {
    const context = {
      refId,
      shippingAddress,
      paymentMethod,
      notes: `Delivery: ${selectedDelivery?.label}`,
      couponCode: appliedCoupon || null,
      deliveryOption,
      cartSnapshot: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      totals: { subtotal: cartSubtotal, discountAmount, shippingCost, codFee, tax: estimatedTax, total: totalCost },
    };
    sessionStorage.setItem("scootfix_pending_order", JSON.stringify(context));
  };

  /** COD — no Razorpay needed, create order directly */
  const handleCODOrder = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          billingAddress: null,
          paymentMethod: "cod",
          paymentId: "COD",
          notes: `Delivery: ${selectedDelivery?.label}`,
          couponCode: appliedCoupon || null,
          deliveryOption,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Checkout failed");
      }
      const order = await response.json();
      const invoiceData = {
        orderId: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        shipping: shippingAddress,
        delivery: selectedDelivery?.label,
        payment: "Cash on Delivery",
        paymentId: "COD",
        items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
        subtotal: cartSubtotal, discountAmount, shippingCost, codFee, tax: estimatedTax, total: totalCost,
      };
      sessionStorage.setItem("scootfix_latest_invoice", JSON.stringify(invoiceData));
      clearCart();
      sessionStorage.removeItem("scootfix_applied_coupon");
      toast.success("Order Placed Successfully!");
      router.push(`/order-success?id=${order.orderNumber}`);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Checkout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  /** Online — Razorpay Orders + Checkout.js modal (supports UPI, Cards, Net Banking) */
  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    try {
      // 1. Create a Razorpay Order on the server
      const res = await apiFetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalCost }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create Razorpay order");
      }

      const { razorpayOrderId, keyId } = await res.json();

      // 2. Open Razorpay Checkout modal
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(totalCost * 100),
        currency: "INR",
        name: "ScootFix",
        description: `ScootFix Order — ${cart.length} item${cart.length !== 1 ? "s" : ""}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#6366f1" },
        // Explicitly enable desired payment methods
        method: {
          upi: true,
          card: true,
          netbanking: true,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          // 3. Verify signature on server
          try {
            const verifyRes = await apiFetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Payment verification failed");
            }

            // 4. Create order in database
            const orderRes = await apiFetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shippingAddress,
                billingAddress: null,
                paymentMethod: "online",
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                notes: `Delivery: ${selectedDelivery?.label}`,
                couponCode: appliedCoupon || null,
                deliveryOption,
              }),
            });

            if (!orderRes.ok) {
              const err = await orderRes.json();
              throw new Error(err.error || "Failed to save order");
            }

            const order = await orderRes.json();

            // Save invoice data
            const invoiceData = {
              orderId: order.orderNumber,
              date: new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
              shipping: shippingAddress,
              delivery: selectedDelivery?.label,
              payment: "Paid Online (Razorpay)",
              paymentId: response.razorpay_payment_id,
              items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
              subtotal: cartSubtotal, discountAmount, shippingCost, codFee, tax: estimatedTax, total: totalCost,
            };
            sessionStorage.setItem("scootfix_latest_invoice", JSON.stringify(invoiceData));
            sessionStorage.removeItem("scootfix_applied_coupon");

            clearCart();
            toast.success("Payment verified and order placed!");
            router.push(`/order-success?id=${order.orderNumber}`);
          } catch (err: unknown) {
            toast.error((err as Error).message || "Order creation failed after payment.");
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.error("Payment cancelled.");
          },
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        toast.error(response.error.description || "Payment failed.");
        setIsLoading(false);
      });
      rzp.open();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Payment initiation failed.");
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "cod") {
      await handleCODOrder();
    } else {
      await handleRazorpayPayment();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted border border-border">
          <FiShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Checkout is Empty</h1>
        <p className="text-text-secondary mb-8">Please add EV spare parts to your cart before proceeding.</p>
        <Link href="/shop" className="block w-full">
          <Button size="lg" className="w-full">Explore catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6" ref={formRef}>

          {/* Step tabs */}
          <div className="grid grid-cols-3 gap-2 border-b border-border pb-4">
            {[
              { n: 1, label: "Address" },
              { n: 2, label: "Delivery" },
              { n: 3, label: "Payment" },
            ].map(({ n, label }) => (
              <button
                key={n}
                type="button"
                onClick={() => step > n && goToStep(n)}
                disabled={step < n}
                className={`text-left pb-2 border-b-2 transition-all ${step === n ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Step {n}</p>
                <p className="text-sm font-bold truncate">{label}</p>
              </button>
            ))}
          </div>

          {/* Step 1 — Address */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <FiMapPin className="text-primary" /> Shipping &amp; Billing Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Contact Name</label>
                  <Input type="text" value={shippingAddress.name} onChange={(e) => setShippingAddress((p) => ({ ...p, name: e.target.value }))} placeholder="Enter full name" required autoComplete="name" enterKeyHint="next" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Phone Number</label>
                  <Input type="tel" value={shippingAddress.phone} onChange={(e) => setShippingAddress((p) => ({ ...p, phone: e.target.value }))} placeholder="e.g. 9876543210" required autoComplete="tel" inputMode="tel" enterKeyHint="next" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
                  <Input type="email" value={shippingAddress.email} onChange={(e) => setShippingAddress((p) => ({ ...p, email: e.target.value }))} placeholder="name@example.com" required autoComplete="email" inputMode="email" enterKeyHint="next" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Street Address</label>
                  <Input type="text" value={shippingAddress.street} onChange={(e) => setShippingAddress((p) => ({ ...p, street: e.target.value }))} placeholder="Flat/House No, Building, Area" required autoComplete="street-address" enterKeyHint="next" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">City</label>
                  <Input type="text" value={shippingAddress.city} onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))} required autoComplete="address-level2" enterKeyHint="next" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">State</label>
                  <Input type="text" value={shippingAddress.state} onChange={(e) => setShippingAddress((p) => ({ ...p, state: e.target.value }))} required autoComplete="address-level1" enterKeyHint="next" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">ZIP / Postal Code</label>
                  <Input type="text" value={shippingAddress.zipCode} onChange={(e) => setShippingAddress((p) => ({ ...p, zipCode: e.target.value }))} required autoComplete="postal-code" inputMode="numeric" enterKeyHint="done" />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 mt-6 hidden sm:flex" rightIcon={<FiArrowRight />}>
                Continue to Delivery Options
              </Button>
              <div className="h-20 sm:hidden" />
            </form>
          )}

          {/* Step 2 — Delivery */}
          {step === 2 && (
            <form onSubmit={handleDeliverySubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <FiTruck className="text-primary" /> Select Delivery Option
              </h2>
              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const actualPrice = discountedSubtotal > 5000 && option.id === "standard" ? 0 : option.price;
                  return (
                    <label key={option.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${deliveryOption === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-surface-elevated"}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" value={option.id} checked={deliveryOption === option.id} onChange={() => setDeliveryOption(option.id)} className="w-4 h-4 text-primary focus:ring-primary border-border" />
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{option.label}</p>
                          <p className="text-xs text-text-secondary">{option.description}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-text-primary">
                        {actualPrice === 0 ? <span className="text-success uppercase font-semibold">Free</span> : formatPrice(actualPrice)}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => goToStep(1)}>Back to Address</Button>
                <Button type="submit" className="flex-1 h-12" rightIcon={<FiArrowRight />}>Continue to Payment</Button>
              </div>
            </form>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <form data-step="3" onSubmit={handlePlaceOrder} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4">
                <FiCreditCard className="text-primary" /> Select Payment Method
              </h2>

              <div className="space-y-3">
                {/* Online Payment */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border hover:bg-surface-elevated"}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-border" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiSmartphone className="text-primary" size={16} />
                      <p className="font-semibold text-sm text-text-primary">Pay Online</p>
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide">Razorpay</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      UPI, Credit / Debit Card, Net Banking &amp; Wallets — secured by Razorpay
                    </p>
                    {paymentMethod === "online" && (
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-text-muted">
                        {["UPI / QR", "Visa", "Mastercard", "RuPay", "HDFC", "ICICI", "SBI", "Wallets"].map((tag) => (
                          <span key={tag} className="px-2 py-0.5 border border-border rounded-md bg-surface">{tag}</span>
                        ))}
                      </div>
                    )}
                    {paymentMethod === "online" && (
                      <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
                        <FiLock size={11} />
                        A secure Razorpay checkout popup will open to complete payment.
                      </p>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:bg-surface-elevated"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-0.5 w-4 h-4 text-primary focus:ring-primary border-border" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiInfo className="text-warning" size={16} />
                      <p className="font-semibold text-sm text-text-primary">Cash on Delivery (COD)</p>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Pay cash or UPI directly to the delivery agent. A ₹50 convenience fee applies.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted pt-2">
                <FiLock size={12} />
                <span>All online payments processed securely by Razorpay (PCI-DSS Level 1)</span>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => goToStep(2)}>Back to Delivery</Button>
                <Button type="submit" className="flex-1 h-12 shadow-glow" isLoading={isLoading} leftIcon={<FiLock />}>
                  {paymentMethod === "cod" ? "Place Order" : `Pay ${formatPrice(totalCost)}`}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-display font-bold text-text-primary">Order Summary</h2>
            <div className="divide-y divide-border max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-text-primary shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-success/5 border border-success/15 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FiTag className="text-success shrink-0" size={16} />
                    <div>
                      <p className="text-xs font-bold text-success uppercase leading-none">{appliedCoupon}</p>
                      <p className="text-[10px] text-text-secondary mt-1">Discount Applied</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} className="p-1.5 hover:bg-danger/5 text-text-muted hover:text-danger rounded-lg transition-colors" title="Remove coupon">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input type="text" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="Enter Coupon Code" className="flex-grow px-3 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none placeholder:text-text-muted" />
                  <Button type="submit" size="sm" variant="outline" isLoading={isCouponLoading}>Apply</Button>
                </form>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="text-text-primary font-medium">{formatPrice(cartSubtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({appliedCoupon})</span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {gstNumber ? (
                <div className="flex justify-between text-text-secondary">
                  <span>Estimated GST ({gstRate}%)</span>
                  <span className="text-text-primary font-medium">{formatPrice(estimatedTax)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-text-secondary">
                  <span>Taxes &amp; Fees</span>
                  <span className="text-text-primary font-medium">Incl. in price</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span className="text-text-primary font-medium">
                  {shippingCost === 0 ? <span className="text-success font-semibold">FREE</span> : formatPrice(shippingCost)}
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-text-secondary">
                  <span>COD Fee</span>
                  <span className="text-text-primary font-medium">{formatPrice(50)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-text-primary">
              <span>Total</span>
              <span>{formatPrice(totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div
        className="sm:hidden fixed left-0 right-0 z-40 bg-surface border-t border-border px-4 py-3 shadow-lg"
        style={{ bottom: 0, paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {step === 1 && (
          <Button type="button" className="w-full h-12" rightIcon={<FiArrowRight />} onClick={() => { if (!isAddressValid()) { toast.error("Please fill in all shipping fields."); return; } goToStep(2); }}>
            Continue to Delivery Options
          </Button>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => goToStep(1)}>Back</Button>
            <Button type="button" className="flex-1 h-12" rightIcon={<FiArrowRight />} onClick={() => goToStep(3)}>Continue to Payment</Button>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => goToStep(2)}>Back</Button>
            <Button type="button" className="flex-1 h-12 shadow-glow" isLoading={isLoading} leftIcon={<FiLock />} onClick={() => { const form = document.querySelector<HTMLFormElement>('form[data-step="3"]'); form?.requestSubmit(); }}>
              {paymentMethod === "cod" ? "Place Order" : `Pay ${formatPrice(totalCost)}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
