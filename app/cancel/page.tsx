import Link from "next/link";
export default function Cancel() {
  return <section className="result-page"><span className="result-icon muted">×</span><span className="kicker">CHECKOUT CLOSED</span><h1>No payment was taken.</h1><p>Your checkout was cancelled. Items remain in the browser cart so you can review the order before trying again.</p><Link className="button-secondary" href="/shop">Return to catalogue</Link></section>;
}
