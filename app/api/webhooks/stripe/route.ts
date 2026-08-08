import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  // Check Stripe configuration
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET
  ) {
    console.error("Stripe webhook environment variables are missing");

    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  try {
    // IMPORTANT: Stripe requires the raw request body
    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Stripe webhook received:", event.type);

    // Handle successful Checkout payments
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Paid checkout:", session.id);

      // Prevent sending confirmation for an unpaid Checkout Session
      if (session.payment_status !== "paid") {
        console.log(
          "Checkout session is not paid yet:",
          session.id,
          session.payment_status
        );

        return NextResponse.json({ received: true });
      }

      // Retrieve complete Checkout Session
      const checkout = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items.data.price.product"],
        }
      );

      // Customer information
      const customerEmail =
        checkout.customer_details?.email ||
        checkout.customer_email;

      const customerName =
        checkout.customer_details?.name || "Customer";

      if (!customerEmail) {
        console.error(
          "No customer email found for checkout:",
          checkout.id
        );

        return NextResponse.json({ received: true });
      }

      // Build order items
      const items =
        checkout.line_items?.data
          .map((item) => {
            const quantity = item.quantity || 1;

            const amount = (
              (item.amount_total || 0) / 100
            ).toFixed(2);

            return `
              <tr>
                <td
                  style="
                    padding:14px 0;
                    border-bottom:1px solid #e5e7eb;
                    color:#111827;
                  "
                >
                  ${escapeHtml(item.description || "Product")}
                </td>

                <td
                  style="
                    padding:14px 10px;
                    border-bottom:1px solid #e5e7eb;
                    text-align:center;
                    color:#111827;
                  "
                >
                  ${quantity}
                </td>

                <td
                  style="
                    padding:14px 0;
                    border-bottom:1px solid #e5e7eb;
                    text-align:right;
                    color:#111827;
                  "
                >
                  £${amount}
                </td>
              </tr>
            `;
          })
          .join("") || "";

      const total = (
        (checkout.amount_total || 0) / 100
      ).toFixed(2);

      // Resend configuration
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.error(
          "RESEND_API_KEY is not configured in Vercel"
        );

        return NextResponse.json({ received: true });
      }

      const fromEmail =
        process.env.CONTACT_FROM_EMAIL ||
        "Syntra Labs <orders@syntralabs.co.uk>";

      const supportEmail =
        process.env.CONTACT_TO_EMAIL ||
        "support@syntralabs.co.uk";

      // Send confirmation email
      const emailResponse = await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            from: fromEmail,

            to: [customerEmail],

            reply_to: supportEmail,

            subject: "Your Syntra Labs order is confirmed",

            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8" />
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                  />
                </head>

                <body
                  style="
                    margin:0;
                    padding:0;
                    background:#f4f6f8;
                    font-family:Arial,Helvetica,sans-serif;
                  "
                >
                  <div
                    style="
                      padding:30px 15px;
                    "
                  >

                    <div
                      style="
                        max-width:600px;
                        margin:0 auto;
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                        box-shadow:0 4px 18px rgba(0,0,0,0.06);
                      "
                    >

                      <!-- HEADER -->

                      <div
                        style="
                          background:#07101f;
                          padding:32px 20px;
                          text-align:center;
                        "
                      >

                        <div
                          style="
                            color:#ffffff;
                            font-size:26px;
                            font-weight:700;
                            letter-spacing:5px;
                          "
                        >
                          SYNTRA
                        </div>

                        <div
                          style="
                            color:#637cff;
                            font-size:11px;
                            font-weight:700;
                            letter-spacing:6px;
                            margin-top:4px;
                          "
                        >
                          LABS
                        </div>

                      </div>

                      <!-- CONTENT -->

                      <div
                        style="
                          padding:35px 32px;
                          color:#111827;
                          line-height:1.6;
                        "
                      >

                        <div
                          style="
                            display:inline-block;
                            background:#ecfdf5;
                            color:#047857;
                            padding:7px 12px;
                            border-radius:20px;
                            font-size:13px;
                            font-weight:600;
                            margin-bottom:18px;
                          "
                        >
                          ✓ Payment confirmed
                        </div>

                        <h1
                          style="
                            margin:0 0 20px;
                            font-size:25px;
                            line-height:1.3;
                            color:#111827;
                          "
                        >
                          Thank you for your order
                        </h1>

                        <p>
                          Hi ${escapeHtml(customerName)},
                        </p>

                        <p>
                          Your payment has been received successfully
                          and your Syntra Labs order is now confirmed.
                        </p>

                        <!-- ORDER REFERENCE -->

                        <div
                          style="
                            background:#f8fafc;
                            border:1px solid #e5e7eb;
                            border-radius:8px;
                            padding:15px;
                            margin:25px 0;
                          "
                        >
                          <div
                            style="
                              font-size:12px;
                              color:#6b7280;
                              margin-bottom:4px;
                              text-transform:uppercase;
                              letter-spacing:1px;
                            "
                          >
                            Order reference
                          </div>

                          <div
                            style="
                              font-size:13px;
                              font-weight:600;
                              color:#111827;
                              word-break:break-all;
                            "
                          >
                            ${escapeHtml(checkout.id)}
                          </div>
                        </div>

                        <!-- ORDER ITEMS -->

                        <h2
                          style="
                            font-size:18px;
                            margin:30px 0 10px;
                          "
                        >
                          Order summary
                        </h2>

                        <table
                          width="100%"
                          cellpadding="0"
                          cellspacing="0"
                          style="
                            width:100%;
                            border-collapse:collapse;
                          "
                        >

                          <thead>
                            <tr>

                              <th
                                style="
                                  text-align:left;
                                  padding:10px 0;
                                  font-size:12px;
                                  color:#6b7280;
                                  text-transform:uppercase;
                                "
                              >
                                Product
                              </th>

                              <th
                                style="
                                  text-align:center;
                                  padding:10px;
                                  font-size:12px;
                                  color:#6b7280;
                                  text-transform:uppercase;
                                "
                              >
                                Qty
                              </th>

                              <th
                                style="
                                  text-align:right;
                                  padding:10px 0;
                                  font-size:12px;
                                  color:#6b7280;
                                  text-transform:uppercase;
                                "
                              >
                                Amount
                              </th>

                            </tr>
                          </thead>

                          <tbody>
                            ${items}
                          </tbody>

                        </table>

                        <!-- TOTAL -->

                        <div
                          style="
                            text-align:right;
                            padding-top:22px;
                            font-size:20px;
                            font-weight:700;
                            color:#111827;
                          "
                        >
                          Total paid: £${total}
                        </div>

                        <!-- NEXT STEPS -->

                        <div
                          style="
                            margin-top:35px;
                            padding-top:25px;
                            border-top:1px solid #e5e7eb;
                          "
                        >

                          <h2
                            style="
                              font-size:18px;
                              margin:0 0 12px;
                            "
                          >
                            What happens next?
                          </h2>

                          <p style="margin-bottom:10px;">
                            We are now processing your order.
                          </p>

                          <p style="margin-top:0;">
                            If we require any additional information,
                            our support team will contact you.
                          </p>

                        </div>

                        <p style="margin-top:30px;">
                          Need help with your order? Simply reply to
                          this email and our support team will assist
                          you.
                        </p>

                        <p style="margin-top:30px;">
                          Thank you,<br />
                          <strong>Syntra Labs</strong>
                        </p>

                      </div>

                      <!-- FOOTER -->

                      <div
                        style="
                          background:#07101f;
                          padding:25px 20px;
                          text-align:center;
                          color:#9ca3af;
                          font-size:12px;
                          line-height:1.8;
                        "
                      >

                        <div
                          style="
                            color:#ffffff;
                            font-weight:700;
                            letter-spacing:2px;
                            margin-bottom:8px;
                          "
                        >
                          SYNTRA LABS
                        </div>

                        <div>
                          ${escapeHtml(supportEmail)}
                        </div>

                        <div>
                          +44 7490 544199
                        </div>

                        <div style="margin-top:10px;">
                          United Kingdom
                        </div>

                      </div>

                    </div>

                  </div>
                </body>
              </html>
            `,
          }),
        }
      );

      // Check Resend response
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();

        console.error(
          "Order confirmation email failed:",
          emailResponse.status,
          errorText
        );
      } else {
        const emailResult = await emailResponse.json();

        console.log(
          "Order confirmation sent:",
          customerEmail,
          emailResult
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invalid webhook",
      },
      { status: 400 }
    );
  }
}

// Prevent customer-controlled data from injecting HTML into the email
function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        } as Record<string, string>
      )[character] || character
  );
}