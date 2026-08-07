"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { ReviewForm } from "./ReviewForm";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api-client";

interface ReviewsSectionProps {
  productId: string;
  initialCount?: number;
  initialRating?: number;
}

/**
 * Lazy-loaded reviews section: shows rating summary, distribution chart,
 * write-a-review toggle, reviews feed, and pagination.
 *
 * Heavy — intentionally loaded via React.lazy() from ProductDetailsClient.
 */
export function ReviewsSection({ productId, initialCount = 0, initialRating = 0 }: ReviewsSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsCount, setReviewsCount] = useState(initialCount);
  const [averageRating, setAverageRating] = useState(initialRating);
  const [ratingDistribution, setRatingDistribution] = useState<Record<string, number>>({
    "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [upvotedReviews, setUpvotedReviews] = useState<string[]>([]);

  const fetchReviews = useCallback(async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&page=${pageNumber}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.items || []);
        setReviewsCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setRatingDistribution(data.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 });
        let totalStars = 0, totalCount = 0;
        Object.entries(data.ratingDistribution || {}).forEach(([stars, count]) => {
          totalStars += parseInt(stars) * (count as number);
          totalCount += count as number;
        });
        if (totalCount > 0) setAverageRating(totalStars / totalCount);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(page); }, [page, fetchReviews]);

  const handleUpvote = async (reviewId: string) => {
    if (upvotedReviews.includes(reviewId)) return;
    try {
      const res = await apiFetch(`/api/reviews/${reviewId}/helpful`, { method: "PATCH" });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
        setUpvotedReviews(prev => [...prev, reviewId]);
        toast.success("Marked as helpful.");
      }
    } catch (err) {
      console.error("Failed to mark review as helpful", err);
    }
  };

  const handleReviewSuccess = () => {
    setIsWriteOpen(false);
    setPage(1);
    fetchReviews(1);
  };

  return (
    <section aria-label={`Reviews (${reviewsCount})`} className="space-y-8">

      {/* Rating summary */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface p-6 rounded-2xl border border-border"
        role="region"
        aria-label="Rating summary"
      >
        {/* Average score */}
        <div
          className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6"
          aria-label={`Average rating: ${averageRating.toFixed(1)} out of 5`}
        >
          <p className="text-5xl font-display font-extrabold text-text-primary" aria-hidden="true">
            {averageRating.toFixed(1)}
          </p>
          <div className="flex items-center text-warning my-2.5" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-5 h-5 fill-current ${i < Math.round(averageRating) ? "text-warning" : "text-border fill-border"}`} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
            {reviewsCount} Customer Review{reviewsCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Distribution */}
        <div className="flex flex-col justify-center space-y-2 md:col-span-2" aria-label="Rating distribution">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[String(stars)] || 0;
            const percentage = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center text-sm" aria-label={`${stars} star: ${count} reviews`}>
                <span className="w-12 text-text-secondary font-medium flex items-center gap-1" aria-hidden="true">
                  {stars} <FiStar className="fill-warning text-warning" size={13} />
                </span>
                <div className="flex-1 h-2 mx-3 bg-surface-elevated border border-border rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`${Math.round(percentage)}%`}>
                  <div className="h-full bg-warning rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-8 text-right text-text-muted text-xs font-mono" aria-hidden="true">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write review trigger */}
      <div className="flex justify-between items-center">
        <h3 className="font-display font-bold text-lg text-text-primary">Reviews Feed</h3>
        {!isWriteOpen && (
          session ? (
            <Button onClick={() => setIsWriteOpen(true)} aria-expanded={isWriteOpen} aria-controls="write-review-form">
              Write a Review
            </Button>
          ) : (
            <Button variant="outline" onClick={() => window.location.href = "/login"}>
              Sign In to Write a Review
            </Button>
          )
        )}
      </div>

      {/* Write review form */}
      {isWriteOpen && (
        <div id="write-review-form">
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setIsWriteOpen(false)}
          />
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-10" role="status" aria-label="Loading reviews">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl text-text-muted"
          role="status"
        >
          <FiStar size={24} className="mx-auto mb-2 opacity-50" aria-hidden="true" />
          <p className="text-sm">No reviews yet for this product. Be the first to review!</p>
        </div>
      ) : (
        <ol className="space-y-4 list-none p-0 m-0" aria-label="Customer reviews">
          {reviews.map((r) => (
            <li key={r.id} className="p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <article aria-label={`Review by ${r.user?.name || "Customer"}`}>
                <header className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden"
                      aria-hidden="true"
                    >
                      {r.user?.image ? (
                        <Image src={r.user.image} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        (r.user?.name || "C").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">{r.user?.name || "Customer"}</h4>
                      {r.isVerified && (
                        <span className="inline-block text-[9px] uppercase tracking-wider font-bold text-success bg-success/5 border border-success/15 px-1.5 py-0.5 rounded mt-0.5">
                          ✓ Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                  <time
                    dateTime={new Date(r.createdAt).toISOString()}
                    className="text-[10px] font-mono text-text-muted"
                  >
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                </header>

                <div
                  className="flex items-center text-warning mb-2"
                  role="img"
                  aria-label={`${r.rating} out of 5 stars`}
                >
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < r.rating ? "text-warning" : "text-border fill-border"}`} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {r.title && <h5 className="font-bold text-text-primary text-sm mb-1.5">{r.title}</h5>}
                <p className="text-text-secondary text-sm leading-relaxed">{r.comment}</p>

                <footer className="flex items-center justify-between border-t border-border mt-4 pt-3 text-xs">
                  <button
                    onClick={() => handleUpvote(r.id)}
                    disabled={upvotedReviews.includes(r.id)}
                    aria-pressed={upvotedReviews.includes(r.id)}
                    aria-label={`Mark review by ${r.user?.name || "Customer"} as helpful. ${r.helpfulCount || 0} people found this helpful`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                      upvotedReviews.includes(r.id)
                        ? "bg-success/5 border-success/10 text-success cursor-default"
                        : "bg-surface-elevated border-border text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span aria-hidden="true">👍</span>
                    <span>Helpful ({r.helpfulCount || 0})</span>
                  </button>
                </footer>
              </article>
            </li>
          ))}
        </ol>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 pt-4" aria-label="Reviews pagination">
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            aria-label="Previous page of reviews"
            className="px-3 py-1 bg-surface border border-border rounded text-xs disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs text-text-secondary self-center" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            aria-label="Next page of reviews"
            className="px-3 py-1 bg-surface border border-border rounded text-xs disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
