import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-intro">
        <div>
          <span className="kicker">UK SUPPORT</span>
          <h1>Talk to <em>Syntra Labs.</em></h1>
          <p>For catalogue, order and delivery enquiries. Scientific literature on this website is informational and our support channel does not provide medical or dosing advice.</p>
        </div>
        <div className="contact-channel-grid">
          <a href="mailto:support@syntralabs.co.uk"><span>EMAIL</span><b>support@syntralabs.co.uk</b><small>Catalogue & order support</small></a>
          <a href="tel:+447490544199"><span>PHONE / WHATSAPP</span><b>+44 7490 544199</b><small>Monday–Friday · 09:00–17:00 UK</small></a>
        </div>
      </section>
      <section className="contact-form-shell">
        <div className="contact-form-heading"><span className="kicker">SEND AN ENQUIRY</span><h2>How can we help?</h2><p>Include your order reference when contacting us about an existing order.</p></div>
        <ContactForm />
      </section>
    </div>
  );
}
