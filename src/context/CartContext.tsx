"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("scootfix_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("scootfix_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
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

    saveCart(newCart);
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (id: string) => {
    const item = cart.find((i) => i.id === id);
    const newCart = cart.filter((i) => i.id !== id);
    saveCart(newCart);
    if (item) {
      toast.success(`${item.name} removed from cart.`);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
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

    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cart.reduce((subtotal, item) => subtotal + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
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
