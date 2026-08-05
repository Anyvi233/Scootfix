"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid password reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-md text-center">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4 text-danger">
            <FiLock size={24} />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Invalid Link</h1>
          <p className="text-text-secondary text-sm mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link href="/auth/forgot-password">
            <Button className="w-full">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-md">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            {isSuccess ? <FiCheckCircle size={24} /> : <FiLock size={24} />}
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary mb-2">
            {isSuccess ? "Password Reset" : "Create New Password"}
          </h1>
          <p className="text-text-secondary text-sm">
            {isSuccess 
              ? "Your password has been successfully updated."
              : "Enter your new password below."}
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-6">
            <Link href="/auth/login" className="block">
              <Button className="w-full">Login with New Password</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="container mx-auto px-4 py-16 md:py-24 max-w-md text-center">Loading...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
