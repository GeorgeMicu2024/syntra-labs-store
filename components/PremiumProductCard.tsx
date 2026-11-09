"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { getSavings, getStockLabel, hasDiscount } from "@/lib/commerce";
import { useCart } from "./CartProvider";

export default function PremiumProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const name = displayProductName(product.name);
  const savings = getSavings(product);
  const unavailable = product.stock <= 0;

  function addToCart() {
    if (unavailable) return;
    add(product);
    window.dispatchEvent(new CustomEvent("syntra:toast", {
      detail: { message: `${name} added to cart`, detail: `${product.strength} · £${product.price.toFixed(2)}` },
    }));
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  return (
    <article className="premium-v2-product-card">
      <Link href={`/product/${product.slug}`} className="premium-v2-product-image" aria-label={`View ${name} ${product.strength}`}>
        <Image src={product.image} alt={`${name} ${product.strength}`} width={450} height={450} sizes="(max-width: 620px) 45vw, (max-width: 1020px) 28vw, 23vw" />
        {savings && <span className="premium-v2-product-discount">{savings.percent}% OFF</span>}
      </Link>
      <div className="premium-v2-product-details">
        <span className="premium-v2-product-type">{product.category} / SL-{product.code}</span>
        <h3><Link href={`/product/${product.slug}`}>{name}</Link></h3>
        <span className="premium-v2-product-strength">{product.strength} · Research use only</span>
        <div className="premium-v2-price-row">
          <strong>£{product.price.toFixed(2)}</strong>
          {hasDiscount(product) && product.compareAtPrice && <del>£{product.compareAtPrice.toFixed(2)}</del>}
        </div>
        <div className={`premium-v2-stock ${unavailable ? "is-unavailable" : ""}`}><i />{getStockLabel(product.stock)}</div>
        <button type="button" disabled={unavailable} className="premium-v2-card-button" onClick={addToCart}>
          {unavailable ? "Unavailable" : "Add to basket"}<span aria-hidden="true">{unavailable ? "" : "+"}</span>
        </button>
      </div>
    </article>
  );
}
