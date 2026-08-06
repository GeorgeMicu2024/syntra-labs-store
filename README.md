# Syntra Labs Professional Store

A production-oriented Next.js storefront with premium responsive UI, product catalogue, cart, Stripe Checkout, contact email delivery, SEO routes, admin authentication and Supabase-backed stock management.

## 1. Run locally

```powershell
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## 2. Environment configuration

Edit `.env.local`:

- `STRIPE_SECRET_KEY`: Stripe test secret key.
- `STRIPE_WEBHOOK_SECRET`: Stripe CLI or production webhook signing secret.
- `RESEND_API_KEY`: sends contact form email.
- `CONTACT_TO_EMAIL`: inbox that receives enquiries.
- `ADMIN_PASSWORD`: private admin password.
- `SESSION_SECRET`: long random session signing secret.
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: live inventory database.

Never commit `.env.local` or expose secret/service-role keys in browser code.

## 3. Contact email

The contact page posts to `/api/contact`. Without `RESEND_API_KEY`, the form validates and logs the message locally. With Resend configured, it emails `CONTACT_TO_EMAIL` and sets the visitor's email as the reply-to address.

## 4. Admin

Visit `/admin/login`. Authentication uses an HTTP-only signed cookie. The dashboard reads static catalogue data until Supabase is configured. Product edits require Supabase.

Run `supabase/schema.sql` in Supabase SQL Editor, then import the catalogue records or add them through SQL.

## 5. Stripe

Checkout is created server-side at `/api/checkout`. Start with Stripe test mode. Configure the webhook endpoint as:

`https://your-domain/api/webhooks/stripe`

The commercial eligibility of every catalogue item must be confirmed with the payment processor before enabling live payments.

## 6. Deploy to Vercel

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Add all production environment variables.
4. Deploy and test on the Vercel URL.
5. Add `syntralabs.co.uk` under Project → Settings → Domains.
6. Update DNS only after the new deployment is fully tested.

## Quality checks

```powershell
npm run typecheck
npm run build
```


## Product images
The 20 catalogue images are stored in `public/products/` as PNG files and mapped in `lib/products.ts`. Replace an image using the same filename to update it without changing code.
