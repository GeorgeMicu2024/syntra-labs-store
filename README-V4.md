# Syntra Labs V4 — Research Catalogue

V4 is a full storefront redesign focused on premium UX, mobile usability and evidence-aware research copy.

## Main changes

- Explicit Home navigation plus Research Library.
- Global cart drawer works from Home, Shop, Research and product pages.
- Mobile sticky cart and bottom-sheet cart UI.
- Live catalogue refresh for persisted carts via `/api/catalogue`.
- Product pages now retrieve live Supabase catalogue data instead of static pricing.
- Server-side Stripe checkout remains the source of truth for price and stock.
- Research Library with compound-level mechanism notes, evidence-stage labels and selected PubMed records.
- Scientific copy avoids dosing, administration and therapeutic instructions.
- Public navigation contains no Admin link. `/admin` remains available directly.
- Removed temporary Stripe webhook signature debug logging.
- Resend production fallback senders use the verified syntralabs.co.uk domain.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production environment variables

Copy `.env.example` and configure secrets in Vercel. Never commit `.env.local`.

## Research-content principle

Scientific literature on the site describes compounds and biological pathways. It does **not** verify catalogue-item identity, purity, sterility, concentration, safety or suitability, and it is not medical or veterinary advice.
