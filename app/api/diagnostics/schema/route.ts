import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary read-only diagnostic for the isolated registration preview.
// Removed before merging to main. Returns status metadata, never user rows.
export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!origin || !key) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  const tables = ["products", "profiles", "customer_rewards", "orders", "addresses"];
  const results = await Promise.all(tables.map(async (table) => {
    try {
      const response = await fetch(
        `${origin}/rest/v1/${table}?select=*&limit=0`,
        { headers: { apikey: key, Accept: "application/json" },
          cache: "no-store", signal: AbortSignal.timeout(6000) }
      );
      const error = response.ok ? null : await response.json().catch(() => null);
      return { table, status: response.status, errorCode:
        typeof error?.code === "string" ? error.code : null };
    } catch (error) {
      return { table, status: 0, errorCode:
        error instanceof Error ? error.name : "request_error" };
    }
  }));

  let emailConfirmation: boolean | null = null;
  let settingsStatus = 0;
  try {
    const response = await fetch(`${origin}/auth/v1/settings`, {
      headers: { apikey: key }, cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    settingsStatus = response.status;
    if (response.ok) {
      const data = await response.json();
      if (typeof data.mailer_autoconfirm === "boolean") {
        emailConfirmation = !data.mailer_autoconfirm;
      }
    }
  } catch {}
  return NextResponse.json({ tables: results, auth: { settingsStatus, emailConfirmation } },
    { headers: { "Cache-Control": "no-store" } });
}
