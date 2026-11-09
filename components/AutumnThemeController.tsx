"use client";

import { useEffect, useState } from "react";
import { isWithinAutumnWindow } from "@/lib/autumn-campaign";
import AutumnLeaves from "./AutumnLeaves";

/** Refresh the site-wide seasonal class even on statically cached routes. */
export default function AutumnThemeController({ enabled }: { enabled: boolean }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const shouldEnable = enabled && isWithinAutumnWindow();
      document.documentElement.classList.toggle("autumn-site", shouldEnable);
      setActive(shouldEnable);
    };

    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return active ? <div className="autumn-global-leaves" aria-hidden="true"><AutumnLeaves /></div> : null;
}
