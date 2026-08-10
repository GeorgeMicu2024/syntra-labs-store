"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "syntra-age-gate-confirmed";
const VALID_FOR_DAYS = 30;

export default function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  /*
   * ---------------------------------------------------------
   * CHECK SAVED CONFIRMATION
   * ---------------------------------------------------------
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const confirmedAt = Number(stored);

        const expiresAt =
          confirmedAt +
          VALID_FOR_DAYS * 24 * 60 * 60 * 1000;

        if (
          Number.isFinite(confirmedAt) &&
          Date.now() < expiresAt
        ) {
          setVisible(false);
          setReady(true);
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
      }

      setVisible(true);
    } catch {
      /*
       * If localStorage is unavailable,
       * show the age gate normally.
       */
      setVisible(true);
    }

    setReady(true);
  }, []);

  /*
   * ---------------------------------------------------------
   * LOCK PAGE SCROLL WHILE GATE IS OPEN
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!ready) return;

    document.body.classList.toggle(
      "age-gate-open",
      visible
    );

    return () => {
      document.body.classList.remove(
        "age-gate-open"
      );
    };
  }, [visible, ready]);

  /*
   * ---------------------------------------------------------
   * ENTER SITE
   * ---------------------------------------------------------
   */
  function enterSite() {
    if (!confirmed) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        String(Date.now())
      );
    } catch {
      /*
       * Continue even if browser storage
       * is disabled.
       */
    }

    setVisible(false);

    window.dispatchEvent(
      new CustomEvent(
        "syntra:age-gate-accepted"
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * LEAVE SITE
   * ---------------------------------------------------------
   */
  function leaveSite() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "https://www.google.com/";
  }

  /*
   * Avoid flashing the gate briefly before
   * localStorage has been checked.
   */
  if (!ready || !visible) {
    return null;
  }

  return (
    <div
      className="age-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="age-gate-card v7-age-gate-card">

        {/* TOP */}
        <div className="v7-gate-top">
          <div className="age-gate-brand">
            <span className="age-gate-mark">
              SL
            </span>

            <div>
              <strong>SYNTRA</strong>
              <small>
                LABS · RESEARCH CATALOGUE
              </small>
            </div>
          </div>

          <span className="v7-18-badge">
            18+
          </span>
        </div>

        {/* STATUS */}
        <div className="age-gate-status">
          <span />
          RESTRICTED RESEARCH ACCESS
        </div>

        {/* TITLE */}
        <h1 id="age-gate-title">
          Research access confirmation.
        </h1>

        {/* INTRO */}
        <p className="age-gate-lead">
          Access to the Syntra Labs catalogue is restricted
          to adults accessing materials for legitimate
          laboratory research purposes.
        </p>

        {/* SINGLE CONFIRMATION */}
        <div className="age-gate-checks">
          <label>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) =>
                setConfirmed(event.target.checked)
              }
            />

            <span
              className="age-check-ui"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>
              <b>
                I confirm that I am 18 years of age or older
                and that I will use all catalogue materials
                for laboratory research purposes only.
              </b>

              <small>
                Catalogue materials are not intended for
                human or veterinary use. This confirmation
                will be remembered on this browser for 30 days.
              </small>
            </span>
          </label>
        </div>

        {/* ENTER BUTTON */}
        <button
          type="button"
          className="age-gate-enter"
          disabled={!confirmed}
          onClick={enterSite}
        >
          Confirm & enter catalogue
          <span>→</span>
        </button>

        {/* LEAVE BUTTON */}
        <button
          type="button"
          className="age-gate-leave"
          onClick={leaveSite}
        >
          Leave site
        </button>

        {/* LEGAL */}
        <p className="age-gate-legal">
          By continuing you acknowledge our{" "}
          <Link href="/policies/terms">
            Terms
          </Link>
          ,{" "}
          <Link href="/standards">
            Research-use standards
          </Link>{" "}
          and{" "}
          <Link href="/policies/privacy">
            Privacy Policy
          </Link>
          .
        </p>

        {/* FOOTER */}
        <div className="age-gate-foot">
          <span>18+ access</span>
          <span>Research use only</span>
          <span>UK catalogue</span>
          <span>Secure checkout</span>
        </div>

      </div>
    </div>
  );
}