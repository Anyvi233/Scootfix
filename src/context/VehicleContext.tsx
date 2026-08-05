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
  isCompatible: (productCompatibility: { vehicleId: string, vehicleModel: { brand: string, model: string, yearStart: number, yearEnd: number } }[]) => { compatible: boolean; reason: string };
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

  const selectVehicle = React.useCallback((vehicle: SelectedVehicle) => {
    setSelectedVehicle(vehicle);
    localStorage.setItem("scootfix_vehicle", JSON.stringify(vehicle));
  }, []);

  const clearVehicle = React.useCallback(() => {
    setSelectedVehicle(null);
    localStorage.removeItem("scootfix_vehicle");
  }, []);

  // Check if a product fits the selected vehicle
  const isCompatible = React.useCallback((productCompatibility: { vehicleId: string, vehicleModel: { brand: string, model: string, yearStart: number, yearEnd: number } }[]) => {
    if (!selectedVehicle) {
      return { compatible: true, reason: "No vehicle selected" };
    }

    const match = productCompatibility.find((comp) => {
      let brandName = "";
      let modelName = "";
      let yearsString = "";

      const data = comp as any;
      if (data.vehicleModel) {
        // Prisma DB format
        brandName = data.vehicleModel.brand?.name || data.vehicleModel.brand || "";
        modelName = data.vehicleModel.name || data.vehicleModel.model || "";
        const start = data.yearStart || data.vehicleModel.yearStart;
        const end = data.yearEnd || data.vehicleModel.yearEnd || new Date().getFullYear();
        yearsString = `${start}-${end}`;
      } else {
        // Fallback format
        brandName = data.brand || "";
        modelName = data.model || "";
        yearsString = data.years || "";
      }

      const brandMatch = brandName.toLowerCase().includes(selectedVehicle.brand.toLowerCase()) ||
                         selectedVehicle.brand.toLowerCase().includes(brandName.toLowerCase());

      const modelMatch = selectedVehicle.model.toLowerCase().includes(modelName.toLowerCase()) || 
                         modelName.toLowerCase().includes(selectedVehicle.model.toLowerCase());
      
      let yearMatch = false;
      const vehicleYear = parseInt(selectedVehicle.year);
      
      if (yearsString.includes("-")) {
        const [start, end] = yearsString.split("-").map((y: string) => parseInt(y.trim()));
        yearMatch = vehicleYear >= start && vehicleYear <= (end || new Date().getFullYear());
      } else if (yearsString) {
        yearMatch = parseInt(yearsString.trim()) === vehicleYear;
      } else {
        yearMatch = true;
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
  }, [selectedVehicle]);

  const value = React.useMemo(() => ({
    selectedVehicle,
    selectVehicle,
    clearVehicle,
    isCompatible,
  }), [selectedVehicle, selectVehicle, clearVehicle, isCompatible]);

  return (
    <VehicleContext.Provider value={value}>
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
