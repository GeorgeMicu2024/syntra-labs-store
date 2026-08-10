"use client";

import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { useCart } from "./CartProvider";

export default function MobileProductBar({ product }: { product: Product }) {
  const { add, count } = useCart();
  const unavailable = product.stock <= 0;

  function addToCart() {
    if (unavailable) return;
    add(product);
    window.dispatchEvent(
      new CustomEvent("syntra:toast", {
        detail: {
          message: `${displayProductName(product.name)} added to cart`,
          detail: `${product.strength} · £${product.price.toFixed(2)}`,
        },
      })
    );
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  return (
    <div className={`v8-mobile-product-bar ${count > 0 ? "cart-active" : ""}`}>
      <div>
        <small>{product.strength}</small>
        <strong>£{product.price.toFixed(2)}</strong>
      </div>
      <button type="button" disabled={unavailable} onClick={addToCart}>
        {unavailable ? "Out of stock" : "Add to basket"}
      </button>
    </div>
  );
}
