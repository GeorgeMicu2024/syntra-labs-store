"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { displayProductName } from "@/lib/display";

export default function CartDrawer() {
  const { items, total, setQty, remove } = useCart();
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("syntra:open-cart", handler);
    return () => window.removeEventListener("syntra:open-cart", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function checkout() {
    if (!items.length) return;

    try {
      setCheckingOut(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.product.id, quantity: item.quantity })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Checkout is currently unavailable.");
      if (!data.url) throw new Error("Stripe Checkout URL was not returned.");
      window.location.href = data.url;
    } catch (error) {
      setCheckingOut(false);
      alert(error instanceof Error ? error.message : "Checkout unavailable");
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        className={`cart-drawer-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="cart-drawer-header">
          <div>
            <span className="kicker">YOUR ORDER</span>
            <h2>Shopping cart</h2>
          </div>
          <button type="button" className="cart-drawer-close" onClick={() => setOpen(false)} aria-label="Close cart">
            ×
          </button>
        </div>

        <div className="cart-drawer-content">
          {!items.length ? (
            <div className="cart-empty-state">
              <div className="cart-empty-symbol">SL</div>
              <h3>Your cart is empty</h3>
              <p>Browse the research catalogue and add a material to begin your order.</p>
              <button type="button" onClick={() => setOpen(false)}>Continue browsing</button>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {items.map((item) => {
                const maxQty = Math.max(1, Math.min(10, item.product.stock || 10));
                return (
                  <article className="cart-drawer-item" key={item.product.id}>
                    <div className="cart-item-image">
                      <img src={item.product.image} alt={`${displayProductName(item.product.name)} ${item.product.strength}`} />
                    </div>
                    <div className="cart-item-info">
                      <span className="cart-item-category">{item.product.category}</span>
                      <h3>{displayProductName(item.product.name)}</h3>
                      <small>{item.product.strength} · {item.product.code}</small>
                      <strong>£{(item.product.price * item.quantity).toFixed(2)}</strong>
                      <div className="cart-item-actions">
                        <div className="quantity-control" aria-label={`Quantity for ${displayProductName(item.product.name)}`}>
                          <button type="button" onClick={() => setQty(item.product.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQty(item.product.id, Math.min(maxQty, item.quantity + 1))}
                            aria-label="Increase quantity"
                            disabled={item.quantity >= maxQty}
                          >
                            +
                          </button>
                        </div>
                        <button type="button" className="cart-remove" onClick={() => remove(item.product.id)}>Remove</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {!!items.length && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row"><span>Items</span><strong>{count}</strong></div>
            <div className="cart-summary-row total"><span>Total</span><strong>£{total.toFixed(2)}</strong></div>
            <button type="button" className="cart-checkout-button" disabled={checkingOut} onClick={checkout}>
              {checkingOut ? "Opening secure checkout…" : "Secure checkout"}
            </button>
            <div className="checkout-trust-row">
              <span>Encrypted checkout</span>
              <span>UK shipping</span>
              <span>Stripe</span>
            </div>
          </div>
        )}
      </aside>

      {!!items.length && (
        <button type="button" className="mobile-cart-bar" onClick={() => setOpen(true)}>
          <span><b>{count}</b> item{count === 1 ? "" : "s"} in cart</span>
          <strong>£{total.toFixed(2)}</strong>
        </button>
      )}
    </>
  );
}
