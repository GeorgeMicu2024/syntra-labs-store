import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/supabase-rest";
import { getSavings, hasDiscount } from "@/lib/commerce";

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

  return (
    <>
      <section className="page-hero v6-offers-hero">
        <span className="kicker">CURRENT CATALOGUE OFFERS</span>
        <h1>Live offers. <em>Real stock.</em></h1>
        <p>
          Offer pricing is displayed against earlier Syntra Labs catalogue pricing. Availability is resolved from the live catalogue and verified again at checkout.
        </p>
        <div className="page-hero-facts">
          <span>{offers.length} current offers</span>
          <span>{offers.filter((item) => item.stock > 0).length} available now</span>
          <span>Server-verified checkout</span>
          <span>Research use only</span>
        </div>
      </section>

      <section className="v6-offers-page-grid">
        {offers.map((product) => <ProductCard key={product.id} product={product} />)}
      </section>
    </>
  );
}
