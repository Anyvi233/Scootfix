"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  if (!items.length) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex overflow-x-auto hide-scrollbar border-b border-border">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === item.id ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {item.label}
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="py-6">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
