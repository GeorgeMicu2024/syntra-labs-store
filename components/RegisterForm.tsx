"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isInstitutionalEmail } from "@/lib/institutional-email";

export default function RegisterForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "", marketing: false, referral: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const referral = new URLSearchParams(window.location.search).get("ref") || "";
    if (referral) setForm((current) => ({ ...current, referral: referral.toUpperCase() }));
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isInstitutionalEmail(form.email)) {
      setError("Registration is limited to institutional email addresses (.edu, .gov, .ac.uk, .gov.uk or an approved laboratory domain). Personal email addresses cannot be used.");
      return;
    }

    if (form.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      // Same-origin request avoids Safari's intermittent cross-origin
      // "Load failed" on Supabase Auth. Passwords are never logged or stored.
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify(form),
      });
      const result: { error?: string; message?: string } = await response
        .json()
        .catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Registration is temporarily unavailable. Please try again later.");
        return;
      }
      setForm((current) => ({ ...current, password: "", confirm: "" }));
      setMessage(result.message || "Registration request accepted. Check your inbox and spam folder, or use the resend button below.");
    } catch {
      setError("Unable to reach Syntra Labs. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    setError("");
    setMessage("");
    if (!isInstitutionalEmail(form.email)) {
      setError("Enter your institutional email address above before requesting another confirmation.");
      return;
    }

    setResendBusy(true);
    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const result: { error?: string; message?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "Unable to resend the confirmation right now.");
        return;
      }
      setMessage(result.message || "Confirmation requested. Please check your inbox and spam folder.");
    } catch {
      setError("Could not contact the confirmation service. Please try again.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-two-col">
        <label>First name<input required autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></label>
        <label>Last name<input required autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></label>
      </div>
      <label>Verified institutional email address<input type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="researcher@university.ac.uk" /><small>University, government or manually approved laboratory domains only. Personal email providers are not accepted.</small></label>
      <div className="auth-two-col">
        <label>Password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} /></label>
        <label>Confirm password<input type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} /></label>
      </div>
      <label>Referral code <span className="v10-optional">optional</span><input value={form.referral} onChange={(e) => update("referral", e.target.value.toUpperCase())} placeholder="e.g. SL12AB34CD56" /></label>
      <label className="auth-consent"><input type="checkbox" checked={form.marketing} onChange={(e) => update("marketing", e.target.checked)} /><span>Send me occasional catalogue, stock and offer updates. I can unsubscribe at any time.</span></label>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      <p className="auth-smallprint">Not receiving your institutional confirmation email? Check Junk / Spam, then try the resend option below.</p>
      <button className="auth-submit" type="button" disabled={busy || resendBusy} onClick={resendConfirmation}>
        {resendBusy ? "Requesting confirmation…" : "Resend confirmation email"}
      </button>
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account & unlock 20%"}</button>
      <p className="auth-smallprint">The 20% welcome benefit is applied automatically to the first paid order completed while signed in. Subsequent signed-in orders receive 10% returning-customer pricing.</p>
      <div className="auth-form-links"><span>Already registered?</span><Link href="/account/sign-in">Sign in</Link></div>
    </form>
  );
}
