import Link from "next/link";

export default function StandardsShowcase() {
  return (
    <section className="standards-showcase">
      <div className="standards-visual">
        <img src="/design/hero-vials.jpg" alt="Syntra Labs catalogue presentation" />
        <div className="standards-visual-label"><span>CATALOGUE STANDARD</span><b>Clarity before claims.</b></div>
      </div>
      <div className="standards-copy">
        <span className="kicker">THE SYNTRA STANDARD</span>
        <h2>Designed like a laboratory catalogue, not a hype page.</h2>
        <p>
          We separate product identity, live commercial information and published scientific context.
          That makes the catalogue easier to audit, easier to navigate and clearer about what the evidence actually supports.
        </p>
        <div className="standards-list">
          <div><span>01</span><p><b>Identity</b><small>Product name, code, strength and category are consistently presented.</small></p></div>
          <div><span>02</span><p><b>Evidence</b><small>Research notes distinguish clinical, early clinical, preclinical and mechanistic literature.</small></p></div>
          <div><span>03</span><p><b>Commerce</b><small>Prices are resolved server-side from the live catalogue before Stripe checkout.</small></p></div>
        </div>
        <Link href="/standards" className="text-link">Read our catalogue standards <span>→</span></Link>
      </div>
    </section>
  );
}
