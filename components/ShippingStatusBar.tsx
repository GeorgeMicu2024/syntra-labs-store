"use client";

import { useEffect, useState } from "react";
import { getDispatchState } from "@/lib/shipping";

export default function ShippingStatusBar() {
  const [state, setState] = useState(() => getDispatchState());

  useEffect(() => {
    const timer = window.setInterval(() => setState(getDispatchState()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={`shipping-status-bar ${state.sameDay ? "same-day" : "next-day"}`}>
      <span className="shipping-status-dot" />
      <strong>FREE UK SHIPPING</strong>
      <span className="shipping-status-divider" />
      <span>{state.shortLabel}</span>
      <small>Cutoff {state.cutoffLabel}</small>
    </div>
  );
}
