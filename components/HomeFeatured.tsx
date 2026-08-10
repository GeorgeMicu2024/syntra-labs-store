import Link from "next/link";
import type { Product } from "@/lib/products";
import { hasDiscount } from "@/lib/commerce";
import ProductCard from "./ProductCard";

export default function HomeFeatured({ products }: { products: Product[] }) {
  const selected = [...products]
    .sort((a, b) => {
      const offerDiff = Number(hasDiscount(b)) - Number(hasDiscount(a));
      if (offerDiff) return offerDiff;
      const featuredDiff = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDiff) return featuredDiff;
      return b.stock - a.stock;
    })
    .slice(0, 4);

  const offerCount = products.filter(hasDiscount).length;
  const available = products.filter((product) => product.stock > 0).length;

  return (
    <section className="home-section v6-offers-section" id="live-offers">
      <div className="v6-section-head">
        <div>
          <span className="kicker">LIVE OFFERS & AVAILABILITY</span>
          <h2>Current catalogue highlights.</h2>
          <p>
            Live price and stock from the active catalogue, with offer savings shown against earlier catalogue pricing.
          </p>
        </div>

        <div className="v6-section-stats" aria-label="Catalogue offer status">
          <span><b>{offerCount}</b> active offers</span>
          <span><b>{available}</b> items available</span>
          <Link href="/offers">View all offers <i>→</i></Link>
        </div>
      </div>

      <div className="v6-featured-grid">
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
