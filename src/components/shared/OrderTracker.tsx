"use client";

import React from "react";
import {
  FiShoppingCart,
  FiCheckCircle,
  FiSettings,
  FiTruck,
  FiHome,
  FiXCircle,
} from "react-icons/fi";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

interface Step {
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { key: "PENDING",    label: "Order Placed",   sublabel: "We received your order",    icon: FiShoppingCart },
  { key: "CONFIRMED",  label: "Confirmed",       sublabel: "Payment verified",           icon: FiCheckCircle  },
  { key: "PROCESSING", label: "Processing",      sublabel: "Packing your items",         icon: FiSettings     },
  { key: "SHIPPED",    label: "Shipped",          sublabel: "Out for delivery",           icon: FiTruck        },
  { key: "DELIVERED",  label: "Delivered",       sublabel: "Enjoy your new parts!",      icon: FiHome         },
];

const STATUS_ORDER: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED",
];

function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

interface OrderTrackerProps {
  status: OrderStatus;
  updatedAt?: string;
  compact?: boolean;
}

export function OrderTracker({ status, updatedAt, compact = false }: OrderTrackerProps) {
  const isCancelled = status === "CANCELLED";
  const activeIdx = isCancelled ? -1 : getStepIndex(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/5 border border-danger/20">
        <FiXCircle className="text-danger shrink-0" size={20} />
        <div>
          <p className="text-sm font-semibold text-danger">Order Cancelled</p>
          {updatedAt && (
            <p className="text-[11px] text-text-muted mt-0.5">
              {new Date(updatedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (compact) {
    // Horizontal mini bar for card headers
    return (
      <div className="w-full">
        {/* Progress bar */}
        <div className="relative flex items-center w-full">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = idx < activeIdx;
            const isActive = idx === activeIdx;
            const isPending = idx > activeIdx;

            return (
              <React.Fragment key={step.key}>
                {/* Step dot */}
                <div className="relative flex flex-col items-center flex-shrink-0">
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500
                      ${isComplete ? "bg-primary border-primary text-white" : ""}
                      ${isActive ? "bg-primary border-primary text-white ring-4 ring-primary/20" : ""}
                      ${isPending ? "bg-surface border-border text-text-muted" : ""}
                    `}
                  >
                    <Icon size={13} />
                  </div>
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-border rounded-full" />
                    <div
                      className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-700"
                      style={{ width: idx < activeIdx ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step labels */}
        <div className="flex justify-between mt-2">
          {STEPS.map((step, idx) => {
            const isComplete = idx <= activeIdx;
            return (
              <div key={step.key} className="flex flex-col items-center" style={{ width: "20%" }}>
                <span
                  className={`text-[9px] font-semibold text-center leading-tight uppercase tracking-wide ${
                    isComplete ? "text-primary" : "text-text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full vertical timeline variant
  return (
    <div className="w-full space-y-0">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isComplete = idx < activeIdx;
        const isActive = idx === activeIdx;
        const isPending = idx > activeIdx;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Icon + vertical line */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-500 z-10
                  ${isComplete ? "bg-primary border-primary text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]" : ""}
                  ${isActive ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-4 ring-primary/20 animate-pulse" : ""}
                  ${isPending ? "bg-surface border-border text-text-muted" : ""}
                `}
              >
                {isComplete ? <FiCheckCircle size={16} /> : <Icon size={16} />}
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-1 mb-1 relative overflow-hidden min-h-[2.5rem]">
                  <div className="absolute inset-0 bg-border" />
                  <div
                    className="absolute top-0 left-0 right-0 bg-primary transition-all duration-700"
                    style={{ height: isComplete ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>

            {/* Text */}
            <div className={`pb-6 pt-1.5 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-semibold leading-tight ${isComplete || isActive ? "text-text-primary" : "text-text-muted"}`}>
                {step.label}
              </p>
              <p className={`text-xs mt-0.5 ${isComplete || isActive ? "text-text-secondary" : "text-text-muted/60"}`}>
                {step.sublabel}
              </p>
              {isActive && updatedAt && (
                <p className="text-[10px] font-mono text-primary mt-1">
                  {new Date(updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
