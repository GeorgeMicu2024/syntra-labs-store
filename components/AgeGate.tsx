"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "syntra_research_access_v1";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function AgeGate() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [researchConfirmed, setResearchConfirmed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const acceptedAt = stored ? Number(stored) : 0;
      const stillValid = acceptedAt > 0 && Date.now() - acceptedAt < THIRTY_DAYS;
      setVisible(!stillValid);
    } catch {
      setVisible(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.classList.toggle("age-gate-open", visible);
    return () => document.body.classList.remove("age-gate-open");
  }, [ready, visible]);

  if (!ready || !visible) return null;

  function enterSite() {
    if (!ageConfirmed || !researchConfirmed) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Access still continues if localStorage is unavailable.
    }
    setVisible(false);
  }

  function leaveSite() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "https://www.google.com/";
  }

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-ambient age-gate-ambient-one" />
      <div className="age-gate-ambient age-gate-ambient-two" />

      <div className="age-gate-card">
        <div className="age-gate-brand">
          <span className="age-gate-mark">SL</span>
          <div>
            <strong>SYNTRA</strong>
            <small>LABS · RESEARCH CATALOGUE</small>
          </div>
        </div>

        <div className="age-gate-status">
          <span /> RESEARCH-ONLY ACCESS
        </div>

        <h1 id="age-gate-title">Confirm professional research access.</h1>
        <p className="age-gate-lead">
          Syntra Labs presents laboratory research materials and scientific catalogue information.
          Products are not medicines and are not intended for human or veterinary use.
        </p>

        <div className="age-gate-checks">
          <label>
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(event) => setAgeConfirmed(event.target.checked)}
            />
            <span className="age-check-ui" aria-hidden="true">✓</span>
            <span>
              <b>I am 18 years of age or older.</b>
              <small>I understand this catalogue is restricted to adult users.</small>
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={researchConfirmed}
              onChange={(event) => setResearchConfirmed(event.target.checked)}
            />
            <span className="age-check-ui" aria-hidden="true">✓</span>
            <span>
              <b>I am accessing in a professional research capacity.</b>
              <small>I will use catalogue materials only in an appropriate laboratory research context.</small>
            </span>
          </label>
        </div>

        <button
          type="button"
          className="age-gate-enter"
          disabled={!ageConfirmed || !researchConfirmed}
          onClick={enterSite}
        >
          I confirm — enter catalogue <span>→</span>
        </button>

        <button type="button" className="age-gate-leave" onClick={leaveSite}>
          Leave site
        </button>

        <p className="age-gate-legal">
          By continuing you acknowledge our <Link href="/policies/terms">Terms</Link>,{" "}
          <Link href="/standards">Research-use standards</Link> and{" "}
          <Link href="/policies/privacy">Privacy Policy</Link>.
        </p>

        <div className="age-gate-foot">
          <span>UK research catalogue</span>
          <span>Secure checkout</span>
          <span>Direct support</span>
        </div>
      </div>
    </div>
  );
}
