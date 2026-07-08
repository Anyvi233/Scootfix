"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface SelectedVehicle {
  brand: string;
  model: string;
  variant: string;
  year: string;
}

interface VehicleContextType {
  selectedVehicle: SelectedVehicle | null;
  selectVehicle: (vehicle: SelectedVehicle) => void;
  clearVehicle: () => void;
  isCompatible: (productCompatibility: { brand: string; model: string; years: string }[]) => { compatible: boolean; reason: string };
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [selectedVehicle, setSelectedVehicle] = useState<SelectedVehicle | null>(null);

  // Load selected vehicle from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scootfix_vehicle");
    if (saved) {
      try {
        setSelectedVehicle(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse selected vehicle", e);
      }
    }
  }, []);

  const selectVehicle = (vehicle: SelectedVehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("scootfix_vehicle", JSON.stringify(vehicle));
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
    localStorage.removeItem("scootfix_vehicle");
  };

  // Check if a product fits the selected vehicle
  const isCompatible = (productCompatibility: { brand: string; model: string; years: string }[]) => {
    if (!selectedVehicle) {
      return { compatible: true, reason: "No vehicle selected" };
    }

    const match = productCompatibility.find((comp) => {
      const brandMatch = comp.brand.toLowerCase() === selectedVehicle.brand.toLowerCase();
      // Simple partial matching for models e.g., "450X" matching "450X (Gen 3)"
      const modelMatch = selectedVehicle.model.toLowerCase().includes(comp.model.toLowerCase()) || 
                         comp.model.toLowerCase().includes(selectedVehicle.model.toLowerCase());
      
      // Years check (e.g. "2020-2025" or "2022")
      let yearMatch = false;
      const vehicleYear = parseInt(selectedVehicle.year);
      
      if (comp.years.includes("-")) {
        const [start, end] = comp.years.split("-").map(y => parseInt(y.trim()));
        yearMatch = vehicleYear >= start && vehicleYear <= (end || new Date().getFullYear());
      } else {
        yearMatch = parseInt(comp.years.trim()) === vehicleYear;
      }

      return brandMatch && modelMatch && yearMatch;
    });

    if (match) {
      return { compatible: true, reason: `Fits your ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` };
    }

    return { 
      compatible: false, 
      reason: `Warning: This part is not verified to fit your ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})` 
    };
  };

  return (
    <VehicleContext.Provider
      value={{
        selectedVehicle,
        selectVehicle,
        clearVehicle,
        isCompatible,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return context;
}
