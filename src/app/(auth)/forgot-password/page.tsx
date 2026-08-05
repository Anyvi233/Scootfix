"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setIsSent(true);
      toast.success("Reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-sm p-8">
        
        {isSent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail size={28} />
            </div>
            <h2 className="text-2xl font-display font-bold text-text-primary">Check your email</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              We have sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and click the link to reset your password.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full" leftIcon={<FiArrowLeft />}>
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Reset Password</h1>
              <p className="text-sm text-text-secondary">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-text-muted" size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors inline-flex items-center gap-2">
                <FiArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
