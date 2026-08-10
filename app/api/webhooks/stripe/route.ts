import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminSupabase } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  const stripe = new Stripe(stripeKey);

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") return NextResponse.json({ received: true });

      const checkout = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const customerEmail = checkout.customer_details?.email || checkout.customer_email;
      const customerName = checkout.customer_details?.name || "Customer";
      const metadata = checkout.metadata || {};
      const userId = metadata.user_id && metadata.user_id !== "guest" ? metadata.user_id : null;
      const discountPercent = Number(metadata.discount_percent || 0);
      const discountType = metadata.discount_type || "guest";
      const originalSubtotal = Number(metadata.original_subtotal || checkout.amount_subtotal || 0);
      const discountAmount = Number(metadata.discount_amount || 0);
      const creditAmount = Number(metadata.credit_amount || 0);
      const dispatchWindow = metadata.dispatch_window || "Standard dispatch";
      const admin = getAdminSupabase();

      if (admin) {
        const { data: existing } = await admin
          .from("orders")
          .select("id")
          .eq("stripe_session_id", checkout.id)
          .maybeSingle();

        let orderId = existing?.id as string | undefined;
        let isNewPaidOrder = false;

        if (!orderId) {
          const { data: inserted, error: orderError } = await admin
            .from("orders")
            .insert({
              stripe_session_id: checkout.id,
              user_id: userId,
              customer_email: customerEmail || null,
              amount_total: checkout.amount_total || 0,
              subtotal_amount: originalSubtotal,
              discount_amount: discountAmount,
              discount_percent: discountPercent,
              discount_type: discountType,
              credit_amount: creditAmount,
              shipping_amount: checkout.shipping_cost?.amount_total || 0,
              dispatch_window: dispatchWindow,
              currency: checkout.currency || "gbp",
              status: "paid",
              shipping_address: checkout.customer_details?.address || null,
            })
            .select("id")
            .single();

          if (orderError) {
            console.error("ORDER_SAVE_ERROR", orderError.message);
          } else {
            orderId = inserted.id;
            isNewPaidOrder = true;
          }
        }

        if (orderId && isNewPaidOrder && checkout.line_items?.data?.length) {
          const rows = checkout.line_items.data.map((item) => {
            const product = typeof item.price?.product === "object" && item.price.product !== null
              ? item.price.product as Stripe.Product
              : null;
            const quantity = item.quantity || 1;
            const productId = product?.metadata?.product_id || null;
            const baseUnitAmount = Number(product?.metadata?.base_unit_amount || item.price?.unit_amount || 0);
            return {
              order_id: orderId,
              product_id: productId,
              quantity,
              unit_amount: item.price?.unit_amount || 0,
              base_unit_amount: baseUnitAmount,
            };
          }).filter((row) => row.product_id);

          if (rows.length) {
            const { error: itemsError } = await admin.from("order_items").insert(rows);
            if (itemsError) console.error("ORDER_ITEMS_SAVE_ERROR", itemsError.message);
          }
        }

        if (creditAmount > 0 && orderId) {
          const { error: creditError } = await admin.rpc("syntra_consume_credit_reservation", { p_session_id: checkout.id });
          if (creditError) console.error("CREDIT_CONSUME_ERROR", creditError.message);
        }

        if (userId && orderId && isNewPaidOrder) {
          const { error: rewardError } = await admin.rpc("syntra_mark_paid_order_v10", {
            p_user_id: userId,
            p_order_id: orderId,
            p_amount_paid: checkout.amount_total || 0,
          });
          if (rewardError) console.error("REWARD_UPDATE_ERROR", rewardError.message);
        }
      }

      if (customerEmail) {
        await sendOrderEmail({
          checkout,
          customerEmail,
          customerName,
          discountPercent,
          discountType,
          originalSubtotal,
          discountAmount,
          creditAmount,
          dispatchWindow,
        });
      }
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const admin = getAdminSupabase();
      const creditAmount = Number(session.metadata?.credit_amount || 0);
      if (admin && creditAmount > 0) {
        const { error } = await admin.rpc("syntra_release_credit_reservation", { p_session_id: session.id });
        if (error) console.error("CREDIT_RELEASE_ERROR", error.message);
      }

      const userId = session.metadata?.user_id && session.metadata.user_id !== "guest" ? session.metadata.user_id : null;
      const recoveryUrl = session.after_expiration?.recovery?.url || null;
      if (admin && userId && recoveryUrl) {
        const [{ data: profile }, { data: userRewards }] = await Promise.all([
          admin.from("profiles").select("email,first_name,marketing_opt_in").eq("id", userId).maybeSingle(),
          admin.from("customer_rewards").select("store_credit_pence").eq("user_id", userId).maybeSingle(),
        ]);
        if (profile?.marketing_opt_in && profile?.email) {
          await sendRecoveryEmail(profile.email, profile.first_name || "Research member", recoveryUrl, Number(userRewards?.store_credit_pence || 0));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 }
    );
  }
}

