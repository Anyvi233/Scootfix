"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  FiGrid, FiBox, FiCompass, FiUsers, FiTag, 
  FiFileText, FiLogOut, FiSettings, FiChevronRight, FiBarChart2, FiLayers, FiCornerDownLeft, FiStar, FiShoppingCart, FiMenu, FiX
} from "react-icons/fi";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin", icon: FiGrid },
  { label: "Abandoned Carts", href: "/admin/abandoned-carts", icon: FiShoppingCart },
  { label: "Products & Spares", href: "/admin/products", icon: FiBox },
  { label: "Inventory", href: "/admin/inventory", icon: FiLayers },
  { label: "Vehicle Compatibility", href: "/admin/compatibility", icon: FiCompass },
  { label: "Orders & Shipments", href: "/admin/orders", icon: FiFileText },
  { label: "Returns & Refunds", href: "/admin/returns", icon: FiCornerDownLeft },
  { label: "Reviews Moderation", href: "/admin/reviews", icon: FiStar },
  { label: "Reports & Analytics", href: "/admin/reports", icon: FiBarChart2 },
  { label: "User Management", href: "/admin/users", icon: FiUsers },
  { label: "Coupons & Offers", href: "/admin/coupons", icon: FiTag },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center gap-2 shrink-0">
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
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
      <div className="p-4 border-t border-border space-y-2 shrink-0">
        <Link
          href="/admin/settings"
          onClick={onLinkClick}
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
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Mark as mounted after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Desktop Sidebar — deferred until mount to prevent hydration mismatch */}
      {mounted && (
        <aside className="w-64 bg-surface border-r border-border hidden lg:flex flex-col shrink-0">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {mounted && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      {mounted && (
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-72 bg-surface border-r border-border z-50 flex flex-col transition-transform duration-300 lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
        </aside>
      )}

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
            <h2 className="text-base font-bold text-text-primary">Console Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-xs font-semibold text-text-secondary hidden sm:block">Core Database Online</span>
          </div>
        </header>

        {/* View Deck */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background-elevated">
          {children}
        </div>

      </main>
    </div>
  );
}
