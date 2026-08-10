"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { getResearchProfile } from "@/lib/research";
import {
  getAvailabilityMessage,
  getSavings,
  getStockLabel,
  getStockState,
  hasDiscount,
} from "@/lib/commerce";
import { useCart } from "./CartProvider";

export default function QuickView() {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { add } = useCart();

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<Product>;
      if (!custom.detail) return;
      setProduct(custom.detail);
      setQuantity(1);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProduct(null);
    };

    window.addEventListener("syntra:quick-view", handler);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("syntra:quick-view", handler);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  if (!product) return null;

  const research = getResearchProfile(product.id);
  const savings = getSavings(product);
  const stockState = getStockState(product.stock);
  const name = displayProductName(product.name);
  const maxQuantity = Math.max(1, Math.min(10, product.stock));

  function addProduct() {
    if (!product || product.stock <= 0) return;

    for (let index = 0; index < quantity; index += 1) add(product);

    window.dispatchEvent(
      new CustomEvent("syntra:toast", {
        detail: {
          message: `${name} added to cart`,
          detail: `${quantity} × ${product.strength} · £${(product.price * quantity).toFixed(2)}`,
        },
      })
    );

    setProduct(null);
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  return (
    <div className="v8-quick-overlay" role="dialog" aria-modal="true" aria-labelledby="v8-quick-title">
      <button className="v8-quick-backdrop" onClick={() => setProduct(null)} aria-label="Close quick view" />

      <div className="v8-quick-panel">
        <button ref={closeRef} className="v8-quick-close" type="button" onClick={() => setProduct(null)} aria-label="Close quick view">×</button>

        <div className="v8-quick-visual">
          <div className="v8-quick-badges">
            <span>{product.category}</span>
            <span>SL-{product.code}</span>
          </div>

          <div className="v8-quick-image-stage">
            <div className="v8-quick-orbit" aria-hidden="true" />
            <Image src={product.image} alt={`${name} ${product.strength}`} width={760} height={760} priority />
          </div>

          {hasDiscount(product) && savings && (
            <div className="v8-quick-offer">
              <b>{savings.percent}% OFF</b>
              <span>Save £{savings.amount.toFixed(2)}</span>
            </div>
          )}

          <div className="v8-quick-spec-ribbon">
            <span><small>FORMAT</small><b>{product.strength}</b></span>
            <span><small>STATUS</small><b>{getStockLabel(product.stock)}</b></span>
            <span><small>USE</small><b>Research only</b></span>
          </div>
        </div>

        <div className="v8-quick-info">
          <span className="kicker">QUICK RESEARCH VIEW</span>
          <h2 id="v8-quick-title">{name}</h2>
          <div className="v8-quick-strength">{product.strength}</div>

          <p className="v8-quick-lead">{research?.researchClass || product.short}</p>

          <div className="v8-quick-signals">
            <article><small>EVIDENCE</small><b>{research?.tier || "Catalogue reference"}</b></article>
            <article><small>FOCUS AREAS</small><b>{research?.focus.length || 0}</b></article>
            <article><small>REFERENCES</small><b>{research?.references.length || 0}</b></article>
          </div>

          {research && (
            <div className="v8-quick-focus">
              {research.focus.slice(0, 3).map((item, index) => (
                <span key={item}><i>0{index + 1}</i>{item}</span>
              ))}
            </div>
          )}

          <div className="v8-quick-commerce">
            <div className="v8-quick-price">
              <small>{hasDiscount(product) ? "CURRENT OFFER" : "CATALOGUE PRICE"}</small>
              <div><strong>£{product.price.toFixed(2)}</strong>{product.compareAtPrice && hasDiscount(product) && <del>£{product.compareAtPrice.toFixed(2)}</del>}</div>
            </div>

            <div className={`v8-quick-stock ${stockState}`}>
              <b><i />{getStockLabel(product.stock)}</b>
              <small>{getAvailabilityMessage(product.stock)}</small>
            </div>
          </div>

          <div className="v8-quick-purchase-row">
            <div className="v8-quantity" aria-label="Quantity selector">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} aria-label="Increase quantity">＋</button>
            </div>

            <button className="v8-quick-add" type="button" onClick={addProduct} disabled={product.stock <= 0}>
              {product.stock <= 0 ? "Out of stock" : `Add ${quantity} to basket`}
              {product.stock > 0 && <span>→</span>}
            </button>
          </div>

          <Link className="v8-quick-dossier-link" href={`/product/${product.slug}`} onClick={() => setProduct(null)}>
            Open full research dossier <span>↗</span>
          </Link>

          <div className="v8-quick-note">
            <b>Compound literature is kept separate from catalogue-item claims.</b>
            <span>Research notes do not constitute medical, dosing, administration or veterinary guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
