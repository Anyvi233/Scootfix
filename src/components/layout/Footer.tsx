import React from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import * as FiIcons from "react-icons/fi";

export function Footer() {
  return (
    <footer className="bg-surface-elevated border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-text-primary">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Premium EV spare parts marketplace. We provide genuine, high-quality components for all major electric scooter brands to keep you moving forward.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                <FiIcons.FiTwitter size={20} />
              </a>
              <a 
                href="https://www.instagram.com/scootfix.ev?igsh=MTY4eTNleG0zMG51ZQ==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-text-muted hover:text-primary transition-colors"
                aria-label="Scootfix Instagram"
              >
                <FiIcons.FiInstagram size={20} />
              </a>
              <a 
                href="https://www.facebook.com/share/1HSVMXUA1n/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-text-muted hover:text-primary transition-colors"
                aria-label="Scootfix Facebook"
              >
                <FiIcons.FiFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-text-secondary hover:text-primary text-sm transition-colors">All Products</Link></li>
              <li><Link href="/shop" className="text-text-secondary hover:text-primary text-sm transition-colors">Categories</Link></li>
              <li><Link href="/shop?sale=true" className="text-secondary hover:text-orange-600 text-sm transition-colors font-medium">Special Offers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-text-secondary hover:text-primary text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-text-secondary hover:text-primary text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/returns" className="text-text-secondary hover:text-primary text-sm transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/orders" className="text-text-secondary hover:text-primary text-sm transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-text-primary mb-4">Stay Updated</h4>
            <p className="text-text-secondary text-sm mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                required
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-primary-hover text-white h-10 px-4 rounded-md text-sm font-medium transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-text-muted hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-text-muted hover:text-text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
