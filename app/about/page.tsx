import Link from "next/link";

export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <span className="kicker">ABOUT SYNTRA LABS</span>
          <h1>A research catalogue built around <em>clarity.</em></h1>
          <p>
            Syntra Labs combines a focused UK catalogue, live inventory, secure checkout and an evidence-orientation layer designed to keep scientific context separate from commercial claims.
          </p>
        </div>
        <div className="about-mark"><span>SL</span><small>RESEARCH CATALOGUE · UNITED KINGDOM</small></div>
      </section>

      <section className="about-values">
        <article><span>CATALOGUE</span><h2>Structured information</h2><p>Names, strengths, codes, categories, prices and stock are presented in a consistent system across the storefront.</p></article>
        <article><span>RESEARCH</span><h2>Evidence-aware copy</h2><p>Mechanism summaries are grounded in published literature and explicitly labelled by evidence stage.</p></article>
        <article><span>COMMERCE</span><h2>Server-verified checkout</h2><p>Checkout uses current server-side catalogue data before creating a Stripe session.</p></article>
        <article><span>SUPPORT</span><h2>Human contact</h2><p>UK-focused order support is available for practical catalogue and fulfilment questions.</p></article>
      </section>

      <section className="about-cta">
        <div><span className="kicker">EXPLORE</span><h2>See how the catalogue is organised.</h2></div>
        <div><Link href="/shop" className="button-primary">Browse catalogue</Link><Link href="/research" className="button-secondary">Research library</Link></div>
      </section>
    </div>
  );
}
