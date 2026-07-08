"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiAlertCircle, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        toast.error(data.error || "Registration failed.");
      } else {
        toast.success("Account created successfully! Please log in.");
        router.push("/login");
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
          <h1 className="text-2xl font-display font-bold text-text-primary">Create Account</h1>
          <p className="text-sm text-text-secondary">Get started with your ScootFix account</p>
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
            <label className="text-xs font-semibold text-text-secondary uppercase">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<FiUser />}
              required
            />
          </div>

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
            <label className="text-xs font-semibold text-text-secondary uppercase">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<FiLock />}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
