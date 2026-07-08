"use client";

import React, { useState } from "react";
import { FiLock, FiSettings, FiBell, FiShield, FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [marketingEmails, setMarketingEmails] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API change
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8 flex items-center gap-2">
        <FiSettings className="text-primary" /> Settings
      </h1>

      <div className="space-y-8">
        
        {/* Profile Settings */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
            <FiBell className="text-primary" /> Notification Settings
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={orderUpdates} 
                onChange={() => setOrderUpdates(!orderUpdates)} 
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" 
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">Order Status Updates</p>
                <p className="text-xs text-text-secondary">Get real-time emails and SMS notifications on shipping and delivery updates.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={marketingEmails} 
                onChange={() => setMarketingEmails(!marketingEmails)} 
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" 
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">Offers & Newsletter</p>
                <p className="text-xs text-text-secondary">Receive product updates, seasonal sales, and discount coupons.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <form onSubmit={handlePasswordChange} className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-display font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
            <FiShield className="text-primary" /> Security & Password
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Current Password</label>
              <Input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                leftIcon={<FiLock />}
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">New Password</label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                leftIcon={<FiLock />}
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Confirm New Password</label>
              <Input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                leftIcon={<FiLock />}
                required 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 shadow-glow" 
            isLoading={isLoading}
          >
            Update Password
          </Button>
        </form>

      </div>
    </div>
  );
}
