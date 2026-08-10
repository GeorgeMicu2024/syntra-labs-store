# Syntra Labs Professional V9 — Customer Platform

V9 extends the V8 storefront with a secure customer-account layer while preserving the existing catalogue, Supabase product source, Stripe checkout, Resend confirmations, cart, offers, Quick View, Recently Viewed and Research Dossier experience.

## New customer platform

- Email/password registration and sign-in with Supabase Auth
- Secure password-reset email flow
- Customer profile management
- Multiple saved UK addresses + one default address
- Saved default address is pushed to the registered Stripe Customer before Checkout
- Paid-order history in My Account
- 20% automatic first paid order pricing for newly registered customers
- 10% automatic returning-customer pricing on subsequent signed-in orders
- Discount eligibility is calculated server-side; browser values are not trusted
- Free UK shipping is displayed in Stripe Checkout
- Before 12:00 UK time Mon–Fri: same-day dispatch scheduling
- After 12:00 / weekends: next working-day dispatch scheduling
- Member acquisition popup appears after the mandatory 18+ gate for guests
- 18+ / research-use disclaimer still appears on every full page load

## ONE-TIME SUPABASE SETUP

### 1. Run the database migration

Open **Supabase → SQL Editor**, create a new query, paste the full contents of:

`supabase/v9-customer-platform.sql`

Run it once.

This creates/updates:

- `profiles`
- `customer_rewards`
- `addresses`
- `orders`
- `order_items`
- Auth-user creation trigger
- Row Level Security policies
- server-only atomic paid-order reward function

The migration also backfills profiles/reward records for any Auth users that already exist.

### 2. Add the browser-safe Supabase key

Your existing server integration already uses:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

V9 also needs ONE browser-safe key:

- preferred: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- legacy alternative: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Get the publishable key from **Supabase → Project Connect / API keys**.

Never expose `SUPABASE_SERVICE_ROLE_KEY` with a `NEXT_PUBLIC_` prefix.

### 3. Configure Auth redirect URLs

In **Supabase → Authentication → URL Configuration** set the production Site URL to:

`https://www.syntralabs.co.uk`

Add redirect URLs for:

- `https://www.syntralabs.co.uk/account`
- `https://www.syntralabs.co.uk/account/reset-password`
- `http://localhost:3000/account`
- `http://localhost:3000/account/reset-password`

Email/password authentication must be enabled.

For production delivery of verification and password-reset email, configure a production-grade SMTP provider in Supabase Auth rather than relying indefinitely on development email limits.

## VERCEL ENVIRONMENT VARIABLES

Keep/add:

- `NEXT_PUBLIC_SITE_URL=https://www.syntralabs.co.uk`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy anon key)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

Do not commit `.env.local`.

## MEMBER PRICING LOGIC

Guest checkout: catalogue price.

Signed-in customer with 0 paid orders: 20% automatic first-order adjustment.

Signed-in customer with 1+ paid orders: 10% automatic returning-customer adjustment.

The checkout API verifies the Supabase access token and reads the protected `customer_rewards` record using the server-side service role. Prices and stock are still re-read from the server-side catalogue before Stripe Checkout is created.

After successful payment, the verified Stripe webhook saves the order and atomically increments the customer's paid-order count. This changes a first-order customer from the 20% tier to the 10% returning-customer tier.

## SHIPPING LOGIC

Standard UK shipping is configured as £0 in Stripe Checkout.

The site and checkout use Europe/London time:

- Monday–Friday before 12:00 → scheduled for same-day dispatch
- after 12:00 or weekends → scheduled for next working-day dispatch

The wording deliberately says **dispatch**, not delivery. Only publish this promise if it matches actual fulfilment operations.

## LOCAL START

Copy your existing `.env.local` into this V9 folder and add the public Supabase key.

Then either double-click:

`START-SYNTRA.bat`

or run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## PRODUCTION CHECK

Run:

```powershell
npm install
npm run typecheck
npm run build
```

or double-click `BUILD-PRODUCTION.bat`.

## IMPORTANT

The legal/privacy pages are implementation-aware starter copy, not a substitute for UK legal review. Research-only catalogue claims, shipping promises, customer pricing and marketing consent should match the business's real operations.
