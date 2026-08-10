"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Item = { product: Product; quantity: number };
type AddManyInput = { product: Product; quantity: number }[];
type Ctx = {
  items: Item[];
  count: number;
  total: number;
  add: (product: Product) => void;
  addMany: (items: AddManyInput) => void;
  remove: (id: string) => void;
  setQty: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

function clampQty(product: Product, quantity: number) {
  return Math.max(1, Math.min(quantity, Math.min(10, Math.max(1, product.stock || 1))));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          if (cancelled) return;
          setCatalogue(currentProducts);
          const currentMap = new Map(currentProducts.map((product) => [product.id, product]));
          stored = stored
            .map((item) => {
              const current = currentMap.get(item.product.id);
              if (!current || current.stock <= 0) return null;
              return { product: current, quantity: clampQty(current, item.quantity) };
            })
            .filter((item): item is Item => Boolean(item));
        }
      } catch {}

      if (!cancelled) {
        setItems(stored);
        setHydrated(true);
      }
    }

    void hydrateCart();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const supabase = getBrowserSupabase();
    if (!user || !supabase) {
      setSyncedUserId(null);
      return;
    }

    let cancelled = false;
    const userId = user.id;
    async function mergeServerCart() {
      const { data } = await supabase.from("saved_carts").select("items").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      const serverItems = Array.isArray(data?.items) ? data.items as { product_id: string; quantity: number }[] : [];
      const map = new Map<string, Item>();

      for (const item of items) map.set(item.product.id, item);
      for (const saved of serverItems) {
        const product = catalogue.find((candidate) => candidate.id === saved.product_id);
        if (!product || product.stock <= 0) continue;
        const existing = map.get(product.id);
        map.set(product.id, {
          product,
          quantity: clampQty(product, Math.max(existing?.quantity || 0, Number(saved.quantity || 1))),
        });
      }

      setItems([...map.values()]);
      setSyncedUserId(userId);
    }

    void mergeServerCart();
    return () => { cancelled = true; };
    // Merge only when identity/catalogue hydration changes; persistence is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated, catalogue.length]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("syntra-cart", JSON.stringify(items));

    if (!user || syncedUserId !== user.id) return;
    const userId = user.id;
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      const payload = items.map((item) => ({ product_id: item.product.id, quantity: item.quantity }));
      void supabase.from("saved_carts").upsert({ user_id: userId, items: payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    }, 450);

    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [items, hydrated, syncedUserId, user]);

  const value = useMemo<Ctx>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    add: (product) => setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { product, quantity: clampQty(product, item.quantity + 1) } : item);
      return [...current, { product, quantity: 1 }];
    }),
    addMany: (incoming) => setItems((current) => {
      const map = new Map(current.map((item) => [item.product.id, item]));
      for (const next of incoming) {
        if (next.product.stock <= 0) continue;
        const existing = map.get(next.product.id);
        map.set(next.product.id, {
          product: next.product,
          quantity: clampQty(next.product, (existing?.quantity || 0) + Math.max(1, next.quantity)),
        });
      }
      return [...map.values()];
    }),
    remove: (id) => setItems((current) => current.filter((item) => item.product.id !== id)),
    setQty: (id, quantity) => setItems((current) => current.flatMap((item) => {
      if (item.product.id !== id) return [item];
      if (quantity < 1) return [];
      return [{ ...item, quantity: clampQty(item.product, quantity) }];
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
