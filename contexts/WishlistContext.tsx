import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

import { Product } from "@/types";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "@ddah_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setItems(JSON.parse(val));
    });
  }, []);

  const persist = useCallback((newItems: Product[]) => {
    setItems(newItems);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }, []);

  const addToWishlist = useCallback(
    (product: Product) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setItems((prev) => {
        if (prev.find((p) => p.id === product.id)) return prev;
        const next = [...prev, product];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = items.filter((p) => p.id !== productId);
      persist(next);
    },
    [items, persist]
  );

  const isInWishlist = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
