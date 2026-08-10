"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function MembershipSection() {
  const { user, profile, discountPercent, discountLabel } = useAuth();

  return (
    <section className="membership-section">
      <div className="membership-section-copy">
        <span className="kicker">SYNTRA MEMBER ACCESS</span>
        <h2>Built for customers who return.</h2>
        <p>
          Secure account access brings saved addresses, order history and automatic member pricing into one clean customer workspace.
        </p>
        <div className="membership-actions">
          {user ? (
            <Link href="/account" className="button-primary">Open my account <span>→</span></Link>
          ) : (
            <>
              <Link href="/account/register" className="button-primary">Create account <span>→</span></Link>
              <Link href="/account/sign-in" className="button-secondary">Sign in</Link>
            </>
          )}
        </div>
      </div>

      <div className="membership-benefit-grid">
        <article className="membership-benefit-card feature">
          <span>FIRST ORDER</span>
          <strong>20%</strong>
          <p>Automatic welcome pricing for a newly registered account's first paid order.</p>
        </article>
        <article className="membership-benefit-card">
          <span>RETURNING CUSTOMER</span>
          <strong>10%</strong>
          <p>Automatic loyalty pricing on subsequent paid orders while signed in.</p>
        </article>
        <article className="membership-benefit-card">
          <span>FULFILMENT</span>
          <strong>FREE</strong>
          <p>UK shipping with same-day dispatch scheduled before the 12:00 weekday cutoff.</p>
        </article>
        {user && (
          <article className="membership-benefit-card active-member">
            <span>YOUR STATUS</span>
            <strong>{discountPercent}%</strong>
            <p>{profile?.first_name ? `${profile.first_name}, ` : ""}{discountLabel}.</p>
          </article>
        )}
      </div>
    </section>
  );
}
