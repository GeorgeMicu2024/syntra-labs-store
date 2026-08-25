export const metadata = {
  title: "Privacy Policy | Syntra Labs",
  description:
    "Learn how Syntra Labs collects, uses, protects and manages customer information.",
};

export default function PrivacyPage() {
  return (
    <main className="content-page policy privacy-policy-page">
      {/* HEADER */}

      <section className="policy-header">
        <span className="kicker">
          LEGAL · CUSTOMER PRIVACY
        </span>

        <h1>Privacy Policy</h1>

        <p className="policy-intro">
          Syntra Labs respects your privacy and is committed to
          handling personal information responsibly, transparently
          and securely.
        </p>

        <div className="policy-meta">
          <span>Last updated: 25 August 2026</span>
          <span>UK Customer Privacy</span>
          <span>Secure Account Infrastructure</span>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="policy-section">
        <h2>1. Who we are</h2>

        <p>
          Syntra Labs operates the{" "}
          <strong>syntralabs.co.uk</strong> online research
          catalogue.
        </p>

        <p>
          This Privacy Policy explains how personal information may
          be collected, used, stored and protected when you visit our
          website, create an account, place an order, contact us or
          otherwise interact with our services.
        </p>

        <div className="policy-contact-card">
          <span>PRIVACY CONTACT</span>

          <strong>Syntra Labs</strong>

          <a href="mailto:support@syntralabs.co.uk">
            support@syntralabs.co.uk
          </a>
        </div>
      </section>

      {/* INFORMATION COLLECTED */}

      <section className="policy-section">
        <h2>2. Information we collect</h2>

        <p>
          Depending on how you use Syntra Labs, we may collect and
          process different categories of personal information.
        </p>

        <div className="policy-grid">
          <article className="policy-card">
            <span>ACCOUNT DATA</span>

            <h3>Account information</h3>

            <p>
              When you create an account, information may include:
            </p>

            <ul>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Telephone number</li>
              <li>Account preferences</li>
              <li>Marketing preferences</li>
              <li>Authentication and account-security records</li>
            </ul>

            <p>
              Authentication services are provided through Supabase
              Auth. Syntra Labs does not store customer passwords in
              plaintext.
            </p>
          </article>

          <article className="policy-card">
            <span>DELIVERY DATA</span>

            <h3>Saved addresses</h3>

            <p>
              Signed-in customers may save delivery information to
              their account, including:
            </p>

            <ul>
              <li>Full name</li>
              <li>Delivery address</li>
              <li>Billing address</li>
              <li>Postcode</li>
              <li>Telephone number</li>
            </ul>
          </article>

          <article className="policy-card">
            <span>ORDER DATA</span>

            <h3>Order information</h3>

            <p>
              Order records may include:
            </p>

            <ul>
              <li>Order reference</li>
              <li>Products and quantities</li>
              <li>Order value</li>
              <li>Member discount information</li>
              <li>Account credit applied</li>
              <li>Payment status</li>
              <li>Dispatch and fulfilment status</li>
              <li>Order history</li>
            </ul>
          </article>

          <article className="policy-card">
            <span>TECHNICAL DATA</span>

            <h3>Website and device information</h3>

            <p>
              Certain technical information may be processed
              automatically when you use the website, including:
            </p>

            <ul>
              <li>IP address</li>
              <li>Browser information</li>
              <li>Device information</li>
              <li>Pages visited</li>
              <li>Referral source</li>
              <li>Website interactions</li>
              <li>Security and diagnostic information</li>
            </ul>
          </article>
        </div>
      </section>

      {/* PAYMENTS */}

      <section className="policy-section">
        <h2>3. Payments</h2>

        <p>
          Payments are processed securely using{" "}
          <strong>Stripe Checkout</strong>.
        </p>

        <p>
          Syntra Labs does not directly store your full payment-card
          number, CVC or complete card credentials. Payment
          information is processed by Stripe in accordance with its
          own security and privacy requirements.
        </p>

        <div className="policy-security-row">
          <span>Secure checkout</span>
          <span>Encrypted connections</span>
          <span>No plaintext card storage</span>
        </div>
      </section>

      {/* HOW DATA IS USED */}

      <section className="policy-section">
        <h2>4. How we use your information</h2>

        <p>
          Personal information may be processed where necessary to:
        </p>

        <ul className="policy-list">
          <li>Create and maintain your customer account</li>
          <li>Authenticate and secure account access</li>
          <li>Process and fulfil orders</li>
          <li>Provide delivery and dispatch information</li>
          <li>Process payments and refunds</li>
          <li>
            Apply eligible member pricing, discounts or account
            credit
          </li>
          <li>Maintain customer order history</li>
          <li>Save delivery addresses and account preferences</li>
          <li>Respond to customer-support enquiries</li>
          <li>Send transactional account and order communications</li>
          <li>Prevent fraud, misuse and security incidents</li>
          <li>
            Maintain and improve the security and reliability of the
            website
          </li>
          <li>
            Meet applicable legal, regulatory, tax and accounting
            obligations
          </li>
        </ul>
      </section>

      {/* LEGAL BASIS */}

      <section className="policy-section">
        <h2>5. Legal bases for processing</h2>

        <p>
          Where UK data-protection law applies, personal information
          is processed only where an appropriate lawful basis exists.
        </p>

        <div className="policy-grid">
          <article className="policy-card compact">
            <span>CONTRACT</span>
            <p>
              Processing necessary to provide products or services
              requested by the customer, including order processing
              and fulfilment.
            </p>
          </article>

          <article className="policy-card compact">
            <span>LEGAL OBLIGATION</span>
            <p>
              Processing required to comply with applicable legal,
              tax, accounting or regulatory requirements.
            </p>
          </article>

          <article className="policy-card compact">
            <span>LEGITIMATE INTERESTS</span>
            <p>
              Processing reasonably necessary for website security,
              fraud prevention, customer support and service
              improvement.
            </p>
          </article>

          <article className="policy-card compact">
            <span>CONSENT</span>
            <p>
              Processing based on your permission, including certain
              marketing communications or optional technologies where
              consent is required.
            </p>
          </article>
        </div>
      </section>

      {/* SERVICE PROVIDERS */}

      <section className="policy-section">
        <h2>6. Service providers</h2>

        <p>
          Syntra Labs uses selected technology providers to operate
          its customer platform.
        </p>

        <div className="policy-provider-list">
          <article>
            <strong>Stripe</strong>
            <span>Payment processing and secure checkout</span>
          </article>

          <article>
            <strong>Supabase</strong>
            <span>
              Authentication, customer accounts and database
              infrastructure
            </span>
          </article>

          <article>
            <strong>Resend</strong>
            <span>Transactional email delivery</span>
          </article>

          <article>
            <strong>Vercel</strong>
            <span>Website hosting and application infrastructure</span>
          </article>
        </div>
      </section>

      {/* EMAIL */}

      <section className="policy-section">
        <h2>7. Email communications</h2>

        <p>
          Syntra Labs may send transactional emails relating to your
          account or purchases, including:
        </p>

        <ul className="policy-list">
          <li>Email verification</li>
          <li>Password recovery</li>
          <li>Security notifications</li>
          <li>Order confirmation</li>
          <li>Payment or order updates</li>
          <li>Dispatch information</li>
        </ul>

        <p>
          Optional marketing, catalogue or promotional communications
          should only be sent where an appropriate legal basis
          applies. Where applicable, you can unsubscribe from
          marketing communications at any time.
        </p>
      </section>

      {/* COOKIES / LOCAL STORAGE */}

      <section className="policy-section">
        <h2>8. Cookies and browser storage</h2>

        <p>
          Syntra Labs may use cookies, browser storage and similar
          technologies to provide essential website functionality.
        </p>

        <p>
          Browser storage may be used to remember information such as:
        </p>

        <ul className="policy-list">
          <li>Shopping-cart contents</li>
          <li>Account and interface preferences</li>
          <li>Recently viewed products</li>
          <li>Research-access confirmation</li>
          <li>Other essential website states</li>
        </ul>

        <p>
          Where non-essential analytics, advertising or similar
          technologies require consent, they should only be activated
          in accordance with the choices presented to the user.
        </p>
      </section>

      {/* RETENTION */}

      <section className="policy-section">
        <h2>9. Data retention</h2>

        <p>
          Personal information is retained only for as long as
          reasonably necessary for the purpose for which it was
          collected and to satisfy applicable legal, accounting,
          security and regulatory requirements.
        </p>

        <p>
          Account information may be retained while your account
          remains active and for an appropriate period afterwards.
          Order and transaction records may be retained for longer
          where required for accounting, tax, fraud-prevention or
          legal purposes.
        </p>
      </section>

      {/* SECURITY */}

      <section className="policy-section">
        <h2>10. How we protect your information</h2>

        <p>
          Syntra Labs uses technical and organisational measures
          designed to protect personal information against
          unauthorised access, alteration, disclosure or loss.
        </p>

        <div className="policy-security-grid">
          <span>HTTPS encrypted connections</span>
          <span>Secure authentication</span>
          <span>Database access controls</span>
          <span>Row-level security</span>
          <span>Restricted administrative access</span>
          <span>Secure third-party payment processing</span>
          <span>Server-side transaction validation</span>
          <span>Account security notifications</span>
        </div>

        <p>
          No internet-based system can guarantee absolute security,
          but we aim to maintain safeguards appropriate to the
          information being processed.
        </p>
      </section>

      {/* RIGHTS */}

      <section className="policy-section">
        <h2>11. Your data-protection rights</h2>

        <p>
          Subject to applicable UK data-protection law and certain
          legal limitations, you may have rights including the right
          to:
        </p>

        <ul className="policy-list">
          <li>Request access to your personal information</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of eligible information</li>
          <li>Request restriction of certain processing</li>
          <li>Object to certain processing</li>
          <li>Request portability of eligible information</li>
          <li>
            Withdraw consent where processing is based on consent
          </li>
        </ul>

        <p>
          You may also have the right to raise a complaint with the
          UK Information Commissioner&apos;s Office (ICO) if you
          believe your personal information has been handled in
          breach of applicable data-protection law.
        </p>
      </section>

      {/* INTERNATIONAL */}

      <section className="policy-section">
        <h2>12. International processing</h2>

        <p>
          Some technology providers used by Syntra Labs may process
          or store information outside the United Kingdom.
        </p>

        <p>
          Where personal information is transferred internationally,
          appropriate safeguards should be used where required by
          applicable data-protection legislation.
        </p>
      </section>

      {/* AGE */}

      <section className="policy-section">
        <h2>13. Age restriction</h2>

        <p>
          The Syntra Labs research catalogue is intended for adults
          aged <strong>18 years or over</strong>.
        </p>

        <p>
          We do not knowingly intend to provide customer accounts or
          catalogue access to children.
        </p>
      </section>

      {/* CHANGES */}

      <section className="policy-section">
        <h2>14. Changes to this Privacy Policy</h2>

        <p>
          We may update this Privacy Policy where our services,
          technology, legal obligations or business practices change.
        </p>

        <p>
          The latest version will be published on this page together
          with its most recent update date.
        </p>
      </section>

      {/* CONTACT */}

      <section className="policy-section policy-final-contact">
        <span className="kicker">
          PRIVACY SUPPORT
        </span>

        <h2>Questions about your data?</h2>

        <p>
          For privacy-related enquiries, requests concerning your
          personal information or questions regarding this Privacy
          Policy, contact Syntra Labs.
        </p>

        <a
          href="mailto:support@syntralabs.co.uk"
          className="button primary"
        >
          Contact privacy support
        </a>

        <small>
          support@syntralabs.co.uk
        </small>
      </section>
    </main>
  );
}