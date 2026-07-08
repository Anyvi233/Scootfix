"use client";

import React, { forwardRef, useState, useId } from "react";
import { cn } from "@/lib/utils";
import { FiEye, FiEyeOff } from "react-icons/fi";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const generatedId = useId();
    const inputId = id || generatedId;
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full relative flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={inputType}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              leftIcon && "pl-10",
              isPassword && "pr-10",
              error && "border-danger focus-visible:ring-danger",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-danger animate-in fade-in slide-in-from-top-1">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
