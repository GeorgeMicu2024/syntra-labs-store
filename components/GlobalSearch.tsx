"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { getStockLabel, hasDiscount } from "@/lib/commerce";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      if (loaded) return;
      try {
        const response = await fetch("/api/catalogue", { cache: "no-store" });
        if (response.ok) setProducts(await response.json());
      } catch {}
      setLoaded(true);
    }

    const openSearch = () => { setOpen(true); void load(); };
    const keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); openSearch();
      } else if (event.key === "/" && !typing) {
        event.preventDefault(); openSearch();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("syntra:open-search", openSearch);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("syntra:open-search", openSearch);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [loaded]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => { window.clearTimeout(timer); document.body.style.overflow = ""; };
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = normalized
      ? products.filter((p) => `${p.name} ${p.code} ${p.strength} ${p.category}`.toLowerCase().includes(normalized))
      : products.filter((p) => p.featured || hasDiscount(p));
    return source.slice(0, 8);
  }, [products, query]);

  if (!open) return null;

  return (
    <div className="v7-search-overlay" role="dialog" aria-modal="true" aria-label="Search catalogue">
      <button className="v7-search-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Close search" />
      <div className="v7-search-panel">
        <div className="v7-search-input-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search compound, code, strength or category…" />
          <kbd>ESC</kbd>
        </div>
        <div className="v7-search-caption"><span>{query ? `${results.length} matching results` : "Featured catalogue results"}</span><small>CTRL / ⌘ K</small></div>
        <div className="v7-search-results">
          {results.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setOpen(false)}>
              <div className="v7-search-thumb"><Image src={product.image} alt="" width={120} height={120} /></div>
              <div className="v7-search-copy"><small>{product.category} · {product.code}</small><b>{displayProductName(product.name)}</b><span>{product.strength}</span></div>
              <div className="v7-search-side"><b>£{product.price.toFixed(2)}</b><small>{getStockLabel(product.stock)}</small></div>
            </Link>
          ))}
          {loaded && !results.length && <div className="v7-search-empty"><b>No catalogue match</b><span>Try another compound name, reference code or strength.</span></div>}
        </div>
        <div className="v7-search-footer"><span>Research-use catalogue</span><Link href="/shop" onClick={() => setOpen(false)}>Browse all products →</Link></div>
      </div>
    </div>
  );
}
