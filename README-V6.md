# Syntra Labs Professional V6

V6 adds a higher-density premium catalogue experience while preserving the existing Syntra Labs dark navy / electric-blue identity.

## What changed

- Home / Shop / Offers / Research / Standards / About / Contact navigation.
- Animated research catalogue ticker.
- Returning-visitor catalogue update card from the second visit onward.
- Dedicated Current Offers page.
- Product cards with live stock count, low-stock states, current offer price, prior catalogue price, savings amount and percentage.
- Product imagery is deliberately smaller so cards feel more like a professional laboratory catalogue and less like oversized image tiles.
- Shop quick filters: All, Offers, In stock, Limited.
- Offer-first sorting.
- Product detail pages now show offer savings and live batch availability.
- Existing Supabase live pricing/stock and Stripe server-side checkout flow remain intact.
- 18+ / research-capacity gate remains enabled and remembers acceptance for 30 days.
- Mobile stays dense with two catalogue cards per row and the existing sticky cart drawer.

## Offer pricing

The V6 `compareAtPrice` values are based on earlier Syntra Labs catalogue prices already used in the project before the current price reductions. They are not generated competitor prices.

If Supabase later contains `compare_at_price`, `badge` or `highlights` fields, those values are automatically preferred. Otherwise the V6 catalogue metadata in `lib/products.ts` is used.

## Start on Windows

Double-click `START-SYNTRA.bat`, or run:

```powershell
npm install
npm run dev
```

Open http://localhost:3000

## Before production

Keep secrets in `.env.local` / Vercel only. Never commit Stripe, Supabase service-role, Resend or webhook secrets.
