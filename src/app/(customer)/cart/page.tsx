"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag, FiTag, FiTruck, FiHeart, FiClock, FiLoader } from "react-icons/fi";
import { useCart, CartItem } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";
import { apiFetch } from "@/lib/api-client";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, addToCart, cartSubtotal, cartCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDescription, setCouponDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FLAT" | "FREESHIP">("PERCENT");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isCouponFreeShip, setIsCouponFreeShip] = useState(false);
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [saveForLater, setSaveForLater] = useState<CartItem[]>([]);

  // Load Save For Later list
  useEffect(() => {
    const saved = localStorage.getItem("scootfix_sfl");
    if (saved) {
      try {
        setSaveForLater(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load active coupon from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("scootfix_applied_coupon");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAppliedCoupon(data.code);
        setDiscountType(data.discountType);
        setDiscountValue(data.discountValue);
        setDiscountAmount(data.discountAmount);
        setIsCouponFreeShip(data.freeShipping);
        setCouponDescription(data.description || "");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSflList = (list: CartItem[]) => {
    setSaveForLater(list);
    localStorage.setItem("scootfix_sfl", JSON.stringify(list));
  };

  // Move item from active cart to Save For Later
  const handleSaveForLater = (item: CartItem) => {
    const updatedSfl = [...saveForLater.filter(i => i.id !== item.id), item];
    saveSflList(updatedSfl);
    removeFromCart(item.id);
    toast.success(`${item.name} moved to Save for Later.`);
  };

  // Move item from Save For Later back to Cart
  const handleMoveToCart = (item: CartItem) => {
    addToCart(item, item.quantity);
    const updatedSfl = saveForLater.filter(i => i.id !== item.id);
    saveSflList(updatedSfl);
  };

  // Remove item from Save For Later
  const handleRemoveFromSfl = (id: string) => {
    const updatedSfl = saveForLater.filter(i => i.id !== id);
    saveSflList(updatedSfl);
    toast.success("Item removed from Save for Later.");
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
        setDiscountAmount(data.discountAmount);
        setIsCouponFreeShip(data.freeShipping);
        setCouponDescription(data.description || "");
        sessionStorage.setItem("scootfix_applied_coupon", JSON.stringify(data));
        toast.success(`✓ Coupon ${data.code} applied! ${data.discountLabel}`);
      }
    } catch (err) {
      toast.error("Failed to validate coupon. Please try again.");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setDiscountType("PERCENT");
    setDiscountValue(0);
    setDiscountAmount(0);
    setIsCouponFreeShip(false);
    setCouponDescription("");
    setCouponInput("");
    sessionStorage.removeItem("scootfix_applied_coupon");
    toast.success("Coupon removed.");
  };

  // GST — only active when a real GSTIN is configured in .env
  const gstNumber = process.env.NEXT_PUBLIC_GST_NUMBER || "";
  const gstRate = Number(process.env.NEXT_PUBLIC_GST_RATE || 18);

  // Calculations
  const discountedSubtotal = cartSubtotal - discountAmount;
  const shippingCost = discountedSubtotal > 5000 || isCouponFreeShip ? 0 : 250;
  const estimatedTax = gstNumber ? Math.round(discountedSubtotal * (gstRate / 100)) : 0;
  const totalCost = discountedSubtotal + shippingCost + estimatedTax;

  // Estimated delivery dates (Current date + 3 to 5 days)
  const getDeliveryRange = () => {
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 3);
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 5);

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${minDelivery.toLocaleDateString("en-US", options)} - ${maxDelivery.toLocaleDateString("en-US", options)}`;
  };

  if (!mounted) {
    return null;
  }

  if (cart.length === 0 && saveForLater.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted border border-border">
          <FiShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-3">Your Cart is Empty</h1>
        <p className="text-text-secondary mb-8">
          Explore our extensive catalog of EV batteries, brakes, chargers, and custom vehicle components.
        </p>
        <Link href="/shop">
          <Button size="lg" className="w-full">
            Shop Spare Parts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart list & Save For Later */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Cart */}
          {cart.length > 0 ? (
            <div className="space-y-4">
              <div className="border-b border-border pb-3 flex justify-between">
                <span className="text-sm font-semibold text-text-secondary uppercase">Active Items ({cartCount})</span>
              </div>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface border border-border rounded-xl gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Product Info */}
                    <div className="flex gap-4 items-center min-w-0">
                      <div
                        className="w-20 h-20 bg-background rounded-lg border border-border bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-semibold text-text-primary hover:text-primary transition-colors block line-clamp-1 text-sm md:text-base"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-text-primary text-sm">{formatPrice(item.price)}</span>
                          {item.compareAtPrice && (
                            <span className="text-xs text-text-muted line-through">{formatPrice(item.compareAtPrice)}</span>
                          )}
                        </div>
                        {/* Shipping status */}
                        <p className="text-[11px] text-success font-medium flex items-center gap-1 mt-1">
                          <FiTruck size={12} /> Eligible for Fast Delivery
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Action Deck */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-border rounded-lg bg-background h-9">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 text-text-muted hover:text-text-primary transition-colors h-full"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 text-text-muted hover:text-text-primary transition-colors h-full"
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-text-primary text-right min-w-[70px] text-sm md:text-base">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        
                        <div className="flex gap-1 border-l border-border pl-3">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            className="p-2 text-text-muted hover:text-primary transition-colors"
                            title="Save for Later"
                          >
                            <FiClock size={16} />
                          </button>
                          <button
                            onClick={() => toggleWishlist({ ...item, category: "EV Part" })}
                            className={`p-2 transition-colors ${isInWishlist(item.id) ? "text-danger" : "text-text-muted hover:text-danger"}`}
                            title="Add to Wishlist"
                          >
                            <FiHeart size={16} className={isInWishlist(item.id) ? "fill-current" : ""} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-text-muted hover:text-danger transition-colors"
                            title="Remove"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-border rounded-xl bg-surface/50 text-center text-sm text-text-secondary">
              No active items in cart.
            </div>
          )}

          {/* Save For Later List */}
          {saveForLater.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text-secondary uppercase">Saved For Later ({saveForLater.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {saveForLater.map((item) => (
                  <div key={item.id} className="bg-surface border border-border rounded-xl p-4 flex gap-3 hover:shadow-md transition-shadow">
                    <div 
                      className="w-16 h-16 bg-background border border-border rounded-lg bg-cover bg-center shrink-0" 
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="min-w-0 flex flex-col justify-between flex-grow">
                      <div>
                        <h4 className="font-semibold text-text-primary text-xs truncate">{item.name}</h4>
                        <p className="text-xs font-bold text-text-primary mt-1">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleMoveToCart(item)}
                          className="text-[11px] font-semibold text-primary hover:underline"
                        >
                          Move to Cart
                        </button>
                        <span className="text-border">|</span>
                        <button 
                          onClick={() => handleRemoveFromSfl(item.id)}
                          className="text-[11px] font-semibold text-text-muted hover:text-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Summary & Checkout */}
        {cart.length > 0 && (
          <div className="space-y-4">
            
            {/* Promo Box */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5"><FiTag className="text-primary"/> Apply Promo Coupon</h3>
              {appliedCoupon ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg text-success text-xs">
                    <div>
                      <p className="font-bold">✓ {appliedCoupon} Applied</p>
                      {couponDescription && <p className="opacity-80 mt-0.5">{couponDescription}</p>}
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-text-muted font-semibold hover:text-danger underline ml-4 shrink-0">Remove</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. SCOOT15, FLAT200"
                      className="flex-grow h-10 px-3 bg-background border border-border rounded-md text-xs text-text-primary uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                      disabled={isCouponLoading}
                    />
                    <Button type="submit" variant="outline" size="sm" className="h-10 min-w-[70px]" disabled={isCouponLoading}>
                      {isCouponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  <p className="text-[10px] text-text-muted">Try: EVSTART10 · SCOOT15 · FREESHIP · FLAT200 · BIGBUY20</p>
                </form>
              )}
            </div>

            {/* Calculations Card */}
            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-xl font-display font-bold text-text-primary">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="text-text-primary font-medium">{formatPrice(cartSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-danger font-medium">
                    <span>
                      {discountType === "PERCENT" ? `Coupon Discount (${discountValue}%)` :
                       discountType === "FLAT" ? `Coupon Discount (₹${discountValue} off)` :
                       "Coupon Discount"}
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {gstNumber && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Estimated GST ({gstRate}%)</span>
                    <span className="text-text-primary font-medium">{formatPrice(estimatedTax)}</span>
                  </div>
                )}
                {!gstNumber && (
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
                {shippingCost > 0 && (
                  <p className="text-[10px] text-text-muted text-right">
                    Free shipping on orders above {formatPrice(5000)}
                  </p>
                )}
              </div>

              {/* Delivery Estimation */}
              <div className="p-3 bg-surface-elevated border border-border rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <FiClock className="text-primary"/> Delivery Range:
                </div>
                <p className="text-text-secondary pl-5 font-medium">{getDeliveryRange()}</p>
              </div>

              <div className="border-t border-border pt-4 flex justify-between font-bold text-lg text-text-primary">
                <span>Total</span>
                <span>{formatPrice(totalCost)}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full h-12 shadow-glow font-semibold" rightIcon={<FiArrowRight />}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
