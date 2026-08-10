"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

const SESSION_KEY = "syntra-member-offer-v9";

export default function MembershipOffer() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return;

    const show = () => {
      if (sessionStorage.getItem(SESSION_KEY) === "dismissed") return;
      window.setTimeout(() => setOpen(true), 650);
    };

    window.addEventListener("syntra:age-gate-accepted", show);
    return () => window.removeEventListener("syntra:age-gate-accepted", show);
  }, [loading, user]);

  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  function close() {
    sessionStorage.setItem(SESSION_KEY, "dismissed");
    setOpen(false);
  }

  if (!open || user) return null;

  return (
    <div className="member-offer-overlay" role="dialog" aria-modal="true" aria-labelledby="member-offer-title">
      <button className="member-offer-backdrop" type="button" aria-label="Close member offer" onClick={close} />
      <section className="member-offer-card">
        <button className="member-offer-close" type="button" onClick={close} aria-label="Close">×</button>
        <div className="member-offer-eyebrow"><span /> SYNTRA MEMBER ACCESS</div>
        <div className="member-offer-grid">
          <div>
            <span className="member-offer-kicker">WELCOME BENEFIT</span>
            <h2 id="member-offer-title">Create an account.<br /><em>Save 20% on your first order.</em></h2>
            <p>
              Registered customers receive member pricing automatically at secure checkout — no coupon code required.
            </p>
            <div className="member-benefit-chips">
              <span><b>20%</b> first order</span>
              <span><b>10%</b> returning customers</span>
              <span><b>FREE</b> UK shipping</span>
            </div>
            <div className="member-offer-actions">
              <Link href="/account/register" className="button-primary" onClick={close}>Create account <span>→</span></Link>
              <Link href="/account/sign-in" className="button-secondary" onClick={close}>Already registered?</Link>
            </div>
          </div>

          <aside className="member-offer-ops">
            <span className="member-offer-ops-label">DISPATCH STANDARD</span>
            <strong>Order by 12:00</strong>
            <p>Orders completed before 12:00 UK time, Monday–Friday, are scheduled for same-day dispatch.</p>
            <div className="member-offer-divider" />
            <strong>After 12:00</strong>
            <p>Orders completed after the cutoff, or on weekends, are scheduled for next working-day dispatch.</p>
            <small>UK shipping is free. Dispatch timing is operational and subject to order verification.</small>
          </aside>
        </div>
      </section>
    </div>
  );
}
