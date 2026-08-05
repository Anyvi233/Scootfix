"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash, FiSearch, FiFileText, FiTag, FiAlertCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", price: "", stock: "", category: "", brand: "" });

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        throw new Error("Failed to load products");
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      console.error(err);
      setError((err instanceof Error ? err.message : "An error occurred") || "An error occurred while loading catalog products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      toast.error("Please fill in required fields.");
      return;
    }

    try {
      const res = await apiFetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newProduct.name,
          sku: newProduct.sku,
          price: newProduct.price,
          stock: newProduct.stock,
          categoryName: newProduct.category,
          brandName: newProduct.brand
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      toast.success("Product added successfully!");
      setNewProduct({ name: "", sku: "", price: "", stock: "", category: "", brand: "" });
      setShowAddForm(false);
      fetchProducts();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to deactivate this product?")) return;

    try {
      const res = await apiFetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deactivated successfully");
      fetchProducts();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Failed to deactivate product");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/5 border border-danger/10 text-danger rounded-xl text-sm">
        <p className="font-semibold">Error Loading Products</p>
        <p className="mt-1">{error}</p>
        <button onClick={fetchProducts} className="mt-3 text-xs bg-danger/10 hover:bg-danger/20 text-danger px-3 py-1.5 rounded font-semibold transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Products & Spares Inventory</h1>
          <p className="text-xs text-text-secondary mt-1">Manage catalog listings, base prices, categories, and stock thresholds.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} leftIcon={<FiPlus />}>
          {showAddForm ? "View Inventory" : "Add Spare Part"}
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm ? (
        <form onSubmit={handleAddProduct} className="bg-surface border border-border rounded-xl p-6 space-y-4 max-w-xl shadow-xs">
          <h3 className="font-bold text-sm text-text-primary mb-3">New Spare Part Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-text-secondary uppercase">Product Name</label>
              <Input type="text" value={newProduct.name} onChange={e => setNewProduct(p=>({...p, name: e.target.value}))} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">SKU Reference</label>
              <Input type="text" value={newProduct.sku} onChange={e => setNewProduct(p=>({...p, sku: e.target.value}))} placeholder="e.g. BAT-72V" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Base Price (INR)</label>
              <Input type="number" value={newProduct.price} onChange={e => setNewProduct(p=>({...p, price: e.target.value}))} placeholder="e.g. 2999" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Stock Count</label>
              <Input type="number" value={newProduct.stock} onChange={e => setNewProduct(p=>({...p, stock: e.target.value}))} placeholder="e.g. 50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Category</label>
              <Input type="text" value={newProduct.category} onChange={e => setNewProduct(p=>({...p, category: e.target.value}))} placeholder="e.g. Bearings" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase">Brand</label>
              <Input type="text" value={newProduct.brand} onChange={e => setNewProduct(p=>({...p, brand: e.target.value}))} placeholder="e.g. Scootfix Genuine" />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 mt-4">Save Part Details</Button>
        </form>
      ) : (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="relative max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-xs"
            />
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated text-text-muted uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-3.5">Spare Part Description</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5 text-right">Price</th>
                  <th className="px-6 py-3.5 text-center">Stock</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Brand</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="text-text-secondary hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-text-primary max-w-xs truncate">{p.name}</td>
                    <td className="px-6 py-3.5 font-mono text-xs">{p.sku}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-text-primary">{formatPrice(p.price)}</td>
                    <td className="px-6 py-3.5 text-center font-bold">
                      <span className={p.stock <= 5 ? "text-danger" : "text-text-primary"}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-semibold">{p.category}</td>
                    <td className="px-6 py-3.5 text-xs">{p.brand}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.isActive ? "bg-success/10 text-success border border-success/20" : "bg-text-secondary/10 text-text-secondary border border-border"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:text-danger transition-colors"
                          title="Deactivate Product"
                          disabled={!p.isActive}
                        >
                          <FiTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
