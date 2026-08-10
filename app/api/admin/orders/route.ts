import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/auth";
import { getAdminSupabase } from "@/lib/supabase/server-auth";

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["processing", "dispatched", "delivered", "cancelled", "refunded"]),
  detail: z.string().max(500).optional().default(""),
  trackingNumber: z.string().max(120).optional().default(""),
  trackingUrl: z.string().url().optional().or(z.literal("")).default(""),
});

const titles: Record<string, string> = {
  processing: "Order processing",
  dispatched: "Order dispatched",
  delivered: "Order delivered",
  cancelled: "Order cancelled",
  refunded: "Order refunded",
};

export async function PATCH(request: Request) {
  const store = await cookies();
  if (!verifyAdminToken(store.get(COOKIE_NAME)?.value)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order update." }, { status: 400 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });

  const { data: order, error: readError } = await admin
    .from("orders")
    .select("id,user_id,customer_email,status")
    .eq("id", parsed.data.orderId)
    .single();
  if (readError || !order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const now = new Date().toISOString();
  const { error: updateError } = await admin.from("orders").update({ status: parsed.data.status }).eq("id", parsed.data.orderId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await admin.from("order_events").insert({
    order_id: parsed.data.orderId,
    user_id: order.user_id || null,
    status: parsed.data.status,
    title: titles[parsed.data.status],
    detail: parsed.data.detail || defaultDetail(parsed.data.status),
    tracking_number: parsed.data.trackingNumber || null,
    tracking_url: parsed.data.trackingUrl || null,
    created_at: now,
  });

  if (order.user_id) {
    await admin.from("notifications").insert({
      user_id: order.user_id,
      type: "order",
      title: titles[parsed.data.status],
      body: parsed.data.detail || defaultDetail(parsed.data.status),
      href: "/account?tab=orders",
    });
  }

  if (order.customer_email) {
    await sendStatusEmail(order.customer_email, parsed.data.status, parsed.data.detail || defaultDetail(parsed.data.status), parsed.data.trackingNumber, parsed.data.trackingUrl);
  }

  return NextResponse.json({ ok: true });
}

function defaultDetail(status: string) {
  if (status === "processing") return "Your order is being prepared for dispatch.";
  if (status === "dispatched") return "Your order has left processing and has been marked as dispatched.";
  if (status === "delivered") return "Your order has been marked as delivered.";
  if (status === "cancelled") return "This order has been marked as cancelled. Contact support if you need assistance.";
  return "This order has been marked as refunded.";
}

async function sendStatusEmail(email: string, status: string, detail: string, trackingNumber?: string, trackingUrl?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.CONTACT_FROM_EMAIL || "Syntra Labs <orders@syntralabs.co.uk>";
  const tracking = trackingNumber ? `<div style="margin-top:18px;padding:16px;border:1px solid #24324d;border-radius:12px"><small style="color:#7f8ca3">TRACKING</small><div style="margin-top:6px;font-weight:700">${escapeHtml(trackingNumber)}</div>${trackingUrl ? `<a href="${trackingUrl}" style="display:inline-block;margin-top:8px;color:#7f91ff">Open carrier tracking →</a>` : ""}</div>` : "";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `${titles[status]} · Syntra Labs`,
      html: `<!doctype html><html><body style="margin:0;background:#050914;font-family:Arial,sans-serif;color:#eef3ff"><div style="max-width:620px;margin:auto;padding:40px 16px"><div style="background:#0a1324;border:1px solid #23314f;border-radius:20px;padding:34px"><div style="font-size:22px;font-weight:800;letter-spacing:5px">SYNTRA <span style="color:#7489ff">LABS</span></div><p style="color:#8290a8;margin-top:30px;font-size:11px;letter-spacing:1px">ORDER UPDATE</p><h1 style="font-size:28px">${escapeHtml(titles[status])}</h1><p style="color:#b8c4d8;line-height:1.7">${escapeHtml(detail)}</p>${tracking}<p style="margin-top:26px;color:#718096;font-size:12px">You can view your full order timeline inside My Syntra.</p></div></div></body></html>`,
    }),
  }).catch(() => undefined);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" } as Record<string, string>)[character] || character);
}
