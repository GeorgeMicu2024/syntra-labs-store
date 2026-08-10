import { getAdminSupabase } from "@/lib/supabase/server-auth";

type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  strength: string;
  price: number;
  stock: number;
};

export async function notifyProductChange(before: ProductSnapshot, after: ProductSnapshot) {
  const admin = getAdminSupabase();
  if (!admin) return;

  const restocked = before.stock <= 0 && after.stock > 0;
  const priceDropped = after.price < before.price;
  if (!restocked && !priceDropped) return;

  const conditions: string[] = [];
  if (restocked) conditions.push("notify_restock.eq.true");
  if (priceDropped) conditions.push("notify_price_drop.eq.true");

  const { data: rawRows } = await admin
    .from("wishlist")
    .select("user_id,product_id,notify_restock,notify_price_drop,last_seen_price")
    .eq("product_id", after.id)
    .or(conditions.join(","));

  const rows = (rawRows || []) as { user_id: string; notify_restock: boolean; notify_price_drop: boolean; last_seen_price: number | null }[];
  if (!rows.length) return;

  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: profiles } = await admin.from("profiles").select("id,email,first_name").in("id", userIds);
  const profileMap = new Map((profiles || []).map((profile: any) => [profile.id, profile]));
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.syntralabs.co.uk").replace(/\/+$/, "");

  for (const row of rows) {
    const messages: string[] = [];
    if (restocked && row.notify_restock) messages.push(`${after.name} ${after.strength} is back in stock.`);
    if (priceDropped && row.notify_price_drop) messages.push(`${after.name} ${after.strength} is now £${after.price.toFixed(2)} (previously £${before.price.toFixed(2)}).`);
    if (!messages.length) continue;

    const title = restocked && priceDropped ? "Saved product update" : restocked ? "Back in stock" : "Price drop";
    const body = messages.join(" ");
    await admin.from("notifications").insert({
      user_id: row.user_id,
      type: restocked ? "restock" : "price",
      title,
      body,
      href: `/product/${after.slug}`,
    });

    if (priceDropped && row.notify_price_drop) {
      await admin.from("wishlist").update({ last_seen_price: after.price, updated_at: new Date().toISOString() }).eq("user_id", row.user_id).eq("product_id", after.id);
    }

    const profile = profileMap.get(row.user_id) as { email?: string; first_name?: string } | undefined;
    if (profile?.email) await sendAlertEmail(profile.email, profile.first_name || "Research member", title, body, `${siteUrl}/product/${after.slug}`);
  }
}

async function sendAlertEmail(email: string, firstName: string, title: string, body: string, href: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.CONTACT_FROM_EMAIL || "Syntra Labs <updates@syntralabs.co.uk>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${title} · Syntra Labs`,
      html: `<!doctype html><html><body style="margin:0;background:#050914;font-family:Arial,sans-serif;color:#eaf0ff"><div style="max-width:620px;margin:auto;padding:40px 18px"><div style="background:#0a1324;border:1px solid #21304e;border-radius:20px;padding:34px"><div style="font-size:22px;font-weight:800;letter-spacing:5px">SYNTRA <span style="color:#7287ff">LABS</span></div><p style="margin-top:30px;color:#91a0b7;font-size:12px;letter-spacing:1px">SAVED PRODUCT ALERT</p><h1 style="font-size:28px;margin:10px 0">${escapeHtml(title)}</h1><p style="color:#b8c4d8;line-height:1.7">Hi ${escapeHtml(firstName)}, ${escapeHtml(body)}</p><a href="${href}" style="display:inline-block;margin-top:18px;background:#6d7cff;color:#fff;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700">View product</a><p style="margin-top:28px;color:#718096;font-size:12px">You received this because you enabled an alert for a saved product. You can change alert settings in My Syntra.</p></div></div></body></html>`,
    }),
  }).catch(() => undefined);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" } as Record<string, string>)[character] || character);
}
