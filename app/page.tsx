import ParallaxHero from "@/components/ParallaxHero";
import HomeFeatured from "@/components/HomeFeatured";
import CategoryExplorer from "@/components/CategoryExplorer";
import HomeResearch from "@/components/HomeResearch";
import StandardsShowcase from "@/components/StandardsShowcase";
import ReturnVisitPrompt from "@/components/ReturnVisitPrompt";
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
    <div className="premium-home v6-home">
      <ParallaxHero
        catalogueCount={products.length}
        inStockCount={products.filter((product) => product.stock > 0).length}
        categoryCount={new Set(products.map((product) => product.category)).size}
      />
      <ReturnVisitPrompt offerCount={offerCount} lowStockCount={lowStockCount} />
      <HomeFeatured products={products} />
      <CategoryExplorer />
      <HomeResearch />
      <StandardsShowcase />
      <section className="home-final-cta v6-final-cta">
        <div>
          <span className="kicker">LIVE CATALOGUE · UK</span>
          <h2>Return for live stock, current offers and new research context.</h2>
          <p>
            Catalogue availability changes by batch. Bookmark Syntra Labs to check current stock, offer pricing and evidence-stage research notes.
          </p>
        </div>
        <div className="home-final-actions">
          <a href="/offers" className="button-primary">Current offers <span>→</span></a>
          <a href="/shop" className="button-secondary">Full catalogue</a>
        </div>
      </section>
    </div>
  );
}
