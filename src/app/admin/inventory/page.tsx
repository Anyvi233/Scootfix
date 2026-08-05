"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice, cn } from "@/lib/utils";
import { 
  FiAlertTriangle, FiCheckCircle, FiClock, FiSearch, 
  FiRefreshCw, FiTrendingUp, FiArchive, FiX, FiPlus, FiArrowDownLeft
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);

  // Restock Form States
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockProductId, setRestockProductId] = useState("");
  const [restockQty, setRestockQty] = useState("10");
  const [restockReason, setRestockReason] = useState("Supplier Shipment");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockCost, setRestockCost] = useState("");
  const [restockPrice, setRestockPrice] = useState("");
  const [isSubmittingRestock, setIsSubmittingRestock] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      } else {
        console.error("Failed to load inventory");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openRestockModal = (product?: import("@prisma/client").Product) => {
    if (product) {
      setRestockProductId(product.id);
      setRestockSupplier(product.supplier || "");
      setRestockCost(String(product.purchasePrice || ""));
      setRestockPrice(String(product.price || ""));
      setRestockReason("Supplier Shipment");
    } else {
      setRestockProductId("");
      setRestockSupplier("");
      setRestockCost("");
      setRestockPrice("");
      setRestockReason("Supplier Shipment");
    }
    setRestockQty("10");
    setIsRestockOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) {
      toast.error("Please select a product.");
      return;
    }
    const change = parseInt(restockQty);
    if (isNaN(change) || change === 0) {
      toast.error("Please enter a valid non-zero quantity.");
      return;
    }

    setIsSubmittingRestock(true);
    try {
      const res = await apiFetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: restockProductId,
          change,
          reason: restockReason,
          supplier: restockSupplier || undefined,
          purchasePrice: restockCost ? parseFloat(restockCost) : undefined,
          price: restockPrice ? parseFloat(restockPrice) : undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to adjust stock.");
      }

      toast.success("Inventory adjusted successfully!");
      setIsRestockOpen(false);
      fetchInventory();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "An error occurred.");
    } finally {
      setIsSubmittingRestock(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    (item.barcode && item.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiArchive className="text-primary" /> Inventory Management
          </h1>
          <p className="text-text-secondary mt-1">Track stock levels, compute profits, and view historical movements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory} disabled={isLoading} leftIcon={<FiRefreshCw className={isLoading ? "animate-spin" : ""} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => openRestockModal()}>Restock Item</Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary uppercase">Total Value (Cost)</h3>
          <p className="text-2xl font-bold text-text-primary mt-2">
            {formatPrice(inventory.reduce((sum, item) => sum + (item.purchasePrice * item.stock), 0))}
          </p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary uppercase">Potential Revenue</h3>
          <p className="text-2xl font-bold text-success mt-2">
            {formatPrice(inventory.reduce((sum, item) => sum + (item.price * item.stock), 0))}
          </p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm">
          <h3 className="text-sm font-semibold text-text-secondary uppercase">Low Stock Alerts</h3>
          <p className="text-2xl font-bold text-danger mt-2 flex items-center gap-2">
            {inventory.filter(i => i.stock <= i.lowStockThreshold).length} items
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-elevated shrink-0">
          <div className="w-full max-w-sm">
            <Input 
              placeholder="Search by name, SKU, or Barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<FiSearch />}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background-elevated sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border">Product</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border">Stock Status</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border">Supplier</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border text-right">Cost Price</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border text-right">Selling Price</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border text-right">Unit Profit</th>
                <th className="px-6 py-4 font-semibold text-text-secondary border-b border-border text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLowStock = item.stock <= item.lowStockThreshold;
                  const profit = item.price - item.purchasePrice;
                  
                  return (
                    <tr key={item.id} className="hover:bg-background-elevated/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 relative bg-background rounded-md overflow-hidden shrink-0 border border-border">
                            {item.images?.[0]?.url ? (
                              <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-text-muted">No IMG</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-primary line-clamp-1 max-w-[200px]">{item.name}</p>
                            <p className="text-xs text-text-secondary font-mono mt-0.5">SKU: {item.sku}</p>
                            {item.barcode && <p className="text-[10px] text-text-muted font-mono mt-0.5">BC: {item.barcode}</p>}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-bold text-base">{item.stock}</span>
                          {isLowStock ? (
                            <Badge variant="danger" className="text-[10px] px-1.5 py-0">Low Stock (≤{item.lowStockThreshold})</Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0">Healthy</Badge>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-text-secondary">
                        {item.supplier || <span className="text-text-muted italic">Unassigned</span>}
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-text-secondary">
                        {formatPrice(item.purchasePrice)}
                      </td>
                      
                      <td className="px-6 py-4 text-right font-medium text-text-primary">
                        {formatPrice(item.price)}
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-semibold text-success">
                          <FiTrendingUp size={14} />
                          {formatPrice(profit)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => openRestockModal(item)}
                            className="p-2 text-text-muted hover:text-success hover:bg-success/10 rounded-full transition-colors"
                            title="Adjust Stock / Restock"
                          >
                            <FiPlus size={18} />
                          </button>
                          <button 
                            onClick={() => setSelectedHistory(item)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            title="View Stock History"
                          >
                            <FiClock size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal Overlay */}
      <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedHistory(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-border bg-background-elevated">
                <div>
                  <h3 className="font-bold text-text-primary">Stock History</h3>
                  <p className="text-xs text-text-secondary truncate max-w-[300px]">{selectedHistory.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedHistory(null)}
                  className="p-2 text-text-secondary hover:text-danger rounded-full hover:bg-danger/10 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto">
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {selectedHistory.inventoryLogs && selectedHistory.inventoryLogs.length > 0 ? (
                    selectedHistory.inventoryLogs.map((log: any) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          {log.change > 0 ? <FiTrendingUp size={14} /> : <FiArchive size={14} />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background-elevated p-4 rounded-xl border border-border shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn("font-bold", log.change > 0 ? "text-success" : "text-danger")}>
                              {log.change > 0 ? "+" : ""}{log.change} Units
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">{log.reason}</p>
                          {log.user && <p className="text-[10px] text-text-muted mt-2 italic">By: {log.user.name}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-text-secondary relative z-10 bg-surface">
                      No historical stock logs found for this item.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restock/Stock Adjustment Modal Overlay */}
      <AnimatePresence>
        {isRestockOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsRestockOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-border bg-background-elevated">
                <div>
                  <h3 className="font-bold text-text-primary">Adjust Stock / Restock</h3>
                  <p className="text-xs text-text-secondary">Perform warehouse inventory adjustments and price overrides.</p>
                </div>
                <button 
                  onClick={() => setIsRestockOpen(false)}
                  className="p-2 text-text-secondary hover:text-danger rounded-full hover:bg-danger/10 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleRestockSubmit} className="p-5 space-y-4 overflow-y-auto">
                {/* Product Dropdown/Selector */}
                {!inventory.find(p => p.id === restockProductId) ? (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Select Product</label>
                    <select 
                      value={restockProductId}
                      onChange={(e) => {
                        const prod = inventory.find(p => p.id === e.target.value);
                        if (prod) {
                          setRestockProductId(prod.id);
                          setRestockSupplier(prod.supplier || "");
                          setRestockCost(String(prod.purchasePrice || ""));
                          setRestockPrice(String(prod.price || ""));
                        }
                      }}
                      required
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                    >
                      <option value="">-- Choose Product --</option>
                      {inventory.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3.5 bg-background-elevated border border-border rounded-xl flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] font-bold text-text-muted uppercase">Selected Product</span>
                      <span className="font-semibold text-sm text-text-primary line-clamp-1 max-w-[280px]">
                        {inventory.find(p => p.id === restockProductId)?.name}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setRestockProductId("")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* Adjustment Count */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Quantity Change</label>
                    <input 
                      type="number"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                      placeholder="e.g. 10 or -3"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">Positive for restock, negative for write-off.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Adjustment Reason</label>
                    <select
                      value={restockReason}
                      onChange={(e) => setRestockReason(e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                    >
                      <option value="Supplier Shipment">Supplier Shipment</option>
                      <option value="Inventory Audit">Inventory Audit</option>
                      <option value="Damaged Item">Damaged / Written off</option>
                      <option value="Customer Return">Customer Return</option>
                    </select>
                  </div>
                </div>

                {/* Price Details */}
                <div className="border-t border-border pt-4 mt-2 space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Overrides & Supplier Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Supplier Name</label>
                      <input 
                        type="text"
                        value={restockSupplier}
                        onChange={(e) => setRestockSupplier(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                        placeholder="e.g. Ather Genuine OEM"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Cost Price (₹)</label>
                      <input 
                        type="number"
                        step="0.01"
                        value={restockCost}
                        onChange={(e) => setRestockCost(e.target.value)}
                        className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                        placeholder="e.g. 1500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Selling Price (₹)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={restockPrice}
                      onChange={(e) => setRestockPrice(e.target.value)}
                      className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none"
                      placeholder="e.g. 2100"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-border mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRestockOpen(false)} disabled={isSubmittingRestock}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSubmittingRestock}>
                    Apply Adjustment
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
