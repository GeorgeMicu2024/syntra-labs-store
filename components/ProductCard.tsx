"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { getResearchProfile } from "@/lib/research";
import {
  getAvailabilityMessage,
  getCommerceHighlights,
  getPrimaryBadge,
  getSavings,
  getStockLabel,
  getStockState,
  hasDiscount,
} from "@/lib/commerce";
import { useCart } from "./CartProvider";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const unavailable = product.stock <= 0;
  const research = getResearchProfile(product.id);
  const name = displayProductName(product.name);
  const savings = getSavings(product);
  const stockState = getStockState(product.stock);
  const highlights = getCommerceHighlights(product).slice(0, 3);

  function addToCart() {
    if (unavailable) return;
    add(product);
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  return (
    <article className={`v6-product-card ${hasDiscount(product) ? "is-offer" : ""}`}>
      <Link href={`/product/${product.slug}`} className="v6-product-visual">
        <div className="v6-card-topline">
          <span className="v6-card-class">{product.category.toUpperCase()}</span>
          <span className={`v6-stock-chip ${stockState}`}><i />{getStockLabel(product.stock)}</span>
        </div>

        {hasDiscount(product) && (
          <span className="v6-offer-ribbon">{getPrimaryBadge(product)}</span>
        )}

        <Image
          src={product.image}
          alt={`${name} ${product.strength}`}
          width={720}
          height={720}
          className="v6-product-image"
        />

        <div className="v6-image-footer">
          <span>SL-{product.code}</span>
          <span>RESEARCH USE ONLY</span>
        </div>
      </Link>

      <div className="v6-product-body">
        <div className="v6-product-heading">
          <div>
            <h3><Link href={`/product/${product.slug}`}>{name}</Link></h3>
            <span>{product.strength}</span>
          </div>
          {research && <small>{research.tier}</small>}
        </div>

        <p className="v6-product-description">{research?.researchClass || product.short}</p>

        <div className="v6-highlight-grid">
          {highlights.map((item, index) => (
            <span key={item}><i>{index + 1}</i>{item}</span>
          ))}
        </div>

        <div className="v6-price-zone">
          <div className="v6-price-main">
            <small>{hasDiscount(product) ? "CURRENT OFFER" : "CATALOGUE PRICE"}</small>
            <div>
              <strong>£{product.price.toFixed(2)}</strong>
              {hasDiscount(product) && product.compareAtPrice && (
                <del>£{product.compareAtPrice.toFixed(2)}</del>
              )}
            </div>
          </div>

          {savings && (
            <div className="v6-save-block">
              <span>SAVE</span>
              <strong>£{savings.amount.toFixed(2)}</strong>
              <small>{savings.percent}% OFF</small>
            </div>
          )}
        </div>

        <div className={`v6-live-bar ${stockState}`}>
          <span><i />{getStockLabel(product.stock)}</span>
          <small>{getAvailabilityMessage(product.stock)}</small>
        </div>

        <div className="v6-card-actions">
          <Link href={`/product/${product.slug}`} className="v6-view-details">
            View details <span>↗</span>
          </Link>
          <button type="button" disabled={unavailable} onClick={addToCart}>
            {unavailable ? "Out of stock" : "Add to basket"}
            {!unavailable && <span>＋</span>}
          </button>
        </div>
      </div>
    </article>
  );
}
