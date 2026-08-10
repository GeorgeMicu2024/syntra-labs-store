# Syntra Labs V10 — Customer Platform & Operations Command Centre

V10 extends the V9 storefront into a customer-account and operations platform. It intentionally does **not** add COA, purity, third-party-testing, pharmaceutical-grade, GMP or similar claims.

## V10 highlights

- 18+ / research-use gate on every full page load.
- Supabase Auth registration, sign-in, email recovery and optional TOTP authenticator MFA.
- My Syntra dashboard with Overview, Orders, Addresses, Saved Products, Rewards, Notifications and Security.
- 20% first paid order / 10% returning signed-in member pricing retained and verified server-side.
- Saved products / wishlist, back-in-stock alerts and price-drop alerts.
- Cross-device saved basket for signed-in customers.
- Order history, reorder flow, customer-facing tracking timeline and status emails.
- Referral identity, reward points, membership tiers and transparent account-credit ledger.
- Optional Syntra credit redemption at Checkout using an atomic Supabase credit reservation and Stripe amount-off coupon.
- Checkout-session expiry releases reserved account credit automatically.
- Optional abandoned-checkout recovery email for customers who explicitly opted in to catalogue/offer email updates.
- Admin command centre: revenue snapshot, orders, customers, inventory, offers, low-stock watch and account-credit liability.
- Admin order status publishing creates timeline events, in-app notifications and Resend email updates.
- Product admin edits live price, compare-at price, stock, badge and featured state.
- Admin price/stock changes can trigger saved-product alerts.

## Required database setup

If V9 is already installed, run only:

`supabase/v10-platform.sql`

If this is a fresh Supabase project, run:

1. `supabase/schema.sql`
2. `supabase/v9-customer-platform.sql`
3. `supabase/v10-platform.sql`

Run them in that order in **Supabase → SQL Editor**.

## Environment variables

Copy your existing `.env.local` into this project. Never commit it.

Required for the complete platform:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
CONTACT_FROM_EMAIL=Syntra Labs <orders@syntralabs.co.uk>
CONTACT_TO_EMAIL=support@syntralabs.co.uk
SESSION_SECRET=
ADMIN_PASSWORD=
```

A legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` can still be used instead of the publishable key.

## Supabase Auth URLs

In **Supabase → Authentication → URL Configuration**, use the production domain as Site URL and allow these redirects:

- `https://www.syntralabs.co.uk/account`
- `https://www.syntralabs.co.uk/account/reset-password`
- `http://localhost:3000/account`
- `http://localhost:3000/account/reset-password`

## Stripe webhook events

The existing webhook route is:

`/api/webhooks/stripe`

Make sure the Stripe webhook destination sends at least:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`

The expired-session event is used to release any reserved Syntra account credit and can send one recovery email to opted-in members.

## Saved-product alerts

Stock / price alerts are checked when catalogue edits are made through **Syntra Admin → Products**. If you change product rows directly in the Supabase dashboard, the storefront data updates, but the V10 application email/notification helper is not invoked for that direct database edit.

## Authenticator MFA

Customers can opt in from **My Syntra → Security**. After a verified TOTP factor exists, V10 asks for the authenticator code after the normal email/password step.

## Start locally

Double-click:

`START-SYNTRA.bat`

or run:

```powershell
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production checks

Run:

```powershell
npm run typecheck
npm run build
```

or use `BUILD-PRODUCTION.bat`.

## GitHub

`.gitignore` excludes `.env*`, `node_modules` and `.next`. Before pushing, still run `git status` and confirm no secret file is staged.
