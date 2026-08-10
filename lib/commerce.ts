import type { Product } from "./products";

export type StockState = "out" | "critical" | "low" | "available";

export function hasDiscount(product: Product) {
  return Boolean(
    product.compareAtPrice &&
      product.compareAtPrice > product.price
  );
}

export function getSavings(product: Product) {
  if (!hasDiscount(product) || !product.compareAtPrice) return null;

  const amount = Number((product.compareAtPrice - product.price).toFixed(2));
  const percent = Math.round((amount / product.compareAtPrice) * 100);

  return { amount, percent };
}

export function getStockState(stock: number): StockState {
  if (stock <= 0) return "out";
  if (stock <= 3) return "critical";
  if (stock <= 8) return "low";
  return "available";
}

export function getStockLabel(stock: number) {
  const state = getStockState(stock);

  if (state === "out") return "Out of stock";
  if (state === "critical") return `Only ${stock} left`;
  if (state === "low") return `${stock} in stock`;
  return `Live · ${stock} in stock`;
}

export function getAvailabilityMessage(stock: number) {
  const state = getStockState(stock);

  if (state === "out") return "Currently unavailable";
  if (state === "critical") return `Only ${stock} unit${stock === 1 ? "" : "s"} left in the current catalogue batch`;
  if (state === "low") return "Limited availability in the current catalogue batch";
  return "Available from current UK catalogue stock";
}

export function getPrimaryBadge(product: Product) {
  if (product.stock <= 0) return "OUT OF STOCK";
  if (hasDiscount(product)) return product.badge || "SPECIAL OFFER";
  if (product.featured) return "FEATURED";
  return product.badge || "RESEARCH MATERIAL";
}

export function getCommerceHighlights(product: Product) {
  const defaults = [
    `${product.strength} format`,
    `${product.category} catalogue`,
    `Reference ${product.code}`,
  ];

  return product.highlights?.length ? product.highlights : defaults;
}
