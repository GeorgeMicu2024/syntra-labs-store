import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { products } from "@/lib/products";

const schema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

    if (!stripeKey || !/^sk_(test|live)_/.test(stripeKey)) {
      return NextResponse.json(
        {
          error:
            "Stripe secret key is missing or incorrectly configured.",
        },
        { status: 503 }
      );
    }

    const body = schema.parse(await req.json());

    const stripe = new Stripe(stripeKey);

    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "http://localhost:3000";

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.items.map((item) => {
        const product = products.find((p) => p.id === item.id);

        if (!product) {
          throw new Error(`Unknown product: ${item.id}`);
        }

        return {
          quantity: item.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: `${product.name} ${product.strength}`,
              description: `${product.code} — laboratory research use only`,
            },
          },
        };
      });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,

      success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cancel`,

      billing_address_collection: "required",

      shipping_address_collection: {
        allowed_countries: ["GB"],
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("STRIPE_CHECKOUT_ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout failed",
      },
      { status: 400 }
    );
  }
}