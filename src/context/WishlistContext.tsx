"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scootfix_wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
  }, []);

  const saveWishlist = (newWishlist: WishlistItem[]) => {
    setWishlist(newWishlist);
    localStorage.setItem("scootfix_wishlist", JSON.stringify(newWishlist));
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((i) => i.id === item.id);
    let newWishlist = [...wishlist];

    if (exists) {
      newWishlist = newWishlist.filter((i) => i.id !== item.id);
      toast.success(`${item.name} removed from wishlist.`);
    } else {
      newWishlist.push(item);
      toast.success(`${item.name} added to wishlist!`);
    }

    saveWishlist(newWishlist);
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistContext");
  }
  return context;
}
