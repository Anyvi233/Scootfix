"use client";

import React, { useState, useEffect } from "react";
import { FiTrendingUp, FiShoppingBag, FiUsers, FiAlertTriangle, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/overview");
        if (!res.ok) {
          throw new Error("Failed to load overview data");
        }
        const overviewData = await res.json();
        setData(overviewData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching system statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

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
        <p className="font-semibold">Error Loading Overview</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts } = data || { stats: {}, recentOrders: [], lowStockProducts: [] };

  const STATS_CARDS = [
    { label: "Total Revenue", value: stats.totalRevenue || 0, isPrice: true, trend: "Live Data", isPositive: true, icon: FiTrendingUp, color: "text-success bg-success/10" },
    { label: "Completed Orders", value: stats.completedOrders || 0, isPrice: false, trend: "Live Data", isPositive: true, icon: FiShoppingBag, color: "text-primary bg-primary/10" },
    { label: "Total Customers", value: stats.totalCustomers || 0, isPrice: false, trend: "Live Data", isPositive: true, icon: FiUsers, color: "text-info bg-info/10" },
    { label: "Low-Stock Alerts", value: stats.lowStockAlerts || 0, isPrice: false, trend: stats.lowStockAlerts > 0 ? "Needs Attention" : "All Good", isPositive: stats.lowStockAlerts === 0, icon: FiAlertTriangle, color: stats.lowStockAlerts > 0 ? "text-danger bg-danger/10 animate-pulse" : "text-success bg-success/10" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Heading */}
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">System Statistics Overview</h1>
        <p className="text-xs text-text-secondary mt-1">Real-time performance analytics of the ScootFix EV spares engine.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {stat.isPrice ? formatPrice(stat.value) : stat.value}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold">
                  {stat.isPositive ? (
                    <span className="text-success flex items-center"><FiArrowUpRight className="mr-0.5" />{stat.trend}</span>
                  ) : (
                    <span className="text-danger flex items-center"><FiArrowDownRight className="mr-0.5" />{stat.trend}</span>
                  )}
                  <span className="text-text-muted font-normal">since launch</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity Logs */}
        <div className="bg-surface border border-border rounded-xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-semibold text-sm text-text-primary">Recent Orders Feed</h3>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
          </div>

          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">No orders placed yet.</p>
            ) : (
              recentOrders.map((ord: any) => (
                <div key={ord.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-text-primary font-mono">{ord.id}</p>
                    <p className="text-text-secondary">{ord.name} &bull; <span className="text-text-muted">{ord.item}</span></p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-text-primary">{formatPrice(ord.total)}</p>
                    <p className="text-text-muted font-medium">{ord.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watch */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-sm text-text-primary border-b border-border pb-3">Low-Stock Watchlist</h3>
          
          <div className="space-y-3.5">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-text-muted py-6 text-center">All products are well stocked!</p>
            ) : (
              lowStockProducts.map((p: any, idx: number) => (
                <div key={idx} className="p-3 bg-danger/5 border border-danger/10 rounded-lg space-y-1">
                  <p className="text-xs font-semibold text-text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-text-secondary font-medium">SKU: {p.sku} &bull; <span className="text-danger font-bold">Only {p.stock} left</span></p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
