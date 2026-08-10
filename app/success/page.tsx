import Link from "next/link";

export default function Success() {
  return (
    <section className="result-page">
      <span className="result-icon">✓</span>
      <span className="kicker">PAYMENT CONFIRMED</span>
      <h1>Order received.</h1>
      <p>Your secure Stripe checkout completed successfully. Your confirmation email includes your order reference, member-pricing summary and dispatch status.</p>
      <div className="result-actions">
        <Link className="button-primary" href="/account">View my account <span>→</span></Link>
        <Link className="button-secondary" href="/shop">Return to catalogue</Link>
      </div>
    </section>
  );
}
