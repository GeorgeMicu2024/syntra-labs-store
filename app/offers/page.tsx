import ProductCard from "@/components/ProductCard";
import AutumnLeaves from "@/components/AutumnLeaves";
import { getProducts } from "@/lib/supabase-rest";
import { getSavings, hasDiscount } from "@/lib/commerce";
import { isAutumnCampaignActive } from "@/lib/autumn-campaign";

export const metadata = {
  title: "Current Offers",
  description: "Current Syntra Labs catalogue offers and live stock availability.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const products = await getProducts();
  const offers = products
    .filter(hasDiscount)
    .sort((a, b) => (getSavings(b)?.percent || 0) - (getSavings(a)?.percent || 0));
  const topOfferPercent = Math.max(0, ...offers.map((product) => getSavings(product)?.percent || 0));
  const autumnActive = isAutumnCampaignActive() && topOfferPercent > 0;

  return (
    <>
      <section className={`page-hero v6-offers-hero${autumnActive ? " autumn-offers-hero" : ""}`}>
        {autumnActive && <AutumnLeaves />}
        <div className="autumn-offers-hero-content">
          <span className="kicker">{autumnActive ? "AUTUMN RESEARCH EDITION · NOVEMBER 2026" : "CURRENT CATALOGUE OFFERS"}</span>
          <h1>{autumnActive ? <>Autumn offers. <em>Real stock.</em></> : <>Live offers. <em>Real stock.</em></>}</h1>
          <p>
            Offer pricing is displayed against earlier Syntra Labs catalogue pricing. Availability is resolved from the live catalogue and verified again at checkout.
          </p>
          {autumnActive && (
            <div className="autumn-offers-feature">
              <strong>UP TO {topOfferPercent}% OFF</strong>
              <span>Selected existing offers · For verified institutional researchers</span>
            </div>
          )}
          <div className="page-hero-facts">
            <span>{offers.length} current offers</span>
            <span>{offers.filter((item) => item.stock > 0).length} available now</span>
            <span>Server-verified checkout</span>
            <span>Research use only</span>
          </div>
        </div>
      </section>

      <section className={`v6-offers-page-grid${autumnActive ? " autumn-offers-grid" : ""}`}>
        {offers.map((product) => <ProductCard key={product.id} product={product} />)}
      </section>
    </>
  );
}
