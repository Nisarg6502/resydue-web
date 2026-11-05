# Resydue — website

Marketing site for **Resydue**, plastic-free food packaging with a bio-based coating.
Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, Motion, Lenis. Every route is prerendered as static HTML.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Where things live

| What | Where |
| --- | --- |
| **All copy, specs, contact details** | `src/content/site.ts` |
| Brand tokens (palette, type scale, easing) | `src/app/globals.css` (`@theme`) |
| Official logo vectors (auto-extracted, do not edit) | `src/components/brand/logo-paths.ts` |
| Pages | `src/app/*/page.tsx` |
| Signature interactions | `src/components/home/LiningSpecimen.tsx`, `StressTest.tsx`, `src/components/layout/PatternField.tsx`, `src/components/coating/ExplodedLayers.tsx` |
| Lead capture (samples form, newsletter) | `src/app/actions.ts` |
| SEO: sitemap, robots, manifest, OG image, icons | `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.jpg`, `icon.svg`, `apple-icon.png` |

## Placeholders: filling in real figures

Anything written in `[square brackets]` in `src/content/site.ts` renders as a dashed
**"to be confirmed"** token on the site. It is never shown as a real claim. Replace the bracket with the
confirmed value (e.g. `"Holds [X]°C food for [X] hours"` → `"Holds 90°C food for 2 hours"`) and the
token disappears automatically. FAQ answers that still contain placeholders are kept out of
structured data, so search engines only ever see confirmed answers.

House rule from the content brief: never show a figure or a certificate logo we do not hold.

Standard page documents: set `href` on each item in `standardPage.documents` to the PDF path
(put the files in `public/docs/`). Until then they show "Publishing soon".

## Receiving form submissions

Copy `.env.example` to `.env.local` (or set it in your host's dashboard) and set `LEAD_WEBHOOK_URL`.
Every sample request and newsletter signup is POSTed there as JSON (works with Google Apps Script →
Sheets, Zapier, Make, Formspree, or any CRM inbound webhook). Without it, submissions are only
logged on the server.

## Brand guardrails baked in

- Raleway only (400 / 600 / 700), via `next/font` (self-hosted, no layout shift).
- Six palette colours only: Pale Linen, Deep Black, Soft Sand, Olive Shadow, Warm Gold, Deep Terra.
  Tints are opacity steps of these, never new hues.
- Logos are rendered from the supplied vectors with locked proportions. Never stretched, outlined,
  shadowed or gradient-filled, and nothing is placed behind them.
- Every animation respects `prefers-reduced-motion`.

## Deploy

Built for Vercel (zero config): import the repo, set `LEAD_WEBHOOK_URL`, deploy. Point
`resydue.com` at it. The canonical URL is set in `src/content/site.ts` (`site.url`).
