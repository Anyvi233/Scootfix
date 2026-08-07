"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FiStar, FiTrash2, FiRefreshCw, FiCheckCircle, FiXCircle,
  FiSearch, FiFilter, FiMessageSquare, FiAlertTriangle
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "FLAGGED"] as const;
type StatusTab = typeof STATUS_TABS[number];

const STAR_COLORS = ["", "text-danger", "text-orange-400", "text-warning", "text-lime-500", "text-success"];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={`w-3.5 h-3.5 fill-current ${n <= rating ? "text-warning" : "text-border fill-border"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (!res.ok) throw new Error("Failed to load reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Could not load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Filter logic
  useEffect(() => {
    let result = [...reviews];
    if (activeTab === "PENDING") result = result.filter((r) => !r.isApproved && !r.isFlagged);
    else if (activeTab === "APPROVED") result = result.filter((r) => r.isApproved);
    else if (activeTab === "FLAGGED") result = result.filter((r) => r.isFlagged);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(q) ||
          r.product?.name?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q) ||
          r.title?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [reviews, activeTab, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this review?")) return;
    setDeletingId(id);
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted.");
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "An error occurred") || "Could not delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFlag = async (id: string, isFlagged: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFlagged: !isFlagged }),
      });
      if (!res.ok) throw new Error();
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFlagged: !isFlagged } : r))
      );
      toast.success(isFlagged ? "Flag removed." : "Review flagged for review.");
    } catch {
      toast.error("Failed to update flag.");
    }
  };

  const stats = {
    total: reviews.length,
    verified: reviews.filter((r) => r.isVerified).length,
    flagged: reviews.filter((r) => r.isFlagged).length,
    avgRating:
      reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : "–",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <FiMessageSquare className="text-primary" /> Reviews Moderation
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Monitor, flag, and remove customer product reviews.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border text-text-primary text-sm font-semibold rounded-xl hover:bg-surface-elevated transition-colors"
        >
          <FiRefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: stats.total, color: "text-text-primary" },
          { label: "Avg Rating", value: stats.avgRating, color: "text-warning" },
          { label: "Verified Buyers", value: stats.verified, color: "text-success" },
          { label: "Flagged", value: stats.flagged, color: "text-danger" },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by customer, product, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Tab filters */}
        <div className="flex items-center bg-surface border border-border rounded-xl p-1 gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl text-text-muted">
          <FiMessageSquare className="mx-auto mb-4" size={40} />
          <p className="text-sm">No reviews found{search ? " matching your search" : ""}.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-elevated border-b border-border">
                <th className="px-5 py-3 text-left text-[10px] uppercase font-bold tracking-widest text-text-muted">Customer</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase font-bold tracking-widest text-text-muted">Product</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase font-bold tracking-widest text-text-muted">Rating</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase font-bold tracking-widest text-text-muted">Review</th>
                <th className="px-5 py-3 text-left text-[10px] uppercase font-bold tracking-widest text-text-muted">Date</th>
                <th className="px-5 py-3 text-center text-[10px] uppercase font-bold tracking-widest text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((review) => (
                <tr
                  key={review.id}
                  className={`hover:bg-surface-elevated/50 transition-colors ${
                    review.isFlagged ? "bg-danger/3 border-l-2 border-l-danger" : ""
                  }`}
                >
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                        {review.user?.image ? (
                          <Image src={review.user.image} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                          (review.user?.name || "?").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate max-w-[120px]">
                          {review.user?.name || "Customer"}
                        </p>
                        {review.isVerified && (
                          <span className="text-[9px] font-bold text-success uppercase tracking-wider">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-text-primary truncate max-w-[160px]">
                      {review.product?.name || "–"}
                    </p>
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <StarRow rating={review.rating} />
                      <span className={`text-xs font-bold ${STAR_COLORS[review.rating]}`}>
                        {review.rating}/5
                      </span>
                    </div>
                  </td>

                  {/* Review content */}
                  <td className="px-5 py-4 max-w-xs">
                    {review.title && (
                      <p className="font-semibold text-text-primary text-xs mb-1 line-clamp-1">{review.title}</p>
                    )}
                    <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                      {review.comment || <span className="italic text-text-muted">No comment</span>}
                    </p>
                    {review.helpfulCount > 0 && (
                      <p className="text-[10px] text-text-muted mt-1">👍 {review.helpfulCount} found helpful</p>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-text-secondary">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Flag toggle */}
                      <button
                        onClick={() => handleFlag(review.id, review.isFlagged)}
                        title={review.isFlagged ? "Remove flag" : "Flag as inappropriate"}
                        className={`p-2 rounded-lg border transition-colors ${
                          review.isFlagged
                            ? "bg-danger/10 border-danger/20 text-danger"
                            : "border-border text-text-muted hover:text-warning hover:border-warning/30 hover:bg-warning/5"
                        }`}
                      >
                        <FiAlertTriangle size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        title="Delete review"
                        className="p-2 rounded-lg border border-border text-text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-colors disabled:opacity-50"
                      >
                        {deletingId === review.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-border bg-surface-elevated/30 text-xs text-text-muted">
            Showing {filtered.length} of {reviews.length} reviews
          </div>
        </div>
      )}
    </div>
  );
}
