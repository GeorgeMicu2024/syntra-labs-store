"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { displayProductName } from "@/lib/display";
import { getStockLabel, getStockState } from "@/lib/commerce";

const KEY = "syntra-recent-products";

type RecentVisit = {
  id: string;
  viewedAt: number;
};

function normaliseVisits(value: unknown): RecentVisit[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === "string") return { id: entry, viewedAt: Date.now() };
      if (
        entry &&
        typeof entry === "object" &&
        "id" in entry &&
        typeof (entry as { id?: unknown }).id === "string"
      ) {
        return {
          id: (entry as { id: string }).id,
          viewedAt:
            "viewedAt" in entry &&
            typeof (entry as { viewedAt?: unknown }).viewedAt === "number"
              ? (entry as { viewedAt: number }).viewedAt
              : Date.now(),
        };
      }
      return null;
    })
    .filter((entry): entry is RecentVisit => Boolean(entry));
}

function relativeTime(timestamp: number) {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "Just viewed";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export default function RecentlyViewed({
  products,
  excludeId,
  compact = false,
}: {
  products: Product[];
  excludeId?: string;
  compact?: boolean;
}) {
  const [visits, setVisits] = useState<RecentVisit[]>([]);

  useEffect(() => {
    const read = () => {
      try {
        setVisits(normaliseVisits(JSON.parse(localStorage.getItem(KEY) || "[]")));
      } catch {
        setVisits([]);
      }
    };

    read();
    window.addEventListener("syntra:recently-viewed", read);
    window.addEventListener("storage", read);

    return () => {
      window.removeEventListener("syntra:recently-viewed", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const selected = useMemo(
    () =>
      visits
        .map((visit) => ({
          visit,
          product: products.find((product) => product.id === visit.id),
        }))
        .filter(
          (entry): entry is { visit: RecentVisit; product: Product } =>
            Boolean(entry.product) && entry.product?.id !== excludeId
        )
        .slice(0, compact ? 3 : 5),
    [visits, products, excludeId, compact]
  );

  function clearHistory() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setVisits([]);
    window.dispatchEvent(new CustomEvent("syntra:recently-viewed"));
  }

  function quickView(product: Product) {
    window.dispatchEvent(new CustomEvent("syntra:quick-view", { detail: product }));
  }

  if (!selected.length) return null;

  return (
    <section className={`v8-recent ${compact ? "compact" : ""}`}>
      <div className="v8-section-head v8-recent-head">
        <div>
          <span className="kicker">RECENTLY VIEWED</span>
          <h2>Continue your research review.</h2>
          <p>Your recent catalogue activity stays on this device so you can return to the same materials quickly.</p>
        </div>
        <div className="v8-recent-head-actions">
          <button type="button" onClick={clearHistory}>Clear history</button>
          <Link href="/shop">Open catalogue <span>→</span></Link>
        </div>
      </div>

      <div className="v8-recent-rail">
        {selected.map(({ product, visit }) => {
          const stockState = getStockState(product.stock);
          const name = displayProductName(product.name);

          return (
            <article key={product.id} className="v8-recent-card">
              <Link href={`/product/${product.slug}`} className="v8-recent-image">
                <Image src={product.image} alt={`${name} ${product.strength}`} width={360} height={360} />
                <span>{relativeTime(visit.viewedAt)}</span>
              </Link>

              <div className="v8-recent-copy">
                <small>{product.category} · SL-{product.code}</small>
                <h3><Link href={`/product/${product.slug}`}>{name}</Link></h3>
                <span>{product.strength}</span>
              </div>

              <div className="v8-recent-meta">
                <div><b>£{product.price.toFixed(2)}</b><span className={stockState}>{getStockLabel(product.stock)}</span></div>
                <button type="button" onClick={() => quickView(product)} aria-label={`Quick view ${name}`}>Quick view</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
