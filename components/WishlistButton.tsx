"use client";

import type { Product } from "@/lib/products";
import { useWishlist } from "./WishlistProvider";

export default function WishlistButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { isSaved, toggle } = useWishlist();
  const active = isSaved(product.id);

  return (
    <button
      type="button"
      className={`v10-wishlist-button ${compact ? "compact" : ""} ${active ? "active" : ""}`}
      aria-label={active ? `Remove ${product.name} from saved products` : `Save ${product.name}`}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle(product);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
      {!compact && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
