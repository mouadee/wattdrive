# Wattdrive — RAEDIAN NORA & NEO

Bilingual (FR default / EN) Next.js site for EV charger supply and installation in Morocco.

```bash
npm install
npm run dev     # http://localhost:3000 → redirects to /fr
npm run build && npm start
```

## Where to edit things

| What | File |
| --- | --- |
| Phone, WhatsApp number, email, city, domain | `src/config/site.ts` (placeholders marked `TODO`) |
| Product names, **charger prices**, images, specs, datasheet link | `src/config/products.ts` |
| **Installation price list** (protection, cable per metre, installation package, VAT label) used by the quote page and PDF | `src/config/pricing.ts` — ⚠️ values copied from the reference quote page, confirm them |
| Installation gallery ("Nos réalisations") | `src/config/projects.ts` + photos in `public/images/projects/` |
| Editorial photography (hero, solutions) | `src/config/media.ts` |
| All text, FR and EN (incl. SEO titles, form errors) | `src/i18n/dictionaries/fr.ts`, `en.ts` |
| Localized URLs (`/fr/bornes` ↔ `/en/chargers`) | `src/i18n/config.ts` |

Product specs set to `null` are hidden. Fill them only from the official RAEDIAN datasheet.

The homepage "Réalisations" block stays hidden until at least one project in `projects.ts` has a photo.
The `/realisations` page shows labelled placeholder slots until then.

## Quote page & PDF

`/fr/devis` (`/en/quote`) is a 2-step configurator: charger + installation items + housing + city + cable length →
contact details. Submitting sends the lead and reveals the estimated total, and the visitor can download a PDF quote
(invoice layout: company block, client + city, quote date / validity (30 days, `VALIDITY_DAYS` in `src/lib/quotePdf.ts`),
itemised table, Total TTC, contact footer — no bank details). Generated in the browser with jsPDF.
The server recomputes the estimate from `pricing.ts`, so the lead you receive carries the same figures as the PDF.

## Design system

Light theme generated with the ui-ux-pro-max skill: see `design-system/wattdrive/MASTER.md` (palette, type, motion) and
the tokens at the top of `src/app/globals.css`.

## Lead handling (integration point)

Both forms POST to `src/app/api/leads/route.ts`, which validates server-side and forwards JSON to a webhook:

```
LEAD_WEBHOOK_URL=https://hook.make.com/…   # Make, Zapier, n8n, CRM endpoint…
LEAD_WEBHOOK_SECRET=optional-bearer-token
NEXT_PUBLIC_SITE_URL=https://www.your-domain.ma
```

- Without `LEAD_WEBHOOK_URL`: in development, leads are only printed to the server console. In production the API
  returns 503 and visitors are offered WhatsApp instead. Nothing is reported as received when it was not delivered.
- UTM parameters and `fbclid` from Facebook Ads are attached to each lead.
- If the Meta Pixel is installed, a `Lead` event fires after a successful submission (`src/lib/submit.ts`).
