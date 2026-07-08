"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiShield, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate verification (correct code is 123456)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (otp === "123456") {
        setIsVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error("Invalid verification code. Enter 123456 for testing.");
      }
    } catch (e) {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
            <FiCheckCircle size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-text-primary">Email Verified!</h1>
            <p className="text-sm text-text-secondary">Your email address has been verified. You can now use all features of ScootFix.</p>
          </div>
          <Link href="/" className="block">
            <Button className="w-full h-12 shadow-glow" rightIcon={<FiArrowRight />}>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <FiShield size={24} />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Verify Email</h1>
          <p className="text-sm text-text-secondary">Please enter the 6-digit verification OTP sent to your registered email address.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase block text-center mb-2">Verification Code</label>
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
            Verify Code
          </Button>
        </form>
      </div>
    </div>
  );
}
