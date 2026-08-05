"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { FiTrendingUp, FiShoppingBag, FiUsers, FiPackage, FiBarChart2, FiRefreshCw } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#6366f1",
  PROCESSING: "#3b82f6",
  SHIPPED: "#8b5cf6",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
};

function KpiCard({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: React.ElementType, color: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: { color: string, name: string, value: number }[], label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-text-primary mb-1">{label}</p>
      {payload.map((p, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === "Revenue" ? formatPrice(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminReportsPage() {
  const [data, setData] = useState<{ kpis?: Record<string, number>, revenueByMonth?: { month: string, revenue: number }[], topProducts?: { name: string, units: number }[], statusBreakdown?: { status: string, count: number }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json());
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Could not load analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const revenueByMonth = data?.revenueByMonth || [];
  const topProducts = data?.topProducts || [];
  const statusBreakdown = data?.statusBreakdown || [];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiBarChart2 className="text-primary" /> Reports & Performance Analytics
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Live data from your database — updated on every load.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-sm font-semibold rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatPrice(kpis.totalRevenue)} icon={FiTrendingUp} color="bg-primary/10 text-primary" />
        <KpiCard label="Total Orders" value={kpis.totalOrders?.toLocaleString()} icon={FiShoppingBag} color="bg-success/10 text-success" />
        <KpiCard label="Customers" value={kpis.totalCustomers?.toLocaleString()} icon={FiUsers} color="bg-warning/10 text-warning" />
        <KpiCard label="Products" value={kpis.totalProducts?.toLocaleString()} icon={FiPackage} color="bg-info/10 text-info" />
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-bold text-sm text-text-primary mb-6">📈 Revenue Trend (Last 6 Months)</h3>
        {revenueByMonth.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted text-sm">
            No order data yet — place some orders to see the chart!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row — Top Products + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products Bar Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm text-text-primary mb-6">🏆 Top 5 Products by Units Sold</h3>
          {topProducts.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-text-muted text-sm">No sales data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} width={120} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="units" name="Units Sold" radius={[0, 6, 6, 0]}>
                  {topProducts.map((_, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-bold text-sm text-text-primary mb-6">🥧 Order Status Breakdown</h3>
          {statusBreakdown.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-text-muted text-sm">No order data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusBreakdown.map((entry, i: number) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                {/* @ts-expect-error Recharts type mismatch */}
                <Tooltip formatter={(v: number) => [`${v} orders`, ""]} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: "#94a3b8" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
