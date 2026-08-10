"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

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
        `${product.name} ${product.code} ${product.strength}`.toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [products, query, category]);

  const cartCount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [items]
  );

  useEffect(() => {
    function handleOpenCart() {
      setCartOpen(true);
    }

    window.addEventListener(
      "syntra:open-cart",
      handleOpenCart
    );

    return () => {
      window.removeEventListener(
        "syntra:open-cart",
        handleOpenCart
      );
    };
  }, []);

  useEffect(() => {
    if (!cartOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  async function checkout() {
    if (items.length === 0) {
      return;
    }

    try {
      setCheckingOut(true);

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

      setCheckingOut(false);
    }
  }

  return (
    <>
      {/* SHOP TOOLBAR */}

      <section className="shop-tools shop-tools-modern">
        <div className="shop-search-wrap">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search products..."
            aria-label="Search products"
          />
        </div>

        <div className="shop-category-tabs">
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

        <div className="shop-product-count">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}
        </div>
      </section>

      {/* PRODUCT GRID */}

      <section className="product-grid shop-product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <div className="shop-empty">
            <h3>No products found</h3>

            <p>
              Try another search term or category.
            </p>
          </div>
        )}
      </section>

      {/* CART OVERLAY */}

      <button
        type="button"
        aria-label="Close cart"
        className={`cart-drawer-overlay ${
          cartOpen ? "open" : ""
        }`}
        onClick={() => setCartOpen(false)}
      />

      {/* CART DRAWER */}

      <aside
        className={`cart-drawer ${
          cartOpen ? "open" : ""
        }`}
        aria-hidden={!cartOpen}
      >
        <div className="cart-drawer-header">
          <div>
            <span className="kicker">
              YOUR ORDER
            </span>

            <h2>Shopping cart</h2>
          </div>

          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="cart-drawer-content">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                🛒
              </div>

              <h3>Your cart is empty</h3>

              <p>
                Add a product from the catalogue
                to get started.
              </p>

              <button
                type="button"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {items.map((item) => (
                <article
                  className="cart-drawer-item"
                  key={item.product.id}
                >
                  <div className="cart-item-image">
                    <img
                      src={item.product.image}
                      alt={`${item.product.name} ${item.product.strength}`}
                    />
                  </div>

                  <div className="cart-item-info">
                    <span className="cart-item-category">
                      {item.product.category}
                    </span>

                    <h3>
                      {item.product.name}
                    </h3>

                    <small>
                      {item.product.strength}
                    </small>

                    <strong>
                      £
                      {(
                        item.product.price *
                        item.quantity
                      ).toFixed(2)}
                    </strong>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease quantity for ${item.product.name}`}
                          onClick={() =>
                            setQty(
                              item.product.id,
                              Math.max(
                                1,
                                item.quantity - 1
                              )
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase quantity for ${item.product.name}`}
                          onClick={() =>
                            setQty(
                              item.product.id,
                              Math.min(
                                10,
                                item.quantity + 1
                              )
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() =>
                          remove(item.product.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>
                Items
              </span>

              <strong>
                {cartCount}
              </strong>
            </div>

            <div className="cart-summary-row total">
              <span>
                Total
              </span>

              <strong>
                £{total.toFixed(2)}
              </strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              disabled={checkingOut}
              onClick={checkout}
            >
              {checkingOut
                ? "Opening secure checkout..."
                : "Secure checkout"}
            </button>

            <small className="cart-secure-note">
              Secure payment powered by Stripe
            </small>
          </div>
        )}
      </aside>

      {/* MOBILE STICKY CART */}

      {items.length > 0 && (
        <button
          type="button"
          className="mobile-cart-bar"
          onClick={() => setCartOpen(true)}
        >
          <span className="mobile-cart-bar-left">
            <span className="mobile-cart-icon">
              🛒
            </span>

            <span>
              Cart ({cartCount})
            </span>
          </span>

          <strong>
            £{total.toFixed(2)}
          </strong>
        </button>
      )}
    </>
  );
}