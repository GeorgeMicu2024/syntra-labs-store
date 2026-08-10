import ParallaxHero from "@/components/ParallaxHero";
import HomeFeatured from "@/components/HomeFeatured";
import CategoryExplorer from "@/components/CategoryExplorer";
import HomeResearch from "@/components/HomeResearch";
import StandardsShowcase from "@/components/StandardsShowcase";
import ReturnVisitPrompt from "@/components/ReturnVisitPrompt";
import CatalogueIntelligence from "@/components/CatalogueIntelligence";
import RecentlyViewed from "@/components/RecentlyViewed";
import MembershipSection from "@/components/MembershipSection";
import { getProducts } from "@/lib/supabase-rest";
import { hasDiscount, getStockState } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();
  const offerCount = products.filter(hasDiscount).length;
  const lowStockCount = products.filter((product) => {
    const state = getStockState(product.stock);
    return state === "critical" || state === "low";
  }).length;

  return (
    <div className="premium-home v6-home v7-home">
      <ParallaxHero
        catalogueCount={products.length}
        inStockCount={products.filter((product) => product.stock > 0).length}
        categoryCount={new Set(products.map((product) => product.category)).size}
      />
      <ReturnVisitPrompt offerCount={offerCount} lowStockCount={lowStockCount} />
      <CatalogueIntelligence products={products} />
      <MembershipSection />
      <HomeFeatured products={products} />
      <RecentlyViewed products={products} />
      <CategoryExplorer />
      <HomeResearch />
      <StandardsShowcase />
      <section className="home-final-cta v6-final-cta v7-final-cta">
        <div>
          <span className="kicker">LIVE CATALOGUE · UK</span>
          <h2>A research storefront designed to reward a second look.</h2>
          <p>Return for live stock, current offers, recently viewed materials and evidence-stage research notes. Catalogue availability changes by batch.</p>
        </div>
        <div className="home-final-actions">
          <a href="/offers" className="button-primary">Current offers <span>→</span></a>
          <a href="/shop" className="button-secondary">Full catalogue</a>
        </div>
      </section>
    </div>
  );
}
