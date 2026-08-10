"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const timer = window.setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords do not match.");
    const supabase = getBrowserSupabase();
    if (!supabase) return setError("Customer accounts are not configured yet.");

    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    window.dispatchEvent(new CustomEvent("syntra:toast", { detail: "Password updated successfully." }));
    router.push("/account");
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {!ready && <div className="auth-note">Open this page using the secure link from your password-reset email. If you have just opened it, allow a moment for verification.</div>}
      <label>New password<input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <label>Confirm new password<input type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
      {error && <div className="auth-error">{error}</div>}
      <button className="auth-submit" type="submit" disabled={busy || !ready}>{busy ? "Updating…" : "Set new password"}</button>
    </form>
  );
}
