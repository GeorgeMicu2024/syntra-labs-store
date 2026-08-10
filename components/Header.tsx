"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "./AuthProvider";
import NotificationBell from "./NotificationBell";
import { useWishlist } from "./WishlistProvider";

const links = [
  ["/", "Home"],
  ["/shop", "Shop"],
  ["/offers", "Offers"],
  ["/research", "Research"],
  ["/standards", "Standards"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;

const tickerItems = [
  "FREE UK SHIPPING",
  "ORDER BY 12:00 · SAME-DAY DISPATCH",
  "20% FIRST REGISTERED ORDER",
  "10% RETURNING CUSTOMER PRICING",
  "LIVE STOCK & PRICING",
  "SECURE STRIPE CHECKOUT",
  "RESEARCH USE ONLY",
  "DIRECT UK SUPPORT",
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { user, profile } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function openCart() {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("syntra:open-cart"));
  }

  const accountLabel = user
    ? profile?.first_name || user.email?.split("@")[0] || "Account"
    : "Sign in";

  return (
    <>
      <div className="research-ticker" aria-label="Syntra Labs catalogue information">
        <div className="research-ticker-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span key={`${item}-${index}`}>
              <i /> {item}
            </span>
          ))}
        </div>
      </div>

      <header className="site-header premium-header">
        <Link className="brand" href="/" onClick={() => setMenuOpen(false)} aria-label="Syntra Labs home">
          <span className="brandmark">SL</span>
          <span className="brand-text">
            SYNTRA
            <small>LABS</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="header-search" aria-label="Search catalogue" onClick={() => window.dispatchEvent(new CustomEvent("syntra:open-search"))}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="v7-search-shortcut">⌘K</span>
          </button>

          <NotificationBell />

          <Link className={`header-account ${pathname.startsWith("/account") ? "active" : ""}`} href="/account" aria-label="Customer account">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
            </svg>
            <span>{accountLabel}</span>
            {wishlistCount > 0 && <b className="v10-saved-count" title={`${wishlistCount} saved product${wishlistCount === 1 ? "" : "s"}`}>{wishlistCount}</b>}
            {user && <i className="account-live-dot" />}
          </Link>

          <button type="button" className="header-cart" onClick={openCart} aria-label={`Open cart with ${count} items`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="20" r="1" />
              <circle cx="19" cy="20" r="1" />
              <path d="M3 4h2l2.5 11h10.5l2-7H7" />
            </svg>
            <span className="cart-label">Cart</span>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>

          <button
            type="button"
            className={`mobile-menu-button ${menuOpen ? "open" : ""}`}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`mobile-navigation ${menuOpen ? "open" : ""}`}>
          <nav aria-label="Mobile navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={isActive(href) ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                <span>{label}</span>
                <b>↗</b>
              </Link>
            ))}
            <Link href="/account" className={pathname.startsWith("/account") ? "active" : ""} onClick={() => setMenuOpen(false)}>
              <span>{user ? `Account · ${accountLabel}` : "Register / Sign in"}</span>
              <b>↗</b>
            </Link>
          </nav>
          <div className="mobile-nav-footer">
            <strong>SYNTRA LABS</strong>
            <small>Free UK shipping · 12:00 dispatch cutoff</small>
          </div>
        </div>
      </header>

      {menuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
