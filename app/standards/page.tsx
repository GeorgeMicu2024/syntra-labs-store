import Link from "next/link";

export const metadata = { title: "Catalogue Standards" };

export default function Standards() {
  return (
    <div className="standards-page">
      <section className="standards-hero">
        <span className="kicker">THE SYNTRA STANDARD</span>
        <h1>Clarity, traceability and <em>responsible research communication.</em></h1>
        <p>
          A professional research catalogue should make it easy to distinguish product identity, commercial information,
          scientific literature and claims that require independent analytical verification.
        </p>
      </section>

      <section className="standards-principles">
        <article><span>01</span><h2>Catalogue identity</h2><p>Every listing is structured around product name, catalogue code, strength, category and live availability.</p></article>
        <article><span>02</span><h2>Evidence separation</h2><p>Published literature is presented as compound-level scientific context. A paper about a molecule is not proof of a catalogue vial&apos;s quality.</p></article>
        <article><span>03</span><h2>No dosing content</h2><p>The public catalogue intentionally excludes administration protocols, therapeutic instructions and veterinary guidance.</p></article>
        <article><span>04</span><h2>Server-side commerce</h2><p>Prices and stock are checked on the server before Stripe Checkout is created, rather than trusting values sent by the browser.</p></article>
        <article><span>05</span><h2>Research-use positioning</h2><p>Catalogue materials are presented for laboratory research use only and not for human or veterinary use.</p></article>
        <article><span>06</span><h2>Transparent support</h2><p>Order and catalogue support is separated from scientific interpretation or medical advice.</p></article>
      </section>

      <section className="standards-evidence-band">
        <div>
          <span className="kicker">EVIDENCE LABELS</span>
          <h2>Not all research evidence is equal.</h2>
          <p>Our research library labels evidence as clinical, early clinical, preclinical, mechanistic or laboratory accessory context.</p>
        </div>
        <Link href="/research" className="button-secondary">Explore research library</Link>
      </section>
    </div>
  );
}
