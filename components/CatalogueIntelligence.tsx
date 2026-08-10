import Link from "next/link";
import type { Product } from "@/lib/products";
import { getSavings, getStockState, hasDiscount } from "@/lib/commerce";

export default function CatalogueIntelligence({ products }: { products: Product[] }) {
  const available = products.filter((product) => product.stock > 0).length;
  const offers = products.filter(hasDiscount);
  const limited = products.filter((product) => ["critical", "low"].includes(getStockState(product.stock))).length;
  const largestSaving = Math.max(0, ...offers.map((product) => getSavings(product)?.percent || 0));
  const categories = new Set(products.map((product) => product.category)).size;

  return (
    <section className="v7-intelligence">
      <div className="v7-intelligence-copy"><span className="kicker">CATALOGUE INTELLIGENCE</span><h2>A live storefront, not a static product list.</h2><p>Current pricing, availability and evidence-stage research notes are separated into clear operational layers so returning visitors can immediately see what changed.</p><div className="v7-intelligence-actions"><Link href="/shop">Review live catalogue <span>→</span></Link><Link href="/research">Open research library</Link></div></div>
      <div className="v7-intelligence-grid">
        <article><small>AVAILABLE NOW</small><strong>{available}</strong><span>of {products.length} catalogue items</span></article>
        <article><small>ACTIVE OFFERS</small><strong>{offers.length}</strong><span>with compare pricing</span></article>
        <article><small>MAXIMUM SAVING</small><strong>{largestSaving}%</strong><span>current catalogue offer</span></article>
        <article><small>LIMITED STOCK</small><strong>{limited}</strong><span>current low-stock items</span></article>
        <article><small>RESEARCH AREAS</small><strong>{categories}</strong><span>catalogue categories</span></article>
        <article className="status"><small>CATALOGUE STATUS</small><strong><i /> LIVE</strong><span>server-verified price & stock</span></article>
      </div>
    </section>
  );
}
