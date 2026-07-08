"use client";

import React, { useState } from "react";
import { FiPlus, FiTag, FiPercent, FiTrash } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

const MOCK_COUPONS = [
  { id: "1", code: "EVSTART10", discount: "10% OFF", type: "PERCENTAGE", active: true },
  { id: "2", code: "SCOOT15", discount: "15% OFF", type: "PERCENTAGE", active: true },
  { id: "3", code: "FREESHIP", discount: "Free Shipping", type: "SHIPPING", active: true },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount: "", type: "PERCENTAGE" });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) {
      toast.error("Please fill in coupon details");
      return;
    }

    const item = {
      id: String(coupons.length + 1),
      code: newCoupon.code.trim().toUpperCase(),
      discount: newCoupon.type === "PERCENTAGE" ? `${newCoupon.discount}% OFF` : "Free Shipping",
      type: newCoupon.type,
      active: true
    };

    setCoupons([...coupons, item]);
    setNewCoupon({ code: "", discount: "", type: "PERCENTAGE" });
    toast.success("Coupon code generated successfully!");
  };

  const handleRemove = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast.success("Coupon deactivated.");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Coupons & Offer Campaigns</h1>
        <p className="text-xs text-text-secondary mt-1">Configure active promo code limits, seasonal sales campaigns, and discount parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Creation Box */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4 md:col-span-1">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5"><FiPlus className="text-primary"/> Create Coupon</h3>
          <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-text-secondary uppercase">Promo Code</label>
              <Input type="text" value={newCoupon.code} onChange={e => setNewCoupon(p=>({...p, code: e.target.value}))} placeholder="e.g. DIWALI20" required />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary uppercase">Campaign Type</label>
              <select 
                value={newCoupon.type} 
                onChange={e => setNewCoupon(p=>({...p, type: e.target.value}))}
                className="w-full h-10 px-3 bg-background border border-border rounded-md text-text-primary focus:outline-none"
              >
                <option value="PERCENTAGE">Percentage Discount</option>
                <option value="SHIPPING">Free Shipping</option>
              </select>
            </div>
            {newCoupon.type === "PERCENTAGE" && (
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Discount Percent (%)</label>
                <Input type="number" min="1" max="100" value={newCoupon.discount} onChange={e => setNewCoupon(p=>({...p, discount: e.target.value}))} placeholder="e.g. 20" required />
              </div>
            )}
            <Button type="submit" size="sm" className="w-full h-10 mt-2">Generate Promo</Button>
          </form>
        </div>

        {/* List Box */}
        <div className="bg-surface border border-border rounded-xl p-6 md:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5"><FiTag className="text-primary"/> Active Promo Codes ({coupons.length})</h3>
          
          <div className="divide-y divide-border">
            {coupons.map(c => (
              <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-text-primary font-mono text-sm tracking-wider">{c.code}</p>
                  <p className="text-text-secondary font-semibold text-[10px] uppercase text-text-muted">{c.type} Campaign</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-lg">
                    {c.discount}
                  </span>
                  <button onClick={() => handleRemove(c.id)} className="p-2 text-text-muted hover:text-danger"><FiTrash size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
