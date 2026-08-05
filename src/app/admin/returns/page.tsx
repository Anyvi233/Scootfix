"use client";

import React, { useState, useEffect } from "react";
import { FiRefreshCw, FiPackage, FiCheck, FiX, FiClock, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { apiFetch } from "@/lib/api-client";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  REQUESTED:  { label: "Requested",  color: "bg-info/10 text-info border-info/20" },
  PROCESSING: { label: "Processing", color: "bg-warning/10 text-warning border-warning/20" },
  APPROVED:   { label: "Approved",   color: "bg-success/10 text-success border-success/20" },
  REJECTED:   { label: "Rejected",   color: "bg-danger/10 text-danger border-danger/20" },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<import("@/types/models").ReturnWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resolutionMap, setResolutionMap] = useState<Record<string, string>>({});

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/returns");
      if (res.ok) {
        const data = await res.json();
        setReturns(data);
        // Pre-fill resolutions with defaults
        const map: Record<string, string> = {};
        data.forEach((r: import("@/types/models").ReturnWithItems) => { map[r.id] = r.resolution || ""; });
        setResolutionMap(map);
      }
    } catch (e) {
      toast.error("Failed to load returns.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReturns(); }, []);

  const handleAction = async (returnId: string, status: "APPROVED" | "REJECTED" | "PROCESSING") => {
    setUpdatingId(returnId);
    try {
      const res = await apiFetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId, status, resolution: resolutionMap[returnId] || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (status === "APPROVED") {
        toast.success("✅ Return approved & stock restocked!");
      } else if (status === "REJECTED") {
        toast.error("Return rejected.");
      } else {
        toast.success("Status updated.");
      }

      setReturns(prev => prev.map(r => r.id === returnId ? { ...r, status, resolution: resolutionMap[returnId] } : r));
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Failed to update return.");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: returns.length,
    requested: returns.filter(r => r.status === "REQUESTED").length,
    approved: returns.filter(r => r.status === "APPROVED").length,
    rejected: returns.filter(r => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiPackage className="text-primary" /> Returns & Refund Manager
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Review return requests, approve refunds, and automatically restock items.</p>
        </div>
        <button
          onClick={fetchReturns}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-text-primary" },
          { label: "Pending Review", value: stats.requested, color: "text-info" },
          { label: "Approved", value: stats.approved, color: "text-success" },
          { label: "Rejected", value: stats.rejected, color: "text-danger" },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Returns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl text-text-muted">
          <FiPackage className="mx-auto mb-4" size={40} />
          <p className="text-sm">No return requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => {
            const isExpanded = expandedId === ret.id;
            const isUpdating = updatingId === ret.id;
            const statusConf = STATUS_CONFIG[ret.status] || STATUS_CONFIG.REQUESTED;
            const isPending = ret.status === "REQUESTED" || ret.status === "PROCESSING";

            return (
              <div key={ret.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
                {/* Row */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Return ID</p>
                      <p className="font-mono font-semibold text-text-primary text-xs">{ret.id.slice(0, 12)}...</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Customer</p>
                      <p className="font-medium text-text-primary truncate">{ret.user?.name || "Customer"}</p>
                      <p className="text-[10px] text-text-muted truncate">{ret.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Order</p>
                      <p className="font-mono text-text-primary font-semibold">{ret.order?.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Date</p>
                      <p className="text-text-primary">{new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusConf.color}`}>
                      {statusConf.label}
                    </span>

                    {isPending && (
                      <>
                        <button
                          onClick={() => handleAction(ret.id, "APPROVED")}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success hover:bg-success/90 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          {isUpdating ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck size={12} />}
                          Approve & Restock
                        </button>
                        <button
                          onClick={() => handleAction(ret.id, "REJECTED")}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger hover:bg-danger/90 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <FiX size={12} /> Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : ret.id)}
                      className="p-1.5 border border-border rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Return details */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Return Reason</h3>
                            <p className="text-sm font-semibold text-text-primary">{ret.reason}</p>
                            {ret.description && <p className="text-sm text-text-secondary mt-1">{ret.description}</p>}
                          </div>

                          <div>
                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Items to Return</h3>
                            <div className="space-y-2">
                              {ret.items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm p-3 bg-background-elevated border border-border rounded-xl">
                                  <div>
                                    <p className="font-medium text-text-primary">{item.orderItem?.name}</p>
                                    <p className="text-xs text-text-muted">Qty: {item.quantity} × {formatPrice(item.orderItem?.price)}</p>
                                  </div>
                                  <p className="font-bold text-text-primary">{formatPrice((item.orderItem?.price || 0) * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Resolution notes */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-2">Resolution Note</h3>
                            <textarea
                              value={resolutionMap[ret.id] || ""}
                              onChange={e => setResolutionMap(prev => ({ ...prev, [ret.id]: e.target.value }))}
                              rows={4}
                              placeholder="Add a resolution message sent to the customer..."
                              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                            />
                          </div>

                          {ret.status === "APPROVED" && (
                            <div className="p-3 bg-success/5 border border-success/20 rounded-xl text-success text-xs">
                              <p className="font-bold">✅ Stock Restocked</p>
                              <p className="mt-0.5 opacity-80">All returned items have been added back to inventory with full audit trail.</p>
                            </div>
                          )}
                          {ret.status === "REJECTED" && ret.resolution && (
                            <div className="p-3 bg-danger/5 border border-danger/20 rounded-xl text-danger text-xs">
                              <p className="font-bold">Resolution:</p>
                              <p className="mt-0.5">{ret.resolution}</p>
                            </div>
                          )}

                          {isPending && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(ret.id, "APPROVED")}
                                disabled={isUpdating}
                                className="flex-1 py-2.5 bg-success hover:bg-success/90 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                              >
                                ✅ Approve & Restock
                              </button>
                              <button
                                onClick={() => handleAction(ret.id, "REJECTED")}
                                disabled={isUpdating}
                                className="flex-1 py-2.5 bg-danger hover:bg-danger/90 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
