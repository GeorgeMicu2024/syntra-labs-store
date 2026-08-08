"use client";

import { useState } from "react";

export default function ContactForm() {
  const [state, setState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const [message, setMessage] = useState("");

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const formElement = event.currentTarget;

    setState("sending");
    setMessage("");

    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (response.ok) {
        setState("sent");
        setMessage(
          body.message || "Your message has been sent."
        );

        formElement.reset();
      } else {
        setState("error");
        setMessage(
          body.error || "Your message could not be sent."
        );
      }
    } catch {
      setState("error");
      setMessage(
        "Your message could not be sent. Please try again."
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-grid">
        <label>
          Full name
          <input
            type="text"
            name="name"
            required
          />
        </label>

        <label>
          Email address
          <input
            type="email"
            name="email"
            required
          />
        </label>
      </div>

      <label>
        Order reference (optional)
        <input
          type="text"
          name="orderReference"
        />
      </label>

      <label>
        Subject
        <select
          name="subject"
          defaultValue="Product enquiry"
          required
        >
          <option>Product enquiry</option>
          <option>Order support</option>
          <option>Delivery question</option>
          <option>Business enquiry</option>
        </select>
      </label>

      <label>
        Message
        <textarea
          name="message"
          required
          minLength={10}
        />
      </label>

      <label className="honeypot">
        Company website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <button
        className="button primary"
        disabled={state === "sending"}
        type="submit"
      >
        {state === "sending"
          ? "Sending…"
          : "Send message"}
      </button>

      {message && (
        <p className={`form-status ${state}`}>
          {message}
        </p>
      )}
    </form>
  );
}