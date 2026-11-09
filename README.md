# Syntra Labs Professional V9

Production-oriented Next.js storefront with Supabase catalogue data, Supabase customer accounts, Stripe Checkout, Resend transactional email, member pricing, saved addresses, order history, research dossier pages and responsive cart/search experiences.

Start with **README-V9.md** for the one-time Supabase migration, Auth redirect URLs, environment variables and deployment checklist.

Local start:

```powershell
npm install
npm run dev
```

Or double-click `START-SYNTRA.bat` on Windows.

## Institutional checkout requirements (Stripe)

- Checkout requires a signed-in Supabase account with a **confirmed institutional email**. Guests, unconfirmed accounts and personal email domains cannot create Stripe sessions.
- Accepted by default: recognised university/government email suffixes such as `.edu`, `.gov`, `.ac.uk`, `.gov.uk`, plus NHS institutions. Other legitimate laboratory organisations require manual review. Add approved domain names to `NEXT_PUBLIC_APPROVED_INSTITUTION_DOMAINS` (comma-separated, e.g. `approved-lab.org.uk`) in Vercel and redeploy. Do not approve consumer/public email services.
- Checkout binds the verified email to a Stripe Customer, keeping the email field non-editable in Stripe Checkout. Expired sessions cannot be recovered into a new session without repeating verification.
- **Required production Auth setting:** Supabase Dashboard → Authentication → Sign In / Providers → Email → **Confirm email: ON**. Otherwise Supabase may auto-confirm signups and `email_confirmed_at` cannot prove inbox verification. Configure reliable SMTP delivery and the production redirect URL (`https://www.syntralabs.co.uk/account`). This setting must be verified manually in the actual Syntra Supabase project before submitting the Stripe review.
- To provide checkout access to Stripe, share `https://www.syntralabs.co.uk/shop` and the institutional registration/confirmation steps. A reviewer needs a valid institutional inbox; do not create a public bypass or share a privileged account. Test with a verified institutional address and confirm `401` (guest) / `403` (personal or unconfirmed email) responses at `/api/checkout` before going live.
