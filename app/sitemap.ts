import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { siteConfig } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { const routes=["","/shop","/standards","/about","/contact","/faq","/shipping"]; return [...routes.map(route=>({url:`${siteConfig.url}${route}`,lastModified:new Date(),changeFrequency:"weekly" as const,priority:route===""?1:.7})),...products.map(product=>({url:`${siteConfig.url}/product/${product.slug}`,lastModified:new Date(),changeFrequency:"weekly" as const,priority:.8}))]; }
