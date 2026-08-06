import { NextResponse } from "next/server";
import { z } from "zod";
import { siteConfig } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().trim().min(2).max(100),
  orderReference: z.string().trim().max(100).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional().default(""),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form details." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ message: "Message received." });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || siteConfig.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Syntra Labs <onboarding@resend.dev>";
  if (!apiKey) {
    console.info("CONTACT_FORM", parsed.data);
    return NextResponse.json({
      message: "Form validated. Add RESEND_API_KEY to .env.local to deliver email messages.",
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: parsed.data.email,
      subject: `[Syntra Labs] ${parsed.data.subject}`,
      html: `<h2>New website enquiry</h2><p><strong>Name:</strong> ${escapeHtml(parsed.data.name)}</p><p><strong>Email:</strong> ${escapeHtml(parsed.data.email)}</p><p><strong>Order:</strong> ${escapeHtml(parsed.data.orderReference || "—")}</p><p><strong>Message:</strong></p><p>${escapeHtml(parsed.data.message).replace(/\n/g, "<br>")}</p>`,
    }),
  });
  if (!response.ok) return NextResponse.json({ error: "Email delivery failed. Please email support directly." }, { status: 502 });
  return NextResponse.json({ message: "Thank you. Your message has been sent to our support team." });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] || character));
}
