"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AgeGate() {
  const [visible, setVisible] = useState(true);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [researchConfirmed, setResearchConfirmed] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("age-gate-open", visible);
    return () => document.body.classList.remove("age-gate-open");
  }, [visible]);

  function enterSite() {
    if (!ageConfirmed || !researchConfirmed) return;
    setVisible(false);
    window.dispatchEvent(new CustomEvent("syntra:age-gate-accepted"));
  }

  function leaveSite() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = "https://www.google.com/";
  }

  if (!visible) return null;

  return (
    <div className="age-gate v7-age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-ambient age-gate-ambient-one" />
      <div className="age-gate-ambient age-gate-ambient-two" />
      <div className="v7-gate-grid" aria-hidden="true" />

      <div className="age-gate-card v7-age-gate-card">
        <div className="v7-gate-top">
          <div className="age-gate-brand">
            <span className="age-gate-mark">SL</span>
            <div>
              <strong>SYNTRA</strong>
              <small>LABS · RESEARCH CATALOGUE</small>
            </div>
          </div>
          <span className="v7-18-badge">18+</span>
        </div>

        <div className="age-gate-status"><span /> RESTRICTED RESEARCH ACCESS</div>
        <h1 id="age-gate-title">Research access confirmation.</h1>
        <p className="age-gate-lead">
          This catalogue is intended for adult laboratory-research customers. Catalogue materials are supplied for research use only and are not medicines or products for human or veterinary use.
        </p>

        <div className="age-gate-checks">
          <label>
            <input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} />
            <span className="age-check-ui" aria-hidden="true">✓</span>
            <span>
              <b>I confirm that I am 18 years of age or older.</b>
              <small>Adult access is required each time the catalogue is opened.</small>
            </span>
          </label>

          <label>
            <input type="checkbox" checked={researchConfirmed} onChange={(event) => setResearchConfirmed(event.target.checked)} />
            <span className="age-check-ui" aria-hidden="true">✓</span>
            <span>
              <b>I understand that all catalogue materials are for laboratory research use only.</b>
              <small>No medical, dosing, administration or veterinary guidance is provided.</small>
            </span>
          </label>
        </div>

        <button type="button" className="age-gate-enter" disabled={!ageConfirmed || !researchConfirmed} onClick={enterSite}>
          Confirm & enter catalogue <span>→</span>
        </button>
        <button type="button" className="age-gate-leave" onClick={leaveSite}>Leave site</button>

        <p className="age-gate-legal">
          By continuing you acknowledge our <Link href="/policies/terms">Terms</Link>,{" "}
          <Link href="/standards">Research-use standards</Link> and{" "}
          <Link href="/policies/privacy">Privacy Policy</Link>.
        </p>

        <div className="age-gate-foot">
          <span>18+ access</span><span>Research use only</span><span>UK catalogue</span><span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
}
