"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: form.get("password") }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || "Login failed."); setLoading(false); return; }
    router.push("/admin"); router.refresh();
  }
  return <main className="narrow-page"><section className="login-card"><p className="eyebrow">Secure administration</p><h1>Admin login</h1><p>Use the password configured in <code>ADMIN_PASSWORD</code>.</p><form onSubmit={submit}><label>Password<input name="password" type="password" required autoFocus /></label><button className="button primary" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>{error && <p className="form-status error">{error}</p>}</form></section></main>;
}
