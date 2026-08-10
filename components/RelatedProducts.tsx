import type { Product } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ products, current }: { products: Product[]; current: Product }) {
  const related = products
    .filter((product) => product.id !== current.id)
    .sort((a, b) => {
      const categoryA = Number(a.category === current.category);
      const categoryB = Number(b.category === current.category);
      if (categoryB !== categoryA) return categoryB - categoryA;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    })
    .slice(0, 4);

  if (!related.length) return null;

  return (
    <section className="v7-related">
      <div className="v7-related-head"><div><span className="kicker">RELATED CATALOGUE MATERIALS</span><h2>Continue within this research category.</h2></div><a href="/shop">Full catalogue <span>→</span></a></div>
      <div className="v7-related-grid">{related.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </section>
  );
}
