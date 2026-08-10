"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import type { Product } from "@/lib/products";

export type WishlistEntry = {
  product_id: string;
  notify_restock: boolean;
  notify_price_drop: boolean;
  last_seen_price: number | null;
};

type WishlistContextValue = {
  entries: WishlistEntry[];
  loading: boolean;
  count: number;
  isSaved: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  setAlert: (productId: string, key: "notify_restock" | "notify_price_drop", enabled: boolean) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const GUEST_KEY = "syntra-wishlist-v10";

function readGuest(): WishlistEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuest(entries: WishlistEntry[]) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(entries));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!user || !supabase) {
      setEntries(readGuest());
      setLoading(false);
      return;
    }

    const guest = readGuest();
    if (guest.length) {
      await supabase.from("wishlist").upsert(
        guest.map((entry) => ({
          user_id: user.id,
          product_id: entry.product_id,
          notify_restock: entry.notify_restock,
          notify_price_drop: entry.notify_price_drop,
          last_seen_price: entry.last_seen_price,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "user_id,product_id", ignoreDuplicates: false }
      );
      localStorage.removeItem(GUEST_KEY);
    }

    const { data } = await supabase
      .from("wishlist")
      .select("product_id,notify_restock,notify_price_drop,last_seen_price")
      .order("created_at", { ascending: false });

    setEntries((data as WishlistEntry[] | null) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  async function toggle(product: Product) {
    const exists = entries.some((entry) => entry.product_id === product.id);
    const supabase = getBrowserSupabase();

    if (!user || !supabase) {
      const next = exists
        ? entries.filter((entry) => entry.product_id !== product.id)
        : [
            {
              product_id: product.id,
              notify_restock: false,
              notify_price_drop: false,
              last_seen_price: product.price,
            },
            ...entries,
          ];
      setEntries(next);
      writeGuest(next);
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: exists ? "Removed from saved products." : "Saved for later. Sign in to sync across devices." }));
      return;
    }

    if (exists) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      setEntries((current) => current.filter((entry) => entry.product_id !== product.id));
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Removed from saved products." }));
      return;
    }

    const entry: WishlistEntry = {
      product_id: product.id,
      notify_restock: product.stock <= 0,
      notify_price_drop: false,
      last_seen_price: product.price,
    };

    const { error } = await supabase.from("wishlist").insert({ user_id: user.id, ...entry });
    if (error) {
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Could not save this product right now." }));
      return;
    }
    setEntries((current) => [entry, ...current]);
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Saved to your Syntra wishlist." }));
  }

  async function setAlert(productId: string, key: "notify_restock" | "notify_price_drop", enabled: boolean) {
    if (!user) {
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Sign in to enable stock and price alerts." }));
      return;
    }
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from("wishlist")
      .update({ [key]: enabled, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (!error) {
      setEntries((current) => current.map((entry) => entry.product_id === productId ? { ...entry, [key]: enabled } : entry));
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: enabled ? "Alert enabled." : "Alert disabled." }));
    }
  }

  const value = useMemo<WishlistContextValue>(() => ({
    entries,
    loading,
    count: entries.length,
    isSaved: (productId) => entries.some((entry) => entry.product_id === productId),
    toggle,
    setAlert,
    refresh,
  }), [entries, loading, refresh]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) throw new Error("useWishlist must be used inside WishlistProvider");
  return value;
}
