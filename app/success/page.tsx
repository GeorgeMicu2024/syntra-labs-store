import Link from "next/link";
export default function Success() {
  return <section className="result-page"><span className="result-icon">✓</span><span className="kicker">PAYMENT CONFIRMED</span><h1>Order received.</h1><p>Your Stripe checkout completed successfully. Keep your confirmation email and order reference for your records.</p><Link className="button-primary" href="/shop">Return to catalogue <span>→</span></Link></section>;
}
