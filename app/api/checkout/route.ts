import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { getProducts } from "@/lib/supabase-rest";
import {
  getAdminSupabase,
  getUserFromRequest,
} from "@/lib/supabase/server-auth";
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
    /*
     * -------------------------------------------------------
     * STRIPE CONFIG
     * -------------------------------------------------------
     */

    const stripeKey =
      process.env.STRIPE_SECRET_KEY?.trim();

    if (
      !stripeKey ||
      !/^sk_(test|live)_/.test(stripeKey)
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe secret key is missing or incorrectly configured.",
        },
        { status: 503 }
      );
    }

    const stripe = new Stripe(stripeKey);

    /*
     * -------------------------------------------------------
     * REQUEST
     * -------------------------------------------------------
     */

    const body = schema.parse(
      await req.json()
    );

    const products = await getProducts();

    if (!products.length) {
      throw new Error(
        "No products are currently available."
      );
    }

    /*
     * -------------------------------------------------------
     * AUTH
     * -------------------------------------------------------
     */

    const user =
      await getUserFromRequest(req);

    const admin =
      getAdminSupabase();

    /*
     * -------------------------------------------------------
     * MEMBER DATA
     * -------------------------------------------------------
     */

    let discountPercent = 0;
    let discountType:
      | "guest"
      | "welcome"
      | "loyalty" = "guest";

    let stripeCustomerId:
      | string
      | null = null;

    let availableCreditPence = 0;

    let defaultAddress:
      | SavedAddress
      | null = null;

    let profileName = "";
    let profilePhone = "";

    /*
     * IMPORTANT:
     *
     * If a valid authenticated user exists,
     * default to 20% welcome pricing.
     *
     * Supabase admin data can later downgrade
     * this to 10% if the customer already has
     * one or more paid orders.
     *
     * This prevents authenticated customers
     * from accidentally falling back to guest
     * pricing if service-role access is missing.
     */

    if (user) {
      discountPercent = 20;
      discountType = "welcome";

      /*
       * -----------------------------------------------------
       * LOAD CUSTOMER REWARDS / PROFILE / ADDRESS
       * -----------------------------------------------------
       */

      if (admin) {
        const [
          rewardsResult,
          profileResult,
          addressResult,
        ] = await Promise.all([
          admin
            .from("customer_rewards")
            .select(
              `
              paid_order_count,
              welcome_discount_used,
              stripe_customer_id,
              store_credit_pence
              `
            )
            .eq("user_id", user.id)
            .maybeSingle(),

          admin
            .from("profiles")
            .select(
              "first_name,last_name,phone"
            )
            .eq("id", user.id)
            .maybeSingle(),

          admin
            .from("addresses")
            .select(
              `
              full_name,
              line1,
              line2,
              city,
              county,
              postcode,
              country,
              phone
              `
            )
            .eq("user_id", user.id)
            .eq("is_default", true)
            .maybeSingle(),
        ]);

        /*
         * Log DB errors without silently
         * converting authenticated users
         * into guests.
         */

        if (rewardsResult.error) {
          console.error(
            "CUSTOMER_REWARDS_READ_ERROR:",
            rewardsResult.error
          );
        }

        if (profileResult.error) {
          console.error(
            "PROFILE_READ_ERROR:",
            profileResult.error
          );
        }

        if (addressResult.error) {
          console.error(
            "ADDRESS_READ_ERROR:",
            addressResult.error
          );
        }

        const rewards =
          rewardsResult.data;

        const profile =
          profileResult.data;

        const address =
          addressResult.data;

        /*
         * ---------------------------------------------------
         * MEMBER DISCOUNT
         * ---------------------------------------------------
         */

        const paidOrderCount =
          Number(
            rewards?.paid_order_count || 0
          );

        if (paidOrderCount > 0) {
          discountPercent = 10;
          discountType = "loyalty";
        } else {
          discountPercent = 20;
          discountType = "welcome";
        }

        stripeCustomerId =
          rewards?.stripe_customer_id ||
          null;

        availableCreditPence =
          Number(
            rewards?.store_credit_pence || 0
          );

        defaultAddress =
          (address as SavedAddress | null) ||
          null;

        profileName = [
          profile?.first_name,
          profile?.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();

        profilePhone =
          profile?.phone || "";

        /*
         * ---------------------------------------------------
         * CREATE STRIPE CUSTOMER IF NEEDED
         * ---------------------------------------------------
         */

        if (!stripeCustomerId) {
          const customer =
            await stripe.customers.create({
              email:
                user.email || undefined,

              name:
                profileName || undefined,

              phone:
                profilePhone || undefined,

              metadata: {
                syntra_user_id:
                  user.id,
              },
            });

          stripeCustomerId =
            customer.id;

          const updateResult =
            await admin
              .from("customer_rewards")
              .update({
                stripe_customer_id:
                  customer.id,

                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "user_id",
                user.id
              );

          if (updateResult.error) {
            console.error(
              "STRIPE_CUSTOMER_ID_SAVE_ERROR:",
              updateResult.error
            );
          }
        }

        /*
         * ---------------------------------------------------
         * UPDATE STRIPE CUSTOMER ADDRESS
         * ---------------------------------------------------
         */

        if (
          stripeCustomerId &&
          defaultAddress
        ) {
          await stripe.customers.update(
            stripeCustomerId,
            {
              name:
                defaultAddress.full_name ||
                profileName ||
                undefined,

              phone:
                defaultAddress.phone ||
                profilePhone ||
                undefined,

              shipping: {
                name:
                  defaultAddress.full_name ||
                  profileName ||
                  "Customer",

                phone:
                  defaultAddress.phone ||
                  profilePhone ||
                  undefined,

                address: {
                  line1:
                    defaultAddress.line1,

                  line2:
                    defaultAddress.line2 ||
                    undefined,

                  city:
                    defaultAddress.city,

                  state:
                    defaultAddress.county ||
                    undefined,

                  postal_code:
                    defaultAddress.postcode,

                  country:
                    defaultAddress.country ||
                    "GB",
                },
              },
            }
          );
        }
      } else {
        /*
         * Admin client unavailable.
         *
         * Authenticated customer keeps the
         * safe default 20% welcome discount.
         *
         * Log this because returning-member
         * logic, store credit and saved address
         * require service-role access.
         */

        console.error(
          "SUPABASE_ADMIN_NOT_CONFIGURED:",
          "Authenticated customer detected, but admin Supabase client is unavailable."
        );
      }
    }

    /*
     * -------------------------------------------------------
     * VALIDATE CART / ORIGINAL SUBTOTAL
     * -------------------------------------------------------
     */

    const originalSubtotal =
      body.items.reduce(
        (sum, item) => {
          const product =
            products.find(
              (candidate) =>
                candidate.id === item.id
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

          if (
            item.quantity >
            product.stock
          ) {
            throw new Error(
              `Only ${product.stock} unit${
                product.stock === 1
                  ? ""
                  : "s"
              } of ${product.name} ${
                product.strength
              } are currently available.`
            );
          }

          if (
            !Number.isFinite(
              product.price
            ) ||
            product.price <= 0
          ) {
            throw new Error(
              `Invalid price for ${product.name}.`
            );
          }

          const unitPence =
            Math.round(
              product.price * 100
            );

          return (
            sum +
            unitPence *
              item.quantity
          );
        },
        0
      );

    /*
     * -------------------------------------------------------
     * STRIPE LINE ITEMS WITH MEMBER PRICE
     * -------------------------------------------------------
     */

    const lineItems:
      Stripe.Checkout.SessionCreateParams.LineItem[] =
      body.items.map((item) => {
        const product =
          products.find(
            (candidate) =>
              candidate.id === item.id
          )!;

        const baseUnitAmount =
          Math.round(
            product.price * 100
          );

        /*
         * Server-side authoritative
         * member discount.
         */

        const unitAmount =
          Math.max(
            1,
            Math.round(
              baseUnitAmount *
                (1 -
                  discountPercent /
                    100)
            )
          );

        return {
          quantity: item.quantity,

          price_data: {
            currency: "gbp",

            unit_amount:
              unitAmount,

            product_data: {
              name:
                `${product.name} ${product.strength}`,

              description:
                `${product.code} — laboratory research use only`,

              metadata: {
                product_id:
                  product.id,

                product_code:
                  product.code,

                base_unit_amount:
                  String(
                    baseUnitAmount
                  ),

                member_discount_percent:
                  String(
                    discountPercent
                  ),
              },
            },
          },
        };
      });

    /*
     * -------------------------------------------------------
     * DISCOUNT CALCULATION
     * -------------------------------------------------------
     */

    const discountedSubtotal =
      lineItems.reduce(
        (sum, item) => {
          const amount =
            item.price_data
              ?.unit_amount || 0;

          const quantity =
            item.quantity || 1;

          return (
            sum +
            amount * quantity
          );
        },
        0
      );

    const discountAmount =
      Math.max(
        0,
        originalSubtotal -
          discountedSubtotal
      );

    /*
     * -------------------------------------------------------
     * ACCOUNT CREDIT
     * -------------------------------------------------------
     */

    let creditReservationId:
      | string
      | null = null;

    let creditAmount = 0;

    let creditCouponId:
      | string
      | null = null;

    if (
      user &&
      admin &&
      body.useCredit &&
      availableCreditPence > 0
    ) {
      /*
       * Keep at least £0.50
       * payable through Stripe.
       */

      const requestedCredit =
        Math.min(
          availableCreditPence,

          Math.max(
            0,
            discountedSubtotal - 50
          )
        );

      if (requestedCredit > 0) {
        const {
          data: reserved,
          error: reserveError,
        } = await admin.rpc(
          "syntra_reserve_credit",
          {
            p_user_id:
              user.id,

            p_requested:
              requestedCredit,
          }
        );

        if (reserveError) {
          throw new Error(
            "Account credit could not be reserved securely."
          );
        }

        const row =
          Array.isArray(reserved)
            ? reserved[0]
            : reserved;

        creditReservationId =
          row?.reservation_id ||
          null;

        creditAmount =
          Number(
            row?.amount_pence || 0
          );

        if (
          creditReservationId &&
          creditAmount > 0
        ) {
          const coupon =
            await stripe.coupons.create(
              {
                amount_off:
                  creditAmount,

                currency:
                  "gbp",

                duration:
                  "once",

                name:
                  "Syntra account credit",

                metadata: {
                  syntra_credit_reservation:
                    creditReservationId,
                },
              }
            );

          creditCouponId =
            coupon.id;
        }
      }
    }

    /*
     * -------------------------------------------------------
     * SITE / SHIPPING
     * -------------------------------------------------------
     */

    const site =
      process.env
        .NEXT_PUBLIC_SITE_URL
        ?.trim() ||
      "http://localhost:3000";

    const siteUrl =
      site.replace(/\/+$/, "");

    const dispatch =
      getDispatchState();

    /*
     * -------------------------------------------------------
     * CHECKOUT SESSION
     * -------------------------------------------------------
     */

    const sessionParams:
      Stripe.Checkout.SessionCreateParams =
      {
        mode: "payment",

        line_items:
          lineItems,

        success_url:
          `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${siteUrl}/cancel`,

        billing_address_collection:
          "required",

        shipping_address_collection:
          {
            allowed_countries: [
              "GB",
            ],
          },

        shipping_options: [
          {
            shipping_rate_data:
              {
                type:
                  "fixed_amount",

                fixed_amount: {
                  amount: 0,
                  currency:
                    "gbp",
                },

                display_name:
                  "Free UK shipping",
              },
          },
        ],

        custom_text: {
          shipping_address: {
            message:
              `${dispatch.detail} Dispatch timing is subject to successful payment and order verification.`,
          },
        },

        metadata: {
          source:
            "syntra-labs-store",

          user_id:
            user?.id ||
            "guest",

          discount_type:
            discountType,

          discount_percent:
            String(
              discountPercent
            ),

          original_subtotal:
            String(
              originalSubtotal
            ),

          discounted_subtotal:
            String(
              discountedSubtotal
            ),

          discount_amount:
            String(
              discountAmount
            ),

          credit_amount:
            String(
              creditAmount
            ),

          credit_reservation_id:
            creditReservationId ||
            "",

          dispatch_window:
            dispatch.label,
        },

        expires_at:
          Math.floor(
            Date.now() / 1000
          ) +
          60 * 60 * 2,

        after_expiration: {
          recovery: {
            enabled: true,
          },
        },
      };

    /*
     * Store credit coupon.
     */

    if (creditCouponId) {
      sessionParams.discounts =
        [
          {
            coupon:
              creditCouponId,
          },
        ];
    }

    /*
     * Stripe customer.
     */

    if (stripeCustomerId) {
      sessionParams.customer =
        stripeCustomerId;

      sessionParams.customer_update =
        {
          address: "auto",
          name: "auto",
          shipping: "auto",
        };
    } else {
      sessionParams.customer_creation =
        "always";

      if (user?.email) {
        sessionParams.customer_email =
          user.email;
      }
    }

    /*
     * -------------------------------------------------------
     * CREATE SESSION
     * -------------------------------------------------------
     */

    let session:
      Stripe.Checkout.Session;

    try {
      session =
        await stripe.checkout.sessions.create(
          sessionParams
        );
    } catch (error) {
      /*
       * Release reserved account credit
       * if Stripe session creation fails.
       */

      if (
        creditReservationId &&
        admin
      ) {
        await admin.rpc(
          "syntra_release_credit_reservation_by_id",
          {
            p_reservation_id:
              creditReservationId,
          }
        );
      }

      if (creditCouponId) {
        await stripe.coupons
          .del(
            creditCouponId
          )
          .catch(
            () =>
              undefined
          );
      }

      throw error;
    }

    /*
     * Attach Stripe session to
     * reserved credit.
     */

    if (
      creditReservationId &&
      admin
    ) {
      await admin.rpc(
        "syntra_attach_credit_reservation",
        {
          p_reservation_id:
            creditReservationId,

          p_session_id:
            session.id,
        }
      );
    }

    if (!session.url) {
      throw new Error(
        "Stripe did not return a checkout URL."
      );
    }

    /*
     * -------------------------------------------------------
     * DEBUG / AUDIT
     * -------------------------------------------------------
     */

    console.log(
      "CHECKOUT_CREATED",
      {
        sessionId:
          session.id,

        userId:
          user?.id ||
          "guest",

        discountPercent,

        discountType,

        originalSubtotal,

        discountedSubtotal,

        discountAmount,

        creditAmount,
      }
    );

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */

    return NextResponse.json({
      url:
        session.url,

      member:
        Boolean(user),

      discountPercent,

      discountType,

      subtotal:
        originalSubtotal /
        100,

      discountedSubtotal:
        discountedSubtotal /
        100,

      estimatedSavings:
        discountAmount /
        100,

      creditApplied:
        creditAmount /
        100,

      total:
        Math.max(
          0,
          discountedSubtotal -
            creditAmount
        ) / 100,

      shipping:
        "free",

      dispatch:
        dispatch.label,
    });
  } catch (error) {
    /*
     * -------------------------------------------------------
     * VALIDATION ERROR
     * -------------------------------------------------------
     */

    if (
      error instanceof
      z.ZodError
    ) {
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
     * -------------------------------------------------------
     * SERVER ERROR
     * -------------------------------------------------------
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