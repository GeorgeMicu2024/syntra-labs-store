"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfa, setMfa] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [code, setCode] = useState("");

  async function completeSignIn() {
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Welcome back. Member pricing is active." }));
    router.push("/account");
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Customer accounts are not configured yet. Add the Supabase public key to your environment variables.");

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setBusy(false); return setError(signInError.message); }

    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
    if (factorError) { setBusy(false); return setError(factorError.message); }
    const verified = (factors?.totp || []).find((factor: any) => factor.status === "verified");
    if (!verified) { setBusy(false); return void completeSignIn(); }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: verified.id });
    setBusy(false);
    if (challengeError) return setError(challengeError.message);
    setMfa({ factorId: verified.id, challengeId: challenge.id });
  }

  async function verifyMfa(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getBrowserSupabase(); if (!supabase || !mfa) return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.mfa.verify({ factorId: mfa.factorId, challengeId: mfa.challengeId, code: code.trim() });
    setBusy(false);
    if (error) return setError(error.message);
    await completeSignIn();
  }

  if (mfa) return <form className="auth-form v10-mfa-login" onSubmit={verifyMfa}><div className="v10-auth-step"><span>STEP 2 OF 2</span><strong>Authenticator verification</strong><p>Enter the current code from the authenticator linked to your account.</p></div><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" autoFocus required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" /></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" type="submit" disabled={busy || code.length < 6}>{busy ? "Verifying…" : "Verify & continue"}</button><button type="button" className="v10-auth-back" onClick={() => { setMfa(null); setCode(""); }}>Use a different account</button></form>;

  return <form className="auth-form" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in securely"}</button><div className="auth-form-links"><Link href="/account/forgot-password">Forgot password?</Link><Link href="/account/register">Create an account</Link></div></form>;
}
