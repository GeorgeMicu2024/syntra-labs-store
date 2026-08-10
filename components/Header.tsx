"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { count } = useCart();
  const pathname = usePathname();

  const links = [
    ["/shop", "Shop"],
    ["/standards", "Standards"],
    ["/about", "About"],
    ["/contact", "Contact"],
  ];

  function openCart() {
    setMenuOpen(false);

    window.dispatchEvent(
      new CustomEvent("syntra:open-cart")
    );
  }

  return (
    <>
      {/* TOP NOTICE */}

      <div className="notice premium-notice">
        <span className="notice-left">
          🇬🇧 UK BASED
          <i>•</i>
          DISCREET SHIPPING
          <i>•</i>
          PREMIUM QUALITY
        </span>

        <strong className="notice-center">
          LABORATORY RESEARCH MATERIALS ONLY — NOT FOR
          HUMAN OR VETERINARY USE
        </strong>

        <span className="notice-right">
          2026 CATALOGUE
        </span>
      </div>

      {/* MAIN HEADER */}

      <header className="site-header premium-header">
        {/* BRAND */}

        <Link
          className="brand"
          href="/"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brandmark">
            SL
          </span>

          <span className="brand-text">
            SYNTRA
            <small>LABS</small>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}

        <nav className="desktop-nav">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href ? "active" : ""
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* HEADER ACTIONS */}

        <div className="header-actions">
          <Link
            href="/shop"
            className="header-search"
            aria-label="Search products"
          >
            <svg
              width="20"
              height="20"
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
          </Link>

          <button
            type="button"
            className="header-cart"
            onClick={openCart}
            aria-label={`Open shopping cart with ${count} items`}
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="20" r="1" />
              <circle cx="19" cy="20" r="1" />

              <path d="M3 4h2l2.5 11h10.5l2-7H7" />
            </svg>

            <span className="cart-label">
              Cart
            </span>

            {count > 0 && (
              <span className="cart-count">
                {count}
              </span>
            )}
          </button>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            className={`mobile-menu-button ${
              menuOpen ? "open" : ""
            }`}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((current) => !current)
            }
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* MOBILE NAVIGATION */}

        <div
          className={`mobile-navigation ${
            menuOpen ? "open" : ""
          }`}
        >
          <nav>
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href ? "active" : ""
                }
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {label}

                <span>→</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-nav-footer">
            <span>
              SYNTRA LABS
            </span>

            <small>
              Laboratory research materials
            </small>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}

      {menuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label="Close navigation"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}
    </>
  );
}