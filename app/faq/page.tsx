export const metadata = { title: "FAQ" };

const items = [
  ["What are catalogue materials intended for?", "Catalogue materials are presented for laboratory research use only and are not intended for human or veterinary use."],
  ["What does the Research Library mean?", "It summarises compound-level published literature and labels the evidence stage. A publication about a compound does not verify the identity, purity, safety or suitability of a catalogue item."],
  ["Are prices current?", "The storefront retrieves live catalogue data when Supabase is configured, and the server checks current product pricing again before creating Stripe Checkout."],
  ["How is my order confirmed?", "After successful checkout, Stripe redirects to the confirmation page. When Resend and the Stripe webhook are configured, an order-confirmation email is also sent to the customer email collected at checkout."],
  ["How do I contact support?", "Use the Contact page, email support@syntralabs.co.uk or call / WhatsApp +44 7490 544199. Include your order reference for an existing order."],
  ["Does support provide medical advice?", "No. Catalogue support covers products, orders and delivery. The site does not provide dosing, administration, therapeutic or veterinary guidance."],
];

export default function FAQ() {
  return (
    <div className="faq-page">
      <section className="info-page-hero"><span className="kicker">CUSTOMER INFORMATION</span><h1>Frequently asked questions.</h1><p>Practical information about the catalogue, research notes, checkout and support.</p></section>
      <section className="faq-list">
        {items.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
      </section>
    </div>
  );
}
