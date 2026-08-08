import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main>
      <div className="contact-details">
        <h1>Contact us</h1>

        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@syntralabs.co.uk">
            support@syntralabs.co.uk
          </a>
        </p>

        <p>
          <strong>Phone / WhatsApp:</strong>{" "}
          <a href="tel:+447490544199">
            +44 7490 544199
          </a>
        </p>

        <p>
          <strong>Support hours:</strong> Monday–Friday, 09:00–17:00 UK
        </p>
      </div>

      <ContactForm />
    </main>
  );
}