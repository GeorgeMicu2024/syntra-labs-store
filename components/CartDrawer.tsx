"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import { displayProductName } from "@/lib/display";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { getDispatchState } from "@/lib/shipping";

export default function CartDrawer() {
  const { items, total, setQty, remove } = useCart();
  const { user, rewards, discountPercent, discountLabel } = useAuth();
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [useCredit, setUseCredit] = useState(false);
  const [dispatch, setDispatch] = useState(() => getDispatchState());

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const memberSavings = user ? total * (discountPercent / 100) : 0;
  const memberTotal = user ? Math.max(0, total - memberSavings) : total;
  const availableCredit = Number(rewards?.store_credit_pence || 0) / 100;
  const estimatedCredit = user && useCredit ? Math.min(availableCredit, Math.max(0, memberTotal - 0.5)) : 0;
  const payableTotal = Math.max(0, memberTotal - estimatedCredit);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("syntra:open-cart", handler);
    return () => window.removeEventListener("syntra:open-cart", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) setDispatch(getDispatchState());
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function checkout() {
    if (!items.length) return;

    try {
      setCheckingOut(true);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const supabase = getBrowserSupabase();
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.product.id, quantity: item.quantity })),
          useCredit,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Checkout is currently unavailable.");
      if (!data.url) throw new Error("Stripe Checkout URL was not returned.");
      window.location.href = data.url;
    } catch (error) {
      setCheckingOut(false);
      window.dispatchEvent(
        new CustomEvent("syntra:toast", {
          detail: error instanceof Error ? error.message : "Checkout unavailable",
        })
      );
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
            <>
              <div className={`cart-member-callout ${user ? "active" : "guest"}`}>
                {user ? (
                  <>
                    <span>MEMBER PRICING ACTIVE</span>
                    <strong>{discountPercent}% automatic saving</strong>
                    <p>{discountLabel}. Eligibility is verified again securely on the server before Stripe Checkout opens.</p>
                  </>
                ) : (
                  <>
                    <span>CREATE AN ACCOUNT</span>
                    <strong>Unlock 20% off your first paid order</strong>
                    <p>Returning registered customers receive 10% automatic member pricing on subsequent signed-in orders.</p>
                    <div><Link href="/account/register" onClick={() => setOpen(false)}>Register</Link><Link href="/account/sign-in" onClick={() => setOpen(false)}>Sign in</Link></div>
                  </>
                )}
              </div>

              <div className="cart-shipping-callout">
                <span className="shipping-status-dot" />
                <div><strong>Free UK shipping</strong><small>{dispatch.shortLabel}</small></div>
              </div>

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
            </>
          )}
        </div>

        {!!items.length && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row"><span>Catalogue subtotal</span><strong>£{total.toFixed(2)}</strong></div>
            {user && discountPercent > 0 && <div className="cart-summary-row discount"><span>Member saving ({discountPercent}%)</span><strong>−£{memberSavings.toFixed(2)}</strong></div>}
            {user && availableCredit > 0 && <label className="v10-credit-toggle"><span><input type="checkbox" checked={useCredit} onChange={(e) => setUseCredit(e.target.checked)} /><b>Use Syntra credit</b></span><strong>£{availableCredit.toFixed(2)} available</strong></label>}
            {estimatedCredit > 0 && <div className="cart-summary-row discount"><span>Account credit</span><strong>−£{estimatedCredit.toFixed(2)}</strong></div>}
            <div className="cart-summary-row"><span>UK shipping</span><strong>FREE</strong></div>
            <div className="cart-summary-row total"><span>Estimated total</span><strong>£{payableTotal.toFixed(2)}</strong></div>
            <button type="button" className="cart-checkout-button" disabled={checkingOut} onClick={checkout}>
              {checkingOut ? "Verifying member price…" : "Secure checkout"}
            </button>
            <div className="checkout-trust-row">
              <span>Server-verified pricing</span>
              <span>Free UK shipping</span>
              <span>Stripe</span>
            </div>
          </div>
        )}
      </aside>

      {!!items.length && (
        <button type="button" className="mobile-cart-bar" onClick={() => setOpen(true)}>
          <span><b>{count}</b> item{count === 1 ? "" : "s"} in cart</span>
          <strong>£{payableTotal.toFixed(2)}</strong>
        </button>
      )}
    </>
  );
}
