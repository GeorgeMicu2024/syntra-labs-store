"use client";

import type { Product } from "@/lib/products";
import { useCart } from "@/components/CartProvider";

export default function AddButton({ product }: { product: Product }) {
  const { add } = useCart();
  const unavailable = product.stock <= 0;

  function addToCart() {
    if (unavailable) return;
    add(product);
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  return (
    <button className="product-primary-action" onClick={addToCart} disabled={unavailable}>
      {unavailable ? "Out of stock" : "Add to cart"}
      {!unavailable && <span>→</span>}
    </button>
  );
}
