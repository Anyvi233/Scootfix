"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverLift = false, children, ...props }, ref) => {
    const Component = hoverLift ? motion.div : "div";
    const motionProps = hoverLift ? {
      whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
      className: cn("bg-surface rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow", className),
    } : {
      className: cn("bg-surface rounded-lg border border-border shadow-sm", className),
    };

    return (
      <Component ref={ref} {...motionProps} {...(props as any)}>
        {children}
      </Component>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
