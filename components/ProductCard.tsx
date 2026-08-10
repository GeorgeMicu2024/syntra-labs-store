"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "./CartProvider";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { add } = useCart();

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  function addToCart() {
    if (outOfStock) return;

    add(product);

    // Open cart automatically after adding a product
    window.dispatchEvent(
      new CustomEvent("syntra:open-cart")
    );
  }

  return (
    <article className="product-card product-card-modern">

      {/* PRODUCT IMAGE */}

      <Link
        href={`/product/${product.slug}`}
        className="product-image product-image-modern"
      >
        <div className="product-card-badges">
          <span className="research-badge">
            RESEARCH USE ONLY
          </span>

          {product.featured && (
            <span className="featured-badge">
              FEATURED
            </span>
          )}
        </div>

        <Image
          src={product.image}
          alt={`${product.name} ${product.strength}`}
          width={900}
          height={900}
          className="product-card-image"
        />

        <div className="product-image-glow" />
      </Link>

      {/* PRODUCT INFORMATION */}

      <div className="product-body product-body-modern">

        <div className="product-card-topline">
          <span className="product-category">
            {product.category}
          </span>

          <span className="product-code">
            {product.code}
          </span>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="product-title-link"
        >
          <h3>{product.name}</h3>
        </Link>

        <div className="product-strength">
          {product.strength}
        </div>

        <p className="product-description">
          {product.short}
        </p>

        {/* PRICE + STOCK */}

        <div className="product-purchase-info">
          <div className="product-price">
            <small>PRICE</small>

            <strong>
              £{product.price.toFixed(2)}
            </strong>
          </div>

          <div
            className={`product-stock ${
              outOfStock
                ? "out"
                : lowStock
                  ? "low"
                  : "available"
            }`}
          >
            <span />

            {outOfStock
              ? "Out of stock"
              : lowStock
                ? "Low stock"
                : "In stock"}
          </div>
        </div>

        {/* ACTIONS */}

        <div className="product-card-actions">
          <button
            type="button"
            className="product-add-button"
            disabled={outOfStock}
            onClick={addToCart}
          >
            {outOfStock ? (
              "Out of stock"
            ) : (
              <>
                <span>Add to cart</span>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>

          <Link
            href={`/product/${product.slug}`}
            className="product-view-button"
            aria-label={`View ${product.name}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>

      </div>
    </article>
  );
}