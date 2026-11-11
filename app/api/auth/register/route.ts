import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isInstitutionalEmail } from "@/lib/institutional-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registrationSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  confirm: z.string().min(8),
  marketing: z.boolean().default(false),
  referral: z.string().trim().max(40).default(""),
});

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && key ? { url, key } : null;
}

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// A safe, non-identifying health check for connectivity diagnostics.
// It does not create users or expose API credentials, emails or tokens.
export async function GET() {
  const provider = config();
  if (!provider) return json({ ready: false, reason: "not_configured" }, 503);
  try {
    const response = await fetch(`${provider.url}/auth/v1/health`, {
      headers: { apikey: provider.key },
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
    });
    return json(
      { ready: response.ok, providerStatus: response.status },
      response.ok ? 200 : 503
    );
  } catch (error) {
    const cause = error && typeof error === "object" && "cause" in error
      ? error.cause as { code?: unknown } | null
      : null;
    const code = typeof cause?.code === "string" ? cause.code : "unknown";
    const errorName = error instanceof Error ? error.name : "unknown";
    // Only record the failure category, never the provider URL or keys.
    console.error("Syntra Auth health request failed", { errorName, code });
    const category = ["ENOTFOUND", "EAI_AGAIN"].includes(code)
      ? "dns_failure"
      : ["ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT"].includes(code) || errorName === "TimeoutError"
      ? "connection_timeout"
      : "connection_failed";
    return json({ ready: false, reason: "provider_unreachable", category }, 503);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ error: "Registration request rejected." }, 403);
      }
    } catch {
      return json({ error: "Registration request rejected." }, 403);
    }
  }

  if (Number(request.headers.get("content-length") || 0) > 8192) {
    return json({ error: "Registration details are too large." }, 413);
  }

  const provider = config();
  if (!provider) {
    return json({ error: "Registration is currently unavailable. Please contact support." }, 503);
  }

  let input: z.infer<typeof registrationSchema>;
  try {
    const parsed = registrationSchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: "Please check all registration fields and try again." }, 400);
    input = parsed.data;
  } catch {
    return json({ error: "Invalid registration request." }, 400);
  }

  if (input.password !== input.confirm) {
    return json({ error: "The passwords do not match." }, 400);
  }
  if (!isInstitutionalEmail(input.email)) {
    return json({
      error: "Registration requires an approved university, government or laboratory email. Personal email domains are not permitted.",
    }, 403);
  }

  const supabase = createClient(provider.url, provider.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  try {
    // Run signup from the Syntra server: iOS Safari never calls the Supabase
    // cross-origin Auth endpoint. Use the public key, never service_role.
    const { data, error } = await supabase.auth.signUp({
      email: input.email.toLowerCase(),
      password: input.password,
      options: {
        emailRedirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.syntralabs.co.uk").origin}/account`,
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          marketing_opt_in: input.marketing,
          referral_code: input.referral.toUpperCase() || undefined,
        },
      },
    });

    if (error) {
      // Never write passwords, emails, keys or full upstream errors to logs.
      console.error("Syntra registration provider error", { code: error.code, status: error.status });
      if (error.code === "email_address_not_authorized") {
        return json({
          error: "Email confirmations cannot be delivered to this address until Syntra Labs enables custom SMTP in Supabase.",
        }, 503);
      }
      if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        return json({ error: "Too many email attempts. Please try again later." }, 429);
      }
      if (error.status === 400 || error.status === 422) {
        return json({ error: error.message }, 400);
      }
      return json({ error: "The registration service is temporarily unavailable. Please try again shortly." }, 503);
    }

    // No account may be considered verified merely because signUp succeeded.
    // A non-null session here suggests email confirmations are disabled.
    if (data.session) {
      console.error("Syntra registration disabled: Supabase email confirmation appears to be off");
      return json({
        error: "Registration is awaiting institutional email verification setup. Please contact support.",
      }, 503);
    }

    return json({
      message: "Registration request accepted. A confirmation email may be sent if delivery is enabled. Check your inbox and Junk / Spam, or use Resend confirmation below. Do not assume your account is verified until you open the confirmation link.",
    }, 200);
  } catch {
    console.error("Syntra registration request failed before receiving a provider response");
    return json({
      error: "The registration service could not be reached. Please try again shortly.",
    }, 503);
  }
}
