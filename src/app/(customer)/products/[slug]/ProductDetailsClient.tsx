"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiHeart, FiShare2, FiShoppingCart, FiCheck,
  FiTruck, FiShield
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ProductGallery } from "@/components/shared/ProductGallery";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { formatPrice, cn } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useVehicle } from "@/context/VehicleContext";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FiStar } from "react-icons/fi";

interface Props {
  product: any;
}

export function ProductDetailsClient({ product }: Props) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { selectedVehicle, isCompatible } = useVehicle();
  const { data: session } = useSession();
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsCount, setReviewsCount] = useState(product.reviewsCount ?? 0);
  const [averageRating, setAverageRating] = useState(product.rating ?? 0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<string, number>>({
    "1": 0, "2": 0, "3": 0, "4": 0, "5": 0
  });
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  
  // Write review form state
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upvotedReviews, setUpvotedReviews] = useState<string[]>([]);

  // Fetch reviews function
  const fetchReviews = async (pageNumber = 1) => {
    setIsReviewsLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}&page=${pageNumber}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.items || []);
        setReviewsCount(data.total || 0);
        setReviewsTotalPages(data.totalPages || 1);
        setRatingDistribution(data.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 });
        
        let totalStars = 0;
        let totalCount = 0;
        Object.entries(data.ratingDistribution || {}).forEach(([stars, count]) => {
          totalStars += parseInt(stars) * (count as number);
          totalCount += (count as number);
        });
        if (totalCount > 0) {
          setAverageRating(totalStars / totalCount);
        }
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(reviewsPage);
  }, [reviewsPage, product.id]);

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: formRating,
          title: formTitle,
          comment: formComment
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit review");
      }

      toast.success("Thank you! Review submitted successfully.");
      setIsWriteOpen(false);
      setFormTitle("");
      setFormComment("");
      setFormRating(5);
      setReviewsPage(1);
      fetchReviews(1);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteHelpful = async (reviewId: string) => {
    if (upvotedReviews.includes(reviewId)) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: "PATCH"
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
        setUpvotedReviews(prev => [...prev, reviewId]);
        toast.success("Marked as helpful.");
      }
    } catch (err) {
      console.error("Failed to mark review as helpful", err);
    }
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const isWishlisted = isInWishlist(product.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const specs = product.specifications
    ? typeof product.specifications === "string"
      ? JSON.parse(product.specifications)
      : product.specifications
    : {};

  const tabItems = [
    {
      id: "description",
      label: "Description",
      content: (
        <div className="prose dark:prose-invert max-w-none text-text-secondary">
          <p>{product.description}</p>
        </div>
      ),
    },
    {
      id: "specifications",
      label: "Specifications",
      content: (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-sm text-left">
            <tbody>
              {Object.entries(specs).map(([key, value], index) => (
                <tr key={key} className={index % 2 === 0 ? "bg-surface-elevated" : "bg-surface"}>
                  <td className="px-6 py-4 font-medium text-text-primary border-r border-border w-1/3">{key}</td>
                  <td className="px-6 py-4 text-text-secondary">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },

    {
      id: "reviews",
      label: `Reviews (${reviewsCount})`,
      content: (
        <div className="space-y-8">
          {/* Summary & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface p-6 rounded-2xl border border-border">
            
            {/* Average score */}
            <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
              <p className="text-5xl font-display font-extrabold text-text-primary">
                {averageRating.toFixed(1)}
              </p>
              <div className="flex items-center text-warning my-2.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 fill-current ${i < Math.round(averageRating) ? "text-warning" : "text-border fill-border"}`} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
                {reviewsCount} Customer Review{reviewsCount !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribution chart */}
            <div className="flex flex-col justify-center space-y-2 md:col-span-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[String(stars)] || 0;
                const percentage = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center text-sm">
                    <span className="w-12 text-text-secondary font-medium flex items-center gap-1">
                      {stars} <FiStar className="fill-warning text-warning" size={13} />
                    </span>
                    <div className="flex-1 h-2 mx-3 bg-surface-elevated border border-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-text-muted text-xs font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review form trigger */}
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-lg text-text-primary">Reviews Feed</h3>
            {!isWriteOpen && (
              session ? (
                <Button onClick={() => setIsWriteOpen(true)}>Write a Review</Button>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Sign In to Write a Review</Button>
                </Link>
              )
            )}
          </div>

          {/* Write a Review Form */}
          {isWriteOpen && (
            <form onSubmit={handleWriteSubmit} className="p-6 bg-surface-elevated border border-border rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-display font-semibold text-text-primary text-base">Write your Review</h4>
                <button type="button" onClick={() => setIsWriteOpen(false)} className="text-xs text-text-muted hover:text-danger font-medium underline">
                  Cancel
                </button>
              </div>

              {/* Stars selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Your Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormRating(num)}
                      className="p-1 text-warning hover:scale-110 transition-transform focus:outline-none"
                    >
                      <svg 
                        className={`w-8 h-8 fill-current ${num <= formRating ? "text-warning" : "text-border fill-border"}`} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="review-title" className="block text-xs font-bold uppercase tracking-widest text-text-muted">Review Title (Optional)</label>
                <input
                  id="review-title"
                  type="text"
                  placeholder="e.g. Great quality!"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-widest text-text-muted">Comment</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  placeholder="Share your experience with this part..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  required
                  className="w-full p-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          )}

          {/* Reviews feed list */}
          {isReviewsLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-surface border border-border border-dashed rounded-2xl text-text-muted">
              <FiStar size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reviews yet for this product. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-5 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                        {r.user?.image ? (
                          <img src={r.user.image} alt={r.user.name || "Customer"} className="w-full h-full object-cover" />
                        ) : (
                          (r.user?.name || "C").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">{r.user?.name || "Customer"}</h4>
                        {r.isVerified && (
                          <span className="inline-block text-[9px] uppercase tracking-wider font-bold text-success bg-success/5 border border-success/15 px-1.5 py-0.2 rounded mt-0.5">
                            ✓ Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-warning mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < r.rating ? "text-warning" : "text-border fill-border"}`} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>

                  {r.title && <h5 className="font-bold text-text-primary text-sm mb-1.5">{r.title}</h5>}
                  <p className="text-text-secondary text-sm leading-relaxed">{r.comment}</p>

                  {/* Helpful and actions */}
                  <div className="flex items-center justify-between border-t border-border mt-4 pt-3 text-xs">
                    <button
                      onClick={() => handleUpvoteHelpful(r.id)}
                      disabled={upvotedReviews.includes(r.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                        upvotedReviews.includes(r.id)
                          ? "bg-success/5 border-success/10 text-success cursor-default"
                          : "bg-surface-elevated border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated/80"
                      }`}
                    >
                      <span>Helpful ({r.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {reviewsTotalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <button
                    onClick={() => setReviewsPage(prev => Math.max(1, prev - 1))}
                    disabled={reviewsPage === 1}
                    className="px-3 py-1 bg-surface border border-border rounded text-xs disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-text-secondary self-center">
                    Page {reviewsPage} of {reviewsTotalPages}
                  </span>
                  <button
                    onClick={() => setReviewsPage(prev => Math.min(reviewsTotalPages, prev + 1))}
                    disabled={reviewsPage === reviewsTotalPages}
                    className="px-3 py-1 bg-surface border border-border rounded text-xs disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Product Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <ProductGallery images={product.images ?? []} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              {product.brand?.name}
            </span>
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="p-2 text-text-muted hover:text-text-primary bg-surface rounded-full border border-border shadow-sm transition-colors"
            >
              <FiShare2 size={18} />
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary leading-tight mb-4">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-warning">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(product.rating ?? 0) ? "fill-current text-warning" : "text-border fill-border"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-text-muted font-medium ml-1">
                {(product.rating ?? 0).toFixed(1)} ({(product as any).reviewsCount ?? 0} Reviews)
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span className="text-sm text-text-muted">SKU: {product.sku}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={product.stock > 0 ? "success" : "danger"} pulse={product.stock > 0}>
              {product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock"}
            </Badge>
          </div>

          {/* Vehicle Compatibility Banner */}
          <div className="mb-6">
            {selectedVehicle ? (
              (() => {
                const { compatible, reason } = isCompatible(product.compatibilities || []);
                return (
                  <div 
                    className={cn(
                      "p-4 rounded-xl border text-sm flex items-start gap-3",
                      compatible 
                        ? "bg-success/5 border-success/20 text-success" 
                        : "bg-danger/5 border-danger/20 text-danger"
                    )}
                  >
                    <span className="text-lg leading-none mt-0.5">{compatible ? "✓" : "⚠"}</span>
                    <div>
                      <p className="font-semibold">{compatible ? "Verified Fit" : "Compatibility Warning"}</p>
                      <p className="text-xs opacity-90 mt-0.5">{reason}</p>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-4 rounded-xl border border-border bg-surface-elevated text-text-secondary text-sm flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">ℹ</span>
                <div>
                  <p className="font-semibold">Check Compatibility</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Select your scooter model in the shop filters sidebar to verify fit.
                  </p>
                </div>
              </div>
            )}
          </div>



          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-text-primary">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-text-muted line-through mb-1">{formatPrice(product.compareAtPrice)}</span>
                {discount > 0 && (
                  <span className="text-sm font-semibold text-danger bg-danger/10 px-2 py-1 rounded-md mb-1.5">
                    Save {discount}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="bg-surface-elevated rounded-xl p-4 border border-border mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-text-primary">
                <FiTruck className="text-primary" size={18} />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary">
                <FiShield className="text-primary" size={18} />
                <span>Warranty Included</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 mt-auto">
            <div className="flex gap-4">
              <div className="flex items-center border border-border rounded-lg bg-surface h-14">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >-</button>
                <span className="w-8 text-center font-medium text-text-primary" aria-live="polite">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 text-text-muted hover:text-text-primary h-full flex items-center transition-colors"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <Button
                size="lg"
                className="flex-grow h-14 text-base shadow-glow"
                leftIcon={<FiShoppingCart size={20} />}
                disabled={product.stock === 0}
                onClick={() => addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", stock: product.stock }, quantity)}
              >
                Add to Cart
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="flex-grow h-14 text-base"
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", stock: product.stock }, quantity);
                  router.push("/checkout");
                }}
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={cn("h-14 w-14 shrink-0", isWishlisted && "text-danger border-danger/30 bg-danger/5")}
                onClick={() => toggleWishlist({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.images?.[0]?.url || "", category: product.category?.name })}
              >
                <FiHeart size={22} className={isWishlisted ? "fill-current" : ""} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-20">
        <Tabs items={tabItems} className="bg-surface rounded-2xl border border-border shadow-sm p-2 sm:p-6" />
      </div>
    </>
  );
}
