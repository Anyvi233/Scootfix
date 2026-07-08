"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  FiGrid, FiBox, FiCompass, FiUsers, FiTag, 
  FiFileText, FiLogOut, FiSettings, FiActivity, FiChevronRight, FiBarChart2, FiLayers
} from "react-icons/fi";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin", icon: FiGrid },
  { label: "Products & Spares", href: "/admin/products", icon: FiBox },
  { label: "Inventory", href: "/admin/inventory", icon: FiLayers },
  { label: "Vehicle Compatibility", href: "/admin/compatibility", icon: FiCompass },
  { label: "Orders & Shipments", href: "/admin/orders", icon: FiFileText },
  { label: "Reports & Analytics", href: "/admin/reports", icon: FiBarChart2 },
  { label: "User Management", href: "/admin/users", icon: FiUsers },
  { label: "Coupons & Offers", href: "/admin/coupons", icon: FiTag },
  { label: "Audit Logs", href: "/admin/logs", icon: FiActivity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight block">
              {APP_NAME} Control
            </span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              Admin console
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-text-muted group-hover:text-primary transition-colors"} />
                  <span>{link.label}</span>
                </div>
                <FiChevronRight size={14} className={cn("opacity-0 transition-opacity", isActive ? "opacity-100" : "group-hover:opacity-100")} />
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors",
              pathname === "/admin/settings" && "bg-surface-elevated text-primary font-semibold"
            )}
          >
            <FiSettings size={18} className="text-text-muted" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors"
          >
            <FiLogOut size={18} className="text-text-muted hover:text-danger" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-text-primary">Console Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-xs font-semibold text-text-secondary">Core Database Online</span>
          </div>
        </header>

        {/* View Deck */}
        <div className="flex-1 overflow-y-auto p-8 bg-background-elevated">
          {children}
        </div>

      </main>
    </div>
  );
}
