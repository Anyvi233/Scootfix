"use client";

import React, { useState } from "react";
import { FiPlus, FiLink, FiCheck, FiTrash, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

const MOCK_VEHICLES = [
  { id: "v1", brand: "Ather", model: "450X", variant: "Gen 3", year: "2023" },
  { id: "v2", brand: "Ola", model: "S1 Pro", variant: "Gen 2", year: "2024" },
];

const MOCK_MAPPINGS = [
  { id: "m1", productName: "Lithium Ion Battery Pack (72V 30Ah)", vehicle: "Ather 450X (Gen 3)", notes: "Requires custom harness" },
  { id: "m2", productName: "Premium Ceramic Brake Pads Set", vehicle: "Ather 450X (Gen 3)", notes: "Standard installation" },
  { id: "m3", productName: "All-Weather Tubeless Tire (12-inch)", vehicle: "Ola S1 Pro (Gen 2)", notes: "Standard installation" },
];

export default function AdminCompatibilityPage() {
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [mappings, setMappings] = useState(MOCK_MAPPINGS);

  const [newVehicle, setNewVehicle] = useState({ brand: "", model: "", variant: "", year: "" });
  const [newMapping, setNewMapping] = useState({ product: "", vehicle: "", notes: "" });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.variant || !newVehicle.year) {
      toast.error("Please fill in all vehicle parameters.");
      return;
    }
    const item = { id: String(vehicles.length + 1), ...newVehicle };
    setVehicles([...vehicles, item]);
    setNewVehicle({ brand: "", model: "", variant: "", year: "" });
    toast.success("Vehicle Model configured!");
  };

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapping.product || !newMapping.vehicle) {
      toast.error("Please configure the product & vehicle links.");
      return;
    }
    const item = { 
      id: String(mappings.length + 1), 
      productName: newMapping.product,
      vehicle: newMapping.vehicle,
      notes: newMapping.notes || "Standard fitment"
    };
    setMappings([...mappings, item]);
    setNewMapping({ product: "", vehicle: "", notes: "" });
    toast.success("Compatibility Mapping Saved!");
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Vehicle Models & Compatibility Config</h1>
        <p className="text-xs text-text-secondary mt-1">Configure make details, variants, and link active spare parts catalog compatibility mappings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Vehicle Models Panel */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-text-primary">Add Brand Vehicle Configuration</h3>
            <form onSubmit={handleAddVehicle} className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Brand</label>
                <Input type="text" value={newVehicle.brand} onChange={e => setNewVehicle(p=>({...p, brand: e.target.value}))} placeholder="e.g. TVS" required />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Model</label>
                <Input type="text" value={newVehicle.model} onChange={e => setNewVehicle(p=>({...p, model: e.target.value}))} placeholder="e.g. iQube" required />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Variant</label>
                <Input type="text" value={newVehicle.variant} onChange={e => setNewVehicle(p=>({...p, variant: e.target.value}))} placeholder="e.g. ST" required />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Year Range</label>
                <Input type="text" value={newVehicle.year} onChange={e => setNewVehicle(p=>({...p, year: e.target.value}))} placeholder="e.g. 2024" required />
              </div>
              <Button type="submit" size="sm" className="col-span-2 h-10 mt-2">Save Model</Button>
            </form>
          </div>

          {/* Active Vehicles List */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-text-primary">Active Vehicle Models ({vehicles.length})</h3>
            <div className="divide-y divide-border text-xs">
              {vehicles.map(v => (
                <div key={v.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-text-secondary">
                  <div>
                    <span className="font-bold text-text-primary">{v.brand} {v.model}</span>
                    <span className="text-text-muted ml-2">{v.variant} &bull; {v.year}</span>
                  </div>
                  <button className="text-text-muted hover:text-danger"><FiTrash size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Compatibility Mapping Editor */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5"><FiLink className="text-primary"/> Create Compatibility Map</h3>
            <form onSubmit={handleAddMapping} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Select Spare Part Product</label>
                <select 
                  value={newMapping.product} 
                  onChange={e => setNewMapping(p=>({...p, product: e.target.value}))}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-text-primary focus:outline-none"
                  required
                >
                  <option value="">Choose Part...</option>
                  <option>Lithium Ion Battery Pack (72V 30Ah)</option>
                  <option>Premium Ceramic Brake Pads Set</option>
                  <option>All-Weather Tubeless Tire (12-inch)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Select Vehicle Model</label>
                <select 
                  value={newMapping.vehicle} 
                  onChange={e => setNewMapping(p=>({...p, vehicle: e.target.value}))}
                  className="w-full h-10 px-3 bg-background border border-border rounded-md text-text-primary focus:outline-none"
                  required
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={`${v.brand} ${v.model} (${v.variant})`}>{v.brand} {v.model} ({v.variant})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary uppercase">Fitment Notes (Optional)</label>
                <Input type="text" value={newMapping.notes} onChange={e => setNewMapping(p=>({...p, notes: e.target.value}))} placeholder="e.g. Require adapter kit" />
              </div>
              <Button type="submit" size="sm" className="w-full h-10 mt-2">Save Mapping Rules</Button>
            </form>
          </div>

          {/* Active Mappings Feed */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-text-primary">Current Verification Mappings ({mappings.length})</h3>
            <div className="divide-y divide-border text-xs">
              {mappings.map(m => (
                <div key={m.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-text-secondary">
                  <div>
                    <p className="font-semibold text-text-primary">{m.productName}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Compatible with: <strong className="text-primary">{m.vehicle}</strong></p>
                    <p className="text-[10px] text-text-muted italic mt-0.5">Note: {m.notes}</p>
                  </div>
                  <button className="text-text-muted hover:text-danger"><FiTrash size={14}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
