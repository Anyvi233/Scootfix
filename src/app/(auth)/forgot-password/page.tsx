"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Steps: 1 = Enter Email, 2 = Enter OTP, 3 = Reset Password, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Verification OTP sent to your email!");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate OTP verification (correct code is 123456)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (otp === "123456") {
        toast.success("OTP Verified!");
        setStep(3);
      } else {
        setError("Invalid OTP. Try entering 123456 for testing.");
      }
    } catch (err) {
      setError("OTP Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate Password Reset
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Password reset successfully!");
      setStep(4);
    } catch (err) {
      setError("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Step 1: Email entry */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-text-primary">Forgot Password?</h1>
              <p className="text-sm text-text-secondary">Enter your email and we'll send you an OTP code to reset your password.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                <FiAlertCircle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
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

              <Button type="submit" className="w-full h-12 shadow-glow" isLoading={isLoading} rightIcon={<FiArrowRight />}>
                Send OTP Code
              </Button>
            </form>
          </div>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <FiShield size={24} />
              </div>
              <h1 className="text-2xl font-display font-bold text-text-primary">OTP Verification</h1>
              <p className="text-sm text-text-secondary">We sent a verification code to <strong>{email}</strong>.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                <FiAlertCircle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase block text-center mb-2">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full h-12 text-center text-2xl font-mono tracking-widest bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-[10px] text-text-muted text-center mt-1">Hint: Enter 123456 to verify</p>
              </div>

              <Button type="submit" className="w-full h-12 shadow-glow" isLoading={isLoading}>
                Verify OTP
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-display font-bold text-text-primary">Reset Password</h1>
              <p className="text-sm text-text-secondary">Choose a secure password for your ScootFix account.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
                <FiAlertCircle className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<FiLock />}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary uppercase">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<FiLock />}
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12 shadow-glow" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          </div>
        )}

        {/* Step 4: Success confirmation */}
        {step === 4 && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
              <FiCheckCircle size={36} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-text-primary">Password Reset</h1>
              <p className="text-sm text-text-secondary">Your account password has been updated successfully.</p>
            </div>
            <Link href="/login" className="block">
              <Button className="w-full h-12 shadow-glow">Go to Login</Button>
            </Link>
          </div>
        )}

        {step < 4 && (
          <div className="text-center pt-2">
            <Link href="/login" className="text-sm text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
