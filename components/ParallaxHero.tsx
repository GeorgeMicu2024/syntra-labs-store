"use client";

import Link from "next/link";
import { useRef } from "react";

export default function ParallaxHero() {
  const frame = useRef<HTMLElement>(null);

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    const node = frame.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--hero-x", `${x * 14}px`);
    node.style.setProperty("--hero-y", `${y * 9}px`);
  }

  function reset() {
    frame.current?.style.setProperty("--hero-x", "0px");
    frame.current?.style.setProperty("--hero-y", "0px");
  }

  return (
    <section className="premium-hero" ref={frame} onMouseMove={handleMove} onMouseLeave={reset}>
      <div className="premium-hero-copy">
        <p className="premium-kicker">Complete stock list</p>
        <h1>Shop all <span>products.</span></h1>
        <p>One catalogue, one cart and one secure checkout.<br />Prices shown per vial in GBP.</p>
        <div className="premium-trust-grid">
          <article><i>◇</i><div><b>Research use only</b><small>Not for human or veterinary use</small></div></article>
          <article><i>△</i><div><b>Premium quality</b><small>Clear product coding and presentation</small></div></article>
          <article><i>▣</i><div><b>Secure checkout</b><small>Encrypted payments with Stripe</small></div></article>
        </div>
        <div className="premium-hero-actions">
          <Link href="/shop" className="premium-button">Explore catalogue</Link>
          <Link href="/standards" className="premium-button ghost">View standards</Link>
        </div>
      </div>
      <div className="premium-hero-art" aria-label="Syntra Labs premium vial display">
        <img src="/design/hero-vials.jpg" alt="Syntra Labs research vial display" />
      </div>
    </section>
  );
}
