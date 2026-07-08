"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        toast.error("Authentication failed.");
      } else {
        toast.success("Successfully logged in!");
        if (email === "admin@example.com") {
          router.push("/admin");
        } else {
          router.push(callbackUrl);
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto">
              S
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary">Welcome Back</h1>
          <p className="text-sm text-text-secondary">Sign in to your ScootFix account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            <FiAlertCircle className="shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<FiMail />}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text-secondary uppercase">Password</label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<FiLock />}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base mt-2 shadow-glow"
            isLoading={isLoading}
            rightIcon={<FiArrowRight />}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
