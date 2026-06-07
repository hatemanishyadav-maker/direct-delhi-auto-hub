import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { CartItem, Product } from "@/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "@ddah_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setItems(JSON.parse(val));
    });
  }, []);

  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [...prev, { product, quantity }];
        }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const next = items.filter((i) => i.product.id !== productId);
      persist(next);
    },
    [items, persist]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      const next = items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      );
      persist(next);
    },
    [items, persist, removeFromCart]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
