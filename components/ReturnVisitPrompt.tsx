"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "syntra_visit_count_v2";

type Props = {
  offerCount: number;
  lowStockCount: number;
};

export default function ReturnVisitPrompt({ offerCount, lowStockCount }: Props) {
  const [returning, setReturning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const current = Number(window.localStorage.getItem(KEY) || "0");
      const next = current + 1;
      window.localStorage.setItem(KEY, String(next));
      setReturning(next > 1);
    } catch {
      setReturning(false);
    }
  }, []);

  if (!returning || dismissed) return null;

  return (
    <section className="return-visit-shell" aria-label="Updated catalogue message">
      <div className="return-visit-card">
        <div className="return-visit-pulse"><span /></div>
        <div>
          <small>WELCOME BACK</small>
          <strong>The live catalogue is worth another look.</strong>
          <p>
            {offerCount} current offer{offerCount === 1 ? "" : "s"} and {lowStockCount} limited-stock item{lowStockCount === 1 ? "" : "s"} are visible now.
          </p>
        </div>
        <Link href="/offers">See what changed <span>→</span></Link>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
      </div>
    </section>
  );
}
