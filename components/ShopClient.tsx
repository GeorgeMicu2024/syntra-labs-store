"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { getSavings, getStockState, hasDiscount } from "@/lib/commerce";
import ProductCard from "./ProductCard";

const categories = ["All", "Metabolic", "Peptide", "Cellular", "Hormone", "Lab Supplies"] as const;
const quickFilters = ["All", "Offers", "In stock", "Limited"] as const;

type SortMode = "offers" | "featured" | "price-low" | "price-high" | "name";
type QuickFilter = (typeof quickFilters)[number];
type ShopClientProps = { products: Product[]; initialCategory?: string };

export default function ShopClient({ products, initialCategory = "All" }: ShopClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(
    categories.includes(initialCategory as (typeof categories)[number]) ? initialCategory : "All"
  );
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("All");
  const [sort, setSort] = useState<SortMode>("offers");

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const searchable = `${product.name} ${product.code} ${product.strength} ${product.category}`.toLowerCase();
      const matchesSearch = !search || searchable.includes(search);

      const stockState = getStockState(product.stock);
      const matchesQuick =
        quickFilter === "All" ||
        (quickFilter === "Offers" && hasDiscount(product)) ||
        (quickFilter === "In stock" && product.stock > 0) ||
        (quickFilter === "Limited" && (stockState === "critical" || stockState === "low"));

      return matchesCategory && matchesSearch && matchesQuick;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "offers") {
        const offerDiff = Number(hasDiscount(b)) - Number(hasDiscount(a));
        if (offerDiff) return offerDiff;
        return (getSavings(b)?.percent || 0) - (getSavings(a)?.percent || 0);
      }
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [products, query, category, quickFilter, sort]);

  return (
    <>
      <section className="shop-tools shop-tools-modern v6-shop-tools">
        <div className="v6-tools-top">
          <label className="shop-search-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search compound, code or strength"
              aria-label="Search products"
            />
          </label>

          <div className="v6-quick-filters" role="group" aria-label="Availability filters">
            {quickFilters.map((item) => (
              <button
                key={item}
                type="button"
                className={quickFilter === item ? "active" : ""}
                onClick={() => setQuickFilter(item)}
              >
                {item === "Offers" && <i />}
                {item}
              </button>
            ))}
          </div>

          <div className="shop-sort-wrap">
            <span>{filteredProducts.length} products</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label="Sort products">
              <option value="offers">Offers first</option>
              <option value="featured">Featured first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        <div className="shop-category-tabs v6-category-tabs" role="group" aria-label="Product category">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="product-grid shop-product-grid v6-shop-grid">
        {filteredProducts.length ? (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="shop-empty">
            <span className="kicker">NO MATCHES</span>
            <h3>No catalogue materials found</h3>
            <p>Try another compound name, code, strength, category or availability filter.</p>
          </div>
        )}
      </section>
    </>
  );
}
