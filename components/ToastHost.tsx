"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; detail?: string };

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(event: Event) {
      const custom = event as CustomEvent<{ message?: string; detail?: string }>;
      const toast = { id: Date.now(), message: custom.detail?.message || "Updated", detail: custom.detail?.detail };
      setToasts((current) => [...current.slice(-2), toast]);
      window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), 3200);
    }
    window.addEventListener("syntra:toast", handler);
    return () => window.removeEventListener("syntra:toast", handler);
  }, []);

  return (
    <div className="v7-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className="v7-toast" key={toast.id}>
          <span className="v7-toast-mark">SL</span>
          <div><b>{toast.message}</b>{toast.detail && <small>{toast.detail}</small>}</div>
        </div>
      ))}
    </div>
  );
}
