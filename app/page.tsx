import ParallaxHero from "@/components/ParallaxHero";
import HomeFeatured from "@/components/HomeFeatured";
import CategoryExplorer from "@/components/CategoryExplorer";
import ReturnVisitPrompt from "@/components/ReturnVisitPrompt";
import RecentlyViewed from "@/components/RecentlyViewed";
import MembershipSection from "@/components/MembershipSection";
import { getProducts } from "@/lib/supabase-rest";
import { hasDiscount, getStockState, getSavings } from "@/lib/commerce";
import { isAutumnCampaignActive } from "@/lib/autumn-campaign";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const offerCount = products.filter(hasDiscount).length;
  const topOfferPercent = Math.max(0, ...products.map((product) => getSavings(product)?.percent || 0));
  const autumnActive = isAutumnCampaignActive() && topOfferPercent > 0;
  const lowStockCount = products.filter((product) => {
    const state = getStockState(product.stock);
    return state === "critical" || state === "low";
  }).length;

  return (
    <div className="premium-home v6-home v7-home premium-v2-home">
      <ParallaxHero
        catalogueCount={products.length}
        inStockCount={products.filter((product) => product.stock > 0).length}
        categoryCount={new Set(products.map((product) => product.category)).size}
        autumnActive={autumnActive}
        topOfferPercent={topOfferPercent}
      />
      <ReturnVisitPrompt offerCount={offerCount} lowStockCount={lowStockCount} />
      <HomeFeatured products={products} />
      <CategoryExplorer />
      <MembershipSection />
      <RecentlyViewed products={products} compact />
      <section className="premium-v2-why" aria-labelledby="premium-v2-why-title">
        <div className="premium-v2-why-heading">
          <span className="kicker">WHY SYNTRA LABS</span>
          <h2 id="premium-v2-why-title">Considered down to the details.</h2>
        </div>
        <div className="premium-v2-why-grid">
          <div><span aria-hidden="true">01 /</span><h3>Live UK stock</h3><p>Current catalogue availability and pricing displayed clearly on every item.</p></div>
          <div><span aria-hidden="true">02 /</span><h3>Research context</h3><p>Product identity and literature context kept separate from commercial information.</p></div>
          <div><span aria-hidden="true">03 /</span><h3>Secure checkout</h3><p>Server-side pricing through Stripe, with verified institutional access.</p></div>
        </div>
      </section>
    </div>
  );
}
