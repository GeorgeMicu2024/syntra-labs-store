import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getProducts } from "@/lib/supabase-rest";
import { getAdminSupabase, getUserFromRequest } from "@/lib/supabase/server-auth";
import { getDispatchState } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
  useCredit: z.boolean().optional().default(false),
});

type SavedAddress = {
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  phone: string | null;
};

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!stripeKey || !/^sk_(test|live)_/.test(stripeKey)) {
      return NextResponse.json(
        { error: "Stripe secret key is missing or incorrectly configured." },
        { status: 503 }
      );
    }

    const body = schema.parse(await req.json());
    const products = await getProducts();
    if (!products.length) throw new Error("No products are currently available.");

    const stripe = new Stripe(stripeKey);
    const user = await getUserFromRequest(req);
    const admin = getAdminSupabase();

    let discountPercent = 0;
    let discountType = "guest";
    let stripeCustomerId: string | null = null;
    let availableCreditPence = 0;
    let defaultAddress: SavedAddress | null = null;
    let profileName = "";
    let profilePhone = "";

    if (user && admin) {
      const [{ data: rewards }, { data: profile }, { data: address }] = await Promise.all([
        admin
          .from("customer_rewards")
          .select("paid_order_count,welcome_discount_used,stripe_customer_id,store_credit_pence")
          .eq("user_id", user.id)
          .maybeSingle(),
        admin
          .from("profiles")
          .select("first_name,last_name,phone")
          .eq("id", user.id)
          .maybeSingle(),
        admin
          .from("addresses")
          .select("full_name,line1,line2,city,county,postcode,country,phone")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle(),
      ]);

      const paidOrderCount = Number(rewards?.paid_order_count || 0);
      discountPercent = paidOrderCount > 0 ? 10 : 20;
      discountType = paidOrderCount > 0 ? "loyalty" : "welcome";
      stripeCustomerId = rewards?.stripe_customer_id || null;
      availableCreditPence = Number(rewards?.store_credit_pence || 0);
      defaultAddress = (address as SavedAddress | null) || null;
      profileName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
      profilePhone = profile?.phone || "";

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: profileName || undefined,
          phone: profilePhone || undefined,
          metadata: { syntra_user_id: user.id },
        });
        stripeCustomerId = customer.id;
        await admin
          .from("customer_rewards")
          .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }

      if (stripeCustomerId && defaultAddress) {
        await stripe.customers.update(stripeCustomerId, {
          name: defaultAddress.full_name || profileName || undefined,
          phone: defaultAddress.phone || profilePhone || undefined,
          shipping: {
            name: defaultAddress.full_name || profileName || "Customer",
            phone: defaultAddress.phone || profilePhone || undefined,
            address: {
              line1: defaultAddress.line1,
              line2: defaultAddress.line2 || undefined,
              city: defaultAddress.city,
              state: defaultAddress.county || undefined,
              postal_code: defaultAddress.postcode,
              country: defaultAddress.country || "GB",
            },
          },
        });
      }
    }

    const originalSubtotal = body.items.reduce((sum, item) => {
      const product = products.find((candidate) => candidate.id === item.id);
      if (!product) throw new Error(`Unknown product: ${item.id}`);
      if (product.stock <= 0) throw new Error(`${product.name} ${product.strength} is currently out of stock.`);
      if (item.quantity > product.stock) {
        throw new Error(`Only ${product.stock} unit${product.stock === 1 ? "" : "s"} of ${product.name} ${product.strength} are currently available.`);
      }
      if (!Number.isFinite(product.price) || product.price <= 0) throw new Error(`Invalid price for ${product.name}.`);
      return sum + Math.round(product.price * 100) * item.quantity;
    }, 0);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.id)!;
      const baseUnitAmount = Math.round(product.price * 100);
      const unitAmount = Math.max(1, Math.round(baseUnitAmount * (1 - discountPercent / 100)));

      return {
        quantity: item.quantity,
        price_data: {
          currency: "gbp",
          unit_amount: unitAmount,
          product_data: {
            name: `${product.name} ${product.strength}`,
            description: `${product.code} — laboratory research use only`,
            metadata: {
              product_id: product.id,
              product_code: product.code,
              base_unit_amount: String(baseUnitAmount),
              member_discount_percent: String(discountPercent),
            },
          },
        },
      };
    });

    const discountedSubtotal = lineItems.reduce((sum, item) => {
      const amount = item.price_data?.unit_amount || 0;
      return sum + amount * (item.quantity || 1);
    }, 0);
    const discountAmount = Math.max(0, originalSubtotal - discountedSubtotal);

    let creditReservationId: string | null = null;
    let creditAmount = 0;
    let creditCouponId: string | null = null;

    if (user && admin && body.useCredit && availableCreditPence > 0) {
      // Keep a small positive payable amount so Checkout remains a payment session.
      const requestedCredit = Math.min(availableCreditPence, Math.max(0, discountedSubtotal - 50));
      if (requestedCredit > 0) {
        const { data: reserved, error: reserveError } = await admin.rpc("syntra_reserve_credit", {
          p_user_id: user.id,
          p_requested: requestedCredit,
        });
        if (reserveError) throw new Error("Account credit could not be reserved securely.");
        const row = Array.isArray(reserved) ? reserved[0] : reserved;
        creditReservationId = row?.reservation_id || null;
        creditAmount = Number(row?.amount_pence || 0);

        if (creditReservationId && creditAmount > 0) {
          const coupon = await stripe.coupons.create({
            amount_off: creditAmount,
            currency: "gbp",
            duration: "once",
            name: "Syntra account credit",
            metadata: { syntra_credit_reservation: creditReservationId },
          });
          creditCouponId = coupon.id;
        }
      }
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
    const siteUrl = site.replace(/\/+$/, "");
    const dispatch = getDispatchState();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["GB"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "gbp" },
            display_name: "Free UK shipping",
          },
        },
      ],
      custom_text: {
        shipping_address: {
          message: `${dispatch.detail} Dispatch timing is subject to successful payment and order verification.`,
        },
      },
      metadata: {
        source: "syntra-labs-store",
        user_id: user?.id || "guest",
        discount_type: discountType,
        discount_percent: String(discountPercent),
        original_subtotal: String(originalSubtotal),
        discount_amount: String(discountAmount),
        credit_amount: String(creditAmount),
        credit_reservation_id: creditReservationId || "",
        dispatch_window: dispatch.label,
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
      after_expiration: { recovery: { enabled: true } },
    };

    if (creditCouponId) sessionParams.discounts = [{ coupon: creditCouponId }];

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
      sessionParams.customer_update = { address: "auto", name: "auto", shipping: "auto" };
    } else {
      sessionParams.customer_creation = "always";
      if (user?.email) sessionParams.customer_email = user.email;
    }

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (error) {
      if (creditReservationId && admin) {
        await admin.rpc("syntra_release_credit_reservation_by_id", { p_reservation_id: creditReservationId });
      }
      if (creditCouponId) await stripe.coupons.del(creditCouponId).catch(() => undefined);
      throw error;
    }

    if (creditReservationId && admin) {
      await admin.rpc("syntra_attach_credit_reservation", { p_reservation_id: creditReservationId, p_session_id: session.id });
    }

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    return NextResponse.json({
      url: session.url,
      member: Boolean(user),
      discountPercent,
      discountType,
      estimatedSavings: discountAmount / 100,
      creditApplied: creditAmount / 100,
      shipping: "free",
      dispatch: dispatch.label,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "The shopping cart contains invalid data." }, { status: 400 });
    }

    console.error("STRIPE_CHECKOUT_ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 400 }
    );
  }
}
