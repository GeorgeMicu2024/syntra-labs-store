import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/shop", "/offers", "/research", "/standards", "/about", "/contact", "/shipping", "/faq"];
  return [
    ...staticRoutes.map((route) => ({ url: `${siteConfig.url}${route}`, changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 })),
    ...products.map((product) => ({ url: `${siteConfig.url}/product/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
