"use client";

import React, { useState } from "react";
import { FiTrendingUp, FiDownload, FiBarChart2, FiCalendar, FiPieChart, FiDollarSign } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";

const REVENUE_BY_MONTH = [
  { month: "Jan", revenue: 45000, orders: 120 },
  { month: "Feb", revenue: 52000, orders: 142 },
  { month: "Mar", revenue: 49000, orders: 130 },
  { month: "Apr", revenue: 63000, orders: 175 },
  { month: "May", revenue: 58000, orders: 160 },
  { month: "Jun", revenue: 75000, orders: 210 },
];

const BESTSELLERS = [
  { id: "1", name: "High-Capacity Lithium Ion Battery Pack (72V 30Ah)", sales: 48, revenue: 1679952 },
  { id: "2", name: "Premium Ceramic Brake Pads Set", sales: 124, revenue: 161076 },
  { id: "3", name: "All-Weather Tubeless Tire (12-inch)", sales: 86, revenue: 214914 },
];

const CATEGORY_SHARE = [
  { category: "Batteries", percentage: 45, color: "bg-primary" },
  { category: "Brakes", percentage: 25, color: "bg-success" },
  { category: "Tires", percentage: 15, color: "bg-warning" },
  { category: "Wiring & Harnesses", percentage: 15, color: "bg-info" },
];

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("6m");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExporting(false);
    toast.success("CSV Report download started!");
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiBarChart2 className="text-primary"/> Reports & Performance Analytics
          </h1>
          <p className="text-xs text-text-secondary mt-1">Export transaction logs, trace customer acquisitions, and analyze EV parts category distributions.</p>
        </div>
        
        <div className="flex gap-3">
          <select 
            value={timeRange} 
            onChange={e => setTimeRange(e.target.value)}
            className="h-10 px-3 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none"
          >
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          
          <Button onClick={handleExport} size="sm" isLoading={isExporting} leftIcon={<FiDownload />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics chart panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart SVG Mock */}
        <div className="bg-surface border border-border rounded-xl p-6 lg:col-span-2 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <FiDollarSign className="text-success"/> Revenue Trend Line
          </h3>
          
          {/* Simulated chart */}
          <div className="h-64 border-b border-border flex items-end justify-between pt-8 pb-2 px-4 relative">
            
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-border/30 border-dashed" />
            <div className="absolute inset-x-0 top-2/4 border-t border-border/30 border-dashed" />
            <div className="absolute inset-x-0 top-3/4 border-t border-border/30 border-dashed" />

            {REVENUE_BY_MONTH.map((item, idx) => {
              const maxVal = 80000;
              const heightPercent = `${(item.revenue / maxVal) * 100}%`;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative z-10">
                  <div 
                    className="w-10 bg-primary/20 hover:bg-primary border-t-2 border-primary rounded-t-sm transition-all duration-300 relative cursor-pointer"
                    style={{ height: heightPercent }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border shadow-md rounded px-2 py-1 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-text-primary">
                      {formatPrice(item.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted mt-2 font-medium">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <FiPieChart className="text-primary"/> Category Revenue Share
          </h3>

          <div className="space-y-4">
            {CATEGORY_SHARE.map((c, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-text-secondary">{c.category}</span>
                  <span className="text-text-primary">{c.percentage}%</span>
                </div>
                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bestselling items Table */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="font-bold text-sm text-text-primary">Bestselling EV Spare Parts</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted uppercase text-[10px] font-bold tracking-wider pb-2">
                <th className="pb-3">Spare Part</th>
                <th className="pb-3 text-center">Units Sold</th>
                <th className="pb-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {BESTSELLERS.map((item, idx) => (
                <tr key={idx} className="text-text-secondary">
                  <td className="py-3.5 font-medium text-text-primary">{item.name}</td>
                  <td className="py-3.5 text-center font-bold">{item.sales} units</td>
                  <td className="py-3.5 text-right font-bold text-text-primary">{formatPrice(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
