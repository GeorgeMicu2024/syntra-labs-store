"use client";

import { useEffect } from "react";

const KEY = "syntra-recent-products";

type RecentVisit = {
  id: string;
  viewedAt: number;
};

function normaliseVisits(value: unknown): RecentVisit[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { id: entry, viewedAt: Date.now() };
      }

      if (
        entry &&
        typeof entry === "object" &&
        "id" in entry &&
        typeof (entry as { id?: unknown }).id === "string"
      ) {
        const viewedAt =
          "viewedAt" in entry &&
          typeof (entry as { viewedAt?: unknown }).viewedAt === "number"
            ? (entry as { viewedAt: number }).viewedAt
            : Date.now();

        return {
          id: (entry as { id: string }).id,
          viewedAt,
        };
      }

      return null;
    })
    .filter((entry): entry is RecentVisit => Boolean(entry));
}

export default function ProductVisitTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      const current = normaliseVisits(raw);
      const next: RecentVisit[] = [
        { id: productId, viewedAt: Date.now() },
        ...current.filter((entry) => entry.id !== productId),
      ].slice(0, 12);

      localStorage.setItem(KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("syntra:recently-viewed"));
    } catch {
      // Browsers with storage disabled can still use the catalogue normally.
    }
  }, [productId]);

  return null;
}
