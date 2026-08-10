import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getProducts } from "@/lib/supabase-rest";

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
});

export async function POST(req: Request) {
  try {
    /*
     * --------------------------------------------------
     * STRIPE CONFIGURATION
     * --------------------------------------------------
     */

    const stripeKey =
      process.env.STRIPE_SECRET_KEY?.trim();

    if (
      !stripeKey ||
      !/^sk_(test|live)_/.test(stripeKey)
    ) {
      console.error(
        "STRIPE_SECRET_KEY is missing or invalid."
      );

      return NextResponse.json(
        {
          error:
            "Stripe secret key is missing or incorrectly configured.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * --------------------------------------------------
     * VALIDATE CART
     * --------------------------------------------------
     */

    const json = await req.json();

    const body = schema.parse(json);

    /*
     * --------------------------------------------------
     * GET CURRENT PRODUCTS
     * --------------------------------------------------
     *
     * IMPORTANT:
     * Prices are retrieved server-side.
     * Never trust prices sent from the browser.
     */

    const products = await getProducts();

    if (!products.length) {
      throw new Error(
        "No products are currently available."
      );
    }

    /*
     * --------------------------------------------------
     * CREATE STRIPE LINE ITEMS
     * --------------------------------------------------
     */

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.items.map((item) => {
        const product = products.find(
          (product) => product.id === item.id
        );

        if (!product) {
          throw new Error(
            `Unknown product: ${item.id}`
          );
        }

        if (product.stock <= 0) {
          throw new Error(
            `${product.name} ${product.strength} is currently out of stock.`
          );
        }

        if (item.quantity > product.stock) {
          throw new Error(
            `Only ${product.stock} unit${
              product.stock === 1 ? "" : "s"
            } of ${product.name} ${product.strength} are currently available.`
          );
        }

        /*
         * Validate price before sending it to Stripe.
         */

        if (
          !Number.isFinite(product.price) ||
          product.price <= 0
        ) {
          throw new Error(
            `Invalid price for ${product.name}.`
          );
        }

        return {
          quantity: item.quantity,

          price_data: {
            currency: "gbp",

            /*
             * Supabase stores pounds.
             * Stripe expects pence.
             *
             * £48 -> 4800
             */

            unit_amount: Math.round(
              product.price * 100
            ),

            product_data: {
              name: `${product.name} ${product.strength}`,

              description:
                `${product.code} — laboratory research use only`,

              metadata: {
                product_id: product.id,
                product_code: product.code,
              },
            },
          },
        };
      });

    /*
     * --------------------------------------------------
     * SITE URL
     * --------------------------------------------------
     */

    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      "http://localhost:3000";

    /*
     * Remove trailing slash if one exists.
     */

    const siteUrl = site.replace(/\/+$/, "");

    /*
     * --------------------------------------------------
     * CREATE STRIPE CHECKOUT SESSION
     * --------------------------------------------------
     */

    const stripe = new Stripe(stripeKey);

    const session =
      await stripe.checkout.sessions.create({
        mode: "payment",

        line_items: lineItems,

        success_url:
          `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/cancel`,

        billing_address_collection: "required",

        shipping_address_collection: {
          allowed_countries: ["GB"],
        },

        /*
         * Allows Stripe to collect the customer's
         * email address during checkout.
         */

        customer_creation: "if_required",

        /*
         * Useful later for your order confirmation
         * webhook.
         */

        metadata: {
          source: "syntra-labs-store",
        },
      });

    /*
     * --------------------------------------------------
     * CHECKOUT URL
     * --------------------------------------------------
     */

    if (!session.url) {
      throw new Error(
        "Stripe did not return a checkout URL."
      );
    }

    console.log(
      "Stripe Checkout created:",
      session.id
    );

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    /*
     * --------------------------------------------------
     * ZOD VALIDATION ERRORS
     * --------------------------------------------------
     */

    if (error instanceof z.ZodError) {
      console.error(
        "CHECKOUT_VALIDATION_ERROR:",
        error.issues
      );

      return NextResponse.json(
        {
          error:
            "The shopping cart contains invalid data.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------
     * GENERAL ERRORS
     * --------------------------------------------------
     */

    console.error(
      "STRIPE_CHECKOUT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout failed",
      },
      {
        status: 400,
      }
    );
  }
}