"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Product } from "@/lib/products";
import { useAuth } from "./AuthProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Item = {
  product: Product;
  quantity: number;
};

type AddManyInput = {
  product: Product;
  quantity: number;
}[];

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

type SavedCartItem = {
  product_id: string;
  quantity: number;
};

const CartContext = createContext<Ctx | null>(null);

function clampQty(product: Product, quantity: number) {
  const availableStock = Math.max(1, product.stock || 1);
  const maximumQuantity = Math.min(10, availableStock);

  return Math.max(1, Math.min(quantity, maximumQuantity));
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncedUserId, setSyncedUserId] = useState<string | null>(null);

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * ---------------------------------------------------------
   * HYDRATE LOCAL CART + REFRESH PRODUCT DATA
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    async function hydrateCart() {
      let stored: Item[] = [];

      try {
        const value = localStorage.getItem("syntra-cart");

        if (value) {
          stored = JSON.parse(value) as Item[];
        }
      } catch {
        stored = [];
      }

      try {
        const response = await fetch("/api/catalogue", {
          cache: "no-store",
        });

        if (response.ok) {
          const currentProducts = (await response.json()) as Product[];

          if (cancelled) {
            return;
          }

          setCatalogue(currentProducts);

          const currentMap = new Map(
            currentProducts.map((product) => [product.id, product])
          );

          stored = stored
            .map((item) => {
              const currentProduct = currentMap.get(item.product.id);

              if (!currentProduct || currentProduct.stock <= 0) {
                return null;
              }

              return {
                product: currentProduct,
                quantity: clampQty(currentProduct, item.quantity),
              };
            })
            .filter((item): item is Item => item !== null);
        }
      } catch {
        // Keep locally stored cart if catalogue refresh fails.
      }

      if (!cancelled) {
        setItems(stored);
        setHydrated(true);
      }
    }

    void hydrateCart();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * MERGE SERVER CART AFTER LOGIN
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const supabase = getBrowserSupabase();

    if (!user || !supabase) {
      setSyncedUserId(null);
      return;
    }

    /*
     * Important:
     * Capture the validated Supabase client in a new constant.
     * TypeScript now knows this value cannot be null inside
     * the async function below.
     */
    const supabaseClient = supabase;

    let cancelled = false;

    const userId = user.id;

    async function mergeServerCart() {
      try {
        const { data, error } = await supabaseClient
          .from("saved_carts")
          .select("items")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("Unable to load saved cart:", error);
          return;
        }

        if (cancelled) {
          return;
        }

        const serverItems: SavedCartItem[] = Array.isArray(data?.items)
          ? (data.items as SavedCartItem[])
          : [];

        const map = new Map<string, Item>();

        /*
         * Start with items already stored locally.
         */
        for (const item of items) {
          map.set(item.product.id, item);
        }

        /*
         * Merge the account-level saved cart.
         */
        for (const saved of serverItems) {
          const product = catalogue.find(
            (candidate) => candidate.id === saved.product_id
          );

          if (!product || product.stock <= 0) {
            continue;
          }

          const existing = map.get(product.id);

          const incomingQuantity = Math.max(
            1,
            Number(saved.quantity || 1)
          );

          map.set(product.id, {
            product,
            quantity: clampQty(
              product,
              Math.max(existing?.quantity || 0, incomingQuantity)
            ),
          });
        }

        setItems([...map.values()]);
        setSyncedUserId(userId);
      } catch (error) {
        console.error("Saved cart merge failed:", error);
      }
    }

    void mergeServerCart();

    return () => {
      cancelled = true;
    };

    // Cart persistence is handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, hydrated, catalogue.length]);

  /*
   * ---------------------------------------------------------
   * SAVE CART LOCALLY + TO SUPABASE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem("syntra-cart", JSON.stringify(items));
    } catch {
      // Ignore browser storage failures.
    }

    if (!user || syncedUserId !== user.id) {
      return;
    }

    const userId = user.id;
    const supabase = getBrowserSupabase();

    if (!supabase) {
      return;
    }

    const supabaseClient = supabase;

    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }

    persistTimer.current = setTimeout(() => {
      const payload: SavedCartItem[] = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }));

      void supabaseClient
        .from("saved_carts")
        .upsert(
          {
            user_id: userId,
            items: payload,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        )
        .then(({ error }) => {
          if (error) {
            console.error("Unable to save cart:", error);
          }
        });
    }, 450);

    return () => {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current);
        persistTimer.current = null;
      }
    };
  }, [items, hydrated, syncedUserId, user]);

  /*
   * ---------------------------------------------------------
   * CART ACTIONS
   * ---------------------------------------------------------
   */
  const value = useMemo<Ctx>(() => {
    return {
      items,

      count: items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),

      total: items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),

      add: (product: Product) => {
        if (product.stock <= 0) {
          return;
        }

        setItems((current) => {
          const existing = current.find(
            (item) => item.product.id === product.id
          );

          if (existing) {
            return current.map((item) =>
              item.product.id === product.id
                ? {
                    product,
                    quantity: clampQty(
                      product,
                      item.quantity + 1
                    ),
                  }
                : item
            );
          }

          return [
            ...current,
            {
              product,
              quantity: 1,
            },
          ];
        });
      },

      addMany: (incoming: AddManyInput) => {
        setItems((current) => {
          const map = new Map(
            current.map((item) => [
              item.product.id,
              item,
            ])
          );

          for (const next of incoming) {
            if (next.product.stock <= 0) {
              continue;
            }

            const existing = map.get(next.product.id);

            const incomingQuantity = Math.max(
              1,
              next.quantity
            );

            map.set(next.product.id, {
              product: next.product,
              quantity: clampQty(
                next.product,
                (existing?.quantity || 0) +
                  incomingQuantity
              ),
            });
          }

          return [...map.values()];
        });
      },

      remove: (id: string) => {
        setItems((current) =>
          current.filter(
            (item) => item.product.id !== id
          )
        );
      },

      setQty: (id: string, quantity: number) => {
        setItems((current) =>
          current.flatMap((item) => {
            if (item.product.id !== id) {
              return [item];
            }

            if (quantity < 1) {
              return [];
            }

            return [
              {
                ...item,
                quantity: clampQty(
                  item.product,
                  quantity
                ),
              },
            ];
          })
        );
      },

      clear: () => {
        setItems([]);
      },
    };
  }, [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}