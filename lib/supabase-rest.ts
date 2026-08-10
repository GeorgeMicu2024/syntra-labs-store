import { products as staticProducts, type Product } from "./products";
import { displayProductName } from "./display";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers() {
  if (!serviceKey) return undefined;
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!url || !serviceKey) return staticProducts;

  const response = await fetch(`${url}/rest/v1/products?select=*&order=sort_order.asc`, {
    headers: headers(),
    cache: "no-store",
  });

  if (!response.ok) return staticProducts;

  const rows = await response.json();

  return rows.map((row: any) => {
    const fallback = staticProducts.find((item) => item.id === row.id);

    return {
      ...fallback,
      id: row.id,
      slug: row.slug,
      code: row.code,
      name: displayProductName(String(row.name)),
      strength: row.strength,
      category: row.category,
      price: Number(row.price),
      compareAtPrice:
        row.compare_at_price !== undefined && row.compare_at_price !== null
          ? Number(row.compare_at_price)
          : fallback?.compareAtPrice,
      stock: Number(row.stock),
      image: row.image,
      short: row.short || row.description || fallback?.short || "Laboratory research material.",
      description:
        row.description || row.short || fallback?.description || "Laboratory research material.",
      featured: Boolean(row.featured),
      badge: row.badge || fallback?.badge,
      highlights: Array.isArray(row.highlights) ? row.highlights : fallback?.highlights,
    } satisfies Product;
  });
}

export async function updateProduct(id: string, input: Partial<Product>) {
  if (!url || !serviceKey) throw new Error("Supabase is not configured.");

  const response = await fetch(`${url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({
      name: input.name,
      price: input.price,
      stock: input.stock,
      featured: input.featured,
      compare_at_price: input.compareAtPrice ?? null,
      badge: input.badge ?? null,
      highlights: input.highlights ?? [],
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
