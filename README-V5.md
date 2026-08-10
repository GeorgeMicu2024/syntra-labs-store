# Syntra Labs — Professional V5

## What changed

V5 keeps the existing Syntra Labs dark navy / electric blue identity and upgrades the storefront interaction layer.

- 18+ professional research access gate on first visit
- Access confirmation persists for 30 days in localStorage
- Animated research ticker above the navigation
- Explicit Home navigation item
- Refined sticky glass header
- More compact hero photography with parallax, scan-line and ambient motion
- Live catalogue metrics on the hero
- Smaller product photography on Home and Shop
- More compact product cards and hover motion
- Existing Supabase, Stripe, cart, admin and research library architecture retained
- Reduced-motion support included

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test the access gate again

The age/research gate is stored for 30 days. To display it again during development, open DevTools → Application → Local Storage and remove:

`Syntra research access key: syntra_research_access_v1`

Or run in the browser console:

```js
localStorage.removeItem("syntra_research_access_v1");
location.reload();
```

## Production

Do not commit `.env.local`. Keep Stripe, Supabase and Resend credentials in Vercel Environment Variables.
