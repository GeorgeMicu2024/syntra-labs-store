"use client";

import { useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok) {
      setState("sent");
      setMessage(body.message || "Your message has been sent.");
      event.currentTarget.reset();
    } else {
      setState("error");
      setMessage(body.error || "Your message could not be sent.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-grid">
        <label>Full name<input required name="name" autoComplete="name" /></label>
        <label>Email address<input required type="email" name="email" autoComplete="email" /></label>
      </div>
      <label>Order reference (optional)<input name="orderReference" /></label>
      <label>Subject<select name="subject" defaultValue="Product enquiry"><option>Product enquiry</option><option>Order support</option><option>Delivery question</option><option>Business enquiry</option></select></label>
      <label>Message<textarea required name="message" rows={7} minLength={10} /></label>
      <label className="honeypot" aria-hidden="true">Company website<input tabIndex={-1} name="website" autoComplete="off" /></label>
      <button className="button primary" disabled={state === "sending"} type="submit">
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      {message && <p className={`form-status ${state}`}>{message}</p>}
    </form>
  );
}
