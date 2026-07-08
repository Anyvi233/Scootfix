"use client";

import React, { useState } from "react";
import { FiSettings, FiSliders, FiDatabase, FiLock } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
  const [taxPercent, setTaxPercent] = useState("18");
  const [gatewayName, setGatewayName] = useState("Razorpay Sandbox");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
          <FiSettings className="text-primary"/> Console Settings
        </h1>
        <p className="text-xs text-text-secondary mt-1">Configure global commerce taxes, webhook secrets, payment keys, and backup rules.</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-xl p-6 space-y-6">
        
        {/* Commerce config */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5"><FiSliders className="text-primary"/> Commerce Variables</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Default GST Rate (%)</label>
              <Input type="number" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Payment Gateway Provider</label>
              <Input type="text" value={gatewayName} onChange={e => setGatewayName(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Database secrets */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5"><FiDatabase className="text-primary"/> Integration Secrets</h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Razorpay Live API Key</label>
              <Input type="password" value="rzp_live_secret_key_12345" disabled />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">BlueDart Shipping API URL</label>
              <Input type="text" value="https://api.bluedart.com/v1/shipments" disabled />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 shadow-glow mt-4" isLoading={isLoading}>
          Save Global Variables
        </Button>

      </form>

    </div>
  );
}
