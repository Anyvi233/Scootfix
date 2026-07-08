"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { VehicleProvider } from "@/context/VehicleContext";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <VehicleProvider>
              {children}
              <Toaster position="bottom-right" toastOptions={{
                style: {
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  border: "1px border var(--color-border)"
                }
              }} />
            </VehicleProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
