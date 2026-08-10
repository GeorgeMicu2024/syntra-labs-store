"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "", marketing: false, referral: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

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

    if (form.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("The passwords do not match.");
      return;
    }

    const supabase = getBrowserSupabase();
    if (!supabase) {
      setError("Customer accounts are not configured yet. Add the Supabase public key to your environment variables.");
      return;
    }

    setBusy(true);
    const redirect = `${window.location.origin}/account`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirect,
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          marketing_opt_in: form.marketing,
          referral_code: form.referral.trim().toUpperCase() || undefined,
        },
      },
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Account created. Your 20% first-order benefit is active." }));
      router.push("/account");
      router.refresh();
      return;
    }

    setMessage("Account created. Check your email to confirm your address, then sign in to activate your 20% first-order member pricing.");
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-two-col">
        <label>First name<input required autoComplete="given-name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></label>
        <label>Last name<input required autoComplete="family-name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></label>
      </div>
      <label>Email address<input type="email" required autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></label>
      <div className="auth-two-col">
        <label>Password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} /></label>
        <label>Confirm password<input type="password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} /></label>
      </div>
      <label>Referral code <span className="v10-optional">optional</span><input value={form.referral} onChange={(e) => update("referral", e.target.value.toUpperCase())} placeholder="e.g. SL12AB34CD56" /></label>
      <label className="auth-consent"><input type="checkbox" checked={form.marketing} onChange={(e) => update("marketing", e.target.checked)} /><span>Send me occasional catalogue, stock and offer updates. I can unsubscribe at any time.</span></label>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-success">{message}</div>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account & unlock 20%"}</button>
      <p className="auth-smallprint">The 20% welcome benefit is applied automatically to the first paid order completed while signed in. Subsequent signed-in orders receive 10% returning-customer pricing.</p>
      <div className="auth-form-links"><span>Already registered?</span><Link href="/account/sign-in">Sign in</Link></div>
    </form>
  );
}
