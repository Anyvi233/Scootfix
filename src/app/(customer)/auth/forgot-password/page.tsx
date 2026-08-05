"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        toast.success("Password reset link sent!");
      } else {
        toast.error(data.error || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-md">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <FiMail size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Forgot Password</h1>
          <p className="text-text-secondary text-sm">
            {isSubmitted 
              ? "We've sent a password reset link to your email."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-6">
            <div className="p-4 bg-surface-elevated rounded-xl border border-border text-center">
              <p className="text-sm text-text-primary font-medium">{email}</p>
              <p className="text-xs text-text-muted mt-2">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try another email
            </Button>
            <div className="text-center">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors font-medium">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
