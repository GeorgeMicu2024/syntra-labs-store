export const metadata = {
  title: "Refund Policy | Syntra Labs",
  description:
    "Read the Syntra Labs refund, cancellation, returns and delivery issue policy.",
};

export default function RefundPolicyPage() {
  return (
    <main className="content-page policy refund-policy-page">
      {/* HEADER */}

      <section className="policy-header">
        <span className="kicker">
          LEGAL · ORDERS & REFUNDS
        </span>

        <h1>Refund Policy</h1>

        <p className="policy-intro">
          Syntra Labs is committed to handling order issues fairly,
          clearly and efficiently. This policy explains how
          cancellations, damaged orders, delivery issues, returns and
          approved refunds are handled for purchases made through
          syntralabs.co.uk.
        </p>

        <div className="policy-meta">
          <span>Last updated: 25 August 2026</span>
          <span>UK Orders</span>
          <span>Secure Stripe Payments</span>
        </div>
      </section>

      {/* ORDER CANCELLATIONS */}

      <section className="policy-section">
        <h2>1. Order cancellations</h2>

        <p>
          If you wish to cancel an order, please contact Syntra Labs
          as soon as possible at{" "}
          <a href="mailto:support@syntralabs.co.uk">
            support@syntralabs.co.uk
          </a>
          .
        </p>

        <p>
          Where an order has not yet been processed or dispatched, we
          will make reasonable efforts to stop fulfilment and process
          an appropriate refund.
        </p>

        <p>
          Once an order has entered fulfilment or has already been
          dispatched, cancellation may no longer be possible.
        </p>

        <div className="policy-contact-card">
          <span>CANCELLATION REQUESTS</span>

          <strong>Contact us as early as possible</strong>

          <a href="mailto:support@syntralabs.co.uk">
            support@syntralabs.co.uk
          </a>
        </div>
      </section>

      {/* DAMAGED OR INCORRECT ORDERS */}

      <section className="policy-section">
        <h2>2. Damaged or incorrect orders</h2>

        <p>
          If your order arrives damaged, incomplete or materially
          different from what was ordered, please contact us promptly
          so that the issue can be investigated.
        </p>

        <p>
          We may request reasonable supporting information, including:
        </p>

        <ul className="policy-list">
          <li>Your Syntra Labs order reference</li>
          <li>A description of the issue</li>
          <li>Photographs of the parcel and external packaging</li>
          <li>Photographs of the affected item or items</li>
          <li>Relevant delivery or tracking information</li>
        </ul>

        <p>
          Where an issue is verified, the appropriate resolution may
          include a replacement, partial refund or full refund,
          depending on the circumstances.
        </p>
      </section>

      {/* MISSING DELIVERY */}

      <section className="policy-section">
        <h2>3. Missing deliveries</h2>

        <p>
          If your parcel has not arrived within a reasonable period,
          please contact us with your order reference and tracking
          information.
        </p>

        <p>
          We may need to investigate the shipment with the relevant
          delivery provider before a final resolution can be issued.
        </p>

        <p>
          Where a shipment is confirmed as lost, or where the
          circumstances otherwise justify a remedy, an appropriate
          replacement or refund may be offered.
        </p>
      </section>

      {/* DELIVERY DETAILS */}

      <section className="policy-section">
        <h2>4. Incorrect delivery details</h2>

        <p>
          Customers are responsible for checking that the delivery
          information submitted at checkout is complete and accurate.
        </p>

        <p>
          If an order cannot be delivered because incorrect or
          incomplete delivery information was supplied, any
          reshipment or refund may be subject to reasonable delivery
          or handling costs where permitted by law.
        </p>

        <div className="policy-security-row">
          <span>Check recipient name</span>
          <span>Check full address</span>
          <span>Check postcode</span>
        </div>
      </section>

      {/* RETURNS */}

      <section className="policy-section">
        <h2>5. Returns</h2>

        <p>
          Please contact Syntra Labs before returning an item. Products
          sent back without prior communication may not be accepted or
          may experience delays while the return is investigated.
        </p>

        <p>
          For hygiene, integrity, storage and product-control reasons,
          certain sealed or sensitive research materials may not be
          suitable for return once they have been opened, unsealed,
          tampered with, improperly stored or otherwise removed from
          their original condition.
        </p>

        <p>
          Where a return is accepted, items should normally be:
        </p>

        <ul className="policy-list">
          <li>Unopened</li>
          <li>Unused</li>
          <li>In their original packaging</li>
          <li>In a condition suitable for inspection</li>
          <li>
            Returned using the instructions provided by Syntra Labs
          </li>
        </ul>

        <p>
          Nothing in this section is intended to restrict statutory
          rights that cannot legally be excluded.
        </p>
      </section>

      {/* REFUNDS */}

      <section className="policy-section">
        <h2>6. Refund processing</h2>

        <p>
          Where a refund is approved, it will normally be returned to
          the original payment method used for the purchase.
        </p>

        <p>
          Syntra Labs processes online payments through Stripe. Once a
          refund has been submitted successfully, the time taken for
          the funds to appear in your account may depend on your bank,
          card issuer or payment provider.
        </p>

        <div className="policy-grid">
          <article className="policy-card compact">
            <span>STEP 01</span>
            <h3>Request reviewed</h3>
            <p>
              We review the order and any supporting information
              provided.
            </p>
          </article>

          <article className="policy-card compact">
            <span>STEP 02</span>
            <h3>Resolution confirmed</h3>
            <p>
              Where appropriate, a replacement, partial refund or full
              refund is approved.
            </p>
          </article>

          <article className="policy-card compact">
            <span>STEP 03</span>
            <h3>Refund submitted</h3>
            <p>
              Approved monetary refunds are normally returned through
              the original payment method.
            </p>
          </article>

          <article className="policy-card compact">
            <span>STEP 04</span>
            <h3>Bank processing</h3>
            <p>
              Final settlement time can depend on the customer's
              financial institution.
            </p>
          </article>
        </div>
      </section>

      {/* SHIPPING */}

      <section className="policy-section">
        <h2>7. Shipping charges</h2>

        <p>
          Where an order qualified for free UK shipping, there will
          normally be no separate outbound shipping charge included in
          the refund calculation.
        </p>

        <p>
          If additional delivery charges were paid, whether those
          charges are refundable will depend on the circumstances of
          the order and applicable legal requirements.
        </p>
      </section>

      {/* MEMBER DISCOUNTS */}

      <section className="policy-section">
        <h2>8. Member pricing, promotions and account credit</h2>

        <p>
          Where an order used promotional pricing, member pricing,
          referral benefits or Syntra account credit, any refund will
          normally be based on the amount actually paid rather than
          the undiscounted catalogue value.
        </p>

        <div className="policy-grid">
          <article className="policy-card compact">
            <span>MEMBER PRICING</span>

            <p>
              Refunds reflect the price actually paid after any
              eligible member discount was applied.
            </p>
          </article>

          <article className="policy-card compact">
            <span>ACCOUNT CREDIT</span>

            <p>
              Syntra credit used on a refunded order may, where
              appropriate, be restored to the customer&apos;s account
              rather than issued as cash.
            </p>
          </article>

          <article className="policy-card compact">
            <span>PROMOTIONS</span>

            <p>
              Promotional benefits may be recalculated where a refund
              changes the conditions that originally qualified the
              order for that promotion.
            </p>
          </article>

          <article className="policy-card compact">
            <span>LOYALTY STATUS</span>

            <p>
              Loyalty or reward eligibility may be adjusted where an
              order is cancelled or refunded.
            </p>
          </article>
        </div>
      </section>

      {/* FRAUD / ABUSE */}

      <section className="policy-section">
        <h2>9. Fraud prevention and refund misuse</h2>

        <p>
          Syntra Labs may review refund requests where there is
          evidence of duplicate claims, suspected payment fraud,
          repeated misuse or other irregular activity.
        </p>

        <p>
          We may request reasonable supporting information before
          approving a refund or replacement.
        </p>

        <p>
          Nothing in this section limits rights or remedies that a
          customer is entitled to under applicable law.
        </p>
      </section>

      {/* STATUTORY RIGHTS */}

      <section className="policy-section">
        <h2>10. Your statutory rights</h2>

        <p>
          Nothing in this Refund Policy is intended to exclude,
          restrict or override any consumer right or remedy that
          cannot legally be excluded under applicable UK law.
        </p>

        <p>
          Where this policy conflicts with a mandatory statutory
          right, the applicable law will take precedence.
        </p>
      </section>

      {/* RESEARCH MATERIALS */}

      <section className="policy-section">
        <h2>11. Research-use catalogue</h2>

        <p>
          Syntra Labs catalogue materials are supplied for laboratory
          research purposes only and are not intended for human or
          veterinary use.
        </p>

        <p>
          Customers should review product information and order
          details carefully before completing checkout.
        </p>
      </section>

      {/* POLICY CHANGES */}

      <section className="policy-section">
        <h2>12. Changes to this policy</h2>

        <p>
          Syntra Labs may update this Refund Policy where fulfilment
          procedures, technology, business practices or applicable
          legal requirements change.
        </p>

        <p>
          The latest version will be published on this page together
          with the date of the most recent update.
        </p>
      </section>

      {/* CONTACT */}

      <section className="policy-section policy-final-contact">
        <span className="kicker">
          ORDER SUPPORT
        </span>

        <h2>Need help with an order?</h2>

        <p>
          For cancellation, damaged-item, delivery, return or refund
          enquiries, contact Syntra Labs and include your order
          reference wherever possible.
        </p>

        <a
          href="mailto:support@syntralabs.co.uk"
          className="button primary"
        >
          Contact order support
        </a>

        <small>
          support@syntralabs.co.uk
        </small>
      </section>
    </main>
  );
}