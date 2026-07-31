"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FiUser, FiMail, FiMapPin, FiPhone, FiPackage, FiEdit, FiLogOut } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { useVehicle } from "@/context/VehicleContext";

// Mock address book
const MOCK_ADDRESSES = [
  { id: 1, type: "Home", name: "Anu V.", phone: "+91 9876543210", address: "123 Green Valley, Sector 45", city: "Bengaluru", state: "Karnataka", zip: "560001", default: true },
  { id: 2, type: "Work", name: "Anu V.", phone: "+91 9876543210", address: "Tech Hub, Block C, 4th Floor", city: "Bengaluru", state: "Karnataka", zip: "560103", default: false }
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const { selectedVehicle } = useVehicle();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback to mock session if not logged in for visual showcase
  const userName = session?.user?.name || "Anu V.";
  const userEmail = session?.user?.email || "anu@example.com";

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center animate-pulse text-text-muted">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <h1 className="text-3xl font-display font-bold text-text-primary mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-xl p-6 h-fit space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary font-bold text-3xl">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{userName}</h2>
              <p className="text-xs text-text-muted">Customer Account</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-text-secondary">
              <FiMail className="text-text-muted" />
              <span className="truncate">{userEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <FiPhone className="text-text-muted" />
              <span>+91 98765 43210</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Link href="/settings" className="block w-full">
              <Button variant="outline" className="w-full" leftIcon={<FiEdit />}>
                Edit Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-danger/30 hover:border-danger hover:bg-danger/5 text-danger transition-colors"
              leftIcon={<FiLogOut />}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Info Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Saved Vehicles Card */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-text-primary text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Saved Vehicle
            </h3>
            {selectedVehicle ? (
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-border rounded-lg">
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                  </p>
                  <p className="text-xs text-text-secondary">Variant: {selectedVehicle.variant}</p>
                </div>
                <Link href="/vehicle-compatibility">
                  <Button size="sm" variant="outline">Change</Button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-between items-center p-3 bg-surface-elevated border border-dashed border-border rounded-lg text-sm text-text-secondary">
                <span>No active vehicle saved. Select one to enable compatibility alerts.</span>
                <Link href="/vehicle-compatibility">
                  <Button size="sm">Select Vehicle</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Quick Stats / Orders Redirect */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FiPackage size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Your Orders</h3>
                <p className="text-sm text-text-secondary">Track shipping, returns, and history</p>
              </div>
            </div>
            <Link href="/orders">
              <Button>View Order History</Button>
            </Link>
          </div>

          {/* Address Book */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-text-primary">Address Book</h2>
              <Button variant="outline" size="sm">Add Address</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`bg-surface border rounded-xl p-5 space-y-3 relative ${addr.default ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}>
                  {addr.default && (
                    <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Default
                    </span>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-text-muted" size={16} />
                      <h4 className="font-semibold text-text-primary">{addr.type} Address</h4>
                    </div>
                    <p className="text-sm text-text-primary font-medium">{addr.name}</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {addr.address}, <br />
                      {addr.city}, {addr.state} - {addr.zip}
                    </p>
                    <p className="text-sm text-text-secondary">{addr.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