async function sendOrderEmail(args: {
  checkout: Stripe.Checkout.Session;
  customerEmail: string;
  customerName: string;
  discountPercent: number;
  discountType: string;
  originalSubtotal: number;
  discountAmount: number;
  creditAmount: number;
  dispatchWindow: string;
}) {
  const { checkout, customerEmail, customerName, discountPercent, discountType, originalSubtotal, discountAmount, creditAmount, dispatchWindow } = args;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Syntra Labs <orders@syntralabs.co.uk>";
  const supportEmail = process.env.CONTACT_TO_EMAIL || "support@syntralabs.co.uk";

  const rows = checkout.line_items?.data.map((item) => {
    const amount = ((item.amount_total || 0) / 100).toFixed(2);
    return `<tr><td style="padding:14px 0;border-bottom:1px solid #e5e7eb">${escapeHtml(item.description || "Product")}</td><td style="padding:14px 10px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity || 1}</td><td style="padding:14px 0;border-bottom:1px solid #e5e7eb;text-align:right">£${amount}</td></tr>`;
  }).join("") || "";

  const total = ((checkout.amount_total || 0) / 100).toFixed(2);
  const subtotal = (originalSubtotal / 100).toFixed(2);
  const saved = (discountAmount / 100).toFixed(2);
  const credit = (creditAmount / 100).toFixed(2);
  const benefit = discountPercent > 0
    ? `${discountPercent}% ${discountType === "welcome" ? "welcome" : "returning-customer"} pricing`
    : "Standard catalogue pricing";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [customerEmail],
      reply_to: supportEmail,
      subject: "Your Syntra Labs order is confirmed",
      html: `<!doctype html><html><body style="margin:0;background:#f3f5f9;font-family:Arial,Helvetica,sans-serif;color:#111827"><div style="padding:32px 14px"><div style="max-width:620px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(15,23,42,.09)"><div style="background:#07101f;padding:32px;text-align:center"><div style="color:#fff;font-size:27px;font-weight:800;letter-spacing:6px">SYNTRA</div><div style="color:#6e8aff;font-size:11px;font-weight:800;letter-spacing:7px;margin-top:5px">LABS</div></div><div style="padding:34px"><div style="display:inline-block;background:#ecfdf5;color:#047857;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:700">✓ PAYMENT CONFIRMED</div><h1 style="font-size:26px;margin:18px 0 8px">Order confirmed.</h1><p>Hi ${escapeHtml(customerName)}, your payment has been received and your order has entered processing.</p><div style="margin:24px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc"><small style="color:#64748b;text-transform:uppercase;letter-spacing:1px">Order reference</small><div style="font-weight:700;margin-top:5px;word-break:break-all">${escapeHtml(checkout.id)}</div></div><table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><thead><tr><th style="text-align:left;padding:10px 0;color:#64748b;font-size:11px">PRODUCT</th><th style="text-align:center;padding:10px;color:#64748b;font-size:11px">QTY</th><th style="text-align:right;padding:10px 0;color:#64748b;font-size:11px">AMOUNT</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:18px"><div style="display:flex;justify-content:space-between;margin:7px 0"><span>Catalogue subtotal</span><strong>£${subtotal}</strong></div>${discountPercent > 0 ? `<div style="display:flex;justify-content:space-between;margin:7px 0;color:#4f46e5"><span>${escapeHtml(benefit)}</span><strong>−£${saved}</strong></div>` : ""}${creditAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin:7px 0;color:#4f46e5"><span>Syntra account credit</span><strong>−£${credit}</strong></div>` : ""}<div style="display:flex;justify-content:space-between;margin:7px 0"><span>UK shipping</span><strong>FREE</strong></div><div style="display:flex;justify-content:space-between;margin-top:14px;font-size:20px"><span>Total paid</span><strong>£${total}</strong></div></div><div style="margin-top:26px;padding:16px;border-radius:12px;background:#07101f;color:#fff"><small style="color:#9fb0d2;letter-spacing:1px">DISPATCH STATUS</small><div style="font-size:17px;font-weight:700;margin-top:6px">${escapeHtml(dispatchWindow)}</div><p style="color:#c7d1e6;font-size:13px;margin-bottom:0">Free UK shipping. Dispatch timing remains subject to successful order verification and operational availability.</p></div><p style="margin-top:28px">Need help? Reply to this email and our support team will assist.</p></div><div style="background:#07101f;color:#9ca3af;padding:22px;text-align:center;font-size:12px">SYNTRA LABS · ${escapeHtml(supportEmail)} · United Kingdom</div></div></div></body></html>`,
    }),
  });

  if (!response.ok) console.error("Order confirmation email failed:", response.status, await response.text());
}

async function sendRecoveryEmail(email: string, firstName: string, recoveryUrl: string, creditPence: number) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Syntra Labs <orders@syntralabs.co.uk>";
  const creditLine = creditPence > 0 ? `<p style="color:#9aa8ff">Your available Syntra credit remains on your account.</p>` : "";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: "Your Syntra checkout is still available",
      html: `<!doctype html><html><body style="margin:0;background:#050914;font-family:Arial,sans-serif;color:#eef3ff"><div style="max-width:620px;margin:auto;padding:40px 16px"><div style="background:#0a1324;border:1px solid #23314f;border-radius:20px;padding:34px"><div style="font-size:22px;font-weight:800;letter-spacing:5px">SYNTRA <span style="color:#7489ff">LABS</span></div><p style="color:#8290a8;margin-top:30px;font-size:11px;letter-spacing:1px">CHECKOUT RECOVERY</p><h1 style="font-size:28px">Continue where you left off.</h1><p style="color:#b8c4d8;line-height:1.7">Hi ${escapeHtml(firstName)}, your secure Checkout Session expired before payment was completed. If you still want to continue, Stripe has created a recovery link.</p>${creditLine}<a href="${recoveryUrl}" style="display:inline-block;margin-top:18px;background:#6d7cff;color:#fff;padding:13px 18px;border-radius:10px;text-decoration:none;font-weight:700">Return to secure checkout</a><p style="margin-top:28px;color:#718096;font-size:12px">You received this because you opted in to catalogue and offer updates. No payment was taken.</p></div></div></body></html>`,
    }),
  }).catch(() => undefined);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  } as Record<string, string>)[character] || character);
}
