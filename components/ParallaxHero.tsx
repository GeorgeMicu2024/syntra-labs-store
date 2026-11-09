import Image from "next/image";
import Link from "next/link";
import AutumnLeaves from "@/components/AutumnLeaves";

type Props = {
  catalogueCount: number;
  inStockCount: number;
  categoryCount: number;
  autumnActive: boolean;
  topOfferPercent: number;
};

export default function ParallaxHero({ catalogueCount, inStockCount, categoryCount, autumnActive, topOfferPercent }: Props) {
  return (
    <section className={`home-hero premium-v2-hero${autumnActive ? " autumn-hero" : ""}`} aria-labelledby="premium-v2-title">
      {autumnActive && <AutumnLeaves />}
      <div className="premium-v2-hero-inner">
        <div className="premium-v2-hero-copy">
          <div className="premium-v2-eyebrow">
            <span className="premium-v2-eyebrow-mark" aria-hidden="true">✦</span>
            {autumnActive ? "AUTUMN RESEARCH EDITION" : "SYNTRA LABS / RESEARCH CATALOGUE"}
            {autumnActive && <span className="premium-v2-edition-date">NOV 2026</span>}
          </div>
          <h1 id="premium-v2-title">A clearer view <em>of research.</em></h1>
          <p>Explore a carefully organised UK research catalogue with live availability, transparent pricing and secure access for verified institutions.</p>
          <div className="premium-v2-hero-actions">
            <Link href="/shop" className="premium-v2-button premium-v2-button-primary">Explore catalogue <span aria-hidden="true">↗</span></Link>
            <Link href="/offers" className="premium-v2-button premium-v2-button-outline">View current offers <span aria-hidden="true">→</span></Link>
          </div>
          <div className="premium-v2-hero-facts" aria-label="Live catalogue information">
            <div><strong>{catalogueCount}</strong><span>Catalogue items</span></div>
            <div><strong>{inStockCount}</strong><span>Available now</span></div>
            <div><strong>{categoryCount}</strong><span>Research fields</span></div>
          </div>
        </div>
        <div className="premium-v2-hero-art">
          <div className="premium-v2-hero-image">
            <Image src="/design/premium-autumn-lab.webp" alt="Editorial photograph of unlabelled laboratory glassware in warm copper light" fill priority sizes="(max-width: 820px) 100vw, 50vw" />
          </div>
          <span className="premium-v2-image-caption">SYNTRA LABS <i /> RESEARCH USE ONLY</span>
        </div>
      </div>
      {autumnActive && topOfferPercent > 0 && (
        <Link href="/offers" className="premium-v2-offer-ribbon">
          <span className="premium-v2-offer-star" aria-hidden="true">✳</span>
          <strong>Autumn catalogue offers</strong>
          <span>Up to {topOfferPercent}% off selected existing catalogue items</span>
          <b aria-hidden="true">↗</b>
        </Link>
      )}
    </section>
  );
}
