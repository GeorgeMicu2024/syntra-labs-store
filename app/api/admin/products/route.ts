import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { updateProduct } from "@/lib/supabase-rest";

const schema = z.object({ id: z.string(), name: z.string(), price: z.number().nonnegative(), stock: z.number().int().nonnegative(), featured: z.boolean() });
export async function PATCH(request: Request) {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
  try {
    const result = await updateProduct(parsed.data.id, parsed.data);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Save failed." }, { status: 500 });
  }
}
