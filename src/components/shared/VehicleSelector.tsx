"use client";

import React, { useState } from "react";
import { useVehicle, SelectedVehicle } from "@/context/VehicleContext";
import { Button } from "@/components/ui/Button";
import { FiCheck, FiX, FiInfo } from "react-icons/fi";

const VEHICLE_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  Ather: {
    "450X": {
      "Gen 3 (72V)": ["2022", "2023", "2024", "2025"],
      "Gen 2 (48V)": ["2020", "2021"]
    },
    "450S": {
      "Standard": ["2023", "2024", "2025"]
    }
  },
  Ola: {
    "S1 Pro": {
      "Gen 2": ["2023", "2024", "2025"],
      "Gen 1": ["2021", "2022"]
    },
    "S1 Air": {
      "Standard": ["2023", "2024"]
    }
  },
  TVS: {
    "iQube": {
      "ST": ["2023", "2024", "2025"],
      "Standard": ["2020", "2021", "2022", "2023", "2024"]
    }
  },
  Bajaj: {
    "Chetak": {
      "Premium": ["2020", "2021", "2022", "2023", "2024", "2025"],
      "Urbane": ["2023", "2024"]
    }
  }
};

export function VehicleSelector({ onComplete }: { onComplete?: () => void }) {
  const { selectedVehicle, selectVehicle, clearVehicle } = useVehicle();

  const [brand, setBrand] = useState(selectedVehicle?.brand || "");
  const [model, setModel] = useState(selectedVehicle?.model || "");
  const [variant, setVariant] = useState(selectedVehicle?.variant || "");
  const [year, setYear] = useState(selectedVehicle?.year || "");

  const brands = Object.keys(VEHICLE_DATA);
  const models = brand ? Object.keys(VEHICLE_DATA[brand] || {}) : [];
  const variants = (brand && model) ? Object.keys(VEHICLE_DATA[brand][model] || {}) : [];
  const years = (brand && model && variant) ? VEHICLE_DATA[brand][model][variant] || [] : [];

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrand(e.target.value);
    setModel("");
    setVariant("");
    setYear("");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
    setVariant("");
    setYear("");
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVariant(e.target.value);
    setYear("");
  };

  const handleApply = () => {
    if (brand && model && variant && year) {
      selectVehicle({ brand, model, variant, year });
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {selectedVehicle && (
        <div className="p-3 bg-success/10 border border-success/20 text-success rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <FiCheck />
            <span>Active Vehicle: <strong>{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</strong></span>
          </div>
          <button 
            onClick={() => {
              clearVehicle();
              setBrand("");
              setModel("");
              setVariant("");
              setYear("");
            }} 
            className="text-xs underline font-semibold hover:text-danger"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Brand */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Brand</label>
          <select 
            value={brand} 
            onChange={handleBrandChange}
            className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select Brand...</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Model */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Model</label>
          <select 
            value={model} 
            onChange={handleModelChange}
            disabled={!brand}
            className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select Model...</option>
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Variant */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Variant</label>
          <select 
            value={variant} 
            onChange={handleVariantChange}
            disabled={!model}
            className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select Variant...</option>
            {variants.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-secondary uppercase">Year</label>
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            disabled={!variant}
            className="w-full h-11 px-3 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select Year...</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button 
          onClick={handleApply} 
          disabled={!brand || !model || !variant || !year}
          className="w-full sm:w-auto"
        >
          Apply Vehicle Filter
        </Button>
      </div>
    </div>
  );
}
