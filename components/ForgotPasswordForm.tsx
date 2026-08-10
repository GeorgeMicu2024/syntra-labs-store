"use client";

import Link from "next/link";
import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Customer accounts are not configured yet.");
      return;
    }

    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setBusy(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("If an account exists for that email, a secure password-reset link has been sent.");
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
      <div className="auth-form-links"><Link href="/account/sign-in">Back to sign in</Link></div>
    </form>
  );
}
