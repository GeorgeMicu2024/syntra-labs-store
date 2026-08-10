import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getProducts, updateProduct } from "@/lib/supabase-rest";
import { notifyProductChange } from "@/lib/customer-notifications";

const schema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  featured: z.boolean(),
  badge: z.string().max(80).nullable().optional(),
  highlights: z.array(z.string().max(120)).max(6).optional(),
});

export async function PATCH(request: Request) {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });

  try {
    const before = (await getProducts()).find((product) => product.id === parsed.data.id);
    const result = await updateProduct(parsed.data.id, {
      ...parsed.data,
      compareAtPrice: parsed.data.compareAtPrice ?? undefined,
      badge: parsed.data.badge || undefined,
    });

    if (before) {
      await notifyProductChange(
        { id: before.id, slug: before.slug, name: before.name, strength: before.strength, price: before.price, stock: before.stock },
        { id: before.id, slug: before.slug, name: parsed.data.name, strength: before.strength, price: parsed.data.price, stock: parsed.data.stock }
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Save failed." }, { status: 500 });
  }
}
