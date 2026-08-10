export const metadata = { title: "Shipping" };

export default function Shipping() {
  return (
    <div className="info-page">
      <section className="info-page-hero"><span className="kicker">FULFILMENT</span><h1>Shipping, without the guesswork.</h1><p>Clear address collection, protected packaging and order support for UK deliveries.</p></section>
      <section className="info-cards-grid">
        <article><span>01</span><h2>United Kingdom</h2><p>The production checkout is configured to collect UK delivery addresses. Any shipping price or service level shown at checkout should be treated as the final order-specific option.</p></article>
        <article><span>02</span><h2>Order confirmation</h2><p>Successful Stripe checkout can trigger the configured order-confirmation email and provides a transaction reference for support.</p></article>
        <article><span>03</span><h2>Address accuracy</h2><p>Please enter a complete delivery address during checkout. Address corrections after dispatch may not be possible.</p></article>
        <article><span>04</span><h2>Support</h2><p>For delivery questions, contact support with the order reference shown in your confirmation.</p></article>
      </section>
    </div>
  );
}
