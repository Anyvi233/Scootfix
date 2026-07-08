"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import * as FiIcons from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { SearchModal } from "../shared/SearchModal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { isDark, setTheme } = useTheme();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userLink = isLoggedIn ? (isAdmin ? "/admin" : "/profile") : "/login";

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass py-3 shadow-sm"
          : "bg-background py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50">
            <span className="font-display font-bold text-xl tracking-tight text-text-primary">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-text-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 z-50">
            <button 
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 text-text-secondary hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <FiIcons.FiSun size={20} /> : <FiIcons.FiMoon size={20} />}
            </button>
            
            <button 
              onClick={() => setSearchOpen(true)}
              className="hidden sm:block p-2 text-text-secondary hover:text-primary transition-colors"
            >
              <FiIcons.FiSearch size={20} />
            </button>
            
            <Link href={userLink} className="hidden sm:block p-2 text-text-secondary hover:text-primary transition-colors" aria-label="Account">
              <FiIcons.FiUser size={20} />
            </Link>

            <Link href="/wishlist" className="relative p-2 text-text-secondary hover:text-primary transition-colors" aria-label="Wishlist">
              <FiIcons.FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <Link href="/cart" className="relative p-2 text-text-secondary hover:text-primary transition-colors" aria-label="Cart">
              <FiIcons.FiShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiIcons.FiX size={24} /> : <FiIcons.FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-lg p-4 md:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 rounded-md text-base font-medium transition-colors",
                    pathname === link.href ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-border/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
               <Link href={userLink} className="px-4 py-3 text-text-primary font-medium flex items-center gap-3">
                 <FiIcons.FiUser size={18} /> {isLoggedIn ? (isAdmin ? "Admin Panel" : "My Profile") : "My Account"}
               </Link>
              {isLoggedIn && (
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-3 text-danger font-medium flex items-center gap-3 text-left w-full hover:bg-danger/5 rounded-md transition-colors"
                >
                  <FiIcons.FiLogOut size={18} /> Sign Out
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
      
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
