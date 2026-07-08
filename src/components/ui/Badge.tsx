import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  pulse?: boolean;
}

export function Badge({ className, variant = "default", pulse = false, children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-elevated text-text-primary border border-border",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-info/10 text-info border border-info/20",
    outline: "text-text-secondary border border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "info" && "bg-info",
            variant === "default" && "bg-text-primary",
            variant === "outline" && "bg-text-secondary"
          )}></span>
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "info" && "bg-info",
            variant === "default" && "bg-text-primary",
            variant === "outline" && "bg-text-secondary"
          )}></span>
        </span>
      )}
      {children}
    </div>
  );
}
