import { products as staticProducts, type Product } from "./products";

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
  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    code: row.code,
    name: row.name,
    strength: row.strength,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    image: row.image,
    short: row.short || row.description || "Laboratory research material.",
    description: row.description || row.short || "Laboratory research material.",
    featured: Boolean(row.featured),
  }));
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
      updated_at: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
