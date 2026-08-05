"use client";

import React, { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMail, FiLock, FiUser, FiAlertCircle,
  FiArrowRight, FiEye, FiEyeOff, FiCheck, FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { apiFetch } from "@/lib/api-client";

// ── Password strength ──────────────────────────────────────────────────────────
const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p: string) => /[0-9]/.test(p) },
];

function getStrength(password: string) {
  const passed = RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { score: 0, label: "", color: "" };
  if (passed === 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (passed === 2) return { score: 2, label: "Fair", color: "bg-orange-400" };
  if (passed === 3) return { score: 3, label: "Good", color: "bg-yellow-400" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
}

// ── Google SVG ────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);

  const strength = useMemo(() => getStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (strength.score < 4) {
      setError("Please choose a stronger password that meets all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register user
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        toast.error(data.error || "Registration failed.");
        return;
      }

      // Step 2: Auto sign-in immediately after registration
      toast.success("Account created! Signing you in…");
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.ok) {
        toast.success("Welcome to ScootFix! 🎉");
        router.push("/");
        router.refresh();
      } else {
        // Registration succeeded but auto-login failed — send to login
        toast.success("Account created! Please sign in.");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-8 space-y-5">

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto">
              S
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-text-primary">Create Account</h1>
          <p className="text-sm text-text-secondary">Join ScootFix — India&apos;s EV spares platform</p>
        </div>

        {/* Google Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading}
          className="w-full h-11 flex items-center justify-center gap-3 bg-background hover:bg-surface-elevated border border-border text-text-primary text-sm font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface px-3 text-text-muted font-semibold">Or register with email</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            <FiAlertCircle className="shrink-0 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Raj Kumar"
              leftIcon={<FiUser />}
              autoComplete="name"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<FiMail />}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setShowRules(true); }}
                onFocus={() => setShowRules(true)}
                placeholder="Create a strong password"
                leftIcon={<FiLock />}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Strength Bar */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        strength.score >= level ? strength.color : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className={`text-xs font-medium ${
                    strength.score <= 1 ? "text-red-500" :
                    strength.score === 2 ? "text-orange-400" :
                    strength.score === 3 ? "text-yellow-500" : "text-green-500"
                  }`}>
                    Password strength: {strength.label}
                  </p>
                )}
              </div>
            )}

            {/* Password Rules */}
            {showRules && password.length > 0 && (
              <div className="space-y-1 pt-1">
                {RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-green-500" : "text-text-muted"}`}>
                      {ok ? <FiCheck size={12} /> : <FiX size={12} />}
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                leftIcon={<FiLock />}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {passwordsMatch && (
              <p className="text-xs text-green-500 flex items-center gap-1">
                <FiCheck size={12} /> Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FiX size={12} /> Passwords do not match
              </p>
            )}
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

        <p className="text-xs text-text-muted text-center">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>

        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
