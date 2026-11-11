import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isInstitutionalEmail } from "@/lib/institutional-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(254) });

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  // Only accept requests from the same website (not cross-origin form submissions).
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return reply({ error: "Request rejected." }, 403);
      }
    } catch {
      return reply({ error: "Request rejected." }, 403);
    }
  }

  if (Number(request.headers.get("content-length") || 0) > 1024) {
    return reply({ error: "Invalid request." }, 413);
  }

  let email: string;
  try {
    const payload = schema.safeParse(await request.json());
    if (!payload.success) return reply({ error: "Enter a valid email address." }, 400);
    email = payload.data.email.toLowerCase();
  } catch {
    return reply({ error: "Invalid request." }, 400);
  }

  if (!isInstitutionalEmail(email)) {
    return reply({ error: "Please use an approved university, government or laboratory email." }, 403);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return reply({ error: "Email confirmation is temporarily unavailable." }, 503);

  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: "https://www.syntralabs.co.uk/account" },
    });

    if (error) {
      console.error("Syntra confirmation resend failed", { code: error.code, status: error.status });
      if (error.code === "email_address_not_authorized") {
        return reply({
          error: "Email delivery is not configured for this address. Syntra support needs to enable custom SMTP in Supabase before confirmations can be sent.",
        }, 503);
      }
      if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        return reply({ error: "Too many confirmation requests. Please try again later." }, 429);
      }
      if (error.status === 400 || error.status === 422) {
        return reply({ error: "Unable to resend confirmation. The address may already be confirmed or the signup may need to be restarted. Please contact support." }, 400);
      }
      return reply({ error: "The email service could not send the confirmation. Please contact support." }, 503);
    }

    // Do not claim delivery; providers can accept a request without delivering it.
    return reply({
      message: "Confirmation requested. Check your institutional inbox and junk folder. If nothing arrives, contact Syntra support; email delivery may need to be configured.",
    });
  } catch {
    console.error("Syntra confirmation resend could not reach Supabase");
    return reply({ error: "Could not reach the email service. Please try again later." }, 503);
  }
}
