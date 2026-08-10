"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import { displayProductName } from "@/lib/display";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { getDispatchState } from "@/lib/shipping";

type CheckoutResponse = {
  url?: string;
  error?: string;

  member?: boolean;
  discountPercent?: number;
  discountType?: string;

  subtotal?: number;
  discountAmount?: number;
  creditApplied?: number;
  total?: number;
};

export default function CartDrawer() {
  const { items, total, setQty, remove } = useCart();

  const {
    user,
    rewards,
    discountPercent,
    discountLabel,
  } = useAuth();

  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [useCredit, setUseCredit] = useState(false);

  const [dispatch, setDispatch] = useState(() =>
    getDispatchState()
  );

  /*
   * ---------------------------------------------------------
   * CART TOTALS
   * ---------------------------------------------------------
   */

  const count = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [items]
  );

  const memberSavings =
    user && discountPercent > 0
      ? total * (discountPercent / 100)
      : 0;

  const memberTotal = user
    ? Math.max(0, total - memberSavings)
    : total;

  const availableCredit =
    Number(rewards?.store_credit_pence || 0) / 100;

  /*
   * Keep a minimum Stripe payable amount so we do not attempt
   * to create a zero-value card payment accidentally.
   *
   * The API must independently calculate this again.
   */
  const estimatedCredit =
    user && useCredit
      ? Math.min(
          availableCredit,
          Math.max(0, memberTotal - 0.5)
        )
      : 0;

  const payableTotal = Math.max(
    0,
    memberTotal - estimatedCredit
  );

  /*
   * ---------------------------------------------------------
   * OPEN CART EVENT
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const handler = () => setOpen(true);

    window.addEventListener(
      "syntra:open-cart",
      handler
    );

    return () => {
      window.removeEventListener(
        "syntra:open-cart",
        handler
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOCK BODY WHEN DRAWER IS OPEN
   * ---------------------------------------------------------
   */

  useEffect(() => {
    document.body.style.overflow = open
      ? "hidden"
      : "";

    if (open) {
      setDispatch(getDispatchState());
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /*
   * ---------------------------------------------------------
   * CHECKOUT
   * ---------------------------------------------------------
   */

  async function checkout() {
    if (!items.length || checkingOut) {
      return;
    }

    try {
      setCheckingOut(true);

      /*
       * Send the Supabase access token to the server.
       * This is what lets /api/checkout identify the
       * currently signed-in customer securely.
       */
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const supabase = getBrowserSupabase();

      if (user && !supabase) {
        throw new Error(
          "Your account session could not be verified. Please refresh the page and try again."
        );
      }

      if (supabase) {
        const {
          data: sessionData,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Supabase session error:",
            sessionError
          );
        }

        const accessToken =
          sessionData.session?.access_token;

        /*
         * If the frontend believes that the visitor is logged
         * in but there is no access token, do NOT silently send
         * them to Stripe as a guest.
         */
        if (user && !accessToken) {
          throw new Error(
            "Your member session has expired. Please sign in again to keep your member pricing."
          );
        }

        if (accessToken) {
          headers.Authorization =
            `Bearer ${accessToken}`;
        }
      }

      const response = await fetch(
        "/api/checkout",
        {
          method: "POST",
          headers,

          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.product.id,
              quantity: item.quantity,
            })),

            useCredit,
          }),
        }
      );

      const data =
        (await response
          .json()
          .catch(() => ({}))) as CheckoutResponse;

      console.log(
        "CHECKOUT RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Checkout is currently unavailable."
        );
      }

      /*
       * -------------------------------------------------------
       * MEMBER PRICING SECURITY CHECK
       * -------------------------------------------------------
       *
       * The frontend display is informational.
       * The API is the source of truth.
       *
       * If UI says 20% but API says guest / 0%, stop checkout.
       */

      if (user) {
        if (data.member !== true) {
          throw new Error(
            "Your member account could not be verified securely. Please sign in again before checkout."
          );
        }

        if (
          typeof data.discountPercent !== "number"
        ) {
          throw new Error(
            "Stripe Checkout could not verify your member discount. Please refresh and try again."
          );
        }

        if (
          data.discountPercent !== discountPercent
        ) {
          console.error(
            "Member discount mismatch",
            {
              frontendDiscount:
                discountPercent,
              serverDiscount:
                data.discountPercent,
              discountType:
                data.discountType,
            }
          );

          throw new Error(
            `Your ${discountPercent}% member discount could not be verified. Please refresh the page or sign in again before checkout.`
          );
        }
      }

      /*
       * Guest must not unexpectedly receive an authenticated
       * member price due to stale state.
       */
      if (!user && data.member === true) {
        throw new Error(
          "Your checkout session changed. Please refresh the page and try again."
        );
      }

      /*
       * -------------------------------------------------------
       * OPTIONAL TOTAL CROSS-CHECK
       * -------------------------------------------------------
       */

      if (
        typeof data.total === "number"
      ) {
        const serverTotal = Number(
          data.total.toFixed(2)
        );

        const displayedTotal = Number(
          payableTotal.toFixed(2)
        );

        /*
         * Allow a tiny rounding difference.
         */
        if (
          Math.abs(
            serverTotal - displayedTotal
          ) > 0.02
        ) {
          console.error(
            "Checkout total mismatch",
            {
              displayedTotal,
              serverTotal,
              response: data,
            }
          );

          throw new Error(
            "Your checkout total has changed. Please refresh your cart before continuing."
          );
        }
      }

      if (!data.url) {
        throw new Error(
          "Stripe Checkout URL was not returned."
        );
      }

      /*
       * All checks passed.
       */
      window.location.href = data.url;
    } catch (error) {
      setCheckingOut(false);

      window.dispatchEvent(
        new CustomEvent(
          "syntra:toast",
          {
            detail:
              error instanceof Error
                ? error.message
                : "Checkout unavailable",
          }
        )
      );
    }
  }

  return (
    <>
      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Close cart"
        className={`cart-drawer-overlay ${
          open ? "open" : ""
        }`}
        onClick={() => setOpen(false)}
      />

      {/* CART DRAWER */}

      <aside
        className={`cart-drawer ${
          open ? "open" : ""
        }`}
        aria-hidden={!open}
      >
        {/* HEADER */}

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
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* CONTENT */}

        <div className="cart-drawer-content">
          {!items.length ? (
            <div className="cart-empty-state">
              <div className="cart-empty-symbol">
                SL
              </div>

              <h3>Your cart is empty</h3>

              <p>
                Browse the research catalogue
                and add a material to begin
                your order.
              </p>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <>
              {/* MEMBER PRICING */}

              <div
                className={`cart-member-callout ${
                  user
                    ? "active"
                    : "guest"
                }`}
              >
                {user ? (
                  <>
                    <span>
                      MEMBER PRICING ACTIVE
                    </span>

                    <strong>
                      {discountPercent}%
                      automatic saving
                    </strong>

                    <p>
                      {discountLabel}.
                      Eligibility and pricing
                      are verified securely
                      again before Stripe
                      Checkout opens.
                    </p>
                  </>
                ) : (
                  <>
                    <span>
                      CREATE AN ACCOUNT
                    </span>

                    <strong>
                      Unlock 20% off your
                      first paid order
                    </strong>

                    <p>
                      Returning registered
                      customers receive 10%
                      automatic member
                      pricing on subsequent
                      signed-in orders.
                    </p>

                    <div>
                      <Link
                        href="/account/register"
                        onClick={() =>
                          setOpen(false)
                        }
                      >
                        Register
                      </Link>

                      <Link
                        href="/account/sign-in"
                        onClick={() =>
                          setOpen(false)
                        }
                      >
                        Sign in
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* SHIPPING */}

              <div className="cart-shipping-callout">
                <span className="shipping-status-dot" />

                <div>
                  <strong>
                    Free UK shipping
                  </strong>

                  <small>
                    {dispatch.shortLabel}
                  </small>
                </div>
              </div>

              {/* ITEMS */}

              <div className="cart-drawer-items">
                {items.map((item) => {
                  const maxQty = Math.max(
                    1,
                    Math.min(
                      10,
                      item.product.stock ||
                        10
                    )
                  );

                  return (
                    <article
                      className="cart-drawer-item"
                      key={item.product.id}
                    >
                      <div className="cart-item-image">
                        <img
                          src={
                            item.product.image
                          }
                          alt={`${displayProductName(
                            item.product.name
                          )} ${
                            item.product
                              .strength
                          }`}
                        />
                      </div>

                      <div className="cart-item-info">
                        <span className="cart-item-category">
                          {
                            item.product
                              .category
                          }
                        </span>

                        <h3>
                          {displayProductName(
                            item.product.name
                          )}
                        </h3>

                        <small>
                          {
                            item.product
                              .strength
                          }{" "}
                          ·{" "}
                          {
                            item.product
                              .code
                          }
                        </small>

                        <strong>
                          £
                          {(
                            item.product
                              .price *
                            item.quantity
                          ).toFixed(2)}
                        </strong>

                        <div className="cart-item-actions">
                          <div
                            className="quantity-control"
                            aria-label={`Quantity for ${displayProductName(
                              item.product
                                .name
                            )}`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setQty(
                                  item
                                    .product
                                    .id,
                                  item.quantity -
                                    1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setQty(
                                  item
                                    .product
                                    .id,
                                  Math.min(
                                    maxQty,
                                    item.quantity +
                                      1
                                  )
                                )
                              }
                              aria-label="Increase quantity"
                              disabled={
                                item.quantity >=
                                maxQty
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-remove"
                            onClick={() =>
                              remove(
                                item.product.id
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}

        {!!items.length && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>
                Catalogue subtotal
              </span>

              <strong>
                £{total.toFixed(2)}
              </strong>
            </div>

            {user &&
              discountPercent > 0 && (
                <div className="cart-summary-row discount">
                  <span>
                    Member saving (
                    {discountPercent}%)
                  </span>

                  <strong>
                    −£
                    {memberSavings.toFixed(
                      2
                    )}
                  </strong>
                </div>
              )}

            {user &&
              availableCredit > 0 && (
                <label className="v10-credit-toggle">
                  <span>
                    <input
                      type="checkbox"
                      checked={
                        useCredit
                      }
                      onChange={(event) =>
                        setUseCredit(
                          event.target
                            .checked
                        )
                      }
                    />

                    <b>
                      Use Syntra credit
                    </b>
                  </span>

                  <strong>
                    £
                    {availableCredit.toFixed(
                      2
                    )}{" "}
                    available
                  </strong>
                </label>
              )}

            {estimatedCredit > 0 && (
              <div className="cart-summary-row discount">
                <span>
                  Account credit
                </span>

                <strong>
                  −£
                  {estimatedCredit.toFixed(
                    2
                  )}
                </strong>
              </div>
            )}

            <div className="cart-summary-row">
              <span>
                UK shipping
              </span>

              <strong>FREE</strong>
            </div>

            <div className="cart-summary-row total">
              <span>
                Estimated total
              </span>

              <strong>
                £
                {payableTotal.toFixed(
                  2
                )}
              </strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              disabled={checkingOut}
              onClick={checkout}
            >
              {checkingOut
                ? "Verifying member price…"
                : user &&
                    discountPercent >
                      0
                  ? `Secure checkout · ${discountPercent}% member saving`
                  : "Secure checkout"}
            </button>

            <div className="checkout-trust-row">
              <span>
                Server-verified pricing
              </span>

              <span>
                Free UK shipping
              </span>

              <span>Stripe</span>
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE CART */}

      {!!items.length && (
        <button
          type="button"
          className="mobile-cart-bar"
          onClick={() =>
            setOpen(true)
          }
        >
          <span>
            <b>{count}</b>{" "}
            item
            {count === 1
              ? ""
              : "s"}{" "}
            in cart
          </span>

          <strong>
            £
            {payableTotal.toFixed(
              2
            )}
          </strong>
        </button>
      )}
    </>
  );
}