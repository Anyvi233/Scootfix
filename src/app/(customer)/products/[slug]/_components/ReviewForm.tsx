"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { FiStar } from "react-icons/fi";
import { apiFetch } from "@/lib/api-client";

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Write-a-Review form with ARIA fieldset/legend, star rating keyboard support,
 * and accessible form validation feedback.
 */
export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const { data: session } = useSession();
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="p-6 bg-surface-elevated border border-border rounded-2xl text-center">
        <p className="text-text-secondary text-sm mb-3">You must be signed in to write a review.</p>
        <Link href="/login">
          <Button variant="outline" size="sm">Sign In to Write a Review</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating: formRating, title: formTitle, comment: formComment }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit review");
      }
      toast.success("Thank you! Review submitted successfully.");
      onSuccess();
    } catch (err: unknown) {
      toast.error((err instanceof Error ? (err instanceof Error ? err.message : "An error occurred") : "An error occurred") || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-surface-elevated border border-border rounded-2xl space-y-4"
      aria-label="Write a review form"
      noValidate
    >
      <div className="flex justify-between items-center">
        <h4 className="font-display font-semibold text-text-primary text-base" id="review-form-heading">
          Write your Review
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-muted hover:text-danger font-medium underline"
          aria-label="Cancel writing review"
        >
          Cancel
        </button>
      </div>

      {/* Star rating */}
      <fieldset>
        <legend className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
          Your Rating
        </legend>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              role="radio"
              aria-checked={formRating === num}
              aria-label={`${num} star${num !== 1 ? "s" : ""}`}
              onClick={() => setFormRating(num)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setFormRating(Math.min(5, formRating + 1));
                if (e.key === "ArrowLeft") setFormRating(Math.max(1, formRating - 1));
              }}
              className="p-1 text-warning hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <svg
                className={`w-8 h-8 fill-current ${num <= formRating ? "text-warning" : "text-border fill-border"}`}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="review-title" className="block text-xs font-bold uppercase tracking-widest text-text-muted">
          Review Title <span className="font-normal normal-case text-text-muted">(Optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          placeholder="e.g. Great quality!"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          maxLength={120}
          className="w-full h-11 px-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <label htmlFor="review-comment" className="block text-xs font-bold uppercase tracking-widest text-text-muted">
          Comment <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <textarea
          id="review-comment"
          rows={4}
          placeholder="Share your experience with this part..."
          value={formComment}
          onChange={(e) => setFormComment(e.target.value)}
          required
          aria-required="true"
          aria-describedby="review-comment-hint"
          className="w-full p-4 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
        />
        <p id="review-comment-hint" className="text-xs text-text-muted">
          Required. Describe your experience with this product.
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
