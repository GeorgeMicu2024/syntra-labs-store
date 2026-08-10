"use client";

import Link from "next/link";
import { useRef } from "react";

type Props = {
  catalogueCount: number;
  inStockCount: number;
  categoryCount: number;
};

export default function ParallaxHero({ catalogueCount, inStockCount, categoryCount }: Props) {
  const frame = useRef<HTMLElement>(null);

  function handleMove(event: React.MouseEvent<HTMLElement>) {
    const node = frame.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--hero-x", `${x * 9}px`);
    node.style.setProperty("--hero-y", `${y * 6}px`);
  }

  function reset() {
    frame.current?.style.setProperty("--hero-x", "0px");
    frame.current?.style.setProperty("--hero-y", "0px");
  }

  return (
    <section className="home-hero v5-hero" ref={frame} onMouseMove={handleMove} onMouseLeave={reset}>
      <div className="hero-aurora hero-aurora-one" />
      <div className="hero-aurora hero-aurora-two" />

      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <div className="hero-status"><span /> SYNTRA LABS · LIVE UK CATALOGUE</div>
          <h1>
            Precision research<br />
            <span>starts with clarity.</span>
          </h1>
          <p>
            A UK-focused laboratory catalogue combining live stock, current offer pricing, controlled product identity, concise research context and secure server-side checkout.
          </p>

          <div className="home-hero-actions">
            <Link href="/offers" className="button-primary hero-primary">View current offers <span>→</span></Link>
            <Link href="/shop" className="button-secondary">Full catalogue</Link>
          </div>

          <div className="hero-live-metrics" aria-label="Live catalogue metrics">
            <div><strong>{catalogueCount}</strong><span>Catalogue items</span></div>
            <div><strong>{inStockCount}</strong><span>Currently in stock</span></div>
            <div><strong>{categoryCount}</strong><span>Research classes</span></div>
          </div>
        </div>

        <div className="home-hero-visual" aria-label="Syntra Labs research vial presentation">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-scan-beam" />

          <div className="hero-image-shell v5-image-shell">
            <img src="/design/hero-vials.jpg" alt="Syntra Labs research vial presentation" />
            <div className="hero-image-corner hero-image-corner-tl" />
            <div className="hero-image-corner hero-image-corner-br" />
          </div>

          <div className="hero-data-card hero-data-card-top">
            <span>LIVE CATALOGUE</span>
            <strong>Database-backed inventory</strong>
            <small>Stock and price resolved from the active catalogue.</small>
          </div>

          <div className="hero-data-card hero-data-card-bottom">
            <span>RESEARCH LAYER</span>
            <strong>Evidence-stage context</strong>
            <small>Selected literature references without dosing guidance.</small>
          </div>

          <div className="hero-coordinate hero-coordinate-left">01 / SYNTRA</div>
          <div className="hero-coordinate hero-coordinate-right">UK / 2026</div>
        </div>
      </div>

      <div className="home-trust-strip v5-trust-strip">
        <div><span>01</span><b>Clear identity</b><small>Code, strength and category presented consistently.</small></div>
        <div><span>02</span><b>Research context</b><small>Evidence notes separated from commercial catalogue data.</small></div>
        <div><span>03</span><b>Secure checkout</b><small>Stripe checkout uses server-side catalogue pricing.</small></div>
        <div><span>04</span><b>Direct support</b><small>UK-focused catalogue and order support.</small></div>
      </div>
    </section>
  );
}
