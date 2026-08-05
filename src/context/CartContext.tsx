"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const isFirstLoad = useRef(true);

  // Load cart on mount / auth change
  useEffect(() => {
    const loadCart = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const dbCart = await res.json();
            setCart(dbCart);
            localStorage.setItem("scootfix_cart", JSON.stringify(dbCart));
          }
        } catch (e) {
          console.error("Failed to load cart from DB:", e);
        }
      } else {
        const savedCart = localStorage.getItem("scootfix_cart");
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (e) {
            console.error("Failed to parse cart:", e);
          }
        }
      }
      isFirstLoad.current = false;
    };

    loadCart();
  }, [status]);

  // Sync cart to localStorage and database on state changes
  useEffect(() => {
    if (isFirstLoad.current) return;

    localStorage.setItem("scootfix_cart", JSON.stringify(cart));

    if (status === "authenticated") {
      const syncCart = async () => {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: cart.map(i => ({ id: i.id, quantity: i.quantity }))
            })
          });
        } catch (e) {
          console.error("Failed to sync cart to DB:", e);
        }
      };
      
      const timer = setTimeout(syncCart, 400); // Debounce syncs by 400ms to reduce database calls
      return () => clearTimeout(timer);
    }
  }, [cart, status]);

  const addToCart = React.useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + quantity;
      if (newQty > item.stock) {
        toast.error(`Cannot add more. Only ${item.stock} items left in stock.`);
        return;
      }
      newCart[existingIndex].quantity = newQty;
    } else {
      if (quantity > item.stock) {
        toast.error(`Cannot add. Only ${item.stock} items left in stock.`);
        return;
      }
      newCart.push({ ...item, quantity });
    }

    setCart(newCart);
    toast.success(`${item.name} added to cart!`);
  }, [cart]);

  const removeFromCart = React.useCallback((id: string) => {
    const item = cart.find((i) => i.id === id);
    const newCart = cart.filter((i) => i.id !== id);
    setCart(newCart);
    if (item) {
      toast.success(`${item.name} removed from cart.`);
    }
  }, [cart]);

  const updateQuantity = React.useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const newCart = cart.map((item) => {
      if (item.id === id) {
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items left in stock.`);
          return item;
        }
        return { ...item, quantity };
      }
      return item;
    });

    setCart(newCart);
  }, [cart, removeFromCart]);

  const clearCart = React.useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = React.useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
  const cartSubtotal = React.useMemo(() => cart.reduce((subtotal, item) => subtotal + item.price * item.quantity, 0), [cart]);

  const value = React.useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
