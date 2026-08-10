import ShopClient from "@/components/ShopClient";
import { getProducts } from "@/lib/supabase-rest";

export const metadata = {
  title: "Research Catalogue",
  description: "Browse the Syntra Labs research catalogue with live stock, pricing and compound-level research context.",
};

export const dynamic = "force-dynamic";

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const products = await getProducts();
  const params = await searchParams;

  return (
    <>
      <section className="page-hero shop-page-hero">
        <span className="kicker">LIVE RESEARCH CATALOGUE</span>
        <h1>Explore the <em>catalogue.</em></h1>
        <p>
          Search by compound, code or strength. Stock and price are resolved from the live catalogue,
          and checkout pricing is verified again on the server before Stripe opens.
        </p>
        <div className="page-hero-facts">
          <span>{products.length} catalogue materials</span>
          <span>GBP pricing</span>
          <span>UK shipping</span>
          <span>Research use only</span>
        </div>
      </section>

      <ShopClient products={products} initialCategory={params.category} />
    </>
  );
}
