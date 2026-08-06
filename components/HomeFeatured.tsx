"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { products } from "@/lib/products";

const ids = ["rt30", "rt20", "rt5", "tr5", "tr10", "bpc10"];

const selected = ids
  .map((id) => products.find((product) => product.id === id))
  .filter((product): product is (typeof products)[number] => Boolean(product));

export default function HomeFeatured() {
  const { add } = useCart();

  return (
    <section className="premium-catalogue-shell">
      <div className="premium-featured-grid">
        {selected.map((product, index) => (
          <article className="premium-product-card" key={product.id}>
            <Link
              href={`/product/${product.slug}`}
              className="premium-product-image"
            >
              <span>Research use only</span>

              <img
                src={product.image}
                alt={`${product.name} ${product.strength}`}
                loading="lazy"
              />
            </Link>

            <div className="premium-product-details">
              <small>{product.category}</small>

              <div className="premium-product-title">
                <Link href={`/product/${product.slug}`}>
                  {product.name.replace(/ \(.+\)/, "")}
                </Link>

                <em>{product.strength}</em>
              </div>

              <div className="premium-rating">
                ★★★★★ <span>({54 + index * 14})</span>
              </div>

              <strong>£{product.price.toFixed(2)}</strong>

              <button type="button" onClick={() => add(product)}>
                🛒 Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="premium-service-strip">
        <article>
          <i>▱</i>
          <div>
            <b>Discreet shipping</b>
            <span>Fast, protected delivery across the UK</span>
          </div>
        </article>

        <article>
          <i>✥</i>
          <div>
            <b>Quality presentation</b>
            <span>Clear references on every product</span>
          </div>
        </article>

        <article>
          <i>◉</i>
          <div>
            <b>Expert support</b>
            <span>Direct help when you need it</span>
          </div>
        </article>

        <article>
          <i>▣</i>
          <div>
            <b>Secure payments</b>
            <span>Encrypted Stripe checkout</span>
          </div>
        </article>
      </div>
    </section>
  );
}