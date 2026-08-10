"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import { useCart } from "./CartProvider";

const categories = [
  "All",
  "Metabolic",
  "Peptide",
  "Cellular",
  "Hormone",
  "Lab Supplies",
] as const;

type ShopClientProps = {
  products: Product[];
};

export default function ShopClient({
  products,
}: ShopClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const {
    items,
    total,
    setQty,
    remove,
  } = useCart();

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category;

      const searchableText =
        `${product.name} ${product.code} ${product.strength}`
          .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [products, query, category]);

  async function checkout() {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Checkout is currently unavailable."
        );
      }

      if (!data.url) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      window.location.href = data.url;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Checkout unavailable"
      );
    }
  }

  return (
    <>
      {/* SEARCH + FILTERS */}

      <section className="shop-tools">
        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search name, strength or code"
          aria-label="Search products"
        />

        <div>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item ? "active" : ""
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <b>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "PRODUCT"
            : "PRODUCTS"}
        </b>
      </section>

      {/* PRODUCT GRID */}

      <section className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </section>

      {/* CART */}

      <section
        id="cart"
        className="cart-panel"
      >
        <div>
          <span className="kicker">
            YOUR ORDER
          </span>

          <h2>Shopping cart</h2>
        </div>

        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.product.id}>
                  <img
                    src={item.product.image}
                    alt={`${item.product.name} ${item.product.strength}`}
                  />

                  <span>
                    <b>{item.product.name}</b>

                    <small>
                      {item.product.strength}
                    </small>
                  </span>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={item.quantity}
                    aria-label={`Quantity for ${item.product.name}`}
                    onChange={(event) =>
                      setQty(
                        item.product.id,
                        Number(event.target.value)
                      )
                    }
                  />

                  <strong>
                    £
                    {(
                      item.product.price *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    aria-label={`Remove ${item.product.name}`}
                    onClick={() =>
                      remove(item.product.id)
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <span>Total</span>

              <b>£{total.toFixed(2)}</b>

              <button
                type="button"
                onClick={checkout}
              >
                Secure checkout
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}