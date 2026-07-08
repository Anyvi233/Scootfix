"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCreditCard, FiLock, FiTruck, FiArrowRight, FiMapPin, FiInfo, FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";

const DELIVERY_OPTIONS = [
  { id: "standard", label: "Standard Delivery", price: 250, description: "Delivered in 3-5 business days" },
  { id: "express", label: "Express Delivery", price: 600, description: "Delivered in 1-2 business days" },
  { id: "saturday", label: "Scheduled Priority", price: 800, description: "Delivered next morning before 10 AM" },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / QR Code", description: "Scan QR code or enter UPI ID" },
  { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, RuPay, Maestro" },
  { id: "netbanking", label: "Net Banking", description: "All major Indian banks supported" },
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
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
  });
  const [upiId, setUpiId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Address check
  const isAddressValid = () => {
    return (
      shippingAddress.name.trim() !== "" &&
      shippingAddress.phone.trim() !== "" &&
      shippingAddress.email.trim() !== "" &&
      shippingAddress.street.trim() !== "" &&
      shippingAddress.city.trim() !== "" &&
      shippingAddress.state.trim() !== "" &&
      shippingAddress.zipCode.trim() !== ""
    );
  };

  // Calculations
  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.id === deliveryOption);
  const rawShipping = selectedDelivery ? selectedDelivery.price : 0;
  const shippingCost = cartSubtotal > 5000 && deliveryOption === "standard" ? 0 : rawShipping;
  const codFee = paymentMethod === "cod" ? 50 : 0;
  const estimatedTax = Math.round((cartSubtotal + shippingCost + codFee) * 0.18); // 18% GST
  const totalCost = cartSubtotal + shippingCost + codFee + estimatedTax;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddressValid()) {
      toast.error("Please fill in all shipping fields.");
      return;
    }
    setStep(2);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc)) {
      toast.error("Please fill in card details");
      return;
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. user@okaxis)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            email: shippingAddress.email,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
          },
          billingAddress: null,
          paymentMethod,
          paymentId: paymentMethod === "upi" ? upiId : paymentMethod === "card" ? "CARD-SIMULATED" : "COD-SIMULATED",
          notes: `Delivery: ${selectedDelivery?.label}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const order = await response.json();
      toast.success("Order Placed Successfully!");
      
      // Save order metadata to sessionStorage to render the printable invoice on order success page
      const invoiceData = {
        orderId: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
        shipping: shippingAddress,
        delivery: selectedDelivery?.label,
        payment: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label,
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        subtotal: cartSubtotal,
        shippingCost,
        codFee,
        tax: estimatedTax,
        total: totalCost
      };
      
      sessionStorage.setItem("scootfix_latest_invoice", JSON.stringify(invoiceData));
      
      clearCart();
      router.push(`/order-success?id=${order.orderNumber}`);
    } catch (e: any) {
      toast.error(e.message || "Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted border border-border">
          <FiShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Checkout is Empty</h1>
        <p className="text-text-secondary mb-8">Please add EV spare parts to your cart before proceeding to checkout.</p>
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
        
        {/* Checkout Wizard Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step Headers */}
          <div className="grid grid-cols-3 gap-2 border-b border-border pb-4">
            <button 
              onClick={() => step > 1 && setStep(1)}
              className={`text-left pb-2 border-b-2 transition-all ${step === 1 ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Step 1</p>
              <p className="text-sm font-bold truncate">Address</p>
            </button>
            <button 
              onClick={() => step > 2 && setStep(2)}
              className={`text-left pb-2 border-b-2 transition-all ${step === 2 ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
              disabled={step < 2}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Step 2</p>
              <p className="text-sm font-bold truncate">Delivery</p>
            </button>
            <button 
              className={`text-left pb-2 border-b-2 transition-all ${step === 3 ? "border-primary text-primary" : "border-transparent text-text-secondary"}`}
              disabled={step < 3}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Step 3</p>
              <p className="text-sm font-bold truncate">Payment</p>
            </button>
          </div>

          {/* STEP 1: Address Details */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4"><FiMapPin className="text-primary"/> Shipping & Billing Address</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Contact Name</label>
                  <Input 
                    type="text" 
                    value={shippingAddress.name} 
                    onChange={e => setShippingAddress(p => ({ ...p, name: e.target.value }))}
                    placeholder="Enter full name" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Phone Number</label>
                  <Input 
                    type="tel" 
                    value={shippingAddress.phone} 
                    onChange={e => setShippingAddress(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g. 9876543210" 
                    required 
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
                  <Input 
                    type="email" 
                    value={shippingAddress.email} 
                    onChange={e => setShippingAddress(p => ({ ...p, email: e.target.value }))}
                    placeholder="name@example.com" 
                    required 
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Street Address</label>
                  <Input 
                    type="text" 
                    value={shippingAddress.street} 
                    onChange={e => setShippingAddress(p => ({ ...p, street: e.target.value }))}
                    placeholder="Flat/House No, Building, Area" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">City</label>
                  <Input 
                    type="text" 
                    value={shippingAddress.city} 
                    onChange={e => setShippingAddress(p => ({ ...p, city: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">State</label>
                  <Input 
                    type="text" 
                    value={shippingAddress.state} 
                    onChange={e => setShippingAddress(p => ({ ...p, state: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase">ZIP / Postal Code</label>
                  <Input 
                    type="text" 
                    value={shippingAddress.zipCode} 
                    onChange={e => setShippingAddress(p => ({ ...p, zipCode: e.target.value }))}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 mt-6" rightIcon={<FiArrowRight />}>
                Continue to Delivery Options
              </Button>
            </form>
          )}

          {/* STEP 2: Delivery Options */}
          {step === 2 && (
            <form onSubmit={handleDeliverySubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4"><FiTruck className="text-primary"/> Select Delivery Option</h2>

              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const actualPrice = cartSubtotal > 5000 && option.id === "standard" ? 0 : option.price;
                  return (
                    <label 
                      key={option.id}
                      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${deliveryOption === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-surface-elevated"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="delivery" 
                          value={option.id} 
                          checked={deliveryOption === option.id}
                          onChange={() => setDeliveryOption(option.id)}
                          className="w-4 h-4 text-primary focus:ring-primary border-border" 
                        />
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{option.label}</p>
                          <p className="text-xs text-text-secondary">{option.description}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-text-primary">
                        {actualPrice === 0 ? <span className="text-success uppercase">Free</span> : formatPrice(actualPrice)}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                  Back to Address
                </Button>
                <Button type="submit" className="flex-1 h-12" rightIcon={<FiArrowRight />}>
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Payment Section */}
          {step === 3 && (
            <form onSubmit={handlePlaceOrder} className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-4"><FiCreditCard className="text-primary"/> Select Payment Method</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Method selector */}
                <div className="md:col-span-1 flex flex-col gap-2">
                  {PAYMENT_METHODS.map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`text-left p-3 border rounded-xl text-xs font-semibold transition-all ${paymentMethod === method.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-surface-elevated text-text-primary"}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Method details fields */}
                <div className="md:col-span-2 border border-border rounded-xl p-4 bg-background">
                  {paymentMethod === "upi" && (
                    <div className="space-y-4">
                      <p className="text-xs text-text-secondary">Enter your virtual payment address (VPA) to receive a push payment request on your UPI app.</p>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-text-secondary uppercase">UPI ID</label>
                        <Input 
                          type="text" 
                          placeholder="e.g. name@upi" 
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-text-secondary uppercase">Card Number</label>
                        <Input 
                          type="text" 
                          placeholder="4111 2222 3333 4444" 
                          value={cardDetails.number}
                          onChange={e => setCardDetails(p => ({ ...p, number: e.target.value }))}
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-text-secondary uppercase">Expiry Date</label>
                          <Input 
                            type="text" 
                            placeholder="MM/YY" 
                            value={cardDetails.expiry}
                            onChange={e => setCardDetails(p => ({ ...p, expiry: e.target.value }))}
                            required 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-text-secondary uppercase">CVV</label>
                          <Input 
                            type="password" 
                            placeholder="•••" 
                            maxLength={3}
                            value={cardDetails.cvc}
                            onChange={e => setCardDetails(p => ({ ...p, cvc: e.target.value }))}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-3">
                      <p className="text-xs text-text-secondary">Select your bank from the list below. You will be redirected to your bank's secure page to complete the transaction.</p>
                      <select className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="space-y-2 flex items-start gap-2.5 text-warning p-3 bg-warning/5 border border-warning/10 rounded-lg">
                      <FiInfo className="shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold">Cash on Delivery (COD)</p>
                        <p className="text-[11px] opacity-90 leading-normal">Pay cash/UPI directly to the delivery agent. A standard COD convenience fee of **₹50** applies to this shipment.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex gap-4 pt-8">
                <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
                  Back to Delivery
                </Button>
                <Button type="submit" className="flex-1 h-12 shadow-glow" isLoading={isLoading} leftIcon={<FiLock />}>
                  Pay {formatPrice(totalCost)}
                </Button>
              </div>
            </form>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-display font-bold text-text-primary">Order Summary</h2>

            {/* Cart Items list */}
            <div className="divide-y divide-border max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-text-primary shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="text-text-primary font-medium">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Estimated GST (18%)</span>
                <span className="text-text-primary font-medium">{formatPrice(estimatedTax)}</span>
              </div>
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
    </div>
  );
}
