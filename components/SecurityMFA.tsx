"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string; status?: string; created_at?: string };
type Enrollment = { factorId: string; qr: string; secret: string } | null;

export default function SecurityMFA() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment>(null);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return setNotice(error.message);
    setFactors((data?.totp || []) as Factor[]);
  }

  useEffect(() => { void load(); }, []);

  async function startEnroll() {
    const supabase = getBrowserSupabase(); if (!supabase) return;
    setBusy(true); setNotice("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Syntra Authenticator" });
    setBusy(false);
    if (error) return setNotice(error.message);
    setEnrollment({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function verifyEnroll() {
    const supabase = getBrowserSupabase(); if (!supabase || !enrollment || code.trim().length < 6) return;
    setBusy(true); setNotice("");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });
    if (challengeError) { setBusy(false); return setNotice(challengeError.message); }
    const { error } = await supabase.auth.mfa.verify({ factorId: enrollment.factorId, challengeId: challenge.id, code: code.trim() });
    setBusy(false);
    if (error) return setNotice(error.message);
    setEnrollment(null); setCode(""); setNotice("Authenticator protection enabled."); await load();
  }

  async function removeFactor(factorId: string) {
    const supabase = getBrowserSupabase(); if (!supabase) return;
    if (!window.confirm("Remove this authenticator from your account?")) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) return setNotice(`${error.message} If required, sign in again and complete your authenticator challenge first.`);
    setNotice("Authenticator removed."); await load();
  }

  return <div className="v10-mfa-panel">
    <div className="v10-mfa-head"><span><small>TWO-FACTOR AUTHENTICATION</small><strong>Authenticator app</strong><p>Add a time-based one-time password as a second sign-in factor.</p></span><b className={factors.some((factor) => factor.status === "verified") ? "enabled" : ""}>{factors.some((factor) => factor.status === "verified") ? "ENABLED" : "OPTIONAL"}</b></div>
    {notice && <div className="v10-mfa-notice">{notice}</div>}
    {factors.filter((factor) => factor.status === "verified").map((factor) => <div className="v10-mfa-factor" key={factor.id}><span><strong>{factor.friendly_name || "Authenticator"}</strong><small>Verified second factor</small></span><button type="button" disabled={busy} onClick={() => void removeFactor(factor.id)}>Remove</button></div>)}
    {!enrollment && <button type="button" className="v10-mfa-enroll" disabled={busy} onClick={() => void startEnroll()}>{busy ? "Preparing…" : factors.some((factor) => factor.status === "verified") ? "Add another authenticator" : "Set up authenticator"}</button>}
    {enrollment && <div className="v10-mfa-enrollment"><div><img src={enrollment.qr} alt="Authenticator QR code" /><span><small>MANUAL SECRET</small><code>{enrollment.secret}</code></span></div><p>Scan the QR code in your authenticator app, then enter the current 6-digit code to verify this factor.</p><div><input inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" /><button type="button" disabled={busy || code.length < 6} onClick={() => void verifyEnroll()}>Verify & enable</button><button type="button" onClick={() => { setEnrollment(null); setCode(""); }}>Cancel</button></div></div>}
  </div>;
}
