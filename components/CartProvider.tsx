"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

type Item = { product: Product; quantity: number };
type Ctx = {
  items: Item[];
  count: number;
  total: number;
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrateCart() {
      let stored: Item[] = [];
      try {
        const value = localStorage.getItem("syntra-cart");
        if (value) stored = JSON.parse(value);
      } catch {}

      try {
        const response = await fetch("/api/catalogue", { cache: "no-store" });
        if (response.ok) {
          const currentProducts = (await response.json()) as Product[];
          const currentMap = new Map(currentProducts.map((product) => [product.id, product]));
          stored = stored
            .map((item) => {
              const current = currentMap.get(item.product.id);
              if (!current || current.stock <= 0) return null;
              return {
                product: current,
                quantity: Math.min(Math.max(1, item.quantity), Math.min(10, current.stock)),
              };
            })
            .filter((item): item is Item => Boolean(item));
        }
      } catch {}

      if (!cancelled) {
        setItems(stored);
        setHydrated(true);
      }
    }

    hydrateCart();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("syntra-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<Ctx>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    add: (product) => setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      const maxQty = Math.max(1, Math.min(10, product.stock || 10));
      if (existing) {
        return current.map((item) => item.product.id === product.id
          ? { product, quantity: Math.min(maxQty, item.quantity + 1) }
          : item);
      }
      return [...current, { product, quantity: 1 }];
    }),
    remove: (id) => setItems((current) => current.filter((item) => item.product.id !== id)),
    setQty: (id, quantity) => setItems((current) => current.flatMap((item) => {
      if (item.product.id !== id) return [item];
      if (quantity < 1) return [];
      const maxQty = Math.max(1, Math.min(10, item.product.stock || 10));
      return [{ ...item, quantity: Math.min(quantity, maxQty) }];
    })),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartProvider missing");
  return context;
}
