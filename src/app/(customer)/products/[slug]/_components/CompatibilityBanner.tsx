"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useVehicle } from "@/context/VehicleContext";

interface CompatibilityBannerProps {
  compatibilities: Record<string, unknown>[];
}

/**
 * Shows a verified-fit or compatibility-warning banner
 * based on the user's currently selected vehicle.
 */
export function CompatibilityBanner({ compatibilities }: CompatibilityBannerProps) {
  const { selectedVehicle, isCompatible } = useVehicle();

  if (!selectedVehicle) {
    return (
      <aside
        className="p-4 rounded-xl border border-border bg-surface-elevated text-text-secondary text-sm flex items-start gap-3 mb-6"
        aria-label="Vehicle compatibility check"
      >
        <span className="text-lg leading-none mt-0.5" aria-hidden="true">ℹ</span>
        <div>
          <p className="font-semibold">Check Compatibility</p>
          <p className="text-xs text-text-muted mt-0.5">
            Select your scooter model in the shop filters sidebar to verify fit.
          </p>
        </div>
      </aside>
    );
  }

  const { compatible, reason } = isCompatible(compatibilities as any);

  return (
    <aside
      className={cn(
        "p-4 rounded-xl border text-sm flex items-start gap-3 mb-6",
        compatible
          ? "bg-success/5 border-success/20 text-success"
          : "bg-danger/5 border-danger/20 text-danger"
      )}
      role="status"
      aria-live="polite"
      aria-label={compatible ? "Verified fit for your vehicle" : "Compatibility warning for your vehicle"}
    >
      <span className="text-lg leading-none mt-0.5" aria-hidden="true">
        {compatible ? "✓" : "⚠"}
      </span>
      <div>
        <p className="font-semibold">{compatible ? "Verified Fit" : "Compatibility Warning"}</p>
        <p className="text-xs opacity-90 mt-0.5">{reason}</p>
      </div>
    </aside>
  );
}
